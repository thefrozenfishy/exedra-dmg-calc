// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { UpGiveSlipDamageUnitStateBase } from "./UpGiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpGiveSlipDamageRatioUnitStateBase  (TypeDefIndex 787, public abstract class) ----
export abstract class UpGiveSlipDamageRatioUnitStateBase extends UpGiveSlipDamageUnitStateBase {
    get UpRatio(): Decimal { return this.get_UpRatio(); }
    /** @rva 0x16E4B70  public Decimal get_UpRatio() { } */
    get_UpRatio(): Decimal { return notPorted("UpGiveSlipDamageRatioUnitStateBase.get_UpRatio", 0x16E4B70); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpGiveSlipDamageRatioUnitStateBase..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpGiveSlipDamageRatioUnitStateBase..ctor", 0x15BAC90); }
    /** @rva 0x16E49A0 slot 32  public override Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("UpGiveSlipDamageRatioUnitStateBase.GetSlipDamageVariationValue", 0x16E49A0); }
}
