"""Add the members a new dump gave to existing, already-ported src/engine files without touching ported code.

    ENGINE_OUT=/tmp/shells python3 scripts/engine/gen_shells.py <types.json> --force --only <Ns.Type> ...
    python3 scripts/engine/merge_members.py /tmp/shells <Ns.Type> ...

Every field (`/** 0xNN ... name */` + declaration), property accessor (`get X()` / `set X(v)`) and method
(`/** @rva ... sig */` + body) of the fresh shell that the real file lacks (by field name / accessor name /
C# signature) is inserted after the nearest preceding member that both have, so the game's member order holds.
Members the real file has but the dump no longer has are only reported (port or delete them by hand).
"""
import os, re, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENG = os.path.join(ROOT, 'src', 'engine')
FLD = re.compile(r'^\s*/\*\* 0x[0-9A-Fa-f]+ .* (\S+) \*/\s*$')
HDR = re.compile(r'^\s*/\*\* @rva (?:0x[0-9A-Fa-f]+|-1)(?: slot \d+)?\s+(.*?)\s*\*/\s*$')
ACC = re.compile(r'^\s*(?:static\s+)?(get|set)\s+([\w$]+)\(')
CLS = re.compile(r'^export (?:abstract )?class (\w[\w$]*)')


def units(lines):
    """[(key, start, end)] per class, in order; end inclusive."""
    out = {}; cur = None; i = 0
    while i < len(lines):
        l = lines[i]
        m = CLS.match(l)
        if m: cur = m.group(1); out[cur] = []; i += 1; continue
        if cur is None: i += 1; continue
        if l.startswith('}'): cur = None; i += 1; continue
        fm, hm, am = FLD.match(l), HDR.match(l), ACC.match(l)
        if fm or hm:
            key = ('f', fm.group(1)) if fm else ('m', hm.group(1))
            j = i + 1; depth = lines[j].count('{') - lines[j].count('}')
            while depth > 0: j += 1; depth += lines[j].count('{') - lines[j].count('}')
            out[cur].append((key, i, j)); i = j + 1; continue
        if am:
            out[cur].append((('a', am.group(1) + ' ' + am.group(2)), i, i)); i += 1; continue
        i += 1
    return out


def main():
    shells, types = sys.argv[1], sys.argv[2:]
    for t in types:
        ns, name = t.rsplit('.', 1)
        rel = os.path.join(*ns.split('.'), name + '.ts')
        sp, rp = os.path.join(shells, rel), os.path.join(ENG, rel)
        sl = open(sp, encoding='utf-8').read().split('\n'); rl = open(rp, encoding='utf-8').read().split('\n')
        su, ru = units(sl), units(rl)
        inserts = []  # (after real line index, [lines])
        for cls, sus in su.items():
            have = {k: (a, b) for k, a, b in ru.get(cls, [])}
            if cls not in ru:
                print(f'{t}: class {cls} missing in the real file (add it by hand)'); continue
            anchor = None
            first = min(a for _, a, _ in ru[cls]) - 1 if ru[cls] else None
            for k, a, b in sus:
                if k in have: anchor = have[k][1]; continue
                at = anchor if anchor is not None else first
                inserts.append((at, sl[a:b + 1])); print(f'{t}: + {cls} {k[0]} {k[1][:120]}')
            sk = {k for k, _, _ in sus}
            for k, a, b in ru[cls]:
                if k not in sk: print(f'{t}: - {cls} {k[0]} {k[1][:120]}  (not in the new dump: port/remove by hand, line {a + 1})')
        for at, block in sorted(inserts, key=lambda x: x[0], reverse=True):
            rl[at + 1:at + 1] = block
        if inserts: open(rp, 'w', encoding='utf-8', newline='\n').write('\n'.join(rl))


main()
