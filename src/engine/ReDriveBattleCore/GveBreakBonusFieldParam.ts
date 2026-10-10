// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import { FieldParamBase } from "./FieldParamBase";

// ---- ReDriveBattleCore.GveBreakBonusFieldParam  (TypeDefIndex 397, public class) ----
export class GveBreakBonusFieldParam extends FieldParamBase {
    /** @rva 0x14931E0  protected void .ctor() { } */
    ctor(): this { return notPorted("GveBreakBonusFieldParam..ctor", 0x14931E0); }
    /** @rva 0x149CFE0  public void .ctor(int upFinalGainEpRatioValue, int upFinalSpecialAttackGiveDamageRatioValue) { } */
    ctor$int_int(upFinalGainEpRatioValue: int, upFinalSpecialAttackGiveDamageRatioValue: int): this { return notPorted("GveBreakBonusFieldParam..ctor", 0x149CFE0); }
}
