// Fight solver: searches the player's decisions in a PvE battle for the clear that takes the least action value
// (elapsed turn-gauge time, "AV"). Not a game rule: a search over what the PvE Simulator's Manual control lets the
// player decide (Battle Skill / Basic Attack, which ultimate to fire and when, every ally-side target pick), with
// the enemies on their normal AI (skill rotation, aggro targeting) and every random roll decided by the page's RNG
// mode (seed: the seeded generator, so a path is one exact seeded battle; hit / miss / weighted as on the page;
// manual is searched as weighted: the solver cannot reuse roll flips made for one particular sequence).
//
// Nodes are decision points: the battle at the start of an executeNextAction that needs at least one decision.
// A node's edge holds the decisions of that action (an ultimate window, the action choice, its targets...) and the
// decision-free actions after it (enemy turns, follow-ups) up to the next decision point or the end. Battles are
// cloned at action boundaries (BattleCloner) and a decision inside an action re-runs that action from its start,
// since PendingDecision-style stops unwind the engine mid-action.
//
// Search (each part can be switched off, see SolverOptions):
//   1. prefix: a beam pass (best `beamWidth` nodes per depth by estimated finish AV) finds a good clear early, so
//      the bound below cuts hard from the start; with several workers the same deterministic prefix runs in each
//      and its open frontier is dealt out round-robin (`partition`), the workers share their best AV (`setExternalBound`);
//   2. depth-first over the rest, children ordered by estimated finish AV (AV so far + HP left / damage rate);
//   3. branch and bound: a node whose AV (or, with `lowerBound`, AV + an optimistic estimate of the AV still
//      needed) is already past the best clear (+ `slack`) is not expanded - one level with it is (same AV, other EP);
//   4. exact merging (`memo`): a state already seen with no more AV stops the path;
//   5. dominance (`dominance`): states equal except for resources that only help (enemy HP lower, ally HP / EP /
//      team SP higher, AV lower) - each resource only if no condition the battle can evaluate reads it on a
//      threshold the two states sit on different sides of (see ResourceModel);
//   6. symmetry (`symmetry`): target options on interchangeable units (same state, same neighbours) are tried once;
//   7. approximations: AI targets on a side, ultimates as soon as ready, ultimate habits (Breakers asap, Attackers
//      only into a break), loose merging (rounded gauges / HP).
// Ordering also follows those habits and credits banked EP (estimate), so good lines come first even when exact.
// The search is anytime: the best clear so far is always available; an emptied stack means the result is optimal
// for the model (team, stage, RNG mode, approximations switched on).
import { BattleRng, PendingDecision, type RngDecision, type RngKind, type RngMode } from "./BattleRng";
import { BattleCloner, StateHasher, sharedObjects } from "./BattleClone";
import type { PvPBattle } from "./PvPBattle";
import { restoreModuleBattleState, saveModuleBattleState } from "./PvPTeam";
import { enemyParams, enemySkillDetails, stageWaveMeta, type QuestEnemyAppearance } from "./PvE";
import { skillDetailsByMstId } from "../utils/helpers";
import { TargetType, type BattleSnapshot } from "../types/KiokuTypes";
import type { PvPKioku } from "./PvPKioku";
import { computeMaxDamage } from "./MaxDamage";
import { stageBattleType, waveStartUnits } from "./PvEBattle";
import battleConditionSetJson from "../assets/base_data/getBattleConditionSetMstList.json";
import battleConditionJson from "../assets/base_data/getBattleConditionMstList.json";

// ---------------------------------------------------------------------------------------------------------------
// RNG: the page's roll modes, the player's decisions forced from a list
// ---------------------------------------------------------------------------------------------------------------
// `auto`: the only allowed option (symmetry / ultimates-asap left one), taken without branching; not part of the
// forced list when a path is replayed.
export interface SolverPick { kind: RngKind, label: string, choice: string, value: number, count: number, auto?: boolean }


// Thrown when the battle needs a decision that the forced list does not hold.
export class SolverPending extends Error {
    readonly kind: RngKind
    readonly label: string
    readonly options: string[]
    readonly allowed: number[]
    constructor(kind: RngKind, label: string, options: string[], allowed: number[]) {
        super(`Solver decision: ${label}`)
        this.kind = kind
        this.label = label
        this.options = options
        this.allowed = allowed
        this.name = "SolverPending"
    }
}

// Option filters, set by the solver for its thread (one solver per worker). Lives outside the RNG object because
// the RNG is cloned with every battle.
export interface PickFilter {
    ultsAsap?: boolean                       // ult window: fire the first ready ultimate; action prompts: no ultimates
    fingerprint?: (unit: any) => string      // symmetry: options with equal fingerprints are interchangeable
    // Ultimate habits: Breaker ultimates as soon as ready, Attacker ultimates only while an enemy is broken.
    ultHabits?: boolean
    roleOf?: (option: string) => string | undefined   // "Ultimate: <unit label>" -> role of that ally
}
let pickFilter: PickFilter = {}
// The battle being run (set before every executeNextAction), for filters that look at its state.
let activeBattle: PvPBattle | undefined
const anyEnemyBroken = (b?: PvPBattle) => !!b && ((b as any).team2.kiokuStates as any[]).some(u => !u.isDead && u.isBroken)
const isUlt = (o: string) => o.startsWith("Ultimate: ")
let symmetrySkipped = 0

export function allowedOptions(kind: RngKind, label: string, options: string[], units?: readonly unknown[]): number[] {
    let idx = options.map((_, i) => i)
    if (pickFilter.ultsAsap && kind === "action") {
        if (label.startsWith("Between actions")) {
            const u = idx.find(i => options[i].startsWith("Ultimate: "))
            if (u !== undefined) return [u]
        } else idx = idx.filter(i => !options[i].startsWith("Ultimate: "))
    }
    if (pickFilter.ultHabits && kind === "action" && pickFilter.roleOf) {
        const broken = anyEnemyBroken(activeBattle)
        const breaker = idx.find(i => isUlt(options[i]) && pickFilter.roleOf!(options[i]) === "Breaker")
        if (breaker !== undefined) return [breaker]
        if (!broken) idx = idx.filter(i => !(isUlt(options[i]) && pickFilter.roleOf!(options[i]) === "Attacker"))
    }
    const fp = pickFilter.fingerprint
    if (fp && kind === "target" && units && units.length === options.length && idx.length > 1) {
        const seen = new Set<string>()
        idx = idx.filter(i => {
            const key = fp(units[i])
            if (seen.has(key)) { symmetrySkipped++; return false }
            seen.add(key)
            return true
        })
    }
    return idx.length ? idx : options.map((_, i) => i)
}

export class SolverRng extends BattleRng {
    // mulberry32 state as a plain number (the base class keeps it in a closure, which a clone cannot copy).
    // Same sequence as BattleMath.seededRng(seed), so seed mode reproduces the simulator's seeded battle.
    state: number
    forced: number[] = []
    pos = 0
    picks: SolverPick[] = []

    // Replaying the simulator's opening ("solve from here"): the page's mode and decisions (picks and flipped rolls,
    // by roll index, exactly as BattleRng applies them) until endReplay(); then the solver's mode.
    replaying: boolean
    // Every pick with its roll index (for "play from here": the path as simulator decisions).
    log?: { index: number, kind: RngKind, label: string, value: number }[]

    constructor(mode: RngMode, seed: number, replay?: Map<number, RngDecision>) {
        super(replay ? mode : mode === "manual" ? "weighted" : mode, seed, replay)
        this.state = seed >>> 0
        this.replaying = !!replay
    }

    endReplay(): void {
        this.replaying = false
        if (this.mode === "manual") (this as any).mode = "weighted"
    }

    // Index of the next recorded roll (BattleRng numbers every real roll and pick).
    get rollIndex(): number { return (this as any).nextIndex }

