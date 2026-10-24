# exedra-dmg-calc

Vue 3 + TypeScript web app for Magia Exedra: team/damage calculators plus a battle engine that ports the game's
`ReDriveBattleCore` (v3.19.0) from a full decompile.

**The engine is meant to be a 1:1 copy of the game.** The port lives in `src/engine/` (one file per game class, same
fields, same methods with their RVAs, same control flow; read `src/engine/README.md` first). Every battle,
Max Damage and team score runs on it (`src/battle/*` is the app side). `src/models` holds app helpers (unit builds,
stage data, Max Damage types) and the first-generation single-hit model of the two "Old" pages; the second-generation
engine that used to live there was removed (notes in `docs/ai/legacy/`). New game logic goes into `src/engine`. When
the game is patched, re-port exactly the changed methods (`scripts/engine/ledger.py --rva` / `--check`).

**Engine / simulator / reverse-engineering work: start at `docs/ai/README.md`.** It indexes the knowledge base
(environment, code map, data rules, confirmed mechanics with RVAs, pitfalls, current status) and the lookup tool:

    python3 scripts/ai/xq.py kit "<kioku>" | effect <TYPE> | stage <id> | cond <csv> | fn '<Class$$Method>' | cls <Class> | ts <symbol>

Non-negotiables:
- Every game rule in code cites `[CONFIRMED 3.19] Class.Method (0xRVA)` or is tagged `[UNCERTAIN]`/`[APPROXIMATION]`.
- decimal (`BattleMath.ts`) for ATK/DEF/SPD/damage, float32 (`Math.fround`) for crit/gauge/barrier; condition csv = OR.
- Detail rows are keyed `id*100+lvl` (skills/ability/ascension/support), exact id for crys and enemies.
- Verify: `npx tsx scripts/sim/checkFixturesEngine.ts`, a probe of the reported case, type-check with
  `NODE_OPTIONS=--max-old-space-size=3300 npx vue-tsc --noEmit -p tsconfig.app.json` (compare with the existing errors).
- `src/engine`: no restructuring, no "equivalent" rewrites, no guesses in method bodies (leave `notPorted`); type-check
  `NODE_OPTIONS=--max-old-space-size=3300 npx tsc --noEmit -p tsconfig.engine.json` stays at 0 errors; refresh
  `python3 scripts/engine/ledger.py --write`.
- Update `docs/ai/MECHANICS.md` / `STATUS.md` / `PITFALLS.md` with what you learned; `xq build` after engine changes.
