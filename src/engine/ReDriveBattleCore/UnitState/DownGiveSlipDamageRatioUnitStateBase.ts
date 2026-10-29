// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownGiveSlipDamageUnitStateBase } from "./DownGiveSlipDamageUnitStateBase";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownGiveSlipDamageRatioUnitStateBase  (TypeDefIndex 605, public abstract class) ----
export abstract class DownGiveSlipDamageRatioUnitStateBase extends DownGiveSlipDamageUnitStateBase {
    get DownRatio(): Decimal { return this.get_DownRatio(); }
    /** @rva 0x16E2A20  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal {
        return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)); // (decimal)float / 10m
    }
    /** @rva 0x16E2A10  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C5BB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x16E2830 slot 32  public override Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal {
        if (!this.IsTarget(state)) return Decimal.Zero; // vslot 31
        return processingValue.mul(Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).div(Decimal.fromInt(100))).neg();
    }
}
