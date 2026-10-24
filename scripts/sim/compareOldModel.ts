// The old hand-made single-hit model (models/ScoreAttackKioku + ScoreAttackTeam, the "Old Single Hit Calc") vs the
// 1:1 engine (Kioku Grid Max Burst: battle/EngineMaxDamage on the bench stage), per character, to find characters
// whose numbers moved and should be checked in game.
//
//   npx tsx scripts/sim/compareOldModel.ts [out.json] [--names "A,B"]
//
// Same setup on both sides: max levels (kioku 160, magic 140, heartphial 50, ultimate 10, A5; Lux A0), only the
// kit (no crystalis / portrait / support), one enemy with 3000 DEF, weak, broken at 500%, every hit a crit, the
// Ultimate. Two comparisons per character:
//   - dealer:  the character's Ultimate with four Lux next to it (absolute damage, old vs engine);
//   - support: Lux's Ultimate with the character + three Lux, gain over five Lux (percentage points), for every
//              identity (element / role / ailment) the Kioku Grid support chart tests.
// Differences are expected where the engine is right and the old model simplified (see the report's notes); the
// point is to find the large or surprising ones.
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { ScoreAttackKioku } from "../../src/models/ScoreAttackKioku";
import { ScoreAttackTeam } from "../../src/models/ScoreAttackTeam";
import { benchKioku, LuxBenchCharts, ultimateDamage, kitRestrictions, type BenchIdentity } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { benchStage, BENCH_BROKEN_RATE } from "../../src/battle/EngineBench";
import { BattleType } from "../../src/types/enums"
import { skillDetailId, TargetType } from "../../src/types/KiokuTypes";
import { kiokuData } from "../../src/utils/helpers";
import { KiokuElement, KiokuRole, LuxMagica } from "../../src/types/enums";
import type { Enemy } from "../../src/types/EnemyTypes";

console.debug = () => {}
const warn = console.warn
console.warn = () => {}

const args = process.argv.slice(2)
const out = args.find(a => a.endsWith(".json")) ?? "compare-old-model.json"
const namesArg = args.indexOf("--names") >= 0 ? args[args.indexOf("--names") + 1].split(",").map(s => s.trim()) : undefined
// --explain N: for the N largest moves of each comparison, knock out one effect type at a time in both models
const explainN = args.indexOf("--explain") >= 0 ? Number(args[args.indexOf("--explain") + 1]) : 25

const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const LUX = { name: LuxMagica, ...MAX, ascension: 0 }

// The Old Single Hit Calc's default enemy row: only the target, 3000 DEF, broken at 500%, weak, crits.
const enemies: Enemy[] = ["Left Other", "Left Proximity", "Target", "Right Proximity", "Right Other"].map(name => ({
    name, maxBreak: 500, defense: 3000, enabled: name === "Target", defenseUp: 0, dmgTakenDown: 0,
    isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: name === "Target" ? 1 : 10,
}))

const saKioku = (name: string, extra: object = {}, ctx?: { role?: KiokuRole, element?: KiokuElement }) =>
    new ScoreAttackKioku({ name, ...MAX, ...extra, portrait: undefined, supportKey: undefined } as any, 0, 0, ctx)

function saUlt(dps: ScoreAttackKioku, team: ScoreAttackKioku[], ailments: string[] = [], banned: Set<number> = new Set()): { damage: number, crit: string } {
    const t = new ScoreAttackTeam(dps, team, 100, ailments as any, {}, false, banned)
    t.setDamageAbility("special")
    const [total, , crit] = t.calculate_max_dmg(enemies, 0)
    return { damage: total, crit }
}

const saFiller = saKioku(LuxMagica, { ascension: 0 })
const bench = new LuxBenchCharts(LUX as any, { seeds: 1, av: 500 })
const engFiller = benchKioku(LUX as any, { element: undefined, role: undefined })

