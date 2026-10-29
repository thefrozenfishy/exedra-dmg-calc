// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Phase } from "./Command/Phase";
import type { ResultStatus } from "./ResultStatus";
import type { BattleUnit } from "./BattleUnit";
import { GveMainTargetBreakCountRequest } from "./Request/GveMainTargetBreakCountRequest";
import { CommandGveMainTargetBreakCount } from "./Command/CommandGveMainTargetBreakCount";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { GveBreakBonusFieldParam } from "./GveBreakBonusFieldParam";
import { GveJudgeResultReferee } from "./GveJudgeResultReferee";
import type { int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { CommandGveSyncHpDirection } from "./Command/CommandGveSyncHpDirection";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";
import type { RequestBase } from "./Request/RequestBase";

// ---- ReDriveBattleCore.GveGameDirector  (TypeDefIndex 408, public class) ----
export class GveGameDirector extends GameDirectorBase {
    /** @rva 0xD78250 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 3 as BattleType; /* asm: mov eax, 3; ret */ }
    /** @rva 0x14ADF30  public void .ctor() { } */
    ctor(): this {
        super.ctor(); // GameDirectorBase..ctor (tail call)
        return this;
    }
    /** @rva 0x14ADB00  public void SetupBattleStage(int questStageMstId, IBattleUnitProvider unitProvider, int gainEpUpRate, int specialAttackDamageUpRate, int victoryRound) { } */
    SetupBattleStage(questStageMstId: int, unitProvider: IBattleUnitProvider, gainEpUpRate: int, specialAttackDamageUpRate: int, victoryRound: int): void {
        this.elapsedTime = 0;
        for (const unit of unitProvider.CreateAllyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        for (const unit of unitProvider.CreateInitialEnemyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        this.judgeResultReferee = new GveJudgeResultReferee().ctor$int(victoryRound); // inlined
        this.judgeResultReferee.result = 0 as ResultStatus;
        this.InitializeBattle();
        if (gainEpUpRate !== 0 || specialAttackDamageUpRate !== 0) {
            const field = new GveBreakBonusFieldParam().ctor$int_int(gainEpUpRate, specialAttackDamageUpRate); // inlined
            field.TriggeringUnitOnBattleStart(this.battleUnitBundle.allyList, this.get_BattleType(), this.turnActSystem.turnReferee.get_NextTurnOrderPriority());
        }
        this.BattlePhase = 0 as Phase;
    }
    /** @rva 0x14AD560  public void GveSyncHp(int mainTargetEnemyHp, CommandGveSyncHpDirection cmdHpDirection) { } */
    GveSyncHp(mainTargetEnemyHp: int, cmdHpDirection: CommandGveSyncHpDirection): void {
        const unit = [...this.battleUnitBundle.dic.values()].find(u => isGveMainTargetUnit(u)) ?? null; // FirstOrDefault(<>c.b__4_0)
        if (unit == null) return;
        unit.SetHP(mainTargetEnemyHp);
        this.StoreCommand(cmdHpDirection);
        this.commandSender.Flush(); // inlined
    }
    /** @rva 0x14AD950  private void SendGveMainTargetBreakCountCommand() { } */
    SendGveMainTargetBreakCountCommand(): void {
        const unit = [...this.battleUnitBundle.dic.values()].find(u => isGveMainTargetUnit(u)) ?? null; // FirstOrDefault(<>c.b__5_0)
        const breakCount = unit == null ? 0 : unit._BreakPoint._BreakCount;
        this.StoreCommand(new CommandGveMainTargetBreakCount().ctor$int(breakCount));
        this.commandSender.Flush(); // inlined
    }
    /** @rva 0x14AD6F0 slot 13  public override void Request(RequestBase request, bool dontFlushCommand = False, CancellationToken cancellationToken) { } */
    Request(request: RequestBase, dontFlushCommand: boolean = false, cancellationToken: any = null): void {
        if (request == null) return;
        if (request.RequestType === 13 && request instanceof GveMainTargetBreakCountRequest) {
            this.SendGveMainTargetBreakCountCommand(); // inlined (StoreCommand + CommandSender.Flush)
        }
        super.Request(request, dontFlushCommand, cancellationToken); // tail jump
    }
}

// <>c.<GveSyncHp>b__4_0 0x14a8f40, <SendGveMainTargetBreakCountCommand>b__5_0 0x14a9450 (KeyValuePair<int, BattleUnit> kvp):
// kvp.Value.BattleParameter is QuestEnemyAppearanceParameter { IsMainTargetEnemy: true }
function isGveMainTargetUnit(unit: BattleUnit): boolean {
    const p = unit.BattleParameter;
    return p instanceof QuestEnemyAppearanceParameter && p.IsMainTargetEnemy;
}