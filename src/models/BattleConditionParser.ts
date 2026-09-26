import battleConditionSetsJson from '../assets/base_data/getBattleConditionSetMstList.json';
import battleConditionsJson from '../assets/base_data/getBattleConditionMstList.json';
import { BattleState, PassiveSkill, SkillDetail } from '../types/KiokuTypes';
import { KiokuState, PvPTeam, isAlimentEffect } from './PvPTeam';
import { KiokuRole, elementMap, roleMap } from '../types/enums';

/**
 * BattleConditionParser.ts
 * =========================
 * REWRITE grounded in the actual decompiled condition-checking classes, which were not
 * available when this file was first written. Specifically:
 *
 *   - ReDriveBattleCore.BattleCondition.BattleConditionUtils.Condition$$IsMatchCondition
 *     - the real DISPATCHER. It switches on CompareTarget and constructs one of three
 *       checker objects depending on the value, each of which only understands its own
 *       subset of CompareContent values. The original version of this file had ONE
 *       big if-chain that didn't distinguish CompareTarget at all (every condition was
 *       checked against whatever `target`/`actor` happened to be passed in) - that's the
 *       main reason conditions were "triggering at the wrong time" / not at all.
 *   - ReDriveBattleCore.BattleCondition.BattleUnitConditionChecker$$Check - per-unit
 *     conditions (CompareContent 1-25, 101-110).
 *   - ReDriveBattleCore.BattleCondition.BattleUnitTeamConditionChecker$$Check -
 *     team-wide conditions (CompareContent 201-210, 301-309).
 *   - ReDriveBattleCore.BattleCondition.BattleOtherConditionChecker$$Check - the
 *     remaining two (401 ACTOR_SKILL_TYPE, 402 COMBO_ACTION_STEP).
 *   - ReDriveBattleCore.BattleCondition.{Int,Float,Bool,AbilityEffectList}ValueComparer
 *     $$Compare - the exact per-type comparison semantics for each CompareOperator.
 *
 * CONFIDENCE: every case below is annotated [CONFIRMED] (read directly, unambiguous -
 * these are plain int/bool comparisons and field reads, none of the System.Decimal
 * operand-order ambiguity that plagued DamageCalculator.ts), [RECONSTRUCTED] (shape is
 * clear, some supporting piece like a lambda predicate's exact body wasn't traced), or
 * [NOT IMPLEMENTED] (recognized as a real CompareContent the source handles, but this
 * port doesn't have the underlying data/mechanic to evaluate it yet - falls through to
 * `false`, matching the source's own default-case behavior for content it doesn't
 * handle in a given checker).
 *
 * See MISSING_AND_UNCERTAIN.md for the consolidated list of open items.
 */

interface BattleCondition {
    battleConditionMstId: number
    compareContent: number
    compareOperator: number
    compareTarget: number
    compareValue: string
    description: string
}

const battleConditions = Object.fromEntries(
    battleConditionsJson.map((item: any) => [item.battleConditionMstId, item])
) as Record<string, BattleCondition>;

interface BattleConditionSet {
    battleConditionMstIdCsv: string
    battleConditionSetMstId: number
    description: string
}

const battleConditionSets = Object.fromEntries(
    battleConditionSetsJson.map((item: any) => [item.battleConditionSetMstId, item])
) as Record<string, BattleConditionSet>;


export enum ProcessTiming {
    NONE = 0,
    BATTLE_START = 1,
    WAVE_START = 2,
    TURN_START = 3,
    ATTACK_START = 4,
    ATTACK_END = 5,
    TURN_END = 6,
    WAVE_END = 7,
    BATTLE_END = 8,
    AFTER_PROCESS = 9,
}

export const isTimingActive = (startTiming: ProcessTiming, eff: PassiveSkill) => {
    if (!eff.startTimingIdCsv || eff.startTimingIdCsv === "0") {
        console.error("Unknown start timing", eff)
        return false
    }
    for (const startTimingId of eff.startTimingIdCsv.split(",")) {
        if (startTiming === Number(startTimingId)) return true
    }
    return false
}

enum CompareContent {
    NONE = 0,
    HP = 1,
    HP_RATIO = 2,
    ATK = 3,
    DEF = 4,
    SPD = 5,
    EP = 6,
    TURN = 7,
    IS_ACTOR = 8,
    IS_MAIN_TARGET = 9,
    IS_FRIEND = 10,
    IS_OPPONENT = 11,
    ABILITY_EFFECT = 12,
    EVERY_N_TURN = 13,
    CHARACTER = 14,
    HP_GAUGE_COUNT = 15,
    IS_BREAK = 16,
    CHARGE_POINT = 17,
    CAN_NOT_ACTION = 18,
    IS_ELEMENT_TYPE = 19,
    IS_ROLE_TYPE = 20,
    BREAK_DAMAGE_RECEIVE_RATE = 21,
    IS_MAX_BREAK_DAMAGE_RECEIVE_RATE = 22,
    ABNORMAL_STATE_COUNT = 23,
    BUFF_COUNT = 24,
    DEBUFF_COUNT = 25,
    HAS_BUFF = 26,
    UNIQUE_DEBUFF_COUNT = 27,
    SELF_IS_KIOKU = 28,
    FIELD_IS_UP = 29,
    BREAK_COUNT = 30,
    CHAIN_LVL = 31, // 3.19 dump.cs: CompareContent.UniqueAbilityEffectLv

