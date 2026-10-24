# Battle scripts (1:1 engine)

Run with `npx tsx <script>` from the repo root. The engine is used through its bundle: build it first with
`npm run engine` (`node scripts/engine/bundle.mjs`) after changing `src/engine`. Scripts that import app models
import `BestTeamCalculator` first: outside Vite, the Kioku <-> BestTeamCalculator import cycle otherwise fails with
"Cannot access 'Kioku' before initialization".

| Script | What it does |
|---|---|
| `checkFixturesEngine.ts` | In-game regression fixtures (`fixtures/*.json`): must stay all PASS. |
| `checkEngine321.ts` | Checks of the 3.21.0 rules ported into the engine. |
| `engineRun.ts <stageId> [seed] [teamExport.json]` | Headless PvE battle; prints every command the core sends. |
| `enginePvp.ts [seed] [teamExport.json]` | Headless PvP battle. |
| `engineBattleDemo.ts <pvp\|quest\|raid> ...` | `EngineBattle` smoke test. |
| `engineFixtureSeq.ts <fixture> [from] [to]` | The engine's readable sequence for a fixture export. |
| `engineSweep.ts`, `engineMultiRaid.ts` | Sweep many stages x teams x seeds and group failures (new-content smoke test, VERSION_UPDATE.md). |
| `engineSoloRaidDebug.ts <stageId> <fixture> <seed>` | Debug one Solo Raid run. |
| `engineBestTeam.ts <team.json> ...` | Best SA Team search from the command line. |
| `benchAll.ts`, `benchOne.ts` | Kioku Grid Lux bench for every / one kioku. |
| `compareOldModel.ts` | First-generation single-hit model vs the engine, per character (writes `docs/ai/OLD_VS_ENGINE.md`). |
| `ingameChecks.ts`, `ingameChecksList.ts` | Scripted fights for in-game checks of the characters whose numbers moved. |

## RNG modes and manual control

Every random decision goes through `src/models/BattleRng.ts` (the engine's `GameRandom` hook is routed there by
`src/battle/EngineRandom.ts`): yes/no rolls (crit, buff/debuff chance) and choices (AI target picks, enemy skill
picks). Rolls at 0% / 100% and single-option choices are decided directly and never touch the generator.
`new EngineBattle(setup, { seed, rngMode, decisions, manualTargeting })`:

- `rngMode`: `"seed"` (default), `"hit"` (every real roll succeeds), `"miss"` (every real roll fails), `"weighted"`, or
  `"manual"` (rolls follow `decisions`, else hit at >= 50%). In `hit`/`miss`, choices take the most likely option.
- `decisions`: roll index -> `{ kind, label, value }`; only applied when the roll at that index still has the
  same kind and label. Every snapshot carries the rolls made during it in `rngEvents`.
- `manualTargeting` (PvE page "Manual"): ally decisions throw `PendingDecision` until a pick for that point is in
  `decisions`; the page shows the options and replays the battle from the start with the pick.

## Exports and fixtures

The PvP and PvE simulator pages export one JSON (PvP: default `format`; PvE: `format: "exedra-pve-sim"`) with the
team slots, stage, seed, RNG mode, control mode, turns, `decisions`, the Solo Raid state, and a readable `sequence` /
`decisionLog`. **Import file** on the page loads it again. Manual picks are stored by roll index; when an engine
change shifts the indices, Import file and `checkFixturesEngine.ts` match picks by label in order (BattleRng
`relaxedPicks`, then `rekeyPicks`).

`fixtures/*.json` are exports of situations checked in game; the `notes` field says what the game does.
