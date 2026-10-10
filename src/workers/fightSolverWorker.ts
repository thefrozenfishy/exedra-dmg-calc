// PvE Simulator "Fight Solver" (models/FightSolver.ts) off the main thread. The search runs in slices of ~120 ms so
// the page's requests (stop, a node's battle history, a better bound found by another worker) are answered while it
// runs. Several of these workers can split one search (`partition`): each runs the same deterministic prefix, then
// its share of the frontier; the page relays the best AV between them. Progress carries the new part of the search
// tree (nodes are immutable once made, only their status changes) for the page's tree drawing.
import type { RngDecision } from "../models/BattleRng";
import type { FightSolver, CheckpointView, SolverNodeView, SolverStats, SolverTreeChunk } from "../models/FightSolver";
import { createJobSolver, type FightSolverJob } from "../models/FightSolverJob";
import { exportItems, type SolverExportItem } from "../models/FightSolverResults";
import type { BattleSnapshot } from "../types/KiokuTypes";

export type { FightSolverJob, SolverOpening } from "../models/FightSolverJob";
export type { SolverExportItem } from "../models/FightSolverResults";

export type FightSolverRequest =
    | { type: "start", job: FightSolverJob }
    | { type: "stop" }
    | { type: "ack" }                          // the page has handled a progress message (backpressure)
    | { type: "resume", maxNodes: number }
    | { type: "bound", elapsed: number }       // best AV found by another worker
    | { type: "history", id: number }
    | { type: "focus", id: number }            // search this branch next
    | { type: "skip", id: number }             // drop this branch's waiting nodes
    | { type: "decisions", id: number }        // the line to a node as simulator decisions ("play from here")
    | { type: "export", ids: number[], cards?: boolean }   // lines and routes of these nodes (saving to a file); cards: their state cards too

export type FightSolverMessage =
    | { type: "progress", running: boolean, stats: SolverStats, bestPath: number[], tree?: SolverTreeChunk, info?: string, candidates: CheckpointView[] }
    | { type: "history", id: number, view: SolverNodeView, snapshots: BattleSnapshot[], picks: { label: string, choice: string }[], elapsed: number }
    | { type: "focused", id: number, kind: "focus" | "skip", count: number } // count -1: applied after the pre-pass
    | { type: "decisions", id: number, decisions: [number, RngDecision][], steps: number, openingSteps: number, route: { label: string, elapsed: number }[], view: SolverNodeView }
    | { type: "exported", items: SolverExportItem[] }
    | { type: "error", error: string, request?: string }   // request: a failed history / decisions reply (the search goes on)

console.debug = () => { } // the engine logs every action
const warn = console.warn
let warnings = 0
console.warn = (...a: unknown[]) => { if (warnings++ < 20) warn(...a) }

let solver: FightSolver | undefined
let running = false
let sentNodes = 0       // tree nodes already sent to the page
let info = ""
let timer: ReturnType<typeof setTimeout> | undefined
// Backpressure: while the page is still handling the last progress message (tree merge, layout, drawing: slow on a
// big tree) the next ones are not sent, so they cannot pile up in front of the page's Stop click (the tree chunks
// are incremental, nothing is lost). A page that never answers is still served every 2 s.
let awaiting = false
let lastSent = 0

const post = (m: FightSolverMessage) => self.postMessage(m)

// The new part of the tree goes out with every progress message. In a parallel search the shared prefix is the
// same in every worker: only worker 0 sends it, the others start after it.
let partIndex = 0
function progress() {
    if (!solver) return
    let tree: SolverTreeChunk | undefined
    if (partIndex === 0 || solver.stats.phase !== "prefix") {
        if (partIndex !== 0 && sentNodes === 0) sentNodes = solver.stats.prefixSize ?? 0
        tree = solver.treeSince(sentNodes)
        sentNodes = solver.nodes.length
    }
    awaiting = true
    lastSent = performance.now()
    const m: FightSolverMessage = { type: "progress", running, stats: { ...solver.stats }, bestPath: solver.bestPathIds(), tree, info, candidates: solver.candidates }
    self.postMessage(m, { transfer: tree ? [tree.parents.buffer, tree.elapsed.buffer, tree.remaining.buffer, tree.status.buffer] : [] })
}

function tick() {
    timer = undefined
    if (!solver || !running) return
    try {
        if (solver.run(120)) running = false
    } catch (e) {
        running = false
        post({ type: "error", error: String((e as any)?.message ?? e) })
    }
    if (!running || !awaiting || performance.now() - lastSent > 2000) progress()
    if (running) timer = setTimeout(tick, 0)
}

self.onmessage = (e: MessageEvent<FightSolverRequest>) => {
    const m = e.data
    try {
        if (m.type === "start") {
            if (timer) clearTimeout(timer)
            const job = m.job
            sentNodes = 0
            partIndex = job.partition.index
            const r = createJobSolver(job)
            solver = r.solver
            info = r.info
            running = true
            progress()
            timer = setTimeout(tick, 0)
        } else if (m.type === "ack") {
            awaiting = false
        } else if (m.type === "stop") {
            running = false
            if (solver) solver.stats.stopReason = "stopped"
            progress()
        } else if (m.type === "resume") {
            if (!solver || running) return
            solver.resume(m.maxNodes)
            running = true
            timer = setTimeout(tick, 0)
        } else if (m.type === "bound") {
            solver?.setExternalBound(m.elapsed)
        } else if (m.type === "focus" || m.type === "skip") {
            if (!solver) return
            const finished = solver.stats.phase === "done"
            const count = m.type === "focus" ? solver.focus(m.id) : solver.skip(m.id)
            post({ type: "focused", id: m.id, kind: m.type, count })
            // A worker that had run out of work and got some back starts again (a stopped one waits for Continue).
            if (finished && !running && !solver.stats.done) { running = true; timer = setTimeout(tick, 0) }
            progress()
        } else if (m.type === "decisions") {
            if (!solver) return
            let d
            try { d = solver.decisions(m.id) } catch (err) { post({ type: "error", error: `Could not replay that line: ${(err as any)?.message ?? err}`, request: "decisions" }); return }
            const route = solver.pathTo(m.id).slice(1).map(i => { const v = solver!.view(i); return { label: v.label, elapsed: v.elapsed } })
            post({ type: "decisions", id: m.id, decisions: d.decisions, steps: d.steps, openingSteps: d.openingSteps, route, view: solver.view(m.id) })
        } else if (m.type === "export") {
            if (!solver) return
            const items = exportItems(solver, m.ids, m.cards)
            post({ type: "exported", items })
        } else if (m.type === "history") {
            if (!solver) return
            let h
            try { h = solver.history(m.id) } catch (err) { post({ type: "error", error: `Could not replay that line: ${(err as any)?.message ?? err}`, request: "history" }); return }
            // Snapshots are plain data; the JSON round trip drops anything a structured clone would reject.
            post({ type: "history", id: m.id, view: solver.view(m.id), snapshots: JSON.parse(JSON.stringify(h.snapshots)), picks: h.picks.map(p => ({ label: p.label, choice: p.choice })), elapsed: h.elapsed })
        }
    } catch (err) {
        running = false
        post({ type: "error", error: String((err as any)?.message ?? err) })
    }
}
