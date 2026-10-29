// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpAttackUnitStateBase } from "./UpAttackUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpAtkRatioUnitState  (TypeDefIndex 749, public class) ----
export class UpAtkRatioUnitState extends UpAttackUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15CBE70  public float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x16F4BD0 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromInt(unit.get_ATK()).mul(Decimal.fromFloat(f32(this._UpdateableEffectValue / 10)).div(Decimal.fromInt(100)));
    }
}
