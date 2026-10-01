// "Theoretical max damage" against a PvE wave, computed with the battle engine's own damage pipeline
// (DamageCalculator.getAttackDamageResult) instead of the old closed-form ScoreAttackTeam formula.
//
// Every buff/debuff the team can produce (active skills of every member, passives, crystalis, portraits,
// supports, follow-up skills) is put on the attacker / the enemies at full stacks, with conditions assumed
// met, then each member's ultimate / battle skill / basic attack is evaluated against every enemy, with and
// without a crit. Individual effects can be excluded and stack counts overridden.
import { PvPTeam, KiokuState, isFriendlyEffect, isOpponentEffect, scaleGivenState } from "./PvPTeam";
import type { PvPKioku } from "./PvPKioku";
import { BattleType, DamageBaseType, damageBaseTypeFromEffectType, getAttackDamageResult, getAdditionalDamageBase, critChance } from "./DamageCalculator";
import { isEligibleForEffect } from "./UnitStateEngine";
import { UNIT_STATE_TYPES } from "./StateAddFilter";
import { enemyKiokus } from "./PvEBattle";
import type { QuestEnemyAppearance } from "./PvE";
import { skillDetailsByMstId } from "../utils/helpers";
import { type SkillDetail, skillDetailId, targetRange, TargetType, TargetTypeLookup, targetTypeToLvl } from "../types/KiokuTypes";

export type EffectSide = "ally" | "enemy"

export interface MaxDmgEffect {
    key: string            // `${casterPos}:${detailId}` - stable id for exclude / stack overrides
    casterPos: number
    casterName: string
    source: string         // "Ultimate" / "Battle Skill" / "Basic Attack" / "Follow-up" / "Ability" / "Ascension" / "Crystalis" / "Portrait" / "Support"
    side: EffectSide
    detail: SkillDetail
    maxStacks: number      // 1 unless an ACCUM state
    applies: boolean       // false for self-only effects of another member, and for self-targeted debuffs (drawbacks)
    // Set by computeMaxDamage for the damage dealer's evaluation: where the effect actually landed. Undefined when
    // it was left out (excluded, 0 stacks or !applies). UI bookkeeping only.
    reach?: { dealer: boolean, enemies: number[] }
    // Also for the dealer's evaluation: the effect-value rate the caster's buff/debuff strength applied (1 = none).
    rate?: number
}

// Buff/debuff strength (UP/DWN_BUFF/DEBUFF_EFFECT_VALUE): not a state on the dealer or an enemy, it scales every
// state its holder gives (PvPTeam.scaleGivenState).
export const isEffectValueType = (type: string) => /^(UP|DWN)_(BUFF|DEBUFF)_EFFECT_VALUE$/.test(type)

export interface MaxDmgOptions {
    battleType?: BattleType
    excluded?: Set<string>
    stacks?: Map<string, number>
    broken?: boolean[]            // per enemy: evaluate as broken
    breakRate?: (number | undefined)[] // per enemy broken damage rate in % (default: the enemy's max)
    mainTargetIdx?: number        // single-target skills hit this enemy
    onlyPos?: number              // evaluate only this member as the attacker (the others get no skills)
}

export interface SkillDamage {
    type: TargetType
    label: string
    perEnemy: { normal: number, crit: number, avg: number }[]
    total: { normal: number, crit: number, avg: number }
    critChance: number // % against the main target
}

export interface MemberDamage {
    pos: number
    name: string
    skills: SkillDamage[]
    best: SkillDamage | undefined
}

export interface MaxDmgResult {
    effects: MaxDmgEffect[]
    members: MemberDamage[]
    enemies: { name: string, hp: number, def: number, broken: boolean, breakRate: number, canBreak: boolean }[]
}

const SKILL_TYPES: [TargetType, string][] = [
    [TargetType.specialId, "Ultimate"], [TargetType.skillId, "Battle Skill"], [TargetType.attackId, "Basic Attack"],
]

