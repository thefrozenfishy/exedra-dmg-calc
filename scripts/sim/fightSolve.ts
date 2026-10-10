// Fight Solver from the command line: the PvE Simulator's search (models/FightSolver.ts) on all CPU cores, writing
// the same results file as the page's "Save results" (load it with "Load results" under the Battle Simulator).
//
//   npx tsx scripts/sim/fightSolve.ts <pve-export.json> [options]
//
// The input is a PvE Simulator "Export to file" (stage, team, seed, RNG mode, Solo Raid buff / carry), or a Fight
// Solver results file (the page's "Save results" / "Save this line", or this script's output): the search then starts
// where that file's line ends (its first card, or --pick N), like "Continue from here", with the file's goal and slack
// unless given. Options:
//   --goal G           where a line ends (default clear): clear | wave (end of this wave) | phase (next boss phase) |
//                      checkpoint (wave or phase) | break (next break) | hpNN (the wave's shared HP pool, else the boss, at NN%, e.g. hp75)
//   --slack N          also keep lines up to N AV slower than the best (default: clear 0, checkpoints 30)
//   --workers N        worker threads (default: CPU cores - 1, at most 16)
//   --minutes M        stop after M minutes (default: run until Ctrl+C or until the search is complete)
//   --nodes N          stop after about N nodes in total
//   --out FILE         results file (default fight-solver-<stage>-<goal>-<time>.json in the current folder)
//   --save-every S     also write the file every S seconds while searching (default 60; 0 = only at the end)
//   --pick N           results file: start from its N-th card (default 1)
//   --priority LIST    checkpoint states: characters whose EP and AV until their next turn count on their own (as much
//                      EP / as little AV as possible each), e.g. "Lux,3" (names or team positions 1-5)
//   --tactics FILE     checkpoint goals and per-ally strategies: the page's "Export tactics" file (allies by name);
//                      a results file's own tactics otherwise; --no-tactics drops them
//   --from-export      start from the export's battle: its decisions and its first <turns> actions are the opening
//                      (like "Solve from here"; the export's own control mode is used for them)
//   --allow-ally-deaths   keep searching lines where an ally falls (default: such a line ends as a defeat)
//   --max-av N         do not search past N AV
//   --max-depth N      only search N decisions ahead of the start (deeper lines are cut)
//   --search best|dfs  order of the search after the pre-pass: best = always go on from the most promising waiting line
//                      of the whole search (a good line fast; default), dfs = depth first (complete, wide)
//   --break-spread     add the general tactic "spread breaks over several actions" (see FightSolverTactics)
//   --no-memo --no-dominance --no-symmetry --no-beam            switch off exact pruning
//   --lower-bound X --ai-ally-targets --ai-enemy-targets --ults-asap --ult-habits --loose   approximations
// Ctrl+C stops the search and writes the file (a second Ctrl+C quits at once).
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { FightSolverJob } from "../../src/models/FightSolverJob";
import type { CheckpointView, SolverGoal, SolverStats } from "../../src/models/FightSolver";
import type { SolverExportItem, SavedResults, SavedCandidate } from "../../src/models/FightSolverResults";

type ToWorker = { type: "bound", elapsed: number } | { type: "export", ids: number[], token: number } | { type: "stop" }
type FromWorker =
    | { type: "progress", stats: SolverStats, candidates: CheckpointView[], running: boolean }
    | { type: "exported", token: number, items: SolverExportItem[] }
    | { type: "error", error: string }

if (isMainThread) await main(); else await worker()

