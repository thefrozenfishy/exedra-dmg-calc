// Fight Solver results file: the states a search found (checkpoint states or clears), each with the line that gets
// there (Battle Simulator decisions) and its route, plus the setup it ran with. Written by the page's "Save results"
// and by the command-line runner (scripts/sim/fightSolve.ts); read by the page's "Load results".
import type { RngDecision } from "./BattleRng";
import { candidateCovers, compareCandidates, type CheckpointView, type FightSolver, type SolverGoal, type SolverLine, type SolverStats } from "./FightSolver";
import type { FightSolverJob } from "./FightSolverJob";
import type { PvEExport } from "../utils/pvpExport";

export const RESULTS_FORMAT = "exedra-fight-solver-results"

export interface SolverRouteStep { label: string, elapsed: number }
// note: what was saved ("Decision 7 of the search", for a single node saved from the tree).
export type SavedCandidate = Omit<CheckpointView, "id"> & { line: SolverLine, route: SolverRouteStep[], note?: string }

export interface SavedResults {
    format: typeof RESULTS_FORMAT
    version: 1
    savedAt: string
    setup: PvEExport          // team, stage, seed, RNG the search ran with (a PvE Simulator export, no decisions)
    search: { goal: SolverGoal, slack: number, job: Omit<FightSolverJob, "slots" | "partition">, stats: SolverStats | null }
    candidates: SavedCandidate[]
}

// A node of one solver, for the file: its line as simulator decisions and the route to it (edge labels, AV).
export interface SolverExportItem {
    id: number
    decisions?: [number, RngDecision][]
    steps?: number
    openingSteps?: number
    route: SolverRouteStep[]
    card?: CheckpointView     // the node's state card (asked for with `cards`: any node, not only candidates)
    error?: string
}

export function exportItems(solver: FightSolver, ids: number[], cards = false): SolverExportItem[] {
    return ids.map(id => {
        const route = solver.pathTo(id).slice(1).map(i => { const v = solver.view(i); return { label: v.label, elapsed: v.elapsed } })
        try {
            const d = solver.decisions(id)
            return { id, decisions: d.decisions, steps: d.steps, openingSteps: d.openingSteps, route, card: cards ? solver.nodeCard(id) : undefined }
        } catch (err) { return { id, route, error: String((err as any)?.message ?? err) } }
    })
}

// The line of an exported node: the opening's control and switches, then solver control from where it ended.
export function lineOf(item: SolverExportItem, opening: SolverLine | undefined, aiSides: ("friend" | "opp")[]): SolverLine {
    return {
        decisions: item.decisions!, steps: item.steps!, control: opening?.control ?? "manual",
        switches: [...(opening?.switches ?? []), { at: item.openingSteps!, aiSides }],
    }
}

// Candidates of several workers: none covered by another (candidateCovers); fastest first, then most EP, SP, sooner turns.
// (An exact duplicate keeps its first copy.)
export function mergeCandidates<T extends { vec: number[] }>(all: T[]): T[] {
    return all.filter((c, ci) => !all.some((o, oi) => o !== c && candidateCovers(o.vec, c.vec) && (!candidateCovers(c.vec, o.vec) || oi < ci)))
        .sort(compareCandidates)
}

// Statistics of several workers: counts summed (the shared prefix once), the best of all.
export function combineStats(ss: SolverStats[]): SolverStats | null {
    if (!ss.length) return null
    const prefix = ss[0].prefixSize ?? 0
    const sum = (k: keyof SolverStats) => ss.reduce((a, x) => a + (Number(x[k]) || 0), 0)
    const best = ss.filter(x => x.bestElapsed !== undefined).sort((a, b) => a.bestElapsed! - b.bestElapsed!)[0]
    const many = ss.length > 1 && ss.every(x => x.prefixSize !== undefined)
    return {
        ...ss[0],
        nodes: many ? prefix + ss.reduce((a, x) => a + x.nodes - (x.prefixSize ?? 0), 0) : sum("nodes"),
        expanded: sum("expanded"), actions: sum("actions"), merged: sum("merged"), dominated: sum("dominated"),
        bounded: sum("bounded"), lowerBounded: sum("lowerBounded"), symmetry: sum("symmetry"), capped: sum("capped"),
        wins: sum("wins"), losses: sum("losses"), errors: sum("errors"), open: sum("open"), userSkipped: sum("userSkipped"),
        checkpoints: sum("checkpoints"), allyFell: sum("allyFell"), missedGoals: sum("missedGoals"),
        ms: Math.max(...ss.map(x => x.ms)),
        bestElapsed: best?.bestElapsed, bestNode: undefined, current: undefined,
        done: ss.every(x => x.done),
        stopReason: ss.every(x => x.done) ? "search complete" : ss.some(x => x.stopReason === "stopped") ? "stopped" : ss.find(x => x.stopReason)?.stopReason,
        phase: ss.some(x => x.phase === "prefix") ? "prefix" : ss.every(x => x.phase === "done") ? "done" : "search",
    }
}

export function resultsFileName(stageId: number, goal: SolverGoal, at = new Date(), tag?: string): string {
    return `fight-solver-${stageId}-${tag ?? goal}-${at.toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`
}
