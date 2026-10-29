// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.CountPointVariationAbilityEffectBase  (TypeDefIndex 1165, public abstract class) ----
export abstract class CountPointVariationAbilityEffectBase extends AbilityEffectBase {
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19137F0  protected void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva -1 slot 8  protected abstract int GetModifyCountPoint(); */
    abstract GetModifyCountPoint(): int;
    /** @rva 0x19135D0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            targetUnit._Condition.TryModifyCountPointBy(this.GetModifyCountPoint()); // vslot 8 (evaluated before the Condition read)
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva 0x19132C0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__4_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMaxAtk];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
}
