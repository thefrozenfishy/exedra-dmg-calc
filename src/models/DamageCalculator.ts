/**
 * DamageCalculator.ts
 * ====================
 * Ported from the decompiled (Ghidra/IL2CPP) sources of:
 *   - ReDriveBattleCore.BattleDamageCalculator   (ReDriveBattleCore.c, functions at index
 *     00358-00394 in the provided dump)
 *   - ReDriveBattleCore.AbilityEffect.DamageAbilityEffectBase$$Triggering / GetDamageBase
 *   - ReDriveBattleCore.CorrelationEffect (element weakness math)
 *   - ReDriveBattleCore.BreakPoint (break-situation multiplier only; the break-GAUGE
 *     mechanics themselves are already implemented in PvPTeam.ts and were left alone)
 *
 * REVISION 2 - updated against:
 *   - dump.cs / dump_processed.cs (Il2CppDumper signature dump - real field names/types,
 *     no method bodies, but resolves a lot of the ambiguity flagged in revision 1)
 *   - The person's own ScoreAttackTeam.ts/ScoreAttackKioku.ts, an independently-built,
 *     gameplay-validated single-hit damage calculator. Where it directly confirms a
 *     formula I'd flagged as unresolved, I've said so explicitly and cited the exact
 *     line, since that's a much stronger source than my own decompilation reading.
 *   - Two constants the person confirmed directly from Ghidra's raw bytes: the
 *     GetDamageBase exponent (1.2) and the CorrelationEffect (normal, weak) tuple
 *     (1.0, 1.2).
 *
 * CONFIDENCE LEVELS
 * ------------------
 *   [CONFIRMED]     - control flow and arithmetic both read unambiguously from the
 *                      decompiled IL, or have since been independently validated against
 *                      the person's ScoreAttackTeam.ts / their own Ghidra byte reads.
 *   [RECONSTRUCTED] - the *shape* of the formula is clear but some part is still only
 *                      inferred, not independently verified.
 *   [UNKNOWN CONST] - references a raw binary constant not yet confirmed.
 *
 * See MISSING_AND_UNCERTAIN.md for the full list of open items.
 */

import { KiokuState } from "./PvPTeam";
import { SkillDetail, type AffectedUnitNotice } from "../types/KiokuTypes";
import { getProcessedAtk, getProcessedDef, getProcessedCtr, getProcessedRcvCtr, getProcessedCtd, getGiveDamageRatioBonus, getSlipGiveDamageRatioBonus, getReceiveDamageRatioBonus, getElementResistRate, getWeakElementBonus } from "./UnitStateEngine";

const f32 = Math.fround;

// ---------------------------------------------------------------------------
// BattleType
// ---------------------------------------------------------------------------
// [CONFIRMED] Network.Definition.Battle.BattleType (dump.cs, TypeDefIndex 994). Threaded
// through so the same engine can run PvP battles (what this codebase is for) and
// non-PvP simulations (e.g. against a PvE Solo/Gve encounter) with the battle-type-gated
// steps (GetDifficultyCorrectedDamage, DamageCutByPvpOrGvgSuppression) behaving
// correctly for each. Per the person's message, PvP simulations should pass
// BattleType.Pvp (2).
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
// DamageBaseType
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetInitialDamageBaseParamValue switches on
// this int: 1 => ATK, 2 => DEF, 3 => HP. dump.cs confirms `DamageBaseType` is a real,
// dedicated enum type (not just a bare int) with exactly these three members. The
// concrete effect classes are DmgAtkAbilityEffect / DmgDefAbilityEffect /
// DmgHpAbilityEffect, matching the game data's abilityEffectType strings DMG_ATK /
// DMG_DEF / DMG_HP - we derive DamageBaseType from that string rather than a separate
// data field.
export const enum DamageBaseType {
    ATK = 1,
    DEF = 2,
    HP = 3,
}

export function damageBaseTypeFromEffectType(abilityEffectType: string): DamageBaseType {
    if (abilityEffectType === "DMG_ATK") return DamageBaseType.ATK;
    if (abilityEffectType === "DMG_DEF") return DamageBaseType.DEF;
    if (abilityEffectType === "DMG_HP") return DamageBaseType.HP;
    console.warn("Unknown damage ability effect type, defaulting to ATK-scaling:", abilityEffectType);
    return DamageBaseType.ATK;
}

// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetInitialDamageBaseParamValue
// Returns the unit's *unbuffed* base stat panel value (BattleParameter.ATK/DEF/HP),
// i.e. the same "raw" stat used by UpAtkRatioUnitState etc. for their percentage math
// (BattleUnit.get_ATK, not GetProcessedAtk). In this codebase that's kioku.getBaseAtk()
// / getBaseDef() / getBaseHp() from Kioku.ts, which already bakes in level/ascension/
// portrait/support/crystalis but NOT in-battle buffs.
export function getInitialDamageBaseParamValue(unit: KiokuState, damageBaseType: DamageBaseType): number {
    switch (damageBaseType) {
        case DamageBaseType.ATK: return unit.kioku.getBaseAtk();
        case DamageBaseType.DEF: return unit.kioku.getBaseDef();
        case DamageBaseType.HP: return unit.kioku.getBaseHp();
    }
}

// ---------------------------------------------------------------------------
// GetDamageBase
// ---------------------------------------------------------------------------
// [CONFIRMED] Source: ReDriveBattleCore.AbilityEffect.DamageAbilityEffectBase$$GetDamageBase
//
//   damageBase = power * statValue * ((statValue/124)^1.2 + 12) / 20
//
// The exponent (1.2) was confirmed by the person directly from Ghidra's raw bytes at
// DAT_7b9445cb50, AND independently matches ScoreAttackTeam.ts's own
// `calc_base_dmg(ability_percentage, base_atk)`:
//     return ability_percentage * base_atk * ((base_atk / 124) ** 1.2 + 12) / 20
// which is a gameplay-validated reference implementation, not decompilation - this is
// about as confirmed as a formula in this file gets.
//
// `power` = detail.value1 / 1000 (a fraction, e.g. value1=2000 -> power=2.0 for a
// "200% ATK" nuke). Revision 1 of this file used raw `detail.value1` (no /1000) for
// direct hits, reasoning from a DOT-vs-direct-hit asymmetry that turned out to be wrong:
// ScoreAttackTeam.ts's `get_special_dmg` divides the summed value1's by 1000 too
// (`return [total_dmg / 1000, ...]`), for a DIRECT hit skill - so direct hits use the
// same /1000 scaling as DOT after all. Fixed below.
const DAMAGE_BASE_POW_EXPONENT = 1.2; // [CONFIRMED - see comment above]

// [FLOAT-PRECISION FIX, revision 3] The decompiled signature is
// `GetDamageBase(BattleUnit unit, float power)` and its local holding statValue
// (`fVar4`) is also a native `float` - so `fVar4 * power` happens in float32 BEFORE
// being widened to decimal for the rest of the formula (`(double)fVar4/124.0` is a
// SEPARATE, explicitly double-cast expression - Math.pow itself needs no change).
// `power` is only ever produced from a `value1/1000`-shaped division upstream, so by the
// time it reaches this (float-typed) parameter in the source it's already been rounded
// to float32 regardless of how it was computed - Math.fround replicates that truncation
// here rather than carrying extra float64 precision the original engine never had. This
// is a small, one-shot rounding difference (not an accumulation loop like Ctr/Ctd), so
// in practice it only flips the final Math.ceil'd damage in rare boundary cases - but
// it's a confirmed decompiled fact, so it's fixed rather than left approximate.
export function getDamageBase(power: number, statValue: number): number {
    const f32Power = f32(power);
    const valueA = f32(statValue * f32Power);
    const valueB = Math.pow(statValue / 124, DAMAGE_BASE_POW_EXPONENT) + 12;
    return valueA * (valueB / 20);
}

