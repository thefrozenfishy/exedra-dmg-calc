// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpElementResistUnitStateBase } from "./UpElementResistUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpElementResistRatioUnitState  (TypeDefIndex 783, public class) ----
export class UpElementResistRatioUnitState extends UpElementResistUnitStateBase {
    get UpRatio(): Decimal { return this.get_UpRatio(); }
    /** @rva 0x16E4320  public Decimal get_UpRatio() { } */
    get_UpRatio(): Decimal { return notPorted("UpElementResistRatioUnitState.get_UpRatio", 0x16E4320); }
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
    /** @rva 0x16E41F0 slot 29  public override Decimal GetElementResistVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementResistVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal { return notPorted("UpElementResistRatioUnitState.GetElementResistVariationValue", 0x16E41F0); }
}
