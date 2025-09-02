import battleConditionSetsJson from '../assets/base_data/getBattleConditionSetMstList.json';
import battleConditionsJson from '../assets/base_data/getBattleConditionMstList.json';

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


enum ProcessTiming {
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
    BREAKED_DAMAGE_RECEIVE_RATE = 21,
    IS_MAX_BREAKED_DAMAGE_RECEIVE_RATE = 22,
    ABNORMAL_STATE_COUNT = 23,
    BUFF_COUNT = 24,
    DEBUFF_COUNT = 25,
    DMG = 101,
    DMG_RATIO = 102,
    IS_KILLED = 103,
    IS_RECOVERY = 104,
    IS_BARRIER_ADDED = 105,
    IS_BARRIER_ATTACKED = 106,
    IS_BARRIER_DESTROYED = 107,
    BREAKED_DAMAGE_RECEIVE_RATE_BECOME_MAX = 108,
    IS_WEAK_ELEMENT_ATTACKED = 109,
    SP = 201,
    ALIVE_UNIT_COUNT = 202,
    DEAD_UNIT_COUNT = 203,
    APPLIED_SKILL_EFFECT_TYPE = 204,
    ABILITY_EFFECT_UNIT_COUNT = 205,
    BREAKED_DAMAGE_RECEIVE_RATE_GREATER_THAN_UNIT_COUNT = 206,
    BREAKED_DAMAGE_RECEIVE_RATE_LESS_THAN_UNIT_COUNT = 207,
    KILLED_UNIT_COUNT = 301,
    BREAKED_UNIT_COUNT = 302,
    CTD_UNIT_COUNT = 303,
    TOTAL_DAMAGE = 304,
    ABILITY_EFFECT_AND_DAMAGE = 305,
    BREAKED_UNIT_TOTAL_COUNT = 306,
    WEAK_ELEMENT_ATTACKED_UNIT_COUNT = 307,
    BREAKED_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT = 308,
    ACTOR_SKILL_TYPE = 401,
    COMBO_ACTION_STEP = 402,

    // New
    NR_OF_DEBUFFS = 208,
    HAS_BUFF_APPLIED = 309,
    IS_DURING_ATTACK = 110,
    WHEN_DOT_IS_PROCCED = 111,
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

const hardcodedKnownNotActive = [
    // Asuka atk+ on low HP, ignore high HP bonuses
    "1562",
    "1563"
]

const isCondActive = (cond: BattleCondition, valueToCompareTo: string | number): boolean => {
    if (cond.compareOperator === CompareOperator.EQUAL) {
        return Number(valueToCompareTo) === Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.NOT_EQUAL) {
        return Number(valueToCompareTo) !== Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.GREATER) {
        return Number(valueToCompareTo) > Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.GREATER_OR_EQUAL) {
        return Number(valueToCompareTo) >= Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.LESS) {
        return Number(valueToCompareTo) < Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.LESS_OR_EQUAL) {
        return Number(valueToCompareTo) <= Number(cond.compareValue)
    }
    if (cond.compareOperator === CompareOperator.CONTAIN) {
        return cond.compareValue.includes(valueToCompareTo.toString())
    }
    if (cond.compareOperator === CompareOperator.NOT_CONTAIN) {
        return !cond.compareValue.includes(valueToCompareTo.toString())
    }
    return true;
}

const lateGetIsActiveCond = (cond: BattleCondition) =>
    (amountOfEnemies: number, maxBreak: number) =>
        cond.compareContent === CompareContent.ALIVE_UNIT_COUNT
            ? isCondActive(cond, amountOfEnemies)
            : isCondActive(cond, maxBreak)

export const getDescriptionOfCond = (battleConditionSetId: string): string => battleConditionSets[battleConditionSetId].description

export const isStartCondRelevantForScoreAttack = (startConditionId: string, maxMagicStacks: number): boolean => {
    if (!startConditionId || startConditionId === "0") return true

    const battleConditionSet = battleConditionSets[startConditionId]
    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]

        if (battleCondition.compareContent === CompareContent.CHARGE_POINT) {
            if (!isCondActive(battleCondition, maxMagicStacks)) return false
        }
    }
    return true;
}

export const isActiveConditionRelevantForScoreAttack = (activeConditionSetId: string): boolean | Function => {
    if (!activeConditionSetId || activeConditionSetId === "0") return true

    const battleConditionSet = battleConditionSets[activeConditionSetId]
    if (hardcodedKnownNotActive.includes(activeConditionSetId)) return false


    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]
        if (battleCondition.compareContent === CompareContent.ACTOR_SKILL_TYPE &&
            ["NormalAttack", "ActiveSkill"].includes(battleCondition.compareValue)) return false

        if (battleCondition.compareValue === "AdditionalSkill" &&
            battleCondition.compareOperator === CompareOperator.EQUAL) {
            return false
        }
        if (battleCondition.compareContent === CompareContent.ALIVE_UNIT_COUNT) {
            // NOTE: This is incorrect as it breaks the loop, but unlikely that it actually matters ever
            return lateGetIsActiveCond(battleCondition)
        }
        if (battleCondition.compareContent === CompareContent.BREAKED_DAMAGE_RECEIVE_RATE) {
            return lateGetIsActiveCond(battleCondition)
        }
    }
    return true
}

export const isStartCondRelevantForPvPState = (startConditionId: string, currentMagicStacks: number): boolean => {
    if (!startConditionId || startConditionId === "0") return true

    const battleConditionSet = battleConditionSets[startConditionId]
    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]

        if (battleCondition.compareContent === CompareContent.CHARGE_POINT) {
            if (!isCondActive(battleCondition, currentMagicStacks)) return false
        }

        console.warn("Unknown start condition", battleConditionSet)
    }
    return false;
}

export const isActiveConditionRelevantForPvPState = (activeConditionSetId: string): boolean => {
    if (!activeConditionSetId || activeConditionSetId === "0") return true

    const battleConditionSet = battleConditionSets[activeConditionSetId]
    for (const activeCondId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
        const battleCondition = battleConditions[activeCondId]
        if (battleCondition.compareContent === CompareContent.HP_RATIO) {
            return isCondActive(battleCondition, 100)
        }
        if (battleCondition.compareContent === CompareContent.ALIVE_UNIT_COUNT) {
            return isCondActive(battleCondition, 5)
        }

        console.warn("Unknown active condition", battleCondition)
    }
    return false
}
