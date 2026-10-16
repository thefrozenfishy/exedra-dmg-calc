"""Compare instance/static field lists of a new dump with the `/** 0xNN <mods> <type> <name> */` comments in src/engine.

    python3 scripts/engine/fields_check.py <types.json> [--apply]
Prints NEW FIELD / GONE FIELD per class; --apply rewrites the offsets of fields that only moved.
Nested types A.B live in A's file as class A_B.
"""
import json, os, re, sys, collections
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENG = os.path.join(ROOT, 'src', 'engine')
CLS = re.compile(r'^// ---- (\S+)\s+\(TypeDefIndex')
FLD = re.compile(r'^(\s*/\*\* )(0x[0-9A-Fa-f]+)( .*? )([^\s]+) \*/\s*$')
a = sys.argv[1:]
T = {t['ns'] + '.' + t['name']: t for t in json.load(open(a[0]))}
apply = '--apply' in a
moved = new = gone = 0
for dp, _, fs in os.walk(ENG):
    for f in fs:
        if not f.endswith('.ts'): continue
        p = os.path.join(dp, f); lines = open(p, encoding='utf-8').read().split('\n'); cls = None; seen = collections.defaultdict(dict); changed = False
        for i, l in enumerate(lines):
            m = CLS.match(l)
            if m: cls = m.group(1); continue
            fm = FLD.match(l)
            if cls and fm and cls in T:
                seen[cls][fm.group(4)] = (i, fm)
        for cls, have in seen.items():
            t = T[cls]
            dfs = {x['name']: x for x in t['fields'] if x.get('offset')}
            for n, (i, fm) in have.items():
                d = dfs.get(n)
                if d is None:
                    print(f'GONE FIELD {cls}.{n} ({f})'); gone += 1; continue
                if int(d['offset'], 16) != int(fm.group(2), 16):
                    moved += 1
                    if apply:
                        lines[i] = fm.group(1) + '0x' + d['offset'][2:].upper() + fm.group(3) + fm.group(4) + ' */'; changed = True
            for n, d in dfs.items():
                if n not in have and 'const' not in d['mods']:
                    print(f"NEW FIELD  {cls}.{n}  {d['offset']} {' '.join(d['mods'])} {d['type']} ({f})"); new += 1
        if changed: open(p, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
print(f'moved {moved}{" (applied)" if apply else ""}, new {new}, gone {gone}')
