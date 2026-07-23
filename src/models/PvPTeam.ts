import { Aliment, KiokuRole } from "../types/enums";
import { BattleState, aggro, defaultbreak, maxMeters, mpGainFromAction, PassiveSkill, SkillDetail, skillDetailId, SkillKey, targetRange, TargetType, targetTypeToLvl, TargetTypeLookup } from "../types/KiokuTypes";
import { skillDetails } from "../utils/helpers";
import { isConditionSetActive, isTimingActive as isTimingCorrect, ProcessTiming, conditionSetRequiresActorIsSelf } from "./BattleConditionParser";
import { PvPKioku } from "./PvPKioku";

// The client stores speed/gauge values as C# `float` (32-bit) and does its
// arithmetic in that precision, not 64-bit double like JS numbers default to.
// Wrapping each touch point in f32() reproduces the same style of rounding
// (and therefore the same near-tie flips) even though the formulas around it
// below aren't byte-identical to the client's internals.
const f32 = Math.fround;

// Mirrors ReDriveBattleCore.UnitTurnGauge.TurnOrderPriority: a counter stamped
// onto a unit whenever something INSTANTLY shifts its gauge (Haste/Slow-type
// effects), used only as a tiebreaker when two units are exactly tied on
// time-to-act. Natural time passing does NOT touch it (see tickMeters below).
let globalTurnShiftCounter = 0;

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
    passiveEffectDetails: Record<string, PassiveSkill> = {}
    // Put in here the effects that are only active for a certain amount of turns
    activeEffectDetails: Record<string, SkillDetail> = {}

    currentRemainingBreakGauge: number
    currentMetersRemaining = maxMeters
    currentSpd = 0  // Spd is m/s
    currentMp = 0
    currentHpPercent = 100
    currentMpGain = 1
    currentMagic = 0

    // Debug helpers
    currSpdEffects: [number, string, string?][] = []

    isBroken = false
    // Tiebreak stamp for exact-tie turn order, see globalTurnShiftCounter above.
    turnOrderPriority = 0

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
        if (this.currentRemainingBreakGauge <= 0 && !this.isBroken) {
            this.isBroken = true
            // Matches UnitTurnGauge.DecreaseGaugeValue(..., isTurnShiftDecrease: false),
            // which stamps a NEGATIVE priority - the opposite tiebreak direction from
            // Haste/Slow, so a broken unit loses exact ties instead of winning them.
            this.currentMetersRemaining = Math.max(f32(this.currentMetersRemaining + 2500), 0)
            this.turnOrderPriority = -(++globalTurnShiftCounter)
        }
    }

    exitBreak() {
        if (this.isBroken) {
            this.isBroken = false
            this.currentRemainingBreakGauge = this.maxBreakGauge
        }
    }

    resetDistanceRemaining() {
        this.currentMetersRemaining = maxMeters
        // UnitTurnGauge.Reset() zeroes TurnOrderPriority when a unit's gauge
        // is refilled after acting.
        this.turnOrderPriority = 0
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

    currentBuffs(): string[] {
        return Object.values(this.activeEffectDetails)
            .filter(d => friendlySkills.includes(d.abilityEffectType))
            .map(d => `${d.applier} - ${d.description}`)
    }

    currentDebuffs(): string[] {
        return Object.values(this.activeEffectDetails)
            .filter(d => !Object.values(Aliment).includes(d.abilityEffectType as Aliment)
                && enemySkills.includes(d.abilityEffectType))
            .map(d => `${d.applier} - ${d.description}`)
    }


    // -----------------------------------------------------------------------
    // Mirrors ReDriveBattleCore.BattleUnit.GetProcessedSpeed(), which is NOT a
    // plain sum of buffs. It's a sequential fold: each active state's
    // ISpeedVariation.GetSpeedVariation(unit, currentRunningSpeed) is called
    // with the RUNNING TOTAL so far (not the base stat), and the result is
    // added on - in the order the buff was applied. That makes stacking
    // order-dependent whenever a percentage-type buff is involved, which is
    // the exact bug you originally asked about: the old version above grouped
    // all buffs by type and summed each against the base stat, which is
    // order-independent by construction and so could never reproduce it.
    //
    // CONFIRMED from the decompile: the fold shape, and the final floor at 0.
    // ASSUMED (the actual ISpeedVariation.GetSpeedVariation override wasn't in
    // the dump you found - it's likely a shared method between Up/Down
    // *SpeedUnitStateBase reading their Direction/Addition flags):
    //   - "_FIXED" effects add a flat amount, independent of the running total.
    //   - "_RATIO" effects add (runningTotal * value1/1000) - i.e. they
    //     compound against whatever's already been applied, not the base
    //     stat. If you manage to pull the real GetSpeedVariation body, this is
    //     the one thing worth double-checking against it.
    // -----------------------------------------------------------------------
    updateSpd(): void {
        this.currSpdEffects = []
        let spd = f32(this.kioku.data.minSpd)

        const speedTypes = ["UP_SPD_RATIO", "DWN_SPD_RATIO", "UP_SPD_FIXED", "DWN_SPD_FIXED"]
        const speedEffects = this.orderedActiveEffects().filter(d => speedTypes.includes(d.abilityEffectType))
        console.log("Speed effects for", this.teamLabel, this.kioku.name, speedEffects)

        for (const detail of speedEffects) {
            const sign = detail.abilityEffectType.startsWith("UP_") ? 1 : -1
            const isFixed = detail.abilityEffectType.endsWith("_FIXED")
            const step = isFixed
                ? sign * detail.value1
                : f32(spd * f32(sign * detail.value1 / 1000))
            spd = f32(spd + step)
            this.currSpdEffects.push([step, detail.description, detail.applier])
        }

        this.currentSpd = Math.max(spd, 0) // GetProcessedSpeed floors at 0 too
    }

    // Same source list and same condition filter as filteredEffects() below,
    // but kept as a flat list in application order instead of bucketed by
    // abilityEffectType - bucketing is exactly what throws away the ordering
    // information updateSpd's fold depends on.
    private orderedActiveEffects(): SkillDetail[] {
        return [...Object.values(this.passiveEffectDetails), ...Object.values(this.activeEffectDetails)]
            .filter(detail => isConditionSetActive(detail, this.stateGen(this, this)))
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
        return f32(this.currentMetersRemaining / this.currentSpd)
    }

    // Natural time flowing forward for everyone each tick. Matches
    // TurnReferee.ShiftNextTurn's DecreaseGaugeValue(consumed, priority,
    // isTurnShiftDecrease: true) call: the gauge drops, floors at 0, and
    // TurnOrderPriority is left untouched.
    traverseSeconds(seconds: number): void {
        this.tickMeters(f32(seconds * this.currentSpd))
    }

    private tickMeters(metersWalked: number): void {
        this.currentMetersRemaining = Math.max(f32(this.currentMetersRemaining - metersWalked), 0)
    }

    // An instant, non-time-based shove of the gauge - Haste/Slow-type effects
    // (pass a negative value to delay instead), and the CUTOUT extra-action
    // effect. Matches UnitTurnGauge.AddGaugeValue/SubtractGaugeValue, which
    // both stamp TurnOrderPriority with a fresh, increasing counter value so
    // exact ties resolve in favor of whichever unit was shifted most recently.
    progressMeters(metersWalked: number): void {
        this.currentMetersRemaining = Math.max(f32(this.currentMetersRemaining - metersWalked), 0)
        this.turnOrderPriority = ++globalTurnShiftCounter
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
            this.passiveEffectDetails[skillDetailId(detail)] = { ...detail, applier: this.kioku.name }
        } else {
            console.warn("An active thing was added to the bank??")
        }
    }

    applyEffect(target: KiokuState, detail: SkillDetail, targetType?: TargetType): number | undefined {
        /**
         * @returns action id if additional act should be triggered, otherwise returns null
         */
        if (detail.abilityEffectType === "DWN_SPD_RATIO") {
            console.warn(this.kioku.name, "SLOWED", detail, target.kioku.name)
        }
        if (!isConditionSetActive(detail, this.stateGen(this, target, targetType))) return
        if (detail.abilityEffectType.startsWith("DMG_")) {
            // TODO: Proximity should use value4, prolly doesn't matter much tho
            // TODO: Random dmg special case it?
            let breakVal = detail.value3 || defaultbreak[targetType][detail.range]
            breakVal += Object.values(this.filteredEffects()).flat()
                .reduce((sum, detail) => detail.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED" ? sum + detail.value1 : sum, 0)
            target.currentRemainingBreakGauge -= breakVal
            target.getMp(5)
            return;
        }
        let effTargets
        if (this === target) {
            effTargets = this.team.sliceTargets(this, this.team.kiokuStates, detail)
        } else {
            effTargets = [target]
        }

        if (detail.turn) {
            effTargets.forEach(t => t.activeEffectDetails[skillDetailId(detail)] = { applier: this.kioku.name, ...detail })
            if ("passiveSkillDetailMstId" in detail) {
                delete this.passiveEffectDetails[skillDetailId(detail)]
            }
        } else if (detail.abilityEffectType === "HASTE") {
            console.warn(this.kioku.name, "HASTING", detail, effTargets.map(k => k.kioku.name))
            effTargets.forEach(t => t.progressMeters(detail.value1 * 10))
        } else if (detail.abilityEffectType === "SLOW") {
            effTargets.forEach(t => t.progressMeters(-(detail.value1 * 10)))
        } else if (detail.abilityEffectType === "GAIN_EP_RATIO") {
            effTargets.forEach(t => t.getMp(target.maxMp * detail.value1 / 1000))
        } else if (detail.abilityEffectType === "GAIN_EP_FIXED") {
            effTargets.forEach(t => t.getMp(detail.value1))
        } else if (detail.abilityEffectType === "CUTOUT") {
            effTargets.forEach(t => t.activeEffectDetails[skillDetailId(detail)] = { ...detail, applier: this.kioku.name, turn: 1 })
        } else if (detail.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
            return detail.value1;
        } else if (detail.abilityEffectType === "GAIN_CHARGE_POINT") {
            this.currentMagic += detail.value1;
        } else if ("passiveSkillDetailMstId" in detail) {
            if (targetType === TargetType.init) {
                effTargets.forEach(t => t.passiveEffectDetails[skillDetailId(detail)] = detail)
            } else {
                console.warn("Passive was triggered late, handle?", this, effTargets, detail)
            }
        } else {
            console.warn("Active without turn", detail)
        }
        return;
    }
}


