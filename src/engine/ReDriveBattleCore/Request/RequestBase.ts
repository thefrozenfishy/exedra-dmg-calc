// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.RequestBase  (TypeDefIndex 839, public abstract class) ----
export abstract class RequestBase {
    get RequestType(): RequestType { return this.get_RequestType(); }
    /** @rva -1 slot 4  public abstract RequestType get_RequestType(); */
    abstract get_RequestType(): RequestType;
    /** @rva 0x72F5E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
