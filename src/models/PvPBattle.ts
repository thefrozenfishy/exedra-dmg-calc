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

    getSpeedsAndStartAVs() {
        const av = Math.min(this.team1.getMinAv(), this.team2.getMinAv())
        this.team1.reduceAv(av)
        this.team2.reduceAv(av)
        return {
            allies: {
                spd: this.team1.getTeamSpeeds(),
                av: this.team1.getTeamAvs()
            },
            enemies: {
                spd: this.team2.getTeamSpeeds(),
                av: this.team2.getTeamAvs()
            },
        }
    }

    executeNextAction() {
        const av = Math.min(this.team1.getMinAv(), this.team2.getMinAv())
        this.team1.reduceAv(av)
        this.team2.reduceAv(av)
        const [targetTeam, next_act]: [PvPTeam, (k) => ActionResult] = [
            ...this.team2.getReadyToAct().map(r => [this.team1, r]),
            ...this.team1.getReadyToAct().map(r => [this.team2, r]),
        ][0]
        const targetKioku = targetTeam.getTarget()
        // TODO Get target distribution here
        const actionEffect = next_act(targetKioku)
    }
}
