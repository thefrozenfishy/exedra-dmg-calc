// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";
import type { RangeType } from "../Network/Definition/Battle/RangeType";
import type { TargetRoleType } from "../Network/Definition/Battle/TargetRoleType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import { UnitStateBase } from "./UnitState/UnitStateBase";
import { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { int } from "../runtime";
import { FieldParamBase } from "./FieldParamBase";

// ---- ReDriveBattleCore.GveBreakBonusFieldParam  (TypeDefIndex 397, public class) ----
export class GveBreakBonusFieldParam extends FieldParamBase {
    /** @rva 0x14931E0  protected void .ctor() { } */
    ctor(): this {
        this.stateList = []; // FieldParamBase..ctor inlined (folded with CampaignFieldParam..ctor)
        return this;
    }
    /** @rva 0x149CFE0  public void .ctor(int upFinalGainEpRatioValue, int upFinalSpecialAttackGiveDamageRatioValue) { } */
    ctor$int_int(upFinalGainEpRatioValue: int, upFinalSpecialAttackGiveDamageRatioValue: int): this {
        super.ctor();
        this.AddUnitState(new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
            0, "GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO", 0 as TargetElementType, 0 as TargetRoleType, UnitStateBase.EffectTurnOfPermanent, 3 as RangeType, 100, upFinalSpecialAttackGiveDamageRatioValue,
            0, 0, 0, 0, 0, false, [], null!, null!, 5 as AbilitySourceType, 0));
        // second state: UnitStateFactory.Create + stateList.Add written out in the game (= AddUnitState)
        this.AddUnitState(new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
            0, "GVE_UP_FINAL_GAIN_EP_RATIO", 0 as TargetElementType, 0 as TargetRoleType, UnitStateBase.EffectTurnOfPermanent, 3 as RangeType, 100, upFinalGainEpRatioValue,
            0, 0, 0, 0, 0, false, [], null!, null!, 5 as AbilitySourceType, 0));
        return this;
    }
}
