// localStorage cache of the Kioku Grid's battle-engine charts (models/LuxBench.ts). The bench uses fixed seeds, so the
// same character at the same levels in the same setup always gives the same numbers: only characters that are new or
// changed have to be simulated again.
//
// Bump LUX_BENCH_VERSION whenever the engine or the bench changes the numbers; older entries are then dropped.
import type { BenchRow } from "../models/LuxBench"

export const LUX_BENCH_VERSION = 7

const STORAGE_KEY = "kiokuGridBenchCache"
const MAX_SETUPS = 8 // most recently used setups kept (chart x enemies x levels mode ...)

export interface BenchCacheEntry {
    max?: BenchRow[]
    avg?: BenchRow[]
}

interface CacheFile {
    version: number
    setups: Record<string, { used: number, chars: Record<string, BenchCacheEntry> }>
}

/** What a chart's numbers depend on besides the character itself. */
export interface BenchSetup {
    chart: string
    enemies: number
    seeds: number
    av: number
    infiniteSp: boolean
    lux: BenchUnit
}

export interface BenchUnit {
    id: number
    ascension: number
    kiokuLvl: number
    magicLvl: number
    heartphialLvl: number
    specialLvl: number
}

/** The part of a character that the bench reads (the kit at these levels; no portrait/support/crystalis). */
export const benchCharKey = (c: BenchUnit): string =>
    [c.id, c.ascension, c.kiokuLvl, c.magicLvl, c.heartphialLvl, c.specialLvl].join(":")

const setupKey = (s: BenchSetup): string =>
    JSON.stringify([s.chart, s.enemies, s.seeds, s.av, s.infiniteSp, benchCharKey(s.lux)])

function read(): CacheFile {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
        if (raw?.version === LUX_BENCH_VERSION && raw.setups && typeof raw.setups === "object") return raw as CacheFile
    } catch { /* unreadable or blocked: start over */ }
    return { version: LUX_BENCH_VERSION, setups: {} }
}

function write(file: CacheFile) {
    const keys = Object.keys(file.setups).sort((a, b) => file.setups[b].used - file.setups[a].used)
    for (const k of keys.slice(MAX_SETUPS)) delete file.setups[k]
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(file))
    } catch { /* full or blocked: the charts still work, just without the cache */ }
}

/** The cached entries of one setup, keyed by benchCharKey. */
export function loadBenchCache(setup: BenchSetup): Record<string, BenchCacheEntry> {
    return read().setups[setupKey(setup)]?.chars ?? {}
}

/** Stores (replaces) the entries of one setup. */
export function saveBenchCache(setup: BenchSetup, chars: Record<string, BenchCacheEntry>) {
    const file = read()
    file.setups[setupKey(setup)] = { used: Date.now(), chars }
    write(file)
}

/** Forgets one setup (the chart's "Recalculate"). */
export function clearBenchCache(setup: BenchSetup) {
    const file = read()
    delete file.setups[setupKey(setup)]
    write(file)
}
