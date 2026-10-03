// Headless fight solver (models/FightSolver.ts): least-AV clear of a stage with a team, plus a clone check.
//   npx tsx scripts/sim/solvePvE.ts <stageId> [seed] [rngMode] [maxNodes] [teamExport.json]
// rngMode: seed | hit | miss | weighted (default seed). The team: a PvE export's slots or a PvP export's allied side
// (default: the Heroic Grace fixture). Prints the auto-play result, a straight-vs-cloned replay check (must be
// IDENTICAL: BattleCloner copies the whole battle state), the search stats, the best path and its sequence.
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { buildSlotKioku, formatSequence } from "../../src/utils/pvpExport";
import { FightSolver, SolverRng } from "../../src/models/FightSolver";
import { BattleCloner, sharedObjects } from "../../src/models/BattleClone";
import type { RngMode } from "../../src/models/BattleRng";

const [stageArg, seedArg, modeArg, nodesArg, teamFile] = process.argv.slice(2);
const stageId = Number(stageArg ?? 110112), seed = Number(seedArg ?? 1), mode = (modeArg ?? "seed") as RngMode
const data = JSON.parse(fs.readFileSync(teamFile || new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname, "utf8"))
const slots = (data.format === "exedra-pve-sim" ? data.slots : data.slots[1]).filter((s: any) => s.main)
console.warn = () => {}; console.debug = () => {};
const build = (manual: boolean) => () => {
    const b: any = createPvEBattle(slots.map(buildSlotKioku), stageId, seed, 0, { rng: new SolverRng(mode, seed), manualTargeting: manual })
    b.team2.manualTargeting = false
    return b
}
// Auto play, straight and with a fresh clone before every action: must match exactly.
const A = build(false)(), cl = new BattleCloner(sharedObjects(A, build(false)()))
const sa = [A.getCurrentState()]; for (let i = 0; i < 400 && !A.isOver; i++) sa.push(...A.executeNextAction())
let B = build(false)(); const sb = [B.getCurrentState()]
for (let i = 0; i < 400 && !B.isOver; i++) { B = cl.cloneBattle(B, true); sb.push(...B.executeNextAction()) }
const same = formatSequence(sa).join("\n") === formatSequence(sb).join("\n") && A.elapsed === B.elapsed
console.log(`auto play: ${A.result ?? "not finished"} at ${A.elapsed.toFixed(1)} AV; cloned replay ${same ? "IDENTICAL" : "DIFFERENT"}`)

const s = new FightSolver(build(true), { maxNodes: Number(nodesArg ?? 2000), maxAv: 0, memo: true })
while (!s.run(5000)) process.stdout.write(`  ${s.stats.nodes} nodes, best ${s.stats.bestElapsed?.toFixed(1) ?? "-"}\n`)
const st = s.stats
console.log(`solver: ${st.stopReason}; ${st.nodes} nodes, ${st.actions} actions, ${st.merged} merged, ${st.bounded} bound, ${st.wins} clears, ${(st.ms / 1000).toFixed(1)} s`)
if (st.bestNode === undefined) { console.log("no clear found"); process.exit(same ? 0 : 1) }
const h = s.history(st.bestNode)
console.log(`best: ${st.bestElapsed!.toFixed(1)} AV (replayed ${h.elapsed.toFixed(1)}), found at node ${st.bestFoundAt}`)
console.log(s.bestPathIds().map(i => s.view(i).label).join("\n  "))
console.log(formatSequence(h.snapshots).filter(l => l.startsWith("==")).join("\n"))
process.exit(same && h.elapsed === st.bestElapsed ? 0 : 1)
