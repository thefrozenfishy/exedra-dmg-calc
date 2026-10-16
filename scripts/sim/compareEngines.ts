// Old engine (src/models) vs 1:1 engine (src/battle/EngineBattle) on the same battles, deterministic RNG modes
// ("hit" = every roll lands / crits, "miss" = none): per action actor + total damage, first divergence, damage ratios.
//   npx tsx scripts/sim/compareEngines.ts [actions=12] [stageCount=10]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import path from "path";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { questStages, isSoloRaidStage } from "../../src/models/PvE";
import { EngineBattle } from "../../src/battle/EngineBattle";
import type { BattleSnapshot } from "../../src/types/KiokuTypes";
const [actArg = "12", stageArg = "10"] = process.argv.slice(2);
const N = Number(actArg);
console.warn = () => {}; console.debug = () => {};
const fixDir = new URL("./fixtures/", import.meta.url).pathname;
const teams = fs.readdirSync(fixDir).filter(f => f.endsWith(".json")).flatMap(f => {
    try { const d = parseExport(fs.readFileSync(path.join(fixDir, f), "utf8")); return [{ name: f, slots: d.slots }]; } catch { return []; }
});
type Row = { actor: string, type: string, dmg: number }
const rows = (snaps: BattleSnapshot[]): Row[] => snaps.slice(1).filter(s => s.lastActor).map(s => ({
    actor: `${s.lastActor}${s.lastTeamIsTeam1 ? "(A)" : "(E)"}`, type: String(s.lastTargetType ?? ""),
    dmg: (s.events ?? []).filter(e => e.kind === "hit").reduce((t, e) => t + e.amount + (e.barrierAbsorbed ?? 0), 0) }));
function run(mk: () => { initial: BattleSnapshot, next: () => BattleSnapshot[], over: () => boolean }): Row[] {
    const b = mk(); const out: BattleSnapshot[] = [b.initial];
    try { while (out.length <= N && !b.over()) out.push(...b.next()); } catch (e) { out.push({ lastActor: `ERROR ${String(e).slice(0, 60)}` } as any) }
    return rows(out).slice(0, N);
}
let same = 0, diverged = 0; const ratios: number[] = [];
function compare(label: string, a: Row[], b: Row[]) {
    let i = 0;
    for (; i < Math.min(a.length, b.length); i++) {
        if (a[i].actor !== b[i].actor || a[i].type !== b[i].type) break;
        if (a[i].dmg > 0 && b[i].dmg > 0) ratios.push(b[i].dmg / a[i].dmg);
    }
    const dmgDiff = a.slice(0, i).map((r, k) => r.dmg !== b[k].dmg ? `#${k + 1} ${r.actor} ${r.dmg}->${b[k].dmg}` : "").filter(Boolean);
    if (i >= Math.min(a.length, b.length)) same++; else diverged++;
    console.log(`${label}: ${i}/${Math.min(a.length, b.length)} actions same order${i < Math.min(a.length, b.length) ? ` | diverge at #${i + 1}: old ${a[i].actor} ${a[i].type} / engine ${b[i].actor} ${b[i].type}` : ""}`);
    if (dmgDiff.length) console.log(`   ${label} dmg: ${dmgDiff.slice(0, 6).join("; ")}`);
}
for (const mode of ["hit", "miss"] as const) {
    for (const t of teams) {
        const [a, e] = buildPvPKiokus(t.slots); const [a2, e2] = buildPvPKiokus(t.slots);
        const old = run(() => { const b = new PvPBattle(new PvPTeam(a, "Ally"), new PvPTeam(e, "Enemy"), false, 1, { rngMode: mode }); return { initial: b.getCurrentState(), next: () => b.executeNextAction(), over: () => b.isOver } });
        const neu = run(() => { const b = new EngineBattle({ kind: "pvp", allies: a2, enemies: e2 }, { seed: 1, rngMode: mode }); return { initial: b.initialState, next: () => b.executeNextAction(), over: () => b.isOver } });
        compare(`[${mode}] pvp ${t.name.slice(0, 28)}`, old, neu);
    }
    const stageIds = [...questStages.keys()].filter(id => !isSoloRaidStage(id));
    const step = Math.max(1, Math.floor(stageIds.length / Number(stageArg)));
    for (let i = 0; i < stageIds.length && i / step < Number(stageArg); i += step) {
        const id = stageIds[i];
        const [a] = buildPvPKiokus(teams[0].slots); const [a2] = buildPvPKiokus(teams[0].slots);
        let old: Row[];
        try { old = run(() => { const b = createPvEBattle(a, id, 1, 0, { rngMode: mode }); return { initial: b.getCurrentState(), next: () => b.executeNextAction(), over: () => b.isOver } }); } catch { continue }
        const neu = run(() => { const b = new EngineBattle({ kind: "quest", allies: a2, stageId: id }, { seed: 1, rngMode: mode }); return { initial: b.initialState, next: () => b.executeNextAction(), over: () => b.isOver } });
        compare(`[${mode}] stage ${id}`, old, neu);
    }
}
ratios.sort((x, y) => x - y);
const q = (p: number) => ratios[Math.floor(p * (ratios.length - 1))]?.toFixed(4);
console.log(`\n${same} same order, ${diverged} diverged; damage ratio engine/old over ${ratios.length} matching actions: min ${q(0)} p10 ${q(0.1)} median ${q(0.5)} p90 ${q(0.9)} max ${q(1)}; exact ${ratios.filter(r => Math.abs(r - 1) < 1e-9).length}`);
