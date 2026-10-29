// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { ICollection } from "../../runtime";
import type { CompareOperator } from "./CompareOperator";

// base type ListComparer<ICollection<string>, string> is outside the ported set
// ---- ReDriveBattleCore.BattleCondition.AbilityEffectListComparer  (TypeDefIndex 1071, public class) ----
export class AbilityEffectListComparer {
    /** @rva 0x17F3BD0  public void .ctor(ICollection<string> leftValue, string rightValue) { } */
    /** 0x10 public ICollection<string> leftValue (ListComparer<ICollection<string>, string>) */
    leftValue: ICollection<string> = null!;
    /** 0x18 public string rightValue (ListComparer<ICollection<string>, string>) */
    rightValue: string = null!;
    ctor$ICollectionstring_string(leftValue: ICollection<string>, rightValue: string): this {
        // ListComparer<ICollection<string>, string>..ctor
        this.leftValue = leftValue;
        this.rightValue = rightValue;
        return this;
    }
    /** @rva 0x17F3A90 slot 5  public override bool Compare(CompareOperator compareOperator) { } */
    Compare(compareOperator: CompareOperator): boolean {
        if (compareOperator === 7) return [...this.leftValue].some(x => this.$Compare$b__1_0(x));
        if (compareOperator === 8) return !([...this.leftValue].some(x => this.$Compare$b__1_1(x)));
        return false;
    }
    /** @rva 0x17F3BA0  private bool <Compare>b__1_0(string x) { } */
    $Compare$b__1_0(x: string): boolean {
        if (this.rightValue == null) throw new TypeError("ArgumentNullException: value");
        return x.startsWith(this.rightValue); // String.StartsWith(string) (current culture)
    }
    /** @rva 0x17F3BA0  private bool <Compare>b__1_1(string x) { } */
    $Compare$b__1_1(x: string): boolean {
        if (this.rightValue == null) throw new TypeError("ArgumentNullException: value");
        return x.startsWith(this.rightValue); // String.StartsWith(string) (current culture)
    }
}
