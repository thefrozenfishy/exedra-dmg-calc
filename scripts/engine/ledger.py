"""Port ledger for src/engine (the 1:1 port of ReDriveBattleCore).

    python3 scripts/engine/ledger.py                      # summary per namespace -> stdout
    python3 scripts/engine/ledger.py --write              # also writes docs/ai/ENGINE_LEDGER.md
    python3 scripts/engine/ledger.py --class ActReferee   # every method of a class with its status
    python3 scripts/engine/ledger.py --rva 0x18e89f0,0x17E1060   # where those game functions live in TS
    python3 scripts/engine/ledger.py --check <types.json> # members in a (new) dump that the TS files lack / have extra
    python3 scripts/engine/ledger.py --check <types.json> --apply-moves   # also rewrites the @rva tags (and the
                                                          # notPorted(..., 0xRVA) of stubs) of every MOVED member

Status of a method: ported (hand-written body), asm (fill_trivial.py), auto (auto-property accessor), stub (notPorted), abstract.
A patch workflow: verdiff gives the changed RVAs -> `--rva` lists the TS methods to re-port; a new dump ->
dump_parse.py + `--check` lists new/removed members; gen_shells.py --only <Type> creates shells for new types.
"""
import json, os, re, sys, collections

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENG = os.path.join(ROOT, 'src', 'engine')
HDR = re.compile(r'^\s*/\*\* @rva (0x[0-9A-Fa-f]+|-1)(?: slot (\d+))?\s+(.*?)\s*\*/\s*$')
CLS = re.compile(r'^// ---- (\S+)\s+\(TypeDefIndex (\d+), (.*?)\) ----')


def scan():
    rows = []
    for dp, _, fs in os.walk(ENG):
        for f in fs:
            if not f.endswith('.ts') or f == 'runtime.ts': continue
            path = os.path.join(dp, f)
            lines = open(path, encoding='utf-8').read().split('\n')
            cls = None
            i = 0
            while i < len(lines):
                cm = CLS.match(lines[i])
                if cm: cls = cm.group(1)
                hm = HDR.match(lines[i])
                if hm and cls:
                    # the member starts on the next line; take its body up to the matching brace
                    j = i + 1
                    decl = lines[j].strip() if j < len(lines) else ''
                    body = [decl]
                    if '{' in decl:
                        depth = decl.count('{') - decl.count('}')
                        while depth > 0 and j + 1 < len(lines):
                            j += 1; body.append(lines[j]); depth += lines[j].count('{') - lines[j].count('}')
                    txt = '\n'.join(body)
                    if decl.startswith('abstract ') or decl.endswith(';') and '{' not in decl:
                        st = 'abstract'
                    elif 'notPorted(' in txt:
                        st = 'stub'
                    elif 'auto-property' in txt:
                        st = 'auto'
                    elif '/* asm:' in txt:
                        st = 'asm'
                    else:
                        st = 'ported'
                    name = re.match(r'(?:static\s+|abstract\s+)?(?:get\s+|set\s+)?([\w$]+)', decl)
                    rows.append({'cls': cls, 'rva': hm.group(1).lower(), 'slot': hm.group(2), 'sig': hm.group(3),
                                 'ts': name.group(1) if name else '?', 'status': st,
                                 'file': os.path.relpath(path, ROOT).replace(os.sep, '/'), 'line': i + 2,
                                 'lines': len(body)})
                    i = j
                i += 1
    return rows


def summary(rows):
    by = collections.defaultdict(collections.Counter)
    for r in rows:
        ns = os.path.dirname(r['file'][len('src/engine/'):]).replace('/', '.')
        by[ns][r['status']] += 1
    out = ['| namespace | ported by hand | from asm | auto-property | stub | abstract | % done |', '|---|---|---|---|---|---|---|']
    tot = collections.Counter()
    for ns in sorted(by):
        c = by[ns]; tot += c
        real = c['ported'] + c['asm'] + c['stub']
        out.append(f"| {ns} | {c['ported']} | {c['asm']} | {c['auto']} | {c['stub']} | {c['abstract']} | {100 * (c['ported'] + c['asm']) // real if real else 100}% |")
    real = tot['ported'] + tot['asm'] + tot['stub']
    out.append(f"| **total** | {tot['ported']} | {tot['asm']} | {tot['auto']} | {tot['stub']} | {tot['abstract']} | {100 * (tot['ported'] + tot['asm']) // real if real else 100}% |")
    return out


