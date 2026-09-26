/**
 * AITargetSelector.ts
 * ===================
 * "FULL AUTO" mode target selection - i.e. how the game itself picks a target for a
 * single-target (RangeType.SelectSingle="TARGET", value 1) skill effect when nobody is
 * manually tapping a target on screen. Ported from decompiled BattleUnit.c, all of it
 * from the ReDriveBattleCore.AI.AISkillTargetSelector static class plus each concrete
 * AbilityEffect subclass's own `GetAIFilteredTargets`/`SelectTargetInAIAction` override.
 * Every AbilityEffect class in the dump has both methods (even ones that route through
 * the generic UnitState/StateAbilityEffect wrapper), which is what makes this a genuine
 * per-effect-type AI, not a single one-size-fits-all heuristic.
 *
 * THE CORE ALGORITHM - [CONFIRMED byte-for-byte]
 * ------------------------------------------------
 * ReDriveBattleCore.AI.AISkillTargetSelector$$SelectTargetUnitInOrder(candidateUnits,
 * unitFilterFuncOrder) takes an ORDERED list of filter functions
 * (IEnumerable<BattleUnit> -> IEnumerable<BattleUnit>) and progressively narrows the
 * candidate pool by running them in sequence:
 *
 *   for each filterFn in the order:
 *     result = filterFn(candidates)
 *     if result.length == 1: return result[0]            // narrowed to exactly one - done
 *     if result.length >= 2: candidates = result          // still ambiguous - narrow and keep going
 *     if result.length == 0: (candidates unchanged)        // this filter would eliminate
 *                                                          // EVERYONE - skip it, try the next one
 *   // ran out of filters without ever narrowing to exactly one:
 *   return a UNIFORMLY RANDOM element of whatever `candidates` ended up being
 *
 * This "graceful skip on empty, otherwise narrow, random tiebreak at the end" shape is
 * exactly what selectTargetUnitInOrder() below implements. Decompiled from the actual
 * do/while + goto control flow (not guessed from the general shape) - the empty-skip
 * behavior in particular (rather than e.g. "no valid target") only shows up if you trace
 * which local variable becomes `source` for the next iteration on each of the three
 * count cases, so this isn't something reverse engineering a black-box would likely
 * reconstruct correctly by intuition alone.
 *
 * PER-EFFECT-TYPE CHAINS - [CONFIRMED, order-verified per class]
 * ------------------------------------------------------------------
 * Every chain below was read directly from that SPECIFIC class's own
 * `SelectTargetInAIAction`/`GetAIFilteredTargets` body (not inferred from a sibling
 * class), including the literal order filters get added to the chain. Shared filter
 * primitives live on `ReDriveBattleCore.AI.AISkillTargetSelector` itself (UnitFilterBy*);
 * a couple of effect classes also define their own one-off local filter function (called
 * out per chain below).
 *
 * A recurring filter, `AISkillTargetSelector.UnitFilterByMainTarget`, checks whether
 * `unit.Param is QuestEnemyAppearanceParameter` - a PvE quest-boss "this add is the
 * designated main target" flag. A PvP Kioku's Param is never that type, so for this
 * simulator this filter always yields zero matches and is therefore always a no-op
 * (per the empty-skip rule above). Implemented here as an explicit pass-through
 * (`filterByMainTarget`) rather than omitted, purely so the chains below still visibly
 * match the source's real filter order - if a PvE mode is ever added, this is already the
 * right seam to make it do something.
 *
 * PROXIMITY (RangeType.SelectMultiple): handled entirely separately, see
 * `expandProximity` near the bottom of this file - it does NOT re-run any of the above,
 * it just expands an already-chosen primary target to its positional neighbors.
 *
 * NOT YET PORTED: `SUMMON` (SummonAbilityEffect's GetAIFilteredTargets involves a
 * Count<BattleUnit> check against what's almost certainly a "max concurrent summons"
 * cap - not implemented, since this codebase has no concept of summoning a new unit
 * mid-battle at all yet, making the targeting question moot until that mechanic exists).
 * Revival, GainSp (Triggering IS implemented, just not this), ImmSlipDmg, ChangeSkill,
 * AdditionalSkillAct/AdditionalTurnUnitAct were all on this list too until confirmed -
 * see revivalChain/immSlipDmgChain/gainSpFixedChain and ChangeSkillAbilityEffect's own
 * comment (the last three genuinely have no override to transcribe, confirmed rather
 * than assumed).
 * (DMG_RATIO was on this list too until it was confirmed - DmgRatioAbilityEffect has its
 * own ctor/Triggering/DamageBaseType but does NOT override GetAIFilteredTargets or
 * SelectTargetInAIAction, so it inherits DamageAbilityEffectBase's targeting exactly like
 * DMG_ATK/DEF/HP/RANDOM - the existing `startsWith("DMG_")` branch below already covers it.)
 *
 * CORRECTION LOG: this file's first pass mis-transcribed the Haste/Slow/RemoveAllBuff
 * chains (missing a class-local filter each) due to a search-method blind spot (a regex
 * that failed to match `<MethodName>g__LocalFuncName` symbols), not a misreading of any
 * actual decompiled bytes - see removeAllBuffChain's comment for the mechanism and
 * hasteChain/slowChain for what was added. Flagging this here rather than quietly fixing
 * it in place because the same blind spot could affect chains nobody has gone back to
 * re-check yet with the corrected method (everything currently in this file HAS been
 * re-checked; anything in "NOT YET PORTED" above has not been read at all).
 */

