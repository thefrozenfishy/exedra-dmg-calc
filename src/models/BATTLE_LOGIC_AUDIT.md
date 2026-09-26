# Battle logic audit — findings and fixes

You asked me to verify the battle logic against the decompiled sources (`BattleUnit.c`,
`dump.cs`), with particular attention to floating-point precision, and to fix what I
could while clearly flagging anything I couldn't fully confirm. I read all ten files
(the three you'd pasted inline, plus `PvPTeam.ts`, `UnitStateEngine.ts`,
`BattleConditionParser.ts`, `DamageCalculator.ts`, `KiokuTypes.ts`, and grepped/read
targeted sections of `BattleUnit.c` and `dump.cs`, which are too large to read in full —
232,890 and 1,875,637 lines respectively).

Both of the values you confirmed from Ghidra check out against what's already in
`DamageCalculator.ts`: `DOUBLE_7b9445cb50` (1.2) is the exponent in the `(statValue/124)
^1.2` damage curve used by `DamageAbilityEffectBase$$GetDamageBase` (and two other
`GetDamageBase` overloads — DOT and reflection damage — that share the same curve), and
`FLOAT_7b9445dab8` (`{1.0, 1.2}`) is `CorrelationEffect`'s normal/weak-hit element damage
multiplier array. Both were already correctly encoded as `ELEMENT_DAMAGE_RATIO_NORMAL`/
`ELEMENT_DAMAGE_RATIO_WEAK` and `DAMAGE_BASE_POW_EXPONENT` — no change needed there.

## Bugs found and fixed

### 1. Crit rate / crit damage / RcvCtr: wrong formula shape, not just wrong rounding

This is the main one. `UnitStateEngine.ts` computed `getProcessedCtr`/`getProcessedCtd`/
`getProcessedRcvCtr` by reusing the exact same accumulator shape as ATK/DEF (Fixed=flat,
Ratio/AccumRatio=percentage-of-base-or-running). I read the actual decompiled
`UnitState` classes for these three stats, and that assumption is wrong in three
separate ways:

- **`UP_CTR_FIXED`/`UP_CTD_FIXED` were missing a `/10`.** `UpCtrFixedUnitState$$
  GetCtrVariationValue` returns `value1/10.0`, not raw `value1`. Since `value1` for
  these effects uses the same "stored ×10" convention as `critRate`/`critDamage`
  themselves (`Kioku.ts`: `critRate = data.minCritRate * 10`), skipping the `/10` made
  every flat crit-rate/crit-damage buff or debuff **10× too strong**.
- **`DWN_CTR_FIXED`/`DWN_CTD_FIXED`/`DWN_CTR_ACCUM_RATIO`/`DWN_CTD_ACCUM_RATIO` didn't
  exist in the code at all** (mapped to `""`, on the assumption — reasonable from a UI
  label list alone — that no "reduce enemy crit rate" mechanic existed). It does:
  `DwnCtrFixedUnitState`, `DwnCtdFixedUnitState`, `DwnCtrAccumRatioUnitState`,
  `DwnCtdAccumRatioUnitState` all exist as compiled classes. Any real debuff of this
  shape was silently doing nothing.
- **`getProcessedRcvCtr` always returned exactly 0**, regardless of active effects. It
  called the shared accumulator with `baseValue=0` (there's no inherent "base" RcvCtr
  stat), and its one real effect type (`UP_RCV_CTR_RATIO`) was routed to a branch that
  computes `baseValue * ratio` — `0 * anything` is always `0`. Any "bonus crit rate
  suffered against a specific attacker"-style effect had zero impact on the simulation.

Byte-for-byte, the real shapes are (confirmed via `UpCtrFixedUnitState`,
`UpCtrAccumRatioUnitState`, `DwnCtrFixedUnitState`, `DwnCtrAccumRatioUnitState`, and
`UpRcvCtrRatioUnitState`; the CTD side was spot-checked via `DwnCtdFixedUnitState`,
which matched exactly, and inferred to mirror CTR for the rest by architectural
symmetry — not individually re-verified class-by-class):

