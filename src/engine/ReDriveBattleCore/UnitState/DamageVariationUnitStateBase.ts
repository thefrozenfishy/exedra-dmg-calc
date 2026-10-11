// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, float } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import { UnitStateBase } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DamageVariationUnitStateBase  (TypeDefIndex 691, public abstract class) ----
export abstract class DamageVariationUnitStateBase extends UnitStateBase {  // implements IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    get Calculation(): DamageVariationUnitStateBase_CalculationType { return this.get_Calculation(); }
    get Addition(): AdditionType { return this.get_Addition(); }
    /** @rva 0xC646A0 slot 25  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC646B0 slot 26  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva -1 slot 27  public abstract DamageVariationUnitStateBase.CalculationType get_Calculation(); */
    abstract get_Calculation(): DamageVariationUnitStateBase_CalculationType;
    /** @rva -1 slot 28  public abstract AdditionType get_Addition(); */
    abstract get_Addition(): AdditionType;
    /** @rva 0x16CFA40 slot 29  public virtual Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("DamageVariationUnitStateBase.GetDamageVariationValue", 0x16CFA40); }
}

// ---- ReDriveBattleCore.UnitState.DamageVariationUnitStateBase.CalculationType  (TypeDefIndex 690, public enum) ----
export const DamageVariationUnitStateBase_CalculationType = {
    Ratio: 0,
    Fixed: 1,
} as const;
export type DamageVariationUnitStateBase_CalculationType = (typeof DamageVariationUnitStateBase_CalculationType)[keyof typeof DamageVariationUnitStateBase_CalculationType];
