/**
 * UnitStateEngine.ts
 * ===================
 * Per-unit stat accumulation ("GetProcessedX") and a few UnitState helpers, ported from
 * the game's ReDriveBattleCore (version 3.19.0, Windows x64 build).
 *
 * REVISION 5 (3.19.0) - every formula in the stat section below was re-read from the 3.19
 * decompilation (E:\unpackedExedra\3.19.0\decompiled\*.c, search the `// ==== ` headers)
 * and is now computed with the game's real number types (see BattleMath.ts):
 *   - ATK/DEF, give/receive damage, element resist: System.Decimal (emulated exactly)
 *   - crit rate/damage (Ctr/Ctd/RcvCtr/RcvCtd), weak-element ratio: float32, rounded per op
 *
 * Shared architecture, confirmed for every GetProcessedX in 3.19:
 *   result = base
 *   pass 1: for each ACTIVE state (list order) implementing the stat's interface with
 *           Addition == Up (0):   result += state.GetXVariationValue(unit, result)
 *   pass 2: same for Addition == Down (1)
 *   clamp result >= 0
 * (Buffs always before debuffs - the previous revision interleaved them in insertion order.)
 *
 * Accum ("_ACCUM_RATIO") states multiply by the CURRENT stack count (AccumCount, field
 * +0x94, starts at 1), NOT AccumCountMax (+0x90, = EffectValue2) - e.g.
 * UpAtkAccumRatioUnitState$$GetAtkVariationValue (RVA 0x16e06a0). The previous revision
 * (based on 1.5.0) used AccumCountMax, which made every accum buff/debuff act fully
 * stacked from its first application.
 *
 * Effect value: every UnitState stores (float)EffectValue1 at +0x88 in its ctor
 * (e.g. UnitStateBase-derived .ctor(AbilityEffectInfo) RVA 0x15bac90). Here that is
 * f32(detail.value1). EffectValue2 = detail.value2, TargetRole/TargetElement = detail.role/
 * detail.element, RemainCount = detail.remainCount.
 *
 * String -> class mapping: UnitStateFactory$$.cctor / AbilityEffectFactory$$.cctor
 * (full table in MISSING_AND_UNCERTAIN.md, revision 5). Notably UP_CTR_RATIO/UP_CTD_RATIO/
 * DWN_CTR_RATIO/DWN_CTD_RATIO map to the *Fixed* classes (same formula as _FIXED), and
 * there is no DWN_ATK_FIXED / DWN_DEF_FIXED / DWN_ELEMENT_RESIST_RATIO class at all.
 */

import { KiokuState, isAlimentEffect } from "./PvPTeam";
import { SkillDetail, aggro } from "../types/KiokuTypes";
import { elementMap, roleMap } from "../types/enums";
import { CsDecimal, dec, f32 } from "./BattleMath";

type StateDetail = SkillDetail & { _accumCount?: number };

// ---------------------------------------------------------------------------
// State list helpers
// ---------------------------------------------------------------------------
// [CONFIRMED] UnitStateBase$$IsActive delegates to the condition-set check already used
// elsewhere (isEffectCurrentlyActive). List order = insertion order: passives (added at
// battle start) first, then timed effects in the order they were applied.
function orderedActiveEffectsInApplicationOrder(unit: KiokuState): StateDetail[] {
    return [...unit.passiveEffectDetails.values(), ...unit.activeEffectDetails.values()]
        .filter(detail => unit.isEffectCurrentlyActive(detail));
}

// AccumCount (+0x94): current number of stacks, starts at 1 (see mergeAccumEffect).
function accumCount(detail: StateDetail): number {
    return detail._accumCount ?? 1;
}

// AccumCountMax (+0x90) = EffectValue2 (UpAtkAccumRatioUnitState$$.ctor RVA 0x16e0810).
let _warnedAccumCountMax = false;
function getAccumCountMax(detail: SkillDetail): number {
    const v = detail.value2;
    if (v == null) {
        if (!_warnedAccumCountMax) {
            console.warn("AccumCountMax (detail.value2) missing on an ACCUM effect - defaulting to 1.", detail);
            _warnedAccumCountMax = true;
        }
        return 1;
    }
    return v;
}

// Consume states only contribute while RemainCount (+0x40) > 0
// (e.g. UpAttackConsumeUnitStateBase$$GetAtkVariationValue RVA 0x16e0c50).
function hasRemainCount(detail: SkillDetail): boolean {
    return (detail.remainCount ?? 0) > 0;
}

// (decimal)(EffectValue/10f) - the float division happens first, then the float->decimal
// conversion rounds to 7 significant digits (BattleMath.CsDecimal.fromFloat).
const decTenth = (d: SkillDetail) => dec.float(f32(f32(d.value1) / 10));
const D100 = dec.int(100);
const D1000 = dec.int(1000);
const D10 = dec.int(10);

// BattleUnit.IsMatch(roleOrElement): 0 is a wildcard (UnitStateBase$$CanAddTo shape).
function unitMatchesRole(unit: KiokuState, role: number): boolean {
    return !role || roleMap[role] === unit.kioku.data.role;
}
function unitMatchesElement(unit: KiokuState, element: number): boolean {
    return !element || elementMap[element] === unit.kioku.data.element;
}

