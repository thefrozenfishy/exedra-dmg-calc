// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Decimal } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.HpRecoveryCalculator  (TypeDefIndex 411, public class) ----
export class HpRecoveryCalculator {
    /** @rva 0x149DE70  public static Decimal GetProcessedRecoveryValue(BattleUnit userUnit, BattleUnit targetUnit, Decimal recoveryValue, bool shouldSuppress) { } */
    static GetProcessedRecoveryValue(userUnit: BattleUnit, targetUnit: BattleUnit, recoveryValue: Decimal, shouldSuppress: boolean): Decimal { return notPorted("HpRecoveryCalculator.GetProcessedRecoveryValue", 0x149DE70); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
