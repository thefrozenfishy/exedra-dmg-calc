/**
 * UnitStateEngine.ts
 * ===================
 * Ported from the decompiled sources of:
 *   - ReDriveBattleCore.BattleUnit$$GetProcessedAtk / GetProcessedDef / GetProcessedCtr /
 *     GetProcessedCtd / GetProcessedRcvCtr   (the "stat accumulator" architecture)
 *   - ReDriveBattleCore.UnitState.{UpAtkFixedUnitState, UpAtkRatioUnitState,
 *     UpAtkAccumRatioUnitState, DwnAtkRatioUnitState, DwnAtkAccumRatioUnitState}
 *     and their base classes (ParameterVariationUnitStateBase / UpAttackUnitStateBase /
 *     DownAttackUnitStateBase)
 *   - ReDriveBattleCore.UnitState.IAccum$$Accumulate (stacking/merge semantics)
 *   - ReDriveBattleCore.UnitState.UnitStateBase$$IsActive / PassingTurn / CanAddTo
 *
 * REVISION 2 - cross-checked against the person's real enums.ts/KiokuTypes.ts/helpers.ts
 * and their ScoreAttackTeam.ts/ScoreAttackKioku.ts reference implementation. Concretely:
 *   - `SkillDetail.value2`/`value3` (PassiveSkill) or `value2`/`value3`/`value4`
 *     (ActiveSkill) are REQUIRED numeric fields (not optional) - AccumCountMax-as-value2
 *     is still an inference, but the field itself reading cleanly as a number is no
 *     longer in question.
 *   - `SkillDetail.element: number` is a REQUIRED field (not the optional/guessed
 *     `targetElement` used in revision 1) - fixed getElementResistRate below.
 *   - The real, confirmed (from enums.ts's UI label lists) ability effect type strings
 *     do NOT include any DWN_CTR or DWN_CTD variant at all - only UP_CTR/UP_CTD Fixed/
 *     Ratio/AccumRatio are listed. I've removed the DWN_CTR_FAMILY/DWN_CTD_FAMILY
 *     speculative entries rather than keep guessing at debuffs that may not exist as
 *     game content (there may simply be no "reduce enemy crit rate/damage" mechanic).
 *   - "UP_WEAK_ELEMENT_DMG_RATIO" (my original revision-1 guess, which I'd second-guessed
 *     in the interim) is directly confirmed by ScoreAttackTeam.ts's `elem_dmg_up` - see
 *     DamageCalculator.ts's CorrelationEffect section.
 *   - "UP_ELEMENT_DMG_RATE_RATIO" is a DIFFERENT, confirmed-real effect type (also in
 *     enums.ts) that folds unconditionally into give-damage-ratio, not gated by weak
 *     hits - added to GIVE_DMG_FAMILY below.
 *
 * ARCHITECTURE (CONFIRMED, high confidence)
 * ------------------------------------------
 * Every "processed" stat (buffed ATK, buffed DEF, buffed crit rate, etc.) is computed
 * the same way in the source engine:
 *
 *   1. Start from a base value (either the unit's raw unbuffed stat, or 0 for rates
 *      like Ctr/Ctd which are then divided by 10 - they're stored in per-mille).
 *   2. Walk the unit's active UnitState list IN THE ORDER THEY WERE APPLIED (not
 *      sorted by anything) filtering to states that "affect this stat" (in C#, this is
     *  a marker interface like IAtkVariation; here it's an abilityEffectType allow-list).
 *   3. For each active one (IsActive() check against current battle conditions), call
 *      its own value function, which receives the RUNNING total so far and returns a
 *      DELTA to add. Sum all the deltas onto the base.
 *
 * This file reimplements that architecture generically (`accumulateVariation`) and
 * provides the per-stat entry points (getProcessedAtk, getProcessedDef, ...).
 *
 * PER-EFFECT-SHAPE FORMULAS (confidence varies - see each block)
 * -----------------------------------------------------------------
 * Every stat has (at minimum) three shapes, verified byte-for-byte for the ATK family
 * via ReDriveBattleCore.UnitState.{UpAtkFixedUnitState,UpAtkRatioUnitState,
 * UpAtkAccumRatioUnitState,DwnAtkRatioUnitState,DwnAtkAccumRatioUnitState}$$GetAtkVariationValue:
 *
 *   UP_x_FIXED         delta = +value1                      (flat add)
 *   DWN_x_FIXED         delta = -value1                      (flat subtract)
 *   UP_x_RATIO         delta = +baseStat * (value1/10) / 100     (% of BASE, unbuffed)
 *   DWN_x_RATIO         delta = -runningTotal * (value1/10) / 100 (% of RUNNING total so far)
 *   UP_x_ACCUM_RATIO   delta = +baseStat * (value1/10 * AccumCountMax) / 100
 *   DWN_x_ACCUM_RATIO   delta = -runningTotal * (value1/10 * AccumCountMax) / 100
 *
 * This table is CONFIRMED for Atk/Def specifically. Ctr/Ctd/RcvCtr do NOT follow it -
 * see REVISION 3 below for their actual (quite different) per-effect shapes, and
 * accumulateCrit() rather than accumulateVariation() for their implementation. The
 * three-step "walk the list, sum deltas onto a base" architecture above still holds for
 * them; only which delta each effect type contributes differs from this table.
 *
 * *** IMPORTANT / SURPRISING, FLAGGED FOR YOUR VERIFICATION ***
 * The ACCUM_RATIO formulas use AccumCountMax (the stacking CAP), not AccumCount (the
 * number of stacks actually accumulated so far). I decoded this directly from the
 * decompiled GetAtkVariationValue bodies (both Up and Dwn) and it is unambiguous - the
 * field read is literally `_AccumCountMax_k__BackingField`, not `_AccumCount_...`. This
 * means (per the decompiled code, at face value) an Accum-Ratio buff/debuff always
 * applies as if it were fully stacked, regardless of how many times it's actually been
 * applied. This is surprising enough that I want you to double check it rather than
 * silently trust it - see MISSING_AND_UNCERTAIN.md.
 *
 * `value1` is stored in PER-MILLE-OF-A-PERCENT for Ratio effects specifically for Ctr/Ctd
 * (divided by 10 to get a percent, matching Kioku.ts's `critDamage = data.minCritDmg*10`
 * / `critRate = data.minCritRate*10` convention already in this codebase - i.e. value1
 * uses the SAME x10 scale as the base crit fields). For Atk/Def Ratio effects, value1 is
 * ALSO divided by 10 then 100 (see REVISION 3 below), NOT a different /1000-in-one-step
 * scale as previously claimed here. That claim was an over-generalization from SPD's
 * `updateSpd()` (a separate, hand-rolled function in PvPTeam.ts that predates this file
 * and was never routed through this generic accumulator) to Atk/Def, which turned out to
 * be unrelated: this revision directly decompiled UpAtkRatioUnitState$$GetAtkVariationValue
 * and it uses the exact same /10-then-/100 shape as Ctr/Ctd. The two ARE the same
 * convention; only SPD's own bespoke code differs, and that's fine left as-is.
 *
 * REVISION 3 - the person supplied direct computer (Ghidra + this file's own BattleUnit.c
 * dump) access, which resolved several things the prior revision could only guess at:
 *
 *   1. [FLOAT-PRECISION BUG, FIXED] GetProcessedCtr/Ctd/RcvCtr's `running` accumulator is
 *      a native C# `float` the WHOLE way through (`float fVar17; ...; fVar17 = fVar17 +
 *      fVar16;` inside the loop, decompiled byte-for-byte) - NOT decimal like Atk/Def
 *      (GetProcessedAtkDecimal/GetProcessedDefDecimal operate on System.Decimal). This
 *      file previously only applied `f32()` to the FINAL result, after summing every
 *      effect in full float64 precision - under-replicating the real per-step float32
 *      rounding, which *will* eventually diverge from the live game once enough stacked
 *      crit-rate/crit-damage effects are active (exactly the kind of "eventual floating
 *      point precision error" that prompted this revision). Fixed: getProcessedCtr/Ctd/
 *      RcvCtr now round to float32 after every individual addition, mirroring the
 *      decompiled loop exactly. See accumulateCrit() below.
 *
 *   2. [FORMULA BUG, FIXED] Ctr/Ctd do NOT share Atk/Def's "Fixed=flat, Ratio=%-of-base,
 *      AccumRatio=%-of-base-times-stacks" shape at all - previously assumed "by
 *      convention", without a decompiled Ctr/Ctd body to check against. Byte-for-byte
 *      from UpCtrFixedUnitState/UpCtrAccumRatioUnitState/DwnCtrFixedUnitState/
 *      DwnCtrAccumRatioUnitState$$GetCtrVariationValue (and the CTD mirrors, spot-checked
 *      via DwnCtdFixedUnitState):
 *        UP_CTR_FIXED        delta = +(value1/10)                         (flat, unscaled)
 *        UP_CTR_ACCUM_RATIO  delta = +(value1/10) * AccumCountMax          (flat * stacks)
 *        DWN_CTR_FIXED       delta = -(running * (value1/10) / 100)       (!) scales with
 *                                                                          the RUNNING total
 *                                                                          despite the
 *                                                                          "Fixed" name
 *        DWN_CTR_ACCUM_RATIO delta = -(running * (value1/10) * AccumCountMax / 100)
 *      i.e. UP_CTR_FIXED needed a `/10` it wasn't getting (10x too strong before), and
 *      DWN_CTR_FIXED/DWN_CTR_ACCUM_RATIO weren't wired up at all (empty-string sentinels,
 *      on the assumption from enums.ts that no down-variant existed - it does, see below).
 *      No plain "Ratio" (non-Fixed, non-Accum) class exists for Ctr/Ctd in EITHER
 *      direction - `UP_CTR_RATIO`/`UP_CTD_RATIO` (assumed real previously, from an
 *      enums.ts UI-label-list reading) have no backing UnitState class anywhere in
 *      BattleUnit.c. Since an enum label with no implementing class can't actually apply
 *      an effect in battle, I'm treating compiled-class evidence as authoritative over
 *      the label-list inference here - see MISSING_AND_UNCERTAIN.md for how to double
 *      check this against your real skill/passive data if you want to be certain.
 *
 *   3. [FORMULA BUG, FIXED] GetProcessedRcvCtr was calling the SAME shared accumulator as
 *      Atk/Def with `baseValue=0` (there's no inherent "base" RcvCtr stat) - which meant
 *      its one real effect type, UP_RCV_CTR_RATIO (routed to the "ratioUp" slot, whose
 *      formula multiplies by baseValue), computed `0 * anything = 0` UNCONDITIONALLY.
 *      getProcessedRcvCtr returned 0 no matter what was active. Byte-for-byte from
 *      UpRcvCtrRatioUnitState$$GetRcvCtrVariationValue: delta = +(value1/10), flat and
 *      unscaled - architecturally identical to Ctr's UP_FIXED shape despite the "Ratio"
 *      name. Only this ONE shape (Up, no Fixed/AccumRatio/Down variant) has a backing
 *      class anywhere in BattleUnit.c for RcvCtr.
 *
 *   4. [ORDER-OF-OPERATIONS, FIXED] Every Ratio/AccumRatio GetXVariationValue body builds
 *      the percentage as its OWN fully-formed decimal value - `(value1/10)/100` (or with
 *      `*AccumCountMax` folded in) - and only THEN multiplies it by the base/running
 *      stat. accumulateVariation() previously computed `baseValue * (value1/10) / 100`,
 *      which (left-to-right) multiplies by baseValue BEFORE dividing by 100 - the same
 *      real number, but a different floating-point operation order than the source
 *      performs. Regrouped below to match the confirmed call order exactly.
 *
 * Two things this revision did NOT change, flagged rather than silently left:
 *   - `DWN_ATK_FIXED`/`DWN_DEF_FIXED` (assumed to exist in ATK_FAMILY/DEF_FAMILY below)
 *     have no backing UnitState class in BattleUnit.c either (only Up-Fixed exists for
 *     Atk/Def; the Down direction only has Ratio/AccumRatio) - but I've left the mapping
 *     in place rather than remove it: if it's simply unused it's harmless dead code, and
 *     removing it is the riskier direction if I've somehow missed the real class. Flagged
 *     for your awareness, not changed.
 *   - The generic effect-activity check (isEffectCurrentlyActive / stateGen(this, this))
 *     that every accumulator here relies on never threads a real attacker/trueActorUnit
 *     through - so a hypothetical "always crit against unit X" condition on a Ctr/RcvCtr
 *     effect can't currently evaluate correctly regardless of the formula fix above. This
 *     predates this revision and isn't specific to Ctr/Ctd; see MISSING_AND_UNCERTAIN.md
 *     rather than a half-fix scoped to just this file.
 *
 * STACKING / RE-APPLICATION (IAccum.Accumulate)
 * -----------------------------------------------
 * [CONFIRMED] When a buff/debuff is (re)applied to a unit that already has an ACTIVE
 * instance of the exact same UnitState subclass:
 *   - If both have the same UpdateableEffectValue (value1) AND the same AccumCountMax:
 *     bump the existing instance's AccumCount by 1 (capped at AccumCountMax), and
 *     refresh RemainingTurn to the new application's duration. The new instance is
 *     discarded (merged into the existing one).
 *   - Otherwise, the new instance REPLACES the old one only if it's "at least as good"
 *     (higher value1, or same value1 with a higher AccumCountMax); if the new one is
 *     strictly worse, the application is rejected entirely (old one keeps ticking).
 *   - On replace: AccumCount resets to 1, and MstId/RemainingTurn/value1/AccumCountMax
 *     all take on the new instance's values.
 * This is implemented below as `mergeAccumEffect`. Non-accum effects (Fixed / plain
 * Ratio) don't have this merge dance in the source - re-applying one is architecturally
 * just "add a new independent UnitState instance to the list" (each contributes its own
 * delta every time GetProcessedX runs), which the existing PvPTeam.ts code already does
 * correctly by keying `activeEffectDetails` by skillDetailId (a fresh application of the
 * *same* skill/ability just refreshes its Map entry - turn count resets, single active
 * copy). I did not change that behavior for non-accum effects.
 */

