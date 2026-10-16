// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import  { StateAbilityEffect } from "../AbilityEffect/StateAbilityEffect";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { UnitStateBase } from "./UnitStateBase";
import { UpEffectValueUnitStateBase } from "./UpEffectValueUnitStateBase";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpDebuffEffectValueUnitState  (TypeDefIndex 629, public class) ----
export class UpDebuffEffectValueUnitState extends UpEffectValueUnitStateBase {
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16F8AE0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x170D280 slot 27  public override float GetEffectValueVariationRate(UnitStateBase targetState) { } */
    GetEffectValueVariationRate(targetState: UnitStateBase): float {
        if (targetState.get_Direction() === 1) return f32(this._UpRatio / 100);
        return 0;
    }
    /** @rva 0x170D050 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        if (list.length > 0) list = list.filter(unit => unit._SkillSet.GetList().some(skill => skill.GetAbilityEffectList().some(effect => effect instanceof StateAbilityEffect && effect._GiveUnitState.get_Direction() === 1)) /* b__3_2, b__3_3 */); // b__3_1
        return list;
    }
    /** @rva 0x170D2E0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(UpDebuffEffectValueUnitState.$GetUnitFilterFuncOrder$g__UnitFilterByRoleDebufferAndMaxSpeed_4_0);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x170D540  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleDebufferAndMaxSpeed|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleDebufferAndMaxSpeed_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const units = candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(5 as TargetRoleType)); // <>c.b__4_1 (Debuffer)
        return AISkillTargetSelector.UnitFilterWithMaxSpeed(units); // inlined in the game
    }
}
