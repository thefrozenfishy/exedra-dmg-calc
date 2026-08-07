import { Kioku } from "../models/Kioku";
import { ScoreAttackKioku } from "../models/ScoreAttackKioku";
import { LuxMagica } from "../types/enums";
import { Character, highestPwrPortraits } from "../types/KiokuTypes";

const MAIN_CANDIDATES = 8;
const TEAM_SIZE = 5;
const SUPPORT_PWR_THRESHOLD = 400;
const PLACEHOLDER_ATTACKER = LuxMagica;
const PLACEHOLDER_PORTRAIT = "A Distant Ideal";

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

function buildTeamObject(setup: [string, string, string][], characters: Character[]) {
    return {
        attacker: characters.find(c => c.name === setup[0][0]),
        portrait: setup[0][2],
        atk_supp: characters.find(c => c.name === setup[0][1]),
        supp1: characters.find(c => c.name === setup[1][0]),
        supp1supp: characters.find(c => c.name === setup[1][1]),
        supp1portrait: setup[1][2],
        supp2: characters.find(c => c.name === setup[2][0]),
        supp2supp: characters.find(c => c.name === setup[2][1]),
        supp2portrait: setup[2][2],
        supp3: characters.find(c => c.name === setup[3][0]),
        supp3supp: characters.find(c => c.name === setup[3][1]),
        supp3portrait: setup[3][2],
        supp4: characters.find(c => c.name === setup[4][0]),
        supp4supp: characters.find(c => c.name === setup[4][1]),
        supp4portrait: setup[4][2],
    };
}

self.onmessage = function (e: MessageEvent) {
    try {
        const characters: Character[] = e.data;

        function postProgress(completedRuns: number, expectedTotalRuns: number, extra: Record<string, unknown> = {}) {
            self.postMessage({ type: 'progress', completedRuns, expectedTotalRuns, ...extra });
        }
        const placeholder_pwr = new ScoreAttackKioku({
            ...characters.find(c => c.name === LuxMagica),
            portrait: PLACEHOLDER_PORTRAIT,
            supportKey: new ScoreAttackKioku({
                ...characters.find(c => c.name === LuxMagica),
            }).getKey()
        }).getTotalPower()

        const ranked: Candidate[] = [...characters]
            .map(char => ({
                char,
                kioku: new ScoreAttackKioku({ ...char, portrait: undefined }),
            }))
            .map(c => ({ ...c, pwr: c.kioku.getTotalPower() }))
            .sort((a, b) => b.pwr - a.pwr);

        const supportPoolCandidates: Candidate[] = [...characters]
            .map(char => ({
                char,
                kioku: new ScoreAttackKioku({ ...char, portrait: undefined, specialLvl: 0 }),
            }))
            .map(c => ({ ...c, pwr: c.kioku.getTotalPower() }))
            .sort((a, b) => b.pwr - a.pwr);
        const supportPwrThreshold = (supportPoolCandidates.at(TEAM_SIZE * 2)?.pwr || 0) - SUPPORT_PWR_THRESHOLD
        const supportPool = supportPoolCandidates.filter(c => c.pwr > supportPwrThreshold).reverse()

        const mains = ranked.slice(0, MAIN_CANDIDATES).reverse();
        const teams = combinations(mains, 5);

        const expectedTotalRuns = mains.length * (supportPool.length - 1) + teams.length;
        let completedRuns = 0;

        const scoreCache = new Map<string, Map<string, Map<string, number>>>();

        const topCurrent = mains.map(m => m.char.name);
        const topFiveSet = new Set(topCurrent);
        const bestPerMain = new Map<string, { portrait: string; supportName: string; power: number }>();

        function buildCurrentBestFiveSetup(): [string, string, string, number][] {
            return topCurrent.map(name => {
                const best = bestPerMain.get(name);
                return best
                    ? [name, best.supportName, best.portrait, best.power]
                    : [PLACEHOLDER_ATTACKER, PLACEHOLDER_ATTACKER, PLACEHOLDER_PORTRAIT, placeholder_pwr];
            }).sort((a, b) => b[3] - a[3]);
        }

        const postCurrentProgress = () => {
            const currTeam = buildCurrentBestFiveSetup()
            postProgress(completedRuns, expectedTotalRuns, {
                currentBestTeam: buildTeamObject(currTeam, characters),
                currentBestPwr: (currTeam.slice(0, TEAM_SIZE).reduce((p, c) => p + c[3], 0) * 0.95).toFixed(0)
                // Reduce it a bit so that the user doesn't notice the "power falling"
            });
        }

        postCurrentProgress()

        for (const main of mains) {
            let portraitMap = scoreCache.get(main.char.name);
            if (!portraitMap) {
                portraitMap = new Map();
                scoreCache.set(main.char.name, portraitMap);
            }
            for (const support of supportPool) {
                if (support.char.name === main.char.name) continue;

                for (const portrait of highestPwrPortraits) {
                    let supportMap = portraitMap.get(portrait);
                    if (!supportMap) {
                        supportMap = new Map();
                        portraitMap.set(portrait, supportMap);
                    }

                    const power = new ScoreAttackKioku({
                        ...main.char,
                        portrait,
                        supportKey: support.kioku.getKey()
                    }).getTotalPower();

                    supportMap.set(support.char.name, power);

                    if (topFiveSet.has(main.char.name)) {
                        const existing = bestPerMain.get(main.char.name);
                        if (!existing || power > existing.power) {
                            bestPerMain.set(main.char.name, { portrait, supportName: support.char.name, power });
                        }
                    }
                }

                completedRuns++;
                postCurrentProgress()
            }
        }

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

            function dfs(index: number, currentPower: number) {
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

                    dfs(index + 1, currentPower + option.power);

                    current.pop();
                    usedPortraits.delete(option.portrait);
                    usedSupports.delete(option.supportName);
                }
            }

            dfs(0, 0);

            completedRuns++;
            postProgress(completedRuns, expectedTotalRuns, {
                currentBestTeam: bestTeamSetup.length === 5 ? buildTeamObject(bestTeamSetup, characters) : undefined,
                currentBestPwr: bestTeamSetup.length === 5 ? maxTeamPower : undefined,
            });
        }

        const bestTeam = buildTeamObject(bestTeamSetup.reverse(), characters);
        self.postMessage({ type: 'done', bestTeam, maxTeamPower });
    } catch (error) {
        self.postMessage({ type: 'error', error });
    }
};
