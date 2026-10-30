// PvE Simulator "Max Damage" panel off the main thread: battle/EngineMaxDamage launches every skill in fresh engine
// battles (tens of battle setups per evaluation, ~0.3-1.5 s), too slow to run on the page while the user toggles
// effects. The page posts the inputs; a newer request supersedes an older one (only the latest is answered).
import "../models/BestTeamCalculator" // load order (Kioku <-> BestTeamCalculator cycle)
import { computeMaxDamageEngine } from "../battle/EngineMaxDamage"
import type { MaxDmgOptions, MaxDmgResult } from "../models/MaxDamage"
import type { QuestEnemyAppearance } from "../models/PvE"
import type { PvPKioku } from "../models/PvPKioku"
import type { TeamSlot } from "../types/BestTeamTypes"
import { buildSlotKioku } from "../utils/pvpExport"
import { PvPKioku as PvPKiokuClass } from "../models/PvPKioku"
import { scoreTeam, type TeamScore, type TeamScoreScenario } from "../battle/EngineTeamScore"
import type { KiokuArgs } from "../types/KiokuTypes"

export interface MaxDamageRequest {
    id: number
    slots: TeamSlot[]            // filled team slots, in team order
    stageId: number
    waveIdx: number
    wave: QuestEnemyAppearance[] // the enemies at the wave's start (the page's list, result index order)
    dealerPos: number
    opts: MaxDmgOptions
}
export type MaxDamageMessage = { id: number, result?: MaxDmgResult, error?: string }

console.debug = () => { }
const warn = console.warn
let warnings = 0
console.warn = (...a: unknown[]) => { if (warnings++ < 20) warn(...a) }

// Built kiokus by slot (building one is ~100 ms; the team rarely changes between requests).
const kiokus = new Map<string, PvPKioku>()
function kiokuOf(slot: TeamSlot): PvPKioku {
    const key = JSON.stringify(slot)
    let k = kiokus.get(key)
    if (!k) {
        if (kiokus.size > 50) kiokus.clear()
        kiokus.set(key, k = buildSlotKioku(slot))
    }
    return k
}

let pending: MaxDamageRequest | undefined
let busy = false

function next() {
    if (busy || !pending) return
    const req = pending
    pending = undefined
    busy = true
    // yield first so a burst of requests (typing a stack count) collapses into the last one
    setTimeout(() => {
        try {
            if (pending && pending.id > req.id) return
            const result = computeMaxDamageEngine(req.slots.map(kiokuOf), { stageId: req.stageId, waveIdx: req.waveIdx }, req.wave, req.dealerPos, req.opts)
            self.postMessage({ id: req.id, result } satisfies MaxDamageMessage)
        } catch (e) {
            self.postMessage({ id: req.id, error: String((e as Error)?.stack ?? e) } satisfies MaxDamageMessage)
        } finally {
            busy = false
            next()
        }
    }, 0)
}

// ---- Best SA Team calculator (pages/BestTeamPage, models/EngineBestTeam): batches of teams scored on the engine.
// The same worker file as the Max Damage panel, so the build bundles the engine for workers once less.

export interface TeamScoreBatch { kind: "teams", batch: number, scenario?: TeamScoreScenario, jobs: { id: number, team: KiokuArgs[], maxOnly?: boolean }[] }
export type TeamScoreReply = { kind: "teams", batch: number, scores: { id: number, score?: TeamScore, error?: string }[] }

let scenario: TeamScoreScenario | undefined
const teamKiokus = new Map<string, PvPKioku>()
function teamKioku(args: KiokuArgs): PvPKioku {
    const key = JSON.stringify(args)
    let k = teamKiokus.get(key)
    if (!k) {
        if (teamKiokus.size > 2000) teamKiokus.clear()
        teamKiokus.set(key, k = new PvPKiokuClass(args))
    }
    return k
}

function scoreBatch(msg: TeamScoreBatch) {
    if (msg.scenario) scenario = msg.scenario
    const scores = msg.jobs.map(({ id, team, maxOnly }) => {
        try { return { id, score: scoreTeam(team.map(teamKioku), scenario!, maxOnly) } }
        catch (e) { return { id, error: String((e as Error)?.message ?? e) } }
    })
    self.postMessage({ kind: "teams", batch: msg.batch, scores } satisfies TeamScoreReply)
}

// ---- PvE Simulator "find best attacker loadout" (models/EngineAttackerLoadout): the page's Max Damage with one
// dealer loadout per job (the other members, stage, wave and effect choices stay as on the page), only the dealer
// evaluated, numbers only. Same worker file for the same reason as above.

export interface LoadoutContext {
    stageId: number
    waveIdx: number
    wave: QuestEnemyAppearance[]
    dealerPos: number
    opts: MaxDmgOptions
}
/** The dealer's strongest column by crit total and by average total. */
export interface LoadoutScore { crit: number, avg: number, critChance: number, critSkill: string, avgSkill: string }
export interface LoadoutScoreBatch { kind: "loadout", batch: number, context?: LoadoutContext, jobs: { id: number, slots: TeamSlot[] }[] }
export type LoadoutScoreReply = { kind: "loadout", batch: number, scores: { id: number, score?: LoadoutScore, error?: string }[] }

