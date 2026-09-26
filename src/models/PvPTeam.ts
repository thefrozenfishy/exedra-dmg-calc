import { Ailment, KiokuRole } from "../types/enums";
import { type AffectedUnitNotice, type BattleEvent, BattleState, aggro, maxMeters, mpGainFromAction, PassiveSkill, SkillDetail, skillDetailId, SkillKey, targetRange, TargetType, targetTypeToLvl, TargetTypeLookup } from "../types/KiokuTypes";
import { skillDetails } from "../utils/helpers";
import { isConditionSetActive, isConditionSetActiveForPvP, isActiveConditionSetMet, isTimingActive as isTimingCorrect, ProcessTiming, conditionSetRequiresActorIsSelf } from "./BattleConditionParser";
import { PvPKioku } from "./PvPKioku";
import { damageBaseTypeFromEffectType, getAttackDamageResult, getSlipDamageResult, getAdditionalDamageBase, getFinalDamageExtra, damageCutByBarrier, DamageBaseType, BattleType, PVP_POLICY } from "./DamageCalculator";
import { mergeAccumEffect, isEligibleForEffect, rollAppliesEffect, getProcessedDef, getMaxComboActionNum, getFinalDamageRatio, getProcessedSpeedWithBreakdown } from "./UnitStateEngine";
import { elementMap } from "../types/enums";
import { EFFECT_TARGET_SIDE } from "./EffectTargetSide";
import { selectFullAutoTarget, expandProximity, filterAlive } from "./AITargetSelector";
import { UNIT_STATE_TYPES } from "./StateAddFilter";
import { SkillType, getVariationBreakPoint, decreaseBreakPoint, increaseBreakedDamageReceiveRate } from "./BreakPoint";

// Which BreakPoint.GetDecreaseValue table an action uses (SetActiveSkillInfo's SkillType).
function skillTypeOf(t?: TargetType): SkillType {
    if (t === TargetType.skillId) return SkillType.ActiveSkill
    if (t === TargetType.specialId) return SkillType.SpecialAttack
    if (t === TargetType.fuaId) return SkillType.AdditionalSkill
    return SkillType.NormalAttack
}

const f32 = Math.fround;
let globalTurnShiftCounter = 0;

/**
 * REVISION 2 effect-list notes
 * ==============================
 * Cross-checked against the person's real enums.ts (`otherBuffsAndDebuffs` +
 * `scoreAttackRelevantBuffsAndDebuffs`), which lists every ability effect type string
 * actually used by their tooling. Anything below marked [CONFIRMED] appears verbatim in
 * one of those two objects. Anything marked [IMPLEMENTED] has real gameplay logic in
 * applyEffect(). Anything marked [RECOGNIZED ONLY] is classified here (so targeting and
 * buff/debuff counting work) but has NO gameplay effect yet - it hits applyEffect's
 * fallback branch, which logs a warning instead of silently doing nothing. See
 * MISSING_AND_UNCERTAIN.md for the full rationale on why each RECOGNIZED-ONLY mechanic
 * wasn't implemented (mostly: needs game-specific data/mechanics not present in any
 * provided file - ZONE/TSUBAME/UNIQUE_* character-specific systems). CHARGE is
 * implemented as of this pass (see applyEffect), and the probability-roll-to-apply system
 * mentioned in earlier revisions of this comment is now implemented too - see
 * rollAppliesEffect (UnitStateEngine.ts) and storeTimedEffect.
 */
const friendlySkills = [
    "CONSUME_CHARGE_POINT", // [CONFIRMED] [IMPLEMENTED] see applyEffect + AITargetSelector.ts
    "CUTOUT",
    "GAIN_CHARGE_POINT", // [CONFIRMED] [IMPLEMENTED, FIXED] see applyEffect + AITargetSelector.ts
    "GAIN_EP_RATIO",
    "GAIN_EP_FIXED",
    "HASTE",
    "UP_ATK_RATIO",
    "UP_BREAK_DAMAGE_RECEIVE_RATIO",
    "UP_EP_RECOVER_RATE_RATIO",
    "UP_GIV_BREAK_POINT_DMG_FIXED",
    "UP_GIV_DMG_RATIO",
    "UP_SPD_FIXED",
    "UP_SPD_RATIO",
    "RECOVERY_HP",
    "REMOVE_ALL_DEBUFF",
    "ADDITIONAL_TURN_UNIT_ACT", // [CONFIRMED] grants the unit itself an immediate extra action - see performAction()
    "RE_ACTION_TURN_UNIT_ACT",  // [CONFIRMED string, RECONSTRUCTED semantics] treated as an alias of ADDITIONAL_TURN_UNIT_ACT - see MISSING_AND_UNCERTAIN.md
    "SHIELD",   // [CONFIRMED class ShieldUnitState exists] %-based damage cut, limited # of hits (remainCount)
    "BARRIER",  // [CONFIRMED class BarrierUnitState exists] flat HP-pool damage absorption
    "UP_WEAK_ELEMENT_DMG_RATIO", // [CONFIRMED via ScoreAttackTeam.ts] adds onto the weak-hit multiplier only
    "UP_ELEMENT_DMG_RATE_RATIO", // [CONFIRMED] unconditional elemental give-damage bonus, filtered by element via isEligibleForEffect
    "UP_GIV_DMG_ACCUM_RATIO",    // [CONFIRMED] "Accumulated DMG+"
    "UP_GIV_SLIP_DMG_RATIO",     // [CONFIRMED] "DOT DMG+" - only affects DOT ticks, see UnitStateEngine.ts
    "DWN_RCV_DMG_RATIO",         // [CONFIRMED] "Decrease DMG Taken" - a defensive buff despite the DWN_ prefix
    "UP_HP_RATIO",               // [CONFIRMED] [RECOGNIZED ONLY] max-HP-% increase - not implemented, see MISSING_AND_UNCERTAIN.md
    "ADD_BUFF_TURN", "ADD_BUFF_TURN_IMM",     // [CONFIRMED] [IMPLEMENTED] extends active buff durations - see applyEffect
    "GAIN_SP_FIXED",   // [CONFIRMED] [IMPLEMENTED] flat add to the attack/skill alternation counter
    "REMOVE_ALL_ABNORMAL", // [CONFIRMED] [IMPLEMENTED] cleanses Ailment-type states, mirrors REMOVE_ALL_DEBUFF
    "ADDITIONAL_DAMAGE",   // [CONFIRMED] [IMPLEMENTED] flat bonus damage folded into the next hit - see applyEffect's DMG_ branch
    "RECOVERY_HP_ATK",     // [CONFIRMED] [IMPLEMENTED] heal scaling off the healer's own ATK
    "CONTINUOUS_RECOVERY", // [CONFIRMED] [IMPLEMENTED] heal-over-time, mirrors the DOT tick pattern
    "UP_HATE",             // [CONFIRMED] [IMPLEMENTED, CORRECTED] contributes to getThreatWeight() while active - see UnitStateEngine.ts. No longer a permanent mutation of `aggro`, which was both unreachable for real (timed) instances and wrong even for a hypothetical untimed one - see applyEffect's comment.
    "DWN_HATE",            // [CONFIRMED string exists in UnitStateFactory's dispatch table] [IMPLEMENTED] the debuff mirror of UP_HATE - subtracts from getThreatWeight() while active. Placed in friendlySkills by assumed symmetry with UP_HATE (a unit reducing its OWN or an ally's threat is a supportive act); not independently confirmed which side it targets.
    "CHARGE",              // [CONFIRMED] [IMPLEMENTED] see applyEffect + AITargetSelector.ts
    "REVIVAL_RATIO",       // [CONFIRMED] [NEWLY IMPLEMENTED - was entirely absent] see applyEffect + AITargetSelector.ts's revivalChain
    "COMBO",               // [CONFIRMED] [NEWLY IMPLEMENTED - required restructuring the turn loop, was entirely absent] grants `value1` total actions this turn (the MAX active COMBO effect wins, they don't stack additively) - see useAttackOrSkill, getMaxComboActionNum (UnitStateEngine.ts), and AITargetSelector.ts's comboChain. Not rare: 259 real occurrences across active+passive skill data.
    "REMOVE_ALL_BUFF",     // [CONFIRMED] [IMPLEMENTED] see applyEffect - dispels active friendlySkills-classified effects. Its AI targeting chain is independently confirmed (AITargetSelector.ts); the removal logic itself mirrors REMOVE_ALL_DEBUFF/REMOVE_ALL_ABNORMAL rather than being separately decompiled.
    "REMOVE_ALL_UNABLE_ACTION", // [NEWLY ADDED] [IMPLEMENTED] confirmed real (AbilityEffectFactory dispatch table) but was entirely unclassified/unhandled before this pass - cleanses STUN. See applyEffect + AITargetSelector.ts (shares REMOVE_ALL_DEBUFF/ABNORMAL's base targeting chain).
    "UP_EFFECT_HIT_RATE_RATIO", "UP_ABNORMAL_HIT_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] now consumed by rollAppliesEffect (UnitStateEngine.ts) as the caster-side hit-rate bonus for the buff/debuff/aliment probability-to-apply roll - moved out of RECOGNIZED-ONLY now that roll exists. A generic stat-buff UnitState with no bespoke Triggering of its own, so "implemented" here means "correctly stored and then read back", not a dedicated handler branch in applyEffect.
    "UP_EFFECT_PARRY_RATE_RATIO", "UP_ABNORMAL_PARRY_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] same as above but the target-side resist half of the same roll (reduces the caster's effective hit rate against this unit specifically).
    // --- RECOGNIZED ONLY below (classified for targeting/counting; no gameplay logic) ---
    // CONSUME_COUNT_POINT/GAIN_COUNT_POINT/COUNT: [CORRECTED] these are REAL strings (all
    // three appear in the actual base_data JSON skill/passive tables - confirmed by
    // direct inspection, not just absence-of-evidence), but they are NOT part of either
    // generic dispatch table found in BattleUnit.c (AbilityEffectFactory's 27 special
    // types, or UnitStateFactory's 93 generic UnitState types - both exhaustively
    // enumerated, see MISSING_AND_UNCERTAIN.md). They occur a combined ~11 times total
    // out of 32,000+ effect-detail rows, all with value1=value2=0 and description text
    // describing a bespoke "sigil" mechanic (+1 per hit received, cap 20) that isn't
    // expressible via the standard value1-5 slots at all. This is the same shape as
    // TSUBAME/ZONE_STACK/UNIQUE_* below: a character-specific hardcoded mechanic, not a
    // generic engine system - implementing it generically (as this scaffolding implies)
    // would be inventing behavior. Left classified (so targeting/counting doesn't choke
    // on them) but not implemented; if a specific roster character actually needs this,
    // that character's own class would need to be found and decompiled.
    "CONSUME_COUNT_POINT", "GAIN_COUNT_POINT", "COUNT",
    "CONSUME_ZONE_STACK", "GAIN_ZONE_STACK", "ZONE_EXPAND", "ZONE_STACK", "UNIQUE_ZONE",
    "SWITCH_SKILL", "TSUBAME", "TSUBAME_CORE", "TSUBAME_LINK",
    "UNIQUE_BUFF", "UNIQUE_BUFF_ACCUM", "UNIQUE_10030301", "UNIQUE_10070201",
    "RESET_UNIQUE_BUFF",
    "UP_BREAK_EFFECT", "UP_HEAL_RATE_RATIO", "REGAIN_ATK",
    "UP_BUFF_EFFECT_VALUE", "DWN_BUFF_EFFECT_VALUE", // pre-battle stat-scaling traits, already applied once in PvPKioku.ts - listed here only so they're classified if they somehow appear as in-battle effects too
]

