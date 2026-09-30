# Status (update at the end of every session)

_Last updated: 2026-09-30 evening (exempt-once fix, raid score, break bonus = 0)._

## Branches and uncommitted work in E:\exedra-dmg-calc

| ref | state |
|---|---|
| `main` | checked out on 2026-09-30. Has the engine up to the merge `8c4b5ed Merge branch 'battle-engine-3.19'` plus later UI work (saved teams, Kioku Grid, Best SA Team). Lacks the two newest engine commits. |
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
9. Waves: a new wave's passives run as BATTLE_START instead of WAVE_START [APPROXIMATION].
10. Score formulas (Score Attack, PvP points; Solo Raid approximated as 20 × AV) are not in the battle core; would need Assembly-CSharp
    UI classes decompiled (`PopupScoreAttackReadyController` ...) or fitting against real results.
11. Team counters 302/306 details for some enemies; target filters of non-damage effects when an enemy casts.

## Useful in-game verification the user could do
- A fixture (browser export + notes) for any crys/kit fix, e.g. Tenebrous Arcana 3/3 Magic at start, Diamond
  Splash +3 on first turn only.
- Sandbox Witch (509140) rotation, to confirm TurnNum-per-turn in combo enemies.

## Session log (newest first, one line each)
- 2026-09-30 night: applied the 2026-09-27 stash, fixed a CsDecimal.fromInt crash (effect-value-scaled FIXED break states), finished the Solo Raid UI check, committed; MISSING_AND_UNCERTAIN.md revision 10.
- 2026-09-30 evening: rebased battle-engine-3.19 onto origin/main; Time Stop Strike Magic already right on the
  engine branch (bug only on main: AND of condition sets); added fixture time-stop-strike-magic.json + line checks
  in checkFixtures.ts.
- 2026-09-30: built docs/ai + scripts/ai/xq.py; skills proposed; no engine change.
- 2026-09-27: kit mechanics + full Solo Raid (stash@{0}, unfinished).
- 2026-09-26: EX crys magic (trigger order, TurnNum), RNG modes, manual PvE, exports, ailments, summons, link HP,
  countdown, form change, heal/EP/roll formulas (commits on battle-engine-3.19).
- 2026-09-25/26: 3.19 decompile pipeline, decimal damage, break, passives rework, turn priority, Cutaway, PvE engine.
