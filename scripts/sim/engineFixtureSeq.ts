// Prints the engine's readable sequence for a fixture export: npx tsx scripts/sim/engineFixtureSeq.ts <fixture> [fromAction] [toAction]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { buildPvPKiokus, buildSlotKioku, formatSequence, parseExport, parsePvEExport, PVE_EXPORT_FORMAT } from "../../src/utils/pvpExport";
import { isSoloRaidStage } from "../../src/models/PvE";
import { PendingDecision } from "../../src/models/BattleRng";
import { EngineBattle } from "../../src/battle/EngineBattle";
const [file, fromArg = "0", toArg = "999"] = process.argv.slice(2);
console.warn = () => {}; console.debug = () => {};
const text = fs.readFileSync(new URL(`./fixtures/${file}`, import.meta.url), "utf8");
let b: EngineBattle;
if (JSON.parse(text)?.format === PVE_EXPORT_FORMAT) {
    const d = parsePvEExport(text);
    const allies = d.slots.filter(s => !!s.main).map(buildSlotKioku);
    const o = { seed: d.seed, rngMode: d.rngMode, decisions: d.decisions, manualTargeting: d.control === "manual", relaxedPicks: true };
    b = isSoloRaidStage(d.stageId) ? new EngineBattle({ kind: "soloRaid", allies, stageId: d.stageId, partyBuffId: d.soloRaid?.partyBuffId, noRoundLimit: d.soloRaid?.noRoundLimit }, o)
        : new EngineBattle({ kind: "quest", allies, stageId: d.stageId }, o);
} else {
    const d = parseExport(text);
    const [a, e] = buildPvPKiokus(d.slots);
    b = new EngineBattle({ kind: "pvp", allies: a, enemies: e }, { seed: d.seed, rngMode: d.rngMode, decisions: d.decisions });
}
const snaps = [b.initialState];
try { while (snaps.length <= Number(toArg) && !b.isOver) snaps.push(...b.executeNextAction()); }
catch (e) { if (!(e instanceof PendingDecision)) throw e; console.log(`<pending: ${e.event.label}>`); }
const seq = formatSequence(snaps);
const from = Number(fromArg), to = Number(toArg);
let on = from === 0;
for (const l of seq) {
    const m = l.match(/^== Action (\d+)/);
    if (m) on = Number(m[1]) >= from && Number(m[1]) <= to;
    else if (l.startsWith("== Initial")) on = from === 0;
    if (on) console.log(l);
}