const enemySkills = [
    "DMG_ATK",
    "DMG_DEF",
    "DMG_HP", // [CONFIRMED via ReDriveBattleCore.AbilityEffect.DmgHpAbilityEffect]
    "DWN_ATK_RATIO",
    "DWN_SPD_RATIO",
    "DWN_DEF_RATIO",
    "WEAKNESS", // [CONFIRMED] this is the Aqua-element Ailment (elementAlimentMap), not a generic "vulnerability" flag - see Ailment handling below
    "SLOW",
    "UP_RCV_DMG_RATIO", // [CONFIRMED] "DMG Taken%+" - a debuff despite the UP_ prefix
    "STUN", // [CONFIRMED string] [IMPLEMENTED, RECONSTRUCTED turn-skip mechanics] now wired into the turn engine - see KiokuState.canNotAction and useAttackOrSkill/useUltimate. The bool field's existence/read-site is confirmed; the exact turn-consumption mechanics (does the gauge fully reset, do TURN_START passives still fire, etc.) are a reasonable reconstruction, not decompiled - see MISSING_AND_UNCERTAIN.md
    "POISON_ATK", "POISON_DEF", "POISON_HP", // [CONFIRMED classes exist] DOT, ticks at end of turn
    "BURN_ATK", "BURN_DEF", "BURN_HP",       // [CONFIRMED classes exist]
    "BLEED_ATK", "BLEED_DEF", "BLEED_HP",    // [CONFIRMED classes exist]
    "CURSE_ATK", "CURSE_DEF", "CURSE_HP",    // [CONFIRMED classes exist]
    "VORTEX_ATK", // [CONFIRMED string; RECOGNIZED ONLY - not wired into tickDotEffects, no _DEF/_HP variant confirmed to exist]
    "UP_GIV_VORTEX_DMG_RATIO", // [CONFIRMED string; RECOGNIZED ONLY, pairs with VORTEX_ATK]
    "ADD_DEBUFF_TURN", "ADD_DEBUFF_TURN_IMM", // [CONFIRMED] [IMPLEMENTED] extends active debuff durations
    "DWN_ELEMENT_RESIST_RATIO", "DWN_ELEMENT_RESIST_ACCUM_RATIO", // [CONFIRMED] see UnitStateEngine.getElementResistRate
    "IMM_SLIP_DMG", // [CONFIRMED string] [IMPLEMENTED] DOT immunity - see tickDotEffects
    "REFLECTION_RATIO", // [CONFIRMED string; RECOGNIZED ONLY] damage reflection - not implemented, needs a "reflect N% of the next hit back at the attacker" hook that touches the DMG_ pipeline in applyEffect; flagged rather than guessed at
    "RESET_UNIQUE_DEBUFF", "UNIQUE_DEBUFF", "UNIQUE_DEBUFF_ACCUM", // RECOGNIZED ONLY, character-specific
    "UP_EFFECT_PARRY_RATE_RATIO", "UP_ABNORMAL_PARRY_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] see friendlySkills' copy of this same pair for what changed - this entry is pre-existing and now redundant (friendlySkills.includes is checked first in completeAction, so this array's copy is presently unreachable) rather than wrong; left in place rather than deleted since it's not causing any issue and this pass isn't the place to relitigate which side these belong on.
    "UP_RCV_BREAK_POINT_DMG_RATIO", // RECOGNIZED ONLY
    "UP_DEBUFF_EFFECT_VALUE", "DWN_DEBUFF_EFFECT_VALUE", // pre-battle trait scaling, classified only
]

// Ability effect types whose damage is dealt as a DOT tick at end-of-turn rather than
// on direct application. See ReceiveSlipDamageUnitStateBase in DamageCalculator.ts's
// getSlipDamageResult(). Mapped to the DamageBaseType their name encodes (Atk/Def/Hp).
const DOT_EFFECT_DAMAGE_BASE_TYPE: Record<string, DamageBaseType> = {
    POISON_ATK: DamageBaseType.ATK, POISON_DEF: DamageBaseType.DEF, POISON_HP: DamageBaseType.HP,
    BURN_ATK: DamageBaseType.ATK, BURN_DEF: DamageBaseType.DEF, BURN_HP: DamageBaseType.HP,
    BLEED_ATK: DamageBaseType.ATK, BLEED_DEF: DamageBaseType.DEF, BLEED_HP: DamageBaseType.HP,
    CURSE_ATK: DamageBaseType.ATK, CURSE_DEF: DamageBaseType.DEF, CURSE_HP: DamageBaseType.HP,
}

// [CONFIRMED via the person's real Ailment enum] The 7 status-ailment ("abnormal
// state") type prefixes/exact-names. Used for CompareContent.ABNORMAL_STATE_COUNT (see
// BattleConditionParser.ts) and REMOVE_ALL_ABNORMAL. Matches
// ReDriveBattleCore.UnitState.AbnormalUnitStateBase's type-hierarchy check
// (b__8_1 predicate) reconstructed as a name-based check since this port has no class
// hierarchy to check `instanceof` against.
const ALIMENT_PREFIXES = Object.values(Ailment) as string[]; // ["BURN","CURSE","POISON","STUN","VORTEX","WEAKNESS","BLEED"]
export function isAlimentEffect(abilityEffectType: string): boolean {
    return ALIMENT_PREFIXES.some(prefix => abilityEffectType === prefix || abilityEffectType.startsWith(prefix + "_"));
}

// Ability effect types that use IAccum stacking semantics (see UnitStateEngine.ts's
// mergeAccumEffect). [CONFIRMED to exist as game content per enums.ts, though the exact
// per-family completeness (e.g. whether DWN_ATK_ACCUM_RATIO exists) is still
// per-entry-flagged in UnitStateEngine.ts].
const ACCUM_RATIO_EFFECT_TYPES = new Set([
    "UP_ATK_ACCUM_RATIO", "DWN_ATK_ACCUM_RATIO",
    "UP_DEF_ACCUM_RATIO", "DWN_DEF_ACCUM_RATIO",
    "UP_CTR_ACCUM_RATIO", "UP_CTD_ACCUM_RATIO",
    "UP_GIV_DMG_ACCUM_RATIO", "DWN_ELEMENT_RESIST_ACCUM_RATIO",
    "UP_SPD_ACCUM_RATIO", "DWN_SPD_ACCUM_RATIO",
])

function maxBreak(rarity: number, role: KiokuRole): number {
    switch (role) {
        case KiokuRole.Defender:
            return rarity === 5 ? 195 : 162
        case KiokuRole.Attacker:
        case KiokuRole.Breaker:
            return rarity === 5 ? 150 : 125
        case KiokuRole.Buffer:
        case KiokuRole.Debuffer:
            return rarity === 5 ? 165 : 137
        case KiokuRole.Healer:
            return rarity === 5 ? 180 : 150
    }
}

// A FUA (ADDITIONAL_SKILL_ACT) trigger record: which unit performs the follow-up skill,
// and which unit was involved in triggering it (so the FUA can target them specifically -
// see ReDriveBattleCore.UnitState.AdditionalSkillActTriggerUnitStateBase$$GetAdditionalSkillAct,
// which splits targetUnitId/targetFriendUnitId by whether the trigger-target shares the
// caster's team).
interface FuaTrigger {
    caster: KiokuState;
    triggerTarget?: KiokuState;
}
type FuaMap = Record<number, FuaTrigger>;

// AffectedUnitNotice op_Addition: one notice per unit per skill, hits summed and flags OR-ed.
function mergeNotice(a: AffectedUnitNotice | undefined, b: AffectedUnitNotice): AffectedUnitNotice {
    if (!a) return b
    const out: any = { ...a }
    for (const [key, v] of Object.entries(b)) {
        if (typeof v === "number") out[key] = (out[key] ?? 0) + v
        else if (typeof v === "boolean") out[key] = !!out[key] || v
        else if (v !== undefined) out[key] = v
    }
    return out
}

// Follow-ups currently executing (see triggerFua).
const runningFollowUps = new Set<string>()

function mergeFuaMaps(a: FuaMap, b: FuaMap): FuaMap {
    return { ...a, ...b };
}

export // UnityEngine.Mathf.Approximately(a, b)
function mathfApproximately(a: number, b: number): boolean {
    return Math.abs(b - a) < Math.max(1e-6 * Math.max(Math.abs(a), Math.abs(b)), 1.401298e-45 * 8)
}

export function isFriendlyEffect(type: string): boolean {
    const side = EFFECT_TARGET_SIDE[type]
    return side ? side === "Friend" : friendlySkills.includes(type)
}
export function isOpponentEffect(type: string): boolean {
    const side = EFFECT_TARGET_SIDE[type]
    return side ? side === "Opponent" : enemySkills.includes(type)
}

// Attack element for ADDITIONAL_DAMAGE: the attacker's own character element as the
// numeric TargetElementType used in skill data (inverse of enums.elementMap).
function elementNumberOf(unit: KiokuState): number {
    const hit = Object.entries(elementMap).find(([, name]) => name === unit.kioku.data.element)
    return hit ? Number(hit[0]) : 0
}

export class KiokuState {
    posIdx: number;
    teamLabel: string

    kioku: PvPKioku;
    maxBreakGauge: number
    maxMp: number
    aggro: number

    team: PvPTeam

    // [CONFIRMED 3.19 - R7] Passive skills are TRIGGERS (PassiveSkill -> AbilityEffectLauncher),
    // not states. `passiveSkills` is the trigger bank; nothing in it affects stats.
    // `passiveEffectDetails` holds the PERMANENT (turn 0) states a trigger has actually added to
    // this unit (UnitCondition.AddUnitState). Timed states go to activeEffectDetails.
    passiveSkills: Map<string, PassiveSkill> = new Map()
    passiveEffectDetails: Map<string, PassiveSkill> = new Map()
    // NEW: `_applierState` tracks the KiokuState that applied this effect (not just
    // their display name, already tracked separately as `applier: string`) - needed so
    // DOT ticks can scale off the APPLIER's stat rather than the sufferer's, per the
    // corrected reading of ReceiveSlipDamageUnitStateBase - see tickDotEffects() and
    // DamageCalculator.ts's getSlipDamageResult header comment.
    activeEffectDetails: Map<string, SkillDetail & { _accumCount?: number; _isExemptPassingTurnOnce?: boolean; _applierState?: KiokuState }> = new Map()

    currentRemainingBreakGauge: number
    currentSpd = 0  // processed speed (float, BattleUnit.GetProcessedSpeed)
    // [CONFIRMED 3.19] UnitTurnGauge: GaugeValue (+0x14) is the TIME until this unit acts,
    // Reset to RawGaugeResetValue (10000f) / speed; Speed (+0x18) is the speed the gauge was
    // last computed with. See turn-gauge methods below.
    turnGauge = 0
    turnGaugeSpeed = 0
    // Kept for the UI ("distance left"): what the previous revision tracked directly.
    get currentMetersRemaining(): number { return f32(this.turnGauge * this.turnGaugeSpeed) }
    currentMp = 0
    currentHpPercent = 100
    currentMpGain = 1
    // [CONFIRMED] ReDriveBattleCore.UnitCondition's `ChargePoint`/`MaxChargePoint` int
    // pair (read together as one 8-byte load in ChargeAbilityEffect$$Triggering - see
    // applyEffect's CHARGE case). Unlike maxMp/maxHp, the MAX side of this pair is NOT a
    // fixed character stat - CHARGE can overwrite it at runtime (e.g. a support effect
    // that grants a charge gauge to a Kioku whose kit doesn't innately have one), so it
    // has to live here as mutable per-battle state rather than being read straight off
    // `kioku.maxMagicStacks` everywhere. Starts at whatever the character's own master
    // data says (0 for anyone without an innate charge-gauge kit).
    currentMagic = 0
    currentMaxMagic: number

    // [CONFIRMED] ReDriveBattleCore.Act.ComboTurnUnitAct$$get_ActionStep/set_ActionStep:
    // a 1-indexed "which action of the current combo burst is this" counter, confirmed
    // via ActReferee$$AddComboUnitTurnActs's own loop (`for (actionStep = 1; actionStep
    // <= actionNum; actionStep++)`). 0 = not currently mid-combo-burst (a plain single
    // action doesn't go through ComboTurnUnitAct at all, only TurnUnitAct, which has no
    // such property) - set to i+1 for each sub-action inside useAttackOrSkill's combo
    // loop, reset to 0 once the whole burst finishes. Backs CompareContent.
    // COMBO_ACTION_STEP in BattleConditionParser.ts.
    currentComboActionStep = 0

    // Real HP tracking. Ported from ReDriveBattleCore.BattleUnit's
    // _HP_k__BackingField / _MaxHP_k__BackingField / Attack() / SetHP().
    maxHp: number
    currentHp: number

    // Flat HP-pool barrier (ReDriveBattleCore.UnitState.BarrierUnitState). Separate
    // from the % based Shield, which lives entirely inside activeEffectDetails.
    barrierEndurance = 0
    maxBarrierEndurance = 0

    // [CONFIRMED field] `BattleUnit.WeakElements: ElementType[]` (dump.cs) - a REAL,
    // mutable per-unit runtime list, not a static character trait. Empty by default;
    // nothing in the provided files populates it for PvP (no "expose weakness"-style
    // effect was found), so weak-hit bonus damage never triggers unless you wire
    // something up to push into this array. See DamageCalculator.ts's
    // isMatchWeakElement and MISSING_AND_UNCERTAIN.md.
    weakElements: number[] = []

