// Fight solver: searches the player's decisions in a PvE battle for the clear that takes the least action value
// (elapsed turn-gauge time, "AV"). Not a game rule: a search over what the PvE Simulator's Manual control lets the
// player decide (Battle Skill / Basic Attack, which ultimate to fire and when, every ally-side target pick), with
// the enemies on their normal AI (skill rotation, aggro targeting) and every random roll decided by the page's RNG
// mode (seed: the seeded generator, so a path is one exact seeded battle; hit / miss / weighted as on the page;
// manual is searched as weighted: the solver cannot reuse roll flips made for one particular sequence).
//
// Search: depth-first over decision points, best-looking child first (least enemy HP left), with
//   - branch and bound: a node whose elapsed AV already reaches the best clear found is not expanded;
//   - memoisation: the state at every decision point is hashed (models/BattleClone.ts StateHasher). Reaching a
//     state already seen at the same or lower AV stops that path ("merged"); at equal state less AV dominates.
// The search is anytime: the best clear so far is always available; an emptied stack means the result is optimal
// for this model (team, stage, RNG mode).
//
// Nodes are decision points: the battle at the start of an executeNextAction that needs at least one decision.
// A node's edge holds the decisions of that action (an ultimate window, the action choice, its targets...) and the
// decision-free actions after it (enemy turns, follow-ups) up to the next decision point or the end. Battles are
// cloned at action boundaries (BattleCloner) and a decision inside an action re-runs that action from its start,
// since PendingDecision-style stops unwind the engine mid-action.
import { BattleRng, type RngKind, type RngMode } from "./BattleRng";
import { BattleCloner, StateHasher, sharedObjects } from "./BattleClone";
import type { PvPBattle } from "./PvPBattle";
import { restoreModuleBattleState, saveModuleBattleState } from "./PvPTeam";
import type { BattleSnapshot } from "../types/KiokuTypes";

// ---------------------------------------------------------------------------------------------------------------
// RNG: the page's roll modes, the player's decisions forced from a list
// ---------------------------------------------------------------------------------------------------------------
export interface SolverPick { kind: RngKind, label: string, choice: string, value: number, count: number }

// Thrown when the battle needs a decision that the forced list does not hold.
export class SolverPending extends Error {
    readonly kind: RngKind
    readonly label: string
    readonly options: string[]
    constructor(kind: RngKind, label: string, options: string[]) {
        super(`Solver decision: ${label}`)
        this.kind = kind
        this.label = label
        this.options = options
        this.name = "SolverPending"
    }
}

export class SolverRng extends BattleRng {
    // mulberry32 state as a plain number (the base class keeps it in a closure, which a clone cannot copy).
    // Same sequence as BattleMath.seededRng(seed), so seed mode reproduces the simulator's seeded battle.
    state: number
    forced: number[] = []
    pos = 0
    picks: SolverPick[] = []

    constructor(mode: RngMode, seed: number) {
        super(mode === "manual" ? "weighted" : mode, seed)
        this.state = seed >>> 0
    }

