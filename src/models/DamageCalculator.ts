/**
 * DamageCalculator.ts
 * ====================
 * The game's damage formula, ported from ReDriveBattleCore (game version 3.19.0).
 *
 * REVISION 5 (3.19.0): rewritten against the 3.19 decompilation, using the game's own
 * number types (BattleMath.ts): the whole pipeline is System.Decimal (emulated exactly),
 * crit and weak-element ratios are float32. Every step cites the method it ports; the
 * decompiled bodies are in E:\unpackedExedra\3.19.0\decompiled\ReDriveBattleCore.c
 * (search for the `// ==== ReDriveBattleCore.BattleDamageCalculator$$...` header).
 *
 * Tags: [CONFIRMED 3.19] = read from the 3.19 decompilation. [RECONSTRUCTED] = shape
 * confirmed, some detail inferred (the comment says which). [DATA] = value from base_data.
 *
 * Main path, BattleDamageCalculator$$GetAttackDamageResult (RVA 0x137cb10):
 *   base   = GetDamageBase(initial stat, power)                       (decimal)
 *   d = GetAppliedDamageOfBreakSituation(defender, base)
 *   d = GetDefenseCorrectedDamage(...)
 *   d = GetProcessedGiveDamage(...)
 *   d = GetProcessedReceiveDamage(...)
 *   d = GetElementResistDamage(...)
 *   d = d * (decimal)CorrelationEffect.ElementDamageRatio            (float -> decimal)
 *   crit roll: (float)(Random.NextDouble() * 100) < RcvCtr + Ctr     (float32)
 *   if crit: d = GetAddedCriticalDamage(...)
 *   d = GetDifficultyCorrectedDamage(...)                              (PvE only)
 *   d = GetProcessedFinalGiveDamage(...)                               (GvE only, then max(d,0))
 *   if PvP/GvG: d = DamageCutByPvpOrGvgSuppression(d)                  (x 0.25 in PvP!)
 *   d = DamageCutByShield(d, defender)
 *   d = Math.Max(1, d)
 *   if IsDamageDisabled(defender): d = 0                               (one PvE boss only)
 *   damage = (int)Decimal.Ceiling(d)
 *   DamageCutByBarrier(damage, defender)
 */

import { KiokuState } from "./PvPTeam";
import { SkillDetail, type AffectedUnitNotice } from "../types/KiokuTypes";
import { CsDecimal, dec, f32 } from "./BattleMath";
import {
    getProcessedAtkDecimal, getProcessedDefDecimal, getProcessedCtr, getProcessedRcvCtr, getProcessedCtd, getProcessedRcvCtd,
    getProcessedElementResistRate, giveDamageVariation, receiveDamageVariation, elementDamageRateVariation, slipGiveDamageVariation,
    weakElementUpRatios, activeShieldRatios, statesOf,
} from "./UnitStateEngine";

// ---------------------------------------------------------------------------
// BattleType - Network.Definition.Battle.BattleType (dump.cs)
// ---------------------------------------------------------------------------
export const enum BattleType {
    Solo = 1,
    Pvp = 2,
    Gve = 3,
    Gvg = 4,
    Exploration = 5,
    ScoreAttack = 6,
    Simulation = 7,
}

// ---------------------------------------------------------------------------
// DamageBaseType - 1 ATK, 2 DEF, 3 HP (BattleUnit$$GetInitialDamageBaseParamValue 0x1384310)
// ---------------------------------------------------------------------------
export const enum DamageBaseType {
    ATK = 1,
    DEF = 2,
    HP = 3,
}

export function damageBaseTypeFromEffectType(abilityEffectType: string): DamageBaseType {
    if (abilityEffectType === "DMG_ATK" || abilityEffectType === "DMG_RANDOM" || abilityEffectType === "ADDITIONAL_DAMAGE") return DamageBaseType.ATK;
    if (abilityEffectType === "DMG_DEF") return DamageBaseType.DEF;
    if (abilityEffectType === "DMG_HP") return DamageBaseType.HP;
    console.warn("Unknown damage ability effect type, defaulting to ATK-scaling:", abilityEffectType);
    return DamageBaseType.ATK;
}

