// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.DebugStatusEditRequest  (TypeDefIndex 832, public class) ----
export class DebugStatusEditRequest extends RequestBase {
    /** 0x10 public int UnitId */
    UnitId: int = 0;
    /** 0x14 public int Hp */
    Hp: int = 0;
    /** 0x18 public int Ep */
    Ep: int = 0;
    /** 0x1C public int Bp */
    Bp: int = 0;
    /** 0x20 public int BarrierEndurance */
    BarrierEndurance: int = 0;
    /** 0x24 public int ChargePoint */
    ChargePoint: int = 0;
    /** 0x28 public int Speed */
    Speed: int = 0;
    /** 0x2C public int Def */
    Def: int = 0;
    /** @rva 0x16CFCA0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 1001 as RequestType; /* asm: mov eax, 0x3e9; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
