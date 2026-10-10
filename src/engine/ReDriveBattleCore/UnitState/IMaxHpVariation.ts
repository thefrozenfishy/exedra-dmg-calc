// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";

// ---- ReDriveBattleCore.UnitState.IMaxHpVariation  (TypeDefIndex 706, public interface) ----
export interface IMaxHpVariation {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetMaxHpVariationValue(BattleUnit unit, Decimal processingValue); */
    GetMaxHpVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal;
}
