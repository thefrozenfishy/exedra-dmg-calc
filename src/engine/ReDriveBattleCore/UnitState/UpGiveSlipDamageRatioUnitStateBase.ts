// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { UpGiveSlipDamageUnitStateBase } from "./UpGiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpGiveSlipDamageRatioUnitStateBase  (TypeDefIndex 787, public abstract class) ----
export abstract class UpGiveSlipDamageRatioUnitStateBase extends UpGiveSlipDamageUnitStateBase {
    get UpRatio(): Decimal { return this.get_UpRatio(); }
    /** @rva 0x170F640  public Decimal get_UpRatio() { } */
    get_UpRatio(): Decimal {
        return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)); // (decimal)float / 10m
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
    /** @rva 0x170F470 slot 32  public override Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal {
        if (!this.IsTarget(state)) return Decimal.Zero; // vslot 31
        return damageValue.mul(Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).div(Decimal.fromInt(100))); // damageValue here (the Down variant uses processingValue)
    }
}
