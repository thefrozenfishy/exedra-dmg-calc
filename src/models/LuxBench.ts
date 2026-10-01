// Lux bench: how much a character changes a damage dealer's output, measured with the battle engine, with
// Lux☆Magica as the blank slate (beta charts on the Kioku Grid page).
//
// The setup mirrors the legacy Kioku Grid charts: enemies with 3000 DEF, weak to every element and broken at a
// 500% damage-taken rate, and a team of Lux plus the character being measured. Unlike the legacy charts the
// numbers come from the battle engine itself:
//   - ultimateDamage: the dealer's Ultimate through the engine's damage formula, with every buff/debuff of the
//     team active at full stacks (MaxDamage.computeMaxDamage), every hit a crit ("Max Burst").
//   - simulatedDealerDamage: an auto battle played for a fixed amount of action value (AV), counting only the
//     damage the dealer itself deals ("Average Damage"). The rest of the team's damage is ignored, so a support
//     that also hits hard doesn't count, only what it changes about the dealer.
// The dummies have SPD 1, so they never get a turn within the run: they don't attack, and (broken units only
// recover at their own turn start) they stay broken throughout.
import breakMstJson from "../assets/base_data/getBreakMstList.json";
import { PvPKioku } from "./PvPKioku";
import { PvPTeam, type KiokuState } from "./PvPTeam";
import { PvPBattle } from "./PvPBattle";
import { computeMaxDamage } from "./MaxDamage";
import { enemyKiokus } from "./PvEBattle";
import { BattleType } from "./DamageCalculator";
import { BattleRng, type RngKind, type RngMode } from "./BattleRng";
import { seededRng } from "./BattleMath";
import { unitTypeConditionValues } from "./BattleConditionParser";
import type { QuestEnemyAppearance } from "./PvE";
import { skillDetailsByMstId } from "../utils/helpers";
import { TargetType, TargetTypeLookup, targetTypeToLvl, targetRange, type BattleEvent, type BattleSnapshot, type KiokuArgs, type SkillDetail } from "../types/KiokuTypes";
import { elementMap, roleMap, KiokuElement, KiokuRole } from "../types/enums";

export const BENCH_DEF = 3000
export const BENCH_BROKEN_RATE = 500  // % damage taken while broken
const BENCH_HP = 1e12                 // never dies within a run
const BENCH_SPD = 1                   // first turn after ~10,000 AV: never acts within a run
// "Infinite" SP: topped up to this whenever time moves forward. Truly endless SP never ends a chain of battle skills
// that act again at the same moment (Tenebrous Arcana's extra action, Thunder Torrent hasting herself): those drain
// the 5 SP and end, as in the game, while every normal turn starts with SP.
const SP_REFILL = 5

// Any break table with a gauge, so the dummies can be broken; the rate itself is pinned below.
const BREAK_MST_ID: number = (breakMstJson as any[]).find(b => b.breakPoint > 0)?.breakMstId ?? 0

function dummyAppearance(i: number): QuestEnemyAppearance {
    return {
        questEnemyAppearanceMstId: -1 - i, questStageMstId: 0, enemyMstId: 0, wave: 1,
        atk: 0, def: BENCH_DEF, hp: BENCH_HP, speed: BENCH_SPD,
        criticalRate: 0, criticalDamageRate: 0, breakMstId: BREAK_MST_ID,
        passiveSkillMstId: 0, enemySkillSetId: 0, enemyConditionSkillSetId: 0,
        hpGaugeCount: 0, startHpGaugeCount: 0, isMainTargetEnemy: i === 0, conditionType: 0, summonId: 0,
        // weak to every element, no resistances
        weakElement1: 1, weakElement2: 2, weakElement3: 3, weakElement4: 4, weakElement5: 5, weakElement6: 6,
    }
}

/** `count` dummies; the middle one is the main target (single-target skills hit it). */
export function benchEnemies(count: number): QuestEnemyAppearance[] {
    const list = Array.from({ length: count }, (_, i) => dummyAppearance(i + 1))
    const main = Math.trunc(count / 2)
    return list.map((a, i) => ({ ...a, isMainTargetEnemy: i === main }))
}

/** What a bench unit counts as for element/role-limited effects. A key that is present replaces the unit's own
 *  value, `undefined` included: such a unit matches no element (or role) restriction, like the legacy charts'
 *  "no context" Lux. */
export interface BenchIdentity { element?: KiokuElement, role?: KiokuRole }

export function benchKioku(args: Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>, as?: BenchIdentity): PvPKioku {
    const k = new PvPKioku({ ...args, crysIDs: args.crysIDs ?? [], subCrysIDs: args.subCrysIDs ?? [] } as KiokuArgs)
    if (as && ("element" in as || "role" in as)) {
        (k as any).data = { ...k.data, ...("element" in as ? { element: as.element } : {}), ...("role" in as ? { role: as.role } : {}) }
    }
    return k
}

