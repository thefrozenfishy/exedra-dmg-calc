// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.RegisterSpecialAttackRequest  (TypeDefIndex 837, public class) ----
export class RegisterSpecialAttackRequest extends RequestBase {
    /** 0x10 public int battleUnitId */
    battleUnitId: int = 0;
    /** 0x14 public bool isRegister */
    isRegister: boolean = false;
    /** @rva 0xEE0BE0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 12 as RequestType; /* asm: mov eax, 0xc; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
