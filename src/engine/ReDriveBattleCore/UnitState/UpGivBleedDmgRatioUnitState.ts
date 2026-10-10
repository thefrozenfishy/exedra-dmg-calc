// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "./UnitStateBase";
import { UpGiveSlipDamageRatioUnitStateBase } from "./UpGiveSlipDamageRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpGivBleedDmgRatioUnitState  (TypeDefIndex 792, public class) ----
export class UpGivBleedDmgRatioUnitState extends UpGiveSlipDamageRatioUnitStateBase {
    /** @rva 0x16CF610  public void .ctor() { } */
    ctor(): this { return notPorted("UpGivBleedDmgRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpGivBleedDmgRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E46A0 slot 31  public override bool IsTarget(UnitStateBase state) { } */
    IsTarget(state: UnitStateBase): boolean { return notPorted("UpGivBleedDmgRatioUnitState.IsTarget", 0x16E46A0); }
}
