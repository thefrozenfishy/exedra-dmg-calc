// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpElementDamageRateUnitStateBase } from "./UpElementDamageRateUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpElementDmgRateRatioUnitState  (TypeDefIndex 781, public class) ----
export class UpElementDmgRateRatioUnitState extends UpElementDamageRateUnitStateBase {
    get UpRatio(): Decimal { return this.get_UpRatio(); }
    /** @rva 0x16E3EA0  public Decimal get_UpRatio() { } */
    get_UpRatio(): Decimal { return notPorted("UpElementDmgRateRatioUnitState.get_UpRatio", 0x16E3EA0); }
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
    /** @rva 0x16E3D70 slot 30  public override Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal {
        if (this._TargetElement === 0 || (this._TargetElement as number) === (attackElement as number)) return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10));
        return Decimal.Zero;
    }
}
