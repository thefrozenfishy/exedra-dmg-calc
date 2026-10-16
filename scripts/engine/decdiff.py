"""Semantic diff of two Ghidra decompiles (one .c per namespace, `// ==== ` headers, DecompileList.java output).
Functions are matched by C# signature + class; addresses (FUN_/DAT_/LAB_/cRam/func_0x/PTR_/hex >= 0x10000 in names)
are normalised away, so a function that only moved or calls moved code compares equal.

  python3 scripts/engine/decdiff.py OLD_DIR NEW_DIR [--out FILE] [--grep REGEX] [--show]
--ignore-offsets hides field-offset changes (class layouts moved); --loose compares whitespace-free statements with every non-battle-core call name erased; --only FILE limits to new RVAs listed.
Prints CHANGED / ADDED / REMOVED lines (class, C#, old -> new RVA); --show adds a unified diff of each CHANGED body.
"""
import difflib, glob, os, re, sys

HDR = re.compile(r"^// ==== (.*?) ====$")
RVA = re.compile(r"^// RVA (0x[0-9a-f]+)\s+C#: (.*)$")
NORM = [
    (re.compile(r"\b(FUN|DAT|LAB|PTR|UNK|SUB|switchD|caseD|code)_[0-9a-fA-F_]+"), r"\1_X"),
    (re.compile(r"\b[cbsilp]?Ram[0-9a-fA-F]{8,}"), "Ram_X"),
    (re.compile(r"\bfunc_0x[0-9a-fA-F]+"), "func_X"),
    (re.compile(r"\b0x1[0-9a-f]{8,}\b"), "0xADDR"),
    (re.compile(r"\bStringLiteral_\d+"), "StringLiteral_X"),
    (re.compile(r"\bMethod_[A-Za-z0-9_.]*?__\d+\b"), lambda m: re.sub(r"__\d+$", "__N", m.group(0))),
    (re.compile(r"_?[ib]__\d+_\d+"), "_b__N"),
    (re.compile(r"DisplayClass\d+_\d+"), "DisplayClassN"),
    (re.compile(r"\bcode_r0x[0-9a-fA-F]+"), "code_r"),
    (re.compile(r"\b(in_stack|unaff|extraout|in)_[A-Za-z0-9_]+"), "V"),
    (re.compile(r"\b[a-z]{0,3}(Var|Stack[X_]*)[0-9a-fA-F_]*\b"), "V"),
    (re.compile(r"\b[a-z]{1,2}Stack_[0-9a-f]+\b"), "V"),
    # folded bodies get an arbitrary one of their names; keep only calls into the battle core by name
    (re.compile(r"\b(?!ReDriveBattleCore_)[A-Za-z_][A-Za-z0-9_]*(<[^()]*?>)?(_+[A-Za-z0-9_<>]*)*(?=\s*\()"), "CALL"),
]
DECL = re.compile(r"^\s+[A-Za-z_][\w\s\*]*\s\*?V(\s*\[\d+\])?;$")


def load(d):
    out = {}
    for f in sorted(glob.glob(os.path.join(d, "*.c"))):
        ns = os.path.basename(f)[:-2]
        cur = None
        for line in open(f, encoding="utf-8", errors="replace"):
            line = line.rstrip("\n")
            h = HDR.match(line)
            if h:
                cur = {"hdr": h.group(1), "rva": None, "cs": None, "body": []}
                continue
            if cur is None:
                continue
            r = RVA.match(line)
            if r and cur["rva"] is None:
                cur["rva"], cur["cs"] = r.group(1), r.group(2)
                cls = cur["hdr"].split("$$")[0]
                key = (cls, cur["cs"])
                n = 1
                while key in out:
                    n += 1; key = (cls, cur["cs"] + f" #{n}")
                out[key] = cur
                continue
            cur["body"].append(line)
    return out


OFFS = re.compile(r"(\+ |\+|- )0x[0-9a-f]+\b")


def norm(body, offsets=False):
    res = []
    for l in body:
        if not l.strip() or l.startswith("/* WARNING"):
            continue
        for rx, rep in NORM:
            l = rx.sub(rep, l)
        if offsets:
            l = OFFS.sub(r"\1OFF", l)
        if DECL.match(l):
            continue
        res.append(l.rstrip())
    # the function's own Ghidra name line (folded functions) is not semantic
    return [l for l in res if not re.match(r"^\w[\w\s\*]*\s\*?\w+\(.*\)$", l) or "=" in l]


CALLNAME = re.compile(r"\b(?!ReDriveBattleCore_)[A-Za-z_][\w<>,*\s]*?(?=\s*\()")
TOK = re.compile(r"\s+")


def norm_stream(lines):
    """One whitespace-free string per statement (Ghidra wraps long calls differently between builds)."""
    txt = "\n".join(lines)
    txt = re.sub(r"\b(?!ReDriveBattleCore_)[A-Za-z_][\w]*(<[^()\n]*?>)?(?:_+[\w<>]*)*(?=\s*\()", "CALL", txt)
    txt = TOK.sub("", txt)
    return [x for x in re.split(r"(?<=[;{}])", txt) if x]


def main():
    a = sys.argv[1:]
    old, new = load(a[0]), load(a[1])
    show = "--show" in a
    offs = "--ignore-offsets" in a
    only = None
    if "--only" in a:  # file with one '<RVA new>' per line (e.g. verdiff funcs CHANGED)
        only = {l.split()[0].lower() for l in open(a[a.index("--only") + 1]) if l.strip()}
    rx = re.compile(a[a.index("--grep") + 1]) if "--grep" in a else None
    outf = open(a[a.index("--out") + 1], "w", encoding="utf-8") if "--out" in a else sys.stdout
    ch = ad = rm = same = 0
    for k in sorted(set(old) | set(new)):
        name = f"{k[0]}  {k[1]}"
        if rx and not rx.search(name):
            continue
        o, n = old.get(k), new.get(k)
        if only is not None and not (n and n["rva"] in only):
            continue
        if o and n:
            no, nn = norm(o["body"], offs), norm(n["body"], offs)
            if "--loose" in a:
                no, nn = norm_stream(no), norm_stream(nn)
            if no == nn:
                same += 1; continue
            ch += 1
            print(f"CHANGED {name}  {o['rva']} -> {n['rva']}", file=outf)
            if show:
                for l in difflib.unified_diff(no, nn, lineterm="", n=2):
                    if not l.startswith(("---", "+++")):
                        print("    " + l, file=outf)
        elif n:
            ad += 1; print(f"ADDED   {name}  {n['rva']}", file=outf)
        else:
            rm += 1; print(f"REMOVED {name}  {o['rva']}", file=outf)
    print(f"same {same}, changed {ch}, added {ad}, removed {rm}", file=outf)


if __name__ == "__main__":
    main()
