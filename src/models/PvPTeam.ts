import { Kioku } from "./Kioku";


export class Team {
    private team: Kioku[];
    private debug: boolean;

    constructor(kiokus: Kioku[], debug = false) {
        this.team = kiokus;
        this.debug = debug;
    }

}
