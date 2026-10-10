"""Generate the 1:1 TypeScript shells of ReDriveBattleCore under src/engine from dump.cs.

    python3 scripts/engine/dump_parse.py <dump.cs> <types.json>
    python3 scripts/engine/gen_shells.py <types.json> [--force] [--only <Ns.Type> ...]

One file per top-level C# type at src/engine/<namespace path>/<Type>.ts (nested types live in the outer
type's file as Outer_Inner). Every method becomes a TS method carrying its RVA; bodies are
`return notPorted("Class.Method", 0xRVA)` until ported by hand (auto-property accessors are filled in:
they only read/write the compiler's backing field). Existing files are never overwritten without
--force, so ported code is safe: `ledger.py` reports members a new dump added/removed/moved.
Naming rules (also in src/engine/README.md):
  .ctor -> ctor(...) returning this (call as `new X().ctor(...)`), .cctor -> static cctor()
  overloads -> Name$ParamType1_ParamType2 ; nested type A.B -> A_B ; <X>k__BackingField -> _X
  property X -> get X()/set X(v) forwarding to get_X()/set_X(v) (those carry the RVA; virtual dispatch intact)
  enum -> const object + union type (erasableSyntaxOnly) ; interface -> TS interface + static __interfaces marker
"""
import json, os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.environ.get('ENGINE_OUT') or os.path.join(ROOT, 'src', 'engine')
args = sys.argv[1:]
FORCE = '--force' in args
ONLY = set(args[args.index('--only') + 1:]) if '--only' in args else None
T = json.load(open(args[0]))

TS_RESERVED = {'arguments', 'eval', 'function', 'var', 'let', 'yield', 'package', 'implements', 'interface', 'private',
               'protected', 'public', 'static', 'enum', 'await', 'delete', 'export', 'import', 'typeof', 'with',
               'debugger', 'in', 'instanceof', 'new', 'super', 'this', 'void', 'default', 'constructor', 'type'}
PRIM = {'int': 'int', 'uint': 'uint', 'long': 'long', 'ulong': 'ulong', 'short': 'short', 'ushort': 'ushort',
        'byte': 'byte', 'sbyte': 'sbyte', 'float': 'float', 'double': 'double', 'char': 'char', 'Decimal': 'Decimal',
        'bool': 'boolean', 'string': 'string', 'object': 'any', 'void': 'void', 'Type': 'Type', 'Guid': 'Guid',
        'IntPtr': 'number'}
COLL = {'List': 'List', 'IList': 'IList', 'ICollection': 'ICollection', 'IEnumerable': 'IEnumerable',
        'IReadOnlyList': 'IReadOnlyList', 'IReadOnlyCollection': 'IReadOnlyCollection', 'Dictionary': 'Dictionary',
        'IDictionary': 'IDictionary', 'IReadOnlyDictionary': 'IReadOnlyDictionary', 'HashSet': 'HashSet',
        'KeyValuePair': 'KeyValuePair', 'Nullable': 'Nullable', 'Queue': 'Queue', 'Stack': 'Stack'}
NUMERIC = {'int', 'uint', 'long', 'ulong', 'short', 'ushort', 'byte', 'sbyte', 'float', 'double'}


def base_name(n):
    return n.split('<')[0]


CLASH = set()


def ts_type_name(n):  # 'ActBase.Define' -> 'ActBase_Define', 'Foo<T>' -> 'Foo' (or Foo$1 if a non-generic Foo exists)
    b = re.sub(r'<.*', '', n)
    if '<' in n and b in CLASH:
        b += '$' + str(n.split('<', 1)[1].count(',') + 1)
    return b.replace('.', '_')


types = [t for t in T if not any(seg.startswith('<') for seg in t['name'].split('.'))]
by_simple = {}
for t in types:
    by_simple.setdefault(base_name(t['name']), []).append(t)
for k, v in by_simple.items():
    if len({('<' in x['name']) for x in v}) == 2: CLASH.add(k)


def outer_of(t):
    return t['name'].split('.')[0]


def file_of(t):
    return os.path.join(OUT, *t['ns'].split('.'), base_name(outer_of(t)) + '.ts')


