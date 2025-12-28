import { BattleState, aggro, defaultbreak, KiokuRole, maxMeters, mpGainFromAction, PassiveSkill, SkillDetail, skillDetailId, SkillKey, targetRange, TargetType, targetTypeToLvl, TargetTypeLookup, Aliment, } from "../types/KiokuTypes";
import { skillDetails } from "../utils/helpers";
import { isConditionSetActive, isTimingActive as isTimingCorrect, ProcessTiming, conditionSetRequiresActorIsSelf } from "./BattleConditionParser";
import { PvPKioku } from "./PvPKioku";


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
    "RECOVERY_HP",
    "REMOVE_ALL_DEBUFF",
]

const enemySkills = [
    "DMG_ATK",
    "DMG_DEF",
    "DWN_ATK_RATIO",
    "DWN_SPD_RATIO",
    "DWN_DEF_RATIO",
    "WEAKNESS",
    "SLOW",
]

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

export class KiokuState {
    posIdx: number;
    teamLabel: string

    kioku: PvPKioku;
    maxBreakGauge: number
    maxMp: number
    aggro: number

    team: PvPTeam

    // Put in here the effects that are active constantly and use in calculations
    passiveEffectDetails: PassiveSkill[] = [];
    // Put in here the effects that are only active for a certain amount of turns
    activeEffectDetails: Record<string, SkillDetail> = {}

    currentRemainingBreakGauge: number
    currentMetersRemaining = maxMeters
    currentSpd = 0  // Spd is m/s
    currentMp = 0
    currentHpPercent = 100
    currentMpGain = 1
    currentMagic = 0

    isBroken = false

    stateGen: (actor: KiokuState, target: KiokuState, actionType?: TargetType) => BattleState

    constructor(posIdx: number, teamLabel: string, team: PvPTeam, kioku: PvPKioku, stateGen: (actor: KiokuState, target: KiokuState, actionType?: TargetType) => BattleState) {
        this.posIdx = posIdx
        this.teamLabel = teamLabel
        this.team = team
        this.kioku = kioku
        this.currentRemainingBreakGauge = maxBreak(kioku.data.rarity, kioku.data.role)
        this.maxBreakGauge = this.currentRemainingBreakGauge
        this.aggro = aggro[kioku.data.role]
        this.maxMp = kioku.data.ep
        this.stateGen = stateGen
    }

    resolveBreak() {
        if (this.currentRemainingBreakGauge <= 0) {
            this.isBroken = true
            this.progressMeters(-2500)
        }
    }

    resetDistanceRemaining() {
        this.currentMetersRemaining = maxMeters
    }

    decrementActiveEffects() {
        const updated: Record<string, SkillDetail> = {};
        for (const [key, detail] of Object.entries(this.activeEffectDetails)) {
            if (detail.abilityEffectType == "CUTOUT") this.progressMeters(maxMeters)
            const turn = detail.turn - 1;
            if (turn) updated[key] = { ...detail, turn }
        }
        this.activeEffectDetails = updated;
    }

    numberOfBuffs(): number {
        console.log("nr of buffs",
            Object.values(this.activeEffectDetails),
            Object.values(this.activeEffectDetails).map(d => [friendlySkills.includes(d.abilityEffectType), d.abilityEffectType]))
        return Object.values(this.activeEffectDetails).reduce((sum, d) =>
            sum + (friendlySkills.includes(d.abilityEffectType) ? 1 : 0), 0)
    }

    numberOfDebuffs(): number {
        return Object.values(this.activeEffectDetails).reduce((sum, d) =>
            sum + (!Object.values(Aliment).includes(d.abilityEffectType as Aliment) && enemySkills.includes(d.abilityEffectType) ? 1 : 0), 0)
    }