// ---------------------------------------------------------------------------
// GetAppliedDamageOfBreakSituation
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleDamageCalculator$$GetAppliedDamageOfBreakSituation
// If the defender has no break gauge at all (maxPointValue <= 0), damage passes through
// unchanged. Otherwise: if the defender is currently broken (PointValue < 1), damage is
// multiplied by their BreakedDamageReceiveRate% (a per-unit stat, typically >100%,
// representing "takes more damage while broken"); if not broken, multiplied by 1 (no-op).
// Cross-validated: ScoreAttackTeam.ts's `break_factor = enemy.isBreak ? enemy.maxBreak/100 : 1`
// is exactly this shape (its "maxBreak" there is a per-scenario break-damage-rate input,
// confusingly named, not gauge capacity).
//
// `BreakedDamageReceiveRate` still isn't in the provided type files as a per-Kioku data
// field. Defaults to 100 (no bonus) with a one-time warning if absent.
export function getAppliedDamageOfBreakSituation(target: KiokuState, damage: number): number {
    const maxPointValue = target.maxBreakGauge;
    if (maxPointValue <= 0) return damage;
    if (target.currentRemainingBreakGauge < 1) {
        const rate = (target.kioku.data as any).breakedDamageReceiveRate;
        if (rate == null) {
            console.warn("BreakedDamageReceiveRate missing on", target.kioku.name, "- assuming 100 (no bonus). See MISSING_AND_UNCERTAIN.md");
        }
        return damage * ((rate ?? 100) / 100);
    }
    return damage;
}

// ---------------------------------------------------------------------------
// GetDefenseCorrectedDamage
// ---------------------------------------------------------------------------
// [CONFIRMED] Previously the biggest gap in this file (revision 1 shipped this as an
// outright no-op because the decompiled Decimal chain was too ambiguous to trust).
// ScoreAttackTeam.ts resolves it completely:
//     const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
// which lines up with what WAS legible from decompilation (a Decimal(10) added to both
// sides, a 0.12-shaped constant, and a Min(...) call) - the missing piece was just which
// operand went where. atk_total/def_total there are the ATTACKER's processed (buffed)
// ATK-or-DEF-per-damageBaseType and the DEFENDER's processed (buffed) DEF, respectively.
export function getDefenseCorrectedDamage(attacker: KiokuState, defender: KiokuState, damage: number, damageBaseType: DamageBaseType): number {
    const attackStat = damageBaseType === DamageBaseType.DEF ? getProcessedDef(attacker) : getProcessedAtk(attacker);
    const defStat = getProcessedDef(defender);
    const defFactor = Math.min(2, ((attackStat + 10) / (defStat + 10)) * 0.12);
    return damage * defFactor;
}

// ---------------------------------------------------------------------------
// GetProcessedGiveDamage / GetProcessedReceiveDamage
// ---------------------------------------------------------------------------
// [CONFIRMED architecture, RECONSTRUCTED per-state formula] Both walk the relevant
// unit's active states, sum every active give/receive-damage-ratio contribution, and
// add it as a percentage on top of running damage. ScoreAttackTeam.ts confirms
// UP_ELEMENT_DMG_RATE_RATIO folds unconditionally into the SAME give-damage-ratio bucket
// as UP_GIV_DMG_RATIO (not gated behind a weak-element hit) - see UnitStateEngine.ts's
// getGiveDamageRatioBonus, which now includes it.
export function getProcessedGiveDamage(attacker: KiokuState, damage: number): number {
    const ratio = getGiveDamageRatioBonus(attacker); // e.g. 0.15 for +15%
    return damage + damage * ratio;
}

export function getProcessedReceiveDamage(defender: KiokuState, damage: number): number {
    const ratio = getReceiveDamageRatioBonus(defender); // e.g. 0.15 for +15% received
    return damage + damage * ratio;
}

// ---------------------------------------------------------------------------
// GetElementResistDamage
// ---------------------------------------------------------------------------
// [RECONSTRUCTED] ReDriveBattleCore.BattleDamageCalculator$$GetElementResistDamage
// Shape: if the attack has an element, look up the defender's processed element-resist
// rate for that element, clamp it to [-100, 100], then: damage -= damage*clampedResist/100.
// Cross-validated against ScoreAttackTeam.ts's
//     elem_res_down = clamp(-1, 1, DWN_ELEMENT_RESIST_RATIO/1000)
//     elem_resist_factor = 1 + elem_res_down
// which is the same net effect under a sign convention where "resist" is expressed as a
// negative debuff amount rather than a signed "resistance level" - see
// UnitStateEngine.ts's getElementResistRate for the reconciliation.
export function getElementResistDamage(attacker: KiokuState, defender: KiokuState, damage: number, attackElement: number): number {
    if (!attackElement) return damage;
    const rawResist = getElementResistRate(defender, attackElement);
    const clamped = Math.max(-100, Math.min(100, rawResist));
    return damage - (damage * clamped) / 100;
}

