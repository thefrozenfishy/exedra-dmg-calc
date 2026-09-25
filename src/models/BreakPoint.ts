// Break gauge logic, ported from ReDriveBattleCore 3.19.0 (see MISSING_AND_UNCERTAIN.md R6).
//
// Per damage hit (DamageAbilityEffectBase$$Triggering 0x18ef650), for every target:
//   1. the damage is calculated first (so the hit that breaks a unit is NOT boosted by it)
//   2. if the target is ALREADY broken: IncreaseBreakedDamageReceiveRate (0x18eecd0)
//   3. BreakPoint.Decrease (0x1492530) with the effect's break value
//      (main target: Item1, other targets of a range-2 skill: Item2)
import { CsDecimal, dec, f32 } from "./BattleMath";
import type { KiokuState } from "./PvPTeam";
import type { SkillDetail } from "../types/KiokuTypes";
import { KiokuRole } from "../types/enums";
import { statesOf } from "./UnitStateEngine";
import { PVP_POLICY } from "./DamageCalculator";

// Network.Definition.Battle.SkillType
export const SkillType = { ActiveSkill: 1, SpecialAttack: 2, NormalAttack: 3, AdditionalSkill: 4, EtherBlow: 5 } as const
export type SkillType = typeof SkillType[keyof typeof SkillType]

// [CONFIRMED 3.19] BreakPoint$$GetDecreaseValue (0x14928a0) and its three local functions
// (0x1492cf0 normal, 0x1492b40 active skill, 0x1492ea0 special). Returns (main, sub): sub is
// only non-zero for range 2 (SelectMultiple). The table depends on whether the ATTACKER is a
// Breaker. AdditionalSkill (follow-ups) and EtherBlow use the normal-attack table.
//                       range 1      range 2        range 3
//   Normal    other      10          (8, 5)          5
//             Breaker    20          (15, 10)        10
//   Active    other      20          (15, 10)        12
//             Breaker    45          (35, 15)        30
//   Special   other      35          (30, 20)        25
//             Breaker    60          (50, 30)        45
const DECREASE_TABLE: Record<"normal" | "active" | "special", Record<"other" | "breaker", Record<number, [number, number]>>> = {
    normal: { other: { 1: [10, 0], 2: [8, 5], 3: [5, 0] }, breaker: { 1: [20, 0], 2: [15, 10], 3: [10, 0] } },
    active: { other: { 1: [20, 0], 2: [15, 10], 3: [12, 0] }, breaker: { 1: [45, 0], 2: [35, 15], 3: [30, 0] } },
    special: { other: { 1: [35, 0], 2: [30, 20], 3: [25, 0] }, breaker: { 1: [60, 0], 2: [50, 30], 3: [45, 0] } },
};

export function getDecreaseValue(skillType: SkillType, range: number, attackerRole: KiokuRole): [number, number] {
    const kind = skillType === SkillType.ActiveSkill ? "active" : skillType === SkillType.SpecialAttack ? "special" : "normal";
    const row = DECREASE_TABLE[kind][attackerRole === KiokuRole.Breaker ? "breaker" : "other"];
    return row[range] ?? [0, 0]; // the game throws for any other RangeType
}

// [CONFIRMED 3.19] DamageAbilityEffectBase.ctor (0x18f0630) stores SpecifiedVariationBreakPoint =
// (value3, value4); GetVariationBreakPoint (0x18eec40) uses it when Item1 != 0, else the table.
export function getVariationBreakPoint(detail: SkillDetail, skillType: SkillType, attackerRole: KiokuRole): [number, number] {
    if (detail.value3) return [detail.value3, (detail as any).value4 ?? 0];
    return getDecreaseValue(skillType, detail.range, attackerRole);
}

// ---------------------------------------------------------------------------
// CalculateProcessedBreakPointDamage  [CONFIRMED 3.19] (0x14914c0)
// ---------------------------------------------------------------------------
//   r = damage
//   attacker IGiveBreakPointDamageVariation: Up pass, then Down pass; r <= 0 -> 0
//   if attackElement is one of the defender's WeakElements: r += r * 0.2 (BreakPointWeakElementDecreaseRatio)
//   defender IReceiveBreakPointDamageVariation: Up pass, then Down pass; r <= 0 -> 0
//   return (int)Ceiling(r)
// Each state's value is BreakPointDamageVariationUnitStateBase$$GetDamageVariationValue (0x16cf3d0):
//   Ratio: (Up ? damage : running) * (decimal)value1 / 1000     Fixed: (decimal)value1
//   negated for Down states.
type BreakStateKind = { side: "give" | "receive", calc: "Ratio" | "Fixed", addition: "Up" | "Down" };
const BREAK_STATES: Record<string, BreakStateKind> = {
    UP_GIV_BREAK_POINT_DMG_FIXED: { side: "give", calc: "Fixed", addition: "Up" },
    UP_GIV_BREAK_POINT_DMG_RATIO: { side: "give", calc: "Ratio", addition: "Up" },
    CPN_UP_GIV_BREAK_POINT_DMG_RATIO: { side: "give", calc: "Ratio", addition: "Up" },
    DWN_GIV_BREAK_POINT_DMG_FIXED: { side: "give", calc: "Fixed", addition: "Down" },
    UP_RCV_BREAK_POINT_DMG_RATIO: { side: "receive", calc: "Ratio", addition: "Up" },
    DWN_RCV_BREAK_POINT_DMG_RATIO: { side: "receive", calc: "Ratio", addition: "Down" },
};

