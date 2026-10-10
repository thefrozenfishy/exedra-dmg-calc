// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, Ref, int } from "../runtime";
import type { BattleUnit, BattleUnit_TeamType } from "./BattleUnit";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import type { CommandInitialize } from "./Command/CommandInitialize";
import { EnemyAppearanceGameDirectorBase } from "./EnemyAppearanceGameDirectorBase";
import type { GameSituationData } from "./GameSituationData";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { JudgeResultType } from "./JudgeResultType";
import type { ModeChangeReferee } from "./ModeChangeReferee";
import type { RequestBase } from "./Request/RequestBase";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";
import type { WaveReferee } from "./WaveReferee";

// ---- ReDriveBattleCore.SoloGameDirectorBase  (TypeDefIndex 453, public abstract class) ----
export abstract class SoloGameDirectorBase extends EnemyAppearanceGameDirectorBase {
    /** 0x90 protected readonly WaveReferee waveReferee */
    waveReferee: WaveReferee = null!;
    /** 0x98 protected readonly ModeChangeReferee modeChangeReferee */
    modeChangeReferee: ModeChangeReferee = null!;
    get ModeChangeReferee(): ModeChangeReferee { return this.get_ModeChangeReferee(); }
    /** @rva 0x737DA0  public ModeChangeReferee get_ModeChangeReferee() { } */
    get_ModeChangeReferee(): ModeChangeReferee { return this.modeChangeReferee; /* asm: mov rax, qword ptr [rcx + 0x98]; ret */ }
    /** @rva 0x14A6BD0  public void .ctor() { } */
    ctor(): this { return notPorted("SoloGameDirectorBase..ctor", 0x14A6BD0); }
    /** @rva 0x14A55A0  public void SetupBattleStage(int questStageMstId, int repeatNum, IBattleUnitProvider unitProvider, int campUpDmg = 0, int campUpBreakPointDmg = 0, int victoryRound = 0) { } */
    SetupBattleStage(questStageMstId: int, repeatNum: int, unitProvider: IBattleUnitProvider, campUpDmg?: int /* = 0 */, campUpBreakPointDmg?: int /* = 0 */, victoryRound?: int /* = 0 */): void { return notPorted("SoloGameDirectorBase.SetupBattleStage", 0x14A55A0); }
    /** @rva 0x14A4930 slot 9  public override void BattleEnd() { } */
    BattleEnd(): void { return notPorted("SoloGameDirectorBase.BattleEnd", 0x14A4930); }
    /** @rva 0x14A5ED0 slot 10  public override int TurnTransition() { } */
    TurnTransition(): int { return notPorted("SoloGameDirectorBase.TurnTransition", 0x14A5ED0); }
    /** @rva 0x14A6520 slot 20  protected virtual void WaveTransition() { } */
    WaveTransition(): void { return notPorted("SoloGameDirectorBase.WaveTransition", 0x14A6520); }
    /** @rva 0x14A6100 slot 21  protected virtual void WaveTransitionForForceWinDebug() { } */
    WaveTransitionForForceWinDebug(): void { return notPorted("SoloGameDirectorBase.WaveTransitionForForceWinDebug", 0x14A6100); }
    /** @rva 0x14A4BD0 slot 17  protected override void CheckModeChange() { } */
    CheckModeChange(): void { return notPorted("SoloGameDirectorBase.CheckModeChange", 0x14A4BD0); }
    /** @rva 0x14A4DB0 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize { return notPorted("SoloGameDirectorBase.CreateCommandInitialize", 0x14A4DB0); }
    /** @rva 0x14A4F60 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void { return notPorted("SoloGameDirectorBase.Request", 0x14A4F60); }
    /** @rva 0x730170  private void OnForceWinDebugRequested() { } */
    OnForceWinDebugRequested(): void { /* asm: ret 0 */ }
    /** @rva 0x730170  protected void ResetForceWinDebugRequestFlag() { } */
    ResetForceWinDebugRequestFlag(): void { /* asm: ret 0 */ }
    /** @rva 0x14A53E0 slot 14  protected override void RunBattleToEnd(CancellationToken ct) { } */
    RunBattleToEnd(ct: any /* CancellationToken */): void { return notPorted("SoloGameDirectorBase.RunBattleToEnd", 0x14A53E0); }
    /** @rva 0x14A4F40 slot 19  protected override void PrepareEndlessEnemySupply() { } */
    PrepareEndlessEnemySupply(): void { return notPorted("SoloGameDirectorBase.PrepareEndlessEnemySupply", 0x14A4F40); }
    /** @rva 0x14A5DD0  protected List<BattleUnit> TrySupplyEndlessEnemyUnits() { } */
    TrySupplyEndlessEnemyUnits(): List<BattleUnit> { return notPorted("SoloGameDirectorBase.TrySupplyEndlessEnemyUnits", 0x14A5DD0); }
    /** @rva 0x14A5A80  private void SupplyEndlessEnemy(List<BattleUnit> suppliedEndlessEnemyUnitList) { } */
    SupplyEndlessEnemy(suppliedEndlessEnemyUnitList: List<BattleUnit>): void { return notPorted("SoloGameDirectorBase.SupplyEndlessEnemy", 0x14A5A80); }
    /** @rva 0x14A4A40  private void ChangeAttackTargetAtSamePosition(int attackTargetId, BattleUnit.TeamType targetTeam) { } */
    ChangeAttackTargetAtSamePosition(attackTargetId: int, targetTeam: BattleUnit_TeamType): void { return notPorted("SoloGameDirectorBase.ChangeAttackTargetAtSamePosition", 0x14A4A40); }
    /** @rva 0x14A6000  internal static bool <SetupBattleStage>g__TryGetQuestJudgeData|5_0(int stageMstId, out JudgeResultType judgeResultType, out int judgeResultValue) { } */
    static $SetupBattleStage$g__TryGetQuestJudgeData_5_0(stageMstId: int, judgeResultType: Ref<JudgeResultType>, judgeResultValue: Ref<int>): boolean { return notPorted("SoloGameDirectorBase.<SetupBattleStage>g__TryGetQuestJudgeData|5_0", 0x14A6000); }
    /** @rva 0x1495D60  private void <TurnTransition>b__7_0(BattleUnit unit) { } */
    $TurnTransition$b__7_0(unit: BattleUnit): void { return notPorted("SoloGameDirectorBase.<TurnTransition>b__7_0", 0x1495D60); }
    /** @rva 0x14A60E0  private void <WaveTransition>b__8_0(BattleUnit unit) { } */
    $WaveTransition$b__8_0(unit: BattleUnit): void { return notPorted("SoloGameDirectorBase.<WaveTransition>b__8_0", 0x14A60E0); }
    /** @rva 0x14A60E0  private void <WaveTransitionForForceWinDebug>b__9_0(BattleUnit unit) { } */
    $WaveTransitionForForceWinDebug$b__9_0(unit: BattleUnit): void { return notPorted("SoloGameDirectorBase.<WaveTransitionForForceWinDebug>b__9_0", 0x14A60E0); }
    /** @rva 0x14A60C0  private void <TrySupplyEndlessEnemyUnits>b__17_0(BattleUnit unit) { } */
    $TrySupplyEndlessEnemyUnits$b__17_0(unit: BattleUnit): void { return notPorted("SoloGameDirectorBase.<TrySupplyEndlessEnemyUnits>b__17_0", 0x14A60C0); }
}
