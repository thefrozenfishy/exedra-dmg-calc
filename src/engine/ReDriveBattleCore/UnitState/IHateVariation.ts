// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.IHateVariation  (TypeDefIndex 726, public interface) ----
export interface IHateVariation {
    /** @rva -1 slot 0  public abstract int GetHateVariationWeight(); */
    GetHateVariationWeight(): int;
}
