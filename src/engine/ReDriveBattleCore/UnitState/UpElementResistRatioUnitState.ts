// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpElementResistUnitStateBase } from "./UpElementResistUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpElementResistRatioUnitState  (TypeDefIndex 783, public class) ----
export class UpElementResistRatioUnitState extends UpElementResistUnitStateBase {
    get UpRatio(): Decimal { return this.get_UpRatio(); }
    /** @rva 0x16E4320  public Decimal get_UpRatio() { } */
    get_UpRatio(): Decimal { return notPorted("UpElementResistRatioUnitState.get_UpRatio", 0x16E4320); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpElementResistRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpElementResistRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E41F0 slot 29  public override Decimal GetElementResistVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementResistVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal { return notPorted("UpElementResistRatioUnitState.GetElementResistVariationValue", 0x16E41F0); }
}
