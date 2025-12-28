import { BattleSnapshot, TargetType } from "../types/KiokuTypes";
import { KiokuState, PvPTeam } from "./PvPTeam";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;
    private lastActor: KiokuState = undefined;
    private lastTargetType: TargetType = undefined;
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
            lastActor: this.lastActor?.kioku.data.name,
            lastTeamIsTeam1: this.lastTeamIsTeam1,
            lastTargetType: this.lastTargetType
        }
    }

    traverseToNextActor(): PvPTeam {
        const seconds1 = this.team1.getSecondsUntilNextReadyKioku()
        const seconds2 = this.team2.getSecondsUntilNextReadyKioku()
        const secondsTraveled = seconds2 > seconds1 ? seconds1 : seconds2
        console.log("Next actors in", seconds1, "seconds for team 1 and", seconds2, "seconds for team 2. Traversing", secondsTraveled)
        this.team1.traverseSeconds(secondsTraveled)
        this.team2.traverseSeconds(secondsTraveled)
        if (seconds2 > seconds1) return this.team1
        return this.team2
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
    }
}
