// App side: the PvE Simulator's "find best attacker loadout" buttons on the 1:1 engine. Same candidates as the old
// single hit calc (models/BestTeamCalculator.findBestAttackerLoadout, kept for the "Old Single Hit Calc" page): the
// best portraits for the dealer's element (portraitsBestOnly), its support candidates (the highest ATK 5 star and the
// 5 stars whose support ability targets the dealer's element or role, as getAttackerSupportCandidates) and every set of
// 3 of its best crystalis (getBestCrystalises; locked crystalis stay), plus the loadout it has now. Each loadout is
// scored by the page's own Max Damage (battle/EngineMaxDamage, the game's battle code) against the page's stage, wave
// and effect choices: the dealer's strongest column, crit total ("max") or average total ("avg").
//
// An engine evaluation costs ~0.1-0.5 s, so instead of the old full product (portraits x supports x crystalis sets)
// the search is a coordinate ascent as in models/EngineBestTeam: start from the current loadout, try every option of
// one choice (support, portrait, crystalis set) with the others fixed, keep the best, until a full pass changes
// nothing (at most 3 passes). Scores run in a pool of workers (workers/maxDamageWorker.ts "loadout" messages).
import { Kioku } from "./Kioku"
import { getBestCrystalises, portraitsBestOnly, type Character, type KiokuArgs } from "../types/KiokuTypes"
import { crystalises } from "../utils/helpers"
import type { TeamSlot } from "../types/BestTeamTypes"
import type { LoadoutContext, LoadoutScore, LoadoutScoreBatch, LoadoutScoreReply } from "../workers/maxDamageWorker"
import { newMaxDamageWorker } from "../workers/newMaxDamageWorker"
import { defaultPoolSize } from "./EngineTeamPool"

const DEFAULT_SUB_CRYS = [4034, 4044, 4054]
const MAX_PASSES = 3

export type LoadoutMode = "max" | "avg"

export interface AttackerLoadout {
    portrait: string
    support: Character | undefined
    crysIds: number[]
}

export interface AttackerLoadoutRow extends AttackerLoadout {
    score: LoadoutScore
    value: number   // the objective (crit total or average total)
}

/** The dealer's main with `l`'s portrait and crystalis (sub crystalis kept when the crystalis has 3, else the default). */
export function mainWithLoadout(main: Character, l: Pick<AttackerLoadout, "portrait" | "crysIds">): Character {
    const crysOptions: Character["crysOptions"] = {}
    for (const [id, o] of Object.entries(main.crysOptions ?? {})) crysOptions[Number(id)] = { ...o, subCrys: [...(o.subCrys ?? [])], useIndex: 0 }
    l.crysIds.forEach((id, i) => {
        const o = crysOptions[id] ?? { enabled: false, useIndex: 0, subCrys: [] }
        crysOptions[id] = { ...o, useIndex: i + 1, subCrys: o.subCrys?.length === 3 ? o.subCrys : [...DEFAULT_SUB_CRYS] }
    })
    return { ...main, portrait: l.portrait, crysOptions }
}

function combinations<T>(arr: T[], k: number): T[][] {
    if (k <= 0) return [[]]
    const out: T[][] = []
    arr.forEach((x, i) => { for (const rest of combinations(arr.slice(i + 1), k - 1)) out.push([x, ...rest]) })
    return out
}

/** Support candidates (as the old calculator's getAttackerSupportCandidates): the enabled 5 star with the highest base
 *  ATK and every enabled 5 star whose support ability targets the dealer's element or role; not the dealer nor anyone
 *  in `exclude`. None left: White Camellia. */
function supportCandidates(main: Character, enabled: Character[], exclude: string[]): Character[] {
    const five = enabled.filter(c => c.rarity === 5 && c.name !== main.name && !exclude.includes(c.name)).map(c => {
        try {
            return { c, k: new Kioku({ name: c.name, portrait: c.portrait, ascension: c.ascension, kiokuLvl: c.kiokuLvl, magicLvl: c.magicLvl,
                heartphialLvl: c.heartphialLvl, specialLvl: c.specialLvl, crysIDs: [], subCrysIDs: [] } as unknown as KiokuArgs) }
        } catch { return undefined }
    }).filter(Boolean) as { c: Character, k: Kioku }[]
    const out: Character[] = []
    const add = (c: Character | undefined) => { if (c && !out.some(x => x.name === c.name)) out.push(c) }
    if (five.length) add(five.reduce((m, x) => x.k.getBaseAtk() > m.k.getBaseAtk() ? x : m).c)
    for (const { c, k } of five) if (k.data.support_target === main.element || k.data.support_target === main.role) add(c)
    if (!out.length) add(enabled.find(c => c.name === "White Camellia"))
    return out
}

