import { BattleSnapshot, TargetType } from "../types/KiokuTypes";
import { compareTurnOrder, KiokuState, PvPTeam } from "./PvPTeam";
import { ProcessTiming } from "./BattleConditionParser";
import { seededRng } from "./BattleMath";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;
    private lastActor?: KiokuState = undefined;
    private lastTargetType?: TargetType = undefined;
    private lastTeamIsTeam1: boolean = false;

    readonly seed: number;

    // `seed`: every random roll in the battle comes from one seeded generator, so the same
    // teams + seed always replay identically. Omit for a random seed (still recorded in
    // `this.seed` so an interesting run can be reproduced).
    constructor(team1: PvPTeam, team2: PvPTeam, debug = false, seed?: number) {
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
        this.seed = seed ?? Math.floor(Math.random() * 2 ** 32);
        const rng = seededRng(this.seed);
        this.team1.rng = rng;
        this.team2.rng = rng;
        this.team1.isTeam1 = true;
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
        this.team1.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init)
        this.team2.applyPassivesForTiming(ProcessTiming.BATTLE_START, TargetType.init)
        this.team1.recomputeDerivedStats()
        this.team2.recomputeDerivedStats()

        this.traverseToNextActor()
    }

    getCurrentState(): BattleSnapshot {
        return {
            allies: {
                sp: this.team1.currentSp,
                team: this.team1.kiokuStates.map(k => ({
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
                    // NEW: HP is now actually tracked (see KiokuState.currentHp/maxHp
                    // in PvPTeam.ts) instead of always reading a static 100%.
                    hp: k.currentHp,
                    maxHp: k.maxHp,
                    isDead: k.isDead,
                    barrier: k.barrierEndurance,
                    maxBarrier: k.maxBarrierEndurance,
                    shields: [...k.activeEffectDetails.values()].filter(d => d.abilityEffectType === "SHIELD").length,
                    stunned: k.canNotAction,
                    isBroken: k.isBroken,
                    breakedDamageReceiveRate: k.breakedDamageReceiveRate,
                }))
            },
            enemies: {
                sp: this.team2.currentSp,
                team: this.team2.kiokuStates.map(k => ({
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
                }))
            },
            lastActor: this.lastActor?.kioku.name,
            lastTeamIsTeam1: this.lastTeamIsTeam1,
            lastTargetType: this.lastTargetType,
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

        const allUnits = [...this.team1.kiokuStates, ...this.team2.kiokuStates]
        return allUnits.reduce((best, k) => compareTurnOrder(k, best, this.team1) < 0 ? k : best).team
    }

    executeNextAction(): void {
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
    }

    resolveEndOfTurn(): void {
        this.team2.resolveEndOfTurn()
        this.team1.resolveEndOfTurn()
        console.debug("===========================================================================")
    }
}
