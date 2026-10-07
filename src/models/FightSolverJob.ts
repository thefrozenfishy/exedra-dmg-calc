// A Fight Solver search as plain data (the page's settings, a team, a stage) and the solver it builds. Shared by the
// page's worker (workers/fightSolverWorker.ts) and the command-line runner (scripts/sim/fightSolve.ts), so both
// search exactly the same battle.
import "./BestTeamCalculator"; // loads Kioku <-> BestTeamCalculator <-> ScoreAttackKioku in a working order
import { createPvEBattle } from "./PvEBattle";
import type { RaidCarry } from "./PvPBattle";
import type { RngMode } from "./BattleRng";
import { FightSolver, SolverRng, applyControlSwitch, teamDamageModel, type SolverLine, type SolverGoal } from "./FightSolver";
import { hasTactics, type SolverTactics } from "./FightSolverTactics";
import { buildSlotKioku } from "../utils/pvpExport";
import type { TeamSlot } from "../types/BestTeamTypes";

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
    dominance: boolean
    symmetry: boolean
    beamWidth: number       // 0 = off
    lowerBound: number      // safety factor on the damage rate, 0 = off
    aiAllyTargets: boolean
    aiEnemyTargets: boolean
    ultsAsap: boolean
    ultHabits: boolean
    loose: boolean
    stopOnAllyDeath: boolean
    goal: SolverGoal
    slack: number
    priority?: number[]     // checkpoint cards: prioritised allies (team positions, 0-based; FightSolver.stateCard)
    tactics?: SolverTactics // checkpoint goals and per-ally strategies (team positions; FightSolverTactics)
    partition: { index: number, count: number }
    // "Solve from here": the simulator's battle so far (its decisions by roll index, the actions it ran, its control).
    opening?: SolverOpening
}

// The Battle Simulator's played part (see SolverLine).
export type SolverOpening = SolverLine

// The AI target sides of a job (solver control: allies manual, enemies on their AI, these sides also on the AI).
export function jobSides(job: Pick<FightSolverJob, "aiAllyTargets" | "aiEnemyTargets">): ("friend" | "opp")[] {
    return [...(job.aiAllyTargets ? ["friend" as const] : []), ...(job.aiEnemyTargets ? ["opp" as const] : [])]
}

export function createJobSolver(job: FightSolverJob): { solver: FightSolver, info: string } {
    const sides = jobSides(job)
    // Solver control: the player decides for the allies only, enemies keep their targeting AI.
    const handOver = (b: any) => applyControlSwitch(b, { at: 0, aiSides: sides })
    const op = job.opening
    const build = () => {
        const allies = job.slots.map(buildSlotKioku)
        const b = createPvEBattle(allies, job.stageId, job.seed, 0, {
            rng: new SolverRng(job.rngMode, job.seed, op ? new Map(op.decisions) : undefined),
            manualTargeting: op ? op.control === "manual" : true,
            partyBuffId: job.partyBuffId, raidCarry: job.raidCarry,
        })
        if (!op) handOver(b)
        return b
    }
    const prefix = op ? {
        steps: op.steps, handOver,
        onStep: (b: any, step: number) => { for (const sw of op.switches) if (sw.at === step) applyControlSwitch(b, sw) },
    } : undefined
    const probe = build()
    const damage = teamDamageModel(job.slots.map(buildSlotKioku), job.stageId, probe)
    const solver = new FightSolver(build, {
        maxNodes: job.maxNodes, maxAv: job.maxAv, memo: job.memo, dominance: job.dominance, symmetry: job.symmetry,
        beamWidth: job.beamWidth, lowerBound: job.lowerBound, damage, ultsAsap: job.ultsAsap, ultHabits: job.ultHabits,
        loose: job.loose, stopOnAllyDeath: job.stopOnAllyDeath, partition: job.partition, goal: job.goal, slack: job.slack, priority: job.priority,
        tactics: hasTactics(job.tactics) ? job.tactics : undefined,
    }, prefix)
    const info = [solver.goalNote, solver.resourceInfo, damage ? `max damage rate ≈ ${Math.round(damage.rate).toLocaleString()} HP/AV` : ""].filter(Boolean).join(" · ")
    return { solver, info }
}
