// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { CompareOperator } from "./CompareOperator";

// ---- ReDriveBattleCore.BattleCondition.IComparer  (TypeDefIndex 1064, public interface) ----
export interface IComparer {
    /** @rva -1 slot 0  public abstract bool Compare(CompareOperator compareOperator); */
    Compare(compareOperator: CompareOperator): boolean;
}
