// Kioku Grid archetypes, read straight from a kit's master data (no build, no old ScoreAttackKioku model).
//
// A kit's rows are collected from the basic attack, battle skill, ultimate, ability and ascensions up to
// ARCHETYPE_ASCENSION (all at max level) and the kit's EX crystalis, then every row that points at another skill is followed, and the
// composite states whose behaviour lives in code instead of rows are expanded into the rows they act like.
// Conditions are not evaluated: a conditional or triggered row still gives the archetype (it is something the
// Kioku can do). Run `npx tsx scripts/audit/archetypeAudit.ts` after a data update to see what changed.
import { Ailment, type KiokuElement } from "../types/enums"
import type { KiokuData } from "../types/KiokuTypes"
import { passiveDetailsByMstId, skillDetailsByMstId } from "../utils/helpers"
import skillMstJson from "../assets/base_data/getSkillMstList.json"

export const ARCHETYPE_ASCENSION = 2
const MAX_SKILL_LVL = 10

export interface ArchetypeRow {
    abilityEffectType: string
    range: number
    element?: KiokuElement | number
    /** where the row came from, e.g. "skill>CUTOUT" (for the audit script) */
    src: string
}

export interface ArchetypeRule {
    id: string
    label: string
    match: (e: ArchetypeRow, d: KiokuData) => boolean
}

// skillUniqueId -> level -> skillMstId (SWITCH_SKILL / STEP_UP_SKILL name a skill by its unique id)
const skillByUnique = new Map<number, Map<number, number>>()
for (const s of skillMstJson as any[]) {
    if (!s.skillUniqueId) continue
    const m = skillByUnique.get(s.skillUniqueId) ?? skillByUnique.set(s.skillUniqueId, new Map()).get(s.skillUniqueId)!
    m.set(s.level, s.skillMstId)
}
const uniqueSkill = (uniqueId: number): number | undefined => {
    const m = skillByUnique.get(uniqueId)
    if (!m) return undefined
    return m.get(MAX_SKILL_LVL) ?? m.get(Math.max(...m.keys()))
}

// Rows referencing another skill (value1 = skillMstId):
// [CONFIRMED 3.19] AdditionalSkillActAbilityEffect..ctor (0x1920A70): skillMstId = EffectValue1
// [CONFIRMED 3.19] AdditionalCountdownCancelSkillActAbilityEffect..ctor: skillMstId = EffectValue1 (same for ZERO)
const SKILL_REF_TYPES = ["ADDITIONAL_SKILL_ACT", "ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT", "ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT"]

