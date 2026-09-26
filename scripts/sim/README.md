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

## In-game regression fixtures

`scripts/sim/fixtures/*.json` are exports (snapshots stripped) of situations checked in-game; the
`notes` field says what the game does. `npx tsx scripts/sim/checkFixtures.ts` asserts them.
