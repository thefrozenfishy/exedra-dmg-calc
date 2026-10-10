// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import type { IComparer } from "./IComparer";

// ---- ReDriveBattleCore.BattleCondition.ValueComparerBase<T>  (TypeDefIndex 1065, public abstract class) ----
export abstract class ValueComparerBase<T> {  // implements IComparer
    static readonly __interfaces: readonly string[] = ['IComparer'];
    /** 0x0 public T leftValue */
    leftValue: T = null!;
    /** 0x0 public T rightValue */
    rightValue: T = null!;
    /** @rva -1  public void .ctor(T leftValue, T rightValue) { } */
    ctor$T_T(leftValue: T, rightValue: T): this { return notPorted("ValueComparerBase..ctor", 0); }
    /** @rva -1 slot 5  public abstract bool Compare(CompareOperator compareOperator); */
    abstract Compare(compareOperator: CompareOperator): boolean;
}
