# Missing / Uncertain Items (Revision 5 - game version 3.19.0)

Revision 5 moves the engine from the 1.5.0 Android decompilation to the **3.19.0 Windows
build**. The whole `ReDriveBattleCore` namespace (5,416 functions, including compiler-
generated lambdas) is decompiled into `E:\unpackedExedra\3.19.0\decompiled\*.c`, with the
same `// ==== Namespace.Class$$Method ====` headers as before, plus an RVA and C# signature
line. `E:\unpackedExedra\Ghidra\README_headless.md` explains how to regenerate or extend it.
Citations below give the RVA so any claim can be checked in seconds.

1.5.0 -> 3.19.0 diff at signature level (`E:\unpackedExedra\3.19.0\battlecore_diff_1.5.0_to_3.19.0.json`):
487 -> 628 types, 151 added, 10 removed, 110 changed. Several items that earlier revisions
called "character-specific, no class found" simply did not exist in 1.5.0 (TSUBAME_*,
ZONE_*, UNIQUE_*, COUNT, REGAIN_*, VORTEX_ATK, ...). All of them have real classes in
3.19. See GAME_TABLES_3.19.md for the full string -> class table.

## R5.1 Numbers: the game computes damage in System.Decimal, not float/double

`BattleMath.ts` (new) emulates C# `decimal` bit-exactly: .NET Core DecCalc, which is the
version the game ships (`System.Decimal.DecCalc$$VarDecFromR4` RVA 0x4b07020 was decompiled
and matches the .NET Core source). Key behaviours that JS doubles get wrong:
- `(decimal)someFloat` rounds to **7 significant digits** (so `(decimal)1.2f` is exactly 1.2), and
  `(decimal)someDouble` rounds to 15 digits.
- Decimal arithmetic is exact at these magnitudes: `0.1m * 3 = 0.3m`, where doubles give
  0.30000000000000004, which after the final `Math.Ceiling` becomes +1 damage.

Which quantities use which type (all [CONFIRMED 3.19]):

| decimal | float32 |
|---|---|
| ATK, DEF, SPD, the damage pipeline, give/receive/element-resist | crit rate/damage (Ctr/Ctd/RcvCtr/RcvCtd), weak-element ratio, shield product, turn gauge, barrier amount, `GetDamageBase`'s `stat*power` |

Check: `scripts/sim/compareFormula.ts` runs 3000 random cases through the engine and through
ScoreAttackTeam's closed-form formula with identical inputs: 2981 give identical results, 19
are off by exactly 1. Those 19 are double-vs-decimal rounding at a `ceil` boundary, and
the engine matches the game there.

## R5.2 Damage pipeline (DamageCalculator.ts) - rewritten, every step cited

`BattleDamageCalculator$$GetAttackDamageResult` (0x137cb10) order: break -> defense ->
give -> receive -> element resist -> x weak-element ratio -> crit -> difficulty (PvE) ->
final-give (GvE) -> **PvP/GvG suppression** -> shield -> `Max(1, d)` -> `Ceiling` -> barrier.

Changes vs revision 4, each a behaviour change:
- **PvP damage x0.25.** `DamageCutByPvpOrGvgSuppression` uses
  `CalculationPointPolicyMst` "damageSuppresionRatio" = 750 (row 23, 3.18 data), so the
  factor is 1 - 750/1000. Revision 4 applied x1 (no data). Barrier (row 25) and heal (row 24)
  are x0.5 in PvP. Values are hard-coded in `PVP_POLICY` because that JSON isn't synced into
  base_data yet.
- **Splash power:** `DamageAbilityEffectBase$$Triggering` (0x18ef650) uses value2/1000 for
  every non-main target of a range-2 skill. 450+ DMG rows have value2 != value1.
- **Crit damage** = `(1 + Ctd/100) * (1 + defender RcvCtd/100)`, a new 3.x defender stat.
  Crit roll: `(float)(NextDouble()*100) < RcvCtr + Ctr`.
- **Floor is `Max(1, d)`**, not 0.
- **ADDITIONAL_DAMAGE** is a full extra hit through the whole pipeline
  (`AdditionalDamageUnitState$$GetAdditionalDamageResult` 0x15b4840), with its base from the
  ATK of the unit that applied the state at power `(v/10f)/100f`. Revision 4 added a raw
  base-damage number.
- **RCV_FINAL_DAMAGE**: an extra `ceil(total x ratio)` hit (`CalcFinalDamageNoticeBundle`
  0x137b110), gated on attacker role/element.
- **Barrier** (`BarrierUnitState` .ctor 0x15b5ed0): value1 and value3 are per-mille
  (/1000). Revision 4 used them raw, making barriers 1000x too large. The value-slot question
  from B2 is now resolved. Endurance is `ceil(f)`, and PvP is x0.5.
- DOT (`GetSlipDamageValue` 0x1380f20): same pipeline minus crit and shield.
- `IsDamageDisabled` only concerns one PvE boss (UniqueEnemy639002): a no-op for PvP.
- Weak elements: `BattleUnit.WeakElements` is only ever filled from
  QuestEnemyAppearanceParameter. **Characters have none, so no weak hits in PvP** (B3 resolved).

## R5.3 Stats (UnitStateEngine.ts) - two real bugs fixed

- **Buffs before debuffs.** Every `GetProcessedX` does one pass over Up states, then one over
  Down states on the running value. Revision 4 interleaved them in insertion order.
- **Accum states multiply by the CURRENT stack count** (AccumCount +0x94, starts at 1), not
  AccumCountMax (+0x90 = value2). In 3.19 every *AccumRatio class reads +0x94 (e.g.
  UpAtkAccumRatioUnitState 0x16e06a0). Revision 4's "always fully stacked" reading came
  from 1.5.0, and those classes changed since.
- `UP_CTR_RATIO` / `UP_CTD_RATIO` / `DWN_CTR_RATIO` / `DWN_CTD_RATIO` DO exist and map to
  the *Fixed* classes, so they share the same formula (UnitStateFactory table). Revision 3
  had dropped them.
- New 3.x types wired in: *_CONSUME_* (only while RemainCount > 0), UP_RCV_CTD_RATIO,
  UP_ELEMENT_RESIST_RATIO, *_AIM_* (role/element-gated give/receive), per-DOT-type give
  bonuses (UP_GIV_BURN_DMG_RATIO etc.).
- SPD is decimal with the same shape as ATK: ratio `(v/10)/100` of base, fixed `v`. Revision
  4 used float32 with v/1000. **Note for the person:** PvPKioku.ts says fixed SPD must go
  first "to reproduce the floating error". With decimal speed, order cannot matter, so any
  rounding quirk seen in-game most likely comes from the turn gauge (R5.4). Worth re-testing.

## R5.4 Turn order - time-based gauge

`UnitTurnGauge` (3.19) stores the TIME until acting: `Reset` gives `10000f / speed`, and
`TurnReferee$$ShiftNextTurn` (0x15c1c20) subtracts `dt` = the first unit's gauge from everyone
(float32, one op). Speed changes rescale by `old/new` unless `Mathf.Approximately`;
haste/slow add or subtract `(10000/speed) * (v/1000)`, floored at 0. Revision 4 tracked
"meters remaining" and divided by speed each time: the same in exact maths, but it rounds
differently in float32. That matters exactly at ties (B1). Tie-break order is unchanged
(gauge, priority desc, team, id).

## R5.5 Other fixes

