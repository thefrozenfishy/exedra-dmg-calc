# Status (update at the end of every session)

_Last updated: 2026-10-29 (3): Best SA Team calculator speed (~60x on a large search); before: 2026-10-29 (2): Kioku Grid "Multiple ascensions", merged equal variant bars, precalculated bench file; before: 2026-10-29: Kioku Grid bench gear + average Attacker self buffs on Lux; before: 2026-10-24 (3): second-generation engine and Fight Solver removed (branch `remove-gen2`); before: 2026-10-24 (battle-start passive order: kit -> portrait -> support -> crys; before: Kioku Grid ailment bars: 112/305/309 conditions, Max Damage enemies carry Weakness/Stun); before: 2026-10-15 (game 3.21.0: dumped + decompiled by Claude on Windows, engine re-ported to 3.21.0; branch claude/version-3.21.0); before: 2026-10-14 (Max Damage + Kioku Grid bench on the 1:1 engine); before: 2026-10-10 (1:1 port in src/engine started); before: 2026-10-03 (passive states per giver, UP_HP_FIXED max HP; earlier: duplicate active-skill states); before: 2026-10-02 (game 3.19.1: version diff + newsletter, Magic Seal, break/notice team conditions, IMM_SLIP_DMG burst; branch claude/version-3.19.1)._


## 2026-10-29 (3): Best SA Team calculator speed

User report: Best Team Finder very slow with every option on and 15% pruning. Measured on debugging/characters.json,
Aqua, off-element supports allowed (2 attackers, 19 380 rosters each), in-process scorer:
- Before: 188 ms per team score, 40 277 scores (38 760 in Phase A) = ~2 h of single-core work.
- After: ~45 ms per score, 2 610 scores (1 093 in Phase A); the 1 539 result rows are identical to the exhaustive run.

Changes:
- `EngineTeamScore` passes `scoreOnly` + new `MaxDmgOptions.onlyUltimate` (EngineMaxDamage evaluates only the
  SpecialAttack column; no Battle Skill / Basic Attack / Switch Skill / follow-up runs, no blend-group or reach
  battles). runOnce 15.6 -> 3.5 per score; scores identical on a 24-team sample.
- `PvPKioku.addEffect` looks rows up through an index (`detailRows`) instead of scanning all passive details per
  call: a new PvPKioku went from ~150 ms to ~1 ms (each worker builds its own).
- Engine (app-side perf hint, same records same order): `BattleMstModelRepositoryBase.GetModel` honours `indexHint`
  like GetModelList; `QuestJudgeResultReferee.ctor$int_int` and `WaveReferee.Init` hint `questStageMstId`. These two
  scanned the whole QuestEnemyAppearance table in every createDirector (~30% of a score). Bundle content identical
  apart from those lines; fixtures 16/16; engine tsc 0; ledger unchanged.
- Phase A screening ([APPROXIMATION], `EngineBestTeam.screenRosters`, option `screenRosters`, page checkbox "Smart
  screening", default on, only with Fast search and > 400 rosters per attacker): score a seeded random sample
  (max(120, 3 x members)), fit log(estimate) = bias + one weight per member (ridge least squares), score every roster
  predicted within margin + max(2 sigma, 5%) of the best, refit, repeat until nothing new; survivors are chosen from
  real scores as before. Offline on the full Phase A of both attackers, 30 seeds each: every exhaustive survivor
  found every time with ~550 scores instead of 19 380.

Follow-up the same day (user asked for the remaining ideas):
- `scoreOnly` Max Damage builds the skill pickers' battle under the crit hook and hands it to the member's first
  crit run (`Ctx.spare`) instead of building another: createDirector 4.5 -> 3.5 per score. Identical scores on 184
  sampled teams over 5 elements.
- `MaxDmgOptions.critOnly` / `scoreTeam(..., maxOnly)` / `TeamScorer(team, maxOnly)` (pool + worker carry it):
  estimates (Phase A, slip prepass) skip the non-crit run when optimizing max and `max` doesn't read it (stage, or
  every enabled enemy row crit). A full score answers a max-only request, never the reverse (memo).
- Phase B supports' supports: options are the assignments one support change or two-slot swap away from the
  current one, not the whole joint list ([APPROXIMATION]).
- Bug (user): one row per distinct team. Loadouts differing only in a choice the team ignores (a slip support's
  supports-of-support come from its preset) made identical rows; 5 obligatory Kioku showed one team 12 times.