    protected draw(): number {
        this.state = (this.state + 0x6D2B79F5) >>> 0
        let t = this.state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    pick(kind: RngKind, label: string, optionLabels: string[], units?: readonly unknown[]): number {
        if (optionLabels.length <= 1) return optionLabels.length - 1
        const index = this.rollIndex
        if (this.replaying) {
            // The page's own rule (stored decision for this roll index, else PendingDecision).
            const v = super.pick(kind, label, optionLabels, units)
            this.log?.push({ index, kind, label, value: v })
            return v
        }
        const allowed = allowedOptions(kind, label, optionLabels, units)
        let value: number
        const auto = allowed.length === 1
        if (auto) value = allowed[0]
        else {
            if (this.pos >= this.forced.length) throw new SolverPending(kind, label, optionLabels, allowed)
            value = this.forced[this.pos++]
        }
        if (value < 0 || value >= optionLabels.length) throw new Error(`Solver: decision ${value} out of range for "${label}"`)
        this.picks.push({ kind, label, choice: optionLabels[value], value, count: optionLabels.length, auto })
        this.log?.push({ index, kind, label, value })
        const options = optionLabels.map(l => ({ label: l, weight: 100 / optionLabels.length }))
        // Same event as BattleRng.pick records, so a replayed path shows its picks in the roll list.
        ;(this as any).record({ kind, label, options, outcome: value, defaultOutcome: value, decided: true, userPick: true })
        return value
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Resources for dominance
// ---------------------------------------------------------------------------------------------------------------
// Which resources can be compared ("more is better" / "less is better") instead of matched exactly, and the
// thresholds conditions compare them against. Built from every condition the battle can evaluate: the passives and
// states in the battle, the allies' skills (all levels) and every enemy's skills, condition rows and summons -
// including follow-up skills referenced from those details. Two states only compare when every unit sits on the
// same side of every threshold (the "band", part of the exact key); inside a band conditions cannot tell them apart.
const conditionSetCsv = new Map<number, string>((battleConditionSetJson as any[]).map(s => [s.battleConditionSetMstId, String(s.battleConditionMstIdCsv ?? "")]))
const conditionRows = new Map<number, any>((battleConditionJson as any[]).map(c => [c.battleConditionMstId, c]))
const CSV_KEY = /ConditionSet(Mst)?Id(s)?Csv$/i

export class ResourceModel {
    hpPct: number[] = []      // HP_RATIO thresholds (percent)
    epValues: number[] = []   // EP thresholds
    spValues: number[] = []   // team SP thresholds
    hpAbsolute = false        // some condition reads absolute HP: HP is not compared, only matched exactly
    conditionsScanned = 0

    constructor(b: PvPBattle) {
        const sets = new Set<number>()
        const addCsv = (csv: unknown) => { if (typeof csv === "string") for (const x of csv.split(",")) { const n = Number(x); if (n > 0) sets.add(n) } }
        const details: any[] = []
        // 1. The battle graph (banked passives, states, enemy condition rows...).
        const seen = new Set<object>()
        const stack: unknown[] = [b]
        while (stack.length) {
            const v = stack.pop()
            if (!v || typeof v !== "object" || seen.has(v)) continue
            seen.add(v)
            if (v instanceof Map) { for (const [k, x] of v) stack.push(k, x); continue }
            if (v instanceof Set || Array.isArray(v)) { for (const x of v as any) stack.push(x); continue }
            for (const k of Object.keys(v)) {
                const x = (v as any)[k]
                if (CSV_KEY.test(k)) addCsv(x)
                else if (x && typeof x === "object") stack.push(x)
            }
        }
        // 2. Skills: allies at every level, enemies (all waves, summons) by id.
        const team1 = (b as any).team1, team2 = (b as any).team2
        for (const u of team1.kiokuStates) {
            const d = u.kioku?.data ?? {}
            for (const id of [d.skill_id, d.attack_id, d.special_id]) if (id) for (let lvl = 1; lvl <= 20; lvl++) details.push(...(skillDetailsByMstId.get(id * 100 + lvl) ?? []))
        }
        const appearances: QuestEnemyAppearance[] = []
        for (const u of team2.kiokuStates) if (u.enemy?.appearance) appearances.push(u.enemy.appearance)
        for (const w of (b as any).pendingWaves ?? []) for (const k of w) if (k.appearance) appearances.push(k.appearance)
        for (const a of (team2.summonTemplates?.values?.() ?? [])) appearances.push(a)
        for (const a of appearances) {
            const p = enemyParams(a)
            for (const r of p.conditionActions) addCsv(r.conditionSetMstIdCsv)
            for (const id of [...p.skills.map(s => s.skillMstId), ...p.conditionActions.flatMap(r => r.skillMstIds)]) details.push(...enemySkillDetails(id))
        }
        // 3. Details and the skills they reference (follow-ups: value fields holding a skill detail key), to a fixpoint.
        const done = new Set<any>()
        while (details.length) {
            const d = details.pop()
            if (!d || done.has(d)) continue
            done.add(d)
            addCsv(d.activeConditionSetIdCsv); addCsv(d.startConditionSetIdCsv)
            for (const k of Object.keys(d)) if (CSV_KEY.test(k)) addCsv(d[k])
            for (const k of ["value1", "value2", "value3"]) {
                const n = Number(d[k])
                if (n > 1000) details.push(...(skillDetailsByMstId.get(n) ?? []), ...enemySkillDetails(n))
            }
        }
        // 4. Thresholds.
        const hp = new Set<number>([0]), ep = new Set<number>(), sp = new Set<number>()
        for (const set of sets) for (const cid of (conditionSetCsv.get(set) ?? "").split(",")) {
            const c = conditionRows.get(Number(cid))
            if (!c) continue
            this.conditionsScanned++
            const v = Number(c.compareValue)
            if (c.compareContent === 1) this.hpAbsolute = true
            else if (c.compareContent === 2 && Number.isFinite(v)) hp.add(v)
            else if (c.compareContent === 6 && Number.isFinite(v)) ep.add(v)
            else if (c.compareContent === 201 && Number.isFinite(v)) sp.add(v)
        }
        // Boss form changes: f32(hp / max) * 1000 > threshold (permille).
        for (const u of team2.kiokuStates) for (const m of u.team?.modeChange?.infos ?? []) if (m?.threshold) hp.add(m.threshold / 10)
        for (const meta of (b as any).waveMeta ?? []) for (const m of meta.modeChanges ?? []) if (m.threshold) hp.add(m.threshold / 10)
        this.hpPct = [...hp].sort((x, y) => x - y)
        this.epValues = [...ep].sort((x, y) => x - y)
        this.spValues = [...sp].sort((x, y) => x - y)
    }

    private static band(v: number, thresholds: number[]): string {
        let s = ""
        for (const t of thresholds) s += v > t ? "g" : v === t ? "e" : "l"
        return s
    }

    // The exact-match part (bands) and the compared vector (smaller = better in every slot).
    split(b: PvPBattle): { band: string, vec: number[] } {
        const t1 = (b as any).team1, t2 = (b as any).team2
        const vec: number[] = [b.elapsed]
        let band = ""
        for (const u of t2.kiokuStates) {
            const pct = 100 * u.currentHp / Math.max(1, u.maxHp)
            band += "E" + ResourceModel.band(pct, this.hpPct) + (this.hpAbsolute ? `:${u.currentHp}` : "")
            vec.push(u.currentHp)
        }
        if (t2.linkHp) vec.push(t2.linkHp.current)
        for (const u of t1.kiokuStates) {
            const pct = 100 * u.currentHp / Math.max(1, u.maxHp)
            band += "A" + ResourceModel.band(pct, this.hpPct) + (this.hpAbsolute ? `:${u.currentHp}` : "")
                + ResourceModel.band(u.currentMp, this.epValues) + (u.maxMp > 0 && u.currentMp >= u.maxMp ? "F" : "")
            vec.push(-u.currentHp, -u.currentMp)
        }
        band += "S" + ResourceModel.band(t1.currentSp, this.spValues)
        vec.push(-t1.currentSp)
        return { band, vec }
    }
}
// Fields that are resources (compared through ResourceModel.split) or derived from them, left out of the exact key.
const RESOURCE_KEYS = new Set(["currentHp", "currentHpPercent", "_linkSyncedHp", "currentMp", "currentSp", "totalDamageValue"])

// ---------------------------------------------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------------------------------------------
export type SolverNodeStatus =
    | "open"      // waiting to be expanded
    | "expanded"  // its decisions were tried
    | "win" | "lose"
    | "merged"    // same state reached before with no more AV (memoisation)
    | "bound"     // AV (or AV + lower bound) already past the best (+ slack); level lines are kept
    | "cap"       // over the AV cap, or too many actions without a decision
    | "error"
    | "dominated" // an equal-or-better state (dominance) was reached before
    | "foreign"   // another worker searches this branch
    | "skipped"   // the user skipped this branch (can be brought back with focus)
    | "checkpoint" // reached the search's checkpoint (end of the wave / next boss phase)

interface Checkpoint { battle: PvPBattle, mod: ReturnType<typeof saveModuleBattleState> }
interface Pending { kind: RngKind, label: string, options: string[], allowed: number[] }

interface SNode {
    id: number
    parent: number
    depth: number
    elapsed: number
    status: SolverNodeStatus
    remaining: number     // enemy HP left, in waves (next waves count 1 each)
    est: number           // estimated AV at the clear (ordering only)
    picks: SolverPick[]   // decisions on the edge into this node
    steps: number         // executeNextAction calls on the edge (decision action + automatic ones)
    actors: string[]      // who acted on the edge (display)
    children: number[]
    order: number         // generation order among siblings
    cp?: Checkpoint       // only while open (dropped for nodes the beam left behind; rebuilt on demand)
    pending?: Pending
    mergedInto?: number
    note?: string
}

export interface SolverNodeView {
    id: number
    parent: number
    depth: number
    status: SolverNodeStatus
    elapsed: number
    remaining: number
    est: number
    label: string
    picks: { label: string, choice: string, count: number, auto?: boolean }[]
    actors: string[]
    steps: number
    childCount: number
    nextDecision?: string
    mergedInto?: number
    note?: string
    onBestPath?: boolean
}

export interface SolverStats {
    nodes: number
    expanded: number
    actions: number       // executeNextAction calls simulated (incl. re-runs for decisions inside an action)
    merged: number
    dominated: number
    bounded: number       // cut by AV (incl. the lower bound)
    lowerBounded: number  // of which by the lower bound
    symmetry: number      // target options skipped as interchangeable
    capped: number
    wins: number
    losses: number
    errors: number
    open: number
    memoSize: number
    ms: number
    phase: "prefix" | "search" | "done"
    checkpoints: number   // lines that reached the checkpoint goal
    allyFell: number      // lines ended by "stop when an ally dies"
    userSkipped: number   // open nodes skipped by the user (the result is then not proven optimal)
    prefixSize?: number   // nodes in the shared prefix (parallel search)
    bestElapsed?: number
    bestNode?: number
    bestFoundAt?: number  // node count when the best was found
    current?: number      // node being expanded most recently (the search's current path ends there)
    done: boolean         // nothing left to expand: the best is optimal for the model
    stopReason?: string
}

// What the team can do at most, for the estimate and the lower bound (worker: computeMaxDamage).
export interface DamageModel {
    rate: number          // damage per AV at most (every member: best action + follow-up + a share of the ultimate, x SPD)
    ultDamage: number[]   // per ally position: strongest ultimate (all enemies)
    // Per first-wave enemy (by appearance id): the same rate and the sum of every ultimate, against that enemy only.
    perEnemy?: Record<number, { rate: number, burst: number }>
}

// What the team can do at most (Max Damage against the first wave, every enemy broken at its max rate): the
// strongest ultimate per ally, and a damage rate per AV = sum over allies of (best action + follow-up + half an
// ultimate) x SPD / 10000 (a unit with SPD s acts every 10000 / s AV). Used for the estimate's EP credit and, with
// the lower-bound option, as the optimistic rate (times the safety factor, which also covers later waves' DEF,
// haste and extra turns the model does not see).
export function teamDamageModel(allies: PvPKioku[], stageId: number, battle: any): DamageModel | undefined {
    try {
        const meta = stageWaveMeta(stageId)
        const enemies = meta.length ? waveStartUnits(meta[0]) : []
        if (!enemies.length) return undefined
        const res = computeMaxDamage(allies, enemies, 0, { battleType: stageBattleType(stageId), broken: enemies.map(() => true) })
        const ultDamage: number[] = []
        let rate = 0
        const perEnemy: Record<number, { rate: number, burst: number }> = {}
        enemies.forEach(a => { perEnemy[a.questEnemyAppearanceMstId] = { rate: 0, burst: 0 } })
        res.members.forEach((m, i) => {
            const spd = battle.team1.kiokuStates[i]?.currentSpd ?? 100
            const best = (types: TargetType[], pick: (s: { total: { crit: number }, perEnemy: { crit: number }[] }) => number) =>
                Math.max(0, ...[...m.skills.filter(s => types.includes(s.type)), ...(types.includes(TargetType.skillId) && m.switchSkill ? [m.switchSkill] : [])].map(pick))
            const ACT = [TargetType.skillId, TargetType.attackId]
            const ult = best([TargetType.specialId], s => s.total.crit)
            const act = best(ACT, s => s.total.crit)
            const fua = m.followUp?.total.crit ?? 0
            ultDamage.push(ult)
            rate += (act + fua + ult / 2) * spd / 10000
            enemies.forEach((a, e) => {
                const pe = perEnemy[a.questEnemyAppearanceMstId]
                const u = best([TargetType.specialId], s => s.perEnemy[e]?.crit ?? 0)
                const x = best(ACT, s => s.perEnemy[e]?.crit ?? 0)
                pe.rate += (x + (m.followUp?.perEnemy[e]?.crit ?? 0) + u / 2) * spd / 10000
                pe.burst += u
            })
        })
        return { rate, ultDamage, perEnemy }
    } catch (e) {
        console.warn("Fight solver: no damage model", e)
        return undefined
    }
}

export interface SolverOptions {
    maxNodes: number          // stop after creating this many nodes (0 = no limit)
    maxAv: number             // do not expand nodes past this AV (0 = no cap)
    memo: boolean             // exact merging
    dominance?: boolean       // Pareto merging on resources (ResourceModel)
    symmetry?: boolean        // interchangeable targets once
    beamWidth?: number        // beam pre-pass width (0 = off)
    lowerBound?: number       // optimistic lower bound: safety factor on the damage rate (0 = off)
    damage?: DamageModel      // for the estimate (EP credit) and the lower bound
    ultsAsap?: boolean
    ultHabits?: boolean       // Breaker ultimates asap, Attacker ultimates only while an enemy is broken
    loose?: boolean
    stopOnAllyDeath?: boolean // a path ends as a defeat as soon as any ally is down
    maxAutoActions?: number   // decision-free actions in a row before a path is capped (default 600)
    maxBranch?: number        // decision combinations tried per node (default 400)
    partition?: { index: number, count: number }  // parallel search: this worker's share of the prefix frontier
    goal?: SolverGoal         // default "clear"
    slack?: number            // checkpoint goals: keep searching lines up to this much AV slower than the fastest
}

const short = (unit: string) => unit.replace(/ \(Ally \d+\)$/, "").replace(/ \(Enemy (\d+)\)$/, " #$1")

// "Lux☆Magica: Skill → Rose Garden Witch #3; Ult Iroha"
export function summarizePicks(picks: { label: string, choice: string }[]): string {
    const parts: string[] = []
    for (const p of picks) {
        const actor = short(p.label.split(" · ")[0])
        if (p.label.startsWith("Between actions")) {
            if (p.choice.startsWith("Ultimate: ")) parts.push(`Ult ${short(p.choice.slice(10))}`)
        } else if (p.label.endsWith("choose an action")) {
            if (p.choice.startsWith("Ultimate: ")) parts.push(`Ult ${short(p.choice.slice(10))}`)
            else parts.push(`${actor}: ${p.choice.startsWith("Battle Skill") ? "Skill" : p.choice.startsWith("Basic") ? "Basic" : p.choice}`)
        } else {
            const t = `→ ${short(p.choice)}`
            if (parts.length) parts[parts.length - 1] += ` ${t}`; else parts.push(`${actor} ${t}`)
        }
    }
    return parts.join("; ") || (picks.length ? "Hold ultimates" : "(auto)")
}

// Try order (rule of thumb from play): Breaker ultimates first (fired as soon as ready), Attacker ultimates next
// only while an enemy is broken (saved for the break otherwise: after Continue / the action), other ultimates
// before the rest; then the engine's order (Continue, Skill before Basic, targets as listed).
function optionOrder(options: string[], allowed: number[], roleOf: (o: string) => string | undefined, broken: boolean): number[] {
    const rank = (i: number) => {
        const o = options[i]
        if (!isUlt(o)) return 2
        const role = roleOf(o)
        if (role === "Breaker") return 0
        if (role === "Attacker") return broken ? 1 : 3
        return 1
    }
    return [...allowed].sort((a, b) => rank(a) - rank(b) || a - b)
}

export class FightSolver {
    readonly nodes: SNode[] = []
    readonly stats: SolverStats
    readonly opts: SolverOptions
    private stack: number[] = []
    private memo = new Map<string, { elapsed: number, id: number }>()
    private front = new Map<string, { vec: number[], id: number }[]>()   // dominance buckets
    private cloner: BattleCloner
    private hasher: StateHasher
    private resources?: ResourceModel
    private root: Checkpoint
    private t0 = 0
    private bestPath = new Set<number>()
    private externalBound = Infinity
    private rateRef = 0                  // best observed damage rate (absolute HP per AV), for the estimate
    private rootHp = 0
    private beamLevel: number[] = []
    private beamNext: number[] = []
    private beamPos = 0
    readonly resourceInfo: string

    // `build` makes a fresh battle (fresh units) that uses `new SolverRng(...)` and manual ally control; it is
    // called twice: the second battle only serves to find the objects every battle shares (master data).
    // "Solve from here": the opening is replayed first (the simulator's steps with its decisions, `build` makes the
    // battle with a replaying SolverRng), then `prefix.handOver` switches the battle to solver control.
    private prefix?: SolverPrefix
    private prefixSteps = 0
    private prefixSnapshots: BattleSnapshot[] = []
    private start?: Checkpoint            // untouched battle before the opening (for "play from here")
    private pendingFocus?: number

    constructor(build: () => PvPBattle, opts: SolverOptions, prefix?: SolverPrefix) {
        this.opts = opts
        this.prefix = prefix
        let first = build()
        const shared = sharedObjects(first, build())
        this.cloner = new BattleCloner(shared)
        this.hasher = new StateHasher(shared)
        if (prefix) {
            this.start = { battle: this.cloner.cloneBattle(first), mod: saveModuleBattleState() }
            const r = this.replayOpening(first, true)
            first = r.battle
            this.prefixSteps = r.steps
            this.prefixSnapshots = r.snapshots
        }
        symmetrySkipped = 0
        pickFilter = {
            ultsAsap: opts.ultsAsap,
            fingerprint: opts.symmetry ? (u: any) => this.targetFingerprint(u) : undefined,
            ultHabits: opts.ultHabits,
            roleOf: (o: string) => this.roleOf(o),
        }
        if (opts.dominance) this.resources = new ResourceModel(first)
        const r = this.resources
        this.resourceInfo = r ? `${r.conditionsScanned} conditions scanned; HP ${r.hpAbsolute ? "matched exactly (absolute-HP conditions)" : `bands at ${r.hpPct.join("/")}%`}; EP bands ${r.epValues.join("/") || "none"}; SP bands ${r.spValues.join("/") || "none"}` : ""
        first.bindSnapshotHooks(false)
        this.root = { battle: first, mod: saveModuleBattleState() }
        this.stats = {
            nodes: 0, expanded: 0, actions: 0, merged: 0, dominated: 0, bounded: 0, lowerBounded: 0, symmetry: 0, capped: 0,
            wins: 0, losses: 0, errors: 0, open: 0, memoSize: 0, ms: 0, phase: "prefix", done: false, userSkipped: 0, checkpoints: 0, allyFell: 0,
        }
        this.rootHp = this.hpAbs(first)
        const b = this.cloner.cloneBattle(first)
        const rootNode = this.settle({ battle: b, mod: this.root.mod }, -1, 0, [], 0, [])
        // Checkpoints are measured from the first decision (after any automatic actions, e.g. the next wave coming in
        // when the search starts from a cleared wave).
        const rb = rootNode.cp?.battle
        if (rb) { this.rootWave = rb.currentWave; this.rootPhase = this.phaseKey(rb) }
        if (rootNode.status === "open") this.beamLevel = [rootNode.id]
    }

    // Plays the opening: up to `prefix.steps` actions with the page's decisions, stopping before an action that needs
    // a decision the page has not made (the battle as it was before that action), then hands over to the solver.
    private replayOpening(b: PvPBattle, record: boolean): { battle: PvPBattle, steps: number, snapshots: BattleSnapshot[] } {
        const prefix = this.prefix!
        b.bindSnapshotHooks(record)
        const snapshots: BattleSnapshot[] = record ? [b.getCurrentState()] : []
        let steps = 0
        activeBattle = b
        for (; steps < prefix.steps && !b.isOver; steps++) {
            prefix.onStep?.(b, steps)
            const backup = this.cloner.cloneBattle(b, record)
            const mod = saveModuleBattleState()
            try {
                const snaps = b.executeNextAction()
                if (record) snapshots.push(...snaps)
            } catch (e) {
                if (!(e instanceof PendingDecision) && !(e instanceof SolverPending)) throw e
                b = backup
                restoreModuleBattleState(mod)
                activeBattle = b
                break
            }
        }
        ;(b.rng as SolverRng).endReplay()
        prefix.handOver(b)
        b.bindSnapshotHooks(false)
        return { battle: b, steps, snapshots }
    }

    // A unit and its living neighbours (proximity effects hit them), position left out.
    private targetFingerprint(u: any): string {
        const team = u.team?.kiokuStates ?? []
        const near = team.filter((k: any) => k !== u && !k.isDead && Math.abs(k.positionId - u.positionId) === 1).map((k: any) => this.hasher.hashUnit(k)).sort()
        return `${u.team?.isTeam1 ? "A" : "E"}${this.hasher.hashUnit(u)}|${near.join(",")}`
    }

    // "Ultimate: Name (Ally 3)" -> the role of ally 3.
    private roleOf(option: string): string | undefined {
        const m = / \(Ally (\d+)\)$/.exec(option)
        return m ? (this.root.battle as any).team1.kiokuStates[Number(m[1]) - 1]?.kioku?.data?.role : undefined
    }

    setExternalBound(v: number): void { if (v < this.externalBound) this.externalBound = v }
    // Checkpoint goals keep lines up to `slack` AV slower than the fastest (they may arrive with more EP / SP / HP).
    // `slack`: also keep lines up to that much AV slower than the best (clears / checkpoints to choose from).
    private bound(): number {
        return Math.min(this.stats.bestElapsed ?? Infinity, this.externalBound) + (this.opts.slack ?? 0)
    }
    private get goal(): SolverGoal { return this.opts.goal ?? "clear" }

    // ---- checkpoints ----
    private rootWave = 1
    private rootPhase = ""
    readonly candidates: CheckpointView[] = []   // Pareto front of checkpoint states

    // Boss phase: form-change step and the main target's HP bars.
    private phaseKey(b: PvPBattle): string {
        const t2 = (b as any).team2
        const bars = (t2.kiokuStates as any[]).filter(u => u.enemy?.appearance?.isMainTargetEnemy).map(u => u.enemy.hpGaugeCount).join(",")
        return `${b.currentWave}|${t2.modeChange?.step ?? 0}|${bars}`
    }
    private reachedGoal(b: PvPBattle): boolean {
        const g = this.goal
        if (g === "clear") return false
        const t2 = (b as any).team2
        const waveDone = b.currentWave > this.rootWave || (!!t2.waveCleared && ((b as any).pendingWaves?.length ?? 0) > 0)
        if (g === "wave") return waveDone
        return waveDone || this.phaseKey(b) !== this.rootPhase
    }
    // The state card of a node's battle (candidates; "save this line" for any node).
    private stateCard(node: SNode, b: PvPBattle): CheckpointView {
        const t1 = (b as any).team1
        // av: AV until the ally's next turn (its turn gauge; allies keep their gauges into the next wave).
        const allies = (t1.kiokuStates as any[]).map(u => ({
            name: u.kioku?.name ?? "?", ep: u.currentMp, maxEp: u.maxMp, hpPct: 100 * Math.max(0, u.currentHp) / Math.max(1, u.maxHp), dead: !!u.isDead,
            av: u.isDead ? 0 : Math.max(0, Number(u.turnGauge) || 0),
        }))
        const epShare = allies.reduce((a, x) => a + (x.maxEp > 0 ? Math.min(1, x.ep / x.maxEp) : 0), 0)
        const hpShare = allies.reduce((a, x) => a + x.hpPct / 100, 0)
        // A fallen ally counts as a full round's wait.
        const turnWait = Math.round(10 * allies.reduce((a, x) => a + (x.dead ? 100 : x.av), 0)) / 10
        const vec = [node.elapsed, -epShare, -t1.currentSp, turnWait, -hpShare]
        return { id: node.id, elapsed: node.elapsed, round: b.currentRound, wave: b.currentWave, win: node.status === "win", sp: t1.currentSp, allies, enemyHp: node.remaining, vec }
    }

    // A node's state card, replaying its battle (any node).
    nodeCard(id: number): CheckpointView {
        const node = this.nodes[id]
        return this.stateCard(node, (node.cp ?? this.materialize(node)).battle)
    }

    private addCandidate(node: SNode, b: PvPBattle): void {
        const card = this.stateCard(node, b)
        const vec = card.vec
        // Clears: only the AV matters (the 60 fastest are listed); checkpoints: not worse in every way than another.
        const clearGoal = this.goal === "clear"
        if (!clearGoal && this.candidates.some(c => candidateCovers(c.vec, vec))) return
        const keep = clearGoal ? [...this.candidates] : this.candidates.filter(c => !candidateCovers(vec, c.vec))
        keep.push(card)
        // Fastest first; at equal AV the most EP, then SP, then HP first (vec is smaller-is-better).
        keep.sort(compareCandidates)
        this.candidates.length = 0
        this.candidates.push(...keep.slice(0, 60))
    }

    // ---- one action on a copy of a checkpoint ----
    private runAction(cp: Checkpoint, forced: number[]):
        | { done: true, cp: Checkpoint, picks: SolverPick[], actor?: string }
        | { done: false, pending: Pending } {
        const b = this.cloner.cloneBattle(cp.battle)
        restoreModuleBattleState(cp.mod)
        const rng = b.rng as SolverRng
        rng.forced = forced
        rng.pos = 0
        rng.picks = []
        this.stats.actions++
        let snaps: BattleSnapshot[]
        activeBattle = b
        try {
            snaps = b.executeNextAction()
        } catch (e) {
            if (e instanceof SolverPending) return { done: false, pending: { kind: e.kind, label: e.label, options: e.options, allowed: e.allowed } }
            throw e
        } finally {
            this.stats.symmetry = symmetrySkipped
        }
        rng.events.length = 0
        rng.drain()
        const picks = rng.picks
        rng.forced = []
        rng.picks = []
        const actor = snaps.map(s => s.lastActor).filter(Boolean).join(", ")
        return { done: true, cp: { battle: b, mod: saveModuleBattleState() }, picks, actor }
    }

    // Enemy HP left: waves still to come count 1 each; the current wave by its linked pool or its units' HP
    // (HP gauges included).
    private remaining(b: PvPBattle): number {
        const t2 = (b as any).team2
        const later = ((b as any).pendingWaves?.length ?? 0)
        if (b.isOver) return b.result === "win" ? 0 : later + 1
        if (t2.linkHp) return later + t2.linkHp.current / Math.max(1, t2.linkHp.max)
        const units = t2.kiokuStates as any[]
        if (!units.length) return later
        let sum = 0
        for (const u of units) {
            const gauges = Math.max(1, u.enemy?.appearance?.hpGaugeCount ?? 1)
            const left = u.isDead ? 0 : (Math.max(0, (u.enemy?.hpGaugeCount ?? 1) - 1) + Math.max(0, u.currentHp) / Math.max(1, u.maxHp)) / gauges
            sum += left
        }
        return later + sum / units.length
    }

    // Enemy HP left in HP (current units incl. extra HP gauges, plus every later wave at full HP). NaN for endless
    // (Link HP type 1) waves, whose pool is not in HP.
    // (`later` = false: the current wave only - the checkpoint goals stop at its end.)
    private hpAbs(b: PvPBattle, later = this.goal === "clear"): number {
        const t2 = (b as any).team2
        if (b.isOver && b.result === "win") return 0
        if (t2.linkHp?.type === 1) return NaN
        let hp = 0
        if (t2.linkHp?.type === 2) hp = Math.max(0, t2.linkHp.current)
        else for (const u of t2.kiokuStates) if (!u.isDead) hp += Math.max(0, u.currentHp) + Math.max(0, (u.enemy?.hpGaugeCount ?? 1) - 1) * u.maxHp
        if (later) for (const w of (b as any).pendingWaves ?? []) for (const k of w) hp += (k.getBaseHp?.() ?? 0) * Math.max(1, k.appearance?.hpGaugeCount ?? 1)
        return hp
    }

    private allyDown(b: PvPBattle): boolean {
        return ((b as any).team1.kiokuStates as any[]).some(k => k.isDead)
    }

    // EP banked: each ally's EP share of their strongest ultimate (the "break / change waves with full EP" rule
    // of thumb: banked EP counts as damage in hand).
    private bankedDamage(b: PvPBattle): number {
        const ult = this.opts.damage?.ultDamage
        if (!ult) return 0
        let s = 0
        ;((b as any).team1.kiokuStates as any[]).forEach((u, i) => { if (!u.isDead && u.maxMp > 0) s += Math.min(1, u.currentMp / u.maxMp) * (ult[i] ?? 0) })
        return s
    }

    // Estimated AV at the clear: AV so far + (HP left - banked ultimate damage) / damage rate. The rate is the
    // path's own (damage dealt / AV spent) but never below half the best rate seen, nor 0.
    private estimate(b: PvPBattle, remaining: number): number {
        const hp = this.hpAbs(b)
        const el = b.elapsed
        const el0 = this.nodes[0]?.elapsed ?? el
        if (!Number.isFinite(hp) || !Number.isFinite(this.rootHp)) {
            const r0 = this.nodes[0]?.remaining ?? remaining
            const rate = Math.max((r0 - remaining) / Math.max(1, el - el0), 1e-6)
            return el + remaining / rate
        }
        const rate0 = (this.rootHp - hp) / Math.max(1, el - el0)
        if (el - el0 >= 20 && rate0 > this.rateRef) this.rateRef = rate0
        const rate = Math.max(rate0, 0.5 * this.rateRef, (this.opts.damage?.rate ?? 0) * 0.25, 1e-6)
        return el + Math.max(0, hp - this.bankedDamage(b)) / rate
    }

    // Optimistic AV still needed (x 1/safety on every rate):
    //  - current wave: the slowest living enemy to bring down on its own, (its HP - every ultimate on it) / the
    //    team's top rate against it (per-enemy numbers from Max Damage, so overkill on small enemies does not count);
    //  - plus every later wave's HP at the team's top total rate.
    // Endless (Link HP type 1) waves have no HP total: no bound while one is up.
    private lowerBoundAv(b: PvPBattle): number {
        const d = this.opts.damage
        const safety = this.opts.lowerBound ?? 0
        if (this.goal !== "clear" || !d || !(safety > 0) || !(d.rate > 0)) return 0
        const t2 = (b as any).team2
        if (t2.linkHp?.type === 1) return 0
        let now = 0
        for (const u of t2.kiokuStates) {
            if (u.isDead) continue
            const e = d.perEnemy?.[u.enemy?.appearance?.questEnemyAppearanceMstId]
            if (!e || !(e.rate > 0)) continue
            const hp = Math.max(0, u.currentHp) + Math.max(0, (u.enemy?.hpGaugeCount ?? 1) - 1) * u.maxHp
            now = Math.max(now, Math.max(0, hp - e.burst) / (e.rate * safety))
        }
        let later = 0
        for (const w of (b as any).pendingWaves ?? []) for (const k of w) later += (k.getBaseHp?.() ?? 0) * Math.max(1, k.appearance?.hpGaugeCount ?? 1)
        return now + later / (d.rate * safety)
    }

    // Runs decision-free actions from `cp` until the next decision point or the end, and records the node.
    // Synchronous form (the root, replays); the search itself drives settleG / expandG a step at a time.
    private settle(cp: Checkpoint, parent: number, depth: number, picks: SolverPick[], steps: number, actors: string[], order = 0): SNode {
        const g = this.settleG(cp, parent, depth, picks, steps, actors, order)
        let r = g.next()
        while (!r.done) r = g.next()
        return r.value
    }

    // Yields after every simulated action, so the worker can answer the page (stop, history, play...) between any
    // two actions however big an expansion is.
    private *settleG(cp: Checkpoint, parent: number, depth: number, picks: SolverPick[], steps: number, actors: string[], order = 0): Generator<void, SNode, void> {
        const maxAuto = this.opts.maxAutoActions ?? 600
        let pending: Pending | undefined
        let status: SolverNodeStatus = "open"
        let note: string | undefined
        let auto = 0
        try {
            for (;;) {
                if (cp.battle.isOver) { status = cp.battle.result === "win" ? "win" : "lose"; break }
                if (parent >= 0 && this.reachedGoal(cp.battle)) { status = "checkpoint"; break }
                if (this.opts.stopOnAllyDeath && this.allyDown(cp.battle)) { status = "lose"; note = "an ally fell (search option: stop when an ally dies)"; this.stats.allyFell++; break }
                if (this.opts.maxAv > 0 && cp.battle.elapsed > this.opts.maxAv) { status = "cap"; note = `past the ${this.opts.maxAv} AV cap`; break }
                if (auto >= maxAuto) { status = "cap"; note = `${maxAuto} actions without a decision`; break }
                const r = this.runAction(cp, [])
                yield
                if (!r.done) { pending = r.pending; break }
                cp = r.cp
                steps++
                auto++
                if (r.actor) actors.push(r.actor)
                // Picks with a single allowed option (symmetry / ultimates asap) happen inside automatic actions too.
                picks.push(...r.picks)
            }
        } catch (e) {
            status = "error"
            note = String((e as any)?.message ?? e)
            console.warn("Fight solver: engine error", e)
        }
        const b = cp.battle
        const remaining = this.remaining(b)
        const node: SNode = {
            id: this.nodes.length, parent, depth, elapsed: b.elapsed, status, remaining, est: 0, picks, steps,
            actors, children: [], order, note,
        }
        this.nodes.push(node)
        node.est = status === "win" ? b.elapsed : this.estimate(b, remaining)
        this.stats.nodes++
        if (parent >= 0) this.nodes[parent].children.push(node.id)
        const best = this.bound()
        if (this.goal !== "clear" && (status === "win" || status === "checkpoint")) {
            // A checkpoint (or a clear on the way): a candidate; the fastest one sets the bound (+ slack).
            if (status === "win") this.stats.wins++; else this.stats.checkpoints++
            this.addCandidate(node, b)
            if (this.stats.bestElapsed === undefined || node.elapsed < this.stats.bestElapsed) {
                this.stats.bestElapsed = node.elapsed
                this.stats.bestNode = node.id
                this.stats.bestFoundAt = this.stats.nodes
                this.bestPath = new Set(this.pathTo(node.id))
            }
        } else if (status === "win") {
            this.stats.wins++
            this.addCandidate(node, b)
            if (this.stats.bestElapsed === undefined || node.elapsed < this.stats.bestElapsed) {
                this.stats.bestElapsed = node.elapsed
                this.stats.bestNode = node.id
                this.stats.bestFoundAt = this.stats.nodes
                this.bestPath = new Set(this.pathTo(node.id))
            }
        } else if (status === "lose") this.stats.losses++
        else if (status === "cap") this.stats.capped++
        else if (status === "error") this.stats.errors++
        // Strictly slower only: lines level with the best are kept (same AV, different EP / SP / HP).
        else if (node.elapsed > best) { node.status = "bound"; this.stats.bounded++ }
        else if (node.elapsed + this.lowerBoundAv(b) > best) { node.status = "bound"; node.note = "cut by the lower bound"; this.stats.bounded++; this.stats.lowerBounded++ }
        else {
            const rngState = (b.rng as SolverRng).state
            if (this.resources) {
                const { band, vec } = this.resources.split(b)
                const key = this.hasher.hash(b, { rngState, skipKeys: RESOURCE_KEYS, loose: this.opts.loose }) + band
                const list = this.front.get(key) ?? []
                const dom = list.find(e => e.vec.every((x, i) => x <= vec[i]))
                if (dom) {
                    const equal = dom.vec.every((x, i) => x === vec[i])
                    node.status = equal ? "merged" : "dominated"
                    node.mergedInto = dom.id
                    if (equal) this.stats.merged++; else this.stats.dominated++
                    return node
                }
                const kept = list.filter(e => !vec.every((x, i) => x <= e.vec[i]))
                kept.push({ vec, id: node.id })
                if (kept.length > 48) kept.shift()
                this.front.set(key, kept)
                this.stats.memoSize = this.front.size
            } else if (this.opts.memo) {
                const key = this.hasher.hash(b, { rngState, loose: this.opts.loose })
                const seen = this.memo.get(key)
                if (seen && seen.elapsed <= node.elapsed) {
                    node.status = "merged"
                    node.mergedInto = seen.id
                    this.stats.merged++
                    return node
                }
                this.memo.set(key, { elapsed: node.elapsed, id: node.id })
                this.stats.memoSize = this.memo.size
            }
            node.cp = cp
            node.pending = pending
        }
        return node
    }

    // Rebuilds a dropped checkpoint by replaying the node's path from the start.
    private materialize(node: SNode): Checkpoint {
        const path = this.pathTo(node.id).map(i => this.nodes[i])
        const b = this.cloner.cloneBattle(this.root.battle)
        restoreModuleBattleState(this.root.mod)
        const rng = b.rng as SolverRng
        rng.forced = path.flatMap(n => n.picks.filter(p => !p.auto).map(p => p.value))
        rng.pos = 0
        rng.picks = []
        const steps = path.reduce((s, n) => s + n.steps, 0)
        activeBattle = b
        for (let i = 0; i < steps; i++) { this.stats.actions++; b.executeNextAction() }
        rng.events.length = 0
        rng.drain()
        rng.forced = []
        rng.picks = []
        return { battle: b, mod: saveModuleBattleState() }
    }

    // Tries every decision combination of the node's next action; returns the open children, best estimate first.
    // Tries every decision combination of the node's next action (a step per simulated action, see settleG);
    // returns the open children, best estimate first.
    private *expandG(node: SNode): Generator<void, SNode[], void> {
        const maxBranch = this.opts.maxBranch ?? 400
        const leaves: { cp: Checkpoint, picks: SolverPick[], actor?: string }[] = []
        try {
            const cp = node.cp ?? this.materialize(node)
            let pending = node.pending
            if (!pending) {
                const r = this.runAction(cp, [])
                if (r.done) throw new Error("expected a decision at this node")
                pending = r.pending
            }
            const broken = anyEnemyBroken(cp.battle)
            const self = this
            const walk = function* (prefix: number[], p: Pending): Generator<void, void, void> {
                for (const i of optionOrder(p.options, p.allowed, o => self.roleOf(o), broken)) {
                    if (leaves.length >= maxBranch) return
                    const forced = [...prefix, i]
                    const r = self.runAction(cp, forced)
                    yield
                    if (r.done) leaves.push(r)
                    else yield* walk(forced, r.pending)
                }
            }
            yield* walk([], pending)
        } catch (e) {
            node.status = "error"
            node.note = String((e as any)?.message ?? e)
            this.stats.errors++
            node.cp = undefined
            return []
        }
        node.status = "expanded"
        this.stats.expanded++
        node.cp = undefined
        node.pending = undefined
        const children: SNode[] = []
        for (let k = 0; k < leaves.length; k++) {
            const l = leaves[k]
            children.push(yield* this.settleG(l.cp, node.id, node.depth + 1, l.picks, 1, l.actor ? [l.actor] : [], k))
        }
        return children.filter(c => c.status === "open").sort((a, b) => a.est - b.est || a.order - b.order)
    }

    // ---- expansions in progress ----
    private active?: { gen: Generator<void, SNode[], void>, node: SNode, mode: "beam" | "dfs" }
    private parked: { gen: Generator<void, SNode[], void>, node: SNode, mode: "beam" | "dfs" }[] = []
    private focusRoot?: number                  // the branch "search this branch next" is working on
    private skippedRoots = new Set<number>()    // branches the user skipped (children still being made join them)

    private underSkipped(id: number): boolean {
        for (const r of this.skippedRoots) if (this.isUnder(id, r)) return true
        return false
    }

    // An expansion finished: its open children join the beam's next level or the stack (on top; below a focused
    // branch's lines when the expansion was outside it).
    private finishExpansion(node: SNode, open: SNode[], mode: "beam" | "dfs"): void {
        open = open.filter(c => {
            if (!this.underSkipped(c.id)) return true
            c.status = "skipped"; c.cp = undefined; c.pending = undefined; this.stats.userSkipped++
            return false
        })
        if (mode === "beam") { this.beamNext.push(...open.map(c => c.id)); return }
        const ids = open.map(c => c.id)
        if (this.focusRoot !== undefined && !this.isUnder(node.id, this.focusRoot)) this.stack.unshift(...[...ids].reverse())
        else for (let k = ids.length - 1; k >= 0; k--) this.stack.push(ids[k])
    }

    private cutByBound(node: SNode): boolean {
        if (node.elapsed <= this.bound()) return false
        node.status = "bound"; node.cp = undefined; node.pending = undefined; this.stats.bounded++
        return true
    }

    // ---- prefix: beam pass (or, for a parallel search without beam, breadth-first until the frontier is wide) ----
    private prefixStep(): void {
        const width = this.opts.beamWidth ?? 0
        const parts = this.opts.partition?.count ?? 1
        // The pre-pass may use a quarter of the whole search's node budget (the same cap in every worker, so the
        // shared prefix stays identical); then the depth-first part takes over from wherever the beam got to.
        // (No node limit: 2000 nodes per worker.)
        const cap = this.opts.maxNodes > 0 ? Math.max(60, Math.floor(this.opts.maxNodes * parts / 4)) : 2000 * parts
        if (this.stats.nodes >= cap) {
            this.beamLevel = []; this.beamNext = []; this.beamPos = 0
            this.split()
            return
        }
        if (this.beamPos < this.beamLevel.length) {
            const node = this.nodes[this.beamLevel[this.beamPos++]]
            if (node.status !== "open" || this.cutByBound(node)) return
            this.stats.current = node.id
            this.active = { gen: this.expandG(node), node, mode: "beam" }
            return
        }
        // Level done: keep the best `width` (by estimate) for the next level; the others wait (checkpoint dropped).
        const next = this.beamNext.map(id => this.nodes[id]).filter(n => n.status === "open").sort((a, b) => a.est - b.est)
        this.beamNext = []
        this.beamPos = 0
        const openCount = this.nodes.reduce((c, n) => c + (n.status === "open" ? 1 : 0), 0)
        if (width > 0) {
            const keep = next.slice(0, width)
            for (const n of next.slice(width)) { n.cp = undefined; n.pending = undefined }
            this.beamLevel = keep.map(n => n.id)
        } else if (parts > 1 && openCount < 4 * parts && next.length) {
            this.beamLevel = next.map(n => n.id)
        } else this.beamLevel = []
        if (!this.beamLevel.length) this.split()
    }

    // End of the prefix: the open frontier, best estimate first, dealt out round-robin to the workers.
    private split(): void {
        const frontier = this.nodes.filter(n => n.status === "open").sort((a, b) => a.est - b.est || a.id - b.id)
        const p = this.opts.partition ?? { index: 0, count: 1 }
        const mine: SNode[] = []
        frontier.forEach((n, i) => {
            if (i % p.count === p.index) mine.push(n)
            else { n.status = "foreign"; n.cp = undefined; n.pending = undefined }
        })
        for (let k = mine.length - 1; k >= 0; k--) this.stack.push(mine[k].id)
        this.stats.prefixSize = this.nodes.length
        this.stats.phase = "search"
        if (this.pendingFocus !== undefined) { this.focus(this.pendingFocus); this.pendingFocus = undefined }
    }

    // Runs the search for about `budgetMs`. Returns true once the search has finished (or hit the node limit).
    run(budgetMs: number): boolean {
        if (!this.t0) this.t0 = performance.now() - this.stats.ms
        const end = performance.now() + budgetMs
        while (performance.now() < end) {
            // The node limit counts this worker's own nodes (after the shared prefix); the prefix itself may use the
            // whole search's budget (limit x workers).
            const parts = this.opts.partition?.count ?? 1
            const own = this.stats.phase === "prefix" ? this.stats.nodes : this.stats.nodes - (this.stats.prefixSize ?? 0)
            const limit = this.stats.phase === "prefix" ? this.opts.maxNodes * parts : this.opts.maxNodes
            if (this.opts.maxNodes > 0 && own >= limit) { this.stats.stopReason = "node limit"; break }
            // An expansion in progress: one simulated action per step.
            if (this.active) {
                const r = this.active.gen.next()
                if (!r.done) continue
                const { node, mode } = this.active
                this.active = undefined
                this.finishExpansion(node, r.value, mode)
                continue
            }
            if (this.stats.phase === "prefix") {
                if (!this.beamLevel.length && this.beamPos === 0 && !this.beamNext.length) { this.split(); continue }
                if ((this.opts.beamWidth ?? 0) <= 0 && (this.opts.partition?.count ?? 1) <= 1) { this.beamLevel = []; this.beamNext = []; this.split(); continue }
                this.prefixStep()
                continue
            }
            if (!this.stack.length) {
                // Expansions parked by "search this branch next" carry on once nothing else is waiting.
                const p = this.parked.pop()
                if (!p) break
                this.active = p
                this.stats.current = p.node.id
                continue
            }
            const node = this.nodes[this.stack.pop()!]
            if (node.status !== "open" || this.cutByBound(node)) continue
            if (this.focusRoot !== undefined && !this.isUnder(node.id, this.focusRoot)) this.focusRoot = undefined
            this.stats.current = node.id
            this.active = { gen: this.expandG(node), node, mode: "dfs" }
        }
        this.stats.ms = performance.now() - this.t0
        this.stats.open = this.stack.filter(id => this.nodes[id].status === "open").length
        this.stats.done = this.stats.phase === "search" && !this.stack.length && !this.active && !this.parked.length
        if (this.stats.done) { this.stats.stopReason = "search complete"; this.stats.phase = "done" }
        return this.stats.done || this.stats.stopReason === "node limit"
    }

    // ---- the user's priorities (while the search runs) ----
    private isUnder(id: number, root: number): boolean {
        for (let n: SNode | undefined = this.nodes[id]; n; n = n.parent >= 0 ? this.nodes[n.parent] : undefined) if (n.id === root) return true
        return false
    }

    // Search this branch next: its waiting nodes (and any the user skipped) go to the top of the stack, best estimate
    // first. During the pre-pass the beam keeps its order; the branch comes first once the depth-first part starts.
    focus(id: number): number {
        if (!this.nodes[id]) return 0
        // During the pre-pass the beam keeps its order: remembered and applied when the depth-first part starts.
        if (this.stats.phase === "prefix") { this.pendingFocus = id; return -1 }
        const mine = new Set<number>()
        for (const n of this.nodes) {
            if (n.status === "skipped" && this.isUnder(n.id, id)) { n.status = "open"; this.stats.userSkipped--; mine.add(n.id) }
            else if (n.status === "open" && this.isUnder(n.id, id)) mine.add(n.id)
        }
        this.stack = this.stack.filter(x => !mine.has(x))
        const ordered = [...mine].map(x => this.nodes[x]).sort((a, b) => a.est - b.est)
        for (let k = ordered.length - 1; k >= 0; k--) this.stack.push(ordered[k].id)
        for (const r of [...this.skippedRoots]) if (this.isUnder(id, r) || this.isUnder(r, id)) this.skippedRoots.delete(r)
        this.focusRoot = id
        // An expansion elsewhere waits until the branch is done (it is not thrown away).
        if (this.active && this.active.mode === "dfs" && !this.isUnder(this.active.node.id, id)) { this.parked.push(this.active); this.active = undefined }
        if (this.stats.phase === "done" && this.stack.length) { this.stats.phase = "search"; this.stats.done = false; this.stats.stopReason = undefined }
        return mine.size
    }

    // Skip this branch: its waiting nodes leave the search.
    skip(id: number): number {
        let count = 0
        this.skippedRoots.add(id)
        for (const n of this.nodes) if (n.status === "open" && this.isUnder(n.id, id)) {
            n.status = "skipped"; n.cp = undefined; n.pending = undefined; count++
        }
        this.stats.userSkipped += count
        this.stack = this.stack.filter(x => this.nodes[x].status === "open")
        return count
    }

    // Lets a stopped search continue with a new node limit.
    resume(maxNodes: number): void {
        this.opts.maxNodes = maxNodes
        this.stats.stopReason = undefined
        this.t0 = 0
    }

    private rootLabel(): string {
        return this.prefix ? `From your battle (${this.prefixSteps} action${this.prefixSteps === 1 ? "" : "s"} played)` : "Start"
    }

    pathTo(id: number): number[] {
        const path: number[] = []
        for (let n: SNode | undefined = this.nodes[id]; n; n = n.parent >= 0 ? this.nodes[n.parent] : undefined) path.push(n.id)
        return path.reverse()
    }

    view(id: number): SolverNodeView {
        const n = this.nodes[id]
        return {
            id: n.id, parent: n.parent, depth: n.depth, status: n.status, elapsed: n.elapsed, remaining: n.remaining, est: n.est,
            label: n.parent < 0 ? this.rootLabel() : summarizePicks(n.picks),
            picks: n.picks.map(p => ({ label: p.label, choice: p.choice, count: p.count, auto: p.auto })),
            actors: n.actors, steps: n.steps, childCount: n.children.length,
            nextDecision: n.pending?.label, mergedInto: n.mergedInto, note: n.note, onBestPath: this.bestPath.has(n.id),
        }
    }

    // Compact tree for the page's drawing: per node its parent, AV, HP left and edge label (only nodes from `from`
    // on; those never change) plus every node's current status (statuses do change: open -> expanded / cut).
    treeSince(from: number): SolverTreeChunk {
        const n = this.nodes.length
        const k = Math.max(0, n - from)
        const parents = new Int32Array(k), elapsed = new Float64Array(k), remaining = new Float32Array(k), labels: string[] = []
        for (let i = 0; i < k; i++) {
            const node = this.nodes[from + i]
            parents[i] = node.parent
            elapsed[i] = node.elapsed
            remaining[i] = node.remaining
            labels.push(node.parent < 0 ? this.rootLabel() : summarizePicks(node.picks))
        }
        const status = new Uint8Array(n)
        for (let i = 0; i < n; i++) status[i] = SOLVER_STATUSES.indexOf(this.nodes[i].status)
        return { from, parents, elapsed, remaining, labels, status }
    }

    bestPathIds(): number[] {
        return this.stats.bestNode === undefined ? [] : this.pathTo(this.stats.bestNode)
    }

    // The battle from the start up to the node, with display snapshots (a fresh copy of the untouched start).
    history(id: number): { snapshots: BattleSnapshot[], picks: SolverPick[], elapsed: number } {
        const path = this.pathTo(id).map(i => this.nodes[i])
        const forced = path.flatMap(n => n.picks.filter(p => !p.auto).map(p => p.value))
        const steps = path.reduce((s, n) => s + n.steps, 0)
        const b = this.cloner.cloneBattle(this.root.battle, true)
        restoreModuleBattleState(this.root.mod)
        const rng = b.rng as SolverRng
        rng.forced = forced
        rng.pos = 0
        rng.picks = []
        const snapshots: BattleSnapshot[] = [b.getCurrentState()]
        activeBattle = b
        for (let i = 0; i < steps && !b.isOver; i++) {
            try {
                snapshots.push(...b.executeNextAction())
            } catch (e) {
                if (e instanceof SolverPending) break
                throw e
            }
        }
        if (this.prefixSnapshots.length) snapshots.splice(0, 1, ...this.prefixSnapshots)
        return { snapshots, picks: rng.picks, elapsed: b.elapsed }
    }

    // "Play from here": the whole line from the very start as simulator decisions (roll index -> pick), with the
    // number of actions it takes. Replays the opening (its page decisions, flipped rolls included) and the path.
    decisions(id: number): { decisions: [number, RngDecision][], steps: number, openingSteps: number } {
        const path = this.pathTo(id).map(i => this.nodes[i])
        const out = new Map<number, RngDecision>()
        const own = path.reduce((s, n) => s + n.steps, 0)
        let steps = own
        let b: PvPBattle
        if (this.prefix && this.start) {
            b = this.cloner.cloneBattle(this.start.battle)
            restoreModuleBattleState(this.start.mod)
            const rng0 = b.rng as SolverRng
            rng0.log = []
            const flips = [...(((rng0 as any).decisions ?? new Map()) as Map<number, RngDecision>)].filter(([, d]) => !d.pick)
            const r = this.replayOpening(b, false)
            b = r.battle
            steps += r.steps
            const rng = b.rng as SolverRng
            for (const [i, d] of flips) if (i < rng.rollIndex) out.set(i, d)
            for (const l of rng.log ?? []) out.set(l.index, { kind: l.kind, label: l.label, value: l.value, pick: true })
        } else {
            b = this.cloner.cloneBattle(this.root.battle)
            restoreModuleBattleState(this.root.mod)
        }
        const rng = b.rng as SolverRng
        rng.log = []
        rng.forced = path.flatMap(n => n.picks.filter(p => !p.auto).map(p => p.value))
        rng.pos = 0
        rng.picks = []
        activeBattle = b
        for (let i = 0; i < own && !b.isOver; i++) b.executeNextAction()
        for (const l of rng.log) out.set(l.index, { kind: l.kind, label: l.label, value: l.value, pick: true })
        return { decisions: [...out].sort((x, y) => x[0] - y[0]), steps, openingSteps: this.prefixSteps }
    }
}

// Solver control from action `at` on (also what the Battle Simulator does for a line loaded from the solver): allies
// manual, enemies on their targeting AI, `aiSides` picked by the AI as well.
export interface ControlSwitch { at: number, aiSides: ("friend" | "opp")[] }
export function applyControlSwitch(b: PvPBattle, sw: ControlSwitch): void {
    const t1 = (b as any).team1, t2 = (b as any).team2
    t1.manualTargeting = true
    t2.manualTargeting = false
    t1.aiTargetSides = sw.aiSides.length ? new Set(sw.aiSides) : undefined
}

// A line in Battle Simulator terms: decisions by roll index, how many actions it runs, the control it starts with and
// its control switches. "Solve from here" sends the simulator's battle as one (the solver's opening); "play from
// here" turns a node's line into one for the simulator.
export interface SolverLine {
    decisions: [number, RngDecision][]
    steps: number
    control: "auto" | "manual"
    switches: ControlSwitch[]
}

// "Solve from here": the simulator's opening. `build` must give the battle a `new SolverRng(mode, seed, decisions)`
// and the page's control settings; `handOver` then sets solver control (manual allies, AI enemies...).
export interface SolverPrefix {
    steps: number
    handOver: (b: PvPBattle) => void
    onStep?: (b: PvPBattle, step: number) => void   // before each opening action (the page's own control switch)
}

// Status codes of SolverTreeChunk.status.
export const SOLVER_STATUSES: SolverNodeStatus[] = ["open", "expanded", "win", "lose", "merged", "bound", "cap", "error", "dominated", "foreign", "skipped", "checkpoint"]

// Checkpoint goals: where a line stops instead of at the clear.
//   wave       - the current wave is cleared (before the next one comes in)
//   phase      - the boss changes form or loses an HP bar (or the wave ends)
//   checkpoint - whichever comes first (same as phase, kept for the wording)
export type SolverGoal = "clear" | "wave" | "phase" | "checkpoint"

// A state at a checkpoint (or a clear), for the page's candidate list.
// Candidate vectors [AV, -EP share, -SP, Σ AV until each ally's next turn, -HP share]: smaller is better. The first
// four decide (AV, EP, SP and turn order are what make a good state to go on from); HP only breaks exact ties.
// `a` covers `b`: a is at least as good in all four, and on a tie there not worse in HP. (Files saved before the
// turn-wait slot have 4-slot vectors with HP last: compared the same way, slot by slot.)
const DECIDING = 4
export function candidateCovers(a: number[], b: number[]): boolean {
    for (let i = 0; i < DECIDING; i++) if (!((a[i] ?? 0) <= (b[i] ?? 0))) return false
    for (let i = 0; i < DECIDING; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return true
    return (a[DECIDING] ?? 0) <= (b[DECIDING] ?? 0)
}
export function compareCandidates(x: { vec: number[] }, y: { vec: number[] }): number {
    for (let i = 0; i < Math.max(x.vec.length, y.vec.length); i++) { const d = (x.vec[i] ?? 0) - (y.vec[i] ?? 0); if (d) return d }
    return 0
}

export interface CheckpointView {
    id: number
    elapsed: number
    round: number
    wave: number
    win: boolean
    sp: number
    allies: { name: string, ep: number, maxEp: number, hpPct: number, dead: boolean, av?: number }[]
    enemyHp: number       // remaining (waves), as SNode.remaining
    vec: number[]         // [AV, -EP share, -SP, Σ AV to the allies' next turns, -HP share] (see candidateCovers)
}
export interface SolverTreeChunk { from: number, parents: Int32Array, elapsed: Float64Array, remaining: Float32Array, labels: string[], status: Uint8Array }
