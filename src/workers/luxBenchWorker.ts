// Beta Kioku Grid charts measured with the battle engine (models/LuxBench.ts), off the main thread. One job is one
// chart: each character's Max Burst (fast) and Average Damage (battle simulations), one character at a time. Each
// result is posted as soon as it is known, so the page draws the chart bar by bar while the rest is computed.
import "../models/BestTeamCalculator"; // loads Kioku <-> BestTeamCalculator <-> ScoreAttackKioku in a working order
import { benchKioku, LuxBenchCharts, type BenchRow } from "../models/LuxBench";
import type { PvPKioku } from "../models/PvPKioku";
import type { Character } from "../types/KiokuTypes";

export interface LuxBenchJob {
    chart: "support" | "attacker"
    lux: Character
    chars: Character[]  // levels already applied
    enemies: number     // attacker chart: 1, 3 or 5 (the support chart always uses one)
    seeds: number
    av: number
    infiniteSp: boolean
}

export type LuxBenchMessage =
    | { type: "max" | "avg", id: number, rows: BenchRow[] }
    | { type: "error", id: number, error: string }
    | { type: "done" }

console.debug = () => { } // the engine logs every action

// Kit only, like the legacy charts: no portrait, support or crystalis.
const toInput = (c: Character) => ({ ...c, portrait: undefined, supportKey: undefined, crysIDs: [], subCrysIDs: [] }) as any

self.onmessage = (e: MessageEvent<LuxBenchJob>) => {
    const job = e.data
    const post = (m: LuxBenchMessage) => self.postMessage(m)
    const bench = new LuxBenchCharts(toInput(job.lux), { seeds: job.seeds, av: job.av, infiniteSp: job.infiniteSp })
    const units = new Map<number, PvPKioku>()
    const failed = new Set<number>()

    const run = (c: Character, type: "max" | "avg") => {
        if (failed.has(c.id)) return
        try {
            let x = units.get(c.id)
            if (!x) units.set(c.id, x = benchKioku(toInput(c)))
            const rows = job.chart === "support"
                ? (type === "max" ? bench.supportMax(x) : bench.supportAvg(x))
                : [type === "max" ? bench.attackerMax(x, job.enemies) : bench.attackerAvg(x, job.enemies)]
            post({ type, id: c.id, rows })
        } catch (err) {
            failed.add(c.id)
            console.warn(`Lux bench (${job.chart}): failed to calculate ${c.name}:`, err)
            post({ type: "error", id: c.id, error: String(err) })
        }
    }

    // One character at a time, both metrics, so its bar appears complete in either view.
    for (const c of job.chars) {
        run(c, "max")
        run(c, "avg")
    }
    post({ type: "done" })
}
