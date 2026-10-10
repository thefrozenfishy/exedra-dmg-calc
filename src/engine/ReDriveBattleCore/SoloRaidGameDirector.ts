// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Ref, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { BattleUnit } from "./BattleUnit";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import type { CommandInitialize } from "./Command/CommandInitialize";
import type { CountdownReferee } from "./CountdownReferee";
import type { GameSituationData } from "./GameSituationData";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { JudgeResultType } from "./JudgeResultType";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";
import type { SoloRaidBuffReferee } from "./SoloRaidBuffReferee";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";

// ---- ReDriveBattleCore.SoloRaidGameDirector  (TypeDefIndex 458, public class) ----
export class SoloRaidGameDirector extends SoloGameDirectorBase {
    /** 0xA0 protected readonly CountdownReferee countdownReferee */
    countdownReferee: CountdownReferee = null!;
    /** 0xA8 private readonly SoloRaidBuffReferee soloRaidBuffReferee */
    soloRaidBuffReferee: SoloRaidBuffReferee = null!;
    get CountdownReferee(): CountdownReferee { return this.get_CountdownReferee(); }
    get SoloRaidBuffReferee(): SoloRaidBuffReferee { return this.get_SoloRaidBuffReferee(); }
    /** @rva 0xDBA190 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 9 as BattleType; /* asm: mov eax, 9; ret */ }
    /** @rva 0x8ADA10  public CountdownReferee get_CountdownReferee() { } */
    get_CountdownReferee(): CountdownReferee { return this.countdownReferee; /* asm: mov rax, qword ptr [rcx + 0xa0]; ret */ }
    /** @rva 0x737C20  public SoloRaidBuffReferee get_SoloRaidBuffReferee() { } */
    get_SoloRaidBuffReferee(): SoloRaidBuffReferee { return this.soloRaidBuffReferee; /* asm: mov rax, qword ptr [rcx + 0xa8]; ret */ }
    /** @rva 0x14A8990  public void .ctor() { } */
    ctor(): this { return notPorted("SoloRaidGameDirector..ctor", 0x14A8990); }
    /** @rva 0x14A70F0 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize { return notPorted("SoloRaidGameDirector.CreateCommandInitialize", 0x14A70F0); }
    /** @rva 0x14A79C0 slot 12  public override void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void { return notPorted("SoloRaidGameDirector.RespondToClientReadyRequest", 0x14A79C0); }
    /** @rva 0x14A8930 slot 20  protected override void WaveTransition() { } */
    WaveTransition(): void { return notPorted("SoloRaidGameDirector.WaveTransition", 0x14A8930); }
    /** @rva 0x14A88D0 slot 21  protected override void WaveTransitionForForceWinDebug() { } */
    WaveTransitionForForceWinDebug(): void { return notPorted("SoloRaidGameDirector.WaveTransitionForForceWinDebug", 0x14A88D0); }
    /** @rva 0x14A79E0  public void SetupBattleStageForSoloRaid(int questStageMstId, int repeatNum, IBattleUnitProvider unitProvider, BattleInfo battleInfo, int commonBuffPointChargePassiveSkillMstId, int soloRaidSeasonBuffMstId, int soloRaidPartyBuffMstId, int roundLimit, DateTimeOffset endTime) { } */
    SetupBattleStageForSoloRaid(questStageMstId: int, repeatNum: int, unitProvider: IBattleUnitProvider, battleInfo: any /* BattleInfo */, commonBuffPointChargePassiveSkillMstId: int, soloRaidSeasonBuffMstId: int, soloRaidPartyBuffMstId: int, roundLimit: int, endTime: any /* DateTimeOffset */): void { return notPorted("SoloRaidGameDirector.SetupBattleStageForSoloRaid", 0x14A79E0); }
    /** @rva 0x14A7750 slot 6  public override void OnBattleUnitDeath(int deathObjectId) { } */
    OnBattleUnitDeath(deathObjectId: int): void { return notPorted("SoloRaidGameDirector.OnBattleUnitDeath", 0x14A7750); }
    /** @rva 0x14A8080 slot 5  protected override void StoreBattlePhaseCommand() { } */
    StoreBattlePhaseCommand(): void { return notPorted("SoloRaidGameDirector.StoreBattlePhaseCommand", 0x14A8080); }
    /** @rva 0x14A8220  private void SyncBattleInfo() { } */
    SyncBattleInfo(): void { return notPorted("SoloRaidGameDirector.SyncBattleInfo", 0x14A8220); }
    /** @rva 0x7360C0  private bool ShouldStoreForceWinBattleInfo() { } */
    ShouldStoreForceWinBattleInfo(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x730170  private void StoreForceWinBattleInfoCommand() { } */
    StoreForceWinBattleInfoCommand(): void { /* asm: ret 0 */ }
    /** @rva 0x14A6DB0  private void ApplyEnemyInfo(EnemyInfo[] enemyInfos) { } */
    ApplyEnemyInfo(enemyInfos: any /* EnemyInfo */[]): void { return notPorted("SoloRaidGameDirector.ApplyEnemyInfo", 0x14A6DB0); }
    /** @rva 0x14A76F0  public void InitializeCountdownReferee() { } */
    InitializeCountdownReferee(): void { return notPorted("SoloRaidGameDirector.InitializeCountdownReferee", 0x14A76F0); }
    /** @rva 0x14A7530  private void InitializeCountdownForRestart(int currentCount, int currentDamage) { } */
    InitializeCountdownForRestart(currentCount: int, currentDamage: int): void { return notPorted("SoloRaidGameDirector.InitializeCountdownForRestart", 0x14A7530); }
    /** @rva 0x14A8770  private void SyncCountdownIfNeed() { } */
    SyncCountdownIfNeed(): void { return notPorted("SoloRaidGameDirector.SyncCountdownIfNeed", 0x14A8770); }
    /** @rva 0x14A7FC0  public void StartCountdown(int maxCountdown, int maxCancelTotalDamage, int battleUnitId) { } */
    StartCountdown(maxCountdown: int, maxCancelTotalDamage: int, battleUnitId: int): void { return notPorted("SoloRaidGameDirector.StartCountdown", 0x14A7FC0); }
    /** @rva 0x14A72C0  public void DecreaseCountdown() { } */
    DecreaseCountdown(): void { return notPorted("SoloRaidGameDirector.DecreaseCountdown", 0x14A72C0); }
    /** @rva 0x14A7360  public void EndCountdown(BattleUnit battleUnit, bool isStoreCommand = True) { } */
    EndCountdown(battleUnit: BattleUnit, isStoreCommand?: boolean /* = True */): void { return notPorted("SoloRaidGameDirector.EndCountdown", 0x14A7360); }
    /** @rva 0x14A7000  public void CancelCountdown(BattleUnit battleUnit) { } */
    CancelCountdown(battleUnit: BattleUnit): void { return notPorted("SoloRaidGameDirector.CancelCountdown", 0x14A7000); }
    /** @rva 0x14A7440  public void ForcedCancelCountdownAndInitialize() { } */
    ForcedCancelCountdownAndInitialize(): void { return notPorted("SoloRaidGameDirector.ForcedCancelCountdownAndInitialize", 0x14A7440); }
    /** @rva 0x14A6CE0  public void AddCancelTotalDamage(int damage) { } */
    AddCancelTotalDamage(damage: int): void { return notPorted("SoloRaidGameDirector.AddCancelTotalDamage", 0x14A6CE0); }
    /** @rva 0x14A8810  internal static bool <SetupBattleStageForSoloRaid>g__TryGetQuestJudgeData|13_0(int stageMstId, out JudgeResultType judgeResultType, out int judgeResultValue) { } */
    static $SetupBattleStageForSoloRaid$g__TryGetQuestJudgeData_13_0(stageMstId: int, judgeResultType: Ref<JudgeResultType>, judgeResultValue: Ref<int>): boolean { return notPorted("SoloRaidGameDirector.<SetupBattleStageForSoloRaid>g__TryGetQuestJudgeData|13_0", 0x14A8810); }
}
