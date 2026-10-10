// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.ChangePauseStateRequest  (TypeDefIndex 826, public class) ----
export class ChangePauseStateRequest extends RequestBase {
    /** 0x10 public bool isPaused */
    isPaused: boolean = false;
    /** @rva 0x118F480 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 10 as RequestType; /* asm: mov eax, 0xa; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
