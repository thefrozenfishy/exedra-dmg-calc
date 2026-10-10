// Deep copies of a running battle and a structural hash of its state, for the fight solver (models/FightSolver.ts).
//
// Not a game rule: simulation plumbing. A PvPBattle is a plain object graph (~1k objects: teams, units, states,
// kioku builds) plus master-data objects shared with the rest of the app. A clone copies every object of the
// graph, keeping prototypes (KiokuState, PvPTeam, ... methods keep working), Maps, Sets, arrays and the
// cross-references between them (memoised, so cycles and shared references stay shared inside the copy).
//
// Shared objects are NOT copied: anything reachable from two independently built battles (`sharedObjects`) is
// module-level data (master rows, skill details, kiokuData, constants) and stays one instance, exactly as it is
// when the simulator page rebuilds a battle from scratch for every replay.
//
// Functions are copied by reference. The engine keeps no closures over battle objects except the per-skill
// snapshot hook, which PvPBattle.bindSnapshotHooks re-creates for the clone (cloneBattle does that), and the base
// BattleRng's seeded generator, which the solver's RNG replaces with a plain numeric state.
import { PvPBattle } from "./PvPBattle";
import { PvPTeam } from "./PvPTeam";
import { BattleRng } from "./BattleRng";

type Obj = Record<string, any>

// Every object reachable from `root` (own enumerable fields, Map keys/values, Set values, array items).
export function reachableObjects(root: unknown, into = new Set<object>()): Set<object> {
    const stack: unknown[] = [root]
    while (stack.length) {
        const v = stack.pop()
        if (v === null || typeof v !== "object" || into.has(v)) continue
        into.add(v)
        if (v instanceof Map) { for (const [k, x] of v) { stack.push(k, x) } continue }
        if (v instanceof Set) { for (const x of v) stack.push(x); continue }
        if (Array.isArray(v)) { for (const x of v) stack.push(x); continue }
        for (const k of Object.keys(v)) stack.push((v as Obj)[k])
    }
    return into
}

// Objects present in both graphs: module-level data, never part of one battle's state.
export function sharedObjects(a: unknown, b: unknown): Set<object> {
    const inA = reachableObjects(a)
    const out = new Set<object>()
    for (const o of reachableObjects(b)) if (inA.has(o)) out.add(o)
    return out
}

export class BattleCloner {
    readonly shared: Set<object>
    constructor(shared: Set<object>) { this.shared = shared }

    clone<T>(root: T): T {
        const memo = new Map<object, any>()
        const shared = this.shared
        const copy = (v: any): any => {
            if (v === null || typeof v !== "object" || shared.has(v)) return v
            const seen = memo.get(v)
            if (seen !== undefined) return seen
            if (Array.isArray(v)) {
                const c: any[] = new Array(v.length)
                memo.set(v, c)
                for (let i = 0; i < v.length; i++) c[i] = copy(v[i])
                return c
            }
            if (v instanceof Map) {
                const c = new Map()
                memo.set(v, c)
                for (const [k, x] of v) c.set(copy(k), copy(x))
                return c
            }
            if (v instanceof Set) {
                const c = new Set()
                memo.set(v, c)
                for (const x of v) c.add(copy(x))
                return c
            }
            if (v instanceof Date) { const c = new Date(v.getTime()); memo.set(v, c); return c }
            if (Object.isFrozen(v)) return v
            const c = Object.create(Object.getPrototypeOf(v))
            memo.set(v, c)
            for (const k of Object.keys(v)) c[k] = copy(v[k])
            return c
        }
        return copy(root)
    }

    // A playable copy of a battle: hooks re-bound to the copy (record = false: no display snapshots).
    cloneBattle(b: PvPBattle, record = false): PvPBattle {
        const c = this.clone(b)
        c.bindSnapshotHooks(record)
        return c
    }
}

// ---------------------------------------------------------------------------------------------------------------
// State hash
// ---------------------------------------------------------------------------------------------------------------
// Two battles with the same hash are in the same state for everything that decides what happens next. Left out:
// display / bookkeeping fields (snapshots, event logs, recorded rolls, the seed), the elapsed time (the solver
// compares it separately: at equal state, less elapsed time dominates - only the Solo Raid round limit reads it),
// and the raw values of global tie-break counters (turn-order priority stamps), which are replaced by their rank
// among the battle's units since only their order matters. Shared (master-data) objects hash by identity.
// Anything else that differs between two equivalent states (e.g. a numbered Map key) only costs a missed merge,
// never a wrong one.
// (By instanceof, not constructor.name: class names are minified in the production build.)
const BATTLE_SKIP = new Set(["actionSnapshots", "elapsed", "seed", "debug", "lastActor", "lastTargetType", "lastTeamIsTeam1"])
const TEAM_SKIP = new Set(["eventLog", "snapshotHook", "betweenActsHook", "debug", "rng"])
const STAMP_KEYS = new Set(["turnOrderPriority", "effectTurnPriority"])

const f64 = new Float64Array(1)
const u32 = new Uint32Array(f64.buffer)

export interface HashOptions {
    rngState?: number          // the solver RNG's draw state (seed mode)
    skipKeys?: Set<string>     // extra fields to leave out (dominance: the resources compared separately)
    // Loose merging (fight solver option, inexact): non-integer numbers rounded to 0.5 (turn gauges in AV, speeds),
    // `currentHp` to 0.1% of the unit's max HP.
    loose?: boolean
}

