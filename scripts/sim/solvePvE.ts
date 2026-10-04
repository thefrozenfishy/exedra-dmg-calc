// Headless fight solver (models/FightSolver.ts): least-AV clear of a stage with a team, plus a clone check.
//   npx tsx scripts/sim/solvePvE.ts <stageId> [seed] [rngMode] [maxNodes] [teamExport.json]
// Search options as JSON in SOLVER_OPTS (SolverOptions fields, e.g. '{"dominance":true,"beamWidth":8,"symmetry":true}');
// "aiAllyTargets" / "aiEnemyTargets" set the allies' AI target sides; "parts": N runs the N partitions one after
// the other (sharing the bound, as the page's workers do) and reports the combined result.
// rngMode: seed | hit | miss | weighted (default seed). The team: a PvE export's slots or a PvP export's allied side
// (default: the Heroic Grace fixture). Prints the auto-play result, a straight-vs-cloned replay check (must be
// IDENTICAL: BattleCloner copies the whole battle state), the search stats, the best path and its sequence.
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { buildSlotKioku, formatSequence } from "../../src/utils/pvpExport";
import { FightSolver, SolverRng, teamDamageModel } from "../../src/models/FightSolver";
import { BattleCloner, sharedObjects } from "../../src/models/BattleClone";
import type { RngMode } from "../../src/models/BattleRng";

const [stageArg, seedArg, modeArg, nodesArg, teamFile] = process.argv.slice(2);
const stageId = Number(stageArg ?? 110112), seed = Number(seedArg ?? 1), mode = (modeArg ?? "seed") as RngMode
const data = JSON.parse(fs.readFileSync(teamFile || new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname, "utf8"))
const slots = (data.format === "exedra-pve-sim" ? data.slots : data.slots[1]).filter((s: any) => s.main)
console.warn = () => {}; console.debug = () => {};
const OPTS = JSON.parse(process.env.SOLVER_OPTS ?? "{}")
const build = (manual: boolean) => () => {
    const b: any = createPvEBattle(slots.map(buildSlotKioku), stageId, seed, 0, { rng: new SolverRng(mode, seed), manualTargeting: manual, partyBuffId: OPTS.partyBuffId ?? data.soloRaid?.partyBuffId })
    b.team2.manualTargeting = false
    const sides = new Set<"friend" | "opp">()
    if (OPTS.aiAllyTargets) sides.add("friend")
    if (OPTS.aiEnemyTargets) sides.add("opp")
    if (sides.size) b.team1.aiTargetSides = sides
    return b
}
// Auto play, straight and with a fresh clone before every action: must match exactly.
const A = build(false)(), cl = new BattleCloner(sharedObjects(A, build(false)()))
const sa = [A.getCurrentState()]; for (let i = 0; i < 400 && !A.isOver; i++) sa.push(...A.executeNextAction())
let B = build(false)(); const sb = [B.getCurrentState()]
for (let i = 0; i < 400 && !B.isOver; i++) { B = cl.cloneBattle(B, true); sb.push(...B.executeNextAction()) }
const same = formatSequence(sa).join("\n") === formatSequence(sb).join("\n") && A.elapsed === B.elapsed
console.log(`auto play: ${A.result ?? "not finished"} at ${A.elapsed.toFixed(1)} AV; cloned replay ${same ? "IDENTICAL" : "DIFFERENT"}`)

const parts = Number(OPTS.parts ?? 1)
if (OPTS.lowerBound || OPTS.damage) { OPTS.damage = teamDamageModel(slots.map(buildSlotKioku), stageId, build(true)()); console.log(`damage model: rate ${Math.round(OPTS.damage?.rate ?? 0)} HP/AV`) }
const t0 = performance.now()
let s!: FightSolver
let bestAll = Infinity, total = 0
for (let index = 0; index < parts; index++) {
    const si = new FightSolver(build(true), { maxNodes: Math.ceil(Number(nodesArg ?? 2000) / parts), maxAv: 0, memo: true, ...OPTS, partition: { index, count: parts } })
    si.setExternalBound(bestAll)
    while (!si.run(5000)) process.stdout.write(`  [${index}] ${si.stats.nodes} nodes, best ${si.stats.bestElapsed?.toFixed(1) ?? "-"}\n`)
    if (index === 0 && si.resourceInfo) console.log(`resources: ${si.resourceInfo}`)
    total += si.stats.nodes
    if ((si.stats.bestElapsed ?? Infinity) < bestAll || !s) { bestAll = Math.min(bestAll, si.stats.bestElapsed ?? Infinity); if (si.stats.bestElapsed !== undefined || !s) s = si }
}
if (parts > 1) console.log(`parts: ${parts}, ${total} nodes total, ${((performance.now() - t0) / 1000).toFixed(1)} s, best ${bestAll}`)
const st = s.stats
console.log(`solver: ${st.stopReason}; ${st.nodes} nodes (prefix ${st.prefixSize ?? 0}), ${st.actions} actions, ${st.merged} merged, ${st.dominated} dominated, ${st.symmetry} symmetric targets skipped, ${st.bounded} bound (${st.lowerBounded} by the lower bound), ${st.wins} clears, ${(st.ms / 1000).toFixed(1)} s, best found at node ${st.bestFoundAt ?? "-"}`)
if (st.bestNode === undefined) { console.log("no clear found"); process.exit(same ? 0 : 1) }
const h = s.history(st.bestNode)
console.log(`best: ${st.bestElapsed!.toFixed(1)} AV (replayed ${h.elapsed.toFixed(1)}), found at node ${st.bestFoundAt}`)
console.log(s.bestPathIds().map(i => s.view(i).label).join("\n  "))
if (s.candidates.length) {
    console.log(`candidates (${s.candidates.length}; clears: the fastest, checkpoints: not worse in every way than another):`)
    for (const c of s.candidates) console.log(`  #${c.id} ${c.elapsed.toFixed(1)} AV round ${c.round} wave ${c.wave}${c.win ? " CLEAR" : ""} SP ${c.sp} | ${c.allies.map(a => `${a.name} EP ${Math.round(a.ep)}/${a.maxEp} HP ${a.hpPct.toFixed(0)}%`).join(" | ")}`)
}
console.log(formatSequence(h.snapshots).filter(l => l.startsWith("==")).join("\n"))
process.exit(same && h.elapsed === st.bestElapsed ? 0 : 1)
