// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { BleedUnitStateBase } from "./BleedUnitStateBase";
import type { ReceiveSlipDamageUnitStateBase_ParameterType } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.BleedHpUnitState  (TypeDefIndex 517, public class) ----
export class BleedHpUnitState extends BleedUnitStateBase {
    /** @rva 0x15B60E0 slot 32  protected override Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType() { } */
    get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return notPorted("BleedHpUnitState.get_DamageType", 0x15B60E0); }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this { return notPorted("BleedHpUnitState..ctor", 0x15B5FF0); }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("BleedHpUnitState..ctor", 0x15B5F70); }
}
