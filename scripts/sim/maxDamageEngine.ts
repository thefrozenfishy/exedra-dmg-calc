// Max Damage panel: old closed-form (models/MaxDamage) vs the 1:1 engine (battle/EngineMaxDamage), per member and column.
// npx tsx scripts/sim/maxDamageEngine.ts [stageCount=6]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import path from "path";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { computeMaxDamage } from "../../src/models/MaxDamage";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { stageWaveMeta } from "../../src/models/PvE";
import { waveStartUnits, stageBattleType } from "../../src/models/PvEBattle";
import stages from "../../src/assets/base_data/getQuestStageMstList.json";

const count = Number(process.argv[2] ?? 6);
const warns: string[] = [];
console.warn = (...a: any[]) => { warns.push(a.map(x => x?.stack ?? String(x)).join(" ").split("\n").slice(0, 4).join(" / ")); };
const brief = !!process.env.BRIEF;
const fixDir = new URL("./fixtures/", import.meta.url).pathname;
const teams: { name: string; kiokus: any[] }[] = [];
for (const f of fs.readdirSync(fixDir).filter(f => f.endsWith(".json"))) {
    try { teams.push({ name: f, kiokus: buildPvPKiokus(parseExport(fs.readFileSync(path.join(fixDir, f), "utf8")).slots)[0] }); } catch { }
}
import { isSoloRaidStage } from "../../src/models/PvE";
const all = (stages as any[]).map(s => s.id ?? s.questStageMstId).filter(Boolean).filter(x => !process.env.SOLORAID || isSoloRaidStage(x));
const step = Math.max(1, Math.floor(all.length / count));
const fmt = (s: any) => s ? `${s.total.crit}/${s.total.normal}/${s.total.avg}` : "-";
for (let i = 0; i < all.length && i / step < count; i += step) {
    const stageId = all[i];
    const metas = stageWaveMeta(stageId);
    if (!metas.length) continue;
    const waveIdx = metas.length - 1;
    const wave = waveStartUnits(metas[waveIdx]);
    for (const team of teams.slice(0, Number(process.env.TEAMS ?? 3))) {
        const t0 = Date.now();
        let a: any, b: any;
        try { a = computeMaxDamage(team.kiokus, wave, 0, { battleType: stageBattleType(stageId) }); } catch (e: any) { a = { err: e.message } }
        const t1 = Date.now();
        try { b = computeMaxDamageEngine(team.kiokus, { stageId, waveIdx }, wave, 0, { battleType: stageBattleType(stageId) }); } catch (e: any) { b = { err: e.stack } }
        const t2 = Date.now();
        while (warns.length) console.log("  WARN", warns.shift());
        if (brief) { console.log(`stage ${stageId} ${team.name}: engine ${t2 - t1}ms ${b.err ? "ERR " + b.err.split("\n")[0] : ""}`); continue; }
        console.log(`stage ${stageId} w${waveIdx + 1} (${wave.length} enemies) ${team.name}: old ${t1 - t0}ms engine ${t2 - t1}ms`);
        if (a.err || b.err) { console.log("  ERR", a.err ?? "", b.err ?? ""); continue; }
        for (let p = 0; p < team.kiokus.length; p++) {
            const ma = a.members[p], mb = b.members[p];
            const cols = ["Ult", "Skill", "Basic"].map((_, k) => [ma.skills[k], mb.skills[k]]);
            console.log(`  ${ma.name.padEnd(28)} ` + cols.map(([x, y]) => `${fmt(x)} | ${fmt(y)}`).join("   ") + `   SW ${fmt(ma.switchSkill)} | ${fmt(mb.switchSkill)}   FU ${fmt(ma.followUp)} | ${fmt(mb.followUp)}`);
        }
    }
}
