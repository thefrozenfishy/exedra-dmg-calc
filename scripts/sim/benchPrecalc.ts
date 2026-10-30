// Precalculates the Kioku Grid bench charts (models/LuxBench.ts) into public/bench-precalc.json, which the site ships:
// the page reads every character it finds there and only simulates the rest in the visitor's browser.
//
//   npx tsx scripts/sim/benchPrecalc.ts -all   (every turn option, fight type, chart and ascension; same as --all)
//   npx tsx scripts/sim/benchPrecalc.ts [--turns 5,15] [--enemies 1,3,5] [--charts support,attacker,break] [--asc 0-5]
//                                       [--only "Name,Name"] [--jobs N] [--force]
//
// Every character (Lux aside) at every given ascension with max levels, which covers the three "Simulate using" modes
// (All A5, My Kioku, Multiple ascensions). Resumable: entries already in the file are kept and skipped (--force redoes
// them), and the file is rewritten as results come in. A file of another LUX_BENCH_VERSION is started over, so bump
// the version (luxBenchCache.ts) whenever the numbers change, then run this again. Defaults: Fast and Medium lengths
// (Slow = --turns 100 takes ~20x as long), all fight types, all three charts, A0-A5, cores - 1 processes.
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { benchKioku, LuxBenchCharts } from "../../src/models/LuxBench";
import { kiokuData } from "../../src/utils/helpers";
import { KiokuConstants, withMaxLevelsForPlayerLevel } from "../../src/types/KiokuTypes";
import { KiokuRole, LuxMagica } from "../../src/types/enums";
import {
    BENCH_ENEMY_COUNTS, BENCH_INFINITE_SP, BENCH_SEEDS, BENCH_TURN_OPTIONS, LUX_BENCH_VERSION, benchCharKey, encodePrecalcEntry,
    setupKey, type BenchPrecalcFile, type BenchSetup, type BenchUnit,
} from "../../src/utils/luxBenchCache";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/bench-precalc.json")
type Chart = "support" | "attacker" | "break"
interface Item { chart: Chart, enemies: number, turns: number, name: string, ascension: number }

// A character at max levels for this ascension, as the page prepares it (KiokuGridPage maxLevelsForChart / benchUnits).
const unitOf = (name: string, ascension: number): BenchUnit & { name: string } => withMaxLevelsForPlayerLevel(
    { id: kiokuData[name].id, name, ascension, kiokuLvl: 0, magicLvl: 0, heartphialLvl: 0, specialLvl: 0 },
    KiokuConstants.maxKiokuLvl)
const luxUnit = () => unitOf(LuxMagica, KiokuConstants.maxAscension)
const setupOf = (it: Pick<Item, "chart" | "enemies" | "turns">): BenchSetup => ({
    chart: it.chart, enemies: it.enemies, seeds: BENCH_SEEDS, av: it.turns * 100, infiniteSp: BENCH_INFINITE_SP, lux: luxUnit(),
})

