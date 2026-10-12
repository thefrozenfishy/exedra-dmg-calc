// Sweep many stages x teams x seeds on the 1:1 engine and group failures by message.
// npx tsx scripts/sim/engineSweep.ts [stageCount=40] [seeds=2] [offset=0] [budgetSec=150]
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import path from "path";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { bindMasterData, kiokuToNetworkUnit, QuestBattleUnitProvider, QuestGameDirector, GameRandom, NotPortedError } from "../../src/engine/dist/engine.js";
import stages from "../../src/assets/base_data/getQuestStageMstList.json";

const [countArg, seedsArg, offArg, budgetArg] = process.argv.slice(2);
const count = Number(countArg ?? 40), seeds = Number(seedsArg ?? 2), off = Number(offArg ?? 0), budget = Number(budgetArg ?? 150) * 1000;
const t0 = Date.now();
const fixDir = new URL("./fixtures/", import.meta.url).pathname;
const quiet = { warn: console.warn, debug: console.debug, log: console.log };
console.warn = () => {}; console.debug = () => {};
const teams: { name: string; kiokus: any[] }[] = [];
for (const f of fs.readdirSync(fixDir).filter((f) => f.endsWith(".json"))) {
    try { teams.push({ name: f, kiokus: buildPvPKiokus(parseExport(fs.readFileSync(path.join(fixDir, f), "utf8")).slots)[0] }); } catch { /* not a team export */ }
}
Object.assign(console, quiet);
bindMasterData();
// spread the sample over the whole stage list
const all = (stages as any[]).map((s) => s.id ?? s.questStageMstId).filter((x) => x);
const step = Math.max(1, Math.floor(all.length / count));
const pick: number[] = [];
for (let i = off; i < all.length && pick.length < count; i += step) pick.push(all[i]);
const fails = new Map<string, string[]>();
let ok = 0, n = 0, wins = 0, timeouts = 0;
outer: for (const stageId of pick) for (const team of teams) for (let seed = 1; seed <= seeds; seed++) {
    if (Date.now() - t0 > budget) { console.log(`budget hit at stage ${stageId}`); break outer; }
    let s = (seed * 7919) >>> 0;
    GameRandom.seed(() => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });
    n++;
    try {
        const director = new QuestGameDirector().ctor();
        director.commandSender.Subscribe({ IObserver$OnNext() {} });
        const units = team.kiokus.map((k: any, i: number) => kiokuToNetworkUnit(k, i + 1));
        const provider = new QuestBattleUnitProvider().ctor(stageId, units);
        director.SetupBattleStage(stageId, 0, provider);
        director.autoType = 2 as any;
        director.ChangeBattlePhase(1 as any);
        director.RunBattleToEnd(null);
        director.FlushCommands();
        ok++;
        if (director.judgeResultReferee.result === 1) wins++;
    } catch (e: any) {
        const key = e instanceof NotPortedError ? `NOT PORTED: ${e.message}` : `${e?.constructor?.name}: ${String(e?.message).slice(0, 120)} @ ${(e?.stack ?? "").split("\n")[1]?.trim().replace(/file:\/\/\S*\//, "")}`;
        const l = fails.get(key) ?? []; l.push(`${stageId}/${team.name.slice(0, 12)}/${seed}`); fails.set(key, l);
    }
}
console.log(`runs ${n} ok ${ok} wins ${wins} stages ${pick[0]}..${pick[pick.length - 1]} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
for (const [k, v] of [...fails].sort((a, b) => b[1].length - a[1].length)) console.log(`${v.length}x ${k}\n     e.g. ${v.slice(0, 3).join(" ")}`);