function applyBreakStates(unit: KiokuState, side: "give" | "receive", damage: CsDecimal, start: CsDecimal): CsDecimal {
    let r = start;
    const states = statesOf(unit);
    for (const pass of ["Up", "Down"] as const) {
        for (const d of states) {
            const k = BREAK_STATES[d.abilityEffectType];
            if (!k || k.side !== side || k.addition !== pass) continue;
            const stacks = d._accumCount ?? 1;
            let v = k.calc === "Fixed"
                ? dec.int(d.value1)
                : (pass === "Up" ? damage : r).mul(dec.int(d.value1)).div(dec.int(1000));
            if (stacks > 1) v = v.mul(dec.int(stacks));
            r = pass === "Up" ? r.add(v) : r.sub(v);
        }
    }
    return r.le(CsDecimal.Zero) ? CsDecimal.Zero : r;
}

export function calculateProcessedBreakPointDamage(attacker: KiokuState, defender: KiokuState, damage: number, attackElement: number): number {
    const base = dec.int(damage);
    let r = applyBreakStates(attacker, "give", base, base);
    if (attackElement && defender.weakElements.includes(attackElement)) {
        r = r.add(r.mul(dec.int(2).div(dec.int(10))));
    }
    r = applyBreakStates(defender, "receive", r, r);
    return r.ceiling().toInt();
}

// ---------------------------------------------------------------------------
// BreakPoint.Decrease  [CONFIRMED 3.19] (0x1492530)
// ---------------------------------------------------------------------------
// Does nothing if the unit has no gauge or is already broken (PointValue < 1).
// PointValue = Clamp(PointValue - processed, 0, max). On reaching 0: BreakCount++, the break
// bonus damage (BattleDamageCalculator$$GetBreakDamage) is attached to the notice, the turn
// gauge is pushed back by BreakTurnGaugeSlowRatio/1000 (PvP policy 250) and
// BreakedDamageReceiveRate is set to InitialBreakedDamageReceiveRate/10 (PvP policy 1000 -> 100).
export interface BreakResult { decreased: number, broke: boolean }
export function decreaseBreakPoint(attacker: KiokuState, defender: KiokuState, attackElement: number, decreaseValue: number): BreakResult {
    if (defender.maxBreakGauge < 1 || defender.currentRemainingBreakGauge < 1) return { decreased: 0, broke: false };
    const processed = calculateProcessedBreakPointDamage(attacker, defender, decreaseValue, attackElement);
    const before = defender.currentRemainingBreakGauge;
    defender.currentRemainingBreakGauge = Math.min(defender.maxBreakGauge, Math.max(0, before - processed));
    const broke = defender.currentRemainingBreakGauge < 1;
    if (broke) defender.onBreak();
    return { decreased: before - defender.currentRemainingBreakGauge, broke };
}

// ---------------------------------------------------------------------------
// IncreaseBreakedDamageReceiveRate  [CONFIRMED 3.19] (0x18eecd0)
// ---------------------------------------------------------------------------
// Only when the target is already broken, on every damage hit:
//   base = value5 / 10 of the damage effect, or by attacker role when 0:
//          Attacker 5, Breaker 20, Healer/Defender 10, Buffer/Debuffer 12
//   inc  = (int)Math.Floor((double)((increaseRate/1000f) * (attackerRatio/100f + 1f) * base))
//   rate = min(rate + inc, MaxBreakedDamageReceiveRate/10)          (AddBreakedDamageReceiveRate)
// increaseRate = BreakedDamageReceiveRateIncreaseRate, 1000 for every character in PvP
// (CharacterParameter.ctor). attackerRatio = BattleUnit$$GetProcessedBreakedDamageReceiveRatio:
// 100 + Σ UP_BREAKED_DAMAGE_RECEIVE_RATIO (v/10) + Σ DWN (-(v/10) * running / 100), minus 100.
const ROLE_BASE: Record<string, number> = {
    [KiokuRole.Attacker]: 5, [KiokuRole.Breaker]: 20, [KiokuRole.Healer]: 10,
    [KiokuRole.Defender]: 10, [KiokuRole.Buffer]: 12, [KiokuRole.Debuffer]: 12,
};
const INCREASE_RATE = 1000;

function processedBreakedDamageReceiveRatio(attacker: KiokuState): number {
    let r = 100;
    const states = statesOf(attacker);
    for (const d of states) {
        const t = d.abilityEffectType;
        if (t === "UP_BREAKED_DAMAGE_RECEIVE_RATIO" || t === "UP_BREAK_DAMAGE_RECEIVE_RATIO") r = f32(r + f32(d.value1 / 10));
    }
    for (const d of states) {
        const t = d.abilityEffectType;
        if (t === "DWN_BREAKED_DAMAGE_RECEIVE_RATIO" || t === "DWN_BREAK_DAMAGE_RECEIVE_RATIO") r = f32(r + f32(f32(f32(d.value1 / 10) * -r) / 100));
    }
    return f32(r - 100);
}

export function increaseBreakedDamageReceiveRate(attacker: KiokuState, defender: KiokuState, detail: SkillDetail): number {
    if (!(defender.maxBreakGauge >= 1 && defender.currentRemainingBreakGauge < 1)) return 0;
    const v5: number = (detail as any).value5 ?? 0;
    const base = v5 ? f32(v5 / 10) : (ROLE_BASE[attacker.kioku.data.role] ?? 0);
    const ratio = processedBreakedDamageReceiveRatio(attacker);
    const inc = Math.floor(f32(f32(f32(INCREASE_RATE / 1000) * f32(f32(ratio / 100) + 1)) * base));
    const max = PVP_POLICY.maxBreakDamageReceiveRate / 10;
    const before = defender.breakedDamageReceiveRate;
    defender.breakedDamageReceiveRate = Math.min(before + inc, max);
    return defender.breakedDamageReceiveRate - before;
}
