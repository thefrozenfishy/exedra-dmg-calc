# Battle engine scripts

Run with `npx tsx <script>` from the repo root (no build needed).

- `runPvp.ts [seed]` - runs a headless PvP battle between two 5-unit teams built from
  kioku_data and prints every hit. Same seed = same battle.
- `compareFormula.ts [cases]` - feeds identical random stats/buffs through the new
  DamageCalculator (decimal-exact, from the 3.19 decompilation) and through ScoreAttackTeam's
  closed-form formula, and reports how often they agree.

Both scripts import `BestTeamCalculator` first: outside Vite, the Kioku <-> BestTeamCalculator
import cycle otherwise fails with "Cannot access 'Kioku' before initialization".
