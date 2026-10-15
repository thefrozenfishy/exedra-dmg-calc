// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownBreakedDamageReceiveRatioUnitStateBase } from "./DownBreakedDamageReceiveRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnBreakedDamageReceiveRatioUnitState  (TypeDefIndex 586, public class) ----
export class DwnBreakedDamageReceiveRatioUnitState extends DownBreakedDamageReceiveRatioUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15E1810  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x15D9DA0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DB550  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15E1F80 slot 30  public override float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float {
        return f32(f32(f32(this._UpdateableEffectValue / 10) * -processingValue) / 100);
    }
}
