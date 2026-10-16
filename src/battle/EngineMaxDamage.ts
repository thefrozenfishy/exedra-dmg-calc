// App side (not game code): the PvE page's "theoretical max damage" on the 1:1 engine (src/engine).
//
// Same result shape as models/MaxDamage.ts (computeMaxDamage), so the page only swaps the function:
// - the team's effect list (collectTeamEffects: every buff/debuff of every member's skills, passives, switch skills and
//   follow-ups, ladders of mutually exclusive states, exclusions and stack overrides from the UI) is unchanged;
// - everything else is the game's code: each evaluation builds the stage's battle (SetupBattleStage, WaveTransition to
//   the wave), removes what the team gave at battle start and the team's passive skills (they are re-added below with
//   their conditions met, and must not trigger a second time), gives every listed effect through the game's own
//   AbilityEffectLauncher (buff strength, role / element filters, duplicates and stacking as in battle), and launches
//   the dealer's skill with ActiveSkillBase.Triggering (damage rows, additional damage, final damage, break bonus).
//
// "Conditions met": the effects' start and active conditions are cleared, except a state's ActorSkillType restriction
// ("Ultimate DMG +30%" counts for the Ultimate column only). Alternatives that exclude each other count once, the
// strongest: state ladders (collectTeamEffects tiers, as before) and, inside the evaluated skill, damage rows whose start
// conditions exclude each other (every choice is evaluated, the largest total is kept).
//
// Random draws: crits forced on / off (avg = the per-enemy blend with the engine's own crit chance), every effect lands,
// random targets go to the main target. Enemy HP is set out of reach so nothing dies mid-skill.
import { E } from "./engineBundle"
import { EngineBattle, type EngineBattleSetup } from "./EngineBattle"
import { giveFieldState } from "./EngineBench"
import { collectTeamEffects, isEffectValueType, type MaxDmgEffect, type MaxDmgOptions, type MaxDmgResult, type MemberDamage, type SkillDamage } from "../models/MaxDamage"
import { actorSkillTypeRestriction, ailmentConditionsMet } from "../models/BattleConditionParser"
import { conditionCsvsExclusive } from "../models/ConditionTiers"
import { enemyName, isMultiRaidStage, isSoloRaidStage, type QuestEnemyAppearance } from "../models/PvE"
import type { PvPKioku } from "../models/PvPKioku"
import { TargetType, type SkillDetail } from "../types/KiokuTypes"

const ORIGIN_ACTIVE = 1, ORIGIN_PASSIVE = 2
const OUT_OF_REACH_HP = 2_000_000_000
const MAX_COMBOS = 32

export interface EngineMaxDmgStage { stageId: number, waveIdx: number }

/** RandomHook for one evaluation: crits as asked, every effect lands, random targets = the main target. */
class MaxDamageRandom {
    crit: boolean
    mainId: number
    constructor(crit: boolean, mainId: number) {
        this.crit = crit
        this.mainId = mainId
    }
    readonly hook = {
        chance: (probability: number, kind: string): boolean => kind === "crit" ? this.crit : kind === "effect" ? true : probability >= 50,
        choose: (weights: readonly number[], _kind: string, _subject: readonly unknown[], options: readonly unknown[]): number => {
            const i = options.findIndex(o => (o as any)?._Id === this.mainId)
            if (i >= 0) return i
            let best = 0
            weights.forEach((w, k) => { if (w > weights[best]) best = k })
            return best
        },
        guidKey: (): number => 0,
    }
    run<T>(fn: () => T): T {
        const R = E.GameRandom
        const saved = R.hook
        R.hook = this.hook
        try { return fn() } finally { R.hook = saved }
    }
}

