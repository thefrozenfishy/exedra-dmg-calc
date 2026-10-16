# Status (update at the end of every session)

_Last updated: 2026-10-15 (game 3.21.0: dumped + decompiled by Claude on Windows, engine re-ported to 3.21.0; branch claude/version-3.21.0); before: 2026-10-14 (Max Damage + Kioku Grid bench on the 1:1 engine); before: 2026-10-10 (1:1 port in src/engine started); before: 2026-10-03 (passive states per giver, UP_HP_FIXED max HP; earlier: duplicate active-skill states); before: 2026-10-02 (game 3.19.1: version diff + newsletter, Magic Seal, break/notice team conditions, IMM_SLIP_DMG burst; branch claude/version-3.19.1)._


## 2026-10-16 (2): Best SA Team Calculator on the 1:1 engine

- `/sa-simulator-multiple` "Best SA Team Calculator" (`BestTeamPage.vue`, same UI) scores teams on the engine:
  `models/EngineBestTeam.ts` (same candidates and result rows as `findBestTeam`; Phase A one score per roster +
  pruning margin, Phase B coordinate ascent over attacker support / portrait / crystalis set / supports' supports
  instead of the full product), `battle/EngineTeamScore.ts` (the attacker's Ultimate as Max Damage computes it on
  dummies from the enemy row: `EngineBench.customStage`, DEF / weak to all or none / broken at the break bonus; crit
  per enemy = the enemy's "crit" flag), scored in a worker pool (`models/EngineTeamPool.ts`, `maxDamageWorker.ts`
  "teams" messages: no extra worker bundle). Old-model inputs become stage states (`MaxDmgOptions.fieldStates`,
  `EngineBench.giveFieldState`, not scaled by anyone's buff strength): buff / debuff bonus reduction ->
  DWN_BUFF / DWN_DEBUFF_EFFECT_VALUE on each ally (off-element value for off-element allies), stage buffs -> that state
  on every ally (or enemy for DWN_ / RCV / WEAKNESS types), DEF up / DMG taken down -> UP_DEF_RATIO /
  DWN_RCV_DMG_RATIO on that enemy. Unused: attacker HP, hits to kill, additional-damage crit.
- The page picks a real stage and wave with the PvE Simulator's picker (`components/StageEnemySelector.vue`: stage
  tree, wave, Target / Broken / broken rate per enemy; settings `saStageId` / `saStageWave`): teams are scored on that
  wave (`TeamScoreScenario.stage`, the stage's battle type), max = every hit crits, avg = the engine's crit chance.
  The old enemy row (dummies) stays for `scripts/sim/engineBestTeam.ts`.
- The old calculator moved to `/sa-simulator-multiple-old` "Old Best SA Team Calculator" (`OldBestTeamPage.vue`,
  unchanged), on its own nav row with "Old Single Hit Calc". CLI: `scripts/sim/engineBestTeam.ts <team.json> [Elements] [--old]`.
- Cost: ~0.2-0.4 s per score (Max Damage's ladder runs, each a fresh battle setup); Dark with the user's roster:
  ~1,900 scores. In-game check page for the engine (`scripts/sim/ingameChecks.ts`): the user's checks matched exactly.

## 2026-10-16: Kioku Grid bench crit handling (user's choice)

- 5-unit teams again (Lux fillers back). No "Crits" toggle: a team where a kit reacts to crits
  (`kitReactsToCrits`: a CTDUnitCount 303 condition or a CTD_CONSUME state; 20 of 116 kits, e.g. Absolute Rain)
  rolls crits as in the game and averages 10 seeded battles; every other team uses the expected-crit APP MOD
  (runtime.AppMods.expectedCritDamage) in one battle, or 10 when something else in it is random. Cache version 20.

## 2026-10-15: Kioku Grid bench speed, expected-crit APP MOD, no filler Lux

- **APP MOD (not game code)** `runtime.AppMods.expectedCritDamage` (off by default, never set by game code): in
  BattleDamageCalculator.GetAttackDamageResult every crit-capable hit deals normal + (crit - normal) x crit chance;
  the crit roll still happens and is reported. Kioku Grid "Crits: Average crits (mod) | Rolled crits (1:1)", default
  the mod. Every reader of an AppMods switch is marked "APP MOD (not game code)".
- Bench teams without filler Lux: support chart = Lux dealer + the character vs Lux alone; attacker chart = the
  character alone vs Lux alone (role stats). The game runs battles with any number of allies.
- Average Damage seeds: adaptive (stop when the mean's standard error < 0.25%, at least 3 seeds; 2 with the mod).
- Parallel bench workers (cores - 1, max 8); runtime.isImpl caches each class's interface set.
- Fixed `scripts/engine/bundle.mjs` on Windows (path matching found 0 modules and wrote an empty bundle).
- Cache version 19.

## 2026-10-14 (4): Link Raid (Multi-Raid), GvG, GvE directors ported; app options

- Ported MultiRaidGameDirector, MultiRaidJudgeResultReferee, GvgGameDirector, GveGameDirector,
  GveJudgeResultReferee, GveBreakBonusFieldParam (28 methods; 53 stubs left, none reachable).
- **Link Raid** stages (MultiRaidStageMst, category "Link Raid") now run on MultiRaidGameDirector in the PvE page
  (EngineBattle kind "multiRaid"): one wave, the boss starts at the raid's HP ("Boss HP at start", default full),
  the stage's round limit, the season's battle bonus passives on every ally (source Bonus 5 [UNCERTAIN: server
  side]; each passive's role / element condition is the engine's). The status shows TotalDamage (damage values to
  the boss, overkill included, as the game counts it). Offline: no participants, so no HP syncs
  (SyncHpScore is only called by the server's answer). `scripts/sim/engineMultiRaid.ts`: 200 stages x 4 teams ok.
- **GvG**: PvP page "Rules: PvP | GvG" (GvgGameDirector). In 3.19 every BattleType check in the core is
  "Pvp or Gvg" and both judges have the 15-round limit, so the result is the same as PvP.
- **GvE**: ported, not offered: the master lists (GveMst, GveStageMst, MapGve*) are empty in this data dump, and
  GvE enemies come from the server (CreateInitialEnemyBattleUnits), not from a stage.

## 2026-10-14 (3): Max Damage + Kioku Grid bench on the 1:1 engine; two port bugs fixed

- **Port bugs found by comparing the old and new bench** (PITFALLS "explicit interface implementations"):
  WeaknessUnitState's ATK/DEF -10% never applied (GetProcessedAtk/Def read `.Addition` of an explicit
  implementation), and the neutral states (Count, LockSpecialAttack, UniqueZone) got `_TargetSide = undefined`.
  `ifaceProp` (runtime.ts) does interface dispatch. Icon numbers of accum / count states fixed the same way.
- **Max Damage panel** (PvE page) runs on the engine: `src/battle/EngineMaxDamage.ts`, in a worker
  (`src/workers/maxDamageWorker.ts`, the last result stays on screen while the next one is computed). Each skill is
  launched in fresh engine battles of the stage's wave with every team effect given through AbilityEffectLauncher,
  conditions met (parsed condition lists emptied, csv kept). Effects that can't count together count once, the
  one giving the most damage (coordinate ascent per column): MaxDmgEffect.tier ladders - "conditions" (exclusive
  conditions / game duplicates) and, new, "alternative": same-type effects of a skill and the switch skill
  replacing it, or of different follow-ups (the user's rule: "only the major buff"). The skill's own rows whose start
  conditions exclude each other also count once (Pluvia☆Magica's HP<80% / HP>=80% rows: the old panel added both).
  Crystalis copies are given once per equipped copy. `scripts/sim/maxDamageEngine.ts` compares with the old panel
  (same numbers except: enemy battle-start passives now count, e.g. 129202's DEF +10%; the cases above).
- **Kioku Grid bench** (`models/LuxBench.ts`) runs on the engine against game-shaped made-up master data
  (`src/battle/EngineBench.ts`, `addMasterRecords`): a bench stage per enemy count / immunity set (DEF 3000, weak to
  all, int.MaxValue HP, SPD 1, break table that stays at 500%, 100% parry for immune ailments), styles for Lux
  identities (element / role; open = Lux's own) and her skills as rows in the tested element. Average Damage is a
  Manual-control EngineBattle answered by BenchRng (ultimates when ready, Battle Skill whenever SP, single targets on
  the middle dummy, ally targets on the dealer, PLAY_PATTERNS). No expected crits in the engine: every run with a
  real roll averages `seeds` battles. Cache version 18.
- **Speed:** `indexHint` on hot GetModelList scans (BattleUnitInfo per request was 55% of a battle): bench battle
  200 -> 40 ms; Max Damage 0.3-0.6 s per evaluation for quests, ~1 s for Solo Raid (in the worker).
- Fight Solver: still on the old engine, marked TODO (user: come back later).

## 2026-10-14 (2): verification of the port, remaining notPorted

- `scripts/engine/callcheck.py` cross-checks every hand-ported body against the game's machine code: for each
  `@rva` method it lists the ReDriveBattleCore functions the game calls and reports callees the TS body never names.
  Default mode accepts a callee that is reached through a helper the TS body names (the game inlined that helper);
  `--strict` shows those too. Result: 0 unexplained callees; `--strict` 30 methods, all reviewed (inlined helpers such as
  IsCriticalDamage / DamageCutByDisableDamage / CountdownReferee.Initialize, Mst getters read as record fields,
  local functions `g__X|N_M` written inline, tail calls). GameDirectorBase.BattleEnd now calls SyncGameSituation (tail call).
- Ported the small leftovers (TargetTypeExtensions, BattleUnitSpeedAccumulator, BackupData.IsValid, GameSituationData
  ctor, BattleSpeedTypeExtensions, InvalidRequest cctor, DebugTurnGaugeEditRequest ctor, CommandSender.Subscription
  Dispose, KnockDownAdditionalEnemyCondition.CheckTargetEnemy, AdditionalEnemyUnit ctor(QuestEnemyAppearanceMstModel)).
- 81 notPorted left, none reachable from a battle (reverse call index over all ReDriveBattleCore functions, cached
  in ~/.cache/exedra-engine/rev.pkl; 0 callers unless noted):
  - backup / JSON restore (BackupAgent, contract resolvers, CommandPack Set/RestoreCommands, BattleUnitSkillSet
    OnSerializing/OnDeserialized): only on a resumed battle; `RestoreLogCommands` is called from
    RespondToClientReadyRequest only when the backup has commands (never here).
  - Gve / Gvg / MultiRaid directors and judges, GveBreakBonusFieldParam: game modes the app does not run.
  - client UI: Vector3 helpers, Style/Enemy texture keys, StyleMst.ReleaseTime/IsReleased, mode-change asset name.
  - `GetSpeedVariationValue(BattleUnitData, ...)` / `CanAddTo(BattleUnitData)` of the speed states: interface
    IRequiredSpeedVariationStateForDecide, used by the client's turn-order preview on states sent in
    CommandDecideSkillContent (BattleUnit.GetStateListForDecide); no battle code calls them.
  - SimulationBattleGameDirector / FinishBattleData ctors, LinqExtension.Max/Min/Priority (shared generic, no caller),
    BattleMstReaderContainer.GetReader reflection fallback (every reader is bound).
- Debug code: the shipped build has it stripped. GameDirectorBase.DebugMode and SoloGameDirectorBase.OnForceWinDebugRequested
  are `ret`, Request() ignores SwitchDebug (6) and Debug* (1000-1004), Debug.Log is [Conditional("ARIES_LOGGER")], and
  nothing in the battle code references the DebugTool namespace (log managers, Force*DamageOption, SkillOverwriteOption).

## 2026-10-14: engine runs every battle type; app adapter (branch claude/engine-1to1)

No NOT PORTED errors in quest, PvP or Solo Raid battles (sweeps: quests 150/150, Solo Raid 189/189 incl. 2 seeds,
RANDTEAMS random kioku teams). Ported this session: SoloRaidGameDirector (setup + restart from BattleInfo,
countdown, death, SyncBattleInfo), SoloRaidBuffReferee, SoloRaidJudgeResultReferee, CountdownReferee, PvP
director/provider, remaining unit states / ability effects. Fixed: hidden try/catch in IsMatchConditionSet
(PITFALLS). App side: `src/battle/EngineBattle.ts` runs the engine like the client and returns BattleSnapshot
entries (the shape the pages render); `GameRandom.hook` + `src/battle/EngineRandom.ts` route every random draw
through BattleRng (hit/miss/weighted/seed/manual flips). `scripts/sim/checkFixturesEngine.ts`: all automatic
in-game fixture cases pass on the engine; manual-control PvE cases skipped (manual control not wired yet).
Pages switched (same snapshots, low visual change): PvP simulator and PvE simulator (quests, Solo Raid with attempt
carry, manual control) now run on the engine through EngineBattle. `npm run engine` builds src/engine/dist/engine.js;
`predev` / `prebuild` run it. Verified with a production build and headless Chromium (fixture import, run, pick panel).
Old vs engine (`scripts/sim/compareEngines.ts`, deterministic hit/miss modes, 42 battles): 210 of 247 matching
actions identical; differences traced so far are engine-correct: break deals Max(1, ...) = 1 HP because
LevelReactionBreakDamageValue is 0 (server value unknown), a passive state given during another unit's act expiring at
the holder's next TurnEnd (old kept it), Solo Raid ally buff passives. Turn-order ties among identical units can pick a
different unit than before (time-stop-strike #12, mirrored fixture #5).
Still on the old engine (src/models): Max Damage panel (MaxDamage.ts), Kioku Grid bench (LuxBench.ts), Fight Solver
(hidden, BattleClone), Score Attack calculators (closed-form, not a battle sim).

## 2026-10-10: 1:1 port started in src/engine (branch claude/engine-1to1)

The user's goal for the engine is a 1:1 copy of the game (CLAUDE.md, src/engine/README.md). `src/engine` holds the
generated shells of all 654 ReDriveBattleCore + Network.Definition.Battle types (fields with offsets, every method
with its RVA, `notPorted` bodies), 533 trivial methods filled from the machine code, 1160 auto-property accessors,
and hand ports of: the whole Act namespace, TurnActSystem, TurnReferee, UnitTurnGauge, TurnOrderUnitInfo,
the GameDirectorBase loop (Forward, Register/UnregisterSpecialAttack, CheckHpGaugeRevive, OnBattleUnitDeath,
OnRevival, CheckTargetUnit, ChangeBattlePhase, BattleEnd, StoreCommand), UnitCondition and the UnitStateBase core,
MathExtension.Floor. `tsconfig.engine.json` type-checks it (0 errors); tsconfig.app.json excludes it, so the app,
fixtures and checkMechanics are untouched. Coverage: docs/ai/ENGINE_LEDGER.md. Not runnable yet: BattleUnit,
PassiveSkill/ActiveSkill/AbilityEffectLauncher, BattleDamageCalculator, the condition checkers, readers and the
concrete UnitStates/AbilityEffects are stubs. Next: BattleUnit, then PassiveSkill.Triggering and the condition
checkers, then a director setup that loads base_data, then run fixtures through it next to src/models.
Port fragments of this session (re-applicable with port_apply.py): E:\unpackedExedra\port_frag\.
Findings for src/models: MathExtension.Floor scale (PITFALLS), RegisterSpecialAttack leaves the act's team at Ally.

## Branches and uncommitted work in E:\exedra-dmg-calc

| ref | state |
|---|---|
| `claude/version-3.19.1` | **Checked out 2026-10-02**, branched from main 7fb9730 (= origin/main; the 2026-10-01 branches claude/verify-priority-3.19, claude/actor-skill-type-3.19 and battle-engine-3.19 are merged and no longer exist locally). 3.19.1 work: verdiff.py / disasm.py / smokeNew.ts / VERSION_UPDATE.md runbook, LOCK_SPECIAL_ATTACK, conditions 22/206/207/313-316, BreakedDamageReceiveRate starts at 0, IMM_SLIP_DMG instant DOT burst. Fixtures 6/6, checkMechanics 18/18 (#10-#14 new, each fails without its change), type-check 229 = baseline set. Not pushed; for the user to merge. |
| `claude/version-3.19.11` | **Checked out 2026-10-07**, branched at 1f3e518 (= main). 3.19.11 report + newsletter, `verdiff.py runs`, docs. No engine change (battle code identical to 3.19.0). Fixtures 10/10, checkMechanics 19/19, type-check 230. Not pushed. |
| `claude/version-3.21.0` | **Checked out 2026-10-15**, branched from claude/engine-1to1 43e093e (the checked-out branch; clean tree). 3.21.0 report + player newsletter, metadata identifier diff, engine re-ported to 3.21.0 (Step-Up, CONSUME_SELF_HP, Link Raid linked HP, Magic Seal AI), new tools meta_idents / decdiff / fields_check / merge_members / ledger --apply-moves, checkEngine321.ts. Not pushed; merge after claude/engine-1to1. |
| `main` | = origin/main 7fb9730 on 2026-10-02. |

`docs/ai/EFFECT_TYPES.md` is committed per branch (its header says which); rebuild with `xq build` after switching
branches or changing the engine. On battle-engine-3.19 `xq build` still lists UNIQUE_BUFF / UNIQUE_DEBUFF /
UNIQUE_10030301 / UNIQUE_10070201 (pure marker states: stored generically, read by conditions 12/26 - nothing more to
do) and UP_BREAK_EFFECT (blocked, open question 1).

## Game 3.21.0 (Steam files 2026-10-15 16:12 UTC, PE build 2026-10-08), compared with 3.19.11

CODE CHANGED and the layout moved. Il2CppDumper + Ghidra were run by Claude on Windows (computer use, launchers
`E:\Il2CppDumper\run_dump.bat`, `E:\unpackedExedra\Ghidra\run_ghidra.bat`): dump in `3.21.0\dump`, decompile in
`3.21.0\decompiled` (5,513 functions). **src/engine is now a port of 3.21.0** (scripts default to it through
`scripts/ai/GAME_VER`): 4,073 moved @rva tags (`ledger.py --apply-moves`), 30 moved field offsets
(`fields_check.py --apply`), new members merged (`merge_members.py`), new types StepUpSkillHandler,
StepUpSkillUnitState, CommandStepUpSkill, StepUpSkillRequest, ConsumeSelfHpAbilityEffect, enums RequestType 16 /
CommandType 34 / CompareContent 117. Logic re-ported: see MECHANICS "Step-Up skills and self HP cost". Of 186
changed functions (`verdiff.py funcs`) ~50 had real changes after `decdiff.py --ignore-offsets --loose`; the rest
is inlining / folding noise. Master data: nothing uses the new mechanics yet. Checks: engine tsc 0,
checkEngine321 7/7 (new), checkFixturesEngine 12/12, engineSweep 400/400 runs ok, engineMultiRaid 600/600 ok,
checkFixtures 12/12 and checkMechanics 19/19 (old engine, unchanged), app type-check 232 (no error in src/engine or
src/battle). Not ported (stubs as before): BattleUnitSkillSet.OnSerializing / OnDeserialized (backup only).
[UNCERTAIN] BattleUnitSkillSet ctor stores stepUpSkills through a helper call (Array.Empty when null?).

## Game 3.19.11 (patched 2026-10-05 18:26 UTC), compared with 3.19.0

GameAssembly code changed only in LotteryMstRecordUnpacker.TryReadByIndex 0x10e0a70 and LotteryMstModel
get_DisplayableLotteryNumberDigit 0x19c2a90 / get_IsSetLotteryNumberUpperLimit 0x19c2b50 (`lotteryNumberUpperLimit`
int -> long); section layout unchanged, so every battle RVA and the 3.19.0 decompile stay valid. Metadata: only the
version literal. Master data: nothing newer than base_data (last download 2026-10-02; 3.19.11 data not downloaded
yet). Smoke run (12 new stages, all 115 kiokus), wikicheck (only the 3 known unknowns): clean. Report and newsletter:
docs/versions/3.19.11/.

## Fixed 2026-10-03: no skill in TurnStart / TurnEnd passes (uncommitted on main)

User report (same Rose Garden run): after Hollow Woman's battle skill the minions had 4/5 Magic and their follow-ups
fired; in-game 2/5, no follow-ups, Tiro Finale next. `fireTiming` now passes no action type to the TurnStart / TurnEnd
passes (and their AfterProcess), as ActExecutor.TurnBegin/TurnEnd do. Fixture extended with the action-3 decisions
(checkFixtures handles a pending manual decision as `<pending: label>`); both new cases fail without the fix.
Lux bench before/after: only Absolute Venus attacker avg changes (158.19% -> 144.59%, max unchanged) - its
AfterProcess follow-up 653410 (IsActor + ActiveSkill + 20 tokens) no longer fires early from the TurnStart pass.

## Fixed 2026-10-03: passive states per giver + UP_HP_FIXED max HP (uncommitted on main)

User report (Rose Garden Witch Extra, solo raid 1407105): HP after the minions' AoE was 8% lower in the sim for every
ally, and Hollow Woman's max HP 460 short. Causes: `storePermanentState` deduped the same passive detail across givers
(two Indomitable Guard++ = one -8%; the game keeps two states, GetDuplicateUnitState b__2 0x15c7d90 compares the giver),
and `updateMaxHp` ignored UP_HP_FIXED (Max HP +420/+40 sub-crys). Both fixed; now exact for all 5 allies.
`checkFixtures.ts` replays PvE exports too; new fixture `rose-garden-indomitable-guard-x2.json` (2 cases).

## Fixed 2026-10-03: duplicate active-skill states (uncommitted on main)

`storeTimedEffect` now removes an existing active-skill state of the same type, giver, role, element and active
condition csv before adding (GetDuplicateUnitState 0x15c8f90). User report: Light of Reckoning showed "special attack
DMG +48%" 3x after one ultimate (follow-ups 652410/652510/652610) -> now 1x. Same detail from another giver gets its own
key. The Max Damage estimate (`MaxDamage.ts` `assignTiers`, `isGameDuplicate`) now puts such duplicates on one tier
ladder, so only the strongest counts (it had LoR at 3 x 35%). checkMechanics #15 (fails without the change), fixtures + mechanics all pass, type-check 230 = baseline.
Open: accum (IBlendable) states from active skills still merge per detail id, not per the b__1 rule; subclass matching
(UpWeakElementDmgAccumRatio < UpWeakElementDmgRatio) approximated by effect type.

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
- 2026-10-16 (3): PvE Max Damage assumed enemy-count conditions met, so Oracle Ray got her >=N-enemies DMG buffs and her <N-enemies extra hits together on every wave. EngineMaxDamage now evaluates AliveUnitCount (202, FriendTeam/OpponentTeam) against the wave / team size (BattleConditionParser.unitCountConditionsMet) for team effects (before laddering, so e.g. a crys ==N ladder keeps only the right rung) and the dealer's own skill rows. Oracle Ray ult per enemy 500,192 -> 375,144 (1 enemy) / 357,280 (5 enemies). Page hint text updated. Fixtures 12/12, mechanics 0 FAIL, type-check 232, sweep clean. LUX_BENCH_VERSION 22.
- 2026-10-16 (2): PvE Max Damage gave Scorchin' Summer Spike's Attacker-only / Boon-holder buffs to every dealer (user report: Glitterjoy Snow Globe). EngineMaxDamage now keeps start EachTarget role/element and active Self role/element/UniqueAbilityEffect conditions (keepHolderConditions) and reports reach only for states that are active on the holder. Probe: Glitterjoy ult crit 171,269 -> 122,837, Attacker dealer unchanged. Fixtures 12/12, checkMechanics 0 FAIL, app type-check 232 = baseline, maxDamageEngine sweep clean. LUX_BENCH_VERSION 21. Old models/MaxDamage (Fight Solver upper bound only) still assumes them met.
- 2026-10-16: 16 Oct download synced into base_data on claude/version-3.21.0 (Venusta Dissonanza: first STEP_UP_SKILL / CONSUME_SELF_HP / content 117 user; Score Attack 29 Sayaka (Anomalia), Link Raid Dessert Witch, Halloween reruns, Mirror Layers 116-120; report docs/versions/3.21.0/data-2026-10-16.md). Engine sweeps ok (Step-Up used on auto); manual menu offers Step-Up options (EngineBattle.decide); wiki condition_parser / wiki_helpers mirror the engine (117 ConsumedHp, STEP_UP_SKILL, CONSUME_SELF_HP, SWITCH_SKILL v1/v2, *_TURN_IMM v3), wikicheck SYNC COND check. Old src/models engine: Venusta deals 0 DMG there (Fight Solver only).
- 2026-10-15 (3): ran Il2CppDumper + Ghidra on the user's Windows desktop (File Explorer double-click on .bat launchers), re-ported src/engine to 3.21.0 (Step-Up skills, self HP cost, Link Raid linked HP, Magic Seal AI, 4,073 RVAs); newsletter rewritten for players; skill + runbook updated.
- 2026-10-15 (2): game 3.21.0 (scheduled run): GameAssembly code changed and moved (needs Il2CppDumper/Ghidra); metadata names Step-Up skills, CONSUME_SELF_HP, Link Raid EX character bonus, none used by data yet; no new content. Report/newsletter/idents in docs/versions/3.21.0 and E:\unpackedExedra\3.21.0\version_report. Branch claude/version-3.21.0.
- 2026-10-07 (3): PvE Simulator page: "Actions" card above the Fight Solver (`actionSteps` in PvESimulatorPage.vue): one scrolling row of the allies' inputs (Ult / Skill / Basic + picked target, extra actions marked), numbered like the timeline, R/Wave markers, pending decision chip, Copy as text. For replaying a run in game.
- 2026-10-07 (2): manual turn prompt: ultimates fired from it run before the turn unit's gauge reset, and the TimeForward between-acts requests (endless refill, Vanguard) run after each (`PvPTeam.betweenActsHook`, set in `PvPBattle.bindSnapshotHooks`), so an ult that wipes the minions keeps the turn. Fixture pve-rose-garden-own-ult-refill.json (fixtures 15/15). Also traced two reported tie orders: both were a missing Heroic Grace++ on Floral in the sim build.
- 2026-10-02 (2): scheduled task made manual; `unpack_version.sh` + senbei-linux unpack the Steam install in the VM; wiki condition_parser.py / wiki_helpers._formatValue updated (real content names, ids -> names, % units, 212/403/313-316, value slots) + `scripts/ai/wikicheck.py`; engine contents 28/30/212/403 (checkMechanics #14). The 2026-10-02 download (Aqua Tempest, Link Raid Darkness Witch, Sorana event) is in ma-ex-data manifests but NOT in base_data yet: report docs/versions/3.19.1/data-2026-10-02.md.
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
- 2026-10-02: Kioku Grid beta charts: Length toggle Fast/Medium/Slow = 5/10/100 turns (500/1000/10000 AV, setting
  `gridBenchSpeed`, default Fast; AV is in the cache setup key so each length is cached separately, MAX_SETUPS 24).
  Average Damage = one battle with expected crit damage (`BattleRng.expectedCrits`, [APPROXIMATION]); falls back to the
  10-seed mean when the battle rolls anything else or reads crits (CTD_UNIT_COUNT): 22/76 5* kits at 500 AV. Expected
  vs 10-seed mean within 1% (median 0.1-0.2%) for the rest. Dummy SPD 1 -> 0.1 (they acted at ~9999.99 AV in a Slow
  run). LUX_BENCH_VERSION 8. Fixtures/mechanics 24 PASS, type-check 229 = baseline. Probe: debugging/probeExpectedCrit.ts.
- 2026-10-01: Kioku Grid beta "(battle engine)" charts (LuxBench.ts + luxBenchWorker.ts); BattleEvent.sourcePos /
  vortex, BattleRng.draw hook + BattleOptions.rng, computeMaxDamage onlyPos, skill-detail index in getDetails /
  triggerFua (~5x faster sims). Fixtures 6/6, type-check 231 (baseline 232). No game-rule change.
- 2026-09-30 night: applied the 2026-09-27 stash, fixed a CsDecimal.fromInt crash (effect-value-scaled FIXED break states), finished the Solo Raid UI check, committed; MISSING_AND_UNCERTAIN.md revision 10.
- 2026-09-30 evening: rebased battle-engine-3.19 onto origin/main; Time Stop Strike Magic already right on the
  engine branch (bug only on main: AND of condition sets); added fixture time-stop-strike-magic.json + line checks
  in checkFixtures.ts.
- 2026-10-07 (solver): `SolverOptions.search` "best" (default on page + CLI `--search best|dfs`): global best-first heap on (dev, est), no beam pre-pass; "dfs" = old sweep. General tactic `spreadBreaks` (page Tactics > General, CLI `--break-spread`): soft `dev` penalty for breaking several enemies in one action / breaking while break-advance recipients (HASTE on break: Fatebloom A4, Heroic Grace) sit at 0 AV; wins/checkpoints never penalised. `maxBranch` job option (`--max-branch`). Rose Garden 1407105 case (debugging/solver-case): dfs 0 checkpoints vs best-first 23 in ~1.7k nodes. No game-rule change; fixtures not run (solver only), type-check: no errors in FightSolver*.
- 2026-10-07: Fight Solver UI: "Import tactics" (reads the Export tactics file or a bare {goals,strategies}); "Max depth" option
  (SolverOptions.maxDepth, CLI --max-depth: a node N decisions deep becomes a "cap" leaf). No game-rule change.
- 2026-09-30: built docs/ai + scripts/ai/xq.py; skills proposed; no engine change.
- 2026-09-27: kit mechanics + full Solo Raid (stash@{0}, unfinished).
- 2026-09-26: EX crys magic (trigger order, TurnNum), RNG modes, manual PvE, exports, ailments, summons, link HP,
  countdown, form change, heal/EP/roll formulas (commits on battle-engine-3.19).
- 2026-09-25/26: 3.19 decompile pipeline, decimal damage, break, passives rework, turn priority, Cutaway, PvE engine.
