# TS code map

**`src/engine/` (the 1:1 port)** needs no map: it mirrors the game's namespaces and classes
(`src/engine/ReDriveBattleCore/Act/ActReferee.ts` = `ReDriveBattleCore.Act.ActReferee`), and
`python3 scripts/engine/ledger.py --class <Class>` / `--rva <rva>` locate any game method. The app reaches it only
through the bundle (`src/engine/dist/engine.js`, built by `npm run engine`) via `src/battle/engineBundle.ts`.

The second-generation engine that used to live in `src/models` (`PvPTeam`, `PvPBattle`, `UnitStateEngine`,
`DamageCalculator`, `AITargetSelector`, `BreakPoint`, `createPvEBattle`, the old `computeMaxDamage`, the Fight Solver)
was removed on 2026-10-24 (branch `remove-gen2`). Its notes are in `docs/ai/legacy/`. Don't bring game rules back
into `src/models`: new game logic goes into `src/engine`.

Find any symbol with `python3 scripts/ai/xq.py ts <name>`.

## src/battle (app side of the 1:1 engine)

| File | Contents |
|---|---|
| `EngineBattle.ts` | Runs one battle like the client (`ClientDriver.runBattleLikeClient`): setup kinds pvp / quest / soloRaid / multiRaid, `executeNextAction()` -> `BattleSnapshot`s, manual control (`BattleRng.pick`, `PendingDecision`), `RaidCarry` (Solo Raid attempt carry-over). |
| `EngineRandom.ts` | Routes the engine's `GameRandom` hook through a `BattleRng` (page RNG modes, roll log). |
| `EngineMaxDamage.ts` | Max Damage on the engine: `computeMaxDamageEngine` (result shape in `models/MaxDamage.ts`; `scoreOnly` = numbers only, `trace` = "Stats for nerds"). `EngineMaxDmgStage.phase` = the wave boss's form step (`enterWave` -> `enterNextForm`); `phaseWave` / `phaseFieldAppearanceIds` = the pages' enemy list for a phase (summons included). |
| `EngineDamageTrace.ts` | "Stats for nerds": `traceDamage` wraps `BattleDamageCalculator`'s static steps for one run and records each hit's factors; `unitStats` / `enemyStats`. |
| `EngineBench.ts`, `EngineTeamScore.ts` | Kioku Grid bench battles; Best SA Team scoring. |
| `engineBundle.ts` | `E`: the bundled engine module. |

## src/models (app helpers, no battle rules)

| File | Contents |
|---|---|
| `PvPKioku.ts`, `Kioku.ts` | A character's build (kioku_data + crys, ascension, portrait, support) and its effect list; the unit input for every calculator (`src/engine/adapter/NetworkUnits.ts` reads it). |
| `PvE.ts` | Stage / wave / enemy / raid master data (`stageWaves`, `stageWaveMeta`, `summonTemplates`, `soloRaidInfo`, `multiRaidInfo`, names). |
| `PvEBattle.ts`, `PvEScore.ts` | `stageBattleType`, `waveStartUnits`; Score Attack stage lookup. |
| `MaxDamage.ts` | Max Damage's effect list (`collectTeamEffects`, tier ladders `MaxDmgEffect.tier`) and option / result types. |
| `BattleConditionParser.ts`, `ConditionTiers.ts` | Static questions about condition csvs (skill-type restriction, element / role, ailments, unit counts, crit) and mutually exclusive csvs; the old single-hit model's pre-filters. No live evaluation. |
| `EffectSide.ts`, `EffectTargetSide.ts`, `StateAddFilter.ts` | Effect side per type (generated table + hand lists); CanAddTo filter class per state (generated). |
| `BattleRng.ts` | Every random decision of a simulated battle: modes seed/hit/miss/weighted/manual, `chance`, `choose`, `pickTarget`, `PendingDecision`, recorded `RngEvent`s. |
| `BattleMath.ts` | `CsDecimal` exact decimal (.NET Core DecCalc), `seededRng`; also used by `src/engine/runtime.ts`. |
| `LuxBench.ts`, `EngineBestTeam.ts`, `EngineTeamPool.ts` | Kioku Grid bench; Best SA Team search and its worker pool. |
| `EngineAttackerLoadout.ts` | PvE page "find best attacker loadout": candidates (`loadoutSearch`), coordinate ascent (`findBestAttackerLoadoutEngine`), worker pool `EngineLoadoutPool` (`maxDamageWorker.ts` "loadout"). |
| `EngineDamageDiagnosis.ts` | PvE page "Got less in game?" above Max Damage: in-game damage -> which counted buffs / debuffs were missing. Each candidate (card off / fewer stacks) run alone, subsets ranked by an estimate (same effect type adds, types multiply), best 10 re-run together; worker pool `EngineVariantPool` (`maxDamageWorker.ts` "variant", `MaxDmgOptions.onlyColumn`). Probe: `scripts/sim/probeDiagnosis.ts`. |
| `ScoreAttackTeam.ts`, `ScoreAttackKioku.ts`, `BestTeamCalculator.ts` | The first-generation closed-form Score Attack model (Old Single Hit Calc, Old Best SA Team Calculator). `ScoreAttackKioku` is also the stats / effect-list object of Kioku Setup, Kioku Grid and Best SA. |
| `HeartphialExp.ts`, `PowerValue.ts`, `AccountSimilarityScore.ts` | Page helpers. |