def lookup(name, ctx):
    """Resolve a C# type name (maybe dotted nested, maybe unqualified nested) to a type entry."""
    generic = '<' in name
    name = base_name(name)
    if name in CLASH:
        return next(x for x in by_simple[name] if ('<' in x['name']) == generic)
    cands = by_simple.get(name)
    if not cands and ctx is not None:  # unqualified nested name used inside its outer type
        outer = base_name(ctx['name']).split('.')[0]
        cands = by_simple.get(outer + '.' + name)
        if not cands:  # nested type of a base class
            for b in ctx.get('bases', []):
                cands = by_simple.get(base_name(b).split('.')[-1] + '.' + name)
                if cands: break
    if not cands:
        return None
    if len(cands) == 1:
        return cands[0]
    same = [c for c in cands if ctx and c['ns'] == ctx['ns']]
    return (same or cands)[0]


def split_generic(s):
    d = 0; out = []; cur = ''
    for ch in s:
        if ch == '<': d += 1
        if ch == '>': d -= 1
        if ch == ',' and d == 0:
            out.append(cur.strip()); cur = ''
        else:
            cur += ch
    out.append(cur.strip())
    return out


class Ctx:
    def __init__(self, t, generics):
        self.t = t; self.generics = set(generics); self.class_generics = set(generics)
        self.refs = set(); self.rt = set(); self.static = False


REFS = {}
BASES = {}


def map_type(cs, c):
    cs = cs.strip()
    if cs.endswith('?'):
        return map_type(cs[:-1], c) + ' | null'
    m = re.match(r'^(.*)\[[ ,]*\]$', cs)
    if m:
        return wrap(map_type(m.group(1), c)) + '[]'
    m = re.match(r'^([\w.]+)<(.*)>$', cs)
    if m:
        head, inner = m.group(1), split_generic(m.group(2))
        hs = head.split('.')[-1]
        if hs == 'Func':
            a = [map_type(x, c) for x in inner]
            return '((' + ', '.join(f'a{i}: {x}' for i, x in enumerate(a[:-1])) + f') => {a[-1]})'
        if hs == 'Action':
            a = [map_type(x, c) for x in inner]
            return '((' + ', '.join(f'a{i}: {x}' for i, x in enumerate(a)) + ') => void)'
        if hs == 'Predicate':
            return f'((a0: {map_type(inner[0], c)}) => boolean)'
        if hs in COLL:
            c.rt.add(COLL[hs])
            return f'{COLL[hs]}<' + ', '.join(map_type(x, c) for x in inner) + '>'
        tt = lookup(head, c.t)
        if tt:
            c.refs.add(id(tt)); REFS[id(tt)] = tt
            return ts_type_name(tt['name']) + '<' + ', '.join(map_type(x, c) for x in inner) + '>'
        return f'any /* {cs} */'
    if cs in c.generics:
        return 'any' if (getattr(c, 'static', False) and cs in c.class_generics) else cs
    if cs in PRIM:
        p = PRIM[cs]
        if p not in ('boolean', 'string', 'any', 'void', 'number'): c.rt.add(p)
        return p
    if cs == 'Action':
        return '(() => void)'
    tt = lookup(cs, c.t)
    if tt:
        c.refs.add(id(tt)); REFS[id(tt)] = tt
        return ts_type_name(tt['name'])
    return f'any /* {cs} */'


def wrap(s):
    return f'({s})' if (' ' in s and not s.startswith('any /*')) else s


def strip_generics(n):
    while True:
        m = re.sub(r'<[^<>]*>', '', n)
        if m == n: return n
        n = m


def member(n):
    """Explicit interface implementation `Ns.IFoo<T>.get_Bar` -> `get_IFoo$Bar`, `Ns.IFoo.Baz` -> `IFoo$Baz`."""
    if '.' not in n or n.startswith('.'): return n
    parts = strip_generics(n).split('.')
    iface, last = parts[-2], parts[-1]
    if last.startswith(('get_', 'set_')): return f'{last[:4]}{iface}${last[4:]}'
    return f'{iface}${last}'


def ident(n):
    n = n.lstrip('@')
    if n.startswith('<'):  # compiler-generated lambda / local function: <Outer>b__1_2 -> $Outer$b__1_2
        return re.sub(r'[^\w$]', '_', n.replace('<', '$').replace('>', '$'))
    n = member(n)
    return n + '_' if n in TS_RESERVED else n


