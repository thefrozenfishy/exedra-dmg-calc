// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UniqueUnitStateBase } from "../UnitState/UniqueUnitStateBase";
import { isImpl, notPorted } from "../../runtime";
import { ResetUniqueBuffDebuffAbilityEffectBase } from "./ResetUniqueBuffDebuffAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "../UnitState/UnitStateBase";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.ResetUniqueBuffAbilityEffect  (TypeDefIndex 1208, public class) ----
export class ResetUniqueBuffAbilityEffect extends ResetUniqueBuffDebuffAbilityEffectBase {
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x192D300  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.uniqueStatePatternMstId = info._EffectValue1;
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        return this;
    }
    /** @rva 0x192EA80 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean {
        if (!(this.uniqueStatePatternMstId > 0)) return false;
        return state instanceof UniqueUnitStateBase && isImpl(state, "IBuff") && state._UniqueStatePatternMstId === this.uniqueStatePatternMstId;
    }
}