- **Target side** for all 196 effect types now comes from the game's classes
  (`EffectTargetSide.ts`, generated): StateAbilityEffect's TargetSide = state Direction.
  Revision 4's hand lists missed UP_CTR_FIXED and others, which were then applied to the
  ENEMY team.
- **`canNotAction` infinite recursion** fixed. In the game it's a stored flag
  (`UnitCondition$$get_CanNotAction` 0x7388e0). The old getter evaluated condition sets, and a
  CAN_NOT_ACTION condition called back into it. Every real 10-unit battle tried overflowed
  the stack.
- `RE_ACTION_TURN_UNIT_ACT` is NOT an alias of ADDITIONAL_TURN_UNIT_ACT: it has its own
  classes (ReActionTurnUnitActAbilityEffect, Act.ReActionTurnUnitAct). Still implemented as
  the alias - see open items.
- Seeded RNG: `new PvPBattle(t1, t2, debug, seed)` makes a battle replayable. Crit outcomes
  can be forced per hit via `PvPTeam.critOverride` (for the planned UI toggles).

## R5.6 Still open (most useful next)

1. **Break damage-receive rate increase per hit**
   (`DamageAbilityEffectBase$$IncreaseBreakedDamageReceiveRate` 0x18eecd0):
   `floor((target increaseRate/1000) * (1 + attacker bonus/100) * base)`, where base is the
   skill's value5/10 or a per-role default (5/20/10/12). The unit keeps a fixed 100% for now.
   Needs the character-side increaseRate source (CharacterParameter .ctor).
2. **DMG_RANDOM** (`DmgRandomAbilityEffect$$Triggering` 0x18f08b0) is treated as one hit. It
   should be value2 random hits.
3. **RCV_FINAL_DAMAGE** is applied per damage effect, but the game sums the whole skill per
   target first (possible +-1).
4. **Probability roll / hit & parry rates** (`UnitStateBase$$GetProcessedProbability`, uses
   `MathExtension.Floor(float, 2)` - a float-rounding hotspot) not re-read for 3.19. Per-ailment
   parry now exists (`BattleUnit$$GetAbnormalParryRate(Type)`).
5. Character mechanics with real classes now, not yet ported: TSUBAME_CORE/LINK (also an
   ATK and SPD variation), ZONE_*, UNIQUE_* (+ UniqueStateLevelMst/PatternMst data),
   COUNT/COUNTDOWN_*, REGAIN_*, LOCK_TURN_ORDER, LOCK_SPECIAL_ATTACK, REFLECTION_RATIO,
   VORTEX_ATK, SWITCH_SKILL.
6. Heal suppression x0.5 in PvP: `healValueSuppresionRatio`; HpRecoveryCalculator not yet read.
7. UP/DWN_BUFF_EFFECT_VALUE (buff effectiveness) and `IHasUpdateableEffectValue`: the game can
   rescale a state's value after creation. The port only scales the unit's own kit at
   construction.
8. Merging ScoreAttackTeam onto this engine: the game has one engine plus per-mode directors
   (`ScoreAttackGameDirector`, `PvpGameDirector`, ...). ScoreAttackTeam could become a thin
   "director" that builds the enemy and pools buffs, then calls DamageCalculator.

---

The revision 4 notes below are kept for history. Where R5 contradicts them, R5 wins.

# Missing / Uncertain Items (Revision 4)

Revision 4 was given properly-scoped decompiled dumps (BattleUnit.c/UnitState.c/
TurnReferee.c/AI.c/AbilityEffect.c/UnitCondition.c/CorrelationEffect.c/
ReDriveBattleCore_other.c) from the fixed v3 Ghidra script, instead of the earlier
single monolithic dump. Changes this round:

- **CorrelationEffect.c fully read**: confirms the existing weak-element damage bonus
  implementation is correct as-is (the `/100.0` seen in `UpWeakElementDmgRatioUnitState.
  get_UpRatio()`'s consumer doesn't contradict the already-confirmed `/1000` scale - most
  likely `get_UpRatio()` itself already divides by 10 internally, reconciling the two).
  No code change; a citation was added to `DamageCalculator.ts`.
- **`RepeatStunParryRate` resolved**: `AddRepeatStunParryRateIfNeed` only fires when
  `unit.Param is QuestEnemyAppearanceParameter` - a PvE-boss-only mechanic, exactly like
  `UnitFilterByMainTarget`. Confirmed as a genuine no-op for PvP, not a modeling gap.
- **`CanAddTo` resolved**: confirmed as a per-state Role/Element eligibility gate
  (`IsMatch(TargetRole) && IsMatch(TargetElement)`, 0=wildcard). Checked against the real
  data: `role` is 0 on all 1039 `DWN_`-prefixed rows (never actually fires), `element` is
  non-zero on ~12% of them (a real, if narrow, effect). Turned out to already be
  implemented - `isEligibleForEffect` (UnitStateEngine.ts) does exactly this and is
  applied to every `applyEffect` call before any branch runs; a redundant duplicate check
  was briefly added directly to `storeTimedEffect` and then removed once this was noticed.
- **`BARRIER` formula significantly corrected**: `BarrierUnitState$$CalculateEndurance`/
  `CalculateMaxEndurance` fully read. Real formula is `grant = BarrierFixed + BarrierRatio
  * target.GetProcessedDef()`, `cap = MaxBarrierRatio==0 ? grant : MaxBarrierRatio *
  target's RAW (unbuffed) DEF` - not the flat `value1` this port used before. The
  stacking logic added last round (max-of-caps, additive-grant-capped) is unchanged and
  still applies on top of this. value1/2/3 -> BarrierRatio/BarrierFixed/MaxBarrierRatio
  is a reasonable-order guess (no construction site was found calling the property
  setters, so this specific slot assignment isn't independently confirmed).
- **New discovery: `CalculationPointPolicyMst`-driven PvP suppression.** Both barrier
  formulas ALSO multiply their result by `(1 - policyValue/1000)` whenever `battleType`
  is 2 (confirmed PvP) or 4 (unidentified other mode) - a real, previously-unknown
  balance/suppression table applied specifically outside PvE. No `CalculationPointPolicyMst`
  export exists anywhere in `base_data`, and the lookup predicate choosing which record
  applies wasn't resolved from the decompiled bytes, so **no value is applied here** -
  barrier amounts computed by this simulator are likely an overestimate for real PvP by
  whatever that table's entry says. This table may not be barrier-specific - the
  `CalculationPointPolicyMstReader.Instance` pattern reads like a shared helper, so it's
  worth checking whether damage/healing calculations hit the same table if you want this
  chased further (search AbilityEffect.c/ReDriveBattleCore_other.c for
  `CalculationPointPolicyMst` for every call site).
- **`REVIVAL_RATIO` fully implemented - was completely absent before** (not even
  classified). `RevivalRatioAbilityEffect$$Triggering` confirmed byte-for-byte: revives a
  dead target with `Math.Ceiling((value1/100) * target.MaxHP)` HP, skipping any resolved
  target that isn't actually dead. AI targeting (`RevivalAbilityEffectBase`) confirmed as
  uniform-random among the dead (not the shared `SelectTargetUnitInOrder` chain machinery
  - a direct `OrderBy(Guid.NewGuid()).FirstOrDefault()`). Both sides now implemented -
  see `applyEffect`'s `REVIVAL_RATIO` branch and `AITargetSelector.ts`'s `revivalChain`.
- **A real bug caught in this session's own work**: `selectFullAutoTarget` unconditionally
  filtered to alive units before consulting any per-effect chain, which would have made
  `REVIVAL_RATIO`'s targeting (which needs the DEAD) always come up empty. Fixed by adding
  an explicit `wantsDead` flag to `AIChain` rather than assuming "alive" is every chain's
  universe.
- **v3 Ghidra script fix independently confirmed**: `_namespace_roots.txt` shows
  `ReDriveBattleCore` at 3,897 functions vs. bare `ReDrive` at 45,107 - an order-of-
  magnitude difference confirming the "ReDrive." bucket removed from v2 would have swept
  in the entire rest of the game (menus, networking, analytics, etc.), which was the
  actual cause of that run taking hours instead of minutes.

---

This revision's changes are additive on top of revision 3 (documented in Section A
below, unchanged); everything above is specific to this round.

