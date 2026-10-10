// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.IBlendable  (TypeDefIndex 700, public interface) ----
export interface IBlendable {
    /** @rva -1 slot 0  public abstract bool Blend(UnitStateBase injectUnitState); */
    Blend(injectUnitState: UnitStateBase): boolean;
}
