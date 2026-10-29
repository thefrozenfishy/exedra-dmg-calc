// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { UniqueZoneUnitState } from "../UnitState/UniqueZoneUnitState";
import { Debug } from "../Debugging/Debug";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { clamp, dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.ConsumeZoneStackAbilityEffect  (TypeDefIndex 1240, public class) ----
export class ConsumeZoneStackAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int consumeZoneStack */
    consumeZoneStack: int = 0;
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1912AF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.consumeZoneStack = info._EffectValue1;
        return this;
    }
    /** @rva 0x1A0A230 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        // <>c__DisplayClass3_0 { targetUnitDic }
        if (origin !== 1) {
            Debug.onLogWarning("アクティブスキル以外でのフィールドスタックを減少できません"); // delegate invoked directly
        }
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const condition = targetUnit._Condition;
            if (condition._MaxZoneStack >= 1 && condition._ZoneStack >= 1) {
                condition._ZoneStack = clamp(condition._ZoneStack - this.consumeZoneStack, 0, condition._MaxZoneStack);
                if (targetUnit._Condition._ZoneStack === 0) {
                    targetUnit._Condition._ReleaseZoneUnitStatePatternMstId = targetUnit.GetUniqueZoneUnitStatePatternId();
                    ConsumeZoneStackAbilityEffect.$Triggering$g__RemoveAllZoneUnitState_3_0(targetUnitDic);
                    targetUnit._Condition._ZoneEffectId = -1;
                }
            }
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1A09F40 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        return targetUnitList.filter(unit => !unit.get_IsDead() && 0 < unit._Condition._MaxZoneStack && 0 < unit._Condition._ZoneStack); // <>c.b__4_0
    }
    /** @rva 0x1A0A070 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__5_0
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit([]));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x1A0A580  internal static void <Triggering>g__RemoveAllZoneUnitState|3_0(ref ConsumeZoneStackAbilityEffect.<>c__DisplayClass3_0 ) { } */
    static $Triggering$g__RemoveAllZoneUnitState_3_0(targetUnitDic: Dictionary<int, BattleUnit>): void {
        // ref <>c__DisplayClass3_0 (captures targetUnitDic)
        for (const unit of targetUnitDic.values()) unit._Condition.RemoveUnitState$BattleUnit_EffectOriginType(UniqueZoneUnitState, unit, 0 as EffectOriginType);
    }
}