import { KiokuState, isAlimentEffect } from "./PvPTeam";
import { SkillDetail, aggro } from "../types/KiokuTypes";
import { elementMap, roleMap } from "../types/enums";

const f32 = Math.fround;

// ---------------------------------------------------------------------------
// Ability-effect-type naming convention
// ---------------------------------------------------------------------------
// [CONFIRMED convention] Every ability effect type string already present in this
// codebase (UP_ATK_FIXED, UP_ATK_RATIO, DWN_ATK_RATIO, UP_DEF_FIXED, DWN_DEF_RATIO,
// UP_CTR_FIXED, UP_CTD_FIXED, UP_HP_FIXED, UP_SPD_FIXED, UP_SPD_RATIO, DWN_SPD_FIXED,
// DWN_SPD_RATIO, UP_GIV_DMG_RATIO, ADDITIONAL_SKILL_ACT, DMG_ATK, DMG_DEF, ...) is the
// C# UnitState class name with the "UnitState"/"UnitStateBase" suffix stripped and the
// remainder SCREAMING_SNAKE_CASEd, matching Up/Dwn -> UP_/DWN_ prefix. I've applied this
// exact, already-validated transformation to name every additional effect type this
// file needs that ISN'T already confirmed elsewhere. Anything not previously confirmed
// in the provided files is marked [INFERRED] below - please check against your actual
// skillDetails/passiveDetails data and fix the string literals if they differ.