/** ActorSkillType name of an engine skill object (BattleCondition ACTOR_SKILL_TYPE values). */
function actorSkillTypeOf(skill: any): string {
    if (skill instanceof E.SpecialAttack) return "SpecialAttack"
    if (skill instanceof E.NormalAttack) return "NormalAttack"
    if (skill instanceof E.AdditionalSkill) return skill.skillType === 5 ? "EtherBlow" : "AdditionalSkill"
    return "ActiveSkill"
}
const TARGET_TYPE_OF: Record<string, TargetType> = {
    SpecialAttack: TargetType.specialId, ActiveSkill: TargetType.skillId, NormalAttack: TargetType.attackId,
    AdditionalSkill: TargetType.fuaId, EtherBlow: TargetType.fuaId,
}
const LABEL_OF: Record<string, string> = { SpecialAttack: "Ultimate", ActiveSkill: "Battle Skill", NormalAttack: "Basic Attack" }

/** AbilitySourceType of a kit passive by the effect list's origin label (adapter/NetworkUnits.ts). */
const PASSIVE_SOURCE: Record<string, number> = { Crystalis: 4, Portrait: 2, Support: 3 }

const isPassiveDetail = (d: SkillDetail) => "passiveSkillDetailMstId" in d

/** AbilityEffectInfo of a team effect with its start / active conditions cleared. */
function infoOf(e: MaxDmgEffect): any {
    const d: any = e.detail
    let info: any
    if (isPassiveDetail(e.detail)) {
        const model = E.BattleMstReaderBase.get_Instance(E.PassiveSkillDetailMstModel).GetModelByKey(d.passiveSkillDetailMstId)
        if (model == null) return null
        info = E.AbilityEffectInfo.CreateFromMst$PassiveSkillDetailMstModel_AbilitySourceType_string(model, PASSIVE_SOURCE[e.source] ?? 1, null)
    } else {
        const model = E.BattleMstReaderBase.get_Instance(E.SkillDetailMstModel).GetModelByKey(d.skillDetailMstId)
        if (model == null) return null
        info = E.AbilityEffectInfo.CreateFromMst$SkillDetailMstModel_int(model, 0)
    }
    return info
}

/** An ability effect object with its conditions met: its start condition list and its state's active condition list
 *  empty (both are parsed from the csv on first use, so an empty list = no conditions). The csv strings stay: the game
 *  also compares them, e.g. two states replace each other only with the same active-condition csv
 *  (UnitCondition.GetDuplicateUnitState b__1), so "ATK +30% (while X)" and "ATK +15%" still coexist as in battle. */
function clearConditions(effect: any): void {
    effect.startConditionSetList = []
    const state = effect._GiveUnitState
    if (state) state.activeConditionSetList = []
}

interface Built { d: any, dic: Map<number, any>, allies: any[], enemies: (any | undefined)[], main: any, dealer: any }

interface Ctx {
    setup: EngineBattleSetup
    waveIdx: number
    enemyApps: QuestEnemyAppearance[]
    opts: MaxDmgOptions
    mainIdx: number
}

