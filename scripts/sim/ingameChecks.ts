// In-game checks for the characters whose numbers moved between the old single-hit model and the 1:1 engine
// (docs/ai/OLD_VS_ENGINE.md): short scripted fights in "Crystalis Quest: <element> (Extra)" with the user's own
// builds (the Team page's exedraDmgCalcTeam.json export), and the damage the engine expects for every hit.
//
//   npx tsx scripts/sim/ingameChecks.ts <exedraDmgCalcTeam.json> [out.md] [--only "Name,Name"]
//
// Each check: a party (1-3 kioku, no supports), a list of ally actions in turn order, and the hits to read. The
// fight runs twice, once with every ally hit a crit and once with none (enemy crits off, every effect chance lands,
// enemy AI from a fixed seed), so each hit has its non-crit and its crit number. If the game's turn order differs
// from the listed one, the check says so (the order line shows who acts when).
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { EngineBattle } from "../../src/battle/EngineBattle";
import { BattleRng, type RngKind } from "../../src/models/BattleRng";
import { PvPKioku } from "../../src/models/PvPKioku";
import { correctCharacterParams } from "../../src/types/KiokuTypes";
import { kiokuData, crystalises } from "../../src/utils/helpers";
import { skillName } from "../../src/models/PvE";
import { E } from "../../src/battle/engineBundle";

console.debug = () => {}
console.warn = () => {}

const STAGE: Record<string, number> = { Flame: 409105, Aqua: 410105, Forest: 411105, Light: 412105, Dark: 413105, Void: 414105 }

export type Act = "skill" | "basic" | "ult" | `step${number}`
export interface Step { who: string, act: Act, target?: 1 | 2 | 3, friend?: string, read?: boolean }
export interface Check {
    name: string                // the character under test
    stage: keyof typeof STAGE
    party: string[]             // in slot order
    /** party members not in `steps` act on their own: this action every turn (default Basic Attack on Enemy 2) */
    helpers?: Record<string, Act>
    steps: Step[]
    what: string                // what the check isolates
    expect?: string             // the old model's claim, for contrast
}

class ScriptRng extends BattleRng {
    /** each scripted unit's own queue of steps (the turn order decides who goes when) */
    private readonly queues = new Map<string, Step[]>()
    current?: Step
    log: string[] = []
    error?: string
    constructor(private readonly crit: boolean, steps: Step[], private readonly allies: string[], private readonly helpers: Record<string, Act> = {}) {
        super("seed", 12345)
        for (const st of steps) (this.queues.get(st.who) ?? this.queues.set(st.who, []).get(st.who)!).push({ ...st })
    }
    get done(): boolean { return [...this.queues.values()].every(q => q.length === 0) }
    protected draw(kind: RngKind, label: string): number {
        if (kind === "crit") {
            const ally = this.allies.some(a => label.startsWith(a + " "))
            return ally && this.crit ? 0 : 0.999999
        }
        if (kind === "effect") return 0
        return super.draw(kind, label)
    }
    private readyUlt(options: string[]): number {
        for (const [who, q] of this.queues) {
            if (q[0]?.act !== "ult") continue
            const u = options.findIndex(o => o.startsWith(`Ultimate: ${who} (`))
            if (u >= 0) { this.current = q.shift(); return u }
        }
        return -1
    }
    pick(kind: RngKind, label: string, options: string[]): number {
        if (options.length <= 1) return options.length - 1
        let idx = -1
        if (label.startsWith("Between actions")) {
            idx = Math.max(0, this.readyUlt(options))
        } else if (label.includes("choose an action")) {
            const who = label.slice(0, label.indexOf(" (Ally"))
            if (this.done) throw new StopScript()
            // an ultimate fires as soon as it's next in its unit's queue and ready, whoever's turn it is
            idx = this.readyUlt(options)
            if (idx < 0) {
                const q = this.queues.get(who)
                const next = q?.[0]
                if (!next || next.act === "ult") {
                    // a helper, a unit whose own steps are done, or one waiting for its ultimate: its fixed action
                    const act = this.helpers[who] ?? "basic"
                    this.current = { who, act, target: next?.target }
                    idx = act === "skill" ? options.findIndex(o => o.startsWith("Battle Skill (")) : -1
                    if (idx < 0) idx = options.findIndex(o => o === "Basic Attack")
                } else {
                    this.current = q!.shift()
                    if (next.act === "skill") idx = options.findIndex(o => o.startsWith("Battle Skill ("))
                    else if (next.act === "basic") idx = options.findIndex(o => o === "Basic Attack")
                    else if (next.act.startsWith("step")) idx = options.findIndex(o => o.startsWith(`Battle Skill Step ${next.act.slice(4)}:`))
                    if (idx < 0) { this.error = `${who}: "${next.act}" is not offered (${options.join(" | ")})`; throw new StopScript() }
                }
            }
        } else if (label.includes("target on the enemies")) {
            const t = this.current?.target ?? 2
            idx = options.findIndex(o => o.endsWith(`(Enemy ${t})`))
            if (idx < 0) idx = 0
        } else if (label.includes("target on the allies")) {
            const f = this.current?.friend ?? this.current?.who
            idx = Math.max(0, options.findIndex(o => o.startsWith(`${f} (`)))
        } else {
            this.error = `unexpected decision: ${label}`
            throw new StopScript()
        }
        this.log.push(`${label} -> ${options[idx]}`)
        return idx
    }
}
class StopScript extends Error {}