// ---------------------------------------------------------------------------
// PvP balance table [DATA] getCalculationPointPolicyMstList.json (3.18), policyType 3.
// Read by CalculationPointPolicyMstReader$$GetModelByCoefficientName; used by
// DamageCutByPvpOrGvgSuppression (0x137bff0), GetSlipDamageValue (0x1380f20) and the
// barrier/heal formulas. Hard-coded here (with the row ids) because that file isn't part
// of the synced base_data yet - move to a data import once it is.
// ---------------------------------------------------------------------------
export const PVP_POLICY = {
    damageSuppresionRatio: 750,          // id 23: damage x (1 - 750/1000) = x 0.25
    healValueSuppresionRatio: 500,       // id 24
    barrierEnduranceSuppresionRatio: 500,// id 25
    initialBreakDamageReceiveRate: 1000, // id 21
    maxBreakDamageReceiveRate: 2000,     // id 22
} as const;

export function isSuppressedBattleType(bt: BattleType): boolean {
    return bt === BattleType.Pvp || bt === BattleType.Gvg; // `battleType == 2 || battleType == 4`
}

// ---------------------------------------------------------------------------
// GetInitialDamageBaseParamValue - the unit's UNBUFFED panel stat, as a float
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] BattleUnit$$GetInitialDamageBaseParamValue returns (float)Param.ATK /
// DEF / HP. Buffs only enter the formula through GetDefenseCorrectedDamage.
export function getInitialDamageBaseParamValue(unit: KiokuState, damageBaseType: DamageBaseType): number {
    switch (damageBaseType) {
        case DamageBaseType.ATK: return f32(unit.kioku.getBaseAtk());
        case DamageBaseType.DEF: return f32(unit.kioku.getBaseDef());
        case DamageBaseType.HP: return f32(unit.kioku.getBaseHp());
    }
}

// ---------------------------------------------------------------------------
// GetDamageBase
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] BattleDamageCalculator$$GetDamageBase(float paramValue, float power)
// (0x137d8a0):
//   (decimal)(paramValue * power)                        <- float32 multiply, then 7-digit decimal
//   * (((decimal)Math.Pow((double)paramValue / 124.0, 1.2) + 12) / 20)   <- double pow, 15-digit decimal
// Evaluation order in the binary: ((pow + 12) / 20) first, then multiplied by the first term.
// Math.Pow note: V8's Math.pow and MSVC's pow can differ in the last bit; the 15-digit
// decimal conversion absorbs that except in astronomically rare cases.
export function getDamageBase(paramValue: number, power: number): CsDecimal {
    const p = f32(paramValue), pw = f32(power);
    const first = dec.float(f32(p * pw));
    const pow = dec.double(Math.pow(p / 124.0, 1.2));
    return pow.add(dec.int(12)).div(dec.int(20)).mul(first);
}

// Damage power for a DMG_* effect: DamageAbilityEffectBase$$.ctor (0x18f0630) stores
// damagePower = ((float)EffectValue1 / 1000f, (float)EffectValue2 / 1000f). Triggering
// (0x18ef650) uses Item1 for the main target and Item2 for every OTHER target when
// EffectRange == SelectMultiple (2) - i.e. value2 is the splash/proximity power.
export function damagePower(detail: SkillDetail, isMainTarget: boolean): number {
    const useSplash = detail.range === 2 && !isMainTarget;
    return f32(f32(useSplash ? detail.value2 : detail.value1) / 1000);
}

// ---------------------------------------------------------------------------
// GetAppliedDamageOfBreakSituation  [CONFIRMED 3.19] (0x137c950)
// ---------------------------------------------------------------------------
// If the defender is broken (BreakPoint.IsBreak: maxPoint >= 1 && point < 1):
//   d * ((decimal)BreakedDamageReceiveRate / 100)
// else d * 1.0 (BreakPoint static NormalRate). doForceToNormal is never set on this path.
// BreakedDamageReceiveRate is a per-unit int; see KiokuState.breakedDamageReceiveRate.
export function getAppliedDamageOfBreakSituation(defender: KiokuState, damage: CsDecimal): CsDecimal {
    const isBreak = defender.maxBreakGauge >= 1 && defender.currentRemainingBreakGauge < 1;
    if (!isBreak) return damage;
    return damage.mul(dec.int(defender.breakedDamageReceiveRate).div(dec.int(100)));
}