const DAMAGE_TYPES = new Set(["DMG_ATK", "DMG_DEF", "DMG_HP", "DMG_RANDOM"])

/** Elements and roles a kit's effects are limited to: the TargetElement/TargetRole of its effects (damage effects
 *  aside, where `element` is the attack element) and the IS_ELEMENT_TYPE / IS_ROLE_TYPE conditions they use.
 *  Covers the basic attack, battle skill, ultimate, every passive and the follow-up skills they grant. */
export function kitRestrictions(k: PvPKioku): { elements: KiokuElement[], roles: KiokuRole[] } {
    const details: SkillDetail[] = []
    for (const type of [TargetType.attackId, TargetType.skillId, TargetType.specialId]) {
        const id = (k.data as any)[TargetTypeLookup[type as keyof typeof TargetTypeLookup]]
        const lvl = (k as any)[targetTypeToLvl[type as keyof typeof targetTypeToLvl]] ?? 1
        details.push(...(skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[])
    }
    details.push(...k.effects)
    for (const d of [...details]) {
        if (d.abilityEffectType === "ADDITIONAL_SKILL_ACT") details.push(...(skillDetailsByMstId.get(d.value1) ?? []) as SkillDetail[])
    }
    const elements = new Set<KiokuElement>(), roles = new Set<KiokuRole>()
    for (const d of details) {
        if (!DAMAGE_TYPES.has(d.abilityEffectType)) {
            if (d.element && elementMap[d.element]) elements.add(elementMap[d.element])
            if ((d as any).role && roleMap[(d as any).role]) roles.add(roleMap[(d as any).role])
        }
        const cond = unitTypeConditionValues([d.startConditionSetIdCsv, d.activeConditionSetIdCsv])
        cond.elements.forEach(e => elements.add(e as KiokuElement))
        cond.roles.forEach(r => roles.add(r as KiokuRole))
    }
    return { elements: [...elements], roles: [...roles] }
}

/** Max Burst: the dealer's Ultimate, every hit a crit, total over every enemy it hits. */
export function ultimateDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number): { damage: number, critChance: number } {
    const enemies = benchEnemies(enemyCount)
    const result = computeMaxDamage(allies, enemies, dealerPos, {
        battleType: BattleType.Solo,
        broken: enemies.map(() => true),
        breakRate: enemies.map(() => BENCH_BROKEN_RATE),
        mainTargetIdx: Math.trunc(enemyCount / 2),
        onlyPos: dealerPos,
    })
    const ult = result.members[dealerPos]?.skills.find(s => s.type === TargetType.specialId)
    return { damage: ult?.total.crit ?? 0, critChance: ult?.critChance ?? 0 }
}

// FNV-1a
function hashLabel(s: string): number {
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
    return h >>> 0
}

// "seed" mode, but every roll label ("Lux☆Magica (Ally 1) → Dummy (Enemy 1) crit", ...) draws from its own seeded
// stream instead of one shared one. The dealer's n-th crit roll then gets the same number with or without the
// character being measured, even when that character rolls things of its own in between, so comparing two runs of
// the same seed measures what the character changes and not which rolls happened to shift. Every stream is still
// uniform, so the average is unchanged. Bench-only: the game itself has one generator.
class LabelStreamRng extends BattleRng {
    private streams = new Map<string, () => number>()

    constructor(seed: number) { super("seed", seed) }

    protected override draw(kind: RngKind, label: string): number {
        const key = `${kind}|${label}`
        let stream = this.streams.get(key)
        if (!stream) this.streams.set(key, stream = seededRng((hashLabel(key) ^ Math.imul(this.seed, 0x9e3779b1)) >>> 0))
        return stream()
    }
}

export interface SimOptions {
    av: number          // action value to play (100 AV = 1 turn)
    seed: number
    rngMode?: RngMode   // default "seed" (drawn per roll label, see LabelStreamRng)
    infiniteSp?: boolean // the allies' SP is refilled before every turn, see SP_REFILL (bench-only, not a game rule)
    onAction?: (state: BattleSnapshot, elapsed: number) => void  // every counted action (debugging)
}

// How players actually run some kits, where auto play (Battle Skill whenever there is SP) is unrealistic. Applied to
// the ally team of every bench battle (PvPTeam.allyActionPolicy / allyTargetPolicy).
//   Tenebrous Arcana: her Battle Skill grants an extra action; she uses it 3 times, then a Basic Attack.
//   Thunder Torrent: always her Battle Skill, its haste on the dealer (another ally when she is the dealer), never
//   herself.
const PLAY_PATTERNS: Record<string, {
    action?: (unit: KiokuState) => TargetType.skillId | TargetType.attackId
    target?: (unit: KiokuState, dealer: KiokuState) => KiokuState | undefined
}> = {
    "Tenebrous Arcana": { action: u => u.skillStreak >= 3 ? TargetType.attackId : TargetType.skillId },
    "Thunder Torrent": {
        action: () => TargetType.skillId,
        target: (u, dealer) => dealer !== u ? dealer : u.team.kiokuStates.find(k => k !== u && !k.isDead),
    },
}

