// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Phase } from "./Command/Phase";
import type { ResultStatus } from "./ResultStatus";
import { GvgJudgeResultReferee } from "./GvgJudgeResultReferee";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";

// ---- ReDriveBattleCore.GvgGameDirector  (TypeDefIndex 409, public class) ----
export class GvgGameDirector extends GameDirectorBase {
    /** @rva 0xD8FC50 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 4 as BattleType; /* asm: mov eax, 4; ret */ }
    /** @rva 0x14C40B0  public void .ctor() { } */
    ctor(): this {
        super.ctor(); // GameDirectorBase..ctor (tail call)
        return this;
    }
    /** @rva 0x14C3F40  public void SetupBattleStage(IBattleUnitProvider unitProvider) { } */
    SetupBattleStage(unitProvider: IBattleUnitProvider): void {
        this.elapsedTime = 0;
        this.isForcedAutomatic = true;
        for (const unit of unitProvider.CreateAllyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        for (const unit of unitProvider.CreateInitialEnemyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        this.judgeResultReferee = new GvgJudgeResultReferee().ctor();
        this.judgeResultReferee.result = 0 as ResultStatus;
        this.InitializeBattle();
        this.BattlePhase = 0 as Phase;
    }
}
