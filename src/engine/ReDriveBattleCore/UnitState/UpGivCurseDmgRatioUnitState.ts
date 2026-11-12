// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CurseUnitStateBase } from "./CurseUnitStateBase";
import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UnitStateBase } from "./UnitStateBase";
import { UpGiveSlipDamageRatioUnitStateBase } from "./UpGiveSlipDamageRatioUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpGivCurseDmgRatioUnitState  (TypeDefIndex 791, public class) ----
export class UpGivCurseDmgRatioUnitState extends UpGiveSlipDamageRatioUnitStateBase {
    /** @rva 0x1715C30  public void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15F8010  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x172DC90 slot 31  public override bool IsTarget(UnitStateBase state) { } */
    IsTarget(state: UnitStateBase): boolean { return state instanceof CurseUnitStateBase; }
}
