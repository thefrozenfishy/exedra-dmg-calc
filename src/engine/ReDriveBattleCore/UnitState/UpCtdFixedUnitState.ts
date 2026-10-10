// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpCtdUnitStateBase } from "./UpCtdUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpCtdFixedUnitState  (TypeDefIndex 762, public class) ----
export class UpCtdFixedUnitState extends UpCtdUnitStateBase {
    get UpFixed(): float { return this.get_UpFixed(); }
    /** @rva 0x15BBF20  public float get_UpFixed() { } */
    get_UpFixed(): float { return notPorted("UpCtdFixedUnitState.get_UpFixed", 0x15BBF20); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpCtdFixedUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpCtdFixedUnitState..ctor", 0x15BAC90); }
    /** @rva 0x15BBF20 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("UpCtdFixedUnitState.GetCtdVariationValue", 0x15BBF20); }
}
