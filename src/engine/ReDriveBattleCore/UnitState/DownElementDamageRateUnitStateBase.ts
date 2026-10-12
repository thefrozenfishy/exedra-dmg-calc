// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IElementDamageRateVariation } from "./IElementDamageRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DownElementDamageRateUnitStateBase  (TypeDefIndex 599, public abstract class) ----
export abstract class DownElementDamageRateUnitStateBase extends ParameterVariationUnitStateBase {  // implements IElementDamageRateVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IElementDamageRateVariation', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BA2F0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_giv_dmg";
    }
    /** @rva 0x15BA2C0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15B9E40 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        // DownElementDamageRateUnitStateBase.CanAddTo (0x15B9E40)
        return targetUnit.IsMatch$TargetRoleType(this._TargetRole);
    }
    /** @rva -1 slot 30  public abstract Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement); */
    abstract GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal;
    /** @rva 0x15B9E70 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        list.push(this.$GetUnitFilterFuncOrder$g__UnitFilterMatchElement_12_0.bind(this));
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15BA230  private IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterMatchElement|12_0(IEnumerable<BattleUnit> candidateUnits) { } */
    $GetUnitFilterFuncOrder$g__UnitFilterMatchElement_12_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        return candidateUnits.filter(unit => this.$GetUnitFilterFuncOrder$b__12_1(unit));
    }
    /** @rva 0x15BA200  private bool <GetUnitFilterFuncOrder>b__12_1(BattleUnit unit) { } */
    $GetUnitFilterFuncOrder$b__12_1(unit: BattleUnit): boolean {
        return unit.IsMatch$TargetElementType(this._TargetElement); // BattleUnit.IsMatch inlined in the game
    }
}
