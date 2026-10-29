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
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.SlowAbilityEffect  (TypeDefIndex 1226, public class) ----
export class SlowAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int slowRate */
    slowRate: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1912D70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this.slowRate = info._EffectValue1;
        return this;
    }
    /** @rva 0x191F4C0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const nextTurnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
        if (!userUnit._Condition.TryGetUnitState(LockTurnOrderUnitState, ref<LockTurnOrderUnitState>(null!))) {
            for (const targetUnitId of this._TargetUnitIdList) {
                const targetUnit = dictGet(targetUnitDic, targetUnitId);
                userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
                const turnGaugeVariation = targetUnit._TurnGauge.AddGaugeValue(f32(f32(this.slowRate) / 1000), nextTurnOrderPriority);
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByOneState(targetUnitId, "eff_cmn_act_debuff_appear_001"));
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, turnGaugeVariation));
                userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x191F060  public float GetResultGaugeValue(float gaugeValue, float speed) { } */
    GetResultGaugeValue(gaugeValue: float, speed: float): float {
        const num = f32(f32(this.slowRate) / 1000);
        let result = f32(f32(f32(UnitTurnGauge.RawGaugeResetValue / speed) * num) + gaugeValue);
        if (result <= 0) result = 0;
        return result;
    }
    /** @rva 0x191F120 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__5_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterByBreak, SlowAbilityEffect.$SelectTargetInAIAction$g__UnitFilterWithFirstTurnOrder_5_1];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x191F7D0  internal static IEnumerable<BattleUnit> <SelectTargetInAIAction>g__UnitFilterWithFirstTurnOrder|5_1(IEnumerable<BattleUnit> candidateUnits) { } */
    static $SelectTargetInAIAction$g__UnitFilterWithFirstTurnOrder_5_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const sorted = TurnReferee.SortByTurnOrder(candidateUnits);
        const battleUnit = sorted.length > 0 ? sorted[0] : null; // FirstOrDefault
        if (battleUnit == null) return []; // Array.Empty<BattleUnit>()
        return [battleUnit];
    }
}
