// App side: the Best SA Team calculator on the 1:1 engine. Same candidates and the same result rows as the old
// calculator (models/BestTeamCalculator.findBestTeam, kept for the "Old Best SA Team Calculator" page), but every team
// is scored by battle/EngineTeamScore (the attacker's Ultimate as the Max Damage panel computes it) instead of the old
// single-hit model (ScoreAttackTeam).
//
// An engine score costs ~0.1 s (several battle setups), against microseconds for the old model, so the search is
// shaped differently:
//   - scores run in a pool of workers (workers/maxDamageWorker.ts, "teams" messages), each team scored once (memo);
//   - Phase A (Fast search) scores each roster (the 4 other members) once, with the attacker's first portrait /
//     support / crystalis and the first support-of-support choice, and drops rosters more than the pruning margin
//     behind that attacker's best, as the old calculator did;
//   - Phase B tunes each surviving roster's loadout by coordinate ascent instead of the full product: one choice
//     (attacker support, attacker portrait, attacker crystalis set, supports' supports) at a time, every option of it
//     scored with the others fixed, the best kept, until a full pass changes nothing (at most 3 passes). Every scored
//     loadout is a result row, as in the old calculator.
import type { FindBestTeamOptions } from "../types/BestTeamTypes"
import { combinations, generateRoleDistributions, getKioku, permute } from "./BestTeamCalculator"
import { portraitsBestOnly, getBestCrystalises, KiokuConstants, getEX, relevantCrys, SupportIdealPortrait, type Character, type KiokuArgs } from "../types/KiokuTypes"
import type { ScoreAttackKioku } from "./ScoreAttackKioku"
import { KiokuElement, KiokuRole, type SupportKey } from "../types/enums"
import type { TeamScore, TeamScoreScenario } from "../battle/EngineTeamScore"

/** Scores teams (the attacker first). undefined = the team could not be scored. */
export type TeamScorer = (team: KiokuArgs[]) => Promise<TeamScore | undefined>

const LIMIT = 10_000
const MAX_PASSES = 3
const SUPPORT_PORTRAIT = "The Savior's Apostle"

// Slip supports: vortex users (VORTEX_ATK in their kit; the vortex always pops in the max, battle/EngineMaxDamage) and, when
// the attacker pops DoTs (IMM_SLIP_DMG), DoT appliers (SupportIdealPortrait.DOT_APPLIER). Their slip damage counts in the
// attacker's Ultimate and goes through the OWNER's damage pipeline (its ATK, its self buffs), so each one's support,
// portrait and crystalis are picked by a prepass (slipPreset below), starting from the DoT applier loadout: The
// Savior's Apostle, their EX + these crystalis, a Debuffer's supports (RELEVANT_SUPPORT_SUPPORTS) whatever their role.
const VORTEX_SUPPORT_CRYS = ["Towering Offense++", "Dominant Blow++"]

const RELEVANT_SUPPORT_SUPPORTS = {
    [KiokuRole.Buffer]: ["Flame Waltz", "Buon Natale Grazioso", "Pluvia☆Neujahr", "L'Ombre", "Scorchin' Summer Spike"],
    [KiokuRole.Debuffer]: ["Désintégration", "Splashin' Kyubey Blast", "Vinctio☆Magica"],
}

export function scenarioOf(o: FindBestTeamOptions): TeamScoreScenario {
    return {
        stage: (o as any).stage, enemies: o.enemies, ailments: o.activeAliments,
        attackerHp: Number.isFinite(o.attackerHealth) ? o.attackerHealth : undefined,
    }
}

