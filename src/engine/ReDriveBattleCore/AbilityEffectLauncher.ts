// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IAdditionalHpRecovery } from "./UnitState/IAdditionalHpRecovery";
import type { IAdditionalDamage } from "./UnitState/IAdditionalDamage";
import type { IActiveSkillInfo } from "./IActiveSkillInfo";
import { BattleDamageCalculator } from "./BattleDamageCalculator";
import { AffectedUnitNotice } from "./AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import { AbilityEffectFactory } from "./AbilityEffectFactory";
import { Decimal, dictGet, isImpl, notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { ActiveSkillBase } from "./ActiveSkillBase";

import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { ProcessTiming } from "./BattleCondition/ProcessTiming";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { EffectOriginType } from "./UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffectLauncher  (TypeDefIndex 280, public class) ----
export class AbilityEffectLauncher {
    /** 0x10 private List<AbilityEffectBase> <AbilityEffectList>k__BackingField */
    _AbilityEffectList: List<AbilityEffectBase> = null!;
    get AbilityEffectList(): List<AbilityEffectBase> { return this.get_AbilityEffectList(); }
    set AbilityEffectList(v: List<AbilityEffectBase>) { this.set_AbilityEffectList(v); }
    /** @rva 0x730C50  public List<AbilityEffectBase> get_AbilityEffectList() { } */
    get_AbilityEffectList(): List<AbilityEffectBase> { return this._AbilityEffectList; /* auto-property */ }
    /** @rva 0x730C60  public void set_AbilityEffectList(List<AbilityEffectBase> value) { } */
    set_AbilityEffectList(value: List<AbilityEffectBase>): void { this._AbilityEffectList = value; /* auto-property */ }
    /** @rva 0x1385930  protected void .ctor() { } */
    ctor(): this {
        this._AbilityEffectList = [];
        return this;
    }
    /** @rva 0x1385880  public void .ctor(List<AbilityEffectInfo> infoList, bool isIncludeDeadUnitInTarget = False) { } */
    ctor$ListAbilityEffectInfo_bool(infoList: List<AbilityEffectInfo>, isIncludeDeadUnitInTarget: boolean = false): this {
        this._AbilityEffectList = [];
        this.SetAbilityEffectList(infoList, isIncludeDeadUnitInTarget); // inlined
        return this;
    }
    /** @rva 0x13856C0  public void .ctor(List<AbilityEffectInfo> infoList, SkillType skillType, int skillMstId) { } */
    ctor$ListAbilityEffectInfo_SkillType_int(infoList: List<AbilityEffectInfo>, skillType: SkillType, skillMstId: int): this {
        this._AbilityEffectList = [];
        this.SetAbilityEffectList(infoList, false);
        for (const effect of this.AbilityEffectList) {
            if (isImpl(effect, "IActiveSkillInfo")) (effect as unknown as IActiveSkillInfo).SetActiveSkillInfo(skillType, skillMstId);
        }
        return this;
    }
    /** @rva 0x13846C0  private void SetAbilityEffectList(List<AbilityEffectInfo> infoList, bool isIncludeDeadUnitInTarget = False) { } */
    SetAbilityEffectList(infoList: List<AbilityEffectInfo>, isIncludeDeadUnitInTarget: boolean = false): void {
        if (infoList == null) return;
        for (const info of infoList) {
            const effect = AbilityEffectFactory.Create(info, isIncludeDeadUnitInTarget);
            if (effect == null) continue;
            this.AbilityEffectList.push(effect);
        }
    }
    /** @rva 0x1384840  public AffectedUnitNoticeBundle Triggering(ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector, ActiveSkillBase triggeringSkill, int attackTargetId = 0, int selectFriendUnitId = 0) { } */
    Triggering$9(startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase, triggeringSkill: ActiveSkillBase, attackTargetId: int = 0, selectFriendUnitId: int = 0): AffectedUnitNoticeBundle {
        return AbilityEffectLauncher.Triggering$10(this.AbilityEffectList, startTiming, conditionCheckDataBundle, origin, userUnit, targetUnitDic, gameDirector, triggeringSkill, attackTargetId, selectFriendUnitId); // tail call
    }
    /** @rva 0x1384860  public static AffectedUnitNoticeBundle Triggering(List<AbilityEffectBase> abilityEffectList, ProcessTiming startTiming, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector, ActiveSkillBase triggeringSkill, int attackTargetId = 0, int selectFriendUnitId = 0) { } */
    static Triggering$10(abilityEffectList: List<AbilityEffectBase>, startTiming: ProcessTiming, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase, triggeringSkill: ActiveSkillBase, attackTargetId: int = 0, selectFriendUnitId: int = 0): AffectedUnitNoticeBundle {
        let noticeBundle = new AffectedUnitNoticeBundle().ctor();
        const effectList = abilityEffectList.filter(effect => // DisplayClass9_0 <Triggering>b__0
            (startTiming === 0 || effect.StartTimings.includes(startTiming)) && effect.CheckStartConditionSets(conditionCheckDataBundle));
        for (const effect of effectList) {
            effect.SelectTargets(userUnit, targetUnitDic, selectFriendUnitId, attackTargetId);
            effect.SelectTargetsConditionCheck(targetUnitDic, conditionCheckDataBundle);
        }
        if (triggeringSkill != null) {
            for (const unit of gameDirector.get_battleUnitDic().values()) {
                unit.activeConditionCheckDataBundle._ActorUnit = userUnit;
                unit.activeConditionCheckDataBundle._MainTargetUnit = dictGet(targetUnitDic, attackTargetId);
                unit.activeConditionCheckDataBundle._ActorActiveSkill = triggeringSkill;
            }
        }
        for (const effect of effectList) {
            for (const unit of gameDirector.get_battleUnitDic().values()) unit.activeConditionCheckDataBundle._ActorAbilityEffect = effect;
            const notice = effect.Triggering(origin, userUnit, targetUnitDic, gameDirector);
            if (notice != null) noticeBundle = AffectedUnitNoticeBundle.op_Addition(noticeBundle, notice);
            for (const unit of gameDirector.get_battleUnitDic().values()) unit.activeConditionCheckDataBundle._ActorAbilityEffect = null!;
        }
        if (origin === 1 && triggeringSkill != null) {
            let additionalBundle = new AffectedUnitNoticeBundle().ctor();
            const additionalDamages = userUnit.Condition.StateList
                .filter(state => isImpl(state, "IAdditionalDamage") && state.IsActive$BattleUnit(userUnit)) // DisplayClass9_0 <Triggering>b__1
                .map(state => state as unknown as IAdditionalDamage);                                        // <Triggering>b__9_2
            for (const additionalDamage of additionalDamages) {
                const result = additionalDamage.GetAdditionalDamageResult(userUnit, triggeringSkill, noticeBundle, gameDirector);
                if (result != null) additionalBundle = AffectedUnitNoticeBundle.op_Addition(additionalBundle, result);
            }
            if ([...additionalBundle.noticeDic.values()].length > 0) noticeBundle = AffectedUnitNoticeBundle.op_Addition(noticeBundle, additionalBundle);
            const recovery = AbilityEffectLauncher.GetAdditionalRecoveryResult(userUnit, noticeBundle, gameDirector);
            if (recovery != null) noticeBundle.Add(recovery);
            const finalBundle = BattleDamageCalculator.CalcFinalDamageNoticeBundle(userUnit, noticeBundle, gameDirector);
            if (finalBundle != null && [...finalBundle.noticeDic.values()].length > 0) noticeBundle = AffectedUnitNoticeBundle.op_Addition(noticeBundle, finalBundle);
        }
        if (gameDirector != null) {
            for (const unit of gameDirector.get_battleUnitDic().values()) unit.activeConditionCheckDataBundle.RemoveTransientData();
        }
        return noticeBundle;
    }
    /** @rva 0x1384280  private static AffectedUnitNotice GetAdditionalRecoveryResult(BattleUnit userUnit, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    static GetAdditionalRecoveryResult(userUnit: BattleUnit, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNotice {
        let value: Decimal = Decimal.Zero;
        for (const state of userUnit.Condition.StateList) {
            if (!isImpl(state, "IAdditionalHpRecovery")) continue;
            if (state.IsActive$BattleUnit(userUnit))
                value = value.add((state as unknown as IAdditionalHpRecovery).GetAdditionalHpRecoveryValue(userUnit, noticeBundle, gameDirector));
        }
        if (value.le(Decimal.Zero)) return null!;
        const hp = userUnit.HP;
        userUnit.AddHP(Math.max(0, value.ceiling().toInt()));
        const notice = new AffectedUnitNotice().ctor$int(userUnit.Id);
        notice._RecoveryValue = userUnit.HP - hp;
        notice._IsReceivedRecovery = true;
        notice._IsRevived = false;
        notice.NonDamageVisualEffectList.push("eff_cmn_act_recovery_appear_001");
        return notice;
    }
}
