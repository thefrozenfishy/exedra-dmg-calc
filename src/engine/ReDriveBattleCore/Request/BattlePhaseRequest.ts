// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Phase } from "../Command/Phase";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.BattlePhaseRequest  (TypeDefIndex 822, public class) ----
export class BattlePhaseRequest extends RequestBase {
    /** 0x10 public Phase phase */
    phase: Phase = 0 as Phase;
    /** 0x14 public bool isWin */
    isWin: boolean = false;
    /** @rva 0x7E1AD0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 2 as RequestType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