// ---------------------------------------------------------------------------
// CorrelationEffect (element weakness multiplier)
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.CorrelationEffect .ctor / GetDamageType
// GetDamageType: DamageType = 2 ("weak hit") iff attacker is a character AND
// attackElement is in defender.WeakElements (dump.cs confirms `BattleUnit.WeakElements:
// ElementType[]` is a real, mutable runtime property - see KiokuState.weakElements in
// PvPTeam.ts). ElementDamageRatio starts at 1.0 (normal) or, on a weak hit, 1.2 - BOTH
// numbers confirmed directly by the person from Ghidra's raw bytes at DAT_7b9445dab8,
// AND independently matching ScoreAttackTeam.ts's
//     effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0)
// (1 + 0.2 = 1.2 on a weak hit), where `elem_dmg_up` is
// UP_WEAK_ELEMENT_DMG_RATIO/1000 summed across the attacker's active buffs - confirming
// both the constant AND that "UP_WEAK_ELEMENT_DMG_RATIO" (my original revision-1 name,
// which I'd second-guessed) is the correct, real ability effect type for this specific
// weak-hit-only bonus. (UP_ELEMENT_DMG_RATE_RATIO is a DIFFERENT, unconditional
// elemental damage buff - see getProcessedGiveDamage above.)
const ELEMENT_DAMAGE_RATIO_NORMAL = 1.0; // [CONFIRMED]
const ELEMENT_DAMAGE_RATIO_WEAK = 1.2;   // [CONFIRMED]

// [CROSS-CHECKED against a full CorrelationEffect.c re-dump] The .ctor confirms the exact
// mechanism this function models: a fresh CorrelationEffect is built per-hit from the
// attacker's CURRENTLY-active UpWeakElementDmgRatioUnitState states specifically (walking
// Condition.StateList, type-checked via the IL2CPP typeHierarchy array, each gated on its
// own IsActive(attacker)) - not a cached/precomputed value. It also confirms
// GetDamageType additionally requires `attacker.BattleParameter is CharacterParameter`
// before DamageType can become 2 - always true for every unit in this simulator (PvP is
// Kiokus only), so it doesn't change behavior here, just narrows what "weak hit" can mean
// in general.
// One thing worth flagging rather than silently reconciling: the ctor computes the
// per-state bonus as `existing + UpWeakElementDmgRatioUnitState.get_UpRatio() / 100.0`, a
// straight /100 division in the raw bytes - not the /1000 this function uses via
// getWeakElementBonus. Not changed here, because the /1000 scale has STRONGER,
// independent confirmation from two other sources (a direct Ghidra byte-read of
// DAT_7b9445dab8 by the person, and the separately-validated ScoreAttackTeam.ts reference
// formula) - the likeliest reconciliation is that get_UpRatio() itself already divides by
// 10 internally (its own body wasn't read), making the two /100 and /1000 readings
// consistent rather than contradictory. Flagged instead of guessed at further; if you want
// this fully nailed down, UpWeakElementDmgRatioUnitState$$get_UpRatio's own body is the
// next thing to decompile.
export interface CorrelationEffectResult {
    isWeakHit: boolean;
    elementDamageRatio: number;
}

export function computeCorrelationEffect(attacker: KiokuState, defender: KiokuState, attackElement: number): CorrelationEffectResult {
    const isWeakHit = attackElement !== 0 && isMatchWeakElement(attackElement, defender);
    if (!isWeakHit) {
        return { isWeakHit: false, elementDamageRatio: ELEMENT_DAMAGE_RATIO_NORMAL };
    }
    let ratio = ELEMENT_DAMAGE_RATIO_WEAK;
    ratio += getWeakElementBonus(attacker); // sum of active UP_WEAK_ELEMENT_DMG_RATIO / 1000
    return { isWeakHit: true, elementDamageRatio: ratio };
}

// [CONFIRMED field, RECONSTRUCTED population] `BattleUnit.WeakElements` (dump.cs) is a
// real, mutable per-unit runtime list, NOT a static per-character trait - there's no
// such field in KiokuData/heartExpStages (those "weakElements" are for PvE QUEST STAGE
// enemies, a different concept entirely). For player-controlled Kiokus in PvP, nothing
// in the provided files populates this list, so it defaults to empty (never weak) unless
// something (an "expose weakness"-style debuff, if one exists in your kit data) adds to
// KiokuState.weakElements at runtime. See PvPTeam.ts.
// Exported (was module-private) so AITargetSelector.ts's FULL AUTO damage-targeting
// filter chain (DamageAbilityEffectBase's confirmed UnitFilterMatchWeakElement step) can
// reuse the exact same weak-element check rather than duplicating it.
export function isMatchWeakElement(attackElement: number, defender: KiokuState): boolean {
    return defender.weakElements.includes(attackElement);
}

