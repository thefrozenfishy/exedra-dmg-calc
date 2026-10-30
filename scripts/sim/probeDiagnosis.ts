// Probe of models/EngineDamageDiagnosis (the PvE page's "what was missing?"): a team on the bench stage, some of its
// effects taken away for the "observed" damage, then the search run in-process to see whether it finds them.
//   npx tsx scripts/sim/probeDiagnosis.ts ["Dealer,Support1,Support2,..."] [missing count]
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { benchStage, BENCH_BROKEN_RATE } from "../../src/battle/EngineBench";
import { BattleType } from "../../src/types/enums";
import { diagnoseDamage, type DiagnosisCandidate } from "../../src/models/EngineDamageDiagnosis";
import type { VariantChange } from "../../src/workers/maxDamageWorker";
import type { MaxDmgOptions } from "../../src/models/MaxDamage";

console.debug = () => {}
console.warn = () => {}
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const names = (process.argv[2] ?? "Iroha Tamaki,Yachiyo Nanami,Felicia Mitsuki,Tsuruno Yui,Sana Futaba").split(",")
const nMissing = Number(process.argv[3] ?? 2)
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const { stageId, enemies } = benchStage(1)
const opts: MaxDmgOptions = { battleType: BattleType.Solo, broken: [true], breakRate: [BENCH_BROKEN_RATE], mainTargetIdx: 0 }
const t0 = Date.now()
const full = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, enemies, 0, opts)
const best = full.members[0].best!
console.log("best", best.label, best.total.crit, `(${Date.now() - t0} ms)`)
const used = full.effects.filter(e => e.reach && !e.tierUsed && (e.reach.dealer || e.reach.enemies.length || e.forOwner))
const cands: DiagnosisCandidate[] = used.map(e => ({ id: e.key, group: e.key, label: `${e.casterName} ${e.source} ${e.detail.abilityEffectType} ${e.detail.value1}`, bucket: `${e.detail.abilityEffectType}|${e.side}`, change: { excluded: [e.key] } }))
console.log(cands.length, "candidates")
const score = async (c: VariantChange) => {
    const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, enemies, 0, {
        ...opts, excluded: new Set(c.excluded), onlyPos: 0, scoreOnly: true, onlyColumn: best.label })
    const m = r.members[0]
    return [...m.skills, ...(m.switchSkill ? [m.switchSkill] : [])].map(s => ({ label: s.label, name: s.name, perEnemy: s.perEnemy }))
}
// the "in game" number: a few of the larger effects missing
;(async () => {
    const offset = Number(process.argv[4] ?? 1)
    // effects that change the damage, every third from `offset`
    const crit = async (c: VariantChange) => (await score(c)).find(x => x.label === best.label)!.perEnemy.reduce((s, x) => s + x.crit, 0)
    const matter: DiagnosisCandidate[] = []
    for (const c of cands) if (await crit(c.change) < best.total.crit * 0.999) matter.push(c)
    console.log(matter.length, "change the crit damage")
    const pick = matter.filter((_, i) => i % 3 === offset % 3).slice(0, nMissing)
    const obs = (await score({ excluded: pick.flatMap(p => p.change.excluded!) })).find(c => c.label === best.label)!.perEnemy.reduce((s, x) => s + x.crit, 0)
    console.log("missing:", pick.map(p => p.label), "->", obs)
    const t1 = Date.now()
    const r = await diagnoseDamage(cands, { column: { label: best.label, name: best.name }, enemy: "all", hit: "either", observed: obs }, score)
    console.log(`search ${Date.now() - t1} ms`, r?.base, r?.aboveMax)
    for (const row of r?.rows ?? []) console.log((row.diff * 100).toFixed(3) + "%", row.hit, Math.round(row.damage), row.missing.map((m, i) => m.label + (row.alternatives[i].length ? ` (or ${row.alternatives[i].map(a => a.label).join(" / ")})` : "")).join(" | "))
})()
