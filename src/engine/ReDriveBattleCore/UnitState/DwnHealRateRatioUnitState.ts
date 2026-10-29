// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import  { RecoveryHpAbilityEffect } from "../AbilityEffect/RecoveryHpAbilityEffect";
import { f32, notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IHealRateVariation } from "./IHealRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";

// ---- ReDriveBattleCore.UnitState.DwnHealRateRatioUnitState  (TypeDefIndex 613, public class) ----
export class DwnHealRateRatioUnitState extends ParameterVariationUnitStateBase {  // implements IHealRateVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IHealRateVariation', 'IDebuff'];
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16E4670 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_heal";
    }
    /** @rva 0x16E4640 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x15CBE70  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16E4270 slot 29  public float GetHealRateVariationValue(float processingValue) { } */
    GetHealRateVariationValue(processingValue: float): float {
        return f32(f32(f32(this._UpdateableEffectValue / 10) * -processingValue) / 100);
    }
    /** @rva 0x16E4040 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__13_0
        if (list.length > 0) list = list.filter(unit => unit._SkillSet.GetList().some(skill => skill.GetAbilityEffectList().some(effect => effect instanceof RecoveryHpAbilityEffect)) /* b__13_2, b__13_3 */); // b__13_1
        return list;
    }
    /** @rva 0x16E42A0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        list.push(DwnHealRateRatioUnitState.$GetUnitFilterFuncOrder$g__UnitFilterByRoleHealerAndMaxHP_14_0);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16E4500  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleHealerAndMaxHP|14_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleHealerAndMaxHP_14_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const units = candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(3 as TargetRoleType)); // <>c.b__14_1 (Healer)
        return AISkillTargetSelector.UnitFilterWithMaxHP(units); // inlined in the game
    }
}
