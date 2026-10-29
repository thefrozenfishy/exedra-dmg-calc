// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import type { IEffectHitRateVariation } from "./IEffectHitRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpEffectHitRateUnitStateBase  (TypeDefIndex 776, public abstract class) ----
export abstract class UpEffectHitRateUnitStateBase extends ParameterVariationUnitStateBase {  // implements IEffectHitRateVariation, IBuff
    static readonly __interfaces: readonly string[] = ['IEffectHitRateVariation', 'IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16F7E00 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_hit_rate";
    }
    /** @rva 0x16F7DD0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva -1 slot 30  public abstract float GetEffectHitRateVariationValue(BattleUnit unit, float processingValue); */
    abstract GetEffectHitRateVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x16F7990 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleDebuffer);
        list.push(UpEffectHitRateUnitStateBase.$GetUnitFilterFuncOrder$g__UnitFilterWithMaxEffectHitRate_11_0);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16F7BF0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterWithMaxEffectHitRate|11_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterWithMaxEffectHitRate_11_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        if (!(candidateUnits.length > 0)) return candidateUnits;
        const maxRate = Math.max(...candidateUnits.map(unit => unit.get_Param()._EffectHitRate)); // <>c.b__11_1
        return candidateUnits.filter(unit => unit.get_Param()._EffectHitRate === maxRate); // DisplayClass11_0.b__2
    }
}
