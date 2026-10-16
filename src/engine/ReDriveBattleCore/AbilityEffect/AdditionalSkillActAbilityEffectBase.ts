// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AdditionalSkillAct } from "../Act/AdditionalSkillAct";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, newGuidKey, notPorted, orderByKeys } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { ActBase_Define } from "../Act/ActBase";
import { ActBase } from "../Act/ActBase";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalSkillActAbilityEffectBase  (TypeDefIndex 1135, public abstract class) ----
export abstract class AdditionalSkillActAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 public int skillMstId */
    skillMstId: int = 0;
    /** 0x64 private AdditionalSkillActAbilityEffectBase.AdditionalSkillTargetType additionalSkillTargetType */
    additionalSkillTargetType: AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType = 0 as AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType;
    /** 0x68 protected bool isForcedAct */
    isForcedAct: boolean = false;
    /** 0x6C protected int priority */
    priority: int = 0;
    /** @rva 0x1920B00  protected void .ctor() { } */
    ctor(): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor();
        return this;
    }
    /** @rva 0x1920A70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor$AbilityEffectInfo(info);
        this.skillMstId = info._EffectValue1;
        this.additionalSkillTargetType = info._EffectValue2 as AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType;
        return this;
    }
    /** @rva 0x1920100 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const dc = { userUnit, gameDirector, targetUnitDic }; // <>c__DisplayClass7_0 (struct, passed by ref)
        if (!this.isForcedAct) {
            if (userUnit._Condition._CanNotUseSkill) return null!;
            if (userUnit._BreakPoint.get_IsBreak()) return null!;
        }
        const actReferee = gameDirector.turnActSystem.actReferee;
        const acts: ActBase[] = [...actReferee.turnActHistory];
        acts.push(actReferee.currentAct);
        acts.push(...actReferee.actList);
        for (const act of acts) {
            if (act instanceof AdditionalSkillAct && act.skillMstId === this.skillMstId && act.actUnitId === userUnit._Id) return null!;
        }
        let targetUnitId = 0;
        let targetFriendUnitId = 0;
        if (this.additionalSkillTargetType === 1) { // CurrentActUnit
            const currentActUnitId = gameDirector.turnActSystem.actReferee.currentAct.actUnitId;
            targetFriendUnitId = currentActUnitId;
            if (dictGet(targetUnitDic, currentActUnitId)._Team === userUnit._Team) {
                targetUnitId = AdditionalSkillActAbilityEffectBase.$Triggering$g__GetSelectedTargetUnit_7_0(true, dc);
            } else {
                targetUnitId = currentActUnitId;
                targetFriendUnitId = AdditionalSkillActAbilityEffectBase.$Triggering$g__GetSelectedTargetUnit_7_0(false, dc);
            }
        } else if (this.additionalSkillTargetType === 2) { // SelectedTargetUnit
            targetUnitId = AdditionalSkillActAbilityEffectBase.$Triggering$g__GetSelectedTargetUnit_7_0(false, dc);
            targetFriendUnitId = AdditionalSkillActAbilityEffectBase.$Triggering$g__GetSelectedTargetUnit_7_0(true, dc);
        }
        const referee = gameDirector.turnActSystem.actReferee;
        const newAct = new AdditionalSkillAct().ctor();
        newAct.skillMstId = this.skillMstId;
        newAct.actUnitId = userUnit._Id;
        newAct.actUnitTeam = userUnit._Team;
        newAct.targetUnitId = targetUnitId;
        newAct.IsTargetingCurrentActUnit = this.additionalSkillTargetType === 1;
        newAct.targetFriendUnitId = targetFriendUnitId;
        newAct.IsForcedAct = this.isForcedAct;
        newAct.set_Priority(this.priority); // vslot 5
        // ActReferee.AddAct(ActBase) inlined in the game
        newAct.id = ++referee.lastActId;
        referee.AddActToListAndSort(newAct, false);
        return new AffectedUnitNoticeBundle().ctor();
    }
    /** @rva 0x1920670  internal static int <Triggering>g__GetSelectedTargetUnit|7_0(bool isFriendTarget, ref AdditionalSkillActAbilityEffectBase.<>c__DisplayClass7_0 ) { } */
    static $Triggering$g__GetSelectedTargetUnit_7_0(isFriendTarget: boolean, dc: { userUnit: BattleUnit; gameDirector: GameDirectorBase; targetUnitDic: Dictionary<int, BattleUnit> }): int {
        const referee = dc.gameDirector.targetReferee;
        let targetId: int;
        if (!isFriendTarget) targetId = dc.userUnit._Team === 0 ? referee.allyAttackTargetId : referee.enemyAttackTargetId;
        else targetId = dc.userUnit._Team === 0 ? referee.allyFriendTargetId : referee.enemyFriendTargetId;
        const selected = dc.targetUnitDic.get(targetId);
        if (selected !== undefined && !selected.get_IsDead()) return targetId;
        // <>c__DisplayClass7_1.team: the user's team for a friend target, the other team otherwise
        const team = (dc.userUnit._Team === 0 ? !isFriendTarget : isFriendTarget) ? 1 : 0;
        const candidates = [...dc.targetUnitDic.values()].filter(unit => unit._Team === team && !unit.get_IsDead()); // b__1
        const unit = orderByKeys(candidates, [[unit => unit._HP, false], [() => newGuidKey(), false]])[0] ?? null; // OrderBy(b__7_2 HP).ThenBy(b__7_3 Guid.NewGuid()).FirstOrDefault()
        return unit == null ? 0 : unit._Id;
    }
}

// ---- ReDriveBattleCore.AbilityEffect.AdditionalSkillActAbilityEffectBase.AdditionalSkillTargetType  (TypeDefIndex 1131, public enum) ----
export const AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType = {
    CurrentActUnit: 1,
    SelectedTargetUnit: 2,
} as const;
export type AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType = (typeof AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType)[keyof typeof AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType];
