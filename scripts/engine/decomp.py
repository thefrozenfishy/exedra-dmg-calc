#!/usr/bin/env python3
"""decomp - read the game's ReDriveBattleCore code for porting it 1:1 (src/engine).

    python3 scripts/engine/decomp.py fn '<regex>'        simplified decompile of matching functions + their real call targets
    python3 scripts/engine/decomp.py calls <rva>         every call/jmp target of one function (from the machine code)
    python3 scripts/engine/decomp.py slot <Class> <n>..  which virtual method a vtable slot is (class and its bases)
    python3 scripts/engine/decomp.py names <rva>         every method name IL2CPP folded onto one RVA

`fn` takes a regex on the `// ==== Ns.Class$$...$$Method ====` header (e.g. 'ActReferee..AddAct ====' or
'TurnReferee\\.<>c' for the lambdas) and prints the Ghidra C of decompiled/<ns>.c with the noise removed:
static-init and GC-barrier blocks, null-check throws, casts, `IS(x,T)` for isinst checks, `x->VSLOTn()` for
virtual calls (resolve with `slot`), `STATIC(Class+off)` for static fields, `/*@0xRVA =Alias*/` on calls whose
Ghidra name is another method folded onto the same code, `/*IFoo.Method*/` on interface calls.
`Field[0xNN]` means the byte offset NN (match it with the `/** 0xNN */` comments in src/engine).

Traps (each one bit a session):
  - Overloads share a sanitized name, so the decompile's `/*@0x..*/` can name the wrong overload. The `-- calls`
    list under each function comes from the machine code and is authoritative.
  - Ghidra drops float returns (shows `void`) and some returns entirely: check with scripts/ai/disasm.py <rva>.
  - `longlong *p` indexes in 8-byte words: `p[6]` is offset 0x30, but `p[0x14]` after the cast cleanup is the
    byte offset 0x14. When in doubt read the raw line with `xq fn`.
  - Compiler-generated lambdas (<Outer>b__N_M) are folded too: b__6_2 can live at an RVA named after another class.
Caches go to ~/.cache/exedra-engine (built from Il2CppDumper's script.json and dump.cs on first use).
"""
import bisect, json, os, pickle, re, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
VER = os.environ.get('XQ_GAME_VER') or open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ai', 'GAME_VER')).read().strip()  # the version the engine is ported from
UNP = os.environ.get('XQ_UNPACKED') or os.path.normpath(os.path.join(ROOT, '..', 'unpackedExedra'))
DUMPER = os.environ.get('XQ_DUMPER') or next((p for p in [os.path.normpath(os.path.join(ROOT, '..', 'unpackedExedra', VER, 'dump'))] if os.path.exists(os.path.join(p, 'script.json'))), os.path.normpath(os.path.join(ROOT, '..', 'Il2CppDumper')))
DEC = os.path.join(UNP, VER, 'decompiled')
CACHE = os.path.expanduser(os.environ.get('ENGINE_CACHE', '~/.cache/exedra-engine/' + VER))


def san(n):
    return re.sub(r'[^A-Za-z0-9_]', '_', n.replace('$$', '__'))


def caches():
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, 'names.pkl')
    if not os.path.exists(p):
        sys.stderr.write('building the RVA name cache from script.json (once, ~1 min)...\n')
        d = json.load(open(os.path.join(DUMPER, 'script.json'), encoding='utf-8'))
        idx = {}
        for m in d['ScriptMethod']:
            idx.setdefault(m['Address'], []).append(m['Name'])
        s2r = {}
        for r, ns in idx.items():
            for n in ns:
                s2r.setdefault(san(n), r)
        pickle.dump((idx, s2r), open(p, 'wb'))
    t = os.path.join(CACHE, 'types.json')
    if not os.path.exists(t):
        sys.stderr.write('parsing dump.cs (once)...\n')
        subprocess.run([sys.executable, os.path.join(HERE, 'dump_parse.py'), os.path.join(DUMPER, 'dump.cs'), t], check=True,
                       stdout=subprocess.DEVNULL)
    idx, s2r = pickle.load(open(p, 'rb'))
    return idx, s2r, json.load(open(t))


