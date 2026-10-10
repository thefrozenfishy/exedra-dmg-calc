// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CommandResend } from "./Command/CommandResend";
import { JudgeResultType } from "./JudgeResultType";
import { ResultStatus } from "./ResultStatus";
import { AutoType } from "./AutoType";
import { Phase } from "./Command/Phase";
import { EffectOriginType } from "./UnitState/EffectOriginType";
import { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import { CommandSituationSync } from "./Command/CommandSituationSync";
import { CommandDecideSkillContent } from "./Command/CommandDecideSkillContent";
import { CommandRefreshTurnActUnitOrder, CommandRefreshTurnActUnitOrder_RefreshReasonType } from "./Command/CommandRefreshTurnActUnitOrder";
import { ActiveSkillBaseUtility } from "./ActiveSkillBaseUtility";
import { PassiveSkill } from "./PassiveSkill";
import { QuestJudgeResultReferee } from "./QuestJudgeResultReferee";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { TargetReferee_TargetType } from "./TargetReferee";
import { BattleUnit_TeamType } from "./BattleUnit";
import { HpGaugeReviveAct } from "./Act/HpGaugeReviveAct";
import { StartTimingAct } from "./Act/StartTimingAct";
import { AdditionalSkillAct } from "./Act/AdditionalSkillAct";
import { TurnUnitActBase } from "./Act/TurnUnitActBase";
import { TurnUnitAct } from "./Act/TurnUnitAct";
import { SkillDecisionActBase } from "./Act/SkillDecisionActBase";
import { SpecialAttackAct } from "./Act/SpecialAttackAct";
import { ActExecutor, ActExecutor_ValidateActionType } from "./Act/ActExecutor";
import { notPorted } from "../runtime";
import type { Dictionary, List, float, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { UnitBrain } from "./AI/UnitBrain";

import type { AffectedUnitNotice } from "./AffectedUnitNotice";

import type { BackupAgent } from "./BackupAgent";

import type { BattleSpeedType } from "./BattleSpeedType";
import type { BattleUnit } from "./BattleUnit";
import type { BattleUnitBundle } from "./BattleUnitBundle";
import type { BattleUnitSituationData } from "./BattleUnitSituationData";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import type { CommandBase } from "./Command/CommandBase";
import type { CommandInitialize } from "./Command/CommandInitialize";

import type { CommandSender } from "./CommandSender";
import type { GameSituationData } from "./GameSituationData";
import type { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";
import type { RequestBase } from "./Request/RequestBase";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";
import type { TurnActSystem } from "./TurnActSystem";
import type { TurnReferee } from "./TurnReferee";

// ---- ReDriveBattleCore.GameDirectorBase  (TypeDefIndex 405, public abstract class) ----
export abstract class GameDirectorBase {
    /** 0x0 public static readonly int Version */
    static Version: int = 0;
    /** 0x4 public static readonly int AllyIdStart */
    static AllyIdStart: int = 0;
    /** 0x8 public static readonly int EnemyIdStart */
    static EnemyIdStart: int = 0;
    /** 0x10 protected float elapsedTime */
    elapsedTime: float = 0;
    /** 0x14 private int lastUpdateTimePerSecond */
    lastUpdateTimePerSecond: int = 0;
    /** 0x18 private bool isDuringDebugMode */
    isDuringDebugMode: boolean = false;
    /** 0x20 public readonly CommandSender commandSender */
    commandSender: CommandSender = null!;
    /** 0x28 protected readonly BattleUnitBundle battleUnitBundle */
    battleUnitBundle: BattleUnitBundle = null!;
    /** 0x30 public Phase BattlePhase */
    BattlePhase: Phase = 0 as Phase;
    /** 0x34 private AutoType autoType */
    autoType: AutoType = 0 as AutoType;
    /** 0x38 protected bool isForcedAutomatic */
    isForcedAutomatic: boolean = false;
    /** 0x40 private readonly UnitBrain unitBrain */
    unitBrain: UnitBrain = null!;
    /** 0x48 public JudgeResultRefereeBase judgeResultReferee */
    judgeResultReferee: JudgeResultRefereeBase = null!;
    /** 0x50 private readonly TargetReferee targetReferee */
    targetReferee: TargetReferee = null!;
    /** 0x58 private readonly SpReferee spReferee */
    spReferee: SpReferee = null!;
    /** 0x60 private readonly BackupAgent backupAgent */
    backupAgent: BackupAgent = null!;
    /** 0x68 private BattleSpeedType battleSpeedType */
    battleSpeedType: BattleSpeedType = 0 as BattleSpeedType;
    /** 0x6C private bool isPaused */
    isPaused: boolean = false;
    /** 0x70 protected TurnActSystem turnActSystem */
    turnActSystem: TurnActSystem = null!;
    /** 0x78 public bool IsDebugBattle */
    IsDebugBattle: boolean = false;
    get battleUnitDic(): Dictionary<int, BattleUnit> { return this.get_battleUnitDic(); }
    get BattleUnits(): Dictionary<int, BattleUnit> { return this.get_BattleUnits(); }
    get UnitBrain(): UnitBrain { return this.get_UnitBrain(); }
    get AllyUnitList(): List<BattleUnit> { return this.get_AllyUnitList(); }
    get EnemyUnitList(): List<BattleUnit> { return this.get_EnemyUnitList(); }
    get ActiveUnitList(): List<BattleUnit> { return this.get_ActiveUnitList(); }
    get TargetReferee(): TargetReferee { return this.get_TargetReferee(); }
    get SpReferee(): SpReferee { return this.get_SpReferee(); }
    get BackupAgent(): BackupAgent { return this.get_BackupAgent(); }
    get BattleType(): BattleType { return this.get_BattleType(); }
    get TurnActSystem(): TurnActSystem { return this.get_TurnActSystem(); }
    get turnReferee(): TurnReferee { return this.get_turnReferee(); }
    /** @rva 0x149C620  protected Dictionary<int, BattleUnit> get_battleUnitDic() { } */
    get_battleUnitDic(): Dictionary<int, BattleUnit> { return this.battleUnitBundle.dic; }
    /** @rva 0x149C620  public Dictionary<int, BattleUnit> get_BattleUnits() { } */
    get_BattleUnits(): Dictionary<int, BattleUnit> { return this.battleUnitBundle.dic; /* same code as get_battleUnitDic */ }
    /** @rva 0x7368E0  public UnitBrain get_UnitBrain() { } */
    get_UnitBrain(): UnitBrain { return this.unitBrain; /* asm: mov rax, qword ptr [rcx + 0x40]; ret */ }
    /** @rva 0x75ED80  public List<BattleUnit> get_AllyUnitList() { } */
    get_AllyUnitList(): List<BattleUnit> { return this.battleUnitBundle.allyList; }
    /** @rva 0x149C640  public List<BattleUnit> get_EnemyUnitList() { } */
    get_EnemyUnitList(): List<BattleUnit> { return this.battleUnitBundle.enemyList; }
    /** @rva 0x149C600  public List<BattleUnit> get_ActiveUnitList() { } */
    get_ActiveUnitList(): List<BattleUnit> { return this.battleUnitBundle.activeList; }
    /** @rva 0x736910  public TargetReferee get_TargetReferee() { } */
    get_TargetReferee(): TargetReferee { return this.targetReferee; /* asm: mov rax, qword ptr [rcx + 0x50]; ret */ }
    /** @rva 0x736900  public SpReferee get_SpReferee() { } */
    get_SpReferee(): SpReferee { return this.spReferee; /* asm: mov rax, qword ptr [rcx + 0x58]; ret */ }
    /** @rva 0x737A10  public BackupAgent get_BackupAgent() { } */
    get_BackupAgent(): BackupAgent { return this.backupAgent; /* asm: mov rax, qword ptr [rcx + 0x60]; ret */ }
    /** @rva -1 slot 4  public abstract BattleType get_BattleType(); */
    abstract get_BattleType(): BattleType;
    /** @rva 0x737A20  public TurnActSystem get_TurnActSystem() { } */
    get_TurnActSystem(): TurnActSystem { return this.turnActSystem; /* asm: mov rax, qword ptr [rcx + 0x70]; ret */ }
    /** @rva 0x149C660  protected TurnReferee get_turnReferee() { } */
    get_turnReferee(): TurnReferee { return this.turnActSystem.turnReferee; }
    /** @rva 0x149C1A0  public void .ctor() { } */
    ctor(): this { return notPorted("GameDirectorBase..ctor", 0x149C1A0); }
    /** @rva 0xCB24E0  protected void Ready() { } */
    Ready(): void { return notPorted("GameDirectorBase.Ready", 0xCB24E0); }
    /** @rva 0x149A600  protected void InitializeBattle() { } */
    InitializeBattle(): void { return notPorted("GameDirectorBase.InitializeBattle", 0x149A600); }
    /** @rva 0x149BC90 slot 5  protected virtual void StoreBattlePhaseCommand() { } */
    StoreBattlePhaseCommand(): void { return notPorted("GameDirectorBase.StoreBattlePhaseCommand", 0x149BC90); }
    /** @rva 0x149A4F0  public BattleUnit GetTargetBattleUnit(int battleUnitId) { } */
    GetTargetBattleUnit(battleUnitId: int): BattleUnit {
        return this.battleUnitBundle.dic.get(battleUnitId) ?? null!;
    }
    /** @rva 0x149A9A0 slot 6  public virtual void OnBattleUnitDeath(int deathObjectId) { } */
    OnBattleUnitDeath(deathObjectId: int): void {
        const unit = this.battleUnitBundle.dic.get(deathObjectId)!;
        PassiveSkill.RemoveByBattleUnit(unit, this.battleUnitBundle.dic);
        ActiveSkillBaseUtility.RemoveByUserUnitDeath(unit, this.battleUnitBundle.dic);
        const condition = unit.Condition;
        condition.RemoveUnitState$BattleUnit_EffectOriginType_BattleUnit_FuncUnitStateBasebool(unit, EffectOriginType.ActiveSkill, null!, null!);
        condition.VisualShaderName = "";
        condition.BarrierEndurance = 0;
        condition.MaxBarrierEndurance = 0;
        unit.AddEP(-unit.EP);
        unit.AddBP(-unit.BP);
        condition.ChargePoint = 0;
        condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state.ShouldRemoveStateByHolderDeath); // b__49_0
        if (condition.MaxZoneStack > 0 && condition.ZoneStack > 0) {
            condition.ZoneStack = 0;
            condition.ZoneEffectId = -1;
        }
        this.CheckMainTargetEnemyDead(unit);
        if (this.judgeResultReferee.result === ResultStatus.Winning) this.BattleEnd();
    }
    /** @rva 0x14994C0 slot 7  protected virtual void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void {
        this.judgeResultReferee.CheckMainTargetEnemyDead(deathUnit);
    }
    /** @rva 0x14994F0  protected void CheckTargetUnit(BattleUnit.TeamType targetTeam) { } */
    CheckTargetUnit(targetTeam: BattleUnit_TeamType): void {
        if (this.BattlePhase === Phase.Finish) return;
        const dic = this.battleUnitBundle.dic;
        const attackId = this.targetReferee.GetAttackTargetId(targetTeam);
        if (!dic.has(attackId) || !this.battleUnitBundle.activeList.includes(dic.get(attackId)!)) {
            this.ChangeTargetAtRandom(targetTeam, TargetReferee_TargetType.Attack,
                this.battleUnitBundle.activeList.filter(u => u.Team !== targetTeam), false, true); // b__0
        }
        const friendId = this.targetReferee.GetFriendTargetId(targetTeam);
        if (dic.has(friendId) && this.battleUnitBundle.activeList.includes(dic.get(friendId)!)) return;
        this.ChangeTargetAtRandom(targetTeam, TargetReferee_TargetType.Friend,
            this.battleUnitBundle.activeList.filter(u => u.Team === targetTeam), false, true); // b__1
    }
    /** @rva 0x149BE20 slot 8  public virtual void StoreCommand(CommandBase cmd) { } */
    StoreCommand(cmd: CommandBase): void {
        if (cmd == null) return;
        cmd._Time = this.elapsedTime;
        this.commandSender.commandQueue.push(cmd); // Queue<CommandBase>.Enqueue (inlined)
    }
    /** @rva 0x1499060  private void CheckDeadAndRevive(List<AffectedUnitNotice> noticeList) { } */
    CheckDeadAndRevive(noticeList: List<AffectedUnitNotice>): void {
        if (noticeList == null) return;
        for (const notice of noticeList) {
            if (notice.IsDead) this.OnBattleUnitDeath(notice.AffectedUnitId);
            if (notice.IsRevived) this.OnRevival(this.battleUnitBundle.dic.get(notice.AffectedUnitId)!);
        }
    }
    /** @rva 0x149AC50  private void OnRevival(BattleUnit revivalUnit) { } */
    OnRevival(revivalUnit: BattleUnit): void {
        const single = new Map<int, BattleUnit>();
        single.set(revivalUnit.Id, revivalUnit);
        PassiveSkill.TriggeringOnBattleStart(this, single, this.battleUnitBundle.dic, false);
        revivalUnit.TurnGauge.Reset(revivalUnit); // inlined in the game
    }
    /** @rva 0x1498EE0  public void ChangeTarget(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, int targetUnitId, bool isChangeTargetAfterAct = False) { } */
    ChangeTarget(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetUnitId: int, isChangeTargetAfterAct?: boolean /* = False */): void { return notPorted("GameDirectorBase.ChangeTarget", 0x1498EE0); }
    /** @rva 0x1498B20  private void ChangeTargetAtRandom(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, List<BattleUnit> targetCandidateList, bool withoutNotify = False, bool isChangeTargetAfterAct = False) { } */
    ChangeTargetAtRandom(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetCandidateList: List<BattleUnit>, withoutNotify?: boolean /* = False */, isChangeTargetAfterAct?: boolean /* = False */): void { return notPorted("GameDirectorBase.ChangeTargetAtRandom", 0x1498B20); }
    /** @rva 0x1498CF0  protected void ChangeTargetToCenter(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, List<BattleUnit> targetCandidateList, bool withoutNotify = False) { } */
    ChangeTargetToCenter(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetCandidateList: List<BattleUnit>, withoutNotify?: boolean /* = False */): void { return notPorted("GameDirectorBase.ChangeTargetToCenter", 0x1498CF0); }
    /** @rva 0x14988F0  public void ChangeBattlePhase(Phase battlePhase) { } */
    ChangeBattlePhase(battlePhase: Phase): void {
        if (this.BattlePhase !== Phase.Finish || battlePhase === Phase.Finish) {
            this.BattlePhase = battlePhase;
            this.StoreBattlePhaseCommand();
        }
        if (battlePhase !== Phase.Start) return;
        const restored = this.backupAgent.RestoreCommands();
        if (restored.length === 0) {
            this.Forward();
            return;
        }
        for (const command of restored) {
            // a pending skill decision is not resent while auto battle is on
            if (command instanceof CommandDecideSkillContent && this.autoType !== AutoType.Manual) continue;
            this.commandSender.StoreCommand(new CommandResend().ctor$CommandBase(command));
        }
        this.ForwardIfAutoAndSkillDecide();
    }
    /** @rva 0x14988E0  public void ChangeAutoControl(AutoType autoType) { } */
    ChangeAutoControl(autoType: AutoType): void { return notPorted("GameDirectorBase.ChangeAutoControl", 0x14988E0); }
    /** @rva 0x1499A00  private void ForwardIfAutoAndSkillDecide() { } */
    ForwardIfAutoAndSkillDecide(): void {
        if (this.BattlePhase !== Phase.Start || this.autoType === AutoType.Manual) return;
        const act = this.turnActSystem.CurrentAct;
        if (act instanceof SkillDecisionActBase && !act.IsDecided && act.actUnitTeam === BattleUnit_TeamType.Ally) this.Forward();
    }
    /** @rva 0x14988B0 slot 9  public virtual void BattleEnd() { } */
    BattleEnd(): void {
        if (this.BattlePhase === Phase.Finish) return;
        this.ChangeBattlePhase(Phase.Finish);
        const situation = GameDirectorBase_GameSituationDataCreator.Create(this);
        this.StoreCommand(new CommandSituationSync().ctor$GameSituationData_float(situation, this.elapsedTime));
    }
    /** @rva 0x149BF20 slot 10  public virtual int TurnTransition() { } */
    TurnTransition(): int {
        this.turnActSystem.turnReferee.ShiftNextTurn(this.battleUnitBundle.activeList, this);
        return 0;
    }
    /** @rva 0xA903B0  private void SetPauseState(bool isPaused) { } */
    SetPauseState(isPaused: boolean): void { this.isPaused = isPaused; /* asm: mov byte ptr [rcx + 0x6c], dl; ret */ }
    /** @rva 0x901C00  private void SetBattleSpeedType(BattleSpeedType battleSpeedType) { } */
    SetBattleSpeedType(battleSpeedType: BattleSpeedType): void { this.battleSpeedType = battleSpeedType; /* asm: mov dword ptr [rcx + 0x68], edx; ret */ }
    /** @rva 0x14985E0  private void AutoAction(SkillDecisionActBase decisionAct, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit currentTurnUnit) { } */
    AutoAction(decisionAct: SkillDecisionActBase, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, currentTurnUnit: BattleUnit): void { return notPorted("GameDirectorBase.AutoAction", 0x14985E0); }
    /** @rva 0x149A430  public void GetBattleUnitCondition(int battleUnitId) { } */
    GetBattleUnitCondition(battleUnitId: int): void { return notPorted("GameDirectorBase.GetBattleUnitCondition", 0x149A430); }
    /** @rva 0x149BE90  protected void SyncGameSituation() { } */
    SyncGameSituation(): void { return notPorted("GameDirectorBase.SyncGameSituation", 0x149BE90); }
    /** @rva 0x730170  public void DebugMode(bool isActive, OptionBase[] debugOptions) { } */
    DebugMode(isActive: boolean, debugOptions: any /* OptionBase */[]): void { /* asm: ret 0 */ }
    /** @rva 0x1499810 slot 11  protected virtual CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize { return notPorted("GameDirectorBase.CreateCommandInitialize", 0x1499810); }
    /** @rva 0x149B650 slot 12  public virtual void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void { return notPorted("GameDirectorBase.RespondToClientReadyRequest", 0x149B650); }
    /** @rva 0x149BC10  public void SendFinalizeCommand() { } */
    SendFinalizeCommand(): void { return notPorted("GameDirectorBase.SendFinalizeCommand", 0x149BC10); }
    /** @rva 0x149AD30  private SpecialAttackAct RegisterSpecialAttack(int unitId) { } */
    RegisterSpecialAttack(unitId: int): SpecialAttackAct {
        const unit = this.GetTargetBattleUnit(unitId);
        if (unit == null || unit.SpecialAttack == null || !unit.IsSpecialAttackPointMax() || unit.IsDead) return null!;
        if (unit.Condition.CanNotUseSkill || unit.Condition.CanNotUseSpecialAttack) return null!;
        const breakPoint = unit.BreakPoint;
        if (breakPoint.maxPointValue > 0 && breakPoint.PointValue < 1) return null!; // broken
        if (this.turnActSystem.actReferee.IsUnitSpecialAttackActRegistered(unitId)) return null!;
        const act = new SpecialAttackAct().ctor();
        act.actUnitId = unitId; // [CONFIRMED 3.19] only the unit id is set here, actUnitTeam stays Ally (0)
        this.turnActSystem.actReferee.AddAct$SpecialAttackAct(act);
        this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(
            this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this),
            CommandRefreshTurnActUnitOrder_RefreshReasonType.RegisterSpecialAttack, unitId));
        if (this.turnActSystem.CurrentAct === act && this.autoType === AutoType.Manual) {
            this.StoreCommand(new CommandDecideSkillContent().ctor$int_bool_bool_bool_DictionaryintBattleUnit(
                unitId, true, false, false, this.battleUnitBundle.dic));
        }
        return act;
    }
    /** @rva 0x149BFC0  private void UnregisterSpecialAttack(int unitId) { } */
    UnregisterSpecialAttack(unitId: int): void {
        const current = this.turnActSystem.CurrentAct;
        const wasPendingCurrent = current instanceof SpecialAttackAct && current.actUnitId === unitId && !current.IsDecided;
        if (!this.turnActSystem.actReferee.RemoveUnitSpecialAttackAct(unitId)) return;
        if (wasPendingCurrent) this.Forward();
        this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(
            this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this),
            CommandRefreshTurnActUnitOrder_RefreshReasonType.RegisterSpecialAttack, unitId));
    }
    /** @rva 0x14999E0  protected void FlushCommands() { } */
    FlushCommands(): void { return notPorted("GameDirectorBase.FlushCommands", 0x14999E0); }
    /** @rva 0x149AFA0 slot 13  public virtual void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void { return notPorted("GameDirectorBase.Request", 0x149AFA0); }
    /** @rva 0x14999E0  public void ManualFlushCommand() { } */
    ManualFlushCommand(): void { return notPorted("GameDirectorBase.ManualFlushCommand", 0x14999E0); }
    /** @rva 0x149BB90 slot 14  protected virtual void RunBattleToEnd(CancellationToken ct) { } */
    RunBattleToEnd(ct: any /* CancellationToken */): void { return notPorted("GameDirectorBase.RunBattleToEnd", 0x149BB90); }
    /** @rva 0x149A570  public int GetTeamTargetUnitIdOfUnit(int unitId) { } */
    GetTeamTargetUnitIdOfUnit$int(unitId: int): int {
        const unit = this.GetTargetBattleUnit(unitId);
        return unit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
    }
    /** @rva 0x149A5C0  public int GetTeamTargetUnitIdOfUnit(BattleUnit unit) { } */
    GetTeamTargetUnitIdOfUnit$BattleUnit(unit: BattleUnit): int {
        return unit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
    }
    /** @rva 0x1499920  private void DecideTurnUnitAct(int unitId, int skillMstId, int selectAllyUnitId) { } */
    DecideTurnUnitAct(unitId: int, skillMstId: int, selectAllyUnitId: int): void {
        const act = this.turnActSystem.CurrentAct;
        if (act instanceof SkillDecisionActBase && !act.IsDecided && act.actUnitId === unitId) {
            act.skillMstId = skillMstId;
            act.targetFriendUnitId = selectAllyUnitId;
            act.Decide();
        }
    }
    /** @rva 0x1499AB0 slot 15  protected virtual void Forward() { } */
    Forward(): void {
        const current = this.turnActSystem.CurrentAct;
        if (current == null || current.IsExecuted) {
            if (this.turnActSystem.actReferee.actList.length === 0) {
                const nextRound = this.turnActSystem.turnReferee.CalculateNextRound(this.battleUnitBundle.activeList);
                this.judgeResultReferee.CheckBattleFinishBeforeAct(nextRound);
                if (this.judgeResultReferee.result !== ResultStatus.None) {
                    this.BattleEnd();
                    return;
                }
            }
        }
        let act = this.turnActSystem.actReferee.currentAct;
        if (act == null || act.IsExecuted) {
            this.turnActSystem.Forward(this.battleUnitBundle.activeList, this);
            act = this.turnActSystem.actReferee.currentAct;
        }
        this.backupAgent.RefreshPrevBackup();
        if (!this.turnActSystem.actReferee.actList.some(a => a instanceof SpecialAttackAct)) { // <Forward>b__81_0
            const autoUnit = this.unitBrain.GetAutoSpecialAttackUseUnit(this.autoType, act,
                this.battleUnitBundle.allyList, this.battleUnitBundle.enemyList, this);
            if (autoUnit != null) {
                const registered = this.RegisterSpecialAttack(autoUnit.Id);
                if (this.turnActSystem.CurrentAct === registered) act = this.turnActSystem.actReferee.currentAct;
            }
        }
        const unit = this.GetTargetBattleUnit(act.actUnitId);
        const validate = ActExecutor.ValidateCanExecuteAct(act, this);
        if (validate === ActExecutor_ValidateActionType.FailAndSkip) {
            act.SetIsExecuted();
            if (act instanceof TurnUnitAct) ActExecutor.ResetTurnGaugeBeforeTurnUnitActExecute(act, this);
            this.Forward();
            return;
        }
        if (validate === ActExecutor_ValidateActionType.FailAndDecide) {
            if (!(act instanceof SkillDecisionActBase)) throw new Error("選択行動ではありません！"); // "not a decision act!"
            act.ResetDecision();
            if (unit.Team !== BattleUnit_TeamType.Enemy && this.autoType === AutoType.Manual) {
                // the player decides: report the order and ask for the skill
                this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(
                    this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this), 0 as CommandRefreshTurnActUnitOrder_RefreshReasonType, 0));
                this.StoreCommand(CommandDecideSkillContent.Create(act, this.battleUnitBundle.dic));
                return;
            }
            const bundle = new BattleConditionUtils_ConditionCheckDataBundle().ctor();
            bundle._GameDirector = this;
            bundle._SelfUnit = unit;
            bundle._ActorUnit = unit;
            bundle._MainTargetUnit = null!;
            bundle._ActorActiveSkill = null!;
            bundle._AffectedUnitNoticeBundle = null!;
            bundle._AffectedUnits = null!;
            this.AutoAction(act, bundle, unit);
            if (!act.IsDecided) {
                act.SetIsExecuted();
                if (act instanceof TurnUnitAct) ActExecutor.ResetTurnGaugeBeforeTurnUnitActExecute(act, this);
                this.Forward();
                return;
            }
        }
        const command = ActExecutor.Execute(act, this);
        act.SetIsExecuted();
        this.CheckHpGaugeRevive();
        const activeList = this.battleUnitBundle.activeList;
        this.turnActSystem.UpdateTurnActOrder(activeList);
        const countsAsTurn = act instanceof TurnUnitActBase || act instanceof SpecialAttackAct || act instanceof AdditionalSkillAct || act instanceof StartTimingAct;
        // the order info is built as if the actor's TurnNum had already advanced
        if (countsAsTurn) { const u = this.battleUnitBundle.dic.get(act.actUnitId)!; u.TurnNum = u.TurnNum + 1; }
        command._TurnActOrderUnitInfo = this.turnActSystem.CreateTurnActUnitOrderInfo(activeList, this);
        if (countsAsTurn) { const u = this.battleUnitBundle.dic.get(act.actUnitId)!; u.TurnNum = u.TurnNum - 1; }
        this.UpdateLinkHp(command.AffectedUnitNoticeList, this);
        this.CheckModeChange();
        this.StoreCommand(command);
        this.CheckDeadAndRevive(command.AffectedUnitNoticeList);
        this.CheckBattleFinishAfterAct();
        if (this.judgeResultReferee.result === ResultStatus.None) {
            this.PrepareEndlessEnemySupply();
            this.CheckTargetUnit(BattleUnit_TeamType.Ally);
            this.CheckTargetUnit(BattleUnit_TeamType.Enemy);
            this.SyncGameSituation();
        } else {
            this.BattleEnd();
        }
    }
    /** @rva 0x1498FA0 slot 16  protected virtual void CheckBattleFinishAfterAct() { } */
    CheckBattleFinishAfterAct(): void {
        this.judgeResultReferee.CheckBattleFinishAfterAct(this.battleUnitBundle.activeList);
    }
    /** @rva 0x14991F0  private void CheckHpGaugeRevive() { } */
    CheckHpGaugeRevive(): void {
        for (const unit of this.battleUnitBundle.dic.values()) {
            if (unit.HP > 0 || unit.CurrentHpGaugeCount < 2) continue;
            const act = new HpGaugeReviveAct().ctor();
            act.actUnitId = unit.Id;
            act.actUnitTeam = unit.Team;
            this.turnActSystem.actReferee.AddAct$ActBase(act);
            // quest judge "main target down to N HP gauges": win as soon as the main target's gauge breaks to N
            const param = unit.BattleParameter;
            const judge = this.judgeResultReferee;
            if (param instanceof QuestEnemyAppearanceParameter && param.IsMainTargetEnemy && judge instanceof QuestJudgeResultReferee
                && judge.judgeResultType === JudgeResultType.MainTargetRemainHpGaugeCount
                && unit.CurrentHpGaugeCount - 1 <= judge.judgeResultValue && judge.result === ResultStatus.None) {
                judge.result = ResultStatus.Winning;
            }
        }
    }
    /** @rva 0x730170 slot 17  protected virtual void CheckModeChange() { } */
    CheckModeChange(): void { /* asm: ret 0 */ }
    /** @rva 0x1498FE0  public void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: any /* DateTimeOffset */): void { return notPorted("GameDirectorBase.CheckBattleFinishByTimeLimit", 0x1498FE0); }
    /** @rva 0x730170 slot 18  protected virtual void UpdateLinkHp(List<AffectedUnitNotice> noticeList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, gameDirector: GameDirectorBase): void { /* asm: ret 0 */ }
    /** @rva 0x730170 slot 19  protected virtual void PrepareEndlessEnemySupply() { } */
    PrepareEndlessEnemySupply(): void { /* asm: ret 0 */ }
    /** @rva 0x149C130  private static void .cctor() { } */
    static cctor(): void { return notPorted("GameDirectorBase..cctor", 0x149C130); }
    /** @rva 0x149BF60  private void <InitializeBattle>b__46_0(BattleUnit unit) { } */
    $InitializeBattle$b__46_0(unit: BattleUnit): void { return notPorted("GameDirectorBase.<InitializeBattle>b__46_0", 0x149BF60); }
    /** @rva 0x149BF90  private void <InitializeBattle>b__46_1(BattleUnit unit) { } */
    $InitializeBattle$b__46_1(unit: BattleUnit): void { return notPorted("GameDirectorBase.<InitializeBattle>b__46_1", 0x149BF90); }
    /** @rva 0x149BF60  private void <RespondToClientReadyRequest>b__70_1(BattleUnit unit) { } */
    $RespondToClientReadyRequest$b__70_1(unit: BattleUnit): void { return notPorted("GameDirectorBase.<RespondToClientReadyRequest>b__70_1", 0x149BF60); }
    /** @rva 0x149BF90  private void <RespondToClientReadyRequest>b__70_2(BattleUnit unit) { } */
    $RespondToClientReadyRequest$b__70_2(unit: BattleUnit): void { return notPorted("GameDirectorBase.<RespondToClientReadyRequest>b__70_2", 0x149BF90); }
}

