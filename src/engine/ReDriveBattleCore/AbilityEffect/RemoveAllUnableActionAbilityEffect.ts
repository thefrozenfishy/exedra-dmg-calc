// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UnableActionUnitStateBase } from "../UnitState/UnableActionUnitStateBase";
import { notPorted } from "../../runtime";
import { RemoveStateAbilityEffectBase } from "./RemoveStateAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "../UnitState/UnitStateBase";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveAllUnableActionAbilityEffect  (TypeDefIndex 1206, public class) ----
export class RemoveAllUnableActionAbilityEffect extends RemoveStateAbilityEffectBase {
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192D300  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.maxRemoveCount = info._EffectValue1;
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x192E100 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean {
        if (state._EffectOrigin !== 1) return false;
        return state instanceof UnableActionUnitStateBase;
    }
}
