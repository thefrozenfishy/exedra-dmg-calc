// Smoke-run new content after a data/version update: every listed stage (PvE, default team) and every listed
// kioku (PvP, in a team of four other 5* kiokus) runs for a few actions; exceptions and distinct engine warnings
// are collected. Used by the version-update runbook (docs/ai/VERSION_UPDATE.md).
//   npx tsx scripts/sim/smokeNew.ts --stages 1407101,982351 --kiokus "Metallicized Projectile|Lux☆Magica" [--actions 40]   (kiokus: "|"-separated)
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { questStages } from "../../src/models/PvE";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { kiokuData } from "../../src/utils/helpers";
import { PvPKioku } from "../../src/models/PvPKioku";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";

const arg = (k: string) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined };
const stages = (arg("--stages") ?? "").split(",").filter(Boolean).map(Number);
const kiokus = (arg("--kiokus") ?? "").split("|").map(s => s.trim()).filter(Boolean); // "|"-separated: names contain commas
const maxActions = Number(arg("--actions") ?? 40);
const warnings = new Map<string, number>();
const real = { log: console.log, warn: console.warn, debug: console.debug, error: console.error };
const capture = (...a: unknown[]) => { const m = a.map(String).join(" ").slice(0, 160); warnings.set(m, (warnings.get(m) ?? 0) + 1) };
let failures = 0;
const run = (label: string, fn: () => string) => {
    warnings.clear(); console.warn = capture; console.error = capture; console.debug = () => {};
    let line: string
    try { line = fn() } catch (e) { failures++; line = `EXCEPTION ${(e as Error).stack?.split("\n").slice(0, 4).join(" | ")}` }
    Object.assign(console, real);
    console.log(`${label}: ${line}`);
    for (const [m, n] of warnings) console.log(`    warn x${n}: ${m}`);
};
const fixture = new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname;
const [allies] = buildPvPKiokus(parseExport(fs.readFileSync(fixture, "utf8")).slots);
for (const id of stages) run(`stage ${id} ${questStages.get(id)?.name ?? "?"}`, () => {
    const b = createPvEBattle(allies, id, 1);
    let n = 0;
    for (; n < maxActions && !b.isOver; n++) b.executeNextAction();
    return `${b.result ?? "running"} after ${n} actions, round ${b.currentRound}`;
});
const mk = (name: string) => new PvPKioku({ name, kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10, crysIDs: [], subCrysIDs: [] } as any);
const fives = Object.keys(kiokuData).filter(k => kiokuData[k].rarity === 5).sort();
for (const name of kiokus) run(`kioku ${name}`, () => {
    if (!kiokuData[name]) throw new Error(`unknown kioku ${name}`);
    const others = fives.filter(n => n !== name);
    const t1 = new PvPTeam([name, ...others.slice(0, 4)].map(mk), "Ally");
    const t2 = new PvPTeam(others.slice(10, 15).map(mk), "Enemy");
    const b = new PvPBattle(t1, t2, false, 7);
    let n = 0;
    const events: any[] = [];
    for (; n < maxActions && !b.isOver; n++) for (const s of b.executeNextAction()) events.push(...(s.events ?? []));
    const me = t1.kiokuStates[0];
    const dealt = events.filter(e => (e.kind === "hit" || e.kind === "dot") && e.sourceIsTeam1 && String(e.source).startsWith(name)).reduce((a, e) => a + (e.amount ?? 0), 0);
    return `${n} actions, dealt ${dealt} damage (hits + DOT), alive ${!me.isDead}`;
});
process.exit(failures ? 1 : 0);
