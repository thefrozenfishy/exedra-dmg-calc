// Which side an ability effect type aims at: the generated EFFECT_TARGET_SIDE table (AbilityEffectBase.TargetSide),
// with the hand-kept lists below for types the table does not cover. Used by Max Damage (collectTeamEffects).
import { EFFECT_TARGET_SIDE } from "./EffectTargetSide";

const friendlySkills = [
    "CONSUME_CHARGE_POINT", // [CONFIRMED] [IMPLEMENTED] see applyEffect + AITargetSelector.ts
    "CUTOUT",
    "GAIN_CHARGE_POINT", // [CONFIRMED] [IMPLEMENTED, FIXED] see applyEffect + AITargetSelector.ts
    "GAIN_EP_RATIO",
    "GAIN_EP_FIXED",
    "HASTE",
    "UP_ATK_RATIO",
    "UP_BREAK_DAMAGE_RECEIVE_RATIO",
    "UP_EP_RECOVER_RATE_RATIO",
    "UP_GIV_BREAK_POINT_DMG_FIXED",
    "UP_GIV_DMG_RATIO",
    "UP_SPD_FIXED",
    "UP_SPD_RATIO",
    "RECOVERY_HP",
    "REMOVE_ALL_DEBUFF",
    "ADDITIONAL_TURN_UNIT_ACT", // [CONFIRMED] grants the unit itself an immediate extra action - see performAction()
    "RE_ACTION_TURN_UNIT_ACT",  // [CONFIRMED string, RECONSTRUCTED semantics] treated as an alias of ADDITIONAL_TURN_UNIT_ACT - see docs/ai/legacy/MISSING_AND_UNCERTAIN.md
    "SHIELD",   // [CONFIRMED class ShieldUnitState exists] %-based damage cut, limited # of hits (remainCount)
    "BARRIER",  // [CONFIRMED class BarrierUnitState exists] flat HP-pool damage absorption
    "UP_WEAK_ELEMENT_DMG_RATIO", // [CONFIRMED via ScoreAttackTeam.ts] adds onto the weak-hit multiplier only
    "UP_ELEMENT_DMG_RATE_RATIO", // [CONFIRMED] unconditional elemental give-damage bonus, filtered by element via isEligibleForEffect
    "UP_GIV_DMG_ACCUM_RATIO",    // [CONFIRMED] "Accumulated DMG+"
    "UP_GIV_SLIP_DMG_RATIO",     // [CONFIRMED] "DOT DMG+" - only affects DOT ticks, see UnitStateEngine.ts
    "DWN_RCV_DMG_RATIO",         // [CONFIRMED] "Decrease DMG Taken" - a defensive buff despite the DWN_ prefix
    "UP_HP_RATIO",               // [CONFIRMED 3.19] [IMPLEMENTED] max-HP-% increase - see KiokuState.updateMaxHp
    "UP_HP_FIXED",               // [CONFIRMED 3.19] [IMPLEMENTED] flat max-HP increase (sub-crys "Max HP +N") - see KiokuState.updateMaxHp
    "ADD_BUFF_TURN", "ADD_BUFF_TURN_IMM",     // [CONFIRMED 3.19] [IMPLEMENTED] state: +value1 turns to buffs the holder gives (storeTimedEffect); _IMM: instant +value2 (applyEffect)
    "GAIN_SP_FIXED",   // [CONFIRMED] [IMPLEMENTED] flat add to the attack/skill alternation counter
    "REMOVE_ALL_ABNORMAL", // [CONFIRMED] [IMPLEMENTED] cleanses Ailment-type states, mirrors REMOVE_ALL_DEBUFF
    "ADDITIONAL_DAMAGE",   // [CONFIRMED] [IMPLEMENTED] one extra hit per opponent hit, after the skill - see KiokuState.additionalDamageAfterLaunch
    "RECOVERY_HP_ATK",     // [CONFIRMED] [IMPLEMENTED] heal scaling off the healer's own ATK
    "CONTINUOUS_RECOVERY", // [CONFIRMED] [IMPLEMENTED] heal-over-time, mirrors the DOT tick pattern
    "UP_HATE",             // [CONFIRMED] [IMPLEMENTED, CORRECTED] contributes to getThreatWeight() while active - see UnitStateEngine.ts. No longer a permanent mutation of `aggro`, which was both unreachable for real (timed) instances and wrong even for a hypothetical untimed one - see applyEffect's comment.
    "DWN_HATE",            // [CONFIRMED string exists in UnitStateFactory's dispatch table] [IMPLEMENTED] the debuff mirror of UP_HATE - subtracts from getThreatWeight() while active. Placed in friendlySkills by assumed symmetry with UP_HATE (a unit reducing its OWN or an ally's threat is a supportive act); not independently confirmed which side it targets.
    "CHARGE",              // [CONFIRMED] [IMPLEMENTED] see applyEffect + AITargetSelector.ts
    "REVIVAL_RATIO",       // [CONFIRMED] [NEWLY IMPLEMENTED - was entirely absent] see applyEffect + AITargetSelector.ts's revivalChain
    "COMBO",               // [CONFIRMED] [NEWLY IMPLEMENTED - required restructuring the turn loop, was entirely absent] grants `value1` total actions this turn (the MAX active COMBO effect wins, they don't stack additively) - see useAttackOrSkill, getMaxComboActionNum (UnitStateEngine.ts), and AITargetSelector.ts's comboChain. Not rare: 259 real occurrences across active+passive skill data.
    "REMOVE_ALL_BUFF",     // [CONFIRMED] [IMPLEMENTED] see applyEffect - dispels active friendlySkills-classified effects. Its AI targeting chain is independently confirmed (AITargetSelector.ts); the removal logic itself mirrors REMOVE_ALL_DEBUFF/REMOVE_ALL_ABNORMAL rather than being separately decompiled.
    "REMOVE_ALL_UNABLE_ACTION", // [NEWLY ADDED] [IMPLEMENTED] confirmed real (AbilityEffectFactory dispatch table) but was entirely unclassified/unhandled before this pass - cleanses STUN. See applyEffect + AITargetSelector.ts (shares REMOVE_ALL_DEBUFF/ABNORMAL's base targeting chain).
    "UP_EFFECT_HIT_RATE_RATIO", "UP_ABNORMAL_HIT_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] now consumed by rollAppliesEffect (UnitStateEngine.ts) as the caster-side hit-rate bonus for the buff/debuff/aliment probability-to-apply roll - moved out of RECOGNIZED-ONLY now that roll exists. A generic stat-buff UnitState with no bespoke Triggering of its own, so "implemented" here means "correctly stored and then read back", not a dedicated handler branch in applyEffect.
    "UP_EFFECT_PARRY_RATE_RATIO", "UP_ABNORMAL_PARRY_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] same as above but the target-side resist half of the same roll (reduces the caster's effective hit rate against this unit specifically).
    // --- RECOGNIZED ONLY below (classified for targeting/counting; no gameplay logic) ---
    // CONSUME_COUNT_POINT/GAIN_COUNT_POINT/COUNT: [CORRECTED] these are REAL strings (all
    // three appear in the actual base_data JSON skill/passive tables - confirmed by
    // direct inspection, not just absence-of-evidence), but they are NOT part of either
    // generic dispatch table found in BattleUnit.c (AbilityEffectFactory's 27 special
    // types, or UnitStateFactory's 93 generic UnitState types - both exhaustively
    // enumerated, see docs/ai/legacy/MISSING_AND_UNCERTAIN.md). They occur a combined ~11 times total
    // out of 32,000+ effect-detail rows, all with value1=value2=0 and description text
    // describing a bespoke "sigil" mechanic (+1 per hit received, cap 20) that isn't
    // expressible via the standard value1-5 slots at all. This is the same shape as
    // TSUBAME/ZONE_STACK/UNIQUE_* below: a character-specific hardcoded mechanic, not a
    // generic engine system - implementing it generically (as this scaffolding implies)
    // would be inventing behavior. Left classified (so targeting/counting doesn't choke
    // on them) but not implemented; if a specific roster character actually needs this,
    // that character's own class would need to be found and decompiled.
    "CONSUME_COUNT_POINT", "GAIN_COUNT_POINT", "COUNT",
    "CONSUME_ZONE_STACK", "GAIN_ZONE_STACK", "ZONE_EXPAND", "ZONE_STACK", "UNIQUE_ZONE",
    "SWITCH_SKILL", "TSUBAME", "TSUBAME_CORE", "TSUBAME_LINK",
    "UNIQUE_BUFF", "UNIQUE_BUFF_ACCUM", "UNIQUE_10030301", "UNIQUE_10070201",
    "RESET_UNIQUE_BUFF",
    "UP_BREAK_EFFECT", "UP_HEAL_RATE_RATIO", "REGAIN_ATK",
    "UP_BUFF_EFFECT_VALUE", "DWN_BUFF_EFFECT_VALUE", // pre-battle stat-scaling traits, already applied once in PvPKioku.ts - listed here only so they're classified if they somehow appear as in-battle effects too
]

