import { Heap } from "heap-js";
import { FindBestTeamOptions } from "../types/BestTeamTypes";
import { ScoreAttackTeam } from "./ScoreAttackTeam";
import { portraitsBestOnly, Character, getBestCrystalises, KiokuConstants, getEX, SupportIdealPortrait, KiokuArgs } from "../types/KiokuTypes";
import { ScoreAttackKioku } from "./ScoreAttackKioku";
import { Enemy } from "../types/EnemyTypes";
import { KiokuElement, KiokuRole, SupportKey, Aliment } from "../types/enums";

const cache = new Map<string, ScoreAttackKioku>();
const customPriorityComparator = (a: any[], b: any[]) => a[0] - b[0];
const LIMIT = 1000;

interface KiokuGeneratorArgs {
    name: string;
    kiokuLvl?: number;
    magicLvl?: number;
    heartphialLvl?: number;
    portrait?: string;
    supportKey?: any[];
    crysIDs?: number[];
    subCrysIDs?: number[]
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
        crysIDs: key[8],
        subCrysIDs: key[9],
    });
}

export function getKioku({
    name,
    supportKey,
    portrait,
    ascension = KiokuConstants.maxAscension,
    kiokuLvl = KiokuConstants.maxKiokuLvl,
    magicLvl = KiokuConstants.maxMagicLvl,
    heartphialLvl = KiokuConstants.maxHeartphialLvl,
    specialLvl = KiokuConstants.maxSpecialLvl,
    crysIDs = [],
    subCrysIDs = [],
    buffMultReduction = 0,
    debuffMultReduction = 0,
}: KiokuGeneratorArgs): ScoreAttackKioku {
    const clearCrys = crysIDs.filter(Boolean)
    const clearSubCrys = subCrysIDs.filter(Boolean)

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
            crysIDs: clearCrys,
            subCrysIDs: clearSubCrys
        },
            buffMultReduction,
            debuffMultReduction));
    }

    return cache.get(key) as ScoreAttackKioku;
}

const RELEVANT_SUPPORT_SUPPORTS = {
    [KiokuRole.Buffer]: ["Flame Waltz", "Buon Natale Grazioso", "Pluvia☆Neujahr", "L'Ombre", "Scorchin' Summer Spike"],
    [KiokuRole.Debuffer]: ["Désintégration", "Splashin' Kyubey Blast", "Vinctio☆Magica"],
}

