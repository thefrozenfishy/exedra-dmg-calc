// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IReceiveFinalDamage } from "./UnitState/IReceiveFinalDamage";
import { TargetElementType as TargetElementType$ } from "../Network/Definition/Battle/TargetElementType";
import { AffectedUnitNoticeBundle } from "./AffectedUnitNoticeBundle";
import type { IReceiveSlipDamage } from "./UnitState/IReceiveSlipDamage";
import { EpCharger } from "./EpCharger";
import type { IBreakEffectVariation } from "./UnitState/IBreakEffectVariation";
import type { IReceiveDamageVariation } from "./UnitState/IReceiveDamageVariation";
import type { IGiveSlipDamageVariation } from "./UnitState/IGiveSlipDamageVariation";
import type { IElementDamageRateVariation } from "./UnitState/IElementDamageRateVariation";
import type { IGiveDamageVariation } from "./UnitState/IGiveDamageVariation";
import { DamageBaseType as DamageBaseType$ } from "./AbilityEffect/DamageBaseType";
import { GveUpSpecialAttackFinalGiveDamageRatioUnitState } from "./UnitState/GveUpSpecialAttackFinalGiveDamageRatioUnitState";
import { UniqueEnemy639002UnitState } from "./UnitState/UniqueEnemy639002UnitState";
import { BarrierUnitState } from "./UnitState/BarrierUnitState";
import { ShieldUnitState } from "./UnitState/ShieldUnitState";
import { CalculationPointPolicyMstReader } from "./Reader/CalculationPointPolicyMstReader";
import { BreakPoint } from "./BreakPoint";
import { SpecialAttack } from "./SpecialAttack";
import { AdditionalSkill } from "./AdditionalSkill";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { CharacterParameter } from "./CharacterParameter";
import { CorrelationEffect } from "./CorrelationEffect";
import { AffectedUnitNotice, AffectedUnitNotice_DamageInfo } from "./AffectedUnitNotice";
import { dictGet, enumIsDefined, enumToString, f32, isImpl, notPorted, randomChance } from "../runtime";
import type { Dictionary, float, int } from "../runtime";
import { Decimal } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { DamageBaseType } from "./AbilityEffect/DamageBaseType";
import type { ActiveSkillBase } from "./ActiveSkillBase";

import type { BattleUnit } from "./BattleUnit";

import type { DamageCategory } from "./DamageCategory";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { ReceiveSlipDamageUnitStateBase } from "./UnitState/ReceiveSlipDamageUnitStateBase";
import type { UnitStateBase } from "./UnitState/UnitStateBase";
import { CorrelationDamageType } from "./CorrelationDamageType";
import { EffectOriginType } from "./UnitState/EffectOriginType";

