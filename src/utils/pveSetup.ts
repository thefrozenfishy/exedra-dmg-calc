// The PvE Simulator's setup as it is saved with a team (saved teams "extra") and shared by link: the stage and
// how its enemies are set up, the damage dealer and effect choices for Max Damage, and everything needed to
// replay the battle exactly: control mode, RNG mode + seed, turn count, every decision (manual picks and changed
// rolls) and the Solo Raid settings/attempts.
//
// Shared setups come from other users, so `sanitizePvESetup` coerces everything into range. It must return the
// page's own state unchanged, because saved teams compare the two to know whether the page matches the team.
import type { RngDecision, RngKind, RngMode } from "../models/BattleRng"
import type { RaidCarry } from "../models/PvPBattle"
import { QUEST_CATEGORY_NAMES, questStages } from "../models/PvE"
import { getScoreAttackStage } from "../models/PvEScore"
import questGroupJson from "../assets/base_data/getQuestGroupMstList.json"

export type PvEControl = "auto" | "manual"

export interface PvESetup {
    stageId: number
    wave: number                     // wave shown in Max Damage (index)
    target: number                   // main target of single-target skills (index in that wave)
    broken: boolean[]                // per enemy of that wave
    breakRate: (number | null)[]     // per enemy broken DMG rate in %, null = the enemy's max
    dealer: number                   // team slot of the damage dealer
    excluded: string[]               // Max Damage effects left out (MaxDmgEffect.key)
    stacks: Record<string, number>   // Max Damage stack overrides (MaxDmgEffect.key -> stacks)
    control: PvEControl
    rngMode: RngMode
    seed: number
    turns: number
    decisions: [number, RngDecision][] // by decision index: manual picks and changed rolls
    ran: boolean                     // the battle had been simulated (so loading re-runs it)
    // noRoundLimit: no longer offered on the page (always false); kept so older saved setups still read the same.
    raid: { partyBuffId: number, noRoundLimit: boolean, attempts: RaidCarry[] } | null
}

const MAX_ENEMIES = 10
const MAX_EFFECT_KEYS = 400
const MAX_DECISIONS = 800
const MAX_LABEL_LENGTH = 500
const MAX_ATTEMPTS = 30
const RNG_MODES: RngMode[] = ["hit", "miss", "weighted", "seed", "manual"]
const RNG_KINDS: RngKind[] = ["crit", "effect", "target", "skill", "action"]
const EFFECT_KEY = /^\d{1,2}:\d{1,12}$/

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const int = (value: unknown, min: number, max: number, fallback: number): number =>
    typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback
const num = (value: unknown, fallback = 0): number =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback

function sanitizeDecision(raw: unknown): RngDecision | null {
    const d = asRecord(raw)
    if (!RNG_KINDS.includes(d.kind as RngKind)) return null
    // The engine matches a stored decision by kind + label, so a label can't be shortened: drop odd ones instead.
    if (typeof d.label !== "string" || d.label.length > MAX_LABEL_LENGTH) return null
    if (typeof d.value !== "boolean" && !(typeof d.value === "number" && Number.isInteger(d.value) && d.value >= 0 && d.value < 1000)) return null
    const decision: RngDecision = { kind: d.kind as RngKind, label: d.label, value: d.value }
    if (d.pick === true) decision.pick = true
    return decision
}

function sanitizeAttempt(raw: unknown): RaidCarry {
    const a = asRecord(raw)
    const carry: RaidCarry = {
        wave: int(a.wave, 1, 100, 1),
        nextEnemyIndex: int(a.nextEnemyIndex, 0, 1000, 0),
        linkHp: Math.max(0, num(a.linkHp)),
        enemies: asArray(a.enemies).slice(0, MAX_ENEMIES * 3).map(raw => {
            const e = asRecord(raw)
            return {
                appearanceId: int(e.appearanceId, 0, 1e12, 0),
                positionId: int(e.positionId, 0, 100, 0),
                hp: Math.max(0, num(e.hp)),
                breakGauge: num(e.breakGauge),
                breakBonus: num(e.breakBonus),
                turnGauge: num(e.turnGauge),
            }
        }),
    }
    const countdown = asRecord(a.countdown)
    if (a.countdown) carry.countdown = { num: int(countdown.num, 0, 1e6, 0), damage: Math.max(0, num(countdown.damage)) }
    const season = asRecord(a.seasonBuff)
    if (a.seasonBuff) carry.seasonBuff = { active: season.active === true, point: num(season.point), gauge: num(season.gauge) }
    return carry
}

