// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { LockTurnOrderUnitState } from "../UnitState/LockTurnOrderUnitState";
import { TurnReferee } from "../TurnReferee";
import { UnitTurnGauge } from "../UnitTurnGauge";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, f32, notPorted, ref } from "../../runtime";
import type { Dictionary, IEnumerable, List, float, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.HasteAbilityEffect  (TypeDefIndex 1224, public class) ----
export class HasteAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int hasteRate */
    hasteRate: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1912AF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.hasteRate = info._EffectValue1;
        return this;
    }
    /** @rva 0x1919780 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const nextTurnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
        if (!userUnit._Condition.TryGetUnitState(LockTurnOrderUnitState, ref<LockTurnOrderUnitState>(null!))) {
            for (const targetUnitId of this._TargetUnitIdList) {
                const targetUnit = dictGet(targetUnitDic, targetUnitId);
                userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
                const turnGaugeVariation = targetUnit._TurnGauge.SubtractGaugeValue(f32(f32(this.hasteRate) / 1000), nextTurnOrderPriority);
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByOneState(targetUnitId, "eff_cmn_act_buff_appear_001"));
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, turnGaugeVariation));
                userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1919320  public float GetResultGaugeValue(float gaugeValue, float speed) { } */
    GetResultGaugeValue(gaugeValue: float, speed: float): float {
        const num = f32(UnitTurnGauge.RawGaugeResetValue / speed);
        let result = f32(f32(num * f32(f32(-this.hasteRate) / 1000)) + gaugeValue);
        if (result <= 0) result = 0;
        return result;
    }
    /** @rva 0x1919080 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__5_0
        if (list.length > 0) {
            if (this._EffectRange === -1) list = [userUnit];
            list = list.filter(unit => 0 < unit._TurnGauge._GaugeValue); // <>c.b__5_1
        }
        return list;
    }
    /** @rva 0x19193E0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__6_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker, HasteAbilityEffect.$SelectTargetInAIAction$g__UnitFilterWithLastTurnOrder_6_1];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x1919A90  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterWithLastTurnOrder|6_1(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterWithLastTurnOrder_6_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const sorted = TurnReferee.SortByTurnOrder(candidateUnits);
        const battleUnit = sorted.length > 0 ? sorted[sorted.length - 1] : null; // LastOrDefault
        if (battleUnit == null) return []; // Array.Empty<BattleUnit>()
        return [battleUnit];
    }
}
