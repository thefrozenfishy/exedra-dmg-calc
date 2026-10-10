// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, notPorted } from "../runtime";
import type { IEnumerable, float, int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { RangeType } from "../Network/Definition/Battle/RangeType";
import type { RoleType } from "../Network/Definition/Battle/RoleType";
import type { SkillType } from "../Network/Definition/Battle/SkillType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { AffectedUnitNotice } from "./AffectedUnitNotice";
import type { BattleUnit } from "./BattleUnit";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

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
    /** @rva 0xDE8C00  public bool get_HasBreakPoint() { } */
    get_HasBreakPoint(): boolean { return notPorted("BreakPoint.get_HasBreakPoint", 0xDE8C00); }
    /** @rva 0x803350  public int get_PointValue() { } */
    get_PointValue(): int { return this._PointValue; /* auto-property */ }
    /** @rva 0x803540  public void set_PointValue(int value) { } */
    set_PointValue(value: int): void { this._PointValue = value; /* auto-property */ }
    /** @rva 0x1493120  public bool get_IsBreak() { } */
    get_IsBreak(): boolean { return notPorted("BreakPoint.get_IsBreak", 0x1493120); }
    /** @rva 0x1493140  public float get_MaxBreakDamageRate() { } */
    get_MaxBreakDamageRate(): float { return notPorted("BreakPoint.get_MaxBreakDamageRate", 0x1493140); }
    /** @rva 0x763820  public int get_BreakCount() { } */
    get_BreakCount(): int { return this._BreakCount; /* auto-property */ }
    /** @rva 0x8A2240  public void set_BreakCount(int value) { } */
    set_BreakCount(value: int): void { this._BreakCount = value; /* auto-property */ }
    /** @rva 0x1492B20  public void Initialize(int maxValue) { } */
    Initialize(maxValue: int): void { return notPorted("BreakPoint.Initialize", 0x1492B20); }
    /** @rva 0x1492B30  public void ResetValue() { } */
    ResetValue(): void { return notPorted("BreakPoint.ResetValue", 0x1492B30); }
    /** @rva 0x1492530  public AffectedUnitNotice Decrease(BattleUnit attackUnit, BattleUnit defenseUnit, TargetElementType attackElement, int decreaseValue, int turnOrderPriority) { } */
    Decrease(attackUnit: BattleUnit, defenseUnit: BattleUnit, attackElement: TargetElementType, decreaseValue: int, turnOrderPriority: int): AffectedUnitNotice { return notPorted("BreakPoint.Decrease", 0x1492530); }
    /** @rva 0x14914C0  public static int CalculateProcessedBreakPointDamage(IEnumerable<UnitStateBase> attackUnitStates, IEnumerable<UnitStateBase> defenceUnitStates, int damage, TargetElementType attackElement, ElementType[] weakElements) { } */
    static CalculateProcessedBreakPointDamage(attackUnitStates: IEnumerable<UnitStateBase>, defenceUnitStates: IEnumerable<UnitStateBase>, damage: int, attackElement: TargetElementType, weakElements: ElementType[]): int { return notPorted("BreakPoint.CalculateProcessedBreakPointDamage", 0x14914C0); }
    /** @rva 0x14924A0  private bool DecreaseValue(int decreaseValue) { } */
    DecreaseValue(decreaseValue: int): boolean { return notPorted("BreakPoint.DecreaseValue", 0x14924A0); }
    /** @rva 0x14928A0  public static ValueTuple<int, int> GetDecreaseValue(SkillType skillType, RangeType range, RoleType attackerRoleType, bool isRandom = False) { } */
    static GetDecreaseValue(skillType: SkillType, range: RangeType, attackerRoleType: RoleType, isRandom?: boolean /* = False */): any /* ValueTuple<int, int> */ { return notPorted("BreakPoint.GetDecreaseValue", 0x14928A0); }
    /** @rva 0x1492A90  public void IncreaseValueByRatio(float ratio) { } */
    IncreaseValueByRatio(ratio: float): void { return notPorted("BreakPoint.IncreaseValueByRatio", 0x1492A90); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1493050  private static void .cctor() { } */
    static cctor(): void { return notPorted("BreakPoint..cctor", 0x1493050); }
    /** @rva 0x1492CF0  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetNormalAttackDecreaseValue|24_0(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetNormalAttackDecreaseValue_24_0(range: RangeType, roleType: RoleType, isRandom: boolean): any /* ValueTuple<int, int> */ { return notPorted("BreakPoint.<GetDecreaseValue>g__GetNormalAttackDecreaseValue|24_0", 0x1492CF0); }
    /** @rva 0x1492B40  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetActiveSkillDecreaseValue|24_1(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetActiveSkillDecreaseValue_24_1(range: RangeType, roleType: RoleType, isRandom: boolean): any /* ValueTuple<int, int> */ { return notPorted("BreakPoint.<GetDecreaseValue>g__GetActiveSkillDecreaseValue|24_1", 0x1492B40); }
    /** @rva 0x1492EA0  internal static ValueTuple<int, int> <GetDecreaseValue>g__GetSpecialAttackDecreaseValue|24_2(RangeType range, RoleType roleType, bool isRandom) { } */
    static $GetDecreaseValue$g__GetSpecialAttackDecreaseValue_24_2(range: RangeType, roleType: RoleType, isRandom: boolean): any /* ValueTuple<int, int> */ { return notPorted("BreakPoint.<GetDecreaseValue>g__GetSpecialAttackDecreaseValue|24_2", 0x1492EA0); }
}
