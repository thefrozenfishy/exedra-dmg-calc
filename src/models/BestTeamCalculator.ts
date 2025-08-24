import { FindBestTeamOptions } from "../types/BestTeamTypes";
import { Team } from "./Team";
import { KiokuRole, portraits, Character, KiokuConstants, KiokuElement, SupportKey, KiokuGeneratorArgs } from "../types/KiokuTypes";
import { getKioku } from "./Kioku";

export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    include4StarOthers,
    extraAttackers,
    weakElements,
    enabledCharacters,
    obligatoryKioku,
    deBufferCount,
    otherCount,
    minHealer,
    minDefender,
    minBreaker,
    prevResults,
    onProgress,
    onError
}: FindBestTeamOptions): Promise<any[]> {
    const safeGetKioku = (k: KiokuGeneratorArgs | Character) => {
        try {
            return getKioku(k)
        } catch (e) {
            onError?.(e)
        }
    }

    const runsAlreadyCompleted = new Set()
    prevResults.forEach(r => runsAlreadyCompleted.add(JSON.stringify([r[2], r[8], r[10], r[12], r[14]].sort())))

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
                ((include4StarSupports && [KiokuRole.Buffer, KiokuRole.Debuffer].includes(char.role))
                    || (include4StarOthers && [KiokuRole.Healer, KiokuRole.Defender, KiokuRole.Breaker].includes(char.role)))
                && !["Nightmare Stinger"].includes(char.name) // Hanna has no debuffs, just remove to speed up computation
            )) {
            availableChars[char.role].push(char)
        }
        if (extraAttackers.includes(char.name)) availableChars[KiokuRole.Attacker].push(char)
    })
    const availableSupportCombinations = combinations([...availableChars[KiokuRole.Debuffer], ...availableChars[KiokuRole.Buffer]], deBufferCount)
    const availableOtherDistributions = generateRoleDistributions(otherCount, minHealer, minDefender, minBreaker)

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
    const expectedTotalRuns =
        availableChars[KiokuRole.Attacker].length *
        availableSupportCombinations.length *
        availableOtherDistributions.reduce((sum, dist) => {
            return sum +
                nCr(availableChars[KiokuRole.Healer].length, dist.healers) *
                nCr(availableChars[KiokuRole.Defender].length, dist.defenders) *
                nCr(availableChars[KiokuRole.Breaker].length, dist.breakers);
        }, 0);

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
        for (const dist of availableOtherDistributions) {
            for (const healerCombo of combinations(availableChars[KiokuRole.Healer], dist.healers)) {
                for (const defenderCombo of combinations(availableChars[KiokuRole.Defender], dist.defenders)) {
                    for (const breakerCombo of combinations(availableChars[KiokuRole.Breaker], dist.breakers)) {
                        for (const deBufferCombo of availableSupportCombinations) {
                            completedRuns += 1;

                            const totalSupports = [
                                ...healerCombo,
                                ...defenderCombo,
                                ...breakerCombo,
                                ...deBufferCombo
                            ]

                            if (totalSupports.map(c => c.name).includes(attacker.name)) continue;

                            const teamNames = [attacker, ...totalSupports].map(c => c.name).sort();
                            if (obligatoryKioku.length) {
                                if (!obligatoryKioku.every(k => teamNames.includes(k))) continue;
                            }
                            if (runsAlreadyCompleted.has(JSON.stringify(teamNames))) continue;

                            const supportSupports = totalSupports.map((c, idx) => {
                                if (!tsurunoKey) return;
                                if (totalSupports.map(c => c.name).includes(tsurunoKey?.[0])) return
                                if (c.role !== KiokuRole.Buffer) return
                                const arr: any[] = [undefined, undefined, undefined]
                                arr[idx] = tsurunoKey
                                return arr
                            }).filter(Boolean)

                            if (!supportSupports.length) {
                                supportSupports.push([undefined, undefined, undefined])
                            }

                            onProgress?.([attacker.name, ...totalSupports.map(s => s.name)], completedRuns, expectedTotalRuns)

                            for (const attackerSupportKey of availableSupportKeys) {
                                if (teamNames.includes(attackerSupportKey[0])) continue;
                                for (const attackerPortrait of availablePortraits) {
                                    for (const supportSupport of supportSupports) {
                                        for (const attackerCrys of combinations(Object.entries(KiokuConstants.availableCrys).filter(([k, v]) => v !== KiokuConstants.availableCrys.FLAT_ATK), 3)) {
                                            try {
                                                const team = new Team([
                                                    safeGetKioku({
                                                        ...attacker,
                                                        dpsElement: attacker.element,
                                                        portrait: attackerPortrait,
                                                        crys: attackerCrys.map(item => item[1]),
                                                        supportKey: attackerSupportKey,
                                                        isDps: true
                                                    })!,
                                                    ...totalSupports.map((s, i) => safeGetKioku({ ...s, dpsElement: attacker.element, supportKey: supportSupport[i] })!)
                                                ]);

                                                const [dmg, critRate] = team.calculate_max_dmg(enemies, 0);
                                                results.push([
                                                    dmg | 0,
                                                    critRate,
                                                    attacker.name,
                                                    attackerPortrait,
                                                    attackerSupportKey?.[0],
                                                    ...attackerCrys.map(item => item[0]),
                                                    ...totalSupports.flatMap((s, i) => [s.name, supportSupport[i]?.[0]])
                                                ]);
                                            } catch (e) {
                                                onError?.(e)
                                            }
                                        }
                                    }
                                }
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
function combinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (k > arr.length) return [];

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

function generateRoleDistributions(otherCount: number, minHealer: number, minDefender: number, minBreaker: number): { healers: number, defenders: number, breakers: number }[] {
    const distributions: { healers: number, defenders: number, breakers: number }[] = [];
    for (let healers = minHealer; healers <= otherCount; healers++) {
        for (let defenders = minDefender; defenders <= otherCount - healers; defenders++) {
            const breakers = otherCount - healers - defenders;
            if (breakers >= minBreaker) {
                distributions.push({ healers, defenders, breakers });
            }
        }
    }
    return distributions;
}

function nCr(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    let res = 1;
    for (let i = 1; i <= r; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}