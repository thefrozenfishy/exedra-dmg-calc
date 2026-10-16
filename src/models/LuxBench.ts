// Lux bench: how much a character changes a damage dealer's output, measured with the battle engine, with
// Lux☆Magica as the blank slate (beta charts on the Kioku Grid page).
//
// The setup mirrors the legacy Kioku Grid charts: enemies with 3000 DEF, weak to every element and broken at a
// 500% damage-taken rate, and a team of Lux plus the character being measured. The numbers come from the 1:1 engine
// (src/engine) against dummies made of game-shaped master data (battle/EngineBench.ts):
//   - ultimateDamage: the dealer's Ultimate launched in the game's battle code (battle/EngineMaxDamage), with every
//     buff/debuff of the team active at full stacks, every hit a crit ("Max Burst").
//   - simulatedDealerDamage: a battle played for a fixed amount of action value (AV) with the bench's fixed play
//     (BenchPolicy below), counting only the damage the dealer itself deals ("Average Damage"). The rest of the team's
//     damage is ignored, so a support that also hits hard doesn't count, only what it changes about the dealer.
// The dummies have SPD 1, so they never get a turn within the run: they don't attack, and (broken units only
// recover at their own turn start) they stay broken throughout.
import { PvPKioku } from "./PvPKioku";
import { Kioku } from "./Kioku";
import { BattleType } from "./DamageCalculator";
import type { RngMode } from "./BattleRng";
import { ailmentConditionValues, critConditionUsed, unitTypeConditionValues } from "./BattleConditionParser";
import type { QuestEnemyAppearance } from "./PvE";
import { crystalisesByStyle, kiokuData, skillDetailsByMstId } from "../utils/helpers";
import { TargetType, TargetTypeLookup, targetTypeToLvl, type BattleEvent, type BattleSnapshot, type KiokuArgs, type SkillDetail } from "../types/KiokuTypes";
import { Ailment, elementMap, roleMap, KiokuElement, KiokuRole, LuxMagica } from "../types/enums";
import { computeMaxDamageEngine } from "../battle/EngineMaxDamage";
import { E } from "../battle/engineBundle";
import { AILMENT_STATE, BENCH_BROKEN_RATE, BENCH_DEF, BenchRng, benchBattle, benchSkills, benchStage, benchStyle, keepAilment, keepStates, middleEnemy } from "../battle/EngineBench";

export { BENCH_BROKEN_RATE, BENCH_DEF }
// "Infinite" SP: topped up to this whenever time moves forward. Truly endless SP never ends a chain of battle skills
// that act again at the same moment (Tenebrous Arcana's extra action, Thunder Torrent hasting herself): those drain
// the 5 SP and end, as in the game, while every normal turn starts with SP.
const SP_REFILL = 5

/** `count` dummies (the bench stage's appearance rows); the middle one is the main target (single-target skills hit it). */
export function benchEnemies(count: number): QuestEnemyAppearance[] {
    return benchStage(count).enemies
}

/** What a bench unit counts as for element/role-limited effects. A key that is present replaces the unit's own
 *  value, `undefined` included: such a unit matches no element (or role) restriction, like the legacy charts'
 *  "no context" Lux. `ailment` is not about the unit: every enemy carries that ailment for the whole run. */
export interface BenchIdentity { element?: KiokuElement, role?: KiokuRole, ailment?: Ailment }

const enemyStatesOf = (ailment?: Ailment): string[] => ailment ? [AILMENT_STATE[ailment]] : []

/** The character's own EX crystalis (SelectionAbility rows with its styleMstId; one per character). */
export const exCrysIds = (name: string): number[] =>
    (crystalisesByStyle[kiokuData[name]?.id ?? -1] ?? []).map(c => c.selectionAbilityMstId)

/** A bench unit: the kit at the given levels with only its EX crystalis - no portrait, support or other crystalis,
 *  whatever `args` carries (the same for Lux and for every character measured). */