Types: `src/types/KiokuTypes.ts` (`SkillDetail`, `TargetType`, `targetRange`, `BattleSnapshot`, `BattleEvent`),
`src/types/enums.ts` (Ailment, elements, roles, `BattleType`).
Data access: `src/utils/helpers.ts` (`kiokuData`, `skillDetails`, `skillDetailsByMstId`, `passiveDetails`,
`passiveDetailsByMstId`, `crystalises`, `portraits`...).

## Pages and UI

| Route | Page | Engine use |
|---|---|---|
| `/pvp-simulator` "PvP Simulator" | `src/pages/PvpTeamPage.vue` | `EngineBattle` (pvp / gvg); RNG modes (`RngControls.vue`), export/import (`src/utils/pvpExport.ts`), `BattleTimeline.vue` |
| `/pve-simulator` "PvE Simulator" | `src/pages/PvESimulatorPage.vue` | `EngineBattle` (quest / soloRaid / multiRaid), stage picker (`StagePicker.vue`), Auto/Manual control, Solo Raid attempts, Max Damage (`maxDamageWorker.ts` -> `computeMaxDamageEngine`), attacker loadout search (`models/EngineAttackerLoadout.ts`, anvil buttons `components/AttackerOptimizer.vue`), "Got less in game?" missing-effect finder (`models/EngineDamageDiagnosis.ts`), Stats for nerds (setting `pveStatsForNerds`) |
| `/sa-simulator-multiple` "Best SA Team Calculator" | `BestTeamPage.vue` | `models/EngineBestTeam.ts` + `battle/EngineTeamScore.ts`, worker pool `models/EngineTeamPool.ts` (`maxDamageWorker.ts` "teams") |
| `/kioku-grid` "Kioku Grid" | `KiokuGridPage.vue` | Bench charts via `LuxBench.ts` in one worker per chart (`luxBenchWorker.ts`); archetype icons from `models/KiokuArchetypes.ts` (kit master rows, A2 + EX crystalis) |
| `/sa-simulator-single` "Old Single Hit Calc" | `SingleTeamPage.vue` | First-generation `ScoreAttackTeam` formula |
| `/sa-simulator-multiple-old` "Old Best SA Team Calculator" | `OldBestTeamPage.vue` | First-generation formula (`findBestTeam`) + `BestTeamWorker.js` |

Exports: PvP `format` default, PvE `format: "exedra-pve-sim"`; both carry teams, seed, rngMode, decisions,
readable `sequence` / `decisionLog`, `notes`. `scripts/sim/fixtures/*.json` are exports checked in game (the `notes`
say what the game does); `npx tsx scripts/sim/checkFixturesEngine.ts` asserts them on the engine.