// ---- ReDriveBattleCore.BattleDamageCalculator  (TypeDefIndex 334, public static class) ----
export class BattleDamageCalculator {
    /** 0x0 private static readonly DamageBaseType BreakDamageDefenceCorrectedBaseType */
    static BreakDamageDefenceCorrectedBaseType: DamageBaseType = 0 as DamageBaseType;
    /** 0x4 private static readonly DamageBaseType ReflectionDamageDefenceCorrectedBaseType */
    static ReflectionDamageDefenceCorrectedBaseType: DamageBaseType = 0 as DamageBaseType;
    /** @rva 0x137D8A0  public static Decimal GetDamageBase(float paramValue, float power) { } */
    static GetDamageBase(paramValue: float, power: float): Decimal {
        const first = Decimal.fromFloat(f32(paramValue * power));
        const pow = Decimal.fromDouble(Math.pow(paramValue / 124.0, 1.2)); // System.Math.Pow(double, 1.2)
        return first.mul(pow.add(Decimal.fromInt(12)).div(Decimal.fromInt(20)));
    }
    /** @rva 0x137CB10  public static AffectedUnitNotice GetAttackDamageResult(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, DamageBaseType damageBaseType, ActiveSkillBase attackSkill, BattleType battleType, DamageCategory damageCategory) { } */
    static GetAttackDamageResult(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, damageBaseType: DamageBaseType, attackSkill: ActiveSkillBase, battleType: BattleType, damageCategory: DamageCategory): AffectedUnitNotice {
        const visualEffects = new Set<string>(); // HashSet<string>
        const isNoCritNoBarrier = attackSkill instanceof AdditionalSkill && attackSkill.skillType === 5;
        let damage = BattleDamageCalculator.GetAppliedDamageOfBreakSituation(defenseUnit, damageBase, false);
        damage = BattleDamageCalculator.GetDefenseCorrectedDamage(attackUnit, defenseUnit, damage, damageBaseType);
        damage = BattleDamageCalculator.GetProcessedGiveDamage(attackUnit, defenseUnit, damage, attackElement, null!);
        damage = BattleDamageCalculator.GetProcessedReceiveDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetElementResistDamage(attackUnit, defenseUnit, damage, attackElement);
        const correlationEffect = new CorrelationEffect().ctor$BattleUnit_BattleUnit_TargetElementType(attackUnit, defenseUnit, attackElement);
        const correlationDamageType = correlationEffect._DamageType;
        damage = damage.mul(Decimal.fromFloat(correlationEffect._ElementDamageRatio));
        let isCritical: boolean;
        if (isNoCritNoBarrier) isCritical = false;
        else isCritical = BattleDamageCalculator.IsCriticalDamage(attackUnit, defenseUnit); // inlined in the game
        if (isCritical) damage = BattleDamageCalculator.GetAddedCriticalDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetDifficultyCorrectedDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetProcessedFinalGiveDamage(attackUnit, defenseUnit, damage, attackSkill);
        if (battleType === 2 || battleType === 4) damage = BattleDamageCalculator.DamageCutByPvpOrGvgSuppression(damage);
        damage = BattleDamageCalculator.DamageCutByShield(damage, defenseUnit);
        damage = Decimal.max(Decimal.One, damage); // Math.Max(decimal, decimal)
        let notice = new AffectedUnitNotice().ctor$int(defenseUnit._Id);
        notice._IsWeakElementAttacked = correlationDamageType === 2;
        [notice, damage] = BattleDamageCalculator.DamageCutByDisableDamage(damage, defenseUnit, notice); // inlined in the game
        let damageValue = damage.ceiling().toInt(); // (int)decimal.Ceiling(damage)
        let barrierDamageValue = 0;
        if (!isNoCritNoBarrier) [notice, barrierDamageValue, damageValue] = BattleDamageCalculator.DamageCutByBarrier(damageValue, defenseUnit, notice);
        const isBreak = defenseUnit._BreakPoint.get_IsBreak();
        const damageNotice = AffectedUnitNotice.CreateByDamage(defenseUnit._Id, damageValue, damageCategory, isCritical, correlationDamageType, [...visualEffects], attackElement, isBreak);
        let isMaxBreakBonus = false;
        if (defenseUnit._BreakPoint.get_IsBreak()) isMaxBreakBonus = defenseUnit._BreakedDamageReceiveRate === Math.trunc(defenseUnit._BattleParameter._MaxBreakedDamageReceiveRate / 10);
        for (const damageInfo of damageNotice.Damages) damageInfo._IsMaxBreakBonusWhenHit = isMaxBreakBonus;
        if (!(barrierDamageValue > 0 && damageValue === 0)) notice = AffectedUnitNotice.op_Addition(notice, damageNotice);
        if (barrierDamageValue > 0) {
            const barrierNotice = AffectedUnitNotice.CreateByBarrierDamage(defenseUnit._Id, barrierDamageValue, damageCategory, isCritical, correlationDamageType, [...visualEffects], attackElement, isBreak);
            for (const damageInfo of barrierNotice.BarrierDamages) damageInfo._IsMaxBreakBonusWhenHit = isMaxBreakBonus;
            notice = AffectedUnitNotice.op_Addition(notice, barrierNotice);
        }
        return notice;
    }
    /** @rva 0x137D340  public static AffectedUnitNotice.DamageInfo GetBreakDamage(BattleUnit attackUnit, BattleUnit defenseUnit, TargetElementType attackElement) { } */
    static GetBreakDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, attackElement: TargetElementType): AffectedUnitNotice_DamageInfo {
        const parameter = attackUnit._BattleParameter;
        if (!(parameter instanceof CharacterParameter)) return null!;
        const levelReactionBreakDamageValue = parameter._LevelReactionBreakDamageValue;
        let damage = Decimal.fromFloat(f32(f32(levelReactionBreakDamageValue / 10) * defenseUnit._BreakPoint.get_MaxBreakDamageRate()));
        damage = BattleDamageCalculator.GetAddedBreakDamage(attackUnit, damage); // inlined in the game
        damage = BattleDamageCalculator.GetAppliedDamageOfBreakSituation(defenseUnit, damage, true);
        damage = BattleDamageCalculator.GetDefenseCorrectedDamage(attackUnit, defenseUnit, damage, BattleDamageCalculator.BreakDamageDefenceCorrectedBaseType);
        damage = BattleDamageCalculator.GetProcessedReceiveDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetElementResistDamage(attackUnit, defenseUnit, damage, attackElement);
        const correlationEffect = new CorrelationEffect().ctor$BattleUnit_BattleUnit_TargetElementType(attackUnit, defenseUnit, attackElement);
        damage = damage.mul(Decimal.fromFloat(correlationEffect._ElementDamageRatio));
        damage = Decimal.max(Decimal.One, damage);
        damage = BattleDamageCalculator.GetDisabledDamage(damage, defenseUnit); // inlined in the game
        const damageInfo = new AffectedUnitNotice_DamageInfo();
        damageInfo._DamageValue = damage.ceiling().toInt();
        damageInfo._AttackElement = attackElement;
        damageInfo._Category = 3 as DamageCategory; // Break
        damageInfo._IsCritical = false;
        damageInfo._CorrelationDamageType = 2 as CorrelationDamageType;
        damageInfo._IsBreakBonusApplied = false;
        damageInfo._IsBarrierDamage = false;
        return damageInfo;
    }
    /** @rva 0x1380F20  public static int GetSlipDamageValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, DamageBaseType damageBaseType, BattleType battleType, ReceiveSlipDamageUnitStateBase receiveSlipDamageUnitState) { } */
    static GetSlipDamageValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, damageBaseType: DamageBaseType, battleType: BattleType, receiveSlipDamageUnitState: ReceiveSlipDamageUnitStateBase): int {
        let damage = BattleDamageCalculator.GetAppliedDamageOfBreakSituation(defenseUnit, damageBase, false);
        damage = BattleDamageCalculator.GetDefenseCorrectedDamage(attackUnit, defenseUnit, damage, damageBaseType);
        damage = BattleDamageCalculator.GetProcessedGiveDamage(attackUnit, defenseUnit, damage, attackElement, receiveSlipDamageUnitState);
        damage = BattleDamageCalculator.GetProcessedReceiveDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetElementResistDamage(attackUnit, defenseUnit, damage, attackElement);
        const correlationEffect = new CorrelationEffect().ctor$BattleUnit_BattleUnit_TargetElementType(attackUnit, defenseUnit, attackElement);
        damage = damage.mul(Decimal.fromFloat(correlationEffect._ElementDamageRatio));
        damage = BattleDamageCalculator.GetDifficultyCorrectedDamage(attackUnit, defenseUnit, damage);
        if (battleType === 2 || battleType === 4) damage = BattleDamageCalculator.SlipDamageCutByPvpOrGvgSuppression(damage); // inlined in the game
        damage = Decimal.max(Decimal.One, damage);
        damage = BattleDamageCalculator.GetDisabledDamage(damage, defenseUnit); // inlined in the game
        return damage.ceiling().toInt();
    }
    /** @rva 0x13806D0  public static AffectedUnitNotice GetSlipDamageResult(BattleUnit unit, Dictionary<int, BattleUnit> battleUnitDic, BattleType battleType, Func<UnitStateBase, bool> predicate, bool isImmediately = False) { } */
    static GetSlipDamageResult(unit: BattleUnit, battleUnitDic: Dictionary<int, BattleUnit>, battleType: BattleType, predicate: ((a0: UnitStateBase) => boolean), isImmediately: boolean = false): AffectedUnitNotice {
        // <>c__DisplayClass6_0 { isBreak }
        const receivedSlipDamageEffectTypes = new Set<string>(); // HashSet<string>
        const visualEffects = new Set<string>(); // HashSet<string>
        let isReceived = false;
        const isBreak = unit._BreakPoint.get_IsBreak();
        const damageDic: Dictionary<TargetElementType, Decimal> = new Map();
        let stateList = unit._Condition._StateList;
        if (predicate != null) stateList = stateList.filter(predicate);
        for (const state of stateList) {
            if (!isImpl(state, "IReceiveSlipDamage")) continue;
            const receiveSlipDamage = state as unknown as IReceiveSlipDamage;
            if (!state.IsActive$BattleUnit(unit)) continue;
            const attackUnit = battleUnitDic.get(state._UserUnitId) ?? null; // TryGetValue
            if (attackUnit == null) continue;
            const damage = Decimal.fromFloat(receiveSlipDamage.GetSlipDamageValue(attackUnit, unit, battleType, isImmediately));
            if (isImmediately) state._ShouldBeRemovedNow = true;
            receivedSlipDamageEffectTypes.add(state._EffectType);
            visualEffects.add(receiveSlipDamage.SlipDamageVisualEffectName); // slot 2
            const element = receiveSlipDamage.AttackElement; // slot 1
            if (damageDic.has(element)) { // TryAdd failed
                const key = receiveSlipDamage.AttackElement;
                damageDic.set(key, damageDic.get(key)!.add(damage));
            } else {
                damageDic.set(element, damage);
            }
            EpCharger.ChargeByReceiveSlipDamage(unit);
            isReceived = true;
        }
        unit._Condition.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state._ShouldBeRemovedNow); // <>c.b__6_0
        if (!isReceived) return null!;
        let notice = new AffectedUnitNotice().ctor$int(unit._Id);
        notice.Damages = [...damageDic].map(([key, value]) => { // DisplayClass6_0.b__1
            const damageInfo = new AffectedUnitNotice_DamageInfo();
            damageInfo._DamageValue = value.ceiling().toInt();
            damageInfo._IsBreakBonusApplied = isBreak;
            damageInfo._AttackElement = key;
            damageInfo._Category = 4 as DamageCategory; // Slip
            damageInfo._IsCritical = false;
            damageInfo._CorrelationDamageType = 0 as CorrelationDamageType;
            damageInfo._IsBarrierDamage = false;
            return damageInfo;
        });
        notice._ReceivedSlipDamageEffectTypeList = [...receivedSlipDamageEffectTypes];
        notice._DamageVisualEffectList = [...visualEffects];
        if (BattleDamageCalculator.IsDamageDisabled(unit)) notice = AffectedUnitNotice.op_Addition(notice, AffectedUnitNotice.CreateByDisabledDamageHit(unit._Id));
        let isMaxBreakBonus = false;
        if (unit._BreakPoint.get_IsBreak()) isMaxBreakBonus = unit._BreakedDamageReceiveRate === Math.trunc(unit._BattleParameter._MaxBreakedDamageReceiveRate / 10);
        for (const damageInfo of notice.Damages) damageInfo._IsMaxBreakBonusWhenHit = isMaxBreakBonus;
        return notice;
    }
    /** @rva 0x137DA30  private static Decimal GetDefenseCorrectedDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, DamageBaseType damageBaseType) { } */
    static GetDefenseCorrectedDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, damageBaseType: DamageBaseType): Decimal {
        const attackValue = attackUnit.GetProcessedDamageBaseParamValueDecimal(damageBaseType); // inlined in the game
        const defenseValue = defenseUnit.GetProcessedDefDecimal();
        const ten = Decimal.fromInt(10);
        const ratio = ten.add(attackValue).div(ten.add(defenseValue)).mul(Decimal.fromParts(12, 0, 0, false, 2)); // new decimal(12, 0, 0, false, 2) = 0.12
        return damage.mul(Decimal.min(ratio, Decimal.fromInt(2)));
    }
    /** @rva 0x13813C0  private static bool IsCriticalDamage(BattleUnit attackUnit, BattleUnit defenseUnit) { } */
    static IsCriticalDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit): boolean {
        const ctr = attackUnit.GetProcessedCtr();
        const rcvCtr = defenseUnit.GetProcessedRcvCtr(attackUnit);
        // new System.Random().NextDouble(): f32(roll * 100) < f32(rcvCtr + ctr)
        return randomChance(f32(rcvCtr + ctr), "crit", [attackUnit, defenseUnit], roll => f32(roll * 100) < f32(rcvCtr + ctr));
    }
    /** @rva 0x137C720  private static Decimal GetAddedCriticalDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetAddedCriticalDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal {
        const ctd = Decimal.fromFloat(attackUnit.GetProcessedCtd());
        const rcvCtd = Decimal.fromFloat(defenseUnit.GetProcessedRcvCtd(attackUnit));
        const hundred = Decimal.fromInt(100);
        return damage.mul(Decimal.One.add(ctd.div(hundred)).mul(Decimal.One.add(rcvCtd.div(hundred))));
    }
    /** @rva 0x137ED10  private static Decimal GetProcessedGiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, TargetElementType attackElement, ReceiveSlipDamageUnitStateBase receiveSlipDamageUnitState) { } */
    static GetProcessedGiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackElement: TargetElementType, receiveSlipDamageUnitState: ReceiveSlipDamageUnitStateBase): Decimal {
        // <>c__DisplayClass10_0 { attackElement }
        let result = damage;
        if (attackElement !== 0) {
            const rate = attackUnit._BattleParameter._ElementDamageRates.find(x => (x._Element as number) === (attackElement as number)) ?? null; // DisplayClass10_0.b__0
            if (rate != null) result = damage.add(damage.mul(Decimal.fromInt(rate._DamageRate).div(Decimal.fromInt(1000))));
        }
        for (const addition of [0, 1]) {
            for (const state of attackUnit._Condition._StateList) {
                if (isImpl(state, "IGiveDamageVariation")) {
                    const v = state as unknown as IGiveDamageVariation;
                    if (v.Addition === addition && state.IsActive$BattleUnit(attackUnit)) {
                        result = result.add(v.GetDamageVariationValue(attackUnit, defenseUnit, damage, result));
                        continue;
                    }
                }
                if (attackElement !== 0 && isImpl(state, "IElementDamageRateVariation")) {
                    const v = state as unknown as IElementDamageRateVariation;
                    if (v.Addition === addition && state.IsActive$BattleUnit(attackUnit)) {
                        const rate = v.GetElementDamageRateVariationValue(attackUnit, attackElement);
                        if (!rate.eq(Decimal.Zero)) result = result.add(damage.mul(rate.div(Decimal.fromInt(100))));
                        continue;
                    }
                }
                if (receiveSlipDamageUnitState != null && isImpl(state, "IGiveSlipDamageVariation")) {
                    const v = state as unknown as IGiveSlipDamageVariation;
                    if (v.Addition === addition && state.IsActive$BattleUnit(attackUnit)) {
                        result = result.add(v.GetSlipDamageVariationValue(receiveSlipDamageUnitState, attackUnit, defenseUnit, damage, result));
                    }
                }
            }
        }
        return result.le(Decimal.Zero) ? Decimal.Zero : result;
    }
    /** @rva 0x137E940  private static Decimal GetProcessedFinalGiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, ActiveSkillBase attackSkill) { } */
    static GetProcessedFinalGiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackSkill: ActiveSkillBase): Decimal {
        let result = damage;
        if (attackSkill instanceof SpecialAttack) {
            for (const state of attackUnit._Condition._StateList) {
                if (!(state instanceof GveUpSpecialAttackFinalGiveDamageRatioUnitState)) continue; // OfType (no IsActive check)
                result = result.add(state.GetDamageVariationValue(attackUnit, defenseUnit, damage, result)); // vslot 29
            }
        }
        return result.le(Decimal.Zero) ? Decimal.Zero : result;
    }
    /** @rva 0x137FAD0  private static Decimal GetProcessedReceiveDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetProcessedReceiveDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal {
        let result = damage;
        for (const addition of [0, 1]) {
            for (const state of defenseUnit._Condition._StateList) {
                if (!isImpl(state, "IReceiveDamageVariation")) continue;
                const v = state as unknown as IReceiveDamageVariation;
                if (v.Addition !== addition) continue;
                if (!state.IsActive$BattleUnit(defenseUnit)) continue;
                result = result.add(v.GetDamageVariationValue(attackUnit, defenseUnit, damage, result));
            }
        }
        return result.le(Decimal.Zero) ? Decimal.Zero : result;
    }
    /** @rva 0x137E130  private static Decimal GetElementResistDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage, TargetElementType attackElement) { } */
    static GetElementResistDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal, attackElement: TargetElementType): Decimal {
        if (attackElement === 0) return damage;
        const rate = Decimal.clamp(defenseUnit.GetProcessedElementResistRate(attackElement), Decimal.fromInt(-100), Decimal.fromInt(100)); // Math.Clamp(decimal)
        const result = damage.sub(damage.mul(rate.div(Decimal.fromInt(100))));
        return result.le(Decimal.Zero) ? Decimal.Zero : result;
    }
    /** @rva 0x137DD90  private static Decimal GetDifficultyCorrectedDamage(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damage) { } */
    static GetDifficultyCorrectedDamage(attackUnit: BattleUnit, defenseUnit: BattleUnit, damage: Decimal): Decimal {
        // <>c__DisplayClass14_0 { charaParam }
        let result = damage;
        const enemyParameter = attackUnit._BattleParameter;
        if (enemyParameter instanceof QuestEnemyAppearanceParameter) {
            const p = defenseUnit._BattleParameter;
            const charaParam = p instanceof CharacterParameter ? p : null;
            if (charaParam != null) {
                const rate = enemyParameter._ElementAimDamageRates.find(r => (r._Element as number) === (charaParam._Element as number)) ?? null; // DisplayClass14_0.b__0
                if (rate != null) result = result.add(result.mul(Decimal.fromInt(rate._DamageRate).div(Decimal.fromInt(1000))));
            }
        }
        return result;
    }
    /** @rva 0x137C520  private static Decimal GetAddedBreakDamage(BattleUnit attackUnit, Decimal damage) { } */
    static GetAddedBreakDamage(attackUnit: BattleUnit, damage: Decimal): Decimal {
        const p = attackUnit._BattleParameter;
        if (p instanceof CharacterParameter) {
            const rate = BattleDamageCalculator.GetProcessedBreakDamageRate(attackUnit, p);
            return damage.mul(Decimal.One.add(rate.div(Decimal.fromInt(100))));
        }
        return Decimal.Zero;
    }
    /** @rva 0x137E450  public static Decimal GetProcessedBreakDamageRate(BattleUnit attackUnit, CharacterParameter charaParam) { } */
    static GetProcessedBreakDamageRate(attackUnit: BattleUnit, charaParam: CharacterParameter): Decimal {
        let rate = Decimal.fromInt(charaParam._BreakDamageRate).div(Decimal.fromInt(10));
        for (const addition of [0, 1]) {
            for (const state of attackUnit._Condition._StateList) {
                if (!isImpl(state, "IBreakEffectVariation")) continue;
                const v = state as unknown as IBreakEffectVariation;
                if (v.Addition !== addition) continue;
                if (!state.IsActive$BattleUnit(attackUnit)) continue;
                rate = rate.add(v.GetBreakEffectVariationValue(attackUnit, rate));
            }
        }
        return rate.le(Decimal.Zero) ? Decimal.Zero : rate;
    }
    /** @rva 0x137C950  private static Decimal GetAppliedDamageOfBreakSituation(BattleUnit defenseUnit, Decimal damage, bool doForceToNormal = False) { } */
    static GetAppliedDamageOfBreakSituation(defenseUnit: BattleUnit, damage: Decimal, doForceToNormal: boolean = false): Decimal {
        if (!defenseUnit._BreakPoint.get_HasBreakPoint()) return damage;
        let rate: Decimal;
        if (defenseUnit._BreakPoint.get_IsBreak()) rate = Decimal.fromInt(defenseUnit._BreakedDamageReceiveRate).div(Decimal.fromInt(100));
        else rate = BreakPoint.DamageRatioOnNormal;
        if (doForceToNormal) rate = BreakPoint.DamageRatioOnNormal;
        return damage.mul(rate);
    }
    /** @rva 0x1380070  public static AffectedUnitNotice GetReflectionDamageResult(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageBase, TargetElementType attackElement, BattleType battleType) { } */
    static GetReflectionDamageResult(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageBase: Decimal, attackElement: TargetElementType, battleType: BattleType): AffectedUnitNotice {
        const visualEffects = new Set<string>(); // HashSet<string>
        let damage = BattleDamageCalculator.GetAppliedDamageOfBreakSituation(defenseUnit, damageBase, false);
        damage = BattleDamageCalculator.GetDefenseCorrectedDamage(attackUnit, defenseUnit, damage, BattleDamageCalculator.ReflectionDamageDefenceCorrectedBaseType);
        damage = BattleDamageCalculator.GetProcessedGiveDamage(attackUnit, defenseUnit, damage, attackElement, null!);
        damage = BattleDamageCalculator.GetProcessedReceiveDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetElementResistDamage(attackUnit, defenseUnit, damage, attackElement);
        const correlationEffect = new CorrelationEffect().ctor$BattleUnit_BattleUnit_TargetElementType(attackUnit, defenseUnit, attackElement);
        const correlationDamageType = correlationEffect._DamageType;
        damage = damage.mul(Decimal.fromFloat(correlationEffect._ElementDamageRatio));
        // no critical roll for reflection damage
        damage = BattleDamageCalculator.GetDifficultyCorrectedDamage(attackUnit, defenseUnit, damage);
        damage = BattleDamageCalculator.GetProcessedFinalGiveDamage(attackUnit, defenseUnit, damage, null!);
        if (battleType === 2 || battleType === 4) damage = BattleDamageCalculator.DamageCutByPvpOrGvgSuppression(damage);
        damage = BattleDamageCalculator.DamageCutByShield(damage, defenseUnit);
        damage = Decimal.max(Decimal.One, damage); // Math.Max(decimal, decimal)
        let notice = new AffectedUnitNotice().ctor$int(defenseUnit._Id);
        [notice, damage] = BattleDamageCalculator.DamageCutByDisableDamage(damage, defenseUnit, notice); // inlined in the game
        let damageValue = damage.ceiling().toInt(); // (int)decimal.Ceiling(damage)
        let barrierDamageValue = 0;
        [notice, barrierDamageValue, damageValue] = BattleDamageCalculator.DamageCutByBarrier(damageValue, defenseUnit, notice);
        const isBreak = defenseUnit._BreakPoint.get_IsBreak();
        const damageNotice = AffectedUnitNotice.CreateByDamage(defenseUnit._Id, damageValue, 5 as DamageCategory, false, correlationDamageType, [...visualEffects], attackElement, isBreak);
        let isMaxBreakBonus = false;
        if (defenseUnit._BreakPoint.get_IsBreak()) isMaxBreakBonus = defenseUnit._BreakedDamageReceiveRate === Math.trunc(defenseUnit._BattleParameter._MaxBreakedDamageReceiveRate / 10);
        for (const damageInfo of damageNotice.Damages) damageInfo._IsMaxBreakBonusWhenHit = isMaxBreakBonus;
        if (!(barrierDamageValue > 0 && damageValue === 0)) notice = AffectedUnitNotice.op_Addition(notice, damageNotice);
        if (barrierDamageValue > 0) {
            const barrierNotice = AffectedUnitNotice.CreateByBarrierDamage(defenseUnit._Id, barrierDamageValue, 5 as DamageCategory, false, correlationDamageType, [...visualEffects], attackElement, isBreak);
            for (const damageInfo of barrierNotice.BarrierDamages) damageInfo._IsMaxBreakBonusWhenHit = isMaxBreakBonus;
            notice = AffectedUnitNotice.op_Addition(notice, barrierNotice);
        }
        return notice;
    }
    /** @rva 0x137BFF0  private static Decimal DamageCutByPvpOrGvgSuppression(Decimal damage) { } */
    static DamageCutByPvpOrGvgSuppression(damage: Decimal): Decimal {
        const model = CalculationPointPolicyMstReader.GetModelByCoefficientName("damageSuppresionRatio");
        return damage.mul(Decimal.One.sub(Decimal.fromInt(model.get_Value()).div(Decimal.fromInt(1000))));
    }
    /** @rva 0x1381580  private static Decimal SlipDamageCutByPvpOrGvgSuppression(Decimal damage) { } */
    static SlipDamageCutByPvpOrGvgSuppression(damage: Decimal): Decimal {
        const model = CalculationPointPolicyMstReader.GetModelByCoefficientName("damageSuppresionRatio");
        return damage.mul(Decimal.One.sub(Decimal.fromInt(model.get_Value()).div(Decimal.fromInt(1000))));
    }
    /** @rva 0x137C160  private static Decimal DamageCutByShield(Decimal damage, BattleUnit defenseUnit) { } */
    static DamageCutByShield(damage: Decimal, defenseUnit: BattleUnit): Decimal {
        // <>c__DisplayClass21_0 { defenseUnit }
        const shields = defenseUnit._Condition._StateList
            .filter(s => s instanceof ShieldUnitState && s._RemainCount >= 1 && s.IsActive$BattleUnit(defenseUnit)) // DisplayClass21_0.b__0
            .map(s => s as ShieldUnitState); // <>c.b__21_1
        if (shields.length === 0) return damage;
        let ratio: float = 1;
        for (const shield of shields) {
            ratio = f32(ratio * f32(1 - shield._DecreaseRatio));
            shield.ConsumeRemainCount();
        }
        return damage.mul(Decimal.fromFloat(ratio));
    }
    /** @rva 0x137BC90  private static ValueTuple<AffectedUnitNotice, int, int> DamageCutByBarrier(int damageValue, BattleUnit defenseUnit, AffectedUnitNotice notice) { } */
    static DamageCutByBarrier(damageValue: int, defenseUnit: BattleUnit, notice: AffectedUnitNotice): [AffectedUnitNotice, int, int] {
        const condition = defenseUnit._Condition;
        if (0 < condition._BarrierEndurance) {
            let barrierDamageValue: int;
            let remainDamageValue: int;
            let isDestroyed = false;
            if (damageValue < condition._BarrierEndurance) {
                condition._BarrierEndurance = condition._BarrierEndurance - damageValue;
                remainDamageValue = 0;
                barrierDamageValue = damageValue;
            } else {
                remainDamageValue = damageValue - condition._BarrierEndurance;
                isDestroyed = true;
                barrierDamageValue = condition._BarrierEndurance;
                condition._BarrierEndurance = 0;
                defenseUnit._Condition._MaxBarrierEndurance = 0;
                defenseUnit._Condition.RemoveUnitState$BattleUnit_EffectOriginType(BarrierUnitState, defenseUnit, 0 as EffectOriginType);
            }
            const isCharacterFigure = defenseUnit.isCharacterFigure;
            const barrierNotice = new AffectedUnitNotice().ctor$int(defenseUnit._Id);
            barrierNotice._IsBarrierAttacked = true;
            barrierNotice._IsBarrierDestroyed = isDestroyed;
            barrierNotice._DamageVisualEffectList.push(isCharacterFigure ? "eff_cmn_act_barrier_active_001" : "eff_cmn_act_barrier_active_002");
            notice = AffectedUnitNotice.op_Addition(notice, barrierNotice);
            return [notice, barrierDamageValue, remainDamageValue];
        }
        return [notice, 0, damageValue];
    }
    /** @rva 0x137B110  public static AffectedUnitNoticeBundle CalcFinalDamageNoticeBundle(BattleUnit userUnit, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    static CalcFinalDamageNoticeBundle(userUnit: BattleUnit, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        // <>c__DisplayClass23_0 { userUnit }
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        if (!noticeBundle.GetAllDisplayDamageInfo().some(d => d._Category === 1 || d._Category === 2)) return null!; // <>c.b__23_0
        for (const notice of [...noticeBundle.noticeDic.values()]) {
            // <>c__DisplayClass23_1 { targetUnit }
            if (!notice.GetDisplayDamageInfoList().some(d => d._Category === 1 || d._Category === 2)) continue; // <>c.b__23_1
            const targetUnit = dictGet(gameDirector.get_battleUnitDic(), notice._AffectedUnitId);
            if (targetUnit._Team === userUnit._Team) continue;
            let totalDamage = Decimal.Zero; // Enumerable.Sum(Func<DamageInfo, decimal>)
            for (const d of notice.GetDisplayDamageInfoList()) totalDamage = totalDamage.add(Decimal.fromInt(d._DamageValue)); // <>c.b__23_2
            totalDamage = totalDamage.add(Decimal.fromInt(notice._BreakDamage != null ? notice._BreakDamage._DamageValue : 0));
            let ratio = Decimal.Zero; // Enumerable.Sum
            for (const state of targetUnit._Condition._StateList) {
                if (!(isImpl(state, "IReceiveFinalDamage") && state.IsActive$BattleUnit(targetUnit))) continue; // DisplayClass23_1.b__3
                ratio = ratio.add((state as unknown as IReceiveFinalDamage).GetFinalDamageRatio(userUnit)); // DisplayClass23_0.b__4
            }
            if (ratio.le(Decimal.Zero)) continue;
            const damageValue = totalDamage.mul(ratio).ceiling().toInt();
            let barrierNotice = new AffectedUnitNotice().ctor$int(targetUnit._Id);
            let barrierDamageValue: int, remainDamageValue: int;
            [barrierNotice, barrierDamageValue, remainDamageValue] = BattleDamageCalculator.DamageCutByBarrier(damageValue, targetUnit, barrierNotice);
            let attackElement = 0 as TargetElementType;
            const p = userUnit._BattleParameter;
            if (p instanceof CharacterParameter && enumIsDefined(TargetElementType$, p._Element as number)) attackElement = p._Element as number as TargetElementType;
            if (0 < remainDamageValue) {
                userUnit.Attack(targetUnit, remainDamageValue, gameDirector);
                const damageNotice = AffectedUnitNotice.CreateByDamage(targetUnit._Id, remainDamageValue, 8 as DamageCategory, false, 0 as CorrelationDamageType, null!, attackElement, false);
                damageNotice._IsDead = targetUnit.get_IsDead(); // inlined in the game
                affectedUnitNoticeBundle.Add(damageNotice);
            }
            if (0 < barrierDamageValue) {
                const barrierDamageNotice = AffectedUnitNotice.CreateByBarrierDamage(targetUnit._Id, barrierDamageValue, 8 as DamageCategory, false, 0 as CorrelationDamageType, null!, attackElement, false);
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.op_Addition(barrierNotice, barrierDamageNotice));
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x1381490  private static bool IsDamageDisabled(BattleUnit unit) { } */
    static IsDamageDisabled(unit: BattleUnit): boolean {
        return unit._Condition._StateList.some(state => state instanceof UniqueEnemy639002UnitState && state.IsActive$BattleUnit(unit)); // DisplayClass24_0.b__0
    }
    /** @rva 0x137E080  private static Decimal GetDisabledDamage(Decimal damage, BattleUnit defenseUnit) { } */
    static GetDisabledDamage(damage: Decimal, defenseUnit: BattleUnit): Decimal {
        return BattleDamageCalculator.IsDamageDisabled(defenseUnit) ? Decimal.Zero : damage;
    }
    /** @rva 0x137BEE0  private static ValueTuple<AffectedUnitNotice, Decimal> DamageCutByDisableDamage(Decimal damage, BattleUnit defenseUnit, AffectedUnitNotice notice) { } */
    static DamageCutByDisableDamage(damage: Decimal, defenseUnit: BattleUnit, notice: AffectedUnitNotice): [AffectedUnitNotice, Decimal] {
        if (BattleDamageCalculator.IsDamageDisabled(defenseUnit)) {
            notice = AffectedUnitNotice.op_Addition(notice, AffectedUnitNotice.CreateByDisabledDamageHit(defenseUnit._Id));
            damage = Decimal.Zero;
        }
        return [notice, damage];
    }
    /** @rva 0x13816F0  private static void .cctor() { } */
    static cctor(): void {
        BattleDamageCalculator.BreakDamageDefenceCorrectedBaseType = 1 as DamageBaseType;
        BattleDamageCalculator.ReflectionDamageDefenceCorrectedBaseType = 2 as DamageBaseType;
    }
}

BattleDamageCalculator.cctor(); // C# static constructor