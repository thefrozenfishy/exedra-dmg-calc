// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilityEffectBase_TargetSideType } from "../AbilityEffect/AbilityEffectBase";

// ---- ReDriveBattleCore.UnitState.INeutralState  (TypeDefIndex 697, public interface) ----
export interface INeutralState {
    readonly TargetSide: AbilityEffectBase_TargetSideType;
    readonly DontRemoveOnPassiveSkillUserLeaveBattle: boolean; // virtual, default false (0x73C0C0)
    readonly DontRemoveOnUserUnitDeath?: boolean; // 3.24.0: virtual, default false (0x73C0C0, slot 2)
}
