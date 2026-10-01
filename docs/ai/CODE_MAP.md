# TS engine code map (src/models)

Function names, not line numbers (lines drift). Find any symbol with `python3 scripts/ai/xq.py ts <name>`
(add `--branch battle-engine-3.19` when another branch is checked out). Described as on branch
`battle-engine-3.19` (main has an older subset, see STATUS.md).

## Files

| File | Game counterpart | Contents |
|---|---|---|
| `PvPBattle.ts` | GameDirectorBase / TurnActSystem | Battle driver. ctor = InitializeBattle (setup, gauge reset, battle-start passives). `executeNextAction()` = one turn/ultimate -> snapshots. Waves, start-timing acts, endless supply, form change, manual ultimate window, Solo Raid attempt state (stash). |
| `PvPTeam.ts` | BattleUnit, UnitCondition, ActExecutor, AbilityEffects | `KiokuState` (= BattleUnit: HP, gauge, states, break, EP/"MP", turnNum) and `PvPTeam` (a side: turn flow, targeting, passive dispatch, follow-ups, summons, link HP, mode change). `KiokuState.applyEffect` is **the effect dispatcher**. |
| `PvPKioku.ts` | CharacterParameter + PassiveSkills list | Builds a character's effect list from kioku_data (+crys, ascension, portrait, support). `effects` (stat order: crys first) and `triggerOrderEffects` (ability -> crys -> rest). |
| `PvE.ts` | QuestEnemyAppearanceParameter, WaveReferee, EnemyConditionAndActionController, UnitBrain | Enemy units (`EnemyKioku`, `enemyParams`), stage/wave tables, summons templates, mode change infos, enemy skill choice `selectEnemySkill`, `startTimingSkills`. |
| `PvEBattle.ts` | SoloGameDirectorBase setup | `createPvEBattle(allies, stageId, seed, firstWave, opts)`, `stageBattleType`. |
| `DamageCalculator.ts` | BattleDamageCalculator | `getAttackDamageResult` = GetAttackDamageResult pipeline (each step its own exported fn), `getSlipDamageResult` (DOT), `getAdditionalDamageBase`, barrier/shield cuts, `PVP_POLICY`, `BattleType` enum. |
| `BattleMath.ts` | System.Decimal (.NET Core DecCalc) | `CsDecimal` exact decimal: `dec.float(x)` = (decimal)float (7 sig digits), `dec.int`, `.mul/.div/.add/.sub/.ceil/.floor/.toFloat()`. |
| `UnitStateEngine.ts` | BattleUnit.GetProcessedX, UnitStateBase.GetProcessedProbability, HpRecoveryCalculator, EpCharger | Stat processing (ATK/DEF/SPD decimal, crit f32, give/receive/element/weak/shield/final-damage variations), state-add roll `rollAppliesEffect`, heal/EP rates, accum merge `mergeAccumEffect`, `isEligibleForEffect` (CanAddTo), `getMaxComboActionNum`, `getThreatWeight`. |
| `BattleConditionParser.ts` | BattleCondition.* checkers | Enums `ProcessTiming`, `CompareContent`, `CompareOperator`, `CompareTarget`; `checkUnitCondition` / `checkTeamCondition` / `checkOtherCondition` (one `case` per content), `isMatchCondition` (target dispatch), `isConditionSetActive*`. |
| `BreakPoint.ts` | BreakPoint, DamageAbilityEffectBase break parts | Break decrease tables, `calculateProcessedBreakPointDamage`, `decreaseBreakPoint`, `increaseBreakedDamageReceiveRate`, `SkillType`. |
| `AITargetSelector.ts` | AISkillTargetSelector, UnitBrain.TargetingUnits | Unit filters (`filterByBreak`, `filterWithMaxAtk`, role weights, hate), `selectTargetUnitInOrder`, per-effect filter orders. |
| `BattleRng.ts` | (sim only) | Every random decision: modes seed/hit/miss/weighted/manual, `chance`, `choose`, `pickTarget`, `PendingDecision` (manual PvE picks), recorded `RngEvent`s. Subclasses can override `draw(kind, label)` (the seed-mode uniform draw); `PvPBattle` takes one via `BattleOptions.rng`. |
| `EffectTargetSide.ts`, `StateAddFilter.ts` | generated from the dump | Target side per effect type; CanAddTo role/element filter class per state. Regenerate, don't hand-edit. |
| `MaxDamage.ts`, `PvEScore.ts` | - | Max-damage estimate page, score estimate. `computeMaxDamage(..., { onlyPos })` evaluates one member only. |
| `LuxBench.ts` | - | Kioku Grid beta charts: Lux☆Magica (A0) bench against 3000-DEF dummies (weak to all, broken 500%, SPD 1). `ultimateDamage` (Max Burst via computeMaxDamage), `simulatedDealerDamage` (auto battle for N AV, counts only the dealer slot's `hit`/`dot` events by `sourcePos`, minus popped `vortex`; per-label RNG streams `LabelStreamRng`), `kitRestrictions` (elements/roles a kit's effects are limited to), `LuxBenchCharts` (support/attacker gains, baselines cached). Run in `src/workers/luxBenchWorker.ts`. |
| `ScoreAttackTeam.ts`, `ScoreAttackKioku.ts`, `Kioku.ts`, `BestTeamCalculator.ts` | - | The OLD closed-form Score Attack calculator (Best SA Team / Single Battle pages). Not the engine. Useful hints only. `Kioku.ts` is the base class of PvPKioku (stats). |

