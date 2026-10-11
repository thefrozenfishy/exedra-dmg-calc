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

// ---- ReDriveBattleCore.AbilityEffect.ZoneExpandAbilityEffect  (TypeDefIndex 1231, public class) ----
export class ZoneExpandAbilityEffect extends ZoneAbilityEffectBase {
    /** 0x68 protected int zoneEffectId */
    zoneEffectId: int = 0;
    /** @rva 0x1906360  protected void .ctor() { } */
    ctor(): this {
        this.zoneEffectId = -1;
        super.ctor();
        return this;
    }
    /** @rva 0x1906310  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.zoneEffectId = -1;
        super.ctor$AbilityEffectInfo(info);
        this.zoneUnitStatePatternId = info._EffectValue1;
        this.zoneEffectId = info._TargetElement;
        return this;
    }
    /** @rva 0x1905FF0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            if (userUnit._Id === targetUnitId) {
                const condition = targetUnit._Condition;
                if (condition._ZoneStack < 1) condition._ExpandZoneUnitStatePatternMstId = this.zoneUnitStatePatternId;
                targetUnit._Condition._ZoneStack = targetUnit._Condition._MaxZoneStack;
                targetUnit._Condition._ZoneEffectId = this.zoneEffectId;
            } else if (this.CanRemoveZone(targetUnit, 0)) { // inlined in the game
                targetUnit._Condition._ReleaseZoneUnitStatePatternMstId = targetUnit.GetUniqueZoneUnitStatePatternId();
                targetUnit._Condition._ZoneStack = 0;
                targetUnit._Condition._ZoneEffectId = -1;
            }
            targetUnit._Condition.RemoveUnitState$BattleUnit_EffectOriginType(UniqueZoneUnitState, targetUnit, 0 as EffectOriginType);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1905D50 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        // <>c__DisplayClass4_0 { gameDirector, userUnit }; g__CheckFriendZoneStack|0 inlined
        const list: List<BattleUnit> = [];
        const friends = [...gameDirector.get_battleUnitDic().values()].filter(unit => unit._Team === userUnit._Team && !unit.get_IsDead()); // DisplayClass4_0.b__1
        if (!friends.some(unit => unit._Condition._MaxZoneStack >= 1 && 1 < unit._Condition._ZoneStack)) list.push(userUnit); // <>c.b__4_2
        return list;
    }
}