export function benchKioku(args: Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>, as?: BenchIdentity): PvPKioku {
    const k = new PvPKioku({ ...args, portrait: undefined, supportKey: undefined, crysIDs: exCrysIds(args.name), subCrysIDs: [] } as KiokuArgs)
    // Lux given a role (any, Breaker included) also gets that role's stats: the average HP/ATK/DEF of its 5 stars (Lux
    // herself excluded) at her levels, so e.g. an Attacker-identity Lux hits like an average Attacker.
    if (as?.role && args.name === LuxMagica) {
        const stats = averageRoleStats(as.role, args)
        if (stats) {
            k.getBaseHp = () => stats.hp
            k.getBaseAtk = () => stats.atk
            k.getBaseDef = () => stats.def
        }
    }
    if (as && ("element" in as || "role" in as)) {
        (k as any).data = { ...k.data, ...("element" in as ? { element: as.element } : {}), ...("role" in as ? { role: as.role } : {}) }
        // In engine battles the unit's element and role come from its StyleMst row: a made-up style with this identity
        // (the unit then also deals its damage in that element, as any unit of that element does).
        ;(k as any).engineStyleMstId = benchStyle(k.data.id, k.data.element as KiokuElement | undefined, k.data.role as KiokuRole | undefined)
    }
    // A dealer tested as an element also deals damage in it: "forest DMG dealt" buffs and the like are gated on the
    // element of the hit, not of the unit (UpElementDmgRateRatioUnitState, 0x16e3d70), and Lux's damage rows are Light.
    // Without this a Forest-identity Lux still hit in Light and got only her unit-gated buffs (Sumire's forest field
    // gave its crit rate but not its +30%): her skills as made-up rows in that element (EngineBench.benchSkills).
    if (as?.element) {
        const kk = k as any
        kk.engineSkillIds = benchSkills({
            attack: [k.data.attack_id, kk.attackLvl], skill: [k.data.skill_id, kk.skillLvl], special: [k.data.special_id, Math.max(1, kk.specialLvl)],
        }, as.element)
    }
    return k
}

// Average base HP/ATK/DEF of every 5 star of a role (Lux excluded) at the given levels: kit stats, magic and heart
// levels and ascension only, like a bench unit (no portrait, support or crystalis). Cached per role and levels.
const roleStatCache = new Map<string, { hp: number, atk: number, def: number } | undefined>()
function averageRoleStats(role: KiokuRole, levels: Pick<KiokuArgs, "ascension" | "kiokuLvl" | "magicLvl" | "heartphialLvl" | "specialLvl">) {
    const key = [role, levels.ascension, levels.kiokuLvl, levels.magicLvl, levels.heartphialLvl, levels.specialLvl].join(":")
    if (roleStatCache.has(key)) return roleStatCache.get(key)
    const units = Object.entries(kiokuData)
        .filter(([name, d]) => d.rarity === 5 && d.role === role && name !== LuxMagica)
        .map(([name]) => new Kioku({ ...levels, name, crysIDs: [], subCrysIDs: [] } as KiokuArgs))
    const avg = (f: (k: Kioku) => number) => Math.round(units.reduce((sum, k) => sum + f(k), 0) / units.length)
    const stats = units.length ? { hp: avg(k => k.getBaseHp()), atk: avg(k => k.getBaseAtk()), def: avg(k => k.getBaseDef()) } : undefined
    roleStatCache.set(key, stats)
    return stats
}

const DAMAGE_TYPES = new Set(["DMG_ATK", "DMG_DEF", "DMG_HP", "DMG_RANDOM"])

/** Every skill / passive row of a kit: basic attack, battle skill, ultimate, passives, and the follow-ups they grant. */
function kitDetails(k: PvPKioku): SkillDetail[] {
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
    return details
}

/** Kits whose effects react to crits: a "critical hit happened" condition (CTDUnitCount 303, e.g. Absolute Rain's
 *  "on critical hit, ATK +10%") or a state used up by a crit (UP/DWN_CTD_CONSUME_FIXED). For those the expected-crit
 *  shortcut would miss the procs, so their battles roll crits as in the game. */
