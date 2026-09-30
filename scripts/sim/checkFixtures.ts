// Regression checks from in-game observations: npx tsx scripts/sim/checkFixtures.ts
// Each fixture is a PvP simulator export (snapshots stripped) + the expected actor of one action.
import "../../src/models/BestTeamCalculator"; // must load first (import cycle outside Vite)
import fs from "fs";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { buildPvPKiokus, formatSequence, parseExport } from "../../src/utils/pvpExport";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

// `line`: optional regex that must match a line of that action's block in the readable sequence (e.g. a unit's Magic).
const CASES: { file: string, action: number, actor: string, ally?: boolean, line?: RegExp }[] = [
    { file: "heroic-grace-rika-first.json", action: 4, actor: "Brilliant Beam" },
    { file: "heroic-grace-mabayu-first.json", action: 4, actor: "Hollow Woman" },
    { file: "kyubey-battle-start-follow-up.json", action: 1, actor: "Splashin' Kyubey Blast" },
    { file: "mirrored-thunder-torrent-ally-first.json", action: 1, actor: "Thunder Torrent", ally: true },
    { file: "time-stop-strike-magic.json", action: 1, actor: "Time Stop Strike", ally: true, line: /^ +Time Stop Strike .*\| magic 6\/7/ },
    { file: "time-stop-strike-magic.json", action: 3, actor: "Lux☆Magica", ally: true, line: /^ +Time Stop Strike .*\| magic 1\/7/ },
];

console.warn = () => {}; console.debug = () => {};
let failed = 0;
for (const c of CASES) {
    const d = parseExport(fs.readFileSync(new URL(`./fixtures/${c.file}`, import.meta.url), "utf8"));
    const [a, e] = buildPvPKiokus(d.slots);
    const b = new PvPBattle(new PvPTeam(a, "Ally"), new PvPTeam(e, "Enemy"), false, d.seed, { rngMode: d.rngMode, decisions: d.decisions });
    const snaps: BattleSnapshot[] = [b.getCurrentState()];
    while (snaps.length <= c.action && !b.isOver) snaps.push(...b.executeNextAction());
    const s = snaps[c.action] ?? { lastActor: "<battle over>" } as BattleSnapshot;
    const side = (ally?: boolean) => ally === undefined ? "" : ally ? " (Ally)" : " (Enemy)";
    const got = s.lastActor + side(c.ally === undefined ? undefined : s.lastTeamIsTeam1);
    let ok = got === c.actor + side(c.ally);
    let lineNote = ""
    if (ok && c.line) {
        const seq = formatSequence(snaps)
        const start = seq.findIndex(l => l.startsWith(`== Action ${c.action}:`))
        const end = seq.findIndex((l, i) => i > start && l.startsWith("== Action"))
        const block = seq.slice(start, end < 0 ? undefined : end)
        ok = start >= 0 && block.some(l => c.line!.test(l))
        if (!ok) lineNote = `\n  expected a line matching ${c.line} in:\n${block.join("\n")}`
    }
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.file}: action ${c.action} expected ${c.actor}${side(c.ally)}${c.line ? ` + ${c.line}` : ""}, got ${got}${lineNote}`);
    if (!ok) console.log(formatSequence(snaps).filter(l => l.startsWith("== Action")).slice(0, c.action + 2).join("\n"));
}
process.exit(failed ? 1 : 0);
