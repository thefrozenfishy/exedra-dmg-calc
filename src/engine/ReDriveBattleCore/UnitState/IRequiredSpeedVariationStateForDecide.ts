// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { AdditionType } from "./AdditionType";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";

// ---- ReDriveBattleCore.UnitState.IRequiredSpeedVariationStateForDecide  (TypeDefIndex 818, public interface) ----
export interface IRequiredSpeedVariationStateForDecide extends IRequiredStateForDecide {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue); */
    GetSpeedVariationValue(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal;
    /** @rva -1 slot 2  public abstract bool CanAddTo(BattleUnitData unit); */
    CanAddTo(unit: any /* BattleUnitData */): boolean;
}
