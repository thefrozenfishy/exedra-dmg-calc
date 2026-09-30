// Plain-language names and values for buff/debuff effect types, for pages that list effects to players
// (the PvE Simulator's Max Damage breakdown). The raw type stays available as a tooltip.
import type { SkillDetail } from "../types/KiokuTypes"
import { elementMap, roleMap } from "../types/enums"
import { STATE_ADD_FILTER } from "../models/StateAddFilter"

const NAMES: Record<string, string> = {
    // Damage
    UP_GIV_DMG_RATIO: "DMG dealt up",
    UP_GIV_DMG_ACCUM_RATIO: "DMG dealt up",
    UP_ELEMENT_DMG_RATE_RATIO: "Element DMG up",
    UP_WEAK_ELEMENT_DMG_RATIO: "Weakness DMG up",
    UP_WEAK_ELEMENT_DMG_ACCUM_RATIO: "Weakness DMG up",
    UP_GIV_SLIP_DMG_RATIO: "DMG over time up",
    ADDITIONAL_DAMAGE: "Additional DMG",
    // Stats
    UP_ATK_RATIO: "ATK up",
    UP_ATK_FIXED: "ATK up",
    UP_ATK_ACCUM_RATIO: "ATK up",
    UP_ATK_CONSUME_RATIO: "ATK up (used up on attack)",
    UP_DEF_RATIO: "DEF up",
    UP_DEF_ACCUM_RATIO: "DEF up",
    UP_HP_RATIO: "Max HP up",
    UP_SPD_RATIO: "SPD up",
    UP_SPD_FIXED: "SPD up",
    UP_SPD_ACCUM_RATIO: "SPD up",
    // Crits
    UP_CTR_FIXED: "Crit rate up",
    UP_CTR_RATIO: "Crit rate up",
    UP_CTR_ACCUM_RATIO: "Crit rate up",
    UP_CTD_FIXED: "Crit DMG up",
    UP_CTD_RATIO: "Crit DMG up",
    UP_CTD_ACCUM_RATIO: "Crit DMG up",
    // Break
    UP_GIV_BREAK_POINT_DMG_FIXED: "Break gauge depletion up",
    UP_BREAK_DAMAGE_RECEIVE_RATIO: "Break bonus up",
    UP_BREAK_EFFECT: "Break effect up",
    // Support
    UP_EP_RECOVER_RATE_RATIO: "MP recovery up",
    UP_BUFF_EFFECT_VALUE: "Buff strength up",
    UP_DEBUFF_EFFECT_VALUE: "Debuff strength up",
    ADD_BUFF_TURN: "Buff duration up",
    ADD_DEBUFF_TURN: "Debuff duration up",
    UP_EFFECT_HIT_RATE_RATIO: "Debuff hit rate up",
    UP_ABNORMAL_HIT_RATE_RATIO: "Ailment hit rate up",
    UP_HEAL_RATE_RATIO: "Healing up",
    DWN_RCV_DMG_RATIO: "DMG taken down",
    SHIELD: "Shield",
    BARRIER: "Barrier",
    CONTINUOUS_RECOVERY: "HP regen",
    REGAIN_ATK: "Heal on hit",
    UP_HATE: "Taunt",
    REFLECTION_RATIO: "Reflect",
    TSUBAME_CORE: "Tsubame",
    TSUBAME_LINK: "Tsubame",
    // Debuffs on enemies
    DWN_DEF_RATIO: "DEF down",
    DWN_DEF_ACCUM_RATIO: "DEF down",
    DWN_ATK_RATIO: "ATK down",
    DWN_SPD_RATIO: "SPD down",
    DWN_SPD_ACCUM_RATIO: "SPD down",
    DWN_ELEMENT_RESIST_RATIO: "Element RES down",
    DWN_ELEMENT_RESIST_ACCUM_RATIO: "Element RES down",
    DWN_GIV_DMG_CONSUME_RATIO: "DMG dealt down (used up)",
    UP_RCV_DMG_RATIO: "DMG taken up",
    UP_AIM_RCV_DMG_RATIO: "Element DMG taken up",
    UP_RCV_CTR_RATIO: "Crit rate taken up",
    RCV_FINAL_DAMAGE: "Final DMG taken up",
    UP_RCV_BREAK_POINT_DMG_RATIO: "Break gauge depletion taken up",
    WEAKNESS: "Weakness",
    VORTEX_ATK: "Vortex",
    COUNT: "Sigils",
    UNIQUE_ZONE: "Zone",
    UNIQUE_ELEMENT_STACK: "Element stacks",
}

