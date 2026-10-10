// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { AbilityEffectBase_TargetSideType } from "./AbilityEffect/AbilityEffectBase";
import type { TargetReferee_TargetType } from "./TargetReferee";

// ---- ReDriveBattleCore.TargetTypeExtensions  (TypeDefIndex 464, public static class) ----
export class TargetTypeExtensions {
    /** @rva 0x15C0C50  public static AbilityEffectBase.TargetSideType ToTargetSideType(TargetReferee.TargetType targetType) { } */
    static ToTargetSideType(targetType: TargetReferee_TargetType): AbilityEffectBase_TargetSideType { return notPorted("TargetTypeExtensions.ToTargetSideType", 0x15C0C50); }
    /** @rva 0x15C0D00  public static TargetReferee.TargetType ToTargetType(AbilityEffectBase.TargetSideType targetSideType) { } */
    static ToTargetType(targetSideType: AbilityEffectBase_TargetSideType): TargetReferee_TargetType { return notPorted("TargetTypeExtensions.ToTargetType", 0x15C0D00); }
}
