// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { AdditionType } from "./AdditionType";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";

// ---- ReDriveBattleCore.UnitState.IGiveBreakPointDamageVariation  (TypeDefIndex 730, public interface) ----
export interface IGiveBreakPointDamageVariation extends IRequiredStateForDecide {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue); */
    GetDamageVariationValue(damageValue: Decimal, processingValue: Decimal): Decimal;
}
