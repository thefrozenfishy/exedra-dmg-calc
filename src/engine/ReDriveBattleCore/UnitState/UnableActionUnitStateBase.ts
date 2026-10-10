// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UnableUseSkillUnitStateBase } from "./UnableUseSkillUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UnableActionUnitStateBase  (TypeDefIndex 495, public abstract class) ----
export abstract class UnableActionUnitStateBase extends UnableUseSkillUnitStateBase {
    /** @rva 0x15C0960  protected void .ctor() { } */
    ctor(): this { return notPorted("UnableActionUnitStateBase..ctor", 0x15C0960); }
    /** @rva 0x15C09B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UnableActionUnitStateBase..ctor", 0x15C09B0); }
    /** @rva 0x15C89B0 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("UnableActionUnitStateBase.CanAddTo", 0x15C89B0); }
}
