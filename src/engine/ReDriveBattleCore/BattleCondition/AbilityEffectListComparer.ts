// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { ICollection } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";

// base type ListComparer<ICollection<string>, string> is outside the ported set
// ---- ReDriveBattleCore.BattleCondition.AbilityEffectListComparer  (TypeDefIndex 1071, public class) ----
export class AbilityEffectListComparer {
    /** @rva 0x17DF540  public void .ctor(ICollection<string> leftValue, string rightValue) { } */
    ctor$ICollectionstring_string(leftValue: ICollection<string>, rightValue: string): this { return notPorted("AbilityEffectListComparer..ctor", 0x17DF540); }
    /** @rva 0x17DF400 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean { return notPorted("AbilityEffectListComparer.Compare", 0x17DF400); }
    /** @rva 0x17DF510  private bool <Compare>b__1_0(string x) { } */
    $Compare$b__1_0(x: string): boolean { return notPorted("AbilityEffectListComparer.<Compare>b__1_0", 0x17DF510); }
    /** @rva 0x17DF510  private bool <Compare>b__1_1(string x) { } */
    $Compare$b__1_1(x: string): boolean { return notPorted("AbilityEffectListComparer.<Compare>b__1_1", 0x17DF510); }
}