// ---------------------------------------------------------------------------
// GetDefenseCorrectedDamage  [CONFIRMED 3.19] (0x137da30)
// ---------------------------------------------------------------------------
//   atk = attacker GetProcessedAtkDecimal (type ATK) / GetProcessedDefDecimal (DEF) /
//         (decimal)HP (type HP, unbuffed)
//   d * Min(((10 + atk) / (10 + defender.GetProcessedDefDecimal)) * 0.12, 2)
export function getDefenseCorrectedDamage(attacker: KiokuState, defender: KiokuState, damage: CsDecimal, damageBaseType: DamageBaseType, defenderDefOverride?: CsDecimal): CsDecimal {
    let atk: CsDecimal;
    if (damageBaseType === DamageBaseType.ATK) atk = getProcessedAtkDecimal(attacker);
    else if (damageBaseType === DamageBaseType.DEF) atk = getProcessedDefDecimal(attacker);
    else atk = dec.int(attacker.kioku.getBaseHp());
    const def = defenderDefOverride ?? getProcessedDefDecimal(defender);
    const ten = dec.int(10);
    const factor = CsDecimal.min(ten.add(atk).div(ten.add(def)).mul(dec.int(12).div(dec.int(100)) /* new decimal(12, 0, 0, false, 2) = 0.12m */), dec.int(2));
    return damage.mul(factor);
}

// ---------------------------------------------------------------------------
// GetProcessedGiveDamage  [CONFIRMED 3.19] (0x137ed10)
// ---------------------------------------------------------------------------
//   result = damage (+ damage * Param.ElementDamageRates[element]/1000 - none for characters)
//   pass Up:   each active IGiveDamageVariation (Up)       result += var(damage, result)
//              each active IElementDamageRateVariation     result += damage * (rate / 100)
//              each active IGiveSlipDamageVariation (slip) result += var(...)
//   pass Down: the Down variants of the same, on the running result
//   clamp >= 0
export function getProcessedGiveDamage(attacker: KiokuState, defender: KiokuState, damage: CsDecimal, attackElement: number, slipEffectType?: string): CsDecimal {
    const states = statesOf(attacker);
    let result = damage;
    for (const pass of ["Up", "Down"] as const) {
        for (const d of states) {
            const g = giveDamageVariation(d, attacker, defender, damage, result);
            if (g) { if (g.addition === pass) result = result.add(g.value); continue; }
            if (pass === "Up" && attackElement) {
                const r = elementDamageRateVariation(d, attackElement);
                if (r) { if (!r.isZero()) result = result.add(damage.mul(r.div(dec.int(100)))); continue; }
            }
            if (slipEffectType) {
                const s = slipGiveDamageVariation(d, slipEffectType, damage, result);
                if (s && s.addition === pass) result = result.add(s.value);
            }
        }
    }
    return result.le(CsDecimal.Zero) ? CsDecimal.Zero : result;
}

// ---------------------------------------------------------------------------
// GetProcessedReceiveDamage  [CONFIRMED 3.19] (0x137fad0) - defender's states, Up then Down
// ---------------------------------------------------------------------------
export function getProcessedReceiveDamage(attacker: KiokuState, defender: KiokuState, damage: CsDecimal): CsDecimal {
    const states = statesOf(defender);
    let result = damage;
    for (const pass of ["Up", "Down"] as const) {
        for (const d of states) {
            const r = receiveDamageVariation(d, attacker, damage, result);
            if (r && r.addition === pass) result = result.add(r.value);
        }
    }
    return result.le(CsDecimal.Zero) ? CsDecimal.Zero : result;
}

// ---------------------------------------------------------------------------
// GetElementResistDamage  [CONFIRMED 3.19] (0x137e130)
// ---------------------------------------------------------------------------
//   if element == 0: unchanged
//   r = Clamp(defender.GetProcessedElementResistRate(element), -100, 100)
//   d - d * (r / 100), clamp >= 0
export function getElementResistDamage(defender: KiokuState, damage: CsDecimal, attackElement: number): CsDecimal {
    if (!attackElement) return damage;
    const r = CsDecimal.clamp(getProcessedElementResistRate(defender, attackElement), dec.int(-100), dec.int(100));
    const out = damage.sub(damage.mul(r.div(dec.int(100))));
    return out.le(CsDecimal.Zero) ? CsDecimal.Zero : out;
}