type StatFamily = {
    fixedUp: string; fixedDown: string;
    ratioUp: string; ratioDown: string;
    accumRatioUp: string; accumRatioDown: string;
};

// [CONFIRMED byte-for-byte, revision 3 - see UpAtkFixedUnitState/UpAtkRatioUnitState/
// UpAtkAccumRatioUnitState/DwnAtkRatioUnitState/DwnAtkAccumRatioUnitState and their
// DEF mirrors in BattleUnit.c] This StatFamily shape (Fixed=flat add, Ratio=%-of-BASE,
// AccumRatio=%-of-base*stacks, Down variants scale off the RUNNING total instead of
// base) is CONFIRMED correct for ATK/DEF specifically. It does NOT generalize to Ctr/Ctd/
// RcvCtr - see accumulateCrit() below, which replaces what used to be CTR_FAMILY/
// CTD_FAMILY/RCV_CTR_FAMILY here (that generalization-by-convention turned out wrong;
// see the file header's REVISION 3 section for the byte-level formulas that replaced it).
const ATK_FAMILY: StatFamily = {
    fixedUp: "UP_ATK_FIXED", fixedDown: "DWN_ATK_FIXED",
    ratioUp: "UP_ATK_RATIO", ratioDown: "DWN_ATK_RATIO",
    accumRatioUp: "UP_ATK_ACCUM_RATIO", accumRatioDown: "DWN_ATK_ACCUM_RATIO", // [INFERRED]
};
const DEF_FAMILY: StatFamily = {
    fixedUp: "UP_DEF_FIXED", fixedDown: "DWN_DEF_FIXED", // DWN_DEF_FIXED is [INFERRED]; UP_DEF_FIXED confirmed (Kioku.ts), DWN_DEF_RATIO confirmed (enemySkills)
    ratioUp: "UP_DEF_RATIO", ratioDown: "DWN_DEF_RATIO", // ratioDown CONFIRMED (enemySkills), ratioUp [INFERRED]
    accumRatioUp: "UP_DEF_ACCUM_RATIO", accumRatioDown: "DWN_DEF_ACCUM_RATIO", // [INFERRED]
};
// NOTE: `fixedDown` on both families above ("DWN_ATK_FIXED"/"DWN_DEF_FIXED") has NO
// backing UnitState class found anywhere in BattleUnit.c (only DwnAtkRatioUnitState and
// DwnAtkAccumRatioUnitState exist for the Down direction - confirmed by exhaustive grep,
// mirrored exactly for Def). Left in place rather than removed: harmless if truly unused,
// and removing it is the riskier direction if this simply missed the real class name.