// ---- ReDriveBattleCore.GameDirectorBase.GameSituationDataCreator  (TypeDefIndex 402, public static class) ----
export class GameDirectorBase_GameSituationDataCreator {
    /** @rva 0x149C7D0  public static GameSituationData Create(GameDirectorBase gameDirector) { } */
    static Create(gameDirector: GameDirectorBase): GameSituationData { return notPorted("GameDirectorBase_GameSituationDataCreator.Create", 0x149C7D0); }
    /** @rva 0x149C680  private static BattleUnitSituationData[] CreateBattleUnitSituationDatas(GameDirectorBase gameDirector) { } */
    static CreateBattleUnitSituationDatas(gameDirector: GameDirectorBase): BattleUnitSituationData[] { return notPorted("GameDirectorBase_GameSituationDataCreator.CreateBattleUnitSituationDatas", 0x149C680); }
    /** @rva 0x149CA00  internal static BattleUnitSituationData <CreateBattleUnitSituationDatas>g__ConvertDataToSituation|1_1(BattleUnit unit) { } */
    static $CreateBattleUnitSituationDatas$g__ConvertDataToSituation_1_1(unit: BattleUnit): BattleUnitSituationData { return notPorted("GameDirectorBase_GameSituationDataCreator.<CreateBattleUnitSituationDatas>g__ConvertDataToSituation|1_1", 0x149CA00); }
}
