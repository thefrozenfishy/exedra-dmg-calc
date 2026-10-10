// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable, int } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.DebugBreakEditRequest  (TypeDefIndex 828, public class) ----
export class DebugBreakEditRequest extends RequestBase {
    /** 0x10 public int UnitId */
    UnitId: int = 0;
    /** 0x14 public Nullable<int> PointValue */
    PointValue: Nullable<int> = null!;
    /** 0x1C public Nullable<int> BonusRate */
    BonusRate: Nullable<int> = null!;
    /** @rva 0x16CFC70 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 1003 as RequestType; /* asm: mov eax, 0x3eb; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
