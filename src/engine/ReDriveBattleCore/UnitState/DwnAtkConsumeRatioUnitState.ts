// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownAttackConsumeUnitStateBase } from "./DownAttackConsumeUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnAtkConsumeRatioUnitState  (TypeDefIndex 582, public class) ----
export class DwnAtkConsumeRatioUnitState extends DownAttackConsumeUnitStateBase {
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float {
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
    /** @rva 0x15BC150 slot 36  protected override Decimal GetAtkVariationValueIfRemainCount(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValueIfRemainCount(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("DwnAtkConsumeRatioUnitState.GetAtkVariationValueIfRemainCount", 0x15BC150); }
}