_DLL = None


def dll():
    global _DLL
    if _DLL is None:
        d = open(os.path.join(UNP, VER, 'GameAssembly.unpack.dll'), 'rb').read()
        pe = struct.unpack_from('<I', d, 0x3C)[0]; n = struct.unpack_from('<H', d, pe + 6)[0]
        opt = struct.unpack_from('<H', d, pe + 20)[0]
        secs = []; o = pe + 24 + opt
        for _ in range(n):
            vs, va, rs, ra = struct.unpack_from('<IIII', d, o + 8); o += 40; secs.append((va, max(vs, rs), ra))
        _DLL = (d, secs)
    return _DLL


def calls(rva, idx, size=0x2000):
    import capstone
    d, secs = dll()
    off = next(rva - va + ra for va, sz, ra in secs if va <= rva < va + sz)
    starts = sorted(idx.keys()); k = bisect.bisect_right(starts, rva)
    size = min(size, (starts[k] if k < len(starts) else rva + size) - rva)
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    out = []; seen = set()
    for i in md.disasm(d[off:off + size], rva):
        if i.mnemonic in ('call', 'jmp') and i.op_str.startswith('0x'):
            t = int(i.op_str, 16)
            nm = idx.get(t, [])
            if not nm or t in seen: continue
            seen.add(t)
            pick = [x for x in nm if x.startswith(('ReDriveBattleCore', 'A2.', 'System.Linq', 'System.Math'))] or nm[:2]
            out.append(f'{i.mnemonic} {t:#x} {" | ".join(pick[:4])}')
    return out


NOISE = ('System.Func', 'System.Action', 'Nullable', 'GCHandle', 'Enumerator', 'Dispose', 'PointerDelegate',
         'ArraySegment', 'AddWithResize', 'Array$$Clear')


