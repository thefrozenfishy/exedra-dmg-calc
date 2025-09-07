import { BattleState } from "../types/KiokuTypes";
import { PvPTeam } from "./PvPTeam";

export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false) {
        this.team1 = team1;
        this.team2 = team2;
        this.team1.setOpponent(this.team2)
        this.team2.setOpponent(this.team1)
        this.team1.setup()
        this.team2.setup()
        this.debug = debug;
        this.advanceCharacters()
    }

    getCurrentState(): BattleState {
        return {
            allies: {
                sp: this.team1.currentSp,
                team: this.team1.kiokuStates.map(k => ({
                    atk: k.kioku.getBaseAtk(),
                    spd: k.currentSpd,
                    baseSpd: k.kioku.baseSpd,
                    secondsLeft: k.secondsUntilAct(),
                    name: k.kioku.name,
                    breakCurrent: k.breakGauge,
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
                    baseSpd: k.kioku.baseSpd,
                    secondsLeft: k.secondsUntilAct(),
                    name: k.kioku.name,
                    breakCurrent: k.breakGauge,
                    maxBreakGauge: k.maxBreakGauge,
                    mp: k.currentMp,
                    maxMp: k.maxMp,
                    id: k.kioku.data.id,
                }))
            }
        }
    }

    getNextActor(): [PvPTeam, number] {
        const seconds = this.team2.getSecondsToNext()
        const altSeconds = this.team1.getSecondsToNext()
        if (seconds > altSeconds) return [this.team1, altSeconds]
        return [this.team2, seconds]
    }

    advanceCharacters(): void {
        const [actorTeam, seconds] = this.getNextActor()
        this.team1.traverseSeconds(seconds)
        this.team2.traverseSeconds(seconds)
    }

    executeNextAction(): void {
        if (this.team2.useUltimate()) return
        if (this.team1.useUltimate()) return
        const [actorTeam, seconds] = this.getNextActor()
        this.team1.traverseSeconds(seconds)
        this.team2.traverseSeconds(seconds)
        actorTeam.useAttackOrSkill()
        actorTeam.resolveEndOfTurn()
    }
}