def default_for(cs, tsT, c):
    cs = cs.strip()
    if cs.endswith('?') or cs.endswith(']'): return 'null!'
    if cs in NUMERIC: return '0'
    if cs == 'bool': return 'false'
    if cs == 'Decimal':
        c.rt.add('Decimal@value'); return 'Decimal.Zero'
    tt = lookup(cs, c.t)
    if tt and tt['kind'] == 'enum': return f'0 as {tsT}'
    return 'null!'


def ancestors(t):
    out = []; cur = t
    while True:
        b = next((x for x in cur['bases'] if (lookup(x, cur) or {}).get('kind') in ('class', 'struct')), None)
        if not b: return out
        nt = lookup(b, cur)
        if not nt or nt in out: return out
        out.append(nt); cur = nt


def field_ts_name(f):
    m = re.match(r'^<(\w+)>k__BackingField$', f['name'])
    return ('_' + m.group(1)) if m else ident(f['name'])


def mname(mt):
    return {'.ctor': 'ctor', '.cctor': 'cctor'}.get(mt['name'], ident(mt['name']))



def ptypes(mt):
    return tuple(re.sub(r'\W', '', strip_generics(p['type']).split('.')[-1]) + ''.join(
        re.sub(r'\W', '', x) for x in re.findall(r'<(.*)>', p['type'])) for p in mt['params'])


EMIT = {}


def emitted_name(t, mt):
    """Stable TS name for a C# method: overrides reuse the ancestor's name; overloads (in the class or
    against an ancestor) and parameterised ctors get `$<param types>`."""
    key = (id(t), mt['name'], ptypes(mt))
    if key in EMIT: return EMIT[key]
    n = mname(mt); pt = ptypes(mt)
    suffixed = n + '$' + '_'.join(pt)
    res = None
    for a in ancestors(t):
        for am in a['methods']:
            if am['name'] == mt['name'] and ptypes(am) == pt and 'static' not in am['mods'] and 'static' not in mt['mods']:
                res = emitted_name(a, am); break
        if res: break
    if res is None:
        if mt['name'] == '.ctor':
            res = 'ctor' if not pt else 'ctor$' + '_'.join(pt)
        else:
            same = [m for m in t['methods'] if m['name'] == mt['name']]
            anc = [am for a in ancestors(t) for am in a['methods'] if am['name'] == mt['name'] and ptypes(am) != pt]
            if len(same) > 1 or anc:
                family = same + anc
                counts = [len(m['params']) for m in family]
                # short form Name$<param count> when the counts tell the overloads apart, else the full types
                res = f'{n}${len(pt)}' if len(set(counts)) == len(counts) else suffixed
            else:
                res = n
    EMIT[key] = res
    return res


def method_sig(mt, c, overloaded=False, t=None):
    gen = mt['generic'] or []
    c.generics |= set(gen)
    ps = []
    for g in gen:
        if not any(re.search(r'\b' + g + r'\b', p['type']) for p in mt['params'] if 'out' not in p['mod']):
            ps.append(f'{g}$: abstract new (...args: any[]) => {g}')   # C# typeof(T): pass the class
    for i, p in enumerate(mt['params']):
        tsT = map_type(p['type'], c)
        if 'out' in p['mod'] or 'ref' in p['mod']:
            c.rt.add('Ref'); tsT = f'Ref<{tsT}>'
        opt = '' if p['default'] is None else f' /* = {p["default"]} */'
        q = '?' if p['default'] is not None and all(q2['default'] is not None for q2 in mt['params'][i + 1:]) else ''
        ps.append(f'{ident(p["name"])}{q}: {tsT}{opt}')
    n = emitted_name(t, mt) if t is not None else mname(mt)
    if t is None and overloaded:
        n += '$' + '_'.join(ptypes(mt))
    ret = 'this' if mt['name'] == '.ctor' else map_type(mt['ret'], c)
    return n, ('<' + ', '.join(gen) + '>' if gen else ''), ', '.join(ps), ret


