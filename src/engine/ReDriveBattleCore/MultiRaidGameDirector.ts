// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { List } from "../runtime";
import type { DateTimeOffset } from "./SoloRaidJudgeResultReferee";
import type { BattleCoreErrorType } from "./Command/BattleCoreErrorType";
import type { Phase } from "./Command/Phase";
import type { ResultStatus } from "./ResultStatus";
import type { BattleUnit } from "./BattleUnit";
import { GameDirectorBase } from "./GameDirectorBase";
import { MultiRaidSyncHpScoreRequest } from "./Request/MultiRaidSyncHpScoreRequest";
import { CommandExecuteActBase } from "./Command/CommandExecuteActBase";
import { CommandError } from "./Command/CommandError";
import { CommandMultiRaidSyncHpResultForServer } from "./Command/CommandMultiRaidSyncHpResultForServer";
import { CommandMultiRaidSyncHpScore } from "./Command/CommandMultiRaidSyncHpScore";
import { CommandMultiRaidSyncTotalDamage } from "./Command/CommandMultiRaidSyncTotalDamage";
import { CampaignFieldParam } from "./CampaignFieldParam";
import { MultiRaidJudgeResultReferee } from "./MultiRaidJudgeResultReferee";
import { WaveReferee } from "./WaveReferee";
import { QuestEnemyAppearanceMstReader } from "./Reader/QuestEnemyAppearanceMstReader";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import type { int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { CommandBase } from "./Command/CommandBase";
import type { CommandMultiRaidSyncHpScore_ParticipantInfo } from "./Command/CommandMultiRaidSyncHpScore";
import { EnemyAppearanceGameDirectorBase } from "./EnemyAppearanceGameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { RequestBase } from "./Request/RequestBase";

// ---- ReDriveBattleCore.MultiRaidGameDirector  (TypeDefIndex 378, public class) ----
export class MultiRaidGameDirector extends EnemyAppearanceGameDirectorBase {
    /** 0x90 private int <TotalDamage>k__BackingField */
    _TotalDamage: int = 0;
    /** 0x98 private CommandMultiRaidSyncHpScore.ParticipantInfo[] initialParticipantInfos */
    initialParticipantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[] = null!;
    /** 0xA0 private int <ReqSyncHpScoreCount>k__BackingField */
    _ReqSyncHpScoreCount: int = 0;
    get TotalDamage(): int { return this.get_TotalDamage(); }
    set TotalDamage(v: int) { this.set_TotalDamage(v); }
    get ReqSyncHpScoreCount(): int { return this.get_ReqSyncHpScoreCount(); }
    set ReqSyncHpScoreCount(v: int) { this.set_ReqSyncHpScoreCount(v); }
    /** @rva 0xDA5C10 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 8 as BattleType; /* asm: mov eax, 8; ret */ }
    /** @rva 0x901EE0  public int get_TotalDamage() { } */
    get_TotalDamage(): int { return this._TotalDamage; /* auto-property */ }
    /** @rva 0x901F10  public void set_TotalDamage(int value) { } */
    set_TotalDamage(value: int): void { this._TotalDamage = value; /* auto-property */ }
    /** @rva 0x754630  public int get_ReqSyncHpScoreCount() { } */
    get_ReqSyncHpScoreCount(): int { return this._ReqSyncHpScoreCount; /* auto-property */ }
    /** @rva 0x754900  private void set_ReqSyncHpScoreCount(int value) { } */
    set_ReqSyncHpScoreCount(value: int): void { this._ReqSyncHpScoreCount = value; /* auto-property */ }
    /** @rva 0x14B2110  public void .ctor() { } */
    ctor(): this {
        super.ctor(); // EnemyAppearanceGameDirectorBase..ctor (tail call)
        return this;
    }
    /** @rva 0x14B0FB0  public void SetupBattleStage(int questStageMstId, IBattleUnitProvider unitProvider, int mainTargetHp, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, int roundLimit, DateTimeOffset endTime, int campUpDmg, int campUpBreakPointDmg, bool isBattleSkip) { } */
    SetupBattleStage(questStageMstId: int, unitProvider: IBattleUnitProvider, mainTargetHp: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], roundLimit: int, endTime: DateTimeOffset, campUpDmg: int, campUpBreakPointDmg: int, isBattleSkip: boolean): void {
        this.elapsedTime = 0;
        this.isForcedAutomatic = isBattleSkip;
        const allies = unitProvider.CreateAllyBattleUnits();
        for (let i = 0; i < allies.length; i++) this.battleUnitBundle.AddUnit(allies[i]);
        const mstList = QuestEnemyAppearanceMstReader.GetModelListForBattleStart(questStageMstId, WaveReferee.NoneWaveValue);
        for (const unit of this.additionalEnemyReferee.GetAdditionalBattleUnitList$ListQuestEnemyAppearanceMstModel(mstList)) {
            // the boss starts at the raid's current HP (the server's)
            const p = unit.BattleParameter;
            if (p instanceof QuestEnemyAppearanceParameter && p.IsMainTargetEnemy) {
                this.StoreSyncHpResultForServerCommand(unit._HP - mainTargetHp);
                unit.SetHP(mainTargetHp);
            }
            this.battleUnitBundle.AddUnit(unit);
        }
        // 3.21.0: the link HP starts at the raid's HP too (Nullable<int>(mainTargetHp))
        this.linkHpReferee.Init(questStageMstId, WaveReferee.NoneWaveValue, this.battleUnitBundle.enemyList, mainTargetHp);
        // new MultiRaidJudgeResultReferee(questStageMstId, roundLimit, endTime) inlined, then result = 0
        const judge = new MultiRaidJudgeResultReferee().ctor$int_int_DateTimeOffset(questStageMstId, roundLimit, endTime);
        judge.result = 0 as ResultStatus;
        this.judgeResultReferee = judge;
        this.additionalEnemyReferee.Initialize(questStageMstId, WaveReferee.NoneWaveValue, this.battleUnitBundle.enemyList);
        this.InitializeBattle();
        if (0 < campUpDmg || 0 < campUpBreakPointDmg) {
            const field = new CampaignFieldParam().ctor$int_int(campUpDmg, campUpBreakPointDmg);
            field.TriggeringUnitOnBattleStart(this.battleUnitBundle.allyList, this.get_BattleType(), this.turnActSystem.turnReferee.get_NextTurnOrderPriority());
        }
        this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 1);
        this.initialParticipantInfos = participantInfos;
        this.BattlePhase = 0 as Phase;
    }
    /** @rva 0x14B0CE0 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean = false, cancellationToken: any = null): void {
        if (request == null) return;
        if (request.RequestType === 15 && request instanceof MultiRaidSyncHpScoreRequest) {
            // the server answers with SyncHpScore (the other participants' damage)
            this.ReqSyncHpScoreCount = this.ReqSyncHpScoreCount + 1;
            if (!dontFlushCommand) this.commandSender.Flush();
            return;
        }
        super.Request(request, dontFlushCommand, cancellationToken);
    }
    /** @rva 0x14B0DC0 slot 12  public override void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void {
        super.RespondToClientReadyRequest();
        // Enumerable.First(enemyList, <>c.b__14_0): result unused, throws when there is no main target
        if (!this.battleUnitBundle.enemyList.some(unit => isMainTargetEnemyUnit(unit))) throw new Error("InvalidOperationException: Sequence contains no matching element");
        this.StoreSyncHpScoreCommand(this.initialParticipantInfos, true, false);
        this.StoreTotalDamageCommand(true); // tail call
    }
    /** @rva 0x14B1480 slot 8  public override void StoreCommand(CommandBase cmd) { } */
    StoreCommand(cmd: CommandBase): void {
        if (cmd == null) return;
        cmd._Time = this.elapsedTime;
        this.commandSender.commandQueue.push(cmd); // Queue<CommandBase>.Enqueue
        if (!(cmd instanceof CommandExecuteActBase)) return;
        const notices = cmd._AffectedUnitNoticeList;
        if (notices == null) return;
        for (const notice of notices) {
            const unit = this.battleUnitBundle.dic.get(notice._AffectedUnitId);
            if (unit === undefined) continue; // TryGetValue
            if (unit._Team === 0) continue; // 3.21.0: allies never count
            if (this.linkHpReferee.linkHpType !== 2) { // 3.21.0: with linked HP every enemy counts
                const p = unit.BattleParameter;
                if (p == null || !(p instanceof QuestEnemyAppearanceParameter) || !p.IsMainTargetEnemy) continue;
            }
            this.TotalDamage = notice.GetTotalDamageValue(true) + this.TotalDamage;
            if (notice._IsConsumeHp) this.TotalDamage = this.TotalDamage + notice._ConsumeHpValue; // 3.21.0
        }
    }
    /** @rva 0x14B0C50 slot 15  protected override void Forward() { } */
    Forward(): void {
        const before = this.TotalDamage;
        super.Forward();
        if (this.TotalDamage !== before) this.StoreCommand(new CommandMultiRaidSyncTotalDamage().ctor$int_bool(this.TotalDamage, false));
    }
    /** @rva 0x14B1A60  public void SyncHpScoreOnResume(int syncedMainTargetEnemyHp, int totalDamageBeforeSync, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos) { } */
    SyncHpScoreOnResume(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[]): void {
        this.SyncHp(syncedMainTargetEnemyHp, totalDamageBeforeSync);
        this.initialParticipantInfos = participantInfos;
    }
    /** @rva 0x14B1AA0  public void SyncHpScore(int syncedMainTargetEnemyHp, int totalDamageBeforeSync, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, bool isRequestedByPlayer = False) { } */
    SyncHpScore(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], isRequestedByPlayer: boolean = false): void {
        this.SyncHp(syncedMainTargetEnemyHp, totalDamageBeforeSync);
        this.StoreSyncHpScoreCommand(participantInfos, false, isRequestedByPlayer);
        this.commandSender.Flush(); // inlined
    }
    /** @rva 0x14B1B00  private void SyncHp(int syncedMainTargetEnemyHp, int totalDamageBeforeSync) { } */
    SyncHp(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int): void {
        // the server's HP minus what this client dealt since the server counted
        const hp = Math.max(syncedMainTargetEnemyHp - (this.TotalDamage - totalDamageBeforeSync), 0);
        const unit = [...this.battleUnitBundle.dic.values()].find(u => isMainTargetEnemyUnit(u)) ?? null; // FirstOrDefault(<>c.b__19_0)
        if (unit == null) return;
        this.StoreSyncHpResultForServerCommand(unit._HP - hp);
        const before = unit._HP;
        let deathUnitIds: List<int>;
        if (this.linkHpReferee.linkHpType === 2) {
            // 3.21.0: linked HP (boss + parts) syncs every living enemy through the link
            deathUnitIds = this.battleUnitBundle.enemyList.filter(u => !u.get_IsDead()).map(u => u._Id); // Where(<>c.b__19_1).Select(<>c.b__19_2)
            this.linkHpReferee.SetCurrentLinkHp(hp, this.battleUnitBundle.enemyList); // inlined in the game
        } else {
            deathUnitIds = [unit._Id];
            unit.SetHP(hp);
        }
        if (0 < before && hp < 1) {
            for (const id of deathUnitIds) this.OnBattleUnitDeath(id);
            this.CheckBattleFinishAfterAct(); // 3.21.0: the director's (virtual), was the referee's
            if (this.judgeResultReferee.result !== 0) this.BattleEnd();
        }
    }
    /** @rva 0x14B17F0  private void StoreSyncHpScoreCommand(CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, bool isInitialize, bool isRequestedByPlayer = False) { } */
    StoreSyncHpScoreCommand(participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], isInitialize: boolean, isRequestedByPlayer: boolean = false): void {
        const unit = [...this.battleUnitBundle.dic.values()].find(u => isMainTargetEnemyUnit(u)); // First(<>c.b__20_0)
        if (unit === undefined) throw new Error("InvalidOperationException: Sequence contains no matching element");
        this.StoreCommand(new CommandMultiRaidSyncHpScore().ctor$int_ParticipantInfo_bool_bool_bool(unit._HP, participantInfos, isInitialize, (this.BattlePhase as int) === 2, isRequestedByPlayer));
    }
    /** @rva 0x14B19D0  private void StoreTotalDamageCommand(bool isInitialize = False) { } */
    StoreTotalDamageCommand(isInitialize: boolean = false): void {
        this.StoreCommand(new CommandMultiRaidSyncTotalDamage().ctor$int_bool(this.TotalDamage, isInitialize));
    }
    /** @rva 0x14B0F30  public void SendSyncApiError() { } */
    SendSyncApiError(): void {
        this.StoreCommand(new CommandError().ctor$BattleCoreErrorType(1 as BattleCoreErrorType));
        this.commandSender.Flush(); // inlined
    }
    /** @rva 0x14B1770  private void StoreSyncHpResultForServerCommand(int reducedHpBySync) { } */
    StoreSyncHpResultForServerCommand(reducedHpBySync: int): void {
        this.StoreCommand(new CommandMultiRaidSyncHpResultForServer().ctor$int(reducedHpBySync));
    }
    /** @rva 0x14B0B90  public void ForceSetBattleFinishByTimeLimitIfNeed() { } */
    ForceSetBattleFinishByTimeLimitIfNeed(): void {
        const judge = this.judgeResultReferee;
        if (judge == null) return;
        if (!(judge instanceof MultiRaidJudgeResultReferee)) throw new TypeError("InvalidCastException: MultiRaidJudgeResultReferee");
        if ((judge.result as int) === 2 && judge._BattleFinishByTimeLimit) return;
        judge.ForceSetBattleFinishByTimeLimit(); // inlined
        this.ChangeBattlePhase(2 as Phase);
        this.commandSender.Flush(); // inlined
    }
}

// <>c.<RespondToClientReadyRequest>b__14_0 0x14a9310, <SyncHp>b__19_0 0x14a9590, <StoreSyncHpScoreCommand>b__20_0 0x14a94e0
// (identical bodies, folded in 3 copies)
function isMainTargetEnemyUnit(unit: BattleUnit): boolean {
    const p = unit.BattleParameter;
    return p instanceof QuestEnemyAppearanceParameter && p.IsMainTargetEnemy;
}