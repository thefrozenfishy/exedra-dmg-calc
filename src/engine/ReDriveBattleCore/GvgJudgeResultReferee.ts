// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { JudgeResultRefereeBase } from "./JudgeResultRefereeBase";

// ---- ReDriveBattleCore.GvgJudgeResultReferee  (TypeDefIndex 425, public class) ----
export class GvgJudgeResultReferee extends JudgeResultRefereeBase {
    /** public const int GvgRoundLimit */
    static readonly GvgRoundLimit: int = 15;
    /** @rva 0xD70110 slot 4  public override int get_RoundLimit() { } */
    get_RoundLimit(): int { return 15; /* asm: mov eax, 0xf; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x730170 slot 5  public override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void { /* asm: ret 0 */ }
}
