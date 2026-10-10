// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { CalculationPointPolicyMstModel } from "../Model/CalculationPointPolicyMstModel";

// base type BattleMstReaderBase<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int> is outside the ported set
// ---- ReDriveBattleCore.Reader.CalculationPointPolicyMstReader  (TypeDefIndex 872, public class) ----
export class CalculationPointPolicyMstReader {
    /** @rva 0x16CF6E0  public static CalculationPointPolicyMstModel GetModelByCoefficientName(string name) { } */
    static GetModelByCoefficientName(name: string): CalculationPointPolicyMstModel { return notPorted("CalculationPointPolicyMstReader.GetModelByCoefficientName", 0x16CF6E0); }
    /** @rva 0x16CF840  public void .ctor() { } */
    ctor(): this { return notPorted("CalculationPointPolicyMstReader..ctor", 0x16CF840); }
}