    updateSpd(): void {
        let spd = this.kioku.data.minSpd
        const effs = this.filteredEffects()
        console.log("Speed effects for", this.kioku.name, effs)
        for (const detail of Object.values(effs["UP_SPD_RATIO"] ?? {})) {
            spd += (this.kioku.data.minSpd * detail.value1 / 1000)
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
        this.currentMpGain = mpGain
    }

    getMpFromType(action: TargetType): void {
        this.getMp(mpGainFromAction[action])
    }

    getMp(mp: number): void {
        this.currentMp += Math.floor(mp * this.currentMpGain)
    }

    secondsUntilAbleToAct(): number {
        return this.currentMetersRemaining / this.currentSpd
    }

    traverseSeconds(seconds: number): void {
        this.progressMeters(seconds * this.currentSpd)
    }

    progressMeters(metersWalked: number): void {
        this.currentMetersRemaining = Math.max(this.currentMetersRemaining - metersWalked, 0)
    }

    filteredEffects(): Record<string, SkillDetail[]> {
        const currents: Record<string, SkillDetail[]> = {};
        [...this.passiveEffectDetails, ...Object.values(this.activeEffectDetails)]
            .forEach(detail => {
                if (!isConditionSetActive(detail, this.stateGen(this, this))) return
                if (!(detail.abilityEffectType in currents)) currents[detail.abilityEffectType] = []
                currents[detail.abilityEffectType].push(detail)
            })
        return currents
    }

    addEffectToBank(detail: SkillDetail) {
        if ("passiveSkillMstId" in detail) {
            this.passiveEffectDetails.push(detail)
        } else {
            console.error("An active thing was added to the bank??")
        }
    }

    applyEffect(target: KiokuState, detail: SkillDetail, effectName?: TargetType): number | undefined {
        /**
         * @returns action id if additional act should be triggered, otherwise returns null
         */
        if (!isConditionSetActive(detail, this.stateGen(this, target, effectName))) return
        if (detail.abilityEffectType.startsWith("DMG_")) {
            // TODO: Proximity should use value4, prolly doesn't matter much tho
            // TODO: Random dmg special case it?
            let breakVal = detail.value3 || defaultbreak[effectName][detail.range]
            breakVal += Object.values(this.filteredEffects()).flat()
                .reduce((sum, detail) => detail.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED" ? sum + detail.value1 : sum, 0)
            target.currentRemainingBreakGauge -= breakVal
            target.getMp(5)
            return;
        }

        const effTargets = this.team.sliceTargets(this, this.team.kiokuStates, detail)

        if (detail.turn) {
            effTargets.forEach(t => t.activeEffectDetails[skillDetailId(detail)] = detail)
        } else if (detail.abilityEffectType === "HASTE") {
            console.warn("HASTING", detail, effTargets)
            effTargets.forEach(t => t.progressMeters(detail.value1 * 10))
        } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
            effTargets.forEach(t => t.getMp(target.maxMp * detail.value1 / 1000))
        } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
            effTargets.forEach(t => t.getMp(detail.value1))
        } else if (detail.abilityEffectType === "CUTOUT") {
            effTargets.forEach(t => t.activeEffectDetails[skillDetailId(detail)] = { ...detail, turn: 1 })
        } else if (detail.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
            return detail.value1;
        } else if (detail.abilityEffectType === "GAIN_CHARGE_POINT") {
            this.currentMagic += detail.value1;
        } else if ("passiveSkillDetailMstId" in detail) {
            console.warn("How to handle this", this, detail, target, effectName)
            // TODO How to handle passiveS? 
        } else {
            console.error("Active without turn", detail)
        }
        return;
    }
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

    generateState = (actor: KiokuState, target: KiokuState, actionType?: TargetType): BattleState => ({
        actorTeam: this,
        enemyTeam: this.otherTeam,
        actor,
        target,
        actionType,
    })

    constructor(kiokus: PvPKioku[], teamLabel: string, debug = false) {
        this.kiokuStates = kiokus.map((k, i) => new KiokuState(i, teamLabel, this, k, this.generateState))
        this.debug = debug;
        this.teamLabel = teamLabel;
    }

    finishSetup(otherTeam: PvPTeam) {
        this.otherTeam = otherTeam

        this.kiokuStates.forEach(k => k.kioku.effects.forEach(e => {
            k.addEffectToBank(e)
        }))
        this.triggerPassives(ProcessTiming.BATTLE_START)
    }

    triggerPassives(timing: ProcessTiming, lastAction?: TargetType, lastActor?: KiokuState): Record<number, KiokuState> {
        let additionalAct: Record<number, KiokuState> = {};
        for (const k of this.kiokuStates) {
            k.passiveEffectDetails.forEach(detail => {
                if (conditionSetRequiresActorIsSelf(detail) && (!lastActor || lastActor !== k)) return
                this.sliceTargets(k, this.kiokuStates, detail).forEach(t => {
                    if (isTimingCorrect(timing, detail)) {
                        const fua = k.applyEffect(t, detail, lastAction)
                        if (fua) additionalAct[fua] = k
                    }
                })
            })
        }
        this.kiokuStates.forEach(k => {
            console.log("Post-passive effects for", k.kioku.name, k.activeEffectDetails)
            k.updateMPGain()
            k.updateSpd()
            k.resolveBreak()
        })
        console.log("Additional acts triggered:", Object.keys(additionalAct))
        return additionalAct;
    }

    traverseSeconds(seconds: number): void {
        this.kiokuStates.forEach(k => k.traverseSeconds(seconds))
    }

    getSecondsUntilNextReadyKioku(): number {
        return this.kiokuStates.reduce((s, k) => s < k.secondsUntilAbleToAct() ? s : k.secondsUntilAbleToAct(), maxMeters)
    }

    getNextActor(): KiokuState {
        return this.kiokuStates.filter(k => k.currentMetersRemaining - 0.001 <= 0)[0]
    }

