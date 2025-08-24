import { Team } from "./Team";


export class Battle {
    private team1: Team;
    private team2: Team;
    private debug: boolean;

    constructor(team1: Team, team2:Team, debug= false) {
        this.team1 = team1;
        this.team2 = team2;
        this.debug = debug;
    }

    simulateBattle() {
        console.log(this.team1)
        console.log(this.team2)
    }
}
