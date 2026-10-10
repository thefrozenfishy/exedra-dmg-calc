"""Apply hand-ported method bodies to the generated shells in src/engine.

    python3 scripts/engine/port_apply.py <fragment file> [...]

Fragment format (TypeScript, any number of blocks):

    //@@ file ReDriveBattleCore/Act/ActReferee.ts            <- path under src/engine
    //@@ import { ActBase_Define } from "./ActBase";          <- added to the import block if missing
    //@@ member ActReferee.Clear                              <- Class.tsMemberName (as generated)
    Clear(): void {
        ...
    }
    //@@ member ActReferee.ShiftNextAct
    ...
    //@@ append                                               <- free code appended at the end of the file
    ...

`member` replaces the member that follows the matching `/** @rva ... */` header inside that class
(the header line itself is kept, so the RVA tag stays). The member may currently be a one-line stub or an
earlier multi-line port. Value imports replace `import type` of the same name automatically.
"""
import os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENG = os.path.join(ROOT, 'src', 'engine')
HDR = re.compile(r'^\s*/\*\* @rva ')
CLS = re.compile(r'^export (?:abstract )?class (\w[\w$]*)')


def member_span(lines, cls_short, member):
    """Return (start, end) line indices (inclusive) of the member after its @rva header."""
    cur = None
    for i, l in enumerate(lines):
        m = CLS.match(l)
        if m: cur = m.group(1); continue
        if cur != cls_short or not HDR.match(l): continue
        j = i + 1
        decl = lines[j].strip()
        nm = re.match(r'(?:static\s+|abstract\s+)?(?:get\s+|set\s+)?([\w$]+)', decl)
        if not nm or nm.group(1) != member: continue
        depth = decl.count('{') - decl.count('}')
        k = j
        while depth > 0:
            k += 1; depth += lines[k].count('{') - lines[k].count('}')
        return j, k
    return None


def add_import(lines, imp):
    imp = imp.strip()
    tm = re.match(r'import type \{ (.+) \} from "(.+)";', imp)
    if tm:  # merge into an existing `import type` from the same module, skip names already imported
        names = [n.strip() for n in tm.group(1).split(',')]; src = tm.group(2)
        have = set()
        for l in lines:
            mm = re.match(r'import (?:type )?\{ (.+) \} from "(.+)";', l)
            if mm and mm.group(2) == src: have |= {n.strip() for n in mm.group(1).split(',')}
        names = [n for n in names if n not in have]
        if not names: return
        for idx, l in enumerate(lines):
            mm = re.match(r'import type \{ (.+) \} from "(.+)";', l)
            if mm and mm.group(2) == src:
                lines[idx] = f'import type {{ {", ".join(sorted(set([n.strip() for n in mm.group(1).split(",")] + names)))} }} from "{src}";'
                return
        lines.insert(first_import(lines), f'import type {{ {", ".join(names)} }} from "{src}";')
        return
    m = re.match(r'import \{ (.+) \} from "(.+)";', imp)
    if not m:
        if imp not in lines: lines.insert(first_import(lines), imp)
        return
    names = [n.strip() for n in m.group(1).split(',')]
    src = m.group(2)
    for idx, l in enumerate(lines):
        tm = re.match(r'import type \{ (.+) \} from "(.+)";', l)
        if tm and tm.group(2) == src:
            rest = [n.strip() for n in tm.group(1).split(',') if n.strip() not in names]
            lines[idx] = f'import type {{ {", ".join(rest)} }} from "{src}";' if rest else ''
    for idx, l in enumerate(lines):
        vm = re.match(r'import \{ (.+) \} from "(.+)";', l)
        if vm and vm.group(2) == src:
            have = [n.strip() for n in vm.group(1).split(',')]
            lines[idx] = f'import {{ {", ".join(sorted(set(have + names)))} }} from "{src}";'
            return
    lines.insert(first_import(lines), f'import {{ {", ".join(names)} }} from "{src}";')


def first_import(lines):
    for i, l in enumerate(lines):
        if l.startswith('import '): return i
    return 3


def apply(frag):
    blocks = re.split(r'^//@@ ', open(frag, encoding='utf-8').read(), flags=re.M)
    path = None; lines = None; n = 0
    def flush():
        if path and lines is not None:
            txt = '\n'.join(l for l in lines)
            txt = re.sub(r'\n\n\n+', '\n\n', txt)
            open(path, 'w', encoding='utf-8', newline='\n').write(txt)
    for b in blocks:
        if not b.strip(): continue
        head, _, body = b.partition('\n')
        kind, _, arg = head.strip().partition(' ')
        if kind == 'file':
            flush()
            path = os.path.join(ENG, arg.strip()); lines = open(path, encoding='utf-8').read().split('\n')
        elif kind == 'import':
            add_import(lines, 'import ' + arg if not arg.startswith('import') else arg)
            if body.strip():
                for extra in body.strip().split('\n'): add_import(lines, extra)
        elif kind == 'member':
            cls, _, mem = arg.strip().rpartition('.')
            sp = member_span(lines, cls, mem)
            if not sp: sys.exit(f'{frag}: member {arg} not found in {path}')
            new = ['    ' + l if l.strip() else '' for l in body.rstrip('\n').split('\n')]
            # strip a common indentation the fragment may carry
            ind = min((len(l) - len(l.lstrip()) for l in new if l.strip()), default=4)
            new = [('    ' + l[ind:]) if l.strip() else '' for l in new]
            lines[sp[0]:sp[1] + 1] = new
            n += 1
        elif kind == 'append':
            lines += body.rstrip('\n').split('\n')
        else:
            sys.exit(f'unknown directive {kind}')
    flush()
    print(f'{frag}: {n} members ported')


for f in sys.argv[1:]:
    apply(f)
