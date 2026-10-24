# src/engine: 1:1 port of the game's battle core

**The goal is a 1:1 copy of the game, not an engine that behaves similarly.** Every class, field, method,
branch and call order here mirrors `ReDriveBattleCore` (and the shared enums in `Network.Definition.Battle`)
from the 3.21.0 client (first ported from 3.19.0). When a patch changes the game, the change is applied here by porting the changed methods
again, nothing else. Do not restructure, merge methods, "simplify" control flow or substitute an existing
`src/models` rule for the game's code. If something looks odd in the game, port it anyway and say so in a comment.

Every battle in the app runs on this port (through `src/battle/*`). The older engine that organised the rules its own
way (`src/models` PvPBattle, PvPTeam, UnitStateEngine...) was removed on 2026-10-24; its notes are in
`docs/ai/legacy/`. New game rules go here.

## Layout and naming (generated, keep it)

- One file per top-level C# type at `src/engine/<namespace path>/<Type>.ts`, e.g.
  `ReDriveBattleCore/Act/ActReferee.ts`. A nested type `A.B` lives in A's file as `A_B`.
- Fields keep their C# names and carry the offset: `/** 0x18 public List<ActBase> actList */`. Auto-property
  backing fields `<X>k__BackingField` become `_X` (`_X$Class` when a subclass has its own); the property `X` is a
  getter/setter forwarding to `get_X()` / `set_X()`, which keep virtual dispatch and carry the RVA.
- Every method carries its RVA and C# signature: `/** @rva 0x18E89F0  private void AddActToListAndSort(...) */`.
  `.ctor` -> `ctor(...)` returning `this` (`new X().ctor(...)`), `.cctor` -> `static cctor()` called once at the end
  of the file. Overloads: `Name$<param count>` when the counts differ, else `Name$Type1_Type2`. Explicit interface
  members: `IFoo$Bar`. Lambdas that IL2CPP compiled as class methods: `$Outer$b__N_M`.
- C# types: `int/float/long/...` are aliases of number in `runtime.ts` (they still document the arithmetic: float
  means wrap every operation in `f32`, Decimal is `CsDecimal` from `src/models/BattleMath.ts`), `List<T>` is an
  array, `Dictionary` a Map, enums are const objects + union types (`erasableSyntaxOnly`), `out/ref` is `Ref<T>`,
  `x is IFoo` is `isImpl(x, "IFoo")` (classes list their interfaces in `static __interfaces`), generic methods
  that need `typeof(T)` take the class as a first parameter `T$`.
- Unported method bodies are `return notPorted("Class.Method", 0xRVA)`, which throws. Never leave a guess in a
  body: port it, or leave the stub.

## How a method gets ported

1. Read it: `python3 scripts/engine/decomp.py fn 'ActReferee..AddAct ===='` (simplified decompile plus the call
   targets read from the machine code), `decomp.py slot <Class> <n>` for `VSLOTn`, `scripts/ai/disasm.py <rva>`
   when Ghidra lost a float return or the function is outside ReDriveBattleCore, `xq cls <Class>` for layouts.
2. Write the body in the generated member, same statement order, same branches, the C# names of what it touches
   (`decomp.py` shows offsets; the `/** 0xNN */` field comments give the names). Inlined callees are written as the
   call they were (`ResetTurnGaugeBeforeTurnUnitActExecute(act, gd)`, comment "inlined in the game").
   Lambdas go inline with their name in a comment (`// <Forward>b__81_0`).
   For several members at once: a fragment file applied with `python3 scripts/engine/port_apply.py <file>`
   (format in its docstring); fragments of earlier sessions are in `E:\unpackedExedra\port_frag\`.
3. Randomness only through `GameRandom` (runtime.ts), so a run can be seeded.
4. `NODE_OPTIONS=--max-old-space-size=3300 npx tsc --noEmit -p tsconfig.engine.json` must stay at 0 errors.
   `python3 scripts/engine/ledger.py --write` refreshes docs/ai/ENGINE_LEDGER.md.

Mechanical helpers: `fill_trivial.py` ports getters/setters/constant returns/empty bodies straight from the machine
code (run it after generating new shells); `gen_shells.py --only <Ns.Type>` creates shells for new types.

## When the game is patched

1. `scripts/ai/verdiff.py bin/funcs` (docs/ai/VERSION_UPDATE.md) gives the changed functions and RVA moves.
2. `python3 scripts/engine/dump_parse.py <new dump.cs> /tmp/t.json && python3 scripts/engine/ledger.py --check /tmp/t.json`
   lists new/removed/changed members and moved RVAs; `ledger.py --rva <rva,rva>` finds the TS methods of changed
   functions.
3. Re-port exactly those methods from the new decompile, update the `@rva` tags, add shells for new types
   (`gen_shells.py --only`), `fill_trivial.py`, type-check, ledger.

## Status

See docs/ai/ENGINE_LEDGER.md (generated). Ported by hand so far: the whole `Act` namespace (acts, ActReferee,
ActExecutor), TurnActSystem, TurnReferee, UnitTurnGauge, TurnOrderUnitInfo, the GameDirectorBase loop (Forward,
special-attack registration, HP-gauge revive, death/revival, target checks, phase changes), UnitCondition and the
UnitStateBase core. Everything they call that is still a stub throws `NotPortedError`, so the port does not run a
battle yet; the next layers are BattleUnit, PassiveSkill/ActiveSkill/AbilityEffectLauncher, BattleDamageCalculator,
the condition checkers and the master-data readers.
