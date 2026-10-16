// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import  { StateAbilityEffect } from "../AbilityEffect/StateAbilityEffect";
import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";

import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import type { IGiveSlipDamageVariation } from "./IGiveSlipDamageVariation";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpGiveSlipDamageUnitStateBase  (TypeDefIndex 786, public abstract class) ----
export abstract class UpGiveSlipDamageUnitStateBase extends UnitStateBase {  // implements IGiveSlipDamageVariation, IBuff, IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IGiveSlipDamageVariation', 'IBuff', 'IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get Addition(): AdditionType { return this.get_Addition(); }
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x170FE40 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_giv_dmg";
    }
    /** @rva 0x170FE10 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x7421D0 slot 25  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xC84590 slot 29  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC845A0 slot 30  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15E14E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x15DE3A0 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        // DamageBetterUnitStateBase.CanAddTo (0x15B8090)
        if (!targetUnit.IsMatch$TargetRoleType(this._TargetRole)) return false;
        return targetUnit.IsMatch$TargetElementType(this._TargetElement);
    }
    /** @rva 0x170F700 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__15_0
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__15_1(unit));
        return list;
    }
    /** @rva 0x170F8C0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleDebuffer);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva -1 slot 31  public abstract bool IsTarget(UnitStateBase state); */
    abstract IsTarget(state: UnitStateBase): boolean;
    /** @rva -1 slot 32  public abstract Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue); */
    abstract GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal;
    /** @rva 0x170FC20  private bool <GetAIFilteredTargets>b__15_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__15_1(unit: BattleUnit): boolean {
        return unit._SkillSet.GetList().some(skill => this.$GetAIFilteredTargets$b__15_2(skill));
    }
    /** @rva 0x170FCD0  private bool <GetAIFilteredTargets>b__15_2(ActiveSkillBase skill) { } */
    $GetAIFilteredTargets$b__15_2(skill: ActiveSkillBase): boolean {
        return skill.GetAbilityEffectList().some(effect => this.$GetAIFilteredTargets$b__15_3(effect));
    }
    /** @rva 0x170FD80  private bool <GetAIFilteredTargets>b__15_3(AbilityEffectBase effect) { } */
    $GetAIFilteredTargets$b__15_3(effect: AbilityEffectBase): boolean {
        return effect instanceof StateAbilityEffect && this.IsTarget(effect._GiveUnitState); // vslot 31
    }
}
