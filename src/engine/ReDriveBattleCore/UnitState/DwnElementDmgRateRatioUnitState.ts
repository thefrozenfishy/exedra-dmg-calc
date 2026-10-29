// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownElementDamageRateUnitStateBase } from "./DownElementDamageRateUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnElementDmgRateRatioUnitState  (TypeDefIndex 600, public class) ----
export class DwnElementDmgRateRatioUnitState extends DownElementDamageRateUnitStateBase {
    get DownRatio(): Decimal { return this.get_DownRatio(); }
    /** @rva 0x15CCE60  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal {
        return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)); // (decimal)float / 10m
    }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C5BB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15CCD00 slot 30  public override Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal {
        if (this._TargetElement === 0 || (this._TargetElement as number) === (attackElement as number)) return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).neg();
        return Decimal.Zero;
    }
}
