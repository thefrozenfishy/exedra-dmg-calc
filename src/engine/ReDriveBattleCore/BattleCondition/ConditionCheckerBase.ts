// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";

// ---- ReDriveBattleCore.BattleCondition.ConditionCheckerBase  (TypeDefIndex 1042, public abstract class) ----
export abstract class ConditionCheckerBase {
    /** 0x0 protected static readonly string CompareValueDelimiter */
    static CompareValueDelimiter: string = null!;
    /** 0x10 protected BattleConditionUtils.Condition condition */
    condition: BattleConditionUtils_Condition = null!;
    /** @rva 0x737FB0  public void .ctor(BattleConditionUtils.Condition condition) { } */
    ctor$Condition(condition: BattleConditionUtils_Condition): this {
        this.condition = condition;
        return this;
    }
    /** @rva -1 slot 4  public abstract bool Check(); */
    abstract Check(): boolean;
    /** @rva 0x17EC260  private static void .cctor() { } */
    static cctor(): void { return notPorted("ConditionCheckerBase..cctor", 0x17EC260); }
}
