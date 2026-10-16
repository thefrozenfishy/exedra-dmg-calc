// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../../runtime";
import type { int } from "../../../runtime";

// ---- Network.Definition.Battle.ValidTime  (TypeDefIndex 1300, public class) ----
export class ValidTime {
    /** public const int Minutes */
    static readonly Minutes: int = 1440;
    /** public const int EventEndMinutes */
    static readonly EventEndMinutes: int = 30;
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