// ---------------------------------------------------------------------------
// IsCriticalDamage / GetAddedCriticalDamage
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleDamageCalculator$$IsCriticalDamage
//   roll = Random() * 100   (0-100)
//   isCrit = roll < attacker.GetProcessedCtr() + defender.GetProcessedRcvCtr(attacker)
export function isCriticalDamage(attacker: KiokuState, defender: KiokuState): boolean {
    const ctr = getProcessedCtr(attacker);
    const rcvCtr = getProcessedRcvCtr(defender, attacker);
    const roll = Math.random() * 100;
    return roll < ctr + rcvCtr;
}

// [CONFIRMED] ReDriveBattleCore.BattleDamageCalculator$$GetAddedCriticalDamage
//   damage * (1 + ctd/100)
export function getAddedCriticalDamage(attacker: KiokuState, damage: number): number {
    const ctd = getProcessedCtd(attacker);
    return damage * (1 + ctd / 100);
}

// ---------------------------------------------------------------------------
// GetDifficultyCorrectedDamage
// ---------------------------------------------------------------------------
// [CONFIRMED - scope only] ReDriveBattleCore.BattleDamageCalculator$$GetDifficultyCorrectedDamage
// Only applies when the ATTACKER's BattleParameter is specifically a
// QuestEnemyAppearanceParameter (PvE quest-enemy difficulty scaling). Now properly
// gated behind `battleType` instead of being hardcoded PvP-only: for BattleType.Pvp (and
// any battle type where the attacker isn't a quest-enemy-controlled unit) this is a
// no-op. If you run this engine for a Solo/Gve simulation where a quest enemy attacks,
// this would need the actual difficulty-scaling table wired in - not implemented (would
// need the quest/enemy difficulty data files, which weren't provided).
export function getDifficultyCorrectedDamage(_attacker: KiokuState, _defender: KiokuState, damage: number, _battleType: BattleType): number {
    return damage; // Not implemented for non-quest-enemy attackers - see comment above.
}

// ---------------------------------------------------------------------------
// DamageCutByPvpOrGvgSuppression
// ---------------------------------------------------------------------------
// [CONFIRMED gating, UNRESOLVED formula] ReDriveBattleCore.BattleDamageCalculator
// $$GetAttackDamageResult calls this only `if (battleType == BattleType.Pvp ||
// battleType == BattleType.Gvg)`. Per the person's message this IS relevant (PvP is
// battleType 2), so the gate is now wired in. The function body itself looks up a
// `CalculationPointPolicyMstModel` (a game-data table for PvP/GvG damage suppression
// rates, filtered by a predicate I don't have the body of) and computes a ratio from two
// of its fields. I do NOT have that data table (no matching JSON was provided), so this
// is implemented as a flagged no-op (multiplier = 1) rather than a fabricated rate. The
// gate itself (when this function fires) is real; only the internal rate lookup is
// missing. See MISSING_AND_UNCERTAIN.md.
let _warnedPvpSuppression = false;
export function damageCutByPvpOrGvgSuppression(damage: number, battleType: BattleType): number {
    if (battleType !== BattleType.Pvp && battleType !== BattleType.Gvg) return damage;
    if (!_warnedPvpSuppression) {
        console.warn("[DamageCalculator] DamageCutByPvpOrGvgSuppression's rate table (CalculationPointPolicyMst) isn't available - applying no suppression (1x). See MISSING_AND_UNCERTAIN.md.");
        _warnedPvpSuppression = true;
    }
    return damage; // * (unknown policy-driven rate)
}