    DMG = 101,
    DMG_RATIO = 102,
    IS_KILLED = 103,
    IS_RECOVERY = 104,
    IS_BARRIER_ADDED = 105,
    IS_BARRIER_ATTACKED = 106,
    IS_BARRIER_DESTROYED = 107,
    BREAK_DAMAGE_RECEIVE_RATE_BECOME_MAX = 108,
    IS_WEAK_ELEMENT_ATTACKED = 109,
    IS_DURING_ATTACK = 110,
    WHEN_DOT_IS_TRIGGERED = 111,
    HAS_ALIMENT = 112,
    FIELD_START = 113,
    FIELD_END = 114,
    HAS_DEBUFF_EFFECT_VALUE = 116, // 3.19 dump.cs: AddRemovableDebuffCount

    SP = 201,
    ALIVE_UNIT_COUNT = 202,
    DEAD_UNIT_COUNT = 203,
    APPLIED_SKILL_EFFECT_TYPE = 204,
    ABILITY_EFFECT_UNIT_COUNT = 205,
    BREAK_DAMAGE_RECEIVE_RATE_GREATER_THAN_UNIT_COUNT = 206,
    BREAK_DAMAGE_RECEIVE_RATE_LESS_THAN_UNIT_COUNT = 207,
    NR_OF_DEBUFFS = 208,
    SIGILS_APPLIED_COUNT = 209,
    OTHER_BUFF_COUNT = 210,

    KILLED_UNIT_COUNT = 301,
    BREAK_UNIT_COUNT = 302,
    CTD_UNIT_COUNT = 303,
    TOTAL_DAMAGE = 304,
    ABILITY_EFFECT_AND_DAMAGE = 305,
    BREAK_UNIT_TOTAL_COUNT = 306,
    WEAK_ELEMENT_ATTACKED_UNIT_COUNT = 307,
    BREAK_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT = 308,
    HAS_BUFF_APPLIED = 309,
    ONGOING_DAMAGE = 310,

    DMG_TAKEN = 313,
    BROKEN_UNITS_ATTACKED = 314,
    WITH_DEBUFF_EFFECT_VALUE = 316, // 3.19 dump.cs: AddRemovableDebuffTotalCount

    ACTOR_SKILL_TYPE = 401,
    COMBO_ACTION_STEP = 402,

    PLAYER_TEAM = 1001,

    AWAKEN = 1101,

    CALAMITY_COUNTER = 1201,
    CALAMITY_COUNTER_END = 1202,

    BATTLE_FIRST_ACTION = 2001,
    WAVE_FIRST_ACTION = 2002,
}

enum CompareOperator {
    NONE = 0,
    EQUAL = 1,
    NOT_EQUAL = 2,
    GREATER = 3,
    GREATER_OR_EQUAL = 4,
    LESS = 5,
    LESS_OR_EQUAL = 6,
    CONTAIN = 7,
    NOT_CONTAIN = 8,
}

enum CompareTarget {
    NONE = 0,
    SELF = 1,
    ACTOR = 2,
    MAIN_TARGET = 3,
    EACH_TARGET = 8,
    ALL_TARGETS = 4,
    FRIEND_TEAM = 5,
    OPPONENT_TEAM = 6,
    OTHERS = 7,
}

Object.values(battleConditions).forEach(c => {
    if (!(c.compareContent in CompareContent)) {
        console.error("Unknown CompareContent", c)
    }
    if (!(c.compareOperator in CompareOperator)) {
        console.error("Unknown compareOperator", c)
    }
    if (!(c.compareTarget in CompareTarget)) {
        console.error("Unknown compareTarget", c)
    }
})

// ---------------------------------------------------------------------------
// Value comparators
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleCondition.{Int,Float}ValueComparer$$Compare - both
// identical in shape: EQUAL/NOT_EQUAL/GREATER(rightValue<leftValue)/
// GREATER_OR_EQUAL(rightValue<=leftValue)/LESS(leftValue<rightValue)/
// LESS_OR_EQUAL(leftValue<=rightValue); CONTAIN/NOT_CONTAIN/default all fall through to
// `false`. rightValue is `Convert.ToInt32/Single(compareValue)` - i.e. the condition's
// raw CompareValue string parsed as a plain number, NOT split on commas here (some
// specific CompareContent cases parse it themselves beforehand, e.g. EVERY_N_TURN).
// UniqueUnitStateBase subclasses (UnitStateFactory).
const UNIQUE_STATE_TYPES = new Set(["UNIQUE_BUFF", "UNIQUE_DEBUFF", "UNIQUE_BUFF_ACCUM", "UNIQUE_DEBUFF_ACCUM",
    "UNIQUE_ELEMENT_STACK", "UNIQUE_ELEMENT_BREAK", "UNIQUE_ZONE", "UNIQUE_ENEMY_639002"])

