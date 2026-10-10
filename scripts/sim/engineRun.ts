// Headless PvE battle on the 1:1 engine (src/engine): npx tsx scripts/sim/engineRun.ts <questStageMstId> [seed] [teamExport.json]
// Prints every command the core sends to the client (skills with damage, turns, waves, result).
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
// the engine runs from its scope-hoisted bundle (node scripts/engine/bundle.mjs), see that script for why
import { bindMasterData, kiokuToNetworkUnit, QuestBattleUnitProvider, QuestGameDirector, GameRandom, NotPortedError } from "../../src/engine/dist/engine.js";

const [stageArg, seedArg, teamFile] = process.argv.slice(2);
const stageId = Number(stageArg ?? 104113);
let s = Number(seedArg ?? 1) >>> 0;
GameRandom.seed(() => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });
const teamPath = teamFile || new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname;
const quiet = { warn: console.warn, debug: console.debug };
console.warn = () => {}; console.debug = () => {};
const [allies] = buildPvPKiokus(parseExport(fs.readFileSync(teamPath, "utf8")).slots);
Object.assign(console, quiet);

bindMasterData();
const director = new QuestGameDirector().ctor();
const names = new Map<number, string>();
const log: string[] = [];
director.commandSender.Subscribe({
    IObserver$OnNext(commands: any[]) {
        for (const c of commands) {
            const type = c.constructor.name;
            if (type === "CommandSkill") {
                const dmg = (c._AffectedUnitNoticeList ?? []).map((n: any) =>
                    `${names.get(n.AffectedUnitId) ?? n.AffectedUnitId}:${[...(n.Damages ?? [])].map((d: any) => d.DamageValue).join("+") || "-"}`).join(" ");
                log.push(`  ${names.get(c._ActUnitId) ?? c._ActUnitId} skill ${c._SkillMstId} -> ${dmg}`);
            } else if (type === "CommandBeginTurn" || type === "CommandSituationSync" || type === "CommandTarget") {
                // noisy
            } else {
                log.push(`  [${type}]`);
            }
        }
    },
});
const units = allies.map((k, i) => kiokuToNetworkUnit(k, i + 1));
const provider = new QuestBattleUnitProvider().ctor(stageId, units);
try {
    director.SetupBattleStage(stageId, 0, provider);
    for (const u of director.battleUnitBundle.dic.values()) names.set(u.Id, `${u.Team === 0 ? "A" : "E"}${u.PositionId}:${u.MstId}`);
    director.autoType = 2 as any; // FullAuto
    director.ChangeBattlePhase(1 as any); // Phase.Start
    director.RunBattleToEnd(null);
    director.FlushCommands();
} catch (e) {
    director.FlushCommands();
    console.log(log.join("\n"));
    if (e instanceof NotPortedError) { console.log(`NOT PORTED: ${e.message}`); console.log((e.stack ?? "").split("\n").slice(1, 8).join("\n")); process.exit(2); }
    throw e;
}
console.log(log.join("\n"));
console.log(`result: ${director.judgeResultReferee.result} phase ${director.BattlePhase}`);
