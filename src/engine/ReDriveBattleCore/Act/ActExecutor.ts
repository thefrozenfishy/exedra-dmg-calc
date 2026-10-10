// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { ITurnEndTrigger } from "../UnitState/ITurnEndTrigger";
import { DamageCategory } from "../DamageCategory";
import { EffectOriginType } from "../UnitState/EffectOriginType";
import { ProcessTiming } from "../BattleCondition/ProcessTiming";
import { UnitStateBase_DirectionType } from "../UnitState/UnitStateBase";
import { LockTurnOrderUnitState } from "../UnitState/LockTurnOrderUnitState";
import { ContinuousRecoveryUnitState } from "../UnitState/ContinuousRecoveryUnitState";
import { ContinuousRecoveryInfo } from "../Command/ContinuousRecoveryInfo";
import { CommandExecuteModeChange } from "../Command/CommandExecuteModeChange";
import { CommandExecuteUnitHpGaugeRevive } from "../Command/CommandExecuteUnitHpGaugeRevive";
import { CommandSkill } from "../Command/CommandSkill";
import { CommandExecuteCommonAct } from "../Command/CommandExecuteCommonAct";
import { BattleUnit_TeamType } from "../BattleUnit";
import { SoloGameDirectorBase } from "../SoloGameDirectorBase";
import { SpecialAttack } from "../SpecialAttack";
import { ActiveSkill } from "../ActiveSkill";
import { NormalAttack } from "../NormalAttack";
import { AdditionalSkill } from "../AdditionalSkill";
import { EpCharger } from "../EpCharger";
import { PassiveSkill } from "../PassiveSkill";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { StartTimingAct } from "./StartTimingAct";
import { ModeChangeAct } from "./ModeChangeAct";
import { HpGaugeReviveAct } from "./HpGaugeReviveAct";
import { AdditionalSkillAct } from "./AdditionalSkillAct";
import { SpecialAttackAct } from "./SpecialAttackAct";
import { ComboTurnUnitAct } from "./ComboTurnUnitAct";
import { TurnUnitActBase } from "./TurnUnitActBase";
import { TurnUnitAct } from "./TurnUnitAct";
import { TurnEndAct } from "./TurnEndAct";
import { TurnBeginAct } from "./TurnBeginAct";
import { Decimal, GameRandom, f32, isImpl, notPorted, ref } from "../../runtime";
import type { int } from "../../runtime";
import type { ActBase } from "./ActBase";

import type { BattleUnit } from "../BattleUnit";
import type { CommandExecuteActBase } from "../Command/CommandExecuteActBase";

import type { GameDirectorBase } from "../GameDirectorBase";

