import { FindBestTeamOptions } from "../types/BestTeamTypes";
import { ScoreAttackTeam } from "./ScoreAttackTeam";
import { KiokuRole, portraitsBestOnly, Character, KiokuElement, SupportKey, getBestCrystalises, KiokuConstants } from "../types/KiokuTypes";
import { ScoreAttackKioku } from "./ScoreAttackKioku";

const cache = new Map<string, ScoreAttackKioku>();

interface KiokuGeneratorArgs {
    name: string;
    kiokuLvl?: number;
    magicLvl?: number;
    heartphialLvl?: number;
    portrait?: string;
    supportKey?: any[];
    crys?: string[];
    crys_sub?: string[]
    ascension?: number;
    specialLvl?: number;
    buffMultReduction?: number;
    debuffMultReduction?: number;
}

export function fromKey(key: any[]) {
    return getKioku({
        name: key[0],
        supportKey: key[1],
        portrait: key[2],
        ascension: key[3],
        kiokuLvl: key[4],
        magicLvl: key[5],
        heartphialLvl: key[6],
        specialLvl: key[7],
        crys: key[8],
        crys_sub: key[9],
    });
}

function getKioku({
    name,
    supportKey,
    portrait,
    ascension = KiokuConstants.maxAscension,
    kiokuLvl = KiokuConstants.maxKiokuLvl,
    magicLvl = KiokuConstants.maxMagicLvl,
    heartphialLvl = KiokuConstants.maxHeartphialLvl,
    specialLvl = KiokuConstants.maxSpecialLvl,
    crys = [],
    crys_sub = [],
    buffMultReduction = 0,
    debuffMultReduction = 0
}: KiokuGeneratorArgs): ScoreAttackKioku {
    const clearCrys = crys.filter(Boolean)
    const clearSubCrys = crys_sub.filter(Boolean)

    const key = JSON.stringify([
        name,
        supportKey,
        portrait,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        clearCrys,
        clearSubCrys,
    ]);

    if (!cache.has(key)) {
        cache.set(key, new ScoreAttackKioku({
            name,
            supportKey,
            portrait,
            ascension,
            kiokuLvl,
            magicLvl,
            heartphialLvl,
            specialLvl,
            crys: clearCrys,
            crys_sub: clearSubCrys
        },
            buffMultReduction,
            debuffMultReduction));
    }

    return cache.get(key) as ScoreAttackKioku;
}