export async function findBestTeam({
    enemies,
    include4StarAttackers,
    include4StarSupports,
    include4StarOthers,
    extraAttackers,
    weakElements,
    onlyConsiderOnElements,
    onElementExceptions = [],
    activeAliments,
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
    offElementBuffMultReduction,
    debuffMultReduction,
    offElementDebuffMultReduction,
    attackerHealth,
    optimizeAverageDamage,
    disabledOtherRoles,
    arenaEffectsMap,
    enablePruning = true,
    pruningMargin = 15,
    onProgress,
    onError
}: FindBestTeamOptions): Promise<any[]> {
    const fetchKioku = (data: KiokuGeneratorArgs & Character): ScoreAttackKioku => getKioku({
        ...data,
        buffMultReduction: weakElements.includes(data.element) ? buffMultReduction : offElementBuffMultReduction,
        debuffMultReduction: weakElements.includes(data.element) ? debuffMultReduction : offElementDebuffMultReduction,
    })

    const perAttackerResults: Record<string, Heap<any[]>> = {}
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
                if (!onlyConsiderOnElements || weakElements.includes(char.element) || onElementExceptions.includes(char.name)) availableChars[char.role].push(char)
            }
            if (extraAttackers.includes(char.name)) availableChars[KiokuRole.Attacker].push(char)
        }
    })
    if (disabledOtherRoles.includes(KiokuRole.Healer)) {
        availableChars[KiokuRole.Healer] = []
        minHealer = 0
    }
    if (disabledOtherRoles.includes(KiokuRole.Defender)) {
        availableChars[KiokuRole.Defender] = []
        minDefender = 0
    }
    if (disabledOtherRoles.includes(KiokuRole.Breaker)) {
        availableChars[KiokuRole.Breaker] = []
        minBreaker = 0
    }

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

    const relevantSupportData: Partial<Record<KiokuRole, any[][]>> = {};
    for (const [role, names] of Object.entries(RELEVANT_SUPPORT_SUPPORTS) as [KiokuRole, string[]][]) {
        relevantSupportData[role] = names
            .map(n => enabledCharacters.find(c => c.name === n))
            .filter(Boolean)
            .map(c => fetchKioku(c as Character))
            .filter(Boolean)
            .map(c => c.getKey());
    }

    // 0-100. Rosters whose pass-1 estimate is more than this many percent behind the best estimate
    // found for the same attacker are skipped in pass 2. 100 keeps everything (no effective pruning).
    const marginFraction = Math.min(Math.max(pruningMargin, 0), 100) / 100;

    interface RosterCandidate {
        totalSupports: Character[]
        supportSupports: any[][]
        teamNames: string[]
    }

    // Report roughly REPORT_TARGET_UPDATES times total per phase, regardless of search size —
    // frequent enough that the bar reads as continuously moving rather than frozen between updates,
    // without flooding the worker->main-thread postMessage channel on huge searches. Shared by both
    // the planning pass below and Phase B further down.
    const REPORT_TARGET_UPDATES = 500

    // ── Phase A: planning, split into two passes so the progress bar has something real to report
    // from the first attacker onward instead of going dark until every attacker is planned.
    //
    // Pass A1 enumerates each attacker's candidate rosters — pure combinatorics, no scoring — which
    // gives us rosterCandidates.length per attacker and therefore an exact, fixed total for Pass A2
    // before any of it runs.
    //
    // Pass A2 runs the pass-1 pruning estimate for those rosters, and this part is NOT cheap: it's
    // one real `calculate_max_dmg` call per roster (the same function Phase B uses), just against a
    // single realistic guess instead of the full portrait x support x support-of-support x crys
    // sweep. For attackers with a narrow sweep, or many roster candidates, that can take as long as
    // Phase B itself, so it gets progress reporting against Pass A1's fixed total instead of leaving
    // the bar frozen at 0/0 for however long planning takes.
    //
    // Phase B still gets its own separate total (expectedTotalRuns, computed once planning finishes)
    // rather than folding into Pass A2's total: expectedTotalRuns depends on survivingRosters, which
    // is Pass A2's *output*, so it can't be known until Pass A2 is done. That means the bar resets
    // once, from 100% of planning to the start of execution — a single, expected phase change, not
    // the repeated backward jumps we'd get if expectedTotalRuns kept growing attacker-by-attacker as
    // new work was discovered mid-run. ──
    interface AttackerRosterInfo {
        attacker: Character
        availablePortraits: string[]
        availableSupportKeys: any[][]
        attackerCrysCombinations: any[][]
        rosterCandidates: RosterCandidate[]
        canEstimate: boolean
    }
    const rosterInfos: AttackerRosterInfo[] = []
    let totalPlanningEstimates = 0

    for (const attacker of availableChars[KiokuRole.Attacker]) {
        const availablePortraits = portraitsBestOnly(attacker.element, optimizeAverageDamage)
        const availableSupportKeys: any[][] = Array.from([highestAtkSupportKey, ...possibleAtkSupportKeys[attacker.element], ...possibleAtkSupportKeys[attacker.role]].filter(s => s?.[0] !== attacker.name).reduce((map, item) => {
            if (item && !map.has(item[0])) {
                map.set(item[0], item)
            }
            return map
        }, new Map()).values())
        if (!availableSupportKeys.length) {
            availableSupportKeys.push(fetchKioku(enabledCharacters.find(c => c.name === "White Camellia") ?? {
                name: "White Camellia",
            }).getKey())
        }
        // getBestCrystalises(attacker) only depends on the attacker (never on portrait/support/support-of-
        // support), so — same as availablePortraits above — it belongs out here, not inside the search
        // loops where it used to get rebuilt (crys-table scan included) on every inner iteration.
        const attackerCrysCombinations = combinations(getBestCrystalises(attacker), 3)

        const attackerHasDotPop = fetchKioku(attacker).effects.some(e => e.abilityEffectType === "IMM_SLIP_DMG")

        const attackerRelevantSupportData: Partial<Record<KiokuRole, any[][]>> = { ...relevantSupportData }
        if (attackerHasDotPop && highestAtkSupportKey) {
            attackerRelevantSupportData[KiokuRole.Debuffer] = [
                ...(relevantSupportData[KiokuRole.Debuffer] ?? []),
                highestAtkSupportKey,
            ]
        }

        // Same expansion logic the search always used, just fed a stand-in "roleProbe" array instead of
        // a real totalSupports. Only Buffer/Debuffer roles are ever matched here, and healer/defender/
        // breaker combo members are never those roles — so a match can only land in the deBufferCombo
        // tail. combinations() always returns arrays of exactly dist.healers/defenders/breakers members,
        // so that tail's starting offset (and therefore every roleIndexes result, and therefore all of
        // supportSupports) is fully determined by (dist, deBufferCombo) alone — which specific healers/
        // defenders/breakers get chosen never changes it. Pulling this out from under those three loops
        // means it now runs once per (dist, deBufferCombo) pair instead of once per every healerCombo x
        // defenderCombo x breakerCombo triple underneath them.
        const computeSupportSupports = (
            dist: { healers: number, defenders: number, breakers: number },
            deBufferCombo: Character[],
        ): any[][] => {
            const roleProbe: any[] = [
                ...Array(dist.healers).fill({ role: KiokuRole.Healer }),
                ...Array(dist.defenders).fill({ role: KiokuRole.Defender }),
                ...Array(dist.breakers).fill({ role: KiokuRole.Breaker }),
                ...deBufferCombo,
            ]

            let supportSupports: any[][] = [new Array(roleProbe.length).fill(undefined)];

            for (const [role, supportPool] of Object.entries(attackerRelevantSupportData) as [KiokuRole, any[][]][]) {
                const activePool = supportPool.filter(s => !deBufferCombo.map(c => c.name).includes(s[0]));
                if (!activePool.length) continue;

                const roleIndexes = roleProbe
                    .map((c, idx) => c.role === role ? idx : null)
                    .filter(v => v !== null) as number[];
                if (!roleIndexes.length) continue;

                const maxAssignable = Math.min(activePool.length, roleIndexes.length);
                const combos = combinations(activePool, maxAssignable);

                const expanded: any[][] = [];
                for (const existing of supportSupports) {
                    for (const combo of combos) {
                        for (const slotSubset of combinations(roleIndexes, combo.length)) {
                            for (const perm of permute(combo)) {
                                const arr = [...existing];
                                for (let i = 0; i < perm.length; i++) arr[slotSubset[i]] = perm[i];
                                expanded.push(arr);
                            }
                        }
                    }
                }
                supportSupports = expanded;
            }

            return supportSupports
        }

        // Enumerate every valid roster (the other 4 team slots) for this attacker.
        const rosterCandidates: RosterCandidate[] = []

        for (const dist of availableOtherDistributions) {
            for (const deBufferCombo of availableSupportCombinations) {
                const supportSupports = computeSupportSupports(dist, deBufferCombo)

                for (const healerCombo of combinations(availableChars[KiokuRole.Healer], dist.healers)) {
                    for (const defenderCombo of combinations(availableChars[KiokuRole.Defender], dist.defenders)) {
                        for (const breakerCombo of combinations(availableChars[KiokuRole.Breaker], dist.breakers)) {
                            const totalSupports = [
                                ...healerCombo,
                                ...defenderCombo,
                                ...breakerCombo,
                                ...deBufferCombo
                            ]

                            if (totalSupports.some(c => c.name === attacker.name)) continue;

                            const teamNames = [attacker, ...totalSupports].map(c => c.name).sort();
                            if (obligatoryKioku.length && !obligatoryKioku.every(k => teamNames.includes(k))) continue;

                            rosterCandidates.push({ totalSupports, supportSupports, teamNames })
                        }
                    }
                }
            }
        }

        const canEstimate = enablePruning
            && attackerCrysCombinations.length > 0
            && availablePortraits.length > 0
            && availableSupportKeys.length > 0
            && rosterCandidates.length > 1

        if (canEstimate) totalPlanningEstimates += rosterCandidates.length

        rosterInfos.push({ attacker, availablePortraits, availableSupportKeys, attackerCrysCombinations, rosterCandidates, canEstimate })
    }

    const PLANNING_REPORT_INTERVAL = Math.max(1, Math.floor(totalPlanningEstimates / REPORT_TARGET_UPDATES))

    // ── Pass 2: fully optimize portrait x support x support-of-support x crys, but only for the
    // rosters worth the expense. Every roster gets a fast pass-1 estimate using one realistic guess
    // (first candidate portrait/support/crys — all already curated lists, not arbitrary/worst-case
    // picks), and rosters whose estimate is within `pruningMargin`% of the best estimate seen for
    // this attacker go on to the full treatment in Phase B.
    //
    // This is a heuristic, not a proof: it never re-examines a roster whose single realistic guess
    // already looked clearly worse than another roster's guess. That's usually right, but portrait/
    // crys/support-of-support choices can matter very differently from character to character, so a
    // roster that looks mediocre on one guess could in principle still close the gap once fully
    // optimized — pruning trades a small, tunable chance of that for a large cut in search time.
    // Set pruningMargin higher (up to 100, which keeps every roster) to make that trade more
    // conservative, or turn enablePruning off to fall back to the exhaustive search in Phase B,
    // identical in outcome to before these changes (just faster, thanks to the hoisting above). ──
    interface AttackerPlan {
        attacker: Character
        availablePortraits: string[]
        availableSupportKeys: any[][]
        attackerCrysCombinations: any[][]
        survivingRosters: RosterCandidate[]
    }
    const plans: AttackerPlan[] = []
    let planningCompleted = 0

    for (const { attacker, availablePortraits, availableSupportKeys, attackerCrysCombinations, rosterCandidates, canEstimate } of rosterInfos) {
        let survivingRosters = rosterCandidates
        if (canEstimate) {
            const estimated: { roster: RosterCandidate, estimate: number }[] = []
            for (const roster of rosterCandidates) {
                try {
                    const attackerKioku = fetchKioku({
                        ...attacker,
                        portrait: availablePortraits[0],
                        crysIDs: attackerCrysCombinations[0].map(c => c.selectionAbilityMstId),
                        subCrysIDs: optimalSubCrys
                            ? KiokuConstants.optimalAttackerSubCrys
                            : Object.values(attacker.crysOptions).filter(c => c.useIndex !== 0).flatMap(c => c.subCrys),
                        supportKey: availableSupportKeys[0],
                    })
                    const guessSupportSupport = roster.supportSupports[0]
                    const members = roster.totalSupports.map((s, i) => fetchKioku({
                        ...s,
                        portrait: "The Savior's Apostle",
                        crysIDs: [getEX(s.id)?.selectionAbilityMstId].filter(c => c != null),
                        supportKey: guessSupportSupport[i],
                    }))
                    const team = new ScoreAttackTeam(attackerKioku, members, attackerHealth, activeAliments, arenaEffectsMap)
                    const [max_dmg, average_dmg] = team.calculate_max_dmg(enemies, 0)
                    estimated.push({ roster, estimate: optimizeAverageDamage ? average_dmg : max_dmg })
                } catch (e) {
                    // Don't let a pruning-estimate failure hide a roster that might otherwise be valid —
                    // treat it as unknown/worth checking and let Phase B's own try/catch decide for real.
                    estimated.push({ roster, estimate: Infinity })
                }

                planningCompleted += 1
                if (planningCompleted % PLANNING_REPORT_INTERVAL === 0 || planningCompleted === totalPlanningEstimates) {
                    onProgress?.([attacker.name], planningCompleted, totalPlanningEstimates, true)
                }
            }

            const bestEstimate = Math.max(...estimated.map(e => e.estimate).filter(e => Number.isFinite(e)))
            const threshold = Number.isFinite(bestEstimate) ? bestEstimate * (1 - marginFraction) : -Infinity
            survivingRosters = estimated.filter(e => e.estimate >= threshold).map(e => e.roster)
        }

        plans.push({ attacker, availablePortraits, availableSupportKeys, attackerCrysCombinations, survivingRosters })
    }

    // Exact count of every Phase B evaluation across every attacker — no scoring involved, just the
    // same nested-loop shape counted up front — so the progress bar gets a fixed, accurate denominator
    // before any of the expensive work starts.
    let expectedTotalRuns = 0
    for (const plan of plans) {
        for (const roster of plan.survivingRosters) {
            const usableSupportKeys = plan.availableSupportKeys.filter(k => !roster.teamNames.includes(k[0])).length
            expectedTotalRuns += usableSupportKeys * plan.availablePortraits.length * roster.supportSupports.length * plan.attackerCrysCombinations.length
        }
    }

    const PASS2_REPORT_INTERVAL = Math.max(1, Math.floor(expectedTotalRuns / REPORT_TARGET_UPDATES))

    // ── Phase B: execute. Same nested loops and same per-attacker state (kiokuWhoShouldHavePortrait,
    // perAttackerResults) as before — just driven off the pre-built plans, against the fixed total
    // computed above. ──
    let completedRuns = 0
    for (const { attacker, availablePortraits, availableSupportKeys, attackerCrysCombinations, survivingRosters } of plans) {
        const kiokuWhoShouldHavePortrait = new Set<string>([])
        perAttackerResults[attacker.name] = new Heap(customPriorityComparator)
        perAttackerResults[attacker.name].limit = LIMIT

        for (const { totalSupports, supportSupports, teamNames } of survivingRosters) {
            // Each member Kioku only depends on (totalSupports[i], supportSupport[i]) — never on the
            // attacker's own portrait/support/crys choice — so build the member set once per
            // supportSupport here, instead of rebuilding an identical set on every attackerCrys
            // iteration below (they used to get rebuilt attackerCrysCombinations.length times over).
            const membersBySupportSupport = new Map<any[], ScoreAttackKioku[]>()
            for (const supportSupport of supportSupports) {
                membersBySupportSupport.set(supportSupport, totalSupports.map((s, i) => fetchKioku({
                    ...s,
                    portrait: "The Savior's Apostle",
                    crysIDs: [getEX(s.id)?.selectionAbilityMstId].filter(c => c != null),
                    supportKey: supportSupport[i],
                })))
            }

            for (const attackerSupportKey of availableSupportKeys) {
                if (teamNames.includes(attackerSupportKey[0])) continue;
                for (const attackerPortrait of availablePortraits) {
                    for (const supportSupport of supportSupports) {
                        const members = membersBySupportSupport.get(supportSupport)!
                        for (const attackerCrys of attackerCrysCombinations) {
                            try {
                                const attackerKioku = fetchKioku({
                                    ...attacker,
                                    portrait: attackerPortrait,
                                    crysIDs: attackerCrys.map(c => c.selectionAbilityMstId),
                                    subCrysIDs: optimalSubCrys
                                        ? KiokuConstants.optimalAttackerSubCrys
                                        : Object.values(attacker.crysOptions).filter(c => c.useIndex !== 0).flatMap(c => c.subCrys),
                                    supportKey: attackerSupportKey,
                                })
                                const hasDotPop = attackerKioku.effects.some(e => e.abilityEffectType === "IMM_SLIP_DMG")
                                members.forEach((k, i) => {
                                    if (k.idealSupportPortrait === SupportIdealPortrait.ADD_DMG
                                        || (hasDotPop && k.idealSupportPortrait === SupportIdealPortrait.DOT_APPLIER)) {
                                        kiokuWhoShouldHavePortrait.add(totalSupports[i].name)
                                    }
                                })
                                const team = new ScoreAttackTeam(
                                    attackerKioku,
                                    members,
                                    attackerHealth,
                                    activeAliments,
                                    arenaEffectsMap,
                                );
                                let [max_dmg, average_dmg, critRate] = team.calculate_max_dmg(enemies, 0)
                                if (optimizeAverageDamage) [average_dmg, max_dmg] = [max_dmg, average_dmg]

                                const entry = [
                                    max_dmg | 0,
                                    critRate,
                                    average_dmg | 0,
                                    attacker.name,
                                    attackerPortrait,
                                    attackerSupportKey?.[0],
                                    ...attackerCrys.map(c => c.selectionAbilityMstId),
                                    ...totalSupports.flatMap((s, i) => [
                                        s.name,
                                        supportSupport[i]?.[0],
                                        kiokuWhoShouldHavePortrait.has(s.name) ? members[i].idealSupportPortrait : undefined
                                    ]),
                                ]
                                if (perAttackerResults[attacker.name].size() < LIMIT)
                                    perAttackerResults[attacker.name].push(entry)
                                else if (entry[0] > perAttackerResults[attacker.name].peek()[0])
                                    perAttackerResults[attacker.name].replace(entry)
                            } catch (e) {
                                onError?.(e)
                            }

                            completedRuns += 1
                            if (completedRuns % PASS2_REPORT_INTERVAL === 0 || completedRuns === expectedTotalRuns) {
                                onProgress?.([attacker.name, ...totalSupports.map(s => s.name)], completedRuns, expectedTotalRuns)
                            }
                        }
                    }
                }
            }
        }
    }

    return Object.values(perAttackerResults)
        .flatMap(heap => heap.toArray().sort((a, b) => b[0] - a[0]))
}

