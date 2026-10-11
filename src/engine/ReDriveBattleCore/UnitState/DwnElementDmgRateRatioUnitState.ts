// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
    /** @rva 0x15BCF10  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal { return notPorted("DwnElementDmgRateRatioUnitState.get_DownRatio", 0x15BCF10); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15BCDB0 slot 30  public override Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal {
        if (this._TargetElement === 0 || (this._TargetElement as number) === (attackElement as number)) return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).neg();
        return Decimal.Zero;
    }
}