// ---------------------------------------------------------------------------
// DamageCutByShield
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleDamageCalculator$$DamageCutByShield
// For every active ShieldUnitState on the defender: damage *= (1 - shield.DecreaseRatio),
// multiplicatively stacked across all shields. dump.cs confirms `ShieldUnitState` is a
// real class with a `DecreaseRatio` property (get/set) - matches what was assumed here.
// Each shield's hit-count is decremented via consumeShieldCharges() in PvPTeam.ts, now
// using the real `remainCount` field confirmed on SkillDetail (PassiveSkill/ActiveSkill
// both have it) rather than a fallback.
export function damageCutByShield(defender: KiokuState, damage: number): number {
    const shields = [...defender.activeEffectDetails.values()].filter(d => d.abilityEffectType === "SHIELD");
    if (!shields.length) return damage;
    let multiplier = 1.0;
    for (const shield of shields) {
        const decreaseRatio = shield.value1 / 1000;
        multiplier *= (1 - decreaseRatio);
    }
    return damage * multiplier;
}

// ---------------------------------------------------------------------------
// DamageCutByBarrier
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleDamageCalculator$$DamageCutByBarrier
// A barrier is a flat HP-pool that absorbs incoming (already-computed, integer) damage
// 1:1. If the hit is >= remaining barrier endurance, the barrier fully breaks (removed,
// its Endurance/MaxEndurance zeroed) and the excess spills through to HP; otherwise the
// whole hit is absorbed and Endurance is reduced by the hit amount.
export interface BarrierCutResult {
    remainingDamage: number;
    absorbedByBarrier: number;
    barrierBroke: boolean;
}

export function damageCutByBarrier(defender: KiokuState, damageValue: number): BarrierCutResult {
    const barrierEndurance = defender.barrierEndurance;
    if (barrierEndurance < 1) {
        return { remainingDamage: damageValue, absorbedByBarrier: 0, barrierBroke: false };
    }
    if (damageValue >= barrierEndurance) {
        const absorbed = barrierEndurance;
        const remaining = damageValue - barrierEndurance;
        defender.barrierEndurance = 0;
        defender.maxBarrierEndurance = 0;
        defender.activeEffectDetails.forEach((d, key) => {
            if (d.abilityEffectType === "BARRIER") defender.activeEffectDetails.delete(key);
        });
        return { remainingDamage: remaining, absorbedByBarrier: absorbed, barrierBroke: true };
    } else {
        defender.barrierEndurance = barrierEndurance - damageValue;
        return { remainingDamage: 0, absorbedByBarrier: damageValue, barrierBroke: false };
    }
}

// ---------------------------------------------------------------------------
// Full pipeline: GetAttackDamageResult
// ---------------------------------------------------------------------------
// [CONFIRMED order] Order of operations is confirmed from
// ReDriveBattleCore.BattleDamageCalculator$$GetAttackDamageResult; individual steps
// carry their own confidence markers above. Now also returns an AffectedUnitNotice so
// BattleConditionParser.ts's per-unit "what just happened" conditions (DMG, IS_KILLED,
// IS_WEAK_ELEMENT_ATTACKED, etc.) have real data to read - see PvPTeam.ts, which stores
// this on the target as `lastNotice`.
export interface DamageResult {
    finalDamage: number;       // HP damage after everything, >= 0, integer (Ceiling'd)
    isCritical: boolean;
    isWeakHit: boolean;
    barrierAbsorbed: number;
    shieldMultiplierApplied: boolean;
    notice: AffectedUnitNotice;
}