import { KiokuState, compareTurnOrder } from "./PvPTeam";
import { SkillDetail } from "../types/KiokuTypes";
import { KiokuRole } from "../types/enums";
import { getProcessedAtk, getThreatWeight } from "./UnitStateEngine";
import { isMatchWeakElement } from "./DamageCalculator";

export type UnitFilter = (units: KiokuState[]) => KiokuState[];

// The battle's seeded RNG while selectFullAutoTarget runs. Filter chains are built by
// per-effect-type factories that don't take an rng, and the weighted-random filter used to fall
// back to Math.random - so the same seed could pick different targets (exports didn't replay).
let activeRng: () => number = Math.random;
const currentRng = () => activeRng();

// =============================================================================
// Core algorithm - ReDriveBattleCore.AI.AISkillTargetSelector$$SelectTargetUnitInOrder
// =============================================================================
export function selectTargetUnitInOrder(
    initialCandidates: KiokuState[],
    filterChain: UnitFilter[],
    rng: () => number = currentRng
): KiokuState | null {
    let candidates = initialCandidates;
    for (const filterFn of filterChain) {
        const filtered = filterFn(candidates);
        if (filtered.length === 1) return filtered[0];
        if (filtered.length >= 2) candidates = filtered;
        // filtered.length === 0: this filter would leave nobody - skip it, candidates unchanged.
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(rng() * candidates.length)];
}

// =============================================================================
// Shared filter primitives - ReDriveBattleCore.AI.AISkillTargetSelector
// =============================================================================

// Every GetAIFilteredTargets/SelectTargetInAIAction starts from `!IsDead` - confirmed
// identically worded in every predicate lambda actually read (AbilityEffectBase,
// DamageAbilityEffectBase, GainEp/LoseEp/Charge family all match this exact predicate).
export const filterAlive: UnitFilter = (units) => units.filter(u => !u.isDead);

// [CONFIRMED] UnitFilterByBreak: `unit.BreakPoint != null && unit.BreakPoint.IsBreak`.
export const filterByBreak: UnitFilter = (units) => units.filter(u => u.isBroken);

// [CONFIRMED no-op for PvP] see file header - UnitFilterByMainTarget is a PvE-only hook.
export const filterByMainTarget: UnitFilter = (units) => units;

export const filterByRole = (role: KiokuRole): UnitFilter =>
    (units) => units.filter(u => u.kioku.data.role === role);

// [CONFIRMED] UnitFilterByRoleAttackerOrBreaker: `IsMatch(Attacker) || IsMatch(Breaker)`.
export const filterByRoleAttackerOrBreaker: UnitFilter = (units) =>
    units.filter(u => u.kioku.data.role === KiokuRole.Attacker || u.kioku.data.role === KiokuRole.Breaker);

// [CONFIRMED] UnitFilterByRoleHealerOrBufferOrDebuffer - present in the source as a
// sibling of UnitFilterByRoleAttackerOrBreaker; not currently consumed by any chain
// below (none of the effect types actually read used it), kept for completeness/future use.
export const filterByRoleHealerOrBufferOrDebuffer: UnitFilter = (units) =>
    units.filter(u => [KiokuRole.Healer, KiokuRole.Buffer, KiokuRole.Debuffer].includes(u.kioku.data.role));

// [CONFIRMED template] UnitFilterWithMinXxx/MaxXxx all follow this exact shape: if the
// input is empty return it unchanged; otherwise compute the extreme value across all
// candidates and keep only those tied for it (exact equality, not "close to"). Verified
// directly against UnitFilterWithMinHpRate's own decompiled body; the Max variants and
// the other Min variants (Ep, Atk, Def, Spd, Hp) weren't individually re-read byte for
// byte but follow the identical generated-code template with only the selector swapped.
function filterWithMin(selector: (u: KiokuState) => number): UnitFilter {
    return (units) => {
        if (units.length === 0) return units;
        const minVal = Math.min(...units.map(selector));
        return units.filter(u => selector(u) === minVal);
    };
}
function filterWithMax(selector: (u: KiokuState) => number): UnitFilter {
    return (units) => {
        if (units.length === 0) return units;
        const maxVal = Math.max(...units.map(selector));
        return units.filter(u => selector(u) === maxVal);
    };
}

