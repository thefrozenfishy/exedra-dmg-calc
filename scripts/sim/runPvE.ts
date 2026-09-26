// Headless PvE battle: npx tsx scripts/sim/runPvE.ts <questStageMstId> [seed] [teamExport.json] [maxTurns]
// The team comes from a PvP export's allied side (default: the Heroic Grace fixture).
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { stageWaves, enemyName, questStages } from "../../src/models/PvE";
import { buildPvPKiokus, formatSequence, parseExport } from "../../src/utils/pvpExport";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

const [stageArg, seedArg, teamFile, turnsArg] = process.argv.slice(2);
const stageId = Number(stageArg ?? 104113);
const teamPath = teamFile || new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname;
const data = parseExport(fs.readFileSync(teamPath, "utf8"));
const quiet = { warn: console.warn, debug: console.debug };
console.warn = () => {}; console.debug = () => {};
const [allies] = buildPvPKiokus(data.slots);
const stage = questStages.get(stageId);
const waves = stageWaves(stageId);
const battle = createPvEBattle(allies, stageId, Number(seedArg ?? 1));
const snaps: BattleSnapshot[] = [battle.getCurrentState()];
for (let t = 0; t < Number(turnsArg ?? 40) && !battle.isOver; t++) snaps.push(...battle.executeNextAction());
Object.assign(console, quiet);
console.log(`Stage ${stageId} ${stage?.name}: ${waves.map((w, i) => `wave ${i + 1}: ${w.map(enemyName).join(", ")}`).join(" | ")}`);
console.log(formatSequence(snaps).join("\n"));
console.log(`result: ${battle.result ?? "not finished"} after ${snaps.length - 1} actions`);
