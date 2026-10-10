// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { ResetUniqueBuffDebuffAbilityEffectBase } from "./ResetUniqueBuffDebuffAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.ResetUniqueBuffAbilityEffect  (TypeDefIndex 1208, public class) ----
export class ResetUniqueBuffAbilityEffect extends ResetUniqueBuffDebuffAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("ResetUniqueBuffAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18FE960  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ResetUniqueBuffAbilityEffect..ctor", 0x18FE960); }
    /** @rva 0x19000E0 slot 8  public override bool IsRemovable(UnitStateBase state) { } */
    IsRemovable(state: UnitStateBase): boolean { return notPorted("ResetUniqueBuffAbilityEffect.IsRemovable", 0x19000E0); }
}