// [CONFIRMED] UnitFilterWithMinHpRate uses `unit.CalculationHpRate()` - current/max HP.
export const filterWithMinHpRate: UnitFilter = filterWithMin(u => u.currentHp / u.maxHp);
// [RECONSTRUCTED selector, CONFIRMED template] "Ep" here assumed to mean current EP
// (currentMp in this codebase) by analogy with HpRate meaning current/max HP - the
// specific UnitFilterWithMinEp body wasn't independently re-read.
export const filterWithMinEp: UnitFilter = filterWithMin(u => u.currentMp);
// [RECONSTRUCTED selector, CONFIRMED template] "Atk" assumed to mean the unit's current
// PROCESSED (buffed) attack stat, not its raw base stat, since an AI choosing "who's my
// hardest hitter to charge up" should care about current effective power. The specific
// UnitFilterWithMaxAtk body wasn't independently re-read to confirm processed-vs-base.
export const filterWithMaxAtk: UnitFilter = filterWithMax(u => getProcessedAtk(u));

// [CONFIRMED] DamageAbilityEffectBase's local UnitFilterMatchWeakElement:
// `CorrelationEffect.IsMatchWeakElement((int)this.damagePower.Item2, unit.WeakElements)`
// - i.e. keep only units whose WeakElements array contains the attack's element. Reuses
// the exact same check DamageCalculator.ts uses for the weak-hit damage bonus.
export const filterMatchWeakElement = (element: number): UnitFilter =>
    (units) => units.filter(u => isMatchWeakElement(element, u));

// [CONFIRMED] AISkillTargetSelector.GetUnitWeightDic(candidates, withHate=true) +
// SelectUnitAtWeightedRandom(weightDic) folded into one filter step, matching
// DamageAbilityEffectBase's local UnitFilterByRoleAtWeightedRandomWithHate:
//     weightDic = candidates.ToDictionary(u => u, u => GetWeight(u, withHate: true))
//     picked = SelectUnitAtWeightedRandom(weightDic)
//     return picked == null ? [] : [picked]
// SelectUnitAtWeightedRandom itself: roll = Random.Next(totalWeight) (an integer in
// [0, totalWeight)), then walk the dictionary summing weights until the running total
// EXCEEDS roll (strict >), returning whichever unit's weight pushed it over. See
// getThreatWeight (UnitStateEngine.ts) for the per-unit weight (role base + active hate).
export const filterByRoleAtWeightedRandomWithHate = (rng: () => number = currentRng): UnitFilter =>
    (units) => {
        if (units.length === 0) return units;
        const weights = units.map(getThreatWeight);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        if (totalWeight <= 0) return [];
        const roll = Math.floor(rng() * totalWeight); // [0, totalWeight)
        let cumulative = 0;
        for (let i = 0; i < units.length; i++) {
            cumulative += weights[i];
            if (cumulative > roll) return [units[i]];
        }
        return [units[units.length - 1]]; // unreachable if totalWeight > 0; defensive only
    };

// [CONFIRMED] Haste/Slow's own local filter functions both delegate to
// `ReDriveBattleCore.TurnReferee$$SortByTurnOrder(candidates)` - the SAME 4-level sort
// already ported and independently [VERIFIED] as `compareTurnOrder` in PvPTeam.ts
// (OrderBy seconds-until-act, ThenByDescending turnOrderPriority, ThenBy team, ThenBy
// posIdx) - then takes `.LastOrDefault()` (Haste: help whoever's turn is furthest away)
// or `.FirstOrDefault()` (Slow: hinder whoever's turn is coming up soonest). Since every
// candidate here is on the same side, the team-index tiebreak inside compareTurnOrder is
// always a no-op (aTeam===bTeam), so reusing it as-is (passing any candidate's own team)
// is equivalent to a same-side-only 3-level sort.
function sortByTurnOrder(units: KiokuState[]): KiokuState[] {
    if (units.length === 0) return units;
    return [...units].sort((a, b) => compareTurnOrder(a, b, units[0].team));
}
export const filterWithLastTurnOrder: UnitFilter = (units) => {
    const sorted = sortByTurnOrder(units);
    return sorted.length ? [sorted[sorted.length - 1]] : [];
};
export const filterWithFirstTurnOrder: UnitFilter = (units) => {
    const sorted = sortByTurnOrder(units);
    return sorted.length ? [sorted[0]] : [];
};

