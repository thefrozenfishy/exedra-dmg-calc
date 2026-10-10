// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Decimal, Dictionary, float, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { DamageBaseType } from "./AbilityEffect/DamageBaseType";
import type { ActiveSkillBase } from "./ActiveSkillBase";
import type { AffectedUnitNotice, AffectedUnitNotice_DamageInfo } from "./AffectedUnitNotice";
import type { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { BattleUnit } from "./BattleUnit";
import type { CharacterParameter } from "./CharacterParameter";
import type { DamageCategory } from "./DamageCategory";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { ReceiveSlipDamageUnitStateBase } from "./UnitState/ReceiveSlipDamageUnitStateBase";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.BattleDamageCalculator  (TypeDefIndex 334, public static class) ----
export class BattleDamageCalculator {
    /** 0x0 private static readonly DamageBaseType BreakDamageDefenceCorrectedBaseType */
    static BreakDamageDefenceCorrectedBaseType: DamageBaseType = 0 as DamageBaseType;
    /** 0x4 private static readonly DamageBaseType ReflectionDamageDefenceCorrectedBaseType */
    static ReflectionDamageDefenceCorrectedBaseType: DamageBaseType = 0 as DamageBaseType;
    /** @rva 0x137D8A0  public static Decimal GetDamageBase(float paramValue, float power) { } */
    static GetDamageBase(paramValue: float, power: float): Decimal { return notPorted("BattleDamageCalculator.GetDamageBase", 0x137D8A0); }
    /** @rva 0x137CB10  public static AffectedUnitNotice GetAttackDamageResult(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, DamageBaseType damageBaseType, ActiveSkillBase attackSkill, BattleType battleType, DamageCategory damageCategory) { } */
    static GetAttackDamageResult(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, damageBaseType: DamageBaseType, attackSkill: ActiveSkillBase, battleType: BattleType, damageCategory: DamageCategory): AffectedUnitNotice { return notPorted("BattleDamageCalculator.GetAttackDamageResult", 0x137CB10); }
    /** @rva 0x137D340  public static AffectedUnitNotice.DamageInfo GetBreakDamage(BattleUnit attackUnit, BattleUnit defenseUnit, TargetElementType attackElement) { } */
    static GetBreakDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, attackElement: TargetElementType): AffectedUnitNotice_DamageInfo { return notPorted("BattleDamageCalculator.GetBreakDamage", 0x137D340); }
    /** @rva 0x1380F20  public static int GetSlipDamageValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, DamageBaseType damageBaseType, BattleType battleType, ReceiveSlipDamageUnitStateBase receiveSlipDamageUnitState) { } */
    static GetSlipDamageValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, damageBaseType: DamageBaseType, battleType: BattleType, receiveSlipDamageUnitState: ReceiveSlipDamageUnitStateBase): int { return notPorted("BattleDamageCalculator.GetSlipDamageValue", 0x1380F20); }
    /** @rva 0x13806D0  public static AffectedUnitNotice GetSlipDamageResult(BattleUnit unit, Dictionary<int, BattleUnit> battleUnitDic, BattleType battleType, Func<UnitStateBase, bool> predicate, bool isImmediately = False) { } */
    static GetSlipDamageResult(unit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>, battleType: BattleType, predicate: ((a0: UnitStateBase) => boolean), isImmediately?: boolean /* = False */): AffectedUnitNotice { return notPorted("BattleDamageCalculator.GetSlipDamageResult", 0x13806D0); }
    /** @rva 0x137DA30  private static Decimal GetDefenseCorrectedDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, DamageBaseType damageBaseType) { } */
    static GetDefenseCorrectedDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, damageBaseType: DamageBaseType): Decimal { return notPorted("BattleDamageCalculator.GetDefenseCorrectedDamage", 0x137DA30); }
    /** @rva 0x13813C0  private static bool IsCriticalDamage(BattleUnit attackUnit, BattleUnit defenseUnit) { } */
    static IsCriticalDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit): boolean { return notPorted("BattleDamageCalculator.IsCriticalDamage", 0x13813C0); }
    /** @rva 0x137C720  private static Decimal GetAddedCriticalDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetAddedCriticalDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.GetAddedCriticalDamage", 0x137C720); }
    /** @rva 0x137ED10  private static Decimal GetProcessedGiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, TargetElementType attackElement, ReceiveSlipDamageUnitStateBase receiveSlipDamageUnitState) { } */
    static GetProcessedGiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackElement: TargetElementType, receiveSlipDamageUnitState: ReceiveSlipDamageUnitStateBase): Decimal { return notPorted("BattleDamageCalculator.GetProcessedGiveDamage", 0x137ED10); }
    /** @rva 0x137E940  private static Decimal GetProcessedFinalGiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, ActiveSkillBase attackSkill) { } */
    static GetProcessedFinalGiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackSkill: ActiveSkillBase): Decimal { return notPorted("BattleDamageCalculator.GetProcessedFinalGiveDamage", 0x137E940); }
    /** @rva 0x137FAD0  private static Decimal GetProcessedReceiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetProcessedReceiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.GetProcessedReceiveDamage", 0x137FAD0); }
    /** @rva 0x137E130  private static Decimal GetElementResistDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, TargetElementType attackElement) { } */
    static GetElementResistDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackElement: TargetElementType): Decimal { return notPorted("BattleDamageCalculator.GetElementResistDamage", 0x137E130); }
    /** @rva 0x137DD90  private static Decimal GetDifficultyCorrectedDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetDifficultyCorrectedDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.GetDifficultyCorrectedDamage", 0x137DD90); }
    /** @rva 0x137C520  private static Decimal GetAddedBreakDamage(BattleUnit attackUnit, Decimal damage) { } */
    static GetAddedBreakDamage(attackUnit: BattleUnit, damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.GetAddedBreakDamage", 0x137C520); }
    /** @rva 0x137E450  public static Decimal GetProcessedBreakDamageRate(BattleUnit attackUnit, CharacterParameter charaParam) { } */
    static GetProcessedBreakDamageRate(attackUnit: BattleUnit, charaParam: CharacterParameter): Decimal { return notPorted("BattleDamageCalculator.GetProcessedBreakDamageRate", 0x137E450); }
    /** @rva 0x137C950  private static Decimal GetAppliedDamageOfBreakSituation(BattleUnit defenseUnit, Decimal damage, bool doForceToNormal = False) { } */
    static GetAppliedDamageOfBreakSituation(defenseUnit: BattleUnit, damage: Decimal, doForceToNormal?: boolean /* = False */): Decimal { return notPorted("BattleDamageCalculator.GetAppliedDamageOfBreakSituation", 0x137C950); }
    /** @rva 0x1380070  public static AffectedUnitNotice GetReflectionDamageResult(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, BattleType battleType) { } */
    static GetReflectionDamageResult(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, battleType: BattleType): AffectedUnitNotice { return notPorted("BattleDamageCalculator.GetReflectionDamageResult", 0x1380070); }
    /** @rva 0x137BFF0  private static Decimal DamageCutByPvpOrGvgSuppression(Decimal damage) { } */
    static DamageCutByPvpOrGvgSuppression(damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.DamageCutByPvpOrGvgSuppression", 0x137BFF0); }
    /** @rva 0x1381580  private static Decimal SlipDamageCutByPvpOrGvgSuppression(Decimal damage) { } */
    static SlipDamageCutByPvpOrGvgSuppression(damage: Decimal): Decimal { return notPorted("BattleDamageCalculator.SlipDamageCutByPvpOrGvgSuppression", 0x1381580); }
    /** @rva 0x137C160  private static Decimal DamageCutByShield(Decimal damage, BattleUnit defenseUnit) { } */
    static DamageCutByShield(damage: Decimal, defenseUnit: BattleUnit): Decimal { return notPorted("BattleDamageCalculator.DamageCutByShield", 0x137C160); }
    /** @rva 0x137BC90  private static ValueTuple<AffectedUnitNotice, int, int> DamageCutByBarrier(int damageValue, BattleUnit defenseUnit, AffectedUnitNotice notice) { } */
    static DamageCutByBarrier(damageValue: int, defenseUnit: BattleUnit, notice: AffectedUnitNotice): any /* ValueTuple<AffectedUnitNotice, int, int> */ { return notPorted("BattleDamageCalculator.DamageCutByBarrier", 0x137BC90); }
    /** @rva 0x137B110  public static AffectedUnitNoticeBundle CalcFinalDamageNoticeBundle(BattleUnit userUnit, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    static CalcFinalDamageNoticeBundle(userUnit: BattleUnit, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("BattleDamageCalculator.CalcFinalDamageNoticeBundle", 0x137B110); }
    /** @rva 0x1381490  private static bool IsDamageDisabled(BattleUnit unit) { } */
    static IsDamageDisabled(unit: BattleUnit): boolean { return notPorted("BattleDamageCalculator.IsDamageDisabled", 0x1381490); }
    /** @rva 0x137E080  private static Decimal GetDisabledDamage(Decimal damage, BattleUnit defenseUnit) { } */
    static GetDisabledDamage(damage: Decimal, defenseUnit: BattleUnit): Decimal { return notPorted("BattleDamageCalculator.GetDisabledDamage", 0x137E080); }
    /** @rva 0x137BEE0  private static ValueTuple<AffectedUnitNotice, Decimal> DamageCutByDisableDamage(Decimal damage, BattleUnit defenseUnit, AffectedUnitNotice notice) { } */
    static DamageCutByDisableDamage(damage: Decimal, defenseUnit: BattleUnit, notice: AffectedUnitNotice): any /* ValueTuple<AffectedUnitNotice, Decimal> */ { return notPorted("BattleDamageCalculator.DamageCutByDisableDamage", 0x137BEE0); }
    /** @rva 0x13816F0  private static void .cctor() { } */
    static cctor(): void { return notPorted("BattleDamageCalculator..cctor", 0x13816F0); }
}
