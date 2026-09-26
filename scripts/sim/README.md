# Battle engine scripts

Run with `npx tsx <script>` from the repo root (no build needed).

- `runPvp.ts [seed]` - runs a headless PvP battle between two 5-unit teams built from
  kioku_data and prints every hit. Same seed = same battle.
- `compareFormula.ts [cases]` - feeds identical random stats/buffs through the new
  DamageCalculator (decimal-exact, from the 3.19 decompilation) and through ScoreAttackTeam's
  closed-form formula, and reports how often they agree.

Both scripts import `BestTeamCalculator` first: outside Vite, the Kioku <-> BestTeamCalculator
import cycle otherwise fails with "Cannot access 'Kioku' before initialization".

## Replaying a browser export

The PvP simulator page has **Export to file**: one JSON with the team setup, the RNG seed, the
number of turns, a readable `sequence` (one line per event / unit row) and the raw snapshots.
**Import file** on the page loads the same teams and seed again.

    npx tsx scripts/sim/replayExport.ts pvp-sim-...json          # print the sequence with the current engine
    npx tsx scripts/sim/replayExport.ts pvp-sim-...json --diff   # only lines that changed vs the file
    npx tsx scripts/sim/replayExport.ts pvp-sim-...json --out now.txt

Put notes on what looks wrong in the file's `notes` field. Same seed + same teams = same battle
(every random roll uses the seeded generator; the page keeps the battle out of Vue reactivity).

## PvE

    npx tsx scripts/sim/runPvE.ts <questStageMstId> [seed] [teamExport.json] [turns]

Plays a quest stage with the allied team of a PvP export (default: the Heroic Grace fixture), e.g.
509140 (Sandbox Witch, combo + rotation), 110112 (Mermaid Witch, 2 HP gauges), 509196 (3 waves).

## RNG modes and manual targeting

Every random decision goes through `src/models/BattleRng.ts`: yes/no rolls (crit, buff/debuff chance) and
choices (AI target picks, enemy skill picks). Rolls at 0% / 100% and single-option choices are decided
directly and never touch the generator. `new PvPBattle(t1, t2, false, seed, { rngMode, decisions,
manualTargeting })`:

- `rngMode`: `"seed"` (default), `"hit"` (every real roll succeeds), `"miss"` (every real roll fails), or
  `"manual"` (rolls follow `decisions`, else hit at >= 50%). In `hit`/`miss`, choices take the most likely option.
- `decisions`: roll index -> `{ kind, label, value }`; only applied when the roll at that index still has the
  same kind and label. Every snapshot carries the rolls made during it in `rngEvents`.
- `manualTargeting` (PvE page "Manual"): target decisions throw `PendingDecision` until a pick for that
  point is in `decisions`; the page shows the options and replays the battle from the start with the pick.

Exports store `rngMode` and `decisions`, plus a readable `decisionLog` (every pick and changed roll, with
its action number); `replayExport.ts` and `checkFixtures.ts` use them. The PvE Simulator page has its own
export (`format: "exedra-pve-sim"`: stage, team slots, control mode, RNG settings, decisions, the decision
the battle stopped at if any); `replayExport.ts` replays both kinds.

## In-game regression fixtures

`scripts/sim/fixtures/*.json` are exports (snapshots stripped) of situations checked in-game; the
`notes` field says what the game does. `npx tsx scripts/sim/checkFixtures.ts` asserts them.
