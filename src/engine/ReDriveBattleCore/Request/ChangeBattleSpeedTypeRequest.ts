// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { BattleSpeedType } from "../BattleSpeedType";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.ChangeBattleSpeedTypeRequest  (TypeDefIndex 825, public class) ----
export class ChangeBattleSpeedTypeRequest extends RequestBase {
    /** 0x10 public BattleSpeedType battleSpeedType */
    battleSpeedType: BattleSpeedType = 0 as BattleSpeedType;
    /** @rva 0xDEFB50 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 9 as RequestType; /* asm: mov eax, 9; ret */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
