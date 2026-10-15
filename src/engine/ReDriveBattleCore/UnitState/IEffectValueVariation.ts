// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { float } from "../../runtime";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.IEffectValueVariation  (TypeDefIndex 703, public interface) ----
export interface IEffectValueVariation {
    /** @rva -1 slot 0  public abstract float GetEffectValueVariationRate(UnitStateBase targetState); */
    GetEffectValueVariationRate(targetState: UnitStateBase): float;
}
