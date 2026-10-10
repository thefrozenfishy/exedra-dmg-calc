// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.IConsumeRemainCount  (TypeDefIndex 735, public interface) ----
export interface IConsumeRemainCount {
    RemainCount: int;
    readonly IsStateIconNumberAggregated: boolean;
    /** @rva 0x16D1EC0 slot 3  public virtual void ConsumeRemainCount(int num) { } */
    ConsumeRemainCount(num: int): void;
}
