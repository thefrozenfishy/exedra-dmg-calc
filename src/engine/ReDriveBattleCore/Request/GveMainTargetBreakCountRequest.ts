// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.GveMainTargetBreakCountRequest  (TypeDefIndex 835, public class) ----
export class GveMainTargetBreakCountRequest extends RequestBase {
    /** @rva 0xECE170 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 13 as RequestType; /* asm: mov eax, 0xd; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
