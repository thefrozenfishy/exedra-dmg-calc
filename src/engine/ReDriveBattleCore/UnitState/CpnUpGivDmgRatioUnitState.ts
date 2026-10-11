// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { UpGivDmgRatioUnitState } from "./UpGivDmgRatioUnitState";

// ---- ReDriveBattleCore.UnitState.CpnUpGivDmgRatioUnitState  (TypeDefIndex 552, public class) ----
export class CpnUpGivDmgRatioUnitState extends UpGivDmgRatioUnitState {
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
}
