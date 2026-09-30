# Status (update at the end of every session)

_Last updated: 2026-09-30 evening (battle-engine-3.19 rebased onto origin/main 61aed43; Time Stop Strike checked)._

## Branches and uncommitted work in E:\exedra-dmg-calc

| ref | state |
|---|---|
| `main` | checked out on 2026-09-30. Has the engine up to the merge `8c4b5ed Merge branch 'battle-engine-3.19'` plus later UI work (saved teams, Kioku Grid, Best SA Team). Lacks the two newest engine commits. |
| `battle-engine-3.19` | **Rebased onto origin/main (61aed43) on 2026-09-30**; old tip kept as `backup/battle-engine-3.19-pre-rebase`. On top of main: `6dd3b51` PvE summons, Solo Raid link HP/endless/countdown, form changes; `49cad71` heal/EP/ailment-roll formulas, DMG_RANDOM, UP_HP_RATIO, **condition sets OR'd** (main still ANDs them, so e.g. Time Stop Strike's Magic passive never fires on main); KB commits; Time Stop Strike fixture. Not pushed; `origin/battle-engine-3.19` is now stale (a push would need --force). Merging into main: docs/ai/EFFECT_TYPES.md will conflict (each branch has its own) - regenerate with `xq build`. |
| `stash@{0}` "claude in-progress" (made on the pre-rebase 1e1c3b1, 2026-09-27; checked: no file overlap with the rebase, `git stash apply` on the rebased branch should be clean) | **Unfinished session work, never committed**: kit mechanics TSUBAME, ZONE, COUNT, UNIQUE_* (accum/Lv/reset), REFLECTION_RATIO, REGAIN_*, VORTEX_ATK, consume-on-attack states, live UP/DWN_BUFF/DEBUFF_EFFECT_VALUE, PREVENT_ABNORMAL; Solo Raid vanguard points/activation, party/season buffs, round limit, attempt carry-over, raid UI panel. 12 files, +720/-40. The session stopped during the UI check: **fixtures / type-check / browser not confirmed**. The confirmed rules are in MECHANICS.md sections 6, 8, 12, 13. |

Stash touch points (view with `git diff 'stash@{0}^1' 'stash@{0}' -- <path>`; `git stash show -p stash@{0} -- <path>`
errors): PvPTeam.ts (KiokuState zone/count fields, giveTransform effect-value scaling, unique blend, reflection /
vortex / regain / TSUBAME extra hit in the DMG branch, new applyEffect branches), UnitStateEngine.ts (TSUBAME in
the SPD/ATK passes), BattleConditionParser.ts (contents 27/29/31/113/114/209-211/1001/1101, timing 10),
PvPBattle.ts (Solo Raid attempts, vanguard, round limit), PvEBattle.ts, PvE.ts, PvPKioku.ts, KiokuTypes.ts,
pvpExport.ts, PvESimulatorPage.vue, BattleTimeline.vue.

Before engine work: ask the user whether to continue from the stash (`git checkout battle-engine-3.19 && git stash
apply`, then verify) or leave it. Never drop it.

`docs/ai/EFFECT_TYPES.md` is committed per branch (its header says which); rebuild with `xq build` after switching
branches or changing the engine. On battle-engine-3.19 the types used by kits but not implemented are exactly
the stash's topics: TSUBAME_*, ZONE_* / UNIQUE_ZONE, COUNT / *_COUNT_POINT, UNIQUE_* (incl. 10030301 Fiore Finale,
10070201 Groundhog Daze, ELEMENT_STACK), REGAIN_ATK, UP_BREAK_EFFECT (blocked, open question 1).

## Probable engine bug found 2026-09-30 (not fixed yet)

State durations: the game skips the first countdown only for a state a unit gives ITSELF with its own skill
(IsExemptPassingTurnOnce, MECHANICS.md section 8, 0x16dfd70 / 0x1901cb0). `PvPTeam.ts` `storeTimedEffect` sets
`_isExemptPassingTurnOnce: true` for every timed state, so buffs/debuffs on OTHER units last one of their turns
too long (e.g. Luce's 2-turn team buff covers an ally's next 3 turns instead of 2). Check in game (count an ally's
turns under a 2-turn buff from someone else), then fix + fixture.

## Open questions (most useful first)

1. Break bonus damage (`GetBreakDamage` 0x137d340) needs `LevelReactionBreakDamageValue` (client-provided, not in
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
10. Score formulas (Score Attack, Solo Raid, PvP points) are not in the battle core; would need Assembly-CSharp
    UI classes decompiled (`PopupScoreAttackReadyController` ...) or fitting against real results.
11. Team counters 302/306 details for some enemies; target filters of non-damage effects when an enemy casts.

## Useful in-game verification the user could do
- A fixture (browser export + notes) for any crys/kit fix, e.g. Tenebrous Arcana 3/3 Magic at start, Diamond
  Splash +3 on first turn only.
- Sandbox Witch (509140) rotation, to confirm TurnNum-per-turn in combo enemies.

## Session log (newest first, one line each)
- 2026-09-30 evening: rebased battle-engine-3.19 onto origin/main; Time Stop Strike Magic already right on the
  engine branch (bug only on main: AND of condition sets); added fixture time-stop-strike-magic.json + line checks
  in checkFixtures.ts.
- 2026-09-30: built docs/ai + scripts/ai/xq.py; skills proposed; no engine change.
- 2026-09-27: kit mechanics + full Solo Raid (stash@{0}, unfinished).
- 2026-09-26: EX crys magic (trigger order, TurnNum), RNG modes, manual PvE, exports, ailments, summons, link HP,
  countdown, form change, heal/EP/roll formulas (commits on battle-engine-3.19).
- 2026-09-25/26: 3.19 decompile pipeline, decimal damage, break, passives rework, turn priority, Cutaway, PvE engine.