// ---------------------------------------------------------------------------
// Generic accumulator - mirrors BattleUnit.GetProcessedAtk/GetProcessedDef exactly.
// Ctr/Ctd/RcvCtr have their own accumulator (accumulateCrit, below) - see the file
// header's REVISION 3 section for why they don't fit this shape.
// ---------------------------------------------------------------------------
// [CONFIRMED architecture] See file header. `baseValue` is the unit's raw unbuffed
// ATK or DEF (Kioku.ts's getBaseAtk()/getBaseDef()).
function accumulateVariation(unit: KiokuState, family: StatFamily, baseValue: number): number {
    let running = baseValue;
    const orderedEffects = orderedActiveEffectsInApplicationOrder(unit);
    for (const detail of orderedEffects) {
        const t = detail.abilityEffectType;
        let delta = 0;
        if (t === family.fixedUp) {
            delta = detail.value1;
        } else if (t === family.fixedDown) {
            delta = -detail.value1;
        } else if (t === family.ratioUp) {
            // [CONFIRMED grouping, revision 3] UpAtkRatioUnitState$$GetAtkVariationValue
            // builds (value1/10)/100 as its own value FIRST, then multiplies by the base
            // stat - not (base*value1/10)/100. Same real number, different float order.
            delta = baseValue * ((detail.value1 / 10) / 100);
        } else if (t === family.ratioDown) {
            // [CONFIRMED grouping, revision 3] DwnAtkRatioUnitState$$GetAtkVariationValue
            delta = -(running * ((detail.value1 / 10) / 100));
        } else if (t === family.accumRatioUp) {
            // [CONFIRMED grouping, revision 3] UpAtkAccumRatioUnitState$$GetAtkVariationValue:
            // (value1/10)*AccumCountMax fully formed, THEN /100, THEN *base.
            const accumCountMax = getAccumCountMax(detail);
            delta = baseValue * (((detail.value1 / 10) * accumCountMax) / 100);
        } else if (t === family.accumRatioDown) {
            const accumCountMax = getAccumCountMax(detail);
            delta = -(running * (((detail.value1 / 10) * accumCountMax) / 100));
        } else {
            continue;
        }
        running += delta;
    }
    return running;
}

// [RECONSTRUCTED, higher confidence in revision 2] `value2` is now confirmed (via the
// real KiokuTypes.ts) to be a REQUIRED numeric field on every SkillDetail - so the field
// itself reading cleanly is no longer in question, only whether it's really
// AccumCountMax specifically (value1 is always the per-stack ratio; value2/value3
// exist for exactly this kind of secondary parameter). Falls back to 1 (behaves like a
// plain Ratio effect) with a one-time warning if somehow absent.
let _warnedAccumCountMax = false;
function getAccumCountMax(detail: SkillDetail): number {
    const v = detail.value2;
    if (v == null) {
        if (!_warnedAccumCountMax) {
            console.warn("AccumCountMax (assumed to be detail.value2) missing on an ACCUM_RATIO effect - defaulting to 1 stack. See MISSING_AND_UNCERTAIN.md.", detail);
            _warnedAccumCountMax = true;
        }
        return 1;
    }
    return v;
}

// [CONFIRMED] ReDriveBattleCore.UnitState.UnitStateBase$$IsActive delegates to the same
// BattleConditionUtils condition-set check already used elsewhere in this codebase
// (isConditionSetActive). Application order = insertion order into activeEffectDetails
// (a JS Map preserves insertion order, matching the C# List<UnitStateBase> append
// order), same as the existing `orderedActiveEffects()` private method on KiokuState -
// this is a copy of that logic so it's usable from outside the class.
function orderedActiveEffectsInApplicationOrder(unit: KiokuState): SkillDetail[] {
    return [...unit.passiveEffectDetails.values(), ...unit.activeEffectDetails.values()]
        .filter(detail => unit.isEffectCurrentlyActive(detail));
}

// ---------------------------------------------------------------------------
// Public per-stat entry points
// ---------------------------------------------------------------------------

// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetProcessedAtk
export function getProcessedAtk(unit: KiokuState): number {
    const base = unit.kioku.getBaseAtk();
    return Math.max(0, Math.floor(accumulateVariation(unit, ATK_FAMILY, base)));
}

// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetProcessedDef
export function getProcessedDef(unit: KiokuState): number {
    const base = unit.kioku.getBaseDef();
    return Math.max(0, Math.floor(accumulateVariation(unit, DEF_FAMILY, base)));
}

