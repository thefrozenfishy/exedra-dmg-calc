import { BattleSnapshot, TargetType } from "../types/KiokuTypes";
import { compareTurnOrder, KiokuState, PvPTeam } from "./PvPTeam";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;
    private lastActor?: KiokuState = undefined;
    private lastTargetType?: TargetType = undefined;
    private lastTeamIsTeam1: boolean = false;

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false) {
        this.team1 = team1;
        this.team2 = team2;
        this.team1.finishSetup(this.team2)
        this.team2.finishSetup(this.team1)
        this.debug = debug;
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
                    maxMagicStacks: k.kioku.maxMagicStacks,
                    baseSpd: k.kioku.data.minSpd,
                    secondsLeft: k.secondsUntilAbleToAct(),
                    distanceLeft: k.currentMetersRemaining,
                    name: k.kioku.name,
                    breakCurrent: k.currentRemainingBreakGauge,
                    maxBreakGauge: k.maxBreakGauge,
                    mp: k.currentMp,
                    maxMp: k.maxMp,
                    id: k.kioku.data.id,
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
                    maxMagicStacks: k.kioku.maxMagicStacks,
                    baseSpd: k.kioku.data.minSpd,
                    secondsLeft: k.secondsUntilAbleToAct(),
                    distanceLeft: k.currentMetersRemaining,
                    name: k.kioku.name,
                    breakCurrent: k.currentRemainingBreakGauge,
                    maxBreakGauge: k.maxBreakGauge,
                    mp: k.currentMp,
                    maxMp: k.maxMp,
                    id: k.kioku.data.id,
                }))
            },
            lastActor: this.lastActor?.kioku.name,
            lastTeamIsTeam1: this.lastTeamIsTeam1,
            lastTargetType: this.lastTargetType
        }
    }

    traverseToNextActor(): PvPTeam {
        const seconds1 = this.team1.getSecondsUntilNextReadyKioku()
        const seconds2 = this.team2.getSecondsUntilNextReadyKioku()
        console.log(seconds1, seconds2)
        const secondsTraveled = Math.min(seconds1, seconds2)
        console.log("Next actors in", seconds1, "seconds for team 1 and", seconds2, "seconds for team 2. Traversing", secondsTraveled)
        this.team1.traverseSeconds(secondsTraveled)
        this.team2.traverseSeconds(secondsTraveled)

        // Pick the actual next actor across BOTH teams with the real
        // TurnReferee.SortByTurnOrder comparator (gauge asc, priority desc,
        // team asc, id asc), instead of just comparing the two team-level
        // minimums: that comparison can't express a tie between a team1 unit
        // and a team2 unit at all, and previously handed every exact tie to
        // team2 (`seconds2 > seconds1 ? team1 : team2`), when the game's
        // team-ascending tiebreak actually favors team1.
        const allUnits = [...this.team1.kiokuStates, ...this.team2.kiokuStates]
        const winner = allUnits.reduce((best, k) => compareTurnOrder(k, best, this.team1) < 0 ? k : best)
        return winner.team === this.team1 ? this.team1 : this.team2
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
        console.log("===========================================================================")
    }
}