def simplify(s, idx, s2r, types):
    def ann(m):
        name = m.group(1); r = s2r.get(name)
        if r is None: return m.group(0)
        rd = [n for n in idx.get(r, []) if n.startswith(('ReDriveBattleCore', 'System.Math', 'System.Decimal'))]
        alias = [n for n in rd if san(n) != name]
        own = any(san(n) == name for n in rd)
        return name + f'/*@{r:#x}' + ((' =' + ' | '.join(n.replace('ReDriveBattleCore.', '') for n in alias[:3])) if alias and not own else '') + '*/('
    s = re.sub(r'\b([A-Za-z_][A-Za-z0-9_]*__[A-Za-z0-9_]+)\(', ann, s)

    def ann2(m):
        r = int(m.group(2), 16) - 0x180000000
        names = idx.get(r, [])
        if not names: return m.group(0)
        pick = [n for n in names if n.startswith(('ReDriveBattleCore', 'System.'))] or names
        return m.group(1) + '/*=' + ' | '.join(pick[:2]) + '*/('
    s = re.sub(r'\b((?:func_0x|FUN_)0*([0-9a-f]{9,}))\(', ann2, s)
    IF = {}
    for t in types:
        if t['kind'] == 'interface':
            IF[t['name'].split('.')[-1].split('<')[0]] = {m['slot']: m['name'] for m in t['methods'] if m['slot'] is not None}

    def ann3(m):
        slot = int(m.group(2)); iface = m.group(3).split('_')[-1]
        nm = IF.get(iface, {}).get(slot)
        return m.group(0) + (f'/*{iface}.{nm}*/' if nm else f'/*{iface} slot {slot}*/')
    s = re.sub(r'\b(FUN_18000[0-9a-f]{4})\((\d+),\s*_?(?:ReDriveBattleCore_)?([A-Za-z0-9_]+?)_TypeInfo', ann3, s)
    s = re.sub(r"\n(\s*)if \((?:cRam|DAT_1879|\(char\)DAT_1879)[^\n]*== '\\0'\) \{.*?\n\1\}", '', s, flags=re.S)
    s = re.sub(r'\n\s*bVar\d+ = cRam[^\n]*;', '', s)
    s = re.sub(r'\n(\s*)if \(_DAT_187a00fb8 != 0\) \{.*?\n\1\}', '', s, flags=re.S)
    T = r'_ReDriveBattleCore_([A-Za-z0-9_]+?)_TypeInfo'
    s = re.sub(r'\(\*\(byte \*\)\(([^()]+?) \+ 0x130\) <\s*\*\(byte \*\)\(' + T + r' \+ 0x130\)\) \|\|\s*\([^;]*?!=\s*_ReDriveBattleCore_\2_TypeInfo\)', r'!IS(\1,\2)', s, flags=re.S)
    s = re.sub(r'\(\*\(byte \*\)\(' + T + r' \+ 0x130\) <=\s*\*\(byte \*\)\(([^()]+?) \+ 0x130\)\) &&\s*\([^;]*?==\s*_ReDriveBattleCore_\1_TypeInfo\)', r'IS(\2,\1)', s, flags=re.S)
    s = re.sub(r'\(\*\*\(code \*\*\)\((\*?\w+) \+ (0x[0-9a-f]+)\)\)\((\w+),\*\(undefined8 \*\)\(\*?\w+ \+ 0x[0-9a-f]+\)\)',
               lambda m: f'{m.group(3)}->VSLOT{(int(m.group(2), 16) - 0x138) // 16}()', s)
    s = re.sub(r'\(\*\*\(code \*\*\)\((\*?\w+) \+ (0x[0-9a-f]+)\)\)\((\w+),', lambda m: f'{m.group(3)}->VSLOT{(int(m.group(2), 16) - 0x138) // 16}(', s)
    s = s.replace('ReDriveBattleCore_', '').replace('System_Collections_Generic_', '')
    s = re.sub(r',_Method_[A-Za-z0-9_<>.,]+?__\)', ')', s)
    s = re.sub(r'\(longlong \*\)|\(longlong\)|\(undefined8 \*\)|\(undefined4 \*\)|\(int \*\)|\(char \*\)|\(byte \*\)|\(ulonglong\)|\(uint \*\)', '', s)
    s = re.sub(r'\*\((\w+) \+ (0x[0-9a-f]+)\)', r'\1[\2]', s)
    lines = [l for l in s.split('\n') if l.strip() and not re.search(r'FUN_18067ce80|swi\(3\)|\(\*pcVar[0-9]\)\(\)|FUN_18067d0a0\(\);$|func_0x00018067c210\(', l)
             and not re.match(r'^  (undefined[0-9]*|longlong|ulonglong|int|uint|char|bool|byte|float|double|code|short|ushort|undefined) \**[A-Za-z_0-9]+( \[[0-9]+\])?;$', l)]
    s = '\n'.join(lines)
    s = re.sub(r'\n(\s*)if \([^\n]*(?:\[0xe0\]|\+ 0xe0\)) == 0\) \{\n\s*func_0x00018065d160\([^\n]*\n\1\}', '', s)
    s = re.sub(r'\n(\s*)if \([^\n]*(?:\[0xe0\]|\+ 0xe0\)) == 0\) \{\n\1\}', '', s)
    s = re.sub(r'\*\((?:float|int|undefined4|undefined8|longlong) \*\)\(_(\w+?)_TypeInfo\[0xb8\] \+ (0x[0-9a-f]+|\d+)\)', r'STATIC(\1+\2)', s)
    s = re.sub(r'\*\(_(\w+?)_TypeInfo\[0xb8\] \+ (0x[0-9a-f]+|\d+)\)', r'STATIC(\1+\2)', s)
    s = re.sub(r'\*\*\((?:float|int|undefined4|undefined8|longlong) \*\*\)\(_(\w+?)_TypeInfo \+ 0xb8\)', r'STATIC(\1+0)', s)
    return s


# ---------------------------------------------------------------------------------------------------------------
# Typed field resolution: rewrite raw Ghidra memory accesses to `var.Field` using dump.cs layouts.
ELEM = {'longlong': 8, 'ulonglong': 8, 'undefined8': 8, 'double': 8, 'code': 8, 'int': 4, 'uint': 4, 'undefined4': 4,
        'float': 4, 'short': 2, 'ushort': 2, 'undefined2': 2, 'char': 1, 'byte': 1, 'bool': 1, 'undefined1': 1,
        'undefined': 1, 'int7': 8, 'uint7': 8}