/** The stage's battle at the wave's start with the team's own effects removed. */
function buildBattle(ctx: Ctx, dealerPos: number, rnd: MaxDamageRandom): Built {
    const d = EngineBattle.createDirector(ctx.setup)
    for (let w = 0; w < ctx.waveIdx; w++) d.WaveTransition()
    const bundle = d.battleUnitBundle
    const dic: Map<number, any> = bundle.dic
    const allies = [...bundle.allyList].sort((a: any, b: any) => a._PositionId - b._PositionId)
    const enemyUnits = [...bundle.enemyList].sort((a: any, b: any) => a._PositionId - b._PositionId)
    // the page's wave list -> engine units (same appearance, in order)
    const pool = [...enemyUnits]
    const enemies = ctx.enemyApps.map(a => {
        const i = pool.findIndex(u => u._BattleParameter?._QuestEnemyAppearanceMstId === a.questEnemyAppearanceMstId)
        return i >= 0 ? pool.splice(i, 1)[0] : undefined
    })
    // what the team gave at battle start goes; the team's passives are re-added below with their conditions met
    const allyIds = new Set(allies.map((u: any) => u._Id))
    for (const u of dic.values()) u._Condition._StateList = u._Condition._StateList.filter((s: any) => !allyIds.has(s._UserUnitId))
    for (const u of allies) u._PassiveSkills = []
    // nothing dies mid-skill
    for (const u of enemyUnits) u._HP = OUT_OF_REACH_HP
    const link = d.linkHpReferee
    if (link && link.maxLinkHp > 0) { link.maxLinkHp = OUT_OF_REACH_HP; link.currentLinkHp = OUT_OF_REACH_HP }
    ctx.enemyApps.forEach((_, i) => {
        const u = enemies[i]
        if (!u || !ctx.opts.broken?.[i] || !u._BreakPoint.get_HasBreakPoint()) return
        u._BreakPoint._PointValue = 0
        u._BreakedDamageReceiveRate = ctx.opts.breakRate?.[i] ?? Math.trunc(u._BattleParameter._MaxBreakedDamageReceiveRate / 10)
    })
    // the stage's own states (app tools): buff-strength cuts last, so they don't scale the other stage states
    const field = ctx.opts.fieldStates ?? []
    for (const f of [...field.filter(f => !isEffectValueType(f.type)), ...field.filter(f => isEffectValueType(f.type))]) {
        const holders = f.side === "ally" ? (f.index === "all" ? allies : [allies[f.index]]) : (f.index === "all" ? enemies : [enemies[f.index]])
        for (const u of holders) if (u) giveFieldState(d, u, f.type, f.value1)
    }
    const main = enemies[ctx.mainIdx] ?? enemies.find(Boolean) ?? enemyUnits[0]
    rnd.mainId = main?._Id ?? 0
    return { d, dic, allies, enemies, main, dealer: allies[dealerPos] }
}

/** Buff strength the caster applies to `effect`'s state (StateAbilityEffect.ChangeGiveUnitState), 1 = none. */
function effectValueRate(caster: any, effect: any): number {
    const state = effect?._GiveUnitState
    // StateAbilityEffect.Triggering: only AbilitySource 1 (the unit's own kit) goes through ChangeGiveUnitState
    if (!state || effect._AbilitySource !== 1 || !E.isImpl(state, "IHasUpdateableEffectValue")) return 1
    let rate = 0
    for (const s of caster._Condition._StateList) {
        if (E.isImpl(s, "IEffectValueVariation") && s.IsActive$BattleUnit(caster)) rate += s.GetEffectValueVariationRate(state)
    }
    return Math.max(0, rate + 1)
}

/** Gives the listed team effects (conditions met). Returns where each landed (for the UI). */
function giveEffects(b: Built, list: Given): Map<string, { dealer: boolean, enemies: number[], rate: number }> {
    const reach = new Map<string, { dealer: boolean, enemies: number[], rate: number }>()
    // buff / debuff strength first: it scales every state its holder gives afterwards
    const ordered = [...list.filter(x => isEffectValueType(x.e.detail.abilityEffectType)), ...list.filter(x => !isEffectValueType(x.e.detail.abilityEffectType))]
    for (const { e, stacks, copies } of ordered) {
        const caster = b.allies[e.casterPos]
        if (!caster) continue
        const info = infoOf(e)
        if (!info) continue
        const origin = isPassiveDetail(e.detail) ? ORIGIN_PASSIVE : ORIGIN_ACTIVE
        let rate = 1
        // every equipped copy of a crystalis is its own passive (the effect list merges them into one row)
        for (let n = 0; n < stacks * (copies ?? 1); n++) {
            const effect = E.AbilityEffectFactory.Create(info, false)
            if (!effect) break
            clearConditions(effect)
            if (n === 0) rate = effectValueRate(caster, effect)
            const check = new E.BattleConditionUtils_ConditionCheckDataBundle().ctor()
            check._GameDirector = b.d
            check._SelfUnit = caster
            check._ActorUnit = caster
            check._MainTargetUnit = b.main
            E.AbilityEffectLauncher.Triggering$10([effect], 0, check, origin, caster, b.dic, b.d, null, b.main?._Id ?? 0, b.dealer._Id)
        }
        const has = (u: any) => !!u && u._Condition._StateList.some((s: any) => s._MstId === info._MstId && s._UserUnitId === caster._Id)
        reach.set(e.key, { dealer: has(b.dealer), enemies: b.enemies.map((u, i) => has(u) ? i : -1).filter(i => i >= 0), rate })
    }
    for (const u of b.dic.values()) u.UpdateParameter?.()
    return reach
}

