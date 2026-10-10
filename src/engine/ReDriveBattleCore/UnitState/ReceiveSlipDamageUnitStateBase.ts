// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, notPorted } from "../../runtime";
import type { IEnumerable, Nullable, float } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { DamageBaseType } from "../AbilityEffect/DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbnormalUnitStateBase } from "./AbnormalUnitStateBase";
import type { EffectOriginType } from "./EffectOriginType";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IReceiveSlipDamage } from "./IReceiveSlipDamage";

// ---- ReDriveBattleCore.UnitState.ReceiveSlipDamageUnitStateBase  (TypeDefIndex 497, public abstract class) ----
export abstract class ReceiveSlipDamageUnitStateBase extends AbnormalUnitStateBase {  // implements IReceiveSlipDamage, IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IReceiveSlipDamage', 'IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    /** 0x90 private Decimal <DamageBase>k__BackingField */
    _DamageBase: Decimal = Decimal.Zero;
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    get DamagePower(): float { return this.get_DamagePower(); }
    get DamageBase(): Decimal { return this.get_DamageBase(); }
    set DamageBase(v: Decimal) { this.set_DamageBase(v); }
    get AttackElement(): TargetElementType { return this.get_AttackElement(); }
    get DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType> { return this.get_DamageType(); }
    get SlipDamageVisualEffectName(): string { return this.get_SlipDamageVisualEffectName(); }
    get SkipDamageOnTurnBegin(): boolean { return this.get_SkipDamageOnTurnBegin(); }
    get DamageBaseType(): DamageBaseType { return this.get_DamageBaseType(); }
    /** @rva 0xC646A0 slot 29  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC646B0 slot 30  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x15BFD00  public float get_DamagePower() { } */
    get_DamagePower(): float { return notPorted("ReceiveSlipDamageUnitStateBase.get_DamagePower", 0x15BFD00); }
    /** @rva 0x902510  public Decimal get_DamageBase() { } */
    get_DamageBase(): Decimal { return this._DamageBase; /* auto-property */ }
    /** @rva 0x902550  public void set_DamageBase(Decimal value) { } */
    set_DamageBase(value: Decimal): void { this._DamageBase = value; /* auto-property */ }
    /** @rva -1 slot 31  public abstract TargetElementType get_AttackElement(); */
    abstract get_AttackElement(): TargetElementType;
    /** @rva -1 slot 32  protected abstract Nullable<ReceiveSlipDamageUnitStateBase.ParameterType> get_DamageType(); */
    abstract get_DamageType(): Nullable<ReceiveSlipDamageUnitStateBase_ParameterType>;
    /** @rva -1 slot 33  public abstract string get_SlipDamageVisualEffectName(); */
    abstract get_SlipDamageVisualEffectName(): string;
    /** @rva 0x7360C0 slot 34  public virtual bool get_SkipDamageOnTurnBegin() { } */
    get_SkipDamageOnTurnBegin(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x15BFBF0  protected DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return notPorted("ReceiveSlipDamageUnitStateBase.get_DamageBaseType", 0x15BFBF0); }
    /** @rva 0x15B5FF0  public void .ctor() { } */
    ctor(): this { return notPorted("ReceiveSlipDamageUnitStateBase..ctor", 0x15B5FF0); }
    /** @rva 0x15B5F70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ReceiveSlipDamageUnitStateBase..ctor", 0x15B5F70); }
    /** @rva 0x15BF920 slot 17  public override void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit userUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, userUnit: BattleUnit, isOwnSkill?: boolean /* = False */, isConditionActivation?: boolean /* = False */, battleType?: BattleType /* = 1 */): void { return notPorted("ReceiveSlipDamageUnitStateBase.SetTriggeringInfo", 0x15BF920); }
    /** @rva 0x15BF770 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("ReceiveSlipDamageUnitStateBase.GetUnitFilterFuncOrder", 0x15BF770); }
    /** @rva 0x15BF5B0 slot 35  protected virtual Decimal GetDamageBase(BattleUnit userUnit) { } */
    GetDamageBase(userUnit: BattleUnit): Decimal { return notPorted("ReceiveSlipDamageUnitStateBase.GetDamageBase", 0x15BF5B0); }
    /** @rva 0x15BF670 slot 36  public virtual float GetSlipDamageValue(BattleUnit attackUnit, BattleUnit defenseUnit, BattleType battleType, bool isImmediately) { } */
    GetSlipDamageValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, battleType: BattleType, isImmediately: boolean): float { return notPorted("ReceiveSlipDamageUnitStateBase.GetSlipDamageValue", 0x15BF670); }
    /** @rva 0x15BFB60  private IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterMatchWeakElement|24_0(IEnumerable<BattleUnit> candidateUnits) { } */
    $GetUnitFilterFuncOrder$g__UnitFilterMatchWeakElement_24_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("ReceiveSlipDamageUnitStateBase.<GetUnitFilterFuncOrder>g__UnitFilterMatchWeakElement|24_0", 0x15BFB60); }
    /** @rva 0x15BF990  private bool <GetUnitFilterFuncOrder>b__24_2(BattleUnit unit) { } */
    $GetUnitFilterFuncOrder$b__24_2(unit: BattleUnit): boolean { return notPorted("ReceiveSlipDamageUnitStateBase.<GetUnitFilterFuncOrder>b__24_2", 0x15BF990); }
    /** @rva 0x15BFA10  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleAtWeightedRandom|24_1(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleAtWeightedRandom_24_1(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("ReceiveSlipDamageUnitStateBase.<GetUnitFilterFuncOrder>g__UnitFilterByRoleAtWeightedRandom|24_1", 0x15BFA10); }
}

// ---- ReDriveBattleCore.UnitState.ReceiveSlipDamageUnitStateBase.ParameterType  (TypeDefIndex 496, protected enum) ----
export const ReceiveSlipDamageUnitStateBase_ParameterType = {
    Atk: 0,
    Def: 1,
    Hp: 2,
} as const;
export type ReceiveSlipDamageUnitStateBase_ParameterType = (typeof ReceiveSlipDamageUnitStateBase_ParameterType)[keyof typeof ReceiveSlipDamageUnitStateBase_ParameterType];
