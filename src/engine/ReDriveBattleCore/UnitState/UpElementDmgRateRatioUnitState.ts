// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
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
    ctor(): this { return notPorted("UpElementDmgRateRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpElementDmgRateRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E3D70 slot 30  public override Decimal GetElementDamageRateVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementDamageRateVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal { return notPorted("UpElementDmgRateRatioUnitState.GetElementDamageRateVariationValue", 0x16E3D70); }
}
