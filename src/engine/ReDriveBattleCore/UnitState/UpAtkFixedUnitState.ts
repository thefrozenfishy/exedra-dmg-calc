// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpAttackUnitStateBase } from "./UpAttackUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpAtkFixedUnitState  (TypeDefIndex 752, public class) ----
export class UpAtkFixedUnitState extends UpAttackUnitStateBase {
    get UpFixed(): float { return this.get_UpFixed(); }
    /** @rva 0xC646A0  public float get_UpFixed() { } */
    get_UpFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpAtkFixedUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpAtkFixedUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E0A90 slot 30  public override Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("UpAtkFixedUnitState.GetAtkVariationValue", 0x16E0A90); }
}
