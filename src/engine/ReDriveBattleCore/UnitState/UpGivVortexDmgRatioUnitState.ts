// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "./UnitStateBase";
import { UpGiveSlipDamageRatioUnitStateBase } from "./UpGiveSlipDamageRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpGivVortexDmgRatioUnitState  (TypeDefIndex 793, public class) ----
export class UpGivVortexDmgRatioUnitState extends UpGiveSlipDamageRatioUnitStateBase {
    /** @rva 0x16CF610  public void .ctor() { } */
    ctor(): this { return notPorted("UpGivVortexDmgRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpGivVortexDmgRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x16E4920 slot 31  public override bool IsTarget(UnitStateBase state) { } */
    IsTarget(state: UnitStateBase): boolean { return notPorted("UpGivVortexDmgRatioUnitState.IsTarget", 0x16E4920); }
}