// ---------------------------------------------------------------------------
// ATK / DEF (System.Decimal)
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] BattleUnit$$GetProcessedAtkDecimal (RVA 0x1384620) /
// GetProcessedDefDecimal (0x13855b0). Base = (decimal)Param.ATK / Param.DEF (int), which is
// the unit's out-of-battle panel stat - kioku.getBaseAtk()/getBaseDef() in this codebase.
//
// Up (pass 1):
//   UP_x_RATIO           + base * ((decimal)(v/10f) / 100)                       0x16e0b10 / 0x16e2e20
//   UP_x_ACCUM_RATIO     + base * (((decimal)(v/10f) * AccumCount) / 100)        0x16e06a0 / 0x16e2c30
//   UP_x_FIXED           + (decimal)(float)v                                     0x16e0a90 / 0x16e2da0
//   UP_ATK_CONSUME_RATIO + (RemainCount > 0 ? same as RATIO : 0)                 0x16e0950
//   UP_ATK_CONSUME_FIXED + (RemainCount > 0 ? same as FIXED : 0)                 0x16e08d0
// Down (pass 2), scaled by the RUNNING value:
//   DWN_x_RATIO          - running * ((decimal)(v/10f) / 100)                    0x15bc270 / 0x15bcc90
//   DWN_x_ACCUM_RATIO    - running * (((decimal)(v/10f) * AccumCount) / 100)     0x15bbf90 / 0x15bcb40
//   DWN_ATK_CONSUME_RATIO  (RemainCount > 0 ? same as RATIO : 0)                 0x15bc150
//   WEAKNESS             - running * (10 / 100)   (IAtkVariation AND IDefVariation) 0x15d2840 / 0x15d2940
// Result clamped to >= 0.
// Not modelled: TSUBAME_LINK also implements IAtkVariation (character-specific, see
// MISSING_AND_UNCERTAIN.md).
function atkDefUp(detail: StateDetail, t: string, stat: "ATK" | "DEF", base: CsDecimal): CsDecimal | null {
    switch (t) {
        case `UP_${stat}_RATIO`: return base.mul(decTenth(detail).div(D100));
        case `UP_${stat}_ACCUM_RATIO`: return base.mul(decTenth(detail).mul(dec.int(accumCount(detail))).div(D100));
        case `UP_${stat}_FIXED`: return dec.float(f32(detail.value1));
        case `UP_${stat}_CONSUME_RATIO`: return hasRemainCount(detail) ? base.mul(decTenth(detail).div(D100)) : CsDecimal.Zero;
        case `UP_${stat}_CONSUME_FIXED`: return hasRemainCount(detail) ? dec.float(f32(detail.value1)) : CsDecimal.Zero;
    }
    return null;
}
function atkDefDown(detail: StateDetail, t: string, stat: "ATK" | "DEF", running: CsDecimal): CsDecimal | null {
    switch (t) {
        case `DWN_${stat}_RATIO`: return running.mul(decTenth(detail).div(D100)).neg();
        case `DWN_${stat}_ACCUM_RATIO`: return running.mul(decTenth(detail).mul(dec.int(accumCount(detail))).div(D100)).neg();
        case `DWN_${stat}_CONSUME_RATIO`: return hasRemainCount(detail) ? running.mul(decTenth(detail).div(D100)).neg() : CsDecimal.Zero;
        case "WEAKNESS": return running.mul(D10.div(D100)).neg();
    }
    return null;
}
function processedAtkDef(unit: KiokuState, stat: "ATK" | "DEF"): CsDecimal {
    const base = dec.int(stat === "ATK" ? unit.kioku.getBaseAtk() : unit.kioku.getBaseDef());
    const states = orderedActiveEffectsInApplicationOrder(unit);
    let result = base;
    for (const d of states) {
        const v = atkDefUp(d, d.abilityEffectType, stat, base);
        if (v) result = result.add(v);
    }
    for (const d of states) {
        const v = atkDefDown(d, d.abilityEffectType, stat, result);
        if (v) result = result.add(v);
    }
    return result.lt(CsDecimal.Zero) ? CsDecimal.Zero : result;
}
export function getProcessedAtkDecimal(unit: KiokuState): CsDecimal { return processedAtkDef(unit, "ATK"); }
export function getProcessedDefDecimal(unit: KiokuState): CsDecimal { return processedAtkDef(unit, "DEF"); }
// BattleUnit$$GetProcessedAtk / GetProcessedDef: (float)GetProcessedXDecimal()
export function getProcessedAtk(unit: KiokuState): number { return getProcessedAtkDecimal(unit).toFloat(); }
export function getProcessedDef(unit: KiokuState): number { return getProcessedDefDecimal(unit).toFloat(); }

