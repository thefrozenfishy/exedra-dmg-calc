// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { PvpJudgeResultReferee } from "./PvpJudgeResultReferee";
import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";

// ---- ReDriveBattleCore.PvpGameDirector  (TypeDefIndex 448, public class) ----
export class PvpGameDirector extends GameDirectorBase {
    /** @rva 0x7E1AD0 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 2 as BattleType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x14B4AC0  public void .ctor() { } */
    ctor(): this {
        super.ctor(); // GameDirectorBase..ctor (tail call)
        return this;
    }
    /** @rva 0x14B4950  public void SetupBattleStage(IBattleUnitProvider unitProvider, int timeLimit = 0) { } */
    SetupBattleStage(unitProvider: IBattleUnitProvider, timeLimit: int = 0): void {
        this.elapsedTime = 0;
        this.isForcedAutomatic = true;
        for (const unit of unitProvider.CreateAllyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        for (const unit of unitProvider.CreateInitialEnemyBattleUnits()) this.battleUnitBundle.AddUnit(unit);
        this.judgeResultReferee = new PvpJudgeResultReferee().ctor();
        this.judgeResultReferee.result = 0 as any;
        this.InitializeBattle();
        this.BattlePhase = 0 as any;
    }
}
