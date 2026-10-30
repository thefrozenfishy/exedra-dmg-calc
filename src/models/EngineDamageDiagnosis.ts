// App side: the PvE Simulator's "what was missing?" next to Max Damage. The player enters the damage they saw in game
// for one of the dealer's skills; this finds which of the team's buffs / debuffs (the ones Max Damage counts) were
// probably missing, i.e. which ones taken away make the page's Max Damage (battle/EngineMaxDamage, the game's battle
// code) land on that number.
//
// An engine evaluation costs ~0.1-0.5 s, so not every subset is run: each candidate (an effect off, or at fewer stacks)
// is run once on its own, its damage ratio to the full Max Damage is kept, and subsets are ranked by the product of
// their ratios against the ratio seen in game. That product is only an estimate (effects of one kind add up before they
// multiply, caps), so the best few subsets are then run on the engine together and ranked by what the engine gives.
// Scores run in a pool of workers (workers/maxDamageWorker.ts "variant" messages).
import type { VariantChange, VariantColumn, VariantContext, VariantBatch, VariantReply } from "../workers/maxDamageWorker"
import { newMaxDamageWorker } from "../workers/newMaxDamageWorker"
import { defaultPoolSize } from "./EngineTeamPool"

export type HitKind = "crit" | "normal"

/** Something that may have been missing: one effect card off, or at fewer stacks. Candidates of one `group` (the same
 *  card) never go together. */
export interface DiagnosisCandidate {
    id: string
    group: string
    label: string
    // what kind of effect (its type and side): effects of one kind add up in the damage formula, kinds multiply
    bucket?: string
    change: VariantChange
}

export interface DiagnosisTarget {
    column: { label: string, name?: string }
    enemy: number | "all"        // the page's enemy index, or the total over every enemy
    hit: HitKind | "either"
    observed: number
}

export interface DiagnosisRow<C extends DiagnosisCandidate = DiagnosisCandidate> {
    missing: C[]
    alternatives: C[][]          // per missing effect: others that change the damage exactly as much (could be them instead)
    hit: HitKind
    damage: number               // the engine's damage with these missing
    diff: number                 // (damage - observed) / observed
}

export interface DiagnosisResult<C extends DiagnosisCandidate = DiagnosisCandidate> {
    base: Partial<Record<HitKind, number>>   // the page's Max Damage for the chosen column / enemy
    rows: DiagnosisRow<C>[]                  // best first
    // the observed damage is above the full Max Damage of every hit kind looked at: nothing missing explains it
    aboveMax: boolean
    // the observed damage is the full Max Damage (of a hit kind looked at): nothing missing
    atMax: boolean
}

const MAX_SIZE = 4           // at most this many effects missing at once
const MAX_NODES = 300_000    // subsets looked at, at most
const VERIFY = 10            // subsets run on the engine together
const SIZE_PENALTY = 0.0002  // per missing effect, in |ln ratio|: of two subsets that fit as well, the smaller wins
export const MATCH = 0.0005  // relative difference that counts as the same number (the game shows whole numbers)

export function mergeChanges(changes: VariantChange[]): VariantChange {
    const out: Required<VariantChange> = { excluded: [], vortexEnemies: {}, stacks: [] }
    for (const c of changes) {
        out.excluded.push(...(c.excluded ?? []))
        Object.assign(out.vortexEnemies, c.vortexEnemies)
        out.stacks.push(...(c.stacks ?? []))
    }
    return out
}

function valueOf(columns: VariantColumn[] | undefined, t: DiagnosisTarget, hit: HitKind): number | undefined {
    const col = columns?.find(c => c.label === t.column.label && (c.name ?? "") === (t.column.name ?? ""))
    if (!col) return undefined
    const rows = t.enemy === "all" ? col.perEnemy : col.perEnemy.slice(t.enemy, t.enemy + 1)
    if (!rows.length) return undefined
    return rows.reduce((s, x) => s + x[hit], 0)
}

export type VariantScorer = (change: VariantChange) => Promise<VariantColumn[] | undefined>

interface Item { i: number, r: number, group: string, bucket: string, cls: number, rank: number }

