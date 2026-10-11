// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpBreakEffectUnitStateBase } from "./UpBreakEffectUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpBreakEffectRatioUnitState  (TypeDefIndex 760, public class) ----
export class UpBreakEffectRatioUnitState extends UpBreakEffectUnitStateBase {
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
    /** @rva 0x16E1000 slot 30  public override Decimal GetBreakEffectVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetBreakEffectVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromFloat(f32(this._UpdateableEffectValue / 10));
    }
}
