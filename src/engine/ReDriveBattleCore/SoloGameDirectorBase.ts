// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { QuestStageMstRecord } from "../Network/Definition/QuestOutGame/QuestStageMstRecord";
import { GameDirectorBase_GameSituationDataCreator } from "./GameDirectorBase";
import { TimeForwardRequest } from "./Request/TimeForwardRequest";
import { BeginWaveRequest } from "./Request/BeginWaveRequest";
import { EndWaveRequest } from "./Request/EndWaveRequest";
import { CommandAddEndlessEnemy } from "./Command/CommandAddEndlessEnemy";
import { CommandEndWave } from "./Command/CommandEndWave";
import { CommandSoloRaidBuffActivate } from "./Command/CommandSoloRaidBuffActivate";
import { CommandInitialize } from "./Command/CommandInitialize";
import { CommandBeginWave } from "./Command/CommandBeginWave";
import { CommandSyncLinkHp } from "./Command/CommandSyncLinkHp";
import { CommandRefreshTurnActUnitOrder } from "./Command/CommandRefreshTurnActUnitOrder";
import { CommandSyncModeChange } from "./Command/CommandSyncModeChange";
import { CommandSituationSync } from "./Command/CommandSituationSync";
import { ModeChangeAct } from "./Act/ModeChangeAct";
import { QuestStageMstModel } from "./Model/QuestStageMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { SoloRaidGameDirector } from "./SoloRaidGameDirector";
import { PassiveSkill } from "./PassiveSkill";
import { CampaignFieldParam } from "./CampaignFieldParam";
import { QuestJudgeResultReferee } from "./QuestJudgeResultReferee";
import { ModeChangeReferee } from "./ModeChangeReferee";
import { WaveReferee } from "./WaveReferee";
import { bindDelegate, notPorted, ref } from "../runtime";
import type { List, Ref, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { BattleUnit_TeamType } from "./BattleUnit";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";

import { EnemyAppearanceGameDirectorBase } from "./EnemyAppearanceGameDirectorBase";
import type { GameSituationData } from "./GameSituationData";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { JudgeResultType } from "./JudgeResultType";

import type { RequestBase } from "./Request/RequestBase";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";
import { TargetReferee_TargetType } from "./TargetReferee";
import { ResultStatus } from "./ResultStatus";
import { CommandRefreshTurnActUnitOrder_RefreshReasonType } from "./Command/CommandRefreshTurnActUnitOrder";
import { ProcessTiming } from "./BattleCondition/ProcessTiming";
import { CommandBase } from "./Command/CommandBase";
import { Phase } from "./Command/Phase";

// ---- ReDriveBattleCore.SoloGameDirectorBase  (TypeDefIndex 453, public abstract class) ----
export abstract class SoloGameDirectorBase extends EnemyAppearanceGameDirectorBase {
    /** 0x90 protected readonly WaveReferee waveReferee */
    waveReferee: WaveReferee = null!;
    /** 0x98 protected readonly ModeChangeReferee modeChangeReferee */
    modeChangeReferee: ModeChangeReferee = null!;
    get ModeChangeReferee(): ModeChangeReferee { return this.get_ModeChangeReferee(); }
    /** @rva 0x736DA0  public ModeChangeReferee get_ModeChangeReferee() { } */
    get_ModeChangeReferee(): ModeChangeReferee { return this.modeChangeReferee; /* asm: mov rax, qword ptr [rcx + 0x98]; ret */ }
    /** @rva 0x14CD3A0  public void .ctor() { } */
    ctor(): this {
        this.waveReferee = new WaveReferee().ctor();
        this.modeChangeReferee = new ModeChangeReferee().ctor(); // inlined in the game
        super.ctor();
        return this;
    }
    /** @rva 0x14CBD70  public void SetupBattleStage(int questStageMstId, int repeatNum, IBattleUnitProvider unitProvider, int campUpDmg = 0, int campUpBreakPointDmg = 0, int victoryRound = 0) { } */
    SetupBattleStage(questStageMstId: int, repeatNum: int, unitProvider: IBattleUnitProvider, campUpDmg?: int /* = 0 */, campUpBreakPointDmg?: int /* = 0 */, victoryRound?: int /* = 0 */): void {
        campUpDmg ??= 0; campUpBreakPointDmg ??= 0; victoryRound ??= 0;
        this.elapsedTime = 0;
        this.waveReferee.Init(questStageMstId, 1);
        const allies = unitProvider.CreateAllyBattleUnits();
        for (let i = 0; i < allies.length; i++) this.battleUnitBundle.AddUnit(allies[i]);
        for (const enemy of this.waveReferee.CreateEnemyUnitList(this.additionalEnemyReferee)) this.battleUnitBundle.AddUnit(enemy);
        this.linkHpReferee.Init(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList, null);
        const judge = new QuestJudgeResultReferee().ctor$int_int(questStageMstId, victoryRound);
        // <SetupBattleStage>g__TryGetQuestJudgeData|5_0 inlined
        const stage = BattleMstReaderBase.get_Instance<QuestStageMstModel, QuestStageMstRecord, int>(QuestStageMstModel).GetModelByKey(questStageMstId);
        if (stage != null) {
            judge.judgeResultType = stage.JudgeResultType;
            judge.judgeResultValue = stage.JudgeResultValue;
        }
        judge.result = 0 as ResultStatus;
        this.judgeResultReferee = judge;
        const wave = this.waveReferee.mode === 1 ? this.waveReferee.currentWave : WaveReferee.NoneWaveValue;
        this.additionalEnemyReferee.Initialize(questStageMstId, wave, this.battleUnitBundle.enemyList);
        this.modeChangeReferee.Init(questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList);
        this.InitializeBattle();
        this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 1);
        if (this.waveReferee.mode === 1) this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 2);
        if (campUpDmg > 0 || campUpBreakPointDmg > 0) {
            const field = new CampaignFieldParam().ctor$int_int(campUpDmg, campUpBreakPointDmg);
            const allyList = this.battleUnitBundle.allyList;
            const battleType = this.get_BattleType();
            field.TriggeringUnitOnBattleStart(allyList, battleType, this.turnActSystem.turnReferee.NextTurnOrderPriority);
        }
        this.BattlePhase = 0 as Phase;
    }
    /** @rva 0x14CB100 slot 9  public override void BattleEnd() { } */
    BattleEnd(): void {
        if (this.judgeResultReferee.result === ResultStatus.Winning && this.waveReferee.HasNextWave) {
            this.waveReferee.BeginTransition();
            const situation = GameDirectorBase_GameSituationDataCreator.Create(this);
            this.StoreCommand(new CommandSituationSync().ctor$GameSituationData_float(situation, this.elapsedTime));
            return;
        }
        if (this.BattlePhase === Phase.Finish) return; // GameDirectorBase.BattleEnd inlined in the game
        this.ChangeBattlePhase(Phase.Finish);
        this.SyncGameSituation();
    }
    /** @rva 0x14CC6A0 slot 10  public override int TurnTransition() { } */
    TurnTransition(): int {
        const waveReferee = this.waveReferee;
        const currentWave = waveReferee.currentWave;
        if (waveReferee.isDuringTransition) waveReferee.EndTransition();
        const list = this.additionalEnemyReferee.GetAdditionalBattleUnitList$ListBattleUnit(this.battleUnitBundle.enemyList);
        if (list != null) list.forEach(bindDelegate(this, this.$TurnTransition$b__7_0));
        this.turnActSystem.turnReferee.ShiftNextTurn(this.battleUnitBundle.activeList, this);
        return currentWave;
    }
    /** @rva 0x14CCCF0 slot 20  protected virtual void WaveTransition() { } */
    WaveTransition(): void {
        PassiveSkill.RemoveByTeam(BattleUnit_TeamType.Enemy, this.battleUnitBundle.dic);
        this.battleUnitBundle.RemoveAllEnemyUnits();
        this.turnActSystem.actReferee.UpdateActOrder(this.battleUnitBundle.activeList);
        this.waveReferee.ShiftNextWave();
        const enemies = this.waveReferee.CreateEnemyUnitList(this.additionalEnemyReferee);
        const judge = this.judgeResultReferee;
        if (judge instanceof QuestJudgeResultReferee) judge.SetWaveMainTarget(this.waveReferee.questStageMstId, this.waveReferee.currentWave);
        enemies.forEach(bindDelegate(this, this.$WaveTransition$b__8_0));
        const wave = this.waveReferee.mode === 1 ? this.waveReferee.currentWave : WaveReferee.NoneWaveValue;
        this.additionalEnemyReferee.Initialize(this.waveReferee.questStageMstId, wave, this.battleUnitBundle.enemyList);
        this.linkHpReferee.Init(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList, null);
        this.ChangeTargetToCenter(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Attack, this.battleUnitBundle.enemyList, false);
        const alive = this.battleUnitBundle.enemyList.filter(x => !x.IsDead); // <>c.b__8_1
        this.turnActSystem.actReferee.SetRandomTarget(alive, this.battleUnitBundle.dic);
        this.modeChangeReferee.Init(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList);
        this.StoreCommand(new CommandSyncModeChange().ctor$ListModeChangeRefereeModeChangeInfo_int(this.modeChangeReferee.modeChangeInfoList, this.modeChangeReferee.currentModeChangeStep));
        this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 2);
        const registered = this.unitBrain.RegisterEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, this.turnActSystem.actReferee);
        const orderInfo = this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this);
        if (registered) this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(orderInfo, 2 as CommandRefreshTurnActUnitOrder_RefreshReasonType, 0));
        const r = this.linkHpReferee;
        this.StoreCommand(new CommandSyncLinkHp().ctor$LinkHpType_string_int_int(r.linkHpType, r.linkHpName, r.currentLinkHp, r.maxLinkHp));
        this.StoreCommand(new CommandBeginWave().ctor$int_int_ListBattleUnit_TurnActOrderUnitInfo(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList, orderInfo));
    }
    /** @rva 0x14CC8D0 slot 21  protected virtual void WaveTransitionForForceWinDebug() { } */
    WaveTransitionForForceWinDebug(): void {
        PassiveSkill.RemoveByTeam(BattleUnit_TeamType.Enemy, this.battleUnitBundle.dic);
        this.battleUnitBundle.RemoveAllEnemyUnits();
        this.turnActSystem.actReferee.UpdateActOrder(this.battleUnitBundle.activeList);
        this.waveReferee.ShiftNextWave();
        const enemies = this.waveReferee.CreateEnemyUnitList(this.additionalEnemyReferee);
        const judge = this.judgeResultReferee;
        if (judge instanceof QuestJudgeResultReferee) judge.SetWaveMainTarget(this.waveReferee.questStageMstId, this.waveReferee.currentWave);
        enemies.forEach(bindDelegate(this, this.$WaveTransitionForForceWinDebug$b__9_0));
        const wave = this.waveReferee.mode === 1 ? this.waveReferee.currentWave : WaveReferee.NoneWaveValue;
        this.additionalEnemyReferee.Initialize(this.waveReferee.questStageMstId, wave, this.battleUnitBundle.enemyList);
        this.linkHpReferee.Init(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList, null);
        this.ChangeTargetToCenter(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Attack, this.battleUnitBundle.enemyList, false);
        const alive = this.battleUnitBundle.enemyList.filter(x => !x.IsDead); // <>c.b__9_1
        this.turnActSystem.actReferee.SetRandomTarget(alive, this.battleUnitBundle.dic);
        this.modeChangeReferee.Init(this.waveReferee.questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList);
        this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 2); // tail call (inlined in the decompile)
    }
    /** @rva 0x14CB3A0 slot 17  protected override void CheckModeChange() { } */
    CheckModeChange(): void {
        const result = this.modeChangeReferee.CanModeChange(this.battleUnitBundle.enemyList) as [boolean, BattleUnit, int]; // <>c__DisplayClass10_0
        const unit = result[1];
        const step = result[2];
        if (!result[0]) return;
        const actReferee = this.turnActSystem.actReferee;
        if (actReferee.actList.some(act => act instanceof ModeChangeAct && act.actUnitId === unit.Id && act.actUnitTeam === unit.Team && act.NextModeChangeStep === step)) return; // b__0
        const act = new ModeChangeAct().ctor();
        act.actUnitId = unit.Id;
        act.actUnitTeam = unit.Team;
        act.NextModeChangeStep = step;
        actReferee.AddAct$ActBase(act);
    }
    /** @rva 0x14CB580 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize {
        const command = new CommandInitialize().ctor$BattleUnitInfo_int_int_int_int_int_int_bool_GameSituationData(battleUnitInfoArray,
            targetReferee.allyAttackTargetId, targetReferee.allyFriendTargetId, targetReferee.enemyAttackTargetId, targetReferee.enemyFriendTargetId,
            spReferee.allySp, spReferee.enemySp, this.isForcedAutomatic, gameSituationData);
        const r = this.linkHpReferee;
        if (r == null) return command;
        command.SetLinkHp(r.linkHpType, r.linkHpName, r.currentLinkHp, r.maxLinkHp);
        command.SetWave(this.waveReferee.maxWave, this.waveReferee.currentWave);
        command.SetModeChangeData(this.modeChangeReferee.modeChangeInfoList, this.modeChangeReferee.currentModeChangeStep);
        return command;
    }
    /** @rva 0x14CB730 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void {
        const type = request.RequestType;
        if (type === 3) {
            if (request instanceof EndWaveRequest) this.WaveTransition();
        } else if (type === 4) {
            if (request instanceof BeginWaveRequest) {
                this.waveReferee.EndTransition();
                this.judgeResultReferee.result = 0 as ResultStatus;
                this.Forward();
            }
        } else if (type === 11 && request instanceof TimeForwardRequest) {
            if (this.BattlePhase === Phase.Finish) return;
            let command: CommandBase;
            if (!this.waveReferee.isDuringTransition) {
                const supplied = this.TrySupplyEndlessEnemyUnits();
                if (supplied != null) {
                    this.SupplyEndlessEnemy(supplied);
                    return;
                }
                if (!(this instanceof SoloRaidGameDirector)) { super.Request(request, dontFlushCommand, cancellationToken); return; }
                if (!this.soloRaidBuffReferee.CheckActive()) { super.Request(request, dontFlushCommand, cancellationToken); return; }
                const noticeList = PassiveSkill.Triggering$6(this, 10 as ProcessTiming, null!, null!, null!, null!).GetNoticeList();
                for (const unit of this.battleUnitBundle.activeList) unit.Refresh(); // <>c.b__12_0 (List.ForEach)
                const situation = GameDirectorBase_GameSituationDataCreator.Create(this);
                this.StoreCommand(new CommandSituationSync().ctor$GameSituationData_float(situation, this.elapsedTime));
                const buffReferee = this.soloRaidBuffReferee;
                command = new CommandSoloRaidBuffActivate().ctor$SoloRaidBuffReferee_int_ListAffectedUnitNotice(buffReferee, this.spReferee.GetSp(BattleUnit_TeamType.Ally), noticeList);
            } else {
                command = new CommandEndWave().ctor();
            }
            this.StoreCommand(command);
            this.commandSender.Flush();
            return;
        }
        super.Request(request, dontFlushCommand, cancellationToken);
    }
    /** @rva 0x72F170  private void OnForceWinDebugRequested() { } */
    OnForceWinDebugRequested(): void { /* asm: ret 0 */ }
    /** @rva 0x72F170  protected void ResetForceWinDebugRequestFlag() { } */
    ResetForceWinDebugRequestFlag(): void { /* asm: ret 0 */ }
    /** @rva 0x14CBBB0 slot 14  protected override void RunBattleToEnd(CancellationToken ct) { } */
    RunBattleToEnd(ct: any /* CancellationToken */): void {
        if (this.waveReferee.mode === 0) {
            while (this.BattlePhase !== Phase.Finish) {
                if (ct != null && ct.IsCancellationRequested) break;
                this.Forward();
            }
            return;
        }
        let judge = this.judgeResultReferee;
        while (judge != null) {
            if (judge.result === ResultStatus.None) {
                if (ct != null && ct.IsCancellationRequested) return;
                this.Forward();
            } else {
                if (this.judgeResultReferee.result === ResultStatus.Losing) return;
                if (!this.waveReferee.HasNextWave) return;
                this.waveReferee.BeginTransition();
                this.WaveTransition();
                this.judgeResultReferee.result = 0 as ResultStatus;
                this.waveReferee.EndTransition();
            }
            judge = this.judgeResultReferee;
        }
    }
    /** @rva 0x14CB710 slot 19  protected override void PrepareEndlessEnemySupply() { } */
    PrepareEndlessEnemySupply(): void {
        this.targetReferee.CacheAttackTargetBeforeEndlessSupply(); // inlined in the game
    }
    /** @rva 0x14CC5A0  protected List<BattleUnit> TrySupplyEndlessEnemyUnits() { } */
    TrySupplyEndlessEnemyUnits(): List<BattleUnit> {
        const list = this.additionalEnemyReferee.CreateSuppliedEndlessEnemyUnitList(this.battleUnitBundle.enemyList);
        if (list == null) return list;
        if (!(list.length > 0)) return null!;
        list.forEach(bindDelegate(this, this.$TrySupplyEndlessEnemyUnits$b__17_0));
        return list;
    }
    /** @rva 0x14CC250  private void SupplyEndlessEnemy(List<BattleUnit> suppliedEndlessEnemyUnitList) { } */
    SupplyEndlessEnemy(suppliedEndlessEnemyUnitList: List<BattleUnit>): void {
        this.ChangeAttackTargetAtSamePosition(this.targetReferee.attackTargetIdBeforeEndlessSupply, BattleUnit_TeamType.Ally); // inlined in the game
        this.CheckTargetUnit(BattleUnit_TeamType.Ally);
        this.CheckTargetUnit(BattleUnit_TeamType.Enemy);
        const alive = this.battleUnitBundle.enemyList.filter(x => !x.IsDead); // <>c.b__18_0
        this.turnActSystem.actReferee.SetRandomTarget(alive, this.battleUnitBundle.dic);
        this.StoreCommand(new CommandAddEndlessEnemy().ctor$ListBattleUnit(suppliedEndlessEnemyUnitList));
        this.commandSender.Flush();
    }
    /** @rva 0x14CB210  private void ChangeAttackTargetAtSamePosition(int attackTargetId, BattleUnit.TeamType targetTeam) { } */
    ChangeAttackTargetAtSamePosition(attackTargetId: int, targetTeam: BattleUnit_TeamType): void {
        if (this.BattlePhase === Phase.Finish) return; // <>c__DisplayClass19_0
        const target = this.battleUnitBundle.dic.get(attackTargetId);
        if (target === undefined) return;
        if (this.battleUnitBundle.activeList.includes(target)) return;
        const unit = this.battleUnitBundle.activeList.find(u => u.Team !== targetTeam && u.PositionId === target.PositionId) ?? null; // b__0
        if (unit != null) this.ChangeTarget(targetTeam, TargetReferee_TargetType.Attack, unit.Id, true);
    }
    /** @rva 0x14CC7D0  internal static bool <SetupBattleStage>g__TryGetQuestJudgeData|5_0(int stageMstId, out JudgeResultType judgeResultType, out int judgeResultValue) { } */
    static $SetupBattleStage$g__TryGetQuestJudgeData_5_0(stageMstId: int, judgeResultType: Ref<JudgeResultType>, judgeResultValue: Ref<int>): boolean {
        judgeResultType.v = 0 as JudgeResultType;
        judgeResultValue.v = 0;
        const stage = BattleMstReaderBase.get_Instance<QuestStageMstModel, QuestStageMstRecord, int>(QuestStageMstModel).GetModelByKey(stageMstId);
        if (stage == null) return false;
        judgeResultType.v = stage.JudgeResultType;
        judgeResultValue.v = stage.JudgeResultValue;
        return true;
    }
    /** @rva 0x14BBF90  private void <TurnTransition>b__7_0(BattleUnit unit) { } */
    $TurnTransition$b__7_0(unit: BattleUnit): void {
        this.AddEnemyBattleUnit(unit, true, true); // same code as <OnBattleUnitDeath>b__5_0
    }
    /** @rva 0x14CC8B0  private void <WaveTransition>b__8_0(BattleUnit unit) { } */
    $WaveTransition$b__8_0(unit: BattleUnit): void {
        this.AddEnemyBattleUnit(unit, false, false);
    }
    /** @rva 0x14CC8B0  private void <WaveTransitionForForceWinDebug>b__9_0(BattleUnit unit) { } */
    $WaveTransitionForForceWinDebug$b__9_0(unit: BattleUnit): void {
        this.AddEnemyBattleUnit(unit, false, false);
    }
    /** @rva 0x14CC890  private void <TrySupplyEndlessEnemyUnits>b__17_0(BattleUnit unit) { } */
    $TrySupplyEndlessEnemyUnits$b__17_0(unit: BattleUnit): void {
        this.AddEnemyBattleUnit(unit, false, true);
    }
}