// ── Mini attacker-only optimizer ──
// Given a fixed team of 4 (buffers/debuffers/healers/etc), finds the best
// portrait + support for just the 5th (attacker) slot.

export interface AttackerLoadoutMember {
    main: Character
    support?: Character
    buffMultReduction?: number
    debuffMultReduction?: number
}

export interface FindBestAttackerLoadoutOptions {
    attacker: AttackerLoadoutMember
    otherMembers: AttackerLoadoutMember[]
    enemies: Enemy[]
    attackerHealth: number
    activeAliments: Aliment[]
    arenaEffectsMap: Record<string, number>
    buffMultReduction: number
    debuffMultReduction: number
    enabledCharacters: Character[]
    bannedEffectIds: number[]
    enabledDotAllyEffects: string[]
    stackOverrides: [number, number][]
    disabledEnemyDebuffs: string[]
    debuffStackOverrides: [string, number][]
    optimizeAverageDamage: boolean
    onProgress?: (completed: number, total: number) => void
    onError?: (error: any) => void
}

export interface AttackerLoadoutResult {
    portrait: string
    supportName: string
    crysIds: number[]
    crysNames: string[]
    dmg: number
    critRate: number
    avgDmg: number
}

const DEFAULT_SUB_CRYS = [4034, 4044, 4054]

