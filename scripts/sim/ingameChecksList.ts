// The checks scripts/sim/ingameChecks.ts runs: characters whose numbers moved between the old single-hit model and the
// 1:1 engine (docs/ai/OLD_VS_ENGINE.md), each in a short fight that exercises the effect type behind the move.
// Every check is the start of a fight (the enemies of these stages kill a small party within ~2 rounds), with only
// the kioku the check needs.
import type { Check, Step } from "./ingameChecks"

const skill = (who: string, target?: 1 | 2 | 3, friend?: string): Step => ({ who, act: "skill", target, friend })
const basic = (who: string, target?: 1 | 2 | 3): Step => ({ who, act: "basic", target })

/** A dealer alone: its Battle Skill `n` times. */
const solo = (name: string, stage: Check["stage"], n: number, what: string, expect: string, target?: 1 | 2 | 3): Check =>
    ({ name, stage, party: [name], steps: Array.from({ length: n }, () => skill(name, target)), what, expect })

/** Kokoro's Kioku (shields and DEF only: no damage buffs) keeps a dealer alive for a second skill. */
const KOKORO = "Kokoro's Kioku"
const shielded = (c: Check): Check => ({ ...c, party: [...c.party, KOKORO], helpers: { [KOKORO]: "skill" } })

/** A support's Battle Skill, then a dealer's Battle Skill. */
const duo = (name: string, dealer: string, stage: Check["stage"], what: string, expect: string, opts: { first?: Step[], target?: 1 | 2 | 3 } = {}): Check =>
    ({ name, stage, party: [name, dealer], steps: [...(opts.first ?? []), skill(name, opts.target, dealer), skill(dealer, opts.target)], what, expect })