/** Subsets of `items` (one per group) whose estimated damage ratio is closest to `goal`. Estimate: effects of one bucket
 *  (effect type) add up, `1 - Σ(1 - r)`, and buckets multiply. Every r < 1, so the estimate only falls as a subset grows:
 *  a branch already well below the goal is cut. Equivalent candidates (one `cls`) are taken in `rank` order only, so
 *  the same subset is not listed once per interchangeable effect. */
function bestSubsets(all: Item[], goal: number, keep: number): { idx: number[], err: number }[] {
    const lnGoal = Math.log(goal)
    const items = all.filter(x => x.r > 0 && x.r < 0.9995).sort((a, b) => a.r - b.r)
    const best: { idx: number[], err: number }[] = []
    let nodes = 0
    const lnOf = (chosen: Item[]) => {
        const deficit = new Map<string, number>()
        for (const x of chosen) deficit.set(x.bucket, (deficit.get(x.bucket) ?? 0) + 1 - x.r)
        let ln = 0
        for (const d of deficit.values()) ln += Math.log(Math.max(1e-6, 1 - d))
        return ln
    }
    const consider = (chosen: Item[], ln: number) => {
        const err = Math.abs(ln - lnGoal) + SIZE_PENALTY * chosen.length
        if (best.length >= keep && err >= best[best.length - 1].err) return
        best.push({ idx: chosen.map(x => x.i), err })
        best.sort((a, b) => a.err - b.err)
        if (best.length > keep) best.pop()
    }
    const walk = (from: number, chosen: Item[], groups: Set<string>) => {
        for (let k = from; k < items.length && nodes < MAX_NODES; k++) {
            const x = items[k]
            if (groups.has(x.group)) continue
            // an equivalent candidate of lower rank must be in already
            if (x.rank > 0 && chosen.filter(c => c.cls === x.cls).length !== x.rank) continue
            nodes++
            chosen.push(x)
            const ln = lnOf(chosen)
            // far below the goal: this and any larger subset through it are off (3x is past any estimate error)
            if (ln >= lnGoal - Math.log(3)) {
                consider(chosen, ln)
                if (chosen.length < MAX_SIZE) { groups.add(x.group); walk(k + 1, chosen, groups); groups.delete(x.group) }
            }
            chosen.pop()
        }
    }
    walk(0, [], new Set())
    return best
}