/** The engine unit's inputs for a character with a loadout (getKioku's defaults for missing levels). */
function argsOf(c: Partial<Character> & { name: string }, loadout: { portrait?: string, supportKey?: any[], crysIDs?: number[], subCrysIDs?: number[] }): KiokuArgs {
    return {
        name: c.name,
        ascension: c.ascension ?? KiokuConstants.maxAscension,
        kiokuLvl: c.kiokuLvl ?? KiokuConstants.maxKiokuLvl,
        magicLvl: c.magicLvl ?? KiokuConstants.maxMagicLvl,
        heartphialLvl: c.heartphialLvl ?? KiokuConstants.maxHeartphialLvl,
        specialLvl: c.specialLvl ?? KiokuConstants.maxSpecialLvl,
        portrait: loadout.portrait,
        supportKey: loadout.supportKey,
        crysIDs: (loadout.crysIDs ?? []).filter(Boolean),
        subCrysIDs: (loadout.subCrysIDs ?? []).filter(Boolean),
    } as KiokuArgs
}

interface Roster { totalSupports: Character[], supportSupports: any[][], teamNames: string[] }

export async function findBestTeamEngine(o: FindBestTeamOptions, score: TeamScorer, isCancelled: () => boolean = () => false): Promise<any[]> {
    let { minHealer, minDefender, minBreaker } = o
    const { enemies: _e, weakElements, enabledCharacters, ignoredKioku, onElementExceptions = [], optimizeAverageDamage, onProgress, onError } = o
    void _e
    // off-element exceptions by role: every Kioku of these roles stays eligible
    const exceptionRoles: KiokuRole[] = (o as any).onElementExceptionRoles ?? []
    const meta = (c: Partial<Character> & { name: string }, l: Parameters<typeof argsOf>[1] = {}): ScoreAttackKioku => getKioku({ ...(c as any), ...l })

    // ---- candidates (as findBestTeam)
    const availableChars: Record<KiokuRole, Character[]> = {
        [KiokuRole.Attacker]: [], [KiokuRole.Debuffer]: [], [KiokuRole.Buffer]: [], [KiokuRole.Healer]: [], [KiokuRole.Breaker]: [], [KiokuRole.Defender]: [],
    }
    enabledCharacters.forEach(char => {
        if (ignoredKioku.includes(char.name)) return
        if (char.role === KiokuRole.Attacker) {
            if (weakElements.includes(char.element) && ((char.rarity === 4 && o.include4StarAttackers) || char.rarity === 5)) availableChars[KiokuRole.Attacker].push(char)
        } else if (char.rarity === 5 || (char.rarity === 4 &&
            ((o.include4StarSupports && [KiokuRole.Buffer, KiokuRole.Debuffer].includes(char.role))
                || (o.include4StarOthers && [KiokuRole.Healer, KiokuRole.Defender, KiokuRole.Breaker].includes(char.role))))) {
            if (!o.onlyConsiderOnElements || weakElements.includes(char.element) || onElementExceptions.includes(char.name)
                || exceptionRoles.includes(char.role)) availableChars[char.role].push(char)
        }
        if (o.extraAttackers.includes(char.name)) availableChars[KiokuRole.Attacker].push(char)
    })
    for (const [role, min] of [[KiokuRole.Healer, "h"], [KiokuRole.Defender, "d"], [KiokuRole.Breaker, "b"]] as const) {
        if (!o.disabledOtherRoles.includes(role)) continue
        availableChars[role] = []
        if (min === "h") minHealer = 0; else if (min === "d") minDefender = 0; else minBreaker = 0
    }
    const supportCombos = combinations([...availableChars[KiokuRole.Debuffer], ...availableChars[KiokuRole.Buffer]], o.deBufferCount)
    const distributions = generateRoleDistributions(o.otherCount, minHealer, minDefender, minBreaker)

    const all5Star = enabledCharacters.filter(c => c.rarity === 5).map(c => meta(c)).filter(Boolean)
    const highestAtkSupportKey = all5Star.length ? all5Star.reduce((m, k) => (k.getBaseAtk() > m.getBaseAtk() ? k : m)).getKey() : undefined
    const supportKeysFor: Record<SupportKey, any[]> = {
        ...Object.values(KiokuRole).reduce((acc, r) => ({ ...acc, [r]: [] }), {}),
        ...Object.values(KiokuElement).reduce((acc, e) => ({ ...acc, [e]: [] }), {}),
    } as any
    for (const key of [...Object.values(KiokuRole), ...Object.values(KiokuElement)]) {
        for (const c of all5Star) if (c?.data.support_target == key) supportKeysFor[key as SupportKey].push(c.getKey())
    }
    const relevantSupportData: Partial<Record<KiokuRole, any[][]>> = {}
    for (const [role, names] of Object.entries(RELEVANT_SUPPORT_SUPPORTS) as [KiokuRole, string[]][]) {
        relevantSupportData[role] = names.map(n => enabledCharacters.find(c => c.name === n)).filter(Boolean).map(c => meta(c as Character).getKey())
    }
    const vortexUsers = new Map<string, boolean>()
    const isVortexUser = (c: any): boolean => {
        if (!c?.name) return false
        let v = vortexUsers.get(c.name)
        if (v === undefined) vortexUsers.set(c.name, v = !!meta(c)?.effects.some(e => e.abilityEffectType === "VORTEX_ATK"))
        return v
    }
    const dotAppliers = new Map<string, boolean>()
    const isDotApplier = (c: any): boolean => {
        if (!c?.name) return false
        let v = dotAppliers.get(c.name)
        if (v === undefined) dotAppliers.set(c.name, v = meta(c)?.idealSupportPortrait === SupportIdealPortrait.DOT_APPLIER)
        return v
    }
    const isSlipSupport = (c: Character, hasDotPop: boolean) => isVortexUser(c) || (hasDotPop && isDotApplier(c))
    /** A (non slip) support member's crystalis: the EX. */
    const supportCrysOf = (c: Character): number[] => [getEX(c.id)?.selectionAbilityMstId].filter(x => x != null) as number[]
    const margin = Math.min(Math.max(o.pruningMargin ?? 15, 0), 100) / 100
    const objective = (s: TeamScore) => optimizeAverageDamage ? s.avg : s.max

    interface Plan {
        attacker: Character, portraits: string[], supportKeys: any[][], crysCombos: any[][], rosters: Roster[],
        subCrys: number[], hasDotPop: boolean,
    }
    const plans: Plan[] = []
    for (const attacker of availableChars[KiokuRole.Attacker]) {
        const portraits = portraitsBestOnly(attacker.element, optimizeAverageDamage)
        const supportKeys: any[][] = Array.from([highestAtkSupportKey, ...supportKeysFor[attacker.element], ...supportKeysFor[attacker.role]]
            .filter(s => s?.[0] !== attacker.name)
            .reduce((map, item) => { if (item && !map.has(item[0])) map.set(item[0], item); return map }, new Map<string, any[]>()).values())
        if (!supportKeys.length) supportKeys.push(meta(enabledCharacters.find(c => c.name === "White Camellia") ?? { name: "White Camellia" } as Character).getKey())
        const crysCombos = combinations(getBestCrystalises(attacker), 3)
        const hasDotPop = meta(attacker).effects.some(e => e.abilityEffectType === "IMM_SLIP_DMG")
        const relevant: Partial<Record<KiokuRole, any[][]>> = { ...relevantSupportData }
        if (hasDotPop && highestAtkSupportKey) relevant[KiokuRole.Debuffer] = [...(relevantSupportData[KiokuRole.Debuffer] ?? []), highestAtkSupportKey]

        const supportSupportsFor = (dist: { healers: number, defenders: number, breakers: number }, deBufferCombo: Character[]): any[][] => {
            const probe: any[] = [
                ...Array(dist.healers).fill({ role: KiokuRole.Healer }), ...Array(dist.defenders).fill({ role: KiokuRole.Defender }),
                ...Array(dist.breakers).fill({ role: KiokuRole.Breaker }), ...deBufferCombo,
            ]
            let out: any[][] = [new Array(probe.length).fill(undefined)]
            // vortex users take a Debuffer's supports whatever their role
            const poolRole = (c: any): KiokuRole => isVortexUser(c) ? KiokuRole.Debuffer : c.role
            for (const [role, pool] of Object.entries(relevant) as [KiokuRole, any[][]][]) {
                const active = pool.filter(s => !deBufferCombo.map(c => c.name).includes(s[0]))
                if (!active.length) continue
                const idx = probe.map((c, i) => poolRole(c) === role ? i : null).filter(v => v !== null) as number[]
                if (!idx.length) continue
                const combos = combinations(active, Math.min(active.length, idx.length))
                const expanded: any[][] = []
                for (const existing of out) for (const combo of combos) for (const slots of combinations(idx, combo.length)) for (const perm of permute(combo)) {
                    const arr = [...existing]
                    for (let i = 0; i < perm.length; i++) arr[slots[i]] = perm[i]
                    expanded.push(arr)
                }
                out = expanded
            }
            // a vortex user left without one of those: the highest ATK 5 star support
            const vortexIdx = probe.map((c, i) => isVortexUser(c) ? i : null).filter(v => v !== null) as number[]
            const fallback = highestAtkSupportKey
            if (vortexIdx.length && fallback && fallback[0] !== attacker.name && !deBufferCombo.some(c => c.name === fallback[0])) {
                out = out.map(arr => {
                    const a = [...arr]
                    for (const i of vortexIdx) if (a[i] === undefined && !a.some(x => x?.[0] === fallback[0])) a[i] = fallback
                    return a
                })
            }
            return out
        }
        const rosters: Roster[] = []
        for (const dist of distributions) for (const deBufferCombo of supportCombos) {
            const supportSupports = supportSupportsFor(dist, deBufferCombo)
            for (const h of combinations(availableChars[KiokuRole.Healer], dist.healers))
                for (const d of combinations(availableChars[KiokuRole.Defender], dist.defenders))
                    for (const b of combinations(availableChars[KiokuRole.Breaker], dist.breakers)) {
                        const totalSupports = [...h, ...d, ...b, ...deBufferCombo]
                        if (totalSupports.some(c => c.name === attacker.name)) continue
                        const teamNames = [attacker, ...totalSupports].map(c => c.name).sort()
                        if (o.obligatoryKioku.length && !o.obligatoryKioku.every(k => teamNames.includes(k))) continue
                        rosters.push({ totalSupports, supportSupports, teamNames })
                    }
        }
        const subCrys = o.optimalSubCrys ? KiokuConstants.optimalAttackerSubCrys : Object.values(attacker.crysOptions ?? {}).filter((c: any) => c.useIndex !== 0).flatMap((c: any) => c.subCrys)
        if (portraits.length && crysCombos.length && rosters.length) plans.push({ attacker, portraits, supportKeys, crysCombos, rosters, subCrys, hasDotPop })
    }

    // ---- one team = attacker loadout + the roster with one support-of-support choice
    interface Loadout { support: number, portrait: number, crys: number, ss: number }
    // A slip support's preset (prepass below), per attacker: `${attacker}|${support}`.
    interface SlipPreset { supportKey: any[] | undefined, portrait: string, crysIDs: number[], supportRank?: any[][] }
    const slipPresets = new Map<string, SlipPreset>()
    const presetOf = (p: Plan, c: Character) => slipPresets.get(`${p.attacker.name}|${c.name}`)
    /** The supports' loadouts in a team. A slip support takes its preset; its preset support only when no other member or
     *  support of the team is that Kioku already (else its next best support, else the roster's choice, else none). Others: The Savior's Apostle, their
     *  EX and the roster's support. */
    const supportLoadouts = (p: Plan, r: Roster, l: Loadout): { portrait: string, crysIDs: number[], supportKey: any[] | undefined, preset: boolean }[] => {
        const ss = r.supportSupports[l.ss]
        const pres = r.totalSupports.map(c => presetOf(p, c))
        const used = new Set<string>([...r.teamNames, p.supportKeys[l.support]?.[0], ...ss.filter((k, i) => k && !pres[i]).map(k => k[0])].filter(Boolean))
        return r.totalSupports.map((c, i) => {
            const pre = pres[i]
            if (!pre) return { portrait: SUPPORT_PORTRAIT, crysIDs: supportCrysOf(c), supportKey: ss[i], preset: false }
            const key = [pre.supportKey, ...(pre.supportRank ?? []), ss[i]].find(k => k && !used.has(k[0]))
            if (key) used.add(key[0])
            return { portrait: pre.portrait, crysIDs: pre.crysIDs, supportKey: key, preset: true }
        })
    }
    const teamOf = (p: Plan, r: Roster, l: Loadout): KiokuArgs[] => {
        const sl = supportLoadouts(p, r, l)
        return [
            argsOf(p.attacker, { portrait: p.portraits[l.portrait], supportKey: p.supportKeys[l.support], crysIDs: p.crysCombos[l.crys].map((c: any) => c.selectionAbilityMstId), subCrysIDs: p.subCrys }),
            ...r.totalSupports.map((s, i) => argsOf(s, sl[i])),
        ]
    }
    const memo = new Map<string, Promise<TeamScore | undefined>>()
    const scoreOf = (team: KiokuArgs[]): Promise<TeamScore | undefined> => {
        const key = JSON.stringify(team)
        let p = memo.get(key)
        if (!p) {
            p = score(team).catch(e => { onError?.(e); return undefined })
            memo.set(key, p)
        }
        return p
    }

    // ---- Prepass: each slip support's preset, per attacker (user's rule, app side [APPROXIMATION]). Scored as the
    // attacker (its first loadout) + that support alone, so the score is the attacker's Ultimate with that support's
    // slip damage popped (and whatever that support's loadout gives the attacker); coordinate ascent over its support,
    // portrait and each crystalis slot (distinct, from relevantCrys), no sub crystalis (as every support).
    const slipPreset = async (p: Plan, c: Character): Promise<SlipPreset> => {
        const attackerArgs = argsOf(p.attacker, {
            portrait: p.portraits[0], supportKey: p.supportKeys.find(k => k?.[0] !== c.name),
            crysIDs: p.crysCombos[0].map((x: any) => x.selectionAbilityMstId), subCrysIDs: p.subCrys,
        })
        const dedupe = (keys: any[][]) => [...new Map(keys.filter(k => k && k[0] !== c.name && k[0] !== p.attacker.name).map(k => [k[0], k])).values()]
        const supports = dedupe([...(relevantSupportData[KiokuRole.Debuffer] ?? []), highestAtkSupportKey, ...supportKeysFor[c.role as SupportKey], ...supportKeysFor[c.element as SupportKey]])
        const portraitList = [...new Set([SUPPORT_PORTRAIT, ...portraitsBestOnly(c.element, optimizeAverageDamage), SupportIdealPortrait.ADD_DMG as string])]
        const crysList = relevantCrys(c.id).map(x => x.selectionAbilityMstId)
        const start = [...new Set([getEX(c.id)?.selectionAbilityMstId,
            ...relevantCrys(c.id).filter(x => VORTEX_SUPPORT_CRYS.includes(x.name)).map(x => x.selectionAbilityMstId), ...crysList])]
            .filter(x => x != null).slice(0, 3) as number[]
        let cur: SlipPreset = { supportKey: supports[0], portrait: SUPPORT_PORTRAIT, crysIDs: start }
        const valueOf = async (pre: SlipPreset) => {
            const s = await scoreOf([attackerArgs, argsOf(c, pre)])
            return s ? objective(s) : -Infinity
        }
        let best = await valueOf(cur)
        for (let pass = 0; pass < MAX_PASSES; pass++) {
            let improved = false
            const dims: (() => SlipPreset[])[] = [
                () => supports.map(k => ({ ...cur, supportKey: k })),
                () => portraitList.map(pt => ({ ...cur, portrait: pt })),
                ...cur.crysIDs.map((_, slot) => () => crysList.filter(id => !cur.crysIDs.includes(id))
                    .map(id => ({ ...cur, crysIDs: cur.crysIDs.map((x, j) => j === slot ? id : x) }))),
            ]
            for (const dim of dims) {
                if (isCancelled()) return cur
                const cands = dim()
                const values = await Promise.all(cands.map(valueOf))
                values.forEach((v, i) => { if (v > best) { best = v; cur = cands[i]; improved = true } })
            }
            if (!improved) break
        }
        // every support ranked with the rest of the preset, for a team where the best one is taken
        const supportValues = await Promise.all(supports.map(k => valueOf({ ...cur, supportKey: k })))
        cur.supportRank = supports.map((k, i) => [k, supportValues[i]] as const).sort((a, b) => b[1] - a[1]).map(([k]) => k)
        return cur
    }
    const supportPool = Object.entries(availableChars).filter(([role]) => role !== KiokuRole.Attacker).flatMap(([, list]) => list)
    const slipJobs = plans.flatMap(p => [...new Map(supportPool.filter(c => c.name !== p.attacker.name && isSlipSupport(c, p.hasDotPop)).map(c => [c.name, c])).values()].map(c => ({ p, c })))
    let doneSlip = 0
    for (const plan of plans) {
        if (isCancelled()) return []
        await Promise.all(slipJobs.filter(j => j.p === plan).map(async ({ p, c }) => {
            slipPresets.set(`${p.attacker.name}|${c.name}`, await slipPreset(p, c))
            onProgress?.([p.attacker.name, c.name], ++doneSlip, slipJobs.length, true)
        }))
    }

    const usableSupports = (p: Plan, r: Roster) => p.supportKeys.map((k, i) => [k, i] as const).filter(([k]) => !r.teamNames.includes(k[0])).map(([, i]) => i)

    // ---- Phase A: one score per roster, prune
    const surviving: { plan: Plan, rosters: Roster[] }[] = []
    const estimates = plans.filter(p => o.enablePruning !== false && p.rosters.length > 1)
    const totalA = estimates.reduce((s, p) => s + p.rosters.length, 0)
    let doneA = 0
    for (const plan of plans) {
        if (isCancelled()) return []
        if (!estimates.includes(plan)) { surviving.push({ plan, rosters: plan.rosters }); continue }
        const scored = await Promise.all(plan.rosters.map(async r => {
            const sup = usableSupports(plan, r)
            const s = await scoreOf(teamOf(plan, r, { support: sup[0] ?? 0, portrait: 0, crys: 0, ss: 0 }))
            doneA++
            if (doneA % Math.max(1, Math.floor(totalA / 500)) === 0 || doneA === totalA) onProgress?.([plan.attacker.name], doneA, totalA, true)
            return { r, est: s ? objective(s) : Infinity }
        }))
        const best = Math.max(...scored.map(x => x.est).filter(Number.isFinite))
        const threshold = Number.isFinite(best) ? best * (1 - margin) : -Infinity
        surviving.push({ plan, rosters: scored.filter(x => x.est >= threshold).map(x => x.r) })
    }

    // ---- Phase B: coordinate ascent per roster
    const dimsOf = (p: Plan, r: Roster) => ({ support: usableSupports(p, r), portrait: p.portraits.map((_, i) => i), crys: p.crysCombos.map((_, i) => i), ss: r.supportSupports.map((_, i) => i) })
    const passCost = (d: ReturnType<typeof dimsOf>) => Object.values(d).reduce((s, list) => s + Math.max(0, list.length - 1), 0)
    let expected = surviving.reduce((s, { plan, rosters }) => s + rosters.reduce((t, r) => t + 1 + passCost(dimsOf(plan, r)), 0), 0)
    let done = 0
    const tick = (names: string[]) => {
        done++
        if (done % Math.max(1, Math.floor(expected / 500)) === 0 || done >= expected) onProgress?.(names, done, Math.max(done, expected), false)
    }

    const results: Record<string, any[][]> = {}
    const shouldHavePortrait: Record<string, Set<string>> = {}
    const record = (p: Plan, r: Roster, l: Loadout, s: TeamScore) => {
        const want = shouldHavePortrait[p.attacker.name] ??= new Set()
        const sl = supportLoadouts(p, r, l)
        const members = r.totalSupports.map((m, i) => meta(m, sl[i]))
        members.forEach((k, i) => {
            if (k.idealSupportPortrait === SupportIdealPortrait.ADD_DMG) want.add(r.totalSupports[i].name)
        })
        let max = s.max, avg = s.avg
        if (optimizeAverageDamage) [avg, max] = [max, avg]
        ;(results[p.attacker.name] ??= []).push([
            max | 0, s.critRate, avg | 0, p.attacker.name, p.portraits[l.portrait], p.supportKeys[l.support]?.[0],
            ...p.crysCombos[l.crys].map((c: any) => c.selectionAbilityMstId),
            // a slip support shows its preset portrait; others the ADD_DMG portrait when they want it
            ...r.totalSupports.flatMap((m, i) => [m.name, sl[i].supportKey?.[0], sl[i].preset ? sl[i].portrait : want.has(m.name) ? members[i].idealSupportPortrait : undefined]),
            // [21..24] each support's crystalis as scored, so "open in PvE Simulator" equips the same
            ...sl.map(x => x.crysIDs),
        ])
    }

    const tune = async (p: Plan, r: Roster) => {
        const dims = dimsOf(p, r)
        if (!dims.support.length) return
        const names = [p.attacker.name, ...r.totalSupports.map(s => s.name)]
        const cur: Loadout = { support: dims.support[0], portrait: 0, crys: 0, ss: 0 }
        const run = async (l: Loadout) => {
            if (isCancelled()) return undefined
            const s = await scoreOf(teamOf(p, r, l))
            tick(names)
            if (s) record(p, r, l, s)
            return s
        }
        let best = await run(cur)
        let bestVal = best ? objective(best) : -Infinity
        const seen = new Set([JSON.stringify(cur)])
        for (let pass = 0; pass < MAX_PASSES; pass++) {
            if (pass > 0) expected += passCost(dims)
            let improved = false
            for (const dim of ["support", "portrait", "crys", "ss"] as const) {
                const options = dims[dim].filter(v => v !== cur[dim])
                const tried = await Promise.all(options.map(async v => {
                    const l = { ...cur, [dim]: v }
                    const key = JSON.stringify(l)
                    if (seen.has(key)) { tick(names); return { v, val: -Infinity } }
                    seen.add(key)
                    const s = await run(l)
                    return { v, val: s ? objective(s) : -Infinity }
                }))
                for (const t of tried) if (t.val > bestVal) { bestVal = t.val; cur[dim] = t.v; improved = true }
            }
            if (!improved) break
        }
    }

    // a bounded number of rosters in flight keeps the pool busy without queueing every roster's first pass at once
    const queue = surviving.flatMap(({ plan, rosters }) => rosters.map(r => ({ plan, r })))
    const IN_FLIGHT = 48
    let next = 0
    await Promise.all(Array.from({ length: Math.min(IN_FLIGHT, queue.length) }, async () => {
        while (next < queue.length && !isCancelled()) {
            const { plan, r } = queue[next++]
            await tune(plan, r)
        }
    }))
    if (isCancelled()) return []

    return Object.values(results).flatMap(rows => rows.sort((a, b) => b[0] - a[0]).slice(0, LIMIT))
}
