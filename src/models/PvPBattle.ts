import { BattleState } from "../types/KiokuTypes";
import { PvPTeam } from "./PvPTeam";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false) {
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
        this.advanceCharacters()
    }

    getCurrentState(): BattleState {
        return {
            allies: this.team1.kiokuStates.map(k => ({
                spd: k.currentSpd,
                baseSpd: k.kioku.baseSpd,
                distance: k.distanceRemaining,
                name: k.kioku.name,
                breakCurrent: k.breakGauge,
                maxBreakGauge: k.maxBreakGauge,
                mp: k.currentMp,
                maxMp: k.maxMp,
                id: k.kioku.data.id,
            })),
            enemies: this.team2.kiokuStates.map(k => ({
                spd: k.currentSpd,
                baseSpd: k.kioku.baseSpd,
                distance: k.distanceRemaining,
                name: k.kioku.name,
                breakCurrent: k.breakGauge,
                maxBreakGauge: k.maxBreakGauge,
                mp: k.currentMp,
                maxMp: k.maxMp,
                id: k.kioku.data.id,
            }))
        }
    }

    getNextActor(): [PvPTeam, PvPTeam, number] {
        const distance = this.team2.getNextDistance()
        const altDistance = this.team1.getNextDistance()
        if (distance > altDistance) return [this.team1, this.team2, altDistance]
        return [this.team2, this.team1, distance]
    }

    advanceCharacters(): void {
        const [a, b, distance] = this.getNextActor()

        this.team1.reduceDistance(distance)
        this.team2.reduceDistance(distance)
    }

    executeNextAction(): void {
        if (this.team2.useUltimate(this.team1)) return
        if (this.team1.useUltimate(this.team2)) return
        const [actorTeam, targetTeam, distance] = this.getNextActor()
        actorTeam.useAttackOrSkill(targetTeam)
    }
}