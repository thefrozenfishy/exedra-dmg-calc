// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import { UnitStateBase } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.BreakPointDamageVariationUnitStateBase  (TypeDefIndex 694, public abstract class) ----
export abstract class BreakPointDamageVariationUnitStateBase extends UnitStateBase {  // implements IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    get Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return this.get_Calculation(); }
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
    /** @rva -1 slot 27  public abstract BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation(); */
    abstract get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType;
    /** @rva -1 slot 28  public abstract AdditionType get_Addition(); */
    abstract get_Addition(): AdditionType;
    /** @rva 0x16CF3D0 slot 29  public virtual Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(damageValue: Decimal, processingValue: Decimal): Decimal { return notPorted("BreakPointDamageVariationUnitStateBase.GetDamageVariationValue", 0x16CF3D0); }
    /** @rva 0x15B8090 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("BreakPointDamageVariationUnitStateBase.CanAddTo", 0x15B8090); }
    /** @rva 0x16CF110 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("BreakPointDamageVariationUnitStateBase.GetAIFilteredTargets", 0x16CF110); }
}

// ---- ReDriveBattleCore.UnitState.BreakPointDamageVariationUnitStateBase.CalculationType  (TypeDefIndex 692, public enum) ----
export const BreakPointDamageVariationUnitStateBase_CalculationType = {
    Ratio: 0,
    Fixed: 1,
} as const;
export type BreakPointDamageVariationUnitStateBase_CalculationType = (typeof BreakPointDamageVariationUnitStateBase_CalculationType)[keyof typeof BreakPointDamageVariationUnitStateBase_CalculationType];
