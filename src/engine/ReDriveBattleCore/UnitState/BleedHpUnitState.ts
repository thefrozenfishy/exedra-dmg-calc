// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { BleedUnitStateBase } from "./BleedUnitStateBase";
import type { ReceiveSlipDamageUnitStateBase_ParameterType } from "./ReceiveSlipDamageUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.BleedHpUnitState  (TypeDefIndex 517, public class) ----
export class BleedHpUnitState extends BleedUnitStateBase {
    /** @rva 0x15C6A50 slot 32  protected override Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType() { } */
    get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return 2 as ReceiveSlipDamageUnitStateBase_ParameterType; /* new Nullable<ParameterType>(Hp) */ }
    /** @rva 0x15C6960  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C68E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
}
