// Precalculates the Kioku Grid bench charts (models/LuxBench.ts) into public/bench-precalc.json, which the site ships:
// the page reads every character it finds there and only simulates the rest in the visitor's browser.
//
//   npx tsx scripts/sim/benchPrecalc.ts [--turns 5,15] [--enemies 1,3,5] [--charts support,attacker] [--asc 0-5]
//                                       [--only "Name,Name"] [--jobs N] [--force]
//
// Every character (Lux aside) at every given ascension with max levels, which covers the three "Simulate using" modes
// (All A5, My Kioku, Multiple ascensions). Resumable: entries already in the file are kept and skipped (--force redoes
// them), and the file is rewritten as results come in. A file of another LUX_BENCH_VERSION is started over, so bump
// the version (luxBenchCache.ts) whenever the numbers change, then run this again. Defaults: Fast and Medium lengths
// (Slow = --turns 100 takes ~20x as long), all fight types, both charts, A0-A5, cores - 1 processes.
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { benchKioku, LuxBenchCharts } from "../../src/models/LuxBench";
import { kiokuData } from "../../src/utils/helpers";
import { KiokuConstants, withMaxLevelsForPlayerLevel } from "../../src/types/KiokuTypes";
import { LuxMagica } from "../../src/types/enums";
import {
    BENCH_ENEMY_COUNTS, BENCH_INFINITE_SP, BENCH_SEEDS, BENCH_TURN_OPTIONS, LUX_BENCH_VERSION, benchCharKey, encodePrecalcEntry,
    setupKey, type BenchPrecalcFile, type BenchSetup, type BenchUnit,
} from "../../src/utils/luxBenchCache";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/bench-precalc.json")
type Chart = "support" | "attacker"
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
const list = (v: string | undefined, def: readonly number[]): number[] => {
    if (!v) return [...def]
    return v.split(",").flatMap(p => {
        const [a, b] = p.split("-").map(Number)
        return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i)
    })
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
            const x = benchKioku({ ...unit, crysIDs: [], subCrysIDs: [] } as any, undefined, true)
            const max = it.chart === "support" ? bench.supportMax(x, it.enemies) : bench.attackerMax(x, it.enemies)
            const avg = it.chart === "support" ? bench.supportAvg(x, it.enemies) : bench.attackerAvg(x, it.enemies)
            out = JSON.stringify({ setup: sk, key: benchCharKey(unit), entry: encodePrecalcEntry({ max, avg }) })
        } catch (err) {
            out = JSON.stringify({ error: `${it.name} A${it.ascension} (${it.chart}, ${it.enemies} enemies, ${it.turns} turns): ${err}` })
        }
        process.stdout.write(out + "\n")
    }
}

// ── main: work list, child processes, merge into the file
async function main() {
    const charts = (arg("charts") ?? "support,attacker").split(",") as Chart[]
    const enemies = list(arg("enemies"), BENCH_ENEMY_COUNTS)
    const turns = list(arg("turns"), BENCH_TURN_OPTIONS.slice(0, 2))
    const ascensions = list(arg("asc"), [0, 1, 2, 3, 4, 5])
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
    for (const chart of charts) for (const e of enemies) for (const t of turns) {
        const sk = setupKey(setupOf({ chart, enemies: e, turns: t }))
        for (const name of names) for (const a of ascensions) {
            if (!force && file.s[sk]?.[benchCharKey(unitOf(name, a))]) continue
            items.push({ chart, enemies: e, turns: t, name, ascension: a })
        }
    }
    console.log(`${items.length} to calculate (${charts.join("/")} x ${enemies.join("/")} enemies x ${turns.join("/")} turns x A${ascensions.join(",")}), ${jobs} processes`)
    if (!items.length) return

    let done = 0, failed = 0, lastSave = Date.now()
    const save = () => { fs.writeFileSync(OUT, JSON.stringify(file)); lastSave = Date.now() }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bench-precalc-"))
    const started = Date.now()
    const self = fileURLToPath(import.meta.url)
    // items of one setup stay together per process (Lux's baselines are computed once per process and setup)
    const shards: Item[][] = Array.from({ length: Math.min(jobs, items.length) }, () => [])
    items.forEach((it, i) => shards[i % shards.length].push(it))
    await Promise.all(shards.map((shard, i) => new Promise<void>((resolve) => {
        const f = path.join(tmp, `shard${i}.json`)
        fs.writeFileSync(f, JSON.stringify(shard))
        const p = spawn(process.execPath, [...process.execArgv, self, "--child", f], { stdio: ["ignore", "pipe", "inherit"] })
        let buf = ""
        p.stdout.on("data", (d: Buffer) => {
            buf += d.toString()
            let nl: number
            while ((nl = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, nl); buf = buf.slice(nl + 1)
                if (!line.startsWith("{")) continue
                const r = JSON.parse(line)
                if (r.error) { failed++; console.error(`failed: ${r.error}`) }
                else { (file.s[r.setup] ??= {})[r.key] = r.entry; done++ }
                if (Date.now() - lastSave > 10_000) save()
                if ((done + failed) % 25 === 0) {
                    const rate = (Date.now() - started) / (done + failed)
                    console.log(`${done + failed}/${items.length}, ~${Math.round(rate * (items.length - done - failed) / 60000)} min left`)
                }
            }
        })
        p.on("close", () => resolve())
    })))
    save()
    fs.rmSync(tmp, { recursive: true, force: true })
    console.log(`done: ${done} calculated, ${failed} failed -> ${OUT} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`)
}

const childFile = process.argv.indexOf("--child")
if (childFile >= 0) child(process.argv[childFile + 1])
else main()