function arg(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`)
    return i >= 0 ? process.argv[i + 1] : undefined
}
// "5,15,100", "0-5", or "5 15 100" (PowerShell passes an unquoted 5,15,100 as one argument "5 15 100")
const list = (v: string | undefined, def: readonly number[], name = "list"): number[] => {
    if (!v) return [...def]
    const out = v.split(/[\s,]+/).filter(Boolean).flatMap(p => {
        const [a, b] = p.split("-").map(Number)
        return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i)
    })
    if (!out.length || out.some(n => !Number.isInteger(n) || n < 0)) throw new Error(`--${name} "${v}": expected numbers like 5,15,100 or 0-5`)
    return out
}

// ── child: computes its items, one JSON line per result on stdout
async function child(file: string) {
    console.debug = () => {}; console.warn = () => {}; console.log = () => {}
    const items: Item[] = JSON.parse(fs.readFileSync(file, "utf8"))
    const benches = new Map<string, LuxBenchCharts>()
    for (const it of items) {
        const setup = setupOf(it)
        const sk = setupKey(setup)
        let bench = benches.get(sk)
        if (!bench) benches.set(sk, bench = new LuxBenchCharts({ ...setup.lux, name: LuxMagica, crysIDs: [], subCrysIDs: [] } as any,
            { seeds: setup.seeds, av: setup.av, infiniteSp: setup.infiniteSp }))
        const unit = unitOf(it.name, it.ascension)
        let out: string
        try {
            const x = benchKioku({ ...unit, crysIDs: [], subCrysIDs: [] } as any, undefined, it.chart === "break" ? "break" : true)
            const entry = it.chart === "break" ? { brk: bench.attackerBreak(x, it.enemies) }
                : it.chart === "support" ? { max: bench.supportMax(x, it.enemies), avg: bench.supportAvg(x, it.enemies) }
                    : { max: bench.attackerMax(x, it.enemies), avg: bench.attackerAvg(x, it.enemies) }
            out = JSON.stringify({ setup: sk, key: benchCharKey(unit), entry: encodePrecalcEntry(entry) })
        } catch (err) {
            out = JSON.stringify({ error: `${it.name} A${it.ascension} (${it.chart}, ${it.enemies} enemies, ${it.turns} turns): ${err}` })
        }
        process.stdout.write(out + "\n")
    }
}

// ── main: work list, child processes, merge into the file
async function main() {
    const charts = (arg("charts") ?? "support,attacker,break").split(/[\s,]+/).filter(Boolean) as Chart[]
    for (const c of charts) if (!["support", "attacker", "break"].includes(c)) throw new Error(`--charts: unknown chart "${c}" (support, attacker, break)`)
    const enemies = list(arg("enemies"), BENCH_ENEMY_COUNTS, "enemies")
    const all = process.argv.includes("--all")
    const turns = list(arg("turns"), all ? BENCH_TURN_OPTIONS : BENCH_TURN_OPTIONS.slice(0, 2), "turns")
    const ascensions = list(arg("asc"), [0, 1, 2, 3, 4, 5], "asc")
    const only = arg("only")?.split(",").map(s => s.trim())
    const force = process.argv.includes("--force")
    const jobs = Math.max(1, Number(arg("jobs") ?? Math.max(1, os.cpus().length - 1)))

    let file: BenchPrecalcFile = { v: LUX_BENCH_VERSION, s: {} }
    try {
        const old = JSON.parse(fs.readFileSync(OUT, "utf8")) as BenchPrecalcFile
        if (old.v === LUX_BENCH_VERSION) file = old
        else console.log(`${OUT} is from bench version ${old.v}, starting over for ${LUX_BENCH_VERSION}`)
    } catch { /* no file yet */ }

    const names = Object.keys(kiokuData).filter(n => n !== LuxMagica && (!only || only.includes(n)))
    const items: Item[] = []
    // one config = one chart x fight size x battle length, i.e. one setup in the file; tracked for the progress log
    const configs: Config[] = []
    for (const chart of charts) for (const e of enemies) for (const t of turns) {
        const sk = setupKey(setupOf({ chart, enemies: e, turns: t }))
        const cfg: Config = { label: configLabel(chart, e, t), total: 0, cached: 0, todo: 0, done: 0, failed: 0, failures: [] }
        configs.push(cfg)
        // the break chart only has Breakers (KiokuGridPage chartCharacters)
        for (const name of names.filter(n => chart !== "break" || kiokuData[n].role === KiokuRole.Breaker)) for (const a of ascensions) {
            cfg.total++
            if (!force && file.s[sk]?.[benchCharKey(unitOf(name, a))]) { cfg.cached++; continue }
            cfg.todo++
            items.push({ chart, enemies: e, turns: t, name, ascension: a })
        }
    }
    const cfgOf = new Map(configs.map(c => [c.label, c]))
    const configFor = (it: Item) => cfgOf.get(configLabel(it.chart, it.enemies, it.turns))!

    console.log(`Bench precalc v${LUX_BENCH_VERSION}: ${charts.join("/")} x ${enemies.join("/")} enemies x ${turns.join("/")} turns x A${ascensions.join(",")}${force ? " (--force)" : ""}`)
    console.log(`${"config".padEnd(LABEL_W)}  ${"total".padStart(6)}  ${"in file".padStart(7)}  ${"to calc".padStart(7)}`)
    for (const c of configs) console.log(`${c.label.padEnd(LABEL_W)}  ${String(c.total).padStart(6)}  ${String(c.cached).padStart(7)}  ${String(c.todo).padStart(7)}${c.todo ? "" : "  complete"}`)
    const sum = (f: (c: Config) => number) => configs.reduce((s, c) => s + f(c), 0)
    console.log(`${"all".padEnd(LABEL_W)}  ${String(sum(c => c.total)).padStart(6)}  ${String(sum(c => c.cached)).padStart(7)}  ${String(items.length).padStart(7)}`)
    if (!items.length) { console.log("Nothing to calculate, every config is complete."); return }
    console.log(`${items.length} to calculate with ${Math.min(jobs, items.length)} processes\n`)

    let done = 0, failed = 0, lastSave = Date.now(), lastReport = Date.now()
    const save = () => { fs.writeFileSync(OUT, JSON.stringify(file)); lastSave = Date.now() }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bench-precalc-"))
    const started = Date.now()
    const self = fileURLToPath(import.meta.url)
    // items of one setup stay together per process (Lux's baselines are computed once per process and setup)
    const shards: Item[][] = Array.from({ length: Math.min(jobs, items.length) }, () => [])
    items.forEach((it, i) => shards[i % shards.length].push(it))
    // a child answers its items in order, so position k of a shard is the item it is working on now
    const position = shards.map(() => 0)

    const report = () => {
        lastReport = Date.now()
        const finished = done + failed, elapsed = Date.now() - started
        const eta = finished ? fmtDuration(elapsed / finished * (items.length - finished)) : "?"
        console.log(`\n── ${new Date().toLocaleTimeString()}  ${bar(finished / items.length, 30)} ${pct(finished / items.length)}  ${finished}/${items.length}`
            + `${failed ? ` (${failed} failed)` : ""}  elapsed ${fmtDuration(elapsed)}, ~${eta} left`)
        const workers = new Map<Config, number>()
        shards.forEach((s, i) => { if (position[i] < s.length) { const c = configFor(s[position[i]]); workers.set(c, (workers.get(c) ?? 0) + 1) } })
        for (const c of configs) {
            if (!c.todo) continue
            const n = c.done + c.failed, w = workers.get(c) ?? 0
            const state = n === c.todo ? "done" : w ? `${w} worker${w > 1 ? "s" : ""}` : n ? "paused" : "queued"
            console.log(`   ${c.label.padEnd(LABEL_W)} ${bar(n / c.todo, 20)} ${pct(n / c.todo)} ${`${n}/${c.todo}`.padStart(9)}`
                + `${c.failed ? ` ${c.failed} failed` : ""}  ${state}${c.ms && n < c.todo ? `, ~${fmtDuration(c.ms / n * (c.todo - n) / Math.max(1, w))} left` : ""}`)
        }
    }

    await Promise.all(shards.map((shard, i) => new Promise<void>((resolve) => {
        const f = path.join(tmp, `shard${i}.json`)
        fs.writeFileSync(f, JSON.stringify(shard))
        const p = spawn(process.execPath, [...process.execArgv, self, "--child", f], { stdio: ["ignore", "pipe", "inherit"] })
        let buf = "", itemStart = Date.now()
        p.stdout.on("data", (d: Buffer) => {
            buf += d.toString()
            let nl: number
            while ((nl = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, nl); buf = buf.slice(nl + 1)
                if (!line.startsWith("{")) continue
                const r = JSON.parse(line)
                const cfg = configFor(shard[position[i]++])
                cfg.ms = (cfg.ms ?? 0) + Date.now() - itemStart; itemStart = Date.now()
                if (r.error) { failed++; cfg.failed++; cfg.failures.push(r.error); console.error(`failed: ${r.error}`) }
                else { (file.s[r.setup] ??= {})[r.key] = r.entry; done++; cfg.done++ }
                if (cfg.done + cfg.failed === cfg.todo)
                    console.log(`✓ ${cfg.label.trim()} finished: ${cfg.done} calculated${cfg.failed ? `, ${cfg.failed} failed` : ""}`)
                if (Date.now() - lastSave > 10_000) save()
                if (Date.now() - lastReport > REPORT_EVERY) report()
            }
        })
        p.on("close", () => resolve())
    })))
    save()
    fs.rmSync(tmp, { recursive: true, force: true })
    report()
    console.log(`\ndone in ${fmtDuration(Date.now() - started)}: ${done} calculated, ${failed} failed -> ${OUT} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`)
    const broken = configs.filter(c => c.failed)
    if (broken.length) {
        console.log("failed entries (run again to retry them):")
        for (const c of broken) for (const e of c.failures) console.log(`   ${e}`)
    }
}

// ── progress log helpers
interface Config { label: string, total: number, cached: number, todo: number, done: number, failed: number, failures: string[], ms?: number }
const REPORT_EVERY = 30_000
const LABEL_W = 30
const lengthName: Record<number, string> = { 5: "Fast", 15: "Medium", 100: "Slow" }
const configLabel = (chart: Chart, enemies: number, turns: number) =>
    `${chart.padEnd(8)} ${enemies} ${enemies === 1 ? "enemy  " : "enemies"} ${String(turns).padStart(3)}t${lengthName[turns] ? ` ${lengthName[turns]}` : ""}`
const bar = (f: number, w: number) => { const n = Math.round(Math.min(1, f) * w); return `[${"#".repeat(n)}${"-".repeat(w - n)}]` }
const pct = (f: number) => `${(Math.min(1, f) * 100).toFixed(1).padStart(5)}%`
function fmtDuration(ms: number): string {
    const m = Math.round(ms / 60000)
    return m < 1 ? "<1m" : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`
}

const childFile = process.argv.indexOf("--child")
if (childFile >= 0) child(process.argv[childFile + 1])
else main()