// LuxBenchCharts' dealer identity when a part is not tested: Lux's own unless the kit is limited to it.
function resolve(id: BenchIdentity, x: any): { element: KiokuElement, role: KiokuRole, ailment?: any } {
    const { elements, roles } = kitRestrictions(x)
    const pick = <T,>(own: T, all: T[], limited: T[]) => !limited.includes(own) ? own : all.find(v => !limited.includes(v)) ?? own
    return {
        element: id.element ?? pick(KiokuElement.Light, Object.values(KiokuElement), elements),
        role: id.role ?? pick(KiokuRole.Breaker, Object.values(KiokuRole), roles),
        ailment: id.ailment,
    }
}

// The engine's Max Burst (as LuxBench.ultimateDamage) with some team effects left out.
function engUlt(allies: any[], ailment: any, excluded: Set<string> = new Set()): { damage: number, effects: any[] } {
    const { stageId, enemies: apps } = benchStage(1)
    const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, apps, 0, {
        battleType: BattleType.Solo, broken: [true], breakRate: [BENCH_BROKEN_RATE], mainTargetIdx: 0, onlyPos: 0,
        enemyStates: ailment ? [({ BURN: "BURN_ATK", CURSE: "CURSE_ATK", POISON: "POISON_ATK", WOUND: "BLEED_ATK", STUN: "STUN", VORTEX: "VORTEX_ATK", WEAKNESS: "WEAKNESS" } as any)[ailment] ?? ailment] : undefined,
        excluded,
    })
    return { damage: r.members[0]?.skills.find(s => s.type === TargetType.specialId)?.total.crit ?? 0, effects: r.effects }
}

/** Effect type -> how much the damage drops when every effect of that type (from any team member) is left out, in
 *  both models: old = dmg without / dmg with - 1 (%), engine the same. A type where the two disagree is the likely cause. */
function explain(saDps: ScoreAttackKioku, saTeam: ScoreAttackKioku[], engAllies: any[], ailment?: any) {
    const ail = ailment ? [ailment] : []
    const oldFull = saUlt(saDps, saTeam, ail).damage
    const eng = engUlt(engAllies, ailment)
    const types = new Map<string, { old: Set<number>, eng: Set<string> }>()
    const at = (t: string) => types.get(t) ?? types.set(t, { old: new Set(), eng: new Set() }).get(t)!
    for (const k of [saDps, ...saTeam]) for (const d of k.effects) at(d.abilityEffectType).old.add(skillDetailId(d))
    for (const e of eng.effects) at(e.detail.abilityEffectType).eng.add(e.key)
    const out: { type: string, old: number, engine: number, diff: number }[] = []
    for (const [type, ids] of types) {
        if (type.startsWith("DMG_")) continue
        const o = ids.old.size ? (saUlt(saDps, saTeam, ail, ids.old).damage / oldFull - 1) * 100 : 0
        const n = ids.eng.size ? (engUlt(engAllies, ailment, ids.eng).damage / eng.damage - 1) * 100 : 0
        if (Math.abs(o) < 0.05 && Math.abs(n) < 0.05) continue
        out.push({ type, old: +o.toFixed(1), engine: +n.toFixed(1), diff: +(n - o).toFixed(1) })
    }
    return out.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
}

interface Row {
    name: string, role: string, element: string, rarity: number
    dealer?: { old: number, engine: number, ratio: number, oldCrit: string, engineCrit: number }
    support: { identity: string, old: number, engine: number, diff: number, why?: ReturnType<typeof explain> }[]
    why?: ReturnType<typeof explain>
    error?: string
}