Structure:
**Section A** covers what changed in revision 3; **Section A-R2** (renamed from that
revision's own "Section A") preserves what changed in revision 2 for context. **Section
B** is the consolidated, current list of everything still open, organized by how much it
matters - individual entries have been updated in place where this round resolved them,
rather than left stale.

If you're catching up on this thread: revision 1 shipped `DamageCalculator.ts` and
`UnitStateEngine.ts` plus a heavily modified `PvPTeam.ts`, based purely on
Ghidra-decompiled pseudo-C. Revision 2 added your `dump.cs`/`dump_processed.cs`
(Il2CppDumper signature dump), your real `enums.ts`/`KiokuTypes.ts`/`helpers.ts`, your
`ScoreAttackTeam.ts`/`ScoreAttackKioku.ts` reference implementation, and a full rewrite of
`BattleConditionParser.ts`. **This round (revision 3)** was given the full decompiled
`BattleUnit.c` (232K lines) and `dump.cs` (1.87M lines) directly, rather than pre-selected
excerpts, and used them to: implement `CHARGE`/`GAIN_CHARGE_POINT`/`CONSUME_CHARGE_POINT`
in full; build a real FULL AUTO target-selection engine (`AITargetSelector.ts`, new file)
covering damage, the charge family, EP/HP, haste/slow, and the remove-all-state family,
plus `PROXIMITY` range resolution; implement the probability-roll-to-apply system that
revision 2 flagged as entirely missing (B6); wire `STUN`/`CAN_NOT_ACTION` into the turn
engine (B7); and fix several confirmed-real bugs found along the way (a barrier stacking
bug, a `GAIN_CHARGE_POINT` self-targeting bug, two `SkillDetail` type gaps, and two
entirely-dead `REMOVE_ALL_*` branches despite comments claiming otherwise).

---

## A. What changed this round (revision 3)

### A-3.1. `CHARGE` / `GAIN_CHARGE_POINT` / `CONSUME_CHARGE_POINT` - fully implemented

All three decompiled byte-for-byte from `ReDriveBattleCore.AbilityEffect.
ChargeAbilityEffect` / `GainChargePointAbilityEffect` / `ConsumeChargePointAbilityEffect`:

- **`CHARGE`** is a hard SET (not additive) of both `currentMagic` and a new
  per-battle-unit `currentMaxMagic` field, read together as one 8-byte
  `(InitChargePoint, MaxChargePoint)` pair in the source - confirmed against `dump.cs`
  showing `AbilityEffectInfo.EffectValue1`/`EffectValue2` are adjacent plain `int` fields,
  ruling out a float-bit-reinterpretation hazard. This is how a Kioku without an innate
  charge-gauge kit gets one at all, or how one with a kit gets it resized/reset mid-battle
  - `currentMaxMagic` had to become a mutable per-`KiokuState` field (initialized from
  `kioku.maxMagicStacks`) rather than reading the static character stat everywhere, since
  the source clearly treats the max as battle-mutable. `PvPBattle.ts`'s snapshot output
  updated accordingly.
- **`GAIN_CHARGE_POINT`**: `Clamp(current + value1, 0, currentMaxMagic)`. This was already
  present in revision 2 but had two real bugs: it mutated `this` (the caster) instead of
  the resolved target(s) - every sibling branch in `applyEffect` uses
  `effTargets.forEach`, this one alone used `this.currentMagic +=` - and had no ceiling
  clamp at all, so repeated casts could push a unit's charge past its own max. Both fixed.
- **`CONSUME_CHARGE_POINT`**: the exact mirror, `Clamp(current - value1, 0, currentMaxMagic)`.
  Previously entirely unimplemented (hit the fallback warning).

### A-3.2. A real FULL AUTO target-selection engine (`AITargetSelector.ts`, new file)

Previously, `sliceTargets`'s `range===TARGET` case for anything other than three
hardcoded character-specific skills just did `possibleTargets[0]` (damage) or logged a
warning and did the same (everything else) - there was no actual targeting logic, single-
or multi-target. This is now a real, decompiled-and-cited port of the game's own AI:

- **The core algorithm**, `ReDriveBattleCore.AI.AISkillTargetSelector$$
  SelectTargetUnitInOrder`: an ordered chain of filter functions that progressively
  narrows a candidate pool - narrow to exactly one and stop, narrow to nothing and skip
  that filter (keep the wider pool), otherwise keep narrowing - falling back to a
  uniformly random pick among however many candidates survive once the chain is
  exhausted. Decompiled from the actual control flow (do/while + goto), not guessed from
  the general shape.
- **Per-effect-type chains**, each read from that specific class's own decompiled
  `GetAIFilteredTargets`/`SelectTargetInAIAction`, not inferred from a sibling: damage
  (`DMG_ATK`/`DMG_DEF`/`DMG_HP`/`DMG_RANDOM`/`DMG_RATIO` - break priority, then
  weak-element priority, then a role+hate weighted-random pick), the charge family (prefer
  your highest-ATK unit), `GAIN_EP_RATIO`/`GAIN_EP_FIXED` (prefer the neediest
  Attacker/Breaker), `LOSE_EP_RATIO`/`LOSE_EP_FIXED` (prefer an already-broken target),
  `RECOVERY_HP`/`RECOVERY_HP_ATK` (prefer lowest HP%), `HASTE` (prefer an Attacker/Breaker
  whose turn is furthest away), `SLOW` (prefer whoever's turn is coming up soonest),
  `REMOVE_ALL_BUFF` (prefer dispelling whoever has an ATK buff, then DEF, then any stat
  buff), and `REMOVE_ALL_DEBUFF`/`REMOVE_ALL_ABNORMAL`/`REMOVE_ALL_UNABLE_ACTION` (share a
  base chain: prefer lowest HP%). Everything else falls back to the base class's own
  behavior (uniform random among the living), which is itself decompiled/confirmed, not
  just a "we don't know" default.
- **The weighted-random role+hate pick** (`AISkillTargetSelector.GetUnitWeightDic` /
  `SelectUnitAtWeightedRandom`) confirmed the existing `aggro` map in `KiokuTypes.ts`
  (Defender 15 / Healer,Buffer,Debuffer 10 / Attacker,Breaker 5) was already the correct
  base role-weight table - it just wasn't being consulted by anything. It's now the base
  weight in a proper weighted roll, plus the sum of active `UP_HATE`/`DWN_HATE` effects
  (see A-3.4 for why that had to change from a permanent mutation to a derived value).
- **`PROXIMITY` (`RangeType.SelectMultiple`) range resolution**: confirmed the source does
  NOT run a separate AI heuristic for this - `AbilityEffectBase$$SelectTargets` resolves a
  "primary" target exactly the same way as `TARGET` (AI-chosen or manually-selected id),
  then, only for PROXIMITY, adds up to two more same-side units: whichever has the
  next-lower `PositionId` and whichever has the next-higher one (skipping gaps, e.g. a
  dead unit - not a strict ±1). `PositionId` maps directly onto this codebase's own
  existing `posIdx` (already assigned identically: roster array index at team-build time).
  Was a `possibleTargets.slice(0, 3)` placeholder before.
- **A correction, documented in `AITargetSelector.ts`'s own header**: the first pass at
  three of these chains (`HASTE`, `SLOW`, `REMOVE_ALL_BUFF`) under-counted their filters
  by one each, because the fast search method used to extract them (grepping for
  referenced pointer symbols in file order) has a blind spot for class-local generated
  functions (`<MethodName>g__LocalName` symbols contain `<>` characters that broke the
  regex in use). Caught by re-reading the actual method bodies instead of trusting the
  fast search, and all previously-extracted chains were re-verified against a corrected
  search afterward. Flagging this prominently rather than quietly fixing it, since the
  same blind spot could in principle affect any chain that hasn't been read this
  carefully yet - see B4 below for what that leaves open.

### A-3.3. The probability-roll-to-apply system (resolves revision 2's B6)

Confirmed and implemented from `ReDriveBattleCore.UnitCondition$$AddUnitState` and
`UnitStateBase$$GetProcessedProbability`: every buff/debuff/aliment application (anything
that goes through `storeTimedEffect`, this codebase's stand-in for "add a UnitState") now
rolls against a probability derived from the skill's own `probability` field, modified
multiplicatively by the caster's hit-rate bonus and the target's two layers of parry/resist
- see `rollAppliesEffect` (`UnitStateEngine.ts`) for the full formula and citations, and
B6 below for what's confirmed-to-exist-but-not-modeled beneath it (a per-aliment-type
resistance breakdown, and an accumulating anti-repeat-stun resistance). `isFixedProbability`
(a real field, was missing from both `SkillDetail` variants' TS types - see A-3.5) bypasses
all of this and uses the base probability directly. This is a genuinely high-impact
change: it affects every single state-based effect in the game, not a narrow mechanic.

### A-3.4. `UP_HATE`/`DWN_HATE` and threat: from a permanent mutation to a derived value

Revision 2's `UP_HATE` handling did `t.aggro += detail.value1` permanently, in a branch
that was actually unreachable for any real (timed) instance of the effect (the earlier
`if (detail.turn)` branch already claims it), and would have been wrong even for a
hypothetical untimed one - the source recomputes threat weight fresh on every target
selection (`GetUnitWeightDic`), it doesn't accumulate. Replaced with `getThreatWeight`
(`UnitStateEngine.ts`): base role weight plus the sum of currently-active `UP_HATE` (add)
/ `DWN_HATE` (subtract) effects, computed on demand. `DWN_HATE` itself was previously
unclassified/unhandled anywhere in the file - added (to `friendlySkills`, by assumed
symmetry with `UP_HATE`, not independently confirmed which side it targets).

### A-3.5. Two `SkillDetail` type gaps fixed, plus a barrier-stacking bug

- `PassiveSkill` was missing `probability` and `isFixedProbability` entirely; `ActiveSkill`
  had `probability` but was missing `isFixedProbability` and `value5`. All confirmed
  present in the real `getSkillDetailMstList.json`/`getPassiveSkillDetailMstList.json`
  data (and `value5` additionally confirmed against `dump.cs`'s `AbilityEffectInfo`, which
  has `EffectValue1` through `EffectValue5`, all plain `int`) - the types were silently
  narrower than the data. Fixed in `KiokuTypes.ts`.
- `BARRIER` was overwriting `barrierEndurance`/`maxBarrierEndurance` to `value1` on every
  cast. `UnitCondition$$AddUnitState`'s `BarrierUnitState`-specific branch confirms it
  should stack: new max = `Math.Max(existing max, this cast's cap)`, new endurance =
  `Math.Min(new max, existing endurance + this cast's grant)`. Fixed - though see B2 for
  why the exact value1-to-formula mapping for barrier specifically is still an
  approximation (the source's real inputs are a `(BarrierRatio, BarrierFixed,
  MaxBarrierRatio)` triple run through two separate `Calculate*Endurance` methods, neither
  of which was decompiled this round).
- Two entirely dead branches, `REMOVE_ALL_DEBUFF` and `REMOVE_ALL_BUFF`, were implemented
  for the first time despite an existing code comment describing `REMOVE_ALL_DEBUFF` as
  the "already-working" handling that `REMOVE_ALL_ABNORMAL` mirrors - no such branch
  existed anywhere in `applyEffect`'s if/else-if chain; both fell through to the fallback
  warning. Also newly added: `REMOVE_ALL_UNABLE_ACTION` (a fourth, real, confirmed member
  of this family via the `AbilityEffectFactory` dispatch table) was completely
  unclassified and unhandled before this pass. All four now share
  `RemoveStateAbilityEffectBase$$Triggering`'s confirmed behavior: remove up to `value1`
  matching states (0 = unlimited), most-recently-applied first, rather than "all matching,
  unconditionally" - see `removeMatchingStates` in `PvPTeam.ts`.

### A-3.6. `COUNT`/`GAIN_COUNT_POINT`/`CONSUME_COUNT_POINT` - corrected, not resolved

Revision 2 listed these as "recognized only, not implemented" alongside the
`ZONE_STACK`/`TSUBAME`/`UNIQUE_*` character-specific systems, without being able to say
much more. This round searched both of the game's generic effect-dispatch tables
exhaustively (`AbilityEffectFactory`'s 27 special types and `UnitStateFactory`'s 93
generic `UnitState` types - every string either dispatch table recognizes, enumerated in
full) and found none of the three anywhere in either. Direct inspection of the actual
`getSkillDetailMstList.json`/`getPassiveSkillDetailMstList.json` data then confirmed all
three ARE real strings that do occur (a combined ~11 times total out of 32,000+ rows),
every occurrence with `value1=value2=0` and description text describing a bespoke "sigil"
mechanic (+1 per hit received, cap 20) that isn't expressible via the standard value1-5
slots at all. Conclusion: this is the same shape as `TSUBAME`/`ZONE_STACK`/`UNIQUE_*` - a
character-specific hardcoded mechanic, not a generic engine system - so it's correctly
left unimplemented, but for a more precise reason than revision 2 could give. Still open
if a specific roster character actually needs it (see B4).

---

## A-R2. What changed in revision 2 (historical, kept for context)

### A1. Resolved from revision 1's open list

- **`GetDefenseCorrectedDamage` is no longer a no-op.** This was the biggest flagged gap.
  Your `ScoreAttackTeam.ts` gives the exact formula:
  `damage * min(2, ((attackerStat+10)/(defenderDef+10)) * 0.12)`. Implemented in
  `DamageCalculator.ts`.
- **The `GetDamageBase` exponent is confirmed as `1.2`** (you read this from Ghidra
  directly), matching `ScoreAttackTeam.ts`'s `calc_base_dmg` exactly. Was a `1.5`
  placeholder before.
- **The element weakness multiplier tuple is confirmed as `(1.0, 1.2)`** (also your
  Ghidra read), again matching `ScoreAttackTeam.ts`'s `1 + 0.2` on a weak hit.
- **Direct-hit damage power scaling was wrong.** Revision 1 used raw `detail.value1` for
  direct hits (only dividing by 1000 for DOT). `ScoreAttackTeam.ts` divides by 1000 for
  *both* - fixed.
- **DOT damage was scaling off the wrong unit's stats.** Revision 1 scaled a DOT tick off
  the *sufferer's* ATK/DEF/HP. `ScoreAttackTeam.ts`'s `add_dot_dmg` makes clear it should
  scale off the *applier's* stat. Fixed - `KiokuState` now tracks `_applierState` on
  every stored timed effect, and `tickDotEffects()` uses it.
- **`UP_WEAK_ELEMENT_DMG_RATIO` was real after all.** Revision 1 guessed this name, then
  I second-guessed it in a follow-up round of research without new evidence. Your
  `ScoreAttackTeam.ts` confirms it's correct, and separately confirms `UP_ELEMENT_DMG_RATE_RATIO`
  is a *different*, unconditional elemental-damage buff that folds into give-damage-ratio
  instead. Both are now implemented as distinct mechanics.
- **Shield hit-count now uses the real `remainCount` field** instead of a fallback -
  the real `KiokuTypes.ts` confirms `remainCount` is a required field on every
  `SkillDetail`.
- **Element resist / weak-element data sources fixed.** `detail.element` (a required
  number field on every `SkillDetail`) is now used for the attack's own element,
  replacing a guessed `targetElement` field that doesn't exist. `BattleUnit.WeakElements`
  is confirmed (via `dump.cs`) to be a real, mutable *runtime* list, not a static
  character trait - `KiokuState.weakElements` now models that (see B3 below for the
  practical implication: it starts empty and nothing currently populates it).
- **A new, generic element/role eligibility filter** (`isEligibleForEffect` in
  `UnitStateEngine.ts`) was added, confirmed directly from `ScoreAttackTeam.ts`'s own
  buff-distribution loop, which filters every buff/debuff by the recipient's element/role
  before applying it at all. This didn't exist anywhere in revision 1.
- **PvP suppression (`DamageCutByPvpOrGvgSuppression`) is wired back in as a gate**, per
  your message confirming PvP is `BattleType.Pvp` (2, confirmed via `dump.cs`'s
  `Network.Definition.Battle.BattleType` enum). The gate fires correctly now; the
  internal suppression-rate table itself still isn't available (see B2).
- **`PvPTeam`/`KiokuState` now carry a `battleType` field** (default `BattleType.Pvp`) so
  the same engine can run non-PvP simulations - pass a different `BattleType` to the
  `PvPTeam` constructor.

### A2. The condition parser rewrite (the actual ask this round)

The original `BattleConditionParser.ts` had one flat `isConditionSetActiveForPvP`
function that checked every `CompareContent` against whatever `actor`/`target` the call
site happened to pass in, with no awareness of `CompareTarget` at all. That's why so many
conditions either never fired or fired against the wrong unit.

The real source (`ReDriveBattleCore.BattleCondition`) works differently: a dispatcher
(`Condition.IsMatchCondition`) switches on `CompareTarget` and routes to one of three
checker classes, each of which resolves a *different* unit or set of units before
evaluating `CompareContent`:

- `CompareTarget.SELF/ACTOR/MAIN_TARGET/EACH_TARGET` → per-unit checks against a specific
  resolved unit (`BattleUnitConditionChecker`)
- `CompareTarget.FRIEND_TEAM/OPPONENT_TEAM/ALL_TARGETS` → team-wide checks
  (`BattleUnitTeamConditionChecker`)
- `CompareTarget.OTHERS` → the current action's own skill-type/combo-step
  (`BattleOtherConditionChecker`)

This is now implemented as `isMatchCondition()` + `checkUnitCondition()` +
`checkTeamCondition()` + `checkOtherCondition()`, each ported from the actual decompiled
`Check()` method bodies (all three were fully decompiled with bodies, not just
signatures - see the file's header comment for exact function citations). Every
`CompareContent` case is annotated `[CONFIRMED]`/`[RECONSTRUCTED]`/`[NOT IMPLEMENTED]`
in-line.

Also fixed as part of this: the `AbilityEffectListComparer`'s `CONTAIN`/`NOT_CONTAIN`
semantics. The original code did `valueToCompareTo.includes(cond.compareValue)` - exact
array-element membership. The real comparator does
`leftValue.Any(x => x.StartsWith(rightValue))` - a **prefix match**, so e.g.
`compareValue="POISON"` matches `"POISON_ATK"`/`"POISON_DEF"`/`"POISON_HP"` all at once.
This is a real behavioral difference, not just a style choice - fixed in
`compareAbilityEffectList()`.

### A3. New supporting infrastructure this required

- **`AffectedUnitNotice`** (new type, added to `KiokuTypes.ts`) - "what just happened to
  this unit" (damage dealt, crit, weak hit, killed, healed, barrier events). The
  `CompareContent` values 101-110 all read from this. Populated by
  `DamageCalculator.getAttackDamageResult` and stored on `KiokuState.lastNotice`,
  cleared at the start of every new action.
- **`trueActorUnit`/`mainTargetUnit`** (new optional fields on `BattleState`, also added
  to `KiokuTypes.ts`) - the previous single `actor` field conflated "the unit whose
  passive/effect is being checked" with "the unit that actually acted this turn", which
  are different things (`CompareTarget.SELF` needs the former, `CompareTarget.ACTOR`
  needs the latter). Threaded through every `applyEffect()` call site in `PvPTeam.ts`.
- **Team-level tallies on `PvPTeam`**: `breakedUnitTotalCount` (cumulative, for
  `BREAK_UNIT_TOTAL_COUNT`), `appliedSkillEffectTypesThisAction` and
  `lastActionNotices` (both reset per-action, for the `201-210`/`301-309` team
  conditions).

### A4. Small, low-risk fixes made along the way

- **`completeAction` was silently dropping `ADDITIONAL_SKILL_ACT` (FUA) triggers** when
  they came from an active skill's own effect list rather than a passive - it called
  `applyEffect(...)` without capturing the return value. Fixed (both `act`/`completeAction`
  now return a `FuaMap`, merged with `triggerPassives`'s own).
- **`PvPKioku.ts` was missing `DWN_BUFF_EFFECT_VALUE`/`DWN_DEBUFF_EFFECT_VALUE`**, which
  its sibling `ScoreAttackKioku.ts` already handles and which are confirmed to exist in
  `enums.ts`. Added, plus the matching floor-at-0 guard `ScoreAttackKioku.ts` also has.

---

## B. Consolidated open items (current state)

### B1. The tie-break / "enemy acts first" question - needs your input

I decoded `TurnReferee.SortByTurnOrder`'s four tiebreak lambdas individually (no
ambiguity in any of them): `GaugeValue asc → TurnOrderPriority desc → Team asc → Id asc`,
where `BattleUnit.TeamType` is confirmed (`dump.cs`) as `Ally=0, Enemy=1`. That means on
an *exact* tie, **Ally sorts first** - which is what `compareTurnOrder()` in `PvPTeam.ts`
already did, unchanged.

This is the opposite of what you said you observe empirically. I didn't change the code
on the strength of an anecdotal read against a clean decompilation, but I also don't want
to just assert you're wrong. My best guess, spelled out in full in
`KiokuState.turnOrderPriority`'s doc comment: this is float32 precision, not the
tiebreak rule. `secondsUntilAbleToAct()` is `metersRemaining/speed` computed in
`Math.fround`-forced float32; if a "mirror" team's buffs get summed in a different
iteration order than its opponent's (e.g. `Map`/array iteration order differing between
otherwise-identical setups), IEEE 754 rounding can make one side's speed a few ULPs off,
which would resolve the "tie" before this tiebreak chain is ever reached - and would look
exactly like "the enemy always wins ties" if your setup code happens to process one side
first consistently.

**To actually settle this**: log
`a.secondsUntilAbleToAct().toPrecision(20)` for both units on a mirror-tie turn. If
they're bit-different despite looking equal, that's your answer (and no engine bug). If
they're truly bit-identical and the enemy still acts first, tell me and I'll re-examine
the four lambda bodies - it's possible the four-way I decoded doesn't apply to how your
game data assigns `BattleUnit.Team` in this specific matchup shape.

### B2. Formula/data still missing (not fabricated, but flagged)

- **`DamageCutByPvpOrGvgSuppression`'s rate table** (`CalculationPointPolicyMst`) isn't
  available in any provided file - the gate fires correctly (PvP → this step runs) but
  applies a 1x (no-op) multiplier with a console warning rather than a fabricated number.
- **`GetDifficultyCorrectedDamage`** only matters for PvE quest-enemy attackers, which
  don't exist in a PvP context - confirmed no-op for PvP, not implemented for
  Solo/Gve/Exploration simulations if you use those.
- **`BreakedDamageReceiveRate`** (per-unit stat used in the break-situation multiplier)
  still isn't in any provided data file - defaults to 100 (no bonus) with a warning.
- **`MaxBreakedDamageReceiveRate`** (needed for `CompareContent.IS_MAX_BREAK_DAMAGE_RECEIVE_RATE`)
  - same situation, not implemented.
- **`BREAK_DAMAGE_RECEIVE_RATE_GREATER/LESS_THAN_UNIT_COUNT`** (team-level conditions)
  need the same missing stat - not implemented.
- **`BARRIER`'s value1-to-slot mapping** - **mostly resolved in Revision 4**:
  `CalculateEndurance`/`CalculateMaxEndurance` were fully read (see this doc's Revision 4
  summary) and are now implemented as `grant = BarrierFixed + BarrierRatio *
  target.GetProcessedDef()`, `cap = MaxBarrierRatio==0 ? grant : MaxBarrierRatio *
  target's raw DEF`. Still open: which of value1/value2/value3 is actually BarrierRatio
  vs BarrierFixed vs MaxBarrierRatio - no `UnitStateFactory` construction site calling
  the property setters was found, so the order used (value1=Ratio, value2=Fixed,
  value3=MaxRatio) is a reasonable guess, not confirmed. Also newly open as of that same
  round: a `CalculationPointPolicyMst`-driven PvP suppression multiplier that both
  methods apply and this port doesn't (no data export for that table exists, and its
  lookup key wasn't resolved) - this is the SAME missing table as
  `DamageCutByPvpOrGvgSuppression` two bullets up, independently confirmed from a
  completely different code path, which is a good cross-check that both findings are
  real rather than a misreading.


### B3. `weakElements` starts empty - element-weakness bonus damage currently never fires

`BattleUnit.WeakElements` is confirmed real (`dump.cs`), but nothing in any file you've
given me populates it for a PvP Kioku (the only "weakElements" data anywhere is for PvE
quest-stage enemies, a different, unrelated concept). Practically: unless you have an
"expose weakness"/debuff-driven mechanic in your kit data that should push into
`KiokuState.weakElements` at runtime, every hit in a simulated PvP battle will currently
resolve as a "normal" (not weak) hit. If such a mechanic exists, point me at it and I'll
wire it in - I didn't want to guess at which ability effect type does this.

### B4. New effect types discovered this round via `enums.ts` - implementation status

`enums.ts`'s `otherBuffsAndDebuffs`/`scoreAttackRelevantBuffsAndDebuffs` surfaced a lot of
real ability effect type strings that weren't in either revision-1 list at all. Current
status (also annotated at each string's use site in `PvPTeam.ts`):

**Implemented (revision 2):**
`ADD_BUFF_TURN`/`ADD_BUFF_TURN_IMM`/`ADD_DEBUFF_TURN`/`ADD_DEBUFF_TURN_IMM` (extend
active buff/debuff duration), `REMOVE_ALL_ABNORMAL` (cleanse ailments only), `IMM_SLIP_DMG`
(DOT immunity), `GAIN_SP_FIXED`, `UP_HATE`, `ADDITIONAL_DAMAGE` (flat bonus damage folded
into the next hit, using the confirmed `calc_base_dmg` formula off the attacker's own
ATK), `RECOVERY_HP_ATK` and `CONTINUOUS_RECOVERY` (heal / heal-over-time).

**Implemented (revision 3 - see Section A above for citations):**
`CHARGE`, `GAIN_CHARGE_POINT` (fixed), `CONSUME_CHARGE_POINT`, `REMOVE_ALL_DEBUFF`
(was dead code despite a comment claiming otherwise), `REMOVE_ALL_BUFF` (ditto),
`REMOVE_ALL_UNABLE_ACTION` (was entirely unclassified), `DWN_HATE` (ditto),
`UP_EFFECT_HIT_RATE_RATIO`/`UP_ABNORMAL_HIT_RATE_RATIO`/`UP_EFFECT_PARRY_RATE_RATIO`/
`UP_ABNORMAL_PARRY_RATE_RATIO` (now consumed by the probability-roll system - "implemented"
here means "correctly stored and read back", these are generic stat-buff UnitStates with
no bespoke Triggering of their own, same as most ratio-type buffs).

**Recognized (classified for targeting/counting) but NOT implemented** - hits a warning,
not silently ignored: `COUNT`/`CONSUME_COUNT_POINT`/`GAIN_COUNT_POINT` (confirmed real but
extremely rare and character-specific - see A-3.6, this is a correction of revision 2's
entry, not new information that changes the verdict),
`ZONE_STACK`/`ZONE_EXPAND`/`CONSUME_ZONE_STACK`/`GAIN_ZONE_STACK`/`UNIQUE_ZONE`,
`SWITCH_SKILL`, `TSUBAME`/`TSUBAME_CORE`/`TSUBAME_LINK` (combo mechanics - see B5),
`UNIQUE_*` (character-specific one-offs), `VORTEX_ATK`/`UP_GIV_VORTEX_DMG_RATIO`
(no confirmed `_DEF`/`_HP` Vortex variant, and not wired into the DOT tick map),
`REFLECTION_RATIO` (damage reflection - would need a real hook into the DMG_ pipeline;
flagged rather than guessed at), `UP_BREAK_EFFECT`, `UP_RCV_BREAK_POINT_DMG_RATIO`,
`UP_HEAL_RATE_RATIO`, `REGAIN_ATK`, `UP_HP_RATIO` (would need a "processed max HP"
concept - `maxHp` is currently set once at construction and never revisited).

**`RE_ACTION_TURN_UNIT_ACT` vs `ADDITIONAL_TURN_UNIT_ACT`**: both are confirmed-real,
distinct strings in `enums.ts`. I only independently decompiled the trigger logic for
`ADDITIONAL_TURN_UNIT_ACT` (`AdditionalTurnUnitActTriggerUnitStateBase`); I'm treating
`RE_ACTION_TURN_UNIT_ACT` as an alias with identical "grant this unit an immediate extra
turn" behavior, since I couldn't find/decompile a distinct class for it. If they're
meant to behave differently (e.g. one queues for later, one interrupts immediately),
let me know.

**AI targeting chains confirmed to exist but not yet transcribed** (fall back to the
generic base-class behavior - filter alive, pick uniformly at random - which is itself a
real decompiled/confirmed fallback, not a shrug): `SummonAbilityEffect` (`SUMMON`) -
its `GetAIFilteredTargets` involves a `Count<BattleUnit>` check against what's almost
certainly a "max concurrent summons" cap, but this codebase has no concept of summoning a
new unit mid-battle at all, so the targeting question is moot until that mechanic exists
in the first place. `RevivalAbilityEffectBase` used to be listed here too - resolved,
see `revivalChain` in `AITargetSelector.ts`.

**Resolved this round**: `ImmSlipDmgAbilityEffect` (`IMM_SLIP_DMG`) - prefers a target
that already has an active DOT effect, falling back to any alive unit otherwise; no
`SelectTargetInAIAction` override exists, so the final pick is uniform-random. Also
confirmed (rather than assumed) that `ChangeSkillAbilityEffect`/
`AdditionalSkillActAbilityEffect`/`AdditionalTurnUnitActAbilityEffect` (`CHANGE_SKILL`/
`ADDITIONAL_SKILL_ACT`/`ADDITIONAL_TURN_UNIT_ACT`) have NEITHER method overridden at all
- there was nothing to transcribe for these three; the generic fallback they were
already getting by default turns out to be exactly correct, not a placeholder.
`GainSpFixedAbilityEffect` (`GAIN_SP_FIXED`) has a confirmed-shape-but-unparameterized
gate: `GetAIFilteredTargets` returns an empty target list entirely (not just a narrower
one) once the TEAM's shared SP pool reaches some opaque static threshold that couldn't be
read from the decompiled bytes - not implemented, since this codebase's own
`this.currentSp` is a simpler boolean, not the numeric capped pool the source checks
against, and there's no confirmed threshold to translate it to.

### B5. `COMBO_ACTION_STEP` - RESOLVED this round; `TSUBAME_*` remains a separate,
still-unimplemented mechanic

This section previously conflated two different things under one "not implemented"
verdict, based on having found the class names but not traced their bodies. They've
since turned out to be unrelated:

- **`CompareContent.COMBO_ACTION_STEP` (402)** is tied to `ComboTurnUnitAct`, which is
  entirely separate from `TSUBAME_*` - it's the step-counter half of the `COMBO`
  multi-action mechanic implemented in the previous round (see this doc's top summary and
  `useAttackOrSkill` in `PvPTeam.ts`). `ActReferee$$AddComboUnitTurnActs`'s own loop
  (`for (actionStep = 1; actionStep <= actionNum; actionStep++)`) confirms `ActionStep` is
  1-indexed and only exists at all during an actual combo burst (a plain single action
  uses a different Act class, `TurnUnitAct`, with no such property). Now implemented as
  `KiokuState.currentComboActionStep` (0 outside a combo burst) and wired into
  `BattleConditionParser.ts`.
- **`TSUBAME_CORE`/`TSUBAME_LINK`/`TSUBAME`** (observed in `ScoreAttackKioku.ts` as a
  specific character's unique combo mechanic) remain unimplemented and, as far as
  anything decompiled so far shows, unrelated to `ComboUnitState`/`ComboTurnUnitAct` -
  they're still classified RECOGNIZED-ONLY in `PvPTeam.ts` pending their own dedicated
  investigation (character-specific, so likely a bespoke class rather than something in
  the generic dispatch tables - same category as `UNIQUE_*`/`ZONE_STACK`).


### B6. Probability-roll-to-apply system - RESOLVED this round, one layer still open

~~The real `ActiveSkill` type has a `probability` field I hadn't accounted for at all~~ -
implemented this round, see A-3.3. `rollAppliesEffect` (`UnitStateEngine.ts`) now gates
every buff/debuff/aliment application on `probability` × hit-rate × parry-rate, with
citations for the full formula shape. What's still open beneath it, confirmed to exist in
`BattleUnit$$GetTotalSecondaryEffectParryRate` but not modeled:

- **A per-aliment-type resistance** (`GetAbnormalParryRate(state)`) separate from the
  general "all abnormal" one this port implements (`UP_ABNORMAL_PARRY_RATE_RATIO`) - i.e.
  the source can apparently distinguish "resist Burn specifically" from "resist any
  ailment", and this port only has the latter.
- ~~`Condition.RepeatStunParryRate` - an accumulating anti-stun-lock resistance~~ -
  **RESOLVED**: `AddRepeatStunParryRateIfNeed` only fires when `unit.Param is
  QuestEnemyAppearanceParameter` - PvE-boss-only, exactly like `UnitFilterByMainTarget`.
  Confirmed as a genuine no-op for PvP; nothing to implement.
- The `GetProcessedEffectHitRate`/`GetProcessedEffectParryRate`/`GetAllAbnormalHitRate`/
  `GetAllAbnormalParryRate`/`GetAbnormalParryRate` bodies themselves weren't read - the
  `UP_EFFECT_HIT_RATE_RATIO`-etc. sums this port uses instead follow this codebase's own
  established ratio-accumulation convention, not a decompiled formula.
- A `CanAddTo(targetUnit)` gate exists at the very top of `AddUnitState`, before even the
  probability roll - presumably a per-state-type "is this even a legal application right
  now" check (e.g. a unique buff that can't stack a second copy). Not modeled at all;
  likely too state-specific to implement generically without seeing individual states'
  overrides.

### B7. `CAN_NOT_ACTION` / `STUN` - RESOLVED this round, exact turn mechanics still a guess

~~This engine doesn't track "can this unit act" as a distinct flag~~ - `KiokuState` now has
a `canNotAction` getter (derived from an active `STUN` effect) wired into both
`useAttackOrSkill` (skips the actual attack/skill, but the actor's turn still "comes up" -
gauge still resets, `TURN_START` passives still fire) and `useUltimate` (a stunned unit
with an otherwise-ready ultimate doesn't fire it, keeping the MP banked rather than
burning it on a no-op). `BattleConditionParser.ts`'s `CAN_NOT_ACTION` case now reads this
instead of a hardcoded `false`.

What's still a best-effort reconstruction rather than confirmed: `StunUnitState` itself
has no `Triggering`/custom logic of its own in the decompiled dump (just a ctor and
cosmetic icon/VFX-name getters), so the actual source set-site for
`Condition.CanNotAction = true` wasn't located - `canNotAction` is implemented here as "is
there an active STUN effect" instead, which should be behaviorally equivalent for
everything this simulator can reach, but isn't the literal mechanism.

**Actively searched this round, still not found, but usefully narrowed down**: with
`TurnReferee.c` in hand, I traced the entire turn-scheduling path looking specifically for
a stun/CanNotAction check - `TurnActSystem$$Forward` (the top-level "advance to the next
turn" method), its "who's up next" predicate (`<Forward>b__9_0`, which just matches
`u.Id == turnReferee.CurrentTurnUnitId` - no stun check), and `TurnReferee$$ShiftNextTurn`
(which decides who becomes `CurrentTurnUnitId` - takes an already-prepared
`activeUnitList` as input, so if stun excludes someone from being selectable at all, that
filtering happens in whatever BUILDS that list, upstream of everything read this round).
None of it checks stun. This is a real, useful negative result: it means the turn-order/
scheduling layer likely does NOT skip a stunned unit's turn slot - which actually lines up
with this port's current approach (the turn still "comes up" on schedule; only the actual
skill execution is skipped) rather than contradicting it. The downstream piece that
presumably DOES check `CanNotAction` - whatever decides "what skill does this unit use
this turn" - lives in a class this round's file set didn't happen to include (something
like an AI skill-selection or action-request controller). If you want this fully closed
out, that's the specific thing to go find next.

**`COMBO` (multi-action turns) - IMPLEMENTED as of this round, was the top-priority item
above.** `TurnActSystem$$Forward` calls `UnitCondition$$GetMaximumActionNumComboUnitState`
before queuing a unit's turn (the active `ComboUnitState` with the HIGHEST `ActionNum` -
multiple stacks take the max, they don't add), and branches to
`ActReferee$$AddComboUnitTurnActs` (N separate actions in a row for the same unit) instead
of the normal single-action path whenever that's 2 or more. Checked directly against real
data and this is NOT a rare mechanic - unlike TSUBAME/ZONE_STACK/UNIQUE_*, `COMBO` appears
259 times total (4 active-skill rows, 255 passive-skill rows). One active sample's
description reads literally "Grants 2 actions." with `value1=2`, confirming `value1` is
the action count directly.

Implemented in `useAttackOrSkill` (`PvPTeam.ts`) as a loop around the full
`performAction` call, defaulting to 1 iteration (today's exact prior behavior) via
`getMaxComboActionNum` (`UnitStateEngine.ts`). TURN_START passives and the gauge
reset/exitBreak happen ONCE before the loop, not once per sub-action - confirmed by the
source building exactly one `TurnBeginAct`/`TurnEndAct` pair around N per-action entries.
Each sub-action independently re-checks skill-vs-attack (`this.currentSp` can change
mid-burst) and gets its own full target resolution. AI targeting confirmed via
`ComboUnitState$$GetUnitFilterFuncOrder`: `[UnitFilterByMainTarget, UnitFilterWithMaxAtk]`
- same as the charge family (grant it to your hardest hitter) - see `comboChain` in
`AITargetSelector.ts`. Only applied to `useAttackOrSkill`, not `useUltimate` - the source's
combo check is tied to the normal turn-gauge-driven scheduling path
(`TurnActSystem.Forward`), which is architecturally separate from this port's own
ultimate-interrupt check, so extending it to ultimates would be a guess, not a citation.

This is a genuinely different mechanic from the pre-existing `pendingBonusTurns` loop
inside `performAction` (which presumably backs `ADDITIONAL_SKILL_ACT`/
`ADDITIONAL_TURN_UNIT_ACT` - an "immediate extra attack within the same action", no
TURN_START/gauge/exitBreak repeated, no independent skill-vs-attack re-check) - confirmed
architecturally distinct (they come from entirely different decompiled classes), not
merged, and the two can stack correctly since they operate at different levels (COMBO
wraps whole extra actions; bonus turns extend a single action).

**Still open**: whether/how a PASSIVE-granted COMBO (as opposed to an active skill's,
`turn=1` in the one sample checked) gets its duration handled - the one passive sample
found has `turn=0`, and whether that means "permanent" (implausible for a double-action
effect) or some passive-specific "lasts exactly the triggering turn" convention wasn't
resolved. This is a question about how conditionally-triggered passives durations work in
general, not specific to COMBO, so it wasn't chased down as part of this pass.

### B8. `TURN`/`EVERY_N_TURN` approximated as always-0

`CompareContent.TURN` reads `BattleUnit.TurnNum` - a per-unit "how many turns have I
personally taken" counter that doesn't exist anywhere in this engine (it's different
from the team-level `currentSp` alternating counter, and different from a buff's own
`turn`/remaining-duration field). Approximated as a constant 0. `EVERY_N_TURN` (which
depends on `TurnNum`) inherits the same limitation. If your data uses either of these,
I'd need to add a real per-unit turn counter (straightforward - increment it each time
`useAttackOrSkill`/`useUltimate` resolves for that unit - just wasn't in scope to add
speculatively without confirming `TurnNum`'s exact semantics, e.g. does a bonus turn from
`ADDITIONAL_TURN_UNIT_ACT` count as a separate turn or not).

### B9. Team-level condition approximations (labeled `[RECONSTRUCTED]` in-line)

A few of the `201-210`/`301-309` team conditions are implemented against a reasonable
but not independently-confirmed reading, because the exact predicate bodies behind them
use closures I didn't trace all the way through:

- `BREAK_UNIT_COUNT` (302): approximated as "currently broken units", not "units that
  broke as a direct result of the last action" - these usually coincide but could differ
  if a unit was already broken before this action.
- `APPLIED_SKILL_EFFECT_TYPE`/`ABILITY_EFFECT_UNIT_COUNT`/`HAS_BUFF_APPLIED`: scoped to
  "this action" (reset every `performAction` call) - not confirmed whether the source's
  equivalents are action-scoped or battle-cumulative.
- `ALL_TARGETS` (`CompareTarget=4`) routing: the source picks friend-vs-opponent team
  data based on whether the main target shares the checking unit's team; approximated
  using whichever of `mainTargetUnit`/`target` is available when `mainTargetUnit` isn't
  threaded through a given call site.

### B10. A note on your own `KiokuTypes.ts`

Not something I changed, just flagging: `KiokuTypes.ts` imports
`{ PvPTeam, KiokuState } from "../models/PvPTeam"`, but `Kioku.ts` imports
`{ fromKey } from "../models/BestTeamCalculator"`. If `Kioku.ts` and `PvPTeam.ts` live in
the same folder (which every other cross-import between them implies - `PvPTeam.ts`
imports `./PvPKioku`, `PvPKioku.ts` imports `./Kioku`), then `Kioku.ts`'s
`../models/BestTeamCalculator` and `KiokuTypes.ts`'s `../models/PvPTeam` can't both be
right relative to the same folder layout. Could easily be a harmless leftover from a
folder rename/refactor - just didn't want to silently "fix" your own file's import path
without knowing your actual folder structure.

### B11. Where things live in this delivery

**This round (revision 3):** modified `PvPTeam.ts` (CHARGE family, FULL AUTO targeting
wiring, probability roll wiring, barrier/removal fixes, STUN), `UnitStateEngine.ts`
(`getThreatWeight`, `rollAppliesEffect` and its supporting rate functions),
`DamageCalculator.ts` (exported `isMatchWeakElement` for reuse, no behavior change),
`BattleConditionParser.ts` (`CAN_NOT_ACTION` now reads the real derived value),
`PvPBattle.ts` (`maxMagicStacks` snapshot field now reads the dynamic per-battle value),
`KiokuTypes.ts` (two real, data-confirmed field gaps closed - see A-3.5). New file:
`AITargetSelector.ts`. Untouched this round: `PvPKioku.ts`, `Kioku.ts`, `enums.ts`,
`helpers.ts`, `ScoreAttackKioku.ts`, `ScoreAttackTeam.ts`, `BestTeamCalculator.ts`.

**Revision 2 (historical):** modified `PvPTeam.ts`, `PvPBattle.ts`, `PvPKioku.ts`,
`KiokuTypes.ts` (additive only - new `AffectedUnitNotice` type and three new optional
`BattleState` fields, nothing removed), `BattleConditionParser.ts` (full rewrite, same
exported function names/signatures as before). New files: `DamageCalculator.ts`,
`UnitStateEngine.ts`.

All of the above passes a strict TypeScript check against your real type files (verified
locally by reconstructing your full import graph with your actual `enums.ts`/
`KiokuTypes.ts`/`helpers.ts`/`betaSettings.ts`/etc. and running `tsc --noEmit` over the
whole `models`/`types`/`utils` tree; the remaining notices are all pre-existing patterns
in untouched code or missing-module noise from files this delivery doesn't include
(`.vue`, external packages), not regressions introduced this round).
