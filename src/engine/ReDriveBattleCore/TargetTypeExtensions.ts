// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilityEffectBase_TargetSideType } from "./AbilityEffect/AbilityEffectBase";
import type { TargetReferee_TargetType } from "./TargetReferee";

// ---- ReDriveBattleCore.TargetTypeExtensions  (TypeDefIndex 464, public static class) ----
export class TargetTypeExtensions {
    /** @rva 0x15E6520  public static AbilityEffectBase.TargetSideType ToTargetSideType(TargetReferee.TargetType targetType) { } */
    static ToTargetSideType(targetType: TargetReferee_TargetType): AbilityEffectBase_TargetSideType {
        if (targetType === 0) return 1 as AbilityEffectBase_TargetSideType;
        if (targetType === 1) return 0 as AbilityEffectBase_TargetSideType;
        throw new RangeError(`ArgumentOutOfRangeException: targetType ${targetType}`);
    }
    /** @rva 0x15E65D0  public static TargetReferee.TargetType ToTargetType(AbilityEffectBase.TargetSideType targetSideType) { } */
    static ToTargetType(targetSideType: AbilityEffectBase_TargetSideType): TargetReferee_TargetType {
        if (targetSideType === 0) return 1 as TargetReferee_TargetType;
        if (targetSideType === 1) return 0 as TargetReferee_TargetType;
        throw new RangeError(`ArgumentOutOfRangeException: targetSideType ${targetSideType}`);
    }
}
