// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownBreakedDamageReceiveRatioUnitStateBase } from "./DownBreakedDamageReceiveRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnBreakedDamageReceiveRatioUnitState  (TypeDefIndex 586, public class) ----
export class DwnBreakedDamageReceiveRatioUnitState extends DownBreakedDamageReceiveRatioUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float { return notPorted("DwnBreakedDamageReceiveRatioUnitState.get_DownRatio", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnBreakedDamageReceiveRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnBreakedDamageReceiveRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BC690 slot 30  public override float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("DwnBreakedDamageReceiveRatioUnitState.GetBreakedDamageReceiveRatioVariationValue", 0x15BC690); }
}