/** Every effect row the kit can produce, with skill references followed and composite states expanded. */
export function kitArchetypeRows(d: KiokuData, maxAscension = ARCHETYPE_ASCENSION, withEx = true): ArchetypeRow[] {
    const out: ArchetypeRow[] = []
    const seen = new Set<string>()
    const add = (passive: boolean, key: number | undefined, src: string) => {
        if (!key) return
        const tag = (passive ? "P" : "S") + key
        if (seen.has(tag)) return
        seen.add(tag)
        for (const r of (passive ? passiveDetailsByMstId : skillDetailsByMstId).get(key) ?? []) {
            const t = r.abilityEffectType
            const row = (abilityEffectType: string, from = src): ArchetypeRow =>
                ({ abilityEffectType, range: r.range, element: r.element, src: from })
            out.push(row(t))
            if (SKILL_REF_TYPES.includes(t)) add(false, r.value1, `${src}>${t}`)
            // [CONFIRMED 3.19] SwitchSkillUnitState..ctor (0x1702D20): switchSkillUniqueId = EffectValue1.
            // Both the original and the switched skill count (the switch is usually conditional).
            if (t === "SWITCH_SKILL") add(false, uniqueSkill(r.value1), `${src}>SWITCH_SKILL`)
            // [CONFIRMED 3.19] StepUpSkillUnitState.GetSkillMstId (0x17023E0): skillUniqueId = EffectValue2, at skill level
            if (t === "STEP_UP_SKILL") add(false, uniqueSkill(r.value2), `${src}>STEP_UP_SKILL`)
            // [CONFIRMED 3.19] CutoutUnitState..ctor (0x15DE2E0) / TriggeringAtTurnEnd (0x15DDB50): at turn end advances
            // the holder by EffectValue1 and removes EffectValue2 debuffs (0 = all).
            if (t === "CUTOUT") {
                out.push(row("HASTE", `${src}>CUTOUT`))
                out.push(row("REMOVE_ALL_DEBUFF", `${src}>CUTOUT`))
            }
            // [CONFIRMED 3.19] TsubameLinkUnitState..ctor (0x17041C0): SPD up (v1), ATK up (v2), additional damage (v3)
            if (t === "TSUBAME_LINK") {
                out.push(row("UP_SPD_RATIO", `${src}>TSUBAME_LINK`))
                out.push(row("UP_ATK_RATIO", `${src}>TSUBAME_LINK`))
                out.push(row("ADDITIONAL_DAMAGE", `${src}>TSUBAME_LINK`))
            }
        }
    }
    add(false, d.attack_id * 100 + MAX_SKILL_LVL, "attack")
    add(false, d.skill_id * 100 + MAX_SKILL_LVL, "skill")
    add(false, d.special_id * 100 + MAX_SKILL_LVL, "special")
    add(true, d.ability_id * 100 + MAX_SKILL_LVL, "ability")
    for (let i = 1; i <= maxAscension; i++) {
        const p = (d as any)[`ascension_${i}_effect_2_id`] as number | undefined
        if (p) add(true, p * 100 + 1, `A${i}`)
    }
    if (withEx && d.crystalis_id) add(true, d.crystalis_id, "EX") // crystalis passives use their exact id
    return out
}

export const archetypeRules: ArchetypeRule[] = [
    {
        id: "mono",
        label: "Mono Element",
        match: e => e.abilityEffectType.includes("AIM")
            || e.abilityEffectType.includes("ZONE")
            // SWITCH_SKILL rows carry the switched skill's element, they are not an element-limited effect
            || (!e.abilityEffectType.includes("DMG") && e.abilityEffectType !== "SWITCH_SKILL" && !!e.element),
    },
    { id: "fua", label: "Fua", match: e => e.abilityEffectType === "ADDITIONAL_SKILL_ACT" },
    // Self crit is also crit archetype (any role)
    { id: "crit", label: "Crit", match: e => e.abilityEffectType.includes("_CT") },
    {
        id: "mp",
        label: "MP Generator",
        match: e => e.range > 0 && ["GAIN_EP_FIXED", "GAIN_EP_RATIO", "UP_EP_RECOVER_RATE_RATIO"].includes(e.abilityEffectType),
    },
    { id: "sp", label: "SP Generator", match: e => e.abilityEffectType === "GAIN_SP_FIXED" },
    { id: "aa", label: "Action Advance", match: e => e.range > 0 && e.abilityEffectType === "HASTE" },
    { id: "spd_up", label: "AoE SPD buff", match: e => e.range > 0 && e.abilityEffectType.includes("UP_SPD") },
    { id: "spd_down", label: "SPD debuff", match: e => e.range > 0 && e.abilityEffectType.includes("N_SPD") },
    {
        id: "ailment",
        label: "Ailment",
        match: e => Object.values(Ailment).includes(e.abilityEffectType.replace(/_(ATK|DEF|HP)$/, "") as Ailment),
    },
    { id: "ailment_remove", label: "Ailment Remove", match: e => e.abilityEffectType === "REMOVE_ALL_ABNORMAL" },
    { id: "buff_remove", label: "Buff Remove", match: e => e.abilityEffectType === "REMOVE_ALL_BUFF" },
    { id: "debuff_remove", label: "Debuff Remove", match: e => e.abilityEffectType === "REMOVE_ALL_DEBUFF" },
]

const cache = new Map<number, ArchetypeRule[]>()
export function archetypesForKit(d: KiokuData): ArchetypeRule[] {
    let hit = cache.get(d.id)
    if (!hit) {
        const rows = kitArchetypeRows(d)
        hit = archetypeRules.filter(rule => rows.some(e => rule.match(e, d)))
        cache.set(d.id, hit)
    }
    return hit
}
