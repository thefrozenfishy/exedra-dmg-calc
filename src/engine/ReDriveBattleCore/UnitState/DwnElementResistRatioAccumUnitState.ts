// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IAccum$Accumulate } from "./IAccum";
import { f32, notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { Decimal } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { DownElementResistUnitStateBase } from "./DownElementResistUnitStateBase";
import type { IAccum } from "./IAccum";
import type { IBlendable } from "./IBlendable";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DwnElementResistRatioAccumUnitState  (TypeDefIndex 602, public class) ----
export class DwnElementResistRatioAccumUnitState extends DownElementResistUnitStateBase {  // implements IAccum, IBlendable, IHasUpdateableEffectValue, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IAccum', 'IBlendable', 'IHasUpdateableEffectValue', 'IStateIconNumberDisplayable'];
    /** 0x90 private int <AccumCountMax>k__BackingField */
    _AccumCountMax: int = 0;
    /** 0x94 private int <AccumCount>k__BackingField */
    _AccumCount: int = 0;
    get DownRatio(): Decimal { return this.get_DownRatio(); }
    get AccumCountMax(): int { return this.get_AccumCountMax(); }
    set AccumCountMax(v: int) { this.set_AccumCountMax(v); }
    get AccumCount(): int { return this.get_AccumCount(); }
    set AccumCount(v: int) { this.set_AccumCount(v); }
    /** @rva 0x15CD100  public Decimal get_DownRatio() { } */
    get_DownRatio(): Decimal {
        return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)); // (decimal)float / 10m
    }
    /** @rva 0x901EE0 slot 30  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x901F10 slot 31  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0x901ED0 slot 32  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0x901F00 slot 33  public void set_AccumCount(int value) { } */
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
    /** @rva 0x15CCF70 slot 29  public override Decimal GetElementResistVariationValue(BattleUnit unit, TargetElementType attackElement) { } */
    GetElementResistVariationValue(unit: BattleUnit, attackElement: TargetElementType): Decimal {
        if (this._TargetElement === 0 || (this._TargetElement as number) === (attackElement as number)) return Decimal.fromFloat(this._UpdateableEffectValue).div(Decimal.fromInt(10)).mul(Decimal.fromInt(this._AccumCount)).neg();
        return Decimal.Zero;
    }
    /** @rva 0x15CCF20 slot 37  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean {
        return IAccum$Accumulate(this as unknown as IAccum, injectUnitState); // ((IAccum)this).Accumulate (default interface method, IAccum slot 6)
    }
}
