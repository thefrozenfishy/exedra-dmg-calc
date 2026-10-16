// Debug one Solo Raid run: npx tsx scripts/sim/engineSoloRaidDebug.ts <stageId> <fixture> <seed>
Error.stackTraceLimit = 60;
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { buildPvPKiokus, parseExport } from "../../src/utils/pvpExport";
import * as E from "../../src/engine/dist/engine.js";
import { soloRaidInfo, SOLO_RAID_COMMON_CHARGE_PASSIVE } from "../../src/models/PvE";
const [stageArg, fix, seedArg] = process.argv.slice(2);
const stageId = Number(stageArg), seed = Number(seedArg ?? 1);
console.warn = () => {}; console.debug = () => {};
E.bindMasterData();
const kiokus = buildPvPKiokus(parseExport(fs.readFileSync(new URL(`./fixtures/${fix}`, import.meta.url).pathname, "utf8")).slots)[0];
let s = (seed * 7919) >>> 0;
E.GameRandom.seed(() => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });
const AE: any = (E as any).ActExecutor;
const orig = AE.ExecuteSkill;
AE.ExecuteSkill = function (gd: any, unitId: number, skillMstId: number, targetUnitId: number, friend = 0, forced = false) {
    if (process.env.TRACE || targetUnitId === 0) console.log(`ExecuteSkill unit ${unitId} skill ${skillMstId} target ${targetUnitId} friend ${friend} forced ${forced} act ${gd.turnActSystem.CurrentAct?.constructor?.name}`);
    return orig.call(this, gd, unitId, skillMstId, targetUnitId, friend, forced);
};
const SB: any = (E as any).AdditionalSkillActAbilityEffectBase;
const og = SB.$Triggering$g__GetSelectedTargetUnit_7_0;
SB.$Triggering$g__GetSelectedTargetUnit_7_0 = function (f: boolean, dc: any) {
    const r = og.call(this, f, dc);
    if (r === 0) {
        const tr = dc.gameDirector.targetReferee;
        console.log(`GetSelected(${f}) = 0 user ${dc.userUnit._Id} team ${dc.userUnit._Team} ref ${tr.allyAttackTargetId}/${tr.allyFriendTargetId}/${tr.enemyAttackTargetId}/${tr.enemyFriendTargetId}`,
            [...dc.targetUnitDic.values()].map((u: any) => `${u._Id}:t${u._Team}:hp${u._HP}:dead${u.get_IsDead()}`).join(" "), "dicsize", dc.targetUnitDic.size, "all", dc.gameDirector.battleUnitDic.size);
        console.log(new Error().stack!.split("\n").slice(2, 9).join("\n"));
    }
    return r;
};
const AEB: any = (E as any).AbilityEffectBase;
const oc = AEB.prototype.CheckStartConditionSets;
AEB.prototype.CheckStartConditionSets = function (b: any) {
    try { return oc.call(this, b); } catch (e) { console.log(`owner?`, [...(globalThis as any).__d.battleUnitBundle.dic.values()].filter((u: any) => u._PassiveSkills.some((p: any) => p.launcher.AbilityEffectList.includes(this))).map((u: any) => `${u._Id}/${u._MstId}/ps:${u._PassiveSkills.map((p: any) => p.Id + ":" + p.AbilitySourceType).join(",")}`)); console.log(`CheckStartConditionSets threw: ${this.constructor.name} detail ${this._DetailMstId} timings ${this._StartTimings} csv ${this._StartConditionSetIdCsv} src ${this._AbilitySource}`); throw e; }
};
const raid = soloRaidInfo(stageId)!;
const d = new E.SoloRaidGameDirector().ctor(); (globalThis as any).__d = d;
const units = kiokus.map((k: any, i: number) => E.kiokuToNetworkUnit(k, i + 1));
d.SetupBattleStageForSoloRaid(stageId, 0, new E.QuestBattleUnitProvider().ctor(stageId, units), new E.BattleInfo(), SOLO_RAID_COMMON_CHARGE_PASSIVE,
    raid.season?.soloRaidSeasonBuffMstId ?? 0, raid.partyBuffs[0]?.soloRaidPartyBuffMstId ?? 0, raid.limitRoundCount, 8.64e15);
for (const u of d.battleUnitBundle.dic.values()) console.log(`start ${u._Id} t${u._Team} mst ${u._MstId} hp ${u._HP}/${u._MaxHP} gauges ${u.CurrentHpGaugeCount}`);
console.log("linkHp", d.linkHpReferee.linkHpType, d.linkHpReferee.currentLinkHp, d.linkHpReferee.maxLinkHp, "wave", d.waveReferee.currentWave, d.waveReferee.maxWave, "mode", d.waveReferee.mode);
d.autoType = 2; d.ChangeBattlePhase(1); 
try { E.runBattleLikeClient(d); } catch (e: any) { console.log(String(e.stack).split("\n").slice(0, 22).join("\n")); }
console.log("result", d.judgeResultReferee.result, "round", d.turnActSystem?.turnReferee?.CurrentRound);
