// Engine checks of decompile-confirmed rules (no in-game export needed): npx tsx scripts/sim/checkMechanics.ts
// In-game regressions live in checkFixtures.ts; this file pins rules read from the 3.19 decompile (MECHANICS.md).
import "../../src/models/BestTeamCalculator"; // must load first (import cycle outside Vite)
import { kiokuData } from "../../src/utils/helpers";
import { PvPKioku } from "../../src/models/PvPKioku";
import { PvPTeam, KiokuState, currentLaunch, elementNumberOf } from "../../src/models/PvPTeam";
import { isConditionSetActiveForPvP } from "../../src/models/BattleConditionParser";
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

// 3. A battle-skill HASTE never targets its user: HasteAbilityEffect.GetAIFilteredTargets (0x18f4140) keeps only units
//    with TurnGauge.GaugeValue > 0, and the AI decides before ResetTurnGaugeBeforeTurnUnitActExecute (0x17e1a70), while
//    the turn unit's gauge is 0. The friendly pick is made against the whole team (UnitBrain.TargetingUnits 0x17f2ea0),
//    and the skill's other friendly effect (UP_GIV_DMG_RATIO) lands on the same unit. Regression: Thunder Torrent
//    (Rapid Pulse, skill 1066) hasted herself every turn - first with no Attacker/Breaker teammate (generic AI path),
//    then with one (her kit-specific rule).
for (const mates of [["Time Stop Strike", "Hollow Woman", "Ultra Great Big Hammer", "Judgement Earth"],
                     [attackerName, "Time Stop Strike", "Hollow Woman", "Judgement Earth"]]) {
    const t1 = new PvPTeam(["Thunder Torrent", ...mates].map(mk), "Ally")
    const t2 = new PvPTeam(names.slice(10, 15).map(mk), "Enemy")
    const battle = new PvPBattle(t1, t2, false, 4242)
    t1.snapshotHook = t2.snapshotHook = undefined
    const tt = t1.kiokuStates[0]
    for (const u of [...t1.kiokuStates, ...t2.kiokuStates]) { u.turnGauge = u === tt ? 0 : 40; u.currentMp = 0 }
    t1.currentSp = 5
    const giv = (u: KiokuState) => [...u.activeEffectDetails.values()].some((d: any) => d.abilityEffectType === "UP_GIV_DMG_RATIO" && d.applier === "Thunder Torrent")
    const before = new Map(t1.kiokuStates.map(u => [u, giv(u)]))
    battle.executeNextAction()
    const hasted = t1.kiokuStates.filter(u => u !== tt && u.turnGauge === 0)
    const buffed = t1.kiokuStates.filter(u => giv(u) && !before.get(u))
    const label = mates.includes(attackerName) ? "with an Attacker teammate" : "no Attacker/Breaker teammate"
    check(`Thunder Torrent battle skill never targets herself (${label})`,
        hasted.length === 1 && buffed.length === 1 && buffed[0] === hasted[0] && !buffed.includes(tt) && tt.turnGauge > 0,
        `hasted [${hasted.map(u => u.kioku.name)}], DMG up on [${buffed.map(u => u.kioku.name)}], her own gauge ${tt.turnGauge.toFixed(2)} (want one teammate for both, gauge > 0)`)
}

// 4. EachTargetUnit: every effect's Triggering sets the USER's bundle EachTarget to the target it processes and clears it
//    after (DamageAbilityEffectBase.Triggering 0x18ef650, ...); the defender's bundle never gets it, and a null
//    EachTarget makes EACH_TARGET conditions false for state activity (Condition.IsMatchCondition 0x17eca80, case 8).
//    "DMG dealt to cursed enemies" (active condition set 345: EachTarget.AbilityEffect contains CURSE).
{
    const { t1, t2, a } = fresh()
    const probe = { abilityEffectType: "UP_GIV_DMG_RATIO", value1: 400, activeConditionSetIdCsv: "345", startConditionSetIdCsv: "", range: -1, element: 0, role: 0 } as Partial<SkillDetail>
    put(a, "probe:each", probe)
    const cursed = t2.kiokuStates[0]
    put(cursed, "probe:curse", { abilityEffectType: "CURSE_ATK", value1: 1, activeConditionSetIdCsv: "", startConditionSetIdCsv: "" })
    put(cursed, "probe:each", probe)  // the same state on the defender: never sees the attacker's EachTarget
    const seen = new Map<KiokuState, [boolean, boolean]>()
    for (const u of t2.kiokuStates) {
        const orig = u.takeDamage.bind(u)
        u.takeDamage = (n: number) => {
            if (!seen.has(u)) seen.set(u, [a.isEffectCurrentlyActive(a.activeEffectDetails.get("probe:each")!), u.isEffectCurrentlyActive(u.activeEffectDetails.get("probe:each") ?? probe as SkillDetail)])
            return orig(n)
        }
    }
    const outside = a.isEffectCurrentlyActive(a.activeEffectDetails.get("probe:each")!)
    act(t1, a, TargetType.specialId)
    const onCursed = seen.get(cursed)?.[0], defender = seen.get(cursed)?.[1]
    const others = [...seen].filter(([u]) => u !== cursed).map(([, [x]]) => x)
    check("EachTarget = the attacker's current target (cond set 345)",
        outside === false && onCursed === true && defender === false && others.length > 0 && others.every(x => !x),
        `outside an effect ${outside} (want false), hitting the cursed enemy ${onCursed} (want true), on ${others.length} uncursed enemies [${others}] (want false), the cursed defender's own copy ${defender} (want false)`)
}