function applyPlayPatterns(team: PvPTeam, dealerPos: number) {
    const dealer = team.kiokuStates[dealerPos]
    team.allyActionPolicy = u => PLAY_PATTERNS[u.kioku.name]?.action?.(u)
    team.allyTargetPolicy = (u, detail) => detail.range === targetRange.SELF || detail.range === targetRange.ALL ? undefined
        : PLAY_PATTERNS[u.kioku.name]?.target?.(u, dealer)
}

/** Average Damage: total damage dealt by the dealer slot during an auto battle of `opts.av` action value. */
export function simulatedDealerDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number, opts: SimOptions): number {
    const team1 = new PvPTeam(allies, "Ally", false, BattleType.Solo)
    applyPlayPatterns(team1, dealerPos)
    const team2 = new PvPTeam(enemyKiokus(benchEnemies(enemyCount)), "Enemy", false, BattleType.Solo)
    const mode = opts.rngMode ?? "seed"
    const battle = new PvPBattle(team1, team2, false, opts.seed, { rngMode: mode, rng: mode === "seed" ? new LabelStreamRng(opts.seed) : undefined })
    // Broken from the start at a fixed rate (no growth per hit), like the legacy charts' "broken 500%" enemies.
    for (const e of team2.kiokuStates) {
        if (e.enemy) e.enemy.breakMst = {
            ...e.enemy.breakMst, initialBreakedDamageReceiveRate: BENCH_BROKEN_RATE * 10,
            maxBreakedDamageReceiveRate: BENCH_BROKEN_RATE * 10, breakedDamageReceiveRateIncreaseRate: 0,
        }
        e.currentRemainingBreakGauge = 0
        e.isBroken = true
        e.breakedDamageReceiveRate = BENCH_BROKEN_RATE
    }
    // Refill only when the next action is at a later moment: nobody is due to act right now (a haste to 100% or an
    // extra action keeps a unit at 0 time left).
    const refillSp = () => {
        if (!opts.infiniteSp) return
        const units = [...team1.kiokuStates, ...team2.kiokuStates].filter(k => !k.isDead)
        if (battle.elapsed === 0 || units.every(k => k.secondsUntilAbleToAct() > 0)) team1.currentSp = Math.max(team1.currentSp, SP_REFILL)
    }
    let total = 0
    // A vortex pops inside the hit that sets it off, but it is its owner's damage (logged again as the owner's
    // "dot" event), so it is taken out of the hit.
    const count = (events: BattleEvent[] | undefined) => {
        for (const ev of events ?? []) {
            if (!ev.sourceIsTeam1 || ev.sourcePos !== dealerPos) continue
            if (ev.kind === "hit") total += ev.amount - (ev.vortex ?? 0)
            else if (ev.kind === "dot") total += ev.amount
        }
    }
    count(battle.getCurrentState().events)
    // An action counts if it starts within the run: the one that would start after it is played (the battle only
    // knows its time once it advances to it) but not counted.
    while (!battle.isOver) {
        refillSp()
        const states = battle.executeNextAction()
        if (battle.elapsed > opts.av) break
        for (const state of states) { count(state.events); opts.onAction?.(state, battle.elapsed) }
    }
    return total
}

// ── The two Kioku Grid charts ──

const identityKey = (id: BenchIdentity) => `${id.element ?? "-"}/${id.role ?? "-"}`

/** One bar of a chart: the gain (%) in one dealer identity. `critRate` is the dealer's Ultimate crit chance. */
export interface BenchRow extends BenchIdentity { gain: number, critRate?: number }

export interface BenchOptions {
    seeds: number   // battles averaged for Average Damage (seeds 0..seeds-1, the same for the baseline)
    av: number      // action value per battle
    infiniteSp?: boolean // see SimOptions
}

type KiokuInput = Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>

/**
 * Support chart: a Lux dealer with the character in slot 2 and three Lux fillers, compared to five Lux; the dealer
 * has no element or role (the main bar) or one the character's kit is limited to (variant bars). Attacker chart:
 * the character as the dealer (its own element and role) compared to Lux as the dealer, both with four fillers.
 * Lux's baselines are computed once per identity / enemy count and reused. Lux (every slot) is A0, see below.
 */
export class LuxBenchCharts {
    private readonly luxArgs: KiokuInput
    private readonly filler: PvPKioku
    private readonly reference: PvPKioku
    private readonly dealers = new Map<string, PvPKioku>()
    private readonly ultBase = new Map<string, { damage: number, critChance: number }>()
    private readonly simBase = new Map<string, number>()
    private readonly opts: BenchOptions

