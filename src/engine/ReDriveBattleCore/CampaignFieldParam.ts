// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UnitStateBase } from "./UnitState/UnitStateBase";
import { AbilityEffectInfo } from "./AbilityEffectInfo";
import { notPorted, runCctor } from "../runtime";
import type { int } from "../runtime";
import { FieldParamBase } from "./FieldParamBase";
import { AbilitySourceType } from "../Network/Definition/Battle/AbilitySourceType";
import { RangeType } from "../Network/Definition/Battle/RangeType";
import { TargetRoleType } from "../Network/Definition/Battle/TargetRoleType";
import { TargetElementType } from "../Network/Definition/Battle/TargetElementType";

// ---- ReDriveBattleCore.CampaignFieldParam  (TypeDefIndex 398, public class) ----
export class CampaignFieldParam extends FieldParamBase {
    /** @rva 0x14931E0  protected void .ctor() { } */
    ctor(): this {
        this.stateList = []; // FieldParamBase..ctor inlined
        return this;
    }
    /** @rva 0x14931F0  public void .ctor(int upDmgValue, int upBreakPointDmgValue) { } */
    ctor$int_int(upDmgValue: int, upBreakPointDmgValue: int): this {
        super.ctor();
        if (0 < upDmgValue) {
            this.AddUnitState(new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
                0, "CPN_UP_GIV_DMG_RATIO", 0 as TargetElementType, 0 as TargetRoleType, UnitStateBase.EffectTurnOfPermanent, 3 as RangeType, 100, upDmgValue,
                0, 0, 0, 0, 0, false, [], null!, null!, 5 as AbilitySourceType, 0));
        }
        if (0 < upBreakPointDmgValue) {
            this.AddUnitState(new AbilityEffectInfo().ctor$int_string_TargetElementType_TargetRoleType_int_RangeType_int_int_int_int_int_int_int_bool_ListProcessTiming_string_string_AbilitySourceType_int(
                0, "CPN_UP_GIV_BREAK_POINT_DMG_RATIO", 0 as TargetElementType, 0 as TargetRoleType, UnitStateBase.EffectTurnOfPermanent, 3 as RangeType, 100, upBreakPointDmgValue,
                0, 0, 0, 0, 0, false, [], null!, null!, 5 as AbilitySourceType, 0));
        }
        return this;
    }
}
