// Max Damage's shared pieces: the team's effect list (collectTeamEffects: every buff/debuff the team can produce, with
// the ladders of mutually exclusive states) and the option / result types. The evaluation itself runs on the 1:1
// engine (battle/EngineMaxDamage.ts).
import type { PvPKioku } from "./PvPKioku";
import type { EnemyTraceStats, HitTrace, UnitStats } from "../battle/EngineDamageTrace";
import { isFriendlyEffect, isOpponentEffect } from "./EffectSide";
import { UNIT_STATE_TYPES } from "./StateAddFilter";
import { conditionCsvsExclusive } from "./ConditionTiers";
import { skillDetailsByMstId } from "../utils/helpers";
import skillMstJson from "../assets/base_data/getSkillMstList.json";
import { BattleType } from "../types/enums";
import { type SkillDetail, skillDetailId, targetRange, TargetType, TargetTypeLookup, targetTypeToLvl } from "../types/KiokuTypes";

export type EffectSide = "ally" | "enemy"

export interface MaxDmgEffect {
    key: string            // `${casterPos}:${detailId}` - stable id for exclude / stack overrides
    casterPos: number
    casterName: string
    source: string         // "Ultimate" / "Battle Skill" / "Basic Attack" / "Switch Skill" / "Follow-up" / "Ability" / "Ascension" / "Crystalis" / "Portrait" / "Support"
    side: EffectSide
    detail: SkillDetail
    maxStacks: number      // 1 unless an ACCUM state
    applies: boolean       // false for self-only effects of another member, and for self-targeted debuffs (drawbacks)
    // Set by the dealer's evaluation (battle/EngineMaxDamage): where the effect actually landed. Undefined when
    // it was left out (excluded, 0 stacks or !applies). UI bookkeeping only.
    reach?: { dealer: boolean, enemies: number[], allies?: number[] }   // allies: team positions holding it (ally side)
    // Also for the dealer's evaluation: the effect-value rate the caster's buff/debuff strength applied (1 = none).
    rate?: number
    // One rung of a ladder of same-type states from the same caster whose ACTIVE conditions exclude each other
    // (Focused Guard "enemies == 5/4/3/2/1", Light Chain "Lv 1..5"): in battle only one can be active, so only one
    // counts here. rank 0 = strongest; `keys` = every rung of the ladder, strongest first.
    // reason "conditions": the rungs' conditions exclude each other (or the game replaces one with the other);
    // "alternative": same-type effects of skills that stand in for each other (a skill and the switch skills replacing
    // it, or the member's different follow-ups) - only the major one counts (the user's rule for the theoretical max).
    tier?: { group: string, rank: number, keys: string[], reason: "conditions" | "alternative" }
    // Skills that stand in for each other: `${casterPos}:${family}` + the variant within it (see collectTeamEffects).
    alt?: { family: string, variant: string }
    // Dealer's evaluation: set on a rung that was left out because another rung of its ladder (this key) is used.
    tierUsed?: string
    // Dealer's evaluation (engine Max Damage only): off unless its key is in MaxDmgOptions.included
    // (battle/EngineMaxDamage.vortexOffByDefault: a vortex user's other vortex). UI bookkeeping.
    defaultOff?: boolean
    // Dealer's evaluation (engine Max Damage only): a self-only buff of another member whose vortex / DoT counts, given to
    // that member because slip damage pops with its owner's buffs (battle/EngineMaxDamage). UI bookkeeping.
    forOwner?: boolean
    // Engine Max Damage: the single-target ally buffs of one of the caster's skills share one target choice
    // (MaxDmgOptions.allyTargets[allyGroup]); allyGroup = the key of the first of them (the card with the ally chips).
    allyGroup?: string
    // Dealer's evaluation (engine Max Damage only): effects of this caster that feed one state in battle (accum / unique
    // states blend, battle/EngineMaxDamage.blendGroups) share this key (the first one's). UI: shown as one card.
    blendGroup?: string
}

// Buff/debuff strength (UP/DWN_BUFF/DEBUFF_EFFECT_VALUE): not a state on the dealer or an enemy, it scales every
// state its holder gives.
export const isEffectValueType = (type: string) => /^(UP|DWN)_(BUFF|DEBUFF)_EFFECT_VALUE$/.test(type)

