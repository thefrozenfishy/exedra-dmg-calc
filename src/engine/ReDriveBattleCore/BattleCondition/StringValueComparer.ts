// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import { ValueComparerBase } from "./ValueComparerBase";

// ---- ReDriveBattleCore.BattleCondition.StringValueComparer  (TypeDefIndex 1069, public class) ----
export class StringValueComparer extends ValueComparerBase<string> {
    /** @rva 0x18010B0  public void .ctor(string leftValue, string rightValue) { } */
    ctor$string_string(leftValue: string, rightValue: string): this {
        super.ctor$T_T(leftValue, rightValue);
        return this;
    }
    /** @rva 0x1801060 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean {
        if (compareOperator === 1) return this.leftValue === this.rightValue; // String.Equals(a, b)
        if (compareOperator === 2) return !(this.leftValue === this.rightValue);
        return false;
    }
}
