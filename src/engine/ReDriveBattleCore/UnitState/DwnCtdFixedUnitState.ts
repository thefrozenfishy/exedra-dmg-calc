// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownCtdUnitStateBase } from "./DownCtdUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnCtdFixedUnitState  (TypeDefIndex 588, public class) ----
export class DwnCtdFixedUnitState extends DownCtdUnitStateBase {
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x15BBF20  public float get_DownFixed() { } */
    get_DownFixed(): float { return notPorted("DwnCtdFixedUnitState.get_DownFixed", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnCtdFixedUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnCtdFixedUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BC690 slot 30  public override float GetCtdVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtdVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("DwnCtdFixedUnitState.GetCtdVariationValue", 0x15BC690); }
}