// [CONFIRMED] RemoveAllBuffAbilityEffect's three local filters, each identical in shape:
// keep only units with at least one active, `IsRemovable` (EffectOrigin==1 && is IBuff -
// see removeAllBuffChain's own comment) state that is ALSO an instance of a specific base
// class - UpAttackUnitStateBase / UpDefenseUnitStateBase / the broader
// ParameterVariationUnitStateBase (which the first two almost certainly themselves
// extend, given the naming - it reads as the generic "this is some kind of stat-up buff"
// ancestor). Approximated here via abilityEffectType string prefixes rather than a real
// class-hierarchy check, since that's all a decompiled dump and a JSON-driven port can
// give us: ATK for the first, DEF for the second, and "any UP_/GAIN_-prefixed
// friendlySkills-classified, non-aliment state" for the third (broadest) one. The ATK/DEF
// sets specifically are a best-effort mapping from the confirmed enums list, not
// independently verified per string.
function hasActiveBuffMatching(unit: KiokuState, predicate: (abilityEffectType: string) => boolean): boolean {
    return [...unit.activeEffectDetails.values()].some(d => predicate(d.abilityEffectType));
}
export const filterByUpAtk: UnitFilter = (units) =>
    units.filter(u => hasActiveBuffMatching(u, t => t === "UP_ATK_RATIO" || t === "UP_ATK_FIXED" || t === "UP_ATK_ACCUM_RATIO"));
export const filterByUpDef: UnitFilter = (units) =>
    units.filter(u => hasActiveBuffMatching(u, t => t === "UP_DEF_RATIO" || t === "UP_DEF_FIXED" || t === "UP_DEF_ACCUM_RATIO"));
export const filterByUpParam: UnitFilter = (units) =>
    units.filter(u => hasActiveBuffMatching(u, t => t.startsWith("UP_") || t.startsWith("GVE_UP_")));

// =============================================================================
// Per-effect-type AI chains
// =============================================================================
// Each entry is (a) an extra pre-filter beyond `filterAlive` - the source's
// GetAIFilteredTargets, which narrows candidates to ones the effect can meaningfully
// apply to at all (e.g. "already at max EP" units are excluded from GAIN_EP) - and
// (b) the ordered SelectTargetInAIAction filter chain run over what's left.

