// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.BeginWaveRequest  (TypeDefIndex 823, public class) ----
export class BeginWaveRequest extends RequestBase {
    /** @rva 0xD7AB50 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 4 as RequestType; /* asm: mov eax, 4; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