// ---- ReDriveBattleCore.Act.ActExecutor  (TypeDefIndex 1119, public static class) ----
export class ActExecutor {
    /** @rva 0x17E1060  public static CommandExecuteActBase Execute(ActBase act, GameDirectorBase gameDirector) { } */
    static Execute(act: ActBase, gameDirector: GameDirectorBase): CommandExecuteActBase {
        const teamTargetUnitId = gameDirector.GetTeamTargetUnitIdOfUnit$int(act.actUnitId);
        if (act instanceof TurnBeginAct) return ActExecutor.TurnBegin(act, gameDirector);
        if (act instanceof TurnEndAct) return ActExecutor.TurnEnd(act, gameDirector);
        if (act instanceof TurnUnitActBase) {
            if (act instanceof TurnUnitAct) ActExecutor.ResetTurnGaugeBeforeTurnUnitActExecute(act, gameDirector); // inlined in the game
            return ActExecutor.ExecuteSkill(gameDirector, act.actUnitId, act.skillMstId, teamTargetUnitId, act.targetFriendUnitId, false);
        }
        if (act instanceof SpecialAttackAct) {
            const specialAttack = gameDirector.battleUnitDic.get(act.actUnitId)!.SpecialAttack;
            return ActExecutor.ExecuteSkill(gameDirector, act.actUnitId, specialAttack.Id, teamTargetUnitId, act.targetFriendUnitId, false);
        }
        if (act instanceof AdditionalSkillAct) {
            return ActExecutor.ExecuteSkill(gameDirector, act.actUnitId, act.skillMstId, act.targetUnitId, act.targetFriendUnitId, act.IsForcedAct);
        }
        if (act instanceof HpGaugeReviveAct) return ActExecutor.ExecuteHpGaugeRevive(gameDirector, act.actUnitId);
        if (act instanceof ModeChangeAct) return ActExecutor.ExecuteModeChange(gameDirector, act.actUnitId);
        if (act instanceof StartTimingAct) {
            return ActExecutor.ExecuteSkill(gameDirector, act.actUnitId, act.skillMstId, teamTargetUnitId, act.targetFriendUnitId, false);
        }
        return null!;
    }
    /** @rva 0x17E27A0  public static ActExecutor.ValidateActionType ValidateCanExecuteAct(ActBase act, GameDirectorBase gameDirector) { } */
    static ValidateCanExecuteAct(act: ActBase, gameDirector: GameDirectorBase): ActExecutor_ValidateActionType {
        const unit = gameDirector.GetTargetBattleUnit(act.actUnitId);
        const turnUnitAct = act instanceof TurnUnitActBase ? act : null;
        if (turnUnitAct != null) {
            const spReferee = gameDirector.spReferee;
            if (unit.Condition.CanNotAction) return ActExecutor_ValidateActionType.FailAndSkip;
            if (unit.BreakPoint.IsBreak) return ActExecutor_ValidateActionType.FailAndSkip;
            if (unit.Condition.CanNotUseSkill && unit.IsEnemy) return ActExecutor_ValidateActionType.FailAndSkip;
            if (!turnUnitAct.IsDecided) return ActExecutor_ValidateActionType.FailAndDecide;
            // <ValidateCanExecuteAct>b__0 0x130f270
            const skill = unit.ActiveSkills.find(s => s.Id === turnUnitAct.skillMstId) ?? null;
            if (skill == null) return ActExecutor_ValidateActionType.Success;
            if (!unit.Condition.CanNotUseSkill && skill.ConsumeSP <= spReferee.GetSp(unit.Team)) return ActExecutor_ValidateActionType.Success;
            return ActExecutor_ValidateActionType.FailAndDecide;
        }
        if (act instanceof SpecialAttackAct) {
            if (unit.Condition.CanNotAction) return ActExecutor_ValidateActionType.FailAndSkip;
            if (unit.Condition.CanNotUseSkill) return ActExecutor_ValidateActionType.FailAndSkip;
            if (!unit.IsSpecialAttackPointMax()) return ActExecutor_ValidateActionType.FailAndSkip;
            if (unit.Condition.CanNotUseSpecialAttack) return ActExecutor_ValidateActionType.FailAndSkip;
            if (unit.BreakPoint.IsBreak) return ActExecutor_ValidateActionType.FailAndSkip;
            return act.IsDecided ? ActExecutor_ValidateActionType.Success : ActExecutor_ValidateActionType.FailAndDecide;
        }
        if (act instanceof AdditionalSkillAct) {
            if (!unit.Condition.CanNotAction && !unit.BreakPoint.IsBreak) return ActExecutor_ValidateActionType.Success;
            return act.IsForcedAct ? ActExecutor_ValidateActionType.Success : ActExecutor_ValidateActionType.FailAndSkip;
        }
        return ActExecutor_ValidateActionType.Success;
    }
    /** @rva 0x17E1B30  public static CommandExecuteCommonAct TurnBegin(TurnBeginAct act, GameDirectorBase gameDirector) { } */
    static TurnBegin(act: TurnBeginAct, gameDirector: GameDirectorBase): CommandExecuteCommonAct {
        let bundle = new AffectedUnitNoticeBundle().ctor();
        const unit = gameDirector.battleUnitDic.get(act.actUnitId)!;
        let notice = new AffectedUnitNotice().ctor$int(unit.Id);
        gameDirector.turnActSystem.actReferee.turnActHistory.length = 0;
        unit.Condition.IsAdditionalTurnCoolTime = false;
        const continuousRecoveryInfo = ActExecutor.ContinuousRecoveryProcess(unit);
        // <TurnBegin>b__3_0 0x1903ad0: slip-damage states that do not skip the turn-begin tick
        const slipDamage = BattleDamageCalculator.GetSlipDamageResult(unit, gameDirector.battleUnitDic, gameDirector.BattleType,
            state => isImpl(state, "IReceiveSlipDamage") && !(state as any).SkipDamageOnTurnBegin, false);
        if (slipDamage != null) {
            unit.Attack(unit, slipDamage.GetTotalDamageValue(true), gameDirector);
            notice.IsDead = unit.IsDead;
            notice = AffectedUnitNotice.op_Addition(notice, slipDamage);
        }
        if (unit.BreakPoint.IsBreak && !unit.Condition.CanNotAction) {
            unit.BreakPoint.ResetValue();
            unit.BreakedDamageReceiveRate = 0; // field write in the game (BattleUnit+0x80)
            notice.IsResetBreakPoint = true;
        } else if (!unit.BreakPoint.IsBreak) {
            unit.BreakPoint.IncreaseValueByRatio(f32(unit.BattleParameter.BreakPointRecoveryPerTurn / 1000));
        }
        if (notice.Damages.length !== 0 || notice.IsResetBreakPoint || notice.NonDamageVisualEffectList.length > 0) bundle.Add(notice);
        const timingBundle = AffectedUnitNoticeBundle.op_Addition(new AffectedUnitNoticeBundle().ctor(), bundle);
        if (continuousRecoveryInfo != null) {
            timingBundle.Add(AffectedUnitNotice.CreateByRecovery(unit.Id, continuousRecoveryInfo.RecoveryValue, false));
        }
        bundle = AffectedUnitNoticeBundle.op_Addition(bundle,
            PassiveSkill.Triggering$6(gameDirector, ProcessTiming.TurnStart, unit, null!, null!, timingBundle));
        const noticeList = bundle.GetNoticeList();
        gameDirector.ActiveUnitList.forEach(u => u.UpdateParameter()); // <TurnBegin>b__3_1
        return CommandExecuteCommonAct.CreateByTurnBegin(act.actUnitId, noticeList, continuousRecoveryInfo, bundle.GainSoloRaidBuffPointNoticeList);
    }
    /** @rva 0x17E2160  private static CommandExecuteCommonAct TurnEnd(TurnEndAct act, GameDirectorBase gameDirector) { } */
    static TurnEnd(act: TurnEndAct, gameDirector: GameDirectorBase): CommandExecuteCommonAct {
        let bundle = PassiveSkill.Triggering$6(gameDirector, ProcessTiming.TurnEnd, gameDirector.battleUnitDic.get(act.actUnitId)!, null!, null!, null!);
        const unit = gameDirector.battleUnitDic.get(act.actUnitId)!;
        const wasCanNotAction = unit.Condition.CanNotAction;
        const lockState = ref<LockTurnOrderUnitState>(null!);
        let hadLockTurnOrder = false;
        if (unit.Condition.TryGetUnitState(LockTurnOrderUnitState, lockState)) hadLockTurnOrder = !lockState.v.ShouldBeRemovedNow;
        for (const state of unit.Condition.StateList) {
            if (isImpl(state, "ITurnEndTrigger") && state.IsActive$BattleUnit(unit)) {
                bundle = AffectedUnitNoticeBundle.op_Addition(bundle, (state as unknown as ITurnEndTrigger).TriggeringAtTurnEnd(unit, gameDirector));
            }
        }
        unit.Condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state.ShouldBeRemovedNow); // <TurnEnd>b__4_0
        unit.PassingTurn(1);
        const notice = new AffectedUnitNotice().ctor$int(act.actUnitId);
        notice.CanNotAction = unit.Condition.CanNotAction;
        notice.FinishCanNotAction = wasCanNotAction ? !unit.Condition.CanNotAction : false;
        notice.FinishLockTurnOrder = hadLockTurnOrder ? !unit.Condition.TryGetUnitState(LockTurnOrderUnitState, ref<LockTurnOrderUnitState>(null!)) : false;
        if (notice.CanNotAction || notice.FinishCanNotAction || notice.FinishLockTurnOrder || notice.NonDamageVisualEffectList.length > 0) bundle.Add(notice);
        const noticeList = bundle.GetNoticeList();
        gameDirector.ActiveUnitList.forEach(u => u.UpdateParameter()); // <TurnEnd>b__4_1
        return CommandExecuteCommonAct.CreateByTurnEnd(act.actUnitId, noticeList);
    }
    /** @rva 0x17E1A70  public static void ResetTurnGaugeBeforeTurnUnitActExecute(TurnUnitAct act, GameDirectorBase gameDirector) { } */
    static ResetTurnGaugeBeforeTurnUnitActExecute(act: TurnUnitAct, gameDirector: GameDirectorBase): void {
        if (act instanceof ComboTurnUnitAct && act.ActionStep >= 2) return; // only the first combo step resets the gauge
        const unit = gameDirector.battleUnitDic.get(act.actUnitId)!;
        unit.TurnGauge.Reset(unit);
    }
    /** @rva 0x17DFEC0  private static CommandExecuteActBase ExecuteSkill(GameDirectorBase gameDirector, int unitId, int skillMstId, int targetUnitId, int selectFriendUnitId = 0, bool isForcedAct = False) { } */
    static ExecuteSkill(gameDirector: GameDirectorBase, unitId: int, skillMstId: int, targetUnitId: int, selectFriendUnitId: int = 0, isForcedAct: boolean = false): CommandExecuteActBase {
        const spReferee = gameDirector.spReferee;
        const unit = gameDirector.battleUnitDic.get(unitId)!;
        if ((unit.Condition.CanNotAction || unit.BreakPoint.IsBreak) && !isForcedAct) return CommandExecuteCommonAct.CreateNoAct(unitId);
        const skill = unit.SkillSet.GetSkill(skillMstId);
        if (skill == null) return CommandExecuteCommonAct.CreateNoAct(unitId);
        if (skill instanceof AdditionalSkill) {
            // a follow-up aimed at a unit that died meanwhile retargets a random living unit of that team (b__6_2..5 = !IsDead)
            const target = gameDirector.GetTargetBattleUnit(targetUnitId);
            if (target != null && target.IsDead) {
                const pool = (target.Team === BattleUnit_TeamType.Ally ? gameDirector.AllyUnitList : gameDirector.EnemyUnitList).filter(u => !u.IsDead);
                const random = IEnumerableExtension_Random(pool);
                if (random == null) return CommandExecuteCommonAct.CreateNoAct(unitId);
                targetUnitId = random.Id;
            }
            const friend = gameDirector.GetTargetBattleUnit(selectFriendUnitId);
            if (friend != null && friend.IsDead) {
                const pool = (friend.Team === BattleUnit_TeamType.Ally ? gameDirector.AllyUnitList : gameDirector.EnemyUnitList).filter(u => !u.IsDead);
                const random = IEnumerableExtension_Random(pool);
                if (random == null) return CommandExecuteCommonAct.CreateNoAct(unitId);
                selectFriendUnitId = random.Id;
            }
        }
        let bundle = skill.Execute(gameDirector, targetUnitId, unit, selectFriendUnitId, isForcedAct);
        if (bundle == null) return CommandExecuteCommonAct.CreateNoAct(unitId);
        const spBeforePassive = spReferee.GetSp(unit.Team);
        const mainTarget = gameDirector.GetTargetBattleUnit(targetUnitId);
        bundle = AffectedUnitNoticeBundle.op_Addition(bundle,
            PassiveSkill.Triggering$6(gameDirector, ProcessTiming.AttackEnd, unit, mainTarget, skill, bundle));
        gameDirector.turnActSystem.AddActOnSkillEnd(gameDirector, unit, mainTarget, skill, bundle);
        // b__6_6: received the attack and died -> EP for the defeat
        for (const n of bundle.GetNoticeList().filter(n => n.IsReceivedAttack && n.IsDead)) EpCharger.ChargeByDefeatUnit(unit);
        // b__6_7: received the attack and survived -> EP for the opposing unit that took damage
        for (const n of bundle.GetNoticeList().filter(n => n.IsReceivedAttack && !n.IsDead)) {
            const damaged = gameDirector.battleUnitDic.get(n.AffectedUnitId)!;
            if (damaged.Team !== unit.Team) EpCharger.ChargeByReceiveDamage(damaged);
        }
        if (skill instanceof NormalAttack || skill instanceof ActiveSkill || skill instanceof SpecialAttack) {
            // b__6_8: survived a Normal or Random category hit -> +1 count point
            for (const n of bundle.GetNoticeList().filter(n => n.IsReceivedAttack && !n.IsDead
                && (n.HasAnyDamageOfCategory(DamageCategory.Normal) || n.HasAnyDamageOfCategory(DamageCategory.Random)))) {
                gameDirector.battleUnitDic.get(n.AffectedUnitId)!.Condition.TryModifyCountPointBy(1);
            }
        }
        gameDirector.ActiveUnitList.forEach(u => u.UpdateParameter()); // <ExecuteSkill>b__6_0
        const command = new CommandSkill().ctor$int_int_int_int_int_ListAffectedUnitNotice_DictionaryintBattleUnit_ListGainSoloRaidBuffPointNotice(
            unitId, targetUnitId, spReferee.GetSp(unit.Team), spBeforePassive, skillMstId,
            bundle.GetNoticeList(), gameDirector.battleUnitDic, bundle.GainSoloRaidBuffPointNoticeList);
        gameDirector.unitBrain.actionEffectHistory.AddAppliedEffectTypes(skill.GetAbilityEffectList().map(e => e.EffectType), unit.Team); // b__6_1
        return command;
    }
    /** @rva 0x17DF9F0  private static CommandExecuteActBase ExecuteHpGaugeRevive(GameDirectorBase gameDirector, int unitId) { } */
    static ExecuteHpGaugeRevive(gameDirector: GameDirectorBase, unitId: int): CommandExecuteActBase {
        const unit = gameDirector.GetTargetBattleUnit(unitId);
        const noticeList: AffectedUnitNotice[] = [];
        const notice = new AffectedUnitNotice().ctor$int(unitId);
        noticeList.push(notice);
        unit.Condition.RemoveUnitState$BattleUnit_Type_EffectOriginType_BattleUnit_NullableUnitStateBaseDirectionType_FuncUnitStateBasebool(
            unit, null!, EffectOriginType.ActiveSkill, null!, UnitStateBase_DirectionType.Negative, null!);
        unit.Refresh();
        unit.SetHP(unit.MaxHP);
        notice.IsReceivedRecovery = true;
        notice.RecoveryValue = unit.MaxHP;
        if (unit.BreakPoint.IsBreak) notice.IsResetBreakPoint = true;
        unit.BreakPoint.ResetValue();
        unit.TurnGauge.DecreaseGaugeValue(unit.TurnGauge.GaugeValue, gameDirector.turnActSystem.turnReferee.NextTurnOrderPriority, false);
        unit.CurrentHpGaugeCount = unit.CurrentHpGaugeCount - 1;
        const command = new CommandExecuteUnitHpGaugeRevive().ctor();
        command.ActUnitId = unitId;
        command.AffectedUnitNoticeList = noticeList;
        return command;
    }
    /** @rva 0x17DFCC0  private static CommandExecuteActBase ExecuteModeChange(GameDirectorBase gameDirector, int unitId) { } */
    static ExecuteModeChange(gameDirector: GameDirectorBase, unitId: int): CommandExecuteActBase {
        if (!(gameDirector instanceof SoloGameDirectorBase)) return null!;
        gameDirector.modeChangeReferee.ExecuteModeChange();
        const info = gameDirector.modeChangeReferee.GetCurrentModeChangeInfo();
        const noticeList: AffectedUnitNotice[] = [];
        const notice = new AffectedUnitNotice().ctor$int(unitId);
        noticeList.push(notice);
        const unit = gameDirector.GetTargetBattleUnit(unitId);
        if (unit.BreakPoint.IsBreak) notice.IsResetBreakPoint = true;
        gameDirector.ModeChangeEnemyBattleUnit(unit, info);
        const command = new CommandExecuteModeChange().ctor();
        command.ActUnitId = unitId;
        command.AffectedUnitNoticeList = noticeList;
        command.Step = info.Step;
        command.ChangedQuestEnemyAppearanceMstId = info.QuestEnemyAppearanceMstId;
        return command;
    }
    /** @rva 0x17DF600  private static ContinuousRecoveryInfo ContinuousRecoveryProcess(BattleUnit currentTurnUnit) { } */
    static ContinuousRecoveryProcess(currentTurnUnit: BattleUnit): ContinuousRecoveryInfo {
        const states = currentTurnUnit.Condition.GetUnitStateList(ContinuousRecoveryUnitState)
            .filter(s => s.IsActive$BattleUnit(currentTurnUnit)); // <ContinuousRecoveryProcess>b__0 0x14aa020
        if (states.length === 0) return null!;
        let total = Decimal.Zero;
        for (const s of states) total = total.add(s.GetRecoveryValue(currentTurnUnit));
        const value = Math.max(0, total.ceiling().toInt());
        const hpBefore = currentTurnUnit.HP;
        currentTurnUnit.AddHP(value);
        const info = new ContinuousRecoveryInfo().ctor();
        info.AffectedUnitId = currentTurnUnit.Id;
        info.RecoveryValue = currentTurnUnit.HP - hpBefore;
        info.ResultHp = currentTurnUnit.HP;
        return info;
    }
}

// ---- ReDriveBattleCore.Act.ActExecutor.ValidateActionType  (TypeDefIndex 1115, public enum) ----
export const ActExecutor_ValidateActionType = {
    Success: 0,
    FailAndSkip: 1,
    FailAndDecide: 2,
} as const;
export type ActExecutor_ValidateActionType = (typeof ActExecutor_ValidateActionType)[keyof typeof ActExecutor_ValidateActionType];

/** A2.Common.Extension.IEnumerableExtension.Random<T> 0x2581c70 (outside ReDriveBattleCore): `source.Any() ? source.ElementAt(random.Next(source.Count())) : default`. */
function IEnumerableExtension_Random<T>(source: readonly T[]): T | null {
    if (source.length === 0) return null;
    return source[Math.floor(GameRandom.next() * source.length)];
}