// ---------------------------------------------------------------------------
// Crit rate / crit damage (float32)
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] BattleUnit$$GetProcessedCtr (0x1385160) / GetProcessedCtd (0x1384e40):
//   running = (float)Param.Ctr / 10f      (Param.Ctr = kioku.critRate, per-mille int)
//   Up:   UP_x_FIXED / UP_x_RATIO    + v/10f                                  0x15bbf20
//         UP_x_ACCUM_RATIO           + (v/10f) * (float)AccumCount            0x16e1ce0
//         UP_x_CONSUME_FIXED         + (RemainCount > 0 ? v/10f : 0)          0x16e1d00
//   Down: DWN_x_FIXED / DWN_x_RATIO  - ((v/10f) * running) / 100f             0x15bcac0 / 0x15bc690
//         DWN_x_ACCUM_RATIO          - (((v/10f) * running) * AccumCount) / 100f  0x15bc710
//         DWN_x_CONSUME_FIXED        (RemainCount > 0 ? same as FIXED : 0)    0x15bc9f0 / 0x15bc750
//   every operation rounded to float32; result clamped >= 0.
function critUp(d: StateDetail, t: string, stat: "CTR" | "CTD"): number | null {
    const tenth = () => f32(f32(d.value1) / 10);
    switch (t) {
        case `UP_${stat}_FIXED`: case `UP_${stat}_RATIO`: return tenth();
        case `UP_${stat}_ACCUM_RATIO`: return f32(tenth() * f32(accumCount(d)));
        case `UP_${stat}_CONSUME_FIXED`: return hasRemainCount(d) ? tenth() : 0;
    }
    return null;
}
function critDown(d: StateDetail, t: string, stat: "CTR" | "CTD", running: number): number | null {
    const tenth = () => f32(f32(d.value1) / 10);
    const fixed = () => -f32(f32(tenth() * running) / 100);
    switch (t) {
        case `DWN_${stat}_FIXED`: case `DWN_${stat}_RATIO`: return fixed();
        case `DWN_${stat}_ACCUM_RATIO`: return -f32(f32(f32(tenth() * running) * f32(accumCount(d))) / 100);
        case `DWN_${stat}_CONSUME_FIXED`: return hasRemainCount(d) ? fixed() : 0;
    }
    return null;
}
function processedCrit(unit: KiokuState, stat: "CTR" | "CTD"): number {
    let running = f32(f32(stat === "CTR" ? unit.kioku.critRate : unit.kioku.critDamage) / 10);
    const states = orderedActiveEffectsInApplicationOrder(unit);
    for (const d of states) {
        const v = critUp(d, d.abilityEffectType, stat);
        if (v !== null) running = f32(running + v);
    }
    for (const d of states) {
        const v = critDown(d, d.abilityEffectType, stat, running);
        if (v !== null) running = f32(running + v);
    }
    return running < 0 ? 0 : running;
}
// Both return a PERCENT as float32 (e.g. 15.5 = 15.5%).
export function getProcessedCtr(unit: KiokuState): number { return processedCrit(unit, "CTR"); }
export function getProcessedCtd(unit: KiokuState): number { return processedCrit(unit, "CTD"); }

// [CONFIRMED 3.19] BattleUnit$$GetProcessedRcvCtr (0x1386ed0): extra crit rate an attacker
// gets against this unit. Base 0, Up then Down pass, clamp >= 0. Only one class exists:
// UP_RCV_CTR_RATIO -> + v/10f (0x15bbf20). The attacker is passed to the state's variation
// method but UpRcvCtrRatioUnitState ignores it.
export function getProcessedRcvCtr(defender: KiokuState, _attacker: KiokuState): number {
    let running = 0;
    for (const d of orderedActiveEffectsInApplicationOrder(defender)) {
        if (d.abilityEffectType === "UP_RCV_CTR_RATIO") running = f32(running + f32(f32(d.value1) / 10));
    }
    return running < 0 ? 0 : running;
}
// [CONFIRMED 3.19, NEW] BattleUnit$$GetProcessedRcvCtd (0x1386cf0): extra crit DAMAGE an
// attacker deals to this unit. Only an Up pass exists. UP_RCV_CTD_RATIO -> + v/10f.
export function getProcessedRcvCtd(defender: KiokuState, _attacker: KiokuState): number {
    let running = 0;
    for (const d of orderedActiveEffectsInApplicationOrder(defender)) {
        if (d.abilityEffectType === "UP_RCV_CTD_RATIO") running = f32(running + f32(f32(d.value1) / 10));
    }
    return running < 0 ? 0 : running;
}