const enemySkills = [
    "DMG_ATK",
    "DMG_DEF",
    "DMG_HP", // [CONFIRMED via ReDriveBattleCore.AbilityEffect.DmgHpAbilityEffect]
    "DWN_ATK_RATIO",
    "DWN_SPD_RATIO",
    "DWN_DEF_RATIO",
    "WEAKNESS", // [CONFIRMED] this is the Aqua-element Ailment (elementAlimentMap), not a generic "vulnerability" flag - see Ailment handling below
    "SLOW",
    "UP_RCV_DMG_RATIO", // [CONFIRMED] "DMG Taken%+" - a debuff despite the UP_ prefix
    "STUN", // [CONFIRMED string] [IMPLEMENTED, RECONSTRUCTED turn-skip mechanics] now wired into the turn engine - see KiokuState.canNotAction and useAttackOrSkill/useUltimate. The bool field's existence/read-site is confirmed; the exact turn-consumption mechanics (does the gauge fully reset, do TURN_START passives still fire, etc.) are a reasonable reconstruction, not decompiled - see docs/ai/legacy/MISSING_AND_UNCERTAIN.md
    "POISON_ATK", "POISON_DEF", "POISON_HP", // [CONFIRMED classes exist] DOT, ticks at end of turn
    "BURN_ATK", "BURN_DEF", "BURN_HP",       // [CONFIRMED classes exist]
    "BLEED_ATK", "BLEED_DEF", "BLEED_HP",    // [CONFIRMED classes exist]
    "CURSE_ATK", "CURSE_DEF", "CURSE_HP",    // [CONFIRMED classes exist]
    "VORTEX_ATK", // [CONFIRMED string; RECOGNIZED ONLY - not wired into tickDotEffects, no _DEF/_HP variant confirmed to exist]
    "UP_GIV_VORTEX_DMG_RATIO", // [CONFIRMED string; RECOGNIZED ONLY, pairs with VORTEX_ATK]
    "ADD_DEBUFF_TURN", "ADD_DEBUFF_TURN_IMM", // [CONFIRMED 3.19] [IMPLEMENTED] as ADD_BUFF_TURN, for debuffs (not ailments)
    "DWN_ELEMENT_RESIST_RATIO", "DWN_ELEMENT_RESIST_ACCUM_RATIO", // [CONFIRMED] see UnitStateEngine.getElementResistRate
    "IMM_SLIP_DMG", // [CONFIRMED 3.19] [IMPLEMENTED] instant DOT burst (ImmSlipDmgAbilityEffect), see applyEffectToTarget
    "REFLECTION_RATIO", // [CONFIRMED string; RECOGNIZED ONLY] damage reflection - not implemented, needs a "reflect N% of the next hit back at the attacker" hook that touches the DMG_ pipeline in applyEffect; flagged rather than guessed at
    "RESET_UNIQUE_DEBUFF", "UNIQUE_DEBUFF", "UNIQUE_DEBUFF_ACCUM", // RECOGNIZED ONLY, character-specific
    "UP_EFFECT_PARRY_RATE_RATIO", "UP_ABNORMAL_PARRY_RATE_RATIO", // [CONFIRMED] [IMPLEMENTED] see friendlySkills' copy of this same pair for what changed - this entry is pre-existing and now redundant (friendlySkills.includes is checked first in completeAction, so this array's copy is presently unreachable) rather than wrong; left in place rather than deleted since it's not causing any issue and this pass isn't the place to relitigate which side these belong on.
    "UP_RCV_BREAK_POINT_DMG_RATIO", // RECOGNIZED ONLY
    "UP_DEBUFF_EFFECT_VALUE", "DWN_DEBUFF_EFFECT_VALUE", // pre-battle trait scaling, classified only
]

export function isFriendlyEffect(type: string): boolean {
    const side = EFFECT_TARGET_SIDE[type]
    return side ? side === "Friend" : friendlySkills.includes(type)
}
export function isOpponentEffect(type: string): boolean {
    const side = EFFECT_TARGET_SIDE[type]
    return side ? side === "Opponent" : enemySkills.includes(type)
}
