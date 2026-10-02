# Researching a mechanic in the decompile, and writing it down

## Steps

1. **Is it already known?** Search this KB (`grep -n TYPE docs/ai/*.md src/models/*.md`) and `xq effect <TYPE>`.
2. **Find the class**: `xq effect <TYPE>` prints the class (from UnitStateFactory / AbilityEffectFactory) and its
   methods with RVAs. For non-effect topics: `xq fn --list <Keyword>` or grep `_index_targets.tsv`.
3. **Read the entry points** with `xq fn 'Class$$Method'`: for a state `.ctor(AbilityEffectInfo)` (which value
   slot is what), `CanAddTo`, the `Get*VariationValue` / `Triggering` / `OnAdded` / `OnRemoving...` / `PassingTurn`
   overrides, and the interfaces it implements (`xq cls <Class>` shows `: IAtkVariation, ITurnEndTrigger ...`).
   For an ability effect: `Triggering` and `SelectTargets`/`GetAIFilteredTargets` overrides.
4. **Find the callers** of the interface/method to learn *when* it runs:
   `grep -n "Interface\|Method(" $HOME/mnt/unpackedExedra/3.19.0/decompiled/ReDriveBattleCore.c | head`
   then `xq rva` / the enclosing `// ====` header (or `xq fn --list`).
5. **Offsets**: `xq cls <Class>` for field names; `BattleUnit` 0x88 TurnNum, 0x58 UnitCondition, 0x60 TurnGauge,
   0x78 BreakPoint, 0x80 BreakedDamageReceiveRate, 0x84 isCharacter, 0xA4 CurrentHpGaugeCount.
6. **Types**: note every float cast, `(decimal)` conversion, Floor/Ceiling, int division. These decide exactness.
7. **Data**: dump 1-2 real rows that use it (`xq kit`, `xq stage`) so value slots are concrete.
8. **Compare with the TS** (`xq ts <TYPE>`) and list exactly what must change.


## When the C output is not enough

- Ghidra drops float/double returns (XMM0) and sometimes the arithmetic feeding them: the function decompiles to
  `void`. Disassemble: `pip install capstone` once, then `python3 scripts/ai/disasm.py 0x<rva>` (calls annotated with
  their names). Example: ReceiveSlipDamageUnitStateBase.GetSlipDamageValue 0x15bf670 = value x RemainingTurn on the
  isImmediately path, invisible in C.
- Getters/setters are ICF-folded: a call to a one-line accessor shows under some unrelated class's name. To find who
  reads a field, grep the offset pattern (`0x58) + 0x3a)` = BattleUnit.Condition.CanNotUseSpecialAttack).
- Lambdas (`<Check>b__6_40`) can be ICF-folded too: `xq rva <their RVA>` lists every name at that address; read the
  body once, it is shared.
- Interfaces of a state class (IBuff, IDebuff, INeutralState...) are on its `class X : Base, I1, I2` line in dump.cs;
  resolve the base chain (StateInterfaces.ts was generated that way).

## Depth standard (what a finding must contain so a cheaper model can implement it)

Look at MECHANICS.md sections 8 and 13 or `PVE_ENEMY_AI_3.19.md` for the target depth:

- The C# name + RVA of every function the rule comes from.
- Pseudo-code in game order, with value slots named (`v1/10`, `value2 turns`), number types and rounding.
- When it runs (timing, which act, before/after what) and on whom (target side, CanAddTo filter).
- Edge cases seen in code: clamps, "only while", removal, stacking/blend, death, PvP/PvE branches.
- Which kiokus/enemies use it (1-2 example rows) and what the user should see in game.
- Tags: [C] confirmed line by line, [?] inferred (say what would confirm it), [D] data-only, [G] in-game fixture.
- What the TS does today vs what must change (file + function).

Then: add the short version to MECHANICS.md, the `[CONFIRMED 3.19] Class.Method (0xRVA)` comment at the code
site, and (for big topics) a longer `src/models/<TOPIC>_3.19.md`.

## Parallel research with subagents

For several independent topics, spawn one general-purpose agent per topic (Sonnet is fine for reading) and
give each this preamble (edit the topic list), asking for a compact spec, read-only:

```
You are reverse-engineering the Unity/IL2CPP game "Magia Exedra" (battle core namespace ReDriveBattleCore,
version 3.19.0) so a TypeScript battle simulator can match it exactly. READ-ONLY: do not modify files.
Access the user's PC with mcp__remote-devices__device_bash (load via ToolSearch "select:mcp__remote-devices__device_bash").
Every command: cd $HOME/mnt/exedra-dmg-calc && ...
First read docs/ai/README.md, docs/ai/MECHANICS.md and docs/ai/RESEARCH.md (cat them). Use the lookup tool:
  python3 scripts/ai/xq.py effect <TYPE> | fn '<Class$$Method>' | fn --list <substr> | cls <Class> | kit "<kioku>" | stage <id> | cond <csv> | ts <symbol>
Decompiled C: $HOME/mnt/unpackedExedra/3.19.0/decompiled/*.c (headers: // ==== Ns.Class$$Name then // RVA 0x.. C#: sig;
names can be ICF-folded, trust the C# line). dump.cs: $HOME/mnt/Il2CppDumper/dump.cs. Wiki pages listing each
kioku's effect types: $HOME/mnt/ma-ex-data/wiki/kioku_pages/<Kioku>.wt (battle_pages/ for stages).
Detail rows are keyed id*100+lvl (skills, ability, ascension, support); crys and enemy ids are exact.
Floats are float32 unless shown otherwise; note every cast and rounding. Say explicitly what you could not
determine; never guess silently.
Deliver: a porting spec in the depth standard of docs/ai/RESEARCH.md (RVAs, pseudo-code in game order, value
slots, timing, targets, edge cases, users with example rows, TS today vs needed), under 1500 words.
TOPIC: ...
```