// ---------------------------------------------------------------------------
// Give / receive damage variations (System.Decimal) - used by DamageCalculator.ts
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] DamageVariationUnitStateBase$$GetDamageVariationValue (0x16cfa40), the
// default for every *_GIV_DMG_* / *_RCV_DMG_* state:
//   Calculation Ratio (all current classes): basis * ((decimal)(float)v / 1000)
//       basis = damageValue (the step's INPUT damage) for Addition Up,
//               processingValue (the RUNNING damage) for Addition Down
//   Addition Down negates the result.
// Overrides:
//   UP_GIV_DMG_ACCUM_RATIO   + damageValue * (((decimal)(v/10f) * AccumCount) / 100)       0x15d0b20
//   DWN_GIV_DMG_ACCUM_RATIO  - processing  * (((decimal)(v/10f) * AccumCount) / 100)       0x15bd760
//   *_CONSUME_RATIO          default formula, only while RemainCount > 0                  0x15d0c50 / 0x15bd8b0
//   *_AIM_GIV_*              default formula, only if the DEFENDER matches the state's role/element (0x15cf360)
//   *_AIM_RCV_*              default formula, only if the ATTACKER matches the state's role/element (0x15b85d0)
// Addition per class: Up* = Up (0), Dwn* = Down (1). UP_RCV_DMG_RATIO is Up on the
// DEFENDER (more damage taken), DWN_RCV_DMG_RATIO Down.
export type Addition = "Up" | "Down";
const GIVE_DMG_CLASSES: Record<string, Addition> = {
    UP_GIV_DMG_RATIO: "Up", DWN_GIV_DMG_RATIO: "Down",
    UP_GIV_DMG_ACCUM_RATIO: "Up", DWN_GIV_DMG_ACCUM_RATIO: "Down",
    UP_GIV_DMG_CONSUME_RATIO: "Up", DWN_GIV_DMG_CONSUME_RATIO: "Down",
    UP_AIM_GIV_DMG_RATIO: "Up", DWN_AIM_GIV_DMG_RATIO: "Down",
    // [RECONSTRUCTED] CpnUpGivDmgRatioUnitState: campaign-only (quest field bonus); treated as a
    // plain Up ratio. Never present in PvP.
    CPN_UP_GIV_DMG_RATIO: "Up",
};
const RECEIVE_DMG_CLASSES: Record<string, Addition> = {
    UP_RCV_DMG_RATIO: "Up", DWN_RCV_DMG_RATIO: "Down",
    UP_AIM_RCV_DMG_RATIO: "Up", DWN_AIM_RCV_DMG_RATIO: "Down",
};

function defaultDamageVariation(d: StateDetail, addition: Addition, damageValue: CsDecimal, processing: CsDecimal): CsDecimal {
    const basis = addition === "Up" ? damageValue : processing;
    const v = basis.mul(dec.float(f32(d.value1)).div(D1000));
    return addition === "Up" ? v : v.neg();
}

export function giveDamageVariation(d: StateDetail, attacker: KiokuState, defender: KiokuState, damageValue: CsDecimal, processing: CsDecimal): { addition: Addition, value: CsDecimal } | null {
    const t = d.abilityEffectType;
    const addition = GIVE_DMG_CLASSES[t];
    if (!addition) return null;
    let value: CsDecimal;
    if (t === "UP_GIV_DMG_ACCUM_RATIO") value = damageValue.mul(decTenth(d).mul(dec.int(accumCount(d))).div(D100));
    else if (t === "DWN_GIV_DMG_ACCUM_RATIO") value = processing.mul(decTenth(d).mul(dec.int(accumCount(d))).div(D100)).neg();
    else if (t.endsWith("_CONSUME_RATIO") && !hasRemainCount(d)) value = CsDecimal.Zero;
    else if (t.includes("_AIM_") && !(unitMatchesRole(defender, (d as any).role) && unitMatchesElement(defender, d.element))) value = CsDecimal.Zero;
    else value = defaultDamageVariation(d, addition, damageValue, processing);
    void attacker;
    return { addition, value };
}

export function receiveDamageVariation(d: StateDetail, attacker: KiokuState, damageValue: CsDecimal, processing: CsDecimal): { addition: Addition, value: CsDecimal } | null {
    const t = d.abilityEffectType;
    const addition = RECEIVE_DMG_CLASSES[t];
    if (!addition) return null;
    if (t.includes("_AIM_") && !(unitMatchesRole(attacker, (d as any).role) && unitMatchesElement(attacker, d.element))) return { addition, value: CsDecimal.Zero };
    return { addition, value: defaultDamageVariation(d, addition, damageValue, processing) };
}

// [CONFIRMED 3.19] UpElementDmgRateRatioUnitState$$GetElementDamageRateVariationValue
// (0x16e3d70): (decimal)(float)v / 10 if the state's element is 0 or equals the attack
// element, else 0. GetProcessedGiveDamage then adds damage * (rate / 100).
// [RECONSTRUCTED] DWN_ELEMENT_DMG_RATE_RATIO (0x15bcdb0) has the same element gate; its
// sign is assumed negative (the down variant) - not independently read.
export function elementDamageRateVariation(d: StateDetail, attackElement: number): CsDecimal | null {
    const t = d.abilityEffectType;
    if (t !== "UP_ELEMENT_DMG_RATE_RATIO" && t !== "DWN_ELEMENT_DMG_RATE_RATIO") return null;
    if (d.element && d.element !== attackElement) return CsDecimal.Zero;
    const v = dec.float(f32(d.value1)).div(D10);
    return t.startsWith("UP_") ? v : v.neg();
}

