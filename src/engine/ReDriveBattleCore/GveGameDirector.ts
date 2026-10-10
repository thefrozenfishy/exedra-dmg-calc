// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { CommandGveSyncHpDirection } from "./Command/CommandGveSyncHpDirection";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { RequestBase } from "./Request/RequestBase";

// ---- ReDriveBattleCore.GveGameDirector  (TypeDefIndex 408, public class) ----
export class GveGameDirector extends GameDirectorBase {
    /** @rva 0xD447A0 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 3 as BattleType; /* asm: mov eax, 3; ret */ }
    /** @rva 0x149DC00  public void .ctor() { } */
    ctor(): this { return notPorted("GveGameDirector..ctor", 0x149DC00); }
    /** @rva 0x149D7D0  public void SetupBattleStage(int questStageMstId, IBattleUnitProvider unitProvider, int gainEpUpRate, int specialAttackDamageUpRate, int victoryRound) { } */
    SetupBattleStage(questStageMstId: int, unitProvider: IBattleUnitProvider, gainEpUpRate: int, specialAttackDamageUpRate: int, victoryRound: int): void { return notPorted("GveGameDirector.SetupBattleStage", 0x149D7D0); }
    /** @rva 0x149D230  public void GveSyncHp(int mainTargetEnemyHp, CommandGveSyncHpDirection cmdHpDirection) { } */
    GveSyncHp(mainTargetEnemyHp: int, cmdHpDirection: CommandGveSyncHpDirection): void { return notPorted("GveGameDirector.GveSyncHp", 0x149D230); }
    /** @rva 0x149D620  private void SendGveMainTargetBreakCountCommand() { } */
    SendGveMainTargetBreakCountCommand(): void { return notPorted("GveGameDirector.SendGveMainTargetBreakCountCommand", 0x149D620); }
    /** @rva 0x149D3C0 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean /* = False */, cancellationToken: any /* CancellationToken */): void { return notPorted("GveGameDirector.Request", 0x149D3C0); }
}