/** Skill objects of the dealer by column. */
function dealerSkills(dealer: any): { base: any[], switches: any[], followUps: any[] } {
    const set = dealer._SkillSet
    const base = [set._SpecialAttack, ...(set._ActiveSkills ?? []).slice(0, 1), set._NormalAttack].filter(Boolean)
    return { base, switches: [...(set._SwitchableSkills ?? [])], followUps: [...(set._AdditionalSkills ?? [])] }
}

/** Ladders of the skill's own effects whose start conditions exclude each other (indexes into the effect list). */
function skillLadders(effects: any[]): number[][] {
    const ladders: number[][] = []
    effects.forEach((eff, i) => {
        const csv = eff._StartConditionSetIdCsv
        if (!csv) return
        const ladder = ladders.find(l => l.every(j => conditionCsvsExclusive(effects[j]._StartConditionSetIdCsv, csv)))
        if (ladder) ladder.push(i)
        else ladders.push([i])
    })
    return ladders.filter(l => l.length > 1)
}

function* combos(ladders: number[][]): Generator<number[]> {
    // one chosen index per ladder
    const idx = ladders.map(() => 0)
    for (let n = 0; n < MAX_COMBOS; n++) {
        yield ladders.map((l, k) => l[idx[k]])
        let k = 0
        while (k < ladders.length) {
            idx[k]++
            if (idx[k] < ladders[k].length) break
            idx[k] = 0
            k++
        }
        if (k === ladders.length) return
    }
}

type SkillPick = (dealer: any) => any

interface Eval { perEnemy: { normal: number, crit: number, avg: number }[], critChance: number }

/**
 * One evaluation: fresh battle, team effects (those allowed for this skill type), the skill launched once.
 * `keep(i)` says which of the skill's own effects stay (ladder choice). Returns per enemy damage and crit chance.
 */
export const RUNS = { n: 0 }
function runOnce(ctx: Ctx, dealerPos: number, pick: SkillPick, crit: boolean, effects: { e: MaxDmgEffect, stacks: number }[],
    keep: (i: number) => boolean): { damage: number[], p: number[], mainP: number } | undefined {
    RUNS.n++
    const rnd = new MaxDamageRandom(crit, 0)
    return rnd.run(() => {
        const b = buildBattle(ctx, dealerPos, rnd)
        if (!b.dealer) return undefined
        const skill = pick(b.dealer)
        if (!skill) return undefined
        const type = actorSkillTypeOf(skill)
        const allowed = effects.filter(({ e }) => { const r = actorSkillTypeRestriction(e.detail.activeConditionSetIdCsv); return !r || r.has(type) })
        giveEffects(b, allowed)
        const list: any[] = skill.launcher._AbilityEffectList
        const own = list.filter((eff: any, i: number) => {
            if (!keep(i)) return false
            const r = actorSkillTypeRestriction(eff._ActiveConditionSetIdCsv)
            if (r && !r.has(type)) return false
            if (ctx.opts.enemyStates && !ailmentConditionsMet([eff._StartConditionSetIdCsv, eff._ActiveConditionSetIdCsv], ctx.opts.enemyStates, ctx.enemyApps.length)) return false
            return true
        })
        own.forEach(clearConditions)
        skill.launcher._AbilityEffectList = own
        const p = b.enemies.map(u => u ? Math.min(1, Math.max(0, (b.dealer.GetProcessedCtr() + u.GetProcessedRcvCtr(b.dealer)) / 100)) : 0)
        const mainP = b.main ? b.dealer.GetProcessedCtr() + b.main.GetProcessedRcvCtr(b.dealer) : 0
        const notices = skill.Triggering(b.d, b.main?._Id ?? 0, b.dealer, b.dealer._Id).GetNoticeList()
        const damage = b.enemies.map(() => 0)
        for (const n of notices) {
            const i = b.enemies.findIndex(u => u && u._Id === n.AffectedUnitId)
            if (i < 0) continue
            for (const x of [...(n.Damages ?? []), ...(n.BarrierDamages ?? [])]) damage[i] += x._DamageValue
        }
        return { damage, p, mainP }
    })
}

