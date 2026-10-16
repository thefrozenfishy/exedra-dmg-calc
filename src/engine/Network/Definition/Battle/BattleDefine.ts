// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../../runtime";
import type { float, int } from "../../../runtime";

// ---- Network.Definition.Battle.BattleDefine  (TypeDefIndex 1299, public class) ----
export class BattleDefine {
    /** public const int StartSp */
    static readonly StartSp: int = 5;
    /** public const int MaxSp */
    static readonly MaxSp: int = 6;
    /** public const int NormalAttackDefaultSpRecovery */
    static readonly NormalAttackDefaultSpRecovery: int = 1;
    /** public const int MaxDisplayEnemyNum */
    static readonly MaxDisplayEnemyNum: int = 5;
    /** public const int MaxCountPoint */
    static readonly MaxCountPoint: int = 20;
    /** public const float FirstTurnGaugePerRound */
    static readonly FirstTurnGaugePerRound: float = 150;
    /** public const float BaseTurnGaugePerRound */
    static readonly BaseTurnGaugePerRound: float = 100;
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
