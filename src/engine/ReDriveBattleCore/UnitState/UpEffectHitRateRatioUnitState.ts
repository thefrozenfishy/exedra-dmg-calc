// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpEffectHitRateUnitStateBase } from "./UpEffectHitRateUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpEffectHitRateRatioUnitState  (TypeDefIndex 777, public class) ----
export class UpEffectHitRateRatioUnitState extends UpEffectHitRateUnitStateBase {
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
    /** @rva 0x15BBF20 slot 30  public override float GetEffectHitRateVariationValue(BattleUnit unit, float processingValue) { } */
    GetEffectHitRateVariationValue(unit: BattleUnit, processingValue: float): float {
        return f32(this._UpdateableEffectValue / 10);
    }
}
