// EngineBattle (src/battle) smoke test: npx tsx scripts/sim/engineBattleDemo.ts <pvp|quest|raid> [stageId] [fixture] [seed]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { EngineBattle } from "../../src/battle/EngineBattle";
const [kind = "pvp", stageArg = "101101", fix = "heroic-grace-mabayu-first.json", seedArg = "1"] = process.argv.slice(2);
const quiet = console.warn; console.warn = () => {}; console.debug = () => {};
const [allies, enemies] = buildPvPKiokus(parseExport(fs.readFileSync(new URL(`./fixtures/${fix}`, import.meta.url).pathname, "utf8")).slots);
console.warn = quiet;
const stageId = Number(stageArg);
const b = new EngineBattle(kind === "pvp" ? { kind: "pvp", allies, enemies } : kind === "quest" ? { kind: "quest", allies, stageId } : { kind: "soloRaid", allies, stageId },
    { seed: Number(seedArg), rngMode: (process.env.MODE as any) ?? "seed" });
const fmt = (s: any) => `${s.lastActor ?? "-"}${s.actionLabel ? ` [${s.actionLabel}]` : ""} ${s.lastTargetType ?? ""} | ` +
    `A ${s.allies.team.map((u: any) => `${u.name.slice(0, 10)}:${u.hp}/${u.maxHp} mp${u.mp} av${u.secondsLeft.toFixed(1)}`).join(" ")} | ` +
    `E ${s.enemies.team.map((u: any) => `${u.name.slice(0, 10)}:${u.hp}${u.isBroken ? "B" : ""}`).join(" ")} | ev ${(s.events ?? []).map((e: any) => `${e.kind}:${e.target.slice(0, 6)}${e.amount}${e.isCritical ? "!" : ""}`).join(",")} | rng ${(s.rngEvents ?? []).length} r${s.round}`;
console.log("0", fmt(b.initialState));
let i = 0;
for (let t = 0; t < Number(process.env.TURNS ?? 30) && !b.isOver; t++) for (const s of b.executeNextAction()) console.log(++i, fmt(s));
console.log("result", b.result, "round", b.currentRound, "elapsed", b.elapsed.toFixed(1), b.kind === "soloRaid" ? JSON.stringify(b.raidCarry()) : "");
