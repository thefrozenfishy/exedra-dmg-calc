import { Kioku } from "./Kioku";
import { KiokuRole, SkillDetail, maxMeters } from "../types/KiokuTypes";
import { isConditionSetActiveForPvP, isTiming, ProcessTiming } from "./BattleConditionParser";

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

const friendlySkills = [
    "CONSUME_CHARGE_POINT", //TODO:  HANDLE
    "CUTOUT",
    "GAIN_CHARGE_POINT", //TODO:  HANDLE
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
]

const enemySkills = [
    "DMG_ATK",
    "DMG_DEF",
]

export class KiokuState {
    kioku: Kioku
    effects: Record<string, SkillDetail> = {}
    breakGauge: number
    maxBreakGauge: number
    isBroken = false
    aggro: number
    metersRemaining = maxMeters
    currentSpd = 0  // Spd is m/s
    currentMp = 0
    maxMp: number
    mpGain = 1
    currentMagic = 0

    constructor(kioku: Kioku) {
        this.kioku = kioku
        this.breakGauge = this.maxBreak()
        this.maxBreakGauge = this.breakGauge
        this.aggro = aggro[kioku.role]
        this.maxMp = kioku.data.ep
    }

    resetMeters() {
        this.metersRemaining = maxMeters
    }

    updateSpd(): void {
        let spd = this.kioku.baseSpd
        const effs = this.filteredEffects()
        for (const detail of Object.values(effs["UP_SPD_RATIO"] ?? {})) {
            spd += (this.kioku.baseSpd * detail.value1 / 1000)
        }
        for (const detail of Object.values(effs["UP_SPD_FIXED"] ?? {})) {
            spd += detail.value1
        }
        this.currentSpd = spd
    }

    updateMPGain(): void {
        let mpGain = 1
        const effs = this.filteredEffects()
        for (const detail of Object.values(effs["UP_EP_RECOVER_RATE_RATIO"] ?? {})) {
            mpGain += detail.value1 / 1000
        }
        this.mpGain = mpGain
    }

    secondsUntilAct(): number {
        return this.metersRemaining / this.currentSpd
    }

    traverseSeconds(seconds: number): void {
        this.progressMeters(seconds * this.currentSpd)
    }

    progressMeters(metersWalked: number): void {
        this.metersRemaining = Math.max(this.metersRemaining - metersWalked, 0)
    }

    filteredEffects(brokenUnits = 0) {
        const currents: Record<string, SkillDetail[]> = {}
        for (const effect of Object.values(this.effects)) {
            if (!isConditionSetActiveForPvP([effect.activeConditionSetIdCsv, effect.activeConditionSetIdCsv], {
                currentMagicStacks: this.currentMagic,
                amountOfEnemies: 5,
                currentHp: 100,
                brokenUnits,
            })) continue
            if (!(effect.abilityEffectType in currents)) currents[effect.abilityEffectType] = []
            currents[effect.abilityEffectType].push(effect)
        }
        return currents
    }

    endTurn() {
        this.effects = Object.fromEntries(Object.entries(this.effects).map(([id, eff]) => {
            if ("passiveSkillMstId" in eff) return [id, eff]
            eff.turn -= 1
            if (eff.abilityEffectType === "CUTOUT") this.progressMeters(10000)
            if (eff.turn <= 0) return [null, null]
            return [id, eff]
        }).filter(([id, eff]) => id != null))
    }

    applyEffectToTarget(target: KiokuState, detail: SkillDetail, effectName: string, brokenUnits = 0) {
        if (!isConditionSetActiveForPvP([detail.activeConditionSetIdCsv, detail.activeConditionSetIdCsv], {
            currentMagicStacks: this.currentMagic,
            amountOfEnemies: 5,
            currentHp: 100,
            brokenUnits,
        })) return
        if (detail.abilityEffectType.startsWith("DMG_")) {
            // TODO: Proximity should use value4, prolly doesn't matter much tho
            // TODO: Random dmg special case it?
            let breakVal = detail.value3 || defaultbreak[effectName][detail.range]
            breakVal += Object.values(this.filteredEffects()).flat()
                .reduce((sum, eff) => eff.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED" ? sum + eff.value1 : sum, 0)
            target.breakGauge -= breakVal
        } else if ([...enemySkills, ...friendlySkills].includes(detail.abilityEffectType)) {
            target.effects["passiveSkillDetailMstId" in detail ? detail.passiveSkillDetailMstId : detail.skillDetailMstId] = detail
            if (detail.abilityEffectType === "HASTE") {
                target.progressMeters(10 * detail.value1)
            } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
                target.currentMp += Math.floor((target.maxMp * detail.value1 / 1000) * target.mpGain)
            } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
                target.currentMp += Math.floor(detail.value1 * target.mpGain)
            } else if (["UP_SPD_FIXED", "UP_SPD_RATIO"].includes(detail.abilityEffectType)) {
                target.updateSpd()
            } else if ("UP_EP_RECOVER_RATE_RATIO" === detail.abilityEffectType) {
                target.updateMPGain()
            }
        } else {
            throw Error(`$Unknown abilityEffectType ${detail.abilityEffectType} `)
        }
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
    declare otherTeam: PvPTeam
    private debug: boolean;
    private teamLabel: string
    currentSp = 5

