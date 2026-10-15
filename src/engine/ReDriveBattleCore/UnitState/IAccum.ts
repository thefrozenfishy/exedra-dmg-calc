// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UnitStateBase as UnitStateBase$ } from "./UnitStateBase";
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
    /** @rva 0x16FBEF0 slot 4  private sealed override int ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_StateIconNumber() { } */
    get_IStateIconNumberDisplayable$StateIconNumber(): int;
    /** @rva 0x7350C0 slot 5  private sealed override bool ReDriveBattleCore.UnitState.IStateIconNumberDisplayable.get_IsShowZeroIfZero() { } */
    get_IStateIconNumberDisplayable$IsShowZeroIfZero(): boolean;
    /** @rva 0x16FBB50 slot 6  public virtual bool Accumulate(UnitStateBase injectionState) { } */
    Accumulate(injectionState: UnitStateBase): boolean;
}

// C# default interface methods of IAccum (IL2CPP compiles them as methods on the interface; implementing classes
// that do not override them dispatch here).
/** @rva 0x16FBEF0  int IStateIconNumberDisplayable.get_StateIconNumber() => AccumCount (IAccum slot 2) */
export function IAccum$get_IStateIconNumberDisplayable$StateIconNumber(self: IAccum): int {
    return self.AccumCount;
}
/** @rva 0x7350C0  bool IStateIconNumberDisplayable.get_IsShowZeroIfZero() */
export function IAccum$get_IStateIconNumberDisplayable$IsShowZeroIfZero(self: IAccum): boolean {
    return false;
}
/** @rva 0x16FBB50  public virtual bool Accumulate(UnitStateBase injectionState) { } */
export function IAccum$Accumulate(self: IAccum, injectionState: UnitStateBase): boolean {
    if (injectionState == null) throw new TypeError("NullReferenceException");
    if (injectionState.constructor !== (self as object).constructor) return false; // GetType() != GetType()
    const accum = injectionState as unknown as IAccum; // (IAccum)injectionState (InvalidCastException if not)
    if (!(self instanceof UnitStateBase$)) throw new TypeError("InvalidCastException"); // (UnitStateBase)this
    const unitStateBase = self as unknown as UnitStateBase;
    if (self.UpdateableEffectValue === accum.UpdateableEffectValue && self.AccumCountMax === accum.AccumCountMax) {
        if (self.AccumCount < self.AccumCountMax) self.AccumCount = self.AccumCount + 1;
        unitStateBase._RemainingTurn = injectionState._RemainingTurn;
        unitStateBase.IsExemptPassingTurnOnce = injectionState.IsExemptPassingTurnOnce;
        return true;
    }
    // comiss: a larger incoming value replaces; on a tie the larger AccumCountMax replaces
    if (!(accum.UpdateableEffectValue > self.UpdateableEffectValue)) {
        if (!(self.UpdateableEffectValue === accum.UpdateableEffectValue)) return false;
        if (self.AccumCountMax >= accum.AccumCountMax) return false;
    }
    self.AccumCount = 1;
    self.AccumCountMax = accum.AccumCountMax;
    unitStateBase._MstId = injectionState._MstId;
    unitStateBase._RemainingTurn = injectionState._RemainingTurn;
    unitStateBase.IsExemptPassingTurnOnce = injectionState.IsExemptPassingTurnOnce;
    self.UpdateableEffectValue = accum.UpdateableEffectValue;
    return true;
}