// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { Decimal } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.UnitState.IReceiveFinalDamage  (TypeDefIndex 737, public interface) ----
export interface IReceiveFinalDamage {
    /** @rva -1 slot 0  public abstract Decimal GetFinalDamageRatio(BattleUnit attacker); */
    GetFinalDamageRatio(attacker: BattleUnit): Decimal;
}