export function buildMemberKioku(member: AttackerLoadoutMember, defaultBuffMultReduction = 0, defaultDebuffMultReduction = 0): ScoreAttackKioku {
    const support = member.support ? new ScoreAttackKioku({ ...member.support } as KiokuArgs) : null
    const crys = Object.entries(member.main.crysOptions).filter(([, v]) => v.useIndex > 0)

    return new ScoreAttackKioku({
        ...member.main,
        crysIDs: crys.map(([id]) => Number(id)),
        subCrysIDs: crys.flatMap(([, v]) => v.subCrys),
        supportKey: support?.getKey(),
    } as KiokuArgs,
        (member.buffMultReduction || defaultBuffMultReduction) ?? 0,
        (member.debuffMultReduction || defaultDebuffMultReduction) ?? 0,
    )
}

export function getAttackerSupportCandidates(attacker: Character, enabledCharacters: Character[], excludeNames: string[] = []): any[][] {
    const all5Star = enabledCharacters
        .filter(c => c.rarity === 5)
        .map(c => getKioku(c))
        .filter(Boolean) as ScoreAttackKioku[]

    if (!all5Star.length) return []

    const highestAtk = all5Star.reduce((max, k) => (k.getBaseAtk() > max.getBaseAtk() ? k : max))
    const matches = all5Star.filter(k => k.data.support_target === attacker.element || k.data.support_target === attacker.role)

    const candidateKeys = [highestAtk, ...matches]
        .map(k => k.getKey())
        .filter(key => key && key[0] !== attacker.name && !excludeNames.includes(key[0]))

    const unique = new Map<string, any[]>()
    for (const key of candidateKeys) {
        if (!unique.has(key[0])) unique.set(key[0], key)
    }

    if (!unique.size) {
        const fallbackChar = enabledCharacters.find(c => c.name === "White Camellia")
        const fallbackKioku = getKioku(fallbackChar ?? ({ name: "White Camellia" } as Character))
        if (fallbackKioku) unique.set(fallbackKioku.getKey()[0], fallbackKioku.getKey())
    }

    return Array.from(unique.values())
}