- Check, Aqua / Flame / Dark off-element (7 attackers) against the previous version: every surviving team's best
  score identical; scores 2610 -> 2204, 2885 -> 2648, 3638 -> 3236. Fixtures 16/16, vue-tsc same as before.

## 2026-10-29 (2): Kioku Grid "Multiple ascensions", merged bars, precalculated bench results

- "Simulate using" has a third mode (setting `gridLevelsMode`: max / mine / multi, replaces `gridSimulateMaxLevels`):
  every character at each selected ascension (`gridMultiAscensions`), results keyed by `benchKey` = id * 10 + asc;
  neighbouring ascensions with the same displayed value share a bar ("0-2"). "My Kioku" / multi show the ascension
  on the icon (`.gain-asc-badge`).
- Variant bars of one character with the same value that differ in one tag merge (`mergeEqualVariants`): Cherry
  Ballad "Dark/Light", one icon cut on a slant; element order Dark, Forest, Light, Void, Flame, Aqua.
- `scripts/sim/benchPrecalc.ts` (`npm run bench:precalc`) writes `public/bench-precalc.json` (version-tagged, resumable,
  child processes); the page loads it first and only simulates what is missing. Shipped so far: 1 enemy, Fast,
  A0-A5, both charts (1356 of 1380 entries).

## 2026-10-29: Kioku Grid bench gear + average Attacker self buffs on Lux (user's choice)

- Every unit the bench measures and the dealer / reference Lux now wear the same gear (`LuxBench.benchKioku(args, as,
  gear = true)`): EX crys + Towering Offense++ (Towering Bulwark++ when the kit's damage rows are mostly DMG_DEF:
  Vampire Fang, Baldamente Fortissimo, Soaring Storyteller), the element's ++ crys (the identity's element for Lux),
  Dominant Blow++, portrait Farewell to a Future Unseen, support The Universe's Edge (A5 max; target Attacker, so it
  only works on Attackers / Attacker-identity Lux). Filler Lux stay bare (their gear only acts on themselves).
- Dealer / reference Lux also get `averageAttackerSelfBuffs(enemies, levels)`: the 20 five-star Attackers' self buffs
  (collectTeamEffects, caster = dealer, `applies`, strongest ladder rung) per type and skill restriction, sum / 20.
  Ultimate / Battle Skill only -> condition sets 317 / 316; follow-up / Ether Blow only and kit-unique states left out;
  enemy-count conditions per run (`unitCountConditionsMet`). Given as a made-up crystalis-like passive
  (`EngineBench.benchPassive`, ids 1990001+), also pushed to `effects` because Max Damage clears battle-start states
  and re-gives passives from the effect list.
- Support passives follow the identity (`matchSupportToIdentity`): PvPKioku checks the support target against the
  unit's own role / element, NetworkUnits against the identity's `data`.
- Effect (1 enemy, Fast): Lux baseline x11.3 Max Burst / x14.7 Average Damage; attacker chart avg 5 star Attacker
  +465% -> +80% (Max), support chart buffers shrink ~0.55-0.65x, debuffers unchanged. benchOne matched the experiment
  (`results/geared-lux/`, git-ignored) exactly. LUX_BENCH_VERSION 30.
- Verify: vue-tsc 222 (none in changed files); checkFixturesEngine 16/16; no src/engine change.

## 2026-10-24 (3): second-generation engine and Fight Solver removed (branch `remove-gen2`)

- User decision: drop the Fight Solver (hidden PvE Simulator panel, `localStorage.solver = "show"`) rather than port
  it, and remove the second-generation "best effort" engine it was the last runtime user of.
- Deleted: `src/models` PvPTeam, PvPBattle, UnitStateEngine, DamageCalculator, AITargetSelector, BreakPoint,
  StateInterfaces, BattleClone, FightSolver* (+ `components/FightSolver.vue`, `workers/fightSolverWorker.ts`); the old
  `computeMaxDamage` (MaxDamage.ts), `createPvEBattle` / `enemyKiokus` (PvEBattle.ts), the enemy AI in PvE.ts
  (`EnemyKioku`, `enemyParams`, `selectEnemySkill`), the live condition checker in BattleConditionParser.ts and
  `BattleState` (KiokuTypes.ts); scripts checkFixtures, checkMechanics, compareEngines, compareFormula, fightSolve,
  maxDamageEngine, replayExport, runPvE, runPvp, smokeNew, solvePvE, .probe_tieprio; `debugging/solver-case/`.
  PvE page: solver buttons / hand-off; BattleTimeline's per-action button; `EngineBattle.applyControl` /
  `aiTargetSides`.
