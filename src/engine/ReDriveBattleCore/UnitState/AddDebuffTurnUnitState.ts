// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AbnormalUnitStateBase } from "./AbnormalUnitStateBase";
import { UnableActionUnitStateBase } from "./UnableActionUnitStateBase";
import { StateAbilityEffect } from "../AbilityEffect/StateAbilityEffect";
import { isImpl, notPorted } from "../../runtime";
import type { IEnumerable, List } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { AddTurnUnitStateBase } from "./AddTurnUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.AddDebuffTurnUnitState  (TypeDefIndex 527, public class) ----
export class AddDebuffTurnUnitState extends AddTurnUnitStateBase {
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B3FF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._AddTurnNum = info._EffectValue1;
        return this;
    }
    /** @rva 0x15B4030 slot 26  public override void AddTurnTo(UnitStateBase targetUnitState) { } */
    AddTurnTo(targetUnitState: UnitStateBase): void {
        if (targetUnitState instanceof UnableActionUnitStateBase || targetUnitState instanceof AddTurnUnitStateBase) return;
        if (isImpl(targetUnitState, "IDebuff") || targetUnitState instanceof AbnormalUnitStateBase) targetUnitState.AddEffectTurn(this._AddTurnNum);
    }
    /** @rva 0x15B4150 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        if (list.length > 0) {
            list = list.filter(unit => unit._SkillSet.GetList().some(skill => // <>c.b__3_1
                skill.GetAbilityEffectList().some(effect => { // <>c.b__3_2
                    if (!(effect instanceof StateAbilityEffect)) return false; // <>c.b__3_3
                    const state = effect._GiveUnitState;
                    return isImpl(state, "IDebuff") || state instanceof AbnormalUnitStateBase;
                })));
        }
        return list;
    }
    /** @rva 0x15B4380 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleDebuffer);
        list.push(AISkillTargetSelector.UnitFilterWithMaxSpeed);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
