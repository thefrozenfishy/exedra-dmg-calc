// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
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
    /** @rva 0xD88680 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 8 as BattleType; /* asm: mov eax, 8; ret */ }
    /** @rva 0x902980  public int get_TotalDamage() { } */
    get_TotalDamage(): int { return this._TotalDamage; /* auto-property */ }
    /** @rva 0x9029B0  public void set_TotalDamage(int value) { } */
    set_TotalDamage(value: int): void { this._TotalDamage = value; /* auto-property */ }
    /** @rva 0x754630  public int get_ReqSyncHpScoreCount() { } */
    get_ReqSyncHpScoreCount(): int { return this._ReqSyncHpScoreCount; /* auto-property */ }
    /** @rva 0x754900  private void set_ReqSyncHpScoreCount(int value) { } */
    set_ReqSyncHpScoreCount(value: int): void { this._ReqSyncHpScoreCount = value; /* auto-property */ }
    /** @rva 0x14A18A0  public void .ctor() { } */
    ctor(): this { return notPorted("MultiRaidGameDirector..ctor", 0x14A18A0); }
    /** @rva 0x14A0BE0  public void SetupBattleStage(int questStageMstId, IBattleUnitProvider unitProvider, int mainTargetHp, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, int roundLimit, DateTimeOffset endTime, int campUpDmg, int campUpBreakPointDmg, bool isBattleSkip) { } */
    SetupBattleStage(questStageMstId: int, unitProvider: IBattleUnitProvider, mainTargetHp: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], roundLimit: int, endTime: any /* DateTimeOffset */, campUpDmg: int, campUpBreakPointDmg: int, isBattleSkip: boolean): void { return notPorted("MultiRaidGameDirector.SetupBattleStage", 0x14A0BE0); }
    /** @rva 0x14A0910 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void { return notPorted("MultiRaidGameDirector.Request", 0x14A0910); }
    /** @rva 0x14A09F0 slot 12  public override void RespondToClientReadyRequest() { } */
    RespondToClientReadyRequest(): void { return notPorted("MultiRaidGameDirector.RespondToClientReadyRequest", 0x14A09F0); }
    /** @rva 0x14A1020 slot 8  public override void StoreCommand(CommandBase cmd) { } */
    StoreCommand(cmd: CommandBase): void { return notPorted("MultiRaidGameDirector.StoreCommand", 0x14A1020); }
    /** @rva 0x14A0880 slot 15  protected override void Forward() { } */
    Forward(): void { return notPorted("MultiRaidGameDirector.Forward", 0x14A0880); }
    /** @rva 0x14A15C0  public void SyncHpScoreOnResume(int syncedMainTargetEnemyHp, int totalDamageBeforeSync, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos) { } */
    SyncHpScoreOnResume(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[]): void { return notPorted("MultiRaidGameDirector.SyncHpScoreOnResume", 0x14A15C0); }
    /** @rva 0x14A1600  public void SyncHpScore(int syncedMainTargetEnemyHp, int totalDamageBeforeSync, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, bool isRequestedByPlayer = False) { } */
    SyncHpScore(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], isRequestedByPlayer?: boolean /* = False */): void { return notPorted("MultiRaidGameDirector.SyncHpScore", 0x14A1600); }
    /** @rva 0x14A1660  private void SyncHp(int syncedMainTargetEnemyHp, int totalDamageBeforeSync) { } */
    SyncHp(syncedMainTargetEnemyHp: int, totalDamageBeforeSync: int): void { return notPorted("MultiRaidGameDirector.SyncHp", 0x14A1660); }
    /** @rva 0x14A1350  private void StoreSyncHpScoreCommand(CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, bool isInitialize, bool isRequestedByPlayer = False) { } */
    StoreSyncHpScoreCommand(participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], isInitialize: boolean, isRequestedByPlayer?: boolean /* = False */): void { return notPorted("MultiRaidGameDirector.StoreSyncHpScoreCommand", 0x14A1350); }
    /** @rva 0x14A1530  private void StoreTotalDamageCommand(bool isInitialize = False) { } */
    StoreTotalDamageCommand(isInitialize?: boolean /* = False */): void { return notPorted("MultiRaidGameDirector.StoreTotalDamageCommand", 0x14A1530); }
    /** @rva 0x14A0B60  public void SendSyncApiError() { } */
    SendSyncApiError(): void { return notPorted("MultiRaidGameDirector.SendSyncApiError", 0x14A0B60); }
    /** @rva 0x14A12D0  private void StoreSyncHpResultForServerCommand(int reducedHpBySync) { } */
    StoreSyncHpResultForServerCommand(reducedHpBySync: int): void { return notPorted("MultiRaidGameDirector.StoreSyncHpResultForServerCommand", 0x14A12D0); }
    /** @rva 0x14A07C0  public void ForceSetBattleFinishByTimeLimitIfNeed() { } */
    ForceSetBattleFinishByTimeLimitIfNeed(): void { return notPorted("MultiRaidGameDirector.ForceSetBattleFinishByTimeLimitIfNeed", 0x14A07C0); }
}
