// Regression checks from in-game observations: npx tsx scripts/sim/checkFixtures.ts
// Each fixture is a PvP or PvE simulator export (snapshots stripped) + the expected actor of one action.
import "../../src/models/BestTeamCalculator"; // must load first (import cycle outside Vite)
import fs from "fs";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { buildPvPKiokus, buildSlotKioku, formatSequence, parseExport, parsePvEExport, PVE_EXPORT_FORMAT } from "../../src/utils/pvpExport";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { PendingDecision } from "../../src/models/BattleRng";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";

// `line`: optional regex that must match a line of that action's block in the readable sequence (e.g. a unit's Magic).
const CASES: { file: string, action: number, actor: string, ally?: boolean, line?: RegExp }[] = [
    { file: "heroic-grace-rika-first.json", action: 4, actor: "Brilliant Beam" },
    { file: "heroic-grace-mabayu-first.json", action: 4, actor: "Hollow Woman" },
    { file: "kyubey-battle-start-follow-up.json", action: 1, actor: "Splashin' Kyubey Blast" },
    { file: "mirrored-thunder-torrent-ally-first.json", action: 1, actor: "Thunder Torrent", ally: true },
    { file: "time-stop-strike-magic.json", action: 1, actor: "Time Stop Strike", ally: true, line: /^ +Time Stop Strike .*\| magic 6\/7/ },
    { file: "time-stop-strike-magic.json", action: 3, actor: "Lux☆Magica", ally: true, line: /^ +Time Stop Strike .*\| magic 1\/7/ },
    // PvE: two givers of the same passive state both apply; UP_HP_FIXED sub-crys raise max HP.
    { file: "rose-garden-indomitable-guard-x2.json", action: 2, actor: "Rose Garden Witch Minion", line: /^ +Floral Ironspike +\| HP 10,195\/11,496 / },
    { file: "rose-garden-indomitable-guard-x2.json", action: 2, actor: "Rose Garden Witch Minion", line: /^ +Hollow Woman +\| HP 8,674\/13,316 / },
    // TurnStart / TurnEnd passes carry no skill: the minions gain 2 Magic once on an ally's battle skill (no follow-ups yet).
    { file: "rose-garden-indomitable-guard-x2.json", action: 3, actor: "Hollow Woman", line: /^ +Rose Garden Witch Minion +\| HP 4,000,000\/4,000,000 \| MP 0\/0 \| break 300\/300 \| spd 260\.00 \| AV [\d.]+ \| magic 2\/5/ },
    { file: "rose-garden-indomitable-guard-x2.json", action: 4, actor: "<pending: Tiro Finale (Ally 5) · turn: choose an action>" },
];

console.warn = () => {}; console.debug = () => {};
let failed = 0;
for (const c of CASES) {
    const text = fs.readFileSync(new URL(`./fixtures/${c.file}`, import.meta.url), "utf8");
    let b: PvPBattle;
    if (JSON.parse(text)?.format === PVE_EXPORT_FORMAT) {
        const d = parsePvEExport(text);
        b = createPvEBattle(d.slots.filter(s => !!s.main).map(buildSlotKioku), d.stageId, d.seed, 0, { rngMode: d.rngMode, decisions: d.decisions,
            manualTargeting: d.control === "manual", partyBuffId: d.soloRaid?.partyBuffId, noRoundLimit: d.soloRaid?.noRoundLimit,
            raidCarry: d.soloRaid?.attempts?.[d.soloRaid.attempts.length - 1] });
    } else {
        const d = parseExport(text);
        const [a, e] = buildPvPKiokus(d.slots);
        b = new PvPBattle(new PvPTeam(a, "Ally"), new PvPTeam(e, "Enemy"), false, d.seed, { rngMode: d.rngMode, decisions: d.decisions });
    }
    const snaps: BattleSnapshot[] = [b.getCurrentState()];
    // A manual-control PvE run stops at the next user decision: that action reads "<pending: label>".
    let pending: string | undefined
    try { while (snaps.length <= c.action && !b.isOver) snaps.push(...b.executeNextAction()); }
    catch (err) { if (!(err instanceof PendingDecision)) throw err; pending = `<pending: ${err.event.label}>` }
    const s = snaps[c.action] ?? { lastActor: pending ?? "<battle over>" } as BattleSnapshot;
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