// [RECONSTRUCTED 3.19] IGiveSlipDamageVariation (UpGiveSlipDamageUnitStateBase /
// DownGiveSlipDamageUnitStateBase): applies only to DOT ticks, gated by IsTarget(slip
// state type) - UP_GIV_SLIP_DMG_RATIO targets every DOT, UP_GIV_BURN_DMG_RATIO only Burn,
// etc. (0x16e48a0 / 0x16e4720). Rate = (decimal)(float)v / 10 (0x16e4b70); applied as
// damageValue * rate / 100 by analogy with the element-rate path (the exact slot-2 method
// body was not read).
const SLIP_GIVE_TARGET: Record<string, string | null> = {
    UP_GIV_SLIP_DMG_RATIO: null, DWN_GIV_SLIP_DMG_RATIO: null,
    UP_GIV_BURN_DMG_RATIO: "BURN", DWN_GIV_BURN_DMG_RATIO: "BURN",
    UP_GIV_POISON_DMG_RATIO: "POISON", DWN_GIV_POISON_DMG_RATIO: "POISON",
    UP_GIV_CURSE_DMG_RATIO: "CURSE", DWN_GIV_CURSE_DMG_RATIO: "CURSE",
    UP_GIV_BLEED_DMG_RATIO: "BLEED", DWN_GIV_BLEED_DMG_RATIO: "BLEED",
    UP_GIV_VORTEX_DMG_RATIO: "VORTEX", DWN_GIV_VORTEX_DMG_RATIO: "VORTEX",
};
export function slipGiveDamageVariation(d: StateDetail, slipEffectType: string, damageValue: CsDecimal, processing: CsDecimal): { addition: Addition, value: CsDecimal } | null {
    const t = d.abilityEffectType;
    if (!(t in SLIP_GIVE_TARGET)) return null;
    const family = SLIP_GIVE_TARGET[t];
    const addition: Addition = t.startsWith("UP_") ? "Up" : "Down";
    if (family && !slipEffectType.startsWith(family)) return { addition, value: CsDecimal.Zero };
    const rate = dec.float(f32(d.value1)).div(D10).div(D100);
    return addition === "Up" ? { addition, value: damageValue.mul(rate) } : { addition, value: processing.mul(rate).neg() };
}

export function statesOf(unit: KiokuState): StateDetail[] {
    return orderedActiveEffectsInApplicationOrder(unit);
}

// ---------------------------------------------------------------------------
// Element resist (System.Decimal)
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] BattleUnit$$GetProcessedElementResistRate (0x13864c0):
//   rate = Param.ElementResistRates[element].value / 10     (0 for player characters - no
//          such per-character data exists in base_data; enemies have it)
//        + Σ active IElementResistVariation(unit, element)
//   clamp to [-999, 999]
// Variations (element gate: state element 0 or == attack element):
//   UP_ELEMENT_RESIST_RATIO         + (decimal)(float)v / 10                   0x16e41f0
//   UP_ELEMENT_RESIST_ACCUM_RATIO   + ((decimal)(float)v / 10) * AccumCount    0x16e3fb0
//   DWN_ELEMENT_RESIST_ACCUM_RATIO  - ((decimal)(float)v / 10) * AccumCount    0x15bd020
// (No DWN_ELEMENT_RESIST_RATIO class exists in 3.19, and no such row exists in 3.18 data.)
export function getProcessedElementResistRate(defender: KiokuState, element: number, intrinsic: CsDecimal = CsDecimal.Zero): CsDecimal {
    let rate = intrinsic;
    for (const d of orderedActiveEffectsInApplicationOrder(defender)) {
        const t = d.abilityEffectType;
        if (t !== "UP_ELEMENT_RESIST_RATIO" && t !== "UP_ELEMENT_RESIST_ACCUM_RATIO" && t !== "DWN_ELEMENT_RESIST_ACCUM_RATIO") continue;
        if (d.element && d.element !== element) continue;
        let v = dec.float(f32(d.value1)).div(D10);
        if (t !== "UP_ELEMENT_RESIST_RATIO") v = v.mul(dec.int(accumCount(d)));
        rate = rate.add(t.startsWith("DWN_") ? v.neg() : v);
    }
    return CsDecimal.clamp(rate, dec.int(-999), dec.int(999));
}

// ---------------------------------------------------------------------------
// Weak-element damage ratio (float32) - used by CorrelationEffect in DamageCalculator.ts
// ---------------------------------------------------------------------------
// [CONFIRMED 3.19] CorrelationEffect$$.ctor (0x1493f80): on a weak hit the ratio starts at
// 1.2f and every active state that IS-A UpWeakElementDmgRatioUnitState adds
// get_UpRatio() / 100f, in float32:
//   UP_WEAK_ELEMENT_DMG_RATIO          v/10f                         0x15bbf20
//   UP_WEAK_ELEMENT_DMG_ACCUM_RATIO    (v/10f) * (float)AccumCount   0x16e1ce0
//   UP_WEAK_ELEMENT_DMG_CONSUME_RATIO  RemainCount > 0 ? v/10f : 0   0x16e1d00
export function weakElementUpRatios(attacker: KiokuState): number[] {
    const out: number[] = [];
    for (const d of orderedActiveEffectsInApplicationOrder(attacker)) {
        const tenth = f32(f32(d.value1) / 10);
        switch (d.abilityEffectType) {
            case "UP_WEAK_ELEMENT_DMG_RATIO": out.push(tenth); break;
            case "UP_WEAK_ELEMENT_DMG_ACCUM_RATIO": out.push(f32(tenth * f32(accumCount(d)))); break;
            case "UP_WEAK_ELEMENT_DMG_CONSUME_RATIO": out.push(hasRemainCount(d) ? tenth : 0); break;
        }
    }
    return out;
}