function compareInt(op: CompareOperator, leftValue: number, compareValueStr: string): boolean {
    const rightValue = Number(compareValueStr);
    switch (op) {
        case CompareOperator.EQUAL: return leftValue === rightValue;
        case CompareOperator.NOT_EQUAL: return leftValue !== rightValue;
        case CompareOperator.GREATER: return rightValue < leftValue;
        case CompareOperator.GREATER_OR_EQUAL: return rightValue <= leftValue;
        case CompareOperator.LESS: return leftValue < rightValue;
        case CompareOperator.LESS_OR_EQUAL: return leftValue <= rightValue;
        default: return false;
    }
}
const compareFloat = compareInt; // [CONFIRMED] identical shape in the decompiled source

// [CONFIRMED] ReDriveBattleCore.BattleCondition.BoolValueComparer$$Compare - ONLY
// EQUAL/NOT_EQUAL are implemented; every other operator (including GREATER/LESS, which
// wouldn't make sense for a bool) returns false. rightValue is
// `compareValue == "TRUE"` (case-sensitive exact match).
function compareBool(op: CompareOperator, leftValue: boolean, compareValueStr: string): boolean {
    const rightValue = compareValueStr === "TRUE";
    if (op === CompareOperator.EQUAL) return leftValue === rightValue;
    if (op === CompareOperator.NOT_EQUAL) return leftValue !== rightValue;
    return false;
}

// [CONFIRMED] ReDriveBattleCore.BattleCondition.AbilityEffectListComparer$$Compare (+
// its two lambda predicates b__1_0/b__1_1): CONTAIN = leftValue.Any(x =>
// x.StartsWith(rightValue)); NOT_CONTAIN = negation. rightValue is the RAW CompareValue
// string, NOT comma-split - this is a single prefix to match against every string in
// the list, e.g. compareValue="POISON" matches "POISON_ATK"/"POISON_DEF"/"POISON_HP" all
// at once via prefix, not an exact-membership check. The ORIGINAL version of this file
// used `valueToCompareTo.includes(cond.compareValue)` (exact-element Array.includes),
// which is NOT equivalent to this StartsWith-based semantics - fixed below.
function compareAbilityEffectList(op: CompareOperator, leftValues: string[], compareValueStr: string): boolean {
    const anyStartsWith = leftValues.some(v => v.startsWith(compareValueStr));
    if (op === CompareOperator.CONTAIN) return anyStartsWith;
    if (op === CompareOperator.NOT_CONTAIN) return !anyStartsWith;
    return false;
}

// ---------------------------------------------------------------------------
// Score-attack helpers - UNCHANGED from the original file (not part of this rewrite;
// these are ScoreAttackTeam.ts's own simplified condition pre-filtering, a different
// code path from the live-battle PvP one below).
// ---------------------------------------------------------------------------
const isCondActive = (cond: BattleCondition, valueToCompareTo: any): boolean => {
    if (typeof valueToCompareTo === "boolean") valueToCompareTo = valueToCompareTo ? "TRUE" : "FALSE"
    if (cond.compareOperator === CompareOperator.EQUAL) {
        return valueToCompareTo == cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.NOT_EQUAL) {
        return valueToCompareTo != cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.GREATER) {
        return valueToCompareTo > cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.GREATER_OR_EQUAL) {
        return valueToCompareTo >= cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.LESS) {
        return valueToCompareTo < cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.LESS_OR_EQUAL) {
        return valueToCompareTo <= cond.compareValue
    }
    if (cond.compareOperator === CompareOperator.CONTAIN) {
        return valueToCompareTo.includes(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.NOT_CONTAIN) {
        return !valueToCompareTo.includes(cond.compareValue)
    }
    return true;
}

const lateGetIsActiveCond = (cond: BattleCondition) =>
    (amountOfEnemies: number, maxBreak: number) =>
        cond.compareContent === CompareContent.ALIVE_UNIT_COUNT
            ? isCondActive(cond, amountOfEnemies)
            : isCondActive(cond, maxBreak)

export const getDescriptionOfCond = (battleConditionSetId: string): string => battleConditionSets[battleConditionSetId].description

const logged = {}
export const isStartCondRelevantForScoreAttack = (
    startConditionId: string,
    maxMagicStacks: number,
    nrOfEnemies: number,
    attackerRole: KiokuRole,
): boolean => {
    if (!startConditionId || startConditionId === "0") return true

    const battleConditionSet = battleConditionSets[startConditionId]
    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]
        if (!(activeCondId in logged)) {
            logged[activeCondId] = true
        }

        if (battleCondition.compareContent === CompareContent.CHARGE_POINT) {
            if (!isCondActive(battleCondition, maxMagicStacks)) return false
        }

        if (battleCondition.compareContent === CompareContent.ALIVE_UNIT_COUNT) {
            if (!isCondActive(battleCondition, nrOfEnemies)) return false
        }

        if (battleCondition.compareContent === CompareContent.UNIQUE_DEBUFF_COUNT) {
            if (battleCondition.battleConditionMstId === 1468) return true // Akumura
            return false
        }

        if (battleCondition.compareContent === CompareContent.IS_ROLE_TYPE) {
            if (!isCondActive(battleCondition, attackerRole)) return false
        }
    }
    return true;
}