```
UP_CTR_FIXED         delta = +(value1/10)                              — flat, unscaled
UP_CTR_ACCUM_RATIO    delta = +(value1/10) * AccumCountMax               — flat × stacks
DWN_CTR_FIXED         delta = -(running * (value1/10) / 100)            — scales with the
DWN_CTR_ACCUM_RATIO    delta = -(running * (value1/10) * AccumCountMax / 100)  RUNNING total,
                                                                          despite the name
UP_RCV_CTR_RATIO      delta = +(value1/10)                              — same shape as
                                                                          CTR's Up-Fixed
```

There is **no plain "Ratio" (non-Fixed, non-Accum) class for Ctr or Ctd in either
direction** — I grepped exhaustively and found none. `UP_CTR_RATIO`/`UP_CTD_RATIO`
(previously assumed real, from a UI-label-list reading) have no backing implementation
anywhere in `BattleUnit.c`. I've treated the compiled classes as authoritative and
dropped that mapping — **please grep your real skill/passive data for the literal
strings `"UP_CTR_RATIO"` / `"UP_CTD_RATIO"`; if either ever actually appears, tell me,
since that would mean I'm missing a class and the formula needs to be re-derived rather
than assumed.**

**On top of the formula shapes, the accumulation itself needed float32 rounding at every
step, not just at the end.** `GetProcessedCtr`/`Ctd`/`RcvCtr`'s running total is a native
C# `float` the entire way through the loop (`float fVar17; ... fVar17 = fVar17 +
fVar16;`) — unlike ATK/DEF, which accumulate in `System.Decimal` (see
`GetProcessedAtkDecimal`). The old code only wrapped the *final* result in
`Math.fround()`, having summed every effect in full float64 precision first. That
under-replicates the truncation: with several stacked crit effects, the running total
can end up on the "wrong side" of a float32 rounding boundary relative to the real game
— which is exactly the kind of *eventual* divergence you asked about. I rewrote the
accumulator (`accumulateCrit` in `UnitStateEngine.ts`) to round after every individual
addition, matching the decompiled loop exactly, and to round the starting base
(`critRate/10`) before the loop starts too (mirroring `fVar17 = (float)_CTR_k__
BackingField / 10.0`'s implicit narrowing).

**Files changed:** `UnitStateEngine.ts` (removed `CTR_FAMILY`/`CTD_FAMILY`/
`RCV_CTR_FAMILY` and their use of the generic accumulator; added a dedicated
`accumulateCrit` plus rewritten `getProcessedCtr`/`getProcessedCtd`/`getProcessedRcvCtr`).

### 2. Ratio/AccumRatio effects: right numbers, wrong operation order

Every `Get*VariationValue` body for a Ratio or AccumRatio effect builds the percentage
as its own fully-formed value — `(value1/10)/100`, optionally with `*AccumCountMax`
folded in — and *then* multiplies by the base/running stat. The old code computed
`baseValue * (value1/10) / 100`, which (left-to-right) multiplies by `baseValue` before
dividing by 100. Same real number, different floating-point operation order — the kind
of thing that's usually silent but can differ by an ULP or two, which is enough to flip
a `Math.floor` right at a boundary. I regrouped every branch (`ratioUp`/`ratioDown`/
`accumRatioUp`/`accumRatioDown` in `accumulateVariation`, used by ATK/DEF) to match the
confirmed call order exactly. Verified against three separate decompiled bodies
(`UpAtkRatioUnitState`, `DwnAtkRatioUnitState`, `UpAtkAccumRatioUnitState`), all
consistent.

**Files changed:** `UnitStateEngine.ts`.

### 3. `GetDamageBase`: one multiplication happens in native float32, not float64

The decompiled signature is `GetDamageBase(BattleUnit unit, float power)`, and the local
holding the scaling stat is also a `float` — so `statValue * power` happens in float32
before the result is widened to `decimal` for the rest of the formula. (The `Math.Pow`
call is unaffected — the source explicitly casts to `double` for that part, which is
what `Math.pow` already does in JS.) I added `Math.fround` around `power` and around the
`statValue * power` product. This is a single multiplication, not an accumulation loop
like the crit-rate case, so in practice it only flips the final `Math.ceil`'d damage in
rare boundary cases — but it's a confirmed decompiled fact, so I fixed it rather than
leaving it approximate.

**Files changed:** `DamageCalculator.ts`.

### 4. Battle-start passives resolve asymmetrically between the two teams

This one isn't a rounding issue — it's a real ordering bug, and I think it's a strong
candidate for (at least part of) the "enemy consistently acts first in a mirror
matchup" behavior you'd flagged previously. `PvPBattle`'s constructor called
`team1.finishSetup(team2)` then `team2.finishSetup(team1)`, and each `finishSetup` did
three things in sequence: load the unit's own kit into its effect bank, apply
`BATTLE_START` passives (which can target the *enemy* team), and immediately recompute
derived stats (SPD, MP gain, break) from whatever's active at that point.

Because `BATTLE_START` passives can cross-apply to the opposing team, running team1's
`finishSetup` fully before team2 even starts means: team1's battle-start passives are
already visible to team2's *first* SPD computation, but team2's battle-start passives can
never be visible to team1's first computation — team1 already computed and moved past it
by the time team2's passives fire. Two identically-built teams could legitimately end up
with different starting SPD/turn order from this alone, with no floating-point rounding
involved at all.

I split `finishSetup`/`triggerPassives` into three separate phases —
`addEffectsToBank()`, `applyPassivesForTiming()`, `recomputeDerivedStats()` — and had
`PvPBattle`'s constructor run each phase for *both* teams before advancing to the next
phase. Every other call site (`TURN_START`, `ATTACK_END`, mid-battle) still goes through
the original combined `triggerPassives()`, unchanged — sequential one-team-at-a-time
processing is correct there; it was specifically the simultaneous-start case that
needed decoupling.

**This fixes a real structural asymmetry, but I want to be direct about its limits:** it
only actually changes anything for matchups where at least one side has a
`BATTLE_START`-timed, enemy-targeting passive. If your mirror-matchup testing used kits
without one, this specific fix won't explain what you saw, and the float32-rounding-order
hypothesis (different summation order → different last-bit rounding → a "tie" that isn't
really bit-equal) from your notes on `turnOrderPriority` in `PvPTeam.ts` is still worth
checking empirically, exactly as suggested there: log `secondsUntilAbleToAct().
toPrecision(20)` for both units on a mirror-tie turn and see if they're actually
bit-equal.

**Files changed:** `PvPTeam.ts`, `PvPBattle.ts`.

## Things I looked at, didn't change, and want to flag explicitly

- **`DWN_ATK_FIXED`/`DWN_DEF_FIXED`** have no backing `UnitState` class either — I
  grepped exhaustively; only `DwnAtkRatioUnitState`/`DwnAtkAccumRatioUnitState` exist for
  the Down direction (confirmed identical for Def). I left the mapping in
  `ATK_FAMILY`/`DEF_FAMILY` as-is rather than remove it: if it's genuinely unused it's
  harmless dead code, and removing it is the riskier direction if I've simply missed the
  real class somewhere in 232K lines of decompiled output.
- **Buff/debuff-effectiveness scaling (`buffMult`/`debuffMult` in `PvPKioku.ts`) only
  applies to a unit's own intrinsic kit** (ability/ascension/portrait/support/crystalis),
  computed once at construction. Any buff or debuff this unit *receives* later from a
  teammate or enemy during battle goes through `storeTimedEffect` and never passes
  through that scaling at all. I don't have confirmation either way on whether the real
  game applies buff-effectiveness scaling to externally-received effects, so I've left
  this alone rather than guess — flagging it as an open question for your own kit-data
  testing.
- **Conditions can't currently see the real attacker.** Every accumulator in this file
  (`isEffectCurrentlyActive` → `stateGen(this, this)`) checks activity with the unit as
  both actor and target, never the unit that's actually attacking it. A hypothetical
  "bonus crit rate against a specific marked unit" condition on an RcvCtr effect can't
  evaluate correctly regardless of the formula fix above. This predates this pass and
  isn't specific to crit — fixing it properly means threading a real attacker/
  trueActorUnit through every accumulator call site, which felt like too large and
  too-easily-inconsistent a change to make part of this pass. Flagging rather than
  half-fixing just the crit path.
- **`System.Decimal` vs. JS `number`.** ATK/DEF's own accumulation, and part of
  `GetDamageBase`'s final assembly, use C#'s 128-bit base-10 `decimal` type in the real
  engine — exact for these magnitudes, unlike binary floating point. This port uses
  ordinary JS doubles throughout, which is an extremely close approximation (double
  precision is far finer than any game-stat magnitude needs) but not bit-exact. I'm
  calling this out per your ask about floating-point precision, but I don't think it's
  worth chasing further: the divergence only shows up if a true value sits within about
  1 part in 10^15 of an integer boundary right before a floor/ceiling, and fixing it for
  real would mean pulling in a full decimal128 library for the whole accumulation chain —
  a large change for a vanishingly small practical benefit. Flagging as an accepted
  limitation, not fixing.
- **I did not re-audit `getDefenseCorrectedDamage`, `getProcessedGiveDamage`/
  `ReceiveDamage`, `getElementResistDamage`, or the shield-stacking multiplier loop in
  `damageCutByShield`** for float32-vs-float64 typing the way I did for the crit-rate
  path and `GetDamageBase`. These are all single- or few-step formulas already marked
  `[RECONSTRUCTED]` against `ScoreAttackTeam.ts` rather than independently decompiled
  with type info by me in this pass, so I have no specific evidence of a bug there — just
  noting that the same kind of check I did elsewhere hasn't been done for these yet, in
  case it matters to you later. `damageCutByShield`'s `multiplier *= (1 - decreaseRatio)`
  loop in particular has the same "compounds across multiple stacked instances" shape
  that made the crit-rate bug real, so if you ever see damage numbers drift with 3+
  shields active, that's where I'd look first.
- **`Kioku.ts`'s stat getters** (`getBaseAtk`/`getBaseDef`/`getBaseHp`, the
  `1 + 0.02*ascension` scaling in particular) weren't checked against decompiled code in
  this pass. `ascension` is a small integer, so the practical risk is very low, but I
  didn't verify it either way — no code change, just noting the gap.

## Verification

I don't have the rest of your project (`enums.ts`, `helpers.ts`, `BestTeamCalculator.ts`,
etc.) so I can't compile this end-to-end. I did run `tsc --noEmit --noResolve` against
both the original and the modified versions of every file I touched, to isolate errors
caused by missing peer modules (expected, identical in both) from anything my edits might
have introduced. The diff is clean — every warning present after my changes was already
present, at a shifted line number, before them.

## Files changed

- `UnitStateEngine.ts` — crit-rate/crit-damage/RcvCtr accumulator rewrite; ratio
  operation-order fix.
- `DamageCalculator.ts` — `GetDamageBase` float32 fix.
- `PvPTeam.ts` — split `finishSetup`/`triggerPassives` into phases.
- `PvPBattle.ts` — constructor now interleaves both teams' setup phases correctly.

`PvPKioku.ts`, `Kioku.ts`, `BattleConditionParser.ts`, and `KiokuTypes.ts` were reviewed
but not modified — I didn't find anything in them that needed changing beyond what's
flagged above.

## Addendum (later session): CHARGE, FULL AUTO targeting, PROXIMITY, probability rolls

A later session (tracked in detail in `MISSING_AND_UNCERTAIN.md`, now at "Revision 3")
went back into `BattleUnit.c`/`dump.cs` for a different purpose - implementing `CHARGE`
and a real FULL AUTO target-selection AI - and along the way found and fixed several more
issues in the same spirit as this document (real bugs found by reading decompiled source
carefully, not by guessing): `GAIN_CHARGE_POINT` mutating the caster instead of the
resolved target, `BARRIER` overwriting instead of stacking, two `REMOVE_ALL_*` branches
that were dead code despite an in-line comment claiming otherwise, and two real gaps in
the `SkillDetail`/`ActiveSkill`/`PassiveSkill` TypeScript types relative to the actual game
data (missing `isFixedProbability`, missing `value5`, missing `probability` on the passive
variant). It also implemented the probability-roll-to-apply system this document doesn't
mention at all (it wasn't in scope for a floating-point audit) - see
`MISSING_AND_UNCERTAIN.md`'s A-3.3 for the full formula and citations, since it's exactly
the kind of thing this document cares about (it's a `Math.Floor`-to-2-decimal-places float
operation feeding a 0-999 integer roll, so precision there matters the same way the crit
formulas above do). `MISSING_AND_UNCERTAIN.md` is the actively-maintained tracking
document going forward; this file is kept as-is for the original audit's own record.
