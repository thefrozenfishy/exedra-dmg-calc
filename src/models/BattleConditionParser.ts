import battleConditionSetsJson from '../assets/base_data/getBattleConditionSetMstList.json';
import battleConditionsJson from '../assets/base_data/getBattleConditionMstList.json';
import { BattleState, PassiveSkill, SkillDetail } from '../types/KiokuTypes';
import { KiokuState } from './PvPTeam';

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
    BREAKED_DAMAGE_RECEIVE_RATE = 21,
    IS_MAX_BREAKED_DAMAGE_RECEIVE_RATE = 22,
    ABNORMAL_STATE_COUNT = 23,
    BUFF_COUNT = 24,
    DEBUFF_COUNT = 25,
    HAS_BUFF = 26,
    X_KYOUKO_DEBUFF_COUNT = 27,
    SELF_IS_KIOKU = 28,
    DMG = 101,
    DMG_RATIO = 102,
    IS_KILLED = 103,
    IS_RECOVERY = 104,
    IS_BARRIER_ADDED = 105,
    IS_BARRIER_ATTACKED = 106,
    IS_BARRIER_DESTROYED = 107,
    BREAKED_DAMAGE_RECEIVE_RATE_BECOME_MAX = 108,
    IS_WEAK_ELEMENT_ATTACKED = 109,
    IS_DURING_ATTACK = 110,
    WHEN_DOT_IS_PROCCED = 111,
    HAS_ALIMENT = 112,
    SP = 201,
    ALIVE_UNIT_COUNT = 202,
    DEAD_UNIT_COUNT = 203,
    APPLIED_SKILL_EFFECT_TYPE = 204,
    ABILITY_EFFECT_UNIT_COUNT = 205,
    BREAKED_DAMAGE_RECEIVE_RATE_GREATER_THAN_UNIT_COUNT = 206,
    BREAKED_DAMAGE_RECEIVE_RATE_LESS_THAN_UNIT_COUNT = 207,
    NR_OF_DEBUFFS = 208,
    SIGILS_APPLIED_COUNT = 209,
    OTHER_BUFF_COUNT = 210,
    KILLED_UNIT_COUNT = 301,
    BREAKED_UNIT_COUNT = 302,
    CTD_UNIT_COUNT = 303,
    TOTAL_DAMAGE = 304,
    ABILITY_EFFECT_AND_DAMAGE = 305,
    BREAKED_UNIT_TOTAL_COUNT = 306,
    WEAK_ELEMENT_ATTACKED_UNIT_COUNT = 307,
    BREAKED_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT = 308,
    HAS_BUFxF_APPLIED = 309,
    ONGOING_DAMAGE = 310,
    ACTOR_SKILL_TYPE = 401,
    COMBO_ACTION_STEP = 402,
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

export const isActiveConditionRelevantForScoreAttack = (activeConditionSetId: string, attackerHealth: number, activeAliments: string[]): boolean | Function => {
    if (!activeConditionSetId || activeConditionSetId === "0") return true

    const battleConditionSet = battleConditionSets[activeConditionSetId]

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
        if (battleCondition.compareContent === CompareContent.ABILITY_EFFECT) {
            if (!isCondActive(battleCondition, activeAliments)) return false
        }
        if (battleCondition.compareContent === CompareContent.BREAKED_DAMAGE_RECEIVE_RATE) {
            return lateGetIsActiveCond(battleCondition)
        }
        if (battleCondition.compareContent === CompareContent.HP_RATIO) {
            if (!isCondActive(battleCondition, attackerHealth)) return false
        }

        if (battleCondition.compareContent === CompareContent.X_KYOUKO_DEBUFF_COUNT) {
            if (!isCondActive(battleCondition, "5,10")) return false
        }
    }
    return true
}


const targetsToCompareTo = (compareTarget: CompareTarget, state: BattleState): KiokuState[] => {
    if (compareTarget === CompareTarget.SELF) return [state.actor]
    if (compareTarget === CompareTarget.ACTOR) return [state.actor]
    if (compareTarget === CompareTarget.MAIN_TARGET) return [state.target]
    if (compareTarget === CompareTarget.ALL_TARGETS) return [state.target]
    if (compareTarget === CompareTarget.FRIEND_TEAM) return state.actorTeam.kiokuStates
    if (compareTarget === CompareTarget.OPPONENT_TEAM) return state.enemyTeam.kiokuStates
    return [state.actor]
}

