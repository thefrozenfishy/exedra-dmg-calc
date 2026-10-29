// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveStateAbilityEffectBase  (TypeDefIndex 1201, public abstract class) ----
export abstract class RemoveStateAbilityEffectBase extends AbilityEffectBase {
    /** protected const int RemoveAllNum */
    static readonly RemoveAllNum: int = 0;
    /** 0x60 protected int maxRemoveCount */
    maxRemoveCount: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x191E5D0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.maxRemoveCount = info._EffectValue1;
        return this;
    }
    /** @rva 0x191E1A0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            if (targetUnit == null || targetUnit.get_IsDead()) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const removable = targetUnit._Condition._StateList.filter(state => this.$Triggering$b__4_0(state)).reverse();
            const count = this.maxRemoveCount === 0 ? removable.length : this.maxRemoveCount;
            targetUnit._Condition.RemoveUnitState$BattleUnit_ListUnitStateBase(targetUnit, removable.slice(0, Math.max(0, count))); // Take(count).ToList()
            bundle.Add(AffectedUnitNotice.CreateByRemoveState(targetUnitId, this._TargetSide));
            const variation = targetUnit.UpdateTurnGaugeBySpeed();
            if (variation !== 0) bundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, variation));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva -1 slot 8  public abstract bool IsRemovable(UnitStateBase state); */
    abstract IsRemovable(state: UnitStateBase): boolean;
    /** @rva 0x191DD30 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list: BattleUnit[];
        if (this._EffectRange === -1) {
            list = this._TargetSide === 0 ? [userUnit] : [];
        } else {
            list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__6_0
        }
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__6_1(unit));
        return list;
    }
    /** @rva 0x191DF70 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMinHpRate];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(targetUnitList, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x191D5D0  private bool <Triggering>b__4_0(UnitStateBase state) { } */
    $Triggering$b__4_0(state: UnitStateBase): boolean { return this.IsRemovable(state); /* vslot 8 */ }
    /** @rva 0x191E520  private bool <GetAIFilteredTargets>b__6_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__6_1(unit: BattleUnit): boolean {
        return unit._Condition._StateList.some(state => this.$GetAIFilteredTargets$b__6_2(state));
    }
    /** @rva 0x191D5D0  private bool <GetAIFilteredTargets>b__6_2(UnitStateBase state) { } */
    $GetAIFilteredTargets$b__6_2(state: UnitStateBase): boolean { return this.IsRemovable(state); /* vslot 8 */ }
}
