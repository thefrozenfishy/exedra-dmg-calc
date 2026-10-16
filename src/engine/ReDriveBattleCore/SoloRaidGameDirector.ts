// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { dictGet, f32, orderBy, ref } from "../runtime";
import type { Ref, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { BattleInfo } from "../Network/Definition/SoloRaid/BattleInfo";
import { EnemyInfo } from "../Network/Definition/SoloRaid/EnemyInfo";
import type { QuestStageMstRecord } from "../Network/Definition/QuestOutGame/QuestStageMstRecord";
import type { BattleUnit } from "./BattleUnit";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import { CommandInitialize } from "./Command/CommandInitialize";
import { CommandSoloRaidSyncCountdown } from "./Command/CommandSoloRaidSyncCountdown";
import { CommandSoloRaidSyncBattleInfo } from "./Command/CommandSoloRaidSyncBattleInfo";
import { CommandBattlePhase, CommandBattlePhase_ReadyPhaseData, CommandBattlePhase_FinishPhaseData } from "./Command/CommandBattlePhase";
import { Phase } from "./Command/Phase";
import { CountdownReferee } from "./CountdownReferee";
import type { GameSituationData } from "./GameSituationData";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { JudgeResultType } from "./JudgeResultType";
import { ResultStatus } from "./ResultStatus";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";
import { SoloRaidBuffReferee } from "./SoloRaidBuffReferee";
import { SoloRaidJudgeResultReferee } from "./SoloRaidJudgeResultReferee";
import type { DateTimeOffset } from "./SoloRaidJudgeResultReferee";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";
import { TurnReferee } from "./TurnReferee";
import { WaveReferee } from "./WaveReferee";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { CountdownStartUnitState } from "./UnitState/CountdownStartUnitState";
import { QuestStageMstModel } from "./Model/QuestStageMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";

// ---- ReDriveBattleCore.SoloRaidGameDirector  (TypeDefIndex 458, public class) ----
export class SoloRaidGameDirector extends SoloGameDirectorBase {
    /** 0xA0 protected readonly CountdownReferee countdownReferee */
    countdownReferee: CountdownReferee = null!;
    /** 0xA8 private readonly SoloRaidBuffReferee soloRaidBuffReferee */
    soloRaidBuffReferee: SoloRaidBuffReferee = null!;
    get CountdownReferee(): CountdownReferee { return this.get_CountdownReferee(); }
    get SoloRaidBuffReferee(): SoloRaidBuffReferee { return this.get_SoloRaidBuffReferee(); }
    /** @rva 0xDEFB50 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 9 as BattleType; /* asm: mov eax, 9; ret */ }
    /** @rva 0x8ACA10  public CountdownReferee get_CountdownReferee() { } */
    get_CountdownReferee(): CountdownReferee { return this.countdownReferee; /* asm: mov rax, qword ptr [rcx + 0xa0]; ret */ }
    /** @rva 0x736C20  public SoloRaidBuffReferee get_SoloRaidBuffReferee() { } */
    get_SoloRaidBuffReferee(): SoloRaidBuffReferee { return this.soloRaidBuffReferee; /* asm: mov rax, qword ptr [rcx + 0xa8]; ret */ }
    /** @rva 0x14CF160  public void .ctor() { } */
    ctor(): this {
        this.countdownReferee = new CountdownReferee().ctor();
        this.soloRaidBuffReferee = new SoloRaidBuffReferee().ctor();
        super.ctor();
        return this;
    }
    /** @rva 0x14CD8C0 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize {
        const command = new CommandInitialize().ctor$BattleUnitInfo_int_int_int_int_int_int_bool_GameSituationData(battleUnitInfoArray,
            targetReferee.allyAttackTargetId, targetReferee.allyFriendTargetId, targetReferee.enemyAttackTargetId, targetReferee.enemyFriendTargetId,
            spReferee.allySp, spReferee.enemySp, this.isForcedAutomatic, gameSituationData);
        const r = this.linkHpReferee;
        command.SetLinkHp(r.linkHpType, r.linkHpName, r.currentLinkHp, r.maxLinkHp);
        command.SetWave(this.waveReferee.maxWave, this.waveReferee.currentWave);
        command.SetModeChangeData(this.modeChangeReferee.modeChangeInfoList, this.modeChangeReferee.currentModeChangeStep);
        const b = this.soloRaidBuffReferee;
        command.SetSoloRaidBuffInfo(b.isSeasonBuffActive, b.currentSeasonBuffPoint, b.maxSeasonBuffPoint, b.activeMaxSeasonBuffPoint,
            b.activeCurrentSeasonBuffTurnGaugeValue, b.activeMaxSeasonBuffTurnGaugeValue);
        return command;
    }
    /** @rva 0x14CE190 slot 12  public override void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void {
        super.RespondToClientReadyRequest();
        this.SyncCountdownIfNeed(); // tail call
    }
    /** @rva 0x14CF100 slot 20  protected override void WaveTransition() { } */
    WaveTransition(): void {
        super.WaveTransition();
        this.countdownReferee.Initialize(this.battleUnitBundle.dic); // inlined in the game
        this.SyncCountdownIfNeed(); // tail call
    }
    /** @rva 0x14CF0A0 slot 21  protected override void WaveTransitionForForceWinDebug() { } */
    WaveTransitionForForceWinDebug(): void {
        super.WaveTransitionForForceWinDebug();
        this.countdownReferee.Initialize(this.battleUnitBundle.dic); // inlined in the game
        this.SyncCountdownIfNeed(); // tail call
    }
    /** @rva 0x14CE1B0  public void SetupBattleStageForSoloRaid(int questStageMstId, int repeatNum, IBattleUnitProvider unitProvider, BattleInfo battleInfo, int commonBuffPointChargePassiveSkillMstId, int soloRaidSeasonBuffMstId, int soloRaidPartyBuffMstId, int roundLimit, DateTimeOffset endTime) { } */
    SetupBattleStageForSoloRaid(questStageMstId: int, repeatNum: int, unitProvider: IBattleUnitProvider, battleInfo: BattleInfo, commonBuffPointChargePassiveSkillMstId: int, soloRaidSeasonBuffMstId: int, soloRaidPartyBuffMstId: int, roundLimit: int, endTime: DateTimeOffset): void {
        // battleInfo is not null-checked: a new battle passes a BattleInfo with wave 0
        const isRestart = battleInfo.wave !== 0;
        const wave = isRestart ? battleInfo.wave : 1;
        const initialLinkHp: int | null = isRestart ? (battleInfo.enemyLinkHp | 0) : null; // new Nullable<int>((int)enemyLinkHp)
        this.elapsedTime = 0;
        this.waveReferee.Init(questStageMstId, wave);
        const allies = unitProvider.CreateAllyBattleUnits();
        for (let i = 0; i < allies.length; i++) this.battleUnitBundle.AddUnit(allies[i]);
        const enemies = !isRestart
            ? this.waveReferee.CreateEnemyUnitList(this.additionalEnemyReferee)
            : this.waveReferee.CreateEnemyUnitListFromEnemyInfos(this.additionalEnemyReferee, battleInfo.enemyInfoList, battleInfo.nextEnemyIndex);
        for (const enemy of enemies) this.battleUnitBundle.AddUnit(enemy);
        this.linkHpReferee.Init(questStageMstId, wave, this.battleUnitBundle.enemyList, initialLinkHp);
        const judge = new SoloRaidJudgeResultReferee().ctor$int_int_DateTimeOffset(questStageMstId, roundLimit, endTime); // inlined in the game
        // <SetupBattleStageForSoloRaid>g__TryGetQuestJudgeData|13_0 inlined
        const stage = BattleMstReaderBase.get_Instance<QuestStageMstModel, QuestStageMstRecord, int>(QuestStageMstModel).GetModelByKey(questStageMstId);
        if (stage != null) {
            judge.judgeResultType = stage.JudgeResultType;
            judge.judgeResultValue = stage.JudgeResultValue;
        }
        judge.result = 0 as ResultStatus;
        this.judgeResultReferee = judge;
        const additionalWave = this.waveReferee.mode === 1 ? this.waveReferee.currentWave : WaveReferee.NoneWaveValue;
        this.additionalEnemyReferee.Initialize(questStageMstId, additionalWave, this.battleUnitBundle.enemyList);
        this.soloRaidBuffReferee.Init(commonBuffPointChargePassiveSkillMstId, soloRaidSeasonBuffMstId, soloRaidPartyBuffMstId,
            battleInfo.isSeasonBuffActive, battleInfo.seasonBuffPoint, f32(battleInfo.seasonBuffTurnGaugeValue), this.battleUnitBundle.enemyList);
        this.modeChangeReferee.Init(questStageMstId, this.waveReferee.currentWave, this.battleUnitBundle.enemyList);
        this.InitializeBattle();
        if (!isRestart) {
            this.countdownReferee.Initialize(this.battleUnitBundle.dic); // inlined in the game
            this.SyncCountdownIfNeed();
        } else {
            this.ApplyEnemyInfo(battleInfo.enemyInfoList);
            this.InitializeCountdownForRestart(battleInfo.enemyCountDownNum, battleInfo.enemyCountDownDamage);
        }
        this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 1);
        if (this.waveReferee.mode === 1) this.unitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(this.battleUnitBundle.enemyList, 2);
        this.BattlePhase = 0 as Phase;
    }
    /** @rva 0x14CDF20 slot 6  public override void OnBattleUnitDeath(int deathObjectId) { } */
    OnBattleUnitDeath(deathObjectId: int): void {
        super.OnBattleUnitDeath(deathObjectId); // EnemyAppearanceGameDirectorBase.OnBattleUnitDeath, inlined in the game
        const deathUnit = dictGet(this.battleUnitBundle.dic, deathObjectId);
        const r = this.countdownReferee;
        if (r.canActiveSkillMstId === 0 || r.canActiveSkillDetailMstId === 0) return;
        if (r.battleUnitId !== deathUnit._Id) return;
        this.EndCountdown(deathUnit, true); // inlined in the game
    }
    /** @rva 0x14CE850 slot 5  protected override void StoreBattlePhaseCommand() { } */
    StoreBattlePhaseCommand(): void {
        if (this.BattlePhase === Phase.Finish) this.SyncBattleInfo();
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
    /** @rva 0x14CE9F0  private void SyncBattleInfo() { } */
    SyncBattleInfo(): void {
        this.TrySupplyEndlessEnemyUnits();
        const enemyInfos = orderBy(this.battleUnitBundle.enemyList
            .filter(unit => !unit.IsDead) // <>c.b__16_0
            .map(unit => { // <>c.b__16_1
                const info = new EnemyInfo();
                const p = unit._BattleParameter;
                if (!(p instanceof QuestEnemyAppearanceParameter)) throw new TypeError("InvalidCastException: QuestEnemyAppearanceParameter");
                info.questEnemyAppearanceMstId = p._QuestEnemyAppearanceMstId;
                info.enemyIndex = unit._PositionId;
                info.hp = unit._HP;
                info.breakGauge = unit._BreakPoint._PointValue;
                info.breakBonus = unit._BreakedDamageReceiveRate;
                info.turnGaugeValue = unit._TurnGauge._GaugeValue;
                return info;
            }), x => x.enemyIndex); // <>c.b__16_2
        let enemyLinkHp = this.linkHpReferee.currentLinkHp;
        const mainTarget = this.battleUnitBundle.enemyList.find(unit => unit.IsMainTargetEnemy()) ?? null; // <>c.b__16_3
        if (this.linkHpReferee.linkHpType === 0 && mainTarget != null) enemyLinkHp = mainTarget._HP;
        const battleInfo = new BattleInfo();
        battleInfo.wave = this.waveReferee.currentWave;
        battleInfo.nextEnemyIndex = this.additionalEnemyReferee.endlessEnemyIndex;
        battleInfo.enemyInfoList = enemyInfos;
        battleInfo.enemyLinkHp = enemyLinkHp;
        battleInfo.enemyCountDownNum = this.countdownReferee.countdown;
        battleInfo.enemyCountDownDamage = this.countdownReferee.cancelTotalDamage;
        battleInfo.isSeasonBuffActive = this.soloRaidBuffReferee.isSeasonBuffActive;
        battleInfo.seasonBuffPoint = this.soloRaidBuffReferee.currentSeasonBuffPoint;
        battleInfo.seasonBuffTurnGaugeValue = this.soloRaidBuffReferee.activeCurrentSeasonBuffTurnGaugeValue;
        this.StoreCommand(new CommandSoloRaidSyncBattleInfo().ctor$BattleInfo(battleInfo));
    }
    /** @rva 0x7350C0  private bool ShouldStoreForceWinBattleInfo() { } */
    ShouldStoreForceWinBattleInfo(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x72F170  private void StoreForceWinBattleInfoCommand() { } */
    StoreForceWinBattleInfoCommand(): void { /* asm: ret 0 */ }
    /** @rva 0x14CD580  private void ApplyEnemyInfo(EnemyInfo[] enemyInfos) { } */
    ApplyEnemyInfo(enemyInfos: EnemyInfo[]): void {
        for (const unit of this.battleUnitBundle.enemyList) {
            const info = enemyInfos.find(i => i.enemyIndex === unit._PositionId) ?? null; // <>c__DisplayClass19_0.<ApplyEnemyInfo>b__0
            if (info == null) continue;
            unit._HP = info.hp | 0; // (int)hp
            unit._BreakPoint._PointValue = info.breakGauge;
            unit._BreakedDamageReceiveRate = info.breakBonus;
            unit._TurnGauge._GaugeValue = f32(info.turnGaugeValue);
        }
    }
    /** @rva 0x14CDEC0  public void InitializeCountdownReferee() { } */
    InitializeCountdownReferee(): void {
        this.countdownReferee.Initialize(this.battleUnitBundle.dic); // inlined in the game
        this.SyncCountdownIfNeed(); // tail call
    }
    /** @rva 0x14CDD00  private void InitializeCountdownForRestart(int currentCount, int currentDamage) { } */
    InitializeCountdownForRestart(currentCount: int, currentDamage: int): void {
        const turnOrderPriority = this.turnActSystem.turnReferee.NextTurnOrderPriority;
        this.countdownReferee.InitializeForRestart(this.battleUnitBundle.dic, currentCount, currentDamage, turnOrderPriority); // inlined in the game
    }
    /** @rva 0x14CEF40  private void SyncCountdownIfNeed() { } */
    SyncCountdownIfNeed(): void {
        const r = this.countdownReferee;
        if (r.canActiveSkillMstId !== 0 && r.canActiveSkillDetailMstId !== 0) this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(r, 1));
    }
    /** @rva 0x14CE790  public void StartCountdown(int maxCountdown, int maxCancelTotalDamage, int battleUnitId) { } */
    StartCountdown(maxCountdown: int, maxCancelTotalDamage: int, battleUnitId: int): void {
        this.countdownReferee.StartCountdown(maxCountdown, maxCancelTotalDamage, battleUnitId); // inlined in the game
        this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(this.countdownReferee, 2));
    }
    /** @rva 0x14CDA90  public void DecreaseCountdown() { } */
    DecreaseCountdown(): void {
        this.countdownReferee.DecreaseCountdown(); // inlined in the game
        this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(this.countdownReferee, 3));
    }
    /** @rva 0x14CDB30  public void EndCountdown(BattleUnit battleUnit, bool isStoreCommand = True) { } */
    EndCountdown(battleUnit: BattleUnit, isStoreCommand: boolean = true): void {
        if (isStoreCommand) this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(this.countdownReferee, 5));
        this.countdownReferee.EndCountdown(); // inlined in the game
        battleUnit.Condition.RemoveUnitState$BattleUnit_EffectOriginType(CountdownStartUnitState, battleUnit, 0);
    }
    /** @rva 0x14CD7D0  public void CancelCountdown(BattleUnit battleUnit) { } */
    CancelCountdown(battleUnit: BattleUnit): void {
        const r = this.countdownReferee;
        if (r.cancelTotalDamage < r.cancelMaxTotalDamage) this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(r, 4));
        this.countdownReferee.EndCountdown(); // inlined in the game
        battleUnit.Condition.RemoveUnitState$BattleUnit_EffectOriginType(CountdownStartUnitState, battleUnit, 0);
    }
    /** @rva 0x14CDC10  public void ForcedCancelCountdownAndInitialize() { } */
    ForcedCancelCountdownAndInitialize(): void {
        const r = this.countdownReferee;
        r.Initialize(this.battleUnitBundle.dic); // inlined in the game
        // the game builds the command without checking HasActiveCountdownSkill: 7 when there is none, 8 otherwise
        const syncType = r.canActiveSkillMstId === 0 || r.canActiveSkillDetailMstId === 0 ? 7 : 8;
        this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(r, syncType));
    }
    /** @rva 0x14CD4B0  public void AddCancelTotalDamage(int damage) { } */
    AddCancelTotalDamage(damage: int): void {
        const r = this.countdownReferee;
        r.AddCancelTotalDamage(damage); // inlined in the game
        const syncType = r.cancelTotalDamage < r.cancelMaxTotalDamage ? 6 : 4;
        this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(r, syncType));
    }
    /** @rva 0x14CEFE0  internal static bool <SetupBattleStageForSoloRaid>g__TryGetQuestJudgeData|13_0(int stageMstId, out JudgeResultType judgeResultType, out int judgeResultValue) { } */
    static $SetupBattleStageForSoloRaid$g__TryGetQuestJudgeData_13_0(stageMstId: int, judgeResultType: Ref<JudgeResultType>, judgeResultValue: Ref<int>): boolean {
        judgeResultType.v = 0 as JudgeResultType;
        judgeResultValue.v = 0;
        const stage = BattleMstReaderBase.get_Instance<QuestStageMstModel, QuestStageMstRecord, int>(QuestStageMstModel).GetModelByKey(stageMstId);
        if (stage == null) return false;
        judgeResultType.v = stage.JudgeResultType;
        judgeResultValue.v = stage.JudgeResultValue;
        return true;
    }
}
