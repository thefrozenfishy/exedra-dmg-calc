// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UniqueZoneUnitState } from "../UnitState/UniqueZoneUnitState";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { ZoneAbilityEffectBase } from "./ZoneAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.ZoneReleaseAbilityEffect  (TypeDefIndex 1233, public class) ----
export class ZoneReleaseAbilityEffect extends ZoneAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19000A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.zoneUnitStatePatternId = info._EffectValue1;
        return this;
    }
    /** @rva 0x1906570 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            if (this.CanRemoveZone(targetUnit, this.zoneUnitStatePatternId)) { // inlined in the game
                targetUnit._Condition._ReleaseZoneUnitStatePatternMstId = targetUnit.GetUniqueZoneUnitStatePatternId();
                targetUnit._Condition._ZoneStack = 0;
                targetUnit._Condition._ZoneEffectId = -1;
                for (const unitId of this._TargetUnitIdList) {
                    const unit = dictGet(targetUnitDic, unitId);
                    unit._Condition.RemoveUnitState$BattleUnit_EffectOriginType(UniqueZoneUnitState, unit, 0 as EffectOriginType);
                }
            }
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1906370 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        const list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__3_0
        return list.filter(unit => unit._Condition._MaxZoneStack >= 1 && 0 < unit._Condition._ZoneStack); // <>c.b__3_1
    }
}
