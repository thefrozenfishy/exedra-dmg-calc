import { Ailment, KiokuRole } from "../types/enums";
import { type AffectedUnitNotice, type BattleEvent, BattleState, aggro, maxMeters, mpGainFromAction, PassiveSkill, SkillDetail, skillDetailId, targetRange, TargetType, targetTypeToLvl, TargetTypeLookup } from "../types/KiokuTypes";
import { skillDetailsByMstId } from "../utils/helpers";
import { isConditionSetActive, isConditionSetActiveForPvP, isActiveConditionSetMet, isTimingActive as isTimingCorrect, ProcessTiming, conditionSetRequiresActorIsSelf } from "./BattleConditionParser";
import { PvPKioku } from "./PvPKioku";
import { damageBaseTypeFromEffectType, getAttackDamageResult, getSlipDamageResult, getAdditionalDamageBase, getFinalDamageExtra, damageCutByBarrier, DamageBaseType, BattleType, PVP_POLICY } from "./DamageCalculator";
import { getProcessedAtk, getProcessedRecoveryValue, mergeAccumEffect, isEligibleForEffect, rollAppliesEffect, getProcessedDef, getMaxComboActionNum, getFinalDamageRatio, getProcessedSpeedWithBreakdown, unitLabel } from "./UnitStateEngine";
import { elementMap } from "../types/enums";
import { dec } from "./BattleMath";
import { type EnemyParams, enemyParams, isEnemyKioku, selectEnemySkill, enemySkillDetails, skillName, EnemyKioku, wavePositionIds, SUMMON_POSITION_ORDER, type QuestEnemyAppearance, type ModeChangeInfo } from "./PvE";
import { EFFECT_TARGET_SIDE, NEGATIVE_STATE_TYPES } from "./EffectTargetSide";
import { UPDATEABLE_STATE_TYPES, CONSUME_ON_ATTACK_STATE_TYPES, IBUFF_STATE_TYPES, IDEBUFF_STATE_TYPES } from "./StateInterfaces";
import uniqueStateLevelJson from "../assets/base_data/getUniqueStateLevelMstList.json";
import skillMstJson from "../assets/base_data/getSkillMstList.json";
import { selectFullAutoTarget, expandProximity, filterAlive, legalTargetPool, setAIDecisionGauge } from "./AITargetSelector";
import { BattleRng, rollChoice, type RngSource } from "./BattleRng";
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

// [CONFIRMED 3.19] TurnReferee$$get_NextTurnOrderPriority (0x15c27e0): ++counter. Fetched ONCE per
// effect application (HasteAbilityEffect/SlowAbilityEffect$$Triggering, and once per damage effect
// for the break push-back in DamageAbilityEffectBase$$Triggering), and that one value is given to
// every target. SortByTurnOrder = gauge asc, priority DESC, team, unit id asc - so units moved by
// the same effect tie and resolve left to right, while a later effect (e.g. each unit's own Heroic
// Grace, triggered in unit order) puts its unit ahead: the rightmost one wins.
export function nextTurnOrderPriority(): number {
    return ++globalTurnShiftCounter
}

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
    "UP_HP_RATIO",               // [CONFIRMED 3.19] [IMPLEMENTED] max-HP-% increase - see KiokuState.updateMaxHp
    "UP_HP_FIXED",               // [CONFIRMED 3.19] [IMPLEMENTED] flat max-HP increase (sub-crys "Max HP +N") - see KiokuState.updateMaxHp
    "ADD_BUFF_TURN", "ADD_BUFF_TURN_IMM",     // [CONFIRMED 3.19] [IMPLEMENTED] state: +value1 turns to buffs the holder gives (storeTimedEffect); _IMM: instant +value2 (applyEffect)
    "GAIN_SP_FIXED",   // [CONFIRMED] [IMPLEMENTED] flat add to the attack/skill alternation counter
    "REMOVE_ALL_ABNORMAL", // [CONFIRMED] [IMPLEMENTED] cleanses Ailment-type states, mirrors REMOVE_ALL_DEBUFF
    "ADDITIONAL_DAMAGE",   // [CONFIRMED] [IMPLEMENTED] one extra hit per opponent hit, after the skill - see KiokuState.additionalDamageAfterLaunch
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
    "ADD_DEBUFF_TURN", "ADD_DEBUFF_TURN_IMM", // [CONFIRMED 3.19] [IMPLEMENTED] as ADD_BUFF_TURN, for debuffs (not ailments)
    "DWN_ELEMENT_RESIST_RATIO", "DWN_ELEMENT_RESIST_ACCUM_RATIO", // [CONFIRMED] see UnitStateEngine.getElementResistRate
    "IMM_SLIP_DMG", // [CONFIRMED 3.19] [IMPLEMENTED] instant DOT burst (ImmSlipDmgAbilityEffect), see applyEffectToTarget
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
// In-game names: the Ailment enum's keys (BLEED is "Wound").
const AILMENT_NAMES = new Map(Object.entries(Ailment).map(([name, prefix]) => [prefix as string, name.charAt(0) + name.slice(1).toLowerCase()]))
export function ailmentName(abilityEffectType: string): string {
    const prefix = ALIMENT_PREFIXES.find(p => abilityEffectType === p || abilityEffectType.startsWith(p + "_"))
    return (prefix && AILMENT_NAMES.get(prefix)) ?? abilityEffectType
}
export function isAlimentEffect(abilityEffectType: string): boolean {
    return ALIMENT_PREFIXES.some(prefix => abilityEffectType === prefix || abilityEffectType.startsWith(prefix + "_"));
}
// The ailment (Ailment enum value: "BURN", "CURSE", ...) an ailment state type belongs to, undefined for anything else.
export function ailmentPrefixOf(abilityEffectType: string): string | undefined {
    return ALIMENT_PREFIXES.find(prefix => abilityEffectType === prefix || abilityEffectType.startsWith(prefix + "_"));
}

// Ability effect types that use IAccum stacking semantics (see UnitStateEngine.ts's
// mergeAccumEffect). [CONFIRMED to exist as game content per enums.ts, though the exact
// per-family completeness (e.g. whether DWN_ATK_ACCUM_RATIO exists) is still
// per-entry-flagged in UnitStateEngine.ts].
// UniqueUnitStateBase subclasses (IRemoveByUserUnitDeath). The character-specific UNIQUE_10030301 / UNIQUE_10070201
// markers are plain states and stay.
let vortexSeq = 0
const battleStartPriority = (d: SkillDetail): number =>
    d.abilityEffectType === "ADD_BUFF_TURN" || d.abilityEffectType === "ADD_DEBUFF_TURN" ? 200
        : d.abilityEffectType.endsWith("_EFFECT_VALUE") ? 100 : d.abilityEffectType === "DWN_BARRIER_VALUE" ? 90 : 0
const REMOVE_ON_GIVER_DEATH = new Set(["UNIQUE_BUFF", "UNIQUE_DEBUFF", "UNIQUE_BUFF_ACCUM", "UNIQUE_DEBUFF_ACCUM",
    "UNIQUE_ELEMENT_STACK", "UNIQUE_ELEMENT_BREAK", "UNIQUE_ZONE"])
// UniqueStateLevelMst: groupId -> [level, conditionCount] (hits needed from the previous level).
const UNIQUE_LEVELS = new Map<number, { level: number, conditionCount: number }[]>()
for (const r of uniqueStateLevelJson as any[]) (UNIQUE_LEVELS.get(r.groupId) ?? UNIQUE_LEVELS.set(r.groupId, []).get(r.groupId)!).push(r)