const WORDS: Record<string, string> = {
    UP: "up", DWN: "down", ATK: "ATK", DEF: "DEF", SPD: "SPD", HP: "HP", DMG: "DMG", GIV: "dealt", RCV: "taken",
    CTR: "crit rate", CTD: "crit DMG", EP: "MP", ELEMENT: "element", WEAK: "weakness",
}

/** "UP_ATK_RATIO" -> "ATK up". Unknown types get a best-effort reading of the type name. */
export function effectName(type: string): string {
    if (NAMES[type]) return NAMES[type]
    if (type.startsWith("UNIQUE")) return type.includes("DEBUFF") ? "Special debuff" : "Special buff"
    const words = type.split("_").filter(w => !["RATIO", "FIXED", "ACCUM", "CONSUME"].includes(w)).map(w => WORDS[w] ?? w.toLowerCase())
    const text = words.join(" ")
    return text.charAt(0).toUpperCase() + text.slice(1)
}

// Types whose value1 isn't the effect's size (an id, a count or a formula input): show the description only.
const NO_VALUE = /^(UNIQUE|TSUBAME|COUNT|SHIELD|BARRIER|VORTEX|REFLECTION|ADD_BUFF_TURN|ADD_DEBUFF_TURN|UP_HATE|CONTINUOUS_RECOVERY|REGAIN|WEAKNESS)/

/**
 * The size of one application. Percent effects store tenths of a percent: every *_RATIO / *_EFFECT_VALUE type,
 * ADDITIONAL_DAMAGE (% of ATK), and FIXED types whose description shows a percent (crit rate/DMG). Otherwise it's
 * a flat amount (SPD, break gauge). Like the Single Battle Calculator, both readings are shown when neither tells.
 * With stacks, the total at that many stacks.
 */
export function effectValue(detail: SkillDetail, stacks = 1): string | null {
    const type = detail.abilityEffectType
    if (NO_VALUE.test(type) || !detail.value1) return null
    const pct = (v: number) => `${Math.round((v / 10 + Number.EPSILON) * 100) / 100}%`
    const isPercent = /_RATIO$|_EFFECT_VALUE$|^ADDITIONAL_DAMAGE$/.test(type) || detail.description.includes("%")
    const one = (v: number) => isPercent ? pct(v)
        : detail.description === "" ? `${v.toLocaleString()} or ${pct(v)}` : v.toLocaleString()
    if (stacks <= 1) return one(detail.value1)
    return `${one(detail.value1)} × ${stacks} = ${one(detail.value1 * stacks)}`
}

/** Game descriptions use <br> for line breaks. */
export const effectDescription = (detail: SkillDetail): string =>
    String(detail.description ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim()

/** Who can receive the effect, when the game restricts it: "Attacker", "Flame Attacker"... Empty when anyone can. */
export function effectRestriction(detail: SkillDetail): string {
    const filter = STATE_ADD_FILTER[detail.abilityEffectType]
    if (!filter) return ""
    const role = roleMap[(detail as any).role] ?? ""
    const element = filter === "RoleAndElement" && detail.element ? elementMap[detail.element] ?? "" : ""
    return [element, role].filter(Boolean).join(" ")
}
