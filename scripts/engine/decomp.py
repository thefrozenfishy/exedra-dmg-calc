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
VER = os.environ.get('XQ_GAME_VER', '3.19.0')
UNP = os.environ.get('XQ_UNPACKED') or os.path.normpath(os.path.join(ROOT, '..', 'unpackedExedra'))
DUMPER = os.environ.get('XQ_DUMPER') or os.path.normpath(os.path.join(ROOT, '..', 'Il2CppDumper'))
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


def cmd_fn(pattern):
    idx, s2r, types = caches()
    rx = re.compile(r'^// ==== .*(' + pattern + ')')
    for f in sorted(os.listdir(DEC)):
        if not f.endswith('.c'): continue
        blocks = re.split(r'\n(?=// ==== )', open(os.path.join(DEC, f), encoding='utf-8', errors='ignore').read())
        for b in blocks:
            if not rx.match(b): continue
            print(simplify(b, idx, s2r, types))
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