type Given = { e: MaxDmgEffect, stacks: number, copies?: number }[]
type Run = NonNullable<ReturnType<typeof runOnce>>
const sumOf = (r: Run) => r.damage.reduce((s, x) => s + x, 0)

/** The skill's own effects (of a skill object that was never launched), or undefined when it deals no damage. */
function probeSkill(skill: any): any[] | undefined {
    const probe = skill ? [...skill.launcher._AbilityEffectList] : undefined
    if (!probe || !probe.some((eff: any) => eff instanceof E.DamageAbilityEffectBase)) return undefined
    return probe
}

/** The skill's best crit run with `effects`: its own rows whose start conditions exclude each other count one at a time,
 *  every choice is run and the largest total is kept. */
function bestCrit(ctx: Ctx, dealerPos: number, pick: SkillPick, probe: any[], effects: Given): { keep: (i: number) => boolean, crit: Run } | undefined {
    const ladders = skillLadders(probe)
    const inLadder = new Set(ladders.flat())
    let best: { keep: (i: number) => boolean, crit: Run } | undefined
    for (const choice of combos(ladders)) {
        const chosen = new Set(choice)
        const keep = (i: number) => !inLadder.has(i) || chosen.has(i)
        const crit = runOnce(ctx, dealerPos, pick, true, effects, keep)
        if (!crit) continue
        if (!best || sumOf(crit) > sumOf(best.crit)) best = { keep, crit }
    }
    return best
}

/** Rungs worth trying. Rungs of one kind (same effect type, range, role, element, skill-type restriction and start /
 *  active conditions apart from the tier ones) differ only in strength, and damage is monotonic in an effect's strength
 *  (up or down), so the best one is the strongest or the weakest; the rest need a run each. */
function candidateRungs(l: Given): number[] {
    const d0 = l[0].e.detail
    const kind = (x: Given[number]) => {
        const d = x.e.detail
        return [d.abilityEffectType, d.range, d.role ?? 0, d.element ?? 0, [...(actorSkillTypeRestriction(d.activeConditionSetIdCsv) ?? [])].sort().join(), x.e.side, x.e.casterPos].join("|")
    }
    const strength = (x: Given[number]) => Math.abs(x.e.detail.value1 ?? 0) * x.stacks * (x.copies ?? 1)
    if (l.every(x => kind(x) === kind(l[0]))) {
        const s = l.map(strength)
        const weakest = s.indexOf(Math.min(...s)), strongest = s.indexOf(Math.max(...s))
        void d0
        return s[weakest] === s[strongest] ? [] : [...new Set([strongest, weakest])]
    }
    return l.map((_, i) => i)
}

/**
 * The column's maximum over the team's effect ladders (MaxDmgEffect.tier: rungs that cannot count together): one rung per
 * ladder, chosen by coordinate ascent on the crit total (start: the strongest rung by value, then each ladder tries its
 * other rungs while that raises the total). `base` = every other effect.
 */
function evaluateSkill(ctx: Ctx, dealerPos: number, pick: SkillPick, probe: any[] | undefined, base: Given, ladders: Given[]): (Eval & { rungs: string[] }) | undefined {
    if (!probe) return undefined
    const choice = ladders.map(() => 0)
    const given = () => [...base, ...ladders.map((l, k) => l[choice[k]])]
    let best = bestCrit(ctx, dealerPos, pick, probe, given())
    if (!best) return undefined
    for (let pass = 0, improved = true; improved && pass < 4; pass++) {
        improved = false
        ladders.forEach((l, k) => {
            const was = choice[k]
            for (const r of candidateRungs(l)) {
                if (r === choice[k]) continue
                const keep = choice[k]
                choice[k] = r
                const run = bestCrit(ctx, dealerPos, pick, probe, given())
                if (run && sumOf(run.crit) > sumOf(best!.crit)) best = run
                else choice[k] = keep
            }
            if (choice[k] !== was) improved = true
        })
    }
    const effects = given()
    const normal = runOnce(ctx, dealerPos, pick, false, effects, best.keep)
    if (!normal) return undefined
    const perEnemy = best.crit.damage.map((c, i) => {
        const n = normal.damage[i], p = normal.p[i]
        return { normal: n, crit: c, avg: Math.round(n * (1 - p) + c * p) }
    })
    return { perEnemy, critChance: normal.mainP, rungs: ladders.map((l, k) => l[choice[k]].e.key) }
}

