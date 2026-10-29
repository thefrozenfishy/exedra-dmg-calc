// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { StepUpSkillHandler } from "./StepUpSkillHandler";
import { StepUpSkillRequest } from "./Request/StepUpSkillRequest";
import { SkipForcedAutomaticBattleRequest } from "./Request/SkipForcedAutomaticBattleRequest";
import { RegisterSpecialAttackRequest } from "./Request/RegisterSpecialAttackRequest";
import { TimeForwardRequest } from "./Request/TimeForwardRequest";
import { ChangePauseStateRequest } from "./Request/ChangePauseStateRequest";
import { ChangeBattleSpeedTypeRequest } from "./Request/ChangeBattleSpeedTypeRequest";
import { ChangeAutoControlRequest } from "./Request/ChangeAutoControlRequest";
import { UnitConditionRequest } from "./Request/UnitConditionRequest";
import { BattlePhaseRequest } from "./Request/BattlePhaseRequest";
import { SkillRequest } from "./Request/SkillRequest";
import { UniqueLvUnitStateBase } from "./UnitState/UniqueLvUnitStateBase";
import { BattleUnitSituationData, BattleUnitSituationData_UniqueLvStateIconData } from "./BattleUnitSituationData";
import { GameSituationData } from "./GameSituationData";
import { BattleUnitInfo } from "./Command/BattleUnitInfo";
import { CommandReproduction } from "./Command/CommandReproduction";
import { CommandFinalize } from "./Command/CommandFinalize";
import { CommandInitialize } from "./Command/CommandInitialize";
import { CommandUnitCondition } from "./Command/CommandUnitCondition";
import { CommandTarget } from "./Command/CommandTarget";
import { CommandBattlePhase, CommandBattlePhase_ReadyPhaseData, CommandBattlePhase_FinishPhaseData } from "./Command/CommandBattlePhase";
import { TurnReferee } from "./TurnReferee";
import { BackupAgent } from "./BackupAgent";
import { TurnActSystem } from "./TurnActSystem";
import { SpReferee } from "./SpReferee";
import { UnitBrain } from "./AI/UnitBrain";
import { BattleUnitBundle } from "./BattleUnitBundle";
import { CommandSender } from "./CommandSender";
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
import { TargetReferee, TargetReferee_TargetType } from "./TargetReferee";
import { BattleUnit_TeamType } from "./BattleUnit";
import { HpGaugeReviveAct } from "./Act/HpGaugeReviveAct";
import { StartTimingAct } from "./Act/StartTimingAct";
import { AdditionalSkillAct } from "./Act/AdditionalSkillAct";
import { TurnUnitActBase } from "./Act/TurnUnitActBase";
import { TurnUnitAct } from "./Act/TurnUnitAct";
import { SkillDecisionActBase } from "./Act/SkillDecisionActBase";
import { SpecialAttackAct } from "./Act/SpecialAttackAct";
import { ActExecutor, ActExecutor_ValidateActionType } from "./Act/ActExecutor";
import { notPorted, orderBy, orderByNewGuid, ref, trunc } from "../runtime";
import type { Dictionary, List, float, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";

import type { AffectedUnitNotice } from "./AffectedUnitNotice";

import type { BattleSpeedType } from "./BattleSpeedType";
import type { BattleUnit } from "./BattleUnit";

import type { CommandBase } from "./Command/CommandBase";

import type { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";
import type { RequestBase } from "./Request/RequestBase";
import { ActiveSkillBase } from "./ActiveSkillBase";

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
    /** @rva 0x14AC950  protected Dictionary<int, BattleUnit> get_battleUnitDic() { } */
    get_battleUnitDic(): Dictionary<int, BattleUnit> { return this.battleUnitBundle.dic; }
    /** @rva 0x14AC950  public Dictionary<int, BattleUnit> get_BattleUnits() { } */
    get_BattleUnits(): Dictionary<int, BattleUnit> { return this.battleUnitBundle.dic; /* same code as get_battleUnitDic */ }
    /** @rva 0x7368E0  public UnitBrain get_UnitBrain() { } */
    get_UnitBrain(): UnitBrain { return this.unitBrain; /* asm: mov rax, qword ptr [rcx + 0x40]; ret */ }
    /** @rva 0x75ED80  public List<BattleUnit> get_AllyUnitList() { } */
    get_AllyUnitList(): List<BattleUnit> { return this.battleUnitBundle.allyList; }
    /** @rva 0x14AC970  public List<BattleUnit> get_EnemyUnitList() { } */
    get_EnemyUnitList(): List<BattleUnit> { return this.battleUnitBundle.enemyList; }
    /** @rva 0x14AC930  public List<BattleUnit> get_ActiveUnitList() { } */
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
    /** @rva 0x14AC990  protected TurnReferee get_turnReferee() { } */
    get_turnReferee(): TurnReferee { return this.turnActSystem.turnReferee; }
    /** @rva 0x14AC4D0  public void .ctor() { } */
    ctor(): this {
        this.lastUpdateTimePerSecond = -1;
        this.commandSender = new CommandSender().ctor(); // inlined in the game
        this.battleUnitBundle = new BattleUnitBundle().ctor(); // inlined in the game
        this.unitBrain = new UnitBrain().ctor();
        this.targetReferee = new TargetReferee().ctor();
        this.spReferee = new SpReferee().ctor();
        this.turnActSystem = new TurnActSystem().ctor();
        this.backupAgent = new BackupAgent().ctor$GameDirectorBase(this);
        this.commandSender.Subscribe(this.backupAgent); // inlined in the game
        return this;
    }
    /** @rva 0xCCC560  protected void Ready() { } */
    Ready(): void {
        this.BattlePhase = 0;
    }
    /** @rva 0x14AA8D0  protected void InitializeBattle() { } */
    InitializeBattle(): void {
        const allyList = this.battleUnitBundle.allyList;
        const enemyList = this.battleUnitBundle.enemyList;
        this.ChangeTargetToCenter(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Attack, enemyList, true);
        this.ChangeTargetAtRandom(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Friend, allyList, true, false);
        this.ChangeTargetAtRandom(BattleUnit_TeamType.Enemy, TargetReferee_TargetType.Attack, allyList, true, false);
        this.ChangeTargetAtRandom(BattleUnit_TeamType.Enemy, TargetReferee_TargetType.Friend, enemyList, true, false);
        this.spReferee.Init();
        this.battleUnitBundle.activeList.forEach(unit => this.$InitializeBattle$b__46_0(unit));
        this.battleUnitBundle.activeList.forEach(unit => this.$InitializeBattle$b__46_1(unit));
        this.battleUnitBundle.activeList.forEach(unit => unit.TurnGauge.Reset(unit)); // <>c.<InitializeBattle>b__46_2 (Reset inlined in the game)
        const dic = this.battleUnitBundle.dic;
        PassiveSkill.TriggeringOnBattleStart(this, dic, dic, false);
        for (const unit of this.battleUnitBundle.activeList) unit.Refresh(); // <>c.<InitializeBattle>b__46_3 (List.ForEach)
    }
    /** @rva 0x14ABFC0 slot 5  protected virtual void StoreBattlePhaseCommand() { } */
    StoreBattlePhaseCommand(): void {
        let readyPhase: CommandBattlePhase_ReadyPhaseData = null!;
        let finishPhase: CommandBattlePhase_FinishPhaseData = null!;
        if (this.BattlePhase === Phase.Ready) {
            const nextAllyTurnUnitId = ref<int>(0);
            if (TurnReferee.TryGetNextAllyTurnUnitId(this.battleUnitBundle.activeList, nextAllyTurnUnitId)) {
                readyPhase = new CommandBattlePhase_ReadyPhaseData().ctor();
                readyPhase._firstAllyUnitId = nextAllyTurnUnitId.v;
            }
        } else if (this.BattlePhase === Phase.Finish) {
            finishPhase = new CommandBattlePhase_FinishPhaseData().ctor();
            finishPhase._isWinPlayer = this.judgeResultReferee.result === ResultStatus.Winning;
            finishPhase._battleFinishByRoundLimit = this.judgeResultReferee.BattleFinishByRoundLimit;
            finishPhase._battleFinishByTimeLimit = this.judgeResultReferee.BattleFinishByTimeLimit;
        }
        this.StoreCommand(new CommandBattlePhase().ctor$Phase_ReadyPhaseData_FinishPhaseData(this.BattlePhase, readyPhase, finishPhase));
    }
    /** @rva 0x14AA7C0  public BattleUnit GetTargetBattleUnit(int battleUnitId) { } */
    GetTargetBattleUnit(battleUnitId: int): BattleUnit {
        return this.battleUnitBundle.dic.get(battleUnitId) ?? null!;
    }
    /** @rva 0x14AAC70 slot 6  public virtual void OnBattleUnitDeath(int deathObjectId) { } */
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
    /** @rva 0x14A9790 slot 7  protected virtual void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void {
        this.judgeResultReferee.CheckMainTargetEnemyDead(deathUnit);
    }
    /** @rva 0x14A97C0  protected void CheckTargetUnit(BattleUnit.TeamType targetTeam) { } */
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
    /** @rva 0x14AC150 slot 8  public virtual void StoreCommand(CommandBase cmd) { } */
    StoreCommand(cmd: CommandBase): void {
        if (cmd == null) return;
        cmd._Time = this.elapsedTime;
        this.commandSender.commandQueue.push(cmd); // Queue<CommandBase>.Enqueue (inlined)
    }
    /** @rva 0x14A9330  private void CheckDeadAndRevive(List<AffectedUnitNotice> noticeList) { } */
    CheckDeadAndRevive(noticeList: List<AffectedUnitNotice>): void {
        if (noticeList == null) return;
        for (const notice of noticeList) {
            if (notice.IsDead) this.OnBattleUnitDeath(notice.AffectedUnitId);
            if (notice.IsRevived) this.OnRevival(this.battleUnitBundle.dic.get(notice.AffectedUnitId)!);
        }
    }
    /** @rva 0x14AAF20  private void OnRevival(BattleUnit revivalUnit) { } */
    OnRevival(revivalUnit: BattleUnit): void {
        const single = new Map<int, BattleUnit>();
        single.set(revivalUnit.Id, revivalUnit);
        PassiveSkill.TriggeringOnBattleStart(this, single, this.battleUnitBundle.dic, false);
        revivalUnit.TurnGauge.Reset(revivalUnit); // inlined in the game
    }
    /** @rva 0x14A91B0  public void ChangeTarget(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, int targetUnitId, bool isChangeTargetAfterAct = False) { } */
    ChangeTarget(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetUnitId: int, isChangeTargetAfterAct?: boolean /* = False */): void {
        this.targetReferee.ChangeTarget(targetTeam, targetType, targetUnitId);
        this.StoreCommand(new CommandTarget().ctor$TeamType_TargetType_int_bool(targetTeam, targetType, targetUnitId, isChangeTargetAfterAct ?? false));
    }
    /** @rva 0x14A8DF0  private void ChangeTargetAtRandom(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, List<BattleUnit> targetCandidateList, bool withoutNotify = False, bool isChangeTargetAfterAct = False) { } */
    ChangeTargetAtRandom(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetCandidateList: List<BattleUnit>, withoutNotify?: boolean /* = False */, isChangeTargetAfterAct?: boolean /* = False */): void {
        if (targetCandidateList == null || targetCandidateList.length === 0) return;
        const unit = orderByNewGuid(targetCandidateList, "target", [`${targetTeam === 0 ? "Ally" : "Enemy"} ${targetType === 0 ? "attack" : "friend"}`])[0]; // OrderBy(<>c.b__56_0: Guid.NewGuid()).First()
        if (unit == null) return;
        if (!(withoutNotify ?? false)) {
            this.ChangeTarget(targetTeam, targetType, unit.Id, isChangeTargetAfterAct ?? false);
            return;
        }
        this.targetReferee.ChangeTarget(targetTeam, targetType, unit.Id); // inlined in the game
    }
    /** @rva 0x14A8FC0  protected void ChangeTargetToCenter(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, List<BattleUnit> targetCandidateList, bool withoutNotify = False) { } */
    ChangeTargetToCenter(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetCandidateList: List<BattleUnit>, withoutNotify?: boolean /* = False */): void {
        const count = targetCandidateList.length; // Enumerable.Count
        const sorted = orderBy(targetCandidateList, u => u.PositionId); // <>c.b__57_0
        const index = trunc(count / 2);
        if (index >= sorted.length) throw new RangeError("IndexOutOfRangeException");
        const unit = sorted[index];
        if (unit == null) return;
        if (!(withoutNotify ?? false)) {
            this.ChangeTarget(targetTeam, targetType, unit.Id, false); // inlined in the game
            return;
        }
        this.targetReferee.ChangeTarget(targetTeam, targetType, unit.Id); // inlined in the game
    }
    /** @rva 0x14A8BC0  public void ChangeBattlePhase(Phase battlePhase) { } */
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
    /** @rva 0x14A8BB0  public void ChangeAutoControl(AutoType autoType) { } */
    ChangeAutoControl(autoType: AutoType): void {
        this.autoType = autoType;
        this.ForwardIfAutoAndSkillDecide();
    }
    /** @rva 0x14A9CD0  private void ForwardIfAutoAndSkillDecide() { } */
    ForwardIfAutoAndSkillDecide(): void {
        if (this.BattlePhase !== Phase.Start || this.autoType === AutoType.Manual) return;
        const act = this.turnActSystem.CurrentAct;
        if (act instanceof SkillDecisionActBase && !act.IsDecided && act.actUnitTeam === BattleUnit_TeamType.Ally) this.Forward();
    }
    /** @rva 0x14A8B80 slot 9  public virtual void BattleEnd() { } */
    BattleEnd(): void {
        if (this.BattlePhase === Phase.Finish) return;
        this.ChangeBattlePhase(Phase.Finish);
        this.SyncGameSituation(); // tail call (jmp 0x149be90)
    }
    /** @rva 0x14AC250 slot 10  public virtual int TurnTransition() { } */
    TurnTransition(): int {
        this.turnActSystem.turnReferee.ShiftNextTurn(this.battleUnitBundle.activeList, this);
        return 0;
    }
    /** @rva 0xAA4080  private void SetPauseState(bool isPaused) { } */
    SetPauseState(isPaused: boolean): void { this.isPaused = isPaused; /* asm: mov byte ptr [rcx + 0x6c], dl; ret */ }
    /** @rva 0x901760  private void SetBattleSpeedType(BattleSpeedType battleSpeedType) { } */
    SetBattleSpeedType(battleSpeedType: BattleSpeedType): void { this.battleSpeedType = battleSpeedType; /* asm: mov dword ptr [rcx + 0x68], edx; ret */ }
    /** @rva 0x14A88B0  private void AutoAction(SkillDecisionActBase decisionAct, BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, BattleUnit currentTurnUnit) { } */
    AutoAction(decisionAct: SkillDecisionActBase, conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, currentTurnUnit: BattleUnit): void {
        let turnUnitAct: TurnUnitActBase | null;
        let friendList: List<BattleUnit>;
        let opponentList: List<BattleUnit>;
        if (currentTurnUnit.Team === BattleUnit_TeamType.Ally) {
            turnUnitAct = decisionAct instanceof TurnUnitActBase ? decisionAct : null;
            opponentList = this.battleUnitBundle.enemyList;
            friendList = this.battleUnitBundle.allyList;
        } else {
            turnUnitAct = decisionAct instanceof TurnUnitActBase ? decisionAct : null;
            opponentList = this.battleUnitBundle.allyList;
            friendList = this.battleUnitBundle.enemyList;
        }
        const skill: ActiveSkillBase = turnUnitAct == null
            ? currentTurnUnit.SpecialAttack
            : this.unitBrain.AutoSelectActiveSkillOrNormalAttack(conditionCheckDataBundle, currentTurnUnit, this, opponentList, friendList);
        if (skill == null) return;
        const attackTargetId = currentTurnUnit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
        const targets = this.unitBrain.TargetingUnits(attackTargetId, currentTurnUnit, skill, opponentList, friendList);
        this.unitBrain.ClearAIFilteredTargetsDictionary();
        if (targets[0] !== 0) {
            const current = currentTurnUnit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
            if (targets[0] !== current) this.ChangeTarget(currentTurnUnit.Team, TargetReferee_TargetType.Attack, targets[0], false);
        }
        if (decisionAct == null) return;
        if (decisionAct instanceof TurnUnitActBase) {
            decisionAct.SetDecisionContent(skill.Id, targets[1]);
        } else {
            if (!(decisionAct instanceof SpecialAttackAct)) return;
            decisionAct.targetFriendUnitId = targets[1];
        }
        decisionAct.Decide();
    }
    /** @rva 0x14AA700  public void GetBattleUnitCondition(int battleUnitId) { } */
    GetBattleUnitCondition(battleUnitId: int): void {
        const unit = this.battleUnitBundle.dic.get(battleUnitId);
        if (unit !== undefined) this.StoreCommand(new CommandUnitCondition().ctor$BattleUnit(unit));
    }
    /** @rva 0x14AC1C0  protected void SyncGameSituation() { } */
    SyncGameSituation(): void {
        const situation = GameDirectorBase_GameSituationDataCreator.Create(this);
        this.StoreCommand(new CommandSituationSync().ctor$GameSituationData_float(situation, this.elapsedTime));
    }
    /** @rva 0x730170  public void DebugMode(bool isActive, OptionBase[] debugOptions) { } */
    DebugMode(isActive: boolean, debugOptions: any /* OptionBase */[]): void { /* asm: ret 0 */ }
    /** @rva 0x14A9AE0 slot 11  protected virtual CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize {
        return new CommandInitialize().ctor$BattleUnitInfo_int_int_int_int_int_int_bool_GameSituationData(battleUnitInfoArray,
            targetReferee.allyAttackTargetId, targetReferee.allyFriendTargetId, targetReferee.enemyAttackTargetId, targetReferee.enemyFriendTargetId,
            spReferee.allySp, spReferee.enemySp, this.isForcedAutomatic, gameSituationData);
    }
    /** @rva 0x14AB980 slot 12  public virtual void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void {
        let command: CommandBase;
        if (this.BattlePhase === Phase.Ready || (this.BattlePhase === Phase.Start && !(this.backupAgent.RestoreCommands().length > 0))) {
            const infos = [...this.battleUnitBundle.dic.values()].map(unit => new BattleUnitInfo().ctor$BattleUnit(unit)); // <>c.b__70_0
            const situation = GameDirectorBase_GameSituationDataCreator.Create(this);
            command = this.CreateCommandInitialize(infos, this.targetReferee, this.spReferee, situation);
        } else {
            if (this.BattlePhase !== Phase.Finish) this.BattlePhase = Phase.Ready;
            this.battleUnitBundle.activeList.forEach(unit => this.$RespondToClientReadyRequest$b__70_1(unit));
            [...this.battleUnitBundle.dic.values()].forEach(unit => this.$RespondToClientReadyRequest$b__70_2(unit));
            let situation = this.backupAgent.RestorePrevSituationData();
            let infos = this.backupAgent.RestoreBattleUnitInfoArray();
            let turnOrder = this.backupAgent.RestoreTurnActOrderUnitInfo();
            if (situation == null || infos == null || !(infos.length > 0)) {
                situation = GameDirectorBase_GameSituationDataCreator.Create(this);
                infos = this.battleUnitBundle.activeList.map(unit => new BattleUnitInfo().ctor$BattleUnit(unit)); // <>c.b__70_3
                turnOrder = this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this);
            }
            const init = this.CreateCommandInitialize(infos, this.targetReferee, this.spReferee, null!);
            command = new CommandReproduction().ctor$TurnActOrderUnitInfo_GameSituationData_CommandInitialize(turnOrder, situation, init);
        }
        this.StoreCommand(command);
        this.StoreBattlePhaseCommand();
    }
    /** @rva 0x14ABF40  public void SendFinalizeCommand() { } */
    SendFinalizeCommand(): void {
        this.StoreCommand(new CommandFinalize().ctor());
        this.commandSender.Flush(); // inlined in the game
    }
    /** @rva 0x14AB000  private SpecialAttackAct RegisterSpecialAttack(int unitId) { } */
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
    /** @rva 0x14AC2F0  private void UnregisterSpecialAttack(int unitId) { } */
    UnregisterSpecialAttack(unitId: int): void {
        const current = this.turnActSystem.CurrentAct;
        const wasPendingCurrent = current instanceof SpecialAttackAct && current.actUnitId === unitId && !current.IsDecided;
        if (!this.turnActSystem.actReferee.RemoveUnitSpecialAttackAct(unitId)) return;
        if (wasPendingCurrent) this.Forward();
        this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(
            this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this),
            CommandRefreshTurnActUnitOrder_RefreshReasonType.RegisterSpecialAttack, unitId));
    }
    /** @rva 0x14A9CB0  protected void FlushCommands() { } */
    FlushCommands(): void {
        this.commandSender.Flush(); // inlined in the game
    }
    /** @rva 0x14AB270 slot 13  public virtual void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void {
        if (request == null) return;
        switch (request.RequestType) {
            case 1:
                if (request instanceof SkillRequest) {
                    if (this.BattlePhase === Phase.Finish) return;
                    this.ChangeTarget(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Attack, request.targetBattleUnitId, false);
                    this.ChangeTarget(BattleUnit_TeamType.Ally, TargetReferee_TargetType.Friend, request.selectAllyUnitId, false);
                    const act = this.turnActSystem.CurrentAct;
                    if (act instanceof SkillDecisionActBase && !act.IsDecided && act.actUnitId === request.battleUnitId) {
                        act.skillMstId = request.skillMstId;
                        act.targetFriendUnitId = request.selectAllyUnitId;
                        act.Decide();
                    }
                    this.Forward();
                }
                break;
            case 2:
                if (request instanceof BattlePhaseRequest) {
                    if (request.phase === Phase.Finish) {
                        const judge = this.judgeResultReferee;
                        if (judge.result !== ResultStatus.None) judge.result = ResultStatus.None; // ResetResult inlined
                        if (judge.result === ResultStatus.None) judge.result = (2 - (request.isWin ? 1 : 0)) as ResultStatus; // SetResult inlined
                    }
                    this.ChangeBattlePhase(request.phase);
                }
                break;
            case 5:
                if (request instanceof UnitConditionRequest) {
                    const unit = this.battleUnitBundle.dic.get(request.battleUnitId);
                    if (unit !== undefined) this.StoreCommand(new CommandUnitCondition().ctor$BattleUnit(unit));
                }
                break;
            case 7:
                if (request instanceof ChangeAutoControlRequest) {
                    this.autoType = request.autoType;
                    this.ForwardIfAutoAndSkillDecide();
                }
                break;
            case 8:
                this.RespondToClientReadyRequest();
                break;
            case 9:
                if (request instanceof ChangeBattleSpeedTypeRequest) this.battleSpeedType = request.battleSpeedType;
                break;
            case 10:
                if (request instanceof ChangePauseStateRequest) this.isPaused = request.isPaused;
                break;
            case 11:
                if (request instanceof TimeForwardRequest) {
                    if (this.BattlePhase === Phase.Finish) return;
                    this.Forward();
                }
                break;
            case 12:
                if (request instanceof RegisterSpecialAttackRequest) {
                    const unitId = request.battleUnitId;
                    if (!request.isRegister) {
                        const current = this.turnActSystem.CurrentAct;
                        const wasWaiting = current instanceof SpecialAttackAct && current.actUnitId === unitId && !current.IsDecided;
                        if (this.turnActSystem.actReferee.RemoveUnitSpecialAttackAct(unitId)) {
                            if (wasWaiting) this.Forward();
                            const info = this.turnActSystem.CreateTurnActUnitOrderInfo(this.battleUnitBundle.activeList, this);
                            this.StoreCommand(new CommandRefreshTurnActUnitOrder().ctor$TurnActOrderUnitInfo_RefreshReasonType_int(info, 1 as CommandRefreshTurnActUnitOrder_RefreshReasonType, unitId));
                        }
                    } else {
                        this.RegisterSpecialAttack(unitId);
                    }
                }
                break;
            case 14:
                if (request instanceof SkipForcedAutomaticBattleRequest && this.isForcedAutomatic) this.RunBattleToEnd(cancellationToken);
                break;
            case 16: // 3.21.0
                if (request instanceof StepUpSkillRequest) {
                    if (this.BattlePhase === Phase.Finish) return;
                    StepUpSkillHandler.HandleRequest(this, request);
                }
                break;
        }
        if (!dontFlushCommand) this.commandSender.Flush();
    }
    /** @rva 0x14A9CB0  public void ManualFlushCommand() { } */
    ManualFlushCommand(): void {
        this.commandSender.Flush(); // same code as FlushCommands
    }
    /** @rva 0x14ABEC0 slot 14  protected virtual void RunBattleToEnd(CancellationToken ct) { } */
    RunBattleToEnd(ct: any /* CancellationToken */): void {
        while (this.BattlePhase !== Phase.Finish) {
            if (ct != null && ct.IsCancellationRequested) break;
            this.Forward();
        }
    }
    /** @rva 0x14AA840  public int GetTeamTargetUnitIdOfUnit(int unitId) { } */
    GetTeamTargetUnitIdOfUnit$int(unitId: int): int {
        const unit = this.GetTargetBattleUnit(unitId);
        return unit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
    }
    /** @rva 0x14AA890  public int GetTeamTargetUnitIdOfUnit(BattleUnit unit) { } */
    GetTeamTargetUnitIdOfUnit$BattleUnit(unit: BattleUnit): int {
        return unit.Team === BattleUnit_TeamType.Ally ? this.targetReferee.allyAttackTargetId : this.targetReferee.enemyAttackTargetId;
    }
    /** @rva 0x14A9BF0  private void DecideTurnUnitAct(int unitId, int skillMstId, int selectAllyUnitId) { } */
    DecideTurnUnitAct(unitId: int, skillMstId: int, selectAllyUnitId: int): void {
        const act = this.turnActSystem.CurrentAct;
        if (act instanceof SkillDecisionActBase && !act.IsDecided && act.actUnitId === unitId) {
            act.skillMstId = skillMstId;
            act.targetFriendUnitId = selectAllyUnitId;
            act.Decide();
        }
    }
    /** @rva 0x14A9D80 slot 15  protected virtual void Forward() { } */
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
                this.StoreCommand(CommandDecideSkillContent.Create(act, this.battleUnitBundle.dic, this.spReferee));
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
    /** @rva 0x14A9270 slot 16  protected virtual void CheckBattleFinishAfterAct() { } */
    CheckBattleFinishAfterAct(): void {
        this.judgeResultReferee.CheckBattleFinishAfterAct(this.battleUnitBundle.activeList);
    }
    /** @rva 0x14A94C0  private void CheckHpGaugeRevive() { } */
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
    /** @rva 0x14A92B0  public void CheckBattleFinishByTimeLimit(DateTimeOffset currentTime) { } */
    CheckBattleFinishByTimeLimit(currentTime: any /* DateTimeOffset */): void {
        if (this.judgeResultReferee.result !== ResultStatus.None) return;
        this.judgeResultReferee.CheckBattleFinishByTimeLimit(currentTime);
        if (this.judgeResultReferee.result === ResultStatus.None) return;
        this.BattleEnd();
        this.commandSender.Flush(); // inlined in the game
    }
    /** @rva 0x730170 slot 18  protected virtual void UpdateLinkHp(List<AffectedUnitNotice> noticeList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, gameDirector: GameDirectorBase): void { /* asm: ret 0 */ }
    /** @rva 0x730170 slot 19  protected virtual void PrepareEndlessEnemySupply() { } */
    PrepareEndlessEnemySupply(): void { /* asm: ret 0 */ }
    /** @rva 0x14AC460  private static void .cctor() { } */
    static cctor(): void {
        GameDirectorBase.Version = 0xf4628;
        GameDirectorBase.AllyIdStart = 1;
        GameDirectorBase.EnemyIdStart = -1;
    }
    /** @rva 0x14AC290  private void <InitializeBattle>b__46_0(BattleUnit unit) { } */
    $InitializeBattle$b__46_0(unit: BattleUnit): void {
        unit.Condition.gameDirector = this;
    }
    /** @rva 0x14AC2C0  private void <InitializeBattle>b__46_1(BattleUnit unit) { } */
    $InitializeBattle$b__46_1(unit: BattleUnit): void {
        unit.SetActiveConditionCheckDataBundle(this);
    }
    /** @rva 0x14AC290  private void <RespondToClientReadyRequest>b__70_1(BattleUnit unit) { } */
    $RespondToClientReadyRequest$b__70_1(unit: BattleUnit): void {
        unit.Condition.gameDirector = this; // same code as <InitializeBattle>b__46_0
    }
    /** @rva 0x14AC2C0  private void <RespondToClientReadyRequest>b__70_2(BattleUnit unit) { } */
    $RespondToClientReadyRequest$b__70_2(unit: BattleUnit): void {
        unit.SetActiveConditionCheckDataBundle(this); // same code as <InitializeBattle>b__46_1
    }
}