    sliceTargets(actor: KiokuState, possibleTargets: KiokuState[], detail: SkillDetail): KiokuState[] {
        const effectId = skillDetailId(detail) / 10000 | 0
        if (detail.range === targetRange.TARGET) {
            if (detail.abilityEffectType.startsWith("DMG_")) return [possibleTargets[0]]
            // TODO How to handle aggro? Make this select into a graph?

            const eligableTargets = this.kiokuStates.filter(k => k !== actor)
            if (effectId === 1066) { // Hazuki skill
                return [eligableTargets
                    .reduce((s, k) => s.secondsUntilAbleToAct() < k.secondsUntilAbleToAct() ? k : s, { secondsUntilAbleToAct: () => 0 }) as KiokuState]
            }
            if (effectId === 1161) { // Mabayu skill
                return [eligableTargets
                    .reduce((s, k) => s.kioku.getBaseAtk() < k.kioku.getBaseAtk() ? k : s, { kioku: { getBaseAtk: () => 0 } }) as KiokuState]
            }
            if (effectId === 1072) { // Rika skill
                return [eligableTargets
                    .filter(k => [KiokuRole.Attacker, KiokuRole.Breaker].includes(k.kioku.data.role))
                    .reduce((s, k) => s.currentMp > k.currentMp ? k : s, { currentMp: 999 }) as KiokuState]
            }
            console.error(actor.kioku.name, detail, "has range 1, who to target?")
            return [possibleTargets[0]]
        }
        if (detail.range === targetRange.PROXIMITY) return possibleTargets.slice(0, 3) // TODO: Handle proximity / Random
        if (detail.range === targetRange.ALL) return possibleTargets
        if (detail.range === targetRange.SELF) return [actor]
        console.error("Unknown target", detail)
        return []
    }

    act(actor: KiokuState, effectName: TargetType): void {
        if (effectName === TargetType.attackId) {
            this.currentSp++;
        } else if (effectName === TargetType.skillId) {
            this.currentSp--;
        } else {
            actor.currentMp = 0;
        }
        const details = getDetails(skillDetails, "skillMstId", actor.kioku.data[TargetTypeLookup[effectName]], actor.kioku[targetTypeToLvl[effectName]])
        this.completeAction(actor, effectName, details)
    }

    completeAction(actor: KiokuState, effectName: TargetType, details: SkillDetail[]) {
        console.log("Completing action for", actor.kioku.name, effectName, details)
        let possibleTargets: KiokuState[] = []
        for (const detail of details) {
            if (friendlySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.kiokuStates
            } else if (enemySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.otherTeam.kiokuStates
            } else {
                console.error("Unknown effect type", detail.abilityEffectType, detail, "assuming enemy targets")
                possibleTargets = this.otherTeam.kiokuStates
            }
            console.log("Possible targets for", detail.abilityEffectType, "are", this.sliceTargets(actor, possibleTargets, detail).map(k => k.kioku.name))
            for (const target of this.sliceTargets(actor, possibleTargets, detail)) {
                actor.applyEffect(target, detail, effectName)
            }
        }
        actor.getMpFromType(effectName)
    }

    useUltimate(): [KiokuState, TargetType] | undefined {
        const readyKiokus = this.kiokuStates.filter(k => k.currentMp >= k.maxMp).filter(k => k.maxMp > 0)
        if (!readyKiokus.length) return;
        const actor = readyKiokus[0]
        this.act(actor, TargetType.specialId)
        const actionIds = this.triggerPassives(ProcessTiming.ATTACK_END, TargetType.specialId, actor)
        this.triggerFua(actionIds)
        return [actor, TargetType.specialId]
    }

    useAttackOrSkill(): [KiokuState, TargetType] {
        console.log(this.kiokuStates.map(k => k.activeEffectDetails))
        const actor = this.getNextActor()
        actor.resetDistanceRemaining()
        const effType = this.currentSp ? TargetType.skillId : TargetType.attackId
        this.triggerPassives(ProcessTiming.TURN_START, effType)
        this.act(actor, effType)
        console.error("TRIGGERING PASSIVES AFTER", actor.kioku.name, actor, effType)
        const actionIds = this.triggerPassives(ProcessTiming.ATTACK_END, effType, actor)
        this.triggerFua(actionIds)
        console.log(this.teamLabel, "actor is", actor.kioku.name, "using", effType)
        actor.decrementActiveEffects()
        return [actor, effType]
    }

    resolveEndOfTurn(): void {
        const actionIds = this.triggerPassives(ProcessTiming.ATTACK_END)
        this.triggerFua(actionIds)
    }

    triggerFua(actionIds: Record<string, KiokuState>): void {
        Object.entries(actionIds).forEach(([actionId, k]) => {
            const details = Object.values(skillDetails).filter(v => (v as any).skillMstId === Number(actionId))
            this.completeAction(k, TargetType.fuaId, details)
            this.triggerPassives(ProcessTiming.ATTACK_END, TargetType.fuaId, k)
        })
    }
}
