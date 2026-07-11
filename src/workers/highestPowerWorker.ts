import { Kioku } from "../models/Kioku";
import { ScoreAttackKioku } from "../models/ScoreAttackKioku";
import { Character, highestPwrPortraits } from "../types/KiokuTypes";

const MAIN_CANDIDATES = 7;
const SUPPORT_CANDIDATES = 20;

interface Candidate {
    char: Character;
    kioku: Kioku;
    pwr: number;
}

function combinations<T>(arr: T[], k: number): T[][] {
    const result: T[][] = [];
    function dfs(start: number, current: T[]) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            dfs(i + 1, current);
            current.pop();
        }
    }
    dfs(0, []);
    return result;
}

self.onmessage = function (e: MessageEvent) {
    const characters: Character[] = e.data;

    const ranked: Candidate[] = [...characters]
        .map(char => ({
            char,
            kioku: new ScoreAttackKioku({ ...char, portrait: undefined }),
        }))
        .map(c => ({ ...c, pwr: c.kioku.getTotalPower() }))
        .sort((a, b) => b.pwr - a.pwr);

    const no_special_ranked: Candidate[] = [...characters]
        .map(char => ({
            char,
            kioku: new ScoreAttackKioku({ ...char, portrait: undefined, specialLvl: 0 }),
        }))
        .map(c => ({ ...c, pwr: c.kioku.getTotalPower() }))
        .sort((a, b) => b.pwr - a.pwr);

    const mains = ranked.slice(0, MAIN_CANDIDATES);
    const supportPool = no_special_ranked.slice(0, SUPPORT_CANDIDATES);
    console.log(
        "Considering main pool\n", 
        mains.map(m => [m.char.name, m.pwr]), 
        "\nand supports\n", 
        supportPool.map(m => [m.char.name, m.pwr]),
    )
    console.log(
        "Available was:\n", 
        ranked.map(m => [m.char.name, m.pwr]), 
        "\nand supports\n", 
        no_special_ranked.map(m => [m.char.name, m.pwr]),
    )

    const scoreCache = new Map<string, Map<string, Map<string, number>>>();

    for (const main of mains) {
        let portraitMap = scoreCache.get(main.char.name);
        if (!portraitMap) {
            portraitMap = new Map();
            scoreCache.set(main.char.name, portraitMap);
        }

        for (const portrait of highestPwrPortraits) {
            let supportMap = portraitMap.get(portrait);
            if (!supportMap) {
                supportMap = new Map();
                portraitMap.set(portrait, supportMap);
            }

            for (const support of supportPool) {
                if (support.char.name === main.char.name) continue;

                const power = new ScoreAttackKioku({
                    ...main.char,
                    portrait,
                    supportKey: support.kioku.getKey()
                }).getTotalPower();

                supportMap.set(support.char.name, power);
            }
        }
    }

    const teams = combinations(mains, 5);
    let maxTeamPower = -Infinity;
    let bestTeamSetup: [string, string, string][] = [];

    teams.sort((teamA, teamB) => {
        const powerA = teamA.reduce((sum, c) => sum + c.kioku.getTotalPower(), 0);
        const powerB = teamB.reduce((sum, c) => sum + c.kioku.getTotalPower(), 0);
        return powerB - powerA;
    });

    for (const team of teams) {
        const teamNames = new Set(team.map(t => t.char.name));
        const options: { portrait: string; supportName: string; power: number; }[][] = [];
        const maxPossibleSlotPower = [0, 0, 0, 0, 0];

        for (let idx = 0; idx < team.length; idx++) {
            const main = team[idx];
            const list: { portrait: string; supportName: string; power: number; }[] = [];
            const portraitMap = scoreCache.get(main.char.name)!;

            for (const portrait of highestPwrPortraits) {
                const supportMap = portraitMap.get(portrait)!;
                for (const support of supportPool) {
                    if (teamNames.has(support.char.name)) continue;
                    const power = supportMap.get(support.char.name);
                    if (power !== undefined) {
                        list.push({ portrait, supportName: support.char.name, power });
                    }
                }
            }
            list.sort((a, b) => b.power - a.power);
            options.push(list);
            maxPossibleSlotPower[idx] = list.length > 0 ? list[0].power : 0;
        }

        const totalTheoreticalMax = maxPossibleSlotPower.reduce((a, b) => a + b, 0);
        if (totalTheoreticalMax <= maxTeamPower) {
            continue;
        }

        const remainingMax = [0, 0, 0, 0, 0, 0];
        for (let i = 4; i >= 0; i--) {
            remainingMax[i] = maxPossibleSlotPower[i] + remainingMax[i + 1];
        }

        const usedPortraits = new Set<string>();
        const usedSupports = new Set<string>();
        const current: [string, string, string][] = [];

        let localCalls = 0;
        let localAborted = false;

        function fastDfs(index: number, currentPower: number) {
            if (localAborted) return;
            localCalls++;

            if (localCalls > 15000) {
                localAborted = true;
                return;
            }

            if (index === 5) {
                if (currentPower > maxTeamPower) {
                    maxTeamPower = currentPower;
                    bestTeamSetup = [...current];
                }
                return;
            }

            if (currentPower + remainingMax[index] <= maxTeamPower) {
                return;
            }

            const currentOptions = options[index];
            for (let i = 0; i < currentOptions.length; i++) {
                const option = currentOptions[i];

                if (usedPortraits.has(option.portrait)) continue;
                if (usedSupports.has(option.supportName)) continue;

                if (currentPower + option.power + remainingMax[index + 1] <= maxTeamPower) {
                    break;
                }

                usedPortraits.add(option.portrait);
                usedSupports.add(option.supportName);
                current.push([team[index].char.name, option.supportName, option.portrait]);

                fastDfs(index + 1, currentPower + option.power);

                current.pop();
                usedPortraits.delete(option.portrait);
                usedSupports.delete(option.supportName);
            }
        }

        fastDfs(0, 0);
    }

    const bestTeam = {
        attacker: characters.find(c => c.name === bestTeamSetup[0][0]),
        portrait: bestTeamSetup[0][2],
        atk_supp: characters.find(c => c.name === bestTeamSetup[0][1]),
        supp1: characters.find(c => c.name === bestTeamSetup[1][0]),
        supp1supp: characters.find(c => c.name === bestTeamSetup[1][1]),
        supp1portrait: bestTeamSetup[1][2],
        supp2: characters.find(c => c.name === bestTeamSetup[2][0]),
        supp2supp: characters.find(c => c.name === bestTeamSetup[2][1]),
        supp2portrait: bestTeamSetup[2][2],
        supp3: characters.find(c => c.name === bestTeamSetup[3][0]),
        supp3supp: characters.find(c => c.name === bestTeamSetup[3][1]),
        supp3portrait: bestTeamSetup[3][2],
        supp4: characters.find(c => c.name === bestTeamSetup[4][0]),
        supp4supp: characters.find(c => c.name === bestTeamSetup[4][1]),
        supp4portrait: bestTeamSetup[4][2],
    }
    self.postMessage({ bestTeam, maxTeamPower });
};