// PvE Simulator "Fight Solver" (models/FightSolver.ts) off the main thread. The search runs in slices of ~120 ms so
// the page's requests (stop, a node's battle history) are answered while it runs. Progress carries the new part of
// the search tree (nodes are immutable once made, only their status changes) for the page's tree drawing.
import "../models/BestTeamCalculator"; // loads Kioku <-> BestTeamCalculator <-> ScoreAttackKioku in a working order
import { createPvEBattle } from "../models/PvEBattle";
import type { RaidCarry } from "../models/PvPBattle";
import type { RngMode } from "../models/BattleRng";
import { FightSolver, SolverRng, type SolverNodeView, type SolverStats, type SolverTreeChunk } from "../models/FightSolver";
import { buildSlotKioku } from "../utils/pvpExport";
import type { TeamSlot } from "../types/BestTeamTypes";
import type { BattleSnapshot } from "../types/KiokuTypes";

export interface FightSolverJob {
    slots: TeamSlot[]       // filled team slots, in team order
    stageId: number
    seed: number
    rngMode: RngMode
    partyBuffId?: number
    raidCarry?: RaidCarry
    maxNodes: number
    maxAv: number
    memo: boolean
    stopOnAllyDeath: boolean
}

export type FightSolverRequest =
    | { type: "start", job: FightSolverJob }
    | { type: "stop" }
    | { type: "resume", maxNodes: number }
    | { type: "history", id: number }

export type FightSolverMessage =
    | { type: "progress", running: boolean, stats: SolverStats, bestPath: number[], tree?: SolverTreeChunk }
    | { type: "history", id: number, view: SolverNodeView, snapshots: BattleSnapshot[], picks: { label: string, choice: string }[], elapsed: number }
    | { type: "error", error: string }

console.debug = () => { } // the engine logs every action
const warn = console.warn
let warnings = 0
console.warn = (...a: unknown[]) => { if (warnings++ < 20) warn(...a) }

let solver: FightSolver | undefined
let running = false
let sentNodes = 0       // tree nodes already sent to the page
let lastTree = 0        // time of the last tree chunk
let timer: ReturnType<typeof setTimeout> | undefined

const post = (m: FightSolverMessage) => self.postMessage(m)

// The new part of the tree goes out with every progress message.
function progress(forceTree = false) {
    if (!solver) return
    let tree: SolverTreeChunk | undefined
    const now = performance.now()
    // Every progress (~8/s): the delta is small, and the page needs the node being expanded to draw the current path.
    if (forceTree || !running || now - lastTree > 0) {
        tree = solver.treeSince(sentNodes)
        sentNodes = solver.nodes.length
        lastTree = now
    }
    const m: FightSolverMessage = { type: "progress", running, stats: { ...solver.stats }, bestPath: solver.bestPathIds(), tree }
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
    progress()
    if (running) timer = setTimeout(tick, 0)
}

self.onmessage = (e: MessageEvent<FightSolverRequest>) => {
    const m = e.data
    try {
        if (m.type === "start") {
            if (timer) clearTimeout(timer)
            const job = m.job
            const build = () => {
                const allies = job.slots.map(buildSlotKioku)
                const b = createPvEBattle(allies, job.stageId, job.seed, 0, {
                    rng: new SolverRng(job.rngMode, job.seed), manualTargeting: true,
                    partyBuffId: job.partyBuffId, raidCarry: job.raidCarry,
                })
                // The player decides for the allies only: enemies keep their targeting AI.
                ;(b as any).team2.manualTargeting = false
                return b
            }
            sentNodes = 0
            solver = new FightSolver(build, { maxNodes: job.maxNodes, maxAv: job.maxAv, memo: job.memo, stopOnAllyDeath: job.stopOnAllyDeath })
            running = true
            progress(true)
            timer = setTimeout(tick, 0)
        } else if (m.type === "stop") {
            running = false
            if (solver) solver.stats.stopReason = "stopped"
            progress()
        } else if (m.type === "resume") {
            if (!solver || running) return
            solver.resume(m.maxNodes)
            running = true
            timer = setTimeout(tick, 0)
        } else if (m.type === "history") {
            if (!solver) return
            const h = solver.history(m.id)
            // Snapshots are plain data; the JSON round trip drops anything a structured clone would reject.
            post({ type: "history", id: m.id, view: solver.view(m.id), snapshots: JSON.parse(JSON.stringify(h.snapshots)), picks: h.picks.map(p => ({ label: p.label, choice: p.choice })), elapsed: h.elapsed })
        }
    } catch (err) {
        running = false
        post({ type: "error", error: String((err as any)?.message ?? err) })
    }
}
