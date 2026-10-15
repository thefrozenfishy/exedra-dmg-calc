// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IAccum$Accumulate } from "./IAccum";
import { f32, notPorted } from "../../runtime";
import type { float, int } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IAccum } from "./IAccum";
import type { IBlendable } from "./IBlendable";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import type { UnitStateBase } from "./UnitStateBase";
import { UpSpeedUnitStateBase } from "./UpSpeedUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpSpdAccumRatioUnitState  (TypeDefIndex 809, public class) ----
export class UpSpdAccumRatioUnitState extends UpSpeedUnitStateBase {  // implements IAccum, IBlendable, IHasUpdateableEffectValue, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IAccum', 'IBlendable', 'IHasUpdateableEffectValue', 'IStateIconNumberDisplayable'];
    /** 0x90 private int <AccumCountMax>k__BackingField */
    _AccumCountMax: int = 0;
    /** 0x94 private int <AccumCount>k__BackingField */
    _AccumCount: int = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    get AccumCountMax(): int { return this.get_AccumCountMax(); }
    set AccumCountMax(v: int) { this.set_AccumCountMax(v); }
    get AccumCount(): int { return this.get_AccumCount(); }
    set AccumCount(v: int) { this.set_AccumCount(v); }
    /** @rva 0x15E1810  public float get_UpRatio() { } */
    get_UpRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x900F30 slot 35  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x900F60 slot 36  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0x900F20 slot 37  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0x900F50 slot 38  public void set_AccumCount(int value) { } */
    set_AccumCount(value: int): void { this._AccumCount = value; /* auto-property */ }
    /** @rva 0x16FB3E0  protected void .ctor() { } */
    ctor(): this {
        this._AccumCount = 1;
        this._IconName = "";
        return this;
    }
    /** @rva 0x16FB440  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._AccumCount = 1;
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        this._AccumCountMax = info._EffectValue2;
        return this;
    }
    /** @rva 0x17118E0 slot 33  public override Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromInt(unit.get_Speed()).mul(Decimal.fromFloat(f32(this._UpdateableEffectValue / 10)).mul(Decimal.fromInt(this._AccumCount)).div(Decimal.fromInt(100)));
    }
    /** @rva 0x1711720 slot 42  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean {
        return IAccum$Accumulate(this as unknown as IAccum, injectUnitState); // ((IAccum)this).Accumulate (default interface method, IAccum slot 6)
    }
    /** @rva 0x1711770 slot 34  public override Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("UpSpdAccumRatioUnitState.GetSpeedVariationValue", 0x1711770); }
}