// ---------------------------------------------------------------------------
// Ctr / Ctd / RcvCtr accumulator (revision 3 - NOT the generic StatFamily shape)
// ---------------------------------------------------------------------------
// [CONFIRMED byte-for-byte] See the file header's REVISION 3 section for the full
// evidence trail. Unlike Atk/Def:
//   - `running` is a native float the entire way through (GetProcessedCtr/Ctd both
//     declare `float fVar17` and do `fVar17 = fVar17 + fVar16` per effect) - so every
//     partial sum is rounded to float32, not just the final return value.
//   - The Up direction (Fixed and AccumRatio - there is no plain non-Fixed/non-Accum
//     "Ratio" shape for Ctr/Ctd in either direction) is a FLAT delta: just value1/10,
//     times AccumCountMax for the accum shape. It is NOT scaled by the base or running
//     stat the way Atk/Def's Up-Ratio/Up-AccumRatio are.
//   - The Down direction (Fixed and AccumRatio) DOES scale with the running total
//     despite the "Fixed" name: delta = -(running * (value1/10) [* AccumCountMax] / 100).
// `upFixed`/`dwnFixed` also cover RcvCtr's one real shape (UP_RCV_CTR_RATIO), which -
// despite being named "Ratio" - has the exact same flat, unscaled shape as Ctr's
// UP_FIXED (see UpRcvCtrRatioUnitState$$GetRcvCtrVariationValue). Pass "" for any slot
// with no confirmed backing class (see per-call comments below) so it's a guaranteed
// no-op rather than a guessed-at string.
function accumulateCrit(unit: KiokuState, upFixed: string, upAccumRatio: string, dwnFixed: string, dwnAccumRatio: string, base: number): number {
    let running = f32(base);
    for (const detail of orderedActiveEffectsInApplicationOrder(unit)) {
        const t = detail.abilityEffectType;
        let delta: number;
        if (upFixed && t === upFixed) {
            delta = f32(detail.value1 / 10);
        } else if (upAccumRatio && t === upAccumRatio) {
            const accumCountMax = getAccumCountMax(detail);
            delta = f32(f32(detail.value1 / 10) * accumCountMax);
        } else if (dwnFixed && t === dwnFixed) {
            delta = f32(f32(f32(detail.value1 / 10) * running) / -100);
        } else if (dwnAccumRatio && t === dwnAccumRatio) {
            const accumCountMax = getAccumCountMax(detail);
            delta = f32(f32(f32(f32(detail.value1 / 10) * running) * accumCountMax) / -100);
        } else {
            continue;
        }
        running = f32(running + delta);
    }
    return running;
}

// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetProcessedCtr
// Base crit rate is already stored *10 on Kioku (Kioku.ts: `this.critRate = data.minCritRate * 10`),
// matching the /10 the decompiled GetProcessedCtr applies to get a plain percent. The
// base itself is rounded to float32 immediately (matching the decompiled
// `fVar17 = (float)_CTR_k__BackingField / 10.0`), not just the accumulated result.
export function getProcessedCtr(unit: KiokuState): number {
    const base = unit.kioku.critRate / 10;
    return accumulateCrit(unit, "UP_CTR_FIXED", "UP_CTR_ACCUM_RATIO", "DWN_CTR_FIXED", "DWN_CTR_ACCUM_RATIO", base);
}

// [CONFIRMED] ReDriveBattleCore.BattleUnit$$GetProcessedCtd
export function getProcessedCtd(unit: KiokuState): number {
    const base = unit.kioku.critDamage / 10;
    return accumulateCrit(unit, "UP_CTD_FIXED", "UP_CTD_ACCUM_RATIO", "DWN_CTD_FIXED", "DWN_CTD_ACCUM_RATIO", base);
}

// [CONFIRMED existence AND formula, revision 3] ReDriveBattleCore.BattleUnit$$GetProcessedRcvCtr
// "bonus crit rate the DEFENDER suffers when hit by a specific attacker". Base value of 0
// (no bonus by default) since there's no base stat for this on Kioku - only UnitState
// effects add to it. Only ONE shape has a backing class anywhere in BattleUnit.c
// (UpRcvCtrRatioUnitState, folded into the `upFixed` slot below since its formula is the
// flat/unscaled shape, not the base-scaled one "Ratio" would otherwise imply elsewhere in
// this file) - no Fixed/AccumRatio/Down variant was found, so those slots are "".
// `_attacker` remains unused: the source takes it because SOME RcvCtr effects could in
// principle be conditioned on who's attacking, but this port's condition-activity check
// (isEffectCurrentlyActive) never threads a real attacker through regardless of this
// function - see the file header's REVISION 3 closing note.
export function getProcessedRcvCtr(defender: KiokuState, _attacker: KiokuState): number {
    return accumulateCrit(defender, "UP_RCV_CTR_RATIO", "", "", "", 0);
}

// ---------------------------------------------------------------------------
// Give/Receive damage ratio + element resist + weak-element bonus
// ---------------------------------------------------------------------------
// [RECONSTRUCTED - see DamageCalculator.ts header] Base value is 0 (no bonus by
// default); returns a fraction (e.g. 0.15 for +15%), not a percent, so
// DamageCalculator.ts can do `damage + damage*ratio` directly.
//
// [CONFIRMED, revision 2] enums.ts's confirmed list has NO "DWN_GIV_DMG_RATIO" or
// "UP_RCV_DMG_FIXED"/"DWN_RCV_DMG_FIXED" at all. What IS confirmed:
//   - UP_GIV_DMG_RATIO ("DMG%+")
//   - UP_GIV_DMG_ACCUM_RATIO ("Accumulated DMG+")
//   - UP_ELEMENT_DMG_RATE_RATIO ("Elemental DMG+") - CONFIRMED via ScoreAttackTeam.ts's
//     `dmg_dealt = (UP_GIV_DMG_RATIO + UP_GIV_SLIP_DMG_RATIO + UP_GIV_VORTEX_DMG_RATIO +
//     UP_ELEMENT_DMG_RATE_RATIO)/1000` to fold unconditionally into the SAME
//     give-damage-ratio bucket as UP_GIV_DMG_RATIO (not gated by weak-element hits -
//     that's UP_WEAK_ELEMENT_DMG_RATIO's job, handled separately in
//     DamageCalculator.computeCorrelationEffect).
//   - UP_RCV_DMG_RATIO ("DMG Taken%+") - a DEBUFF despite the "UP_" prefix (increases
//     damage the TARGET takes; ScoreAttackTeam.ts's `isDebuffEffect` special-cases this
//     exact string). No DWN_RCV_DMG_RATIO variant confirmed to exist for the opposite
//     (a "receive less damage" buff) - only the separate, confirmed
//     "DWN_RCV_DMG_RATIO" ("Decrease DMG Taken") string, which IS listed, so both
//     directions do exist, just not as a Fixed/Ratio/AccumRatio family sharing one
//     UP_x/DWN_x root the way ATK/DEF do. Modeled as two independent single-ratio pools
//     below (giveDmgRatio, rcvDmgRatio) rather than the shared StatFamily shape, since
//     the UP/DWN pair here isn't a symmetric one root.
const GIVE_DMG_RATIO_TYPES = ["UP_GIV_DMG_RATIO", "UP_ELEMENT_DMG_RATE_RATIO"]; // [CONFIRMED]
const GIVE_DMG_ACCUM_RATIO_TYPES = ["UP_GIV_DMG_ACCUM_RATIO"]; // [CONFIRMED to exist; accum shape applied per the Atk-family AccumRatio formula]
// [CONFIRMED] "DOT DMG+" - a give-damage-ratio bonus that ONLY applies to slip (DOT)
// damage ticks, not direct hits - kept separate from GIVE_DMG_RATIO_TYPES and only
// consulted from getSlipGiveDamageRatioBonus (used by PvPTeam's tickDotEffects, wired
// through DamageCalculator.getSlipDamageResult's getProcessedGiveDamage call using the
// DOT owner).
const GIVE_SLIP_DMG_RATIO_TYPES = ["UP_GIV_SLIP_DMG_RATIO"]; // [CONFIRMED]

