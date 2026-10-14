"""Cross-check ported bodies against the game's machine code.

For every method in src/engine with an `@rva` tag and a hand-written body, list the ReDriveBattleCore
functions the game's machine code calls (decomp.calls) and report callees that the TS body never mentions
(by method name, property name, lambda name `b__N_M`, or class name for constructors). A missing callee
means a call was dropped, folded into something else, or the body was inlined differently; every hit has to
be explained (inlined helper, folded alias, compiler-generated) or fixed.

usage: python3 scripts/engine/callcheck.py [--file <substring>] [--all]
"""
import os, re, sys, glob, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import decomp

ap = argparse.ArgumentParser()
ap.add_argument('--file'); ap.add_argument('--all', action='store_true')
ap.add_argument('--strict', action='store_true', help='do not accept calls explained by an inlined helper')
a = ap.parse_args()
idx, s2r, types = decomp.caches()
ROOT = decomp.ROOT
SKIP_CALLEE = re.compile(r'(\$\$Finalize|\$\$Equals|\$\$GetHashCode|\$\$ToString|Il2Cpp|\.cctor)')

def tokens(name):
    # 'ReDriveBattleCore.A.B$$get_Foo<int>' -> {'get_Foo','Foo'}
    cls, _, m = name.partition('$$')
    m = re.sub(r'<[^<>]*(<[^<>]*>[^<>]*)*>$', '', m) if not m.startswith('<') else m
    out = set()
    lm = re.search(r'b__\d+_\d+', name)
    if lm: out.add(lm.group(0)); return out
    if m == '.ctor':
        c = cls.split('.')[-1].split('<')[0]
        out |= {c, 'ctor', 'super.'}
        return out
    m = m.split('.')[-1]  # explicit interface impl
    out.add(m)
    for p in ('get_', 'set_', 'add_', 'remove_'):
        if m.startswith(p):
            prop = m[len(p):]
            out.add(prop)
            out.add('record.' + prop[:1].lower() + prop[1:])  # Mst model getter = record field read
            out.add('r.' + prop[:1].lower() + prop[1:])
    return out

import pickle
REV = os.path.expanduser('~/.cache/exedra-engine/rev.pkl')
if not os.path.exists(REV):
    rev = {}
    for r, ns in idx.items():
        if any(n.startswith('ReDriveBattleCore') for n in ns):
            for line in decomp.calls(r, idx):
                rev.setdefault(int(line.split()[1], 16), set()).add(r)
    pickle.dump(rev, open(REV, 'wb'))
rev = pickle.load(open(REV, 'rb'))

def explained(t, body, depth=1):
    # a call the game inlined from a helper the TS body calls: some caller of t is mentioned in the body
    frontier = {t}
    for _ in range(depth):
        nxt = set()
        for x in frontier:
            for c in rev.get(x, ()):
                ns = [n for n in idx.get(c, []) if n.startswith('ReDriveBattleCore')]
                if ns and any(tok in body for n in ns for tok in tokens(n) if len(tok) > 3 and tok not in ('ctor', 'super.')):
                    return True
                nxt.add(c)
        frontier = nxt
    return False

report = []
files = [f for f in glob.glob(os.path.join(ROOT, 'src/engine/**/*.ts'), recursive=True) if '/dist/' not in f.replace('\\', '/')]
for f in sorted(files):
    rel = os.path.relpath(f, ROOT).replace('\\', '/')
    if a.file and a.file not in rel: continue
    lines = open(f, encoding='utf8').read().split('\n')
    marks = [(i, int(m.group(1), 16)) for i, l in enumerate(lines) for m in [re.search(r'@rva\s+(0x[0-9A-Fa-f]+)', l)] if m]
    for k, (i, rva) in enumerate(marks):
        end = marks[k + 1][0] if k + 1 < len(marks) else len(lines)
        body = '\n'.join(lines[i + 1:end])
        if 'notPorted(' in body or 'auto-property' in body or '/* asm:' in body: continue
        try:
            cl = decomp.calls(rva, idx)
        except StopIteration:
            continue
        miss = []
        for c in cl:
            t = int(c.split()[1], 16)
            names = [n for n in idx.get(t, []) if n.startswith('ReDriveBattleCore')]
            if not names or all(SKIP_CALLEE.search(n) for n in names): continue
            if len(idx.get(t, [])) >= 10: continue  # folded stub shared by many methods (empty ctor, ret, ...)
            toks = set().union(*(tokens(n) for n in names))
            if any(tok in body for tok in toks): continue
            if t == rva: continue
            if not a.strict and explained(t, body): continue
            miss.append(names[0].replace('ReDriveBattleCore.', '') + (f' (+{len(names)-1} aliases)' if len(names) > 1 else ''))
        if miss:
            report.append((rel, i + 2, hex(rva), lines[i].strip()[4:90], miss))
for rel, ln, rva, sig, miss in report:
    print(f'{rel}:{ln} {rva} {sig}')
    for m in miss: print('      missing call:', m)
print(f'{len(report)} methods with unmatched callees', file=sys.stderr)