const equippedCrys = (main: Character) => Object.entries(main.crysOptions ?? {})
    .filter(([, v]) => v.useIndex > 0).sort(([, a], [, b]) => a.useIndex - b.useIndex).map(([id]) => Number(id))

/** Crystalis sets to try: locked ones (equipped + locked) in every set, the other slots from getBestCrystalises. */
function crysCandidates(main: Character): number[][] {
    const pool = getBestCrystalises(main).map(c => c.selectionAbilityMstId)
    const locked = Object.entries(main.crysOptions ?? {}).filter(([, v]) => v.useIndex > 0 && v.locked).map(([id]) => Number(id))
    if (locked.length > 3) throw new Error("At most 3 crystalises can be locked")
    if (locked.some(id => !crystalises[id] && !pool.includes(id))) throw new Error("One or more locked crystalises could not be found")
    const free = pool.filter(id => !locked.includes(id))
    const sets = combinations(free, Math.min(3 - locked.length, free.length)).map(c => [...locked, ...c])
    const current = equippedCrys(main)
    // the current set too (whatever it holds), unless it drops a locked one
    if (current.length && locked.every(id => current.includes(id))) sets.unshift(current)
    const seen = new Set<string>()
    return sets.filter(s => { const k = [...s].sort().join(); if (seen.has(k)) return false; seen.add(k); return true })
}

export interface LoadoutSearch {
    portraits: string[]
    supports: (Character | undefined)[]
    crysSets: number[][]
    start: { portrait: number, support: number, crys: number }
}

/** Candidates and the starting point (the current loadout). `teamNames`: every member's name (none can be the support). */
export function loadoutSearch(main: Character, currentSupport: Character | undefined, teamNames: string[], enabled: Character[], mode: LoadoutMode): LoadoutSearch {
    const portraits = [...new Set([main.portrait, ...portraitsBestOnly(main.element, mode === "avg")].filter(Boolean) as string[])]
    // the current support first (none: start from none, so the start is the current loadout)
    const supports: (Character | undefined)[] = [currentSupport && !teamNames.includes(currentSupport.name) ? currentSupport : undefined]
    for (const c of supportCandidates(main, enabled, teamNames)) if (!supports.some(s => s?.name === c.name)) supports.push(c)
    const crysSets = crysCandidates(main)
    if (!crysSets.length) throw new Error("No valid crystalis combination found for this attacker")
    return { portraits: portraits.length ? portraits : [""], supports, crysSets, start: { portrait: 0, support: 0, crys: 0 } }
}

export type LoadoutScorer = (l: AttackerLoadout) => Promise<LoadoutScore | undefined>

/** Coordinate ascent over support, portrait and crystalis set. `rows`: every scored loadout, best first; `start`: the
 *  starting (current) loadout's row. */