function sumRatioTypes(unit: KiokuState, types: string[], scale: number): number {
    let sum = 0;
    for (const detail of orderedActiveEffectsInApplicationOrder(unit)) {
        if (types.includes(detail.abilityEffectType)) sum += detail.value1 / scale;
    }
    return sum;
}

export function getGiveDamageRatioBonus(attacker: KiokuState): number {
    return sumRatioTypes(attacker, [...GIVE_DMG_RATIO_TYPES, ...GIVE_DMG_ACCUM_RATIO_TYPES], 1000);
}

// [CONFIRMED] "UP_RCV_DMG_RATIO" ("DMG Taken%+", a debuff) and "DWN_RCV_DMG_RATIO"
// ("Decrease DMG Taken", a buff) both exist and oppose each other despite not sharing a
// literal Fixed/Ratio/AccumRatio-family root - summed together here (up positive, down
// negative) into a single net ratio.
export function getReceiveDamageRatioBonus(defender: KiokuState): number {
    let sum = 0;
    for (const detail of orderedActiveEffectsInApplicationOrder(defender)) {
        if (detail.abilityEffectType === "UP_RCV_DMG_RATIO") sum += detail.value1 / 1000;
        else if (detail.abilityEffectType === "DWN_RCV_DMG_RATIO") sum -= detail.value1 / 1000;
    }
    return sum;
}

// Used only by DamageCalculator.getSlipDamageResult (DOT ticks) via the DOT owner - see
// PvPTeam.ts's tickDotEffects for how the owner is tracked and passed through.
export function getSlipGiveDamageRatioBonus(attacker: KiokuState): number {
    return sumRatioTypes(attacker, [...GIVE_DMG_RATIO_TYPES, ...GIVE_SLIP_DMG_RATIO_TYPES], 1000);
}

// [CONFIRMED existence, RECONSTRUCTED sign convention] "DWN_ELEMENT_RESIST_RATIO"
// ("Elemental Resistance-") and "DWN_ELEMENT_RESIST_ACCUM_RATIO" ("Accumulated Elemental
// Resistance-") are both confirmed in enums.ts. No "UP_ELEMENT_RESIST_RATIO" (a buff
// form) is confirmed to exist - only the debuff direction is listed, so only that is
// implemented; if a buff form exists in your data, add it symmetrically.
// Filtered by `detail.element` (a REQUIRED, confirmed field on SkillDetail) matching the
// incoming attack's element - revision 1 used a non-existent `targetElement` guess.
export function getElementResistRate(defender: KiokuState, element: number): number {
    const effects = orderedActiveEffectsInApplicationOrder(defender)
        .filter(d => d.element === element || d.element === 0);
    let running = 0;
    for (const d of effects) {
        if (d.abilityEffectType === "DWN_ELEMENT_RESIST_RATIO") running -= d.value1 / 10;
        else if (d.abilityEffectType === "DWN_ELEMENT_RESIST_ACCUM_RATIO") {
            const accumCountMax = getAccumCountMax(d);
            running -= (d.value1 / 10) * accumCountMax;
        }
    }
    return running;
}

// [CONFIRMED] ReDriveBattleCore.UnitState.UpWeakElementDmgRatioUnitState - sums
// `UpRatio/1000` across all active instances on the attacker. Directly confirmed via
// ScoreAttackTeam.ts's `elem_dmg_up = getAllyEffect(..., "UP_WEAK_ELEMENT_DMG_RATIO",
// ...) / 1000` - NOT `/100` as revision 1 guessed. Fixed below.
export function getWeakElementBonus(attacker: KiokuState): number {
    return sumRatioTypes(attacker, ["UP_WEAK_ELEMENT_DMG_RATIO"], 1000);
}

