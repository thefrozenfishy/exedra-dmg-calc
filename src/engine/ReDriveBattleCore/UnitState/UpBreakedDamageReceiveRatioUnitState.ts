// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpBreakedDamageReceiveRatioUnitStateBase } from "./UpBreakedDamageReceiveRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpBreakedDamageReceiveRatioUnitState  (TypeDefIndex 756, public class) ----
export class UpBreakedDamageReceiveRatioUnitState extends UpBreakedDamageReceiveRatioUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpBreakedDamageReceiveRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpBreakedDamageReceiveRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpBreakedDamageReceiveRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x15BBF20 slot 30  public override float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("UpBreakedDamageReceiveRatioUnitState.GetBreakedDamageReceiveRatioVariationValue", 0x15BBF20); }
}
