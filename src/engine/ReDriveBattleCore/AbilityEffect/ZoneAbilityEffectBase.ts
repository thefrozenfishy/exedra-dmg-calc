// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AbilityEffect.ZoneAbilityEffectBase  (TypeDefIndex 1228, public abstract class) ----
export abstract class ZoneAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 protected int zoneUnitStatePatternId */
    zoneUnitStatePatternId: int = 0;
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192EA40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.zoneUnitStatePatternId = info._EffectValue1;
        return this;
    }
    /** @rva 0x1934590 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId: int = 0): void {
        this._TargetUnitIdList = [];
        this._TargetUnitIdList = [...targetUnitDic.values()].filter(unit => !unit.get_IsDead()).map(unit => unit._Id); // <>c.b__3_0, b__3_1
    }
    /** @rva 0x1934350  protected bool CanRemoveZone(BattleUnit targetUnit, int targetPatternId = 0) { } */
    CanRemoveZone(targetUnit: BattleUnit, targetPatternId: int = 0): boolean {
        if (targetUnit.get_IsDead()) return false;
        const condition = targetUnit._Condition;
        if (0 < condition._MaxZoneStack && 0 < condition._ZoneStack) {
            if (targetPatternId !== 0) return targetPatternId === targetUnit.GetUniqueZoneUnitStatePatternId();
            return true;
        }
        return false;
    }
    /** @rva 0x19343D0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__5_0
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit([]));
        if (unit != null) return unit._Id;
        return 0;
    }
}