    // [CONFIRMED 3.19] BattleUnit.BreakedDamageReceiveRate (+0x80): damage multiplier in % while
    // broken (GetAppliedDamageOfBreakSituation). PvP start value from the policy table
    // (initialBreakDamageReceiveRate 1000 = 100.0%, max 2000 = 200.0%). The per-hit increase
    // while broken (DamageAbilityEffectBase$$IncreaseBreakedDamageReceiveRate) is not modelled
    // yet - see MISSING_AND_UNCERTAIN.md.
    breakedDamageReceiveRate = PVP_POLICY.initialBreakDamageReceiveRate / 10

    // Incremented by an active ADDITIONAL_TURN_UNIT_ACT (or RE_ACTION_TURN_UNIT_ACT -
    // treated as an alias, see MISSING_AND_UNCERTAIN.md) effect. Grants the SAME unit an
    // immediate extra action - see PvPTeam.performAction.
    pendingBonusTurns = 0

    // NEW: what happened to this unit the last time it was the target of an action -
    // read by BattleConditionParser.ts's per-unit CompareContent checks (101-110:
    // DMG/DMG_RATIO/IS_KILLED/IS_RECOVERY/IS_BARRIER_*/IS_WEAK_ELEMENT_ATTACKED/
    // IS_DURING_ATTACK). Cleared at the start of each new action (see
    // PvPTeam.performAction) so a stale notice from 3 turns ago doesn't leak into an
    // unrelated condition check - matches the source's notice being a fresh,
    // single-action-scoped object (ReDriveBattleCore.AffectedUnitNotice).
    lastNotice?: AffectedUnitNotice

    // Debug helpers
    currSpdEffects: [number, string, string?][] = []

    isBroken = false
    breakCount = 0
    // Tiebreak stamp for exact-tie turn order, see globalTurnShiftCounter above.
    //
    // VERIFIED against ReDriveBattleCore.TurnReferee$$SortByTurnOrder /
    // <SortByTurnOrder>b__24_0..3 (all four tiebreak lambdas individually decompiled,
    // no ambiguity): the source's chain is exactly
    //   OrderBy(GaugeValue).ThenByDescending(TurnOrderPriority)
    //     .ThenBy(u => u.Team == BattleUnit.TeamType.Enemy(1) ? 1 : 0).ThenBy(u => u.Id)
    // BattleUnit.TeamType is confirmed (dump.cs): Ally = 0, Enemy = 1. So on an EXACT
    // tie (same gauge value, same priority), Team==Ally(0) sorts BEFORE Team==Enemy(1) -
    // i.e. the ALLY side (team1 in this file's convention, matching PvPBattle.ts's
    // team1->"allies") goes first. compareTurnOrder() below already implements exactly
    // this (`aTeam = a.team === team1Ref ? 0 : 1`) - NO CODE CHANGE was needed here.
    //
    // *** Addressing your note about mirror matchups: per this decompiled evidence, the
    // ALLY side should win an exact tie, not the enemy - the opposite of what you've
    // observed empirically. I don't have a way to resolve that contradiction from the
    // decompilation alone, but I'd bet on your OWN "floating point precision" hypothesis
    // over a mistake in this specific tie-break reading, for a concrete reason: the
    // PRIMARY sort key (GaugeValue, i.e. secondsUntilAbleToAct here) is computed as
    // `metersRemaining / speed` in float32 (Math.fround throughout this file). Two
    // "identical" mirrored teams only produce BIT-IDENTICAL float32 results if every
    // floating-point operation that fed into each unit's speed/gauge happens in the
    // EXACT same order for both sides. If your team-setup code (or this file's own
    // Map/array iteration for passives/buffs) ever processes team1's units and team2's
    // units through code paths that sum buffs in a different order - even
    // mathematically-equivalent orders - IEEE 754 rounding can make one side's speed a
    // few ULPs higher or lower, which is enough to break the "tie" before this
    // tiebreaker chain is ever consulted. That would make the enemy-goes-first pattern
    // you're seeing a side effect of setup/iteration order, not this tiebreak rule. To
    // confirm: log `a.secondsUntilAbleToAct().toPrecision(20)` for both units on a
    // mirror-tie turn and see if they're actually unequal at the bit level despite
    // "looking" tied when displayed normally. If they truly are bit-equal and the enemy
    // STILL acts first in-game, then this specific tiebreak reading needs revisiting -
    // please let me know and I'll re-examine the four lambda bodies.
    turnOrderPriority = 0

    stateGen: (actor: KiokuState, target: KiokuState, actionType?: TargetType, trueActorUnit?: KiokuState, mainTargetUnit?: KiokuState, notice?: AffectedUnitNotice) => BattleState

    constructor(posIdx: number, teamLabel: string, team: PvPTeam, kioku: PvPKioku, stateGen: KiokuState["stateGen"]) {
        this.posIdx = posIdx
        this.teamLabel = teamLabel
        this.team = team
        this.kioku = kioku
        this.currentRemainingBreakGauge = maxBreak(kioku.data.rarity, kioku.data.role)
        this.maxBreakGauge = this.currentRemainingBreakGauge
        this.aggro = aggro[kioku.data.role]
        this.maxMp = kioku.data.ep
        this.currentMaxMagic = kioku.maxMagicStacks
        this.stateGen = stateGen
        // ReDriveBattleCore.BattleUnit's HP is initialized from the character's base HP
        // stat (BattleParameter.HP), i.e. kioku.getBaseHp() here - no in-battle buffs
        // apply to the starting HP pool itself, only to incoming/outgoing damage.
        this.maxHp = kioku.getBaseHp()
        this.currentHp = this.maxHp
    }

    // [CONFIRMED] ReDriveBattleCore.BattleUnit$$get_IsDead : `HP <= 0` (the source also
    // checks a multi-gauge-HP-bar CurrentHpGaugeCount<2 condition used for PvE raid
    // bosses with multiple HP bars; not applicable to this 1v1 PvP context, so omitted).
    get isDead(): boolean {
        return this.currentHp <= 0
    }

    // [RECONSTRUCTED] ReDriveBattleCore.UnitCondition$$get_CanNotAction/set_CanNotAction
    // is a plain mutable bool field in the source, not a computed property - confirmed
    // it exists and is exactly what BattleConditionParser.ts's CAN_NOT_ACTION condition
    // reads, but NOT confirmed exactly where/how the source SETS it to true (StunUnitState
    // itself has no Triggering/IsActive override of its own in the provided dump - only a
    // ctor and cosmetic icon/VFX-name getters - so the actual set-site lives somewhere
    // this dump didn't surface, most likely UnitCondition.AddUnitState/RemoveUnitState or
    // a shared "abnormal condition" base class checking for StunUnitState specifically).
    // Implemented here as a computed getter instead of a mirrored mutable field - "does
    // this unit currently have an active Stun effect" - which should be behaviorally
    // equivalent for every case this simulator can reach (no code path removes a state
    // without it leaving activeEffectDetails), and avoids needing a second field to keep
    // in sync. If you want the exact source mechanics (e.g. whether a stunned unit's turn
    // gauge fully resets vs. partially carries over, which this file currently doesn't
    // special-case at all - see useAttackOrSkill), TurnActSystem/TurnReferee would need
    // decompiling next.
    // [CONFIRMED 3.19] UnitCondition$$get_CanNotAction (RVA 0x7388e0) just returns a stored
    // bool field (+0x38) that is set when an unable-action state (STUN) is added - it does
    // NOT re-evaluate condition sets. The previous version went through filteredEffects(),
    // i.e. evaluated every condition set, and a condition that itself checks
    // CompareContent.CAN_NOT_ACTION recursed forever (stack overflow on real teams).
    get canNotAction(): boolean {
        for (const d of this.activeEffectDetails.values()) if (d.abilityEffectType === "STUN") return true
        return false
    }

    // [CONFIRMED] ReDriveBattleCore.BattleUnit$$SetHP (clamp) + $$Attack (delta + return
    // actual amount lost).
    takeDamage(damage: number): number {
        const before = this.currentHp
        this.currentHp = Math.max(0, Math.min(this.maxHp, before - damage))
        return before - this.currentHp
    }

    heal(amount: number, source?: KiokuState): number {
        const before = this.currentHp
        this.currentHp = Math.max(0, Math.min(this.maxHp, before + amount))
        const healed = this.currentHp - before
        if (healed > 0) this.team.eventLog.push({ kind: "heal", source: source?.kioku.name, target: this.kioku.name, amount: healed, sourceIsTeam1: source?.team.isTeam1, targetIsTeam1: this.team.isTeam1 })
        return healed
    }

    // [CONFIRMED 3.19] BreakPoint$$Decrease, on the gauge reaching 0 (called from BreakPoint.ts).
    onBreak() {
        if (this.isBroken) return
        this.isBroken = true
        this.breakCount++
        // Turn gauge pushed back by BreakTurnGaugeSlowRatio/1000 (PvP policy id 20: 250 -> 0.25).
        this.addGaugeRate(0.25, -(++globalTurnShiftCounter))
        // BreakedDamageReceiveRate = InitialBreakedDamageReceiveRate / 10 (policy id 21: 1000 -> 100%).
        this.breakedDamageReceiveRate = PVP_POLICY.initialBreakDamageReceiveRate / 10
        // [CONFIRMED] ReDriveBattleCore.TurnReferee (team-level tally, consumed by
        // BattleConditionParser's CompareContent.BREAK_UNIT_TOTAL_COUNT, 306) -
        // cumulative across the whole battle, never reset.
        this.team.breakedUnitTotalCount++
    }

    // Safety net for gauge changes outside BreakPoint.decreaseBreakPoint.
    resolveBreak() {
        if (this.maxBreakGauge >= 1 && this.currentRemainingBreakGauge < 1) this.onBreak()
    }

    // [CONFIRMED 3.19] ActExecutor$$TurnBegin: a broken unit gets BreakPoint.ResetValue (gauge back
    // to max) and BreakedDamageReceiveRate = 0 at the start of its own turn.
    exitBreak() {
        if (this.isBroken) {
            this.isBroken = false
            this.currentRemainingBreakGauge = this.maxBreakGauge
            this.breakedDamageReceiveRate = 0
        }
    }

    // [CONFIRMED 3.19] UnitTurnGauge$$Reset (0x15cf070): speed = GetProcessedSpeed(),
    // TurnOrderPriority = 0, GaugeValue = 10000f / speed.
    resetDistanceRemaining() {
        this.updateSpd(false)
        this.turnGaugeSpeed = this.currentSpd
        this.turnOrderPriority = 0
        this.turnGauge = f32(maxMeters / this.turnGaugeSpeed)
    }

    // [CONFIRMED 3.19] UnitTurnGauge$$AddGaugeValue / SubtractGaugeValue (0x15cee60 / 0x15cf1d0)
    // -> GetResultGaugeValueOfRateVariation (0x15ceff0): gauge = max(0, (10000f/speed) * rate + gauge).
    // SLOW adds (float)v/1000f, HASTE subtracts it; both set TurnOrderPriority.
    addGaugeRate(rate: number, priority: number) {
        const baseValue = f32(maxMeters / this.turnGaugeSpeed)
        const g = f32(f32(baseValue * f32(rate)) + this.turnGauge)
        this.turnGauge = g <= 0 ? 0 : g
        this.turnOrderPriority = priority
    }

    // [CONFIRMED] ReDriveBattleCore.UnitState.UnitStateBase$$PassingTurn:
    //   if (IsExemptPassingTurnOnce) { turnNum--; IsExemptPassingTurnOnce = false }
    //   RemainingTurn = max(0, RemainingTurn - turnNum)
    // Also ticks DOT/HoT - see tickDotEffects()/tickHotEffects().
    decrementActiveEffects() {
        this.tickDotEffects()
        this.tickHotEffects()
        const updated: typeof this.activeEffectDetails = new Map();
        for (const [key, detail] of this.activeEffectDetails) {
            if (detail.abilityEffectType == "CUTOUT") this.progressMeters()
            let turn = detail.turn;
            if (detail._isExemptPassingTurnOnce) {
                detail._isExemptPassingTurnOnce = false
            } else {
                turn = turn - 1
            }
            if (turn > 0) updated.set(key, { ...detail, turn })
        }
        this.activeEffectDetails = updated;
    }

