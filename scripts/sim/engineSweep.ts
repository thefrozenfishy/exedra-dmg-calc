// Sweep many stages x teams x seeds on the 1:1 engine and group failures by message.
// npx tsx scripts/sim/engineSweep.ts [stageCount=40] [seeds=2] [offset=0] [budgetSec=150]
// STAGES=1,2,3 runs exactly those stages; WITH="Kioku A|Kioku B" adds, per fixture team, a copy with that kioku
// (max build) in slot 1 and counts Step-Up skill uses and self HP costs (new-content smoke test, VERSION_UPDATE.md).
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import fs from "fs";
import path from "path";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import { bindMasterData, kiokuToNetworkUnit, QuestBattleUnitProvider, QuestGameDirector, SoloRaidGameDirector, BattleInfo, runBattleLikeClient, GameRandom, NotPortedError } from "../../src/engine/dist/engine.js";
import { isSoloRaidStage, soloRaidInfo, SOLO_RAID_COMMON_CHARGE_PASSIVE } from "../../src/models/PvE";
import stages from "../../src/assets/base_data/getQuestStageMstList.json";
import { kiokuData } from "../../src/utils/helpers";
import { buildSlotKioku } from "../../src/utils/pvpExport";

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
// random teams over the whole kioku catalog (max-level builds, no crys / support), seeded by RANDTEAMS=<count>
const randTeams = Number(process.env.RANDTEAMS ?? 0);
if (randTeams > 0) {
    let r = 12345 + off;
    const rnd = () => { r = (Math.imul(r, 1103515245) + 12345) >>> 0; return r / 4294967296; };
    const names = Object.keys(kiokuData);
    for (let t = 0; t < randTeams; t++) {
        const picked: string[] = [];
        while (picked.length < 5) { const nm = names[Math.floor(rnd() * names.length)]; if (!picked.includes(nm)) picked.push(nm); }
        const kiokus = picked.map(name => {
            const d: any = (kiokuData as any)[name];
            return buildSlotKioku({ main: { enabled: true, dupes: 0, ascension: 5, portrait: "", kiokuLvl: 138, magicLvl: 130, heartphialLvl: 50, specialLvl: 7,
                name, id: d.id, role: d.role, element: d.element, supportTarget: d.support_target, supportDescription: d.support_effect,
                character_en: d.character_en, heartphial: d.heartphial || d.character_en, rarity: d.rarity, obtain: d.obtain, crysOptions: {} } } as any);
        });
        teams.push({ name: `rand${t}:${picked.join(",")}`, kiokus });
    }
}
// new-kioku teams: each fixture team with the kioku (max build) in the first slot
const maxBuild = (name: string) => {
    const d: any = (kiokuData as any)[name];
    if (!d) throw new Error(`unknown kioku ${name}`);
    return buildSlotKioku({ main: { enabled: true, dupes: 0, ascension: 5, portrait: "", kiokuLvl: 138, magicLvl: 130, heartphialLvl: 50, specialLvl: 7,
        name, id: d.id, role: d.role, element: d.element, supportTarget: d.support_target, supportDescription: d.support_effect,
        character_en: d.character_en, heartphial: d.heartphial || d.character_en, rarity: d.rarity, obtain: d.obtain, crysOptions: {} } } as any);
};
const withNames = (process.env.WITH ?? "").split("|").map(x => x.trim()).filter(Boolean);
if (withNames.length) {
    const base = teams.splice(0, teams.length);
    for (const nm of withNames) for (const t of base) teams.push({ name: `${nm}+${t.name}`, kiokus: [maxBuild(nm), ...t.kiokus.slice(1)] });
}
let stepUps = 0, consumeHp = 0;
Object.assign(console, quiet);
bindMasterData();
// spread the sample over the whole stage list
// SOLORAID=1: only Solo Raid stages (run on SoloRaidGameDirector, like every Solo Raid stage in the sweep)
const all = process.env.STAGES ? process.env.STAGES.split(",").map(Number) : (stages as any[]).map((s) => s.id ?? s.questStageMstId).filter((x) => x).filter((x) => !process.env.SOLORAID || isSoloRaidStage(x));
const step = Math.max(1, Math.floor(all.length / count));
const pick: number[] = [];
for (let i = off; i < all.length && pick.length < count; i += step) pick.push(all[i]);
const fails = new Map<string, string[]>();
let ok = 0, n = 0, wins = 0, timeouts = 0;
const results = new Map<number, number>();
outer: for (const stageId of pick) for (const team of teams) for (let seed = 1; seed <= seeds; seed++) {
    if (Date.now() - t0 > budget) { console.log(`budget hit at stage ${stageId}`); break outer; }
    let s = (seed * 7919) >>> 0;
    GameRandom.seed(() => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });
    n++;
    try {
        const raid = isSoloRaidStage(stageId) ? soloRaidInfo(stageId)! : null;
        const director = raid ? new SoloRaidGameDirector().ctor() : new QuestGameDirector().ctor();
        let skills = 0, bad = "";
        director.commandSender.Subscribe({ IObserver$OnNext(commands: any[]) {
            for (const c of commands) {
                if (c.constructor.name !== "CommandSkill") continue;
                skills++;
                if (c._StepUpLevel > 0) stepUps++;
                for (const n of c._AffectedUnitNoticeList ?? []) if (n._IsConsumeHp) consumeHp++;
                for (const n of c._AffectedUnitNoticeList ?? []) for (const d of [...(n.Damages ?? []), ...(n.BarrierDamages ?? [])]) {
                    const v = d.DamageValue ?? d._DamageValue;
                    if (!Number.isInteger(v) || v < 0) bad ||= `damage ${v} (skill ${c._SkillMstId})`;
                }
            }
        } });
        const units = team.kiokus.map((k: any, i: number) => kiokuToNetworkUnit(k, i + 1));
        const provider = new QuestBattleUnitProvider().ctor(stageId, units);
        if (raid) director.SetupBattleStageForSoloRaid(stageId, 0, provider, new BattleInfo(), SOLO_RAID_COMMON_CHARGE_PASSIVE,
            raid.season?.soloRaidSeasonBuffMstId ?? 0, raid.partyBuffs[0]?.soloRaidPartyBuffMstId ?? 0, raid.limitRoundCount, 8.64e15);
        else director.SetupBattleStage(stageId, 0, provider);
        director.autoType = 2 as any;
        director.ChangeBattlePhase(1 as any);
        // Solo Raid needs the client request loop (endless enemy supply, season buff); CLIENT=1 uses it everywhere
        if (raid || process.env.CLIENT) runBattleLikeClient(director); else director.RunBattleToEnd(null);
        director.FlushCommands();
        for (const u of director.battleUnitBundle.dic.values()) if (!Number.isInteger(u._HP) || u._HP < 0 || u._HP > u._MaxHP) bad ||= `hp ${u._HP}/${u._MaxHP} unit ${u._MstId}`;
        if (skills === 0) bad ||= "no skills used";
        if (bad) throw new Error(`WEIRD: ${bad}`);
        ok++;
        const r = director.judgeResultReferee.result;
        results.set(r, (results.get(r) ?? 0) + 1);
        if (r === 1) wins++;
    } catch (e: any) {
        const key = e instanceof NotPortedError ? `NOT PORTED: ${e.message}` : `${e?.constructor?.name}: ${String(e?.message).slice(0, 120)} @ ${(e?.stack ?? "").split("\n").slice(1, 1 + Number(process.env.DEEP ?? 1)).map((l: string) => l.trim()).join(" < ").replace(/file:\/\/\S*\//, "")}`;
        const l = fails.get(key) ?? []; l.push(`${stageId}/${team.name.slice(0, team.name.startsWith("rand") ? 200 : 12)}/${seed}`); fails.set(key, l);
    }
}
if (withNames.length) console.log(`Step-Up skill uses ${stepUps}, self HP costs ${consumeHp}`);
console.log(`results ${[...results].map(([k, v]) => `${k}:${v}`).join(" ")}`);
console.log(`runs ${n} ok ${ok} wins ${wins} stages ${pick[0]}..${pick[pick.length - 1]} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
for (const [k, v] of [...fails].sort((a, b) => b[1].length - a[1].length)) console.log(`${v.length}x ${k}\n     e.g. ${v.slice(0, 3).join(" ")}`);
