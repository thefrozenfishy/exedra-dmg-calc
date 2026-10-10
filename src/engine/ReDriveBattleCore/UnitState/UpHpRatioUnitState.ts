// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpHpUnitStateBase } from "./UpHpUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpHpRatioUnitState  (TypeDefIndex 797, public class) ----
export class UpHpRatioUnitState extends UpHpUnitStateBase {
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpHpRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpHpRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpHpRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E5B80 slot 30  public override Decimal GetMaxHpVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetMaxHpVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpHpRatioUnitState.GetMaxHpVariationValue", 0x16E5B80); }
}
