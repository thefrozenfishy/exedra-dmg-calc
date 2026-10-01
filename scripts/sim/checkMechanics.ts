// Engine checks of decompile-confirmed rules (no in-game export needed): npx tsx scripts/sim/checkMechanics.ts
// In-game regressions live in checkFixtures.ts; this file pins rules read from the 3.19 decompile (MECHANICS.md).
import "../../src/models/BestTeamCalculator"; // must load first (import cycle outside Vite)
import { kiokuData } from "../../src/utils/helpers";
import { PvPKioku } from "../../src/models/PvPKioku";
import { PvPTeam, KiokuState, currentLaunch } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";
import { getProcessedCtd } from "../../src/models/UnitStateEngine";
import { TargetType, type SkillDetail } from "../../src/types/KiokuTypes";
import passiveDetails from "../../src/assets/base_data/getPassiveSkillDetailMstList.json";

console.warn = () => {}; console.debug = () => {};
const mk = (name: string) => new PvPKioku({ name, kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10, crysIDs: [], subCrysIDs: [] } as any);
const names = Object.keys(kiokuData).filter(k => kiokuData[k].rarity === 5).sort();
const attackerName = names.find(n => kiokuData[n].role === "Attacker") ?? names[0];
const fresh = () => {
    const t1 = new PvPTeam([attackerName, ...names.filter(n => n !== attackerName).slice(0, 4)].map(mk), "Ally");
    const t2 = new PvPTeam(names.slice(10, 15).map(mk), "Enemy");
    new PvPBattle(t1, t2, false, 4242);
    t1.snapshotHook = t2.snapshotHook = undefined; // the snapshot drains eventLog
    return { t1, t2, a: t1.kiokuStates[0] };
};
const act = (t: PvPTeam, a: KiokuState, type: TargetType) => { t.resetActionTallies(); (t as any).performAction(a, type) };
const put = (u: KiokuState, key: string, d: any) => u.activeEffectDetails.set(key, { turn: 99, remainCount: 99, ...d, _applierState: u, applier: u.kioku.name } as any);

let failed = 0;
const check = (name: string, ok: boolean, info: string) => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${info}`) };

// 1. ActorSkillType (401) in a state's ACTIVE condition = the skill being launched (AbilityEffectLauncher.Triggering
//    0x1373550 sets ActorActiveSkill in every unit's bundle; RemoveTransientData 0x17ec1f0 clears it).
{
    const row = (passiveDetails as any[]).find(r => r.abilityEffectType === "UP_CTD_FIXED" && r.activeConditionSetIdCsv === "7" && r.value1 === 200)
    const { t1, a } = fresh()
    // The kit's own states can also be skill-type gated: measure the probe state's own contribution.
    const ctdDelta = () => { const v1 = getProcessedCtd(a); const d = a.activeEffectDetails.get("probe:ctd"); a.activeEffectDetails.delete("probe:ctd"); const v0 = getProcessedCtd(a); a.activeEffectDetails.set("probe:ctd", d!); return v1 - v0 }
    put(a, "probe:ctd", row)
    const outside = ctdDelta()
    const seen: [string | undefined, number][] = []
    const orig = a.additionalDamageAfterLaunch.bind(a)
    a.additionalDamageAfterLaunch = () => { seen.push([currentLaunch()?.skillType, ctdDelta()]); orig() }
    act(t1, a, TargetType.specialId)
    act(t1, a, TargetType.attackId)
    act(t1, a, TargetType.skillId)
    const during = (t: string) => seen.find(([x]) => x === t)?.[1]
    check("special-attack crit DMG state (cond set 7)", outside === 0 && during("SpecialAttack") === 20 && during("NormalAttack") === 0 && during("ActiveSkill") === 0,
        `+${outside} between skills, +${during("SpecialAttack")} during the ultimate (want 20), +${during("NormalAttack")} basic attack, +${during("ActiveSkill")} battle skill (want 0)`)
    check("launch context cleared after the skill", currentLaunch() === undefined, `${currentLaunch()?.skillType}`)
}

// 2. ADDITIONAL_DAMAGE: one extra hit per state per opponent hit by the skill, after the skill (0x1373550 /
//    AdditionalDamageUnitState.GetAdditionalDamageResult 0x15b4840) - not one per damage row. Follow-ups the skill
//    triggers are launches of their own and get their own additional hits.
for (const type of [TargetType.attackId, TargetType.skillId, TargetType.specialId]) {
    const hitsOf = (withBonus: boolean) => {
        const { t1, t2, a } = fresh()
        if (withBonus) put(a, "probe:add", { abilityEffectType: "ADDITIONAL_DAMAGE", value1: 300, activeConditionSetIdCsv: "", startConditionSetIdCsv: "", range: -1, element: 0, role: 0 } as Partial<SkillDetail>)
        let launches = 0, opponentsHit = 0
        const orig = a.additionalDamageAfterLaunch.bind(a)
        a.additionalDamageAfterLaunch = () => { launches++; opponentsHit += t2.kiokuStates.filter(u => u.lastNotice?.isReceivedAttack && !u.isDead).length; orig() }
        const start = t1.eventLog.length
        act(t1, a, type)
        const hits = t1.eventLog.slice(start).filter(e => e.kind === "hit" && e.source === a.kioku.name && e.sourceIsTeam1).length
        return { hits, launches, opponentsHit }
    }
    const without = hitsOf(false), withB = hitsOf(true)
    check(`additional damage on ${type}`, withB.hits === without.hits + without.opponentsHit,
        `${without.launches} launch(es), ${without.hits} hits without, ${withB.hits} with (want ${without.hits} + ${without.opponentsHit} opponents hit)`)
}

process.exit(failed ? 1 : 0);
