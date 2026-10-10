// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpHpUnitStateBase } from "./UpHpUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpHpFixedUnitState  (TypeDefIndex 798, public class) ----
export class UpHpFixedUnitState extends UpHpUnitStateBase {
    get UpFixed(): float { return this.get_UpFixed(); }
    /** @rva 0xC646A0  public float get_UpFixed() { } */
    get_UpFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpHpFixedUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpHpFixedUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E5B00 slot 30  public override Decimal GetMaxHpVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetMaxHpVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpHpFixedUnitState.GetMaxHpVariationValue", 0x16E5B00); }
}
