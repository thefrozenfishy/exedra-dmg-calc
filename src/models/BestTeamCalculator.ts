import { FindBestTeamOptions } from "../types/BestTeamTypes";
import { Team } from "./Team";
import { KiokuRole, portraits, Character, KiokuConstants, KiokuElement, SupportKey } from "../types/KiokuTypes";
import { getKioku } from "./Kioku";

// TODO: Use old results somehow?
export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    extraAttackers,
    weakElements,
    enabledCharacters,
    onProgress,
    onError
}: FindBestTeamOptions): Promise<any[]> {
    const safeGetKioku = (k: Character) => {
        try {
            return getKioku(k)
        } catch (e) {
            onError?.(e)
        }
    }

    const results = []
    const availableChars: Record<KiokuRole, Character[]> = {
        [KiokuRole.Attacker]: [],
        [KiokuRole.Debuffer]: [],
        [KiokuRole.Buffer]: [],
        [KiokuRole.Healer]: [],
        [KiokuRole.Breaker]: [],
        [KiokuRole.Defender]: [],
    }
    enabledCharacters.forEach(char => {
        if (char.role === KiokuRole.Attacker) {
            if (weakElements.includes(char.element) && ((char.rarity === 4 && char.role === KiokuRole.Attacker && include4StarAttackers) || char.rarity === 5)) {
                availableChars[KiokuRole.Attacker].push(char)
            }
        } else if (char.rarity === 5 ||
            (char.rarity === 4 &&
                include4StarSupports &&
                [KiokuRole.Buffer, KiokuRole.Debuffer].includes(char.role) &&
                !["Nightmare Stinger"].includes(char.name) // Hanna has no debuffs, just remove to speed up computation
            )) {
            availableChars[char.role].push(char)
        }
        if (extraAttackers.includes(char.name)) availableChars[KiokuRole.Attacker].push(char)
    })
    const availableSupportCombinations = combinations([...availableChars[KiokuRole.Debuffer], ...availableChars[KiokuRole.Buffer]], 3)

    const all5StarKioku = enabledCharacters.filter(c => c.rarity === 5).map(safeGetKioku).filter(Boolean)
    const highestAtkSupportKey = all5StarKioku.reduce((max, k) => (k?.getBaseAtk() > max?.getBaseAtk() ? k : max))?.getKey()
    const possibleAtkSupportKeys: Record<SupportKey, any[]> = {
        ...Object.values(KiokuRole).reduce(
            (acc, role) => ({ ...acc, [role]: [] }), {}),
        ...Object.values(KiokuElement).reduce(
            (acc, el) => ({ ...acc, [el]: [] }), {})
    }
    for (const key of [...Object.values(KiokuRole), ...Object.values(KiokuElement)]) {
        for (const c of all5StarKioku) {
            if (c?.is_valid_support(key)) {
                possibleAtkSupportKeys[key].push(c.getKey())
            }
        }
    }

    if (!availableChars[KiokuRole.Healer].length) {
        availableChars[KiokuRole.Healer].push(safeGetKioku(enabledCharacters.find(c => c.name === "Circle Of Fire")))
    }

    const tsurunoData = enabledCharacters.find(c => c.name === "Flame Waltz")
    const tsurunoKey = tsurunoData ? safeGetKioku(tsurunoData)?.getKey() : null

    let completedRuns = 0;
    let expectedTotalRuns = availableChars[KiokuRole.Attacker].length * availableSupportCombinations.length * availableChars[KiokuRole.Healer].length

    for (const attacker of availableChars[KiokuRole.Attacker]) {
        const availablePortraits = portraits(attacker.element)
        const availableSupportKeys = Array.from([highestAtkSupportKey, ...possibleAtkSupportKeys[attacker.element], ...possibleAtkSupportKeys[attacker.role]].filter(s => s?.[0] !== attacker.name).reduce((map, item) => {
            if (item && !map.has(item[0])) {
                map.set(item[0], item)
            }
            return map
        }, new Map()).values())
        if (!availableSupportKeys.length) {
            availableSupportKeys.push(safeGetKioku(enabledCharacters.find(c => c.name === "Ryushin Spiral Fury")).getKey())
        }

        for (const sustain of availableChars[KiokuRole.Healer]) {
            if (sustain.name === attacker.name) continue;

            for (const supportList of availableSupportCombinations) {
                completedRuns += 1;
                if (supportList.map(c => c.name).includes(attacker.name)) continue;
                const supportSupports = supportList.map((c, idx) => {
                    if (!tsurunoKey) return;
                    if (supportList.map(c => c.name).includes(tsurunoKey?.[0])) return
                    if (c.role !== KiokuRole.Buffer) return
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
                    undefined,
                    undefined,
                    undefined,
                    sustain.name,
                    ...supportList.flatMap((s, i) => [s.name, undefined])
                ], completedRuns, expectedTotalRuns)

                for (const attackerSupportKey of availableSupportKeys) {

                    for (const attackerPortrait of availablePortraits) {

                        for (const supportSupport of supportSupports) {

                            for (const attackerCrys of combinations(Object.entries(KiokuConstants.availableCrys).filter(([k, v]) => v !== KiokuConstants.availableCrys.FLAT_ATK), 3)) {
                                const team = new Team([
                                    safeGetKioku({
                                        ...attacker,
                                        dpsElement: attacker.element,
                                        portrait: attackerPortrait,
                                        crys: attackerCrys.map(item => item[1]),
                                        supportKey: attackerSupportKey,
                                        isDps: true
                                    })!,
                                    safeGetKioku({ ...sustain, dpsElement: attacker.element })!,
                                    ...supportList.map((s, i) => safeGetKioku({ ...s, dpsElement: attacker.element, supportKey: supportSupport[i] })!)
                                ]);

                                const [dmg, critRate] = team.calculate_max_dmg(enemies, 0);
                                results.push([
                                    dmg | 0,
                                    critRate,
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