    // [CONFIRMED shape] ReDriveBattleCore.BattleDamageCalculator$$GetSlipDamageValue via
    // ReceiveSlipDamageUnitStateBase - see DamageCalculator.getSlipDamageResult. DOT
    // damage does not crit, does not interact with break gauge, and is not reduced by
    // shields/barriers.
    //
    // CORRECTED in revision 2: scales off the APPLIER's stat (tracked via
    // `_applierState`, set in storeTimedEffect), not the sufferer's own stat - see
    // DamageCalculator.ts's getSlipDamageResult header comment for why. Falls back to
    // `this` (old, incorrect revision-1 behavior) with a warning if for some reason no
    // applier was tracked (shouldn't normally happen).
    //
    // Respects IMM_SLIP_DMG [CONFIRMED string]: a unit with an active IMM_SLIP_DMG
    // effect takes no DOT damage at all this tick. (Whether IMM_SLIP_DMG should also
    // PREVENT new DOTs from being applied in the first place, vs. just no-op existing
    // ones, isn't confirmed - implemented as the less invasive "no-op ticks" reading.)
    private tickDotEffects(): void {
        const immune = [...this.activeEffectDetails.values()].some(d => d.abilityEffectType === "IMM_SLIP_DMG");
        if (immune) return;
        for (const detail of this.activeEffectDetails.values()) {
            const damageBaseType = DOT_EFFECT_DAMAGE_BASE_TYPE[detail.abilityEffectType]
            if (damageBaseType === undefined) continue
            const applier = detail._applierState ?? this;
            const dmg = getSlipDamageResult(applier, this, detail, damageBaseType, this.team.battleType)
            const lost = this.takeDamage(dmg)
            this.team.eventLog.push({ kind: "dot", source: applier.kioku.name, target: this.kioku.name, amount: lost, sourceIsTeam1: applier.team.isTeam1, targetIsTeam1: this.team.isTeam1 })
        }
    }

    // [RECONSTRUCTED by analogy] CONTINUOUS_RECOVERY ("HoT") - not independently
    // decompiled (I didn't locate a dedicated ReDriveBattleCore.UnitState class for it
    // in the functions I extracted), but architecturally it should mirror the DOT tick
    // pattern (a stored, timed effect that fires every end-of-turn) with the sign
    // flipped (heal instead of damage). Uses the same getDamageBase-style
    // power/statValue scaling via RECOVERY_HP_ATK's formula (see applyEffect) since no
    // other heal-scaling formula is confirmed. Flagged as a reconstruction, not a
    // decompiled fact - see MISSING_AND_UNCERTAIN.md.
    private tickHotEffects(): void {
        for (const detail of this.activeEffectDetails.values()) {
            if (detail.abilityEffectType !== "CONTINUOUS_RECOVERY") continue
            const applier = detail._applierState ?? this;
            const healAmount = Math.floor(applier.kioku.getBaseAtk() * (detail.value1 / 1000));
            this.heal(healAmount, applier);
        }
    }

    currentBuffs(): string[] {
        return [...this.activeEffectDetails.values()]
            .filter(d => isFriendlyEffect(d.abilityEffectType))
            .map(d => `${d.applier} - ${d.description}`)
    }

    currentDebuffs(): string[] {
        return [...this.activeEffectDetails.values()]
            .filter(d => !isAlimentEffect(d.abilityEffectType)
                && isOpponentEffect(d.abilityEffectType))
            .map(d => `${d.applier} - ${d.description}`)
    }


    // [CONFIRMED 3.19] speed = GetProcessedSpeed (decimal, UnitStateEngine.getProcessedSpeedWithBreakdown).
    // BattleUnit$$UpdateTurnGaugeBySpeed (0x1389210) -> UnitTurnGauge$$SetSpeedAndUpdateGaugeValue
    // (0x15cf110): unless Mathf.Approximately(old, new), gauge = (oldSpeed / newSpeed) * gauge.
    updateSpd(updateGauge = true): void {
        const { speed, steps } = getProcessedSpeedWithBreakdown(this)
        this.currSpdEffects = steps.map(([step, d]) => [step, d.description, (d as any).applier])
        this.currentSpd = speed
        if (updateGauge && this.turnGaugeSpeed > 0 && !mathfApproximately(this.turnGaugeSpeed, speed)) {
            this.turnGauge = f32(f32(this.turnGaugeSpeed / speed) * this.turnGauge)
            this.turnGaugeSpeed = speed
        }
    }


    // Public wrapper so UnitStateEngine.ts (which lives outside this class) can reuse
    // the exact same "is this effect currently active" check that updateSpd() and
    // filteredEffects() already use internally.
    // Active SWITCH_SKILL state for this action type, if any (last applied wins).
    switchedSkillId(actionType: TargetType): number | undefined {
        const wanted = actionType === TargetType.skillId ? 1 : actionType === TargetType.specialId ? 2 : actionType === TargetType.attackId ? 3 : 0
        if (!wanted) return undefined
        let id: number | undefined
        for (const d of [...this.passiveEffectDetails.values(), ...this.activeEffectDetails.values()]) {
            if (d.abilityEffectType === "SWITCH_SKILL" && d.value3 === wanted && this.isEffectCurrentlyActive(d)) id = d.value1
        }
        return id
    }

    // [CONFIRMED 3.19] UnitStateBase$$IsActive checks only the state's ActiveConditionSet. The
    // start conditions belong to the trigger and were already checked when it fired.
    isEffectCurrentlyActive(detail: SkillDetail): boolean {
        return isActiveConditionSetMet(detail, this.stateGen(this, this))
    }

    updateMPGain(): void {
        let mpGain = 1
        const effs = this.filteredEffects()
        for (const detail of Object.values(effs["UP_EP_RECOVER_RATE_RATIO"] ?? {})) {
            mpGain += detail.value1 / 1000
        }
        this.currentMpGain = mpGain
    }

    getMpFromType(action: TargetType): void {
        this.getMp(mpGainFromAction[action])
    }

    getMp(mp: number): void {
        this.currentMp += Math.floor(mp * this.currentMpGain)
    }

    secondsUntilAbleToAct(): number {
        return this.turnGauge
    }

    // [CONFIRMED 3.19] TurnReferee$$ShiftNextTurn (0x15c1c20): the first unit in turn order
    // defines dt = its GaugeValue; every active unit: gauge = dt <= gauge ? gauge - dt : 0.
    traverseSeconds(seconds: number): void {
        const dt = f32(seconds)
        this.turnGauge = dt <= this.turnGauge ? f32(this.turnGauge - dt) : 0
    }

    // CUTOUT: act immediately (gauge to 0, jumps the tie-break queue).
    progressMeters(): void {
        this.turnGauge = 0
        this.turnOrderPriority = ++globalTurnShiftCounter
    }

    filteredEffects(): Record<string, SkillDetail[]> {
        const currents: Record<string, SkillDetail[]> = {};
        [...this.passiveEffectDetails.values(), ...this.activeEffectDetails.values()]
            .forEach(detail => {
                if (!isActiveConditionSetMet(detail, this.stateGen(this, this))) return
                if (!(detail.abilityEffectType in currents)) currents[detail.abilityEffectType] = []
                currents[detail.abilityEffectType].push(detail)
            })
        return currents
    }

    addEffectToBank(detail: SkillDetail) {
        if ("passiveSkillMstId" in detail) {
            this.passiveSkills.set(String(skillDetailId(detail)), { ...detail, applier: this.kioku.name })
        } else {
            console.warn("An active thing was added to the bank??")
        }
    }

