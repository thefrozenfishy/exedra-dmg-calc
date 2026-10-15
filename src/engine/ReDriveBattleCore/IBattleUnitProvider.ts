// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.IBattleUnitProvider  (TypeDefIndex 415, public interface) ----
export interface IBattleUnitProvider {
    /** @rva -1 slot 0  public abstract BattleUnit[] CreateAllyBattleUnits(); */
    CreateAllyBattleUnits(): BattleUnit[];
    /** @rva -1 slot 1  public abstract BattleUnit[] CreateInitialEnemyBattleUnits(); */
    CreateInitialEnemyBattleUnits(): BattleUnit[];
}