export function userKioku(chars: any[], name: string): { kioku: PvPKioku, build: string } {
    const c = chars.find(x => x.name === name)
    if (!c) throw new Error(`${name} is not in the team file`)
    const info: any = (kiokuData as any)[name]
    const ch: any = correctCharacterParams({ ...c, ...Object.fromEntries(Object.entries(info).filter(([k]) => !(k in c))) })
    const crys = Object.entries(ch.crysOptions ?? {}).filter(([, v]: any) => v.useIndex > 0)
    const kioku = new PvPKioku({ ...ch, crysIDs: crys.map(x => Number(x[0])), subCrysIDs: crys.flatMap((x: any) => x[1].subCrys), supportKey: undefined } as any)
    const build = `Lv${ch.kiokuLvl} magic ${ch.magicLvl} heartphial ${ch.heartphialLvl} A${ch.ascension} Ult ${ch.specialLvl}` +
        `${ch.portrait ? `, portrait "${ch.portrait}"` : ", no portrait"}${crys.length ? `, crystalis ${crys.map(x => (crystalises as any)[x[0]]?.name ?? x[0]).join(", ")}` : ""}`
    return { kioku, build }
}

export interface Entry {
    actor: string, ally: boolean, skill: string
    hits: { target: string, values: number[], crit: boolean[] }[]
    after: string               // ally HP / MP, SP, enemy break gauges after the action
}
export interface Run { entries: Entry[], error?: string }

export function runCheck(chars: any[], ck: Check, crit: boolean): Run {
    const allies = ck.party.map(n => userKioku(chars, n).kioku)
    const rng = new ScriptRng(crit, ck.steps, ck.party, ck.helpers)
    const entries: Entry[] = []
    let director: any
    const units = (team: number) => [...director.battleUnitBundle.dic.values()].filter((x: any) => x._Team === team)
    const names = (id: number) => {
        const u = director.battleUnitBundle.dic.get(id)
        if (!u) return `#${id}`
        const pos = units(u._Team).indexOf(u)
        return u._Team === 0 ? ck.party[pos] ?? `Ally ${pos + 1}` : `Enemy ${pos + 1}`
    }
    let battle: EngineBattle | undefined
    try {
        battle = new EngineBattle({ kind: "quest", allies: allies as any, stageId: STAGE[ck.stage] }, {
            rng, manualTargeting: true,
            onSetup: d => {
                director = d
                d.commandSender.Subscribe({ IObserver$OnNext: (cmds: any[]) => {
                    for (const c of cmds) {
                        if (!(c instanceof E.CommandSkill)) continue
                        const hits = new Map<string, { target: string, values: number[], crit: boolean[] }>()
                        for (const n of c._AffectedUnitNoticeList ?? []) {
                            for (const dmg of n.Damages ?? []) {
                                if (dmg._IsBarrierDamage) continue
                                const t = names(n._AffectedUnitId)
                                const e = hits.get(t) ?? hits.set(t, { target: t, values: [], crit: [] }).get(t)!
                                e.values.push(dmg._DamageValue); e.crit.push(dmg._IsCritical)
                            }
                        }
                        const u = director.battleUnitBundle.dic.get(c._ActUnitId)
                        const al = units(0).map((x: any) => `${Math.max(0, x._HP)} HP ${x.EP}/${x.MaxEP} MP`).join(", ")
                        const en = units(1).map((x: any) => x._BreakPoint.IsBreak ? "BROKEN" : `${x._BreakPoint._PointValue}`).join("/")
                        entries.push({ actor: names(c._ActUnitId), ally: !!u && u._Team === 0, skill: skillName(c._SkillMstId) || "follow-up attack", hits: [...hits.values()],
                            after: `allies ${al}; SP ${director.spReferee.allySp}; enemy break gauge ${en}` })
                    }
                } })
            },
        })
        for (let n = 0; n < 80 && !battle.isOver; n++) {
            battle.executeNextAction()
            if (rng.done) {
                // finish the last scripted action, then stop at the next decision
                try { for (let k = 0; k < 20 && !battle.isOver; k++) battle.executeNextAction() } catch (e) { if (!(e instanceof StopScript)) throw e }
                break
            }
        }
    } catch (e) {
        if (!(e instanceof StopScript)) return { entries, error: (e as Error).stack?.split("\n").slice(0, 3).join(" ") }
    }
    // the enemies' actions after the last scripted one are not part of the check
    let last = entries.length - 1
    while (last >= 0 && !entries[last].ally) last--
    entries.length = last + 1
    return { entries, error: rng.error ?? (rng.done ? undefined : battle?.isOver ? `battle over (${battle.result}) before the script ended` : "script not finished") }
}

