

import { Character } from "../store/characterStore";
import { Enemy } from "../store/singleTeamStore";
import { getKioku, KiokuConstants } from "./Kioku";
import { Team } from "./Team";
import { Role, Element } from "../utils/helpers";

const dmgUpPortrait = {
    [Element.Flame]: "A Reluctant Coach Steps Up",
    [Element.Aqua]: "Futures Felt in Photographs",
    [Element.Forest]: "Special Stage Persona",
    [Element.Light]: "High Five for Harmony",
    [Element.Dark]: "One Time Team-up!",
    [Element.Void]: "Pride on the Line",
}

// TODO: Use old results somehow?
export interface FindBestTeamOptions {
    enemies: Enemy[];
    include4StarAttackers: boolean;
    include4StarSupports: boolean;
    extraAttackers: string[];
    weakElements: Element[]
    enabledCharacters: Character[]
    onProgress?: (currChars: string[]) => void
}

export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    extraAttackers,
    weakElements,
    enabledCharacters,
    onProgress
}: FindBestTeamOptions): Promise<any[]> {
    console.log("Finding best for", enemies,
        include4StarAttackers,
        include4StarSupports,
        extraAttackers,
        weakElements,
        enabledCharacters)
    const results = []
    const availableChars: Record<Role, Character[]> = {
        [Role.Attacker]: [],
        [Role.Debuffer]: [],
        [Role.Buffer]: [],
        [Role.Healer]: [],
        [Role.Breaker]: [],
        [Role.Defender]: [],
    }
    enabledCharacters.forEach(char => {
        if (char.role === Role.Attacker) {
            if (weakElements.includes(char.element) && ((char.rarity === 4 && char.role === Role.Attacker && include4StarAttackers) || char.rarity === 5)) {
                availableChars[Role.Attacker].push(char)
            }
        } else if (char.rarity === 5 || (char.rarity === 4 && include4StarSupports && [Role.Buffer, Role.Debuffer].includes(char.role))) {
            availableChars[char.role].push(char)
        }
        if (extraAttackers.includes(char.name)) availableChars[Role.Attacker].push(char)
    })

    // TODO: Not hardcode supports? It'd take longer tho and these three are honestly the only options?
    const atkSupportsKeys = enabledCharacters
        .filter(c => ["The Universe's Edge", "Oracle Ray", "Fiore Finale"].includes(c.name))
        .map(getKioku)
        .map(c => c?.getKey())
        .filter(Boolean)

    if (!availableChars[Role.Healer].length) {
        availableChars[Role.Healer].push(getKioku(enabledCharacters.find(c => c.name === "Circle Of Fire")))
    }

    const tsurunoData = enabledCharacters.find(c => c.name === "Flame Waltz")
    const tsurunoKey = tsurunoData ? getKioku(tsurunoData)?.getKey() : null

    // Nested loops to generate team combinations
    for (const attacker of availableChars.Attacker) {
        const availableSupportKeys = atkSupportsKeys.filter(s => s?.[0] !== attacker.name);
        if (!availableSupportKeys.length) {
            availableSupportKeys.push(getKioku(enabledCharacters.find(c => c.name === "Ryushin Spiral Fury")).getKey())
        }

        for (const sustain of availableChars[Role.Healer]) {
            if (sustain.name === attacker.name) continue;

            for (const supportList of combinations([...availableChars[Role.Debuffer], ...availableChars[Role.Buffer]], 3)) {
                if (supportList.map(c => c.name).includes(attacker.name)) continue;
                const supportSupports = supportList.map((c, idx) => {
                    if (!tsurunoKey) return;
                    if (supportList.map(c => c.name).includes(tsurunoKey?.[0])) return
                    if (c.role !== Role.Buffer) return
                    const arr: any[] = [undefined, undefined, undefined]
                    arr[idx] = tsurunoKey
                    return arr
                }).filter(Boolean)

                if (!supportSupports.length) {
                    supportSupports.push([undefined, undefined, undefined])
                }

                onProgress?.([
                    0,
                    0,
                    attacker.name,
                    undefined,
                    undefined,
                    undefined, undefined, undefined,
                    sustain.name,
                    ...supportList.flatMap((s, i) => [s.name, undefined])
                ])

                for (const attackerSupportKey of availableSupportKeys) {

                    for (const attackerPortrait of ["A Dream of a Little Mermaid", "The Savior's Apostle", dmgUpPortrait[attacker.element]]) {

                        for (const supportSupport of supportSupports) {

                            for (const attackerCrys of combinations(Object.entries(KiokuConstants.availableCrys).filter((c, v) => c !== KiokuConstants.availableCrys.FLAT_ATK), 3)) {
                                const team = new Team([
                                    getKioku({
                                        ...attacker,
                                        dpsElement: attacker.element,
                                        portrait: attackerPortrait,
                                        crys: attackerCrys.map(item => item[1]),
                                        supportKey: attackerSupportKey,
                                        isDps: true
                                    })!,
                                    getKioku({ ...sustain, dpsElement: attacker.element })!,
                                    ...supportList.map((s, i) => getKioku({ ...s, dpsElement: attacker.element, supportKey: supportSupport[i] })!)
                                ]);

                                const [dmg, critRate] = team.calculate_max_dmg(enemies, 0);
                                results.push([
                                    dmg | 0,
                                    Math.round(critRate * 100),
                                    attacker.name,
                                    attackerPortrait,
                                    attackerSupportKey?.[0],
                                    ...attackerCrys.map(item => item[0]),
                                    sustain.name,
                                    ...supportList.flatMap((s, i) => [s.name, supportSupport[i]?.[0]])
                                ]);
                            }
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