    // Lux is used at A0: her A1 follow-up charges a Magic from every ally's battle skill, so at A5 her own damage
    // would change with how often (and when) the character next to her uses battle skills, even one without buffs.
    constructor(lux: KiokuInput, opts: BenchOptions) {
        this.luxArgs = { ...lux, ascension: 0 }
        this.opts = opts
        this.filler = benchKioku(this.luxArgs, { element: undefined, role: undefined })
        this.reference = benchKioku(this.luxArgs)
    }

    private dealer(id: BenchIdentity): PvPKioku {
        const key = identityKey(id)
        let k = this.dealers.get(key)
        if (!k) this.dealers.set(key, k = benchKioku(this.luxArgs, { element: id.element, role: id.role }))
        return k
    }

    private team(dealer: PvPKioku, second?: PvPKioku): PvPKioku[] {
        return [dealer, second ?? this.filler, this.filler, this.filler, this.filler]
    }

    private simTotal(team: PvPKioku[], enemies: number): number {
        let total = 0
        for (let seed = 0; seed < this.opts.seeds; seed++) total += simulatedDealerDamage(team, 0, enemies, { av: this.opts.av, seed, infiniteSp: this.opts.infiniteSp })
        return total
    }

    private cachedUlt(key: string, team: () => PvPKioku[], enemies: number) {
        let v = this.ultBase.get(key)
        if (!v) this.ultBase.set(key, v = ultimateDamage(team(), 0, enemies))
        return v
    }

    private cachedSim(key: string, team: () => PvPKioku[], enemies: number) {
        let v = this.simBase.get(key)
        if (v === undefined) this.simBase.set(key, v = this.simTotal(team(), enemies))
        return v
    }

    /** Dealer identities to test a support in: none, then each element / role / element+role its kit is limited to. */
    supportIdentities(x: PvPKioku): BenchIdentity[] {
        const { elements, roles } = kitRestrictions(x)
        return [
            {},
            ...elements.map(element => ({ element })),
            ...roles.map(role => ({ role })),
            ...elements.flatMap(element => roles.map(role => ({ element, role }))),
        ]
    }

    // The dealer's element / role when none is tested: Lux's own (Light, Breaker) unless the kit is limited to it, then
    // another one it isn't limited to. Every unit has both in game and they matter beyond restrictions: additional damage
    // (ADDITIONAL_DAMAGE, TSUBAME_LINK) is dealt in the attacker's own element (without one it misses the dummies'
    // weakness), and some ally targeting prefers roles (Thunder Torrent's haste picks an Attacker/Breaker ally).
    private neutral(x: PvPKioku): { element: KiokuElement, role: KiokuRole } {
        const { elements, roles } = kitRestrictions(x)
        const pick = <T,>(own: T, all: T[], limited: T[]) => !limited.includes(own) ? own : all.find(v => !limited.includes(v)) ?? own
        return {
            element: pick(this.reference.data.element as KiokuElement, Object.values(KiokuElement), elements),
            role: pick(this.reference.data.role as KiokuRole, Object.values(KiokuRole), roles),
        }
    }

    // A tested identity as the dealer actually is: untested parts replaced by the neutral ones.
    private resolve(id: BenchIdentity, x: PvPKioku): BenchIdentity {
        const n = this.neutral(x)
        return { element: id.element ?? n.element, role: id.role ?? n.role }
    }

    supportMax(x: PvPKioku, ids = this.supportIdentities(x)): BenchRow[] {
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x))
            const base = this.cachedUlt(`s:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), 1)
            const v = ultimateDamage(this.team(dealer, x), 0, 1)
            return { ...id, gain: pctGain(v.damage, base.damage), critRate: v.critChance }
        })
    }

    supportAvg(x: PvPKioku, ids = this.supportIdentities(x)): BenchRow[] {
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x))
            const base = this.cachedSim(`s:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), 1)
            return { ...id, gain: pctGain(this.simTotal(this.team(dealer, x), 1), base) }
        })
    }

    attackerMax(x: PvPKioku, enemies: number): BenchRow {
        const base = this.cachedUlt(`a:${enemies}`, () => this.team(this.reference), enemies)
        const v = ultimateDamage(this.team(x), 0, enemies)
        return { gain: pctGain(v.damage, base.damage), critRate: v.critChance }
    }

    attackerAvg(x: PvPKioku, enemies: number): BenchRow {
        const base = this.cachedSim(`a:${enemies}`, () => this.team(this.reference), enemies)
        return { gain: pctGain(this.simTotal(this.team(x), enemies), base) }
    }
}

const pctGain = (value: number, base: number) => base > 0 ? (value / base - 1) * 100 : 0