// ---------------------------------------------------------------------------
// AI target-selection "threat"/hate weight
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.AI.AISkillTargetSelector$$GetUnitWeightDic, decompiled
// byte-for-byte. The FULL AUTO damage-targeting AI (see AITargetSelector.ts) picks its
// final target with a weighted random roll where each candidate's weight is:
//
//     weight = roleWeightDict[unit.RoleType] + (withHate ? sum(active IHateVariation
//              state values on unit) : 0), clamped to a floor of 0 (Math.Max(w, 0))
//
// `roleWeightDict` is a static Dictionary<RoleType,int> built in AISkillTargetSelector's
// own .cctor: Defender=15, Healer/Buffer/Debuffer=10, Attacker/Breaker=5 - which is an
// EXACT match for the `aggro` map already in KiokuTypes.ts (Defender 15 / Healer,Buffer,
// Debuffer 10 / Attacker,Breaker 5), confirming that table was already correct - it just
// wasn't being consulted for anything. GetUnitWeightDic is always called with
// withHate=true by every concrete AbilityEffect that uses it (DamageAbilityEffectBase),
// so the `withHate` parameter isn't exposed here; if a withHate=false call site is ever
// needed, add a parameter.
//
// The "sum of active IHateVariation states" half: no UnitState class in the provided
// BattleUnit.c dump was seen literally implementing `IHateVariation` (the dump doesn't
// include every UnitState's full interface list), but UP_HATE/DWN_HATE are the only two
// hate-shaped effect types in the confirmed 93-entry UnitStateFactory dispatch table
// (see MISSING_AND_UNCERTAIN.md), and UP_HATE was already marked [CONFIRMED]
// [IMPLEMENTED] "flat add to aggro" before this pass. Summed here using the same signed
// UP_/DWN_ convention as every other paired buff/debuff in this file (see
// accumulateVariation's `isUp` pattern) - value1 is a plain, unscaled int (confirmed:
// AbilityEffectInfo.EffectValue1 is `int`, not a /1000 or /10 ratio), matching
// CompareContent.CHARGE_POINT's sibling read of `currentMagic` also being unscaled.
export function getThreatWeight(unit: KiokuState): number {
    let weight = aggro[unit.kioku.data.role];
    for (const d of orderedActiveEffectsInApplicationOrder(unit)) {
        if (d.abilityEffectType === "UP_HATE") weight += d.value1;
        else if (d.abilityEffectType === "DWN_HATE") weight -= d.value1;
    }
    return Math.max(weight, 0);
}

// ---------------------------------------------------------------------------
// COMBO: multiple actions per turn
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitCondition$$GetMaximumActionNumComboUnitState: scans
// StateList for active ComboUnitState instances and returns the one with the HIGHEST
// ActionNum (strict `>`, ties keep whichever was found first) - i.e. multiple active
// COMBO effects do NOT stack additively, only the single largest one counts. Confirmed
// against real data: `value1` is the action count directly (a sample skill description
// reads literally "Grants 2 actions." with value1=2). ComboUnitState.GetActionNum just
// returns its own stored field with no further transformation. Used from
// ReDriveBattleCore.TurnActSystem$$Forward, which treats anything below 2 as "no combo,
// do a normal single action" (see useAttackOrSkill in PvPTeam.ts for where this plugs
// into the turn loop).
export function getMaxComboActionNum(unit: KiokuState): number {
    let max = 1;
    for (const d of orderedActiveEffectsInApplicationOrder(unit)) {
        if (d.abilityEffectType === "COMBO" && d.value1 > max) max = d.value1;
    }
    return max;
}

// ---------------------------------------------------------------------------
// Probability-roll-to-apply (buff/debuff/aliment "hit chance")
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitCondition$$AddUnitState - the method that actually
// adds a UnitState (buff/debuff/aliment) to a unit's condition - opens with a probability
// roll that can silently fail the ENTIRE application, before anything else happens:
//
//     float probability = state.GetProcessedProbability(targetUnit, userUnit);
//     int roll = new Random().Next(1000);                    // integer, 0-999
//     if (probability * 10.0f <= (float)roll) return false;   // FAILED - nothing applied
//
// This governs every one of the ~93 UnitState-backed effect types (ordinary buffs,
// debuffs, shields, barriers, aliments/status effects). It does NOT apply to the ~27
// AbilityEffectFactory-special types (damage, charge, EP/HP, revival, haste/slow,
// remove-all-X, etc.) - none of those showed a probability roll in their own decompiled
// Triggering methods when read; they mutate state directly. This lines up exactly with
// this codebase's existing split between applyEffect's own direct branches and
// storeTimedEffect (the stand-in for "add a UnitState"), which is exactly the set this
// roll should gate - see storeTimedEffect's own call to rollAppliesEffect.
//
// GetProcessedProbability (UnitStateBase$$GetProcessedProbability), [CONFIRMED]:
//     hitRate    = userUnit != null ? userUnit.GetTotalEffectHitRate(state) : 1.0
//     parryRate  = targetUnit.GetTotalEffectParryRate(state)
//     secondary  = targetUnit.GetTotalSecondaryEffectParryRate(state)
//     result     = Floor(secondary * parryRate * hitRate * state.Probability, 2 decimals)
//     return Clamp(result, 0, 100)
//
// GetTotalEffectHitRate (BattleUnit$$GetTotalEffectHitRate), [CONFIRMED shape]:
//     rate = 0
//     if (<a vtable condition on the state not fully identified>) rate += GetProcessedEffectHitRate()   // this unit's own accumulated UP_EFFECT_HIT_RATE_RATIO-style bonus
//     if (state is AbnormalUnitStateBase) rate += GetAllAbnormalHitRate() / 100              // additional bonus, aliments only
//     return Max(rate + 1, 0)
//
// GetTotalEffectParryRate (BattleUnit$$GetTotalEffectParryRate), [CONFIRMED shape]:
//     rate = <same vtable condition> ? GetProcessedEffectParryRate() : 0
//     return Clamp(1 - rate, 0, 1)
//
// GetTotalSecondaryEffectParryRate (BattleUnit$$GetTotalSecondaryEffectParryRate),
// [CONFIRMED shape, NOT fully implemented here - see below]:
//     rate = 0
//     if (state is StunUnitState) rate += Condition.RepeatStunParryRate / 100   // an
//         accumulating anti-stun-lock resistance that builds up after being stunned -
//         CONFIRMED TO EXIST but this port has no model of when/how RepeatStunParryRate
//         itself increases (that lives in whatever code runs when a stun actually lands
//         or expires, which wasn't located in this pass)
//     if (state is AbnormalUnitStateBase) rate += GetAbnormalParryRate(state) +
//         GetAllAbnormalParryRate() / 100   // a PER-ALIMENT-TYPE resistance
//         (GetAbnormalParryRate) stacked with a general one - this port only models the
//         general one (as UP_ABNORMAL_PARRY_RATE_RATIO), not a per-type breakdown
//     return Clamp(1 - rate, 0, 1)
//
// [RECONSTRUCTED] The bodies of GetProcessedEffectHitRate/GetProcessedEffectParryRate/
// GetAllAbnormalHitRate/GetAllAbnormalParryRate/GetAbnormalParryRate themselves weren't
// decompiled - approximated here using this file's own established ratio-accumulation
// convention (sum of active UP_EFFECT_HIT_RATE_RATIO / UP_EFFECT_PARRY_RATE_RATIO /
// UP_ABNORMAL_HIT_RATE_RATIO / UP_ABNORMAL_PARRY_RATE_RATIO, each value1/1000) rather than
// guessed from nothing, but the exact internals, the per-aliment-type breakdown, and the
// repeat-stun resistance are confirmed to exist and NOT modeled here.
//
// `isFixedProbability` (a real field on SkillDetail, confirmed present in the actual game
// data) is read here as "skip all of the above, use the base `probability` value
// directly" - not decompiled, but the only reading of "Fixed" that makes sense paired
// with a hit/parry-modifiable default.
function getTotalEffectHitRate(caster: KiokuState, isAliment: boolean): number {
    let rate = sumRatioTypes(caster, ["UP_EFFECT_HIT_RATE_RATIO"], 1000);
    if (isAliment) rate += sumRatioTypes(caster, ["UP_ABNORMAL_HIT_RATE_RATIO"], 1000);
    return Math.max(rate + 1, 0);
}
function getTotalEffectParryRate(target: KiokuState): number {
    const rate = sumRatioTypes(target, ["UP_EFFECT_PARRY_RATE_RATIO"], 1000);
    return Math.min(Math.max(1 - rate, 0), 1);
}
function getTotalSecondaryEffectParryRate(target: KiokuState, isAliment: boolean): number {
    if (!isAliment) return 1;
    const rate = sumRatioTypes(target, ["UP_ABNORMAL_PARRY_RATE_RATIO"], 1000);
    return Math.min(Math.max(1 - rate, 0), 1);
}