export function kitReactsToCrits(k: PvPKioku): boolean {
    return kitDetails(k).some(d => d.abilityEffectType.includes("CTD_CONSUME") || critConditionUsed([d.startConditionSetIdCsv, d.activeConditionSetIdCsv]))
}

/** Elements and roles a kit's effects are limited to: the TargetElement/TargetRole of its effects (damage effects
 *  aside, where `element` is the attack element) and the IS_ELEMENT_TYPE / IS_ROLE_TYPE conditions they use.
 *  Covers the basic attack, battle skill, ultimate, every passive and the follow-up skills they grant. */
export function kitRestrictions(k: PvPKioku): { elements: KiokuElement[], roles: KiokuRole[], ailments: Ailment[] } {
    const details = kitDetails(k)
    const elements = new Set<KiokuElement>(), roles = new Set<KiokuRole>(), ailments = new Set<Ailment>()
    for (const d of details) {
        ailmentConditionValues([d.startConditionSetIdCsv, d.activeConditionSetIdCsv]).forEach(a => ailments.add(a))
        if (!DAMAGE_TYPES.has(d.abilityEffectType)) {
            if (d.element && elementMap[d.element]) elements.add(elementMap[d.element])
            if ((d as any).role && roleMap[(d as any).role]) roles.add(roleMap[(d as any).role])
        }
        const cond = unitTypeConditionValues([d.startConditionSetIdCsv, d.activeConditionSetIdCsv])
        cond.elements.forEach(e => elements.add(e as KiokuElement))
        cond.roles.forEach(r => roles.add(r as KiokuRole))
    }
    return { elements: [...elements], roles: [...roles], ailments: [...ailments] }
}

/** Max Burst: the dealer's Ultimate, every hit a crit, total over every enemy it hits. With `ailment`, every enemy
 *  carries it and the team's ailment conditions are checked against it (the other conditions count as met). */
export function ultimateDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number, ailment?: Ailment): { damage: number, critChance: number } {
    const { stageId, enemies } = benchStage(enemyCount)
    const result = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, enemies, dealerPos, {
        battleType: BattleType.Solo,
        broken: enemies.map(() => true),
        breakRate: enemies.map(() => BENCH_BROKEN_RATE),
        mainTargetIdx: Math.trunc(enemyCount / 2),
        onlyPos: dealerPos,
        enemyStates: enemyStatesOf(ailment),
    })
    const ult = result.members[dealerPos]?.skills.find(s => s.type === TargetType.specialId)
    return { damage: ult?.total.crit ?? 0, critChance: ult?.critChance ?? 0 }
}

export interface SimOptions {
    av: number          // action value to play (100 AV = 1 turn)
    seed: number
    rngMode?: RngMode   // only "seed" (drawn per roll label, see EngineBench.BenchRng)
    infiniteSp?: boolean // the allies' SP is refilled before every turn, see SP_REFILL (bench-only, not a game rule)
    ailment?: Ailment   // every enemy carries this ailment for the whole run
    immune?: Ailment[]  // ailments that never land on the enemies (100% parry on the dummies), see benchImmunities
    // APP MOD (not game code): every hit deals its expected crit damage (runtime.AppMods.expectedCritDamage)
    expectedCrits?: boolean
    onAction?: (state: BattleSnapshot, elapsed: number) => void  // every counted action (debugging)
    // Whether anything in the run was random (a real roll). The engine has no "expected crit" damage (a hit crits or
    // not), so a run with crit chances between 0 and 100% is random and is averaged over seeds (LuxBenchCharts.simTotal).
    report?: { random: boolean }
    // [BENCH] Damage per AV instead of a hard cut at `av`: the damage of the dealer's actions within the run, divided by
    // the time of its next own turn (scaled back to `av`). Speed then counts continuously: a turn that comes 3 AV earlier
    // shows, where with the hard cut it only matters once it fits one more action in.
    perAv?: boolean
}