    // Stores a timed buff/debuff onto `t`, honoring IAccum stacking semantics for
    // ACCUM_RATIO effect types, marking fresh (non-merged) applications exempt from
    // this turn's decrement, and tracking the applying KiokuState (`applierState`) so
    // DOT/HoT ticks can scale off the right unit's stats (see tickDotEffects/
    // tickHotEffects and DamageCalculator.ts's getSlipDamageResult).
    private storeTimedEffect(t: KiokuState, detail: SkillDetail, applier: string, applierState: KiokuState): boolean {
        // [CONFIRMED] ReDriveBattleCore.UnitCondition$$AddUnitState's actual order: a
        // per-state `CanAddTo(targetUnit)` gate FIRST, then the probability roll (see
        // rollAppliesEffect, UnitStateEngine.ts, for that formula and citations).
        // CanAddTo's base implementation (UnitStateBase) is an unconditional `true`; the
        // overrides seen (DownSpeedUnitStateBase and siblings covering the other
        // Down*/Dwn* debuff families) follow the identical template:
        //     CanAddTo = targetUnit.IsMatch(this.TargetRole) && targetUnit.IsMatch(this.TargetElement)
        // where IsMatch(0) is ALWAYS true (0 = wildcard/"any"). This CONFIRMS, rather than
        // introduces, something already implemented elsewhere: `effTargets` is already
        // filtered through `isEligibleForEffect` (UnitStateEngine.ts - the identical
        // role/element match) before applyEffect's branches ever run, so there's nothing
        // further to add at this specific call site - noted here so the connection
        // between that pre-existing filter and this newly-read C# method isn't lost.
        if (!rollAppliesEffect(detail, applierState, t, this.team.rng)) return false;
        const key = String(skillDetailId(detail))
        const existing = t.activeEffectDetails.get(key)
        if (existing && ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)) {
            mergeAccumEffect(existing, detail)
            return true
        }
        t.activeEffectDetails.set(key, { applier, ...detail, _isExemptPassingTurnOnce: true, _accumCount: 1, _applierState: applierState })
        return true
    }

    private storePermanentState(t: KiokuState, detail: SkillDetail, applier: string, applierState: KiokuState): boolean {
        if (!rollAppliesEffect(detail, applierState, t, this.team.rng)) return false;
        const key = String(skillDetailId(detail))
        const existing = t.passiveEffectDetails.get(key)
        if (existing) {
            if (ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)) mergeAccumEffect(existing, detail)
            return true
        }
        t.passiveEffectDetails.set(key, { applier, ...detail, _accumCount: 1, _applierState: applierState } as any)
        return true
    }

    applyEffect(target: KiokuState, detail: SkillDetail, targetType?: TargetType, trueActorUnit?: KiokuState, mainTarget?: KiokuState): number | undefined {
        /**
         * @returns action id if additional act should be triggered, otherwise returns null
         */
        // [CONFIRMED 3.19] A state's ActiveConditionSet is re-checked continuously
        // (UnitStateBase.IsActive), not at the moment it is added: only the start conditions gate
        // adding a state. Instant effects (damage, EP, HASTE, ...) check both now.
        const triggerState = this.stateGen(this, target, targetType, trueActorUnit, mainTarget)
        if (UNIT_STATE_TYPES.has(detail.abilityEffectType)
            ? !isConditionSetActiveForPvP((detail.startConditionSetIdCsv ?? "").split(","), triggerState)
            : !isConditionSetActive(detail, triggerState)) return

        // [NEW, CONFIRMED via ScoreAttackTeam.ts] Generic element/role eligibility gate,
        // applied BEFORE any effect-type-specific logic - see UnitStateEngine.isEligibleForEffect.
        if (!isEligibleForEffect(detail, target)) return

        if (detail.abilityEffectType.startsWith("DMG_")) {
            target.getMp(5)

            const damageBaseType = damageBaseTypeFromEffectType(detail.abilityEffectType)
            const battleType = this.team.battleType
            // [CONFIRMED 3.19] DamageAbilityEffectBase$$Triggering: on a range-2 (proximity)
            // skill only the main target takes value1 power; the others take value2.
            const isMainTarget = mainTarget === undefined || mainTarget === target
            const rng = this.team.rng
            const result = getAttackDamageResult(this, target, detail, damageBaseType, {
                battleType, isMainTarget, rng,
                forceCrit: this.team.critOverride?.(this, target, detail),
            })
            let totalDamage = result.finalDamage

            // [CONFIRMED 3.19] ADDITIONAL_DAMAGE is a full extra hit through the whole damage
            // pipeline (DEF, give/receive, crit, PvP suppression, shield, barrier), with its
            // damage base taken from the ATK of the unit that applied the state - see
            // DamageCalculator.getAdditionalDamageBase. (The previous revision added a raw
            // base-damage number that skipped every modifier.)
            for (const bonus of this.filteredEffects()["ADDITIONAL_DAMAGE"] ?? []) {
                const applier: KiokuState = (bonus as any)._applierState ?? this
                const extra = getAttackDamageResult(this, target, bonus, DamageBaseType.ATK, {
                    battleType, rng,
                    damageBaseOverride: getAdditionalDamageBase(applier, bonus),
                    attackElementOverride: elementNumberOf(this),
                    forceCrit: this.team.critOverride?.(this, target, bonus),
                })
                totalDamage += extra.finalDamage
            }

            // [CONFIRMED 3.19] RCV_FINAL_DAMAGE: an extra ceil(damage x ratio) hit after the
            // skill (CalcFinalDamageNoticeBundle). The game sums the whole skill's damage per
            // target first; applied per damage effect here, which can differ by 1 from rounding.
            const finalExtra = getFinalDamageExtra(totalDamage, getFinalDamageRatio(target, this))
            if (finalExtra > 0) totalDamage += damageCutByBarrier(target, finalExtra).remainingDamage

            // [CONFIRMED 3.19] DamageAbilityEffectBase$$Triggering order: the damage above was
            // calculated with the target's break state BEFORE this hit; then the broken-damage
            // rate grows (only if already broken), then the break gauge is reduced. The break
            // value is Item1 for the main target and Item2 for the others of a range-2 skill.
            // See BreakPoint.ts.
            const [mainBreak, subBreak] = getVariationBreakPoint(detail, skillTypeOf(targetType), this.kioku.data.role)
            const breakValue = detail.range === targetRange.PROXIMITY && !isMainTarget ? subBreak : mainBreak
            const rateUp = increaseBreakedDamageReceiveRate(this, target, detail)
            const brk = decreaseBreakPoint(this, target, detail.element ?? 0, breakValue)

            const hpLost = target.takeDamage(totalDamage)
            this.team.eventLog.push({
                kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: hpLost,
                barrierAbsorbed: result.barrierAbsorbed, isCritical: result.isCritical,
                sourceIsTeam1: this.team.isTeam1, targetIsTeam1: target.team.isTeam1,
                breakDamage: brk.decreased, broke: brk.broke, breakRateUp: rateUp || undefined,
            })
            // Notice flags read by AttackEnd conditions: 302 counts notices that carry break
            // bonus info (the unit broke THIS skill), 108/308 the broken rate reaching its max.
            result.notice.isBreak = brk.broke
            if (rateUp > 0 && target.breakedDamageReceiveRate >= PVP_POLICY.maxBreakDamageReceiveRate / 10) result.notice.isBreakedDamageReceiveRateBecomeMax = true
            target.lastNotice = mergeNotice(target.lastNotice, result.notice);
            // [CONFIRMED 3.19] Condition$$IsMatchCondition builds a team check from the notices
            // whose affected unit belongs to THAT team (lambda b__12), so a notice belongs to the
            // TARGET's team. (It used to go to the attacker's team, inverting FriendTeam /
            // OpponentTeam conditions such as "an enemy took a crit".)
            target.team.lastActionNotices.push(result.notice);
            this.team.appliedSkillEffectTypesThisAction.add(detail.abilityEffectType);
            if (result.shieldMultiplierApplied) {
                target.consumeShieldCharges()
            }
            console.debug(this.kioku.name, "hit", target.kioku.name, "for", totalDamage,
                result.isCritical ? "(crit)" : "", result.isWeakHit ? "(weak)" : "",
                "- HP now", target.currentHp, "/", target.maxHp)
            return;
        }
        let effTargets
        if (this === target) {
            effTargets = this.team.sliceTargets(this, this.team.kiokuStates, detail)
        } else {
            effTargets = [target]
        }
        // Re-apply the element/role eligibility gate per resolved target too (the first
        // check above only covered the originally-passed `target`; sliceTargets can
        // widen this to a team, e.g. for self-buffs re-targeted via range=SELF/ALL).
        effTargets = effTargets.filter(t => isEligibleForEffect(detail, t))

        if (detail.abilityEffectType === "BARRIER") {
            effTargets.forEach(t => {
                // [FIXED] the roll (now inside storeTimedEffect) must be checked BEFORE
                // barrier stats are applied - previously these were set unconditionally
                // ahead of storing the effect, so even a probability-roll failure (once
                // that existed at all) would have left the barrier stats applied anyway.
                if (!this.storeTimedEffect(t, detail, this.kioku.name, this)) return;
                // [CONFIRMED formula shape, RECONSTRUCTED value-slot mapping] A full
                // re-read of BarrierUnitState$$CalculateEndurance/CalculateMaxEndurance
                // (SetTriggeringInfo calls both once, up front, before AddUnitState's
                // stacking logic below even runs) replaces the previous flat-`value1`
                // approximation with the real formula:
                //     grant = BarrierFixed + BarrierRatio * target.GetProcessedDef()
                //     cap   = MaxBarrierRatio == 0 ? grant : MaxBarrierRatio * target's RAW (unbuffed) DEF
                // Note the cap intentionally uses RAW def where the grant uses PROCESSED
                // (buffed) def - confirmed as two different reads in the source, not a
                // typo carried over here. value1/value2/value3 -> BarrierRatio/
                // BarrierFixed/MaxBarrierRatio is a reasonable-order guess (no
                // UnitStateFactory construction site calling the setters was found in
                // this pass's dumps to confirm it directly) - if barrier amounts still
                // look off, this specific mapping is the first thing to re-check.
                //
                // NOT implemented: both methods ALSO multiply their result by
                // `(1 - CalculationPointPolicyMstModel.Value/1000)` whenever
                // `battleType` is 2 (confirmed PvP, per dump.cs's BattleType enum) or 4
                // (unidentified - some other non-PvE mode). This is a genuine, newly-
                // discovered PvP-specific suppression/balance table - the exact
                // "CalculationPointPolicyMst" master data isn't present anywhere in
                // base_data, and the lookup key used to pick a record wasn't resolved
                // from the decompiled bytes alone, so there's no value to apply. Net
                // effect: barrier amounts computed here are likely an OVERESTIMATE for
                // real PvP by whatever that table's PvP entry says, until either that
                // JSON export exists or the lookup predicate gets decompiled.
                // [CONFIRMED 3.19 - supersedes the notes above] BarrierUnitState$$.ctor (0x15b5ed0):
                //   ratio = (float)value1/1000f, fixed = (float)value2, maxRatio = (float)value3/1000f
                // (the previous code used value1/value3 without /1000 -> barriers 1000x too big).
                // CalculateEndurance (0x15b52b0): f = (float)ProcessedDef * ratio + fixed
                // CalculateMaxEndurance (0x15b54e0): maxRatio == 0 ? CalculateEndurance
                //                                    : f = (float)Param.DEF * maxRatio
                // PvP/GvG: f *= 1 - policy("barrierEnduranceSuppresionRatio" = 500)/1000f;
                // result = (int)Math.Ceiling(f) (FUN_1807029f0 is Math.Ceiling).
                const bt = this.team.battleType
                const suppress = (f: number) => (bt === BattleType.Pvp || bt === BattleType.Gvg)
                    ? f32(f * f32(1 - f32(PVP_POLICY.barrierEnduranceSuppresionRatio / 1000))) : f
                const ratio = f32(f32(detail.value1) / 1000), fixed = f32(detail.value2), maxRatio = f32(f32(detail.value3) / 1000)
                const grant = Math.ceil(suppress(f32(f32(getProcessedDef(t) * ratio) + fixed)))
                const cap = maxRatio === 0 ? grant : Math.ceil(suppress(f32(f32(t.kioku.getBaseDef()) * maxRatio)))
                const newMax = Math.max(t.maxBarrierEndurance, cap)
                t.maxBarrierEndurance = newMax
                t.barrierEndurance = Math.min(newMax, t.barrierEndurance + grant)
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isBarrierAdded: true });
            })
            return;
        }

        // [CONFIRMED strings] [IMPLEMENTED] ADD_BUFF_TURN/ADD_DEBUFF_TURN(+_IMM):
        // extends the remaining duration of the target's currently-active buffs (or
        // debuffs) by `value1` turns. Distinguished from AddTurnUnitStateBase's
        // "grant a bonus turn" cousin classes by name only - see MISSING_AND_UNCERTAIN.md
        // for why these two are NOT the same mechanic as ADDITIONAL_TURN_UNIT_ACT
        // despite superficially similar naming (revision 1 conflated them).
        // The "_IMM" variant's distinguishing behavior isn't confirmed - implemented
        // identically to the non-IMM version.
        if (["ADD_BUFF_TURN", "ADD_BUFF_TURN_IMM", "ADD_DEBUFF_TURN", "ADD_DEBUFF_TURN_IMM"].includes(detail.abilityEffectType)) {
            const wantDebuffs = detail.abilityEffectType.startsWith("ADD_DEBUFF");
            effTargets.forEach(t => {
                t.activeEffectDetails.forEach((d, key) => {
                    const isDebuff = !isAlimentEffect(d.abilityEffectType) && isOpponentEffect(d.abilityEffectType);
                    const isAliment = isAlimentEffect(d.abilityEffectType);
                    const matches = wantDebuffs ? (isDebuff || isAliment) : isFriendlyEffect(d.abilityEffectType);
                    if (matches) t.activeEffectDetails.set(key, { ...d, turn: d.turn + detail.value1 });
                })
            });
            return;
        }

        // [CONFIRMED] ReDriveBattleCore.AbilityEffect.RemoveStateAbilityEffectBase$$
        // Triggering (the SHARED base Triggering inherited by all four
        // RemoveAllBuff/RemoveAllDebuff/RemoveAllAbnormal/RemoveAllUnableAction classes -
        // confirmed none of the latter three override Triggering themselves): removal is
        // NOT "delete every matching state unconditionally". It takes the unit's matching
        // states in REVERSE order (most-recently-applied first - StateList.Where(match)
        // .Reverse()) and only removes the first `value1` of them (`this.field_0x4c`,
        // read from AbilityEffectInfo.EffectValue1 same as every other effect's value1;
        // 0 means unlimited - `if (count == 0) count = matchingStates.Count`). In
        // practice every REMOVE_ALL_* skill this simulator has seen uses value1=0, so
        // this degrades to "remove all matches" - but a hypothetical value1>0 skill
        // (partial-dispel) is now handled correctly instead of silently over-removing.
        // "Most recently applied" is approximated here as "last inserted into
        // activeEffectDetails, reversed" - exact for a state seen for the first time,
        // approximate if a Map.set() on an already-existing key (a buff refresh) kept its
        // ORIGINAL insertion slot rather than moving to the end (JS Map semantics) - the
        // source's own StateList is a real ordered list that a refresh presumably DOES
        // move/re-append to, so this could diverge from the source in that specific
        // refresh-then-partial-dispel edge case. Each of the four variants differs only
        // in which states are considered a "match" (RemoveStateAbilityEffectBase$$
        // IsRemovable, overridden per subclass, each additionally gated on
        // `state.EffectOrigin==1` in the source - approximated here via this codebase's
        // own friendlySkills/enemySkills/isAlimentEffect classification instead of a real
        // EffectOrigin field, which isn't modeled in this port).
        const removeMatchingStates = (targets: KiokuState[], isMatch: (abilityEffectType: string) => boolean) => {
            targets.forEach(t => {
                const matching = [...t.activeEffectDetails.entries()].filter(([, d]) => isMatch(d.abilityEffectType));
                matching.reverse(); // approximate "most recently applied first"
                const removeCount = detail.value1 > 0 ? detail.value1 : matching.length;
                matching.slice(0, removeCount).forEach(([key]) => t.activeEffectDetails.delete(key));
            })
        }

        // [CONFIRMED string] [IMPLEMENTED] REMOVE_ALL_ABNORMAL: cleanses Ailment-type
        // states (Burn/Curse/Poison/Stun/Vortex/Weakness/Bleed) - RemoveAllAbnormalAbilityEffect$$
        // IsRemovable checks `state is AbnormalUnitStateBase`, approximated here via
        // isAlimentEffect (this codebase's existing equivalent classification).
        if (detail.abilityEffectType === "REMOVE_ALL_ABNORMAL") {
            removeMatchingStates(effTargets, isAlimentEffect)
            return;
        }
        // [CONFIRMED string] [IMPLEMENTED] REMOVE_ALL_DEBUFF: RemoveAllDebuffAbilityEffect$$
        // IsRemovable checks `state is IDebuff`, approximated as "enemySkills-classified,
        // non-Ailment" (Aliments are REMOVE_ALL_ABNORMAL's job - see ADD_DEBUFF_TURN's
        // identical isDebuff/isAliment split elsewhere in this file).
        if (detail.abilityEffectType === "REMOVE_ALL_DEBUFF") {
            removeMatchingStates(effTargets, t => !isAlimentEffect(t) && isOpponentEffect(t))
            return;
        }
        // [CONFIRMED string + AI chain, RECONSTRUCTED removal predicate] REMOVE_ALL_BUFF:
        // RemoveAllBuffAbilityEffect$$IsRemovable checks `state is IBuff`, approximated as
        // "friendlySkills-classified". Its targeting chain additionally prioritizes
        // dispelling whoever has an ATK buff, then DEF, then any stat buff (see
        // AITargetSelector.ts's removeAllBuffChain) - that priority lives entirely in
        // targeting, not in what gets removed once a target is chosen (which is still
        // "every matching buff", same as the other two).
        if (detail.abilityEffectType === "REMOVE_ALL_BUFF") {
            removeMatchingStates(effTargets, t => isFriendlyEffect(t))
            return;
        }
        // [NEWLY ADDED - was entirely absent] REMOVE_ALL_UNABLE_ACTION: the fourth member
        // of this family (RemoveAllUnableActionAbilityEffect, confirmed via the
        // AbilityEffectFactory dispatch table; confirmed to inherit the same base
        // Triggering/targeting as the other three - it only overrides the ctor and
        // IsRemovable) wasn't classified or handled anywhere in this file at all before
        // this pass. IsRemovable checks `state is UnableActionUnitStateBase` -
        // approximated here as "STUN specifically", since that's the only
        // CanNotAction-causing state type this port currently models (see
        // KiokuState.canNotAction) - broaden this predicate if more such effect types are
        // ever added.
        if (detail.abilityEffectType === "REMOVE_ALL_UNABLE_ACTION") {
            removeMatchingStates(effTargets, t => t === "STUN")
            return;
        }

        // [CONFIRMED] [IMPLEMENTED] ReDriveBattleCore.AbilityEffect.ChargeAbilityEffect$$
        // Triggering: a hard SET (not an increment) of BOTH the current and max charge
        // gauge, read together as one 8-byte (InitChargePoint, MaxChargePoint) pair -
        // confirmed against dump.cs's AbilityEffectInfo showing EffectValue1/EffectValue2
        // are adjacent plain `int` fields, so the pair-read isn't a float-bit-reinterpret
        // hazard. This is how a Kioku without an innate charge-gauge kit gets one at all
        // (see currentMaxMagic's own comment) - it's also how one WITH a kit could have
        // it reset/resized mid-battle, since nothing here restricts it to "first use only".
        if (detail.abilityEffectType === "CHARGE") {
            effTargets.forEach(t => {
                t.currentMagic = detail.value1;
                t.currentMaxMagic = detail.value2;
            })
            return;
        }
        // [CONFIRMED] [IMPLEMENTED] ReDriveBattleCore.AbilityEffect.
        // ConsumeChargePointAbilityEffect$$Triggering: `Clamp(ChargePoint - value1, 0, MaxChargePoint)`.
        if (detail.abilityEffectType === "CONSUME_CHARGE_POINT") {
            effTargets.forEach(t => {
                t.currentMagic = Math.max(0, Math.min(t.currentMaxMagic, t.currentMagic - detail.value1));
            })
            return;
        }

        // [CORRECTED] UP_HATE (and its DWN_HATE debuff counterpart) used to have its own
        // branch below this point that did `t.aggro += detail.value1` PERMANENTLY -
        // unreachable for any real, timed hate buff anyway (this `if (detail.turn)`
        // branch runs first and returns before reaching it), and wrong even for the
        // turn=0 edge case: ReDriveBattleCore.AI.AISkillTargetSelector$$GetUnitWeightDic
        // recomputes weight FRESH every target-selection call as roleWeight + sum of
        // currently-ACTIVE hate effects, not a running total that outlives the buff. Both
        // now flow entirely through this generic timed-effect path instead - see
        // getThreatWeight in UnitStateEngine.ts, which sums active UP_HATE/DWN_HATE off
        // of activeEffectDetails on demand, and AITargetSelector.ts's
        // filterByRoleAtWeightedRandomWithHate, which is what actually consumes it now
        // (previously nothing did - `aggro` was write-only).
        if (detail.turn) {
            // (Timed passive states used to be deleted from the bank after their first trigger,
            // so e.g. an "on attack end: SPD +10% for 1 turn" passive fired once per battle.)
            effTargets.forEach(t => this.storeTimedEffect(t, detail, this.kioku.name, this))
        } else if (detail.abilityEffectType === "HASTE") {
            // [CONFIRMED 3.19] HasteAbilityEffect$$Triggering (0x18f4840): SubtractGaugeValue((float)v/1000f)
            effTargets.forEach(t => t.addGaugeRate(-f32(f32(detail.value1) / 1000), ++globalTurnShiftCounter))
        } else if (detail.abilityEffectType === "SLOW") {
            // [CONFIRMED 3.19] SlowAbilityEffect$$Triggering (0x1900f80): AddGaugeValue((float)v/1000f)
            effTargets.forEach(t => t.addGaugeRate(f32(f32(detail.value1) / 1000), ++globalTurnShiftCounter))
        } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
            effTargets.forEach(t => t.getMp(target.maxMp * detail.value1 / 1000))
        } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
            effTargets.forEach(t => t.getMp(detail.value1))
        } else if (detail.abilityEffectType === "GAIN_SP_FIXED") {
            // [CONFIRMED string] [IMPLEMENTED] flat add to the attack/skill alternation
            // counter (`currentSp`) - matches GAIN_EP_FIXED's pattern one level up (team,
            // not unit, since currentSp lives on PvPTeam).
            this.team.currentSp += detail.value1;
        } else if (detail.abilityEffectType === "CUTOUT") {
            effTargets.forEach(t => t.activeEffectDetails.set(String(skillDetailId(detail)), { ...detail, applier: this.kioku.name, turn: 1 }))
        } else if (detail.abilityEffectType === "RECOVERY_HP") {
            effTargets.forEach(t => t.heal(detail.value1, this))
        } else if (detail.abilityEffectType === "RECOVERY_HP_ATK") {
            // [CONFIRMED string] [IMPLEMENTED] heal scaling off the HEALER's (this) own
            // ATK, using the same base-damage formula as a normal hit (by analogy with
            // ADDITIONAL_DAMAGE's confirmed calc_base_dmg usage - no dedicated heal
            // formula was independently confirmed, flagged as a reconstruction).
            const healAmount = Math.floor(detail.value1 / 1000 * this.kioku.getBaseAtk() * (Math.pow(this.kioku.getBaseAtk() / 124, 1.2) + 12) / 20);
            effTargets.forEach(t => {
                const healed = t.heal(healAmount, this);
                if (healed > 0) t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isReceivedRecovery: true });
            })
        } else if (detail.abilityEffectType === "REVIVAL_RATIO") {
            // [NEWLY IMPLEMENTED - was entirely absent] ReDriveBattleCore.AbilityEffect.
            // RevivalRatioAbilityEffect$$Triggering, confirmed byte-for-byte: skips any
            // resolved target that ISN'T currently dead (the source loops past them
            // rather than erroring - matched here by filtering effTargets first), then
            // revives with `Math.Ceiling((value1 / 100.0) * target.MaxHP)` HP - a plain
            // percentage of max HP, ceiling-rounded. No clamp is needed beyond what
            // heal() already does, since a dead unit's current HP is always 0.
            // TargetSide=0 (friendly) and IsIncludeDeadUnitInTarget=true are both
            // confirmed on the info-based ctor - see AITargetSelector.ts's revivalChain
            // for the AI targeting half (uniform random among the dead).
            effTargets.filter(t => t.isDead).forEach(t => {
                const hp = Math.ceil((detail.value1 / 100) * t.maxHp);
                t.heal(hp, this);
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isReceivedRecovery: true });
            })
        } else if (detail.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
            return detail.value1;
        } else if (detail.abilityEffectType === "ADDITIONAL_TURN_UNIT_ACT" || detail.abilityEffectType === "RE_ACTION_TURN_UNIT_ACT") {
            // [CONFIRMED shape for ADDITIONAL_TURN_UNIT_ACT via AdditionalTurnUnitActTriggerUnitStateBase]
            // RE_ACTION_TURN_UNIT_ACT is treated as an alias (RECONSTRUCTED, not
            // independently decompiled - see MISSING_AND_UNCERTAIN.md).
            effTargets.forEach(t => { t.pendingBonusTurns++ })
        } else if (detail.abilityEffectType === "GAIN_CHARGE_POINT") {
            // [FIXED] [CONFIRMED] ReDriveBattleCore.AbilityEffect.
            // GainChargePointAbilityEffect$$Triggering: `Clamp(ChargePoint + value1, 0,
            // MaxChargePoint)`, applied to effTargets. Previously this mutated `this`
            // (the CASTER) unconditionally instead of the resolved target(s) - every
            // other branch in this chain uses `effTargets.forEach`, this one alone used
            // `this.currentMagic +=` - and had no ceiling clamp at all, so repeated casts
            // could push a unit's charge past its own max. Both fixed here.
            effTargets.forEach(t => {
                t.currentMagic = Math.max(0, Math.min(t.currentMaxMagic, t.currentMagic + detail.value1));
            })
        } else if ("passiveSkillDetailMstId" in detail) {
            // Permanent (turn 0) state added by a passive trigger, at any timing. Re-triggering
            // an IAccum state adds a stack (e.g. UP_ATK_ACCUM_RATIO on every attack end).
            effTargets.forEach(t => this.storePermanentState(t, detail, this.kioku.name, this))
        } else {
            console.warn("Active without turn (possibly a RECOGNIZED-ONLY effect type not yet implemented - see PvPTeam.ts's friendlySkills/enemySkills header notes and MISSING_AND_UNCERTAIN.md):", detail)
        }
        return;
    }

    // [CONFIRMED] each active Shield absorbs a limited number of hits, decremented by 1
    // every time it contributes to a damage calc. Now uses the REAL, confirmed
    // `remainCount` field on SkillDetail directly (revision 1 fell back to `d.turn`
    // when a nonexistent field was absent - `remainCount` is a required field on both
    // PassiveSkill and ActiveSkill per the real KiokuTypes.ts, so that fallback is no
    // longer needed).
    consumeShieldCharges(): void {
        this.activeEffectDetails.forEach((d, key) => {
            if (d.abilityEffectType !== "SHIELD") return
            const remaining = d.remainCount - 1
            if (remaining <= 0) this.activeEffectDetails.delete(key)
            else this.activeEffectDetails.set(key, { ...d, remainCount: remaining })
        })
    }
}