// ---------------------------------------------------------------------------
// CorrelationEffect  [CONFIRMED 3.19] (.ctor 0x1493f80, .cctor 0x1493f30)
// ---------------------------------------------------------------------------
// Weak hit iff the attacker is a character (CharacterParameter), attackElement != 0 and
// attackElement is in defender.WeakElements. Ratio (float32): normal 1.0f; weak starts at
// 1.2f (0x3f99999a) and adds each active weak-element state's get_UpRatio()/100f.
export function isMatchWeakElement(attackElement: number, defender: KiokuState): boolean {
    return !!attackElement && defender.weakElements.includes(attackElement);
}
export interface CorrelationEffectResult {
    elementDamageRatio: number; // float32
    isWeakHit: boolean;
}
export function computeCorrelationEffect(attacker: KiokuState, defender: KiokuState, attackElement: number): CorrelationEffectResult {
    if (!isMatchWeakElement(attackElement, defender)) return { elementDamageRatio: 1, isWeakHit: false };
    let ratio = f32(1.2);
    for (const up of weakElementUpRatios(attacker)) ratio = f32(f32(up / 100) + ratio);
    return { elementDamageRatio: ratio, isWeakHit: true };
}

// ---------------------------------------------------------------------------
// Crit  [CONFIRMED 3.19]
// ---------------------------------------------------------------------------
// Roll (inside GetAttackDamageResult): isCrit = (float)(rng.NextDouble() * 100) < RcvCtr + Ctr
// (float32 sum). Skipped entirely for AdditionalSkill hits of type 5.
// GetAddedCriticalDamage (0x137c720): d * ((1 + (decimal)Ctd/100) * (1 + (decimal)RcvCtd/100))
export function critChance(attacker: KiokuState, defender: KiokuState): number {
    return f32(getProcessedRcvCtr(defender, attacker) + getProcessedCtr(attacker));
}
export function rollCritical(attacker: KiokuState, defender: KiokuState, rng: () => number): boolean {
    return f32(rng() * 100) < critChance(attacker, defender);
}
export function getAddedCriticalDamage(attacker: KiokuState, defender: KiokuState, damage: CsDecimal): CsDecimal {
    const ctd = dec.float(getProcessedCtd(attacker)).div(dec.int(100));
    const rcvCtd = dec.float(getProcessedRcvCtd(defender, attacker)).div(dec.int(100));
    return damage.mul(CsDecimal.One.add(ctd).mul(CsDecimal.One.add(rcvCtd)));
}

// ---------------------------------------------------------------------------
// GetDifficultyCorrectedDamage (0x137dd90) - only for PvE quest enemies; no-op for PvP.
// ---------------------------------------------------------------------------
export function getDifficultyCorrectedDamage(_attacker: KiokuState, _defender: KiokuState, damage: CsDecimal): CsDecimal {
    return damage;
}

// ---------------------------------------------------------------------------
// DamageCutByPvpOrGvgSuppression  [CONFIRMED 3.19 + DATA] (0x137bff0)
// ---------------------------------------------------------------------------
//   d * (1 - (decimal)policy("damageSuppresionRatio").value / 1000)
export function damageCutByPvpOrGvgSuppression(damage: CsDecimal): CsDecimal {
    return damage.mul(CsDecimal.One.sub(dec.int(PVP_POLICY.damageSuppresionRatio).div(dec.int(1000))));
}

// ---------------------------------------------------------------------------
// DamageCutByShield  [CONFIRMED 3.19] (0x137c160)
// ---------------------------------------------------------------------------
//   m = 1f; for each active SHIELD: m = m * (1f - ratio); shield.ConsumeRemainCount()
//   d * (decimal)m          (float32 product, 7-digit decimal conversion)
export function damageCutByShield(defender: KiokuState, damage: CsDecimal): { damage: CsDecimal, applied: boolean } {
    const ratios = activeShieldRatios(defender);
    if (ratios.length === 0) return { damage, applied: false };
    let m = f32(1);
    for (const r of ratios) m = f32(m * f32(1 - r));
    return { damage: damage.mul(dec.float(m)), applied: true };
}

// ---------------------------------------------------------------------------
// DamageCutByBarrier  [CONFIRMED 3.19] (0x137bc90) - plain int arithmetic
// ---------------------------------------------------------------------------
export interface BarrierCutResult {
    remainingDamage: number;
    absorbedByBarrier: number;
    barrierBroke: boolean;
}
export function damageCutByBarrier(defender: KiokuState, damageValue: number): BarrierCutResult {
    const barrier = defender.barrierEndurance;
    if (barrier <= 0) return { remainingDamage: damageValue, absorbedByBarrier: 0, barrierBroke: false };
    if (damageValue < barrier) {
        defender.barrierEndurance = barrier - damageValue;
        return { remainingDamage: 0, absorbedByBarrier: damageValue, barrierBroke: false };
    }
    defender.barrierEndurance = 0;
    defender.maxBarrierEndurance = 0;
    return { remainingDamage: damageValue - barrier, absorbedByBarrier: barrier, barrierBroke: true };
}

