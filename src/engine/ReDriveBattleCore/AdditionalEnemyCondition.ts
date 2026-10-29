// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";

// ---- ReDriveBattleCore.AdditionalEnemyCondition  (TypeDefIndex 299, public abstract class) ----
export abstract class AdditionalEnemyCondition {
    get IsFulfill(): boolean { return this.get_IsFulfill(); }
    /** @rva -1 slot 4  public abstract bool get_IsFulfill(); */
    abstract get_IsFulfill(): boolean;
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