function emptyNotice(): AffectedUnitNotice {
    return {
        totalDamageValue: 0, isCritical: false, isWeakElementAttacked: false, isDead: false,
        isReceivedRecovery: false, isBarrierAdded: false, isBarrierAttacked: false,
        isBarrierDestroyed: false, isBreakedDamageReceiveRateBecomeMax: false,
        isReceivedReflection: false, isReceivedAttack: false,
    };
}

// [VERIFIED - see turnOrderPriority's doc comment above for the full citation and the
// note addressing the person's empirical "enemy acts first" observation] NO CHANGE from
// revision 1 - this already matches the decompiled 4-level sort exactly.
export function compareTurnOrder(a: KiokuState, b: KiokuState, team1Ref: PvPTeam): number {
    const secDiff = a.secondsUntilAbleToAct() - b.secondsUntilAbleToAct()
    if (secDiff !== 0) return secDiff
    if (a.turnOrderPriority !== b.turnOrderPriority) return b.turnOrderPriority - a.turnOrderPriority
    const aTeam = a.team === team1Ref ? 0 : 1
    const bTeam = b.team === team1Ref ? 0 : 1
    if (aTeam !== bTeam) return aTeam - bTeam
    return a.posIdx - b.posIdx
}

function getDetails(map: Record<any, SkillDetail>, key: SkillKey, id: number, lvl: number): SkillDetail[] {
    return Object.values(map).filter(v => (v as any)[key] === id * 100 + lvl);
}

export class PvPTeam {
    kiokuStates: KiokuState[];
    declare otherTeam: PvPTeam
    private debug: boolean;
    teamLabel: string
    currentSp = 5

    // [CONFIRMED enum] Network.Definition.Battle.BattleType (dump.cs). Defaults to Pvp
    // (2) per the person's message; pass BattleType.Solo/Gve/etc. to run a non-PvP
    // simulation through the same engine - see DamageCalculator.ts.
    battleType: BattleType
    isTeam1 = false
    // Random source for every roll this team makes (crit, ...). Math.random by default;
    // PvPBattle can replace it with a seeded generator (BattleMath.seededRng) so a battle
    // is reproducible from its seed.
    rng: () => number = Math.random
    // Shared with the opposing team by PvPBattle; drained into each BattleSnapshot.
    eventLog: BattleEvent[] = []
    // Optional manual override for crit outcomes (UI "force crit / no crit"): return
    // true/false to force, undefined to roll normally.
    critOverride?: (attacker: KiokuState, defender: KiokuState, detail: SkillDetail) => boolean | undefined

