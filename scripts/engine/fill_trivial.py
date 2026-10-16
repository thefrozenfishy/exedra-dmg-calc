"""Port the trivial game methods mechanically from their machine code (exact, no guessing).

    python3 scripts/engine/fill_trivial.py [--dry] [--ver 3.19.0]

For every `notPorted(...)` stub in src/engine whose RVA disassembles to one of these leaf shapes, the body is
replaced by the equivalent TS (comment `/* asm: ... */` keeps the evidence):
    ret                                   -> {}                       (empty method)
    xor eax/al, eax/al ; ret              -> return false / 0 / null
    mov eax/al, imm ; ret                 -> return imm (bool for boolean returns)
    mov|movzx|movss reg, [rcx+off] ; ret  -> return this.<field at off>
    mov|movss [rcx+off], edx/rdx/dl/xmm1 ; ret (or jmp to the GC write barrier)  -> this.<field> = <param0>
    mov byte|dword ptr [rcx+off], imm ; ret -> this.<field> = imm
Only instance methods are handled (rcx = this, rdx/xmm1 = first parameter). Field offsets come from the
`/** 0xNN ... */` comments of the class and its ancestors in src/engine.
"""
import os, re, struct, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENG = os.path.join(ROOT, 'src', 'engine')
a = sys.argv[1:]
DRY = '--dry' in a
VER = a[a.index('--ver') + 1] if '--ver' in a else (os.environ.get('XQ_GAME_VER') or open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ai', 'GAME_VER')).read().strip())
UNP = os.environ.get('XQ_UNPACKED') or os.path.join(ROOT, '..', 'unpackedExedra')
import capstone

dll = open(os.path.join(UNP, VER, 'GameAssembly.unpack.dll'), 'rb').read()
pe = struct.unpack_from('<I', dll, 0x3C)[0]; nsec = struct.unpack_from('<H', dll, pe + 6)[0]
opt = struct.unpack_from('<H', dll, pe + 20)[0]
SECS = []
o = pe + 24 + opt
for _ in range(nsec):
    vs, va, rs, ra = struct.unpack_from('<IIII', dll, o + 8); o += 40
    SECS.append((va, max(vs, rs), ra))
md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)


def insns(rva, n=4):
    off = next((rva - va + ra for va, sz, ra in SECS if va <= rva < va + sz), None)
    if off is None: return []
    out = []
    for i in md.disasm(dll[off:off + 64], rva):
        out.append((i.mnemonic, i.op_str))
        if i.mnemonic in ('ret', 'jmp') or len(out) >= n: break
    return out


# ---- field maps from the TS files ----
CLS = re.compile(r'^// ---- (\S+)\s+\(TypeDefIndex')
DECL = re.compile(r'^export (?:abstract )?class (\w[\w$]*)(?:<[^>]*>)? ?(?:extends (\w[\w$]*))?')
FCOM = re.compile(r'^\s+/\*\* (0x[0-9A-Fa-f]+) (.*?) \*/$')
FDEF = re.compile(r'^\s+(static )?(?:readonly )?([\w$]+): (.+?) = ')
ENUMS = set()
classes = {}  # ts name -> {'base': ts name, 'fields': {off: (name, type)}}
files = []
for dp, _, fs in os.walk(ENG):
    for f in fs:
        if f.endswith('.ts') and f != 'runtime.ts': files.append(os.path.join(dp, f))
for p in files:
    lines = open(p, encoding='utf-8').read().split('\n')
    cur = None
    for i, l in enumerate(lines):
        em = re.match(r'^export const (\w[\w$]*) = \{$', l)
        if em: ENUMS.add(em.group(1))
        m = DECL.match(l)
        if m:
            cur = m.group(1); classes[cur] = {'base': m.group(2), 'fields': {}}; continue
        fm = FCOM.match(l)
        if fm and cur and i + 1 < len(lines):
            dm = FDEF.match(lines[i + 1])
            if dm and not dm.group(1) and 'static' not in fm.group(2).split():
                classes[cur]['fields'][int(fm.group(1), 16)] = (dm.group(2), dm.group(3))


def field_at(cls, off):
    while cls in classes:
        f = classes[cls]['fields'].get(off)
        if f: return f
        cls = classes[cls]['base']
    return None


MEM = re.compile(r'^(?:byte|word|dword|qword) ptr \[rcx \+ (0x[0-9a-f]+)\]$|^\[rcx \+ (0x[0-9a-f]+)\]$')


def mem_off(op):
    m = re.match(r'^(?:(?:byte|word|dword|qword|xmmword) ptr )?\[rcx(?: \+ (0x[0-9a-f]+))?\]$', op.strip())
    if not m: return None
    return int(m.group(1), 16) if m.group(1) else 0


