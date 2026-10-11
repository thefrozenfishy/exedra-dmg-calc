// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import { ValueComparerBase } from "./ValueComparerBase";

// ---- ReDriveBattleCore.BattleCondition.BoolValueComparer  (TypeDefIndex 1068, public class) ----
export class BoolValueComparer extends ValueComparerBase<boolean> {
    /** @rva 0x17E8270  public void .ctor(bool leftValue, bool rightValue) { } */
    ctor$bool_bool(leftValue: boolean, rightValue: boolean): this {
        super.ctor$T_T(leftValue, rightValue);
        return this;
    }
    /** @rva 0x17E8240 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean {
        if (compareOperator === 1) return this.leftValue === this.rightValue;
        if (compareOperator === 2) return this.leftValue !== this.rightValue;
        return false;
    }
}
