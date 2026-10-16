// Link Raid (MultiRaidGameDirector) sweep: every Link Raid stage x the fixture teams, seeded, to the end.
// npx tsx scripts/sim/engineMultiRaid.ts [stageCount=200]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import path from "path";
import { buildPvPKiokus, parseExport, buildSlotKioku, parsePvEExport } from "../../src/utils/pvpExport";
import { EngineBattle } from "../../src/battle/EngineBattle";
import multiRaidStages from "../../src/assets/base_data/getMultiRaidStageMstList.json";
console.debug = () => {}; console.warn = () => {};
const count = Number(process.argv[2] ?? 200);
const fixDir = new URL("./fixtures/", import.meta.url).pathname;
const teams: { name: string; kiokus: any[] }[] = [];
for (const f of fs.readdirSync(fixDir).filter(f => f.endsWith(".json"))) {
    const txt = fs.readFileSync(path.join(fixDir, f), "utf8");
    try { teams.push({ name: f, kiokus: buildPvPKiokus(parseExport(txt).slots)[0] }); continue } catch { }
    try { teams.push({ name: f, kiokus: parsePvEExport(txt).slots.filter((s: any) => s.main).map(buildSlotKioku) }) } catch { }
}
const stages = (multiRaidStages as any[]).map(s => s.questStageMstId).slice(0, count);
const fails = new Map<string, string[]>();
let n = 0, ok = 0, wins = 0;
for (const stageId of stages) for (const team of teams.slice(0, Number(process.env.TEAMS ?? 3))) {
    n++;
    try {
        const b = new EngineBattle({ kind: "multiRaid", allies: team.kiokus, stageId }, { seed: n, rngMode: "seed" });
        const full = EngineBattle.multiRaidBossHp(stageId);
        let steps = 0;
        while (!b.isOver && steps++ < 400) b.executeNextAction();
        if (!b.isOver) throw new Error("not over after 400 actions");
        if (b.result === "win") wins++;
        ok++;
        if (process.env.V) console.log(stageId, team.name, b.result, "boss", full, "dmg", b.raidTotalDamage, "rounds", b.currentRound, b.finishedByRoundLimit ? "(round limit)" : "");
    } catch (e: any) {
        const k = String(e?.message ?? e).split("\n")[0].slice(0, 160);
        (fails.get(k) ?? fails.set(k, []).get(k)!).push(`${stageId}/${team.name}`);
    }
}
console.log(`runs ${n} ok ${ok} wins ${wins}`);
for (const [k, v] of fails) console.log(`FAIL x${v.length} ${k}  e.g. ${v.slice(0, 3).join(", ")}`);
