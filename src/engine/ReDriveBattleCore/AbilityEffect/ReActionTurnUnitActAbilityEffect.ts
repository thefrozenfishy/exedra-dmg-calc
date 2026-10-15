// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { ReActionTurnUnitAct } from "../Act/ReActionTurnUnitAct";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { notPorted, orderByKeys } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.ReActionTurnUnitActAbilityEffect  (TypeDefIndex 1195, public class) ----
export class ReActionTurnUnitActAbilityEffect extends AbilityEffectBase {
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192C260  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x192BC40 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        // TargetUnitIdList.Select(targetUnitDic.GetValueOrDefault).Where(b__2_0).OrderByDescending(b__2_1).ThenBy(b__2_2)
        const units = this._TargetUnitIdList.map(id => targetUnitDic.get(id) ?? null).filter(unit => unit != null) as BattleUnit[]; // b__2_0: unit != null
        const ordered = orderByKeys(units, [
            [unit => unit.GetProcessedSpeed(), true], // b__2_1 (BattleUnit.GetProcessedSpeed inlined in the game)
            [unit => unit._PositionId, false],         // b__2_2
        ]);
        for (const unit of ordered) {
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = unit;
            if (!unit._Condition._CanNotUseSkill && !unit._BreakPoint.get_IsBreak()) {
                const team = unit._Team;
                const actReferee = gameDirector.turnActSystem.actReferee;
                const act = new ReActionTurnUnitAct().ctor();
                act.actUnitId = unit._Id;
                act.actUnitTeam = team;
                // ActReferee.AddAct(ActBase) inlined in the game (GetNewActId: ++lastActId)
                act.id = ++actReferee.lastActId;
                actReferee.AddActToListAndSort(act, false);
            }
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!;
        }
        return new AffectedUnitNoticeBundle().ctor();
    }
    /** @rva 0x192B6E0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list: BattleUnit[];
        if (this._EffectRange === -1) {
            list = [userUnit];
        } else {
            list = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__3_0
        }
        const actReferee = gameDirector.turnActSystem.actReferee; // <>c__DisplayClass3_0.actReferee
        list = list.filter(unit => !actReferee.HasUnitTargetActAllTime(ReActionTurnUnitAct, unit._Id)); // b__1
        return [...list];
    }
    /** @rva 0x192B930 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__4_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMaxAtk];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
}