export const conditionSetRequiresActorIsSelf = (eff: SkillDetail) =>
    eff.startConditionSetIdCsv.length && eff.startConditionSetIdCsv.split(",").some(conditionSetId => {
        if (!conditionSetId.length || conditionSetId === "0") return true
        const battleConditionSet = battleConditionSets[conditionSetId]
        return battleConditionSet.battleConditionMstIdCsv.split(",").some(condId => condId === "3")
    })

export const isConditionSetActive = (eff: SkillDetail, state: BattleState) =>
    isConditionSetActiveForPvP(eff.activeConditionSetIdCsv.split(","), state)
    && isConditionSetActiveForPvP(eff.startConditionSetIdCsv.split(","), state)

export const isConditionSetActiveForPvP = (conditionSetIdCsvList: string[], {
    actorTeam,
    enemyTeam,
    actor,
    target,
    actionType
}: BattleState): boolean =>
    conditionSetIdCsvList.every(conditionSetIdCsv => conditionSetIdCsv.split(",").every(conditionSetId => {
        if (!conditionSetId.length || conditionSetId === "0") return true

        const battleConditionSet = battleConditionSets[conditionSetId]
        for (const conditionId of battleConditionSet.battleConditionMstIdCsv.split(",")) {
            const battleCondition = battleConditions[conditionId]

            const compTargets = targetsToCompareTo(battleCondition.compareTarget, {
                actorTeam,
                enemyTeam,
                actor,
                target,
                actionType
            })

            if (battleCondition.compareContent === CompareContent.HP_RATIO) {
                if (!isCondActive(battleCondition, actor.currentHpPercent)) return false
            } else if (battleCondition.compareContent === CompareContent.IS_ACTOR) {
                if (!isCondActive(battleCondition, target.teamLabel !== actor.teamLabel ? true : actor === target)) return false
            } else if (battleCondition.compareContent === CompareContent.ALIVE_UNIT_COUNT) {
                if (!isCondActive(battleCondition, enemyTeam.kiokuStates.length)) return false
            } else if (battleCondition.compareContent === CompareContent.BREAKED_UNIT_COUNT) {
                if (!isCondActive(battleCondition, enemyTeam.kiokuStates.filter(k => k.currentRemainingBreakGauge <= 0 && !k.isBroken).length)) return false
            } else if (battleCondition.compareContent === CompareContent.CHARGE_POINT) {
                if (!isCondActive(battleCondition, actor.currentMagic)) return false
            } else if (battleCondition.compareContent === CompareContent.IS_FRIEND) {
                if (!isCondActive(battleCondition, target.teamLabel === actor.teamLabel)) return false
            } else if (battleCondition.compareContent === CompareContent.ACTOR_SKILL_TYPE) {
                if (!actionType || !isCondActive(battleCondition, actionType)) return false
            } else if (battleCondition.compareContent === CompareContent.ABILITY_EFFECT) {
                if (!Object.values(target.activeEffectDetails).some(e => isCondActive(battleCondition, e.abilityEffectType))) return false
            } else if (battleCondition.compareContent === CompareContent.BUFF_COUNT) {
                if (!isCondActive(battleCondition, compTargets.reduce((acc, k) => acc + k.currentBuffs().length, 0))) return false
            } else if (battleCondition.compareContent === CompareContent.DEBUFF_COUNT) {
                if (!isCondActive(battleCondition, compTargets.reduce((acc, k) => acc + k.currentDebuffs().length, 0))) return false
            } else if (battleCondition.compareContent === CompareContent.NR_OF_DEBUFFS) {
                if (!isCondActive(battleCondition, compTargets.reduce((acc, k) => acc + k.currentDebuffs().length, 0))) return false
            } else if (battleCondition.compareContent === CompareContent.BREAKED_DAMAGE_RECEIVE_RATE_BECOME_MAX_UNIT_COUNT) {// TODO
                if (!isCondActive(battleCondition, 0)) return false // TODO fix
            } else if (battleCondition.compareContent === CompareContent.TOTAL_DAMAGE) {
                if (!isCondActive(battleCondition, 1000)) return false // TODO fix
            } else {
                console.warn(`Unknown condition ${battleCondition.compareContent}`, battleCondition)
            }
        }
        return true
    }))
