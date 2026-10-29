// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UnableUseSkillUnitStateBase } from "./UnableUseSkillUnitStateBase";
import type { Type } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UnableActionUnitStateBase  (TypeDefIndex 495, public abstract class) ----
export abstract class UnableActionUnitStateBase extends UnableUseSkillUnitStateBase {
    /** @rva 0x15D0890  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15D08E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15D84B0 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        return !(targetUnit._Condition.GetUnitState$2((this as object).constructor as Type, false).length > 0); // GetUnitState(GetType()).Any()
    }
}
