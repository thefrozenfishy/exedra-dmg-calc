import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { parsePvEExport, buildSlotKioku } from "../../src/utils/pvpExport";
import { createPvEBattle } from "../../src/models/PvEBattle";
import { PendingDecision } from "../../src/models/BattleRng";
const pve = parsePvEExport(fs.readFileSync(process.argv[2], "utf8"));
const q = { w: console.warn, d: console.debug, e: console.error }; console.warn = () => {}; console.debug = () => {};
const allies = pve.slots.filter(s => !!s.main).map(buildSlotKioku);
const KS: any = Object.getPrototypeOf(allies.length ? {} : {});
import("../../src/models/PvPTeam").then(()=>{});
const b: any = createPvEBattle(allies, pve.stageId, pve.seed, 0, { rngMode: pve.rngMode, decisions: pve.decisions, manualTargeting: pve.control === "manual", relaxedPicks: true, partyBuffId: pve.soloRaid?.partyBuffId });
const dump = (tag: string) => { const units = [...b.team1.kiokuStates, ...b.team2.kiokuStates].filter((u: any) => !u.isDead);
  console.log(tag + "  " + units.filter((u:any)=>u.turnGauge<60).map((u: any) => `${(u.kioku?.name ?? u.name ?? "?").slice(0,14)}:g=${u.turnGauge.toFixed(3)} p=${u.turnOrderPriority}`).join(" | ")); };
const proto = Object.getPrototypeOf(b.team1.kiokuStates[0]);
const orig = proto.addGaugeRate; let curDet: any;
const oAE = proto.applyEffectToTarget; proto.applyEffectToTarget = function(...a: any[]) { const d = a.find((x:any)=>x && typeof x==="object" && "abilityEffectType" in x); const prev = curDet; if (d) curDet = d; try { return oAE.apply(this, a) } finally { curDet = prev } };
proto.addGaugeRate = function(rate: number, prio: number) { const before = this.turnGauge; orig.call(this, rate, prio);
  const st = (new Error().stack ?? "").split("\n").slice(2,6).map(l=>l.trim().replace(/\(.*[\/]/,"(")).join(" < ");
  console.log(`   gauge ${(this.kioku?.name ?? this.name).slice(0,14)} ${before.toFixed(2)}->${this.turnGauge.toFixed(2)} rate=${rate.toFixed(3)} p=${prio} det=${curDet ? (curDet.id ?? curDet.detailId ?? curDet.passiveDetailMstId ?? (curDet.passiveSkillDetailMstId + " v" + curDet.value1 + " r" + curDet.range)) : "-"} owner=${[...b.team1.kiokuStates,...b.team2.kiokuStates].filter((u:any)=>u.effectTurnPriority===prio).map((u:any)=>u.kioku.name).join("/")} :: ${st}`); };
dump("start");
for (let t = 0; t < pve.turns && !b.isOver; t++) {
  try { const s = b.executeNextAction(); const last = s[s.length-1]; dump(`after #${t+1} ${last?.lastActor ?? ""}`); }
  catch (e) { if (e instanceof PendingDecision) { console.log("PENDING", e.event.label, JSON.stringify(e.event.options ?? e.event)); for (const u of b.team1.kiokuStates) console.log("  ", u.kioku.name, "ep", u.currentEp ?? u.ep, "max", u.isSpecialAttackPointMax(), "cna", u.canNotAction, "seal", u.canNotUseSpecialAttack, "brk", u.maxBreakGauge, u.currentRemainingBreakGauge, "g", u.turnGauge); break; } throw e; }
}