export function sanitizePvESetup(raw: unknown): PvESetup {
    const s = asRecord(raw)

    const excluded = [...new Set(asArray(s.excluded).filter((k): k is string => typeof k === "string" && EFFECT_KEY.test(k)))]
        .slice(0, MAX_EFFECT_KEYS).sort()
    const stacksIn = asRecord(s.stacks)
    const stacks = Object.fromEntries(Object.keys(stacksIn).filter(k => EFFECT_KEY.test(k)).sort().slice(0, MAX_EFFECT_KEYS)
        .map(k => [k, int(stacksIn[k], 0, 999, 0)]))

    const seen = new Set<number>()
    const decisions: [number, RngDecision][] = []
    for (const entry of asArray(s.decisions)) {
        const [index, value] = asArray(entry)
        if (!Number.isInteger(index) || (index as number) < 0 || (index as number) > 1e7 || seen.has(index as number)) continue
        const decision = sanitizeDecision(value)
        if (!decision) continue
        seen.add(index as number)
        decisions.push([index as number, decision])
        if (decisions.length >= MAX_DECISIONS) break
    }
    decisions.sort((a, b) => a[0] - b[0])

    const raidIn = s.raid ? asRecord(s.raid) : null

    return {
        stageId: int(s.stageId, 0, 1e12, 0),
        wave: int(s.wave, 0, 50, 0),
        target: int(s.target, 0, MAX_ENEMIES - 1, 0),
        broken: asArray(s.broken).slice(0, MAX_ENEMIES).map(b => b === true),
        breakRate: asArray(s.breakRate).slice(0, MAX_ENEMIES).map(r => typeof r === "number" && Number.isFinite(r) ? int(r, 0, 100000, 0) : null),
        dealer: int(s.dealer, 0, 4, 0),
        excluded,
        stacks,
        control: s.control === "manual" ? "manual" : "auto",
        rngMode: RNG_MODES.includes(s.rngMode as RngMode) ? s.rngMode as RngMode : "seed",
        seed: int(s.seed, 0, 2 ** 32 - 1, 0),
        turns: int(s.turns, 1, 200, 40),
        decisions,
        ran: s.ran === true,
        raid: raidIn ? {
            partyBuffId: int(raidIn.partyBuffId, 0, 1e12, 0),
            noRoundLimit: raidIn.noRoundLimit === true,
            attempts: asArray(raidIn.attempts).slice(0, MAX_ATTEMPTS).map(sanitizeAttempt),
        } : null,
    }
}

// ── Stage names ──

const questGroups = new Map<number, any>((questGroupJson as any[]).map(g => [g.questGroupMstId, g]))

/** Score Attack stages are all called "Score Attack Rank N": show the difficulty instead. */
export function stageLabel(questStageMstId: number): string {
    const sa = getScoreAttackStage(questStageMstId)
    return sa ? `Difficulty ${sa.difficulty}` : questStages.get(questStageMstId)?.name ?? `Stage ${questStageMstId}`
}

/** "Category › Quest › Stage" */
export function stagePath(questStageMstId: number): string {
    const stage = questStages.get(questStageMstId)
    if (!stage) return ""
    const group = questGroups.get(stage.questGroupMstId)
    return [QUEST_CATEGORY_NAMES[group?.questCategoryMstId] ?? "", group?.name ?? "", stageLabel(questStageMstId)].filter(Boolean).join(" › ")
}

/** One line for a shared team's banner. */
export function describePvESetup(raw: unknown): string {
    const s = sanitizePvESetup(raw)
    const picks = s.decisions.filter(([, d]) => d.pick).length
    const rolls = s.decisions.length - picks
    return [
        stagePath(s.stageId) || "Unknown stage",
        s.control === "manual" ? "Manual control" : "Auto control",
        s.rngMode === "seed" ? `seed ${s.seed}` : `${s.rngMode} RNG`,
        picks ? `${picks} decision${picks === 1 ? "" : "s"}` : "",
        rolls ? `${rolls} changed roll${rolls === 1 ? "" : "s"}` : "",
    ].filter(Boolean).join(" · ")
}