// ---------------------------------------------------------------------------
// GetAttackDamageResult  [CONFIRMED 3.19] (0x137cb10)
// ---------------------------------------------------------------------------
export interface DamageOptions {
    battleType?: BattleType;
    // DMG_* with range 2: the main target uses value1 power, the others value2.
    isMainTarget?: boolean;
    // Force the crit outcome (manual override in the UI); otherwise rolled with `rng`.
    forceCrit?: boolean;
    rng?: () => number;
    // Precomputed damage base (AdditionalDamageAbilityEffect overrides GetDamageBase).
    damageBaseOverride?: CsDecimal;
    // Attack element override (additional damage uses the attacker's own element).
    attackElementOverride?: number;
    // AdditionalSkill with type 5: no crit roll, no barrier cut.
    isNoCritNoBarrier?: boolean;
}

export interface DamageResult {
    finalDamage: number;       // int damage after barrier
    preBarrierDamage: number;  // (int)Ceiling(d) before barrier
    exactDamage: CsDecimal;    // decimal damage right before Ceiling, for debugging
    isCritical: boolean;
    critChance: number;        // percent (float32), for display
    isWeakHit: boolean;
    barrierAbsorbed: number;
    shieldMultiplierApplied: boolean;
    notice: AffectedUnitNotice;
    steps: { label: string, value: string }[]; // decimal after each pipeline step
}

export function getAttackDamageResult(attacker: KiokuState, defender: KiokuState, detail: SkillDetail, damageBaseType: DamageBaseType, battleTypeOrOpts: BattleType | DamageOptions = BattleType.Pvp): DamageResult {
    const opts: DamageOptions = typeof battleTypeOrOpts === "object" ? battleTypeOrOpts : { battleType: battleTypeOrOpts };
    const battleType = opts.battleType ?? BattleType.Pvp;
    const attackElement: number = opts.attackElementOverride ?? detail.element ?? 0;
    const steps: { label: string, value: string }[] = [];
    const step = (label: string, v: CsDecimal) => { steps.push({ label, value: v.toString() }); return v; };

    let d = opts.damageBaseOverride ?? getDamageBase(getInitialDamageBaseParamValue(attacker, damageBaseType), damagePower(detail, opts.isMainTarget ?? true));
    step("base", d);
    d = step("break", getAppliedDamageOfBreakSituation(defender, d));
    d = step("defense", getDefenseCorrectedDamage(attacker, defender, d, damageBaseType));
    d = step("give", getProcessedGiveDamage(attacker, defender, d, attackElement));
    d = step("receive", getProcessedReceiveDamage(attacker, defender, d));
    d = step("elementResist", getElementResistDamage(defender, d, attackElement));
    const correlation = computeCorrelationEffect(attacker, defender, attackElement);
    d = step("weakElement", d.mul(dec.float(correlation.elementDamageRatio)));

    const chance = critChance(attacker, defender);
    const isCritical = opts.isNoCritNoBarrier ? false
        : opts.forceCrit !== undefined ? opts.forceCrit
            : f32((opts.rng ?? Math.random)() * 100) < chance;
    if (isCritical) d = step("crit", getAddedCriticalDamage(attacker, defender, d));

    d = step("difficulty", getDifficultyCorrectedDamage(attacker, defender, d));
    if (d.lt(CsDecimal.Zero)) d = CsDecimal.Zero; // GetProcessedFinalGiveDamage: GvE-only states, then clamp
    if (isSuppressedBattleType(battleType)) d = step("pvpSuppression", damageCutByPvpOrGvgSuppression(d));
    const shield = damageCutByShield(defender, d);
    d = step("shield", shield.damage);
    d = CsDecimal.max(CsDecimal.One, d);
    const exactDamage = d;
    const preBarrierDamage = d.ceiling().toInt();

    const wasBarrierActiveBefore = defender.barrierEndurance > 0;
    const barrierResult = opts.isNoCritNoBarrier
        ? { remainingDamage: preBarrierDamage, absorbedByBarrier: 0, barrierBroke: false }
        : damageCutByBarrier(defender, preBarrierDamage);
    const isDeadAfter = defender.currentHp - barrierResult.remainingDamage <= 0;

    const notice: AffectedUnitNotice = {
        totalDamageValue: barrierResult.remainingDamage,
        isCritical,
        isWeakElementAttacked: correlation.isWeakHit,
        isDead: isDeadAfter,
        isReceivedRecovery: false,
        isBarrierAdded: false,
        isBarrierAttacked: wasBarrierActiveBefore,
        isBarrierDestroyed: barrierResult.barrierBroke,
        isBreakedDamageReceiveRateBecomeMax: false,
        isReceivedReflection: false,
        isReceivedAttack: true,
    };

    return {
        finalDamage: barrierResult.remainingDamage,
        preBarrierDamage,
        exactDamage,
        isCritical,
        critChance: chance,
        isWeakHit: correlation.isWeakHit,
        barrierAbsorbed: barrierResult.absorbedByBarrier,
        shieldMultiplierApplied: shield.applied,
        notice,
        steps,
    };
}

