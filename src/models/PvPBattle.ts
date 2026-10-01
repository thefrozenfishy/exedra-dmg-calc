import { BattleSnapshot, TargetType, type TeamSnapshot } from "../types/KiokuTypes";
import { compareTurnOrder, KiokuState, PvPTeam, type FuaMap } from "./PvPTeam";
import { ProcessTiming } from "./BattleConditionParser";
import { BattleRng, type RngMode, type RngDecision } from "./BattleRng";
import type { PvPKioku } from "./PvPKioku";
import { startTimingSkills, enemySkillDetails, type WaveMeta } from "./PvE";
import { passiveDetailsByMstId } from "../utils/helpers";
import { unitLabel } from "./UnitStateEngine";

export interface BattleOptions {
    waves?: PvPKioku[][]                                        // later PvE enemy waves
    rngMode?: RngMode                                           // default "seed"
    decisions?: Map<number, RngDecision> | Record<number, RngDecision> // manual RNG flips / target picks, by event index
    manualTargeting?: boolean                                   // PvE "Manual": the user picks every target
    waveMeta?: WaveMeta[]                                       // PvE: Link HP settings of every wave (index 0 = first)
    roundLimit?: number                                         // Solo Raid: SoloRaidStageMst.limitRoundCount (0 = none)
    allyExtraPassives?: number[]                                // Solo Raid: buff passives every ally holds (passiveSkillMstId)
    raidCarry?: RaidCarry                                       // Solo Raid: continue from a previous attempt
}

