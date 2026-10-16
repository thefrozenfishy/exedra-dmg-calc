// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownSpeedUnitStateBase } from "./DownSpeedUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnSpdRatioUnitState  (TypeDefIndex 620, public class) ----
export class DwnSpdRatioUnitState extends DownSpeedUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15E1810  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15E14E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16FB5E0 slot 33  public override Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal {
        return processingValue.mul(Decimal.fromFloat(f32(this._UpdateableEffectValue / 10)).div(Decimal.fromInt(100))).neg();
    }
    /** @rva 0x16FB700 slot 34  public override Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("DwnSpdRatioUnitState.GetSpeedVariationValue", 0x16FB700); }
}