def gen_type(t, lines):
    gen = []
    m = re.match(r'^.*?<(.*)>$', t['name'])
    if m: gen = [x.strip() for x in m.group(1).split(',')]
    c = Ctx(t, gen)
    name = ts_type_name(t['name']); tparams = ('<' + ', '.join(gen) + '>') if gen else ''
    full = (t['ns'] + '.' if t['ns'] else '') + t['name']
    head = f'// ---- {full}  (TypeDefIndex {t["index"]}, {" ".join(t["mods"])} {t["kind"]}) ----'
    if t['kind'] == 'enum':
        lines += [head, f'export const {name} = {{']
        for f in t['fields']:
            if f['name'] == 'value__': continue
            lines.append(f'    {f["name"]}: {f["value"]},')
        lines += ['} as const;', f'export type {name} = (typeof {name})[keyof typeof {name}];', '']
        return c
    if t['kind'] == 'interface':
        ext = [map_type(b, c) for b in t['bases']]
        ext = [e for e in ext if not e.startswith('any')]
        lines += [head, f'export interface {name}{tparams}' + (' extends ' + ', '.join(ext) if ext else '') + ' {']
        for p in t['props']:
            if p['name'] == 'this': continue
            ro = '' if 'set;' in p['acc'] else 'readonly '
            lines.append(f'    {ro}{ident(p["name"])}: {map_type(p["type"], c)};')
        names = {}
        for mt in t['methods']: names.setdefault(mname(mt), []).append(mt)
        for mt in t['methods']:
            if re.match(r'^(get|set)_', mt['name']) and mt['name'][4:] in {p['name'] for p in t['props']}:
                continue  # interface property accessors are covered by the property member
            n, tp, ps, ret = method_sig(mt, c, overloaded=len(names[mname(mt)]) > 1)
            lines.append(f'    /** @rva {mt["rva"]}{" slot " + str(mt["slot"]) if mt["slot"] is not None else ""}  {mt["sig"]} */')
            lines.append(f'    {n}{tp}({ps}): {ret};')
        lines += ['}', '']
        return c
    base = None; ifaces = []
    for b in t['bases']:
        bt = lookup(b, t)
        if bt and bt['kind'] in ('class', 'struct') and base is None:
            base = (b, bt)
        elif bt and bt['kind'] == 'interface':
            ifaces.append(b)
        elif not bt and re.match(r'^I[A-Z]', b):
            ifaces.append(b)
        elif not bt and base is None:
            lines.append(f'// base type {b} is outside the ported set')
    abstract = 'abstract' in t['mods']
    ext = ''
    if base:
        ext = ' extends ' + map_type(base[0], c)
        BASES[id(base[1])] = base[1]
    impl_ts = [x for x in (map_type(i, c) for i in ifaces) if not x.startswith('any')]
    lines += [head, f'export {"abstract " if abstract else ""}class {name}{tparams}{ext} {{' +
              (f'  // implements {", ".join(ifaces)}' if ifaces else '')]
    if ifaces:
        lines.append('    static readonly __interfaces: readonly string[] = [' +
                     ', '.join(repr(base_name(i).split('.')[-1]) for i in ifaces) + '];')
    anc_fields = set()
    for a in ancestors(t):
        for f in a['fields']: anc_fields.add(field_ts_name(f))
    prop_names = {p['name'] for p in t['props']}
    fmap = {}
    for f in t['fields']:
        if f['name'] == 'value__': continue
        n = field_ts_name(f)
        if n in anc_fields: n = n + '$' + name
        if n in prop_names: n = '_' + n
        fmap[f['name']] = n
        c.static = 'static' in f['mods'] or 'const' in f['mods']
        tsT = map_type(f['type'], c)
        c.static = False
        st = 'static ' if ('static' in f['mods'] or 'const' in f['mods']) else ''
        ro = 'readonly ' if 'const' in f['mods'] else ''
        val = f['value'] if ('const' in f['mods'] and f['value'] is not None) else default_for(f['type'], tsT, c)
        off = f' {f["offset"]}' if f['offset'] else ''
        lines.append(f'    /**{off} {" ".join(f["mods"])} {f["type"]} {f["name"]} */')
        lines.append(f'    {st}{ro}{n}: {tsT} = {val};')
    for p in t['props']:
        if p['name'] == 'this' or 'override' in p['mods']: continue
        c.static = 'static' in p['mods']
        tsT = map_type(p['type'], c)
        c.static = False
        st = 'static ' if 'static' in p['mods'] else ''
        tgt = name if st else 'this'
        n = ident(p['name'])
        if 'get;' in p['acc']: lines.append(f'    {st}get {n}(): {tsT} {{ return {tgt}.get_{n}(); }}')
        if 'set;' in p['acc']: lines.append(f'    {st}set {n}(v: {tsT}) {{ {tgt}.set_{n}(v); }}')
    names = {}
    for mt in t['methods']: names.setdefault(mname(mt), []).append(mt)
    for mt in t['methods']:
        c.static = 'static' in mt['mods'] or mt['name'] == '.cctor'
        n, tp, ps, ret = method_sig(mt, c, t=t)
        c.static = False
        st = 'static ' if ('static' in mt['mods'] or mt['name'] == '.cctor') else ''
        rva = mt['rva'] if mt['rva'] not in (None, '-1') else None
        lines.append(f'    /** @rva {mt["rva"]}{" slot " + str(mt["slot"]) if mt["slot"] is not None else ""}  {mt["sig"]} */')
        if 'abstract' in mt['mods']:
            lines.append(f'    abstract {n}{tp}({ps}): {ret};'); continue
        body = None
        am = re.match(r'^(get|set)_(\w+)$', mt['name'])
        if am:
            bf = '<' + am.group(2) + '>k__BackingField'
            if bf in fmap:
                tgt = name if st else 'this'
                body = (f'return {tgt}.{fmap[bf]};' if am.group(1) == 'get'
                        else f'{tgt}.{fmap[bf]} = {ident(mt["params"][0]["name"])};') + ' /* auto-property */'
        if body is None:
            body = f'return notPorted("{name}.{mt["name"]}", {rva or 0});'
            c.rt.add('notPorted@value')
        lines.append(f'    {st}{n}{tp}({ps}): {ret} {{ {body} }}')
    lines += ['}', '']
    return c