// Mirrors TurnReferee.SortByTurnOrder's four-key comparator exactly:
//   1. gauge value ascending      (here: secondsUntilAbleToAct ascending)
//   2. TurnOrderPriority descending
//   3. Team ascending (whichever team `team1Ref` resolves to sorts first)
//   4. Id ascending (posIdx - only ever decisive within the same team)
// `team1Ref` just needs to be a stable anchor: pass a PvPTeam's own team1
// reference for cross-team comparisons, or the team itself for intra-team
// comparisons (where every candidate shares the same team, so key 3 never
// actually distinguishes anything and it falls through to posIdx).
export function compareTurnOrder(a: KiokuState, b: KiokuState, team1Ref: PvPTeam): number {
    const secDiff = a.secondsUntilAbleToAct() - b.secondsUntilAbleToAct()
    if (secDiff !== 0) return secDiff
    if (a.turnOrderPriority !== b.turnOrderPriority) return b.turnOrderPriority - a.turnOrderPriority
    const aTeam = a.team === team1Ref ? 0 : 1
    const bTeam = b.team === team1Ref ? 0 : 1
    if (aTeam !== bTeam) return aTeam - bTeam
    return a.posIdx - b.posIdx
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
        this.triggerPassives(ProcessTiming.BATTLE_START, TargetType.init)
    }

    triggerPassives(timing: ProcessTiming, lastAction?: TargetType, lastActor?: KiokuState): Record<number, KiokuState> {
        let additionalAct: Record<number, KiokuState> = {};
        for (const k of this.kiokuStates) {
            Object.values(k.passiveEffectDetails).forEach(detail => {
                if (conditionSetRequiresActorIsSelf(detail) && (!lastActor || lastActor !== k)) return
                if (isTimingCorrect(timing, detail)) {
                    console.log("Appying effect from", lastActor, "to", k)
                    if (enemySkills.includes(detail.abilityEffectType)) {
                        this.otherTeam.kiokuStates.forEach(target => {
                            k.applyEffect(target, detail, lastAction)
                        })
                    } else {
                        const fua = k.applyEffect(k, detail, lastAction)
                        if (fua) additionalAct[fua] = k
                    }
                }
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
        // Previously just took the array-order-first unit under a 0.001
        // epsilon, which silently ignored TurnOrderPriority entirely and only
        // ever tiebroke by posIdx. This uses the real comparator instead.
        return this.kiokuStates.reduce((best, k) => compareTurnOrder(k, best, this) < 0 ? k : best)
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
            console.warn(actor.kioku.name, detail, "has range 1, who to target?")
            return [possibleTargets[0]]
        }
        if (detail.range === targetRange.PROXIMITY) return possibleTargets.slice(0, 3) // TODO: Handle proximity / Random
        if (detail.range === targetRange.ALL) return possibleTargets
        if (detail.range === targetRange.SELF) return [actor]
        console.warn("Unknown target", detail)
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
                possibleTargets = [actor]
            } else if (enemySkills.includes(detail.abilityEffectType)) {
                possibleTargets = this.otherTeam.kiokuStates
            } else {
                console.warn("Unknown effect type", detail.abilityEffectType, detail, "assuming enemy targets")
                possibleTargets = this.otherTeam.kiokuStates
            }
            console.log("Possible targets for", detail.abilityEffectType, "are", this.sliceTargets(actor, possibleTargets, detail).map(k => k.kioku.name))
            for (const target of this.sliceTargets(actor, possibleTargets, detail)) {
                console.log(actor.kioku.name, "applies", detail.abilityEffectType, "to", target.kioku.name, "w eff", effectName)
                actor.applyEffect(target, detail, effectName)
            }
        }
        actor.getMpFromType(effectName)
    }

    useUltimate(): [KiokuState, TargetType] | undefined {
        const readyKiokus = this.kiokuStates
            .filter(k => k.currentMp >= k.maxMp)
            .filter(k => k.maxMp > 0)
            .filter(k => k.currentRemainingBreakGauge > 0)
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
        actor.exitBreak()
        const effType = this.currentSp ? TargetType.skillId : TargetType.attackId
        this.triggerPassives(ProcessTiming.TURN_START, effType)
        this.act(actor, effType)
        console.warn("TRIGGERING PASSIVES AFTER", actor.kioku.name, actor, effType)
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
