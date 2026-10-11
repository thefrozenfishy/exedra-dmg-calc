// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpSpeedUnitStateBase } from "./UpSpeedUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpSpdRatioUnitState  (TypeDefIndex 808, public class) ----
export class UpSpdRatioUnitState extends UpSpeedUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x16E71B0 slot 33  public override Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpSpdRatioUnitState.GetSpeedVariationValue", 0x16E71B0); }
    /** @rva 0x16E7080 slot 34  public override Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("UpSpdRatioUnitState.GetSpeedVariationValue", 0x16E7080); }
}