const ACCUM_RATIO_EFFECT_TYPES = new Set([
    "UP_ATK_ACCUM_RATIO", "DWN_ATK_ACCUM_RATIO",
    "UP_DEF_ACCUM_RATIO", "DWN_DEF_ACCUM_RATIO",
    "UP_CTR_ACCUM_RATIO", "UP_CTD_ACCUM_RATIO", "DWN_CTR_ACCUM_RATIO", "DWN_CTD_ACCUM_RATIO",
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
export type FuaMap = Record<number, FuaTrigger>;

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
// Order of queued AdditionalTurnUnitActs across both teams (ActReferee act id, see KiokuState.queueAdditionalTurn).
let additionalTurnSeq = 0

// ---------------------------------------------------------------------------------------------------------------
// Skill launch context (the units' ActiveConditionCheckDataBundle)
// [CONFIRMED 3.19] Every BattleUnit owns a ConditionCheckDataBundle (+0x90, BattleUnit.SetActiveConditionCheckDataBundle
// 0x1388820: GameDirector, SelfUnit = the unit). A state's ACTIVE condition is checked against its holder's bundle
// (UnitStateBase.IsActive(BattleUnit) 0x16dfba0) - that is what every GetProcessedX / give / receive / crit lookup
// uses. AbilityEffectLauncher.Triggering (0x1373550), when called with a triggering skill (ActiveSkillBase.Triggering
// 0x1375430: normal attack, battle skill, ultimate, follow-up / Ether Blow, enemy skills), first writes into EVERY
// unit's bundle (both teams): ActorUnit = the user, MainTargetUnit = the selected target, ActorActiveSkill = the
// skill; then runs the effects (ActorAbilityEffect set per effect), the IAdditionalDamage hits, the regain heal and
// the final damage; then ConditionCheckDataBundle.RemoveTransientData (0x17ec1f0) clears ActorUnit, MainTargetUnit,
// EachTargetUnit, ActorActiveSkill and ActorAbilityEffect on every unit. Passive launches pass no skill (PassiveSkill
// lambdas b__3/b__5, TriggeringOnBattleStart), so outside a skill launch IsActor and ActorSkillType (401) are false.
// So "special attack crit DMG +20%" (active condition set 7 / 317) counts for every hit of the holder's ultimate,
// including its additional-damage hits, and for nothing else. TS: `activeLaunch` while PvPTeam.launchSkill runs.
// EachTargetUnit: [CONFIRMED 3.19] every effect's Triggering sets the USER's bundle (userUnit+0x90)
// EachTargetUnit to the target it is processing, then clears it to null after that target
// (DamageAbilityEffectBase.Triggering 0x18ef650, DmgRandomAbilityEffect, RecoveryHpAbilityEffectBase, StateAbilityEffect
// 0x1901cb0, ... - every *AbilityEffect.Triggering; AdditionalDamageUnitState.GetAdditionalDamageResult 0x15b4840 runs
// its effect's Triggering with the attacker as user, so additional hits too). Skills and passives alike; the launcher
// (AbilityEffectLauncher.Triggering 0x1373550) never sets it. So only the user's own states see it: Nightmare Stinger's
// "DMG dealt to cursed enemies +40%" (active condition set 345, EachTarget.AbilityEffect contains CURSE) is checked
// against the enemy being hit. Every other unit's bundle (the defender's included), and the user's outside an effect,
// have EachTarget null, and Condition.IsMatchCondition (0x17eca80, case 8) makes an EACH_TARGET condition with a null
// unit FALSE for state activity (ConditionUseType SkillActive; true only for SkillStart). In the data only attacker-side
// states (UP_GIV_DMG_RATIO, UP_HEAL_RATE_RATIO, UP_CTR_RATIO, UP_CTD_FIXED) have EachTarget active conditions.
let eachTargetCtx: { user: KiokuState, target: KiokuState } | undefined
// effect: ActorAbilityEffect, the launch's effect being processed (set per effect by AbilityEffectLauncher.Triggering
// 0x1373550 in every unit's bundle; read by content 403 ActorDamageRange).
// Start-condition results of one skill launch's effects, computed before any of them runs (precheckStartConditions).
export interface LaunchPrecheck { kept: Set<KiokuState>, widened?: KiokuState[] }
interface LaunchContext { actor: KiokuState, targetType: TargetType, skillType: string, team: PvPTeam, effect?: SkillDetail }
let activeLaunch: LaunchContext | undefined
// Skill type of the most recent launch: the AttackEnd pass after an Ether Blow sees ActorSkillType "EtherBlow".
let lastLaunchSkillType: string | undefined
// skillMstId -> SkillMst type (1 ActiveSkill, 2 SpecialAttack, 3 NormalAttack, 4 AdditionalSkill, 5 EtherBlow).
const SKILL_MST_TYPE = new Map<number, number>((skillMstJson as any[]).map(s => [s.skillMstId, s.type]))
// ActorSkillType name of a launch (BattleOtherConditionChecker.Check 0x17e3850; follow-ups use their SkillMst type).
function launchSkillType(targetType: TargetType, details: SkillDetail[]): string {
    if (targetType !== TargetType.fuaId) return targetType
    const mstId = (details[0] as any)?.skillMstId
    return mstId !== undefined && SKILL_MST_TYPE.get(mstId) === 5 ? "EtherBlow" : TargetType.fuaId
}
// Runs `fn` with `target` as `user`'s EachTargetUnit (the effect's Triggering for that target), restoring it after.
function withEachTarget<T>(user: KiokuState, target: KiokuState, fn: () => T): T {
    const prev = eachTargetCtx
    eachTargetCtx = { user, target }
    try { return fn() } finally { eachTargetCtx = prev }
}
// Module-level battle state that outlives one skill: the fight solver (models/FightSolver.ts) saves it with each
// cloned battle and restores it before running that clone (the other module state is scoped to one launch / target).
export const saveModuleBattleState = () => ({ lastLaunchSkillType })
export function restoreModuleBattleState(s: { lastLaunchSkillType: string | undefined }): void { lastLaunchSkillType = s.lastLaunchSkillType }
// The running launch, for code outside PvPTeam (e.g. UI probes). Undefined between skills.
export const currentLaunch = (): Readonly<LaunchContext> | undefined => activeLaunch

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
// [CONFIRMED 3.19] AdditionalDamageUnitState.GetAdditionalDamageResult (0x15b4840; disassembly 0x1815b4bc2-0x1815b4c88):
// element = NotSpecified (0), replaced by the attacker's CharacterParameter element when the attacker is a character
// and Enum.IsDefined. A non-character attacker (enemy, enemy summon) deals elementless additional damage. The damage
// base is the GIVER's (state+0x58) initial ATK x DamagePower/100. (TSUBAME_LINK: same shape.)
export function elementNumberOf(unit: KiokuState): number {
    if (unit.enemy) return 0
    const hit = Object.entries(elementMap).find(([, name]) => name === unit.kioku.data.element)
    return hit ? Number(hit[0]) : 0
}

// [CONFIRMED 3.19] StateAbilityEffect.ChangeGiveUnitState (0x19013a0), for states given by a unit (not card/support
// passives): an IHasUpdateableEffectValue state's value is multiplied by Max(1 + s, 0), s = sum over the GIVER's
// active UP/DWN_BUFF_EFFECT_VALUE (for Positive states) or UP/DWN_DEBUFF_EFFECT_VALUE (Negative states) of
// +-v1/1000. Replaces the old one-time pre-scaling of the kioku's own passives (PvPKioku). TSUBAME_LINK scales
// its SPD and ATK parts (value1, value2), not its extra damage (value3).
// `giverEffects`: the giver's active states by type (KiokuState.filteredEffects()). Exported for MaxDamage.
export function scaleGivenState(detail: SkillDetail, giverEffects: Record<string, SkillDetail[]>): SkillDetail {
    const type = detail.abilityEffectType
    if ((detail as any)._noEffectValueScale || !UPDATEABLE_STATE_TYPES.has(type)) return detail
    const neg = NEGATIVE_STATE_TYPES.has(type)
    let sum = 0
    for (const d of giverEffects[neg ? "UP_DEBUFF_EFFECT_VALUE" : "UP_BUFF_EFFECT_VALUE"] ?? []) sum = f32(sum + f32(f32(f32(d.value1) / 10) / 100))
    for (const d of giverEffects[neg ? "DWN_DEBUFF_EFFECT_VALUE" : "DWN_BUFF_EFFECT_VALUE"] ?? []) sum = f32(sum - f32(f32(f32(d.value1) / 10) / 100))
    if (sum === 0) return detail
    const m = Math.max(f32(sum + 1), 0)
    const out: any = { ...detail, value1: f32(detail.value1 * m), _effectValueRate: m }
    if (type === "TSUBAME_LINK") out.value2 = f32(((detail as any).value2 ?? 0) * m)
    return out
}

export class KiokuState {
    posIdx: number;
    teamLabel: string

    kioku: PvPKioku;
    maxBreakGauge: number
    maxMp: number
    // [CONFIRMED 3.19] BattleUnit.BP (+0x34) / MaxBP (+0x3C), MaxBP = StyleMst.bp (CharacterParameter+0x78).
    // A unit with MaxBP > 0 (Vinctio☆Magica 12, Metallicized Projectile 15) uses BP instead of EP for its
    // ultimate: see isSpecialAttackPointMax. BP moves through GAIN_BP_FIXED / LOSE_BP_FIXED (BattleUnit.AddBP
    // 0x1382c30) and BpCharger: own basic attack +1, own battle skill +2, each GAIN_EP_* effect received +1
    // (see act / applyEffectToTarget). Always Clamp(BP + n, 0, MaxBP). Starts at 0 (the ctor 0x138a1d0 zeroes EP and BP).
    maxBp: number = 0
    currentBp = 0
    aggro: number

    team: PvPTeam

    // [CONFIRMED 3.19 - R7] Passive skills are TRIGGERS (PassiveSkill -> AbilityEffectLauncher),
    // not states. `passiveSkills` is the trigger bank; nothing in it affects stats.
    // `passiveEffectDetails` holds the PERMANENT (turn 0) states a trigger has actually added to
    // this unit (UnitCondition.AddUnitState). Timed states go to activeEffectDetails.
    passiveSkills: Map<string, PassiveSkill> = new Map()
    passiveEffectDetails: Map<string, PassiveSkill> = new Map()
    // Bench only (LuxBench), not a game rule: ailments (Ailment enum values) that never land on this unit, as if every
    // attempt were resisted. Checked in canAddTo and for vortexes, before the probability roll.
    immuneAilments?: ReadonlySet<string>
    immuneTo(abilityEffectType: string): boolean {
        if (!this.immuneAilments?.size) return false
        const prefix = ailmentPrefixOf(abilityEffectType)
        return !!prefix && this.immuneAilments.has(prefix)
    }
    // NEW: `_applierState` tracks the KiokuState that applied this effect (not just
    // their display name, already tracked separately as `applier: string`) - needed so
    // DOT ticks can scale off the APPLIER's stat rather than the sufferer's, per the
    // corrected reading of ReceiveSlipDamageUnitStateBase - see tickDotEffects() and
    // DamageCalculator.ts's getSlipDamageResult header comment.
    activeEffectDetails: Map<string, SkillDetail & { _accumCount?: number; _isExemptPassingTurnOnce?: boolean; _applierState?: KiokuState; _lockTurnOrder?: boolean }> = new Map()

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
    // broken (GetAppliedDamageOfBreakSituation, only applied while broken). 0 until the first break:
    // the BattleUnit ctor (0x1389650 / param ctor) never sets it; BreakPoint.Decrease sets it to
    // InitialBreakedDamageReceiveRate/10 on break (onBreak), hits while broken raise it
    // (BreakPoint.ts increaseBreakedDamageReceiveRate) and TurnBegin resets it to 0 (exitBreak).
    // Until 2026-10-02 it started at PVP_POLICY.initialBreakDamageReceiveRate/10 = 100: harmless for damage, but
    // it made "own break bonus >= 80%" (cond 311) true for every unbroken unit and every unit "broken" for
    // the team counts 206/207.
    breakedDamageReceiveRate = 0

    // Incremented by an active ADDITIONAL_TURN_UNIT_ACT (or RE_ACTION_TURN_UNIT_ACT -
    // treated as an alias, see MISSING_AND_UNCERTAIN.md) effect. Grants the SAME unit an
    // immediate extra action - see PvPTeam.performAction.
    pendingBonusTurns = 0
    // [CONFIRMED 3.19] UnitCondition.IsAdditionalTurnCoolTime (+0x50): set when an ADDITIONAL_TURN_UNIT_ACT queues
    // this unit's extra turn, cleared at its TurnBegin. While set, further ADDITIONAL_TURN_UNIT_ACTs do nothing.
    additionalTurnCoolTime = false
    // Battle skills in a row since this unit's last basic attack (read by PvPTeam.allyActionPolicy).
    skillStreak = 0
    // Shown on the unit's next turn in the battle log (e.g. "Cutaway" after a Cutaway advance).
    nextTurnLabel?: string

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
    // PvE enemy parameters (undefined for characters). See PvE.ts.
    enemy?: EnemyParams
    // [CONFIRMED 3.19] BattleUnit.TurnNum (+0x88): 1 in every BattleUnit .ctor, +1 only in
    // BattleUnit$$PassingTurn (called once by ActExecutor$$TurnEnd), i.e. "1 + turns this unit has
    // finished". GameDirectorBase$$Forward does +1 after a TurnUnitActBase / SpecialAttackAct /
    // AdditionalSkillAct / StartTimingAct, but only around CreateTurnActUnitOrderInfo (the turn-order
    // preview) and takes it back with -1 right after (RVA 0x1499ab0, both blocks), so ultimates,
    // follow-ups, combo steps and bonus actions don't count. Read by TURN (7) / EVERY_N_TURN (13),
    // e.g. condition 915 "own action is the 1st since battle start" (Diamond Splash EX crys).
    turnNum = 1
    // Priority shared by every target of the effect currently being applied by this unit (set by
    // the caller that loops over targets, see nextTurnOrderPriority).
    effectTurnPriority?: number
    turnPriorityForEffect(): number {
        return this.effectTurnPriority ?? nextTurnOrderPriority()
    }

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

    // The condition bundle for this unit's checks: always its own team's (PvPTeam.generateState). A method, not a
    // stored closure, so a cloned battle (models/BattleClone.ts, fight solver) keeps every unit pointing at its clone.
    stateGen(actor: KiokuState, target: KiokuState, actionType?: TargetType, trueActorUnit?: KiokuState, mainTargetUnit?: KiokuState, notice?: AffectedUnitNotice): BattleState {
        return this.team.generateState(actor, target, actionType, trueActorUnit, mainTargetUnit, notice)
    }

    // BattleUnit.PositionId (1-5). Characters: slot + 1. Enemies: set by PvPTeam.layoutEnemyPositions (a wave
    // is centred, see PvE.wavePositionIds) or by the summon that created them.
    positionId: number

    constructor(posIdx: number, teamLabel: string, team: PvPTeam, kioku: PvPKioku) {
        this.posIdx = posIdx
        this.positionId = posIdx + 1
        this.teamLabel = teamLabel
        this.team = team
        this.kioku = kioku
        this.currentRemainingBreakGauge = maxBreak(kioku.data.rarity, kioku.data.role)
        this.maxBreakGauge = this.currentRemainingBreakGauge
        this.aggro = aggro[kioku.data.role]
        this.maxMp = kioku.data.ep
        this.maxBp = kioku.data.bp ?? 0
        this.currentMaxMagic = kioku.maxMagicStacks
        // ReDriveBattleCore.BattleUnit's HP is initialized from the character's base HP
        // stat (BattleParameter.HP), i.e. kioku.getBaseHp() here - no in-battle buffs
        // apply to the starting HP pool itself, only to incoming/outgoing damage.
        this.maxHp = kioku.getBaseHp()
        this.currentHp = this.maxHp
        if (isEnemyKioku(kioku)) {
            // [CONFIRMED 3.19] BattleUnit.ctor(id, questEnemyAppearanceMstId, pos): BreakPoint.Initialize(
            // BreakMst.breakPoint) (0 = no gauge), WeakElements from the appearance, no EP.
            const p = enemyParams(kioku.appearance)
            this.enemy = p
            this.maxBreakGauge = p.breakMst.breakPoint
            this.currentRemainingBreakGauge = this.maxBreakGauge
            this.weakElements = [...p.weakElements]
            this.maxMp = 0
            this.maxBp = 0
            this.aggro = 0
        } else if (!isPvpLikeBattle(team.battleType)) {
            // [CONFIRMED 3.19] CharacterParameter.ctor (0x138af80) with isPvpOrGvg = false: BreakPoint = 0,
            // and the character BattleUnit ctor only initializes a gauge when it is > 0: characters
            // can't be broken in quests / Score Attack.
            this.maxBreakGauge = 0
            this.currentRemainingBreakGauge = 0
        }
    }

    // Break parameters (BattleParameter +0x4c..0x5c). Enemies: BreakMst. Characters: PvP policy rows
    // (policyType 3) in PvP/GvG, CharacterParameter's PvE constants otherwise (dead data there, since
    // PvE characters have no gauge).
    get breakParams(): { slowRatio: number, initialRate: number, maxRate: number, increaseRate: number, recoveryPerTurn: number } {
        if (this.enemy) {
            const b = this.enemy.breakMst
            return { slowRatio: b.breakTurnGaugeSlowRatio, initialRate: b.initialBreakedDamageReceiveRate, maxRate: b.maxBreakedDamageReceiveRate, increaseRate: b.breakedDamageReceiveRateIncreaseRate, recoveryPerTurn: b.breakPointRecoveryPerTurn }
        }
        if (isPvpLikeBattle(this.team.battleType)) {
            return { slowRatio: 250, initialRate: PVP_POLICY.initialBreakDamageReceiveRate, maxRate: PVP_POLICY.maxBreakDamageReceiveRate, increaseRate: 1000, recoveryPerTurn: 0 }
        }
        return { slowRatio: 250, initialRate: 1300, maxRate: 2000, increaseRate: 1000, recoveryPerTurn: 0 }
    }

    // [CONFIRMED] ReDriveBattleCore.BattleUnit$$get_IsDead : `HP <= 0` (the source also
    // checks a multi-gauge-HP-bar CurrentHpGaugeCount<2 condition used for PvE raid
    // bosses with multiple HP bars; not applicable to this 1v1 PvP context, so omitted).
    // Enemies with 2+ HP gauges left are not dead at 0 HP (they revive, see checkHpGaugeRevive).
    // [CONFIRMED 3.19] UnitCondition.RepeatStunParryRate: StunUnitState.OnRemovingFromCondition (0x15c0850) raises it
    // by 25 (max 80) on quest enemies; it adds to the stun parry of the state-add roll (UnitStateEngine).
    repeatStunParryRate = 0

    // [CONFIRMED 3.19] UnitCondition zone fields (0x5C..0x6C): ZoneStack / MaxZoneStack, and the "field started" /
    // "field ended" pattern flags read by condition contents 113/114 (cleared after every passive pass).
    zone = { stack: 0, max: 0, expandPattern: 0, releasePattern: 0 }
    get zoneActive(): boolean { return this.zone.max > 0 && this.zone.stack > 0 }
    // [CONFIRMED 3.19] UnitCondition CountPoint / MaxCountPoint (COUNT "sigils"): MaxCountPoint = 20 while the unit
    // holds a COUNT state (CountUnitState.OnAdded), both reset to 0 when it goes.
    countPoint = 0
    maxCountPoint = 0
    // UnitCondition.TryModifyCountPointBy (0x15cae00): only while holding COUNT; clamp [0, max].
    tryModifyCountPoint(d: number): void {
        if (!this.hasState("COUNT")) return
        this.countPoint = Math.max(0, Math.min(this.maxCountPoint, this.countPoint + d))
    }
    onStateRemoved(detail: SkillDetail): void {
        if (detail.abilityEffectType === "STUN" && this.enemy) this.repeatStunParryRate = Math.min(this.repeatStunParryRate + 25, 80)
        if (detail.abilityEffectType === "COUNT") { this.countPoint = 0; this.maxCountPoint = 0 }
        if (detail.abilityEffectType === "TSUBAME_CORE") {
            // [CONFIRMED 3.19] TsubameCoreUnitState.OnRemovingFromCondition (0x16d95a0): every TSUBAME_LINK the same caster gave
            // to the caster's team goes with it.
            const caster = (detail as any)._applierState as KiokuState | undefined
            for (const u of this.team.kiokuStates) u.removeStatesWhere(d => d.abilityEffectType === "TSUBAME_LINK" && (d as any)._applierState === (caster ?? this))
        }
    }

    // [CONFIRMED 3.19] UnitCondition.AddUnitState: after a successful roll, a new ailment (Burn/Poison/Curse/Bleed/
    // Vortex/Weakness/Stun) is blocked by the unit's first active PREVENT_ABNORMAL with RemainCount >= 1, which loses
    // one count (ConsumeRemainCount). Debuffs are not blocked.
    blockedByPreventAbnormal(detail: SkillDetail): boolean {
        if (!isAlimentEffect(detail.abilityEffectType)) return false
        for (const map of [this.activeEffectDetails, this.passiveEffectDetails] as Map<string, SkillDetail>[]) {
            const hit = [...map.entries()].find(([, d]) => d.abilityEffectType === "PREVENT_ABNORMAL" && (d.remainCount ?? 0) >= 1 && this.isEffectCurrentlyActive(d))
            if (!hit) continue
            const remain = (hit[1].remainCount ?? 0) - 1
            if (remain < 1) map.delete(hit[0]); else map.set(hit[0], { ...hit[1], remainCount: remain })
            return true
        }
        return false
    }

    // [CONFIRMED 3.19] REFLECTION_RATIO (ReflectionRatioUnitState, ctor 0x16d6520; Triggering 0x16d6c50): when this unit
    // is hit while it has barrier endurance X > 0, each active reflection state deals
    //   base = ratio/100 * X * ((X/124)^1.2 + 12) / 20      (ratio = v1/10)
    // through the attack pipeline without crit (GetReflectionDamageResult 0x1380070) to every living unit of the other
    // team (value2 > 0) or to the attacker (value2 = 0). It can't kill (AttacksToNearDeath: HP - 1 at most).
    reflectDamage(attacker: KiokuState): void {
        const x = this.barrierEndurance
        if (x <= 0) return
        for (const d of this.filteredEffects()["REFLECTION_RATIO"] ?? []) {
            const ratio = f32(f32(d.value1) / 10)
            const base = dec.float(ratio).div(dec.int(100)).mul(dec.int(x)).mul(dec.float(Math.pow(x / 124.0, 1.2)).add(dec.int(12))).div(dec.int(20))
            const victims = (d.value2 ?? 0) > 0 ? this.team.otherTeam.kiokuStates.filter(u => !u.isDead) : (attacker.isDead ? [] : [attacker])
            for (const v of victims) {
                const r = getAttackDamageResult(this, v, { ...d, value1: 0 } as SkillDetail, DamageBaseType.DEF, {
                    battleType: this.team.battleType, damageBaseOverride: base, forceCrit: false, attackElementOverride: d.element ?? 0,
                })
                const dmg = v.team.modeChangeDamageCut(v, Math.max(0, Math.min(r.finalDamage, v.currentHp - 1)))
                const lost = v.takeDamage(dmg)
                this.team.eventLog.push({ kind: "hit", source: `${this.kioku.name} (reflect)`, target: v.kioku.name, amount: lost, sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: v.team.isTeam1, targetPos: v.posIdx })
                v.lastNotice = mergeNotice(v.lastNotice, { ...emptyNotice(), totalDamageValue: lost, isReceivedReflection: true })
            }
        }
    }

    // VortexProcess: -1 RemainAttackCount on every vortex; the ones at < 1 deal their damage through the slip pipeline
    // (GetSlipDamageValue, aqua; UP/DWN_GIV_VORTEX_DMG_RATIO apply), give the holder DOT EP, and are removed.
    popVortex(): number {
        let total = 0
        for (const [key, d] of [...this.passiveEffectDetails] as [string, any][]) {
            if (d.abilityEffectType !== "VORTEX_ATK") continue
            d._remainAttackCount = (d._remainAttackCount ?? 0) - 1
            if (d._remainAttackCount >= 1) continue
            this.passiveEffectDetails.delete(key)
            const owner: KiokuState = d._applierState ?? this
            const dmg = getSlipDamageResult(owner, this, { ...d, element: 2 }, DamageBaseType.ATK, this.team.battleType)
            total += dmg
            this.getMp(2)
            // Display/attribution only (Kioku Grid bench, export): the game credits the popping hit, see the caller.
            this.team.eventLog.push({ kind: "dot", source: `${owner.kioku.name} (vortex)`, target: this.kioku.name, amount: dmg, sourceIsTeam1: owner.team.isTeam1, sourcePos: owner.posIdx, targetIsTeam1: this.team.isTeam1, targetPos: this.posIdx })
        }
        return total
    }

    // UniqueLvDebuffUnitStateBase.TryCountUp (0x16de5f0): below MaxLv, HitCounter++; reaching the next level's
    // conditionCount (UniqueStateLevelMst, group = value2) levels up and resets the counter.
    uniqueLvUp(attacker: KiokuState): void {
        for (const map of [this.activeEffectDetails, this.passiveEffectDetails] as Map<string, any>[]) {
            for (const [key, d] of map) {
                if (d.abilityEffectType !== "UNIQUE_ELEMENT_STACK" && d.abilityEffectType !== "UNIQUE_ELEMENT_BREAK") continue
                if (!this.isEffectCurrentlyActive(d)) continue
                if (d.abilityEffectType === "UNIQUE_ELEMENT_STACK" && d.element && elementMap[d.element] !== attacker.kioku.data.element) continue
                if (d.abilityEffectType === "UNIQUE_ELEMENT_BREAK" && d._applierState !== attacker) continue
                const levels = UNIQUE_LEVELS.get(d.value2) ?? []
                const maxLv = levels.reduce((m, r) => Math.max(m, r.level), 1)
                let lv = d._lv ?? 1, counter = d._hitCounter ?? 0
                if (lv >= maxLv) continue
                counter++
                const next = levels.find(r => r.level === lv + 1)
                if (next && next.conditionCount > 0 && counter >= next.conditionCount) { lv++; counter = 0 }
                map.set(key, { ...d, _lv: lv, _hitCounter: counter })
            }
        }
    }

    collectConsumable(): [Map<string, any>, string][] {
        const out: [Map<string, any>, string][] = []
        for (const map of [this.activeEffectDetails, this.passiveEffectDetails] as Map<string, any>[])
            for (const [key, d] of map) if (CONSUME_ON_ATTACK_STATE_TYPES.has(d.abilityEffectType) && (d.remainCount ?? 0) >= 1 && this.isEffectCurrentlyActive(d)) out.push([map, key])
        return out
    }
    consumeCollected(list: [Map<string, any>, string][]): void {
        for (const [map, key] of list) {
            const d = map.get(key)
            if (!d) continue
            const remain = Math.max(0, (d.remainCount ?? 0) - 1)
            if (remain < 1) { map.delete(key); this.onStateRemoved(d) } else map.set(key, { ...d, remainCount: remain })
        }
        if (list.length) this.updateSpd()
    }

    // [CONFIRMED 3.19] REGAIN_ATK / REGAIN_DEF / REGAIN_HP (RegainUnitStateBase.GetAdditionalHpRecoveryValue 0x16d7320,
    // from AbilityEffectLauncher.GetAdditionalRecoveryResult 0x1372f70): once per skill launch, if it hit an opposing
    // unit, the holder heals Ceiling(sum over its regain states of GetProcessedRecoveryValue(holder, holder,
    // caster's processed ATK (DEF / MaxHP) * v1/1000 + v2, PvP/GvG)).
    regainAfterLaunch(noticeStart: number): void {
        const regains = ["REGAIN_ATK", "REGAIN_DEF", "REGAIN_HP"].flatMap(t => this.filteredEffects()[t] ?? [])
        if (!regains.length || this.isDead) return
        if (!this.team.otherTeam.lastActionNotices.slice(noticeStart).some(n => n.isReceivedAttack)) return
        const suppress = this.team.battleType === BattleType.Pvp || this.team.battleType === BattleType.Gvg
        let sum = 0
        for (const d of regains) {
            const src: KiokuState = (d as any)._applierState ?? this
            const stat = d.abilityEffectType === "REGAIN_ATK" ? getProcessedAtk(src) : d.abilityEffectType === "REGAIN_DEF" ? getProcessedDef(src) : src.maxHp
            sum += getProcessedRecoveryValue(this, this, stat * (d.value1 / 1000) + ((d as any).value2 ?? 0), suppress)
        }
        if (sum > 0) this.heal(Math.ceil(sum), this)
    }

    // [CONFIRMED 3.19] IAdditionalDamage states (ADDITIONAL_DAMAGE = AdditionalDamageUnitState, TSUBAME_LINK =
    // TsubameLinkUnitState): AbilityEffectLauncher.Triggering (0x1373550), only for a launch from an active skill
    // (origin ActiveSkill with a triggering skill: normal attack, battle skill, ultimate, follow-up, Ether Blow), runs
    // AFTER all of the skill's effects and before the regain heal / final damage, still inside the skill's condition
    // context: for each of the user's states that is an IAdditionalDamage and IsActive(user) (lambda b__1 0x138eb70),
    // in state-list order, GetAdditionalDamageResult(user, skill, skill notices, director) (0x15b4840 / 0x16d9970):
    //   targets = units of the skill's notices with IsReceivedAttack (b__14_0) whose team != the user's (b__2);
    //   none -> nothing; base = GetDamageBase(giver's initial ATK, DamagePower / 100) (DamagePower = v1/10, the
    //   link's v3/10); one AdditionalDamageAbilityEffect (range all, DamageCategory Additional, attack element = the
    //   user's character element) hits every target through DamageAbilityEffectBase.Triggering with the USER as
    //   attacker: reflection, full pipeline with the user's give/crit states (and its ActorSkillType = the launching
    //   skill), vortex, Attack, unique Lv-up - but no break damage, no broken-rate growth and no consume-on-attack
    //   (its IsGiveBreakPointDamage / IsIncreaseBreakedDamageReceiveRate / IsConsumeRemainCountOnAttackHit are false).
    // So one extra hit per state per opponent hit, not one per damage row (the TS used to add it to every row and
    // every DMG_RANDOM hit). Dead targets are skipped here [?] (their notice still counts in the game).
    // [CONFIRMED 3.19] Who: the attacker's own IAdditionalDamage states that are IsActive on the attacker's bundle
    // (AbilityEffectLauncher lambda b__1 0x138eb70), with no check of the state's giver: an ADDITIONAL_DAMAGE given to
    // all allies (Pluvia☆Neujahr, Scorchin' Summer Spike) also lands on the giver (AdditionalDamageUnitState has no
    // CanAddTo override; only TsubameLinkUnitState.CanAddTo 0x16d9950 excludes its caster) and fires on her own skills.
    // Targets: opponents (b__2 0x15c7b10, other TeamId) whose notice IsReceivedAttack (b__14_0). Only for an
    // ActiveSkill-origin launch with a skill (the launcher skips the pass otherwise): passives never trigger it.
    additionalDamageAfterLaunch(): void {
        const states = [...this.passiveEffectDetails.values(), ...this.activeEffectDetails.values()]
            .filter(d => (d.abilityEffectType === "ADDITIONAL_DAMAGE" || d.abilityEffectType === "TSUBAME_LINK") && this.isEffectCurrentlyActive(d))
        if (!states.length) return
        const targets = this.team.otherTeam.kiokuStates.filter(u => u.lastNotice?.isReceivedAttack)
        for (const state of states) {
            const isLink = state.abilityEffectType === "TSUBAME_LINK"
            const applier: KiokuState = (state as any)._applierState ?? this
            // TsubameLinkUnitState: power value3/10 % from the caster (Luce), not scaled by the effect-value rate.
            const bonus = isLink ? { ...state, value1: (state as any).value3 ?? 0 } as SkillDetail : state
            for (const target of targets) {
                if (target.isDead) continue
                withEachTarget(this, target, () => this.additionalHit(target, bonus, applier, isLink ? "Swallow link" : "additional damage"))
            }
        }
    }

    private additionalHit(target: KiokuState, bonus: SkillDetail, applier: KiokuState, label: string): void {
        // [CONFIRMED 3.19] ReflectionProcess (0x18eefb0) runs before the damage calc of every damage effect's hit.
        target.reflectDamage(this)
        if (target.hasState("UNIQUE_ENEMY_639002")) {
            this.team.eventLog.push({ kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: 0, sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: target.team.isTeam1, targetPos: target.posIdx })
            target.lastNotice = mergeNotice(target.lastNotice, { ...emptyNotice(), isReceivedAttack: true })
            return
        }
        const result = getAttackDamageResult(this, target, bonus, DamageBaseType.ATK, {
            battleType: this.team.battleType, rng: this.team.rng, rngLabel: `${unitLabel(this)} → ${unitLabel(target)} crit (${label})`,
            damageBaseOverride: getAdditionalDamageBase(applier, bonus),
            attackElementOverride: elementNumberOf(this),
            forceCrit: this.team.critOverride?.(this, target, bonus),
        })
        let totalDamage = result.finalDamage
        // RCV_FINAL_DAMAGE: the game sums the whole skill (additional hits included) per target; per hit here, as for rows.
        const finalExtra = getFinalDamageExtra(totalDamage, getFinalDamageRatio(target, this))
        if (finalExtra > 0) totalDamage += damageCutByBarrier(target, finalExtra).remainingDamage
        const cd = this.team.countdown
        if (cd?.unit && target.hasState("COUNTDOWN_START")) cd.cancelTotal = Math.min(cd.cancelMax, cd.cancelTotal + totalDamage)
        totalDamage = target.team.modeChangeDamageCut(target, totalDamage)
        const wasAlive = !target.isDead
        const vortex = target.popVortex()
        totalDamage += vortex
        if (vortex) result.notice.totalDamageValue += vortex  // part of the hit's notice, see applyEffectToTarget
        const hpLost = target.takeDamage(totalDamage)
        target.chargeByReceiveDamage()
        if (wasAlive && target.isDead) this.getMp(10)
        if (!target.isDead) target.uniqueLvUp(this)
        this.team.eventLog.push({
            kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: hpLost,
            barrierAbsorbed: result.barrierAbsorbed, isCritical: result.isCritical,
            sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: target.team.isTeam1, targetPos: target.posIdx,
            vortex: vortex || undefined,
        })
        target.lastNotice = mergeNotice(target.lastNotice, result.notice)
        target.team.lastActionNotices.push(result.notice)
        if (result.shieldMultiplierApplied) target.consumeShieldCharges()
    }

    // Removes matching timed and permanent states (running onStateRemoved for each).
    removeStatesWhere(pred: (d: SkillDetail) => boolean): number {
        let n = 0
        for (const map of [this.activeEffectDetails, this.passiveEffectDetails] as Map<string, SkillDetail>[]) {
            for (const [key, d] of [...map]) if (pred(d)) { map.delete(key); n++; this.onStateRemoved(d) }
        }
        if (n) this.updateSpd()
        return n
    }

    // Link HP bookkeeping (PvPTeam.syncLinkHp): already counted as defeated / HP at the last sync.
    _linkCounted?: boolean
    _linkSyncedHp?: number

    get isDead(): boolean {
        return this.currentHp <= 0 && (this.enemy?.hpGaugeCount ?? 1) < 2
    }

    // [CONFIRMED 3.19] GameDirectorBase.CheckHpGaugeRevive (0x14991f0) after each act ->
    // ActExecutor.ExecuteHpGaugeRevive (0x17df9f0): negative states removed, HP = MaxHP, break gauge
    // reset, CurrentHpGaugeCount - 1. [UNCERTAIN] TurnGauge.DecreaseGaugeValue(own gauge, new priority)
    // is read as "gauge to 0" (acts next).
    checkHpGaugeRevive(): boolean {
        if (!this.enemy || this.currentHp > 0 || this.enemy.hpGaugeCount < 2) return false
        for (const [key, d] of [...this.activeEffectDetails]) if (isOpponentEffect(d.abilityEffectType)) this.activeEffectDetails.delete(key)
        this.currentHp = this.maxHp
        this.isBroken = false
        this.currentRemainingBreakGauge = this.maxBreakGauge
        this.breakedDamageReceiveRate = 0
        this.enemy.hpGaugeCount--
        this.updateSpd()
        this.turnGauge = 0
        this.turnOrderPriority = nextTurnOrderPriority()
        return true
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

    // [CONFIRMED 3.19] UnitCondition.Refresh (0x15c9b00, the LockSpecialAttackUnitState type test)
    // sets CanNotUseSpecialAttack (+0x3a) while a LOCK_SPECIAL_ATTACK ("Magic Seal") state is held.
    // ActExecutor.ValidateCanExecuteAct (0x17e27a0) rejects a SpecialAttackAct when it is set.
    get canNotUseSpecialAttack(): boolean {
        return this.hasState("LOCK_SPECIAL_ATTACK")
    }

    // [CONFIRMED] ReDriveBattleCore.BattleUnit$$SetHP (clamp) + $$Attack (delta + return
    // actual amount lost).
    takeDamage(damage: number): number {
        const wasDead = this.isDead
        const before = this.currentHp
        this.currentHp = Math.max(0, Math.min(this.maxHp, before - damage))
        if (!wasDead && this.isDead) this.onDeath()
        return before - this.currentHp
    }

    // [CONFIRMED 3.19] IRemoveByUserUnitDeath: every UniqueUnitStateBase state (UNIQUE_BUFF/DEBUFF(+ACCUM),
    // UNIQUE_ELEMENT_STACK/BREAK, UNIQUE_ZONE) this unit gave goes when it dies.
    onDeath(): void {
        // [CONFIRMED 3.19] GameDirectorBase.OnBattleUnitDeath (0x149a9a0): AddEP(-EP); AddBP(-BP).
        this.currentMp = 0
        this.currentBp = 0
        const teams = this.team.otherTeam ? [this.team, this.team.otherTeam] : [this.team]
        for (const t of teams) for (const u of t.kiokuStates)
            u.removeStatesWhere(d => REMOVE_ON_GIVER_DEATH.has(d.abilityEffectType) && (d as any)._applierState === this)
    }

    heal(amount: number, source?: KiokuState): number {
        const before = this.currentHp
        this.currentHp = Math.max(0, Math.min(this.maxHp, before + amount))
        const healed = this.currentHp - before
        if (healed > 0) this.team.eventLog.push({ kind: "heal", source: source?.kioku.name, target: this.kioku.name, amount: healed, sourceIsTeam1: source?.team.isTeam1, targetIsTeam1: this.team.isTeam1, targetPos: this.posIdx })
        return healed
    }

    // [CONFIRMED 3.19] BreakPoint$$Decrease, on the gauge reaching 0 (called from BreakPoint.ts).
    onBreak(turnOrderPriority: number = nextTurnOrderPriority()) {
        if (this.isBroken) return
        this.isBroken = true
        this.breakCount++
        // Turn gauge pushed back by BreakTurnGaugeSlowRatio/1000 (PvP policy id 20: 250 -> 0.25; enemies:
        // BreakMst). The game passes the damage effect's NextTurnOrderPriority.
        const bp = this.breakParams
        this.addGaugeRate(f32(f32(bp.slowRatio) / 1000), turnOrderPriority)
        // BreakedDamageReceiveRate = InitialBreakedDamageReceiveRate / 10 (int division; PvP 1000 -> 100%).
        this.breakedDamageReceiveRate = Math.trunc(bp.initialRate / 10)
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
    // [CONFIRMED 3.19] ActExecutor.TurnBegin (0x17e1b30): broken and able to act -> gauge reset to max,
    // rate 0; not broken -> BreakPoint.IncreaseValueByRatio(recoveryPerTurn / 1000f)
    // (value += (int)(max * ratio), clamped); broken and unable to act -> stays broken.
    exitBreak() {
        if (this.isBroken) {
            if (this.canNotAction) return
            this.isBroken = false
            this.currentRemainingBreakGauge = this.maxBreakGauge
            this.breakedDamageReceiveRate = 0
        } else if (this.maxBreakGauge >= 1) {
            const ratio = f32(f32(this.breakParams.recoveryPerTurn) / 1000)
            if (ratio > 0) this.currentRemainingBreakGauge = Math.min(this.maxBreakGauge, Math.max(0,
                this.currentRemainingBreakGauge + Math.trunc(f32(f32(this.maxBreakGauge) * ratio))))
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
        const updated: typeof this.activeEffectDetails = new Map();
        for (const [key, detail] of this.activeEffectDetails) {
            let turn = detail.turn;
            if (detail._isExemptPassingTurnOnce) {
                detail._isExemptPassingTurnOnce = false
            } else {
                turn = turn - 1
            }
            if (turn > 0) updated.set(key, { ...detail, turn })
            else this.onStateRemoved(detail)
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
    // (IMM_SLIP_DMG is not a DOT immunity: it is the instant DOT burst, see applyEffectToTarget.)
    private tickDotEffects(): void {
        for (const detail of this.activeEffectDetails.values()) {
            const damageBaseType = DOT_EFFECT_DAMAGE_BASE_TYPE[detail.abilityEffectType]
            if (damageBaseType === undefined) continue
            const applier = detail._applierState ?? this;
            const dmg = getSlipDamageResult(applier, this, detail, damageBaseType, this.team.battleType)
            const lost = this.takeDamage(dmg)
            if (!this.isDead) this.getMp(2)
            this.team.eventLog.push({ kind: "dot", source: applier.kioku.name, target: this.kioku.name, amount: lost, sourceIsTeam1: applier.team.isTeam1, sourcePos: applier.posIdx, targetIsTeam1: this.team.isTeam1, targetPos: this.posIdx })
        }
    }

    // [CONFIRMED 3.19] CONTINUOUS_RECOVERY: ContinuousRecoveryUnitState.GetRecoveryValue (0x15b67d0) =
    // GetProcessedRecoveryValue(holder, holder, holder MaxHP * (v1/10)/100 + v2, no PvP suppression); ticked by
    // ActExecutor.ContinuousRecoveryProcess (0x17df600) at the start of the holder's turn (TurnBegin): the values of
    // all its HoT states are summed, then heal = Max(0, Ceiling(sum)).
    tickHotEffects(): void {
        let sum = 0, any = false
        for (const detail of this.activeEffectDetails.values()) {
            if (detail.abilityEffectType !== "CONTINUOUS_RECOVERY" || !this.isEffectCurrentlyActive(detail)) continue
            any = true
            const base = this.maxHp * (f32(f32(detail.value1) / 10) / 100) + f32((detail as any).value2 ?? 0)
            sum += getProcessedRecoveryValue(this, this, base, false)
        }
        if (any && !this.isDead) this.heal(Math.max(0, Math.ceil(sum)), this)
    }

    currentBuffs(): string[] {
        return [...this.activeEffectDetails.values()]
            .filter(d => isFriendlyEffect(d.abilityEffectType))
            .map(d => `${d.applier} - ${d.description}`)
    }

    // Is a state of this type on the unit (timed or permanent)?
    hasState(abilityEffectType: string): boolean {
        for (const d of this.activeEffectDetails.values()) if (d.abilityEffectType === abilityEffectType) return true
        for (const d of this.passiveEffectDetails.values()) if (d.abilityEffectType === abilityEffectType) return true
        return false
    }

    // Ailments (burn, curse, poison, stun, vortex, weakness, wound), listed apart from debuffs:
    // "Wound (2 turns) - Soul Salvation - At turn start, takes void DMG."
    currentAilments(): string[] {
        return [...this.activeEffectDetails.values()]
            .filter(d => isAlimentEffect(d.abilityEffectType))
            .map(d => `${ailmentName(d.abilityEffectType)}${d.turn ? ` (${d.turn} turn${d.turn === 1 ? "" : "s"})` : ""} - ${d.applier}${d.description ? ` - ${d.description}` : ""}`)
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
    // [CONFIRMED 3.19] StateAbilityEffect$$Triggering calls BattleUnit$$UpdateTurnGaugeBySpeed
    // (0x1389210) right after adding a state: gauge = (oldSpeed / newSpeed) * gauge in float32,
    // skipped when Mathf.Approximately. It runs after EVERY state (not once after all passives), so
    // float rounding depends on the exact order of SPD states and HASTE/SLOW - which is what breaks
    // exact ties between otherwise identical units (e.g. mirrored Thunder Torrents).
    // [CONFIRMED 3.19] BattleUnit.UpdateParameter (0x1388cd0) sums every active IMaxHpVariation state:
    // UP_HP_RATIO (UpHpRatioUnitState 0x16e5b80) = InitialHP * ((float)v1/10)/100 and UP_HP_FIXED
    // (UpHpFixedUnitState 0x16e5b00) = (decimal)(float)v1 (e.g. "Max HP +420" sub-crys); bonus = Ceiling(sum);
    // MaxHP = base + bonus; when the bonus grows the unit also gains the difference as HP; when it shrinks HP is
    // only clamped to the new MaxHP.
    updateMaxHp(): void {
        const baseHp = this.kioku.getBaseHp()
        const fx = this.filteredEffects()
        let sum = 0
        for (const d of fx["UP_HP_FIXED"] ?? []) sum += f32(d.value1)
        for (const d of fx["UP_HP_RATIO"] ?? []) sum += baseHp * (f32(f32(d.value1) / 10) / 100)
        const bonus = Math.ceil(sum)
        const oldBonus = this.maxHp - baseHp
        if (bonus === 0 && oldBonus === 0) return
        const gain = bonus > oldBonus ? bonus - oldBonus : 0
        this.maxHp = baseHp + bonus
        this.currentHp = Math.max(0, Math.min(this.maxHp, this.currentHp + (this.isDead ? 0 : gain)))
    }

    updateSpd(updateGauge = true): void {
        this.updateMaxHp()
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
        return isActiveConditionSetMet(detail, this.unitStateCheckState())
    }

    // [CONFIRMED 3.19] UnitStateBase.IsActive(BattleUnit) (0x16dfba0) checks the holder's own condition bundle:
    // during a skill launch it carries the launching unit, its main target and its skill (see `activeLaunch`).
    private unitStateCheckState(): BattleState {
        // EachTarget: only while one of this unit's own effects processes a target (see eachTargetCtx); otherwise null,
        // and EACH_TARGET conditions are false (`eachTargetUnset`).
        const l = activeLaunch
        const each = eachTargetCtx?.user === this ? eachTargetCtx.target : undefined
        const state = l ? this.stateGen(this, each ?? this, l.targetType, l.actor, l.team.lastMainTarget) : this.stateGen(this, each ?? this)
        if (!each) state.eachTargetUnset = true
        if (l?.effect) state.actorEffect = l.effect
        return state
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

    // [CONFIRMED 3.19] EpCharger.GetProcessedRecoveryEp (0x1497980), then EP = Clamp(EP + gain, 0, MaxEP):
    //   rate = 100 (+ the style's RecoveryEpRate, not in our data); every active UP_EP_RECOVER_RATE_RATIO adds v1/10;
    //   then every DWN_EP_RECOVER_RATE_RATIO in turn: rate -= rate * (v1/10) / 100;
    //   gain = floor(Max(0, (rate - 100) * ep / 100 + ep)). Enemies have no EP.
    // (Was a multiplier computed once at battle start, so buffs gained later never counted.)
    getMp(mp: number): void {
        if (this.enemy) return
        const fx = this.filteredEffects()
        let rate = 100
        for (const d of fx["UP_EP_RECOVER_RATE_RATIO"] ?? []) rate = f32(rate + f32(f32(d.value1) / 10))
        for (const d of fx["DWN_EP_RECOVER_RATE_RATIO"] ?? []) rate = f32(rate + -f32(f32(rate * f32(f32(d.value1) / 10)) / 100))
        const v = Math.max(0, f32(f32(f32(f32(rate - 100) * f32(mp)) / 100) + f32(mp)))
        const gain = Math.floor(v)
        this.currentMp = Math.max(0, Math.min(this.maxMp, this.currentMp + gain))
    }

    // [CONFIRMED 3.19] BattleUnit.IsSpecialAttackPointMax (0x13885d0): MaxBP > 0 ? BP >= MaxBP
    // : (MaxEP > 0 && EP >= MaxEP). Every ultimate gate uses it (ActExecutor.ValidateCanExecuteAct,
    // UnitBrain.ShouldUseSpecialAttack / GetAutoSpecialAttackUseUnit, SpecialAttack.Execute).
    isSpecialAttackPointMax(): boolean {
        if (this.maxBp > 0) return this.currentBp >= this.maxBp
        return this.maxMp > 0 && this.currentMp >= this.maxMp
    }

    // [CONFIRMED 3.19] BattleUnit.AddBP (0x1382c30): BP = Clamp(BP + bp, 0, MaxBP).
    addBp(bp: number): void {
        this.currentBp = Math.max(0, Math.min(this.maxBp, this.currentBp + bp))
    }

    // [CONFIRMED 3.19] EpCharger.ChargeByReceiveDamage (0x1497520): EP by HP% after the hit (<10: 15, <40: 10, else 5),
    // only while alive. Kills give the attacker 10 (DefeatUnit, 0x14973a0); a DOT tick gives 2 (0x1497880).
    chargeByReceiveDamage(): void {
        if (this.isDead) return
        const pct = this.currentHp * 100 / this.maxHp
        this.getMp(pct < 10 ? 15 : pct < 40 ? 10 : 5)
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

    // [CONFIRMED 3.19] CutoutUnitState$$TriggeringAtTurnEnd (0x15b7840), run by ActExecutor$$TurnEnd
    // for the ACTING unit's own states (ITurnEndTrigger, IsActive), after its TurnEnd passives and
    // before PassingTurn. Only the first Cutaway fires; any other one on the unit is just removed
    // (the Any(IsActivated) early-out). When it fires:
    //   - its unit's skill-origin IDebuff states (ailments are not IDebuff), newest first, the first
    //     DebuffRemoveNum (value2; 0 = all) are removed
    //   - unless the unit had a LockTurnOrder state when Cutaway was added (SetTriggeringInfo):
    //     gauge.SubtractGaugeValue(value1 / 1000) with a fresh NextTurnOrderPriority, i.e.
    //     gauge = max(0, gauge - rate * 10000 / speed), speed before the debuffs are removed
    //   - the Cutaway itself is removed.
    // Returns true when a Cutaway fired.
    triggerCutoutAtTurnEnd(): boolean {
        const cutouts = [...this.activeEffectDetails.entries()].filter(([, d]) => d.abilityEffectType === "CUTOUT")
        if (!cutouts.length) return false
        const [, c] = cutouts[0]
        if (!c._lockTurnOrder) this.addGaugeRate(-f32(f32(c.value1) / 1000), nextTurnOrderPriority())
        const debuffs = [...this.activeEffectDetails.entries()]
            .filter(([, d]) => !isAlimentEffect(d.abilityEffectType) && isOpponentEffect(d.abilityEffectType))
            .reverse()
        const removeNum = c.value2 > 0 ? c.value2 : debuffs.length
        debuffs.slice(0, removeNum).forEach(([key]) => this.activeEffectDetails.delete(key))
        cutouts.forEach(([key]) => this.activeEffectDetails.delete(key))
        this.updateSpd()
        return true
    }

    filteredEffects(): Record<string, SkillDetail[]> {
        const currents: Record<string, SkillDetail[]> = {};
        const checkState = this.unitStateCheckState();
        [...this.passiveEffectDetails.values(), ...this.activeEffectDetails.values()]
            .forEach(detail => {
                if (!isActiveConditionSetMet(detail, checkState)) return
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
    // Effect-value scaling of a state this unit gives: see scaleGivenState.
    private giveTransform(detail: SkillDetail, applierState: KiokuState): SkillDetail {
        return scaleGivenState(detail, applierState.filteredEffects())
    }

    // CanAddTo overrides that aren't a role/element filter.
    private canAddTo(t: KiokuState, detail: SkillDetail, applierState: KiokuState): boolean {
        const type = detail.abilityEffectType
        if (t.immuneTo(type)) return false // bench-only ailment immunity, see KiokuState.immuneAilments
        if (type === "TSUBAME_CORE") return t === applierState     // 0x16d9090: the caster only
        if (type === "TSUBAME_LINK") return t !== applierState     // 0x16d9950: everyone but the caster
        // [CONFIRMED 3.19] LockSpecialAttackUnitState.CanAddTo (0x16d2940): no Magic Seal yet, MaxEP > 0 and MaxBP < 1
        // (BattleUnit +0x38 / +0x3c): EP-ultimate units only, never BP units (Vinctio, Metallicized Projectile) or enemies.
        if (type === "LOCK_SPECIAL_ATTACK") return !t.hasState("LOCK_SPECIAL_ATTACK") && t.maxMp > 0 && t.maxBp < 1
        return true
    }

    // [CONFIRMED 3.19] Unique accum / Lv states blend instead of stacking copies. Returns true if merged.
    private mergeUniqueState(t: KiokuState, detail: SkillDetail, applierState: KiokuState): boolean {
        const type = detail.abilityEffectType
        const maps = [t.activeEffectDetails, t.passiveEffectDetails] as Map<string, any>[]
        if (type === "UNIQUE_BUFF_ACCUM" || type === "UNIQUE_DEBUFF_ACCUM") {
            // UniqueAccumUnitStateBase.Blend (0x16ddaf0): same class, pattern (value1), giver and AccumCountMax (value2):
            // AccumCount = min(+1, max); remaining turn and the exempt flag are overwritten by the new application.
            for (const map of maps) for (const [key, d] of map) {
                if (d.abilityEffectType === type && d.value1 === detail.value1 && d._applierState === applierState && (d.value2 ?? 0) === (detail.value2 ?? 0)) {
                    map.set(key, { ...d, _accumCount: Math.min((d._accumCount ?? 1) + 1, detail.value2 || 1), turn: detail.turn, _isExemptPassingTurnOnce: !!detail.turn && this.isOwnSkillState(t, detail, applierState) })
                    return true
                }
            }
        }
        if (type === "UNIQUE_ELEMENT_STACK" || type === "UNIQUE_ELEMENT_BREAK") {
            // UniqueLvDebuffUnitStateBase.Blend (0x16de420): same pattern -> RemainingTurn = max(old, new); Lv and
            // HitCounter are kept.
            for (const map of maps) for (const [key, d] of map) {
                if (d.abilityEffectType === type && d.value1 === detail.value1) {
                    map.set(key, { ...d, turn: Math.max(d.turn ?? 0, detail.turn ?? 0), _isExemptPassingTurnOnce: this.isOwnSkillState(t, detail, applierState) })
                    return true
                }
            }
        }
        return false
    }

    // Unit whose act is running when applyEffect was called (for the exempt-once rule below).
    private _actUnit?: KiokuState
    // [CONFIRMED 3.19] StateAbilityEffect.Triggering (0x1901cb0) / UnitStateBase.SetTriggeringInfo (0x16dfd70):
    // IsExemptPassingTurnOnce only for a state a unit gives ITSELF - from an active skill, or from a passive while
    // it is that unit's own act. Matches in-game observation (a buff from an ally ticks at your next TurnEnd).
    private isOwnSkillState(t: KiokuState, detail: SkillDetail, applierState: KiokuState): boolean {
        if (t !== applierState) return false
        return !("passiveSkillDetailMstId" in detail) || this._actUnit === applierState
    }

    // [CONFIRMED 3.19] StateAbilityEffect.Triggering (0x1901cb0): after UnitCondition.AddUnitState succeeds, the target's
    // notice gets an AddStateInfo; isRemovableBuff / isRemovableDebuff = the state implements IBuff / IDebuff
    // (StateInterfaces.ts) && EffectOriginType == ActiveSkill (1). Passive (2) and field (3) states count for neither.
    // Read by team conditions 315 / 316. [UNCERTAIN] whether a blended unique state (mergeUniqueState) still adds one.
    private noteAddedState(t: KiokuState, detail: SkillDetail): void {
        if ("passiveSkillDetailMstId" in detail) return
        const type = detail.abilityEffectType
        const buff = IBUFF_STATE_TYPES.has(type), debuff = IDEBUFF_STATE_TYPES.has(type)
        if (!buff && !debuff) return
        t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), ...(buff ? { addedRemovableBuffs: 1 } : { addedRemovableDebuffs: 1 }) })
    }

    private storeTimedEffect(t: KiokuState, detail: SkillDetail, applier: string, applierState: KiokuState): boolean {
        detail = this.giveTransform(detail, applierState)
        if (!this.canAddTo(t, detail, applierState)) return false
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
        // [CONFIRMED 3.19] UnitCondition.AddUnitState: after a successful roll, a new ailment (Burn/Poison/Curse/
        // Bleed/Vortex/Weakness/Stun) is blocked by the target's first active PREVENT_ABNORMAL with RemainCount >= 1,
        // which loses one count (ConsumeRemainCount). Debuffs are not blocked.
        if (t.blockedByPreventAbnormal(detail)) return false
        if (this.mergeUniqueState(t, detail, applierState)) { t.updateSpd(); this.noteAddedState(t, detail); return true }
        this.noteAddedState(t, detail)
        let key = String(skillDetailId(detail))
        // [CONFIRMED 3.19] UnitCondition.AddUnitState (0x15c8a30) -> GetDuplicateUnitState (0x15c8f90): a state from an
        // active skill (EffectOrigin ActiveSkill: basic / battle skill / special / follow-up) that is not AllowDuplicate
        // (only Vortex) looks for a duplicate via GetSameStateList (0x15c94c0, same state class) + <>c__DisplayClass98_0.b__1
        // (0x15c7d30): same EffectOrigin, same UserUnitId (giver), same TargetRole, same TargetElement and the same
        // ActiveConditionSetIdCsv string. A non-IBlendable duplicate is replaced (IsPriorityOver is never overridden:
        // base stub returns true) by a plain List.Remove - no OnRemovingFromCondition. The skill / detail id is NOT
        // compared: Light of Reckoning's three follow-ups (652410/652510/652610) each give "special attack DMG +48%"
        // (UP_GIV_DMG_RATIO, cond 317) and the game keeps one. IBlendable (accum / unique) states keep their own paths.
        // [UNCERTAIN] GetUnitState without doWithoutInheritance also matches subclasses (e.g. UpWeakElementDmgAccumRatio
        // derives from UpWeakElementDmgRatio); here the class is approximated by the effect type.
        if (!("passiveSkillDetailMstId" in detail) && detail.abilityEffectType !== "VORTEX_ATK"
            && !ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)) {
            for (const [k, d] of [...t.activeEffectDetails]) {
                const dd = d as any
                if (dd.abilityEffectType === detail.abilityEffectType && !("passiveSkillDetailMstId" in dd)
                    && dd._applierState === applierState && (dd.role ?? 0) === (detail.role ?? 0)
                    && (dd.element ?? 0) === (detail.element ?? 0)
                    && (dd.activeConditionSetIdCsv ?? "") === (detail.activeConditionSetIdCsv ?? "")) t.activeEffectDetails.delete(k)
            }
        }
        // Same detail from a different giver is a separate state in the game (UserUnitId differs): don't overwrite it.
        const other = t.activeEffectDetails.get(key) as any
        if (other && other._applierState !== applierState && !ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)
            && detail.abilityEffectType !== "VORTEX_ATK") key = `${key}@${applierState.kioku.name}#${applierState.posIdx}`
        const existing = t.activeEffectDetails.get(key)
        if (existing && ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)) {
            mergeAccumEffect(existing, detail)
            t.updateSpd()
            return true
        }
        // [CONFIRMED 3.19] StateAbilityEffect.ChangeGiveUnitState (0x19013a0): every active
        // AddTurnUnitStateBase on the USER calls AddTurnTo(newState) -> UnitStateBase.AddEffectTurn(AddTurnNum = value1)
        // when the new state is an IBuff (ADD_BUFF_TURN) / IDebuff (ADD_DEBUFF_TURN). Ailments are neither,
        // and an AddTurn state never extends another AddTurn state.
        let turn = detail.turn
        if (turn && detail.abilityEffectType !== "ADD_BUFF_TURN" && detail.abilityEffectType !== "ADD_DEBUFF_TURN"
            && !isAlimentEffect(detail.abilityEffectType)) {
            const fx = applierState.filteredEffects()
            const want = isFriendlyEffect(detail.abilityEffectType) ? "ADD_BUFF_TURN"
                : isOpponentEffect(detail.abilityEffectType) ? "ADD_DEBUFF_TURN" : undefined
            if (want) for (const d of fx[want] ?? []) turn += d.value1
        }
        t.activeEffectDetails.set(key, {
            applier, ...detail, turn, _isExemptPassingTurnOnce: this.isOwnSkillState(t, detail, applierState), _accumCount: 1, _applierState: applierState,
            ...(detail.abilityEffectType.startsWith("UNIQUE_ELEMENT_") ? { _lv: 1, _hitCounter: 0 } : {}),
            ...(detail.abilityEffectType === "VORTEX_ATK" ? { _remainAttackCount: detail.value2 ?? 0 } : {})
        } as any)
        t.updateSpd()
        return true
    }

    private storePermanentState(t: KiokuState, detail: SkillDetail, applier: string, applierState: KiokuState): boolean {
        detail = this.giveTransform(detail, applierState)
        if (!this.canAddTo(t, detail, applierState)) return false
        if (!rollAppliesEffect(detail, applierState, t, this.team.rng)) return false;
        if (this.mergeUniqueState(t, detail, applierState)) { t.updateSpd(); this.noteAddedState(t, detail); return true }
        this.noteAddedState(t, detail)
        let key = String(skillDetailId(detail))
        // [CONFIRMED 3.19] UnitCondition.GetDuplicateUnitState (0x15c8f90): a passive-origin state is a duplicate only
        // with the same EffectOrigin, MstId AND UserUnitId (giver) - lambda b__2 (0x15c7d90). The same passive from two
        // allies (e.g. two "Indomitable Guard++" crys) is two states and both apply. IAccum states (b__3 0x15c7de0)
        // match on origin + AbilitySource without the giver, so they keep merging per detail id.
        const other = t.passiveEffectDetails.get(key) as any
        if (other && other._applierState !== applierState && !ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType))
            key = `${key}@${applierState.kioku.name}#${applierState.posIdx}`
        const existing = t.passiveEffectDetails.get(key)
        if (existing) {
            if (ACCUM_RATIO_EFFECT_TYPES.has(detail.abilityEffectType)) { mergeAccumEffect(existing, detail); t.updateSpd() }
            return true
        }
        t.passiveEffectDetails.set(key, { applier, ...detail, _accumCount: 1, _applierState: applierState } as any)
        t.updateSpd()
        return true
    }

    startConditionsMet(t: KiokuState, detail: SkillDetail, targetType?: TargetType, trueActorUnit?: KiokuState, mainTarget?: KiokuState): boolean {
        const triggerState = this.stateGen(this, t, targetType, trueActorUnit, mainTarget)
        if (activeLaunch?.effect === detail) triggerState.actorEffect = detail
        return UNIT_STATE_TYPES.has(detail.abilityEffectType)
            ? isConditionSetActiveForPvP((detail.startConditionSetIdCsv ?? "").split(","), triggerState)
            : isConditionSetActive(detail, triggerState)
    }

    // [CONFIRMED 3.19] AbilityEffectLauncher.Triggering (0x1373530) runs in two passes: first, for EVERY effect of the
    // skill, SelectTargets + SelectTargetsConditionCheck (start conditions per target, EachTargetUnit = that target);
    // only then a second loop triggers the effects. So a skill's conditions all see the state from before the skill.
    // Example: Final Fatebloom's ult at Lv1-9 lists CONSUME_CHARGE_POINT(10) before GAIN_SP_FIXED, both gated on
    // "Magic == 10": the game still grants the SP, and the "Magic < 10" GAIN_CHARGE_POINT row does not fire.
    // Mirrors applyEffect/applyEffectToTarget: a friendly placeholder (the caster) is widened to its real targets here
    // (and the widened list is reused when the effect runs, so its target pick happens once, in this pass).
    precheckStartConditions(detail: SkillDetail, targets: KiokuState[], targetType?: TargetType, trueActorUnit?: KiokuState, mainTarget?: KiokuState): LaunchPrecheck {
        const launch = activeLaunch && activeLaunch.actor === this ? activeLaunch : undefined
        const prevEffect = launch?.effect
        if (launch) launch.effect = detail
        const prevActUnit = this._actUnit
        this._actUnit = trueActorUnit
        try {
            const kept = new Set<KiokuState>()
            let widened: KiokuState[] | undefined
            for (const target of targets) {
                const placeholder = this === target && !detail.abilityEffectType.startsWith("DMG_")
                if (placeholder) {
                    widened = this.team.sliceTargets(this, this.team.kiokuStates, detail)
                    for (const t of widened) if (this.startConditionsMet(t, detail, targetType, trueActorUnit, mainTarget)) kept.add(t)
                } else if (withEachTarget(this, target, () => this.startConditionsMet(target, detail, targetType, trueActorUnit, mainTarget))) {
                    kept.add(target)
                }
            }
            return { kept, widened }
        } finally {
            if (launch) launch.effect = prevEffect
            this._actUnit = prevActUnit
        }
    }

    // [CONFIRMED 3.19] AdditionalTurnUnitActAbilityEffect.Triggering (0x18eb120): always about the USER (the effect's
    // targets only carry the conditions; the class targets opponents, e.g. Floral Ironspike's A4 "on maxed enemy break
    // bonus"). Nothing if the user can't act, is broken, is in IsAdditionalTurnCoolTime, already has an
    // AdditionalTurnUnitAct queued or is running one; else an AdditionalTurnUnitAct is added to the act list
    // (AddActToListAndSort: after the acts already queued; CanBeInterruptedBySpecialAttackAct is false for it, so a
    // later ultimate goes after it) and IsAdditionalTurnCoolTime is set. Run by PvPBattle.executeNextAction.
    queueAdditionalTurn(): void {
        if (this.isDead || this.canNotAction || this.isBroken || this.additionalTurnCoolTime) return
        this.additionalTurnCoolTime = true
        this.team.additionalTurnQueue.push({ unit: this, seq: ++additionalTurnSeq })
    }

    // [CONFIRMED 3.19] An effect's Triggering runs with its target as the user's EachTargetUnit (see eachTargetCtx). A
    // friendly effect's placeholder target (the caster) is not a real target: its widened targets set it one by one.
    applyEffect(target: KiokuState, detail: SkillDetail, targetType?: TargetType, trueActorUnit?: KiokuState, mainTarget?: KiokuState): number | undefined {
        const placeholder = this === target && !detail.abilityEffectType.startsWith("DMG_")
        // ActorAbilityEffect for the duration of this effect, only inside a skill launch (passives launch without one).
        const launch = activeLaunch && activeLaunch.actor === this ? activeLaunch : undefined
        const prevEffect = launch?.effect
        if (launch) launch.effect = detail
        try {
            return placeholder ? this.applyEffectToTarget(target, detail, targetType, trueActorUnit, mainTarget)
                : withEachTarget(this, target, () => this.applyEffectToTarget(target, detail, targetType, trueActorUnit, mainTarget))
        } finally { if (launch) launch.effect = prevEffect }
    }

    private applyEffectToTarget(target: KiokuState, detail: SkillDetail, targetType?: TargetType, trueActorUnit?: KiokuState, mainTarget?: KiokuState): number | undefined {
        /**
         * @returns action id if additional act should be triggered, otherwise returns null
         */
        // [CONFIRMED 3.19] A state's ActiveConditionSet is re-checked continuously
        // (UnitStateBase.IsActive), not at the moment it is added: only the start conditions gate
        // adding a state. Instant effects (damage, EP, HASTE, ...) check both now.
        this._actUnit = trueActorUnit
        // Inside an active skill launch the start conditions were already checked for every effect before the first
        // one ran (see PvPTeam.completeAction / precheckStartConditions); use that result, not the current state.
        const pre = this.team.launchPrecheck?.get((detail as any)._src ?? detail)
        const conditionsMet = (t: KiokuState) => pre ? pre.kept.has(t) : this.startConditionsMet(t, detail, targetType, trueActorUnit, mainTarget)
        // [CONFIRMED 3.19] AbilityEffectBase.SelectTargetsConditionCheck (0x18e7bb0), run by AbilityEffectLauncher.Triggering
        // after SelectTargets for every effect: for each selected target it sets EachTargetUnit = that target and keeps
        // the target only if the effect's start condition sets match (ConditionUseType SkillStart); the effect then runs
        // on the kept targets only (StateAbilityEffect.Triggering 0x1901cb0 loops over them with no further check).
        // A friendly effect arrives here with the caster as a placeholder target and is widened to its real targets
        // further down (sliceTargets), so its conditions and eligibility are checked per real target there. Example:
        // Scorchin' Summer Spike's Beachball's Boon "to self and Attacker allies", start condition 2831
        // (EachTarget.IsRoleType == Attacker).
        const placeholder = this === target && !detail.abilityEffectType.startsWith("DMG_")
        if (!placeholder) {
            if (!conditionsMet(target)) return
            // [NEW, CONFIRMED via ScoreAttackTeam.ts] Generic element/role eligibility gate,
            // applied BEFORE any effect-type-specific logic - see UnitStateEngine.isEligibleForEffect.
            if (!isEligibleForEffect(detail, target)) return
        }

        // [CONFIRMED 3.19] DmgRatioAbilityEffect$$Triggering (0x18f1320): damage = Min(floor(HP * v1/1000),
        // HP - 1) (or MaxHP * v2/1000 when v1 is 0); no modifiers, can't kill.
        if (detail.abilityEffectType === "DMG_RATIO") {
            const base = detail.value1 > 0 ? f32(target.currentHp * f32(f32(detail.value1) / 1000))
                : f32(target.maxHp * f32(f32((detail as any).value2 ?? 0) / 1000))
            const dmg = target.team.modeChangeDamageCut(target, Math.max(0, Math.min(Math.floor(base), target.currentHp - 1)))
            const hpLost = target.takeDamage(dmg)
            this.team.eventLog.push({ kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: hpLost, sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: target.team.isTeam1, targetPos: target.posIdx })
            target.lastNotice = mergeNotice(target.lastNotice, { ...emptyNotice(), totalDamageValue: hpLost, isReceivedAttack: true })
            return
        }

        if (detail.abilityEffectType.startsWith("DMG_")) {

            const damageBaseType = damageBaseTypeFromEffectType(detail.abilityEffectType)
            const battleType = this.team.battleType
            // [CONFIRMED 3.19] DamageAbilityEffectBase$$Triggering: on a range-2 (proximity)
            // skill only the main target takes value1 power; the others take value2.
            const isMainTarget = mainTarget === undefined || mainTarget === target
            const rng = this.team.rng
            // [CONFIRMED 3.19] ReflectionProcess (0x18eefb0) runs before the damage calc of every hit.
            if (!(targetType === TargetType.fuaId && (detail as any).skillType === 5)) target.reflectDamage(this)
            // [CONFIRMED 3.19] BattleDamageCalculator.IsDamageDisabled (0x1381490): a unit holding UNIQUE_ENEMY_639002 takes
            // 0 damage (CreateByDisabledDamageHit).
            if (target.hasState("UNIQUE_ENEMY_639002")) {
                this.team.eventLog.push({ kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: 0, sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: target.team.isTeam1, targetPos: target.posIdx })
                target.lastNotice = mergeNotice(target.lastNotice, { ...emptyNotice(), isReceivedAttack: true })
                return
            }
            const result = getAttackDamageResult(this, target, detail, damageBaseType, {
                battleType, isMainTarget, rng, rngLabel: `${unitLabel(this)} → ${unitLabel(target)} crit`,
                forceCrit: this.team.critOverride?.(this, target, detail),
            })
            let totalDamage = result.finalDamage

            // ADDITIONAL_DAMAGE / TSUBAME_LINK are not part of this row: one extra hit per state and per opponent hit by
            // the skill, after all of the skill's effects - see KiokuState.additionalDamageAfterLaunch.

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
            const brk = decreaseBreakPoint(this, target, detail.element ?? 0, breakValue, this.turnPriorityForEffect())

            // [CONFIRMED 3.19] BattleUnit.Attack: first UpdateCountdownCancelTotalDamage - damage to a unit holding the
            // countdown state adds to CancelTotalDamage (capped at the threshold, AddCancelTotalDamage 0x14a6ce0) -
            // then the boss form-change cut (see PvPTeam.modeChangeDamageCut), then the HP loss.
            const cd = this.team.countdown
            if (cd?.unit && target.hasState("COUNTDOWN_START")) cd.cancelTotal = Math.min(cd.cancelMax, cd.cancelTotal + totalDamage)
            totalDamage = target.team.modeChangeDamageCut(target, totalDamage)
            const wasAlive = !target.isDead
            // [CONFIRMED 3.19] VortexProcess (0x18f0260): after the damage calc, every vortex on the target counts the hit;
            // the ones that reach 0 pop now. Their GetSlipDamageResult notice (0x13806d0) is op_Addition'ed into THIS hit's
            // notice (DamageAbilityEffectBase.Triggering 0x18ef650), so it is part of the hit's damage, of its
            // GetTotalDamageValue (DMG 101, team TotalDamage 304) and of the popping skill's notice bundle. DamageInfo has no
            // giver field: nothing is credited to the vortex's owner (the owner's "dot" event below is display-only).
            const vortex = target.popVortex()
            totalDamage += vortex
            if (vortex) result.notice.totalDamageValue += vortex
            const hpLost = target.takeDamage(totalDamage)
            target.chargeByReceiveDamage()
            if (wasAlive && target.isDead) this.getMp(10)
            // [CONFIRMED 3.19] UniqueStateLvUpProcess (0x18eff70): after each damaging hit on a living target, its unique
            // Lv states count the hit (UNIQUE_ELEMENT_STACK: attacker of the state's element; _BREAK: the state's giver).
            if (!target.isDead) target.uniqueLvUp(this)
            this.team.eventLog.push({
                kind: "hit", source: this.kioku.name, target: target.kioku.name, amount: hpLost,
                barrierAbsorbed: result.barrierAbsorbed, isCritical: result.isCritical,
                sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: target.team.isTeam1, targetPos: target.posIdx,
                breakDamage: brk.decreased, broke: brk.broke, breakRateUp: rateUp || undefined, vortex: vortex || undefined,
            })
            // Notice flags read by AttackEnd conditions: 302 counts notices that carry break
            // bonus info (the unit broke THIS skill), 108/308 the broken rate reaching its max.
            result.notice.isBreak = brk.broke
            if (rateUp > 0 && target.breakedDamageReceiveRate >= target.breakParams.maxRate / 10) result.notice.isBreakedDamageReceiveRateBecomeMax = true
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
            effTargets = pre?.widened ?? this.team.sliceTargets(this, this.team.kiokuStates, detail)
        } else {
            effTargets = [target]
        }
        // Re-apply the element/role eligibility gate per resolved target too (the first
        // check above only covered the originally-passed `target`; sliceTargets can
        // widen this to a team, e.g. for self-buffs re-targeted via range=SELF/ALL).
        effTargets = effTargets.filter(t => isEligibleForEffect(detail, t) && (!placeholder || conditionsMet(t)))
        if (placeholder && !effTargets.length) return

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
                // [CONFIRMED 3.19] StateAbilityEffect.ChangeGiveUnitState (0x19013a0): a barrier given by a caster holding
                // DWN_BARRIER_VALUE is scaled by r = product of Max(1 - v1/1000, 0) (BarrierUnitState.UpdateValueByRate).
                let r = 1
                for (const d of this.filteredEffects()["DWN_BARRIER_VALUE"] ?? []) r = f32(r * Math.max(f32(1 - f32(f32(f32(d.value1) / 10) / 100)), 0))
                const ratio = Math.max(f32(f32(f32(detail.value1) / 1000) * r), 0), fixed = Math.max(f32(f32(detail.value2) * r), 0), maxRatio = Math.max(f32(f32(f32(detail.value3) / 1000) * r), 0)
                const grant = Math.ceil(suppress(f32(f32(getProcessedDef(t) * ratio) + fixed)))
                const cap = maxRatio === 0 ? grant : Math.ceil(suppress(f32(f32(t.kioku.getBaseDef()) * maxRatio)))
                const newMax = Math.max(t.maxBarrierEndurance, cap)
                t.maxBarrierEndurance = newMax
                t.barrierEndurance = Math.min(newMax, t.barrierEndurance + grant)
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isBarrierAdded: true });
            })
            return;
        }

        // ADD_BUFF_TURN / ADD_DEBUFF_TURN are states on the caster (see storeTimedEffect's AddTurnTo);
        // the *_IMM variants are instant and handled further down (ChangeBuffDebuffTurnAbilityEffectBase).

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
                matching.slice(0, removeCount).forEach(([key, d]) => { t.activeEffectDetails.delete(key); t.onStateRemoved(d) });
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
        if (detail.abilityEffectType === "VORTEX_ATK") {
            // [CONFIRMED 3.19] VortexAtkUnitState (ctor 0x15d1ed0): an ailment that allows duplicates (each application is
            // its own instance), never ticks at turn start; RemainAttackCount = value2. Its damage base is fixed when it
            // is given (SetTriggeringInfo 0x15bf5b0): the caster's unbuffed ATK x power (value1/1000, after the
            // effect-value multiplier). It pops in VortexProcess, see popVortex.
            effTargets.forEach(t => {
                const d = this.giveTransform(detail, this)
                if (t.isDead || t.immuneTo(d.abilityEffectType) || !rollAppliesEffect(d, this, t, this.team.rng) || t.blockedByPreventAbnormal(d)) return
                t.passiveEffectDetails.set(`vortex:${++vortexSeq}`, { applier: this.kioku.name, ...d, _applierState: this, _remainAttackCount: d.value2 ?? 0 } as any)
            })
            return
        }
        if (detail.abilityEffectType === "RESET_UNIQUE_BUFF" || detail.abilityEffectType === "RESET_UNIQUE_DEBUFF") {
            // [CONFIRMED 3.19] ResetUniqueBuffDebuffAbilityEffectBase.Triggering (0x1900190): on each living target remove
            // every unique state (IBuff for BUFF / IDebuff for DEBUFF) of pattern value1 (0 = nothing), even if normally
            // not removable; then the turn gauge follows the new speed.
            if (!detail.value1) return
            const buff = detail.abilityEffectType === "RESET_UNIQUE_BUFF"
            const types = buff ? ["UNIQUE_BUFF", "UNIQUE_BUFF_ACCUM"] : ["UNIQUE_DEBUFF", "UNIQUE_DEBUFF_ACCUM", "UNIQUE_ELEMENT_STACK", "UNIQUE_ELEMENT_BREAK"]
            effTargets.filter(t => !t.isDead).forEach(t => t.removeStatesWhere(d => types.includes(d.abilityEffectType) && d.value1 === detail.value1))
            return
        }
        // ---- ZONE ("field") ---------------------------------------------------------------------------------
        const fromActiveSkill = !("passiveSkillDetailMstId" in detail)
        if (detail.abilityEffectType === "ZONE_STACK") {
            // [CONFIRMED 3.19] ZoneStackAbilityEffect (0x1906d60): Max = clamp(v2, 0, 3); Stack = clamp(v1, 0, Max).
            effTargets.forEach(t => {
                t.zone.max = Math.max(0, Math.min(detail.value2 ?? 0, 3))
                t.zone.stack = Math.max(0, Math.min(detail.value1, t.zone.max))
            })
            return
        }
        if (detail.abilityEffectType === "ZONE_EXPAND") {
            // [CONFIRMED 3.19] ZoneExpandAbilityEffect (0x1905ff0): on the user, a fresh expand sets the "field started"
            // flag and fills the stack; on anyone else with an active zone, that zone is released. The target's
            // UNIQUE_ZONE marker is removed (the skill's UNIQUE_ZONE row re-adds it team-wide).
            effTargets.forEach(t => {
                if (t === this) {
                    if (t.zone.stack < 1) t.zone.expandPattern = detail.value1
                    t.zone.stack = t.zone.max
                } else if (!t.isDead && t.zoneActive) {
                    t.zone.releasePattern = [...t.passiveEffectDetails.values()].find(d => d.abilityEffectType === "UNIQUE_ZONE")?.value1 ?? detail.value1
                    t.zone.stack = 0
                }
                t.removeStatesWhere(d => d.abilityEffectType === "UNIQUE_ZONE")
            })
            return
        }
        if (detail.abilityEffectType === "GAIN_ZONE_STACK" || detail.abilityEffectType === "CONSUME_ZONE_STACK") {
            // [CONFIRMED 3.19] Gain/ConsumeZoneStackAbilityEffect (0x18f3e60 / 0x18ed9e0): active-skill origin only, and
            // only while a zone is up. Consuming the last stack releases the zone: "field ended" flag, and every
            // UNIQUE_ZONE marker in the battle is removed.
            if (!fromActiveSkill) return
            effTargets.forEach(t => {
                if (!t.zoneActive) return
                const sign = detail.abilityEffectType === "GAIN_ZONE_STACK" ? 1 : -1
                t.zone.stack = Math.max(0, Math.min(t.zone.max, t.zone.stack + sign * detail.value1))
                if (sign < 0 && t.zone.stack === 0) {
                    t.zone.releasePattern = [...t.passiveEffectDetails.values(), ...t.activeEffectDetails.values()].find(d => d.abilityEffectType === "UNIQUE_ZONE")?.value1 ?? 1
                    for (const u of [...this.team.kiokuStates, ...this.team.otherTeam.kiokuStates]) u.removeStatesWhere(d => d.abilityEffectType === "UNIQUE_ZONE")
                }
            })
            return
        }
        if (detail.abilityEffectType === "UNIQUE_ZONE") {
            // [CONFIRMED 3.19] UniqueZoneUnitState is an ITargetTeam state (StateTeamAbilityEffect): value2 = 1 puts it on
            // every living ally, the user included. A pure marker (condition content 29), removed on the user's death.
            const team = detail.value2 === 2 ? this.team.otherTeam : this.team
            team.kiokuStates.filter(u => !u.isDead).forEach(u => this.storePermanentState(u, detail, this.kioku.name, this))
            return
        }
        // ---- COUNT ("sigils") ------------------------------------------------------------------------------
        if (detail.abilityEffectType === "GAIN_COUNT_POINT" || detail.abilityEffectType === "CONSUME_COUNT_POINT") {
            // [CONFIRMED 3.19] Gain/ConsumeCountPointAbilityEffect (0x18ee190): TryModifyCountPointBy(+-value1) per target.
            const d = detail.abilityEffectType === "GAIN_COUNT_POINT" ? detail.value1 : -detail.value1
            effTargets.forEach(t => t.tryModifyCountPoint(d))
            return
        }
        if (detail.abilityEffectType === "COUNT") {
            // [CONFIRMED 3.19] CountUnitState: CanAddTo fails if the unit already has one; OnAdded sets MaxCountPoint = 20.
            effTargets.forEach(t => {
                if (t.hasState("COUNT")) return
                if (detail.turn ? this.storeTimedEffect(t, detail, this.kioku.name, this) : this.storePermanentState(t, detail, this.kioku.name, this)) t.maxCountPoint = 20
            })
            return
        }
        if (detail.abilityEffectType === "GAIN_SOLO_RAID_BUFF_POINT") {
            // [CONFIRMED 3.19] GainSoloRaidBuffPointAbilityEffect (0x18f35f0): value1 x number of targets (range -1: once);
            // SoloRaidBuffReferee.AddPoint (0x15bfd20): point = clamp(point + n, 0, active ? 30 : 100). Solo Raid only.
            const sr = this.team.soloRaid
            if (sr) sr.point = Math.max(0, Math.min(sr.active ? sr.activeMaxPoint : sr.maxPoint, sr.point + detail.value1 * effTargets.length))
            return
        }
        if (detail.abilityEffectType === "COUNTDOWN_START") {
            // [CONFIRMED 3.19] CountdownStartUnitState: CanAddTo = the unit has no countdown state yet; ctor sets
            // countdown = turn - 1 and the cancel threshold = value1; OnAddedToCondition starts the Solo Raid
            // countdown (StartCountdown 0x14a7fc0) unless one is already running.
            effTargets.forEach(t => {
                if (t.hasState("COUNTDOWN_START")) return
                if (!this.storeTimedEffect(t, detail, this.kioku.name, this)) return
                const cd = this.team.countdown
                if (cd && !cd.unit) Object.assign(cd, { max: detail.turn - 1, value: detail.turn - 1, cancelMax: detail.value1, cancelTotal: 0, unit: t })
            })
            return
        }
        if (detail.abilityEffectType === "COUNTDOWN_DECREASE") {
            // [CONFIRMED 3.19] CountdownDecreaseAbilityEffect.Triggering (0x18ee3d0): if the USER holds the countdown
            // state, DecreaseCountdown (0x14a72c0): countdown = max(0, countdown - 1).
            const cd = this.team.countdown
            if (cd?.unit && this.hasState("COUNTDOWN_START")) cd.value = Math.max(0, cd.value - 1)
            return
        }
        // [CONFIRMED 3.19] IMM_SLIP_DMG "Instant DOT DMG Burst" (Nightmare Stinger, My Creations, Marigold Dadaism
        // ultimates; 36 enemy stages) = ImmSlipDmgAbilityEffect.Triggering (0x18f4e90), NOT a DOT immunity (the
        // engine read it that way until 2026-10-02 and the effect did nothing). Per target:
        // BattleDamageCalculator.GetSlipDamageResult(target, ..., isImmediately: true) (0x13806d0): every active
        // IReceiveSlipDamage state ticks once - ReceiveSlipDamageUnitStateBase.GetSlipDamageValue (0x15bf670) =
        // GetSlipDamageValue (int) x RemainingTurn (+0x3c) unless permanent - charges EP
        // (EpCharger.ChargeByReceiveSlipDamage) and is flagged ShouldBeRemovedNow (+0x70) and removed; the sum then
        // hits the target through the user's BattleUnit.Attack. [UNCERTAIN] Vortex (VortexUnitStateBase overrides
        // GetSlipDamageValue) is not popped here.
        if (detail.abilityEffectType === "IMM_SLIP_DMG") {
            effTargets.filter(t => !t.isDead).forEach(t => {
                let total = 0
                const popped: SkillDetail[] = []
                for (const d of t.activeEffectDetails.values()) {
                    const base = DOT_EFFECT_DAMAGE_BASE_TYPE[d.abilityEffectType]
                    if (base === undefined || !t.isEffectCurrentlyActive(d)) continue
                    const applier = d._applierState ?? t
                    const tick = getSlipDamageResult(applier, t, d, base, this.team.battleType)
                    total += d.turn && d.turn > 0 ? tick * d.turn : tick
                    popped.push(d)
                    t.getMp(2)
                }
                if (!popped.length) return
                t.removeStatesWhere(d => popped.includes(d))
                const lost = t.takeDamage(total)
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), totalDamageValue: lost, isDead: t.isDead })
                this.team.eventLog.push({ kind: "dot", source: this.kioku.name, target: t.kioku.name, amount: lost, sourceIsTeam1: this.team.isTeam1, sourcePos: this.posIdx, targetIsTeam1: t.team.isTeam1, targetPos: t.posIdx })
            })
            return
        }
        if (detail.abilityEffectType === "COUNTDOWN_CANCEL") return // CountdownCancelAbilityEffect.Triggering returns null (no effect)
        if (detail.abilityEffectType === "ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT" || detail.abilityEffectType === "ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT") {
            // [CONFIRMED 3.19] AdditionalCountdownZero/CancelSkillActAbilityEffect.Triggering (0x18ea100/0x18e9e30):
            // only while the USER holds the countdown state: queue skill value1 as an additional act, then
            // End/CancelCountdown - clear the referee and remove the user's CountdownStartUnitState.
            if (!this.hasState("COUNTDOWN_START")) return
            for (const [key, d] of [...this.activeEffectDetails]) if (d.abilityEffectType === "COUNTDOWN_START") this.activeEffectDetails.delete(key)
            for (const [key, d] of [...this.passiveEffectDetails]) if (d.abilityEffectType === "COUNTDOWN_START") this.passiveEffectDetails.delete(key)
            const cd = this.team.countdown
            if (cd) Object.assign(cd, { max: 0, value: 0, cancelMax: 0, cancelTotal: 0, unit: undefined })
            return detail.value1
        }
        // [CONFIRMED data] A turn count only means something on a unit state: 46 skill rows of instant effects carry one
        // anyway (RECOVERY_HP / GAIN_EP_RATIO "turn=2" on Judgement Earth's skills, a HASTE, a LOSE_EP_FIXED, ...). Those
        // were stored as timed states and never happened (no heal, no MP); they trigger like any other instant effect.
        if (detail.turn && UNIT_STATE_TYPES.has(detail.abilityEffectType)) {
            // (Timed passive states used to be deleted from the bank after their first trigger,
            // so e.g. an "on attack end: SPD +10% for 1 turn" passive fired once per battle.)
            effTargets.forEach(t => this.storeTimedEffect(t, detail, this.kioku.name, this))
        } else if ((detail.abilityEffectType === "HASTE" || detail.abilityEffectType === "SLOW") && this.hasState("LOCK_TURN_ORDER")) {
            // [CONFIRMED 3.19] Haste/SlowAbilityEffect.Triggering: nothing happens when the USER (caster) has
            // LockTurnOrderUnitState ("Negates effects that advance or delay action order").
        } else if (detail.abilityEffectType === "HASTE") {
            // [CONFIRMED 3.19] HasteAbilityEffect$$Triggering (0x18f4840): SubtractGaugeValue((float)v/1000f)
            const prio = this.turnPriorityForEffect()
            effTargets.forEach(t => t.addGaugeRate(-f32(f32(detail.value1) / 1000), prio))
        } else if (detail.abilityEffectType === "SLOW") {
            // [CONFIRMED 3.19] SlowAbilityEffect$$Triggering (0x1900f80): AddGaugeValue((float)v/1000f)
            const prio = this.turnPriorityForEffect()
            effTargets.forEach(t => t.addGaugeRate(f32(f32(detail.value1) / 1000), prio))
        } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
            // [CONFIRMED 3.19] GainEpAbilityEffectBase.Triggering (0x18f3300): per target EpCharger.ChargeByEpAbilityEffect,
            // then BpCharger.ChargeByEpAbilityEffect (0x1491370): +1 BP whatever the EP amount (MaxBP units only).
            effTargets.forEach(t => { t.getMp(target.maxMp * detail.value1 / 1000); t.addBp(1) })
        } else if (detail.abilityEffectType === "LOSE_EP_RATIO" || detail.abilityEffectType === "LOSE_EP_FIXED") {
            // [CONFIRMED 3.19] LoseEpAbilityEffectBase.Triggering (0x18f5f40): AddEP(-GetLosePoint(target)), clamped at 0.
            // Ratio (0x18f61a0): (int)((float)(v * target.MaxEP) / 1000f); fixed: v.
            effTargets.forEach(t => {
                const lose = detail.abilityEffectType === "LOSE_EP_FIXED" ? detail.value1 : Math.trunc(f32(detail.value1 * t.maxMp) / 1000)
                t.currentMp = Math.max(0, t.currentMp - lose)
            })
        } else if (["DEC_BUFF_TURN_IMM", "DEC_DEBUFF_TURN_IMM", "ADD_BUFF_TURN_IMM", "ADD_DEBUFF_TURN_IMM"].includes(detail.abilityEffectType)) {
            // [CONFIRMED 3.19] ChangeBuffDebuffTurnAbilityEffectBase.Triggering (0x18ebf40) / IsChangeableUnitState
            // (0x18ebab0) / DecreaseTurn (0x18eb3d0): on each living target, every timed (non-permanent) buff (or
            // debuff) that is not an ailment, an ADD_*_TURN state or Cutaway - and, when value1 != 0, only states of
            // that id - loses value2 turns; one that would drop below 1 is removed. ADD_* adds value2 turns instead.
            const isBuff = detail.abilityEffectType.includes("_BUFF_")
            const add = detail.abilityEffectType.startsWith("ADD_")
            effTargets.filter(t => !t.isDead).forEach(t => {
                for (const [key, d] of [...t.activeEffectDetails]) {
                    const type = d.abilityEffectType
                    if (!d.turn || isAlimentEffect(type) || type === "CUTOUT" || type === "ADD_BUFF_TURN" || type === "ADD_DEBUFF_TURN") continue
                    if (isBuff ? !isFriendlyEffect(type) : !isOpponentEffect(type)) continue
                    if (detail.value1 && skillDetailId(d) !== detail.value1) continue
                    if (add) t.activeEffectDetails.set(key, { ...d, turn: d.turn + detail.value2 })
                    else if (d.turn - detail.value2 < 1) t.activeEffectDetails.delete(key)
                    else t.activeEffectDetails.set(key, { ...d, turn: d.turn - detail.value2 })
                }
                t.updateSpd()
            })
        } else if (detail.abilityEffectType === "GAIN_BP_FIXED" || detail.abilityEffectType === "LOSE_BP_FIXED") {
            // [CONFIRMED 3.19] GainBpAbilityEffectBase.Triggering (0x18f1e80): AddBP(GetGainPoint = value1) on each
            // target; LoseBpAbilityEffectBase: AddBP(-value1). BP is the ultimate gauge of MaxBP > 0 units
            // (isSpecialAttackPointMax). AddBP clamps to [0, MaxBP], so it is a no-op on everyone else.
            const n = detail.abilityEffectType === "GAIN_BP_FIXED" ? detail.value1 : -detail.value1
            effTargets.forEach(t => t.addBp(n))
        } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
            // [CONFIRMED 3.19] same GainEpAbilityEffectBase.Triggering as GAIN_EP_RATIO: EP, then +1 BP (BpCharger).
            effTargets.forEach(t => { t.getMp(detail.value1); t.addBp(1) })
        } else if (detail.abilityEffectType === "GAIN_SP_FIXED") {
            // [CONFIRMED string] [IMPLEMENTED] flat add to the attack/skill alternation
            // counter (`currentSp`) - matches GAIN_EP_FIXED's pattern one level up (team,
            // not unit, since currentSp lives on PvPTeam).
            this.team.addSp(detail.value1);
        } else if (detail.abilityEffectType === "CUTOUT") {
            // Kept until the holder's next TurnEnd (see triggerCutoutAtTurnEnd). IsUserUnitLockTurnOrder-
            // UnitState is captured when the state is added (CutoutUnitState$$SetTriggeringInfo).
            effTargets.forEach(t => t.activeEffectDetails.set(String(skillDetailId(detail)), {
                ...detail, applier: this.kioku.name, turn: 1,
                _lockTurnOrder: [...t.activeEffectDetails.values()].some(d => d.abilityEffectType === "LOCK_TURN_ORDER"),
            }))
        } else if (detail.abilityEffectType === "RECOVERY_HP" || detail.abilityEffectType === "RECOVERY_HP_ATK") {
            // [CONFIRMED 3.19] RecoveryHpAbilityEffectBase.Triggering (0x18fdf60), living targets only:
            //   RECOVERY_HP (0x18fe3c0):     base = healer MaxHP * v1/1000 + v2
            //   RECOVERY_HP_ATK (0x18fe640): base = healer processed (buffed) ATK * v1/1000 + v2
            //   heal = Ceiling(GetProcessedRecoveryValue(healer, target, Max(base, 0), PvP/GvG)) (UnitStateEngine.ts)
            const stat = detail.abilityEffectType === "RECOVERY_HP" ? this.maxHp : getProcessedAtk(this)
            const base = Math.max(0, stat * (detail.value1 / 1000) + ((detail as any).value2 ?? 0))
            const suppress = this.team.battleType === BattleType.Pvp || this.team.battleType === BattleType.Gvg
            effTargets.filter(t => !t.isDead).forEach(t => {
                withEachTarget(this, t, () => t.heal(Math.ceil(getProcessedRecoveryValue(this, t, base, suppress)), this));
                // [CONFIRMED 3.19] AffectedUnitNotice.CreateByRecovery (0x1378df0) sets IsReceivedRecovery = true for
                // every living target, even when nothing was healed (full HP) - IS_RECOVERY conditions see it.
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isReceivedRecovery: true });
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
                // RevivalRatioAbilityEffect (0x1900790): Ceiling((float)MaxHP * ((float)v1 / 100f)), no heal modifiers.
                const hp = Math.ceil(f32(t.maxHp * f32(detail.value1 / 100)));
                t.heal(hp, this);
                t.lastNotice = mergeNotice(t.lastNotice, { ...emptyNotice(), isReceivedRecovery: true });
            })
        } else if (detail.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
            return detail.value1;
        } else if (detail.abilityEffectType === "ADDITIONAL_TURN_UNIT_ACT") {
            // The user's own extra turn, whatever the targets were (see queueAdditionalTurn). It used to be given to
            // the targets: opponents, so ally A4 extra turns went to the enemies and enemy ones to the allies.
            this.queueAdditionalTurn()
        } else if (detail.abilityEffectType === "RE_ACTION_TURN_UNIT_ACT") {
            // [CONFIRMED 3.19] ReActionTurnUnitActAbilityEffect (0x18fd2a0): a ReActionTurnUnitAct per target (no cool
            // time), interruptible by ultimates. [APPROXIMATION] run right after the action (performAction loop).
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
        } else if ("passiveSkillDetailMstId" in detail || UNIT_STATE_TYPES.has(detail.abilityEffectType)) {
            // Permanent (turn 0) state: added by a passive trigger at any timing, or by a skill (e.g. an enemy's
            // LOCK_TURN_ORDER, "Cannot be removed"). Re-triggering an IAccum state adds a stack (e.g.
            // UP_ATK_ACCUM_RATIO on every attack end).
            effTargets.forEach(t => this.storePermanentState(t, detail, this.kioku.name, this))
        } else {
            console.warn(`Active without turn: ${detail.abilityEffectType} (detail ${skillDetailId(detail)}) (possibly a RECOGNIZED-ONLY effect type not yet implemented - see PvPTeam.ts's friendlySkills/enemySkills header notes and MISSING_AND_UNCERTAIN.md)`, detail)
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

export function isPvpLikeBattle(bt: BattleType): boolean {
    return bt === BattleType.Pvp || bt === BattleType.Gvg
}

// Same entries, in the same order, as scanning skillDetails for skillMstId === id*100+lvl (the index is built from it).
function getDetails(id: number, lvl: number): SkillDetail[] {
    return (skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[];
}

export class PvPTeam {
    kiokuStates: KiokuState[];
    declare otherTeam: PvPTeam
    private debug: boolean;
    teamLabel: string
    // [CONFIRMED 3.19] SpReferee: Init (0x15c07a0) sets both teams to 5; AddSp (0x15c04b0) = Clamp(sp + n, 0, 6), so SP
    // gained above 6 is lost. Normal attack +1, a skill -ConsumeSP (GetCalculationSp 0x15c05e0).
    currentSp = 5
    static readonly MAX_SP = 6
    // Queued AdditionalTurnUnitActs of this team's units (KiokuState.queueAdditionalTurn), run by PvPBattle before
    // ultimates; seq orders them across both teams.
    additionalTurnQueue: { unit: KiokuState, seq: number }[] = []
    // Start-condition results of the skill launch in progress (completeAction), by effect.
    launchPrecheck?: Map<SkillDetail, LaunchPrecheck>
    addSp(n: number): void {
        this.currentSp = Math.max(0, Math.min(PvPTeam.MAX_SP, this.currentSp + n))
    }

    // [CONFIRMED enum] Network.Definition.Battle.BattleType (dump.cs). Defaults to Pvp
    // (2) per the person's message; pass BattleType.Solo/Gve/etc. to run a non-PvP
    // simulation through the same engine - see DamageCalculator.ts.
    battleType: BattleType
    isTeam1 = false
    // Random source for every roll this team makes (crit, effect hit, AI target / enemy skill picks).
    // Math.random by default; PvPBattle sets its BattleRng (shared by both teams), which applies the
    // RNG mode (always hit / always miss / seed / manual) and records every real roll.
    rng: RngSource = Math.random
    // PvE "Manual" targeting: every target decision (either team) is the user's pick via
    // BattleRng.pickTarget instead of the targeting AI. Set by PvPBattle.
    manualTargeting = false
    // Fight solver: under manual control, picks on these sides ("friend" = the acting unit's own team, "opp" = the
    // other one) are left to the targeting AI. Unset everywhere else.
    aiTargetSides?: Set<"friend" | "opp">
    // Scripted play for simulations that want a fixed play pattern (LuxBench), not game rules. allyActionPolicy picks
    // an auto ally's Battle Skill / Basic Attack (a Battle Skill without SP falls back to the default); allyTargetPolicy
    // picks the ally target of a friendly single/proximity effect before any targeting rule; opponentTargetPolicy the
    // same for opponent-side effects (the primary target of single and proximity skills).
    allyActionPolicy?: (actor: KiokuState) => TargetType.skillId | TargetType.attackId | undefined
    allyTargetPolicy?: (actor: KiokuState, detail: SkillDetail) => KiokuState | undefined
    opponentTargetPolicy?: (actor: KiokuState, detail: SkillDetail) => KiokuState | undefined

    // Auto play: Battle Skill whenever the team has SP, unless allyActionPolicy says otherwise.
    private autoAllyAction(actor: KiokuState): TargetType {
        const wanted = this.allyActionPolicy?.(actor)
        if (wanted === TargetType.attackId || (wanted === TargetType.skillId && this.currentSp > 0)) return wanted
        return this.currentSp ? TargetType.skillId : TargetType.attackId
    }
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

    generateState(actor: KiokuState, target: KiokuState, actionType?: TargetType, trueActorUnit?: KiokuState, mainTargetUnit?: KiokuState, notice?: AffectedUnitNotice): BattleState {
        return {
            actorTeam: this,
            enemyTeam: this.otherTeam,
            actor,
            target,
            actionType,
            // An Ether Blow is a follow-up (TargetType.fuaId) whose ActorSkillType is "EtherBlow" (SkillMst type 5).
            actorSkillType: actionType === TargetType.fuaId && lastLaunchSkillType === "EtherBlow" ? "EtherBlow" : actionType,
            trueActorUnit,
            mainTargetUnit,
            notice,
        }
    }

    constructor(kiokus: PvPKioku[], teamLabel: string, debug = false, battleType: BattleType = BattleType.Pvp) {
        this.debug = debug;
        this.teamLabel = teamLabel;
        this.battleType = battleType;
        this.kiokuStates = kiokus.map((k, i) => new KiokuState(i, teamLabel, this, k))
        this.layoutEnemyPositions()
    }

    // [CONFIRMED 3.19] a wave's enemies sit at consecutive positions starting at 3 - n/2 (PvE.wavePositionIds).
    private layoutEnemyPositions(): void {
        if (!this.kiokuStates.length || !this.kiokuStates.every(k => k.enemy)) return
        const ids = wavePositionIds(this.kiokuStates.length)
        this.kiokuStates.forEach((k, i) => { k.positionId = ids[i] })
    }

    // PvE: the stage's summon templates (summonId -> appearance), set by createPvEBattle.
    summonTemplates?: Map<number, QuestEnemyAppearance>

    // [CONFIRMED 3.19] SummonAbilityEffect.Triggering (0x1902c60) -> EnemyAppearanceGameDirectorBase.GetSummonedUnitList
    // (0x14953f0): walk the positions 3, 2, 4, 1, 5; a position held by a living unit is skipped, otherwise the next
    // summon id is dequeued and CreateAdditionalBattleUnitForSummon(id, position) spawns it there (an id without a
    // template is used up and spawns nothing). Stops when the ids run out. AddEnemyBattleUnit (0x1494c80) then resets
    // the new unit's turn gauge and runs TriggeringOnBattleStart for it.
    summonUnits(summonIds: number[], summoner: KiokuState): KiokuState[] {
        const queue = summonIds.filter(id => id)
        const added: KiokuState[] = []
        for (const pos of SUMMON_POSITION_ORDER) {
            if (!queue.length) break
            if (this.kiokuStates.some(k => !k.isDead && k.positionId === pos)) continue
            const template = this.summonTemplates?.get(queue.shift()!)
            if (!template) continue
            added.push(this.addEnemyUnit(template, pos, summoner.kioku.name, summoner.team.isTeam1))
        }
        this.finishAddedUnits(added)
        return added
    }

    // One new enemy at board position `pos`: a KO'd unit at that position is replaced in its slot, otherwise the
    // unit is added at the end. AddEnemyBattleUnit (0x1494c80): HP = the shared pool on a linkHpType 2 wave, turn
    // gauge reset.
    private addEnemyUnit(template: QuestEnemyAppearance, pos: number, source: string, sourceIsTeam1: boolean): KiokuState {
        const kioku = new EnemyKioku(template) as unknown as PvPKioku
        const slot = this.kiokuStates.findIndex(k => k.isDead && k.positionId === pos)
        const idx = slot >= 0 ? slot : this.kiokuStates.length
        const unit = new KiokuState(idx, this.teamLabel, this, kioku)
        unit.positionId = pos
        if (slot >= 0) this.kiokuStates[slot] = unit; else this.kiokuStates.push(unit)
        kioku.effects.forEach(e => unit.addEffectToBank(e))
        unit.resetDistanceRemaining()
        this.eventLog.push({
            kind: "summon", source, target: unit.kioku.name, amount: 0,
            sourceIsTeam1, targetIsTeam1: this.isTeam1, targetPos: unit.posIdx
        })
        return unit
    }

    // [APPROXIMATION] only the new units' own battle-start passives run; the game also lets the other units'
    // battle-start state passives reach them (TriggeringOnBattleStart with isStateOnly).
    private finishAddedUnits(added: KiokuState[]): void {
        if (!added.length) return
        const fuas = this.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init, undefined, undefined, new Set(added))
        this.recomputeDerivedStats()
        if (this.linkHp?.type === 2) for (const u of added) { u.currentHp = Math.min(this.linkHp.current, u.maxHp); u._linkSyncedHp = u.currentHp }
        this.triggerFua(fuas)
    }

    // Solo Raid "Labyrinth Vanguard" (SoloRaidBuffReferee), one object shared by both teams; undefined outside Solo
    // Raid. Points 0..100 (0..30 while active); at 100 the phase activates between acts for `maxGauge` units of
    // turn-gauge time (PvPBattle).
    soloRaid?: { active: boolean, point: number, maxPoint: number, activeMaxPoint: number, gauge: number, maxGauge: number }

    // Solo Raid countdown (SoloRaidGameDirector.CountdownReferee), one object shared by both teams; undefined
    // outside Solo Raid, where COUNTDOWN_START is only a state and nothing counts down.
    countdown?: { max: number, value: number, cancelMax: number, cancelTotal: number, unit?: KiokuState }

    // ---- Link HP (Solo Raid waves) ------------------------------------------------------------------------
    // [CONFIRMED 3.19] LinkHpReferee (InitLinkHp 0x14956c0, UpdateLinkHp 0x1495d80, SyncEnemyHp, AddLinkHpDelta)
    // and QuestJudgeResultReferee.CheckBattleFinishAfterActWithHpLink: on a Link HP wave the wave is won when the
    // pool drops below 1, not when every enemy is down.
    //  type 1: pool 100/100; after each act every enemy that died removes its linkHpWeight.
    //  type 2: pool = the main target's HP; after each act it takes the total damage dealt to the wave's enemies
    //          (minus healing), then every enemy's HP is set to min(pool, its max HP).
    linkHp?: { type: number, name: string, current: number, max: number }
    // [CONFIRMED 3.19] AdditionalEnemyReferee.RegisterEndlessEnemy / GetNextEndlessEnemyAppearModel: the wave's
    // appearance list is dealt round-robin (index wraps).
    endless?: { list: QuestEnemyAppearance[], next: number }

    setupLinkHp(meta: { linkHpType: number, linkHpName: string, appearances: QuestEnemyAppearance[], modeChanges?: ModeChangeInfo[] } | undefined): void {
        this.linkHp = undefined
        this.endless = undefined
        this.setupModeChange(meta?.modeChanges ?? [])
        if (!meta) return
        if (meta.linkHpType === 1 && meta.appearances.length) {
            this.linkHp = { type: 1, name: meta.linkHpName, current: 100, max: 100 }
            this.endless = { list: meta.appearances, next: this.kiokuStates.length % meta.appearances.length }
        } else if (meta.linkHpType === 2) {
            const main = meta.appearances.find(a => a.isMainTargetEnemy)
            if (!main) return
            this.linkHp = { type: 2, name: meta.linkHpName, current: main.hp, max: main.hp }
            for (const k of this.kiokuStates) k._linkSyncedHp = k.currentHp
            this.syncLinkHp()
        }
    }

    syncLinkHp(): void {
        const l = this.linkHp
        if (!l) return
        if (l.type === 1) {
            for (const k of this.kiokuStates) if (k.isDead && !k._linkCounted) {
                k._linkCounted = true
                l.current = Math.max(0, l.current - (k.enemy?.appearance.linkHpWeight ?? 0))
            }
            // [APPROXIMATION] the game ends the wave with the remaining enemies still standing; here they are
            // removed so the usual "wave wiped" flow takes over.
            if (l.current < 1) for (const k of this.kiokuStates) if (!k.isDead) { k.currentHp = 0; k._linkCounted = true }
        } else {
            let delta = 0
            for (const k of this.kiokuStates) if (k._linkSyncedHp !== undefined) delta += k.currentHp - k._linkSyncedHp
            // LinkHpReferee.CalculateBossLinkHpDelta: the pool can't pass the boss's next form threshold either.
            const main = this.kiokuStates.find(k => k.enemy?.appearance.isMainTargetEnemy && !k.isDead)
            if (delta < 0 && main) delta = -this.modeChangeDamageCut(main, -delta)
            l.current = Math.max(0, Math.min(l.max, l.current + delta))
            for (const k of this.kiokuStates) {
                if (!k.isDead || l.current < 1) k.currentHp = Math.max(0, Math.min(l.current, k.maxHp))
                k._linkSyncedHp = k.currentHp
            }
        }
    }

    // ---- Boss form changes (QuestEnemyModeChangeMst) ------------------------------------------------------
    // [CONFIRMED 3.19] ModeChangeReferee: `step` is the current form's step (the form the main target spawned as).
    modeChange?: { infos: ModeChangeInfo[], step: number }

    private setupModeChange(infos: ModeChangeInfo[]): void {
        this.modeChange = undefined
        const main = this.kiokuStates.find(k => k.enemy?.appearance.isMainTargetEnemy)
        const cur = main && infos.find(i => i.appearance.questEnemyAppearanceMstId === main.enemy!.appearance.questEnemyAppearanceMstId)
        if (cur) this.modeChange = { infos, step: cur.step }
    }

    private nextModeInfo(): ModeChangeInfo | undefined {
        const mc = this.modeChange
        return mc?.infos.find(i => i.step === mc.step + 1)
    }

    // [CONFIRMED 3.19] ModeChangeReferee.GetNextModeChangeDamageCutDamage (0x149fd30), used by BattleUnit.Attack: a
    // hit on the current form can't take its HP below the next form's threshold (type 1 = HP ratio, in 1/1000).
    modeChangeDamageCut(unit: KiokuState, damage: number): number {
        const mc = this.modeChange
        if (!mc || !unit.enemy) return damage
        const cur = mc.infos.find(i => i.step === mc.step)
        const next = this.nextModeInfo()
        if (!cur || !next || next.type !== 1 || cur.appearance.questEnemyAppearanceMstId !== unit.enemy.appearance.questEnemyAppearanceMstId) return damage
        const cap = Math.trunc(next.threshold * unit.maxHp / 1000)
        return unit.currentHp - damage <= cap ? Math.max(0, unit.currentHp - cap) : damage
    }

    // [CONFIRMED 3.19] SoloGameDirectorBase.CheckModeChange (0x14a4bd0) + ModeChangeReferee.CanModeChange (0x149f960)
    // -> ModeChangeAct -> EnemyAppearanceGameDirectorBase.ModeChangeEnemyBattleUnit (0x14956f0): once the main target's
    // HP ratio (x1000) is at or below the next form's threshold, it is replaced by that form: same position, HP and
    // turn gauge, but a fresh unit (its buffs/debuffs are gone) whose battle-start passives run; in Solo Raid the
    // countdown is reset. Returns the new unit.
    checkModeChange(): KiokuState | undefined {
        const mc = this.modeChange
        const next = this.nextModeInfo()
        const main = this.kiokuStates.find(k => k.enemy?.appearance.isMainTargetEnemy && !k.isDead)
        if (!mc || !next || next.type !== 1 || !main) return undefined
        if (f32(f32(main.currentHp) / f32(main.maxHp)) * 1000 > next.threshold) return undefined
        mc.step = next.step
        const kioku = new EnemyKioku(next.appearance) as unknown as PvPKioku
        const unit = new KiokuState(main.posIdx, this.teamLabel, this, kioku)
        unit.positionId = main.positionId
        this.kiokuStates[this.kiokuStates.indexOf(main)] = unit
        kioku.effects.forEach(e => unit.addEffectToBank(e))
        this.eventLog.push({
            kind: "summon", source: main.kioku.name, target: unit.kioku.name, amount: 0, formChange: true,
            sourceIsTeam1: this.isTeam1, targetIsTeam1: this.isTeam1, targetPos: unit.posIdx
        })
        if (this.countdown) Object.assign(this.countdown, { max: 0, value: 0, cancelMax: 0, cancelTotal: 0, unit: undefined })
        const fuas = this.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init, undefined, undefined, new Set([unit]))
        this.recomputeDerivedStats()
        unit.currentHp = main.currentHp
        unit._linkSyncedHp = unit.currentHp
        unit.turnGauge = main.turnGauge
        unit.turnGaugeSpeed = main.turnGaugeSpeed
        unit.turnOrderPriority = main.turnOrderPriority
        this.triggerFua(fuas)
        return unit
    }

    // [CONFIRMED 3.19] SoloGameDirectorBase.Request(TimeForward) -> TrySupplyEndlessEnemyUnits ->
    // AdditionalEnemyReferee.CreateSuppliedEndlessEnemyUnitList (0x1376250): before time moves on, every position
    // 1-5 not held by a living enemy gets the next enemy of the list. Returns the new units.
    supplyEndless(): KiokuState[] {
        const e = this.endless
        if (!e || !this.linkHp || this.linkHp.current < 1) return []
        const added: KiokuState[] = []
        for (const pos of [1, 2, 3, 4, 5]) {
            if (this.kiokuStates.some(k => !k.isDead && k.positionId === pos)) continue
            const template = e.list[e.next]
            e.next = (e.next + 1) % e.list.length
            added.push(this.addEnemyUnit(template, pos, this.linkHp.name || "Reinforcements", this.isTeam1))
        }
        this.finishAddedUnits(added)
        return added
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
    // Next PvE wave: new units replace this team's (wiped) units.
    replaceUnits(kiokus: PvPKioku[]): void {
        this.kiokuStates = kiokus.map((k, i) => new KiokuState(i, this.teamLabel, this, k))
        this.layoutEnemyPositions()
    }

    finishSetup(otherTeam: PvPTeam) {
        this.otherTeam = otherTeam
    }

    addEffectsToBank(): void {
        // Trigger order, not stat order: see PvPKioku.triggerOrderEffects (ability before crystalis, so an
        // EX crys GAIN_CHARGE_POINT lands after the kit's own CHARGE initialises the gauge).
        this.kiokuStates.forEach(k => (k.kioku.triggerOrderEffects ?? k.kioku.effects).forEach(e => {
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
    applyPassivesForTiming(timing: ProcessTiming, lastAction?: TargetType, lastActor?: KiokuState, mainTarget?: KiokuState, only?: Set<KiokuState>): FuaMap {
        let additionalAct: FuaMap = {};
        for (const k of this.kiokuStates) {
            if (k.isDead) continue
            if (only && !only.has(k)) continue
            // [CONFIRMED 3.19] PassiveSkill.TriggeringOnBattleStart stable-sorts by IBattleStartTriggerPriority
            // (Define: AddTurn states 200, effect-value variation 100, DWN_BARRIER_VALUE 90, others 0), highest first,
            // so e.g. UP_BUFF_EFFECT_VALUE is in place before the unit's other battle-start states are given.
            const list = [...k.passiveSkills.values()]
            if (timing === ProcessTiming.BATTLE_START) list.sort((a, b) => battleStartPriority(b) - battleStartPriority(a))
            list.forEach(detail => {
                if (!isTimingCorrect(timing, detail)) return
                if (conditionSetRequiresActorIsSelf(detail) && (!lastActor || lastActor !== k)) return
                k.effectTurnPriority = nextTurnOrderPriority()
                try {
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
                } finally { k.effectTurnPriority = undefined }
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
        // [CONFIRMED 3.19] ActExecutor.TurnBegin (0x17e1b30) and TurnEnd call PassiveSkill.Triggering(gd, 3 / 6, actor,
        // null, null, ...): no main target and NO actorActiveSkill, so ActorSkillType (401) is false in the TurnStart /
        // TurnEnd passes and their AfterProcess. Only ExecuteSkill's AttackEnd (5) passes the skill. E.g. the Rose Garden
        // minions' "+2 Magic when not attacked during an enemy's turn" (AfterProcess, ActorSkillType) fires once per
        // ally action, not also after the ally's TurnStart.
        const skillType = timing === ProcessTiming.TURN_START || timing === ProcessTiming.TURN_END ? undefined : actionType
        const fuas = teams.map(t => t.applyPassivesForTiming(timing, skillType, actor, mainTarget))
        teams.forEach((t, i) => { fuas[i] = mergeFuaMaps(fuas[i], t.applyPassivesForTiming(ProcessTiming.AFTER_PROCESS, skillType, actor, mainTarget)) })
        // [CONFIRMED 3.19] PassiveSkill.Triggering ends with ResetZoneStatePatternMstId on every unit: the zone
        // "started"/"ended" flags are only visible during the pass right after the change.
        teams.forEach(t => t.kiokuStates.forEach(k => { k.zone.expandPattern = 0; k.zone.releasePattern = 0 }))
        // [CONFIRMED 3.19] ActExecutor.ExecuteSkill (0x17dfec0): after the AttackEnd pass of a normal attack, battle
        // skill or ultimate, every unit that took a damaging hit from it and is alive gets +1 count point.
        if (timing === ProcessTiming.ATTACK_END && (actionType === TargetType.attackId || actionType === TargetType.skillId || actionType === TargetType.specialId))
            teams.forEach(t => t.kiokuStates.forEach(k => { if (!k.isDead && k.lastNotice?.isReceivedAttack) k.tryModifyCountPoint(1) }))
        teams.forEach(t => t.recomputeDerivedStats())
        beforeFollowUps?.()
        teams.forEach((t, i) => t.triggerFua(fuas[i]))
    }

    // Set by PvPBattle: called after every executed skill (turn action, ultimate, extra action,
    // combo step, follow-up) so the display can show each as its own entry.
    snapshotHook?: (actor: KiokuState, type: TargetType, label?: string) => void
    recordAction(actor: KiokuState, type: TargetType, label?: string) {
        for (const u of [...this.kiokuStates, ...(this.otherTeam?.kiokuStates ?? [])]) u.checkHpGaugeRevive()
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

    // [CONFIRMED 3.19] turn order is built from GameDirectorBase.ActiveUnitList (living units only):
    // a KO'd unit has no turn until it is revived.
    get aliveKiokus(): KiokuState[] {
        return this.kiokuStates.filter(k => !k.isDead)
    }

    get isWiped(): boolean {
        return this.kiokuStates.every(k => k.isDead)
    }

    // The enemy wave is over: everyone is down, except on an endless (Link HP type 1) wave, which only ends when
    // its pool is empty (defeated enemies keep being replaced until then).
    get waveCleared(): boolean {
        if (this.linkHp?.type === 1) return this.linkHp.current < 1
        return this.isWiped
    }

    getSecondsUntilNextReadyKioku(): number {
        return this.aliveKiokus.reduce((s, k) => s < k.secondsUntilAbleToAct() ? s : k.secondsUntilAbleToAct(), Infinity)
    }

    getNextActor(): KiokuState {
        return this.aliveKiokus.reduce((best, k) => compareTurnOrder(k, best, this) < 0 ? k : best)
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
            const forced = side === "friend" ? this.allyTargetPolicy?.(actor, detail) : this.opponentTargetPolicy?.(actor, detail)
            if (forced && !forced.isDead) return forced
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
            if (effectId === 1161) { // Mabayu skill: every effect goes to the Cutaway target
                // [CONFIRMED 3.19] CutoutUnitState$$GetUnitFilterFuncOrder (0x15b7520): UnitFilterByMainTarget,
                // UnitFilterByRoleAttacker, UnitFilterWithMaxAtk (processed ATK, i.e. with buffs).
                // Cutaway's start condition 1278 ("target is not self") rules Mabayu herself out.
                const p = pick(eligableTargets.filter(k => k.kioku.data.role === KiokuRole.Attacker),
                    (a, b) => getProcessedAtk(a) > getProcessedAtk(b))
                    ?? pick(eligableTargets, (a, b) => getProcessedAtk(a) > getProcessedAtk(b))
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
            return selectFullAutoTarget(detail, universe, this.rng, actor)
        }
        // [CONFIRMED 3.19] UnitBrain.TargetingUnits (0x17f2ea0): one opponent target and one friendly target
        // are chosen per skill; every single/proximity effect on that side uses it (SelectTargets looks up
        // the selected id). Cached per action in `actionPrimaryTargets`.
        const side = possibleTargets[0]?.team === actor.team ? "friend" : "opp"
        // completeAction resolves a friendly effect against [actor] first, then applyEffect widens it to
        // the whole team (the `this === target` branch). In manual mode the pick is made right away
        // against the whole team: the placeholder is not a decision (it made the caster the cached
        // pick), and passing the caster through fails "target is not self" start conditions checked
        // on that first call (Hollow Woman's Cutaway, condition 1278, silently never applied).
        const isFriendPlaceholder = side === "friend" && possibleTargets.length === 1 && possibleTargets[0] === actor
        // aiTargetSides (fight solver option): sides whose targets stay with the AI under manual control.
        const manual = this.manualTargeting && this.rng instanceof BattleRng && !this.aiTargetSides?.has(side)
        // Same for FULL AUTO: UnitBrain.TargetingUnits picks the friendly target from the whole friend list; against
        // the [actor] placeholder the AI could only ever pick the caster (Thunder Torrent's Rapid Pulse / DMG up on herself).
        const universe = isFriendPlaceholder ? this.kiokuStates : possibleTargets
        // Manual targeting: the user picks among every legal target (no AI preference, no kit-specific
        // rule); BattleRng.pickTarget throws PendingDecision until a pick is stored for this point.
        const resolveManual = (): KiokuState | null => {
            const pool = legalTargetPool(detail, universe)
            if (pool.length <= 1) return pool[0] ?? null
            const skillMstId = (detail as any).skillMstId as number | undefined
            const what = skillMstId ? skillName(skillMstId) : detail.abilityEffectType
            const label = `${unitLabel(actor)} · ${what}: target on the ${pool[0].team.isTeam1 ? "allies" : "enemies"}`
            return pool[(this.rng as BattleRng).pickTarget(label, pool.map(unitLabel), pool)]
        }
        const resolveUncached = manual ? resolveManual : resolvePrimaryTarget
        const resolveCached = (): KiokuState | null => {
            const hit = this.actionPrimaryTargets.get(side)
            if (hit && !hit.isDead && universe.includes(hit)) return hit
            const picked = resolveUncached()
            if (picked) this.actionPrimaryTargets.set(side, picked)
            return picked
        }
        if (detail.range === targetRange.TARGET) {
            const picked = resolveCached()
            if (!picked) {
                console.warn(`${actor.kioku.name}: ${detail.abilityEffectType} (detail ${skillDetailId(detail)}) FULL AUTO targeting found no eligible target (all candidates dead/ineligible?)`, detail)
                return []
            }
            return [picked]
        }
        if (detail.range === targetRange.PROXIMITY) {
            const primary = resolveCached()
            if (!primary) {
                console.warn(actor.kioku.name, detail, "PROXIMITY targeting found no eligible primary target")
                return []
            }
            return expandProximity(primary, universe)
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

    // [CONFIRMED 3.19] UnitBrain.ShouldUseSkillBase (0x17f2a60): a skill is a random-pick candidate only
    // if its first effect (lowest detail id) has an AI-valid target. Approximated as "a living unit on
    // that effect's side" (dead units for revival effects).
    enemySkillHasTarget(_actor: KiokuState, skillMstId: number): boolean {
        const main = enemySkillDetails(skillMstId)[0]
        if (!main) return false
        // [CONFIRMED 3.19] SummonAbilityEffect.GetAIFilteredTargets keeps the living units of its own side (the user).
        if (main.abilityEffectType === "SUMMON") return !_actor.isDead
        const side = isFriendlyEffect(main.abilityEffectType) ? this.kiokuStates : this.otherTeam.kiokuStates
        if (main.abilityEffectType.startsWith("REVIVAL")) return side.some(u => u.isDead)
        return side.some(u => !u.isDead)
    }

    // [CONFIRMED 3.19] StartTimingAct: the BattleStart/WaveStart condition rows of each alive, unbroken
    // enemy run once before the first turn (UnitBrain.RegisterEnemyUnitsStartConditionTimingAction).
    runStartTimingAction(actor: KiokuState, skillMstId: number): void {
        if (actor.isDead || actor.isBroken) return
        this.resetActionTallies()
        const fuas = this.act(actor, TargetType.skillId, skillMstId)
        this.fireTiming(ProcessTiming.ATTACK_END, actor, this.lastMainTarget, TargetType.skillId, () => this.recordAction(actor, TargetType.skillId, `Battle start · ${skillName(skillMstId)}`))
        this.triggerFua(fuas)
    }

    act(actor: KiokuState, effectName: TargetType, enemySkillId?: number): FuaMap {
        this.lastMainTarget = undefined
        if (enemySkillId !== undefined) {
            // Enemy active skill: no SP / MP bookkeeping (enemies have neither).
            return this.completeAction(actor, effectName, enemySkillDetails(enemySkillId))
        }
        // [CONFIRMED 3.19] BpCharger (cctor 0x1491450: NormalAttack 1, ActiveSkill 2, EpAbilityEffect 1):
        // NormalAttack.Execute (0x138b560) calls ChargeByNormalAttack (0x14913e0) and ActiveSkill.Execute
        // ChargeByActiveSkill (0x1491300), both before the skill's effects: BP = Clamp(BP + n, 0, MaxBP).
        if (effectName === TargetType.attackId) {
            this.addSp(1);
            actor.addBp(1);
            actor.skillStreak = 0
        } else if (effectName === TargetType.skillId) {
            this.addSp(-1);
            actor.addBp(2);
            actor.skillStreak++
        } else {
            // [CONFIRMED 3.19] SpecialAttack.Execute (0x138c4f0): if MaxEP > 0, EP = 0; if MaxBP > 0, BP = 0
            // (the whole gauge is spent, overflow is lost), then EpCharger.ChargeBySpecialAttack (EP only).
            if (actor.maxMp > 0) actor.currentMp = 0;
            if (actor.maxBp > 0) actor.currentBp = 0;
        }
        // [CONFIRMED 3.19] SwitchSkillUnitState (value1 = switch-to skill unique id, value3 = the
        // SkillType it replaces; BattleUnit$$IsSwitchingActiveSkill / GetSwitchableSkills build it
        // at the same level as the original). E.g. Final Fatebloom's battle skill becomes 7008
        // (+10 EP) while Abyssal Rose (UNIQUE_BUFF 18) is on her.
        const skillId = actor.switchedSkillId(effectName) ?? actor.kioku.data[TargetTypeLookup[effectName]]
        const details = getDetails(skillId, actor.kioku[targetTypeToLvl[effectName]])
        return this.completeAction(actor, effectName, details)
    }

    // Returns a FuaMap of any ADDITIONAL_SKILL_ACT triggers fired by the effects
    // applied here (fixed in revision 1 - previously silently dropped when triggered
    // from an active skill's own effect list rather than a passive).
    // Targets chosen for the action in progress (see sliceTargets).
    actionPrimaryTargets = new Map<string, KiokuState>()

    // The (target, effect) applications of one skill effect: one per target, except DMG_RANDOM.
    // [CONFIRMED 3.19] DmgRandomAbilityEffect (ctor 0x18f1210, Triggering 0x18f08b0): value2 hits of power v1/1000,
    // each on a target picked uniformly (with repeats) from the targets selected at the start - a unit that died
    // meanwhile can still be picked and just takes no HP loss. Per hit: crit, break-rate growth (base v4/10, role
    // table when 0), break gauge -v3 (1 when 0), HP loss. Picks are made lazily so each pick precedes its crit roll.
    private *hitsOf(actor: KiokuState, detail: SkillDetail, targets: KiokuState[]): Generator<[KiokuState, SkillDetail]> {
        if (detail.abilityEffectType !== "DMG_RANDOM") {
            for (const t of targets) yield [t, detail]
            return
        }
        if (!targets.length) return
        const v3 = detail.value3 || 1
        const hit = { ...detail, value2: detail.value1, value3: v3, value4: v3, value5: (detail as any).value4 ?? 0, range: targetRange.ALL, _src: detail } as SkillDetail
        const hits = detail.value2 ?? 0
        for (let i = 0; i < hits; i++) {
            const idx = rollChoice(this.rng, targets.map(() => 1), "target", () => `${unitLabel(actor)} random hit ${i + 1}/${hits}`, () => targets.map(t => unitLabel(t)))
            yield [targets[idx], hit]
        }
    }

    // One AbilityEffectLauncher.Triggering of an active skill (0x1373550): the skill's effects, then its additional-
    // damage hits and the regain heal, all with the skill in every unit's condition bundle (see `activeLaunch`).
    private launchSkill(actor: KiokuState, effectName: TargetType, details: SkillDetail[], noticeStart: number, effects: () => void): void {
        const prev = activeLaunch
        const skillType = launchSkillType(effectName, details)
        activeLaunch = { actor, targetType: effectName, skillType, team: this }
        lastLaunchSkillType = skillType
        try {
            effects()
            actor.additionalDamageAfterLaunch()
            actor.regainAfterLaunch(noticeStart)
        } finally { activeLaunch = prev }
    }

    completeAction(actor: KiokuState, effectName: TargetType, details: SkillDetail[]): FuaMap {
        this.actionPrimaryTargets = new Map()
        const noticeStart = this.otherTeam.lastActionNotices.length
        let possibleTargets: KiokuState[] = []
        let additionalAct: FuaMap = {}
        this.launchSkill(actor, effectName, details, noticeStart, () => {
            // Pass 1 (AbilityEffectLauncher.Triggering, see KiokuState.precheckStartConditions): every effect's targets
            // and start conditions, before any effect runs.
            const plan: { detail: SkillDetail, targets: KiokuState[] }[] = []
            for (const detail of details) {
                if (detail.abilityEffectType === "SUMMON") { plan.push({ detail, targets: [] }); continue }
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
                plan.push({ detail, targets })
            }
            const precheck = new Map<SkillDetail, LaunchPrecheck>()
            for (const { detail, targets } of plan) {
                if (detail.abilityEffectType !== "SUMMON") precheck.set(detail, actor.precheckStartConditions(detail, targets, effectName, actor, targets[0]))
            }
            const prevPrecheck = this.launchPrecheck
            this.launchPrecheck = precheck
            try {
                // Pass 2: trigger the effects in order.
                for (const { detail, targets } of plan) {
                    if (detail.abilityEffectType === "SUMMON") {
                        // Once per effect, not per target: value1..value5 are summon ids (PvE summon templates).
                        this.summonUnits([detail.value1, detail.value2, detail.value3, (detail as any).value4, (detail as any).value5], actor)
                        continue
                    }
                    actor.effectTurnPriority = nextTurnOrderPriority()
                    // [CONFIRMED 3.19] DamageAbilityEffectBase: Collect/ConsumeAttackHitConsumableStates (0x18ee590 / 0x18ee7b0) -
                    // the attacker's IConsumeRemainCountOnAttack states active at the start of a damage row lose 1 remain count
                    // after the row (whether it hit or not); at 0 they are removed (UnitCondition.Refresh).
                    const consumable = detail.abilityEffectType.startsWith("DMG_") && detail.abilityEffectType !== "DMG_RATIO" ? actor.collectConsumable() : []
                    try {
                        for (const [target, d] of this.hitsOf(actor, detail, targets)) {
                            const fua = actor.applyEffect(target, d, effectName, actor, targets[0])
                            if (fua) additionalAct[fua] = { caster: actor, triggerTarget: target }
                        }
                    } finally { actor.effectTurnPriority = undefined }
                    actor.consumeCollected(consumable)
                }
            } finally { this.launchPrecheck = prevPrecheck }
        })
        actor.getMpFromType(effectName)
        return additionalAct
    }

    // Units whose ultimate can fire right now (full MP, not broken, able to act), in slot order.
    readyUltimates(): KiokuState[] {
        return this.aliveKiokus
            // [CONFIRMED 3.19] BattleUnit.IsSpecialAttackPointMax: BP vs MaxBP for BP units, else EP vs MaxEP.
            .filter(k => k.isSpecialAttackPointMax())
            // Not broken. (Was `currentRemainingBreakGauge > 0`, which never holds for PvE allies:
            // they have no break gauge at all, so their ultimates never fired in PvE.)
            .filter(k => k.maxBreakGauge <= 0 || k.currentRemainingBreakGauge > 0)
            // [RECONSTRUCTED - see KiokuState.canNotAction] a stunned unit can't fire an
            // otherwise-ready ultimate. Excluded here (rather than "ready but does
            // nothing") so their MP stays banked and the ult goes off once stun wears off,
            // instead of being burned on a no-op - not confirmed against the source, but
            // it's the reading least likely to feel like a bug either way this resolves.
            .filter(k => !k.canNotAction)
            // [CONFIRMED 3.19] ValidateCanExecuteAct (0x17e27a0): CanNotUseSpecialAttack (Magic Seal) blocks the ultimate;
            // EP stays banked until the seal ends.
            .filter(k => !k.canNotUseSpecialAttack)
    }

    useUltimate(): [KiokuState, TargetType] | undefined {
        const actor = this.readyUltimates()[0]
        if (!actor) return;
        return this.useUltimateOf(actor)
    }

    useUltimateOf(actor: KiokuState): [KiokuState, TargetType] {
        this.performAction(actor, TargetType.specialId)
        return [actor, TargetType.specialId]
    }

    // Manual control (PvE "Manual") of an ally's action: Battle Skill (when the team has SP) or Basic
    // Attack, or fire one ready ultimate right away and then choose again. Returns undefined when the
    // turn can't continue (the actor died or the enemy side was wiped by the ultimates).
    private get isManualControl(): boolean {
        return this.manualTargeting && this.rng instanceof BattleRng
    }

    private chooseAllyAction(actor: KiokuState, what: string): TargetType | undefined {
        for (; ;) {
            if (actor.isDead || this.otherTeam.isWiped) return undefined
            const options: { label: string, type?: TargetType, ult?: KiokuState }[] = []
            if (this.currentSp > 0) options.push({ label: `Battle Skill (SP ${this.currentSp})`, type: TargetType.skillId })
            options.push({ label: "Basic Attack", type: TargetType.attackId })
            for (const u of this.readyUltimates()) options.push({ label: `Ultimate: ${unitLabel(u)}`, ult: u })
            const choice = options[(this.rng as BattleRng).pick("action", `${unitLabel(actor)} · ${what}: choose an action`, options.map(o => o.label))]
            if (!choice.ult) return choice.type
            this.useUltimateOf(choice.ult)
        }
    }

    // [CONFIRMED 3.19] An AdditionalTurnUnitAct is a TurnUnitActBase: ActExecutor.Execute runs only ExecuteSkill for it
    // (no TurnBegin/TurnEnd, so no duration tick or TurnNum; the gauge reset is TurnUnitAct-only). ValidateCanExecuteAct:
    // nothing if the unit died, can't act or is broken meanwhile. The skill is chosen like a normal turn.
    runAdditionalTurn(actor: KiokuState): [KiokuState, TargetType] | undefined {
        if (actor.isDead || actor.canNotAction || actor.isBroken || this.otherTeam.isWiped) return undefined
        if (actor.enemy) {
            const choice = selectEnemySkill(actor, this, this.rng, id => this.enemySkillHasTarget(actor, id))
            if (!choice) return undefined
            this.performAction(actor, TargetType.skillId, "Extra action", choice.skillMstId)
            return [actor, TargetType.skillId]
        }
        const effType = this.isManualControl ? this.chooseAllyAction(actor, "extra action") : this.autoAllyAction(actor)
        if (effType === undefined) return undefined
        this.performAction(actor, effType, "Extra action")
        return [actor, effType]
    }

    useAttackOrSkill(): [KiokuState, TargetType] {
        const actor = this.getNextActor()
        const turnLabel = actor.nextTurnLabel
        actor.nextTurnLabel = undefined
        // [CONFIRMED 3.19] ActExecutor: TurnBeginAct (break reset, TurnStart passives with this
        // unit as actor) -> TurnUnitAct (UnitTurnGauge.Reset, then ExecuteSkill) -> TurnEndAct.
        actor.additionalTurnCoolTime = false // TurnBeginAct: IsAdditionalTurnCoolTime = false
        actor.exitBreak()
        actor.tickHotEffects()
        let effType = actor.enemy ? TargetType.skillId : this.autoAllyAction(actor)
        this.fireTiming(ProcessTiming.TURN_START, actor, undefined, effType)
        // The AI picks this act's targets before the reset in the game (see setAIDecisionGauge).
        setAIDecisionGauge(actor, actor.turnGauge)
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
                if (actor.enemy) {
                    // [CONFIRMED 3.19] ValidateCanExecuteAct (0x17e27a0): a broken enemy doesn't act; otherwise
                    // the enemy AI picks the skill (no SP / MP / normal attack for enemies).
                    if (actor.isBroken || actor.isDead) break
                    effType = TargetType.skillId
                    const choice = selectEnemySkill(actor, this, this.rng, id => this.enemySkillHasTarget(actor, id))
                    if (choice) this.performAction(actor, effType, i === 0 ? turnLabel : undefined, choice.skillMstId)
                    continue
                }
                const chosen = this.isManualControl
                    ? this.chooseAllyAction(actor, actionNum >= 2 ? `turn (combo ${i + 1})` : "turn")
                    : this.autoAllyAction(actor)
                if (chosen === undefined) break
                effType = chosen
                this.performAction(actor, effType, i === 0 ? turnLabel : undefined)
            }
            actor.currentComboActionStep = 0
        }
        setAIDecisionGauge(actor, undefined)
        // [CONFIRMED 3.19] ActExecutor$$TurnEnd: TurnEnd passives (actor = this unit), then the
        // unit's states pass one turn (BattleUnit.PassingTurn(1)). Ultimates and follow-ups have
        // no TurnEnd, so they don't tick durations.
        this.fireTiming(ProcessTiming.TURN_END, actor, undefined, effType)
        if (!actor.isDead && actor.triggerCutoutAtTurnEnd()) actor.nextTurnLabel = "Cutaway"
        actor.decrementActiveEffects()
        actor.turnNum++ // BattleUnit.PassingTurn: after the states' PassingTurn
        return [actor, effType]
    }

    // Shared by useUltimate/useAttackOrSkill: runs the action, its ATTACK_END passives,
    // and any FUAs they trigger, then loops the SAME actor through another
    // attack/skill action for every pending ADDITIONAL_TURN_UNIT_ACT/
    // RE_ACTION_TURN_UNIT_ACT bonus turn they've accumulated.
    private performAction(actor: KiokuState, effType: TargetType, turnLabel?: string, enemySkillId?: number): void {
        // Reset per-action team-level tallies - see BattleConditionParser.ts's
        // team-scoped notice/effect-type conditions, which are meant to read "what
        // happened THIS action", not a stale accumulation from turns ago.
        this.resetActionTallies()
        // [CONFIRMED 3.19] ActExecutor$$ExecuteSkill: the skill, then AttackEnd passives for every
        // living unit (actor, main target, skill passed along), then queued follow-ups.
        const skillFuas = this.act(actor, effType, enemySkillId)
        setAIDecisionGauge(actor, undefined)
        const skillLabel = enemySkillId !== undefined ? skillName(enemySkillId) : undefined
        const comboLabel = [actor.currentComboActionStep ? `Combo ${actor.currentComboActionStep}` : turnLabel, skillLabel].filter(Boolean).join(" · ") || undefined
        this.fireTiming(ProcessTiming.ATTACK_END, actor, this.lastMainTarget, effType, () => this.recordAction(actor, effType, comboLabel))
        this.triggerFua(skillFuas)

        while (actor.pendingBonusTurns > 0 && !actor.isDead) {
            actor.pendingBonusTurns--
            const bonusEffType = actor.enemy ? TargetType.skillId
                : this.isManualControl ? this.chooseAllyAction(actor, "extra action")
                    : this.autoAllyAction(actor)
            if (bonusEffType === undefined) break
            const bonusChoice = actor.enemy ? selectEnemySkill(actor, this, this.rng, id => this.enemySkillHasTarget(actor, id)) : undefined
            if (actor.enemy && !bonusChoice) continue
            this.resetActionTallies()
            const bonusFuas = this.act(actor, bonusEffType, bonusChoice?.skillMstId)
            this.fireTiming(ProcessTiming.ATTACK_END, actor, this.lastMainTarget, bonusEffType, () => this.recordAction(actor, bonusEffType, "Extra action"))
            this.triggerFua(bonusFuas)
        }
    }

    // Previously fired a second, actor-less ATTACK_END for this team after every action; the
    // game has no such step (every reaction happens inside fireTiming).
    resolveEndOfTurn(): void { }

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
            const details = (skillDetailsByMstId.get(Number(actionId)) ?? []) as SkillDetail[]
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
        this.actionPrimaryTargets = new Map()
        if (!preferredTarget) return this.completeAction(actor, effectName, details)
        const noticeStart = this.otherTeam.lastActionNotices.length
        let additionalAct: FuaMap = {}
        this.launchSkill(actor, effectName, details, noticeStart, () => {
            for (const detail of details) {
                const isSingleTarget = detail.range === targetRange.TARGET
                const targets = isSingleTarget ? [preferredTarget] : this.sliceTargets(actor, isFriendlyEffect(detail.abilityEffectType) ? [actor] : this.otherTeam.kiokuStates, detail)
                if (detail.abilityEffectType.startsWith("DMG_") && targets[0] && !this.lastMainTarget) this.lastMainTarget = targets[0]
                actor.effectTurnPriority = nextTurnOrderPriority()
                // [CONFIRMED 3.19] DamageAbilityEffectBase: Collect/ConsumeAttackHitConsumableStates (0x18ee590 / 0x18ee7b0) -
                // the attacker's IConsumeRemainCountOnAttack states active at the start of a damage row lose 1 remain count
                // after the row (whether it hit or not); at 0 they are removed (UnitCondition.Refresh).
                const consumable = detail.abilityEffectType.startsWith("DMG_") && detail.abilityEffectType !== "DMG_RATIO" ? actor.collectConsumable() : []
                try {
                    for (const [target, d] of this.hitsOf(actor, detail, targets)) {
                        const fua = actor.applyEffect(target, d, effectName, actor, targets[0])
                        if (fua) additionalAct[fua] = { caster: actor, triggerTarget: target }
                    }
                } finally { actor.effectTurnPriority = undefined }
                actor.consumeCollected(consumable)
            }
        })
        actor.getMpFromType(effectName)
        return additionalAct
    }
}
