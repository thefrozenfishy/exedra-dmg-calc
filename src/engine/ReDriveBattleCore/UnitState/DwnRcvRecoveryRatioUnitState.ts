// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownReceiveRecoveryUnitStateBase } from "./DownReceiveRecoveryUnitStateBase";
import type { IReceiveRecoveryVariation } from "./IReceiveRecoveryVariation";

// ---- ReDriveBattleCore.UnitState.DwnRcvRecoveryRatioUnitState  (TypeDefIndex 615, public class) ----
export class DwnRcvRecoveryRatioUnitState extends DownReceiveRecoveryUnitStateBase {  // implements IReceiveRecoveryVariation
    static readonly __interfaces: readonly string[] = ['IReceiveRecoveryVariation'];
    get DownRatio(): Decimal { return this.get_DownRatio(); }
    /** @rva 0x15BE750  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal { return notPorted("DwnRcvRecoveryRatioUnitState.get_DownRatio", 0x15BE750); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
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
    /** @rva 0x15BE5D0 slot 29  public Decimal GetReceiveRecoveryVariationValue(BattleUnit unit, Decimal recoveryValue, Decimal processingValue) { } */
    GetReceiveRecoveryVariationValue(unit: BattleUnit, recoveryValue: Decimal, processingValue: Decimal): Decimal {
        return processingValue.mul(Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).div(Decimal.fromInt(100))).neg();
    }
}
