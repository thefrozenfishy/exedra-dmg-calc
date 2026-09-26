// Replays a PvP simulator export (the "Export to file" button) with the current engine:
//   npx tsx scripts/sim/replayExport.ts <export.json> [--diff] [--out <file>]
// Same teams, same seed, same number of turns. Prints the readable sequence; with --diff it only
// prints the lines that differ from the sequence stored in the file (i.e. what the engine change did).
import "../../src/models/BestTeamCalculator"; // must load first: breaks the Kioku <-> BestTeamCalculator import cycle outside Vite
import fs from "fs";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { buildPvPKiokus, formatSequence, parseExport } from "../../src/utils/pvpExport";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
if (!file) { console.error("usage: replayExport.ts <export.json> [--diff] [--out <file>]"); process.exit(1); }
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args[outIdx + 1] : undefined;

const data = parseExport(fs.readFileSync(file, "utf8"));
const quiet = { warn: console.warn, debug: console.debug, error: console.error };
console.warn = () => {}; console.debug = () => {}; console.error = () => {};

const [allies, enemies] = buildPvPKiokus(data.slots);
const battle = new PvPBattle(new PvPTeam(allies, "Ally"), new PvPTeam(enemies, "Enemy"), false, data.seed);
const snaps: BattleSnapshot[] = [battle.getCurrentState()];
for (let t = 0; t < data.turns && !battle.isOver; t++) {
    try { snaps.push(...battle.executeNextAction()); }
    catch (e) { snaps.push({ ...battle.getCurrentState(), lastActor: `ERROR: ${(e as Error).message}` }); break; }
}
Object.assign(console, quiet);

const lines = formatSequence(snaps);
if (out) fs.writeFileSync(out, lines.join("\n") + "\n");
if (!args.includes("--diff")) {
    console.log(`seed ${data.seed}, ${data.turns} turns, exported ${data.exportedAt}${data.notes ? `\nnotes: ${data.notes}` : ""}`);
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
