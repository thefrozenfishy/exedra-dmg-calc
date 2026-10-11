// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownCtrUnitStateBase } from "./DownCtrUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnCtrFixedUnitState  (TypeDefIndex 593, public class) ----
export class DwnCtrFixedUnitState extends DownCtrUnitStateBase {
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x15BBF20  public float get_DownFixed() { } */
    get_DownFixed(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
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
    /** @rva 0x15BCAC0 slot 30  public override float GetCtrVariationValue(BattleUnit unit, float processingValue) { } */
    GetCtrVariationValue(unit: BattleUnit, processingValue: float): float {
        return -f32(f32(f32(this._UpdateableEffectValue / 10) * processingValue) / 100);
    }
}
