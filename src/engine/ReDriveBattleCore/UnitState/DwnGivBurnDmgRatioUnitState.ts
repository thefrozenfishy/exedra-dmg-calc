// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { DownGiveSlipDamageRatioUnitStateBase } from "./DownGiveSlipDamageRatioUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnGivBurnDmgRatioUnitState  (TypeDefIndex 607, public class) ----
export class DwnGivBurnDmgRatioUnitState extends DownGiveSlipDamageRatioUnitStateBase {
    /** @rva 0x15B3A90  public void .ctor() { } */
    ctor(): this { return notPorted("DwnGivBurnDmgRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnGivBurnDmgRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x15BD610 slot 31  public override bool IsTarget(UnitStateBase state) { } */
    IsTarget(state: UnitStateBase): boolean { return notPorted("DwnGivBurnDmgRatioUnitState.IsTarget", 0x15BD610); }
}
