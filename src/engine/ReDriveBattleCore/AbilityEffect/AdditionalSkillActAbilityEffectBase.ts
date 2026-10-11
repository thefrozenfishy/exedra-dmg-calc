// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { ActBase_Define } from "../Act/ActBase";

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
    /** @rva 0x18EB0C0  protected void .ctor() { } */
    ctor(): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor();
        return this;
    }
    /** @rva 0x18EB030  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.priority = ActBase_Define.AdditionalSkillDefaultPriority;
        super.ctor$AbilityEffectInfo(info);
        this.skillMstId = info._EffectValue1;
        this.additionalSkillTargetType = info._EffectValue2 as AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType;
        return this;
    }
    /** @rva 0x18EA740 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("AdditionalSkillActAbilityEffectBase.Triggering", 0x18EA740); }
    /** @rva 0x18EAC30  internal static int <Triggering>g__GetSelectedTargetUnit|7_0(bool isFriendTarget, ref AdditionalSkillActAbilityEffectBase.<>c__DisplayClass7_0 ) { } */
    static $Triggering$g__GetSelectedTargetUnit_7_0(isFriendTarget: boolean, AdditionalSkillActAbilityEffectBase$c__DisplayClass7_0: any /*  */): int { return notPorted("AdditionalSkillActAbilityEffectBase.<Triggering>g__GetSelectedTargetUnit|7_0", 0x18EAC30); }
}

// ---- ReDriveBattleCore.AbilityEffect.AdditionalSkillActAbilityEffectBase.AdditionalSkillTargetType  (TypeDefIndex 1131, public enum) ----
export const AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType = {
    CurrentActUnit: 1,
    SelectedTargetUnit: 2,
} as const;
export type AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType = (typeof AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType)[keyof typeof AdditionalSkillActAbilityEffectBase_AdditionalSkillTargetType];
