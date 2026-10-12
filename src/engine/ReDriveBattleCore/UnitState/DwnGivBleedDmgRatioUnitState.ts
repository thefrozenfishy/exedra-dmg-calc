// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { BleedUnitStateBase } from "./BleedUnitStateBase";
import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { DownGiveSlipDamageRatioUnitStateBase } from "./DownGiveSlipDamageRatioUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnGivBleedDmgRatioUnitState  (TypeDefIndex 610, public class) ----
export class DwnGivBleedDmgRatioUnitState extends DownGiveSlipDamageRatioUnitStateBase {
    /** @rva 0x15B3A90  public void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva 0x15BD270 slot 31  public override bool IsTarget(UnitStateBase state) { } */
    IsTarget(state: UnitStateBase): boolean { return state instanceof BleedUnitStateBase; }
}