const strongest = (list: (SkillDamage | undefined)[]) => list.reduce<SkillDamage | undefined>((b, s) => s && (!b || s.total.crit > b.total.crit) ? s : b, undefined)

function skillDamage(ev: Eval & { rungs?: string[] }, type: TargetType, label: string, name?: string, note?: string): SkillDamage {
    const total = ev.perEnemy.reduce((s, x) => ({ normal: s.normal + x.normal, crit: s.crit + x.crit, avg: s.avg + x.avg }), { normal: 0, crit: 0, avg: 0 })
    const out: SkillDamage = { type, label, name, note, perEnemy: ev.perEnemy, total, critChance: ev.critChance }
    if (ev.rungs) Object.defineProperty(out, "_rungs", { value: ev.rungs, enumerable: false, configurable: true })
    return out
}

/** computeMaxDamage (models/MaxDamage.ts) on the 1:1 engine; `enemies` = the page's wave list (index order of the result). */
export function computeMaxDamageEngine(allies: PvPKioku[], stage: EngineMaxDmgStage, enemies: QuestEnemyAppearance[], attackerPos: number, opts: MaxDmgOptions = {}): MaxDmgResult {
    const setup: EngineBattleSetup = isMultiRaidStage(stage.stageId) ? { kind: "multiRaid", allies, stageId: stage.stageId, noRoundLimit: true } : isSoloRaidStage(stage.stageId)
        ? { kind: "soloRaid", allies, stageId: stage.stageId, noRoundLimit: true }
        : { kind: "quest", allies, stageId: stage.stageId }
    const mainIdx = Math.min(Math.max(0, opts.mainTargetIdx ?? 0), Math.max(0, enemies.length - 1))
    const ctx: Ctx = { setup, waveIdx: stage.waveIdx, enemyApps: enemies, opts, mainIdx }
    const effects = collectTeamEffects(allies, attackerPos)
    const members: MemberDamage[] = []
    let enemySummary: MaxDmgResult["enemies"] = []

    for (let pos = 0; pos < allies.length; pos++) {
        if (opts.onlyPos !== undefined && pos !== opts.onlyPos) {
            members.push({ pos, name: allies[pos].name, skills: [], best: undefined })
            continue
        }
        const passEffects = pos === attackerPos ? effects : collectTeamEffects(allies, pos)
        const stacksOf = (e: MaxDmgEffect) => opts.excluded?.has(e.key) ? 0 : Math.max(0, Math.min(e.maxStacks, opts.stacks?.get(e.key) ?? e.maxStacks))
        const ailmentsOk = (d: SkillDetail) => !opts.enemyStates
            || ailmentConditionsMet([d.startConditionSetIdCsv, d.activeConditionSetIdCsv], opts.enemyStates, enemies.length)
        // Effects that count, and ladders of rungs that cannot count together (one rung each, chosen per column).
        const base: Given = []
        const ladderOf = new Map<string, Given>()
        for (const e of passEffects) {
            if (pos === attackerPos) { e.tierUsed = undefined; e.reach = undefined; e.rate = undefined }
            const stacks = stacksOf(e)
            if (!stacks || !ailmentsOk(e.detail) || !e.applies) continue
            const copies = e.source === "Crystalis" ? Math.max(1, ((allies[e.casterPos] as any).crys as number[] ?? []).filter(c => c === (e.detail as any).passiveSkillMstId).length) : 1
            if (e.tier) ladderOf.set(e.tier.group, [...(ladderOf.get(e.tier.group) ?? []), { e, stacks, copies }])
            else base.push({ e, stacks, copies })
        }
        const ladders = [...ladderOf.values()].map(l => l.sort((a, b) => a.e.tier!.rank - b.e.tier!.rank))
        const pickers = new MaxDamageRandom(false, 0).run(() => {
            const b = buildBattle(ctx, pos, new MaxDamageRandom(false, 0))
            if (!enemySummary.length) enemySummary = enemies.map((a, i) => {
                const u = b.enemies[i]
                const canBreak = !!u && u._BreakPoint.get_HasBreakPoint()
                const broken = !!u && u._BreakPoint.get_IsBreak()
                return {
                    name: enemyName(a), hp: u?._MaxHP ?? a.hp, def: u?._BattleParameter?._DEF ?? a.def, broken,
                    breakRate: broken ? u._BreakedDamageReceiveRate : 100, canBreak,
                }
            })
            if (!b.dealer) return undefined
            const s = dealerSkills(b.dealer)
            const byId = (id: number) => (dealer: any) => dealer._SkillSet.GetSkill(id)
            const of = (sk: any) => ({ pick: byId(sk._Id), type: actorSkillTypeOf(sk), name: sk._Name, probe: probeSkill(sk) })
            return { base: s.base.map(of), switches: s.switches.map(of), followUps: s.followUps.map(of) }
        })
        if (!pickers) { members.push({ pos, name: allies[pos].name, skills: [], best: undefined }); continue }
        const run = ({ pick, probe }: { pick: SkillPick, probe: any[] | undefined }) => {
            try { return evaluateSkill(ctx, pos, pick, probe, base, ladders) } catch (err) { console.warn("Max damage (engine):", err); return undefined }
        }
        const skills: SkillDamage[] = []
        pickers.base.forEach(p => {
            const ev = run(p)
            if (ev) skills.push(skillDamage(ev, TARGET_TYPE_OF[p.type], LABEL_OF[p.type] ?? p.type))
        })
        const switchSkill = strongest(pickers.switches.map(p => {
            const ev = run(p)
            return ev ? skillDamage(ev, TARGET_TYPE_OF[p.type], "Switch Skill", p.name || undefined, `replaces ${LABEL_OF[p.type] ?? p.type}`) : undefined
        }))
        const followUp = strongest(pickers.followUps.map(p => {
            const ev = run(p)
            return ev ? skillDamage(ev, TargetType.fuaId, "Follow-up", p.name || undefined, p.type === "EtherBlow" ? "Ether Blow" : "Follow-up") : undefined
        }))
        const best = strongest([...skills, switchSkill])
        if (pos === attackerPos) {
            // UI bookkeeping, for the rungs the dealer's best column used: where each effect landed (every skill type
            // allowed), its strength rate, and which rungs were left out for another one
            const rungs = new Set((best as any)?._rungs ?? ladders.map(l => l[0].e.key))
            for (const l of ladders) for (const { e } of l) if (!rungs.has(e.key)) e.tierUsed = l.find(x => rungs.has(x.e.key))?.e.key
            const given = [...base, ...ladders.flatMap(l => l.filter(x => rungs.has(x.e.key)))]
            new MaxDamageRandom(false, 0).run(() => {
                const b = buildBattle(ctx, pos, new MaxDamageRandom(false, 0))
                if (!b.dealer) return
                const reach = giveEffects(b, given)
                for (const e of passEffects) {
                    const x = reach.get(e.key)
                    if (!x) continue
                    e.reach = e.side === "ally" ? { dealer: x.dealer, enemies: [] } : { dealer: false, enemies: x.enemies }
                    e.rate = x.rate
                }
            })
        }
        for (const s_ of [...skills, switchSkill, followUp]) if (s_) delete (s_ as any)._rungs
        members.push({ pos, name: allies[pos].name, skills, best, switchSkill, followUp })
    }
    return { effects, members, enemies: enemySummary }
}
