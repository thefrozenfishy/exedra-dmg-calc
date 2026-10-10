// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RemoveStateAbilityEffectBase } from "./RemoveStateAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.RemoveAllDebuffAbilityEffect  (TypeDefIndex 1204, public class) ----
export class RemoveAllDebuffAbilityEffect extends RemoveStateAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("RemoveAllDebuffAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18FE960  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("RemoveAllDebuffAbilityEffect..ctor", 0x18FE960); }
    /** @rva 0x18FF700 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean { return notPorted("RemoveAllDebuffAbilityEffect.IsRemovable", 0x18FF700); }
}
