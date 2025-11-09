import { BattleState, aggro, defaultbreak, KiokuRole, maxMeters, mpGainFromAction, PassiveSkill, SkillDetail, skillDetailId, SkillKey, targetRange, TargetType, targetTypeToLvl, TargetTypeLookup, } from "../types/KiokuTypes";
import { skillDetails } from "../utils/helpers";
import { isConditionSetActive, isTimingActive as isTimingCorrect, ProcessTiming } from "./BattleConditionParser";
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
]

const enemySkills = [
    "DMG_ATK",
    "DMG_DEF",
    "DWN_ATK_RATIO",
    "DWN_SPD_RATIO",
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
    kioku: PvPKioku;
    maxBreakGauge: number
    maxMp: number
    aggro: number

    effectDetailBank: PassiveSkill[] = [];
    // Put in here things that will trigger on start, break, end etc
    passiveEffectDetails: Record<string, PassiveSkill> = {};
    // Put in here the effects that are active constantly and use in calculations
    activeEffectDetails: Record<string, SkillDetail> = {}
    // Put in here the effects that are only active for a certain amount of turns

    currentRemainingBreakGauge: number
    currentMetersRemaining = maxMeters
    currentSpd = 0  // Spd is m/s
    currentMp = 0
    currentHpPercent = 100
    currentMpGain = 1
    currentMagic = 0

    isBroken = false

    stateGen: (actor: KiokuState, target: KiokuState, actionType?: TargetType) => BattleState

    constructor(kioku: PvPKioku, stateGen: (actor: KiokuState, target: KiokuState, actionType?: TargetType) => BattleState) {
        this.kioku = kioku
        this.currentRemainingBreakGauge = maxBreak(kioku.data.rarity, kioku.data.role)
        this.maxBreakGauge = this.currentRemainingBreakGauge
        this.aggro = aggro[kioku.data.role]
        this.maxMp = kioku.data.ep
        this.stateGen = stateGen
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

    updateSpd(): void {
        let spd = this.kioku.data.minSpd
        const effs = this.filteredEffects()
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
        [...Object.values(this.passiveEffectDetails), ...Object.values(this.activeEffectDetails)]
            .forEach(detail => {
                if (!isConditionSetActive(detail, this.stateGen(this, this))) return
                if (!(detail.abilityEffectType in currents)) currents[detail.abilityEffectType] = []
                currents[detail.abilityEffectType].push(detail)
            })
        return currents
    }

    addEffectToBank(detail: SkillDetail) {
        if ("passiveSkillMstId" in detail) {
            this.effectDetailBank.push(detail)
        } else {
            console.error("An active thing was added to the bank??")
        }
    }

    dealBreakDamageToEnemy(target: KiokuState, detail: SkillDetail, effectName: TargetType) {

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
            return;
        }


        if (detail.turn) {
            target.activeEffectDetails[skillDetailId(detail)] = detail
        } else if (detail.abilityEffectType === "HASTE") {
            target.progressMeters(detail.value1 * 10)
        } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
            target.getMp(target.maxMp * detail.value1 / 1000)
        } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
            target.getMp(detail.value1)
        } else if (detail.abilityEffectType === "CUTOUT") {
            target.activeEffectDetails[skillDetailId(detail)] = { ...detail, turn: 1 }
        } else if (detail.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
            console.log("FOUND ADD ACT", detail.value1)
            return detail.value1;
        } else if (detail.abilityEffectType === "GAIN_CHARGE_POINT") {
            console.log("upps", this.currentMagic)
            this.currentMagic += detail.value1;
            console.log("apps", this.currentMagic)
        } else if ("passiveSkillDetailMstId" in detail) {
            target.passiveEffectDetails[detail.passiveSkillDetailMstId] = detail
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
    private teamLabel: string
    currentSp = 5

    generateState = (actor: KiokuState, target: KiokuState, actionType?: TargetType): BattleState => ({
        actorTeam: this,
        enemyTeam: this.otherTeam,
        actor,
        target,
        actionType,
    })

    constructor(kiokus: PvPKioku[], teamLabel: string, debug = false) {
        this.kiokuStates = kiokus.map(k => new KiokuState(k, this.generateState))
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

    triggerPassives(timing: ProcessTiming, lastAction?: TargetType): Record<number, KiokuState> {
        let additionalAct: Record<number, KiokuState> = {};
        for (const k of this.kiokuStates) {
            k.effectDetailBank.forEach(detail => {
                this.sliceTargets(k, this.kiokuStates, detail).forEach(t => {
                    if (isTimingCorrect(timing, detail)) {
                        const fua = k.applyEffect(t, detail, lastAction)
                        if (fua) additionalAct[fua] = k
                    }
                })
            })
        }
        this.kiokuStates.forEach(k => {
            k.updateMPGain()
            k.updateSpd()
        })
        return additionalAct;
    }

    traverseSeconds(seconds: number): void {
        this.kiokuStates.forEach(k => k.traverseSeconds(seconds))
    }

    getSecondsUntilNextReadyKioku(): number {
        return this.kiokuStates.reduce((s, k) => s < k.secondsUntilAbleToAct() ? s : k.secondsUntilAbleToAct(), maxMeters)
    }

    getNextActor(): KiokuState {
        return this.kiokuStates.filter(k => k.currentMetersRemaining - 0.1 <= 0)[0]
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
        console.log("Act", actor, effectName)
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
        let possibleTargets: KiokuState[] = []
        for (const detail of details) {
            if (friendlySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.kiokuStates
            } else if (enemySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.otherTeam.kiokuStates
            } else {
                console.error("Unknown effect type", detail.abilityEffectType, detail)
                continue
            }

            for (const target of this.sliceTargets(actor, possibleTargets, detail)) {
                actor.applyEffect(target, detail, effectName)
            }
        }
        actor.getMpFromType(effectName)
    }

    useUltimate(): TargetType | undefined {
        const readyKiokus = this.kiokuStates.filter(k => k.currentMp >= k.maxMp)
        if (!readyKiokus.length) return;
        const actor = readyKiokus[0]
        this.act(actor, TargetType.specialId)
        return TargetType.specialId
    }

    useAttackOrSkill(): TargetType {
        const actor = this.getNextActor()
        actor.resetDistanceRemaining()
        const effType = this.currentSp ? TargetType.skillId : TargetType.attackId
        this.triggerPassives(ProcessTiming.TURN_START, effType)
        this.act(actor, effType)
        actor.decrementActiveEffects()
        return effType
    }

    hasNewlyBrokenUnits(): boolean {
        const newlyBroken = this.kiokuStates.filter(k => k.currentRemainingBreakGauge <= 0 && !k.isBroken)
        newlyBroken.forEach(k => {
            k.isBroken = true
            k.progressMeters(-2500)
        })
        return newlyBroken.length > 0
    }

    resolveEndOfTurn(lastAction: TargetType): void {
        const actionIds = this.triggerPassives(ProcessTiming.ATTACK_END, lastAction)
        Object.entries(actionIds).forEach(([actionId, k]) => {
            const details = Object.values(skillDetails).filter(v => (v as any).skillMstId === Number(actionId))
            this.completeAction(k, TargetType.fuaId, details)
        })
    }
}
