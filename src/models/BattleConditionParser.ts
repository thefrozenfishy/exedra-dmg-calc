import battleConditionSetsJson from '../assets/base_data/getBattleConditionSetMstList.json';
import battleConditionsJson from '../assets/base_data/getBattleConditionMstList.json';
import { Ailment, KiokuElement, KiokuRole, elementMap, roleMap } from '../types/enums';

// Battle condition master data (BattleConditionMst / BattleConditionSetMst) read WITHOUT a running battle: condition
// descriptions, the old single-hit model's pre-filtering (ScoreAttackTeam), and the static questions Max Damage and the
// Kioku Grid bench ask of a condition csv (which skill types, elements / roles, ailments, unit counts it needs). Live
// battles evaluate conditions in the 1:1 engine (src/engine, BattleConditionUtils).

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
    IS_CONSUME_HP = 117, // 3.21.0 IsConsumeHp: evaluated by src/engine only (the old engine has no HP cost, false here)

    SP = 201,
    ALIVE_UNIT_COUNT = 202,
    DEAD_UNIT_COUNT = 203,
    APPLIED_SKILL_EFFECT_TYPE = 204,
    ABILITY_EFFECT_UNIT_COUNT = 205,
    BREAK_DAMAGE_RECEIVE_RATE_GREATER_THAN_UNIT_COUNT = 206,
    BREAK_DAMAGE_RECEIVE_RATE_LESS_THAN_UNIT_COUNT = 207,
    NR_OF_DEBUFFS = 208,
    SIGILS_APPLIED_COUNT = 209,
    OTHER_BUFF_COUNT = 210,        // 3.19: units of the team holding a unique state of pattern pid ("pid,n")
    UNIQUE_ACCUM_TEAM_TOTAL = 211, // 3.19: sum of AccumCount of unique accum states of pattern pid ("pid,n")
    BREAK_COUNT_IN_GROUP = 212,    // 3.19 dump.cs: BreakCountInGroup (sum of the living units' BreakCount)

    KILLED_UNIT_COUNT = 301,
    BREAK_UNIT_COUNT = 302,
    CTD_UNIT_COUNT = 303,
    TOTAL_DAMAGE = 304,
    ABILITY_EFFECT_AND_DAMAGE = 305,
    BREAK_UNIT_TOTAL_COUNT = 306,
    WEAK_ELEMENT_ATTACKED_UNIT_COUNT = 307,
    BREAK_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT = 308,
    HAS_BUFF_APPLIED = 309,
    ONGOING_DAMAGE = 310,          // 3.19 dump.cs: SlipDamageTotalCount

    HIT_UNIT_COUNT = 313,          // 3.19 dump.cs: HitUnitCount (was DMG_TAKEN)
    IN_BREAK_AND_RECEIVED_ATTACK_UNIT_COUNT = 314, // 3.19 dump.cs (was BROKEN_UNITS_ATTACKED)
    ADD_REMOVABLE_BUFF_TOTAL_COUNT = 315,   // 3.19 dump.cs: AddRemovableBuffTotalCount
    ADD_REMOVABLE_DEBUFF_TOTAL_COUNT = 316, // 3.19 dump.cs: AddRemovableDebuffTotalCount (was WITH_DEBUFF_EFFECT_VALUE)

    ACTOR_SKILL_TYPE = 401,
    COMBO_ACTION_STEP = 402,
    ACTOR_DAMAGE_RANGE = 403,      // 3.19 dump.cs: ActorDamageRange (RangeType name of the running damage effect)
    // [CONFIRMED 3.19] BattleOtherConditionChecker.Check 0x4b1/0x4b2 (Solo Raid countdown)
    COUNTDOWN = 1201,              // IntValueComparer over CountdownReferee.Countdown
    COUNTDOWN_CANCEL_REACHED = 1202, // CancelMaxTotalDamage > 0 && CancelMaxTotalDamage <= CancelTotalDamage

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

// [CONFIRMED] ReDriveBattleCore.BattleCondition.BoolValueComparer$$Compare - ONLY
// EQUAL/NOT_EQUAL are implemented; every other operator (including GREATER/LESS, which
// wouldn't make sense for a bool) returns false. rightValue is
// `compareValue == "TRUE"` (case-sensitive exact match).

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

