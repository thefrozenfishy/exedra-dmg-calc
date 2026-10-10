// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";
import { ValueComparerBase } from "./ValueComparerBase";

// ---- ReDriveBattleCore.BattleCondition.IntValueComparer  (TypeDefIndex 1066, public class) ----
export class IntValueComparer extends ValueComparerBase<int> {
    /** @rva 0x17EDF80  public void .ctor(int leftValue, int rightValue) { } */
    ctor$int_int(leftValue: int, rightValue: int): this { return notPorted("IntValueComparer..ctor", 0x17EDF80); }
    /** @rva 0x17EDF00 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean { return notPorted("IntValueComparer.Compare", 0x17EDF00); }
}
