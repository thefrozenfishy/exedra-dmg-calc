// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";

// ---- ReDriveBattleCore.UnitState.IDefVariation  (TypeDefIndex 705, public interface) ----
export interface IDefVariation {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetDefVariationValue(BattleUnit unit, Decimal processingValue); */
    GetDefVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal;
}
