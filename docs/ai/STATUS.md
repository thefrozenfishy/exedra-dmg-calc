# Status (update at the end of every session)

_Last updated: 2026-10-01 (skill-type-gated states + additional damage per launch, branch claude/actor-skill-type-3.19)._

## Branches and uncommitted work in E:\exedra-dmg-calc

| ref | state |
|---|---|
| `claude/actor-skill-type-3.19` | **Checked out 2026-10-01**, branched from main (9346192). Unit-state conditions see the running skill launch (ActorSkillType / IsActor / MainTarget, `activeLaunch`), ADDITIONAL_DAMAGE / TSUBAME_LINK once per launch per opponent hit, MaxDamage per-column skill-type filtering + one additional hit per enemy, `scripts/sim/checkMechanics.ts`. Fixtures 6/6, checkMechanics 5/5, type-check at the 232 baseline, 114-kioku PvP smoke run clean. Not pushed; for the user to merge into main. |
| `main` | 3 commits ahead of origin/main on 2026-10-01: contains all of battle-engine-3.19 plus the PvE simulator UI (merged claude/hopeful-edison-k78vto) and the Max Damage work. |
| `battle-engine-3.19` | **Rebased onto origin/main (61aed43) on 2026-09-30**; old tip kept as `backup/battle-engine-3.19-pre-rebase`. On top of main: `6dd3b51` PvE summons, Solo Raid link HP/endless/countdown, form changes; `49cad71` heal/EP/ailment-roll formulas, DMG_RANDOM, UP_HP_RATIO, **condition sets OR'd** (main still ANDs them, so e.g. Time Stop Strike's Magic passive never fires on main); KB commits; Time Stop Strike fixture. Not pushed; `origin/battle-engine-3.19` is now stale (a push would need --force). Merging into main: docs/ai/EFFECT_TYPES.md will conflict (each branch has its own) - regenerate with `xq build`. |
| (stash) | Applied and committed on battle-engine-3.19 on 2026-09-30 (kit mechanics TSUBAME / ZONE / COUNT / UNIQUE_* / REFLECTION / REGAIN / VORTEX / consume states / live effect-value scaling; Solo Raid Vanguard, party/season buffs, round limit, attempt carry-over, raid UI panel). Fixtures 6/6 PASS, type-check at the 232 baseline, all 114 kiokus smoke-run on a raid stage, raid panel checked in the browser. |

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

## Useful in-game verification the user could do
- A fixture (browser export + notes) for any crys/kit fix, e.g. Tenebrous Arcana 3/3 Magic at start, Diamond
  Splash +3 on first turn only.
- Sandbox Witch (509140) rotation, to confirm TurnNum-per-turn in combo enemies.

## Session log (newest first, one line each)
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