// [CONFIRMED 3.19] ShieldUnitState$$.ctor (0x16d7dd0): ratio = (float)v / 1000f.
export function activeShieldRatios(defender: KiokuState): number[] {
    return orderedActiveEffectsInApplicationOrder(defender)
        .filter(d => d.abilityEffectType === "SHIELD")
        .map(d => f32(f32(d.value1) / 1000));
}

// [CONFIRMED 3.19] RcvFinalDamageUnitState: ratio = (decimal)v / 1000 (.ctor 0x16d6100),
// counted only if the ATTACKER matches the state's role/element (GetFinalDamageRatio 0x16d5e80).
export function getFinalDamageRatio(defender: KiokuState, attacker: KiokuState): CsDecimal {
    let sum = CsDecimal.Zero;
    for (const d of orderedActiveEffectsInApplicationOrder(defender)) {
        if (d.abilityEffectType !== "RCV_FINAL_DAMAGE") continue;
        if (!(unitMatchesRole(attacker, (d as any).role) && unitMatchesElement(attacker, d.element))) continue;
        sum = sum.add(dec.int(d.value1).div(D1000));
    }
    return sum;
}

// Plain /1000 sum used by the (not yet re-verified for 3.19) hit/parry-rate helpers below.
function sumRatioTypes(unit: KiokuState, types: string[], scale: number): number {
    let sum = 0;
    for (const detail of orderedActiveEffectsInApplicationOrder(unit)) {
        if (types.includes(detail.abilityEffectType)) sum += detail.value1 / scale;
    }
    return sum;
}

// ---------------------------------------------------------------------------
// AI target-selection "threat"/hate weight
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.AI.AISkillTargetSelector$$GetUnitWeightDic, decompiled
// byte-for-byte. The FULL AUTO damage-targeting AI (see AITargetSelector.ts) picks its
// final target with a weighted random roll where each candidate's weight is:
//
//     weight = roleWeightDict[unit.RoleType] + (withHate ? sum(active IHateVariation
//              state values on unit) : 0), clamped to a floor of 0 (Math.Max(w, 0))
//
// `roleWeightDict` is a static Dictionary<RoleType,int> built in AISkillTargetSelector's
// own .cctor: Defender=15, Healer/Buffer/Debuffer=10, Attacker/Breaker=5 - which is an
// EXACT match for the `aggro` map already in KiokuTypes.ts (Defender 15 / Healer,Buffer,
// Debuffer 10 / Attacker,Breaker 5), confirming that table was already correct - it just
// wasn't being consulted for anything. GetUnitWeightDic is always called with
// withHate=true by every concrete AbilityEffect that uses it (DamageAbilityEffectBase),
// so the `withHate` parameter isn't exposed here; if a withHate=false call site is ever
// needed, add a parameter.
//
// The "sum of active IHateVariation states" half: no UnitState class in the provided
// BattleUnit.c dump was seen literally implementing `IHateVariation` (the dump doesn't
// include every UnitState's full interface list), but UP_HATE/DWN_HATE are the only two
// hate-shaped effect types in the confirmed 93-entry UnitStateFactory dispatch table
// (see MISSING_AND_UNCERTAIN.md), and UP_HATE was already marked [CONFIRMED]
// [IMPLEMENTED] "flat add to aggro" before this pass. Summed here using the same signed
// UP_/DWN_ convention as every other paired buff/debuff in this file (see
// accumulateVariation's `isUp` pattern) - value1 is a plain, unscaled int (confirmed:
// AbilityEffectInfo.EffectValue1 is `int`, not a /1000 or /10 ratio), matching
// CompareContent.CHARGE_POINT's sibling read of `currentMagic` also being unscaled.
export function getThreatWeight(unit: KiokuState): number {
    let weight = aggro[unit.kioku.data.role];
    for (const d of orderedActiveEffectsInApplicationOrder(unit)) {
        if (d.abilityEffectType === "UP_HATE") weight += d.value1;
        else if (d.abilityEffectType === "DWN_HATE") weight -= d.value1;
    }
    return Math.max(weight, 0);
}

