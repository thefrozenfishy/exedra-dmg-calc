# exedra-dmg-calc

Vue 3 + TypeScript web app for Magia Exedra: team/damage calculators plus a battle engine (`src/models`) that ports
the game's `ReDriveBattleCore` (v3.19.0) from a full decompile.

**Engine / simulator / reverse-engineering work: start at `docs/ai/README.md`.** It indexes the knowledge base
(environment, code map, data rules, confirmed mechanics with RVAs, pitfalls, current status) and the lookup tool:

    python3 scripts/ai/xq.py kit "<kioku>" | effect <TYPE> | stage <id> | cond <csv> | fn '<Class$$Method>' | cls <Class> | ts <symbol>

Non-negotiables:
- Every game rule in code cites `[CONFIRMED 3.19] Class.Method (0xRVA)` or is tagged `[UNCERTAIN]`/`[APPROXIMATION]`.
- decimal (`BattleMath.ts`) for ATK/DEF/SPD/damage, float32 (`Math.fround`) for crit/gauge/barrier; condition csv = OR.
- Detail rows are keyed `id*100+lvl` (skills/ability/ascension/support), exact id for crys and enemies.
- Verify: `npx tsx scripts/sim/checkFixtures.ts` + `scripts/sim/checkMechanics.ts`, a probe of the reported case, type-check with
  `NODE_OPTIONS=--max-old-space-size=3300 npx vue-tsc --noEmit -p tsconfig.app.json` (compare with the existing errors).
- Update `docs/ai/MECHANICS.md` / `STATUS.md` / `PITFALLS.md` with what you learned; `xq build` after engine changes.