Type lists at the top of `PvPTeam.ts`: `friendlySkills` / `enemySkills` (effect types by side, the "RECOGNIZED ONLY"
comment there predates 3.19 and is outdated), `ALIMENT_PREFIXES`, `ACCUM_RATIO_EFFECT_TYPES`. Being listed there is
not an implementation (`xq effect` marks such types "LISTED ONLY").

Types: `src/types/KiokuTypes.ts` (`SkillDetail`, `TargetType` = "SpecialAttack"/"ActiveSkill"/"NormalAttack"/
"AdditionalSkill"/"INIT", `targetRange` SELF -1 / TARGET 1 / PROXIMITY 2 / ALL 3, `BattleState`, `AffectedUnitNotice`,
`BattleSnapshot`, `BattleEvent`), `src/types/enums.ts` (Ailment, elements, roles).
Data access: `src/utils/helpers.ts` (`kiokuData`, `skillDetails`, `skillDetailsByMstId`, `passiveDetails`,
`passiveDetailsByMstId`, `crystalises`, `portraits`...).

## One turn, as the engine runs it

```
PvPBattle.executeNextAction()
  opening (first call only): battle-start follow-ups (triggerFua), enemy start-timing acts (runStartTimingAction)
  team2.useUltimate() / team1.useUltimate()  (manual: manualUltimateWindow)      -> SpecialAttackAct, no turn tick
  else traverseToNextActor()  (TurnReferee.ShiftNextTurn: subtract min gauge time, compareTurnOrder)
       actorTeam.useAttackOrSkill()                                               = TurnBeginAct+TurnUnitAct+TurnEndAct
          actor.exitBreak(); actor.tickHotEffects()                               (TurnBegin: break recovery, HoT)
          fireTiming(TURN_START)
          actor.resetDistanceRemaining()                                          (gauge reset before the act)
          for each combo step (getMaxComboActionNum):
             enemy: selectEnemySkill(...) ; ally: SP -> skill else basic (manual: chooseAllyAction)
             performAction(actor, type)
                resetActionTallies(); act() -> completeAction(details) -> per detail: sliceTargets + applyEffect per target
                fireTiming(ATTACK_END, ..., recordAction = snapshot) ; triggerFua(follow-ups)
                pendingBonusTurns (ADDITIONAL_TURN_UNIT_ACT extra actions) loop
          fireTiming(TURN_END); triggerCutoutAtTurnEnd(); decrementActiveEffects(); actor.turnNum++   (PassingTurn)
  resolveEndOfTurn(); formChange()
fireTiming(timing): both teams applyPassivesForTiming(timing) then AFTER_PROCESS, recomputeDerivedStats, follow-ups.
```

## Where to hook a new mechanic

