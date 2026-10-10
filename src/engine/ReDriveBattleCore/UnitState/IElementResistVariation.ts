// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.UnitState.IElementResistVariation  (TypeDefIndex 719, public interface) ----
export interface IElementResistVariation {
    /** @rva -1 slot 0  public abstract Decimal GetElementResistVariationValue(BattleUnit unit, TargetElementType attackElement); */
    GetElementResistVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal;
}