export interface MaxDmgOptions {
    battleType?: BattleType
    excluded?: Set<string>
    included?: Set<string>        // engine Max Damage: effects that are off by default (MaxDmgEffect.defaultOff) turned on
    // engine Max Damage: a vortex (VORTEX_ATK effect key) put on these enemies only (page enemy indexes), overriding its
    // default and on/off; [] = off
    vortexEnemies?: Record<string, number[]>
    // engine Max Damage: the single-target ally buffs (range 1) of one skill (MaxDmgEffect.allyGroup) given to these team
    // positions instead of the dealer only; [] = off
    allyTargets?: Record<string, number[]>
    stacks?: Map<string, number>
    broken?: boolean[]            // per enemy: evaluate as broken
    breakRate?: (number | undefined)[] // per enemy broken damage rate in % (default: the enemy's max)
    mainTargetIdx?: number        // single-target skills hit this enemy
    onlyPos?: number              // evaluate only this member as the attacker (the others get no skills)
    // Ailment states every enemy carries ("CURSE_ATK", "STUN", ...). When set, conditions about ailments are no longer
    // assumed met but checked against these (ailmentConditionsMet), for the team's effects and the damage rows alike.
    enemyStates?: string[]
    // App tools (Best SA Team calculator): states the stage puts on units for the whole fight (stage buffs, buff
    // strength cuts, an enemy's DEF up), given before the team's effects: ally `index` = team position, enemy `index` =
    // the page's enemy list index, "all" = every unit of that side. `value1` per mille as in the data.
    fieldStates?: { side: "ally" | "enemy", index: number | "all", type: string, value1: number }[]
    // Best SA Team calculator ("Attacker HP when using ultimate"): the dealer's HP in % of its max HP; its HP-ratio
    // conditions are evaluated against it instead of assumed met (battle/EngineMaxDamage). undefined = full HP, met.
    dealerHpPercent?: number
    // App tools (PvE page's attacker loadout search): only the numbers - no follow-ups, no UI bookkeeping (blend groups,
    // where each effect landed).
    scoreOnly?: boolean
    // App tools (Best SA Team calculator, battle/EngineTeamScore): evaluate only the dealer's Ultimate column (no Battle
    // Skill, Basic Attack or Switch Skill runs), the only column a team score reads.
    onlyUltimate?: boolean
    // App tools (Best SA Team estimates): only the every-hit-crits run per column; `normal`, `avg` and `critChance`
    // come back NaN. The crit totals are the same as without it (the ladder choices only compare crit totals).
    critOnly?: boolean
    // PvE page's "Stats for nerds": record the engine's damage steps for the dealer's best skill (MaxDmgResult.trace).
    trace?: boolean
}

// A marker of an ailment on a unit: no damage and never ticks (Max Damage has no turns).
export function ailmentMarker(type: string, i: number): SkillDetail & Record<string, any> {
    return {
        abilityEffectType: type, value1: 0, value2: 0, value3: 0, turn: 99, remainCount: 99, range: targetRange.TARGET,
        element: 0, probability: 1000, activeConditionSetIdCsv: "", startConditionSetIdCsv: "", skillDetailMstId: -1 - i,
    } as any
}

export interface SkillDamage {
    type: TargetType
    label: string
    perEnemy: { normal: number, crit: number, avg: number }[]
    total: { normal: number, crit: number, avg: number }
    critChance: number // % against the main target
    name?: string      // the skill's own name (switch skills and follow-ups)
    note?: string      // e.g. "replaces Battle Skill" / "Ether Blow"
}

export interface MemberDamage {
    pos: number
    name: string
    skills: SkillDamage[]
    best: SkillDamage | undefined   // strongest of skills + switchSkill (not the follow-up: it comes on top of an action)
    switchSkill?: SkillDamage       // strongest SWITCH_SKILL replacement skill
    followUp?: SkillDamage          // strongest AdditionalSkill / EtherBlow (ADDITIONAL_SKILL_ACT)
}

export interface MaxDmgResult {
    effects: MaxDmgEffect[]
    members: MemberDamage[]
    enemies: { name: string, hp: number, def: number, broken: boolean, breakRate: number, canBreak: boolean }[]
    trace?: MaxDmgTrace
}