| Kind of mechanic | Hook |
|---|---|
| New **stat-modifying state** (ATK/DEF/SPD/crit/give/receive/resist...) | `UnitStateEngine.ts`: the matching `atkDefUp/Down`, `critUp/Down`, `GIVE_DMG_CLASSES` / `RECEIVE_DMG_CLASSES`, `getProcessedElementResistRate`... Keep Up pass then Down pass. |
| New **instant ability effect** (heal, EP, haste, remove, summon...) | `KiokuState.applyEffect` in PvPTeam.ts: add a branch near similar ones (`=== "HASTE"`, `RECOVERY_HP`, `COUNTDOWN_START`...). Return a skill id to queue a follow-up. |
| New **state with behaviour** (timed buff/debuff stored on the unit) | falls through to `storeTimedEffect` / `storePermanentState` (roll, merge, `updateSpd`); special behaviour where it acts (damage step, turn end, removal hooks `onStateRemoved`). |
| Something that happens **per damage hit** | `applyEffect` `DMG_` branch (ADDITIONAL_DAMAGE loop, final damage, break, countdown, mode-change cut). Pipeline math in `DamageCalculator.getAttackDamageResult`. |
| New **condition content** | `BattleConditionParser.ts`: add to `enum CompareContent` (names from `xq enum CompareContent`) and a `case` in the unit/team/other checker matching the game checker's case. |
| New **timing** or passive trigger rule | `PvPTeam.fireTiming` / `applyPassivesForTiming`; battle-start order in `PvPKioku.triggerOrderEffects`. |
| **Enemy AI** / stage rules | `PvE.ts` (`selectEnemySkill`, `enemyParams`), `PvPTeam` (summon, link HP, mode change), `PvPBattle` (waves, start acts). |
| **Targeting** | `PvPTeam.sliceTargets`, `AITargetSelector.ts`, `actionPrimaryTargets` (one opponent + one friendly target per skill). |
| **Random** anything | Always through `this.team.rng` / `rollChance` / `rollChoice` with a readable label (manual mode and exports depend on it). Never `Math.random()`. |

Conventions: comment every game rule `// [CONFIRMED 3.19] Class.Method (0xRVA): what it does`; `[UNCERTAIN]` /
`[APPROXIMATION]` otherwise. `f32 = Math.fround` for float32 steps. Keep the game's evaluation order even when
it looks redundant.

## Pages and UI

| Route | Page | Engine use |
|---|---|---|
| `/pvp-simulator` "PvP Simulator" | `src/pages/PvpTeamPage.vue` | PvPBattle; RNG modes (`RngControls.vue`), export/import (`src/utils/pvpExport.ts`), `BattleTimeline.vue` |
| `/pve-simulator` "PvE Simulator" (beta only: `isBeta()` in `src/utils/betaSettings.ts`, toggled on `/beta`) | `src/pages/PvESimulatorPage.vue` | createPvEBattle, stage picker (`StagePicker.vue`), Auto/Manual control, Solo Raid panel (stash); saved/shared teams (`store/savedTeams.ts`, kind `pve`) carry the whole setup incl. decisions (`utils/pveSetup.ts`); Max Damage runs against the wave's start units only (`waveStartUnits`: endless waves list backups beyond 5), effect cards are grouped by `MaxDmgEffect.source` (passives resolved to Ability/Ascension/Crystalis/Portrait/Support) and use `utils/effectText.ts` + `MaxDmgEffect.reach`; RNG mode `weighted` = rolls happen iff p >= 50% |
| `/sa-simulator-single` "Single Battle Calculator" | `SingleTeamPage.vue` | OLD ScoreAttackTeam formula (restored on user request, keep it) |
| `/kioku-grid` "Kioku Grid" | `KiokuGridPage.vue` | Legacy bar charts use the OLD formula; beta-only (`isBeta()`) "(battle engine)" copies use `LuxBench.ts` in one worker per chart (`luxBenchWorker.ts`): Max Burst first, then Average Damage (300 AV, 10 seeds) per character |
| `/sa-simulator-multiple` "Best SA Team" | `BestTeamPage.vue` | OLD formula + workers |

Exports: PvP `format` default, PvE `format: "exedra-pve-sim"`; both carry teams, seed, rngMode, decisions,
readable `sequence` / `decisionLog`, `notes`. `scripts/sim/replayExport.ts` replays both;
`scripts/sim/fixtures/*.json` are exports checked in game (the `notes` say what the game does).
