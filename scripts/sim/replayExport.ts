// Replays a PvP or PvE simulator export (the "Export to file" button) with the current engine:
//   npx tsx scripts/sim/replayExport.ts <export.json> [--diff] [--out <file>]
// Same teams (and stage), seed, RNG mode, decisions and number of turns. Prints the decision log and
// the readable sequence; with --diff it only prints the lines that differ from the sequence stored in
// the file (i.e. what the engine change did).
import "../../src/models/BestTeamCalculator"; // must load first: breaks the Kioku <-> BestTeamCalculator import cycle outside Vite
import fs from "fs";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { buildPvPKiokus, buildSlotKioku, formatDecisions, formatSequence, parseExport, parsePvEExport, PVE_EXPORT_FORMAT } from "../../src/utils/pvpExport";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { PendingDecision, type RngEvent } from "../../src/models/BattleRng";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
if (!file) { console.error("usage: replayExport.ts <export.json> [--diff] [--out <file>]"); process.exit(1); }
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args[outIdx + 1] : undefined;

const text = fs.readFileSync(file, "utf8");
const isPvE = JSON.parse(text)?.format === PVE_EXPORT_FORMAT;
const quiet = { warn: console.warn, debug: console.debug, error: console.error };
console.warn = () => {}; console.debug = () => {}; console.error = () => {};

let data: { seed: number, turns: number, exportedAt: string, notes?: string, sequence: string[] };
let battle: PvPBattle;
let header: string;
if (isPvE) {
    const pve = parsePvEExport(text);
    data = pve;
    const allies = pve.slots.filter(s => !!s.main).map(buildSlotKioku);
    battle = createPvEBattle(allies, pve.stageId, pve.seed, 0, { rngMode: pve.rngMode, decisions: pve.decisions, manualTargeting: pve.control === "manual",
        partyBuffId: pve.soloRaid?.partyBuffId, noRoundLimit: pve.soloRaid?.noRoundLimit, raidCarry: pve.soloRaid?.attempts?.[pve.soloRaid.attempts.length - 1] });
    header = `PvE stage ${pve.stageId} ${pve.stageName ?? ""}, ${pve.control} control, ${pve.rngMode} RNG, seed ${pve.seed}`;
} else {
    const pvp = parseExport(text);
    data = pvp;
    const [allies, enemies] = buildPvPKiokus(pvp.slots);
    battle = new PvPBattle(new PvPTeam(allies, "Ally"), new PvPTeam(enemies, "Enemy"), false, pvp.seed, { rngMode: pvp.rngMode, decisions: pvp.decisions });
    header = `PvP, ${pvp.rngMode ?? "seed"} RNG, seed ${pvp.seed}`;
}
const snaps: BattleSnapshot[] = [battle.getCurrentState()];
let pending: RngEvent | undefined;
for (let t = 0; t < data.turns && !battle.isOver; t++) {
    try { snaps.push(...battle.executeNextAction()); }
    catch (e) {
        if (e instanceof PendingDecision) { pending = e.event; break; }
        snaps.push({ ...battle.getCurrentState(), lastActor: `ERROR: ${(e as Error).message}` }); break;
    }
}
Object.assign(console, quiet);

const lines = formatSequence(snaps);
if (out) fs.writeFileSync(out, lines.join("\n") + "\n");
if (!args.includes("--diff")) {
    console.log(`${header}, ${data.turns} turns, exported ${data.exportedAt}${data.notes ? `\nnotes: ${data.notes}` : ""}`);
    const decisions = formatDecisions(snaps, pending);
    console.log(decisions.length ? `== Decisions ==\n${decisions.map(l => "  " + l).join("\n")}` : "== Decisions == (none)");
    console.log(lines.join("\n"));
} else {
    const old = data.sequence;
    let shown = 0;
    for (let i = 0; i < Math.max(old.length, lines.length); i++) {
        if (old[i] === lines[i]) continue;
        if (shown++ > 200) { console.log("... (more differences)"); break; }
        console.log(`@${i + 1}\n  file: ${old[i] ?? "<none>"}\n  now:  ${lines[i] ?? "<none>"}`);
    }
    console.log(shown ? `${shown} differing line(s)` : "identical to the exported sequence");
}
