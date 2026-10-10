// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";

// ---- ReDriveBattleCore.UnitState.IElementDamageRateVariation  (TypeDefIndex 718, public interface) ----
export interface IElementDamageRateVariation {
    readonly Addition: AdditionType;
    /** @rva -1 slot 1  public abstract Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement); */
    GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal;
}
