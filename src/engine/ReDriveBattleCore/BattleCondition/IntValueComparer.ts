// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import { ValueComparerBase } from "./ValueComparerBase";

// ---- ReDriveBattleCore.BattleCondition.IntValueComparer  (TypeDefIndex 1066, public class) ----
export class IntValueComparer extends ValueComparerBase<int> {
    /** @rva 0x18160C0  public void .ctor(int leftValue, int rightValue) { } */
    ctor$int_int(leftValue: int, rightValue: int): this {
        super.ctor$T_T(leftValue, rightValue);
        return this;
    }
    /** @rva 0x1816040 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean {
        switch (compareOperator) {
            case 1: return this.leftValue === this.rightValue;
            case 2: return this.leftValue !== this.rightValue;
            case 3: return this.leftValue > this.rightValue;
            case 4: return this.leftValue >= this.rightValue;
            case 5: return this.leftValue < this.rightValue;
            case 6: return this.leftValue <= this.rightValue;
            default: return false;
        }
    }
}
