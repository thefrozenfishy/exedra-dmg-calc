// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownSpeedUnitStateBase } from "./DownSpeedUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnSpdFixedUnitState  (TypeDefIndex 622, public class) ----
export class DwnSpdFixedUnitState extends DownSpeedUnitStateBase {
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0xC646A0  public float get_DownFixed() { } */
    get_DownFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
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
    /** @rva 0x15BEFD0 slot 33  public override Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("DwnSpdFixedUnitState.GetSpeedVariationValue", 0x15BEFD0); }
    /** @rva 0x15BF070 slot 34  public override Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("DwnSpdFixedUnitState.GetSpeedVariationValue", 0x15BF070); }
}