// Unit fingerprint (fight solver symmetry): everything of the unit itself; other units are referred to by side and
// slot, its own position is left out (two identical minions in different slots compare equal).
const UNIT_SKIP = new Set(["team", "posIdx", "positionId"])
// KiokuState is not imported here (PvPTeam module); recognised by the fields every unit has.
const isUnit = (v: any) => v && typeof v === "object" && "posIdx" in v && "team" in v && "kioku" in v

export class StateHasher {
    private ids = new WeakMap<object, number>()
    private nextId = 1
    readonly shared: Set<object>
    constructor(shared: Set<object>) { this.shared = shared }

    private sharedId(o: object): number {
        let id = this.ids.get(o)
        if (id === undefined) { id = this.nextId++; this.ids.set(o, id) }
        return id
    }

    // 64-bit hash (two 32-bit lanes) of a whole battle as a 16-char hex string.
    hash(b: PvPBattle, opts: HashOptions | number = {}): string {
        const o: HashOptions = typeof opts === "number" ? { rngState: opts } : opts
        // Turn-order stamps -> rank among every unit of the battle.
        const units = [...(b as any).team1.kiokuStates, ...(b as any).team2.kiokuStates]
        return this.walkHash(b, o, units)
    }

    // Fingerprint of one unit (see UNIT_SKIP). Same value = interchangeable as a target.
    hashUnit(u: object): string {
        return this.walkHash(u, {}, [...((u as any).team?.kiokuStates ?? []), ...((u as any).team?.otherTeam?.kiokuStates ?? [])], u)
    }

    private walkHash(root: object, o: HashOptions, units: any[], unitRoot?: object): string {
        let h1 = 0x811c9dc5 | 0, h2 = 0x9747b28c | 0
        const mix = (x: number) => {
            h1 = Math.imul(h1 ^ x, 0x01000193)
            h2 = Math.imul(h2 ^ x, 0x5bd1e995); h2 ^= h2 >>> 13
        }
        const str = (s: string) => { mix(s.length + 0x51ed27); for (let i = 0; i < s.length; i++) mix(s.charCodeAt(i)) }
        const loose = !!o.loose
        const num = (n: number) => {
            if (loose && !Number.isInteger(n)) n = Math.round(n * 2) / 2
            if (Number.isInteger(n) && Math.abs(n) < 2 ** 31) { mix(0x1001); mix(n | 0); return }
            f64[0] = n; mix(0x1002); mix(u32[0]); mix(u32[1])
        }
        const stamps = [...new Set(units.flatMap(u => [u.turnOrderPriority, u.effectTurnPriority]).filter(v => typeof v === "number"))].sort((x, y) => x - y)
        const rank = new Map(stamps.map((v, i) => [v, i]))
        const skipKeys = o.skipKeys

        const visited = new Map<object, number>()
        const shared = this.shared
        const walk = (v: any, key?: string, parent?: any): void => {
            switch (typeof v) {
                case "undefined": mix(0x2001); return
                case "boolean": mix(v ? 0x2002 : 0x2003); return
                case "number":
                    if (key && STAMP_KEYS.has(key) && rank.has(v)) { mix(0x2004); mix(rank.get(v)!) }
                    else if (loose && key === "currentHp" && typeof parent?.maxHp === "number") { mix(0x2010); mix(Math.round(v / Math.max(1, parent.maxHp / 1000))) }
                    else num(v)
                    return
                case "string": str(v); return
                case "function": mix(0x2005); return
                case "bigint": str(v.toString()); return
                case "symbol": mix(0x2006); return
            }
            if (v === null) { mix(0x2007); return }
            if (shared.has(v)) { mix(0x2008); mix(this.sharedId(v)); return }
            if (unitRoot) {
                // Other units, teams, the battle: by reference only.
                if (v !== unitRoot && isUnit(v)) { mix(0x2011); mix(v.team?.isTeam1 ? 1 : 2); mix(v.posIdx); return }
                if (v instanceof PvPTeam || v instanceof PvPBattle || v instanceof BattleRng) { mix(0x2012); mix(v instanceof PvPTeam && v.isTeam1 ? 1 : 2); return }
            }
            const seen = visited.get(v)
            if (seen !== undefined) { mix(0x2009); mix(seen); return }
            visited.set(v, visited.size)
            if (Array.isArray(v)) { mix(0x3001); mix(v.length); for (const x of v) walk(x); return }
            if (v instanceof Map) {
                mix(0x3002); mix(v.size)
                let vortex = 0
                for (const [k, x] of v) {
                    // vortex:<global counter> keys (PvPTeam vortexSeq) -> their order in this Map.
                    if (typeof k === "string" && k.startsWith("vortex:")) str(`vortex#${vortex++}`); else walk(k)
                    walk(x)
                }
                return
            }
            if (v instanceof Set) { mix(0x3003); mix(v.size); for (const x of v) walk(x); return }
            if (v instanceof BattleRng) { mix(0x3004); num(o.rngState ?? 0); return }
            const proto = Object.getPrototypeOf(v)
            mix(0x3005); mix(proto ? this.sharedId(proto) : 0)
            const skip = v instanceof PvPBattle ? BATTLE_SKIP : v instanceof PvPTeam ? TEAM_SKIP : v === unitRoot ? UNIT_SKIP : undefined
            for (const k of Object.keys(v)) {
                if (skip?.has(k) || skipKeys?.has(k)) continue
                str(k)
                walk(v[k], k, v)
            }
        }
        walk(root)
        return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0")
    }
}
