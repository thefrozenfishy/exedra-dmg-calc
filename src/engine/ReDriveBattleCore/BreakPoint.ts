// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IReceiveBreakPointDamageVariation } from "./UnitState/IReceiveBreakPointDamageVariation";
import { IGiveBreakPointDamageVariation$GetDamageVariationValue$4 } from "./UnitState/IGiveBreakPointDamageVariation";
import type { IGiveBreakPointDamageVariation } from "./UnitState/IGiveBreakPointDamageVariation";
import { DriveUpBreakPointDamageUnitStateBase } from "./UnitState/DriveUpBreakPointDamageUnitStateBase";
import { UniqueElementDriveUnitState } from "./UnitState/UniqueElementDriveUnitState";
import type { BreakPointDecreaseType } from "./BreakPointDecreaseType";
import { UniqueEnemy639002UnitState } from "./UnitState/UniqueEnemy639002UnitState";
import { BattleDamageCalculator } from "./BattleDamageCalculator";
import { AffectedUnitNotice } from "./AffectedUnitNotice";
import { Decimal, clamp, f32, isImpl, trunc } from "../runtime";
import { SkillType as SkillType$ } from "../Network/Definition/Battle/SkillType";
import type { IEnumerable, float, int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { RangeType } from "../Network/Definition/Battle/RangeType";
import type { RoleType } from "../Network/Definition/Battle/RoleType";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";

import type { BattleUnit } from "./BattleUnit";
import type { UnitStateBase } from "./UnitState/UnitStateBase";
import { enumToString } from "../runtime";

// ---- ReDriveBattleCore.BreakPoint  (TypeDefIndex 366, public class) ----
export class BreakPoint {
    /** private const string UndefinedRangeTypeExceptionFormat */
    static readonly UndefinedRangeTypeExceptionFormat: string = "定義されていない RangeType です： {0}";
    /** 0x10 private int maxPointValue */
    maxPointValue: int = 0;
    /** 0x14 private int <PointValue>k__BackingField */
    _PointValue: int = 0;
    /** 0x18 private int <BreakCount>k__BackingField */
    _BreakCount: int = 0;
    /** 0x0 public static readonly Decimal DamageRatioOnNormal */
    static DamageRatioOnNormal: Decimal = Decimal.Zero;
    /** 0x10 public static readonly int BreakTurnGaugeSlowRatio */
    static BreakTurnGaugeSlowRatio: int = 0;
    /** 0x18 public static readonly Decimal BreakPointWeakElementDecreaseRatio */
    static BreakPointWeakElementDecreaseRatio: Decimal = Decimal.Zero;
    get HasBreakPoint(): boolean { return this.get_HasBreakPoint(); }
    get PointValue(): int { return this.get_PointValue(); }
    set PointValue(v: int) { this.set_PointValue(v); }
    get IsBreak(): boolean { return this.get_IsBreak(); }
    get MaxBreakDamageRate(): float { return this.get_MaxBreakDamageRate(); }
    get BreakCount(): int { return this.get_BreakCount(); }
    set BreakCount(v: int) { this.set_BreakCount(v); }
    /** @rva 0xE1E1B0  public bool get_HasBreakPoint() { } */
    get_HasBreakPoint(): boolean { return 0 < this.maxPointValue; }
    /** @rva 0x809350  public int get_PointValue() { } */
    get_PointValue(): int { return this._PointValue; /* auto-property */ }
    /** @rva 0x809540  public void set_PointValue(int value) { } */
    set_PointValue(value: int): void { this._PointValue = value; /* auto-property */ }
    /** @rva 0x14D2DF0  public bool get_IsBreak() { } */
    get_IsBreak(): boolean {
        if (this.maxPointValue < 1) return false;
        return this._PointValue < 1;
    }
    /** @rva 0x14D2E10  public float get_MaxBreakDamageRate() { } */
    get_MaxBreakDamageRate(): float {
        return f32(f32(this.maxPointValue + 0.5) / 360);
    }
    /** @rva 0x769820  public int get_BreakCount() { } */
    get_BreakCount(): int { return this._BreakCount; /* auto-property */ }
    /** @rva 0x8A8240  public void set_BreakCount(int value) { } */
    set_BreakCount(value: int): void { this._BreakCount = value; /* auto-property */ }
    /** @rva 0x14D27F0  public void Initialize(int maxValue) { } */
    Initialize(maxValue: int): void {
        this.maxPointValue = maxValue;
        this._PointValue = maxValue;
    }
    /** @rva 0x14D2800  public void ResetValue() { } */
    ResetValue(): void { this._PointValue = this.maxPointValue; }
    /** @rva 0x14D1FB0  public AffectedUnitNotice Decrease(BattleUnit attackUnit, BattleUnit defenseUnit, TargetElementType attackElement, SkillType skillType, int decreaseValue, int turnOrderPriority) { } */
    Decrease(attackUnit: BattleUnit, defenseUnit: BattleUnit, attackElement: TargetElementType, skillType: SkillType, decreaseValue: int, turnOrderPriority: int): AffectedUnitNotice {
        // <>c__DisplayClass21_0 { attackUnit, defenseUnit }
        const affectedUnitNotice = new AffectedUnitNotice().ctor$int(defenseUnit._Id);
        if (!this.get_HasBreakPoint() || this.get_IsBreak()) return affectedUnitNotice; // both inlined
        // Where() is lazy in the game and re-evaluated by each loop in CalculateProcessedBreakPointDamage /
        // HasDriveBreakPointUp; the predicates (IsActive) have no side effects, so evaluating them once gives the same result.
        const attackUnitStates = attackUnit._Condition._StateList.filter(state => // <Decrease>b__0
            isImpl(state, "IGiveBreakPointDamageVariation") && state.IsActive$BattleUnit(attackUnit));
        const defenceUnitStates = defenseUnit._Condition._StateList.filter(state => // <Decrease>b__1 (3.24.0: + Element Drive)
            (isImpl(state, "IReceiveBreakPointDamageVariation") || state instanceof UniqueEnemy639002UnitState || state instanceof UniqueElementDriveUnitState) && state.IsActive$BattleUnit(defenseUnit));
        const damage = BreakPoint.CalculateProcessedBreakPointDamage(attackUnitStates, defenceUnitStates, decreaseValue, attackElement, defenseUnit._WeakElements, skillType);
        if (this.DecreaseValue(damage)) { // inlined in the game
            this._BreakCount = this._BreakCount + 1;
            affectedUnitNotice._BreakDamage = BattleDamageCalculator.GetBreakDamage(attackUnit, defenseUnit, attackElement);
            const turnGauge = defenseUnit._TurnGauge;
            const battleParameter = defenseUnit._BattleParameter;
            affectedUnitNotice._TurnGaugeVariation = f32(affectedUnitNotice._TurnGaugeVariation + turnGauge.AddGaugeValue(f32(f32(battleParameter._BreakTurnGaugeSlowRatio) / 1000), turnOrderPriority));
            defenseUnit.SetBreakedDamageReceiveRate(trunc(battleParameter._InitialBreakedDamageReceiveRate / 10));
        }
        if (BreakPoint.HasDriveBreakPointUp(attackUnitStates, defenceUnitStates, skillType)) affectedUnitNotice._BreakPointDecreaseType = 1 as BreakPointDecreaseType; // OnDrive
        return affectedUnitNotice;
    }
    /** @rva 0x14D25A0  public static bool HasDriveBreakPointUp(IEnumerable<UnitStateBase> attackUnitStates, IEnumerable<UnitStateBase> defenceUnitStates, SkillType skillType) { } */
    static HasDriveBreakPointUp(attackUnitStates: IEnumerable<UnitStateBase>, defenceUnitStates: IEnumerable<UnitStateBase>, skillType: SkillType): boolean {
        for (const state of attackUnitStates) {
            if (state instanceof DriveUpBreakPointDamageUnitStateBase && state.IsTarget(defenceUnitStates, skillType)) return true;
        }
        return false;
    }
    /** @rva 0x14D0EF0  public static int CalculateProcessedBreakPointDamage(IEnumerable<UnitStateBase> attackUnitStates, IEnumerable<UnitStateBase> defenceUnitStates, int damage, TargetElementType attackElement, ElementType[] weakElements, SkillType skillType) { } */
    static CalculateProcessedBreakPointDamage(attackUnitStates: IEnumerable<UnitStateBase>, defenceUnitStates: IEnumerable<UnitStateBase>, damage: int, attackElement: TargetElementType, weakElements: ElementType[], skillType: SkillType): int {
        const damageValue = Decimal.fromInt(damage);
        let processingValue = damageValue;
        for (const state of attackUnitStates) {
            if (!isImpl(state, "IGiveBreakPointDamageVariation")) continue;
            const v = state as unknown as IGiveBreakPointDamageVariation;
            if (v.Addition !== 0) continue;
            processingValue = processingValue.add(IGiveBreakPointDamageVariation$GetDamageVariationValue$4(v, damageValue, processingValue, defenceUnitStates, skillType)); // interface slot 2 (3.24.0)
        }
        for (const state of attackUnitStates) {
            if (!isImpl(state, "IGiveBreakPointDamageVariation")) continue;
            const v = state as unknown as IGiveBreakPointDamageVariation;
            if (v.Addition !== 1) continue;
            processingValue = processingValue.add(IGiveBreakPointDamageVariation$GetDamageVariationValue$4(v, damageValue, processingValue, defenceUnitStates, skillType)); // interface slot 2 (3.24.0)
        }
        if (processingValue.le(Decimal.Zero)) processingValue = Decimal.Zero;
        if (attackElement !== 0) {
            for (let i = 0; i < weakElements.length; i++) {
                if ((weakElements[i] as number) === (attackElement as number)) {
                    processingValue = processingValue.add(BreakPoint.BreakPointWeakElementDecreaseRatio.mul(processingValue));
                    if (processingValue.le(Decimal.Zero)) processingValue = Decimal.Zero;
                    break;
                }
            }
        }
        // the receive-side variations get the value after the give-side / weak-element processing as damageValue
        const damageValue2 = processingValue;
        for (const state of defenceUnitStates) {
            if (!isImpl(state, "IReceiveBreakPointDamageVariation")) continue;
            const v = state as unknown as IReceiveBreakPointDamageVariation;
            if (v.Addition !== 0) continue;
            processingValue = processingValue.add(v.GetDamageVariationValue(damageValue2, processingValue));
        }
        for (const state of defenceUnitStates) {
            if (!isImpl(state, "IReceiveBreakPointDamageVariation")) continue;
            const v = state as unknown as IReceiveBreakPointDamageVariation;
            if (v.Addition !== 1) continue;
            processingValue = processingValue.add(v.GetDamageVariationValue(damageValue2, processingValue));
        }
        if (defenceUnitStates.some(state => state instanceof UniqueEnemy639002UnitState)) processingValue = Decimal.Zero; // <>c.b__23_0
        if (processingValue.le(Decimal.Zero)) processingValue = Decimal.Zero;
        return processingValue.ceiling().toInt(); // (int)decimal.Ceiling(processingValue)
    }
    /** @rva 0x14D1F20  private bool DecreaseValue(int decreaseValue) { } */
    DecreaseValue(decreaseValue: int): boolean {
        this._PointValue = clamp(this._PointValue - decreaseValue, 0, this.maxPointValue);
        return this.get_IsBreak(); // inlined in the game
    }
    /** @rva 0x14D23B0  public static ValueTuple<int, int> GetDecreaseValue(SkillType skillType, RangeType range, RoleType attackerRoleType, bool isRandom = False) { } */
    static GetDecreaseValue(skillType: SkillType, range: RangeType, attackerRoleType: RoleType, isRandom: boolean = false): [int, int] {
        if (isRandom) return [1, 0];
        switch (skillType as number) {
            case 1: return BreakPoint.$GetDecreaseValue$g__GetActiveSkillDecreaseValue_25_1(range, attackerRoleType, false);
            case 2: return BreakPoint.$GetDecreaseValue$g__GetSpecialAttackDecreaseValue_25_2(range, attackerRoleType, false);
            case 3: return BreakPoint.$GetDecreaseValue$g__GetNormalAttackDecreaseValue_25_0(range, attackerRoleType, false);
            case 4: return BreakPoint.$GetDecreaseValue$g__GetNormalAttackDecreaseValue_25_0(range, attackerRoleType, false);
            case 5: return BreakPoint.$GetDecreaseValue$g__GetNormalAttackDecreaseValue_25_0(range, attackerRoleType, false);
            default: throw new Error(`定義されていない SkillType です：${enumToString(SkillType$, skillType)}`);
        }
    }
    /** @rva 0x14D2760  public void IncreaseValueByRatio(float ratio) { } */
    IncreaseValueByRatio(ratio: float): void {
        this._PointValue = clamp(trunc(f32(this.maxPointValue * ratio)) + this._PointValue, 0, this.maxPointValue);
    }
    /** @rva 0x7365E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x14D2D20  private static void .cctor() { } */
    static cctor(): void {
        BreakPoint.DamageRatioOnNormal = Decimal.fromParts(10, 0, 0, false, 1); // 1.0
        BreakPoint.BreakTurnGaugeSlowRatio = 25;
        BreakPoint.BreakPointWeakElementDecreaseRatio = Decimal.fromParts(2, 0, 0, false, 1); // 0.2
    }
    /** @rva 0x14D29C0  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetNormalAttackDecreaseValue|25_0(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetNormalAttackDecreaseValue_25_0(range: RangeType, roleType: RoleType, isRandom: boolean): [int, int] {
        if (roleType === 2) {
            if (range === 1) return [20, 0];
            if (range === 2) return [15, 10];
            if (range === 3) return [10, 0];
        } else {
            if (range === 1) return [10, 0];
            if (range === 2) return [8, 5];
            if (range === 3) return [5, 0];
        }
        throw new Error(`定義されていない RangeType です：${range}`); // formatted as int
    }
    /** @rva 0x14D2810  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetActiveSkillDecreaseValue|25_1(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetActiveSkillDecreaseValue_25_1(range: RangeType, roleType: RoleType, isRandom: boolean): [int, int] {
        if (roleType === 2) {
            if (range === 1) return [45, 0];
            if (range === 2) return [35, 15];
            if (range === 3) return [30, 0];
        } else {
            if (range === 1) return [20, 0];
            if (range === 2) return [15, 10];
            if (range === 3) return [12, 0];
        }
        throw new Error(`定義されていない RangeType です：${range}`); // formatted as int
    }
    /** @rva 0x14D2B70  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetSpecialAttackDecreaseValue|25_2(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetSpecialAttackDecreaseValue_25_2(range: RangeType, roleType: RoleType, isRandom: boolean): [int, int] {
        if (roleType === 2) {
            if (range === 1) return [60, 0];
            if (range === 2) return [50, 30];
            if (range === 3) return [45, 0];
        } else {
            if (range === 1) return [35, 0];
            if (range === 2) return [30, 20];
            if (range === 3) return [25, 0];
        }
        throw new Error(`定義されていない RangeType です：${range}`); // formatted as int
    }
}
BreakPoint.cctor(); // C# static constructor
