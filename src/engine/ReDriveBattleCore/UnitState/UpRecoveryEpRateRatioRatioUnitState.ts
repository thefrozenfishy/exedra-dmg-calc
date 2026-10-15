// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UpRecoveryEpRateRatioUnitStateBase } from "./UpRecoveryEpRateRatioUnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpRecoveryEpRateRatioRatioUnitState  (TypeDefIndex 806, public class) ----
export class UpRecoveryEpRateRatioRatioUnitState extends UpRecoveryEpRateRatioUnitStateBase {
    /** 0x90 private float <UpRatio>k__BackingField */
    _UpRatio: float = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    set UpRatio(v: float) { this.set_UpRatio(v); }
    /** @rva 0x753560  public float get_UpRatio() { } */
    get_UpRatio(): float { return this._UpRatio; /* auto-property */ }
    /** @rva 0x753810  public void set_UpRatio(float value) { } */
    set_UpRatio(value: float): void { this._UpRatio = value; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16FAC30  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        this._UpRatio = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x753560 slot 30  public override float GetRecoveryEpRateRatioVariationValue(BattleUnit unit, float processingValue) { } */
    GetRecoveryEpRateRatioVariationValue(unit: BattleUnit, processingValue: float): float { return this._UpRatio; /* asm: movss xmm0, dword ptr [rcx + 0x90]; ret */ }
}
