// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import { ValueComparerBase } from "./ValueComparerBase";

// ---- ReDriveBattleCore.BattleCondition.FloatValueComparer  (TypeDefIndex 1067, public class) ----
export class FloatValueComparer extends ValueComparerBase<float> {
    /** @rva 0x17FFE40  public void .ctor(float leftValue, float rightValue) { } */
    ctor$float_float(leftValue: float, rightValue: float): this {
        super.ctor$T_T(leftValue, rightValue);
        return this;
    }
    /** @rva 0x17FFDB0 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
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