// ---------------------------------------------------------------------------
// ADDITIONAL_DAMAGE  [CONFIRMED 3.19]
// ---------------------------------------------------------------------------
// AdditionalDamageUnitState (.ctor 0x15b5130: ratio = (float)v / 10f) holds an
// AdditionalDamageAbilityEffect. GetAdditionalDamageResult (0x15b4840), called after an
// attack, runs a full extra hit on every unit the attack damaged:
//   damageBase = GetDamageBase((float)ATK of the unit that APPLIED the state, ratio / 100f)
//   element    = the attacker's character element
//   then the normal DamageAbilityEffectBase.Triggering path -> GetAttackDamageResult
//   (so DEF, give/receive, resist, weak element, crit, suppression, shield, barrier all apply).
export function getAdditionalDamageBase(stateApplier: KiokuState, detail: SkillDetail): CsDecimal {
    const ratio = f32(f32(detail.value1) / 10);
    return getDamageBase(f32(stateApplier.kioku.getBaseAtk()), f32(ratio / 100));
}

// ---------------------------------------------------------------------------
// RCV_FINAL_DAMAGE  [CONFIRMED 3.19]
// ---------------------------------------------------------------------------
// BattleDamageCalculator$$CalcFinalDamageNoticeBundle (0x137b110): after a skill resolves,
// for each damaged target with active IReceiveFinalDamage states:
//   extra = (int)Ceiling(Σ damage dealt to it by the skill * Σ GetFinalDamageRatio(attacker))
// applied as one more damage notice (through the barrier). See UnitStateEngine.getFinalDamageRatio.
export function getFinalDamageExtra(totalDamage: number, ratio: CsDecimal): number {
    if (ratio.isZero() || totalDamage <= 0) return 0;
    return dec.int(totalDamage).mul(ratio).ceiling().toInt();
}

// ---------------------------------------------------------------------------
// GetSlipDamageValue  [CONFIRMED 3.19] (0x1380f20) - DOT ticks
// ---------------------------------------------------------------------------
// damageBase = ReceiveSlipDamageUnitStateBase$$GetDamageBase (0x15bf5b0):
//     GetDamageBase((float)applier's initial ATK/DEF/HP, (float)v / 1000f)
// then: break -> defense -> give (with slip variations) -> receive -> element resist
//       -> x correlation ratio -> difficulty -> PvP suppression -> Max(1, d) -> Ceiling.
// No crit, no shield, no barrier cut in this function.
export function getSlipDamageResult(dotOwner: KiokuState, target: KiokuState, detail: SkillDetail, damageBaseType: DamageBaseType, battleType: BattleType = BattleType.Pvp): number {
    const attackElement: number = detail.element ?? 0;
    let d = getDamageBase(getInitialDamageBaseParamValue(dotOwner, damageBaseType), f32(f32(detail.value1) / 1000));
    d = getAppliedDamageOfBreakSituation(target, d);
    d = getDefenseCorrectedDamage(dotOwner, target, d, damageBaseType);
    d = getProcessedGiveDamage(dotOwner, target, d, attackElement, detail.abilityEffectType);
    d = getProcessedReceiveDamage(dotOwner, target, d);
    d = getElementResistDamage(target, d, attackElement);
    d = d.mul(dec.float(computeCorrelationEffect(dotOwner, target, attackElement).elementDamageRatio));
    d = getDifficultyCorrectedDamage(dotOwner, target, d);
    if (isSuppressedBattleType(battleType)) d = damageCutByPvpOrGvgSuppression(d);
    d = CsDecimal.max(CsDecimal.One, d);
    return d.ceiling().toInt();
}
