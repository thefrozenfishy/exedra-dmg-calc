// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, notPorted } from "../../runtime";
import type { IEnumerable, List } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IDebuff } from "./IDebuff";
import type { IReceiveFinalDamage } from "./IReceiveFinalDamage";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.RcvFinalDamageUnitState  (TypeDefIndex 644, public class) ----
export class RcvFinalDamageUnitState extends UnitStateBase {  // implements IDebuff, IReceiveFinalDamage
    static readonly __interfaces: readonly string[] = ['IDebuff', 'IReceiveFinalDamage'];
    /** 0x88 private readonly Decimal damageRatio */
    damageRatio: Decimal = Decimal.Zero;
    get DamageRatio(): Decimal { return this.get_DamageRatio(); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16E9E70 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_element_damage";
    }
    /** @rva 0x16E9E40 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x16E9D90  public Decimal get_DamageRatio() { } */
    get_DamageRatio(): Decimal {
        return this.damageRatio.mul(Decimal.fromInt(100));
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16E9CB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.damageRatio = Decimal.fromInt(info._EffectValue1).div(Decimal.fromInt(1000));
        return this;
    }
    /** @rva 0x16E9A30 slot 25  public Decimal GetFinalDamageRatio(BattleUnit attacker) { } */
    GetFinalDamageRatio(attacker: BattleUnit): Decimal {
        if (attacker.IsMatch$TargetRoleType(this._TargetRole) && attacker.IsMatch$TargetElementType(this._TargetElement)) return this.damageRatio;
        return Decimal.Zero;
    }
    /** @rva 0x16E9830 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__12_0
        if (list.length > 0) list = list.filter(unit => !unit._Condition._StateList.some(state => state instanceof RcvFinalDamageUnitState && state._UserUnitId === userUnit._Id && (state._EffectTurn === UnitStateBase.EffectTurnOfPermanent || state._RemainingTurn > 1))); // DisplayClass12_0.b__1, b__2
        return list;
    }
    /** @rva 0x16E9AE0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
