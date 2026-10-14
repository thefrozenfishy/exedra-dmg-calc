// Headless PvP battle on the 1:1 engine: npx tsx scripts/sim/enginePvp.ts [seed] [teamExport.json]
// Allies = the export's allied team (slots[1]), enemies = its enemy team (slots[0]); PvpGameDirector + PvPOrGvGBattleUnitProvider.
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { bindMasterData, kiokuToNetworkUnit, PvpGameDirector, PvPOrGvGBattleUnitProvider, GameRandom, NotPortedError } from "../../src/engine/dist/engine.js";

const [seedArg, teamFile] = process.argv.slice(2);
let s = Number(seedArg ?? 1) >>> 0;
GameRandom.seed(() => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });
const teamPath = teamFile || new URL("./fixtures/heroic-grace-mabayu-first.json", import.meta.url).pathname;
const quiet = { warn: console.warn, debug: console.debug };
console.warn = () => {}; console.debug = () => {};
const [allies, enemies] = buildPvPKiokus(parseExport(fs.readFileSync(teamPath, "utf8")).slots);
Object.assign(console, quiet);
bindMasterData();
const director = new PvpGameDirector().ctor();
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
            }
        }
    },
});
const provider = new PvPOrGvGBattleUnitProvider().ctor(allies.map((k, i) => kiokuToNetworkUnit(k, i + 1)), enemies.map((k, i) => kiokuToNetworkUnit(k, i + 1)));
try {
    director.SetupBattleStage(provider, 0);
    for (const u of director.battleUnitBundle.dic.values()) names.set(u.Id, `${u.Team === 0 ? "A" : "E"}${u.PositionId}:${u.MstId}`);
    director.autoType = 2 as any;
    director.ChangeBattlePhase(1 as any);
    director.RunBattleToEnd(null);
    director.FlushCommands();
} catch (e) {
    director.FlushCommands();
    console.log(log.slice(-15).join("\n"));
    if (e instanceof NotPortedError) { console.log(`NOT PORTED: ${e.message}`); console.log((e.stack ?? "").split("\n").slice(1, 8).join("\n")); process.exit(2); }
    throw e;
}
console.log(log.slice(0, 20).join("\n"));
console.log(`... ${log.length} skills; result: ${director.judgeResultReferee.result} phase ${director.BattlePhase}`);