// ---------------------------------------------------------------------------
// COMBO: multiple actions per turn
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitCondition$$GetMaximumActionNumComboUnitState: scans
// StateList for active ComboUnitState instances and returns the one with the HIGHEST
// ActionNum (strict `>`, ties keep whichever was found first) - i.e. multiple active
// COMBO effects do NOT stack additively, only the single largest one counts. Confirmed
// against real data: `value1` is the action count directly (a sample skill description
// reads literally "Grants 2 actions." with value1=2). ComboUnitState.GetActionNum just
// returns its own stored field with no further transformation. Used from
// ReDriveBattleCore.TurnActSystem$$Forward, which treats anything below 2 as "no combo,
// do a normal single action" (see useAttackOrSkill in PvPTeam.ts for where this plugs
// into the turn loop).
export function getMaxComboActionNum(unit: KiokuState): number {
    let max = 1;
    for (const d of orderedActiveEffectsInApplicationOrder(unit)) {
        if (d.abilityEffectType === "COMBO" && d.value1 > max) max = d.value1;
    }
    return max;
}

// ---------------------------------------------------------------------------
// Probability-roll-to-apply (buff/debuff/aliment "hit chance")
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitCondition$$AddUnitState - the method that actually
// adds a UnitState (buff/debuff/aliment) to a unit's condition - opens with a probability
// roll that can silently fail the ENTIRE application, before anything else happens:
//
//     float probability = state.GetProcessedProbability(targetUnit, userUnit);
//     int roll = new Random().Next(1000);                    // integer, 0-999
//     if (probability * 10.0f <= (float)roll) return false;   // FAILED - nothing applied
//
// This governs every one of the ~93 UnitState-backed effect types (ordinary buffs,
// debuffs, shields, barriers, aliments/status effects). It does NOT apply to the ~27
// AbilityEffectFactory-special types (damage, charge, EP/HP, revival, haste/slow,
// remove-all-X, etc.) - none of those showed a probability roll in their own decompiled
// Triggering methods when read; they mutate state directly. This lines up exactly with
// this codebase's existing split between applyEffect's own direct branches and
// storeTimedEffect (the stand-in for "add a UnitState"), which is exactly the set this
// roll should gate - see storeTimedEffect's own call to rollAppliesEffect.
//
// GetProcessedProbability (UnitStateBase$$GetProcessedProbability), [CONFIRMED]:
//     hitRate    = userUnit != null ? userUnit.GetTotalEffectHitRate(state) : 1.0
//     parryRate  = targetUnit.GetTotalEffectParryRate(state)
//     secondary  = targetUnit.GetTotalSecondaryEffectParryRate(state)
//     result     = Floor(secondary * parryRate * hitRate * state.Probability, 2 decimals)
//     return Clamp(result, 0, 100)
//
// GetTotalEffectHitRate (BattleUnit$$GetTotalEffectHitRate), [CONFIRMED shape]:
//     rate = 0
//     if (<a vtable condition on the state not fully identified>) rate += GetProcessedEffectHitRate()   // this unit's own accumulated UP_EFFECT_HIT_RATE_RATIO-style bonus
//     if (state is AbnormalUnitStateBase) rate += GetAllAbnormalHitRate() / 100              // additional bonus, aliments only
//     return Max(rate + 1, 0)
//
// GetTotalEffectParryRate (BattleUnit$$GetTotalEffectParryRate), [CONFIRMED shape]:
//     rate = <same vtable condition> ? GetProcessedEffectParryRate() : 0
//     return Clamp(1 - rate, 0, 1)
//
// GetTotalSecondaryEffectParryRate (BattleUnit$$GetTotalSecondaryEffectParryRate),
// [CONFIRMED shape, NOT fully implemented here - see below]:
//     rate = 0
//     if (state is StunUnitState) rate += Condition.RepeatStunParryRate / 100   // an
//         accumulating anti-stun-lock resistance that builds up after being stunned -
//         CONFIRMED TO EXIST but this port has no model of when/how RepeatStunParryRate
//         itself increases (that lives in whatever code runs when a stun actually lands
//         or expires, which wasn't located in this pass)
//     if (state is AbnormalUnitStateBase) rate += GetAbnormalParryRate(state) +
//         GetAllAbnormalParryRate() / 100   // a PER-ALIMENT-TYPE resistance
//         (GetAbnormalParryRate) stacked with a general one - this port only models the
//         general one (as UP_ABNORMAL_PARRY_RATE_RATIO), not a per-type breakdown
//     return Clamp(1 - rate, 0, 1)
//
// [RECONSTRUCTED] The bodies of GetProcessedEffectHitRate/GetProcessedEffectParryRate/
// GetAllAbnormalHitRate/GetAllAbnormalParryRate/GetAbnormalParryRate themselves weren't
// decompiled - approximated here using this file's own established ratio-accumulation
// convention (sum of active UP_EFFECT_HIT_RATE_RATIO / UP_EFFECT_PARRY_RATE_RATIO /
// UP_ABNORMAL_HIT_RATE_RATIO / UP_ABNORMAL_PARRY_RATE_RATIO, each value1/1000) rather than
// guessed from nothing, but the exact internals, the per-aliment-type breakdown, and the
// repeat-stun resistance are confirmed to exist and NOT modeled here.
//
// `isFixedProbability` (a real field on SkillDetail, confirmed present in the actual game
// data) is read here as "skip all of the above, use the base `probability` value
// directly" - not decompiled, but the only reading of "Fixed" that makes sense paired
// with a hit/parry-modifiable default.
function getTotalEffectHitRate(caster: KiokuState, isAliment: boolean): number {
    let rate = sumRatioTypes(caster, ["UP_EFFECT_HIT_RATE_RATIO"], 1000);
    if (isAliment) rate += sumRatioTypes(caster, ["UP_ABNORMAL_HIT_RATE_RATIO"], 1000);
    return Math.max(rate + 1, 0);
}
function getTotalEffectParryRate(target: KiokuState): number {
    const rate = sumRatioTypes(target, ["UP_EFFECT_PARRY_RATE_RATIO"], 1000);
    return Math.min(Math.max(1 - rate, 0), 1);
}
function getTotalSecondaryEffectParryRate(target: KiokuState, isAliment: boolean): number {
    if (!isAliment) return 1;
    const rate = sumRatioTypes(target, ["UP_ABNORMAL_PARRY_RATE_RATIO"], 1000);
    return Math.min(Math.max(1 - rate, 0), 1);
}