/** "Stats for nerds" (MaxDmgOptions.trace): the dealer's best skill run once with every hit a crit, as the engine
 *  computed it (battle/EngineDamageTrace). Unit stats are read after the team's effects are given, before the skill. */
export interface MaxDmgTrace {
    skill: string                   // e.g. "Ultimate"
    dealer: UnitStats
    allies: UnitStats[]             // team order (the dealer included)
    enemies: (EnemyTraceStats | undefined)[]   // the page's enemy order
    hits: (HitTrace & { enemyIdx: number })[]  // in order; enemyIdx -1 = not one of the page's enemies
    dealt: number[]                 // per enemy: everything the skill dealt (also final damage etc. not in `hits`)
}

const SKILL_TYPES: [TargetType, string][] = [
    [TargetType.specialId, "Ultimate"], [TargetType.skillId, "Battle Skill"], [TargetType.attackId, "Basic Attack"],
]

// skillMstId -> name and SkillType (1 ActiveSkill, 2 SpecialAttack, 3 NormalAttack, 4 AdditionalSkill, 5 EtherBlow).
const skillMst = new Map<number, { name: string, type: number }>((skillMstJson as any[]).map(s => [s.skillMstId, { name: s.name, type: s.type }]))
const TARGET_OF_SKILL_TYPE: Record<number, TargetType> = { 1: TargetType.skillId, 2: TargetType.specialId, 3: TargetType.attackId }

interface ExtraSkill { type: TargetType, label: string, name?: string, note?: string, details: SkillDetail[], skillType?: string, id?: number }

// [CONFIRMED 3.19] SwitchSkillUnitState: value1 = skill unique id switched to, value3 = the SkillType it replaces, at
// the replaced skill's level. All current ones come from abilities.
function switchSkillsOf(k: PvPKioku): ExtraSkill[] {
    const out: ExtraSkill[] = []
    const seen = new Set<number>()
    for (const d of k.effects) {
        if (d.abilityEffectType !== "SWITCH_SKILL") continue
        const replaced = TARGET_OF_SKILL_TYPE[d.value3 ?? 0]
        if (replaced === undefined) continue
        const lvl = (k as any)[targetTypeToLvl[replaced as keyof typeof targetTypeToLvl]] ?? 1
        const mstId = d.value1 * 100 + lvl
        if (seen.has(mstId)) continue
        seen.add(mstId)
        const replacedLabel = SKILL_TYPES.find(([t]) => t === replaced)?.[1] ?? ""
        out.push({ type: replaced, id: mstId, label: "Switch Skill", name: skillMst.get(mstId)?.name || undefined, note: `replaces ${replacedLabel}`, details: (skillDetailsByMstId.get(mstId) ?? []) as SkillDetail[] })
    }
    return out
}

// Follow-ups: every skill an ADDITIONAL_SKILL_ACT (value1 = exact skill id) of the kit can trigger - from passives,
// the member's own skills or its switch skills. SkillType 4 = AdditionalSkill, 5 = EtherBlow.
function followUpsOf(k: PvPKioku, switches: ExtraSkill[]): ExtraSkill[] {
    const rows = [...k.effects, ...SKILL_TYPES.flatMap(([t]) => skillDetailsOf(k, t)), ...switches.flatMap(s => s.details)]
    const ids = new Set(rows.filter(d => d.abilityEffectType === "ADDITIONAL_SKILL_ACT").map(d => d.value1))
    return [...ids].map(id => {
        const mst = skillMst.get(id)
        return { type: TargetType.fuaId, id, label: "Follow-up", name: mst?.name || undefined, note: mst?.type === 5 ? "Ether Blow" : "Follow-up", details: (skillDetailsByMstId.get(id) ?? []) as SkillDetail[], skillType: mst?.type === 5 ? "EtherBlow" : "AdditionalSkill" }
    })
}