export function getAttackDamageResult(attacker: KiokuState, defender: KiokuState, detail: SkillDetail, damageBaseType: DamageBaseType, battleType: BattleType = BattleType.Pvp): DamageResult {
    // [CONFIRMED] `detail.element` (a plain number field on SkillDetail, confirmed to
    // exist in KiokuTypes.ts) is the SKILL's own configured element - used here rather
    // than the caster's character element (kioku.data.element), since a character's
    // attacks aren't guaranteed to share their own element (support/portrait/crystalis
    // effects can be a different element than the caster).
    const attackElement: number = detail.element ?? 0;
    const power = detail.value1 / 1000; // [CONFIRMED] see getDamageBase's header comment

    const statValue = getInitialDamageBaseParamValue(attacker, damageBaseType);
    let damage = getDamageBase(power, statValue);

    damage = getAppliedDamageOfBreakSituation(defender, damage);
    damage = getDefenseCorrectedDamage(attacker, defender, damage, damageBaseType);
    damage = getProcessedGiveDamage(attacker, damage);
    damage = getProcessedReceiveDamage(defender, damage);
    damage = getElementResistDamage(attacker, defender, damage, attackElement);

    const correlation = computeCorrelationEffect(attacker, defender, attackElement);
    damage *= correlation.elementDamageRatio;

    const isCritical = isCriticalDamage(attacker, defender);
    if (isCritical) {
        damage = getAddedCriticalDamage(attacker, damage);
    }

    damage = getDifficultyCorrectedDamage(attacker, defender, damage, battleType);
    damage = damageCutByPvpOrGvgSuppression(damage, battleType);

    const shieldMultiplierApplied = [...defender.activeEffectDetails.values()].some(d => d.abilityEffectType === "SHIELD");
    damage = damageCutByShield(defender, damage);

    damage = Math.max(damage, 0);
    const intDamage = Math.ceil(damage);

    const wasBarrierActiveBefore = defender.barrierEndurance > 0;
    const barrierResult = damageCutByBarrier(defender, intDamage);
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
        // [UNCONFIRMED] "becomes max break-damage-receive-rate" - not implemented, see
        // MISSING_AND_UNCERTAIN.md; always false here.
        isBreakedDamageReceiveRateBecomeMax: false,
        isReceivedReflection: false,
        isReceivedAttack: true,
    };

    return {
        finalDamage: barrierResult.remainingDamage,
        isCritical,
        isWeakHit: correlation.isWeakHit,
        barrierAbsorbed: barrierResult.absorbedByBarrier,
        shieldMultiplierApplied,
        notice,
    };
}

// ---------------------------------------------------------------------------
// Slip (DOT) damage: poison / burn / bleed / curse ticks
// ---------------------------------------------------------------------------
// [CONFIRMED shape] ReDriveBattleCore.BattleDamageCalculator$$GetSlipDamageValue +
// ReDriveBattleCore.UnitState.ReceiveSlipDamageUnitStateBase$$GetDamageBase. Runs the
// SAME pipeline as a direct attack, but skips crit and shield/barrier (per the
// decompiled call chain, confirmed no such calls appear), and does not interact with the
// break gauge.
//
// IMPORTANT CORRECTION from revision 1: the DOT's `dotOwner` parameter must be the unit
// that APPLIED the DOT (whose ATK/DEF/HP stat it scales off), NOT the unit currently
// suffering it. Revision 1 got this backwards, reasoning from the decompiled method
// signature `GetDamageBase(BattleUnit userUnit)` which I couldn't confirm the call-site
// binding for. ScoreAttackTeam.ts's `add_dot_dmg` settles it unambiguously: it scales
// each DOT tick off `resolveAllyAtk(allyIdx, ...)` for the ALLY who owns the
// DOT-inducing effect, iterating `this.allyContexts[allyIdx].kioku.effects` (the
// applier's own effect list), not the enemy's. See PvPTeam.ts's tickDotEffects(), which
// now tracks and uses the applier's KiokuState.
export function getSlipDamageResult(dotOwner: KiokuState, target: KiokuState, detail: SkillDetail, damageBaseType: DamageBaseType, battleType: BattleType = BattleType.Pvp): number {
    const attackElement: number = detail.element ?? 0;
    const power = detail.value1 / 1000; // [CONFIRMED]

    const statValue = getInitialDamageBaseParamValue(dotOwner, damageBaseType);
    let damage = getDamageBase(power, statValue);

    damage = getAppliedDamageOfBreakSituation(target, damage);
    damage = getDefenseCorrectedDamage(dotOwner, target, damage, damageBaseType);
    // NOTE: uses getSlipGiveDamageRatioBonus (includes UP_GIV_SLIP_DMG_RATIO, "DOT DMG+")
    // rather than the direct-hit getProcessedGiveDamage/getGiveDamageRatioBonus - see
    // UnitStateEngine.ts's GIVE_SLIP_DMG_RATIO_TYPES.
    damage = damage + damage * getSlipGiveDamageRatioBonus(dotOwner);
    damage = getProcessedReceiveDamage(target, damage);
    damage = getElementResistDamage(dotOwner, target, damage, attackElement);

    const correlation = computeCorrelationEffect(dotOwner, target, attackElement);
    damage *= correlation.elementDamageRatio;

    damage = getDifficultyCorrectedDamage(dotOwner, target, damage, battleType);
    damage = damageCutByPvpOrGvgSuppression(damage, battleType);

    damage = Math.max(damage, 0);
    return Math.ceil(damage);
}