    protected draw(): number {
        this.state = (this.state + 0x6D2B79F5) >>> 0
        let t = this.state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    pick(kind: RngKind, label: string, optionLabels: string[]): number {
        if (optionLabels.length <= 1) return optionLabels.length - 1
        if (this.pos >= this.forced.length) throw new SolverPending(kind, label, optionLabels)
        const value = this.forced[this.pos++]
        if (value < 0 || value >= optionLabels.length) throw new Error(`Solver: decision ${value} out of range for "${label}"`)
        this.picks.push({ kind, label, choice: optionLabels[value], value, count: optionLabels.length })
        const options = optionLabels.map(l => ({ label: l, weight: 100 / optionLabels.length }))
        // Same event as BattleRng.pick records, so a replayed path shows its picks in the roll list.
        ;(this as any).record({ kind, label, options, outcome: value, defaultOutcome: value, decided: true, userPick: true })
        return value
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------------------------------------------
export type SolverNodeStatus =
    | "open"      // waiting on the DFS stack
    | "expanded"  // its decisions were tried
    | "win" | "lose"
    | "merged"    // same state reached before with no more AV (memoisation)
    | "bound"     // AV already at or past the best clear
    | "cap"       // over the AV cap, or too many actions without a decision
    | "error"

interface Checkpoint { battle: PvPBattle, mod: ReturnType<typeof saveModuleBattleState> }
interface Pending { kind: RngKind, label: string, options: string[] }

interface SNode {
    id: number
    parent: number
    depth: number
    elapsed: number
    status: SolverNodeStatus
    remaining: number     // enemy HP left, in waves (next waves count 1 each)
    picks: SolverPick[]   // decisions on the edge into this node
    steps: number         // executeNextAction calls on the edge (decision action + automatic ones)
    actors: string[]      // who acted on the edge (display)
    children: number[]
    order: number         // generation order among siblings
    cp?: Checkpoint       // only while open
    pending?: Pending
    mergedInto?: number
    note?: string
}

export interface SolverNodeView {
    id: number
    parent: number
    depth: number
    status: SolverNodeStatus
    elapsed: number
    remaining: number
    label: string
    picks: { label: string, choice: string, count: number }[]
    actors: string[]
    steps: number
    childCount: number
    nextDecision?: string
    mergedInto?: number
    note?: string
    onBestPath?: boolean
}

export interface SolverStats {
    nodes: number
    expanded: number
    actions: number       // executeNextAction calls simulated (incl. re-runs for decisions inside an action)
    merged: number
    bounded: number
    capped: number
    wins: number
    losses: number
    errors: number
    open: number
    memoSize: number
    ms: number
    bestElapsed?: number
    bestNode?: number
    bestFoundAt?: number  // node count when the best was found
    current?: number      // node being expanded most recently (the search's current path ends there)
    done: boolean         // stack empty: the best is optimal for the model
    stopReason?: string
}

export interface SolverOptions {
    maxNodes: number          // stop after creating this many nodes (0 = no limit)
    maxAv: number             // do not expand nodes past this AV (0 = no cap)
    memo: boolean
    stopOnAllyDeath?: boolean // a path ends as a defeat as soon as any ally is down
    maxAutoActions?: number   // decision-free actions in a row before a path is capped (default 600)
    maxBranch?: number        // decision combinations tried per node (default 400)
}

const short = (unit: string) => unit.replace(/ \(Ally \d+\)$/, "").replace(/ \(Enemy (\d+)\)$/, " #$1")

// "Lux☆Magica: Skill → Rose Garden Witch #3; Ult Iroha"
export function summarizePicks(picks: { label: string, choice: string }[]): string {
    const parts: string[] = []
    for (const p of picks) {
        const actor = short(p.label.split(" · ")[0])
        if (p.label.startsWith("Between actions")) {
            if (p.choice.startsWith("Ultimate: ")) parts.push(`Ult ${short(p.choice.slice(10))}`)
        } else if (p.label.endsWith("choose an action")) {
            if (p.choice.startsWith("Ultimate: ")) parts.push(`Ult ${short(p.choice.slice(10))}`)
            else parts.push(`${actor}: ${p.choice.startsWith("Battle Skill") ? "Skill" : p.choice.startsWith("Basic") ? "Basic" : p.choice}`)
        } else {
            const t = `→ ${short(p.choice)}`
            if (parts.length) parts[parts.length - 1] += ` ${t}`; else parts.push(`${actor} ${t}`)
        }
    }
    return parts.join("; ") || (picks.length ? "Hold ultimates" : "(auto)")
}

// Ultimates first (auto play fires them as soon as they are ready), then the engine's order (Skill before Basic).
function optionOrder(options: string[]): number[] {
    const idx = options.map((_, i) => i)
    return [...idx.filter(i => options[i].startsWith("Ultimate: ")), ...idx.filter(i => !options[i].startsWith("Ultimate: "))]
}

export class FightSolver {
    readonly nodes: SNode[] = []
    readonly stats: SolverStats
    private stack: number[] = []
    private memo = new Map<string, { elapsed: number, id: number }>()
    private cloner: BattleCloner
    private hasher: StateHasher
    private root: Checkpoint
    private t0 = 0
    private bestPath = new Set<number>()

    // `build` makes a fresh battle (fresh units) that uses `new SolverRng(...)` and manual ally control; it is
    // called twice: the second battle only serves to find the objects every battle shares (master data).
    readonly opts: SolverOptions
    constructor(build: () => PvPBattle, opts: SolverOptions) {
        this.opts = opts
        const first = build()
        const shared = sharedObjects(first, build())
        this.cloner = new BattleCloner(shared)
        this.hasher = new StateHasher(shared)
        first.bindSnapshotHooks(false)
        this.root = { battle: first, mod: saveModuleBattleState() }
        this.stats = { nodes: 0, expanded: 0, actions: 0, merged: 0, bounded: 0, capped: 0, wins: 0, losses: 0, errors: 0, open: 0, memoSize: 0, ms: 0, done: false }
        const b = this.cloner.cloneBattle(first)
        this.settle({ battle: b, mod: this.root.mod }, -1, 0, [], 0, [])
    }

    // ---- one action on a copy of a checkpoint ----
    private runAction(cp: Checkpoint, forced: number[]):
        | { done: true, cp: Checkpoint, picks: SolverPick[], actor?: string }
        | { done: false, pending: Pending } {
        const b = this.cloner.cloneBattle(cp.battle)
        restoreModuleBattleState(cp.mod)
        const rng = b.rng as SolverRng
        rng.forced = forced
        rng.pos = 0
        rng.picks = []
        this.stats.actions++
        let snaps: BattleSnapshot[]
        try {
            snaps = b.executeNextAction()
        } catch (e) {
            if (e instanceof SolverPending) return { done: false, pending: { kind: e.kind, label: e.label, options: e.options } }
            throw e
        }
        rng.events.length = 0
        rng.drain()
        const picks = rng.picks
        rng.forced = []
        rng.picks = []
        const actor = snaps.map(s => s.lastActor).filter(Boolean).join(", ")
        return { done: true, cp: { battle: b, mod: saveModuleBattleState() }, picks, actor }
    }

    // Enemy HP left: waves still to come count 1 each; the current wave by its linked pool or its units' HP
    // (HP gauges included).
    private remaining(b: PvPBattle): number {
        const t2 = (b as any).team2
        const later = ((b as any).pendingWaves?.length ?? 0)
        if (b.isOver) return b.result === "win" ? 0 : later + 1
        if (t2.linkHp) return later + t2.linkHp.current / Math.max(1, t2.linkHp.max)
        const units = t2.kiokuStates as any[]
        if (!units.length) return later
        let sum = 0
        for (const u of units) {
            const gauges = Math.max(1, u.enemy?.appearance?.hpGaugeCount ?? 1)
            const left = u.isDead ? 0 : (Math.max(0, (u.enemy?.hpGaugeCount ?? 1) - 1) + Math.max(0, u.currentHp) / Math.max(1, u.maxHp)) / gauges
            sum += left
        }
        return later + sum / units.length
    }

    private allyDown(b: PvPBattle): boolean {
        return ((b as any).team1.kiokuStates as any[]).some(k => k.isDead)
    }

    // Runs decision-free actions from `cp` until the next decision point or the end, and records the node.
    private settle(cp: Checkpoint, parent: number, depth: number, picks: SolverPick[], steps: number, actors: string[], order = 0): SNode {
        const maxAuto = this.opts.maxAutoActions ?? 600
        let pending: Pending | undefined
        let status: SolverNodeStatus = "open"
        let note: string | undefined
        let auto = 0
        try {
            for (;;) {
                if (cp.battle.isOver) { status = cp.battle.result === "win" ? "win" : "lose"; break }
                if (this.opts.stopOnAllyDeath && this.allyDown(cp.battle)) { status = "lose"; note = "an ally fell (search option: stop when an ally dies)"; break }
                if (this.opts.maxAv > 0 && cp.battle.elapsed > this.opts.maxAv) { status = "cap"; note = `past the ${this.opts.maxAv} AV cap`; break }
                if (auto >= maxAuto) { status = "cap"; note = `${maxAuto} actions without a decision`; break }
                const r = this.runAction(cp, [])
                if (!r.done) { pending = r.pending; break }
                cp = r.cp
                steps++
                auto++
                if (r.actor) actors.push(r.actor)
            }
        } catch (e) {
            status = "error"
            note = String((e as any)?.message ?? e)
            console.warn("Fight solver: engine error", e)
        }
        const b = cp.battle
        const node: SNode = {
            id: this.nodes.length, parent, depth, elapsed: b.elapsed, status, remaining: this.remaining(b), picks, steps,
            actors, children: [], order, note,
        }
        this.nodes.push(node)
        this.stats.nodes++
        if (parent >= 0) this.nodes[parent].children.push(node.id)
        const best = this.stats.bestElapsed
        if (status === "win") {
            this.stats.wins++
            if (best === undefined || node.elapsed < best) {
                this.stats.bestElapsed = node.elapsed
                this.stats.bestNode = node.id
                this.stats.bestFoundAt = this.stats.nodes
                this.bestPath = new Set(this.pathTo(node.id))
            }
        } else if (status === "lose") this.stats.losses++
        else if (status === "cap") this.stats.capped++
        else if (status === "error") this.stats.errors++
        else if (best !== undefined && node.elapsed >= best) { node.status = "bound"; this.stats.bounded++ }
        else {
            if (this.opts.memo) {
                const key = this.hasher.hash(b, (b.rng as SolverRng).state)
                const seen = this.memo.get(key)
                if (seen && seen.elapsed <= node.elapsed) {
                    node.status = "merged"
                    node.mergedInto = seen.id
                    this.stats.merged++
                    return node
                }
                this.memo.set(key, { elapsed: node.elapsed, id: node.id })
                this.stats.memoSize = this.memo.size
            }
            node.cp = cp
            node.pending = pending
        }
        return node
    }

    // Tries every decision combination of the node's next action.
    private expand(node: SNode): void {
        const cp = node.cp!
        const maxBranch = this.opts.maxBranch ?? 400
        const leaves: { cp: Checkpoint, picks: SolverPick[], actor?: string }[] = []
        const walk = (prefix: number[], pending: Pending) => {
            for (const i of optionOrder(pending.options)) {
                if (leaves.length >= maxBranch) return
                const forced = [...prefix, i]
                const r = this.runAction(cp, forced)
                if (r.done) leaves.push(r)
                else walk(forced, r.pending)
            }
        }
        try {
            walk([], node.pending!)
        } catch (e) {
            node.status = "error"
            node.note = String((e as any)?.message ?? e)
            this.stats.errors++
            node.cp = undefined
            return
        }
        node.status = "expanded"
        this.stats.expanded++
        node.cp = undefined
        node.pending = undefined
        const children = leaves.map((l, k) => this.settle(l.cp, node.id, node.depth + 1, l.picks, 1, l.actor ? [l.actor] : [], k))
        // Best-looking first: least enemy HP left, then least AV.
        const open = children.filter(c => c.status === "open")
            .sort((a, b) => a.remaining - b.remaining || a.elapsed - b.elapsed || a.order - b.order)
        for (let k = open.length - 1; k >= 0; k--) this.stack.push(open[k].id)
    }

    // Runs the search for about `budgetMs`. Returns true once the search has finished (or hit the node limit).
    run(budgetMs: number): boolean {
        if (!this.t0) {
            this.t0 = performance.now() - this.stats.ms
            if (!this.stack.length && this.nodes[0]?.status === "open") this.stack.push(0)
        }
        const end = performance.now() + budgetMs
        while (this.stack.length && performance.now() < end) {
            if (this.opts.maxNodes > 0 && this.stats.nodes >= this.opts.maxNodes) { this.stats.stopReason = "node limit"; break }
            const node = this.nodes[this.stack.pop()!]
            if (node.status !== "open") continue
            const best = this.stats.bestElapsed
            if (best !== undefined && node.elapsed >= best) {
                node.status = "bound"; node.cp = undefined; node.pending = undefined; this.stats.bounded++
                continue
            }
            this.stats.current = node.id
            this.expand(node)
        }
        this.stats.ms = performance.now() - this.t0
        this.stats.open = this.stack.filter(id => this.nodes[id].status === "open").length
        this.stats.done = !this.stack.length
        if (this.stats.done) this.stats.stopReason = "search complete"
        const finished = this.stats.done || this.stats.stopReason === "node limit"
        return finished
    }

    // Lets a stopped search continue with a new node limit.
    resume(maxNodes: number): void {
        this.opts.maxNodes = maxNodes
        this.stats.stopReason = undefined
        this.t0 = 0
    }

    pathTo(id: number): number[] {
        const path: number[] = []
        for (let n: SNode | undefined = this.nodes[id]; n; n = n.parent >= 0 ? this.nodes[n.parent] : undefined) path.push(n.id)
        return path.reverse()
    }

    view(id: number): SolverNodeView {
        const n = this.nodes[id]
        return {
            id: n.id, parent: n.parent, depth: n.depth, status: n.status, elapsed: n.elapsed, remaining: n.remaining,
            label: n.parent < 0 ? "Start" : summarizePicks(n.picks),
            picks: n.picks.map(p => ({ label: p.label, choice: p.choice, count: p.count })),
            actors: n.actors, steps: n.steps, childCount: n.children.length,
            nextDecision: n.pending?.label, mergedInto: n.mergedInto, note: n.note, onBestPath: this.bestPath.has(n.id),
        }
    }

    childViews(id: number): SolverNodeView[] {
        const n = this.nodes[id]
        if (!n) return []
        return n.children.map(c => this.view(c))
            .sort((a, b) => Number(b.onBestPath) - Number(a.onBestPath) || statusRank(a.status) - statusRank(b.status) || a.elapsed - b.elapsed || a.remaining - b.remaining)
    }

    // Compact tree for the page's drawing: per node its parent, AV, HP left and edge label (only nodes from `from`
    // on; those never change) plus every node's current status (statuses do change: open -> expanded / cut).
    treeSince(from: number): SolverTreeChunk {
        const n = this.nodes.length
        const k = Math.max(0, n - from)
        const parents = new Int32Array(k), elapsed = new Float64Array(k), remaining = new Float32Array(k), labels: string[] = []
        for (let i = 0; i < k; i++) {
            const node = this.nodes[from + i]
            parents[i] = node.parent
            elapsed[i] = node.elapsed
            remaining[i] = node.remaining
            labels.push(node.parent < 0 ? "Start" : summarizePicks(node.picks))
        }
        const status = new Uint8Array(n)
        for (let i = 0; i < n; i++) status[i] = SOLVER_STATUSES.indexOf(this.nodes[i].status)
        return { from, parents, elapsed, remaining, labels, status }
    }

    bestPathIds(): number[] {
        return this.stats.bestNode === undefined ? [] : this.pathTo(this.stats.bestNode)
    }

    // The battle from the start up to the node, with display snapshots (a fresh copy of the untouched start).
    history(id: number): { snapshots: BattleSnapshot[], picks: SolverPick[], elapsed: number } {
        const path = this.pathTo(id).map(i => this.nodes[i])
        const forced = path.flatMap(n => n.picks.map(p => p.value))
        const steps = path.reduce((s, n) => s + n.steps, 0)
        const b = this.cloner.cloneBattle(this.root.battle, true)
        restoreModuleBattleState(this.root.mod)
        const rng = b.rng as SolverRng
        rng.forced = forced
        rng.pos = 0
        rng.picks = []
        const snapshots: BattleSnapshot[] = [b.getCurrentState()]
        for (let i = 0; i < steps && !b.isOver; i++) {
            try {
                snapshots.push(...b.executeNextAction())
            } catch (e) {
                if (e instanceof SolverPending) break
                throw e
            }
        }
        return { snapshots, picks: rng.picks, elapsed: b.elapsed }
    }
}

// Status codes of SolverTreeChunk.status.
export const SOLVER_STATUSES: SolverNodeStatus[] = ["open", "expanded", "win", "lose", "merged", "bound", "cap", "error"]
export interface SolverTreeChunk { from: number, parents: Int32Array, elapsed: Float64Array, remaining: Float32Array, labels: string[], status: Uint8Array }

const STATUS_ORDER: SolverNodeStatus[] = ["win", "expanded", "open", "merged", "bound", "cap", "lose", "error"]
const statusRank = (s: SolverNodeStatus) => STATUS_ORDER.indexOf(s)