let loadoutContext: LoadoutContext | undefined
const loadoutKiokus = new Map<string, PvPKioku>()
function loadoutKioku(slot: TeamSlot): PvPKioku {
    const key = JSON.stringify(slot)
    let k = loadoutKiokus.get(key)
    if (!k) {
        if (loadoutKiokus.size > 400) loadoutKiokus.clear()
        loadoutKiokus.set(key, k = buildSlotKioku(slot))
    }
    return k
}

function scoreLoadout(slots: TeamSlot[], c: LoadoutContext): LoadoutScore | undefined {
    const result = computeMaxDamageEngine(slots.map(loadoutKioku), { stageId: c.stageId, waveIdx: c.waveIdx }, c.wave, c.dealerPos,
        { ...c.opts, onlyPos: c.dealerPos, scoreOnly: true, trace: false })
    const m = result.members[c.dealerPos]
    const cols = [...(m?.skills ?? []), ...(m?.switchSkill ? [m.switchSkill] : [])]
    if (!cols.length) return undefined
    const byCrit = cols.reduce((b, s) => s.total.crit > b.total.crit ? s : b)
    const byAvg = cols.reduce((b, s) => s.total.avg > b.total.avg ? s : b)
    const label = (s: typeof byCrit) => s.name ? `${s.label} (${s.name})` : s.label
    return { crit: byCrit.total.crit, avg: byAvg.total.avg, critChance: byCrit.critChance, critSkill: label(byCrit), avgSkill: label(byAvg) }
}

function loadoutBatch(msg: LoadoutScoreBatch) {
    if (msg.context) { loadoutContext = msg.context; loadoutKiokus.clear() }
    const scores = msg.jobs.map(({ id, slots }) => {
        try { return { id, score: scoreLoadout(slots, loadoutContext!) } }
        catch (e) { return { id, error: String((e as Error)?.message ?? e) } }
    })
    self.postMessage({ kind: "loadout", batch: msg.batch, scores } satisfies LoadoutScoreReply)
}

// ---- PvE Simulator "what was missing?" (models/EngineDamageDiagnosis): the page's Max Damage for the dealer with some
// effects taken away (more excluded keys, a vortex taken off every enemy, fewer stacks), the rest as on the page.
// Same worker file for the same reason as above.

export interface VariantContext extends LoadoutContext { slots: TeamSlot[] }
/** On top of the page's choices: these keys off, these vortexes on these enemies, these stack counts. */
export interface VariantChange { excluded?: string[], vortexEnemies?: Record<string, number[]>, stacks?: [string, number][] }
/** The dealer's columns (skills + switch skill, as `label` / `name`): damage per enemy, every hit a crit and none. */
export interface VariantColumn { label: string, name?: string, perEnemy: { normal: number, crit: number }[] }
export interface VariantBatch { kind: "variant", batch: number, context?: VariantContext, jobs: { id: number, change: VariantChange }[] }
export type VariantReply = { kind: "variant", batch: number, scores: { id: number, columns?: VariantColumn[], error?: string }[] }

let variantContext: VariantContext | undefined

function scoreVariant(change: VariantChange, c: VariantContext): VariantColumn[] {
    const excluded = new Set(c.opts.excluded ?? [])
    for (const k of change.excluded ?? []) excluded.add(k)
    const stacks = new Map(c.opts.stacks ?? [])
    for (const [k, n] of change.stacks ?? []) stacks.set(k, n)
    const opts: MaxDmgOptions = {
        ...c.opts, excluded, stacks, vortexEnemies: { ...c.opts.vortexEnemies, ...change.vortexEnemies },
        onlyPos: c.dealerPos, scoreOnly: true, trace: false,
    }
    const result = computeMaxDamageEngine(c.slots.map(loadoutKioku), { stageId: c.stageId, waveIdx: c.waveIdx }, c.wave, c.dealerPos, opts)
    const m = result.members[c.dealerPos]
    return [...(m?.skills ?? []), ...(m?.switchSkill ? [m.switchSkill] : [])]
        .map(s => ({ label: s.label, name: s.name, perEnemy: s.perEnemy.map(x => ({ normal: x.normal, crit: x.crit })) }))
}

function variantBatch(msg: VariantBatch) {
    if (msg.context) { variantContext = msg.context; loadoutKiokus.clear() }
    const scores = msg.jobs.map(({ id, change }) => {
        try { return { id, columns: scoreVariant(change, variantContext!) } }
        catch (e) { return { id, error: String((e as Error)?.message ?? e) } }
    })
    self.postMessage({ kind: "variant", batch: msg.batch, scores } satisfies VariantReply)
}

self.onmessage = (e: MessageEvent<MaxDamageRequest | TeamScoreBatch | LoadoutScoreBatch | VariantBatch>) => {
    if ((e.data as TeamScoreBatch).kind === "teams") return scoreBatch(e.data as TeamScoreBatch)
    if ((e.data as LoadoutScoreBatch).kind === "loadout") return loadoutBatch(e.data as LoadoutScoreBatch)
    if ((e.data as VariantBatch).kind === "variant") return variantBatch(e.data as VariantBatch)
    pending = e.data as MaxDamageRequest
    next()
}
