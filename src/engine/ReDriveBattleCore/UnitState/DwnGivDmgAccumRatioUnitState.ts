// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IAccum$Accumulate } from "./IAccum";
import { f32, notPorted } from "../../runtime";
import type { float, int } from "../../runtime";
import { Decimal } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { DamageVariationUnitStateBase_CalculationType } from "./DamageVariationUnitStateBase";
import { DownGiveDamageUnitStateBase } from "./DownGiveDamageUnitStateBase";
import type { IAccum } from "./IAccum";
import type { IBlendable } from "./IBlendable";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnGivDmgAccumRatioUnitState  (TypeDefIndex 575, public class) ----
export class DwnGivDmgAccumRatioUnitState extends DownGiveDamageUnitStateBase {  // implements IAccum, IBlendable, IHasUpdateableEffectValue, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IAccum', 'IBlendable', 'IHasUpdateableEffectValue', 'IStateIconNumberDisplayable'];
    /** 0x90 private int <AccumCountMax>k__BackingField */
    _AccumCountMax: int = 0;
    /** 0x94 private int <AccumCount>k__BackingField */
    _AccumCount: int = 0;
    get DownRatio(): float { return this.get_DownRatio(); }
    get AccumCountMax(): int { return this.get_AccumCountMax(); }
    set AccumCountMax(v: int) { this.set_AccumCountMax(v); }
    get AccumCount(): int { return this.get_AccumCount(); }
    set AccumCount(v: int) { this.set_AccumCount(v); }
    /** @rva 0x7431D0 slot 27  public override DamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): DamageVariationUnitStateBase_CalculationType { return 0 as DamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x759B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15CBE70  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x901EE0 slot 32  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x901F10 slot 33  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0x901ED0 slot 34  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0x901F00 slot 35  public void set_AccumCount(int value) { } */
    set_AccumCount(value: int): void { this._AccumCount = value; /* auto-property */ }
    /** @rva 0x15CC080  protected void .ctor() { } */
    ctor(): this {
        this._AccumCount = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x15CC030  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._AccumCount = 1;
        super.ctor$AbilityEffectInfo(info);
        this._AccumCountMax = info._EffectValue2;
        return this;
    }
    /** @rva 0x15CD530 slot 29  public override Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal {
        return processingValue.mul(Decimal.fromFloat(f32(this._UpdateableEffectValue / 10)).mul(Decimal.fromInt(this._AccumCount)).div(Decimal.fromInt(100))).neg();
    }
    /** @rva 0x15CD4E0 slot 39  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean {
        return IAccum$Accumulate(this as unknown as IAccum, injectUnitState); // ((IAccum)this).Accumulate (default interface method, IAccum slot 6)
    }
}