export async function findBestAttackerLoadout({
    attacker,
    otherMembers,
    enemies,
    attackerHealth,
    activeAliments,
    arenaEffectsMap,
    buffMultReduction,
    debuffMultReduction,
    enabledCharacters,
    bannedEffectIds,
    enabledDotAllyEffects,
    stackOverrides,
    disabledEnemyDebuffs,
    debuffStackOverrides,
    optimizeAverageDamage,
    onProgress,
    onError,
}: FindBestAttackerLoadoutOptions): Promise<AttackerLoadoutResult[]> {
    const otherKiokus = otherMembers.map(m => buildMemberKioku(m, buffMultReduction, debuffMultReduction))

    const excludeNames = [attacker.main.name, ...otherMembers.map(m => m.main.name)]
    const portraitCandidates = portraitsBestOnly(attacker.main.element, optimizeAverageDamage)
    const supportCandidates = getAttackerSupportCandidates(attacker.main, enabledCharacters, excludeNames)
    const crysCandidates = combinations(getBestCrystalises(attacker.main), 3)

    if (!supportCandidates.length) {
        throw new Error("No valid support candidates found for this attacker")
    }
    if (!crysCandidates.length) {
        throw new Error("No valid crystalis combination found for this attacker")
    }

    const bannedSet = new Set(bannedEffectIds)
    const dotAllySet = new Set(enabledDotAllyEffects)
    const stackOverrideMap = new Map(stackOverrides)
    const disabledEnemyDebuffSet = new Set(disabledEnemyDebuffs)
    const debuffStackOverrideMap = new Map(debuffStackOverrides)

    const results: AttackerLoadoutResult[] = []
    const total = portraitCandidates.length * supportCandidates.length * crysCandidates.length
    let completed = 0

    for (const portrait of portraitCandidates) {
        for (const supportKey of supportCandidates) {
            for (const crysCombo of crysCandidates) {
                try {
                    const crysIDs = crysCombo.map(c => c.selectionAbilityMstId)
                    const subCrysIDs = crysCombo.flatMap(c => {
                        const existing = attacker.main.crysOptions[c.selectionAbilityMstId]?.subCrys
                        return existing?.length === 3 ? existing : DEFAULT_SUB_CRYS
                    })

                    const attackerKioku = new ScoreAttackKioku({
                        ...attacker.main,
                        portrait,
                        crysIDs,
                        subCrysIDs,
                        supportKey,
                    } as KiokuArgs,
                        (attacker.buffMultReduction || buffMultReduction) ?? 0,
                        (attacker.debuffMultReduction || debuffMultReduction) ?? 0,
                    )

                    const team = new ScoreAttackTeam(
                        attackerKioku,
                        otherKiokus,
                        attackerHealth,
                        activeAliments,
                        arenaEffectsMap,
                        true,
                        bannedSet as any,
                        dotAllySet as any,
                        stackOverrideMap as any,
                        disabledEnemyDebuffSet as any,
                        debuffStackOverrideMap as any,
                    )

                    let [max_dmg, avg_dmg, critRate] = team.calculate_max_dmg(enemies, 0)
                    if (optimizeAverageDamage) [avg_dmg, max_dmg] = [max_dmg, avg_dmg]

                    results.push({
                        portrait,
                        supportName: supportKey[0],
                        crysIds: crysIDs,
                        crysNames: crysCombo.map(c => c.name),
                        dmg: max_dmg | 0,
                        critRate,
                        avgDmg: avg_dmg | 0,
                    })
                } catch (e) {
                    onError?.(e)
                }

                completed += 1
                onProgress?.(completed, total)
            }
        }
    }

    return results.sort((a, b) => b.dmg - a.dmg)
}

function permute(arr: any[]): any[][] {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        for (const r of permute(rest)) result.push([arr[i], ...r]);
    }
    return result;
}

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
    if (!distributions.length && otherCount >= 0) {
        const healers = Math.min(minHealer, otherCount);
        const defenders = Math.min(minDefender, otherCount - healers);
        const breakers = otherCount - healers - defenders;
        if (breakers >= 0) {
            distributions.push({ healers, defenders, breakers });
        }
    }
    return distributions;
}
