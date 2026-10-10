// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.UnitState.IStateIconNumberDisplayable  (TypeDefIndex 698, public interface) ----
export interface IStateIconNumberDisplayable {
    readonly StateIconNumber: int;
    readonly IsShowZeroIfZero: boolean;
    /** @rva 0x730170 slot 0  public virtual void RefreshStateIconNumber(BattleUnit unit) { } */
    RefreshStateIconNumber(unit: BattleUnit): void;
}
