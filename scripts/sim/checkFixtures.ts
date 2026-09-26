// Regression checks from in-game observations: npx tsx scripts/sim/checkFixtures.ts
// Each fixture is a PvP simulator export (snapshots stripped) + the expected actor of one action.
import "../../src/models/BestTeamCalculator"; // must load first (import cycle outside Vite)
import fs from "fs";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { buildPvPKiokus, formatSequence, parseExport } from "../../src/utils/pvpExport";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

const CASES: { file: string, action: number, actor: string }[] = [
    { file: "heroic-grace-rika-first.json", action: 4, actor: "Brilliant Beam" },
    { file: "heroic-grace-mabayu-first.json", action: 4, actor: "Hollow Woman" },
    { file: "kyubey-battle-start-follow-up.json", action: 1, actor: "Splashin' Kyubey Blast" },
];

console.warn = () => {}; console.debug = () => {};
let failed = 0;
for (const c of CASES) {
    const d = parseExport(fs.readFileSync(new URL(`./fixtures/${c.file}`, import.meta.url), "utf8"));
    const [a, e] = buildPvPKiokus(d.slots);
    const b = new PvPBattle(new PvPTeam(a, "Ally"), new PvPTeam(e, "Enemy"), false, d.seed);
    const snaps: BattleSnapshot[] = [b.getCurrentState()];
    while (snaps.length <= c.action) snaps.push(...b.executeNextAction());
    const got = snaps[c.action].lastActor;
    const ok = got === c.actor;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.file}: action ${c.action} expected ${c.actor}, got ${got}`);
    if (!ok) console.log(formatSequence(snaps).filter(l => l.startsWith("== Action")).slice(0, c.action + 2).join("\n"));
}
process.exit(failed ? 1 : 0);
