"""Identifier-string diff of two global-metadata.dat files (type/method/field names), for when no Il2CppDumper
dump of the new version exists yet. Names only: it can't say which class a name belongs to.
usage: python3 scripts/ai/meta_idents.py OLD/global-metadata.dat NEW/global-metadata.dat [--out DIR] [--grep REGEX]
Writes DIR/idents_new.txt and DIR/idents_gone.txt (compiler-generated <...> names dropped)."""
import os, re, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import verdiff

def idents(p):
    d = open(p, "rb").read()
    secs = {}
    for i, n in enumerate(verdiff.META_SECTIONS):
        o, s = struct.unpack_from("<ii", d, 8 + i * 8); secs[n] = (o, s)
    o, s = secs["string"]
    return {x.decode("utf8", "replace") for x in d[o:o + s].split(b"\0")}

def main():
    a = sys.argv[1:]
    out = a[a.index("--out") + 1] if "--out" in a else None
    rx = re.compile(a[a.index("--grep") + 1], re.I) if "--grep" in a else None
    old, new = idents(a[0]), idents(a[1])
    keep = lambda s: s and not s.startswith("<") and "BackingField" not in s
    added = sorted(x for x in new - old if keep(x)); gone = sorted(x for x in old - new if keep(x))
    print(f"{len(added)} new identifiers, {len(gone)} gone")
    if out:
        os.makedirs(out, exist_ok=True)
        open(os.path.join(out, "idents_new.txt"), "w").write("\n".join(added) + "\n")
        open(os.path.join(out, "idents_gone.txt"), "w").write("\n".join(gone) + "\n")
    if rx:
        print("new:", " ".join(x for x in added if rx.search(x)))
        print("gone:", " ".join(x for x in gone if rx.search(x)))

if __name__ == "__main__":
    main()
