import { Kioku } from "./Kioku";
import { KiokuRole, PassiveSkill, SkillDetail, spdDistance } from "../types/KiokuTypes";
import { isStartCondRelevantForPvPState, isActiveConditionRelevantForPvPState, isTiming, ProcessTiming } from "./BattleConditionParser";
import { getIdx } from "../utils/helpers";

const aggro = {
    [KiokuRole.Defender]: 15,
    [KiokuRole.Buffer]: 10,
    [KiokuRole.Debuffer]: 10,
    [KiokuRole.Healer]: 10,
    [KiokuRole.Attacker]: 5,
    [KiokuRole.Breaker]: 5,
}

const defaultbreak = {
    "special_id": { 1: 35, 2: 30, 3: 25 },
    "skill_id": { 1: 20, 2: 15, 3: 12 },
    "attack_id": { 1: 10 },
}

export class KiokuState {
    kioku: Kioku
    passiveEffects: SkillDetail[] = []
    activeEffects: Record<string, SkillDetail> = {}
    breakGauge: number
    maxBreakGauge: number
    aggro: number
    distanceRemaining = spdDistance
    currentSpd = 0
    currentMp = 0
    maxMp: number
    mpBonus = 0

    constructor(kioku: Kioku) {
        this.kioku = kioku
        this.breakGauge = this.maxBreak()
        this.maxBreakGauge = this.breakGauge
        this.aggro = aggro[kioku.role]
        this.maxMp = kioku.data.ep
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

    applyHaste(value: number): void {
        this.distanceRemaining = Math.max(this.distanceRemaining - (spdDistance / this.currentSpd * value / 1000), 0)
    }

    applyToSelfEffect(detail: SkillDetail, effectName: string) {
        console.log(detail)
        switch (detail.abilityEffectType) {
            case "DMG_ATK":
            case "DMG_DEF":
                // TODO: Proximity should use value4
                let breakVal = detail.value3 || defaultbreak[effectName][detail.range]
                breakVal += Object.values(this.activeEffects).reduce((sum, eff) => eff.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED" ? sum + eff.value1 : sum, 0)
                breakVal += this.passiveEffects.reduce((sum, eff) => eff.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED" ? sum + eff.value1 : sum, 0)
                this.breakGauge -= breakVal
                break
            case "HASTE":
                this.applyHaste(detail.value1)
                break;
            case "UP_GIV_DMG_RATIO":
            case "UP_CTR_FIXED":
                break
            case "UP_GIV_BREAK_POINT_DMG_FIXED":
                this.activeEffects[getIdx(detail)] = detail
                break
            default:
                throw Error(`$Unknown abilityEffectType ${detail.abilityEffectType}`)
        }
    }

    sliceTargets(targets: KiokuState[], range: number): KiokuState[] {
        // TODO: Make this select into a graph?
        if (range === 1) return [targets[0]]
        if (range === 2) return targets.slice(0, 2)
        if (range === 3) return targets
        return [this]
    }

    applyEffectsTo(targets: KiokuState[], details: SkillDetail[], effectName: string): void {
        for (const detail of details) {
            for (const target of this.sliceTargets(targets, detail.range)) {
                target.applyToSelfEffect(detail, effectName)
            }
        }
    }

    applyStartHaste(): void {
        for (const detail of this.passiveEffects) {
            if (detail.abilityEffectType === "HASTE") {
                if (!(isTiming([ProcessTiming.BATTLE_START], (detail as PassiveSkill)?.startTimingIdCsv))) continue
                if (detail.startConditionSetIdCsv.length && detail.startConditionSetIdCsv != "0") continue
                if (!detail.activeConditionSetIdCsv.split(",").every(condId => isActiveConditionRelevantForPvPState(condId))) continue
                this.applyHaste(detail.value1)
            }
        }
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
    kiokuStates: KiokuState[];
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
        return this.kiokuStates.reduce((s, k) => s < k.distanceRemaining ? s : k.distanceRemaining, spdDistance)
    }

    setup() {
        for (const kiokuState of this.kiokuStates) {
            for (const skill_id of [0, 1, 2, 3, kiokuState.kioku.data.ability_id, kiokuState.kioku.data.crystalis_id]) {
                if (skill_id in kiokuState.kioku.effects) {
                    for (const detail of kiokuState.kioku.effects[skill_id]) {
                        if (skill_id > 10 && !getIdx(detail).toString().startsWith(skill_id.toString())) continue // "Fua etc are not actually passives"
                        if (detail.abilityEffectType === "UP_SPD_RATIO") console.log(kiokuState.kioku.name, detail.range, detail.value1, detail)
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

    act(actor: KiokuState, otherTeam: PvPTeam, effectName: string): void {
        const effectId = actor.kioku.data[effectName]
        const details = actor.kioku.effects[effectId]
        let targets: KiokuState[] = otherTeam.kiokuStates
        switch (effectId) {
            case 1066: // Hazuki skill
                targets = [this.kiokuStates
                    .filter(k => k.kioku.name !== actor.kioku.name)
                    .filter(k => k.distanceRemaining)
                    .reduce((s, k) => !s?.distanceRemaining || s.distanceRemaining < k.distanceRemaining ? k : s, {})]
                break
            case 1022:
            case 1149:
                break
            default:
                console.warn(effectId, details)
                throw Error(`${actor.kioku.name} - Unknown effectId ${effectId}`)
        }
        actor.applyEffectsTo(targets, details, effectName)
    }

    useUltimate(otherTeam: PvPTeam): boolean {
        const readyKiokus = this.kiokuStates.filter(k => k.currentMp >= k.maxMp)
        if (!readyKiokus.length) return false
        const actor = readyKiokus[0]
        actor.currentMp = Math.floor(5 * (1 + actor.mpBonus))
        this.act(actor, otherTeam, "special_id")
        return true
    }

    useAttackOrSkill(otherTeam: PvPTeam): void {
        const actor = this.getNextActor()
        let effectName;
        if (this.currentSp) {
            this.currentSp--
            effectName = "skill_id"
            actor.currentMp += Math.floor(30 * (1 + actor.mpBonus))
        } else {
            this.currentSp++
            effectName = "attack_id"
            actor.currentMp += Math.floor(15 * (1 + actor.mpBonus))
        }
        actor.resetDistanceRemaining()
        this.act(actor, otherTeam, effectName)
    }
}
