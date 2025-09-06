import { Kioku } from "./Kioku";
import { KiokuRole, PassiveSkill, SkillDetail, spdDistance } from "../types/KiokuTypes";
import { isStartCondRelevantForPvPState, isActiveConditionRelevantForPvPState, isTiming, ProcessTiming } from "./BattleConditionParser";
import { getIdx } from "../utils/helpers";

export interface ActionResult {
    break: number
    range: number
}

const aggro = {
    [KiokuRole.Defender]: 15,
    [KiokuRole.Buffer]: 10,
    [KiokuRole.Debuffer]: 10,
    [KiokuRole.Healer]: 10,
    [KiokuRole.Attacker]: 5,
    [KiokuRole.Breaker]: 5,
}

class KiokuState {
    kioku: Kioku
    passiveEffects: SkillDetail[] = []
    activeEffects: [number, number][] = []
    currentHp = 100
    breakGauge: number
    aggro: number
    distanceRemaining = spdDistance
    currentSpd = 0

    constructor(kioku: Kioku) {
        this.kioku = kioku
        this.breakGauge = this.maxBreak()
        this.aggro = aggro[kioku.role]
    }

    init() {
        this.currentSpd = this.calculateSpd()
        this.resetDistanceRemaining()
        this.applyStartHaste()
    }


    reduceDistance(distanceDelta: number): void {
        this.distanceRemaining -= distanceDelta
    }

    resetDistanceRemaining(): void {
        this.distanceRemaining = spdDistance / this.currentSpd
    }

    applyStartHaste(): void {
        let haste = 0
        for (const detail of this.passiveEffects) {
            if (detail.abilityEffectType === "HASTE") {
                if (!(isTiming([ProcessTiming.BATTLE_START], (detail as PassiveSkill)?.startTimingIdCsv))) continue
                if (detail.startConditionSetIdCsv.length && detail.startConditionSetIdCsv != "0") continue
                if (!detail.activeConditionSetIdCsv.split(",").every(condId => isActiveConditionRelevantForPvPState(condId))) continue
                haste += detail.value1 / 1000
            }
        }
        console.log(this.kioku.name, this.distanceRemaining, haste, this.currentSpd)
        this.distanceRemaining *= (1 - Math.min(1, haste))
    }

    calculateSpd(): number {
        let spd = this.kioku.baseSpd
        for (const detail of this.passiveEffects) {
            if (detail.abilityEffectType === "UP_SPD_RATIO") {
                if (detail.startConditionSetIdCsv.length && detail.startConditionSetIdCsv != "0") continue
                if (!detail.activeConditionSetIdCsv.split(",").every(condId => isActiveConditionRelevantForPvPState(condId))) continue
                spd += (this.kioku.baseSpd * detail.value1 / 1000)
            }
            if (detail.abilityEffectType === "UP_SPD_FIXED") {
                if (detail.startConditionSetIdCsv.length && detail.startConditionSetIdCsv != "0") continue
                if (!detail.activeConditionSetIdCsv.split(",").every(condId => isActiveConditionRelevantForPvPState(condId))) continue
                spd += detail.value1
            }
        }
        return spd
    }

    maxBreak(): number {
        switch (this.kioku.role) {
            case KiokuRole.Defender:
                return this.kioku.data.rarity === 5 ? 195 : 162
            case KiokuRole.Attacker:
            case KiokuRole.Breaker:
                return this.kioku.data.rarity === 5 ? 150 : 125
            case KiokuRole.Buffer:
            case KiokuRole.Debuffer:
                return this.kioku.data.rarity === 5 ? 165 : 137
            case KiokuRole.Healer:
                return this.kioku.data.rarity === 5 ? 180 : 150
        }
    }
}


export class PvPTeam {
    private kiokuStates: KiokuState[];
    private debug: boolean;
    private teamLabel: string
    private currentSp = 5

    constructor(kiokus: Kioku[], teamLabel: string, debug = false) {
        this.kiokuStates = kiokus.map(k => new KiokuState(k))
        this.debug = debug;
        this.teamLabel = teamLabel;
        this.setup()
        this.kiokuStates.forEach(k => k.init())
    }

    reduceDistance(distanceDelta: number): void {
        this.kiokuStates.forEach(k => k.reduceDistance(distanceDelta))
    }

    getNextDistance(): number {
        return Math.min(...Object.values(this.getTeamDistanceRemaining()))
    }

    getTeamBaseSpeeds(): Record<string, number> {
        return this.kiokuStates.reduce((s, k) => ({ ...s, [k.kioku.name]: k.kioku.baseSpd }), {})
    }

    getTeamSpeeds(): Record<string, number> {
        return this.kiokuStates.reduce((s, k) => ({ ...s, [k.kioku.name]: k.calculateSpd() }), {})
    }

    getTeamDistanceRemaining(): Record<string, number> {
        return this.kiokuStates.reduce((s, k) => ({ ...s, [k.kioku.name]: k.distanceRemaining }), {})
    }

    setup() {
        for (const kiokuState of this.kiokuStates) {
            for (const skill_id of [0, 1, 2, 3, kiokuState.kioku.data.ability_id, kiokuState.kioku.data.crystalis_id]) {
                if (skill_id in kiokuState.kioku.effects) {
                    for (const detail of kiokuState.kioku.effects[skill_id]) {
                        if (skill_id > 10 && !getIdx(detail).toString().startsWith(skill_id.toString())) continue // "Fua etc are not actually passives"
                        if (detail.range === -1) {
                            kiokuState.passiveEffects.push(detail)
                        } else {
                            for (const otherKiokuState of this.kiokuStates) {
                                otherKiokuState.passiveEffects.push(detail)
                            }
                        }
                    }
                }
            }
        }
    }

    getTarget(): KiokuState {
        // TODO: Select worst? Random? Distribution? all?
        return this.kiokuStates[0]
    }

    getNextActor(): KiokuState {
        return this.kiokuStates.filter(k => k.distanceRemaining === 0)[0]
    }

    act(): SkillDetail[] {
        const actor = this.getNextActor()
        let effectId;
        if (this.currentSp) {
            this.currentSp--
            effectId = actor.kioku.data.skill_id
        } else {
            this.currentSp++
            effectId = actor.kioku.data.attack_id
        }

        return actor.kioku.effects[effectId]
    }
}