export const isActiveConditionRelevantForScoreAttack = (activeConditionSetId: string, attackerHealth: number, activeAliments: string[], maxMagicStacks: number): boolean | Function => {
    if (!activeConditionSetId || activeConditionSetId === "0") return true

    const battleConditionSet = battleConditionSets[activeConditionSetId]

    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]

        if (battleCondition.compareContent === CompareContent.CHARGE_POINT) {
            if (!isCondActive(battleCondition, maxMagicStacks)) return false
        }

        if (battleCondition.compareContent === CompareContent.ACTOR_SKILL_TYPE &&
            ["NormalAttack", "ActiveSkill", "EtherBlow"].includes(battleCondition.compareValue)) return false

        if (battleCondition.compareValue === "AdditionalSkill" &&
            battleCondition.compareOperator === CompareOperator.EQUAL) {
            return false
        }
        if (battleCondition.compareContent === CompareContent.ALIVE_UNIT_COUNT) {
            // NOTE: This is incorrect as it breaks the loop, but unlikely that it actually matters ever
            return lateGetIsActiveCond(battleCondition)
        }
        if (battleCondition.compareContent === CompareContent.ABILITY_EFFECT) {
            if (!isCondActive(battleCondition, activeAliments)) return false
        }
        if (battleCondition.compareContent === CompareContent.BREAK_DAMAGE_RECEIVE_RATE) {
            return lateGetIsActiveCond(battleCondition)
        }
        if (battleCondition.compareContent === CompareContent.HP_RATIO) {
            if (!isCondActive(battleCondition, attackerHealth)) return false
        }

        if (battleCondition.compareContent === CompareContent.CHAIN_LVL) {
            if (battleCondition.battleConditionMstId === 2093) return true // WDoka
            return false
        }

        if (battleCondition.compareContent === CompareContent.UNIQUE_DEBUFF_COUNT) {
            if (battleCondition.battleConditionMstId === 1382) return true // XKyouko
            return false
        }
    }
    return true
}

export const conditionSetRequiresActorIsSelf = (eff: SkillDetail) =>
    eff.startConditionSetIdCsv.length && eff.startConditionSetIdCsv.split(",").some(conditionSetId => {
        if (!conditionSetId.length || conditionSetId === "0") return true
        const battleConditionSet = battleConditionSets[conditionSetId]
        return battleConditionSet.battleConditionMstIdCsv.split(",").some(condId => condId === "3")
    })

