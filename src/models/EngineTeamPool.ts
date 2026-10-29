// App side (browser): a pool of workers scoring teams on the engine (workers/maxDamageWorker.ts "teams" messages), for
// models/EngineBestTeam. Each worker loads the engine once; jobs go out in small batches to whichever worker is free.
import type { KiokuArgs } from "../types/KiokuTypes"
import type { TeamScore, TeamScoreScenario } from "../battle/EngineTeamScore"
import type { TeamScoreBatch, TeamScoreReply } from "../workers/maxDamageWorker"
import { newMaxDamageWorker } from "../workers/newMaxDamageWorker"

interface Job { id: number, team: KiokuArgs[], maxOnly?: boolean, resolve: (s: TeamScore | undefined) => void, reject: (e: unknown) => void }

export const defaultPoolSize = () => Math.max(1, Math.min(8, (typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2) - 1))

export class EngineTeamPool {
    private readonly workers: { w: Worker, busy: boolean, hasScenario: boolean }[] = []
    private readonly queue: Job[] = []
    private readonly inFlight = new Map<number, Job[]>()
    private nextId = 0
    private nextBatch = 0
    private closed = false
    private readonly scenario: TeamScoreScenario
    private readonly onError?: (e: unknown) => void

    constructor(scenario: TeamScoreScenario, size = defaultPoolSize(), onError?: (e: unknown) => void) {
        this.scenario = scenario
        this.onError = onError
        for (let i = 0; i < size; i++) {
            const w = newMaxDamageWorker()
            const slot = { w, busy: false, hasScenario: false }
            w.onmessage = (e: MessageEvent<TeamScoreReply>) => {
                if (e.data?.kind !== "teams") return
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

    /** `maxOnly`: only TeamScore.max is needed (scoreTeam's maxOnly). */
    score(team: KiokuArgs[], maxOnly = false): Promise<TeamScore | undefined> {
        if (this.closed) return Promise.resolve(undefined)
        return new Promise((resolve, reject) => {
            this.queue.push({ id: this.nextId++, team, maxOnly, resolve, reject })
            this.pump()
        })
    }

    private pump() {
        if (this.closed) return
        for (const slot of this.workers) {
            if (slot.busy || !this.queue.length) continue
            // small batches: enough to amortize messaging, few enough that every worker gets work
            const size = Math.max(1, Math.min(6, Math.ceil(this.queue.length / this.workers.length)))
            const jobs = this.queue.splice(0, size)
            const batch = this.nextBatch++
            this.inFlight.set(batch, jobs)
            slot.busy = true
            const msg: TeamScoreBatch = { kind: "teams", batch, jobs: jobs.map(j => ({ id: j.id, team: j.team, maxOnly: j.maxOnly })) }
            if (!slot.hasScenario) { msg.scenario = this.scenario; slot.hasScenario = true }
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