/**
 * [CONFIRMED formula, RECONSTRUCTED rate internals - see block comment above] Rolls
 * whether a buff/debuff/aliment application succeeds at all. `caster` is the unit
 * applying the effect (its hit-rate bonuses apply); `target` is the unit it's being
 * applied to (its parry/resist bonuses apply). Returns true = applies normally.
 */
export function rollAppliesEffect(detail: SkillDetail, caster: KiokuState | undefined, target: KiokuState, rng: () => number = Math.random): boolean {
    if (detail.isFixedProbability) {
        return rng() * 100 < detail.probability;
    }
    const isAliment = isAlimentEffect(detail.abilityEffectType);
    const hitRate = caster ? getTotalEffectHitRate(caster, isAliment) : 1;
    const parryRate = getTotalEffectParryRate(target);
    const secondaryParryRate = getTotalSecondaryEffectParryRate(target, isAliment);
    const finalProbability = Math.min(Math.max(hitRate * parryRate * secondaryParryRate * detail.probability, 0), 100);
    return rng() * 1000 < finalProbability * 10;
}

// ---------------------------------------------------------------------------
// Generic buff/debuff target eligibility: element/role filters
// ---------------------------------------------------------------------------
// [CONFIRMED] ScoreAttackTeam.ts's buff-distribution loop filters every buff/debuff by
// `detail.element` and `detail.role` against the RECIPIENT's own character data before
// applying it at all:
//     if (detail.element && elementMap[detail.element] !== targetCtx.kioku.data.element) continue;
//     if (detail.role && roleMap[detail.role] !== targetCtx.kioku.data.role) continue;
// This is a GENERIC eligibility gate (e.g. "only Flame characters get this buff", "only
// Attackers get this buff") that applies BEFORE any ability-effect-type-specific logic,
// and applies to every buff/debuff type uniformly - not something the revision-1 port
// implemented at all (no element/role filtering existed anywhere). Exported so
// PvPTeam.ts's applyEffect can gate target eligibility the same way for every effect,
// not just the ones this file happens to compute stats for.
export function isEligibleForEffect(detail: SkillDetail, target: KiokuState): boolean {
    if (detail.element && elementMap[detail.element] !== target.kioku.data.element) return false;
    if ((detail as any).role && roleMap[(detail as any).role] !== target.kioku.data.role) return false;
    return true;
}

// ---------------------------------------------------------------------------
// IAccum stacking / merge logic
// ---------------------------------------------------------------------------
// [CONFIRMED] ReDriveBattleCore.UnitState.IAccum$$Accumulate - see file header for the
// full decoded algorithm. `existingAccumCount` is tracked as an extra property on the
// stored SkillDetail (not present in the original C# field layout since IAccum lives on
// the class instance itself, but this JS port stores effects as plain data records, so
// the count needs a home - I've added it as `._accumCount` directly on the stored
// object rather than inventing a parallel Map, to keep call sites simple).
//
// Returns true if the new application was merged/accepted (caller should NOT add a
// second independent copy), false if it was rejected outright (old one keeps ticking
// unchanged).
export function mergeAccumEffect(existing: SkillDetail & { _accumCount?: number }, incoming: SkillDetail): boolean {
    const existingMax = getAccumCountMax(existing);
    const incomingMax = getAccumCountMax(incoming);
    const existingCount = existing._accumCount ?? 1;

    if (existing.value1 === incoming.value1 && existingMax === incomingMax) {
        if (existingCount < existingMax) {
            existing._accumCount = existingCount + 1;
        }
        (existing as any).turn = incoming.turn; // refresh remaining duration
        return true;
    }

    // Not an exact match: only replace if the incoming one is "at least as good".
    if (incoming.value1 <= existing.value1) {
        if (existing.value1 !== incoming.value1) return false; // strictly worse - reject
        if (incomingMax <= existingMax) return false; // same value1, not a bigger cap - reject
    }

    // Replace in place.
    existing.value1 = incoming.value1;
    existing.value2 = incoming.value2;
    (existing as any).turn = incoming.turn;
    existing._accumCount = 1;
    return true;
}
