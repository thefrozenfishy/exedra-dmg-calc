// Builds src/engine/dist/engine.js: every src/engine module concatenated into ONE ES module, classes ordered so a base
// class is always defined before its subclasses.
//
//     node scripts/engine/bundle.mjs
//
// Why: the port keeps the game's one-file-per-class layout, so the import graph is one big cycle (bases reference
// subclasses inside methods/factories, subclasses `extends` their base). ES modules evaluate a cycle in import order
// and a subclass can run before its base class exists ("Cannot access 'X' before initialization"). Scope-hoisting the
// modules into one file (like a bundler does) and ordering the class declarations by `extends` removes the problem
// without changing the source layout. Top-level names that collide between modules (or with JS globals) are renamed
// in the bundle (`Name$Dir_Sub`); `export const ENGINE_NAMES` maps "relative/path.ts#Name" -> bundle name.
// Type information is not emitted: callers import types from the source files with `import type`.
import ts from "typescript";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ENG = path.join(ROOT, "src/engine");
const OUT_DIR = path.join(ENG, "dist");
const OUT = path.join(OUT_DIR, "engine.js");

const files = [];
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { if (p !== OUT_DIR) walk(p); }
        else if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) files.push(p);
    }
})(ENG);
files.sort();

const options = { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true, useDefineForClassFields: true, skipLibCheck: true, noEmit: true, resolveJsonModule: true, lib: ["lib.esnext.d.ts"], types: [] };
const program = ts.createProgram(files, options);
const checker = program.getTypeChecker();
const inEngine = sf => sf.fileName.startsWith(ENG + "/") && !sf.fileName.startsWith(OUT_DIR);
const rel = f => path.relative(ENG, f).replace(/\\/g, "/");

// ---- top-level value declarations and their bundle names
const decls = new Map(); // ts.Symbol -> { file, name, unique }
const byName = new Map();
const valueDeclsOf = st => {
    if (ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isEnumDeclaration(st)) return st.name ? [st.name] : [];
    if (ts.isVariableStatement(st)) return st.declarationList.declarations.filter(d => ts.isIdentifier(d.name)).map(d => d.name);
    return [];
};
const sources = program.getSourceFiles().filter(inEngine);
for (const sf of sources) {
    for (const st of sf.statements) for (const id of valueDeclsOf(st)) {
        const sym = checker.getSymbolAtLocation(id);
        if (!sym) continue;
        const e = { file: sf.fileName, name: id.text, unique: id.text };
        decls.set(sym, e);
        if (!byName.has(id.text)) byName.set(id.text, []);
        byName.get(id.text).push(e);
    }
}
const GLOBALS = new Set(Object.getOwnPropertyNames(globalThis));
for (const [name, list] of byName) {
    const clash = list.length > 1 || GLOBALS.has(name);
    if (!clash) continue;
    // ReDriveBattleCore keeps the plain name when it is the only one there (and the name is not a JS global)
    const core = list.filter(e => rel(e.file).startsWith("ReDriveBattleCore/"));
    for (const e of list) {
        if (!GLOBALS.has(name) && core.length === 1 && e === core[0]) continue;
        e.unique = `${name}$${path.dirname(rel(e.file)).replace(/[^A-Za-z0-9]+/g, "_")}`;
    }
}
const resolve = sym => {
    if (!sym) return undefined;
    if (sym.flags & ts.SymbolFlags.Alias) { try { sym = checker.getAliasedSymbol(sym); } catch { return undefined; } }
    return decls.get(sym);
};

// ---- external (non-engine) imports, kept as real imports
const externals = new Map(); // "abs#name" -> local name
const externalImports = [];
const extName = (absPath, imported) => {
    const key = absPath + "#" + imported;
    if (!externals.has(key)) {
        const local = `$ext${externals.size}_${imported.replace(/\W/g, "_")}`;
        externals.set(key, local);
        let spec = path.relative(OUT_DIR, absPath).replace(/\\/g, "/");
        if (!spec.startsWith(".")) spec = "./" + spec;
        externalImports.push(imported === "default"
            ? `import ${local} from "${spec}"${absPath.endsWith(".json") ? ' with { type: "json" }' : ""};`
            : `import { ${imported} as ${local} } from "${spec}";`);
    }
    return externals.get(key);
};

