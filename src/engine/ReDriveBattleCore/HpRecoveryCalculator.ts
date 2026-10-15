// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CalculationPointPolicyMstReader } from "./Reader/CalculationPointPolicyMstReader";
import type { IReceiveRecoveryVariation } from "./UnitState/IReceiveRecoveryVariation";
import { Decimal, isImpl, notPorted } from "../runtime";

import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.HpRecoveryCalculator  (TypeDefIndex 411, public class) ----
export class HpRecoveryCalculator {
    /** @rva 0x14C4100  public static Decimal GetProcessedRecoveryValue(BattleUnit userUnit, BattleUnit targetUnit, Decimal recoveryValue, bool shouldSuppress) { } */
    static GetProcessedRecoveryValue(userUnit: BattleUnit, targetUnit: BattleUnit, recoveryValue: Decimal, shouldSuppress: boolean): Decimal {
        const healRatio = Decimal.fromFloat(userUnit.GetProcessedHealRatio());
        const baseValue = healRatio.div(Decimal.fromInt(100)).add(Decimal.One).mul(recoveryValue);
        let value = baseValue;
        for (const state of targetUnit._Condition._StateList) {
            if (!isImpl(state, "IReceiveRecoveryVariation")) continue;
            const v = state as unknown as IReceiveRecoveryVariation;
            if (v.Addition !== 0) continue; // Up
            if (!state.IsActive$BattleUnit(targetUnit)) continue;
            value = value.add(v.GetReceiveRecoveryVariationValue(targetUnit, baseValue, value));
        }
        for (const state of targetUnit._Condition._StateList) {
            if (!isImpl(state, "IReceiveRecoveryVariation")) continue;
            const v = state as unknown as IReceiveRecoveryVariation;
            if (v.Addition !== 1) continue; // Down
            if (!state.IsActive$BattleUnit(targetUnit)) continue;
            value = value.add(v.GetReceiveRecoveryVariationValue(targetUnit, baseValue, value));
        }
        if (shouldSuppress) {
            // the game: reader.GetModel(x => x.coefficientName == "healValueSuppresionRatio") (<>c.b__0_0)
            const model = CalculationPointPolicyMstReader.GetModelByCoefficientName("healValueSuppresionRatio");
            value = value.mul(Decimal.One.sub(Decimal.fromInt(model.get_Value()).div(Decimal.fromInt(1000))));
        }
        return Decimal.max(value, Decimal.Zero); // Math.Max
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
