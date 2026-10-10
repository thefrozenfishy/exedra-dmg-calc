// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../../runtime";
import type { IBlendable } from "./IBlendable";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.IAccum  (TypeDefIndex 702, public interface) ----
export interface IAccum extends IBlendable, IHasUpdateableEffectValue, IStateIconNumberDisplayable {
    AccumCountMax: int;
    AccumCount: int;
    readonly IStateIconNumberDisplayable$StateIconNumber: int;
    readonly IStateIconNumberDisplayable$IsShowZeroIfZero: boolean;
    /** @rva 0x16D1E80 slot 4  private sealed override int ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_StateIconNumber() { } */
    get_IStateIconNumberDisplayable$StateIconNumber(): int;
    /** @rva 0x7360C0 slot 5  private sealed override bool ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_IsShowZeroIfZero() { } */
    get_IStateIconNumberDisplayable$IsShowZeroIfZero(): boolean;
    /** @rva 0x16D1AE0 slot 6  public virtual bool Accumulate(UnitStateBase injectionState) { } */
    Accumulate(injectionState: UnitStateBase): boolean;
}
