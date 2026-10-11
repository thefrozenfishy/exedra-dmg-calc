// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpAttackConsumeUnitStateBase } from "./UpAttackConsumeUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpAtkConsumeFixedUnitState  (TypeDefIndex 753, public class) ----
export class UpAtkConsumeFixedUnitState extends UpAttackConsumeUnitStateBase {
    get UpFixed(): float { return this.get_UpFixed(); }
    /** @rva 0xC646A0  public float get_UpFixed() { } */
    get_UpFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
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
    /** @rva 0x16E08D0 slot 36  protected override Decimal GetAtkVariationValueIfRemainCount(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValueIfRemainCount(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromFloat(this._UpdateableEffectValue);
    }
}