const rows: Row[] = []
const names = (namesArg ?? Object.keys(kiokuData)).filter(n => (kiokuData as any)[n])
const t0 = Date.now()
for (const name of names) {
    const d: any = (kiokuData as any)[name]
    const row: Row = { name, role: d.role, element: d.element, rarity: d.rarity, support: [] }
    try {
        // dealer: the character's Ultimate next to four Lux
        const x = benchKioku({ name, ...MAX } as any)
        const old = saUlt(saKioku(name), [saFiller, saFiller, saFiller, saFiller])
        const eng = ultimateDamage([x, engFiller, engFiller, engFiller, engFiller], 0, 1)
        row.dealer = { old: Math.round(old.damage), engine: Math.round(eng.damage), ratio: old.damage > 0 ? eng.damage / old.damage : NaN, oldCrit: old.crit, engineCrit: +eng.critChance.toFixed(1) }
        // support: Lux's Ultimate with the character, per identity
        for (const id of bench.supportIdentities(x)) {
            const engGain = bench.supportMax(x, 1, [id])[0].gain
            const r = resolve(id, x)
            const luxDealer = saKioku(LuxMagica, { ascension: 0 }, { role: r.role, element: r.element })
            const ail = r.ailment ? [r.ailment] : []
            const base = saUlt(luxDealer, [saFiller, saFiller, saFiller, saFiller], ail).damage
            const withX = saUlt(luxDealer, [saKioku(name), saFiller, saFiller, saFiller], ail).damage
            const oldGain = base > 0 ? (withX / base - 1) * 100 : 0
            row.support.push({ identity: `${id.element ?? "-"}/${id.role ?? "-"}/${id.ailment ?? "-"}`, old: +oldGain.toFixed(2), engine: +engGain.toFixed(2), diff: +(engGain - oldGain).toFixed(2) })
        }
    } catch (e: any) {
        row.error = String(e?.message ?? e).split("\n")[0]
    }
    rows.push(row)
    process.stdout.write(`\r${rows.length}/${names.length} ${name.padEnd(30)}`)
}
console.warn = warn
process.stdout.write("\n")
// Explanations for the largest moves: knock out one effect type at a time in both models.
const finite = rows.filter(r => r.dealer && isFinite(r.dealer.ratio))
const topDealer = [...finite].sort((a, b) => Math.abs(Math.log(b.dealer!.ratio)) - Math.abs(Math.log(a.dealer!.ratio)))
    .filter(r => Math.abs(r.dealer!.ratio - 1) > 0.02).slice(0, explainN)
const topSupport = rows.flatMap(r => r.support.map(s => ({ r, s }))).filter(x => Math.abs(x.s.diff) > 2)
    .sort((a, b) => Math.abs(b.s.diff) - Math.abs(a.s.diff)).slice(0, explainN)
let done = 0
const total = topDealer.length + topSupport.length
console.warn = () => {}
for (const r of topDealer) {
    process.stdout.write(`\rexplaining ${++done}/${total} ${r.name.padEnd(30)}`)
    try {
        const x = benchKioku({ name: r.name, ...MAX } as any)
        r.why = explain(saKioku(r.name), [saFiller, saFiller, saFiller, saFiller], [x, engFiller, engFiller, engFiller, engFiller])
    } catch { /* leave unexplained */ }
}
for (const { r, s } of topSupport) {
    process.stdout.write(`\rexplaining ${++done}/${total} ${r.name.padEnd(30)}`)
    try {
        const x = benchKioku({ name: r.name, ...MAX } as any)
        const [el, ro, ai] = s.identity.split("/").map(v => v === "-" ? undefined : v)
        const id = resolve({ element: el as any, role: ro as any, ailment: ai as any }, x)
        const luxSa = saKioku(LuxMagica, { ascension: 0 }, { role: id.role, element: id.element })
        const luxEng = benchKioku(LUX as any, { element: id.element, role: id.role })
        s.why = explain(luxSa, [saKioku(r.name), saFiller, saFiller, saFiller], [luxEng, x, engFiller, engFiller, engFiller], id.ailment)
    } catch { /* leave unexplained */ }
}
console.warn = warn
process.stdout.write("\n")
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), rows }, null, 1))

