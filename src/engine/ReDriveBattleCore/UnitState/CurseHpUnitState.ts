// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Nullable } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { CurseUnitStateBase } from "./CurseUnitStateBase";
import type { ReceiveSlipDamageUnitStateBase_ParameterType } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.CurseHpUnitState  (TypeDefIndex 514, public class) ----
export class CurseHpUnitState extends CurseUnitStateBase {
    /** @rva 0x15B7440 slot 32  protected override Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType() { } */
    get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return notPorted("CurseHpUnitState.get_DamageType", 0x15B7440); }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this { return notPorted("CurseHpUnitState..ctor", 0x15B5FF0); }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CurseHpUnitState..ctor", 0x15B5F70); }
}
