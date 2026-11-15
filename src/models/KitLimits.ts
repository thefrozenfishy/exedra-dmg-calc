// What a kit's effects are limited to: the element or role of the unit they act on, or an ailment on the enemies.
// LuxBench reads it to pick the extra bars a character is tested in (kitRestrictions), the Kioku Grid page to show,
// per extra bar, which effects only apply there (kitLimitedEffects). App code, no engine import, so the page can use
// it on the main thread.
import type { PvPKioku } from "./PvPKioku";
import { ailmentConditionValues, unitTypeConditionValues } from "./BattleConditionParser";
import { isMaxDamageState, passiveOrigin } from "./MaxDamage";
import { crystalisesByStyle, kiokuData, skillDetailsByMstId } from "../utils/helpers";
import { TargetType, TargetTypeLookup, targetTypeToLvl, type SkillDetail } from "../types/KiokuTypes";
import { Ailment, elementMap, roleMap, KiokuElement, KiokuRole } from "../types/enums";
import { effectDescription, effectName, effectValue } from "../utils/effectText";

/** The character's own EX crystalis (SelectionAbility rows with its styleMstId; one per character). */
export const exCrysIds = (name: string): number[] =>
    (crystalisesByStyle[kiokuData[name]?.id ?? -1] ?? []).map(c => c.selectionAbilityMstId)

const DAMAGE_TYPES = new Set(["DMG_ATK", "DMG_DEF", "DMG_HP", "DMG_RANDOM"])

export interface KitDetail { detail: SkillDetail, source: string }

const SKILL_SOURCES: [TargetType.attackId | TargetType.skillId | TargetType.specialId, string][] = [
    [TargetType.attackId, "Basic Attack"], [TargetType.skillId, "Battle Skill"], [TargetType.specialId, "Ultimate"],
]

/** Every skill / passive row of a kit with the part it comes from: basic attack, battle skill, ultimate, passives
 *  (and whatever gear the unit wears), and the follow-ups they grant. */
export function kitDetailsWithSource(k: PvPKioku): KitDetail[] {
    const out: KitDetail[] = []
    for (const [type, source] of SKILL_SOURCES) {
        const id = (k.data as any)[TargetTypeLookup[type]]
        const lvl = (k as any)[targetTypeToLvl[type]] ?? 1
        for (const detail of (skillDetailsByMstId.get(id * 100 + lvl) ?? []) as SkillDetail[]) out.push({ detail, source })
    }
    for (const detail of k.effects) out.push({ detail, source: passiveOrigin(k, detail) })
    for (const { detail: d } of [...out]) {
        if (d.abilityEffectType !== "ADDITIONAL_SKILL_ACT") continue
        for (const detail of (skillDetailsByMstId.get(d.value1) ?? []) as SkillDetail[]) out.push({ detail, source: "Follow-up" })
    }
    return out
}

export const kitDetails = (k: PvPKioku): SkillDetail[] => kitDetailsWithSource(k).map(d => d.detail)

export interface KitLimits { elements: KiokuElement[], roles: KiokuRole[], ailments: Ailment[] }

/** What one effect is limited to: its TargetElement / TargetRole (damage effects aside, where `element` is the attack
 *  element), the IS_ELEMENT_TYPE / IS_ROLE_TYPE conditions it uses, and the ailments its conditions check. */
export function effectLimits(d: SkillDetail): KitLimits {
    const csvs = [d.startConditionSetIdCsv, d.activeConditionSetIdCsv]
    const elements = new Set<KiokuElement>(), roles = new Set<KiokuRole>()
    if (!DAMAGE_TYPES.has(d.abilityEffectType)) {
        if (d.element && elementMap[d.element]) elements.add(elementMap[d.element])
        if ((d as any).role && roleMap[(d as any).role]) roles.add(roleMap[(d as any).role])
    }
    const cond = unitTypeConditionValues(csvs)
    cond.elements.forEach(e => elements.add(e as KiokuElement))
    cond.roles.forEach(r => roles.add(r as KiokuRole))
    return { elements: [...elements], roles: [...roles], ailments: ailmentConditionValues(csvs) }
}

