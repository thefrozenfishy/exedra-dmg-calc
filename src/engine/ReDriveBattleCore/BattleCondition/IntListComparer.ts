// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { ICollection, int } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";

// base type ListComparer<ICollection<int>, int> is outside the ported set
// ---- ReDriveBattleCore.BattleCondition.IntListComparer  (TypeDefIndex 1072, public class) ----
export class IntListComparer {
    /** @rva 0x17EDEA0  public void .ctor(ICollection<int> leftValue, int rightValue) { } */
    ctor$ICollectionint_int(leftValue: ICollection<int>, rightValue: int): this { return notPorted("IntListComparer..ctor", 0x17EDEA0); }
    /** @rva 0x17EDE00 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean { return notPorted("IntListComparer.Compare", 0x17EDE00); }
}
