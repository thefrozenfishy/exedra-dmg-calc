// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownAttackUnitStateBase } from "./DownAttackUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnAtkRatioUnitState  (TypeDefIndex 580, public class) ----
export class DwnAtkRatioUnitState extends DownAttackUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15CBE70  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C5BB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15CC1C0 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal {
        return processingValue.mul(Decimal.fromFloat(f32(this._UpdateableEffectValue / 10)).div(Decimal.fromInt(100))).neg();
    }
}