// How players actually run some kits, where the bench's default play (Battle Skill whenever there is SP, ally-target
// skills on the dealer) is unrealistic.
//   Tenebrous Arcana: her Battle Skill grants an extra action; she uses it 3 times, then a Basic Attack.
//   Thunder Torrent: always her Battle Skill, its haste on the dealer (another ally when she is the dealer), never
//   herself.
//   Judgement Earth: her Battle Skill (heal, MP, and at A2 "special attack DMG +20%" on whoever it heals) on the dealer.
//   Baldamente Fortissimo: her debuff comes from her counterattack, and the dummies never attack. Her counter's
//   elemental RES down (follow-up 650310, 5% x 3 stacks) is kept on the main target at max stacks for the whole run.
const PLAY_PATTERNS: Record<string, {
    action?: (streak: number) => "skill" | "attack"
    // ally target: the unit to put it on (undefined: the default, the dealer)
    target?: (self: any, dealer: any, allies: any[]) => any
    // skill rows whose states this unit keeps on the main target for the whole run, at max stacks
    enemyStates?: () => SkillDetail[]
}> = {
    "Judgement Earth": { target: (self, dealer) => dealer !== self ? dealer : undefined },
    "Baldamente Fortissimo": {
        enemyStates: () => ((skillDetailsByMstId.get(650310) ?? []) as SkillDetail[]).filter(d => d.abilityEffectType === "DWN_ELEMENT_RESIST_ACCUM_RATIO"),
    },
    "Tenebrous Arcana": { action: streak => streak >= 3 ? "attack" : "skill" },
    "Thunder Torrent": {
        action: () => "skill",
        target: (self, dealer, allies) => dealer !== self ? dealer : allies.find(k => k !== self && !k.IsDead),
    },
}