/** Elements, roles and ailments a kit's effects are limited to (every effect of kitDetails, effectLimits). */
export function kitLimits(k: PvPKioku): KitLimits {
    const elements = new Set<KiokuElement>(), roles = new Set<KiokuRole>(), ailments = new Set<Ailment>()
    for (const d of kitDetails(k)) {
        const l = effectLimits(d)
        l.elements.forEach(e => elements.add(e))
        l.roles.forEach(r => roles.add(r))
        l.ailments.forEach(a => ailments.add(a))
    }
    return { elements: [...elements], roles: [...roles], ailments: [...ailments] }
}

/** The bench dealer's element / role when a bar doesn't test one: the reference unit's own (`own`, Lux) unless the kit
 *  is limited to it, then the first one it isn't limited to (see LuxBenchCharts.neutral). */
export function neutralIdentity(limits: KitLimits, own: { element: KiokuElement, role: KiokuRole }): { element: KiokuElement, role: KiokuRole } {
    const pick = <T,>(mine: T, all: T[], limited: T[]) => !limited.includes(mine) ? mine : all.find(v => !limited.includes(v)) ?? mine
    return {
        element: pick(own.element, Object.values(KiokuElement), limits.elements),
        role: pick(own.role, Object.values(KiokuRole), limits.roles),
    }
}

export interface LimitedEffect {
    source: string      // "Ultimate", "Ability", ...
    text: string        // "Weakness DMG up 5%"
    limitedTo: string[] // what it needs that the plain bar lacks ("Void", "Breaker", "WEAKNESS")
    maxBurst: boolean   // Max Burst applies it (a unit state, see MaxDamage.collectTeamEffects); otherwise only battles do
}

/** Who an effect reaches by its limits (effectLimits): a dealer of one of its elements (if any) and one of its roles
 *  (if any), with one of its ailments on the enemies (if any). */
export interface BenchDealer { element?: string, role?: string, ailment?: string }
const reaches = (l: KitLimits, d: BenchDealer) =>
    (!l.elements.length || l.elements.includes(d.element as KiokuElement))
    && (!l.roles.length || l.roles.includes(d.role as KiokuRole))
    && (!l.ailments.length || l.ailments.includes(d.ailment as Ailment))

/** The kit's effects that reach the extra bar's dealer (`bar`) but not the plain bar's (`plain`). Rows of one type from
 *  one source are one line: they are tiers (only one tier's condition holds at a time, MaxDamage assignTiers), shown as
 *  ", max" the highest. Read from the effect data alone: whether a reached effect then does anything (a buff Max Burst
 *  counts, a condition that comes true in battle) is the simulation's business. */
export function kitLimitedEffects(k: PvPKioku, bar: BenchDealer, plain: BenchDealer): LimitedEffect[] {
    const groups = new Map<string, { source: string, rows: SkillDetail[], limitedTo: string[] }>()
    for (const { detail: d, source } of kitDetailsWithSource(k)) {
        const l = effectLimits(d)
        if (!reaches(l, bar) || reaches(l, plain)) continue
        const limitedTo = [
            l.elements.length && bar.element !== plain.element ? bar.element : "",
            l.roles.length && bar.role !== plain.role ? bar.role : "",
            l.ailments.length ? bar.ailment : "",
        ].filter((v): v is string => !!v)
        const key = `${source}|${d.abilityEffectType}|${limitedTo.join("/")}`
        const g = groups.get(key)
        if (g) g.rows.push(d)
        else groups.set(key, { source, rows: [d], limitedTo })
    }
    return [...groups.values()].map(({ source, rows, limitedTo }) => {
        const top = rows.reduce((m, d) => d.value1 > m.value1 ? d : m)
        const name = effectName(top.abilityEffectType)
        // effect types without a plain name ("Special buff"): the first line of the game's description instead
        const desc = effectDescription(top).split("\n")[0]
        // a value the description can't settle ("200 or 20%") is left out
        const value = effectValue(top)
        const shown = value && !value.includes(" or ") ? value : null
        const tiers = new Set(rows.map(d => d.value1)).size > 1
        const text = /^Special (de)?buff$/.test(name) && desc ? desc
            : shown ? `${name}${tiers ? ", max " : " "}${shown}` : name
        return { source, text, limitedTo, maxBurst: rows.some(isMaxDamageState) }
    })
}
