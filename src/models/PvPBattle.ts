import { BattleSnapshot, TargetType, type TeamSnapshot } from "../types/KiokuTypes";
import { compareTurnOrder, KiokuState, PvPTeam, type FuaMap } from "./PvPTeam";
import { ProcessTiming } from "./BattleConditionParser";
import { seededRng } from "./BattleMath";
import type { PvPKioku } from "./PvPKioku";
import { startTimingSkills } from "./PvE";

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
    currentWave = 1;
    // Enemy start-timing acts (BattleStart / WaveStart condition rows) still to run.
    private startTimingActs: [KiokuState, number][] = [];

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false, seed?: number, opts?: { waves?: PvPKioku[][] }) {
        this.pendingWaves = [...(opts?.waves ?? [])];
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
        this.seed = seed ?? Math.floor(Math.random() * 2 ** 32);
        const rng = seededRng(this.seed);
        this.team1.rng = rng;
        this.team2.rng = rng;
        this.team1.isTeam1 = true;
        const hook = (actor: KiokuState, type: TargetType, label?: string) => {
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
        this.startTimingActs = this.collectStartTimingActs()

        if (!this.isOver) this.traverseToNextActor()
    }

    private unitSnapshot(k: KiokuState): TeamSnapshot {
        return {
            atk: k.kioku.getBaseAtk(),
            spd: k.currentSpd,
            currSpdBuffs: k.currSpdEffects,
            buffs: k.currentBuffs(),
            debuffs: k.currentDebuffs(),
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
        }
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

        const allUnits = [...this.team1.aliveKiokus, ...this.team2.aliveKiokus]
        return allUnits.reduce((best, k) => compareTurnOrder(k, best, this.team1) < 0 ? k : best).team
    }

    // Runs the next turn (or ultimate) and returns one snapshot per executed skill: the action
    // itself, then every follow-up, extra action and combo step, in the order they happened.
    // End-of-turn effects (TurnEnd passives, DOT ticks, buff expiry) are folded into the last one.
    // The battle ends as soon as one side has no living unit.
    get isOver(): boolean {
        return this.team1.isWiped || (this.team2.isWiped && !this.pendingWaves.length)
    }

    // "win" / "lose" once the battle is over (team1 = allies).
    get result(): "win" | "lose" | undefined {
        if (this.team1.isWiped) return "lose"
        if (this.team2.isWiped && !this.pendingWaves.length) return "win"
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
        for (const k of this.team2.kiokuStates) k.resetDistanceRemaining()
        if (Object.keys(fuas).length) this.battleStartFollowUps.push([this.team2, fuas])
        this.startTimingActs = this.collectStartTimingActs()
        return { ...this.getCurrentState(), lastActor: `Wave ${this.currentWave}`, lastActorPos: undefined, lastTargetType: undefined, wave: this.currentWave }
    }

    // Returns [] once the battle is over.
    executeNextAction(): BattleSnapshot[] {
        this.actionSnapshots = []
        if (this.isOver) return []
        if (this.team2.isWiped && this.pendingWaves.length) {
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
            if (snaps.length) return snaps
        }
        this.lastTeamIsTeam1 = false
        let eff: [KiokuState, TargetType] | undefined = this.team2.useUltimate()
        if (!eff) {
            this.lastTeamIsTeam1 = true
            eff = this.team1.useUltimate()
        }
        if (!eff) {
            const actorTeam = this.traverseToNextActor()
            eff = actorTeam.useAttackOrSkill()
            this.lastTeamIsTeam1 = this.team1 === actorTeam
        }
        this.lastActor = eff[0]
        this.lastTargetType = eff[1]
        this.resolveEndOfTurn()

        const snaps = this.actionSnapshots
        const last = snaps.pop()
        if (last) {
            const final = this.getCurrentState()
            snaps.push({ ...final, lastActor: last.lastActor, lastTeamIsTeam1: last.lastTeamIsTeam1, lastActorPos: last.lastActorPos, lastTargetType: last.lastTargetType, actionLabel: last.actionLabel, events: [...(last.events ?? []), ...(final.events ?? [])] })
        } else {
            snaps.push(this.getCurrentState()) // e.g. a stunned unit's skipped turn
        }
        this.actionSnapshots = []
        return snaps
    }

    resolveEndOfTurn(): void {
        this.team2.resolveEndOfTurn()
        this.team1.resolveEndOfTurn()
        console.debug("===========================================================================")
    }
}
