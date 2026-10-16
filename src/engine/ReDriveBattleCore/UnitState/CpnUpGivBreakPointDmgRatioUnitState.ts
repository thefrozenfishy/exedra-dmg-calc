// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { UpGivBreakPointDmgRatioUnitState } from "./UpGivBreakPointDmgRatioUnitState";

// ---- ReDriveBattleCore.UnitState.CpnUpGivBreakPointDmgRatioUnitState  (TypeDefIndex 553, public class) ----
export class CpnUpGivBreakPointDmgRatioUnitState extends UpGivBreakPointDmgRatioUnitState {
    /** @rva 0x15D9DA0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DB550  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
}
