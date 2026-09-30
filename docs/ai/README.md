# Exedra engine knowledge base (read me first)

This folder is the cache for AI sessions working on the battle engine (the TypeScript port of the
game's `ReDriveBattleCore`, game version **3.19.0**). It exists so a new session does not re-discover
the layout, data formats and mechanics every time. **Read this file, then only the file your task needs.**

| I need to... | Go to |
|---|---|
| know where things are, how to run/test/commit, tool quirks | [ENVIRONMENT.md](ENVIRONMENT.md) |
| find where the TS engine does X, or where to hook a new mechanic | [CODE_MAP.md](CODE_MAP.md) |
| read master data (kits, conditions, enemies, stages), the id rules | [DATA.md](DATA.md) |
| know how the game actually computes X (confirmed formulas, orders, RVAs) | [MECHANICS.md](MECHANICS.md) |
| know whether an effect type is implemented and who uses it | [EFFECT_TYPES.md](EFFECT_TYPES.md) (generated) + `xq effect <TYPE>` |
| avoid the mistakes earlier sessions made | [PITFALLS.md](PITFALLS.md) |
| know the current branch state, in-progress work, open questions | [STATUS.md](STATUS.md) |
| research a new mechanic in the decompile and write it up | [RESEARCH.md](RESEARCH.md) |

Deeper, older write-ups (still valid unless MECHANICS.md says otherwise): `src/models/PVE_PARAMS_3.19.md`,
`src/models/PVE_ENEMY_AI_3.19.md`, `src/models/GAME_TABLES_3.19.md` (effect string -> class),
`src/models/MISSING_AND_UNCERTAIN.md` (chronological revision log R4..R9; newest first; R5+ supersedes R4).

## The lookup tool: `scripts/ai/xq.py`

One command replaces most ad-hoc greps. Run from the repo root (in the Cowork VM:
`cd $HOME/mnt/exedra-dmg-calc`):

```
python3 scripts/ai/xq.py kit "Luce della"        # whole kit: every slot at max level, values, timings, decoded conditions, wiki types
python3 scripts/ai/xq.py effect TSUBAME_LINK       # game class + methods/RVAs, kiokus & stages using it, TS references
python3 scripts/ai/xq.py cond 1670,591             # decode condition SETS (csv = OR, inside a set = AND);  cond c966 = one condition row
python3 scripts/ai/xq.py stage 1401101 [--brief]   # waves, enemies, break, skill sets + weights, AI condition rows, form changes, raid info
python3 scripts/ai/xq.py skill 1195 [--lvl 5]      # active skill rows;  passive <id> for passives
python3 scripts/ai/xq.py fn 'BattleUnit$$PassingTurn'   # decompiled function, boilerplate stripped;  fn --list <substr> = headers only
python3 scripts/ai/xq.py cls UnitTurnGauge         # dump.cs layout: field offsets + method RVAs
python3 scripts/ai/xq.py rva 0x1388790             # which function is at an RVA
python3 scripts/ai/xq.py enum CompareContent       # any battle enum (cached)
python3 scripts/ai/xq.py ts turnNum                # where the TS engine uses a symbol (file:line [function] (kind))
python3 scripts/ai/xq.py find "sandbox"            # search kioku / skill / passive / enemy / stage names
python3 scripts/ai/xq.py build                     # after engine changes: regenerate EFFECT_TYPES.md + enum cache
python3 scripts/ai/xq.py --branch battle-engine-3.19 effect X   # any command against another branch, no checkout
```

## Lookup ladder (cheapest first)

1. **This KB** (MECHANICS / CODE_MAP / STATUS). Most questions asked before are answered here.
2. **xq** for data and code locations (never hand-roll a JSON scan: the id*100+lvl rule bites).
3. **Wiki pages** `E:\ma-ex-data\wiki\kioku_pages\<Kioku>.wt` and `battle_pages\*.wt`: human-readable, complete
   lists of effect types per kit / stage (`*_indexable = ...` lines). `xq kit` prints them.
4. **Decompile** `E:\unpackedExedra\3.19.0\decompiled\*.c` via `xq fn` / `xq cls`. Only when the KB has no answer
   or marks it [UNCERTAIN].
5. **Ghidra headless** only for code outside `ReDriveBattleCore` (see ENVIRONMENT.md).

## Golden rules (each one cost a session before)

- **The game is the spec.** Every engine rule carries a `[CONFIRMED 3.19]` comment with the C# name + RVA, or
  is marked `[UNCERTAIN]` / `[APPROXIMATION]`. Never guess silently; never "fix" confirmed code to match intuition.
- **Numbers:** damage/ATK/DEF/SPD pipeline = C# `decimal` (use `BattleMath.ts` `CsDecimal`), crit/gauge/barrier/
  weak ratio = float32 (`Math.fround`, alias `f32`). Wrong type = off-by-one damage or wrong turn order.
- **Condition csv lists are OR, conditions inside one set are AND.**
- **Detail rows:** skills/ability/ascension/support are keyed `id*100+lvl`; crys and enemy skills/passives by exact id.
- **Verify before claiming done:** `npx tsx scripts/sim/checkFixtures.ts` (in-game fixtures), a probe run of the
  exact scenario, and the type-check with the OOM guard (ENVIRONMENT.md). Compare errors to the baseline.
- **Leave the cache better:** new confirmed finding -> MECHANICS.md (+ the code comment); state change ->
  STATUS.md; new trap -> PITFALLS.md; engine changes -> `xq build`. Keep entries short and cite RVAs.