_TI = None


def type_index():
    global _TI
    if _TI is None:
        idx, s2r, types = caches()
        by = {}
        for t in types:
            by.setdefault(t['name'].split('<')[0], t)
            by.setdefault(t['name'].split('<')[0].split('.')[-1], t)
        rva_ret = {}
        for t in types:
            for m in t['methods']:
                if m['rva'] and m['rva'] != '-1':
                    rva_ret.setdefault(int(m['rva'], 16), []).append((t['name'].split('<')[0], m['name'], m['ret']))
        _TI = (by, rva_ret, idx, s2r)
    return _TI


def bare(tn):
    """'List<BattleUnit>' -> 'List', 'BattleUnit.TeamType' -> 'BattleUnit.TeamType', 'UnitStateBase[]' -> None"""
    if tn is None: return None
    tn = tn.strip()
    if tn.endswith(']') or tn.endswith('?'): return None
    return tn.split('<')[0]


BUILTIN = {'List': {0x10: ('_items', 'T[]'), 0x18: ('Count', 'int'), 0x1c: ('_version', 'int')},
           'HashSet': {}, 'Dictionary': {}}


def fields_of(cls):
    if cls in BUILTIN: return BUILTIN[cls]
    by = type_index()[0]
    out = {}; seen = set(); t = by.get(cls)
    while t and t['name'] not in seen:
        seen.add(t['name'])
        for f in t['fields']:
            if f.get('offset') and 'static' not in f['mods'] and 'const' not in f['mods']:
                off = int(f['offset'], 16)
                m = re.match(r'^<(\w+)>k__BackingField$', f['name'])
                out.setdefault(off, (m.group(1) if m else f['name'], f['type']))
        b = next((x for x in t['bases'] if (by.get(x.split('<')[0]) or {}).get('kind') in ('class', 'struct')), None)
        t = by.get(b.split('<')[0]) if b else None
    return out


def slot_name(cls, slot):
    by = type_index()[0]
    t = by.get(cls); seen = set()
    while t and t['name'] not in seen:
        seen.add(t['name'])
        for m in t['methods']:
            if m['slot'] == slot: return m['name']
        b = next((x for x in t['bases'] if (by.get(x.split('<')[0]) or {}).get('kind') in ('class', 'struct')), None)
        t = by.get(b.split('<')[0]) if b else None
    return None


def ret_type(callname):
    by, rva_ret, idx, s2r = type_index()
    r = s2r.get(callname)
    if r is None: return None
    for cls, mn, ret in rva_ret.get(r, []):
        if san(cls + '$$' + mn).endswith(callname.split('__', 1)[-1]) and callname.split('__')[0].split('_')[-1] == cls.split('.')[-1]:
            return bare(ret)
    c = rva_ret.get(r, [])
    return bare(c[0][2]) if len(c) == 1 else None