    // NEW team-level state, needed for BattleConditionParser.ts's team-scoped
    // CompareContent checks (201-210, 301-309) - see
    // ReDriveBattleCore.BattleCondition.BattleUnitTeamConditionChecker$$Check.
    // `breakedUnitTotalCount` is cumulative across the whole battle (never reset);
    // `appliedSkillEffectTypesThisAction`/`lastActionNotices` are reset at the start of
    // every action (see performAction) since the source's equivalents
    // (appliedSkillEffectTypes / affectedUnitNotices) are scoped to "this action" too.
    breakedUnitTotalCount = 0
    appliedSkillEffectTypesThisAction: Set<string> = new Set()
    lastActionNotices: AffectedUnitNotice[] = []

    generateState = (actor: KiokuState, target: KiokuState, actionType?: TargetType, trueActorUnit?: KiokuState, mainTargetUnit?: KiokuState, notice?: AffectedUnitNotice): BattleState => ({
        actorTeam: this,
        enemyTeam: this.otherTeam,
        actor,
        target,
        actionType,
        trueActorUnit,
        mainTargetUnit,
        notice,
    })

    constructor(kiokus: PvPKioku[], teamLabel: string, debug = false, battleType: BattleType = BattleType.Pvp) {
        this.kiokuStates = kiokus.map((k, i) => new KiokuState(i, teamLabel, this, k, this.generateState))
        this.debug = debug;
        this.teamLabel = teamLabel;
        this.battleType = battleType;
    }

    // [STRUCTURAL FIX, revision 3 - see report for the full writeup] Previously this
    // method also loaded effects into the bank AND immediately ran BATTLE_START passives
    // AND immediately recomputed SPD/MP/break, all before returning - and PvPBattle's
    // constructor called this once per team, sequentially (team1 fully, then team2
    // fully). Since BATTLE_START passives can cross-apply to the enemy team (see
    // applyPassivesForTiming below), that ordering meant team1's battle-start passives
    // were already visible to team2's FIRST SPD computation, while team2's battle-start
    // passives could never be visible to team1's first computation (already computed
    // and moved past by the time team2 ran). Two IDENTICAL mirrored teams could then
    // legitimately end up with different starting SPD/turn order - not a rounding
    // artifact, an ordering bug. Now split into three phases that PvPBattle's
    // constructor runs for BOTH teams before advancing to the next phase: setup ->
    // addEffectsToBank -> applyPassivesForTiming(BATTLE_START) -> recomputeDerivedStats.
    // This method now only records the enemy team reference.
    finishSetup(otherTeam: PvPTeam) {
        this.otherTeam = otherTeam
    }

    addEffectsToBank(): void {
        this.kiokuStates.forEach(k => k.kioku.effects.forEach(e => {
            k.addEffectToBank(e)
        }))
    }

    // The effect-application half of what triggerPassives used to do in one shot -
    // split out so PvPBattle's constructor can run this for BOTH teams before either
    // team's recomputeDerivedStats() (see the class-level comment above). Behaviorally
    // identical to the old triggerPassives for this part - nothing here changed except
    // that the derived-stat recompute no longer happens inline.
    // [CONFIRMED 3.19] PassiveSkill$$Triggering (static, 0x14a2c20): for the given timing, every
    // LIVING unit's passive skills run through AbilityEffectLauncher with the acting unit, its
    // main target and skill in the condition bundle; start conditions decide who reacts. Target
    // side comes from the effect class (EffectTargetSide.ts); passives are range -1 (self) or 3
    // (every living unit of that side) apart from follow-up triggers.
    applyPassivesForTiming(timing: ProcessTiming, lastAction?: TargetType, lastActor?: KiokuState, mainTarget?: KiokuState): FuaMap {
        let additionalAct: FuaMap = {};
        for (const k of this.kiokuStates) {
            if (k.isDead) continue
            k.passiveSkills.forEach(detail => {
                if (!isTimingCorrect(timing, detail)) return
                if (conditionSetRequiresActorIsSelf(detail) && (!lastActor || lastActor !== k)) return
                if (isOpponentEffect(detail.abilityEffectType)) {
                    // [CONFIRMED 3.19] AdditionalSkillActAbilityEffectBase$$Triggering: value2 is the
                    // AdditionalSkillTargetType. Type 1 with an ENEMY actor targets that actor (a
                    // counter); otherwise the team's selected target, which the port approximates
                    // with its normal auto-targeting (no preferred target). Previously the
                    // follow-up was aimed at whichever enemy the loop visited last.
                    const counterTarget = detail.value2 === 1 && lastActor && lastActor.team !== k.team && !lastActor.isDead ? lastActor : undefined
                    filterAlive(this.otherTeam.kiokuStates).forEach(target => {
                        const fua = k.applyEffect(target, detail, lastAction, lastActor, mainTarget)
                        if (fua) additionalAct[fua] = { caster: k, triggerTarget: counterTarget }
                    })
                } else {
                    const fua = k.applyEffect(k, detail, lastAction, lastActor, mainTarget)
                    if (fua) additionalAct[fua] = { caster: k, triggerTarget: lastActor }
                }
            })
        }
        return additionalAct;
    }

    // Team 1 first, then team 2 (BattleUnit dictionary order: allies before enemies).
    private get bothTeams(): [PvPTeam, PvPTeam] {
        return this.isTeam1 ? [this, this.otherTeam] : [this.otherTeam, this]
    }

    // One passive timing for the WHOLE battle, as the game does it: the timing itself for every
    // living unit on both teams, then AfterProcess (9) for every living unit (lambda b__5 of
    // PassiveSkill.Triggering runs Launcher.Triggering(9, ...) right after), then derived stats,
    // then each team's queued follow-up skills (AdditionalSkillAct).
    // `beforeFollowUps` runs once the timing's own effects are resolved but before any follow-up
    // it queued executes (used to record the finished action for the battle display).
    fireTiming(timing: ProcessTiming, actor?: KiokuState, mainTarget?: KiokuState, actionType?: TargetType, beforeFollowUps?: () => void): void {
        const teams = this.bothTeams
        const fuas = teams.map(t => t.applyPassivesForTiming(timing, actionType, actor, mainTarget))
        teams.forEach((t, i) => { fuas[i] = mergeFuaMaps(fuas[i], t.applyPassivesForTiming(ProcessTiming.AFTER_PROCESS, actionType, actor, mainTarget)) })
        teams.forEach(t => t.recomputeDerivedStats())
        beforeFollowUps?.()
        teams.forEach((t, i) => t.triggerFua(fuas[i]))
    }

    // Set by PvPBattle: called after every executed skill (turn action, ultimate, extra action,
    // combo step, follow-up) so the display can show each as its own entry.
    snapshotHook?: (actor: KiokuState, type: TargetType, label?: string) => void
    private recordAction(actor: KiokuState, type: TargetType, label?: string) {
        this.snapshotHook?.(actor, type, label)
    }

    // The recompute half of what triggerPassives used to do in one shot - see the
    // class-level comment above finishSetup for why this is now separate.
    recomputeDerivedStats(): void {
        this.kiokuStates.forEach(k => {
            k.updateMPGain()
            k.updateSpd()
            // First computation (battle start, after BATTLE_START passives): UnitTurnGauge.Reset.
            if (k.turnGaugeSpeed === 0) k.resetDistanceRemaining()
            k.resolveBreak()
        })
    }

    // Convenience wrapper preserving the exact previous combined behavior - used by
    // every OTHER call site (TURN_START/ATTACK_END, mid-battle, one action at a time),
    // where applying effects and immediately recomputing derived stats for just THIS
    // team before the next thing happens is the correct, already-working sequential
    // model. Only the one-time BATTLE_START setup needed the two halves decoupled.
    triggerPassives(timing: ProcessTiming, lastAction?: TargetType, lastActor?: KiokuState): void {
        this.fireTiming(timing, lastActor, this.lastMainTarget, lastAction)
    }

    traverseSeconds(seconds: number): void {
        this.kiokuStates.forEach(k => k.traverseSeconds(seconds))
    }

    getSecondsUntilNextReadyKioku(): number {
        return this.kiokuStates.reduce((s, k) => s < k.secondsUntilAbleToAct() ? s : k.secondsUntilAbleToAct(), maxMeters)
    }

    getNextActor(): KiokuState {
        return this.kiokuStates.reduce((best, k) => compareTurnOrder(k, best, this) < 0 ? k : best)
    }

    // [CONFIRMED algorithm + damage chain, see AITargetSelector.ts] range===TARGET
    // (RangeType.SelectSingle) single-target resolution now runs the actual FULL AUTO
    // targeting AI instead of always picking possibleTargets[0] - see this file's header
    // note on why `possibleTargets` is already the correct candidate pool (own team or
    // enemy team) regardless of which of the two call sites (completeAction directly, or
    // applyEffect's `this===target` re-expansion for friendly effects) got us here.
    //
    // [CONFIRMED] ReDriveBattleCore.AbilityEffect.AbilityEffectBase$$SelectTargets: a
    // PROXIMITY (RangeType.SelectMultiple) effect resolves its "primary" unit through the
    // EXACT SAME path as a TARGET effect (the character-specific hardcoded cases below,
    // or the FULL AUTO AI) - it does NOT have its own separate targeting heuristic. Only
    // afterward does it expand to that primary's positional neighbors (expandProximity in
    // AITargetSelector.ts). This is why both branches share `resolvePrimaryTarget` below.
    sliceTargets(actor: KiokuState, possibleTargets: KiokuState[], detail: SkillDetail): KiokuState[] {
        const effectId = skillDetailId(detail) / 10000 | 0
        const resolvePrimaryTarget = (): KiokuState | null => {
            // --- Character-specific hardcoded kit targeting (pre-existing, unrelated to
            // the generic FULL AUTO system below - these bespoke rules take priority over
            // it exactly like the source's own character-unique classes would). ---
            const eligableTargets = this.kiokuStates.filter(k => k !== actor)
            // (Fixed: these used a placeholder object as the reduce seed and returned it when no
            // ally qualified, crashing on e.g. an all-dead or all-ready team. Now they fall back
            // to the generic AI.)
            const pick = (units: KiokuState[], better: (a: KiokuState, b: KiokuState) => boolean) =>
                units.filter(k => !k.isDead).reduce<KiokuState | null>((best, k) => !best || better(k, best) ? k : best, null)
            if (effectId === 1066) { // Thunder Torrent battle skill: Attacker/Breaker ally furthest from acting
                const p = pick(eligableTargets.filter(k => [KiokuRole.Attacker, KiokuRole.Breaker].includes(k.kioku.data.role)),
                    (a, b) => a.secondsUntilAbleToAct() > b.secondsUntilAbleToAct())
                if (p) return p
            }
            if (effectId === 1161) { // Mabayu skill: highest base ATK Attacker ally
                const p = pick(eligableTargets.filter(k => k.kioku.data.role === KiokuRole.Attacker),
                    (a, b) => a.kioku.getBaseAtk() > b.kioku.getBaseAtk())
                if (p) return p
            }
            if (effectId === 1072) { // Rika skill: Attacker/Breaker ally with the least MP
                const p = pick(eligableTargets.filter(k => [KiokuRole.Attacker, KiokuRole.Breaker].includes(k.kioku.data.role)),
                    (a, b) => a.currentMp < b.currentMp)
                if (p) return p
            }
            // --- Generic FULL AUTO targeting AI (covers DMG_ATK/DEF/HP/RANDOM and every
            // other single-target effect type, per its own confirmed or best-effort
            // generic chain - see AITargetSelector.ts) ---
            return selectFullAutoTarget(detail, possibleTargets, this.rng)
        }
        if (detail.range === targetRange.TARGET) {
            const picked = resolvePrimaryTarget()
            if (!picked) {
                console.warn(actor.kioku.name, detail, "FULL AUTO targeting found no eligible target (all candidates dead/ineligible?)")
                return []
            }
            return [picked]
        }
        if (detail.range === targetRange.PROXIMITY) {
            const primary = resolvePrimaryTarget()
            if (!primary) {
                console.warn(actor.kioku.name, detail, "PROXIMITY targeting found no eligible primary target")
                return []
            }
            return expandProximity(primary, possibleTargets)
        }
        // [CONFIRMED 3.19] SelectTargets: candidates are the side's units filtered by !IsDead
        // (unless IsIncludeDeadUnitInTarget); range 3 = every candidate, range -1 = the user
        // if it is a candidate.
        if (detail.range === targetRange.ALL) return filterAlive(possibleTargets)
        if (detail.range === targetRange.SELF) return actor.isDead ? [] : [actor]
        console.warn("Unknown target", detail)
        return []
    }