// ---------------------------------------------------------------------------------------------------------------
async function worker() {
    console.warn = () => { }; console.debug = () => { }
    const { createJobSolver } = await import("../../src/models/FightSolverJob")
    const { exportItems } = await import("../../src/models/FightSolverResults")
    const job = workerData as FightSolverJob
    const port = parentPort!
    const post = (m: FromWorker) => port.postMessage(m)
    let running = true
    const { solver } = createJobSolver(job)
    if (job.partition.index === 0 && solver.goalNote) console.log(`note: ${solver.goalNote}`)
    if (job.partition.index === 0 && solver.spreadNote) console.log(`note: ${solver.spreadNote}`)
    const lines = new Map<number, SolverExportItem>()   // lines never change: replay each node once
    port.on("message", (m: ToWorker) => {
        try {
            if (m.type === "bound") solver.setExternalBound(m.elapsed)
            else if (m.type === "stop") { running = false; solver.stats.stopReason = "stopped"; report() }
            else if (m.type === "export") {
                const missing = m.ids.filter(id => !lines.has(id))
                for (const it of exportItems(solver, missing)) lines.set(it.id, it)
                post({ type: "exported", token: m.token, items: m.ids.map(id => lines.get(id)!) })
            }
        } catch (e) { post({ type: "error", error: String((e as any)?.message ?? e) }) }
    })
    const report = () => post({ type: "progress", stats: { ...solver.stats }, candidates: solver.candidates, running })
    const tick = () => {
        if (!running) return
        try {
            if (solver.run(400)) running = false
        } catch (e) {
            running = false
            post({ type: "error", error: String((e as any)?.message ?? e) })
        }
        report()
        if (running) setImmediate(tick)
    }
    report()
    setImmediate(tick)
}

function toUrl(p: string): string { return p.startsWith("file:") ? p : pathToFileURL(p).href }

// A worker thread running this file. Under tsx the TypeScript loader is not active in worker threads by itself:
// the worker registers it (tsx's own API, found next to the loader the main thread was started with) first.
function spawn(job: FightSolverJob): Worker {
    const self = new URL(import.meta.url).href
    const loader = process.execArgv.find(a => /tsx[\\/]dist[\\/]loader\.mjs$/.test(a))
    if (!loader) return new Worker(new URL(import.meta.url), { workerData: job })
    const api = toUrl(loader.replace(/loader\.mjs$/, "esm/api/index.mjs"))
    const code = `(async () => { const { register } = await import(${JSON.stringify(api)}); register(); await import(${JSON.stringify(self)}) })().catch(e => { console.error(e); process.exit(1) })`
    return new Worker(code, { eval: true, workerData: job, execArgv: [] })
}