def typed(block):
    """Rename params to their C# names, resolve `*(T *)(x + off)` / `x[n]` to `x.Field`, track simple types."""
    m = re.search(r'// RVA (?:0x[0-9a-f]+)\s+C#: (.*)$', block, re.M)
    hm = re.match(r'// ==== ([^$]+)\$\$', block)
    if not m or not hm: return block
    sig = m.group(1)
    cls = hm.group(1).replace('ReDriveBattleCore.', '').split('.')
    cls = '.'.join(cls[1:]) if cls[0] in ('Act', 'AI', 'AbilityEffect', 'BattleCondition', 'Command', 'Model', 'Reader', 'Request', 'UnitState', 'SimulationBattle') else '.'.join(cls)
    pm = re.search(r'\((.*)\)\s*\{', sig)
    cs_params = []
    if pm and pm.group(1).strip():
        depth = 0; cur = ''
        for ch in pm.group(1):
            if ch == '<': depth += 1
            if ch == '>': depth -= 1
            if ch == ',' and depth == 0: cs_params.append(cur.strip()); cur = ''
            else: cur += ch
        cs_params.append(cur.strip())
    is_static = ' static ' in ' ' + sig
    vtype = {}; elem = {}
    # declarations
    fm = re.search(r'^\S[^\n]*?\b(\w+)\s*\(([^)]*)\)\s*\n\{', block, re.M)
    names = {}
    if fm:
        ps = [p.strip() for p in fm.group(2).split(',') if p.strip()]
        k = 0
        if not is_static and ps:
            names[re.split(r'[\s*]+', ps[0])[-1]] = 'this'; vtype['this'] = cls; k = 1
        for i, cp in enumerate(cs_params):
            if k + i >= len(ps): break
            pv = re.split(r'[\s*]+', ps[k + i])[-1]
            toks = cp.replace(' in ', ' ').replace('out ', '').replace('ref ', '').split('=')[0].split()
            if len(toks) >= 2:
                names[pv] = toks[-1]; vtype[toks[-1]] = bare(' '.join(toks[:-1]))
    for d in re.finditer(r'^\s*(?:\w+ )?(undefined[1248]?|longlong|ulonglong|int|uint|char|byte|bool|float|double|short|ushort|code|undefined)\s*(\*+)\s*(\w+)\s*(?:\[\d+\])?;', block, re.M):
        elem[d.group(3)] = 8 if len(d.group(2)) > 1 else ELEM.get(d.group(1), 1)
    if fm:
        for p in fm.group(2).split(','):
            pm2 = re.match(r'\s*(\w+)\s*(\*+)\s*(\w+)', p)
            if pm2: elem[pm2.group(3)] = 8 if len(pm2.group(2)) > 1 else ELEM.get(pm2.group(1), 1)
    for a, b in names.items():
        block = re.sub(r'\b' + a + r'\b', b, block)
        if a in elem: elem[b] = elem.pop(a)
    out_lines = []
    ATOM = r'([A-Za-z_]\w*(?:\.\w+)*)'
    for line in block.split('\n'):
        if line.startswith('//'): out_lines.append(line); continue

        def skip(var, off):
            return var.startswith('_') or 'TypeInfo' in var or 'Method_' in var or (var not in vtype and off in (0x130, 0xc8, 0x12e, 0x135, 0xe0, 0xb8, 0xb0, 0x178, 0x180, 0x1a8, 0x1b0, 0x1c0))

        def fname(var, off):
            t = vtype.get(var)
            if t:
                f = fields_of(t).get(off)
                if f: return f'{var}.{f[0]}', bare(f[1])
            return f'{var}@{off:#x}', None
        changed = True; guard = 0
        while changed and guard < 20:
            changed = False; guard += 1
            # *(T *)((longlong)X + N)  -> byte offset
            def r1(m):
                nonlocal changed
                if skip(m.group(1), int(m.group(2), 16)): return m.group(0)
                changed = True
                return fname(m.group(1), int(m.group(2), 16))[0]
            line = re.sub(r'\*\((?:\w+) \*\)\(\(longlong\)' + ATOM + r' \+ (0x[0-9a-f]+)\)', r1, line)
            def r2(m):
                nonlocal changed
                v = m.group(1); n = int(m.group(2), 16)
                if v in ('this',) and v not in elem: off = n
                elif v in elem: off = n * elem[v]
                elif '.' in v or '@' in v or v.startswith(('lVar', 'uVar', 'param', 'lStack', 'uStack')) or v in vtype: off = n
                else: return m.group(0)
                if skip(v, off): return m.group(0)
                changed = True
                return fname(v, off)[0]
            line = re.sub(r'\*\((?:\w+) \*\)\(' + ATOM + r' \+ (0x[0-9a-f]+|\d+)\)', r2, line)
            def r3(m):
                nonlocal changed
                v = m.group(1)
                if v not in elem or skip(v, int(m.group(2), 0) * elem[v]): return m.group(0)
                changed = True
                return fname(v, int(m.group(2), 0) * elem[v])[0]
            line = re.sub(r'\b' + ATOM + r'\[(0x[0-9a-f]+|\d+)\]', r3, line)
        # type propagation on assignment
        am = re.match(r'\s*(\w+) = (.*?);?\s*$', line)
        if am:
            v, rhs = am.group(1), am.group(2)
            t = None
            cm = re.match(r'(?:\(\w+\s*\*?\))?\s*([A-Za-z_]\w*__\w+)', rhs)
            if cm: t = ret_type(cm.group(1))
            fm2 = re.match(r'([A-Za-z_]\w*(?:\.\w+)+)$', rhs.strip())
            if fm2:
                parts = fm2.group(1).split('.')
                tt = vtype.get(parts[0])
                for p in parts[1:]:
                    tt = next((bare(ty) for o, (nm, ty) in fields_of(tt).items() if nm == p), None) if tt else None
                t = tt
            if t: vtype[v] = t
            elif v in vtype and not rhs.startswith(v): vtype.pop(v, None)
            if t: line += f'   /*: {t}*/'
        out_lines.append(line)
    # chained field access X.A@0x10 -> X.A.B when A's type is known
    s = '\n'.join(out_lines)

    def vslot(m):
        v = m.group(1); slot = (int(m.group(2), 16) - 0x138) // 16
        t = vtype.get(v)
        nm = slot_name(t, slot) if t else None
        return f'{v}->{nm or "VSLOT" + str(slot)}('
    s = re.sub(r'\(\*\*\(code \*\*\)\(\*(?:\(longlong \*\))?(\w+(?:\.\w+)*) \+ (0x[0-9a-f]+)\)\)\(', vslot, s)
    def chain(m):
        path = m.group(1); off = int(m.group(2), 16)
        parts = path.split('.'); tt = vtype.get(parts[0])
        for p in parts[1:]:
            tt = next((bare(ty) for o, (nm, ty) in fields_of(tt).items() if nm == p), None) if tt else None
        f = fields_of(tt).get(off) if tt else None
        return f'{path}.{f[0]}' if f else m.group(0)
    for _ in range(4):
        s = re.sub(r'\b([A-Za-z_]\w*(?:\.\w+)+)@(0x[0-9a-f]+)', chain, s)
    return s