// 5. IsElementType / IsRoleType honor the operator: BoolValueComparer(IsMatch, true).Compare(op) (0x17e3f10, 0x17e8240).
//    Set 349 = EachTarget is neither Buffer nor Debuffer (NotEqual rows).
{
    const { t1, a } = fresh()
    const byRole = (role: string) => names.find(n => kiokuData[n].role === role)!
    const res = ["Buffer", "Debuffer", "Attacker"].map(role => {
        const u = new PvPTeam([mk(byRole(role))], "Ally").kiokuStates[0]
        return [role, isConditionSetActiveForPvP(["349"], a.stateGen(a, u))] as const
    })
    check("IsRoleType NotEqual (cond set 349)", !res[0][1] && !res[1][1] && res[2][1], res.map(([r, v]) => `${r}: ${v}`).join(", ") + " (want false, false, true)")
    void t1
}

// 6. Team SP: SpReferee.AddSp (0x15c04b0) = Clamp(sp + n, 0, 6).
{
    const { t1, a } = fresh()
    t1.currentSp = 6
    act(t1, a, TargetType.attackId)
    const afterAttack = t1.currentSp
    t1.currentSp = 4; t1.addSp(5)
    const afterGain = t1.currentSp
    t1.currentSp = 0; t1.addSp(-1)
    check("team SP clamped to 0..6", afterAttack === 6 && afterGain === 6 && t1.currentSp === 0, `attack at 6 -> ${afterAttack}, 4 + 5 -> ${afterGain}, 0 - 1 -> ${t1.currentSp}`)
}

// 7. A popped vortex is part of the popping hit's notice (VortexProcess 0x18f0260, op_Addition in Triggering 0x18ef650).
{
    const { t1, t2, a } = fresh()
    const owner = t1.kiokuStates[1]
    for (const target of t2.kiokuStates)
        target.passiveEffectDetails.set("vortex:probe", { abilityEffectType: "VORTEX_ATK", value1: 3000, value2: 1, turn: -1, applier: owner.kioku.name, _applierState: owner, _remainAttackCount: 1, activeConditionSetIdCsv: "", startConditionSetIdCsv: "" } as any)
    const start = t1.eventLog.length
    act(t1, a, TargetType.attackId)
    const hit = t1.eventLog.slice(start).find(e => e.kind === "hit" && e.vortex)
    const notice = t2.lastActionNotices.find(n => n.totalDamageValue > 0)
    check("popped vortex counted in the hit's notice", !!hit && !!notice && notice.totalDamageValue >= hit.vortex! && notice.totalDamageValue === hit.amount + (hit.barrierAbsorbed ?? 0),
        `hit ${hit?.amount} (vortex ${hit?.vortex}), notice total ${notice?.totalDamageValue}`)
}

// 8. Additional damage element: a non-character attacker deals it elementless (GetAdditionalDamageResult 0x15b4840).
{
    const { t1, a } = fresh()
    const fakeEnemy = { enemy: {}, kioku: a.kioku } as unknown as KiokuState
    check("additional damage element", elementNumberOf(a) > 0 && elementNumberOf(fakeEnemy) === 0, `character ${elementNumberOf(a)}, enemy ${elementNumberOf(fakeEnemy)} (want > 0, 0)`)
    void t1
}

// 9. BP (MaxBP = StyleMst.bp > 0): IsSpecialAttackPointMax 0x13885d0 reads BP, not EP. BpCharger (cctor 0x1491450):
//    own basic attack +1, own battle skill +2, each GAIN_EP_* effect received +1 (GainEpAbilityEffectBase.Triggering
//    0x18f3300). SpecialAttack.Execute 0x138c4f0 zeroes BP before the ult's own GAIN_BP_FIXED (+2 for Vinctio).
{
    const mk0 = (name: string) => new PvPKioku({ name, kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 0, specialLvl: 10, crysIDs: [], subCrysIDs: [] } as any)
    const t1 = new PvPTeam(["Vinctio☆Magica", "Pluvia☆Magica", ...names.filter(n => !/Vinctio|Pluvia/.test(n)).slice(0, 3)].map(mk0), "Ally")
    const t2 = new PvPTeam(names.slice(10, 15).map(mk), "Enemy")
    new PvPBattle(t1, t2, false, 4242)
    t1.snapshotHook = t2.snapshotHook = undefined
    const [v, p] = t1.kiokuStates
    const start = v.currentBp
    act(t1, v, TargetType.attackId); const afterAttack = v.currentBp
    t1.currentSp = 5; act(t1, v, TargetType.skillId); const afterSkill = v.currentBp
    p.currentMp = p.maxMp; act(t1, p, TargetType.specialId); const afterPluviaUlt = v.currentBp
    const readyAt11 = (v.currentBp = 11, v.isSpecialAttackPointMax())
    v.currentBp = 12; const readyAt12 = v.isSpecialAttackPointMax() && t1.readyUltimates().includes(v)
    act(t1, v, TargetType.specialId); const afterUlt = v.currentBp
    check("BP gains and ultimate", v.maxBp === 12 && v.maxMp === 0 && start === 0 && afterAttack === 1 && afterSkill === 3 && afterPluviaUlt === 4 && !readyAt11 && readyAt12 && afterUlt === 2,
        `max ${v.maxBp} (MP max ${v.maxMp}); start ${start}, basic ${afterAttack}, skill ${afterSkill}, Pluvia ult (+20 MP) ${afterPluviaUlt}, ready at 11 ${readyAt11} / 12 ${readyAt12}, after own ult ${afterUlt} (want 0,1,3,4,false,true,2)`)
}

process.exit(failed ? 1 : 0);
