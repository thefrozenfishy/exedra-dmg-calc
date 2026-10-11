// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IAbnormalHitRateVariation } from "./IAbnormalHitRateVariation";
import type { IBuff } from "./IBuff";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpAbnormalHitRateUnitStateBase  (TypeDefIndex 743, public abstract class) ----
export abstract class UpAbnormalHitRateUnitStateBase extends ParameterVariationUnitStateBase {  // implements IAbnormalHitRateVariation, IBuff
    static readonly __interfaces: readonly string[] = ['IAbnormalHitRateVariation', 'IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16E0360 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_hit_rate";
    }
    /** @rva 0x16E0330 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva -1 slot 30  public abstract float GetAbnormalHitRateVariationValue(BattleUnit unit, float processingValue); */
    abstract GetAbnormalHitRateVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x16E0050 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpAbnormalHitRateUnitStateBase.GetUnitFilterFuncOrder", 0x16E0050); }
    /** @rva 0x16E0220  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterWithSkillOfAbnormalUnitState|11_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterWithSkillOfAbnormalUnitState_11_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("UpAbnormalHitRateUnitStateBase.<GetUnitFilterFuncOrder>g__UnitFilterWithSkillOfAbnormalUnitState|11_0", 0x16E0220); }
}
