// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CalculationPointPolicyMstModel } from "../Model/CalculationPointPolicyMstModel";
import { notPorted } from "../../runtime";

import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { CalculationPointPolicyMstRecord } from "../../Network/Definition/CalcPoint/CalculationPointPolicyMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.CalculationPointPolicyMstReader  (TypeDefIndex 872, public class) ----
export class CalculationPointPolicyMstReader extends BattleMstReaderBase<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int> {
    /** @rva 0x16F8640  public static CalculationPointPolicyMstModel GetModelByCoefficientName(string name) { } */
    static GetModelByCoefficientName(name: string): CalculationPointPolicyMstModel {
        return BattleMstReaderBase.get_Instance<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(CalculationPointPolicyMstModel)
            .GetModel(x => x.coefficientName === name); // <GetModelByCoefficientName>b__0: string ==
    }
    /** @rva 0x16F87A0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
