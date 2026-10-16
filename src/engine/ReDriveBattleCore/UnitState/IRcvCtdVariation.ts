// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { float } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";

// ---- ReDriveBattleCore.UnitState.IRcvCtdVariation  (TypeDefIndex 711, public interface) ----
export interface IRcvCtdVariation {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract float GetRcvCtdVariationValue(BattleUnit attackUnit, float processingValue); */
    GetRcvCtdVariationValue(attackUnit: BattleUnit, processingValue: float): float;
}
