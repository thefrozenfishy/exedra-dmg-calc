// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownCtrUnitStateBase } from "./DownCtrUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnCtrFixedUnitState  (TypeDefIndex 593, public class) ----
export class DwnCtrFixedUnitState extends DownCtrUnitStateBase {
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x15BBF20  public float get_DownFixed() { } */
    get_DownFixed(): float { return notPorted("DwnCtrFixedUnitState.get_DownFixed", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnCtrFixedUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnCtrFixedUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BCAC0 slot 30  public override float GetCtrVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtrVariationValue(unit: BattleUnit, processingValue: float): float { return notPorted("DwnCtrFixedUnitState.GetCtrVariationValue", 0x15BCAC0); }
}