function skillDetailsOf(k: PvPKioku, type: TargetType): SkillDetail[] {
    const id = (k.data as any)[TargetTypeLookup[type as keyof typeof TargetTypeLookup]]
    const lvl = (k as any)[targetTypeToLvl[type as keyof typeof targetTypeToLvl]] ?? 1
    return (skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[]
}

// States (buffs/debuffs that stay on a unit). Instant effects (damage, heals, EP, haste...) are skipped.
const isState = (d: SkillDetail) => UNIT_STATE_TYPES.has(d.abilityEffectType)
    && !["ADDITIONAL_SKILL_ACT", "SWITCH_SKILL", "CUTOUT", "STUN", "LOCK_TURN_ORDER", "COMBO", "CAN_NOT_ACTION"].includes(d.abilityEffectType)
    && !d.abilityEffectType.startsWith("BURN") && !d.abilityEffectType.startsWith("POISON") && !d.abilityEffectType.startsWith("CURSE") && !d.abilityEffectType.startsWith("BLEED")

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

// Every buff/debuff the team can produce.
export function collectTeamEffects(allies: PvPKioku[], attackerPos: number): MaxDmgEffect[] {
    const out: MaxDmgEffect[] = []
    const seen = new Set<string>()
    const add = (casterPos: number, casterName: string, source: string, d: SkillDetail) => {
        if (!isState(d)) return
        const side: EffectSide | undefined = isFriendlyEffect(d.abilityEffectType) ? "ally" : isOpponentEffect(d.abilityEffectType) ? "enemy" : undefined
        if (!side) return
        const key = `${casterPos}:${skillDetailId(d)}`
        if (seen.has(key)) return
        seen.add(key)
        const isAccum = d.abilityEffectType.includes("ACCUM")
        out.push({
            key, casterPos, casterName, source, side, detail: d,
            maxStacks: isAccum ? Math.max(1, d.value2 || 1) : 1,
            applies: isEffectValueType(d.abilityEffectType) || d.range !== targetRange.SELF || (side === "ally" && casterPos === attackerPos),
        })
    }
    allies.forEach((k, pos) => {
        for (const [type, label] of SKILL_TYPES) {
            for (const d of skillDetailsOf(k, type)) {
                add(pos, k.name, label, d)
                // Follow-up skills granted by the kit (ADDITIONAL_SKILL_ACT value1 = skill id).
            }
        }
        for (const d of k.effects) {
            add(pos, k.name, passiveOrigin(k, d), d)
            if (d.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
                for (const fd of (skillDetailsByMstId.get(d.value1) ?? []) as SkillDetail[]) add(pos, k.name, "Follow-up", fd)
            }
        }
    })
    return out
}

function stateFrom(e: MaxDmgEffect, detail: SkillDetail, caster: KiokuState, stacks: number): SkillDetail & Record<string, any> {
    return {
        ...detail,
        // Conditions are assumed met: that's the "max" in max damage.
        activeConditionSetIdCsv: "", startConditionSetIdCsv: "",
        turn: 99,
        remainCount: e.detail.remainCount || 99,
        _accumCount: stacks,
        _applierState: caster,
        applier: caster.kioku.name,
    } as any
}

export function computeMaxDamage(allies: PvPKioku[], enemies: QuestEnemyAppearance[], attackerPos: number, opts: MaxDmgOptions = {}): MaxDmgResult {
    const bt = opts.battleType ?? BattleType.Solo
    const effects = collectTeamEffects(allies, attackerPos)
    const members: MemberDamage[] = []
    const main = Math.min(Math.max(0, opts.mainTargetIdx ?? 0), Math.max(0, enemies.length - 1))
    let enemySummary: MaxDmgResult["enemies"] = []

    // Each member is evaluated as "the attacker" with the whole team's buffs on it.
    for (let pos = 0; pos < allies.length; pos++) {
        if (opts.onlyPos !== undefined && pos !== opts.onlyPos) {
            members.push({ pos, name: allies[pos].name, skills: [], best: undefined })
            continue
        }
        const team1 = new PvPTeam(allies, "Ally", false, bt)
        const team2 = new PvPTeam(enemyKiokus(enemies), "Enemy", false, bt)
        team1.finishSetup(team2); team2.finishSetup(team1)
        for (const u of [...team1.kiokuStates, ...team2.kiokuStates]) u.updateSpd()
        const attacker = team1.kiokuStates[pos]
        const targets = team2.kiokuStates

        // The dealer's pass reuses `effects` so the returned list records where each effect landed.
        const passEffects = pos === attackerPos ? effects : collectTeamEffects(allies, pos)
        const stacksOf = (e: MaxDmgEffect) => opts.excluded?.has(e.key) ? 0 : Math.max(0, Math.min(e.maxStacks, opts.stacks?.get(e.key) ?? e.maxStacks))
        // Each caster's active buff/debuff strength, by type (conditions assumed met, like everything else here).
        const giverEffects = new Map<number, Record<string, SkillDetail[]>>()
        for (const e of passEffects) {
            if (!isEffectValueType(e.detail.abilityEffectType) || !stacksOf(e)) continue
            const fx = giverEffects.get(e.casterPos) ?? {}
            fx[e.detail.abilityEffectType] = [...(fx[e.detail.abilityEffectType] ?? []), e.detail]
            giverEffects.set(e.casterPos, fx)
        }
        for (const e of passEffects) {
            const stacks = stacksOf(e)
            if (!stacks || isEffectValueType(e.detail.abilityEffectType)) continue
            const caster = team1.kiokuStates[e.casterPos]
            // Scaled by the caster's buff/debuff strength, as when the battle gives the state.
            const detail = scaleGivenState(e.detail, giverEffects.get(e.casterPos) ?? {})
            if (pos === attackerPos) e.rate = (detail as any)._effectValueRate ?? 1
            if (e.side === "ally") {
                if (!e.applies) continue
                const eligible = isEligibleForEffect(detail, attacker)
                if (pos === attackerPos) e.reach = { dealer: eligible, enemies: [] }
                if (eligible) attacker.activeEffectDetails.set(e.key, stateFrom(e, detail, caster, stacks))
            } else {
                if (!e.applies) continue
                const hit: number[] = []
                targets.forEach((t, i) => {
                    if (!isEligibleForEffect(detail, t)) return
                    t.activeEffectDetails.set(e.key, stateFrom(e, detail, caster, stacks))
                    hit.push(i)
                })
                if (pos === attackerPos) e.reach = { dealer: false, enemies: hit }
            }
        }
        targets.forEach((t, i) => {
            const broken = !!opts.broken?.[i] && t.maxBreakGauge >= 1
            if (broken) {
                t.currentRemainingBreakGauge = 0
                t.isBroken = true
                t.breakedDamageReceiveRate = opts.breakRate?.[i] ?? Math.trunc(t.breakParams.maxRate / 10)
            }
        })
        if (!enemySummary.length) enemySummary = targets.map(t => ({
            name: t.kioku.name, hp: t.maxHp, def: t.kioku.getBaseDef(), broken: t.isBroken,
            breakRate: t.isBroken ? t.breakedDamageReceiveRate : 100, canBreak: t.maxBreakGauge >= 1,
        }))

        const skills: SkillDamage[] = []
        for (const [type, label] of SKILL_TYPES) {
            const details = skillDetailsOf(allies[pos], type).filter(d => d.abilityEffectType.startsWith("DMG_") && d.abilityEffectType !== "DMG_RATIO")
            if (!details.length) continue
            const perEnemy = targets.map(() => ({ normal: 0, crit: 0, avg: 0 }))
            const bonus = [...attacker.activeEffectDetails.values()].filter(d => d.abilityEffectType === "ADDITIONAL_DAMAGE")
            for (const d of details) {
                const hit: number[] = d.range === targetRange.ALL ? targets.map((_, i) => i)
                    : d.range === targetRange.PROXIMITY ? [main - 1, main, main + 1].filter(i => i >= 0 && i < targets.length)
                        : [main]
                for (const i of hit) {
                    const t = targets[i]
                    const baseType = damageBaseTypeFromEffectType(d.abilityEffectType)
                    const isMainTarget = i === main
                    const run = (crit: boolean) => {
                        let dmg = getAttackDamageResult(attacker, t, d, baseType, { battleType: bt, forceCrit: crit, isMainTarget }).preBarrierDamage
                        for (const b of bonus) {
                            dmg += getAttackDamageResult(attacker, t, b, DamageBaseType.ATK, {
                                battleType: bt, forceCrit: crit,
                                damageBaseOverride: getAdditionalDamageBase((b as any)._applierState ?? attacker, b),
                            }).preBarrierDamage
                        }
                        return dmg
                    }
                    const n = run(false), c = run(true)
                    const p = Math.min(1, Math.max(0, critChance(attacker, t) / 100))
                    perEnemy[i].normal += n
                    perEnemy[i].crit += c
                    perEnemy[i].avg += n * (1 - p) + c * p
                }
            }
            perEnemy.forEach(x => { x.avg = Math.round(x.avg) })
            const total = perEnemy.reduce((s, x) => ({ normal: s.normal + x.normal, crit: s.crit + x.crit, avg: s.avg + x.avg }), { normal: 0, crit: 0, avg: 0 })
            skills.push({ type, label, perEnemy, total, critChance: targets[main] ? critChance(attacker, targets[main]) : 0 })
        }
        const best = skills.reduce<SkillDamage | undefined>((b, s) => !b || s.total.crit > b.total.crit ? s : b, undefined)
        members.push({ pos, name: allies[pos].name, skills, best })
    }
    return { effects, members, enemies: enemySummary }
}