def main():
    a = sys.argv[1:]
    rows = scan()
    if '--class' in a:
        c = a[a.index('--class') + 1]
        for r in rows:
            if r['cls'].split('.')[-1] == c or r['cls'] == c:
                print(f"{r['status']:8s} {r['rva']:>10s}  {r['ts']:40s} {r['file']}:{r['line']}")
        return
    if '--rva' in a:
        want = {x.strip().lower() for x in a[a.index('--rva') + 1].split(',')}
        want = {('0x' + w[2:].lstrip('0')) if w.startswith('0x') else w for w in want}
        for r in rows:
            rv = '0x' + r['rva'][2:].lstrip('0') if r['rva'].startswith('0x') else r['rva']
            if rv in want:
                print(f"{r['rva']}  {r['cls']}.{r['ts']}  [{r['status']}]  {r['file']}:{r['line']}")
        return
    if '--check' in a:
        T = json.load(open(a[a.index('--check') + 1]))
        have = collections.defaultdict(list)
        for r in rows: have[r['cls']].append(r)
        n = 0
        apply = '--apply-moves' in a
        edits = collections.defaultdict(list)  # file -> [(header line index, body line count, old rva, new rva)]
        for t in T:
            if any(s.startswith('<') for s in t['name'].split('.')): continue
            full = t['ns'] + '.' + t['name']
            if t['kind'] in ('enum',): continue
            props_ = {p['name'] for p in t['props']}
            real = [m for m in t['methods'] if not (t['kind'] == 'interface' and re.match(r'^(get|set)_', m['name']) and m['name'][4:] in props_)]
            if full not in have and real:
                print(f'NEW TYPE   {full}  (gen_shells.py --only {full})'); n += 1; continue
            sigs = {r['sig'] for r in have.get(full, [])}
            props = {p['name'] for p in t['props']}
            dsigs = {m['sig'] for m in t['methods']
                     if not (t['kind'] == 'interface' and re.match(r'^(get|set)_', m['name']) and m['name'][4:] in props)}
            for s_ in sorted(dsigs - sigs): print(f'NEW/CHANGED {full}: {s_}'); n += 1
            for s_ in sorted(sigs - dsigs): print(f'GONE/CHANGED {full}: {s_}'); n += 1
            rv = {m['sig']: (m['rva'] or '').lower() for m in t['methods']}
            for r in have.get(full, []):
                d = rv.get(r['sig'])
                if d and d != '-1' and int(d, 16) != int(r['rva'], 16) if r['rva'] != '-1' else False:
                    print(f"MOVED      {full}.{r['ts']}: {r['rva']} -> {d}  (update the @rva tag)"); n += 1
                    edits[r['file']].append((r['line'] - 2, r['lines'], r['rva'], d))
        print(f'{n} differences')
        if apply:
            done = 0
            for f, es in edits.items():
                path = os.path.join(ROOT, f)
                lines = open(path, encoding='utf-8').read().split('\n')
                for hi, nb, old, new in es:
                    newhex = '0x' + new[2:].upper().lstrip('0')
                    pat = re.compile(r'0x0*' + old[2:].lstrip('0') + r'\b', re.I)
                    hm = HDR.match(lines[hi])
                    if not hm or int(hm.group(1), 16) != int(old, 16):
                        print(f'  skip {f}:{hi + 1} (header does not match {old})'); continue
                    lines[hi] = lines[hi].replace(hm.group(1), newhex, 1)
                    for k in range(hi + 1, min(len(lines), hi + 1 + nb)):
                        if 'notPorted(' in lines[k]:
                            lines[k] = pat.sub(newhex, lines[k])
                    done += 1
                open(path, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
            print(f'applied {done} moves in {len(edits)} files')
        return
    out = summary(rows)
    print('\n'.join(out))
    if '--write' in a:
        md = ['# Engine port ledger (generated)', '',
              'Generated by `python3 scripts/engine/ledger.py --write` from the `@rva` tags in `src/engine`. '
              '"ported by hand" = body ported from the decompile, "from asm" = trivial body filled by fill_trivial.py from the machine code, "auto-property" = compiler backing-field accessor, '
              '"stub" = `notPorted(...)`, "abstract" = no body in the game either.', ''] + out + ['',
              '## Ported methods', '']
        for r in sorted(rows, key=lambda r: (r['cls'], r['line'])):
            if r['status'] == 'ported':
                md.append(f"- `{r['cls']}.{r['ts']}` {r['rva']} ({r['file']}:{r['line']})")
        open(os.path.join(ROOT, 'docs', 'ai', 'ENGINE_LEDGER.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(md) + '\n')


main()