// The skill types (CompareContent 401 names) for which an activeConditionSetIdCsv can hold when every OTHER condition
// is assumed met; undefined = no skill-type restriction. Sets are OR'd, conditions in a set AND'd (as above). Used by
// MaxDamage, which assumes conditions met but must not give e.g. a "special attack only" crit buff to a Battle Skill.
export const ACTOR_SKILL_TYPE_NAMES = ["NormalAttack", "ActiveSkill", "SpecialAttack", "AdditionalSkill", "EtherBlow"] as const
export function actorSkillTypeRestriction(activeConditionSetIdCsv: string | undefined): Set<string> | undefined {
    const ids = (activeConditionSetIdCsv ?? "").split(",").filter(id => id.length && id !== "0")
    if (!ids.length) return undefined
    const allowed = new Set<string>()
    for (const id of ids) {
        const set = battleConditionSets[id]
        if (!set) continue // an unknown set never matches (IsMatchConditionSets)
        let types: string[] = [...ACTOR_SKILL_TYPE_NAMES]
        let restricted = false
        for (const condId of set.battleConditionMstIdCsv.split(",")) {
            const c = battleConditions[condId]
            if (!c || c.compareContent !== CompareContent.ACTOR_SKILL_TYPE) continue
            restricted = true
            types = types.filter(t => c.compareOperator === CompareOperator.EQUAL ? t === c.compareValue
                : c.compareOperator === CompareOperator.NOT_EQUAL ? t !== c.compareValue : false)
        }
        if (!restricted) return undefined
        types.forEach(t => allowed.add(t))
    }
    return allowed
}

// [CONFIRMED data] IS_ELEMENT_TYPE / IS_ROLE_TYPE CompareValues in getBattleConditionMstList.json are enum NAMES:
// "Fire" "Aqua" "Forest" "Light" "Dark" "Neutral" and "Attacker" "Breaker" ... (never ids). Ids are still accepted.
const CONDITION_ELEMENTS: Record<string, KiokuElement> = {
    Fire: KiokuElement.Flame, Aqua: KiokuElement.Aqua, Forest: KiokuElement.Forest,
    Light: KiokuElement.Light, Dark: KiokuElement.Dark, Neutral: KiokuElement.Void,
}
function conditionElement(value: string): KiokuElement | undefined {
    return CONDITION_ELEMENTS[value] ?? elementMap[value]
}
function conditionRole(value: string): KiokuRole | undefined {
    return (Object.values(KiokuRole) as string[]).includes(value) ? value as KiokuRole : roleMap[value]
}

// Elements / roles that IS_ELEMENT_TYPE / IS_ROLE_TYPE conditions in these condition-set csvs compare a unit
// against (whichever unit they check). Used to find which element/role a kit's effects depend on.
export function unitTypeConditionValues(csvs: (string | undefined)[]): { elements: string[], roles: string[] } {
    const elements = new Set<string>(), roles = new Set<string>()
    for (const setId of csvs.flatMap(csv => (csv ?? "").split(","))) {
        for (const condId of (battleConditionSets[setId]?.battleConditionMstIdCsv ?? "").split(",")) {
            const cond = battleConditions[condId]
            // Only "is X" (Equal) rows restrict a kit to X; "is not X" (NotEqual) rows don't.
            if (cond?.compareOperator !== CompareOperator.EQUAL) continue
            const element = cond.compareContent === CompareContent.IS_ELEMENT_TYPE ? conditionElement(cond.compareValue) : undefined
            const role = cond.compareContent === CompareContent.IS_ROLE_TYPE ? conditionRole(cond.compareValue) : undefined
            if (element) elements.add(element)
            if (role) roles.add(role)
        }
    }
    return { elements: [...elements], roles: [...roles] }
}

// Ailments (Ailment enum values: BURN, CURSE, ..., BLEED) that ABILITY_EFFECT conditions in these condition-set csvs
// test for ("contains CURSE", "not contains BURN_ATK", ...), on whichever unit. Used to find a kit's ailment-dependent
// effects.
/** Whether any of these condition sets reacts to crits: CompareContent 303 CTDUnitCount ("a critical hit happened"). */
export function critConditionUsed(csvs: (string | undefined)[]): boolean {
    for (const setId of csvs.flatMap(csv => (csv ?? "").split(","))) {
        for (const condId of (battleConditionSets[setId]?.battleConditionMstIdCsv ?? "").split(",")) {
            if (battleConditions[condId]?.compareContent === 303) return true
        }
    }
    return false
}

export function ailmentConditionValues(csvs: (string | undefined)[]): Ailment[] {
    const found = new Set<Ailment>()
    for (const setId of csvs.flatMap(csv => (csv ?? "").split(","))) {
        for (const condId of (battleConditionSets[setId]?.battleConditionMstIdCsv ?? "").split(",")) {
            const cond = battleConditions[condId]
            const a = ailmentConditionType(cond)
            if (a) found.add(a)
        }
    }
    return [...found]
}

const ailmentOf = (stateType: string): Ailment | undefined =>
    (Object.values(Ailment) as string[]).find(a => stateType === a || stateType.startsWith(a + "_")) as Ailment | undefined