def cmd_fn(pattern):
    idx, s2r, types = caches()
    rx = re.compile(r'^// ==== .*(' + pattern + ')')
    for f in sorted(os.listdir(DEC)):
        if not f.endswith('.c'): continue
        blocks = re.split(r'\n(?=// ==== )', open(os.path.join(DEC, f), encoding='utf-8', errors='ignore').read())
        for b in blocks:
            if not rx.match(b): continue
            try:
                b2 = typed(b)
            except Exception as e:
                b2 = b; sys.stderr.write(f'typed() failed: {e}\n')
            print(simplify(b2, idx, s2r, types))
            m = re.search(r'// RVA (0x[0-9a-f]+)', b)
            if m:
                cs = [c for c in calls(int(m.group(1), 16), idx) if not any(x in c for x in NOISE)]
                if cs: print('-- calls (machine code):\n  ' + '\n  '.join(c[:170] for c in cs))
            print()


def cmd_slot(cls, slots):
    _, _, T = caches()
    by = {t['name'].split('<')[0]: t for t in T}
    c = by.get(cls); chain = []
    while c:
        chain.append(c)
        b = next((x for x in c['bases'] if x.split('<')[0] in by and by[x.split('<')[0]]['kind'] == 'class'), None)
        c = by.get(b.split('<')[0]) if b else None
    for s in slots:
        hits = [(c['name'], m['sig']) for c in chain for m in c['methods'] if m['slot'] == s]
        print(s, hits[:3] if hits else '(System.Object slot or not in the dump)')


def main():
    a = sys.argv[1:]
    if not a: print(__doc__); return
    if a[0] == 'fn': cmd_fn(a[1])
    elif a[0] == 'calls':
        idx, _, _ = caches(); print('\n'.join(calls(int(a[1], 16), idx)))
    elif a[0] == 'slot': cmd_slot(a[1], [int(x) for x in a[2:]])
    elif a[0] == 'names':
        idx, _, _ = caches(); print('\n'.join(idx.get(int(a[1], 16), ['(none)'])))
    else: print(__doc__)


if __name__ == '__main__':
    main()