// ---- per file: edits, then split statements
const pre = [], classes = [], post = [];
const classInfo = new Map(); // decl entry -> { text, base, order }
let order = 0;
for (const sf of sources) {
    const text = sf.text;
    const localExt = new Map(); // local import name -> external local
    for (const st of sf.statements) {
        if (!ts.isImportDeclaration(st) || st.importClause?.isTypeOnly) continue;
        const spec = st.moduleSpecifier.text;
        let abs = path.resolve(path.dirname(sf.fileName), spec);
        const cand = [abs, abs + ".ts", abs + ".js"].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
        if (cand && (cand.startsWith(ENG + "/"))) continue; // engine module: hoisted
        abs = cand ?? abs;
        const ic = st.importClause;
        if (ic?.name) localExt.set(ic.name.text, extName(abs, "default"));
        if (ic?.namedBindings && ts.isNamedImports(ic.namedBindings)) for (const el of ic.namedBindings.elements) {
            if (el.isTypeOnly) continue;
            localExt.set(el.name.text, extName(abs, (el.propertyName ?? el.name).text));
        }
    }
    const edits = [];
    const visit = node => {
        if (ts.isImportDeclaration(node)) return;
        if (ts.isIdentifier(node)) {
            const parent = node.parent;
            if (parent && ts.isShorthandPropertyAssignment(parent) && parent.name === node) {
                const vs = checker.getShorthandAssignmentValueSymbol(parent);
                const e = resolve(vs);
                const ext = localExt.get(node.text);
                if (e && e.unique !== node.text) edits.push([node.getStart(sf), node.end, `${node.text}: ${e.unique}`]);
                else if (!e && ext && vs && (vs.flags & ts.SymbolFlags.Alias)) edits.push([node.getStart(sf), node.end, `${node.text}: ${ext}`]);
                return;
            }
            const sym = checker.getSymbolAtLocation(node);
            const e = resolve(sym);
            if (e) { if (e.unique !== node.text) edits.push([node.getStart(sf), node.end, e.unique]); return; }
            if (sym && (sym.flags & ts.SymbolFlags.Alias) && localExt.has(node.text)) {
                const decl = sym.declarations?.[0];
                if (decl && decl.getSourceFile() === sf) { edits.push([node.getStart(sf), node.end, localExt.get(node.text)]); return; }
            }
            // a value re-exported by an engine module from a non-engine module (runtime.ts `export { f32 }`)
            if (sym && (sym.flags & ts.SymbolFlags.Alias)) {
                let target; try { target = checker.getAliasedSymbol(sym); } catch { target = undefined; }
                const tdecl = target?.declarations?.[0];
                const tfile = tdecl?.getSourceFile().fileName;
                if (tfile && !inEngine(tdecl.getSourceFile()) && (target.flags & ts.SymbolFlags.Value) && !tfile.endsWith(".json"))
                    edits.push([node.getStart(sf), node.end, extName(tfile, target.name)]);
            }
            return;
        }
        ts.forEachChild(node, visit);
    };
    const apply = (start, end) => {
        const es = edits.filter(([s, e]) => s >= start && e <= end).sort((a, b) => b[0] - a[0]);
        let t = text.slice(start, end);
        for (const [s, e, r] of es) t = t.slice(0, s - start) + r + t.slice(e - start);
        return t;
    };
    for (const st of sf.statements) {
        if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) continue;
        if (ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) continue; // types are not emitted
        visit(st);
        // drop the `export` keyword
        const mods = ts.canHaveModifiers(st) ? ts.getModifiers(st) ?? [] : [];
        for (const m of mods) if (m.kind === ts.SyntaxKind.ExportKeyword) edits.push([m.getStart(sf), m.end, ""]);
        const start = st.getFullStart(), end = st.end;
        const code = `// ${rel(sf.fileName)}\n` + apply(start, end).replace(/^\s*\n/, "") + "\n";
        if (ts.isClassDeclaration(st) && st.name) {
            const e = decls.get(checker.getSymbolAtLocation(st.name));
            const heritage = st.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword);
            const baseExpr = heritage?.types[0]?.expression;
            const base = baseExpr ? resolve(checker.getSymbolAtLocation(baseExpr)) : undefined;
            classInfo.set(e, { code, base, order: order++ });
        } else if (ts.isExpressionStatement(st)) {
            post.push(code);
        } else {
            pre.push(code);
        }
    }
}
// topological order by extends (stable)
const done = new Set(), out = [];
const emit = e => {
    if (done.has(e)) return;
    done.add(e);
    const info = classInfo.get(e);
    if (info.base && classInfo.has(info.base)) emit(info.base);
    out.push(info.code);
};
[...classInfo.entries()].sort((a, b) => a[1].order - b[1].order).forEach(([e]) => emit(e));

const names = {};
for (const e of decls.values()) names[`${rel(e.file)}#${e.name}`] = e.unique;
const exported = [...new Set([...decls.values()].map(e => e.unique))].sort();
const tsCode = [
    "// GENERATED by scripts/engine/bundle.mjs from src/engine (do not edit). One scope-hoisted module, see the script.",
    ...externalImports, "", ...pre, ...out, ...post,
    `export const ENGINE_NAMES = ${JSON.stringify(names)};`,
    `export { ${exported.join(", ")} };`, "",
].join("\n");
const js = ts.transpileModule(tsCode, { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
    useDefineForClassFields: true, verbatimModuleSyntax: false, isolatedModules: false }, fileName: "engine.ts" }).outputText;
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, js);
const renamed = [...decls.values()].filter(e => e.unique !== e.name).length;
console.log(`engine bundle: ${sources.length} modules, ${classInfo.size} classes, ${renamed} renamed names -> ${path.relative(ROOT, OUT)} (${(js.length / 1e6).toFixed(1)} MB)`);