    // Main target of the last executed skill (first unit hit by its damage), for AttackEnd
    // conditions such as IS_MAIN_TARGET.
    lastMainTarget: KiokuState | undefined

    act(actor: KiokuState, effectName: TargetType): FuaMap {
        this.lastMainTarget = undefined
        if (effectName === TargetType.attackId) {
            this.currentSp++;
        } else if (effectName === TargetType.skillId) {
            this.currentSp--;
        } else {
            actor.currentMp = 0;
        }
        // [CONFIRMED 3.19] SwitchSkillUnitState (value1 = switch-to skill unique id, value3 = the
        // SkillType it replaces; BattleUnit$$IsSwitchingActiveSkill / GetSwitchableSkills build it
        // at the same level as the original). E.g. Final Fatebloom's battle skill becomes 7008
        // (+10 EP) while Abyssal Rose (UNIQUE_BUFF 18) is on her.
        const skillId = actor.switchedSkillId(effectName) ?? actor.kioku.data[TargetTypeLookup[effectName]]
        const details = getDetails(skillDetails, "skillMstId", skillId, actor.kioku[targetTypeToLvl[effectName]])
        return this.completeAction(actor, effectName, details)
    }

    // Returns a FuaMap of any ADDITIONAL_SKILL_ACT triggers fired by the effects
    // applied here (fixed in revision 1 - previously silently dropped when triggered
    // from an active skill's own effect list rather than a passive).
    completeAction(actor: KiokuState, effectName: TargetType, details: SkillDetail[]): FuaMap {
        let possibleTargets: KiokuState[] = []
        let additionalAct: FuaMap = {}
        for (const detail of details) {
            // [CONFIRMED 3.19] side comes from the game's own effect classes (EffectTargetSide.ts);
            // the hand-maintained friendlySkills/enemySkills lists are only a fallback now.
            const side = EFFECT_TARGET_SIDE[detail.abilityEffectType]
            if (side === "Friend" || (!side && friendlySkills.includes(detail.abilityEffectType))) {
                possibleTargets = [actor]
            } else if (side === "Opponent" || isOpponentEffect(detail.abilityEffectType)) {
                possibleTargets = this.otherTeam.kiokuStates
            } else {
                console.warn("Unknown effect type", detail.abilityEffectType, detail, "assuming enemy targets")
                possibleTargets = this.otherTeam.kiokuStates
            }
            const targets = this.sliceTargets(actor, possibleTargets, detail)
            if (detail.abilityEffectType.startsWith("DMG_") && targets[0] && !this.lastMainTarget) this.lastMainTarget = targets[0]
            for (const target of targets) {
                const fua = actor.applyEffect(target, detail, effectName, actor, targets[0])
                if (fua) additionalAct[fua] = { caster: actor, triggerTarget: target }
            }
        }
        actor.getMpFromType(effectName)
        return additionalAct
    }

    useUltimate(): [KiokuState, TargetType] | undefined {
        const readyKiokus = this.kiokuStates
            .filter(k => k.currentMp >= k.maxMp)
            .filter(k => k.maxMp > 0)
            .filter(k => k.currentRemainingBreakGauge > 0)
            // [RECONSTRUCTED - see KiokuState.canNotAction] a stunned unit can't fire an
            // otherwise-ready ultimate. Excluded here (rather than "ready but does
            // nothing") so their MP stays banked and the ult goes off once stun wears off,
            // instead of being burned on a no-op - not confirmed against the source, but
            // it's the reading least likely to feel like a bug either way this resolves.
            .filter(k => !k.canNotAction)
        if (!readyKiokus.length) return;
        const actor = readyKiokus[0]
        this.performAction(actor, TargetType.specialId)
        return [actor, TargetType.specialId]
    }

    useAttackOrSkill(): [KiokuState, TargetType] {
        const actor = this.getNextActor()
        // [CONFIRMED 3.19] ActExecutor: TurnBeginAct (break reset, TurnStart passives with this
        // unit as actor) -> TurnUnitAct (UnitTurnGauge.Reset, then ExecuteSkill) -> TurnEndAct.
        actor.exitBreak()
        let effType = this.currentSp ? TargetType.skillId : TargetType.attackId
        this.fireTiming(ProcessTiming.TURN_START, actor, undefined, effType)
        actor.resetDistanceRemaining()
        // [RECONSTRUCTED - see KiokuState.canNotAction] a stunned unit's turn still comes
        // up (gauge already reset above) and TURN_START passives still fire, but the
        // actual attack/skill is skipped entirely - no target resolution, no damage, no
        // MP gain from acting. Whether the real source also suppresses TURN_START
        // passives, or resets/holds the gauge differently for a stunned turn, isn't
        // confirmed - see canNotAction's comment for what would need decompiling
        // (TurnActSystem/TurnReferee) to pin this down further.
        //
        // [CONFIRMED] [NEWLY IMPLEMENTED] ReDriveBattleCore.TurnActSystem$$Forward: before
        // queuing a unit's turn, checks UnitCondition.GetMaximumActionNumComboUnitState
        // (the active COMBO effect with the highest value1 - see getMaxComboActionNum,
        // UnitStateEngine.ts; multiple stacks take the MAX, they don't add) and queues
        // that many separate actions for the SAME unit in a row
        // (Act.ActReferee$$AddComboUnitTurnActs) instead of one, whenever it's 2 or more.
        // TURN_START (above) and TURN_END fire ONCE for the whole burst, not once per
        // sub-action - confirmed by the source building exactly one TurnBeginAct and one
        // TurnEndAct around N per-action entries, not N complete turn cycles. Each of the
        // N actions gets its own independent skill-vs-attack choice (`effType`
        // recomputed every iteration) and its own full target resolution via
        // performAction, since `this.currentSp` (does the TEAM currently have a banked
        // skill turn) can change partway through a burst. `getMaxComboActionNum`
        // defaults to 1, so this loop is a no-op (exactly today's single-action
        // behavior) for the overwhelming majority of turns where no COMBO effect is active.
        if (!actor.canNotAction) {
            const actionNum = getMaxComboActionNum(actor)
            for (let i = 0; i < actionNum; i++) {
                // Only a REAL combo burst (actionNum >= 2, matching TurnActSystem.
                // Forward's own `< 2` branch) goes through ComboTurnUnitAct at all - a
                // plain single action uses TurnUnitAct instead, which has no ActionStep
                // property, so leave this at its neutral 0 rather than calling a normal
                // turn "step 1".
                actor.currentComboActionStep = actionNum >= 2 ? i + 1 : 0
                effType = this.currentSp ? TargetType.skillId : TargetType.attackId
                this.performAction(actor, effType)
            }
            actor.currentComboActionStep = 0
        }
        // [CONFIRMED 3.19] ActExecutor$$TurnEnd: TurnEnd passives (actor = this unit), then the
        // unit's states pass one turn (BattleUnit.PassingTurn(1)). Ultimates and follow-ups have
        // no TurnEnd, so they don't tick durations.
        this.fireTiming(ProcessTiming.TURN_END, actor, undefined, effType)
        actor.decrementActiveEffects()
        return [actor, effType]
    }

    // Shared by useUltimate/useAttackOrSkill: runs the action, its ATTACK_END passives,
    // and any FUAs they trigger, then loops the SAME actor through another
    // attack/skill action for every pending ADDITIONAL_TURN_UNIT_ACT/
    // RE_ACTION_TURN_UNIT_ACT bonus turn they've accumulated.
    private performAction(actor: KiokuState, effType: TargetType): void {
        // Reset per-action team-level tallies - see BattleConditionParser.ts's
        // team-scoped notice/effect-type conditions, which are meant to read "what
        // happened THIS action", not a stale accumulation from turns ago.
        this.resetActionTallies()
        // [CONFIRMED 3.19] ActExecutor$$ExecuteSkill: the skill, then AttackEnd passives for every
        // living unit (actor, main target, skill passed along), then queued follow-ups.
        const skillFuas = this.act(actor, effType)
        const comboLabel = actor.currentComboActionStep ? `Combo ${actor.currentComboActionStep}` : undefined
        this.fireTiming(ProcessTiming.ATTACK_END, actor, this.lastMainTarget, effType, () => this.recordAction(actor, effType, comboLabel))
        this.triggerFua(skillFuas)

        while (actor.pendingBonusTurns > 0 && !actor.isDead) {
            actor.pendingBonusTurns--
            const bonusEffType = this.currentSp ? TargetType.skillId : TargetType.attackId
            this.resetActionTallies()
            const bonusFuas = this.act(actor, bonusEffType)
            this.fireTiming(ProcessTiming.ATTACK_END, actor, this.lastMainTarget, bonusEffType, () => this.recordAction(actor, bonusEffType, "Extra action"))
            this.triggerFua(bonusFuas)
        }
    }

    // Previously fired a second, actor-less ATTACK_END for this team after every action; the
    // game has no such step (every reaction happens inside fireTiming).
    resolveEndOfTurn(): void {}

    // Each ExecuteSkill has its own AffectedUnitNoticeBundle: reset the per-skill tallies that
    // AttackEnd conditions read (crit/break/damage counts, effect types applied), including
    // before follow-ups, so their AttackEnd doesn't re-count the previous skill's hits.
    resetActionTallies(): void {
        for (const t of [this, this.otherTeam]) {
            t.appliedSkillEffectTypesThisAction = new Set();
            t.lastActionNotices = [];
            // Per-unit conditions (101 "took damage", 104 "was healed", ...) read this skill's
            // notice for the unit; it used to persist across actions, so e.g. Baldamente
            // Fortissimo countered attacks that hadn't touched it.
            t.kiokuStates.forEach(k => { k.lastNotice = undefined })
        }
    }

    triggerFua(actionIds: FuaMap): void {
        Object.entries(actionIds).forEach(([actionId, { caster, triggerTarget }]) => {
            const details = Object.values(skillDetails).filter(v => (v as any).skillMstId === Number(actionId))
            // [CONFIRMED 3.19] AdditionalSkillActAbilityEffectBase$$Triggering (0x18ea740): no
            // follow-up from a unit that is broken or can't act, and none while the same unit's
            // same follow-up skill is already executing or queued (this is what stops e.g. a
            // "whenever an enemy is at max break bonus" follow-up from re-triggering itself).
            if (caster.isDead || caster.isBroken || caster.canNotAction) return
            const key = `${caster.team.isTeam1}:${caster.posIdx}:${actionId}`
            if (runningFollowUps.has(key)) return
            runningFollowUps.add(key)
            try {
            caster.team.resetActionTallies()
            const fuas = caster.team.completeActionWithPreferredTarget(caster, TargetType.fuaId, details, triggerTarget)
            caster.team.fireTiming(ProcessTiming.ATTACK_END, caster, caster.team.lastMainTarget, TargetType.fuaId, () => caster.team.recordAction(caster, TargetType.fuaId, "Follow-up"))
            caster.team.triggerFua(fuas)
            } finally { runningFollowUps.delete(key) }
        })
    }

    private completeActionWithPreferredTarget(actor: KiokuState, effectName: TargetType, details: SkillDetail[], preferredTarget: KiokuState | undefined): FuaMap {
        this.lastMainTarget = undefined
        if (!preferredTarget) return this.completeAction(actor, effectName, details)
        let additionalAct: FuaMap = {}
        for (const detail of details) {
            const isSingleTarget = detail.range === targetRange.TARGET
            const targets = isSingleTarget ? [preferredTarget] : this.sliceTargets(actor, isFriendlyEffect(detail.abilityEffectType) ? [actor] : this.otherTeam.kiokuStates, detail)
            if (detail.abilityEffectType.startsWith("DMG_") && targets[0] && !this.lastMainTarget) this.lastMainTarget = targets[0]
            for (const target of targets) {
                const fua = actor.applyEffect(target, detail, effectName, actor, targets[0])
                if (fua) additionalAct[fua] = { caster: actor, triggerTarget: target }
            }
        }
        actor.getMpFromType(effectName)
        return additionalAct
    }
}
