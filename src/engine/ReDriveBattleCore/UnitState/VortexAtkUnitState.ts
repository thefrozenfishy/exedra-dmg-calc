// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ReceiveSlipDamageUnitStateBase_ParameterType } from "./ReceiveSlipDamageUnitStateBase";
import { VortexUnitStateBase } from "./VortexUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.VortexAtkUnitState  (TypeDefIndex 518, public class) ----
export class VortexAtkUnitState extends VortexUnitStateBase {
    /** @rva 0x15F6D70 slot 32  protected override Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType() { } */
    get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return 0 as ReceiveSlipDamageUnitStateBase_ParameterType; /* new Nullable<ParameterType>(Atk) */ }
    /** @rva 0x15DC300  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15F6CF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        this._RemainAttackCount = info._EffectValue2;
        return this;
    }
}
