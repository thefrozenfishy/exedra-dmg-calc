# Status (update at the end of every session)

_Last updated: 2026-10-02 (game 3.19.1: version diff + newsletter, Magic Seal, break/notice team conditions, IMM_SLIP_DMG burst; branch claude/version-3.19.1)._

## Branches and uncommitted work in E:\exedra-dmg-calc

| ref | state |
|---|---|
| `claude/version-3.19.1` | **Checked out 2026-10-02**, branched from main 7fb9730 (= origin/main; the 2026-10-01 branches claude/verify-priority-3.19, claude/actor-skill-type-3.19 and battle-engine-3.19 are merged and no longer exist locally). 3.19.1 work: verdiff.py / disasm.py / smokeNew.ts / VERSION_UPDATE.md runbook, LOCK_SPECIAL_ATTACK, conditions 22/206/207/313-316, BreakedDamageReceiveRate starts at 0, IMM_SLIP_DMG instant DOT burst. Fixtures 6/6, checkMechanics 17/17 (#10-#13 new, each fails without its change), type-check 229 = baseline set. Not pushed; for the user to merge. |
| `main` | = origin/main 7fb9730 on 2026-10-02. |

`docs/ai/EFFECT_TYPES.md` is committed per branch (its header says which); rebuild with `xq build` after switching
branches or changing the engine. On battle-engine-3.19 `xq build` still lists UNIQUE_BUFF / UNIQUE_DEBUFF /
UNIQUE_10030301 / UNIQUE_10070201 (pure marker states: stored generically, read by conditions 12/26 - nothing more to
do) and UP_BREAK_EFFECT (blocked, open question 1).

## Fixed 2026-09-30: state duration exempt-once

`storeTimedEffect` / `mergeUniqueState` now set `_isExemptPassingTurnOnce` only via `isOwnSkillState`: the holder
gave the state to itself, from an active skill, or from a passive during its own act (MECHANICS.md section 8).
Confirmed by the user's in-game observation. Buffs from allies now tick at the holder's next TurnEnd.

## Decisions taken with the user (2026-09-30)

- Break bonus damage (UP_BREAK_EFFECT): fixed at 0 (`BREAK_BONUS_DAMAGE` in BreakPoint.ts, TODO). Negligible in game.
- Solo Raid score: `PvPBattle.teamPointsUsed` = round(20 × elapsed AV), shown as "N team points used" after a raid
  run (2.5 turns = 250 AV -> 5000). An approximation; the real score is server-side.

## Open questions (most useful first)

1. (Parked: set to 0 by decision) Break bonus damage (`GetBreakDamage` 0x137d340) needs `LevelReactionBreakDamageValue` (client-provided, not in
   data): one in-game break-bonus number per attacker level would let us back-solve it. UP_BREAK_EFFECT depends on it.
2. Character HealRate / RecoveryEpRate / EffectHit/ParryRate come from styles/params not in base_data (treated 0).
3. EP on hit received: per hit or per act? (applied per damage effect).
4. HP-gauge revive: its turn-gauge effect (`TurnGauge.DecreaseGaugeValue(..., NextTurnOrderPriority)`) read as
   "acts next" [?]; exact debuff-removal flags.
5. Equal-priority enemy condition rows: reader order assumed master-id ascending.
6. FuaMap keyed by skill id only: two units with the same follow-up skill in one timing collapse into one.
7. RE_ACTION_TURN_UNIT_ACT has its own class (ReActionTurnUnitAct) but is still treated as ADDITIONAL_TURN_UNIT_ACT.
8. RCV_FINAL_DAMAGE applied per damage effect; the game sums the skill per target first (possible ±1).
   Additional-damage hits get their own per-hit final damage the same way; targets that died earlier in the skill are
   skipped for the additional hit (the game still lists them) [?]. TURN_START / TURN_END passive start conditions still
   see the turn's chosen action as ActorSkillType (game: probably no skill at those timings, not checked).
9. Waves: a new wave's passives run as BATTLE_START instead of WAVE_START [APPROXIMATION].
10. Score formulas (Score Attack, PvP points; Solo Raid approximated as 20 × AV) are not in the battle core; would need Assembly-CSharp
    UI classes decompiled (`PopupScoreAttackReadyController` ...) or fitting against real results.
11. Team counters 302/306 details for some enemies; target filters of non-damage effects when an enemy casts.

12. Team content 310 SlipDamageTotalCount (6 conditions) still returns false: notices don't record slip-damage types.
13. IMM_SLIP_DMG does not pop Vortex (VortexUnitStateBase overrides GetSlipDamageValue; not read yet).
14. Whether a blended unique state (mergeUniqueState) still adds an AddStateInfo for 315/316 (assumed yes).

## Useful in-game verification the user could do
- A fixture (browser export + notes) for any crys/kit fix, e.g. Tenebrous Arcana 3/3 Magic at start, Diamond
  Splash +3 on first turn only.
- Sandbox Witch (509140) rotation, to confirm TurnNum-per-turn in combo enemies.

## Session log (newest first, one line each)
- 2026-10-02: game 3.19.1 (patch 2026-09-27): client code byte-identical to 3.19.0, only the version literal changed; master data diff 4ea7254^..HEAD (Metallicized Projectile, Solo Raid 7 Rose Garden Witch, Score Attack 28 Box Witch, LOCK_SPECIAL_ATTACK). Report + newsletter in E:\unpackedExedra\3.19.1\version_report and docs/versions/3.19.1. Engine: Magic Seal, conds 22/206/207/313/314/315/316, break rate 0 at start, IMM_SLIP_DMG burst (was misread as DOT immunity). New tools verdiff.py, disasm.py, smokeNew.ts; runbook VERSION_UPDATE.md.
- 2026-10-01 (11): main rebased onto claude/verify-priority-3.19 (old main kept as backup/main-pre-rebase; diverges from origin/main, needs a force push). Both sides had bumped LUX_BENCH_VERSION 4->5 independently: now 6.
- 2026-10-01 (10): BpCharger (basic +1, skill +2, GAIN_EP_* received +1) and IsReceivedRecovery on full-HP heals; checkMechanics #9. Replay: debugging/pvp-sim-Hollow-Woman-seed2405608212.json (Vinctio ults at actions 19, 32).
- 2026-10-01 (9): (claude/verify-priority-3.19) BP system: MaxBP units (Vinctio☆Magica, Metallicized Projectile) ult on BP (IsSpecialAttackPointMax), GAIN/LOSE_BP_FIXED implemented, EP/BP zeroed on death; BattleTimeline/export show a BP bar and charge (max 1000) as %. MECHANICS 10.
- 2026-10-01 (8): (claude/verify-priority-3.19) Max Damage stacked every rung of tier ladders (Focused Guard "N enemies",
  Light Chain Lv 1-5, Magic/token counts...) because it strips active conditions: now one rung per ladder
  (`ConditionTiers.ts`, `MaxDamage.assignTiers`), UI shows the others as "Other tier" (click = use that tier). Max Damage
  also never counted RCV_FINAL_DAMAGE: added. Engine itself was already right (probe of the user's export). LUX_BENCH_VERSION 5.
- 2026-10-01 (7): (claude/verify-priority-3.19) checked another session's 8 open assumptions in the decompile. Fixed: EachTarget
  given to every unit / falling back to the holder (now user-only, null = false, also for passives and heals); IS_ROLE /
  IS_ELEMENT NotEqual (set 349, skill detail 200600401, inverted before); team SP uncapped (now 0..6); vortex damage
  missing from the hit's notice (DMG 101 / team 304); enemy additional damage used the enemy's element (now none).
  Confirmed as implemented: per-target start conditions, additional damage on its giver, ailment prefix match.
  checkMechanics #4-#8 added. MECHANICS 2/6/10/13, PITFALLS, CODE_MAP.
- 2026-10-01 (6b, main): Kioku Grid bench support chart gets ST/Prox/AoE (1/3/5 enemies); bench allies aim single/proximity
  skills at the middle enemy (`PvPTeam.opponentTargetPolicy`). Max Damage applies enemy debuffs by range around the
  main target (was: every debuff on every enemy). Cache version 5.
- 2026-10-01 (7): Kioku Grid bench support chart gets ST/Prox/AoE (1/3/5 enemies); bench allies aim single/proximity
  skills at the middle enemy (`PvPTeam.opponentTargetPolicy`). Max Damage applies enemy debuffs by range around the
  main target (was: every debuff on every enemy). Cache version 5.
- 2026-10-01 (6): Kioku Grid bench Lux back to A5 max levels (user request); no-buff supports read about -3.5% in Average
  Damage from her A1 follow-up timing (hidden by the >1% support filter). Cache version 4.
- 2026-10-01 (5): engine: state active conditions see the processed target as EachTarget ("DMG to cursed enemies"
  now applies) [?]; additionalHit events got sourcePos/vortex. MaxDamage `enemyStates` (ailment conditions checked
  against them). Kioku Grid bench: ailment variants (support + attacker charts), dummies break gauge 1.
- 2026-10-01 (4): bench back to 500 AV; scripted play hooks `PvPTeam.allyActionPolicy` / `allyTargetPolicy` (+
  `KiokuState.skillStreak`) used by LuxBench only (Tenebrous Arcana skill x3 then basic, Thunder Torrent always skills
  the dealer); Kioku Grid bench results cached in localStorage with a Recalculate button.
- 2026-10-01 (3): Kioku Grid Average Damage = 1000 AV with SP topped up to 5 whenever time advances; neutral bench
  dealer is a Light Breaker unless the kit is limited to those. ~160 s single-thread for the full roster.
- 2026-10-01 (2): engine: IsElementType/IsRoleType conditions compared ids to names (never matched), and EACH_TARGET
  start conditions of friendly effects were checked on the caster only - both fixed (Attacker/element-only buffs now
  land). Max Damage: additional damage in the attacker's element, TSUBAME_LINK extra hit included. Lux bench dealer
  gets an element the support's kit isn't limited to. Fixtures 6/6, type-check 231.
- 2026-10-01: (claude/actor-skill-type-3.19) verified a report from another session in the decompile: state active conditions use each unit's ActiveConditionCheckDataBundle, filled by AbilityEffectLauncher.Triggering for the whole skill (0x1373550 / RemoveTransientData 0x17ec1f0), so ~1000 skill-type / IsActor gated states were never active in TS; ADDITIONAL_DAMAGE / TSUBAME_LINK are one hit per launch per opponent hit (not per row); Ether Blow = ActorSkillType "EtherBlow". Fixed engine + MaxDamage, added checkMechanics.ts, MECHANICS 2/6, PITFALLS, CODE_MAP.
- 2026-10-01: (main, uncommitted) PvE Max Damage: Switch Skill + Follow-up columns (strongest SWITCH_SKILL / ADDITIONAL_SKILL_ACT skill, EtherBlow = SkillType 5), switch-skill states added to Buffs & Debuffs; `BattleSnapshot.field` (zone owner + stock) shown and tinted in BattleTimeline. Known: Max Damage counts each DMG_RANDOM row as one v1 hit on every enemy and counts all its mutually exclusive conditional rows (Falsified Phenomena ult: 6 rows instead of 10 random hits), so random-hit skills are only approximate.
- 2026-10-01: Kioku Grid beta "(battle engine)" charts (LuxBench.ts + luxBenchWorker.ts); BattleEvent.sourcePos /
  vortex, BattleRng.draw hook + BattleOptions.rng, computeMaxDamage onlyPos, skill-detail index in getDetails /
  triggerFua (~5x faster sims). Fixtures 6/6, type-check 231 (baseline 232). No game-rule change.
- 2026-09-30 night: applied the 2026-09-27 stash, fixed a CsDecimal.fromInt crash (effect-value-scaled FIXED break states), finished the Solo Raid UI check, committed; MISSING_AND_UNCERTAIN.md revision 10.
- 2026-09-30 evening: rebased battle-engine-3.19 onto origin/main; Time Stop Strike Magic already right on the
  engine branch (bug only on main: AND of condition sets); added fixture time-stop-strike-magic.json + line checks
  in checkFixtures.ts.
- 2026-09-30: built docs/ai + scripts/ai/xq.py; skills proposed; no engine change.
- 2026-09-27: kit mechanics + full Solo Raid (stash@{0}, unfinished).
- 2026-09-26: EX crys magic (trigger order, TurnNum), RNG modes, manual PvE, exports, ailments, summons, link HP,
  countdown, form change, heal/EP/roll formulas (commits on battle-engine-3.19).
- 2026-09-25/26: 3.19 decompile pipeline, decimal damage, break, passives rework, turn priority, Cutaway, PvE engine.