/**
 * [CONFIRMED formula, RECONSTRUCTED rate internals - see block comment above] Rolls
 * whether a buff/debuff/aliment application succeeds at all. `caster` is the unit
 * applying the effect (its hit-rate bonuses apply); `target` is the unit it's being
 * applied to (its parry/resist bonuses apply). Returns true = applies normally.
 */
export function rollAppliesEffect(detail: SkillDetail, caster: KiokuState | undefined, target: KiokuState, rng: () => number = Math.random): boolean {
    if (detail.isFixedProbability) {
        return rng() * 100 < detail.probability;
    }
    const isAliment = isAlimentEffect(detail.abilityEffectType);
    const hitRate = caster ? getTotalEffectHitRate(caster, isAliment) : 1;
    const parryRate = getTotalEffectParryRate(target);
    const secondaryParryRate = getTotalSecondaryEffectParryRate(target, isAliment);
    const finalProbability = Math.min(Math.max(hitRate * parryRate * secondaryParryRate * detail.probability, 0), 100);
    return rng() * 1000 < finalProbability * 10;
}

// ---------------------------------------------------------------------------
// Generic buff/debuff target eligibility: element/role filters
// ---------------------------------------------------------------------------
// [CONFIRMED] ScoreAttackTeam.ts's buff-distribution loop filters every buff/debuff by
// `detail.element` and `detail.role` against the RECIPIENT's own character data before
// applying it at all:
//     if (detail.element && elementMap[detail.element] !== targetCtx.kioku.data.element) continue;
//     if (detail.role && roleMap[detail.role] !== targetCtx.kioku.data.role) continue;
// This is a GENERIC eligibility gate (e.g. "only Flame characters get this buff", "only
// Attackers get this buff") that applies BEFORE any ability-effect-type-specific logic,
// and applies to every buff/debuff type uniformly - not something the revision-1 port
// implemented at all (no element/role filtering existed anywhere). Exported so
// PvPTeam.ts's applyEffect can gate target eligibility the same way for every effect,
// not just the ones this file happens to compute stats for.
export function isEligibleForEffect(detail: SkillDetail, target: KiokuState): boolean {
    if (detail.element && elementMap[detail.element] !== target.kioku.data.element) return false;
    if ((detail as any).role && roleMap[(detail as any).role] !== target.kioku.data.role) return false;
    return true;
}

// ---------------------------------------------------------------------------
// IAccum stacking / merge logic
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitState.IAccum$$Accumulate - see file header for the
// full decoded algorithm. `existingAccumCount` is tracked as an extra property on the
// stored SkillDetail (not present in the original C# field layout since IAccum lives on
// the class instance itself, but this JS port stores effects as plain data records, so
// the count needs a home - I've added it as `._accumCount` directly on the stored
// object rather than inventing a parallel Map, to keep call sites simple).
//
// Returns true if the new application was merged/accepted (caller should NOT add a
// second independent copy), false if it was rejected outright (old one keeps ticking
// unchanged).
export function mergeAccumEffect(existing: SkillDetail & { _accumCount?: number }, incoming: SkillDetail): boolean {
    const existingMax = getAccumCountMax(existing);
    const incomingMax = getAccumCountMax(incoming);
    const existingCount = existing._accumCount ?? 1;

    if (existing.value1 === incoming.value1 && existingMax === incomingMax) {
        if (existingCount < existingMax) {
            existing._accumCount = existingCount + 1;
        }
        (existing as any).turn = incoming.turn; // refresh remaining duration
        return true;
    }

    // Not an exact match: only replace if the incoming one is "at least as good".
    if (incoming.value1 <= existing.value1) {
        if (existing.value1 !== incoming.value1) return false; // strictly worse - reject
        if (incomingMax <= existingMax) return false; // same value1, not a bigger cap - reject
    }

    // Replace in place.
    existing.value1 = incoming.value1;
    existing.value2 = incoming.value2;
    (existing as any).turn = incoming.turn;
    existing._accumCount = 1;
    return true;
}