/** Average Damage: total damage dealt by the dealer slot during a bench battle of `opts.av` action value. */
export function simulatedDealerDamage(allies: PvPKioku[], dealerPos: number, enemyCount: number, opts: SimOptions): number {
    const { stageId } = benchStage(enemyCount, opts.immune ?? [])
    const nameOf = (u: any) => allies[u._PositionId - 1]?.name
    let director: any
    const allyUnits = () => [...director.battleUnitBundle.allyList].sort((a: any, b: any) => a._PositionId - b._PositionId)
    const dealerUnit = () => allyUnits()[dealerPos]
    let actor: any
    const streak = new Map<any, number>()
    // The bench's play (Manual control answered by BenchRng): ultimates as soon as they are ready, Battle Skill whenever
    // there is SP (PLAY_PATTERNS aside), enemy targets on the middle dummy, ally targets on the dealer.
    const rng = new BenchRng(opts.seed, (kind, _label, options, units) => {
        if (kind === "action") {
            if (options[0] === "Continue") return 1 // between actions: fire the first ready ultimate
            const want = PLAY_PATTERNS[nameOf(actor)]?.action?.(streak.get(actor) ?? 0)
            const skill = options.findIndex(o => o.startsWith("Battle Skill")), attack = options.indexOf("Basic Attack")
            const i = want === "attack" ? attack : skill >= 0 ? skill : attack
            streak.set(actor, i === skill ? (streak.get(actor) ?? 0) + 1 : 0)
            return i
        }
        if (kind === "target" && units?.length) {
            if (units[0]._Team !== 0) return Math.max(0, units.indexOf(middleEnemy(director)))
            const dealer = dealerUnit()
            const pick = PLAY_PATTERNS[nameOf(actor)]?.target?.(actor, dealer, allyUnits()) ?? dealer
            return Math.max(0, units.indexOf(pick))
        }
        return 0
    })
    // Kit special cases (PLAY_PATTERNS.enemyStates): kept on the main target as if given by that unit, at max stacks.
    const preApplied = allies.flatMap((k, pos) => (PLAY_PATTERNS[k.name]?.enemyStates?.() ?? []).map(d => ({ pos, d })))
    const keep = (d: any) => {
        director = d
        keepAilment(d, opts.ailment)
        for (const { pos, d: row } of preApplied) {
            const main = middleEnemy(d)
            const id = (row as any).skillDetailMstId as number
            if (main && !main._Condition._StateList.some((s: any) => s._MstId === id && s._UserUnitId === allyUnits()[pos]?._Id)) {
                keepStates(d, allyUnits()[pos], main, [id], () => Math.max(1, row.value2 || 1))
            }
        }
    }
    let lastRefill = -1
    const battle = benchBattle(allies, stageId, rng, {
        beforeAction: keep,
        // Refill only when time has moved since the last refill: an extra action at the same moment (a haste to 100%,
        // Tenebrous Arcana's extra action) keeps the SP it has.
        beforeDecision: (unit, b) => {
            actor = unit
            if (!opts.infiniteSp) return
            if (lastRefill < 0 || b.elapsed > lastRefill) {
                const sp = b.director.spReferee
                sp.allySp = Math.max(sp.allySp, SP_REFILL)
                lastRefill = b.elapsed
            }
        },
    })
    director = battle.director
    let total = 0
    const mods = E.AppMods // runtime.AppMods (APP MOD switches, not game code)
    const savedMod = mods.expectedCritDamage
    mods.expectedCritDamage = !!opts.expectedCrits
    try {
    // A vortex pops inside the hit that sets it off; the engine reports it with that hit (its attacker), not as its
    // owner's damage [APPROXIMATION vs the old bench, which moved it to the owner].
    const count = (events: BattleEvent[] | undefined) => {
        for (const ev of events ?? []) {
            if (!ev.sourceIsTeam1 || ev.sourcePos !== dealerPos) continue
            if (ev.kind === "hit" || ev.kind === "dot") total += ev.amount
        }
    }
    // An action counts if it starts within the run: the one that would start after it is played (the battle only
    // knows its time once it advances to it) but not counted.
    const isDealerTurn = (st: BattleSnapshot) => st.lastTeamIsTeam1 && st.lastActorPos === dealerPos && !st.actionLabel
        && st.lastTargetType !== TargetType.fuaId
    let nextTurn = 0
    while (!battle.isOver) {
        keep(director)
        const states = battle.executeNextAction()
        if (!states.length) break
        if (battle.elapsed > opts.av) { if (states.some(isDealerTurn)) nextTurn = battle.elapsed; break }
        for (const state of states) { count(state.events); opts.onAction?.(state, battle.elapsed) }
    }
    // Per-AV rate: play on (counting nothing) to the dealer's first own turn past the run.
    if (opts.perAv && !nextTurn) {
        while (!battle.isOver && battle.elapsed < opts.av * 3) {
            keep(director)
            const states = battle.executeNextAction()
            if (!states.length) break
            if (states.some(isDealerTurn)) { nextTurn = battle.elapsed; break }
        }
    }
    // random beyond crits: a crit roll only matters with rolled crits (with expected crits it only sets the IsCritical
    // flag, which nothing in a team without crit reactions reads)
    if (opts.report) opts.report.random = rng.events.some(e => !opts.expectedCrits || e.kind !== "crit")
    return opts.perAv && nextTurn > 0 ? total * opts.av / nextTurn : total
    } finally {
        mods.expectedCritDamage = savedMod
    }
}

// ── The two Kioku Grid charts ──

const identityKey = (id: BenchIdentity) => `${id.element ?? "-"}/${id.role ?? "-"}/${id.ailment ?? "-"}`

/** Average Damage: an ailment the kit reacts to is a question of whether the enemies CAN carry it, not of who puts it
 *  there. A run without that ailment makes the enemies immune to it, so a kit that applies it itself and reacts to it
 *  (Bebe-O'-Lantern curses her Candyholic target, and Candyholic only lowers DEF while the target is cursed) shows
 *  the difference in its ailment bar instead of always having it. A run with one of them keeps it on the enemies
 *  (as before) and makes them immune to the kit's other ones. */