// ---------------------------------------------------------------------------
// Per-unit conditions (CompareContent 1-25, 101-110)
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleCondition.BattleUnitConditionChecker$$Check.
// `battleUnit` is whichever unit CompareTarget resolved to (see isMatchCondition's
// dispatcher below) - NOT necessarily `state.target` the way the original file assumed.
function checkUnitCondition(battleUnit: KiokuState, cond: BattleCondition, state: BattleState): boolean {
    const notice = battleUnit.lastNotice;
    switch (cond.compareContent as CompareContent) {
        case CompareContent.HP:
            return compareInt(cond.compareOperator, battleUnit.currentHp, cond.compareValue);
        case CompareContent.HP_RATIO:
            // [CONFIRMED] BattleUnit.CalculationHpRate() = HP*100/MaxHP, computed live
            // (not the old `currentHpPercent` field, which nothing ever wrote to before
            // real HP tracking existed).
            return compareFloat(cond.compareOperator, (battleUnit.currentHp * 100) / battleUnit.maxHp, cond.compareValue);
        case CompareContent.ATK:
            return compareFloat(cond.compareOperator, battleUnit.kioku.getBaseAtk(), cond.compareValue);
        case CompareContent.DEF:
            return compareFloat(cond.compareOperator, battleUnit.kioku.getBaseDef(), cond.compareValue);
        case CompareContent.SPD:
            return compareFloat(cond.compareOperator, battleUnit.currentSpd, cond.compareValue);
        case CompareContent.EP:
            return compareInt(cond.compareOperator, battleUnit.currentMp, cond.compareValue);
        case CompareContent.TURN:
            // [RECONSTRUCTED] "TurnNum" - the source's own turn counter on BattleUnit.
            // This port doesn't track a per-unit "how many turns have I taken" counter
            // anywhere - approximated as 0 (i.e. this condition will only match
            // `TURN == 0`-style checks correctly). Flagged - see MISSING_AND_UNCERTAIN.md.
            return compareInt(cond.compareOperator, 0, cond.compareValue);
        case CompareContent.IS_ACTOR:
            // [CONFIRMED shape, RECONSTRUCTED wiring] leftValue = (trueActorUnit != null
            // && trueActorUnit.Id == battleUnit.Id). This needs `state.trueActorUnit` -
            // the unit that ACTUALLY performed the current action - which the ORIGINAL
            // file never threaded through at all (it compared team labels instead,
            // which is a different and incorrect proxy). See PvPTeam.ts's
            // trueActorUnit/applyEffect wiring.
            return compareBool(cond.compareOperator, !!state.trueActorUnit && state.trueActorUnit === battleUnit, cond.compareValue);
        case CompareContent.IS_MAIN_TARGET:
            return compareBool(cond.compareOperator, !!state.mainTargetUnit && state.mainTargetUnit === battleUnit, cond.compareValue);
        case CompareContent.IS_FRIEND:
            return compareBool(cond.compareOperator, state.actorTeam.kiokuStates.includes(battleUnit), cond.compareValue);
        case CompareContent.IS_OPPONENT:
            return compareBool(cond.compareOperator, state.enemyTeam.kiokuStates.includes(battleUnit), cond.compareValue);
        case CompareContent.ABILITY_EFFECT: {
            // [CONFIRMED] AbilityEffectListComparer over the unit's active EffectType
            // list, prefix-matched (see compareAbilityEffectList above) - NOT the plain
            // Array.includes the original file used.
            const types = [...battleUnit.activeEffectDetails.values()].map(d => d.abilityEffectType);
            return compareAbilityEffectList(cond.compareOperator, types, cond.compareValue);
        }
        case CompareContent.EVERY_N_TURN: {
            // [CONFIRMED] CompareValue parsed as "N" or "N,offset" (offset defaults to
            // 1). True iff TurnNum >= offset AND (TurnNum - offset) % N == 0. Uses the
            // same approximated TurnNum=0 as CompareContent.TURN above - flagged.
            const parts = cond.compareValue.split(",");
            const n = Math.max(1, Number(parts[0]));
            const offset = parts.length > 1 && !Number.isNaN(Number(parts[1])) ? Number(parts[1]) : 1;
            const turnNum = 0; // see CompareContent.TURN note above
            if (turnNum < offset) return false;
            return (turnNum - offset) % n === 0;
        }
        case CompareContent.CHARACTER:
            return compareInt(cond.compareOperator, battleUnit.kioku.data.id, cond.compareValue);
        case CompareContent.HP_GAUGE_COUNT:
            // [NOT IMPLEMENTED] multi-HP-gauge PvE boss mechanic, not applicable to 1v1 PvP.
            return false;
        case CompareContent.IS_BREAK:
            return compareBool(cond.compareOperator, battleUnit.isBroken, cond.compareValue);
        case CompareContent.CHARGE_POINT:
            return compareInt(cond.compareOperator, battleUnit.currentMagic, cond.compareValue);
        case CompareContent.CAN_NOT_ACTION:
            // [RECONSTRUCTED] see KiokuState.canNotAction's own header comment for what
            // is and isn't confirmed here (the field's existence and read site are
            // confirmed; the exact source set-site and turn-consumption mechanics are not).
            return compareBool(cond.compareOperator, battleUnit.canNotAction, cond.compareValue);
        case CompareContent.IS_ELEMENT_TYPE:
            // [CONFIRMED] BattleUnit.IsMatch(element): true iff the unit is a character
            // AND its element equals the parsed CompareValue. Per the decompiled
            // source, the comparison is ALWAYS "must equal true" regardless of
            // compareOperator (EQUAL/NOT_EQUAL are not consulted for this content type)
            // - implemented that way here rather than routed through compareBool.
            // `kioku.data.element` is a KiokuElement STRING enum in this codebase
            // (confirmed via the real KiokuTypes.ts), while CompareValue is the game's
            // numeric element id - mapped through `elementMap` (also confirmed real)
            // before comparing.
            return elementMap[cond.compareValue] === battleUnit.kioku.data.element;
        case CompareContent.IS_ROLE_TYPE:
            return roleMap[cond.compareValue] === battleUnit.kioku.data.role;
        case CompareContent.BREAK_DAMAGE_RECEIVE_RATE: {
            const rate = battleUnit.breakedDamageReceiveRate;
            return compareFloat(cond.compareOperator, rate, cond.compareValue);
        }
        case CompareContent.IS_MAX_BREAK_DAMAGE_RECEIVE_RATE: {
            // [NOT IMPLEMENTED] needs MaxBreakedDamageReceiveRate, a per-unit stat not
            // present in any provided data file.
            return false;
        }
        case CompareContent.ABNORMAL_STATE_COUNT: {
            const count = [...battleUnit.activeEffectDetails.values()].filter(d => isAlimentEffect(d.abilityEffectType)).length;
            return compareInt(cond.compareOperator, count, cond.compareValue);
        }
        case CompareContent.BUFF_COUNT:
            return compareInt(cond.compareOperator, battleUnit.currentBuffs().length, cond.compareValue);
        case CompareContent.DEBUFF_COUNT:
            // [CONFIRMED] the source's b__8_3 predicate excludes Aliment-type states
            // from DEBUFF_COUNT (they're counted separately under
            // ABNORMAL_STATE_COUNT) - battleUnit.currentDebuffs() already does this.
            return compareInt(cond.compareOperator, battleUnit.currentDebuffs().length, cond.compareValue);
        case CompareContent.HAS_BUFF: {
            // [CONFIRMED 3.19] BattleUnitConditionChecker$$Check case 0x1a: the unit's
            // UniqueUnitStateBase states -> UniqueStatePatternMstId (value1) list, compared with
            // IntListComparer (7 CONTAIN / 8 NOT_CONTAIN). E.g. 2791 "Fuka's unique buff
            // (Abyssal Rose, 18) is applied". (The old note said the 1.5.0 checker had no case.)
            const ids = [...battleUnit.passiveEffectDetails.values(), ...battleUnit.activeEffectDetails.values()]
                .filter(d => UNIQUE_STATE_TYPES.has(d.abilityEffectType))
                .map(d => d.value1)
            const v = Number(cond.compareValue)
            if (cond.compareOperator === CompareOperator.CONTAIN) return ids.includes(v)
            if (cond.compareOperator === CompareOperator.NOT_CONTAIN) return !ids.includes(v)
            return ids.some(id => compareInt(cond.compareOperator, id, cond.compareValue))
        }
        case CompareContent.UNIQUE_DEBUFF_COUNT:
        case CompareContent.SELF_IS_KIOKU:
        case CompareContent.FIELD_IS_UP:
        case CompareContent.BREAK_COUNT:
            // [NOT IMPLEMENTED] Not present in BattleUnitConditionChecker.Check's own
            // switch either (they fall to its default case, which returns false) - so
            // this matches the source's OWN behavior for these specific values, not
            // just a port gap.
            return false;
        case CompareContent.DMG:
            if (!notice || notice.isReceivedReflection) return compareInt(cond.compareOperator, 0, cond.compareValue);
            return compareInt(cond.compareOperator, notice.totalDamageValue, cond.compareValue);
        case CompareContent.DMG_RATIO: {
            if (!notice || notice.isReceivedReflection) return compareFloat(cond.compareOperator, 0, cond.compareValue);
            return compareFloat(cond.compareOperator, (notice.totalDamageValue * 100) / battleUnit.maxHp, cond.compareValue);
        }
        case CompareContent.IS_KILLED:
            return compareBool(cond.compareOperator, !!notice && notice.totalDamageValue >= 1 && notice.isDead, cond.compareValue);
        case CompareContent.IS_RECOVERY:
            return compareBool(cond.compareOperator, !!notice && notice.isReceivedRecovery, cond.compareValue);
        case CompareContent.IS_BARRIER_ADDED:
            return compareBool(cond.compareOperator, !!notice && notice.isBarrierAdded, cond.compareValue);
        case CompareContent.IS_BARRIER_ATTACKED:
            return compareBool(cond.compareOperator, !!notice && notice.isBarrierAttacked, cond.compareValue);
        case CompareContent.IS_BARRIER_DESTROYED:
            return compareBool(cond.compareOperator, !!notice && notice.isBarrierDestroyed, cond.compareValue);
        case CompareContent.BREAK_DAMAGE_RECEIVE_RATE_BECOME_MAX:
            return compareBool(cond.compareOperator, !!notice && notice.isBreakedDamageReceiveRateBecomeMax, cond.compareValue);
        case CompareContent.IS_WEAK_ELEMENT_ATTACKED:
            return compareBool(cond.compareOperator, !!notice && notice.isWeakElementAttacked, cond.compareValue);
        case CompareContent.IS_DURING_ATTACK:
            return compareBool(cond.compareOperator, !!notice && notice.isReceivedAttack, cond.compareValue);
        default:
            // WHEN_DOT_IS_TRIGGERED(111)/HAS_ALIMENT(112)/FIELD_START(113)/FIELD_END(114)
            // and anything else not covered above - [NOT IMPLEMENTED], matches the
            // source's own default-case `false` for content this checker doesn't
            // handle.
            return false;
    }
}