    constructor(kiokus: Kioku[], teamLabel: string, debug = false) {
        this.kiokuStates = kiokus.map(k => new KiokuState(k))
        this.debug = debug;
        this.teamLabel = teamLabel;
    }

    setOpponent(otherTeam: PvPTeam) {
        this.otherTeam = otherTeam
    }

    traverseSeconds(seconds: number): void {
        this.kiokuStates.forEach(k => k.traverseSeconds(seconds))
    }

    getSecondsToNext(): number {
        return this.kiokuStates.reduce((s, k) => s < k.secondsUntilAct() ? s : k.secondsUntilAct(), maxMeters)
    }

    setup() {
        for (const kiokuState of this.kiokuStates) {
            this.applyPassives(kiokuState, ProcessTiming.BATTLE_START)
        }
        for (const kiokuState of this.kiokuStates) {
            kiokuState.updateSpd()
        }
    }

    applyPassives(actor: KiokuState, timing: ProcessTiming, brokenUnits = 0) {
        for (const skillName of [11, 22, 33, 44, "ability_id", "crystalis_id"]) {
            this.act(actor, skillName, timing, brokenUnits)
        }
    }

    getNextActor(): KiokuState {
        return this.kiokuStates.filter(k => k.metersRemaining - 0.1 <= 0)[0]
    }

    sliceTargets(actor: KiokuState, possibleTargets: KiokuState[], range: number, effectId: number, abilityEffectType: string): KiokuState[] {
        if (range === 1) {
            if (abilityEffectType.startsWith("DMG_")) return [possibleTargets[0]] // TODO How to handle aggro? Make this select into a graph?
            const eligableTargets = this.kiokuStates.filter(k => k.kioku.name !== actor.kioku.name)
            if (effectId === 1066) { // Hazuki skill
                return [eligableTargets
                    .filter(k => k.metersRemaining)
                    .reduce((s, k) => s.secondsUntilAct() < k.secondsUntilAct() ? k : s, { secondsUntilAct: () => 0 }) as KiokuState]
            }
            if (effectId === 1161) { // Mabayu skill
                return [eligableTargets.reduce((s, k) => s.kioku.getBaseAtk() < k.kioku.getBaseAtk() ? k : s, { kioku: { getBaseAtk: () => 0 } }) as KiokuState]
            }
            if (effectId === 1072) { // Rika skill
                return [eligableTargets
                    .filter(k => [KiokuRole.Attacker, KiokuRole.Breaker].includes(k.kioku.role))
                    .reduce((s, k) => s.currentMp > k.currentMp ? k : s, { currentMp: 999 }) as KiokuState]
            }
            console.warn(actor.kioku.name, effectId, "has range 1, who to target?")
            return [possibleTargets[0]]
        }
        if (range === 2) return possibleTargets.slice(0, 3) // TODO: Handle proximity / Random
        if (range === 3) return possibleTargets
        return [actor]
    }

    act(actor: KiokuState, effectName: string | number, actionState: ProcessTiming, brokenUnits = 0): void {
        const effectId = actor.kioku.data[effectName] ?? effectName
        const details = actor.kioku.effects[effectId] ?? []

        let possibleTargets: KiokuState[] = []
        for (const detail of details) {
            if ("startTimingIdCsv" in detail && !isTiming(actionState, detail.startTimingIdCsv)) continue
            if (actionState === ProcessTiming.BATTLE_START && detail.abilityEffectType.startsWith("DMG_")) continue // TODO: This should be handled differently
            if (friendlySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.kiokuStates
            } else if (enemySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.otherTeam.kiokuStates
            } else {
                console.warn("Unknown effect type", detail.abilityEffectType, detail)
                continue
            }
            for (const target of this.sliceTargets(actor, possibleTargets, detail.range, effectId, detail.abilityEffectType)) {
                actor.applyEffectToTarget(target, detail, effectName.toString(), brokenUnits)
            }
        }
    }

    useUltimate(): boolean {
        const readyKiokus = this.kiokuStates.filter(k => k.currentMp >= k.maxMp)
        if (!readyKiokus.length) return false
        const actor = readyKiokus[0]
        actor.currentMp = Math.floor(5 * actor.mpGain)
        this.act(actor, "special_id", ProcessTiming.ATTACK_END)
        return true
    }

    useAttackOrSkill(): void {
        const actor = this.getNextActor()
        this.applyPassives(actor, ProcessTiming.TURN_START)
        let effectName;
        if (this.currentSp) {
            this.currentSp--
            effectName = "skill_id"
            actor.currentMp += Math.floor(30 * actor.mpGain)
        } else {
            this.currentSp++
            effectName = "attack_id"
            actor.currentMp += Math.floor(15 * actor.mpGain)
        }
        actor.resetMeters()
        this.act(actor, effectName, ProcessTiming.ATTACK_END)
        actor.endTurn()
    }

    hasNewlyBrokenUnits(): number {
        const newlyBroken = this.kiokuStates.filter(k => k.breakGauge <= 0 && !k.isBroken)
        newlyBroken.forEach(k => k.isBroken = true)
        return newlyBroken.length
    }

    resolveEndOfTurn(): void {
        const brokenUnits = this.otherTeam.hasNewlyBrokenUnits()
        if (brokenUnits) {
            this.kiokuStates.forEach(k => this.applyPassives(k, ProcessTiming.ATTACK_END, brokenUnits))
        }
    }
}