export async function findBestAttackerLoadoutEngine(s: LoadoutSearch, mode: LoadoutMode, score: LoadoutScorer,
    onProgress?: (done: number, total: number) => void, isCancelled: () => boolean = () => false): Promise<{ rows: AttackerLoadoutRow[], start?: AttackerLoadoutRow }> {
    const dims = {
        support: s.supports.map((_, i) => i),
        portrait: s.portraits.map((_, i) => i),
        crys: s.crysSets.map((_, i) => i),
    }
    type Pick = { support: number, portrait: number, crys: number }
    const loadoutOf = (p: Pick): AttackerLoadout => ({ portrait: s.portraits[p.portrait], support: s.supports[p.support], crysIds: s.crysSets[p.crys] })
    const passCost = Object.values(dims).reduce((t, l) => t + Math.max(0, l.length - 1), 0)
    let expected = 1 + passCost
    let done = 0
    const rows = new Map<string, AttackerLoadoutRow | undefined>()
    const objective = (sc: LoadoutScore) => mode === "avg" ? sc.avg : sc.crit
    const run = async (p: Pick): Promise<number> => {
        const key = JSON.stringify(p)
        if (!rows.has(key)) {
            const l = loadoutOf(p)
            const sc = isCancelled() ? undefined : await score(l)
            rows.set(key, sc ? { ...l, score: sc, value: objective(sc) } : undefined)
        }
        onProgress?.(++done, Math.max(done, expected))
        return rows.get(key)?.value ?? -Infinity
    }
    const cur: Pick = { ...s.start }
    let best = await run(cur)
    for (let pass = 0; pass < MAX_PASSES && !isCancelled(); pass++) {
        if (pass > 0) expected += passCost
        let improved = false
        for (const dim of ["support", "portrait", "crys"] as const) {
            const options = dims[dim].filter(v => v !== cur[dim])
            const tried = await Promise.all(options.map(async v => ({ v, val: await run({ ...cur, [dim]: v }) })))
            for (const t of tried) if (t.val > best) { best = t.val; cur[dim] = t.v; improved = true }
        }
        if (!improved) break
    }
    onProgress?.(expected, expected)
    return {
        rows: [...rows.values()].filter((r): r is AttackerLoadoutRow => !!r).sort((a, b) => b.value - a.value),
        start: rows.get(JSON.stringify(s.start)),
    }
}

/** The page's team with the dealer's loadout replaced (slots in team order, empty slots left out by the caller). */
export function slotsWithLoadout(slots: TeamSlot[], dealerPos: number, l: AttackerLoadout): TeamSlot[] {
    return slots.map((slot, i) => i !== dealerPos || !slot.main ? slot : { ...slot, main: mainWithLoadout(slot.main, l), support: l.support })
}

interface Job { id: number, slots: TeamSlot[], resolve: (s: LoadoutScore | undefined) => void }

/** Browser: a pool of engine workers scoring loadouts against one context (workers/maxDamageWorker.ts). */
export class EngineLoadoutPool {
    private readonly workers: { w: Worker, busy: boolean, hasContext: boolean }[] = []
    private readonly queue: Job[] = []
    private readonly inFlight = new Map<number, Job[]>()
    private nextId = 0
    private nextBatch = 0
    private closed = false
    private readonly context: LoadoutContext
    private readonly onError?: (e: unknown) => void

    constructor(context: LoadoutContext, size = defaultPoolSize(), onError?: (e: unknown) => void) {
        this.context = context
        this.onError = onError
        for (let i = 0; i < size; i++) {
            const w = newMaxDamageWorker()
            const slot = { w, busy: false, hasContext: false }
            w.onmessage = (e: MessageEvent<LoadoutScoreReply>) => {
                if (e.data?.kind !== "loadout") return
                const jobs = this.inFlight.get(e.data.batch) ?? []
                this.inFlight.delete(e.data.batch)
                const byId = new Map(e.data.scores.map(s => [s.id, s]))
                for (const j of jobs) {
                    const r = byId.get(j.id)
                    if (r?.error) this.onError?.(r.error)
                    j.resolve(r?.score)
                }
                slot.busy = false
                this.pump()
            }
            w.onerror = (e) => {
                this.onError?.(e.message)
                slot.busy = false
                this.pump()
            }
            this.workers.push(slot)
        }
    }

    score(slots: TeamSlot[]): Promise<LoadoutScore | undefined> {
        if (this.closed) return Promise.resolve(undefined)
        return new Promise(resolve => {
            this.queue.push({ id: this.nextId++, slots, resolve })
            this.pump()
        })
    }

    private pump() {
        if (this.closed) return
        for (const slot of this.workers) {
            if (slot.busy || !this.queue.length) continue
            // one job per message: a loadout score is long enough that batching would only leave workers idle
            const jobs = this.queue.splice(0, 1)
            const batch = this.nextBatch++
            this.inFlight.set(batch, jobs)
            slot.busy = true
            const msg: LoadoutScoreBatch = { kind: "loadout", batch, jobs: jobs.map(j => ({ id: j.id, slots: j.slots })) }
            if (!slot.hasContext) { msg.context = this.context; slot.hasContext = true }
            slot.w.postMessage(msg)
        }
    }

    close() {
        this.closed = true
        for (const s of this.workers) s.w.terminate()
        for (const j of this.queue.splice(0)) j.resolve(undefined)
        for (const jobs of this.inFlight.values()) for (const j of jobs) j.resolve(undefined)
        this.inFlight.clear()
    }
}
