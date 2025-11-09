import { BattleSnapshot } from "../types/KiokuTypes";
import { PvPTeam } from "./PvPTeam";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;

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
            }
        }
    }

    traverseToNextActor(): PvPTeam {
        const seconds1 = this.team1.getSecondsUntilNextReadyKioku()
        const seconds2 = this.team2.getSecondsUntilNextReadyKioku()
        this.team1.traverseSeconds(seconds2 > seconds1 ? seconds1 : seconds2)
        this.team2.traverseSeconds(seconds2 > seconds1 ? seconds1 : seconds2)
        if (seconds2 > seconds1) return this.team1
        return this.team2
    }

    executeNextAction(): void {
        if (this.team2.useUltimate()) return
        if (this.team1.useUltimate()) return
        const actorTeam = this.traverseToNextActor()
        actorTeam.useAttackOrSkill()
        actorTeam.resolveEndOfTurn()
    }
}