export const CHECKS: Check[] = [
    // ---- dealers (their own damage)
    solo("Tiro Finale Liberation", "Dark", 1,
        "ATK +5% per enemy present (ability) and, at A2, DMG dealt +10% per enemy present: with 3 enemies +15% ATK and +30% DMG dealt.",
        "engine +74% over the old model (Ultimate, A5); UP_GIV_DMG_RATIO: removing it costs 23% in the old model, 49% in the engine."),
    solo("Oracle Ray", "Light", 1,
        "DMG dealt +10% for 2 enemies, +10% more per enemy above 2 (3 enemies: +20%), and 2 extra hits of 10% for 3 enemies.",
        "engine +59%; UP_GIV_DMG_RATIO costs 44% in the old model, 61% in the engine."),
    solo("Falsified Phenomena", "Dark", 2,
        "The first Battle Skill opens her dark field; the second one is the dark-field version (110%, dark DMG taken up).",
        "engine +69%; UP_CTD_FIXED (crit DMG) only in the engine, UP_GIV_DMG_RATIO 13% old vs 32% engine."),
    solo("La Danse Macabre", "Void", 2,
        "The first skill puts DEF down and void DMG taken up on Enemy 1; the second hits it with those debuffs on (and her crystalis ATK stacks, if equipped, at 2+ debuffs). Enemy 1's own passive increases debuff effects on it each turn.",
        "engine +40%; UP_DEBUFF_EFFECT_VALUE (A4) and UP_ATK_ACCUM_RATIO only in the engine.", 1),
    (solo("Luminous Tenet", "Dark", 1,
        "Her first Battle Skill (with charge 30% at A2, crit-driven charge), on Enemy 1.",
        "engine +37%; UP_AIM_RCV_DMG_RATIO (DMG taken up on the marked target) and UP_CTD_FIXED only in the engine.", 1)),
    solo("Kugatachi", "Flame", 1,
        "DMG dealt when targeting elemental weakness up.",
        "engine +21%; UP_WEAK_ELEMENT_DMG_RATIO only in the engine."),
    (solo("Invisible Assassin", "Void", 1,
        "Her first Battle Skill: any ATK stacks gained before it (UP_ATK_ACCUM_RATIO).",
        "engine +25%; UP_ATK_ACCUM_RATIO only in the engine.")),
    solo("Yuletide Gift", "Flame", 2,
        "ATK stacks and debuff effects up.",
        "engine +25%; UP_ATK_ACCUM_RATIO and UP_DEBUFF_EFFECT_VALUE only in the engine.", 1),
    shielded(solo("Ryushin Spiral Fury", "Aqua", 2,
        "ATK up and ATK stacks.",
        "engine +24%; UP_ATK_RATIO 8% old vs 26% engine.")),
    shielded(solo("Bebe-O'-Lantern", "Dark", 2,
        "DEF down / DMG taken up debuffs and her ATK stacks.",
        "engine +20%; UP_DEBUFF_EFFECT_VALUE, UP_ATK_ACCUM_RATIO only in the engine.", 1)),
    solo("Soul Salvation", "Void", 2,
        "DMG dealt up, debuff effects up, ATK stacks.",
        "engine +20%; UP_GIV_DMG_RATIO, UP_DEBUFF_EFFECT_VALUE, UP_ATK_ACCUM_RATIO only in the engine.", 1),
    duo("Meteor Punch", "Kugatachi", "Flame",
        "Meteor Punch's skill deals no damage itself: its debuffs on the target (DMG taken up) and buffs, then Kugatachi hits it.",
        "dealer: engine -15%; UP_GIV_DMG_RATIO only in the engine, UP_RCV_DMG_RATIO 15% old vs 13% engine.", { target: 1 }),
    solo("The Universe's Edge", "Flame", 1,
        "DMG dealt up.",
        "engine +16%; UP_GIV_DMG_RATIO 47% old vs 55% engine."),
    shielded(solo("Nothing to Despair, Ever", "Light", 2,
        "Crit rate (the old model has 35%, the engine 50% at A5) and crit DMG stacks; compare how often she crits too.",
        "engine -11%; UP_GIV_DMG_RATIO only in the old model, UP_CTD_ACCUM_RATIO only in the engine.")),
    shielded(solo("Melodia Appassionata", "Aqua", 2,
        "The first skill applies vortex (bursts after 8 hits); her 3 hits per enemy per skill count towards it, and DMG dealt +20% while a vortexed enemy is present.",
        "engine +18%; VORTEX_ATK and UP_GIV_DMG_RATIO only in the engine.")),

    // ---- supports (the dealer's damage after the support's skill)
    duo("Sacred Gift", "Absolute Rain", "Aqua",
        "Sacred Gift weakens all enemies (WEAKNESS ailment); Absolute Rain's skill then hits weakened enemies.",
        "Lux gains +30% in the old model, +60% in the engine; WEAKNESS only counts in the engine (it did nothing before the explicit-interface fix)."),
    duo("Nine Phases", "Invisible Assassin", "Void",
        "Nine Phases' follow-up weakens all enemies; Invisible Assassin then hits weakened enemies.",
        "Lux gains 0% in the old model, +11% in the engine; WEAKNESS."),
    duo("L'Ombre", "Concentrated Missile Fire", "Dark",
        "L'Ombre buffs all allies' DMG dealt +10% (A4 would raise buff effects); the dealer hits after.",
        "Lux gains +317% old vs +367% engine (A5); UP_BUFF_EFFECT_VALUE only in the engine."),
    duo("Flame Waltz", "Kugatachi", "Flame",
        "Flame Waltz buffs all allies' ATK +20% and crit rate; Kugatachi hits after.",
        "Lux gains +199% old vs +236% engine; UP_BUFF_EFFECT_VALUE, UP_WEAK_ELEMENT_DMG_RATIO only in the engine."),
    duo("Tiro Finale", "Floral Ironspike", "Forest",
        "Tiro Finale buffs all allies' ATK +10%; Floral Ironspike hits after.",
        "Lux gains +108% old vs +143% engine; UP_BUFF_EFFECT_VALUE, UP_WEAK_ELEMENT_DMG_RATIO only in the engine."),
    duo("Aqua Tempest", "Absolute Rain", "Aqua",
        "Aqua Tempest gives Absolute Rain ATK +30% and Orchestration (additional DMG); Absolute Rain hits after.",
        "dealer: engine +17%; UP_BUFF_EFFECT_VALUE and ADDITIONAL_DAMAGE only in the engine."),
    duo("Brilliant Beam", "Kugatachi", "Flame",
        "Brilliant Beam gives Kugatachi ATK +30% and MP; Kugatachi hits after.",
        "Lux gains +82% old vs +101% engine; UP_BUFF_EFFECT_VALUE only in the engine."),
    duo("Désintégration", "Absolute Rain", "Aqua",
        "Désintégration puts DMG taken +10% and aqua DMG taken +15% on Enemy 1; Absolute Rain hits after.",
        "Lux gains +111% old vs +132% engine; UP_DEBUFF_EFFECT_VALUE (A4), DWN_ELEMENT_RESIST_ACCUM_RATIO only in the engine.", { target: 1 }),
    duo("Atomo Arrabbiato", "Floral Ironspike", "Forest",
        "Atomo poisons and puts DEF down on all enemies; Floral Ironspike hits after.",
        "Lux gains +64% old vs +73% engine with a poison dealer; UP_DEBUFF_EFFECT_VALUE, DWN_ELEMENT_RESIST_ACCUM_RATIO differ."),
]
