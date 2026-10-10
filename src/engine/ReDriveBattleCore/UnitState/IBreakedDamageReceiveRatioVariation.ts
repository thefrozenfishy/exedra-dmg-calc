// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { float } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";

// ---- ReDriveBattleCore.UnitState.IBreakedDamageReceiveRatioVariation  (TypeDefIndex 728, public interface) ----
export interface IBreakedDamageReceiveRatioVariation extends IRequiredStateForDecide {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue); */
    GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float;
}