export const benchImmunities = (kitAilments: Ailment[], ailment?: Ailment): Ailment[] => kitAilments.filter(a => a !== ailment)

/** One bar of a chart: the gain (%) in one dealer identity. `critRate` is the dealer's Ultimate crit chance. */
export interface BenchRow extends BenchIdentity { gain: number, critRate?: number }

export interface BenchOptions {
    seeds: number   // rolled battles averaged for Average Damage when anything in it is random (see simTotal)
    av: number      // action value per battle
    infiniteSp?: boolean // see SimOptions
}

type KiokuInput = Omit<KiokuArgs, "crysIDs" | "subCrysIDs"> & Partial<KiokuArgs>

/**
 * Support chart: a Lux dealer with the character in slot 2 and three Lux fillers, compared to five Lux; the dealer
 * has no element or role (the main bar) or one the character's kit is limited to (variant bars). Attacker chart:
 * the character as the dealer (its own element and role) compared to Lux as the dealer in the character's role (with
 * that role's average 5 star stats, see benchKioku), both with four fillers. Always 5 units (user's choice).
 * Lux's baselines are computed once per identity / enemy count and reused. Every bench Lux (dealer, fillers,
 * reference) is A0 at max levels, so she has no follow-up.
 */
export class LuxBenchCharts {
    private readonly luxArgs: KiokuInput
    private readonly reference: PvPKioku
    private readonly filler: PvPKioku
    private readonly dealers = new Map<string, PvPKioku>()
    private readonly references = new Map<KiokuRole, PvPKioku>()
    private readonly ultBase = new Map<string, { damage: number, critChance: number }>()
    private readonly simBase = new Map<string, number>()
    private readonly opts: BenchOptions

    // Lux as given (the page passes A5, max levels), at A0 for every bench unit: her A1 follow-up charges a Magic from
    // every ally's battle skill, so at A5 a character casting several battle skills a turn (Tenebrous Arcana's extra
    // actions) showed as a damage buff.
    constructor(lux: KiokuInput, opts: BenchOptions) {
        this.luxArgs = { ...lux, ascension: 0 }
        this.opts = opts
        this.reference = benchKioku(this.luxArgs)
        this.filler = benchKioku(this.luxArgs, { element: undefined, role: undefined })
    }

    private dealer(id: BenchIdentity): PvPKioku {
        const key = identityKey({ element: id.element, role: id.role })
        let k = this.dealers.get(key)
        if (!k) this.dealers.set(key, k = benchKioku(this.luxArgs, { element: id.element, role: id.role }))
        return k
    }

    // Attacker chart baseline: Lux as the dealer in the measured character's role, so an Attacker is compared to Lux with
    // average 5 star Attacker stats, a Healer to Lux with average Healer stats, and so on.
    private roleReference(role: KiokuRole): PvPKioku {
        let k = this.references.get(role)
        if (!k) this.references.set(role, k = benchKioku(this.luxArgs, { role }))
        return k
    }

    private team(dealer: PvPKioku, second?: PvPKioku): PvPKioku[] {
        return [dealer, second ?? this.filler, this.filler, this.filler, this.filler]
    }

    // The dealer's average damage over one run. A team where a kit reacts to crits (kitReactsToCrits) rolls its crits as
    // in the game: the mean of `seeds` battles (seeds 0..seeds-1). Every other team uses the expected-crit APP MOD
    // (runtime.AppMods.expectedCritDamage, not game code): one battle gives the average; `seeds` battles only when
    // something else in it is random (proc chances, random targets).
    private simTotal(team: PvPKioku[], enemies: number, ailment?: Ailment, immune: Ailment[] = []): number {
        const expectedCrits = !team.some(k => kitReactsToCrits(k))
        const base = { av: this.opts.av, infiniteSp: this.opts.infiniteSp, expectedCrits, ailment, immune, perAv: true }
        const report = { random: false }
        let total = simulatedDealerDamage(team, 0, enemies, { ...base, seed: 0, report })
        if (!report.random) return total
        for (let seed = 1; seed < this.opts.seeds; seed++) total += simulatedDealerDamage(team, 0, enemies, { ...base, seed })
        return total / this.opts.seeds
    }

