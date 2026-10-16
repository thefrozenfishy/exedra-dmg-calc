// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DwnRecoveryEpRateRatioUnitStateBase } from "./DwnRecoveryEpRateRatioUnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnRecoveryEpRateRatioRatioUnitState  (TypeDefIndex 618, public class) ----
export class DwnRecoveryEpRateRatioRatioUnitState extends DwnRecoveryEpRateRatioUnitStateBase {
    /** 0x90 private float <DownRatio>k__BackingField */
    _DownRatio: float = 0;
    get DownRatio(): float { return this.get_DownRatio(); }
    set DownRatio(v: float) { this.set_DownRatio(v); }
    /** @rva 0x753560  public float get_DownRatio() { } */
    get_DownRatio(): float { return this._DownRatio; /* auto-property */ }
    /** @rva 0x753810  public void set_DownRatio(float value) { } */
    set_DownRatio(value: float): void { this._DownRatio = value; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16FAC30  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DownRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x16FAC10 slot 30  public override float GetRecoveryEpRateRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetRecoveryEpRateRatioVariationValue(unit: BattleUnit, processingValue: float): float {
        return -f32(f32(processingValue * this._DownRatio) / 100);
    }
}