export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    include4StarOthers,
    extraAttackers,
    weakElements,
    enabledCharacters,
    obligatoryKioku,
    ignoredKioku,
    deBufferCount,
    otherCount,
    minHealer,
    minDefender,
    minBreaker,
    optimalSubCrys,
    buffMultReduction,
    debuffMultReduction,
    onProgress,
    onError
}: FindBestTeamOptions): Promise<any[]> {

    const fetchKioku = (data: Character | KiokuGeneratorArgs | undefined): ScoreAttackKioku => getKioku({ ...data, debuffMultReduction, buffMultReduction })

    const perAttackerResults: Record<string, any[]> = {}
    const availableChars: Record<KiokuRole, Character[]> = {
        [KiokuRole.Attacker]: [],
        [KiokuRole.Debuffer]: [],
        [KiokuRole.Buffer]: [],
        [KiokuRole.Healer]: [],
        [KiokuRole.Breaker]: [],
        [KiokuRole.Defender]: [],
    }
    enabledCharacters.forEach(char => {
        if (!ignoredKioku.includes(char.name)) {
            if (char.role === KiokuRole.Attacker) {
                if (weakElements.includes(char.element) && ((char.rarity === 4 && char.role === KiokuRole.Attacker && include4StarAttackers) || char.rarity === 5)) {
                    availableChars[KiokuRole.Attacker].push(char)
                }
            } else if (char.rarity === 5 ||
                (char.rarity === 4 &&
                    ((include4StarSupports && [KiokuRole.Buffer, KiokuRole.Debuffer].includes(char.role))
                        || (include4StarOthers && [KiokuRole.Healer, KiokuRole.Defender, KiokuRole.Breaker].includes(char.role)))
                )) {
                availableChars[char.role].push(char)
            }
            if (extraAttackers.includes(char.name)) availableChars[KiokuRole.Attacker].push(char)
        }
    })

    const availableSupportCombinations = combinations([...availableChars[KiokuRole.Debuffer], ...availableChars[KiokuRole.Buffer]], deBufferCount)
    const availableOtherDistributions = generateRoleDistributions(otherCount, minHealer, minDefender, minBreaker)

    const all5StarKioku = enabledCharacters.filter(c => c.rarity === 5).map(fetchKioku).filter(Boolean)
    const highestAtkSupportKey = all5StarKioku.reduce((max, k) => (k.getBaseAtk() > max.getBaseAtk() ? k : max))?.getKey()
    const possibleAtkSupportKeys: Record<SupportKey, any[]> = {
        ...Object.values(KiokuRole).reduce(
            (acc, role) => ({ ...acc, [role]: [] }), {}),
        ...Object.values(KiokuElement).reduce(
            (acc, el) => ({ ...acc, [el]: [] }), {})
    }
    for (const key of [...Object.values(KiokuRole), ...Object.values(KiokuElement)]) {
        for (const c of all5StarKioku) {
            if (c?.data.support_target == key) {
                possibleAtkSupportKeys[key].push(c.getKey())
            }
        }
    }

    const tsurunoData = enabledCharacters.find(c => c.name === "Flame Waltz")
    const tsurunoKey = tsurunoData ? fetchKioku(tsurunoData)?.getKey() : null

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
        perAttackerResults[attacker.name] = []
        const availablePortraits = portraitsBestOnly(attacker.element)
        const availableSupportKeys: any[][] = Array.from([highestAtkSupportKey, ...possibleAtkSupportKeys[attacker.element], ...possibleAtkSupportKeys[attacker.role]].filter(s => s?.[0] !== attacker.name).reduce((map, item) => {
            if (item && !map.has(item[0])) {
                map.set(item[0], item)
            }
            return map
        }, new Map()).values())
        if (!availableSupportKeys.length) {
            availableSupportKeys.push(fetchKioku(enabledCharacters.find(c => c.name === "White Camellia")).getKey())
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
                                        for (const attackerCrys of combinations(getBestCrystalises(attacker.element), 3)) {
                                            try {
                                                const team = new ScoreAttackTeam(
                                                    fetchKioku({
                                                        ...attacker,
                                                        portrait: attackerPortrait,
                                                        crys: attackerCrys,
                                                        crys_sub: optimalSubCrys ?
                                                            Array(3).fill([
                                                                "Increases critical rate by 5%.",
                                                                "Increases critical DMG by 10%.",
                                                                "Increases ATK by 60."
                                                            ]).flat() : attacker.crys_sub,
                                                        supportKey: attackerSupportKey,
                                                    })!,
                                                    totalSupports.map((s, i) => fetchKioku({
                                                        ...s,
                                                        crys: optimalSubCrys ? ["EX"] : s.crys,
                                                        supportKey: supportSupport[i],
                                                    })!),
                                                );

                                                const [dmg, _, critRate] = team.calculate_max_dmg(enemies, 0)
                                                const entry = [
                                                    dmg | 0,
                                                    critRate,
                                                    attacker.name,
                                                    attackerPortrait,
                                                    attackerSupportKey?.[0],
                                                    ...attackerCrys,
                                                    ...totalSupports.flatMap((s, i) => [s.name, supportSupport[i]?.[0]])
                                                ]

                                                perAttackerResults[attacker.name].push(entry)
                                                if (completedRuns % 100 === 0) {
                                                    perAttackerResults[attacker.name].sort((a, b) => b[0] - a[0])
                                                    if (perAttackerResults[attacker.name].length > 100) perAttackerResults[attacker.name].length = 100
                                                }
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
    return Object.values(perAttackerResults).flat()
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