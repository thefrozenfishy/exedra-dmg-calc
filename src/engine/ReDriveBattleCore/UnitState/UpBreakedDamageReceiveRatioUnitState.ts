// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpBreakedDamageReceiveRatioUnitStateBase } from "./UpBreakedDamageReceiveRatioUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpBreakedDamageReceiveRatioUnitState  (TypeDefIndex 756, public class) ----
export class UpBreakedDamageReceiveRatioUnitState extends UpBreakedDamageReceiveRatioUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15E1810  public float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15E14E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x15E1810 slot 30  public override float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float {
        return f32(this._UpdateableEffectValue / 10);
    }
}