// ---------------------------------------------------------------------------
// Team-wide conditions (CompareContent 201-210, 301-309)
// ---------------------------------------------------------------------------
// [CONFIRMED / RECONSTRUCTED per-case, see comments]
// ReDriveBattleCore.BattleCondition.BattleUnitTeamConditionChecker$$Check.
function checkTeamCondition(team: PvPTeam, cond: BattleCondition): boolean {
    const units = team.kiokuStates;
    switch (cond.compareContent as CompareContent) {
        case CompareContent.SP:
            return compareInt(cond.compareOperator, team.currentSp, cond.compareValue);
        case CompareContent.ALIVE_UNIT_COUNT:
            return compareInt(cond.compareOperator, units.filter(u => !u.isDead).length, cond.compareValue);
        case CompareContent.DEAD_UNIT_COUNT:
            return compareInt(cond.compareOperator, units.filter(u => u.isDead).length, cond.compareValue);
        case CompareContent.APPLIED_SKILL_EFFECT_TYPE:
            // [RECONSTRUCTED scope] "this action" per PvPTeam.performAction's reset -
            // see its header comment for why (not independently confirmed whether the
            // source's set is action-scoped or battle-cumulative).
            return compareAbilityEffectList(cond.compareOperator, [...team.appliedSkillEffectTypesThisAction], cond.compareValue);
        case CompareContent.ABILITY_EFFECT_UNIT_COUNT: {
            // [CONFIRMED shape] CompareValue = "effectTypePrefix,threshold?" - counts
            // units with an active effect type starting with that prefix (matching the
            // ABILITY_EFFECT per-unit case's prefix semantics), compared against the
            // SECOND CompareValue token (not the condition's own compareValue as a
            // whole) via IntValueComparer.
            const [prefix, threshold] = cond.compareValue.split(",");
            const count = units.filter(u => [...u.activeEffectDetails.values()].some(d => d.abilityEffectType.startsWith(prefix))).length;
            return compareInt(cond.compareOperator, count, threshold ?? "0");
        }
        case CompareContent.BREAK_DAMAGE_RECEIVE_RATE_GREATER_THAN_UNIT_COUNT:
        case CompareContent.BREAK_DAMAGE_RECEIVE_RATE_LESS_THAN_UNIT_COUNT:
            // [NOT IMPLEMENTED] needs a per-unit BreakedDamageReceiveRate stat not
            // present in any provided data file.
            return false;
        case CompareContent.NR_OF_DEBUFFS:
            // [CONFIRMED shape] sum of debuff counts across every unit on this team
            // (not just a unit COUNT the way BUFF_COUNT/DEBUFF_COUNT are per-unit).
            return compareInt(cond.compareOperator, units.reduce((sum, u) => sum + u.currentDebuffs().length, 0), cond.compareValue);
        case CompareContent.SIGILS_APPLIED_COUNT:
        case CompareContent.OTHER_BUFF_COUNT:
            // [NOT IMPLEMENTED] not present in BattleUnitTeamConditionChecker.Check's
            // own switch either - matches the source's default-false for these.
            return false;
        case CompareContent.KILLED_UNIT_COUNT:
            return compareInt(cond.compareOperator, team.lastActionNotices.filter(n => n.isDead).length, cond.compareValue);
        case CompareContent.BREAK_UNIT_COUNT:
            // [RECONSTRUCTED] units that broke as a RESULT of the last action -
            // approximated as "currently broken" rather than "newly broken this
            // action" (the source's notice-based predicate likely distinguishes these;
            // not independently confirmed which).
            // [CONFIRMED 3.19] BattleUnitTeamConditionChecker case 0x12e: Count(notices where
            // BreakDamageInfo != null) - units broken BY this skill, not "currently broken" (that
            // reading kept e.g. Concentrated Missile Fire's follow-up re-triggering forever).
            return compareInt(cond.compareOperator, team.lastActionNotices.filter(n => n.isBreak).length, cond.compareValue);
        case CompareContent.CTD_UNIT_COUNT:
            return compareInt(cond.compareOperator, team.lastActionNotices.filter(n => n.isCritical).length, cond.compareValue);
        case CompareContent.TOTAL_DAMAGE:
            return compareInt(cond.compareOperator, team.lastActionNotices.reduce((sum, n) => sum + n.totalDamageValue, 0), cond.compareValue);
        case CompareContent.ABILITY_EFFECT_AND_DAMAGE: {
            // [RECONSTRUCTED] CompareValue = "effectTypePrefix,damageThreshold" - true
            // iff ANY unit both has that effect type active AND its lastNotice damage
            // meets the threshold.
            const [prefix, threshold] = cond.compareValue.split(",");
            const any = units.some(u =>
                [...u.activeEffectDetails.values()].some(d => d.abilityEffectType.startsWith(prefix)) &&
                (u.lastNotice?.totalDamageValue ?? 0) >= Number(threshold ?? "0"));
            return compareBool(cond.compareOperator, any, "TRUE");
        }
        case CompareContent.BREAK_UNIT_TOTAL_COUNT:
            // [CONFIRMED] cumulative across the whole battle - see
            // KiokuState.resolveBreak()'s `team.breakedUnitTotalCount++`.
            return compareInt(cond.compareOperator, team.breakedUnitTotalCount, cond.compareValue);
        case CompareContent.WEAK_ELEMENT_ATTACKED_UNIT_COUNT:
            return compareInt(cond.compareOperator, team.lastActionNotices.filter(n => n.isWeakElementAttacked).length, cond.compareValue);
        case CompareContent.BREAK_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT:
            return compareInt(cond.compareOperator, team.lastActionNotices.filter(n => n.isBreakedDamageReceiveRateBecomeMax).length, cond.compareValue);
        case CompareContent.HAS_BUFF_APPLIED: {
            const [prefix, threshold] = cond.compareValue.split(",");
            const count = units.filter(u => [...u.activeEffectDetails.values()].some(d => d.abilityEffectType.startsWith(prefix))).length;
            return compareInt(cond.compareOperator, count, threshold ?? "0");
        }
        case CompareContent.ONGOING_DAMAGE:
        case CompareContent.DMG_TAKEN:
        case CompareContent.BROKEN_UNITS_ATTACKED:
            // [NOT IMPLEMENTED] not present in BattleUnitTeamConditionChecker.Check's
            // own switch either - matches source default-false.
            return false;
        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// "Other" conditions (CompareContent 401, 402)
// ---------------------------------------------------------------------------
// [CONFIRMED / NOT IMPLEMENTED per-case]
// ReDriveBattleCore.BattleCondition.BattleOtherConditionChecker$$Check.
function checkOtherCondition(state: BattleState, cond: BattleCondition): boolean {
    switch (cond.compareContent as CompareContent) {
        case CompareContent.ACTOR_SKILL_TYPE: {
            // [CONFIRMED, simplified] The source maps the current action to a
            // SkillType enum (NormalAttack=3/ActiveSkill=1/SpecialAttack=2/
            // AdditionalSkill=4) and compares against CompareValue parsed as that same
            // enum, via IntValueComparer. This codebase's TargetType enum already uses
            // the IDENTICAL strings as its values ("NormalAttack"/"ActiveSkill"/
            // "SpecialAttack"/"AdditionalSkill" - see KiokuTypes.ts), so a direct string
            // EQUAL/NOT_EQUAL compare gives the same result without needing the
            // enum-int roundtrip. GREATER/LESS wouldn't have a sensible string
            // equivalent and fall through to false.
            if (!state.actionType) return false;
            if (cond.compareOperator === CompareOperator.EQUAL) return state.actionType === (cond.compareValue as any);
            if (cond.compareOperator === CompareOperator.NOT_EQUAL) return state.actionType !== (cond.compareValue as any);
            return false;
        }
        case CompareContent.COMBO_ACTION_STEP:
            // [CONFIRMED, NEWLY IMPLEMENTED] ReDriveBattleCore.Act.ComboTurnUnitAct$$
            // get_ActionStep/set_ActionStep - a 1-indexed "which action of the current
            // combo burst" counter, confirmed via ActReferee$$AddComboUnitTurnActs's own
            // loop (`for (actionStep = 1; actionStep <= actionNum; actionStep++)`). See
            // KiokuState.currentComboActionStep (0 = not currently in a combo burst - a
            // plain single action uses a different Act class with no such property at
            // all, not "step 1"). Unrelated to TSUBAME_* (a separate, still-unimplemented
            // character-specific mechanic - see MISSING_AND_UNCERTAIN.md's B5).
            return compareInt(cond.compareOperator, state.trueActorUnit?.currentComboActionStep ?? 0, cond.compareValue);
        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.BattleCondition.BattleConditionUtils.Condition
// $$IsMatchCondition - switches on CompareTarget to decide WHICH checker to consult and,
// for per-unit checks, WHICH unit ("battleUnit") to check it against. This is the
// central piece the original file was missing entirely - every condition used to be
// checked against whatever `target`/`actor` the call site happened to pass in,
// regardless of what CompareTarget actually specified.
//
// State naming vs. this codebase's existing convention: `state.actor` here means "the
// unit that owns the passive/effect being checked" (matches this codebase's established
// use of `actor` in KiokuState.stateGen calls, e.g. `this.stateGen(this, target)`),
// which is what CompareTarget.SELF resolves to. `state.trueActorUnit` is the C#
// `actorUnit` - whoever REALLY performed the current action - now threaded through
// separately (see PvPTeam.ts). `state.target` is "the specific unit currently under
// consideration" (matches CompareTarget.EACH_TARGET most directly).
function isMatchCondition(cond: BattleCondition, state: BattleState): boolean {
    const { actor, target, actorTeam, enemyTeam, trueActorUnit, mainTargetUnit } = state;
    switch (cond.compareTarget as CompareTarget) {
        case CompareTarget.SELF:
            return checkUnitCondition(actor, cond, state);
        case CompareTarget.ACTOR:
            // [CONFIRMED shape] Falls back to `actor` if trueActorUnit wasn't threaded
            // through for this particular call site (better than silently returning
            // false) - see MISSING_AND_UNCERTAIN.md for which call sites do/don't pass
            // it yet.
            return checkUnitCondition(trueActorUnit ?? actor, cond, state);
        case CompareTarget.MAIN_TARGET:
            return checkUnitCondition(mainTargetUnit ?? target, cond, state);
        case CompareTarget.EACH_TARGET:
            return checkUnitCondition(target, cond, state);
        case CompareTarget.FRIEND_TEAM:
            return checkTeamCondition(actorTeam, cond);
        case CompareTarget.OPPONENT_TEAM:
            return checkTeamCondition(enemyTeam, cond);
        case CompareTarget.ALL_TARGETS: {
            // [RECONSTRUCTED] The source picks friend-team-vs-opponent-team data based
            // on whether mainTargetUnit shares actor's team. Approximated using
            // `target`'s team when mainTargetUnit isn't available.
            const referenceUnit = mainTargetUnit ?? target;
            const sameTeamAsSelf = actorTeam.kiokuStates.includes(referenceUnit);
            return checkTeamCondition(sameTeamAsSelf ? actorTeam : enemyTeam, cond);
        }
        case CompareTarget.OTHERS:
            return checkOtherCondition(state, cond);
        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// Public entry points (same names/signatures as before, so PvPTeam.ts and PvPKioku.ts
// don't need to change how they call into this file - only the internals changed).
// ---------------------------------------------------------------------------
export const isConditionSetActive = (eff: SkillDetail, state: BattleState) =>
    isConditionSetActiveForPvP(eff.activeConditionSetIdCsv.split(","), state)
    && isConditionSetActiveForPvP(eff.startConditionSetIdCsv.split(","), state)

// State activity (UnitStateBase.IsActive): the active condition set only.
export const isActiveConditionSetMet = (eff: SkillDetail, state: BattleState) =>
    isConditionSetActiveForPvP((eff.activeConditionSetIdCsv ?? "").split(","), state)

export const isConditionSetActiveForPvP = (conditionSetIdCsvList: string[], state: BattleState): boolean =>
    conditionSetIdCsvList.every(conditionSetIdCsv => conditionSetIdCsv.split(",").every(conditionSetId => {
        if (!conditionSetId.length || conditionSetId === "0") return true

        const battleConditionSet = battleConditionSets[conditionSetId]
        for (const conditionId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
            const battleCondition = battleConditions[conditionId]
            if (!isMatchCondition(battleCondition, state)) return false
        }
        return true
    }))
