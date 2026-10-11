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

// C# default interface method of IConsumeRemainCount (no class in 3.19.0 overrides it).
/** @rva 0x16D1EC0  public virtual void ConsumeRemainCount(int num) { } */
export function IConsumeRemainCount$ConsumeRemainCount(self: IConsumeRemainCount, num: int): void {
    self.RemainCount = Math.max(0, self.RemainCount - num); // set_RemainCount (slot 1), Math.Max(int)
}