interface AIChain {
    /** Extra eligibility filter beyond "alive", mirroring the class's own GetAIFilteredTargets. */
    preFilter?: UnitFilter;
    /** Ordered SelectTargetInAIAction filter chain. */
    chain: UnitFilter[];
    /**
     * True only for effect types whose own GetAIFilteredTargets explicitly wants DEAD
     * units (currently just Revival) - selectFullAutoTarget's universe is "alive" by
     * default for every other chain, so this is the one place that needs to invert it
     * rather than needing every OTHER chain's preFilter to redundantly re-assert
     * `!u.isDead` on top of whatever it already checks.
     */
    wantsDead?: boolean;
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.DamageAbilityEffectBase - backs
// DMG_ATK/DMG_DEF/DMG_HP/DMG_RANDOM (DmgAtkAbilityEffect/DmgDefAbilityEffect/
// DmgHpAbilityEffect/DmgRandomAbilityEffect all extend it and don't override targeting).
// GetAIFilteredTargets is just `!IsDead` (no extra pre-filter). SelectTargetInAIAction's
// chain, in order: UnitFilterByBreak, UnitFilterByMainTarget (PvE no-op),
// UnitFilterMatchWeakElement, then ALWAYS UnitFilterByRoleAtWeightedRandomWithHate last -
// gated behind `userUnit.isCharacter`, which every PvP Kioku satisfies, so all four apply
// unconditionally here. Confirmed: no "lowest HP%" or "highest ATK" priority exists in the
// damage-targeting chain at all - break-priority, then weak-element-priority, then
// role+hate weighted random is the complete picture.
function damageChain(detail: SkillDetail): AIChain {
    return {
        chain: [
            filterByBreak,
            filterByMainTarget,
            filterMatchWeakElement(detail.element),
            filterByRoleAtWeightedRandomWithHate(),
        ],
    };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.ChargeAbilityEffect /
// GainChargePointAbilityEffect / ConsumeChargePointAbilityEffect - all three read
// independently, all three share the identical SelectTargetInAIAction chain
// (UnitFilterByMainTarget, UnitFilterWithMaxAtk - i.e. prefer your highest-ATK unit,
// random tiebreak among ties), differing only in GetAIFilteredTargets:
//   CHARGE:                unit.Condition.MaxChargePoint == 0            (doesn't have a gauge yet)
//   GAIN_CHARGE_POINT:      MaxChargePoint >= 1 && ChargePoint < MaxChargePoint (has room)
//   CONSUME_CHARGE_POINT:   MaxChargePoint >= 1 && ChargePoint > 0        (has something to spend)
const chargeFamilyChain: UnitFilter[] = [filterByMainTarget, filterWithMaxAtk];
function chargeChain(): AIChain {
    return { preFilter: (units) => units.filter(u => u.currentMaxMagic === 0), chain: chargeFamilyChain };
}
function gainChargePointChain(): AIChain {
    return { preFilter: (units) => units.filter(u => u.currentMaxMagic >= 1 && u.currentMagic < u.currentMaxMagic), chain: chargeFamilyChain };
}
function consumeChargePointChain(): AIChain {
    return { preFilter: (units) => units.filter(u => u.currentMaxMagic >= 1 && u.currentMagic > 0), chain: chargeFamilyChain };
}

// [CONFIRMED] ReDriveBattleCore.UnitState.ComboUnitState$$GetUnitFilterFuncOrder -
// COMBO is one of the ~93 generic UnitStateFactory-dispatched types (not an
// AbilityEffectFactory-special one, unlike everything else in this file), but it exposes
// the identical targeting-chain concept via its own override of this method rather than
// AbilityEffect's GetAIFilteredTargets/SelectTargetInAIAction pair. Chain is the exact
// same as the charge family: [UnitFilterByMainTarget, UnitFilterWithMaxAtk] - grant the
// extra action(s) to whoever hits hardest. No GetAIFilteredTargets-equivalent pre-filter
// was found for it, so none is applied here beyond the universal alive check.
function comboChain(): AIChain {
    return { chain: chargeFamilyChain };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.GainEpAbilityEffectBase - backs
// GAIN_EP_RATIO/GAIN_EP_FIXED. GetAIFilteredTargets: `MaxEP > 0 && EP < MaxEP` (has an EP
// pool and isn't already full). SelectTargetInAIAction chain: UnitFilterByRoleAttackerOrBreaker,
// then UnitFilterWithMinEp (prefer the neediest Attacker/Breaker).
function gainEpChain(): AIChain {
    return {
        preFilter: (units) => units.filter(u => u.maxMp > 0 && u.currentMp < u.maxMp),
        chain: [filterByRoleAttackerOrBreaker, filterWithMinEp],
    };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.LoseEpAbilityEffectBase - backs
// LOSE_EP_RATIO/LOSE_EP_FIXED. No extra pre-filter beyond alive. SelectTargetInAIAction
// chain: UnitFilterByBreak only (prefer an already-broken target; random among ties/all
// otherwise).
function loseEpChain(): AIChain {
    return { chain: [filterByBreak] };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.ImmSlipDmgAbilityEffect - backs
// IMM_SLIP_DMG. GetAIFilteredTargets: `!IsDead`, then (only if that's non-empty) further
// narrowed to units with an active `ReceiveSlipDamageUnitStateBase` state - i.e. prefer
// granting DOT immunity to someone who actually HAS a DOT running, falling back to any
// alive unit if nobody does. No SelectTargetInAIAction override exists (confirmed - this
// class has no method by that name at all), so the final pick is the base class's own
// uniform-random-among-survivors, reproduced here by an empty chain.
// ReceiveSlipDamageUnitStateBase's exact member list wasn't enumerated - approximated via
// this codebase's known DOT-type ability effect type prefixes (Burn/Poison/Bleed/Curse),
// deliberately narrower than isAlimentEffect (which also covers Stun/Weakness/Vortex -
// non-damage-over-time aliments that shouldn't count here).
function hasActiveDot(unit: KiokuState): boolean {
    return [...unit.activeEffectDetails.values()].some(d =>
        d.abilityEffectType.startsWith("BURN_") || d.abilityEffectType.startsWith("POISON_") ||
        d.abilityEffectType.startsWith("BLEED_") || d.abilityEffectType.startsWith("CURSE_"));
}
function immSlipDmgChain(): AIChain {
    return {
        preFilter: (units) => {
            const withDot = units.filter(hasActiveDot);
            return withDot.length > 0 ? withDot : units;
        },
        chain: [],
    };
}

// [CONFIRMED shape, unparameterized] ReDriveBattleCore.AbilityEffect.
// GainSpFixedAbilityEffect - backs GAIN_SP_FIXED. GetAIFilteredTargets:
// `gameDirector.spReferee.GetSp(userUnit.Team) >= <a static threshold read from opaque
// memory, exact value not recoverable from pseudo-C>` -> returns an EMPTY list (no
// target at all) if the team's shared SP/EP pool is already at or above that cap,
// otherwise returns candidates unchanged. No SelectTargetInAIAction override exists.
// NOT implemented here - this codebase's own team-level SP concept (`this.currentSp` in
// PvPTeam.ts) is a simpler boolean ("does the team have a banked skill turn right now"),
// not a capped numeric pool, so there's no confirmed equivalent threshold to gate on
// without inventing one. Falls back to the generic base chain (alive, random) for now.
function gainSpFixedChain(): AIChain {
    return { chain: [] };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.ChangeSkillAbilityEffect /
// AdditionalSkillActAbilityEffect / AdditionalTurnUnitActAbilityEffect - backs
// CHANGE_SKILL, ADDITIONAL_SKILL_ACT, and ADDITIONAL_TURN_UNIT_ACT respectively. None of
// the three has EITHER a GetAIFilteredTargets or a SelectTargetInAIAction override
// (checked directly - no method by either name exists on any of them), meaning all three
// use AbilityEffectBase's own pair unmodified: alive-only, then uniform random. This is
// already exactly genericFallbackChain's behavior, so no dedicated chain function is
// needed for them - they're listed in CHAIN_BY_EFFECT_TYPE below purely so this fact is
// documented at its point of use rather than left implicit.

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.RecoveryHpAbilityEffectBase - backs
// RECOVERY_HP/RECOVERY_HP_ATK. No extra pre-filter beyond alive. SelectTargetInAIAction
// chain: UnitFilterByMainTarget (PvE no-op), UnitFilterWithMinHpRate - i.e. heal
// whoever's lowest on HP%, at random among exact ties.
function recoveryHpChain(): AIChain {
    return { chain: [filterByMainTarget, filterWithMinHpRate] };
}

// [CORRECTED] The first pass at this file (via a faster but less careful search method -
// grepping for referenced pointer symbols in file order rather than reading the method
// body) reported this as just [UnitFilterByMainTarget, UnitFilterByBreak]. That search
// missed anything shaped like a class-LOCAL generated function
// (`<SelectTargetInAIAction>g__SomeName_N_M`), because those symbol names contain `<>`
// characters that broke the regex being used - the shared AISkillTargetSelector-level
// UnitFilterByXxx methods don't have that shape, so they were found fine, but three
// RemoveAllBuffAbilityEffect-LOCAL filters were invisible to that method entirely. Caught
// by re-reading the actual method body instead of trusting the fast search - see this
// file's other _chain functions, which were spot-checked afterward with a corrected regex
// and confirmed NOT to have the same gap. The REAL, complete, re-read chain:
// [CONFIRMED] ReDriveBattleCore.AbilityEffect.RemoveAllBuffAbilityEffect$$
// SelectTargetInAIAction: UnitFilterByMainTarget (PvE no-op), UnitFilterByBreak,
// UnitFilterByUpAtk, UnitFilterByUpDef, UnitFilterByUpParam (in that order) - i.e. dispel
// priority is broken units, then whoever has an ATK buff up, then DEF, then any stat buff
// at all. REMOVE_ALL_DEBUFF/REMOVE_ALL_ABNORMAL/REMOVE_ALL_UNABLE_ACTION do NOT share
// this class or chain (confirmed: none of the three sibling classes override Triggering,
// GetAIFilteredTargets, or SelectTargetInAIAction at all - they only override the ctor and
// IsRemovable - so they use RemoveStateAbilityEffectBase's OWN base implementations
// instead, see removeStateFamilyChain below).
function removeAllBuffChain(): AIChain {
    return { chain: [filterByMainTarget, filterByBreak, filterByUpAtk, filterByUpDef, filterByUpParam] };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.RemoveStateAbilityEffectBase - the SHARED
// base SelectTargetInAIAction used by RemoveAllDebuffAbilityEffect/
// RemoveAllAbnormalAbilityEffect/RemoveAllUnableActionAbilityEffect (none of the three
// override it): UnitFilterByMainTarget (PvE no-op), UnitFilterWithMinHpRate - cleanse
// whoever's lowest on HP%. Also backs RemoveStateAbilityEffectBase's own Triggering (see
// PvPTeam.ts's REMOVE_ALL_DEBUFF/REMOVE_ALL_ABNORMAL handling): removal is capped at
// `value1` MOST-RECENTLY-APPLIED matching states (0 = unlimited), not "all matching,
// unconditionally" - ported there, not here, since it's Triggering behavior rather than targeting.
function removeStateFamilyChain(): AIChain {
    return { chain: [filterByMainTarget, filterWithMinHpRate] };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.HasteAbilityEffect - backs HASTE.
// SelectTargetInAIAction chain: UnitFilterByMainTarget (PvE no-op),
// UnitFilterByRoleAttackerOrBreaker, UnitFilterWithLastTurnOrder (help whoever acts last).
// [CORRECTED] the third filter was missed on the first pass for the same regex reason
// documented on removeAllBuffChain above - re-read and confirmed present.
function hasteChain(): AIChain {
    return { chain: [filterByMainTarget, filterByRoleAttackerOrBreaker, filterWithLastTurnOrder] };
}

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.SlowAbilityEffect - backs SLOW.
// SelectTargetInAIAction chain: UnitFilterByBreak, UnitFilterByMainTarget (PvE no-op),
// UnitFilterWithFirstTurnOrder (hinder whoever acts soonest) - order reversed relative to
// Haste's (Break checked first here). [CORRECTED] same missed-third-filter issue as Haste.
function slowChain(): AIChain {
    return { chain: [filterByBreak, filterByMainTarget, filterWithFirstTurnOrder] };
}

// DMG_ATK/DMG_DEF/DMG_HP/DMG_RANDOM are handled by the `startsWith("DMG_")` branch in
// selectFullAutoTarget below (damageChain needs `detail.element`, which this
// no-argument-function table shape can't carry) - intentionally not listed here.
const CHAIN_BY_EFFECT_TYPE: Record<string, () => AIChain> = {
    CHARGE: chargeChain,
    GAIN_CHARGE_POINT: gainChargePointChain,
    CONSUME_CHARGE_POINT: consumeChargePointChain,
    GAIN_EP_RATIO: gainEpChain,
    GAIN_EP_FIXED: gainEpChain,
    LOSE_EP_RATIO: loseEpChain,
    LOSE_EP_FIXED: loseEpChain,
    RECOVERY_HP: recoveryHpChain,
    RECOVERY_HP_ATK: recoveryHpChain,
    REMOVE_ALL_BUFF: removeAllBuffChain,
    REMOVE_ALL_DEBUFF: removeStateFamilyChain,
    REMOVE_ALL_ABNORMAL: removeStateFamilyChain,
    REMOVE_ALL_UNABLE_ACTION: removeStateFamilyChain,
    REVIVAL_RATIO: revivalChain,
    COMBO: comboChain,
    IMM_SLIP_DMG: immSlipDmgChain,
    GAIN_SP_FIXED: gainSpFixedChain,
    // CHANGE_SKILL/ADDITIONAL_SKILL_ACT/ADDITIONAL_TURN_UNIT_ACT deliberately NOT listed
    // here - confirmed (see genericFallbackChain and ChangeSkillAbilityEffect's own
    // comment above) to have no targeting override at all, so omitting them and letting
    // the `?? genericFallbackChain` default handle them IS the correct, confirmed
    // behavior, not an oversight.
    HASTE: hasteChain,
    SLOW: slowChain,
};

// [CONFIRMED] ReDriveBattleCore.AbilityEffect.AbilityEffectBase - the base class's OWN
// GetAIFilteredTargets/SelectTargetInAIAction, used here as the fallback for every effect
// type that doesn't have (or hasn't yet had) its own chain transcribed above. Decompiled
// directly: GetAIFilteredTargets is a no-op pass-through (`!IsDead` only, applied earlier
// by filterAlive); SelectTargetInAIAction filters to `!IsDead`, orders by a FRESH
// `Guid.NewGuid()` per candidate, and takes the first - i.e. genuinely uniform random
// among the living, which `selectTargetUnitInOrder`'s own random-tiebreak-when-nothing-
// narrows-further already reproduces exactly when given an empty chain.
// [CONFIRMED] ReDriveBattleCore.AbilityEffect.RevivalAbilityEffectBase - backs
// REVIVAL_RATIO. GetAIFilteredTargets: `targetUnitList.Where(u => u.IsDead)` - only dead
// units are eligible at all (rather than being a chain-narrowing step, this is a hard
// prerequisite: nothing else in the class re-checks it). SelectTargetInAIAction doesn't
// use the shared SelectTargetUnitInOrder chain machinery the way every other class read
// so far does - it's a direct `.OrderBy(u => Guid.NewGuid()).FirstOrDefault()`, i.e.
// uniformly random among the dead. Modeled here as a pre-filter (isDead) with an empty
// chain, which - per selectTargetUnitInOrder's own fallback rule - produces exactly that
// same uniform-random-among-survivors behavior without needing a special case.
function revivalChain(): AIChain {
    return { chain: [], wantsDead: true };
}

function genericFallbackChain(): AIChain {
    return { chain: [] };
}

/**
 * Top-level entry point: pick ONE target for a RangeType.SelectSingle ("TARGET") effect,
 * the way the real game's FULL AUTO mode would. `candidates` should already be narrowed
 * to the correct side (own team for a friendly effect, enemy team for a hostile one) -
 * this function only handles WHICH ONE among however many are legal, not who's legal in
 * the first place.
 */
export function selectFullAutoTarget(
    detail: SkillDetail,
    candidates: KiokuState[],
    rng: () => number = Math.random
): KiokuState | null {
    const previous = activeRng
    activeRng = rng
    try {
        return selectFullAutoTargetInner(detail, candidates, rng)
    } finally {
        activeRng = previous
    }
}

function selectFullAutoTargetInner(detail: SkillDetail, candidates: KiokuState[], rng: () => number): KiokuState | null {
    if (detail.abilityEffectType.startsWith("DMG_")) {
        const alive = filterAlive(candidates);
        if (alive.length === 0) return null;
        const { chain } = damageChain(detail);
        return selectTargetUnitInOrder(alive, chain, rng);
    }

    const getChain = CHAIN_BY_EFFECT_TYPE[detail.abilityEffectType];
    const { preFilter, chain, wantsDead } = (getChain ?? genericFallbackChain)();
    // Every chain's universe is "alive" by default (matching every class read so far
    // except Revival) - wantsDead flips that base to "dead" instead, so Revival's own
    // empty preFilter/chain (uniform random among the dead - see revivalChain) isn't
    // fighting a blanket alive-filter applied before it ever gets a say.
    const base = wantsDead ? candidates.filter(u => u.isDead) : filterAlive(candidates);
    const eligible = preFilter ? preFilter(base) : base;
    // Per SelectTargetUnitInOrder's own semantics, an empty GetAIFilteredTargets result
    // isn't "no valid target" so much as "this specific narrowing failed" - but here it's
    // the very FIRST candidate pool (not a mid-chain filter), so there's nothing left to
    // fall back to; return null (translated by callers into "this effect does nothing").
    if (eligible.length === 0) return null;
    return selectTargetUnitInOrder(eligible, chain, rng);
}

// =============================================================================
// PROXIMITY (RangeType.SelectMultiple, value 2) expansion
// =============================================================================
/**
 * [CONFIRMED byte-for-byte] ReDriveBattleCore.AbilityEffect.AbilityEffectBase$$
 * SelectTargets - the method that turns a resolved RangeType into the actual
 * TargetUnitIdList - does NOT re-run any AI heuristic for PROXIMITY. It resolves a
 * "primary" unit EXACTLY the same way it does for TARGET (a plain `Id == selectedId`
 * lookup, where `selectedId` is whatever SelectTargetInAIAction already picked in FULL
 * AUTO, or a manually-tapped target's id otherwise), then - only for PROXIMITY - adds up
 * to two more units from the SAME side-filtered candidate pool: whichever has the
 * NEXT-LOWER `PositionId` (via `.Where(u => u.PositionId < primary.PositionId)
 * .OrderByDescending(u => u.PositionId).FirstOrDefault()`) and whichever has the
 * NEXT-HIGHER `PositionId` (the mirror, `.OrderBy(...).FirstOrDefault()`). Both are
 * "nearest in that direction that exists", not "position ± 1 exactly" - a gap (e.g. a
 * dead/removed unit) is skipped over automatically since the ordering just looks at
 * whoever's left in the candidate pool. Final list, in this exact order, is [primary,
 * belowNeighbor?, aboveNeighbor?] with nulls dropped (a genuine dedupe/uniqueness check
 * exists in the source too, via a HashSet-like add, but it can never actually trigger
 * here since below/above are strictly < / > primary's position and so can never equal it
 * or each other).
 *
 * `PositionId` is assigned once, per BattleUnit, at construction time from a plain
 * constructor parameter (`BattleUnit..ctor(id, mstId, team, parameter, positionId, ...)`)
 * - i.e. it's just "whatever position this unit was placed in when the battle started",
 * with no other logic surfaced in this dump for how that number gets chosen. This
 * codebase's own `KiokuState.posIdx` is already exactly that same concept (assigned as
 * the roster array index at team-build time, `kiokus.map((k, i) => new KiokuState(i,
 * ...))`, and already independently used as the final tiebreak level in `compareTurnOrder`)
 * - so posIdx is used directly here as PositionId with no translation needed.
 */
export function expandProximity(primary: KiokuState, sameSideCandidates: KiokuState[]): KiokuState[] {
    const alive = filterAlive(sameSideCandidates);
    const below = alive
        .filter(u => u.posIdx < primary.posIdx)
        .reduce<KiokuState | null>((best, u) => (!best || u.posIdx > best.posIdx) ? u : best, null);
    const above = alive
        .filter(u => u.posIdx > primary.posIdx)
        .reduce<KiokuState | null>((best, u) => (!best || u.posIdx < best.posIdx) ? u : best, null);
    return [primary, below, above].filter((u): u is KiokuState => u != null);
}