// ---- CLI
const fmtHits = (h: Entry["hits"][number]) => h.values.length === 1 ? `${h.values[0]}` : `${h.values.join(" + ")} = ${h.values.reduce((a, b) => a + b, 0)}`

export function describe(chars: any[], ck: Check): { text: string, error?: string, normal: Run, crits: Run } {
    const normal = runCheck(chars, ck, false), crits = runCheck(chars, ck, true)
    const out: string[] = []
    const error = normal.error ?? crits.error
    // crit numbers: the same ally action in the all-crits run (enemy actions may differ between the runs)
    const critAlly = crits.entries.filter(e => e.ally)
    let k = 0
    for (const e of normal.entries) {
        if (!e.ally) { out.push(`- ${e.actor}: ${e.skill}`); continue }
        const c = critAlly[k++]
        const tested = ck.steps.some(s => s.who === e.actor)
        out.push(`- ${tested ? `**${e.actor}: ${e.skill}**` : `${e.actor}: ${e.skill}`}${e.hits.length ? "" : " (no damage)"}`)
        for (const h of e.hits) {
            const ch = c && c.actor === e.actor && c.skill === e.skill ? c.hits.find(x => x.target === h.target) : undefined
            out.push(`    - ${h.target}: ${fmtHits(h)}${ch ? ` (crit: ${fmtHits(ch)})` : ""}`)
        }
        if (process.env.VERBOSE) out.push(`    - _after: ${e.after}_`)
    }
    const allyOrder = (r: Run) => r.entries.filter(e => e.ally).map(e => `${e.actor}: ${e.skill}`).join(" → ")
    if (allyOrder(normal) !== allyOrder(crits)) out.push(`- _with crits the allies act differently: ${allyOrder(crits)}_`)
    return { text: out.join("\n"), error, normal, crits }
}

if (process.argv[1]?.endsWith("ingameChecks.ts")) {
    const args = process.argv.slice(2)
    const file = args[0]
    const out = args.find(a => a.endsWith(".md"))
    const only = args.indexOf("--only") >= 0 ? args[args.indexOf("--only") + 1].split(",").map(s => s.trim()) : undefined
    const chars = JSON.parse(fs.readFileSync(file, "utf8"))
    const { CHECKS } = await import("./ingameChecksList")
    const md: string[] = []
    const json: any[] = []
    for (const ck of CHECKS.filter(c => !only || only.includes(c.name))) {
        const { text, error, normal, crits } = describe(chars, ck)
        json.push({ ...ck, builds: Object.fromEntries(ck.party.map(n => [n, userKioku(chars, n).build])), error, normal: normal.entries, crits: crits.entries.filter(e => e.ally) })
        md.push(`## ${ck.name}`, "", ck.what, "", `Stage: Crystalis Quest: ${ck.stage} (Extra). Party: ${ck.party.map(n => `${n} (${userKioku(chars, n).build})`).join("; ")}.`, "",
            `Actions: ${ck.steps.map(s => `${s.who} ${s.act === "skill" ? "Battle Skill" : s.act === "basic" ? "Basic Attack" : s.act === "ult" ? "Ultimate" : s.act}${s.target ? ` → Enemy ${s.target}` : ""}`).join(", then ")}.`, "",
            text, "", ...(error ? [`> ⚠ ${error}`, ""] : []), ...(ck.expect ? [`Old model: ${ck.expect}`, ""] : []))
        console.log(md.slice(-12).join("\n"))
    }
    const intro = [
        "# In-game checks: old model vs 1:1 engine", "",
        `Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} by \`npx tsx scripts/sim/ingameChecks.ts <team.json>\` from the Team page export.`, "",
        "How to run a check:", "",
        "- Enter the listed Crystalis Quest (Extra) with only the listed party (no supports; builds as in the team file: level, magic, heartphial, ascension, ultimate level, portrait and crystalis).",
        "- Do the listed ally actions in order. The enemies act on their own; the list shows the order the engine expects, so you can tell if the game diverged.",
        "- Enemy 2 is the middle one (140,000 HP, \"Increases stats with each passing turn\"). Enemies 1 and 3 are the outer ones (160,000 HP); Enemy 3 acts first, Enemy 1 second.",
        "- Each hit shows its non-crit number and, in brackets, the number if it crits. Multi-hit skills list every hit; random-target extra hits (Tiro Finale Liberation) land on random enemies, so only the per-hit value is fixed.",
        "- Enemy crits are off and every chance-based effect is assumed to land; if an enemy crit kills someone or a debuff misses, restart.", "",
    ]
    if (out) fs.writeFileSync(out, [...intro, ...md].join("\n"))
    if (out) fs.writeFileSync(out.replace(/\.md$/, ".json"), JSON.stringify(json, null, 1))
}