// ---- ReDriveBattleCore.GameDirectorBase.GameSituationDataCreator  (TypeDefIndex 402, public static class) ----
export class GameDirectorBase_GameSituationDataCreator {
    /** @rva 0x14ACB00  public static GameSituationData Create(GameDirectorBase gameDirector) { } */
    static Create(gameDirector: GameDirectorBase): GameSituationData {
        const data = new GameSituationData();
        data._BattleUnitSituationDatas = [];
        data._BattleUnitSituationDatas = [...gameDirector.battleUnitBundle.dic].map(kvp => GameDirectorBase_GameSituationDataCreator.$CreateBattleUnitSituationDatas$g__ConvertDataToSituation_1_1(kvp[1])); // CreateBattleUnitSituationDatas inlined; <>c.b__1_0
        return data;
    }
    /** @rva 0x14AC9B0  private static BattleUnitSituationData[] CreateBattleUnitSituationDatas(GameDirectorBase gameDirector) { } */
    static CreateBattleUnitSituationDatas(gameDirector: GameDirectorBase): BattleUnitSituationData[] {
        return [...gameDirector.battleUnitBundle.dic].map(kvp => GameDirectorBase_GameSituationDataCreator.$CreateBattleUnitSituationDatas$g__ConvertDataToSituation_1_1(kvp[1])); // <>c.b__1_0
    }
    /** @rva 0x14ACD30  internal static BattleUnitSituationData <CreateBattleUnitSituationDatas>g__ConvertDataToSituation|1_1(BattleUnit unit) { } */
    static $CreateBattleUnitSituationDatas$g__ConvertDataToSituation_1_1(unit: BattleUnit): BattleUnitSituationData {
        const d = new BattleUnitSituationData();
        const condition = unit.Condition;
        d._battleUnitDataId = unit.Id;
        d._maxHp = unit.MaxHP;
        d._hp = unit.HP;
        d._ep = unit.EP;
        d._bp = unit.BP;
        d._breakPoint = unit.BreakPoint.PointValue;
        d._chargePoint = condition.ChargePoint;
        d._maxChargePoint = condition.MaxChargePoint;
        d._breakedDamageReceiveRate = unit.BreakedDamageReceiveRate;
        d._currentHpGaugeCount = unit.CurrentHpGaugeCount;
        d._stateIcons = condition.StateIcons;
        d._visualEffectNames = condition.VisualEffectNames;
        d._visualShaderName = condition.VisualShaderName;
        d._canNotAction = condition.CanNotAction;
        d._canNotUseSkill = condition.CanNotUseSkill;
        d._canNotUseSpecialAttack = condition.CanNotUseSpecialAttack;
        d._isAbnormalState = condition.IsAbnormalState;
        d._barrierEndurance = condition.BarrierEndurance;
        d._maxBarrierEndurance = condition.MaxBarrierEndurance;
        d._countPoint = condition.CountPoint;
        d._maxCountPoint = condition.MaxCountPoint;
        d._zoneStack = condition.ZoneStack;
        d._maxZoneStack = condition.MaxZoneStack;
        d._zoneEffectId = condition.ZoneEffectId;
        d._uniqueLvStateIconDataArray = condition.StateList.filter((s): s is UniqueLvUnitStateBase => s instanceof UniqueLvUnitStateBase) // OfType<UniqueLvUnitStateBase>
            .filter(state => state.IsActive$BattleUnit(unit)) // <>c__DisplayClass1_0.b__2
            .map(state => { // <>c.b__1_3
                const icon = new BattleUnitSituationData_UniqueLvStateIconData();
                icon._Lv = state.Lv;
                icon._HitCounter = state.HitCounter;
                const next = state.LvMstList?.find(m => m.Level === state.Lv + 1) ?? null; // <>c__DisplayClass1_1.b__4
                icon._RequiredCount = next == null ? 0 : next.ConditionCount; // Nullable<int>.Value of default = 0
                icon._UniqueStatePatternMstId = state.UniqueStatePatternMstId;
                icon._TargetElement = state.TargetElement;
                return icon;
            });
        return d;
    }
}

GameDirectorBase.cctor(); // C# static constructor