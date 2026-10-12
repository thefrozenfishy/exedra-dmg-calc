// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
import { f32 } from "../../runtime";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";

// ---- ReDriveBattleCore.UnitState.UpBuffEffectValueUnitState  (TypeDefIndex 627, public class) ----
export class UpBuffEffectValueUnitState extends UpEffectValueUnitStateBase {
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B9DC0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x15CFE80 slot 27  public override float GetEffectValueVariationRate(UnitStateBase targetState) { } */
    GetEffectValueVariationRate(targetState: UnitStateBase): float { return notPorted("UpBuffEffectValueUnitState.GetEffectValueVariationRate", 0x15CFE80); }
    /** @rva 0x15CFC50 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        if (list.length > 0) list = list.filter(unit => unit._SkillSet.GetList().some(skill => skill.GetAbilityEffectList().some(effect => effect instanceof StateAbilityEffect && effect._GiveUnitState.get_Direction() === 0)) /* b__3_2, b__3_3 */); // b__3_1
        return list;
    }
    /** @rva 0x15CFED0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(UpBuffEffectValueUnitState.$GetUnitFilterFuncOrder$g__UnitFilterByRoleBufferAndMaxSpeed_4_0);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttacker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15D01C0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBufferAndMaxSpeed|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBufferAndMaxSpeed_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const units = candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(4 as TargetRoleType)); // <>c.b__4_1 (Buffer)
        return AISkillTargetSelector.UnitFilterWithMaxSpeed(units); // inlined in the game
    }
}