// The ailment a condition is about, if any. Every compare content whose value names a state type:
//   12  AbilityEffect ("has state X")
//   112 ReceivedSlipDamageType ("took X slip damage", compareValue "X") [CONFIRMED 3.19] BattleUnitConditionChecker.Check
//   205 AbilityEffectUnitCount ("N units with state X", "X,N" - Atomo Arrabbiato's "when a poisoned enemy is present")
//   305 AbilityEffectAndDamage ("dealt >= N DMG to a unit with state X", "X,N" - Sacred Gift's "+5 MP on DMG dealt to
//       weakened enemies") [CONFIRMED 3.19] BattleUnitTeamConditionChecker.Check
//   309 AbilityEffectAndReceivedAttackUnitCount ("N attacked units with state X", "X,N") [CONFIRMED 3.19]
//       BattleUnitTeamConditionChecker.Check
// 305 / 309 / 112 used to be missed, so those kits got no ailment bar on the Kioku Grid charts.
function ailmentConditionType(cond: BattleCondition | undefined): Ailment | undefined {
    switch (cond?.compareContent) {
        case CompareContent.ABILITY_EFFECT:
        case CompareContent.HAS_ALIMENT: // 112 ReceivedSlipDamageType
            return ailmentOf(cond.compareValue)
        case CompareContent.ABILITY_EFFECT_UNIT_COUNT:
        case CompareContent.ABILITY_EFFECT_AND_DAMAGE:
        case CompareContent.HAS_BUFF_APPLIED: // 309 AbilityEffectAndReceivedAttackUnitCount
            return ailmentOf(cond.compareValue.split(",")[0])
    }
    return undefined
}

// [APPROXIMATION] Max Damage assumes conditions are met; this keeps only the ailment checks among them: an ABILITY_EFFECT
// condition about an ailment is evaluated against `stateTypes` (the state types the enemies carry), whichever unit it
// names, and every other condition counts as met. Each csv's sets are OR'd, conditions in a set AND'd, as in
// BattleConditionUtils.IsMatchConditionSets (0x17e30b0).
// `enemyCount`: how many units carry `stateTypes` (all enemies), for the unit-count conditions (205).
export function ailmentConditionsMet(csvs: (string | undefined)[], stateTypes: string[], enemyCount = 1): boolean {
    return csvs.every(csv => {
        const ids = (csv ?? "").split(",").filter(id => id.length && id !== "0")
        if (!ids.length) return true
        return ids.some(setId => (battleConditionSets[setId]?.battleConditionMstIdCsv ?? "").split(",").every(condId => {
            const cond = battleConditions[condId]
            if (!ailmentConditionType(cond)) return true
            if (cond.compareContent === CompareContent.ABILITY_EFFECT_UNIT_COUNT || cond.compareContent === CompareContent.HAS_BUFF_APPLIED) {
                // 309 counts only the attacked units carrying it: [APPROXIMATION] every enemy, as for 205
                const [prefix, threshold] = cond.compareValue.split(",")
                return compareInt(cond.compareOperator, stateTypes.some(t => t.startsWith(prefix.trim())) ? enemyCount : 0, (threshold ?? "0").trim())
            }
            // 305: the operator compares the damage dealt to such a unit, which counts as met like every other condition;
            // only whether an enemy carries the state is checked
            if (cond.compareContent === CompareContent.ABILITY_EFFECT_AND_DAMAGE) {
                const prefix = cond.compareValue.split(",")[0] // not trimmed in the game
                return stateTypes.some(t => t.startsWith(prefix))
            }
            return compareAbilityEffectList(cond.compareOperator, stateTypes, cond.compareValue)
        }))
    })
}

// Max Damage: the wave's unit counts are known, so they are not assumed. Evaluates only the team alive-unit-count
// conditions (202 AliveUnitCount on FriendTeam / OpponentTeam) against the given counts; every other condition counts as
// met. `friendCount` / `opponentCount` are from the point of view of the bundle the csv is checked in (the caster's for
// start conditions, the holder's for active conditions). Each csv's sets are OR'd, conditions in a set AND'd.
// E.g. Oracle Ray: "DMG dealt +15% while >= 2 / 3 / 4 / 5 enemies" (sets 330, 439-441) and her skills' extra hits
// "while < 5 / 4 / 3 / 2 enemies" (sets 528, 527, 526, 525) never count together.
export function unitCountConditionsMet(csvs: (string | undefined)[], friendCount: number, opponentCount: number): boolean {
    return csvs.every(csv => {
        const ids = (csv ?? "").split(",").filter(id => id.length && id !== "0")
        if (!ids.length) return true
        return ids.some(setId => (battleConditionSets[setId]?.battleConditionMstIdCsv ?? "").split(",").every(condId => {
            const cond = battleConditions[condId]
            if (cond?.compareContent !== CompareContent.ALIVE_UNIT_COUNT) return true
            if (cond.compareTarget === CompareTarget.FRIEND_TEAM) return compareInt(cond.compareOperator, friendCount, cond.compareValue)
            if (cond.compareTarget === CompareTarget.OPPONENT_TEAM) return compareInt(cond.compareOperator, opponentCount, cond.compareValue)
            return true
        }))
    })
}
