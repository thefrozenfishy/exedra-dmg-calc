// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";

// ---- ReDriveBattleCore.GveJudgeResultReferee  (TypeDefIndex 426, public class) ----
export class GveJudgeResultReferee extends JudgeResultRefereeBase {
    /** 0x18 public int victoryRound */
    victoryRound: int = 0;
    get HasVictoryRound(): boolean { return this.get_HasVictoryRound(); }
    /** @rva 0x7431D0 slot 4  public override int get_RoundLimit() { } */
    get_RoundLimit(): int { return 0; /* asm: xor eax, eax; ret */ }
    /** @rva 0x149DCA0  public bool get_HasVictoryRound() { } */
    get_HasVictoryRound(): boolean { return notPorted("GveJudgeResultReferee.get_HasVictoryRound", 0x149DCA0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x149DC70  public void .ctor(int victoryRound) { } */
    ctor$int(victoryRound: int): this { return notPorted("GveJudgeResultReferee..ctor", 0x149DC70); }
    /** @rva 0x730170 slot 5  public override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void { /* asm: ret 0 */ }
    /** @rva 0x149DC50 slot 6  public override void CheckBattleFinishBeforeAct(int nextActRound) { } */
    CheckBattleFinishBeforeAct(nextActRound: int): void { return notPorted("GveJudgeResultReferee.CheckBattleFinishBeforeAct", 0x149DC50); }
}