    private cachedUlt(key: string, team: () => PvPKioku[], enemies: number, ailment?: Ailment) {
        let v = this.ultBase.get(key)
        if (!v) this.ultBase.set(key, v = ultimateDamage(team(), 0, enemies, ailment))
        return v
    }

    private cachedSim(key: string, team: () => PvPKioku[], enemies: number, ailment?: Ailment, immune: Ailment[] = []) {
        key += `:${[...immune].sort().join(",")}`
        let v = this.simBase.get(key)
        if (v === undefined) this.simBase.set(key, v = this.simTotal(team(), enemies, ailment, immune))
        return v
    }

    /** Dealer identities to test a support in: none, then each element / role / element+role its kit is limited to, then
     *  each ailment its kit reacts to, alone and with each of those elements / roles. */
    supportIdentities(x: PvPKioku): BenchIdentity[] {
        const { elements, roles, ailments } = kitRestrictions(x)
        const unit: BenchIdentity[] = [
            {},
            ...elements.map(element => ({ element })),
            ...roles.map(role => ({ role })),
            ...elements.flatMap(element => roles.map(role => ({ element, role }))),
        ]
        return [...unit, ...ailments.flatMap(ailment => unit.map(id => ({ ...id, ailment })))]
    }

    /** Attacker chart: the character's own identity, then each ailment its kit reacts to. */
    attackerIdentities(x: PvPKioku): BenchIdentity[] {
        return [{}, ...kitRestrictions(x).ailments.map(ailment => ({ ailment }))]
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
        return { element: id.element ?? n.element, role: id.role ?? n.role, ailment: id.ailment }
    }

    supportMax(x: PvPKioku, enemies = 1, ids = this.supportIdentities(x)): BenchRow[] {
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x))
            const base = this.cachedUlt(`s:${enemies}:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), enemies, id.ailment)
            const v = ultimateDamage(this.team(dealer, x), 0, enemies, id.ailment)
            return { ...id, gain: pctGain(v.damage, base.damage), critRate: v.critChance }
        })
    }

    supportAvg(x: PvPKioku, enemies = 1, ids = this.supportIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const dealer = this.dealer(this.resolve(id, x))
            const immune = benchImmunities(kitAilments, id.ailment)
            const base = this.cachedSim(`s:${enemies}:${identityKey(this.resolve(id, x))}`, () => this.team(dealer), enemies, id.ailment, immune)
            return { ...id, gain: pctGain(this.simTotal(this.team(dealer, x), enemies, id.ailment, immune), base) }
        })
    }

    attackerMax(x: PvPKioku, enemies: number, ids = this.attackerIdentities(x)): BenchRow[] {
        return ids.map(id => {
            const role = x.data.role as KiokuRole
            const base = this.cachedUlt(`a:${enemies}:${role}:${id.ailment ?? "-"}`, () => this.team(this.roleReference(role)), enemies, id.ailment)
            const v = ultimateDamage(this.team(x), 0, enemies, id.ailment)
            return { ...id, gain: pctGain(v.damage, base.damage), critRate: v.critChance }
        })
    }

    attackerAvg(x: PvPKioku, enemies: number, ids = this.attackerIdentities(x)): BenchRow[] {
        const kitAilments = kitRestrictions(x).ailments
        return ids.map(id => {
            const immune = benchImmunities(kitAilments, id.ailment)
            const role = x.data.role as KiokuRole
            const base = this.cachedSim(`a:${enemies}:${role}:${id.ailment ?? "-"}`, () => this.team(this.roleReference(role)), enemies, id.ailment, immune)
            return { ...id, gain: pctGain(this.simTotal(this.team(x), enemies, id.ailment, immune), base) }
        })
    }
}

const pctGain = (value: number, base: number) => base > 0 ? (value / base - 1) * 100 : 0
