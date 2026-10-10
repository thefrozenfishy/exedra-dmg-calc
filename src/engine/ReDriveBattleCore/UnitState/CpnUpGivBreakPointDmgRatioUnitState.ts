// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { UpGivBreakPointDmgRatioUnitState } from "./UpGivBreakPointDmgRatioUnitState";

// ---- ReDriveBattleCore.UnitState.CpnUpGivBreakPointDmgRatioUnitState  (TypeDefIndex 553, public class) ----
export class CpnUpGivBreakPointDmgRatioUnitState extends UpGivBreakPointDmgRatioUnitState {
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("CpnUpGivBreakPointDmgRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CpnUpGivBreakPointDmgRatioUnitState..ctor", 0x15B5240); }
}
