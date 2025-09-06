import { ActionResult, PvPTeam } from "./PvPTeam";


export class PvPBattle {
    private team1: PvPTeam;
    private team2: PvPTeam;
    private debug: boolean;

    constructor(team1: PvPTeam, team2: PvPTeam, debug = false) {
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
    }

    getNextActor(): [PvPTeam, number] {
        const distance = this.team2.getNextDistance()
        const altDistance = this.team1.getNextDistance()
        if (distance > altDistance) return [this.team1, altDistance]
        return [this.team2, distance]
    }

    executeNextAction() {
        const [team, distance] = this.getNextActor()
        console.log(team, distance)
        this.team1.reduceDistance(distance)
        this.team2.reduceDistance(distance)

        team.act()

        return {
            allies: {
                spd: this.team1.getTeamSpeeds(),
                baseSpd: this.team1.getTeamBaseSpeeds(),
                distance: this.team1.getTeamDistanceRemaining()
            },
            enemies: {
                spd: this.team2.getTeamSpeeds(),
                baseSpd: this.team2.getTeamBaseSpeeds(),
                distance: this.team2.getTeamDistanceRemaining()
            },
        }
    }
}