- Moved: `BattleType` -> `types/enums.ts`; `RaidCarry` -> `battle/EngineBattle.ts`; `friendlySkills` / `enemySkills` +
  `isFriendlyEffect` / `isOpponentEffect` -> `models/EffectSide.ts`; `src/models/*.md` notes -> `docs/ai/legacy/`.
- Verify: vue-tsc 242 -> 222 (only change: the moved `BattleType` const enum's erasableSyntaxOnly error now in
  enums.ts); engine tsc 0; checkFixturesEngine 16/16.
- Follow-up: `xq` engine coverage (EFFECT_TYPES.md "TS" column, `xq effect` "TS engine references") still scans
  `src/models` + `src/utils`, so after `xq build` most types read MISSING. It needs to read coverage from `src/engine`
  (factory entries / `notPorted` methods) before VERSION_UPDATE.md step 6 can use it.

## 2026-10-24 (2): battle-start passive order (Structure Destruction's starting MP)

- User report (PvP sim): Structure Destruction started at 85 / 85 / 90 MP instead of the in-game 79 / 79 / 85. The 1:1
  engine's made-up server passive list (`src/engine/adapter/NetworkUnits.ts`) had crystalis second, so her crys'
  +10% MP recovery applied to her ascension-2 +50 MP. Now kit (ability, ascensions) -> portrait -> support -> crystalis
  (AbilitySourceType order; relative order of the last three [UNCERTAIN]). Side effect: barriers given at battle start
  are computed before crys DEF ups. Confirmed in game (PvE): Vampire Fang DEF 5,083 -> 2288/3813 (45% / 75%); the
  sim's PvP 1,144 is that halved (fixture pvp-battle-start-barrier-vampire-fang.json).
- Fixtures: `pvp-battle-start-mp-*.json` (3), asserted by `checkFixturesEngine.ts` on the initial state (action 0,
  `actor` optional). Engine fixtures 16/16; old `checkFixtures.ts` 12/12 (old engine unchanged, still crys second);
  checkMechanics 0 FAIL; engine tsc 0; app vue-tsc 242, none in changed files. benchOne (SD, Glitterjoy, Tiro) unchanged;
  LUX_BENCH_VERSION 27 anyway (bench kits with EX crys may move).

## 2026-10-24: Kioku Grid ailment bars (Sacred Gift had no Weakness bar)

- `ailmentConditionType` now covers compare contents 112 / 305 / 309 besides 12 / 205; `ailmentConditionsMet` checks
  305 by state prefix (the damage part counts as met) and 309 like 205. New ailment bars: Sacred Gift (WEAKNESS),
  Yuletide Gift (BURN).
- Max Damage with `enemyStates` puts WEAKNESS / STUN on the enemies for real (`EngineBench.giveAilmentStates`), as the
  Average Damage bench's `keepAilment` already did (5x Lux Ultimate +11.07% with Weakness in both metrics now).
  Also affects EngineTeamScore (Best SA Team) when the enemy row has Weakness.
- Max Burst now applies the same immunities as Average Damage (`benchImmunities`; team effects giving an immune
  ailment are excluded), so a kit's own ailment shows in its ailment bar in both metrics.
- Sacred Gift applies 2 Weaknesses (Battle Skill + ability "on enemy break, weaken all enemies"; different origins, they
  stack). Average Damage dummies now start unbroken (1-point gauge) so the first hit breaks them and on-break effects
  trigger once, for every kit. Support chart (1 enemy): Max 30.00% / Weakness 60.35%; Average 20.41% / Weakness 48.53%.
- LUX_BENCH_VERSION 26.

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
| `main` | = origin/main 0643b138 on 2026-10-24. The `claude/*` branches (engine-1to1, engine-best-team, version-3.19.1, version-3.19.11, version-3.21.0) are all merged into it. |
| `remove-gen2` | 2026-10-24, from main 0643b138: second-generation engine + Fight Solver removed (entry above). |

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
- 2026-10-29 (4): Best SA Team: reuse of the pickers' battle, max-only estimates, neighbour moves for supports' supports, one row per distinct team (duplicate rows with obligatory Kioku).
- 2026-10-29 (3): Best SA Team ~60x faster on a large search: Ultimate-only team scores, PvPKioku row index, indexHint in two createDirector scans (engine, perf only), model-guided Phase A screening ("Smart screening"); identical result rows vs the exhaustive search on Aqua off-element.
- 2026-10-27: Kioku Grid damage-dealer chart: one baseline for every role again, Lux with the average 5 star Attacker
  stats (the per-role baseline made a Defender's 0% a third of an Attacker's; Baldamente showed +386%, now +48%).
  LUX_BENCH_VERSION 28.