function skillDetailsOf(k: PvPKioku, type: TargetType): SkillDetail[] {
    const id = (k.data as any)[TargetTypeLookup[type as keyof typeof TargetTypeLookup]]
    const lvl = (k as any)[targetTypeToLvl[type as keyof typeof targetTypeToLvl]] ?? 1
    return (skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[]
}

// Damage-over-time ailments (popped by IMM_SLIP_DMG in the engine Max Damage).
export const isSlipDamageType = (type: string) => /^(BURN|POISON|CURSE|BLEED)_/.test(type)

// States (buffs/debuffs that stay on a unit). Instant effects (damage, heals, EP, haste...) are skipped, and DoT
// ailments unless `withSlipDamage` (this model has no turns, nothing pops them).
const isState = (d: SkillDetail, withSlipDamage = false) => UNIT_STATE_TYPES.has(d.abilityEffectType)
    && !["ADDITIONAL_SKILL_ACT", "SWITCH_SKILL", "STUN", "LOCK_TURN_ORDER", "COMBO", "CAN_NOT_ACTION"].includes(d.abilityEffectType)
    // engine Max Damage: DoT ailments (popped by IMM_SLIP_DMG) and CUTOUT (other states are active while their holder
    // has it, e.g. Hollow Woman's ascension 2)
    && (withSlipDamage || (!isSlipDamageType(d.abilityEffectType) && d.abilityEffectType !== "CUTOUT"))

/** Whether any of the kit's skills, switch skills, follow-ups or passives has an effect of `type` (e.g. IMM_SLIP_DMG). */
export function kitHasEffect(k: PvPKioku, type: string): boolean {
    const switches = switchSkillsOf(k)
    return [...k.effects, ...SKILL_TYPES.flatMap(([t]) => skillDetailsOf(k, t)), ...switches.flatMap(s => s.details), ...followUpsOf(k, switches).flatMap(f => f.details)]
        .some(d => d.abilityEffectType === type)
}

// Which part of a kit a passive effect comes from. PvPKioku merges them into one `effects` list, so this reads
// the passive id back: crystalis are stored as full passive ids, the rest as id * 100 + level. UI grouping only.
function passiveOrigin(k: PvPKioku, d: SkillDetail): string {
    const id = (d as any).passiveSkillMstId as number
    const kit = k as any
    if (kit.crys?.includes(id)) return "Crystalis"
    const base = Math.floor(id / 100)
    if (base === k.data.ability_id) return "Ability"
    for (let i = 1; i <= 5; i++) if (base === (k.data as any)[`ascension_${i}_effect_2_id`]) return "Ascension"
    if (kit.portrait && base === kit.portrait.passiveSkill1) return "Portrait"
    if (kit.support && base === kit.support.data.support_id) return "Support"
    return "Passive"
}

// Every buff/debuff the team can produce (`slipDamage`: DoT ailments too).
export function collectTeamEffects(allies: PvPKioku[], attackerPos: number, opts: { slipDamage?: boolean } = {}): MaxDmgEffect[] {
    const out: MaxDmgEffect[] = []
    const seen = new Set<string>()
    const add = (casterPos: number, casterName: string, source: string, d: SkillDetail, alt?: { family: string, variant: string }) => {
        if (!isState(d, opts.slipDamage)) return
        const side: EffectSide | undefined = isFriendlyEffect(d.abilityEffectType) ? "ally" : isOpponentEffect(d.abilityEffectType) ? "enemy" : undefined
        if (!side) return
        const key = `${casterPos}:${skillDetailId(d)}`
        if (seen.has(key)) return
        seen.add(key)
        const isAccum = d.abilityEffectType.includes("ACCUM")
        out.push({
            key, casterPos, casterName, source, side, detail: d, alt,
            maxStacks: isAccum ? Math.max(1, d.value2 || 1) : 1,
            applies: isEffectValueType(d.abilityEffectType) || d.range !== targetRange.SELF || (side === "ally" && casterPos === attackerPos),
        })
    }
    allies.forEach((k, pos) => {
        // Switch skills and follow-ups (incl. Ether Blows) the kit can use.
        const switches = switchSkillsOf(k)
        const followUps = followUpsOf(k, switches)
        for (const [type, label] of SKILL_TYPES) {
            // a skill with switch skills replacing it: the skill and its switch skills are one family of alternatives
            const alt = switches.some(sw => sw.type === type) ? { family: `${type}`, variant: "base" } : undefined
            for (const d of skillDetailsOf(k, type)) add(pos, k.name, label, d, alt)
        }
        for (const d of k.effects) {
            add(pos, k.name, passiveOrigin(k, d), d)
        }
        for (const sw of switches) for (const d of sw.details) add(pos, k.name, "Switch Skill", d, { family: `${sw.type}`, variant: `${sw.id}` })
        for (const fu of followUps) {
            const alt = followUps.length > 1 ? { family: "followUp", variant: `${fu.id}` } : undefined
            for (const d of fu.details) add(pos, k.name, "Follow-up", d, alt)
        }
    })
    assignTiers(out)
    return out
}

// [CONFIRMED 3.19] UnitCondition.GetDuplicateUnitState (0x15c8f90) / b__1 (0x15c7d30): two non-accum states from the
// caster's active skills (any skill, follow-ups included) with the same type, role, element and active condition csv
// replace each other in battle (MECHANICS.md section 8, "Duplicate states"), so only one can count: Light of
// Reckoning's three follow-ups each giving "special attack DMG +x%". Same caster/side/type is already the grouping key.
function isGameDuplicate(a: SkillDetail, b: SkillDetail): boolean {
    if ("passiveSkillDetailMstId" in a || "passiveSkillDetailMstId" in b) return false
    if (a.abilityEffectType.includes("ACCUM") || a.abilityEffectType === "VORTEX_ATK") return false
    return a.abilityEffectType === b.abilityEffectType && (a.role ?? 0) === (b.role ?? 0) && (a.element ?? 0) === (b.element ?? 0)
        && (a.activeConditionSetIdCsv ?? "") === (b.activeConditionSetIdCsv ?? "")
}

// [APPROXIMATION] Ladders of mutually exclusive states (see MaxDmgEffect.tier, ConditionTiers.ts). Grouped per
// caster, side and effect type; strongest first (|value1| x max stacks), each rung pairwise exclusive with the others.
// Ladders that mix effect types (Light Chain Lv n gives final DMG AND resist down) are handled per type, so the
// strongest final-DMG rung and the strongest resist rung are used together (true here: both are Lv 5).
// Two effects of one caster, side and effect type that cannot count together: the game replaces one with the other
// (isGameDuplicate), their active conditions exclude each other, or (withAlternatives) they come from different skills of
// one family of alternatives (a skill and a switch skill replacing it, or two different follow-ups): for those the user's
// rule is "only the major buff counts".
function excludeEachOther(a: MaxDmgEffect, b: MaxDmgEffect, withAlternatives = true): boolean {
    if (isGameDuplicate(a.detail, b.detail)) return true
    if (!!a.detail.activeConditionSetIdCsv && !!b.detail.activeConditionSetIdCsv && conditionCsvsExclusive(a.detail.activeConditionSetIdCsv, b.detail.activeConditionSetIdCsv)) return true
    return withAlternatives && !!a.alt && !!b.alt && a.alt.family === b.alt.family && a.alt.variant !== b.alt.variant
}

function assignTiers(effects: MaxDmgEffect[]) {
    const byType = new Map<string, MaxDmgEffect[]>()
    for (const e of effects) {
        if (isEffectValueType(e.detail.abilityEffectType)) continue
        const k = `${e.casterPos}:${e.side}:${e.detail.abilityEffectType}`
        byType.set(k, [...(byType.get(k) ?? []), e])
    }
    const strength = (e: MaxDmgEffect) => Math.abs(e.detail.value1 ?? 0) * e.maxStacks
    for (const list of byType.values()) {
        if (list.length < 2) continue
        const ladders: MaxDmgEffect[][] = []
        for (const e of [...list].sort((a, b) => strength(b) - strength(a))) {
            const ladder = ladders.find(l => l.every(o => excludeEachOther(o, e)))
            if (ladder) ladder.push(e)
            else ladders.push([e])
        }
        for (const ladder of ladders) {
            if (ladder.length < 2) continue
            const keys = ladder.map(e => e.key)
            const reason = ladder.every((o, i) => ladder.every((e, j) => i === j || excludeEachOther(o, e, false))) ? "conditions" : "alternative"
            ladder.forEach((e, rank) => { e.tier = { group: keys[0], rank, keys, reason } })
        }
    }
}
