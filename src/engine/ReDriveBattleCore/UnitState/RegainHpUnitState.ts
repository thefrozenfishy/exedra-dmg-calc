// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { RegainUnitStateBase } from "./RegainUnitStateBase";

// ---- ReDriveBattleCore.UnitState.RegainHpUnitState  (TypeDefIndex 652, public class) ----
export class RegainHpUnitState extends RegainUnitStateBase {
    /** @rva 0x16CF610  public void .ctor() { } */
    ctor(): this { return notPorted("RegainHpUnitState..ctor", 0x16CF610); }
    /** @rva 0x15B7FD0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RegainHpUnitState..ctor", 0x15B7FD0); }
    /** @rva 0x16D7070 slot 26  public override Decimal GetParameterValue(BattleUnit sourceUnit) { } */
    GetParameterValue(sourceUnit: BattleUnit): Decimal { return notPorted("RegainHpUnitState.GetParameterValue", 0x16D7070); }
}