export async function diagnoseDamage<C extends DiagnosisCandidate>(candidates: C[], target: DiagnosisTarget, score: VariantScorer,
    onProgress?: (done: number, total: number) => void, isCancelled: () => boolean = () => false): Promise<DiagnosisResult<C> | undefined> {
    const kinds: HitKind[] = target.hit === "either" ? ["crit", "normal"] : [target.hit]
    let total = 1 + candidates.length + VERIFY
    let done = 0
    const tick = () => onProgress?.(++done, Math.max(done, total))
    const run = async (change: VariantChange) => { const r = isCancelled() ? undefined : await score(change); tick(); return r }

    const baseCols = await run({})
    const base: DiagnosisResult<C>["base"] = {}
    for (const k of kinds) { const v = valueOf(baseCols, target, k); if (v) base[k] = v }
    if (isCancelled() || !Object.keys(base).length) return undefined
    const live = kinds.filter(k => base[k]! > target.observed * (1 + MATCH))
    if (!live.length) {
        onProgress?.(total, total)
        const aboveMax = kinds.every(k => target.observed > base[k]! * (1 + MATCH))
        return { base, rows: [], aboveMax, atMax: !aboveMax }
    }

    const singles = await Promise.all(candidates.map(c => run(c.change)))
    if (isCancelled()) return undefined
    const ratio = (i: number, hit: HitKind) => (valueOf(singles[i], target, hit) ?? base[hit]!) / base[hit]!
    // interchangeable candidates: same bucket, same damage on its own (e.g. two members' DMG dealt +30%)
    const classOf = new Map<string, number[]>()
    const cls: number[] = [], rank: number[] = []
    candidates.forEach((c, i) => {
        const sig = [c.bucket ?? c.id, ...live.map(h => ratio(i, h).toFixed(7))].join("|")
        const members = classOf.get(sig) ?? []
        if (!members.length) classOf.set(sig, members)
        cls.push(classOf.size); rank.push(members.length)
        members.push(i)
    })
    const peers = (i: number) => [...classOf.values()].find(m => m.includes(i))!

    // estimate, then run the best subsets together
    const guesses: { idx: number[], hit: HitKind, err: number }[] = []
    for (const hit of live) {
        const items = candidates.map((c, i) => ({ i, group: c.group, bucket: c.bucket ?? c.id, r: ratio(i, hit), cls: cls[i], rank: rank[i] }))
        for (const s of bestSubsets(items, target.observed / base[hit]!, VERIFY)) guesses.push({ ...s, hit })
    }
    guesses.sort((a, b) => a.err - b.err)
    const picked = guesses.slice(0, VERIFY)
    total = done + picked.length
    const rows = await Promise.all(picked.map(async g => {
        const missing = g.idx.map(i => candidates[i])
        const alternatives = g.idx.map(i => peers(i).filter(j => !g.idx.includes(j)).map(j => candidates[j]))
        // a single effect was already run on its own
        const cols = missing.length === 1 ? singles[g.idx[0]] : await run(mergeChanges(missing.map(c => c.change)))
        if (missing.length === 1) tick()
        const damage = valueOf(cols, target, g.hit)
        return damage === undefined ? undefined : { missing, alternatives, hit: g.hit, damage, diff: (damage - target.observed) / target.observed }
    }))
    onProgress?.(total, total)
    if (isCancelled()) return undefined
    // as good as exact within MATCH: then fewer missing effects first
    const fit = (r: DiagnosisRow<C>) => Math.max(MATCH, Math.abs(Math.log((r.damage || 1) / target.observed))) + SIZE_PENALTY * r.missing.length
    return { base, rows: rows.filter((r): r is DiagnosisRow<C> => !!r).sort((a, b) => fit(a) - fit(b)), aboveMax: false, atMax: false }
}

interface Job { id: number, change: VariantChange, resolve: (c: VariantColumn[] | undefined) => void }

/** Browser: a pool of engine workers running the page's Max Damage with changes (workers/maxDamageWorker.ts). */
export class EngineVariantPool {
    private readonly workers: { w: Worker, busy: boolean, hasContext: boolean }[] = []
    private readonly queue: Job[] = []
    private readonly inFlight = new Map<number, Job[]>()
    private nextId = 0
    private nextBatch = 0
    private closed = false
    private readonly context: VariantContext
    private readonly onError?: (e: unknown) => void

    constructor(context: VariantContext, size = defaultPoolSize(), onError?: (e: unknown) => void) {
        this.context = context
        this.onError = onError
        for (let i = 0; i < size; i++) {
            const w = newMaxDamageWorker()
            const slot = { w, busy: false, hasContext: false }
            w.onmessage = (e: MessageEvent<VariantReply>) => {
                if (e.data?.kind !== "variant") return
                const jobs = this.inFlight.get(e.data.batch) ?? []
                this.inFlight.delete(e.data.batch)
                const byId = new Map(e.data.scores.map(s => [s.id, s]))
                for (const j of jobs) {
                    const r = byId.get(j.id)
                    if (r?.error) this.onError?.(r.error)
                    j.resolve(r?.columns)
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

    score(change: VariantChange): Promise<VariantColumn[] | undefined> {
        if (this.closed) return Promise.resolve(undefined)
        return new Promise(resolve => {
            this.queue.push({ id: this.nextId++, change, resolve })
            this.pump()
        })
    }

    private pump() {
        if (this.closed) return
        for (const slot of this.workers) {
            if (slot.busy || !this.queue.length) continue
            const jobs = this.queue.splice(0, 1)
            const batch = this.nextBatch++
            this.inFlight.set(batch, jobs)
            slot.busy = true
            const msg: VariantBatch = { kind: "variant", batch, jobs: jobs.map(j => ({ id: j.id, change: j.change })) }
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