// console summary: the largest moves
const dealer = rows.filter(r => r.dealer && isFinite(r.dealer.ratio)).sort((a, b) => Math.abs(Math.log(b.dealer!.ratio)) - Math.abs(Math.log(a.dealer!.ratio)))
console.log("\nDealer (engine / old), largest moves:")
for (const r of dealer.slice(0, 20)) console.log(`  ${r.name.padEnd(30)} ${((r.dealer!.ratio - 1) * 100).toFixed(1).padStart(7)}%   old ${r.dealer!.old}  engine ${r.dealer!.engine}  crit ${r.dealer!.oldCrit}% / ${r.dealer!.engineCrit}%`)
const sup = rows.flatMap(r => r.support.map(s => ({ name: r.name, ...s }))).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
console.log("\nSupport gain (engine - old, points), largest moves:")
for (const s of sup.slice(0, 20)) console.log(`  ${s.name.padEnd(30)} ${s.identity.padEnd(22)} old ${s.old.toFixed(1).padStart(7)}%  engine ${s.engine.toFixed(1).padStart(7)}%  (${s.diff > 0 ? "+" : ""}${s.diff.toFixed(1)})`)
const errs = rows.filter(r => r.error)
if (errs.length) console.log(`\n${errs.length} errors:`, errs.map(r => `${r.name}: ${r.error}`).join("; "))
console.log(`\nwritten ${out}`)

// ---- Markdown report next to the JSON (docs-friendly; the same numbers)
const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`
const whyText = (why?: { type: string, old: number, engine: number, diff: number }[]) => !why?.length ? "" :
    why.filter(w => Math.abs(w.diff) >= 1).slice(0, 4).map(w => `${w.type} (old ${pct(w.old)}, engine ${pct(w.engine)})`).join("; ") || "no single effect type explains it"
const md: string[] = [
    "# Old single-hit model vs 1:1 engine", "",
    `Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} by \`npx tsx scripts/sim/compareOldModel.ts\`.`, "",
    "Setup on both sides: max levels (kioku 160, magic 140, heartphial 50, ultimate 10; the character A5, Lux A0), only the kit, one enemy with 3000 DEF, weak, broken at 500%, every hit a crit, the Ultimate.", "",
    "\"Why\" knocks out one effect type at a time (from every team member) in both models and lists the types whose impact differs: e.g. `UP_ATK_ACCUM_RATIO (old -75%, engine -19%)` means removing that type costs 75% of the damage in the old model but 19% in the engine.", "",
    "## Dealer: the character's Ultimate next to four Lux", "",
    "| Character | Engine vs old | Old | Engine | Crit rate old / engine | Why |", "|---|---|---|---|---|---|",
    ...dealer.filter(r => Math.abs(r.dealer!.ratio - 1) > 0.005).map(r => `| ${r.name} | ${pct((r.dealer!.ratio - 1) * 100)} | ${r.dealer!.old.toLocaleString("en")} | ${r.dealer!.engine.toLocaleString("en")} | ${r.dealer!.oldCrit}% / ${r.dealer!.engineCrit}% | ${whyText(r.why)} |`),
    "", `${dealer.filter(r => Math.abs(r.dealer!.ratio - 1) <= 0.005).length} other characters are within 0.5%.`, "",
    "## Support: Lux's Ultimate gain with the character (points)", "",
    "| Character | Identity (element/role/ailment) | Old | Engine | Difference | Why |", "|---|---|---|---|---|---|",
    ...sup.filter(s => Math.abs(s.diff) >= 0.5).map(s => `| ${s.name} | ${s.identity} | ${pct(s.old)} | ${pct(s.engine)} | ${s.diff > 0 ? "+" : ""}${s.diff.toFixed(1)} | ${whyText((s as any).why)} |`),
    "", `${sup.filter(s => Math.abs(s.diff) < 0.5).length} other bars are within 0.5 points.`, "",
    ...(errs.length ? ["## Not compared", "", ...errs.map(r => `- ${r.name}: ${r.error}`), ""] : []),
]
const mdPath = out.replace(/\.json$/, ".md")
fs.writeFileSync(mdPath, md.join("\n") + "\n")
console.log(`written ${mdPath}`)
