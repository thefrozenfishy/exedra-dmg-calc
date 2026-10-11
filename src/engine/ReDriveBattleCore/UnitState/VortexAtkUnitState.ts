// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ReceiveSlipDamageUnitStateBase_ParameterType } from "./ReceiveSlipDamageUnitStateBase";
import { VortexUnitStateBase } from "./VortexUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.VortexAtkUnitState  (TypeDefIndex 518, public class) ----
export class VortexAtkUnitState extends VortexUnitStateBase {
    /** @rva 0x15D1F50 slot 32  protected override Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType() { } */
    get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return notPorted("VortexAtkUnitState.get_DamageType", 0x15D1F50); }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15D1ED0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        this._RemainAttackCount = info._EffectValue2;
        return this;
    }
}