// ---------------------------------------------------------------------------------------------------------------
async function main() {
    const { parsePvEExport } = await import("../../src/utils/pvpExport")
    const { RESULTS_FORMAT, combineStats, lineOf, mergeCandidates, resultsFileName } = await import("../../src/models/FightSolverResults")
    const { jobSides } = await import("../../src/models/FightSolverJob")
    const { isSolverGoal } = await import("../../src/models/FightSolver")

    // ---- arguments ----
    const args = process.argv.slice(2)
    const file = args.find(a => !a.startsWith("--") && !isValueOf(a))
    function isValueOf(a: string) { const i = args.indexOf(a); return i > 0 && VALUED.has(args[i - 1]) }
    const VALUED = new Set(["--tactics", "--priority", "--pick", "--goal", "--slack", "--workers", "--minutes", "--nodes", "--out", "--save-every", "--max-av", "--max-depth", "--lower-bound", "--search"])
    const flag = (n: string) => args.includes(n)
    const value = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
    const num = (n: string, d: number) => { const v = value(n); if (v === undefined) return d; const x = Number(v); if (!Number.isFinite(x)) fail(`${n} needs a number`); return x }
    function fail(msg: string): never { console.error(msg); process.exit(2) }
    if (!file || flag("--help")) fail("usage: npx tsx scripts/sim/fightSolve.ts <pve-export.json | results.json> [--pick N] [--priority Name,2] [--goal clear|wave|phase|checkpoint|break|hpNN] [--slack N] [--workers N] [--minutes M] [--nodes N] [--out FILE] [--save-every S] [--from-export] [--allow-ally-deaths] (see the top of the script for all options)")
    const text = fs.readFileSync(file, "utf8")
    const parsed = JSON.parse(text)
    // A results file: its setup and the line of one of its cards (the search starts where that line ends).
    const results = parsed?.format === RESULTS_FORMAT ? parsed as SavedResults : undefined
    const data = results ? results.setup : parsePvEExport(text)
    const pick = Math.round(num("--pick", 1))
    const from = results ? results.candidates[pick - 1] : undefined
    if (results && !from) fail(`the results file has ${results.candidates.length} card(s); --pick ${pick} is not one of them`)
    const goal = (value("--goal") ?? results?.search.goal ?? "clear") as SolverGoal
    if (!isSolverGoal(goal)) fail(`unknown --goal ${goal} (clear, wave, phase, checkpoint, break, or hpNN: the wave's HP pool / the boss at NN%, e.g. hp75)`)
    const slack = num("--slack", value("--goal") === undefined && results ? results.search.slack : goal === "clear" ? 0 : 30)
    const count = Math.max(1, Math.min(16, Math.round(num("--workers", Math.min(16, Math.max(1, os.cpus().length - 1))))))
    const minutes = num("--minutes", 0)
    const totalNodes = num("--nodes", 0)
    const saveEvery = num("--save-every", 60)
    const out = value("--out") ?? resultsFileName(data.stageId, goal)

    // The team as the page sends it: the filled slots in team order; Solo Raid: the party buff and the last carry.
    const attempts = data.soloRaid?.attempts ?? []
    const opening = from ? from.line : flag("--from-export") ? {
        decisions: Object.entries(data.decisions ?? {}).map(([k, v]) => [Number(k), v] as [number, any]),
        steps: data.turns, control: data.control, switches: [],
    } : undefined
    const base: Omit<FightSolverJob, "partition"> = {
        slots: data.slots.filter(s => !!s.main), stageId: data.stageId, seed: data.seed, rngMode: data.rngMode ?? "seed",
        partyBuffId: data.soloRaid?.partyBuffId || undefined, raidCarry: attempts.length ? attempts[attempts.length - 1] : undefined,
        maxNodes: totalNodes > 0 ? Math.ceil(Math.max(100, totalNodes) / count) : 0, maxAv: num("--max-av", 0), maxDepth: num("--max-depth", 0),
        memo: !flag("--no-memo"), dominance: !flag("--no-dominance"), symmetry: !flag("--no-symmetry"), beamWidth: flag("--no-beam") ? 0 : 8, search: (value("--search") ?? "best") as "best" | "dfs",
        lowerBound: num("--lower-bound", 0), aiAllyTargets: flag("--ai-ally-targets"), aiEnemyTargets: flag("--ai-enemy-targets"),
        ultsAsap: flag("--ults-asap"), ultHabits: flag("--ult-habits"), loose: flag("--loose"),
        stopOnAllyDeath: !flag("--allow-ally-deaths"), goal, slack, opening,
    }
    // --priority "Lux,3": team positions (1-based) or (parts of) names; a results file's own priority otherwise.
    const filled = base.slots
    const pv = value("--priority")
    base.priority = pv === undefined ? results?.search.job.priority : pv.split(",").map(x => x.trim()).filter(Boolean).map(x => {
        const n = Number(x)
        const i = Number.isInteger(n) ? n - 1 : filled.findIndex(sl => (sl.main?.name ?? "").toLowerCase().includes(x.toLowerCase()))
        if (!(i >= 0 && i < filled.length)) fail(`--priority: no team member "${x}" (team: ${filled.map((sl, k) => `${k + 1} ${sl.main?.name}`).join(", ")})`)
        return i
    })
    console.log(`${data.stageName ?? `stage ${data.stageId}`} · ${base.slots.length} units · ${base.rngMode}${base.rngMode === "seed" ? ` ${data.seed}` : ""} RNG · goal ${goal} · slack ${slack} AV · ${count} workers${from ? ` · from card ${pick} of ${file} (${from.note ?? `${from.elapsed.toFixed(1)} AV`}, ${from.route.length} decisions)` : opening ? ` · from the export's first ${opening.steps} actions` : ""}`)
    // --tactics FILE: the page's form (allies by name, FightSolverTactics.SolverTacticsByName).
    const { tacticsFromNames, goalLabel, hasTactics } = await import("../../src/models/FightSolverTactics")
    const tv = value("--tactics")
    if (flag("--no-tactics")) base.tactics = undefined
    else if (tv !== undefined) {
        const t = JSON.parse(fs.readFileSync(tv, "utf8"))
        const byName = t?.format === "exedra-fight-solver-tactics" ? t.tactics : t
        if (!byName || !Array.isArray(byName.goals) || typeof byName.strategies !== "object") fail(`--tactics: ${tv} is not a tactics file`)
        base.tactics = tacticsFromNames(byName, filled.map(sl => sl.main?.name ?? ""))
    } else base.tactics = results?.search.job.tactics
    if (flag("--break-spread")) base.tactics = { goals: [], strategies: [], ...base.tactics, spreadBreaks: true }
    if (base.tactics && !hasTactics(base.tactics)) base.tactics = undefined
    if (base.search !== "dfs") console.log("search order: best first (--search dfs for the depth-first sweep)")
    if (base.priority?.length) console.log(`prioritised: ${base.priority.map(i => filled[i]?.main?.name).join(", ")} (own EP and next turn each)`)
    if (base.tactics) {
        const names = filled.map(sl => sl.main?.name ?? "?")
        if (base.tactics.spreadBreaks) console.log("general: spread breaks over several actions (when the team has break action-advance)")
        if (base.tactics.goals.length) console.log(`goals: ${base.tactics.goals.map((g, i) => `${i + 1}. ${goalLabel(g, names)}`).join(" · ")}`)
        for (const st of base.tactics.strategies) console.log(`strategy ${names[st.ally]}: ${[
            st.action ? `${st.actionStrict ? "only" : "prefer"} ${st.action === "basic" ? "Basic Attack" : "Battle Skill"}` : "",
            st.buffMain !== undefined || st.buffSecond !== undefined ? `${st.buffStrict ? "only" : "prefer"} buffing ${[st.buffMain, st.buffSecond].filter(x => x !== undefined).map(x => names[x!]).join(" then ")}${st.buffName ? ` (${st.buffName})` : ""}` : "",
            st.ultAtBreak && st.ultAtBreak !== "free" || st.ultOtherwise && st.ultOtherwise !== "free" ? `${st.ultStrict ? "only" : "prefer"} ult ${st.ultAtBreak ?? "free"} at ${st.ultBreaks ?? 1}+ broken, else ${st.ultOtherwise ?? "free"}` : "",
        ].filter(Boolean).join("; ")}`)
    }
    console.log(`results: ${path.resolve(out)} (Ctrl+C stops and saves)`)

    // ---- workers ----
    interface W { w: Worker, stats?: SolverStats, candidates: CheckpointView[], running: boolean }
    const ws: W[] = []
    let bestShared = Infinity
    const t0 = Date.now()
    for (let index = 0; index < count; index++) {
        const w = spawn({ ...base, partition: { index, count } } satisfies FightSolverJob)
        const rec: W = { w, candidates: [], running: true }
        ws.push(rec)
        w.on("message", (m: FromWorker) => onMessage(index, m))
        w.on("error", e => { console.error(`worker ${index} failed:`, e); rec.running = false; checkDone() })
    }
    function onMessage(i: number, m: FromWorker) {
        const rec = ws[i]
        if (m.type === "error") { console.error(`worker ${i}: ${m.error}`); return }
        if (m.type === "exported") { exportReplies?.(i, m); return }
        rec.stats = m.stats
        rec.candidates = m.candidates
        rec.running = m.running
        const b = m.stats.bestElapsed
        if (b !== undefined && b < bestShared) {
            bestShared = b
            ws.forEach((o, k) => { if (k !== i) o.w.postMessage({ type: "bound", elapsed: b } satisfies ToWorker) })
        }
        checkDone()
    }

    // ---- saving: the merged candidates' lines from the workers that found them ----
    let exportReplies: ((i: number, m: Extract<FromWorker, { type: "exported" }>) => void) | undefined
    let saving: Promise<void> | undefined
    let token = 0
    function save(): Promise<void> {
        if (saving) return saving
        saving = (async () => {
            const all = ws.flatMap((r, i) => r.candidates.map(c => ({ ...c, worker: i })))
            const picked = mergeCandidates(all).slice(0, 60)
            const byWorker = new Map<number, number[]>()
            for (const c of picked) byWorker.set(c.worker, [...(byWorker.get(c.worker) ?? []), c.id])
            const t = ++token
            const items = new Map<number, SolverExportItem[]>()
            if (byWorker.size) await new Promise<void>(resolve => {
                exportReplies = (i, m) => {
                    if (m.token !== t) return
                    items.set(i, m.items)
                    if (items.size === byWorker.size) { exportReplies = undefined; resolve() }
                }
                for (const [i, ids] of byWorker) ws[i].w.postMessage({ type: "export", ids, token: t } satisfies ToWorker)
            })
            const sides = jobSides(base)
            const candidates: SavedCandidate[] = []
            for (const c of picked) {
                const it = items.get(c.worker)?.find(x => x.id === c.id)
                if (!it?.decisions) { if (it?.error) console.error(`could not replay a state: ${it.error}`); continue }
                const { id: _id, worker: _w, ...view } = c
                candidates.push({ ...view, line: lineOf(it, opening, sides), route: [...(from?.route ?? []), ...it.route] })
            }
            const { slots: _s, ...job } = base
            const results: SavedResults = {
                format: RESULTS_FORMAT, version: 1, savedAt: new Date().toISOString(),
                setup: { ...data, control: "auto", decisions: undefined, pending: undefined, decisionLog: [], sequence: [], snapshots: [] },
                search: { goal, slack, job, stats: combineStats(ws.flatMap(r => r.stats ? [r.stats] : [])) },
                candidates,
            }
            fs.writeFileSync(out + ".tmp", JSON.stringify(results))
            fs.renameSync(out + ".tmp", out)
        })().finally(() => { saving = undefined })
        return saving
    }

    // ---- progress, stopping ----
    let lastNodes = 0, lastT = t0
    const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 3600) ? `${Math.floor(s / 3600)}:` : ""}${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` }
    function line(): string {
        const st = combineStats(ws.flatMap(r => r.stats ? [r.stats] : []))
        if (!st) return "starting…"
        const now = Date.now()
        const rate = (st.nodes - lastNodes) / Math.max(0.001, (now - lastT) / 1000)
        lastNodes = st.nodes; lastT = now
        const cands = mergeCandidates(ws.flatMap(r => r.candidates)).length
        return `[${fmt(now - t0)}] ${st.nodes.toLocaleString("en")} nodes (${rate.toFixed(0)}/s) · ${st.phase === "prefix" ? "pre-pass · " : ""}best ${st.bestElapsed?.toFixed(1) ?? "-"} AV · ${cands} ${goal === "clear" ? "clears" : "states"} kept · ${st.wins} clears${goal !== "clear" ? ` / ${st.checkpoints} checkpoints` : ""} ${st.missedGoals ? ` (${st.missedGoals} miss your goal limits)` : ""} · ${st.losses} defeats (${st.allyFell} ally fell) · ${st.bounded} cut · ${st.merged + st.dominated} merged`
    }
    const progressTimer = setInterval(() => console.log(line()), 5000)
    const saveTimer = saveEvery > 0 ? setInterval(() => { save().then(() => console.log(`  saved ${out}`)).catch(e => console.error("save failed:", e)) }, saveEvery * 1000) : undefined
    const stopTimer = minutes > 0 ? setTimeout(() => finish("time limit"), minutes * 60_000) : undefined

    let finishing = false
    async function finish(reason: string) {
        if (finishing) return
        finishing = true
        clearInterval(progressTimer); if (saveTimer) clearInterval(saveTimer); if (stopTimer) clearTimeout(stopTimer)
        console.log(`${reason}: stopping…`)
        for (const r of ws) r.w.postMessage({ type: "stop" } satisfies ToWorker)
        await new Promise(r => setTimeout(r, 300))   // the workers' last progress (stats, candidates)
        console.log(line())
        await save()
        const st = combineStats(ws.flatMap(r => r.stats ? [r.stats] : []))
        const n = JSON.parse(fs.readFileSync(out, "utf8")).candidates.length
        console.log(`${st?.done ? "Search complete: the best is optimal for these settings. " : ""}Wrote ${n} ${goal === "clear" ? "clear" : "state"}${n === 1 ? "" : "s"} to ${path.resolve(out)}`)
        const top = JSON.parse(fs.readFileSync(out, "utf8")).candidates[0] as SavedCandidate | undefined
        if (top?.goals?.length) console.log(`best card: ${top.elapsed.toFixed(1)} AV · ${top.goals.map(g => `${g.ok === false ? "✗" : g.ok ? "✓" : "·"} ${g.label}: ${g.value}`).join(" · ")}`)
        console.log(`Load it on the PvE Simulator page: Fight Solver → Load results.`)
        for (const r of ws) await r.w.terminate()
        process.exit(0)
    }
    function checkDone() {
        if (!finishing && ws.every(r => !r.running)) {
            const st = combineStats(ws.flatMap(r => r.stats ? [r.stats] : []))
            finish(st?.done ? "search complete" : st?.stopReason ?? "workers finished")
        }
    }
    let interrupts = 0
    process.on("SIGINT", () => { if (++interrupts > 1) process.exit(130); finish("Ctrl+C") })
}
