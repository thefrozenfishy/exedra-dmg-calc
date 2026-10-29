// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { ICollection, int } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";

// base type ListComparer<ICollection<int>, int> is outside the ported set
// ---- ReDriveBattleCore.BattleCondition.IntListComparer  (TypeDefIndex 1072, public class) ----
export class IntListComparer {
    /** @rva 0x1800C10  public void .ctor(ICollection<int> leftValue, int rightValue) { } */
    /** 0x10 public ICollection<int> leftValue (ListComparer<ICollection<int>, int>) */
    leftValue: ICollection<int> = null!;
    /** 0x18 public int rightValue (ListComparer<ICollection<int>, int>) */
    rightValue: int = 0;
    ctor$ICollectionint_int(leftValue: ICollection<int>, rightValue: int): this {
        this.leftValue = leftValue;
        this.rightValue = rightValue;
        return this;
    }
    /** @rva 0x1800B70 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean {
        if (compareOperator === 7) return [...this.leftValue].includes(this.rightValue);
        if (compareOperator === 8) return !([...this.leftValue].includes(this.rightValue));
        return false;
    }
}
