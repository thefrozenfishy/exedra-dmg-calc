#!/usr/bin/env python3
"""disasm - x86-64 disassembly of one function of GameAssembly.unpack.dll (needs `pip install capstone`).

Use it when Ghidra's C output is incomplete. Typical case: a function returning float/double shows as `void` (the
XMM0 return is dropped), e.g. ReceiveSlipDamageUnitStateBase.GetSlipDamageValue 0x15bf670 hid the
`imul ebx, [rdi+0x3c]` (x RemainingTurn) on its isImmediately path.

  python3 scripts/ai/disasm.py 0x15bf670 [--ver 3.19.0] [--max 400]
Stops at the first `ret` (pass --all to keep going for --max bytes). Calls are annotated with `xq rva` names.
"""
import os, sys, struct, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))




def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__); return
    rva = int(a[0], 16)
    ver = a[a.index("--ver") + 1] if "--ver" in a else os.environ.get("XQ_GAME_VER", "3.19.0")
    mx = int(a[a.index("--max") + 1]) if "--max" in a else 400
    unpacked = os.environ.get("XQ_UNPACKED") or os.path.join(os.path.dirname(os.path.dirname(HERE)), "..", "unpackedExedra")
    dll = os.path.join(unpacked, ver, "GameAssembly.unpack.dll")
    try:
        import capstone
    except ImportError:
        sys.exit("pip install capstone   (the VM has pip; ~10 s)")
    with open(dll, "rb") as f:
        d = f.read()
    pe = struct.unpack_from("<I", d, 0x3C)[0]; n = struct.unpack_from("<H", d, pe + 6)[0]; opt = struct.unpack_from("<H", d, pe + 20)[0]
    off = None; o = pe + 24 + opt
    for _ in range(n):
        vs, va, rs, ra = struct.unpack_from("<IIII", d, o + 8); o += 40
        if va <= rva < va + max(vs, rs):
            off = rva - va + ra
    if off is None:
        sys.exit("RVA not in any section")
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    base = 0x180000000
    for i in md.disasm(d[off:off + mx], base + rva):
        note = ""
        if i.mnemonic == "call" and i.op_str.startswith("0x"):
            t = int(i.op_str, 16) - base
            try:
                r = subprocess.run([sys.executable, os.path.join(HERE, "xq.py"), "rva", hex(t)], capture_output=True, text=True, timeout=60).stdout.strip().split("\n")[0]
                note = "   ; " + r[:150]
            except Exception:
                pass
        print(f"{i.address - base:#x}  {i.mnemonic:6} {i.op_str}{note}")
        if i.mnemonic == "ret" and "--all" not in a:
            break


if __name__ == "__main__":
    main()