// [CONFIRMED 3.19] Network.Definition.SoloRaid.BattleInfo, written by SoloRaidGameDirector.SyncBattleInfo (0x14a8220)
// when an attempt ends (win, loss, round limit) and read back by SetupBattleStageForSoloRaid on the next attempt.
// Enemy buffs/debuffs are not kept; the round count restarts at 1.
export interface RaidCarry {
    wave: number                 // 1-based wave of the stage
    nextEnemyIndex: number       // endless wave round-robin index
    linkHp: number               // shared pool (link type 1/2) or the main target's HP
    enemies: { appearanceId: number, positionId: number, hp: number, breakGauge: number, breakBonus: number, turnGauge: number }[]
    countdown?: { num: number, damage: number }
    seasonBuff?: { active: boolean, point: number, gauge: number }
}

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;
    private lastActor?: KiokuState = undefined;
    private lastTargetType?: TargetType = undefined;
    private lastTeamIsTeam1: boolean = false;

    readonly seed: number;

    private battleStartFollowUps: [PvPTeam, FuaMap][] = [];

    // Snapshots of every skill executed during the current executeNextAction call, in order.
    private actionSnapshots: BattleSnapshot[] = [];

    // `seed`: every random roll in the battle comes from one seeded generator, so the same
    // teams + seed always replay identically. Omit for a random seed (still recorded in
    // `this.seed` so an interesting run can be reproduced).
    // Later enemy waves (PvE): spawned when team2 is wiped.
    private pendingWaves: PvPKioku[][] = [];
    private waveMeta: WaveMeta[] = [];
    currentWave = 1;
    // Elapsed turn-gauge time (TurnReferee elapsedActionTime) and the Solo Raid round limit.
    elapsed = 0;
    private roundLimit = 0;
    finishedByRoundLimit = false;
    // Enemy start-timing acts (BattleStart / WaveStart condition rows) still to run.
    private startTimingActs: [KiokuState, number][] = [];

    // Every random decision of the battle (see BattleRng.ts for the modes).
    readonly rng: BattleRng;

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false, seed?: number, opts?: BattleOptions) {
        this.pendingWaves = [...(opts?.waves ?? [])];
        this.waveMeta = [...(opts?.waveMeta ?? [])];
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
        this.seed = seed ?? Math.floor(Math.random() * 2 ** 32);
        this.rng = new BattleRng(opts?.rngMode ?? "seed", this.seed, opts?.decisions);
        this.team1.rng = this.rng;
        this.team2.rng = this.rng;
        this.team1.manualTargeting = this.team2.manualTargeting = !!opts?.manualTargeting;
        this.team1.isTeam1 = true;
        const hook = (actor: KiokuState, type: TargetType, label?: string) => {
            this.team2.syncLinkHp()
            this.actionSnapshots.push(this.getCurrentState({ actor, type, label }))
        }
        this.team1.snapshotHook = hook;
        this.team2.snapshotHook = hook;
        this.team2.eventLog = this.team1.eventLog; // one shared, ordered log

        // [STRUCTURAL FIX, revision 3 - see report] Each phase now runs for BOTH teams
        // before the next phase starts for EITHER team. Previously team1 ran its full
        // finishSetup (bank load -> battle-start passives -> SPD/MP/break recompute)
        // before team2 started at all, which meant team1's battle-start passives
        // (which can target the enemy team) were already visible to team2's first SPD
        // computation while team2's battle-start passives could never reach team1's
        // (already-finished) first computation - breaking symmetry for what should be
        // a simultaneous battle start, even for two identically-built teams. See
        // PvPTeam.ts's finishSetup/applyPassivesForTiming/recomputeDerivedStats.
        this.team1.finishSetup(this.team2)
        this.team2.finishSetup(this.team1)
        this.team1.addEffectsToBank()
        this.team2.addEffectsToBank()
        // Solo Raid buff passives (Vanguard base points, season, party): SoloRaidBuffReferee.Init hands them to the
        // enemy list, where condition 1513 ("self is a player unit") keeps them inert; the player's copies arrive with
        // the unit data from the server. Card/support-like source: never scaled by effect-value states.
        for (const id of opts?.allyExtraPassives ?? [])
            for (const d of passiveDetailsByMstId.get(id) ?? []) this.team1.kiokuStates.forEach(k => k.addEffectToBank({ ...d, _noEffectValueScale: true } as any))
        this.roundLimit = opts?.roundLimit ?? 0
        // [CONFIRMED 3.19] GameDirectorBase$$InitializeBattle: every unit's turn gauge is reset
        // (b__46_2: speed = GetProcessedSpeed, gauge = 10000/speed) BEFORE
        // PassiveSkill.TriggeringOnBattleStart, so battle-start HASTE/SLOW move a real gauge
        // (previously the first reset ran afterwards and wiped them). SPD states added by the
        // passives then rescale the gauge (StateAbilityEffect -> UpdateTurnGaugeBySpeed), which
        // recomputeDerivedStats' updateSpd() does.
        for (const k of [...this.team1.kiokuStates, ...this.team2.kiokuStates]) k.resetDistanceRemaining()
        // Follow-ups queued by battle-start passives (e.g. Splashin' Kyubey Blast's opening
        // attack) were discarded here; TriggeringOnBattleStart queues them as AdditionalSkillActs
        // that run before the first turn, so they are kept and run by the first executeNextAction.
        this.battleStartFollowUps = [
            [this.team1, this.team1.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init)],
            [this.team2, this.team2.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init)],
        ]
        this.team1.recomputeDerivedStats()
        this.team2.recomputeDerivedStats()
        this.team2.setupLinkHp(this.waveMeta[0])
        if (opts?.raidCarry) this.applyRaidCarry(opts.raidCarry)
        this.startTimingActs = this.collectStartTimingActs()

        if (!this.isOver) this.traverseToNextActor()
    }

    // [CONFIRMED 3.19] TurnReferee.CalculateNextRound (0x15c18b0): t < 150 -> round 1, else floor((t - 150) / 100) + 2.
    static roundOf(t: number): number { return t < 150 ? 1 : Math.floor((t - 150) / 100) + 2 }
    get currentRound(): number { return PvPBattle.roundOf(this.elapsed) }

    // Solo Raid score: the real score is computed server-side. Approximation agreed with the user:
    // 20 points per unit of elapsed action value (a clear at 2.5 turns = 250 AV -> 5000 "team points used").
    get teamPointsUsed(): number { return Math.round(20 * this.elapsed) }

    // [CONFIRMED 3.19] SoloRaidGameDirector.ApplyEnemyInfo (0x14a6db0) + InitializeCountdownForRestart (0x14a7530):
    // enemies (matched by position) get their HP, break gauge, broken-damage bonus and turn gauge back; the link pool
    // and the endless index continue; a running countdown is restored on the enemy whose skill starts it.
    private applyRaidCarry(c: RaidCarry): void {
        const t2 = this.team2
        for (const e of c.enemies) {
            const u = t2.kiokuStates.find(k => k.positionId === e.positionId)
            if (!u) continue
            u.currentHp = Math.min(e.hp, u.maxHp)
            u.currentRemainingBreakGauge = e.breakGauge
            u.isBroken = u.maxBreakGauge >= 1 && e.breakGauge < 1
            u.breakedDamageReceiveRate = e.breakBonus
            u.turnGauge = e.turnGauge
        }
        if (t2.linkHp) {
            t2.linkHp.current = Math.max(0, Math.min(t2.linkHp.max, c.linkHp))
            if (t2.linkHp.type === 2) t2.kiokuStates.forEach(k => { k.currentHp = Math.min(t2.linkHp!.current, k.maxHp); k._linkSyncedHp = k.currentHp })
        } else {
            const main = t2.kiokuStates.find(k => k.enemy?.appearance.isMainTargetEnemy)
            if (main) main.currentHp = Math.min(c.linkHp, main.maxHp)
        }
        if (t2.endless) t2.endless.next = c.nextEnemyIndex % Math.max(1, t2.endless.list.length)
        const cd = t2.countdown
        if (cd && c.countdown && c.countdown.num > 0) {
            for (const u of t2.kiokuStates) {
                const d = u.enemy?.skills.flatMap(s => enemySkillDetails(s.skillMstId)).find(x => x.abilityEffectType === "COUNTDOWN_START")
                if (!d) continue
                Object.assign(cd, { max: d.turn - 1, value: c.countdown.num, cancelMax: d.value1, cancelTotal: c.countdown.damage, unit: u })
                u.activeEffectDetails.set(String((d as any).skillDetailMstId), { ...d, applier: u.kioku.name, _applierState: u, _accumCount: 1 } as any)
                break
            }
        }
        if (t2.soloRaid && c.seasonBuff) Object.assign(t2.soloRaid, { active: c.seasonBuff.active, point: c.seasonBuff.point, gauge: c.seasonBuff.gauge })
    }

    // [CONFIRMED 3.19] SoloRaidGameDirector.SyncBattleInfo: the state the next attempt continues from.
    raidCarry(): RaidCarry {
        const t2 = this.team2
        const alive = t2.kiokuStates.filter(k => !k.isDead).sort((a, b) => a.positionId - b.positionId)
        const main = t2.kiokuStates.find(k => k.enemy?.appearance.isMainTargetEnemy)
        return {
            wave: this.currentWave + this.firstWave,
            nextEnemyIndex: t2.endless?.next ?? 0,
            linkHp: t2.linkHp ? t2.linkHp.current : (main?.currentHp ?? 0),
            enemies: alive.map(k => ({ appearanceId: k.enemy!.appearance.questEnemyAppearanceMstId, positionId: k.positionId, hp: k.currentHp,
                breakGauge: k.currentRemainingBreakGauge, breakBonus: k.breakedDamageReceiveRate, turnGauge: k.turnGauge })),
            countdown: t2.countdown?.unit ? { num: t2.countdown.value, damage: t2.countdown.cancelTotal } : undefined,
            seasonBuff: t2.soloRaid ? { active: t2.soloRaid.active, point: t2.soloRaid.point, gauge: t2.soloRaid.gauge } : undefined,
        }
    }
    firstWave = 0

    private unitSnapshot(k: KiokuState): TeamSnapshot {
        return {
            atk: k.kioku.getBaseAtk(),
            spd: k.currentSpd,
            currSpdBuffs: k.currSpdEffects,
            buffs: k.currentBuffs(),
            debuffs: k.currentDebuffs(),
            ailments: k.currentAilments(),
            magicStacks: k.currentMagic,
            maxMagicStacks: k.currentMaxMagic, // [CONFIRMED] dynamic, not a static kioku stat - see currentMaxMagic's comment (CHARGE can resize it mid-battle)
            baseSpd: k.kioku.data.minSpd,
            secondsLeft: k.secondsUntilAbleToAct(),
            distanceLeft: k.currentMetersRemaining,
            name: k.kioku.name,
            breakCurrent: k.currentRemainingBreakGauge,
            maxBreakGauge: k.maxBreakGauge,
            mp: k.currentMp,
            maxMp: k.maxMp,
            id: k.kioku.data.id,
            hp: k.currentHp,
            maxHp: k.maxHp,
            isDead: k.isDead,
            barrier: k.barrierEndurance,
            maxBarrier: k.maxBarrierEndurance,
            shields: [...k.activeEffectDetails.values()].filter(d => d.abilityEffectType === "SHIELD").length,
            stunned: k.canNotAction,
            isBroken: k.isBroken,
            breakedDamageReceiveRate: k.breakedDamageReceiveRate,
            isEnemyUnit: !!k.enemy || undefined,
            hpGauges: k.enemy && k.enemy.appearance.hpGaugeCount > 1 ? k.enemy.hpGaugeCount : undefined,
        }
    }

    getCurrentState(as?: { actor: KiokuState, type: TargetType, label?: string }): BattleSnapshot {
        return {
            allies: { sp: this.team1.currentSp, team: this.team1.kiokuStates.map(k => this.unitSnapshot(k)) },
            enemies: { sp: this.team2.currentSp, team: this.team2.kiokuStates.map(k => this.unitSnapshot(k)) },
            lastActor: as ? as.actor.kioku.name : this.lastActor?.kioku.name,
            lastTeamIsTeam1: as ? as.actor.team.isTeam1 : this.lastTeamIsTeam1,
            lastActorPos: as ? as.actor.posIdx : this.lastActor?.posIdx,
            lastTargetType: as ? as.type : this.lastTargetType,
            actionLabel: as?.label,
            events: this.team1.eventLog.splice(0),
            linkHp: this.team2.linkHp ? { ...this.team2.linkHp } : undefined,
            round: this.currentRound,
            vanguard: this.team1.soloRaid ? { ...this.team1.soloRaid } : undefined,
            countdown: this.team2.countdown?.unit ? { value: this.team2.countdown.value, max: this.team2.countdown.max, cancelTotal: this.team2.countdown.cancelTotal, cancelMax: this.team2.countdown.cancelMax, unit: this.team2.countdown.unit.kioku.name } : undefined,
            rngEvents: this.rng.drain(),
            field: this.fieldSnapshot(),
        }
    }

    // [CONFIRMED 3.19] ZoneExpandAbilityEffect (0x1905ff0) releases every other unit's active zone, so at most one
    // field is up at a time; it lasts while its stock is above 0 (KiokuState.zoneActive). UI display only.
    private fieldSnapshot(): BattleSnapshot["field"] {
        for (const t of [this.team1, this.team2]) {
            const k = t.kiokuStates.find(u => !u.isDead && u.zoneActive)
            if (k) return { owner: k.kioku.name, ownerPos: k.posIdx, ownerIsTeam1: t.isTeam1, stack: k.zone.stack, max: k.zone.max, element: k.kioku.data.element }
        }
        return undefined
    }

    traverseToNextActor(): PvPTeam {
        const seconds1 = this.team1.getSecondsUntilNextReadyKioku()
        const seconds2 = this.team2.getSecondsUntilNextReadyKioku()
        console.debug(seconds1, seconds2)
        const secondsTraveled = Math.min(seconds1, seconds2)
        console.debug(
            "Next actors in",
            seconds1,
            "seconds for team 1 and",
            seconds2,
            "seconds for team 2. Traversing",
            secondsTraveled,
            "diff is",
            Math.abs(seconds1 - seconds2)
        )
        this.team1.traverseSeconds(secondsTraveled)
        this.team2.traverseSeconds(secondsTraveled)
        if (Number.isFinite(secondsTraveled)) this.elapsed += secondsTraveled
        // [CONFIRMED 3.19] TurnReferee.ShiftNextTurn (0x15c1c20): the Vanguard phase gauge runs down with the same dt.
        const sr = this.team1.soloRaid
        if (sr?.active && Number.isFinite(secondsTraveled)) {
            sr.gauge = Math.max(0, sr.gauge - secondsTraveled)
            if (sr.gauge <= 0) { sr.active = false; sr.gauge = 0; this.team1.eventLog.push({ kind: "summon", source: "Labyrinth Vanguard", target: "phase ended", amount: 0, targetIsTeam1: true } as any) }
        }

        const allUnits = [...this.team1.aliveKiokus, ...this.team2.aliveKiokus]
        return allUnits.reduce((best, k) => compareTurnOrder(k, best, this.team1) < 0 ? k : best).team
    }

    // Runs the next turn (or ultimate) and returns one snapshot per executed skill: the action
    // itself, then every follow-up, extra action and combo step, in the order they happened.
    // End-of-turn effects (TurnEnd passives, DOT ticks, buff expiry) are folded into the last one.
    // The battle ends as soon as one side has no living unit.
    get isOver(): boolean {
        return this.finishedByRoundLimit || this.team1.isWiped || (this.team2.waveCleared && !this.pendingWaves.length)
    }

    // "win" / "lose" once the battle is over (team1 = allies).
    get result(): "win" | "lose" | undefined {
        if (this.team1.isWiped || this.finishedByRoundLimit) return "lose"
        if (this.team2.waveCleared && !this.pendingWaves.length) return "win"
        return undefined
    }

    // [CONFIRMED 3.19] enemy StartTimingActs run in turn order: OrderByDescending(IsMainTargetEnemy),
    // then SortByTurnOrder (UnitBrain.RegisterEnemyUnitsStartConditionTimingAction 0x17f2120).
    private collectStartTimingActs(): [KiokuState, number][] {
        const units = this.team2.aliveKiokus.filter(k => k.enemy && !k.isBroken)
            .sort((a, b) => Number(!!b.enemy!.appearance.isMainTargetEnemy) - Number(!!a.enemy!.appearance.isMainTargetEnemy)
                || compareTurnOrder(a, b, this.team1))
        return units.flatMap(u => startTimingSkills(u).map(id => [u, id] as [KiokuState, number]))
    }

    // [CONFIRMED 3.19] WaveReferee.WaveTransition: the next wave's units replace the wiped ones.
    // [APPROXIMATION] their passives run as BATTLE_START (the game has a separate WaveStart timing).
    private spawnNextWave(): BattleSnapshot {
        const kiokus = this.pendingWaves.shift()!
        this.currentWave++
        this.team2.replaceUnits(kiokus)
        this.team2.addEffectsToBank()
        const fuas = this.team2.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init)
        this.team2.recomputeDerivedStats()
        this.team2.setupLinkHp(this.waveMeta[this.currentWave - 1])
        for (const k of this.team2.kiokuStates) k.resetDistanceRemaining()
        if (Object.keys(fuas).length) this.battleStartFollowUps.push([this.team2, fuas])
        this.startTimingActs = this.collectStartTimingActs()
        return { ...this.getCurrentState(), lastActor: `Wave ${this.currentWave}`, lastActorPos: undefined, lastTargetType: undefined, wave: this.currentWave }
    }

    // Manual control: between actions, before time moves on to the next actor, the player may fire any
    // ready ultimate (one per prompt, in the order picked; each is its own action and the prompt comes
    // back while ultimates are ready) or continue. "Continue" closes the prompt until the next turn.
    private ultimateWindowPassed = false
    private manualUltimateWindow(): [KiokuState, TargetType] | undefined {
        if (this.ultimateWindowPassed) return undefined
        const ready = this.team1.readyUltimates()
        if (!ready.length) return undefined
        const i = this.rng.pick("action", "Between actions: fire an ultimate?", ["Continue", ...ready.map(u => `Ultimate: ${unitLabel(u)}`)])
        if (i <= 0) {
            this.ultimateWindowPassed = true
            return undefined
        }
        return this.team1.useUltimateOf(ready[i - 1])
    }

    // [CONFIRMED 3.19] SoloGameDirectorBase.Request(TimeForward) (0x14a4f60) -> SoloRaidBuffReferee.CheckActive (0x15c0190):
    // between acts, with 100 points and not active: active, points 0, gauge = EnhancedSkillTurnGaugeValue; then the
    // SeasonBuffActive (10) passives (e.g. +5 SP, EP, SPD) and a state refresh. Its own entry.
    private activateVanguard(): BattleSnapshot[] | undefined {
        const sr = this.team1.soloRaid
        if (!sr || sr.active || sr.point < sr.maxPoint) return undefined
        sr.active = true
        sr.point = 0
        sr.gauge = sr.maxGauge
        this.team1.eventLog.push({ kind: "summon", source: "Labyrinth Vanguard", target: "Activation Phase", amount: 0, targetIsTeam1: true } as any)
        const fuas = [this.team1.applyPassivesForTiming(ProcessTiming.SEASON_BUFF_ACTIVE, TargetType.init), this.team2.applyPassivesForTiming(ProcessTiming.SEASON_BUFF_ACTIVE, TargetType.init)]
        this.team1.recomputeDerivedStats()
        this.team2.recomputeDerivedStats()
        const snap = { ...this.getCurrentState(), lastActor: "Labyrinth Vanguard activated", lastTeamIsTeam1: true, lastActorPos: undefined, lastTargetType: undefined }
        this.actionSnapshots = []
        this.team1.triggerFua(fuas[0]); this.team2.triggerFua(fuas[1])
        const more = this.actionSnapshots
        this.actionSnapshots = []
        return [snap, ...more]
    }

    private supplyEndless(): BattleSnapshot[] | undefined {
        if (!this.team2.supplyEndless().length) return undefined
        const snap = { ...this.getCurrentState(), lastActor: this.team2.linkHp?.name || "Reinforcements", lastTeamIsTeam1: false, lastActorPos: undefined, lastTargetType: undefined }
        this.actionSnapshots = []
        return [snap]
    }

    // Returns [] once the battle is over.
    executeNextAction(): BattleSnapshot[] {
        this.actionSnapshots = []
        if (this.isOver) return []
        if (this.team2.waveCleared && this.pendingWaves.length) {
            const waveSnap = this.spawnNextWave()
            this.traverseToNextActor()
            return [waveSnap]
        }
        // First call: the battle-start follow-ups, then the enemies' start-timing acts, as their own
        // entries, before the first turn.
        const opening = this.battleStartFollowUps.filter(([, m]) => Object.keys(m).length)
        this.battleStartFollowUps = []
        const startActs = this.startTimingActs
        this.startTimingActs = []
        if (opening.length || startActs.length) {
            for (const [team, fuas] of opening) team.triggerFua(fuas)
            for (const [unit, skillId] of startActs) if (!this.isOver) unit.team.runStartTimingAction(unit, skillId)
            const snaps = this.actionSnapshots
            this.actionSnapshots = []
            if (!this.isOver) this.traverseToNextActor()
            if (snaps.length) return [...snaps, ...this.formChange()]
        }
        // (With every enemy down there is nothing to fire ultimates at: refill first.)
        if (this.team2.isWiped) {
            const supplied = this.supplyEndless()
            if (supplied) return supplied
        }
        this.lastTeamIsTeam1 = false
        let eff: [KiokuState, TargetType] | undefined = this.team2.useUltimate()
        if (!eff) {
            this.lastTeamIsTeam1 = true
            eff = this.team1.manualTargeting ? this.manualUltimateWindow() : this.team1.useUltimate()
        }
        if (!eff) {
            // Endless (Link HP type 1) waves refill empty positions before time moves on - its own entry.
            const supplied = this.supplyEndless()
            if (supplied) return supplied
            const activated = this.activateVanguard()
            if (activated) return activated
            const actorTeam = this.traverseToNextActor()
            // [CONFIRMED 3.19] SoloRaidJudgeResultReferee / QuestJudgeResultReferee.CheckBattleFinishBeforeAct (0x14a4410):
            // an act that would start in a round past the limit ends the attempt as a loss (damage dealt is kept).
            if (this.roundLimit > 0 && this.currentRound > this.roundLimit) {
                this.finishedByRoundLimit = true
                return [{ ...this.getCurrentState(), lastActor: `Round limit (${this.roundLimit}) reached`, lastActorPos: undefined, lastTargetType: undefined }]
            }
            eff = actorTeam.useAttackOrSkill()
            this.lastTeamIsTeam1 = this.team1 === actorTeam
            this.ultimateWindowPassed = false
        }
        this.lastActor = eff[0]
        this.lastTargetType = eff[1]
        this.resolveEndOfTurn()

        const snaps = this.actionSnapshots
        const last = snaps.pop()
        if (last) {
            const final = this.getCurrentState()
            snaps.push({ ...final, lastActor: last.lastActor, lastTeamIsTeam1: last.lastTeamIsTeam1, lastActorPos: last.lastActorPos, lastTargetType: last.lastTargetType, actionLabel: last.actionLabel, events: [...(last.events ?? []), ...(final.events ?? [])], rngEvents: [...(last.rngEvents ?? []), ...(final.rngEvents ?? [])] })
        } else {
            snaps.push(this.getCurrentState()) // e.g. a stunned unit's skipped turn
        }
        this.actionSnapshots = []
        return [...snaps, ...this.formChange()]
    }

    // Boss form change (ModeChangeAct): queued after the act that crossed the threshold, as its own entry.
    private formChange(): BattleSnapshot[] {
        if (this.isOver) return []
        const unit = this.team2.checkModeChange()
        if (!unit) return []
        const snap: BattleSnapshot = { ...this.getCurrentState(), lastActor: unit.kioku.name, lastTeamIsTeam1: false, lastActorPos: unit.posIdx, lastTargetType: undefined, actionLabel: "Form change" }
        const fuas = this.actionSnapshots
        this.actionSnapshots = []
        return [snap, ...fuas]
    }

    resolveEndOfTurn(): void {
        this.team2.resolveEndOfTurn()
        this.team1.resolveEndOfTurn()
        this.team2.syncLinkHp()
        console.debug("===========================================================================")
    }
}
