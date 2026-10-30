// localStorage cache of the Kioku Grid's battle-engine charts (models/LuxBench.ts). The bench uses fixed seeds, so the
// same character at the same levels in the same setup always gives the same numbers: only characters that are new or
// changed have to be simulated again.
//
// Bump LUX_BENCH_VERSION whenever the engine or the bench changes the numbers; older entries are then dropped.
//
// Precalculated results (scripts/sim/benchPrecalc.ts -> public/bench-precalc.json) are shipped with the site: the page
// reads a character from there first, so only characters missing from it (or a file of another LUX_BENCH_VERSION) are
// simulated in the visitor's browser.
import type { BenchRow } from "../models/LuxBench"

export const LUX_BENCH_VERSION = 30 // 8: expected-crit battles, battle length toggle; 9: Average Damage ailment immunity; 10: A0 Lux fillers; 11: element-identity dealers hit in that element; 12: Average Damage per AV; 13: EX crys, instant effects with a turn count, poison count conditions, kit special cases; 14: A0 Lux dealer in the buff chart; 15: role-identity Lux dealers get the average 5 star stats of that role; 16: Breaker included; 17: attacker chart baseline per role; 18: 1:1 engine (game-data dummies, rolled crits); 19: no filler Lux, adaptive seeds, expected-crit mod; 20: 5-unit teams again, expected crits unless a kit reacts to crits (then 10 rolled seeds); 21: Max Damage keeps who-may-hold conditions (role / element / unique buff); 22: Max Damage evaluates enemy / ally count conditions; 23: vortex always pops, one vortex per vortex user; 24: a vortex owner gets its own self buffs; 25: DoT ailments given and popped by IMM_SLIP_DMG; 26: ailment conditions 112/305/309 detected (Sacred Gift, ...), Max Damage enemies carry Weakness/Stun for real, Max Burst immunities like Average Damage, Average Damage dummies start unbroken (first hit breaks them); 27: battle-start passive order kit -> portrait -> support -> crystalis; 28: attacker chart baseline is the Attacker-stat Lux for every role; 29: forced recalc; 30: bench gear for everyone (crystalis, portrait, support) + average 5 star Attacker self buffs on the dealer / reference Lux

const STORAGE_KEY = "kiokuGridBenchCache"
const MAX_SETUPS = 24 // most recently used setups kept (chart x enemies x levels mode x battle length ...)

export interface BenchCacheEntry {
    max?: BenchRow[]
    avg?: BenchRow[]
    brk?: BenchRow[] // the "break" chart's only rows (break gauge per 100 AV)
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

// The page's fixed bench settings (also used by scripts/sim/benchPrecalc.ts, so the precalculated file matches).
export const BENCH_SEEDS = 10 // battles averaged when a team rolls crits (a kit reacts to crits) or has other random effects
export const BENCH_INFINITE_SP = true // SP topped up to 5 before every turn: a battle skill every turn, no SP shared out
export const BENCH_ENEMY_COUNTS = [1, 3, 5] as const // the page's fight types
export const BENCH_TURN_OPTIONS = [5, 15, 100] as const // the page's battle lengths (100 AV per turn)

export const setupKey = (s: BenchSetup): string =>
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

// ── Precalculated results shipped with the site

/** public/bench-precalc.json: `v` = LUX_BENCH_VERSION it was made with; `s` = setupKey -> benchCharKey -> [max rows,
 *  avg rows] (the "break" chart: [[], [], break rows]). A max row is [gain, crit rate, identity], an avg / break row
 *  [gain, identity]; identity = "element/role/ailment" ("" for none). Gains keep 3 decimals. */
type PrecalcEntry = [unknown[][], unknown[][]] | [unknown[][], unknown[][], unknown[][]]
export interface BenchPrecalcFile { v: number, s: Record<string, Record<string, PrecalcEntry>> }

const idOf = (r: BenchRow) => `${r.element ?? ""}/${r.role ?? ""}/${r.ailment ?? ""}`
const identityOf = (id: string): Pick<BenchRow, "element" | "role" | "ailment"> => {
    const [element, role, ailment] = id.split("/")
    return { ...(element ? { element } : {}), ...(role ? { role } : {}), ...(ailment ? { ailment } : {}) } as Pick<BenchRow, "element" | "role" | "ailment">
}
const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d

export function encodePrecalcEntry(e: BenchCacheEntry): PrecalcEntry {
    const plain = (rows: BenchRow[] = []) => rows.map(r => [round(r.gain, 3), idOf(r)])
    if (e.brk) return [[], [], plain(e.brk)]
    return [(e.max ?? []).map(r => [round(r.gain, 3), round(r.critRate ?? 0, 1), idOf(r)]), plain(e.avg)]
}

function decodePrecalcEntry([max, avg, brk]: PrecalcEntry): BenchCacheEntry {
    const plain = (rows: unknown[][]) => rows.map(([gain, id]) => ({ ...identityOf(id as string), gain: gain as number }))
    if (brk) return { brk: plain(brk) }
    return {
        max: max.map(([gain, critRate, id]) => ({ ...identityOf(id as string), gain: gain as number, critRate: critRate as number })),
        avg: plain(avg),
    }
}

let precalc: BenchPrecalcFile["s"] = {}
let precalcLoad: Promise<void> | undefined

/** Loads the shipped file once (missing, unreadable or of another LUX_BENCH_VERSION: nothing is precalculated). */
export function loadBenchPrecalc(): Promise<void> {
    precalcLoad ??= (async () => {
        try {
            const res = await fetch(`${import.meta.env.BASE_URL}bench-precalc.json`, { cache: "no-cache" })
            if (!res.ok) return
            const file = await res.json() as BenchPrecalcFile
            if (file?.v === LUX_BENCH_VERSION && file.s && typeof file.s === "object") precalc = file.s
        } catch { /* offline or no file: everything is simulated locally */ }
    })()
    return precalcLoad
}

/** The precalculated entry of one character (benchCharKey) in one setup, if the shipped file has it. */
export function precalcEntry(setup: BenchSetup, charKey: string): BenchCacheEntry | undefined {
    const e = precalc[setupKey(setup)]?.[charKey]
    return e ? decodePrecalcEntry(e) : undefined
}