files = {}
for t in types:
    files.setdefault(file_of(t), []).append(t)
written = skipped = 0
for path, ts in sorted(files.items()):
    ts.sort(key=lambda x: (x['name'].count('.'), x['index']))  # outer type first, then nested
    if ONLY and not any((x['ns'] + '.' + x['name']) in ONLY for x in ts): continue
    if os.path.exists(path) and not FORCE:
        skipped += 1; continue
    body = []; refs = set(); rt = set(); here = {id(x) for x in ts}
    REFS.clear(); BASES.clear()
    for x in ts:
        c = gen_type(x, body); refs |= c.refs; rt |= c.rt
    imports = []
    rel_rt = os.path.relpath(os.path.join(OUT, 'runtime'), os.path.dirname(path)).replace(os.sep, '/')
    if not rel_rt.startswith('.'): rel_rt = './' + rel_rt
    vals = sorted(x.split('@')[0] for x in rt if x.endswith('@value'))
    typs = sorted(x for x in rt if '@' not in x and x not in vals)
    if vals: imports.append(f'import {{ {", ".join(vals)} }} from "{rel_rt}";')
    if typs: imports.append(f'import type {{ {", ".join(typs)} }} from "{rel_rt}";')
    byfile = {}
    for rid in refs:
        if rid in here: continue
        r = REFS[rid]
        byfile.setdefault(file_of(r), set()).add((ts_type_name(r['name']), rid in BASES))
    for f, nm in sorted(byfile.items()):
        rel = os.path.relpath(f[:-3], os.path.dirname(path)).replace(os.sep, '/')
        if not rel.startswith('.'): rel = './' + rel
        v = sorted(n for n, isb in nm if isb); ty = sorted(n for n, isb in nm if not isb and n not in v)
        if v: imports.append(f'import {{ {", ".join(v)} }} from "{rel}";')
        if ty: imports.append(f'import type {{ {", ".join(ty)} }} from "{rel}";')
    hdr = ['// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;',
           '// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.',
           '']
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(hdr + imports + [''] + body))
    written += 1
print(f'{written} files written, {skipped} existing kept, {len(types)} types')