def translate(ins, cls, ret, params):
    if not ins: return None
    # `xor edx, edx ; jmp <function that is just ret>` (e.g. 0x7305e0 -> System.Object..ctor) == empty body
    if ins[-1][0] == 'jmp' and ins[-1][1].startswith('0x') and all(x[0] in ('xor', 'mov') for x in ins[:-1]):
        tgt = insns(int(ins[-1][1], 16), 1)
        if tgt and tgt[0][0] == 'ret':
            ins = [('ret', '')]
    mn = [x[0] for x in ins]
    if ret == 'this':  # .ctor
        return 'return this;' if mn == ['ret'] else None
    if mn == ['ret']:
        return '' if ret == 'void' else None
    if len(ins) == 2 and mn[1] == 'ret':
        op0, ops = ins[0]
        parts = [x.strip() for x in ops.split(',', 1)]
        if op0 == 'xor' and parts[0] == parts[1] and parts[0] in ('al', 'eax', 'rax'):
            if ret in ENUMS: return f'return 0 as {ret};'
            return 'return ' + {'boolean': 'false'}.get(ret, '0' if re.match(r'^(int|float|long|short|byte|uint|ulong|double|number)$', ret) or ret.startswith('0 as') else 'null!') + ';'
        if op0 == 'mov' and parts[0] in ('al', 'eax', 'rax') and re.match(r'^-?(0x)?[0-9a-f]+$', parts[1]):
            v = int(parts[1], 16) if parts[1].startswith('0x') else int(parts[1])
            if ret == 'boolean': return f'return {"true" if v else "false"};'
            if re.match(r'^(int|uint|long|short|byte)$', ret) or ret.endswith('Type') or True:
                if ret in ('int', 'uint', 'long', 'short', 'byte'): return f'return {v if v < 2**31 else v - 2**32};'
                return None if not re.match(r'^\w+$', ret) else f'return {v if v < 2**31 else v - 2**32} as {ret};'
        if op0 in ('mov', 'movzx', 'movss', 'movsxd', 'movsx') and parts[0] in ('al', 'eax', 'rax', 'xmm0', 'ax'):
            off = mem_off(parts[1])
            if off is not None:
                f = field_at(cls, off)
                if f: return f'return this.{f[0]}' + (f' as {ret}' if ret in ENUMS and f[1] != ret else '') + ';'
        if op0 in ('mov', 'movss') and mem_off(parts[0]) is not None:
            off = mem_off(parts[0]); f = field_at(cls, off)
            if not f: return None
            src = parts[1]
            if src in ('edx', 'rdx', 'dl', 'dx', 'xmm1') and params:
                if f[1] == 'boolean' and src != 'dl': return None
                return f'this.{f[0]} = {params[0]};'
            if re.match(r'^-?(0x)?[0-9a-f]+$', src):
                v = int(src, 16) if src.startswith('0x') else int(src)
                if f[1] == 'boolean': return f'this.{f[0]} = {"true" if v else "false"};'
                if f[1] in ('int', 'uint', 'long', 'short', 'byte', 'float', 'double'): return f'this.{f[0]} = {v};'
    # reference setter: mov [rcx+off], rdx ; ... ; jmp il2cpp write barrier
    if len(ins) >= 2 and ins[0][0] == 'mov' and mem_off(ins[0][1].split(',')[0]) is not None and ins[0][1].split(',')[1].strip() == 'rdx' and ins[-1][0] == 'jmp':
        mid = ins[1:-1]
        if all(m[0] in ('lea', 'mov', 'add') for m in mid) and params:
            f = field_at(cls, mem_off(ins[0][1].split(',')[0]))
            if f: return f'this.{f[0]} = {params[0]};'
    return None


STUB = re.compile(r'^(\s+)((?!static )([\w$]+)(<[^>]*>)?\((.*?)\): (.+?)) \{ return notPorted\("[^"]*", (0x[0-9A-F]+)\); \}$')
total = 0
for p in files:
    lines = open(p, encoding='utf-8').read().split('\n')
    cur = None; changed = 0
    for i, l in enumerate(lines):
        m = DECL.match(l)
        if m: cur = m.group(1); continue
        sm = STUB.match(l)
        if not sm or not cur: continue
        ind, decl, name, gen, params, ret, rva = sm.groups()
        pnames = [re.match(r'\s*([\w$]+)', x).group(1) for x in params.split(',') if x.strip()] if params.strip() else []
        ins = insns(int(rva, 16))
        body = translate(ins, cur, ret.strip(), pnames)
        if body is None: continue
        asm = '; '.join((x[0] + ' ' + x[1]).strip() for x in ins)
        lines[i] = f'{ind}{decl} {{ {body + " " if body else ""}/* asm: {asm} */ }}'
        changed += 1
    if changed:
        total += changed
        if not DRY: open(p, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
print(f'{total} trivial methods filled{" (dry run)" if DRY else ""}')