- 2026-10-25 (2): Best SA Team (engine) page drops Buff / Debuff Bonus Reduction (incl. off-element) and Stage Buffs (user: no longer needed): BestTeamPage no longer shows DamageReductionInputs / ArenaBuffs (Attacker HP input moved onto the page), TeamScoreScenario loses arenaEffects / weakElements / *MultReduction and EngineTeamScore.teamFieldStates is gone (only the enemy row's DEF up / DMG taken down remain as field states). Old pages keep both components. Kugatachi probe unchanged (65,803 / 61,147).
- 2026-10-25: Best SA Team (engine) honours "Attacker HP when using ultimate" (it was ignored: every condition met). MaxDmgOptions.dealerHpPercent (EngineTeamScore passes TeamScoreScenario.attackerHp from scenarioOf): buildBattle sets the dealer's _HP to ceil(MaxHP x %) (again after giveEffects, which can raise MaxHP) and clearConditions keeps HPRatio (CompareContent 2) conditions on Self / Actor - start conditions only for effects the dealer casts and its own skill rows, active conditions always (holder) - so the game's checker (CalculationHpRate 0x13AA310) decides. Other allies stay at full HP with their HP conditions met; EachTarget HP conditions still assumed met. PvE Simulator Max Damage unchanged (option not passed). Probe Kugatachi alone, Flame dummy DEF 3000 broken: 100% / 50% = 65,803 (ATK 4093, SPD 117), 49% / 10% = 61,147 (ATK 3803, SPD 99.8: Assault Haste's ATK >=50% and SPD >=80% off). Fixtures 16/16, no app type errors in the changed files.
- 2026-10-24 (7): PvE Simulator gets the Old Single Hit Calc's "find best attacker loadout" anvil buttons (max / avg) on the engine: models/EngineAttackerLoadout (same candidates as findBestAttackerLoadout: portraitsBestOnly, highest-ATK + element/role support targets, 3-sets of getBestCrystalises with locked crys kept, plus the current loadout), coordinate ascent support -> portrait -> crys set (max 3 passes, as EngineBestTeam) instead of the full product, scored by the page's own Max Damage (same stage / wave / effect choices; dealer's strongest column crit or avg) in a worker pool (maxDamageWorker "loadout", MaxDmgOptions.scoreOnly: no follow-ups / blend groups / reach bookkeeping; identical numbers, 0.5 s vs 2.7 s). And a collapsed-by-default "Stats for nerds" section (setting pveStatsForNerds): DMG Calculation / Enemy Stats / Kioku Stats from MaxDmgOptions.trace = the dealer's best column run once more with every hit a crit while battle/EngineDamageTrace wraps BattleDamageCalculator's static steps (no engine change). Probe stage 982250 Aqua team: per-enemy traced hit sums == the column's crit totals (3,726,590); loadout search 49 scores, 5,880,105 -> 8,924,682. Fixtures 16/16, engine tsc 0, no app type errors in the changed files.
- 2026-10-24 (6): PvE Simulator Max Damage merges the effect cards that feed one stack counter: EngineMaxDamage.blendGroups gives every effect once in a scratch battle and watches UnitCondition.AddUnitState from outside (no engine change): a state not added whose GetDuplicateUnitState is IBlendable and was created by an earlier effect of the same caster joins its group (MaxDmgEffect.blendGroup). The card shows every id / source / condition, toggles and sets stacks for all (stacks: first effect gets them, the others 0). On the user's export: Melodia's 13 UP_ATK_ACCUM_RATIO rows -> 1 card, Yuletide's Battle Skill + ability + ascension Yuletide Trouble rows -> 1 card; damage unchanged (3,655,920), card off = 3,591,918. checkMechanics 19/19, checkFixtures 12/12.
- 2026-10-24 (5): PvE Simulator Max Damage effect cards show the skill detail id (click copies) and S/A condition set ids, as the old single hit calc. Checked a user export (Rose Garden Witch (Crisis), Atomo / Melodia / Marigold / Yuletide / Aqua Tempest) for duplicate same-text effects: none are double counted. Same-text rows are distinct detail rows (per-trigger rows 315/316/317, enemy-count thresholds 2171-2175, debuff-count tiers 3216/3390-3392, separate conditions 2203/2245) and giveEffects hands each to the game's AddUnitState, which blends accum/unique states: Melodia's 10 ability + 3 ascension UP_ATK_ACCUM_RATIO rows are ONE state (ability-only = ascension-only = all = 3,655,920; both off 3,591,918), Yuletide's ascension UNIQUE_DEBUFF_ACCUM blends into the ability one (no change when off). The cards still list every row.
- 2026-10-24 (4): Best SA Team (engine) slip supports (vortex users; DoT appliers when the attacker has IMM_SLIP_DMG) get a preset from a prepass instead of the hardcoded EX + Towering Offense++ + Dominant Blow++ / The Savior's Apostle (user's rule, [APPROXIMATION]): per attacker, attacker (first loadout) + that support alone, coordinate ascent over its support, portrait and 3 crystalis (relevantCrys); the main search uses the preset (next best support when the best one is on the team). Result rows [21..24] carry every support's crystalis and the row shows the preset portrait/support, so "Open team in PvE Simulator" equips the same. Finding: the prepass prefers Farewell to a Future Unseen over The Savior's Apostle by ~1% on every DoT applier tried (Marigold Dadaism, Flame dummies) - check whether The Savior's Apostle's DoT effect counts in engine Max Damage.
- 2026-10-24 (3): engine Max Damage never gave DoT ailments (collectTeamEffects isState dropped BURN/POISON/CURSE/BLEED), so IMM_SLIP_DMG (My Creations ult) popped nothing. EngineMaxDamage now collects them (collectTeamEffects slipDamage option; the old model is unchanged), gives ADD_BUFF/DEBUFF_TURN before other states (turns added at give time), and gives the self-only buffs of a DoT owner to that owner when the dealer's kit has IMM_SLIP_DMG (forVortex -> forOwner). PvE page: those owner buffs are blue (dark red for debuffs), hidden unless 'Show support buffs' (setting pveShowSupportBuffs, default off), counted either way. Probe stage 1208120, My Creations + Atomo Arrabbiato: ult 37,618 -> 102,163, 116,608 with Towering Offense++ + Intensification++ on Atomo; My Creations solo 21,107 -> 33,971. Fixtures / mechanics 0 FAIL, type-check 242 unchanged. LUX_BENCH_VERSION 25.
- 2026-10-24 (2): user report: Melodia's crystalis didn't change Max Damage. A vortex pops through its owner's pipeline (GetSlipDamageResult 0x13A7580 attackUnit = state._UserUnitId; owner's processed ATK, DMG dealt, ongoing / vortex DMG dealt), but Max Damage dropped every self-only buff of a non-dealer. EngineMaxDamage now gives the self-only buffs of members whose vortex counts to them (MaxDmgEffect.forVortex, shown as used on the PvE page). Probe stage 1208120 (user's team, Floral Ironspike dealer): ult 5,693,008 for any crys -> 5,868,914 none / 6,013,613 EX+Intensification+Heroic Grace / 6,027,963 EX+Towering+Intensification. Fixtures / mechanics 0 FAIL, type-check 242 unchanged. LUX_BENCH_VERSION 24.
- 2026-10-24: Vortex rules for the engine Max Damage (user's rules, app side, [APPROXIMATION]): a given vortex always pops (EngineMaxDamage.giveEffects sets RemainAttackCount 1, so the evaluated skill's first hit sets it off); a vortex user's vortex counts from one skill by default (vortexOffByDefault: dealer = Battle Skill's, other member = Ultimate's; the other is MaxDmgEffect.defaultOff, back on via MaxDmgOptions.included = the PvE page's toggle, saved in PvESetup.included). Best SA Team (EngineBestTeam): vortex users in support slots get Savior's Apostle + EX + Towering Offense++ + Dominant Blow++, a Debuffer's support-supports whatever their role, the highest ATK 5* support when none is available, and the portrait hint always. Probe stage 107208, Melodia + Aqua Tempest: Melodia ult 1,835,041 -> 1,602,870, Aqua Tempest ult 601,315 -> 835,586. Fixtures 0 FAIL, mechanics 0 FAIL, no type errors in the changed files. LUX_BENCH_VERSION 23.
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
