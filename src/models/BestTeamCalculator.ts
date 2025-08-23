

import { Character } from "../store/characterStore";
import { Enemy } from "../store/singleTeamStore";
import { getKioku, KiokuConstants } from "./Kioku";
import { Team } from "./Team";

const dmgUpPortrait = {
    "Flame": "A Reluctant Coach Steps Up",
    "Aqua": "Futures Felt in Photographs",
    "Forest": "Special Stage Persona",
    "Light": "High Five for Harmony",
    "Dark": "One Time Team-up!",
    "Void": "Pride on the Line",
}

// TODO: Use old results somehow?
export interface FindBestTeamOptions {
    enemies: Enemy[];
    include4StarAttackers: boolean;
    include4StarSupports: boolean;
    extraAttackers: string[];
    weakElements: string[]
    enabledCharacters: Character[]
}
export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    extraAttackers,
    weakElements,
    enabledCharacters
}: FindBestTeamOptions): Promise<any[]> {
    const results = []
    const availableChars: Record<string, Character[]> = {
        "Attacker": [],
        "Debuffer": [],
        "Buffer": [],
        "Healer": [],
        "Breaker": [],
        "Defender": [],
    }
    enabledCharacters.forEach(char => {
        if (char.role === "Attacker") {
            if (weakElements.includes(char.element) && ((char.rarity === 4 && char.role === "Attacker" && include4StarAttackers) || char.rarity === 5)) {
                availableChars["Attacker"].push(char)
            }
        } else if (char.rarity === 5 || (char.rarity === 4 && include4StarSupports && ["Buffer", "Debuffer"].includes(char.role))) {
            availableChars[char.role].push(char)
        }
        if (char.name in extraAttackers) availableChars["Attacker"].push(char)
    })

    // TODO: Not hardcode supports? 
    const atkSupports = enabledCharacters
        .filter(c => ["The Universe's Edge", "Oracle Ray", "Fiore Finale"]            .includes(c.name))
        .map(getKioku)
        .map(c => c?.getKey())
        .filter(Boolean)
    if (!atkSupports.length) {
        atkSupports.push(enabledCharacters.find(c => c.name === "Ryushin Spiral Fury").map(getKioku).map(c => c.getKey()))
    }
    console.log(atkSupports)

    const tsurunoData = enabledCharacters.find(c => c.name === "Flame Waltz")
    const tsuruno = tsurunoData ? getKioku(tsurunoData)?.getKey() : null
    console.log(tsuruno)

    // Nested loops to generate team combinations
    for (const attacker of availableChars.Attacker) {
        const availableSupports = atkSupports.filter(s => s?.name !== attacker.name);
        if (!atkSupports.length) {
            availableSupports.push(enabledCharacters.find(c => c.name === "Ryushin Spiral Fury").map(getKioku).map(c => c.getKey()))
        }
        for (const attackerSupport of availableSupports) {
            for (const attackerPortrait of ["A Dream of a Little Mermaid", "The Savior's Apostle", dmgUpPortrait[attacker.element]]) {
                for (const sustain of availableChars["Healer"]) {
                    if (sustain.name === attacker.name) continue;
                    for (const supportList of combinations([...availableChars["Debuffer"], ...availableChars["Buffer"]], 3)) {
                        if (supportList.map(c => c.name).includes(attacker.name)) continue;

                        const supportSupports = supportList.map((c, idx) => {
                            if (!tsuruno) return
                            if (attacker.name === "Flame Waltz") return
                            if (c.role !== "Buffer") return
                            const arr: any[] = [undefined, undefined, undefined]
                            arr[idx] = tsuruno
                            return arr
                        }).filter(Boolean)

                        if (!supportSupports.length) {
                            supportSupports.push([undefined, undefined, undefined])
                        }

                        // Combinations of crystals
                        for (const attackerCrys of combinations(Object.keys(KiokuConstants.availableCrys).filter(c => c !== KiokuConstants.availableCrys.FLAT_ATK), 3)) {
                            const team = new Team([
                                getKioku({
                                    ...attacker,
                                    dpsElement: attacker.element,
                                    portrait: attackerPortrait,
                                    crys: attackerCrys,
                                    supportKey: getKioku(attackerSupport)?.getKey(),
                                    isDps: true
                                })!,
                                getKioku({ ...sustain, dpsElement: attacker.element })!,
                                ...supportList.map((s, i) => getKioku({ ...s, dpsElement: attacker.element, supportKey: supportSupports[i] })!)
                            ]);

                            const [dmg, critRate] = team.calculate_max_dmg([{
                                name: "Target",
                                maxBreak: 300,
                                defense: 1500,
                                defenseUp: 0,
                                hitsToKill: 9,
                                enabled: true,
                                isBreak: true,
                                isWeak: true,
                                isCrit: true,
                            }], 0);
                            console.log(dmg, critRate)
                            results.push([
                                dmg | 0,
                                Math.round(critRate * 100),
                                attacker.name,
                                attackerPortrait,
                                attackerSupport?.name,
                                ...attackerCrys,
                                sustain.name,
                                ...supportList.flatMap((s, i) => [s, supportSupports[i] ? "Tsuruno" : "any supp"])
                            ]);
                        }
                    }
                }
            }
        }
    }

    // Sort configs descending by damage
    return results.sort((a, b) => b[0] - a[0]);
}

// helper: combinations
export function combinations<T>(arr: T[], k: number): T[][] {
    const result: T[][] = [];
    const comb = (start: number, acc: T[]) => {
        if (acc.length === k) {
            result.push([...acc]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            acc.push(arr[i]);
            comb(i + 1, acc);
            acc.pop();
        }
    };
    comb(0, []);
    return result;
}
