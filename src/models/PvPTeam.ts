import { Kioku } from "./Kioku";
import { KiokuRole, SkillDetail } from "../types/KiokuTypes";
import { isStartCondRelevantForPvPState, isActiveConditionRelevantForPvPState, isTiming, ProcessTiming } from "./BattleConditionParser";
import { getIdx } from "../utils/helpers";

export interface ActionResult {
    break: number
    range: number
}

class KiokuState {
    kioku: Kioku
    passiveEffects: SkillDetail[] = []
    activeEffects: [number, number][] = []
    currentHp = 100
    breakGauge = 0
    currentAv = 0
    currentSpd = 0

    constructor(kioku: Kioku) {
        this.kioku = kioku
    }

    init() {
        this.breakGauge = this.maxBreak()
        this.currentSpd = this.calculateSpd()
        this.currentAv = this.calculateStartAv()
    }

    calculateMaxAv(): number {
        return (10000 / this.currentSpd) | 0
    }

    reduceAv(avDelta: number) {
        this.currentAv -= avDelta
    }

    calculateStartAv(): number {
        let haste = 0
        for (const detail of this.passiveEffects) {
            if (detail.abilityEffectType === "HASTE") {
                if (!(isTiming([ProcessTiming.BATTLE_START], detail?.startTimingIdCsv))) continue
                if (detail.startConditionSetIdCsv.length && detail.startConditionSetIdCsv != "0") continue
                if (!detail.activeConditionSetIdCsv.split(",").every(condId => isActiveConditionRelevantForPvPState(condId))) continue
                haste += detail.value1 / 1000
            }
        }
        return this.calculateMaxAv() * Math.max(0, 1 - haste) | 0
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
        return spd | 0
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

    reduceAv(avDelta: number): void {
        this.kiokuStates.forEach(k => k.reduceAv(avDelta))
    }

    getMinAv(): number {
        return Math.min(...Object.values(this.getTeamAvs()))
    }

    getTeamSpeeds(): Record<string, number> {
        return this.kiokuStates.reduce((s, k) => ({ ...s, [k.kioku.name]: k.calculateSpd() }), {})
    }

    getTeamAvs(): Record<string, number> {
        return this.kiokuStates.reduce((s, k) => ({ ...s, [k.kioku.name]: k.currentAv }), {})
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
        // TODO: Select worst? Random? Distribution?
        return this.kiokuStates[0]
    }

    getReadyToAct(): ((k: KiokuState) => ActionResult)[] {
        return this.kiokuStates.filter(k => k.av === 0).map(k => (t: KiokuState) => this.act(k.kioku, k))
    }

    act(kioku: Kioku, target: KiokuState): ActionResult {
        let effectId;
        if (this.currentSp) {
            this.currentSp--
            effectId = kioku.data.skill_id
        } else {
            this.currentSp++
            effectId = kioku.data.attack_id
        }

        for (const detail of kioku.effects[effectId]) {
            console.log(detail)
            // TODO Do something
        }
        return 0
    }
}
