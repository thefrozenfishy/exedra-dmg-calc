# Pitfalls: mistakes earlier sessions made (don't repeat them)

## Data
- **Skill/passive detail rows are keyed `id*100+lvl`.** A scan by raw id "proved" TSUBAME/REGAIN/VORTEX/REFLECTION
  were unused; the user had to point out Luce della Speranza, Panna Vorticosa, Melodia Appassionata, Vampire Fang.
  Use `xq kit` / `xq effect`, or the wiki pages, before claiming nobody uses something.
- Crystalis and enemy skills/passives are the exception (exact ids). Portrait passives use `id*100+6`.
- Condition csv = OR of sets. The engine once ANDed them everywhere.
- Enemy `criticalRate`/`criticalDamageRate` are per-mille: 100 = +10 %, not +100 %.
- `kiokuData` is a dict keyed by name, not a list. It is built from the Mst tables in `utils/helpers.ts`; `kioku_data.json` only has `obtain`/`permaDate`/`heartphial` (don't read stats or kit ids from it). When syncing base_data, copy getStyle*/getCharacterMstList too, or new kiokus get no level-cap stats.
- Condition SET ids (the csv in detail rows, `xq cond 1671`) and CONDITION ids (the `[cond 966]` rows inside a set,
  `xq cond c966`) are different id spaces.

- A simulator export's `engine` field is a hard-coded label ("battle-engine-3.19"), not the build that made it.
  If a user export disagrees with the engine, replay it on each branch
  (`git archive <ref> | tar -x -C $HOME/wt && ln -s $PWD/node_modules $HOME/wt/node_modules`) before debugging:
  the browser may be running main or the deployed site.

## Engine semantics
- **Unit-state conditions see the running skill.** Checking a state's active condition with a bare
  `stateGen(this, this)` (no actor, no skill) silently disabled every "Ultimate / Battle Skill / follow-up / Ether
  Blow only" buff and every IsActor-gated state (~1000 rows) for months. Use `isEffectCurrentlyActive` /
  `filteredEffects` (they read `activeLaunch`); never build a state-check BattleState by hand. MECHANICS section 6.
- **Per launch vs per row.** ADDITIONAL_DAMAGE / TSUBAME_LINK, regain and final damage belong to the whole skill
  launch (AbilityEffectLauncher.Triggering), not to each DMG row or each DMG_RANDOM hit. Code that runs "after the
  skill" goes in `PvPTeam.launchSkill`.
- "Conditions assumed met" (MaxDamage) must still respect the skill type a state is limited to
  (`actorSkillTypeRestriction`), or Battle Skill / Basic Attack columns get ultimate-only buffs.
- ...and must not stack **tier ladders**: a passive often adds N same-type states gated by exclusive ACTIVE conditions
  (Focused Guard "enemies == 5..1", Light Chain "Lv 1..5", Magic/token == n). In battle one rung is active; with
  conditions stripped all N stacked (Light Chain final DMG 160%, resist -30%). `ConditionTiers.ts` +
  `MaxDamage.assignTiers` keep the strongest rung (766 ladders in the passive data, 2026-10-01).
- **Passives are triggers**, not always-on states (R7.2). Check START conditions when adding, ACTIVE conditions
  while active. Checking both at trigger time lost every "while X" passive.
- **TurnNum is per finished turn**, not per act (Forward's +1/-1 pair is a preview). A "literal" reading of one
  function without the next lines gave the wrong answer; read the whole function.
- Battle-start passive order matters (CHARGE before EX crys GAIN_CHARGE_POINT; crys SPD first). Moving crys last
  broke the Thunder Torrent fixture, moving it first broke Tenebrous Arcana. Current order: ability -> crys -> rest.
- Turn gauge must be rescaled after **each** state add (f32), not once per batch - decides mirrored ties.
- Turn-order priority is taken **once per effect**, shared by its targets - not per target.
- Buffs are never parried; hit/parry rates only apply to Negative-direction states. (A roll applying debuff
  resistance to buffs made ~30 fake "rolls" at battle start.)
- A friendly skill placeholder resolved before the user's manual pick broke Hollow Woman's Cutaway; in manual
  mode, targets must come from the pick.
- The same placeholder ([actor]) also broke FULL AUTO: the generic AI could only pick the caster, so every friendly
  single-target skill without a bespoke rule self-targeted (Thunder Torrent hasting herself every turn). Friendly
  picks are made against the whole team in both modes.
- The TS turn flow resets the actor's gauge before resolving targets; the game decides targets first. Any AI filter
  that reads the gauge must use `aiDecisionGauge` (AITargetSelector.ts).
- KO'd units must leave the turn order.
- Don't pre-scale a kit by UP_BUFF_EFFECT_VALUE once; it is a live give-time multiplier from the giver.
- Running a battle "for N AV": `executeNextAction` advances `elapsed` to the actor's time *before* acting, so check
  `elapsed > N` after the call and drop that action. `while (elapsed < N) executeNextAction()` counts one action past
  the window, and which one depends on the team (the Kioku Grid bench showed a fake -10% for supports without buffs).
- Read condition CompareValues from the data before mapping them: IsElementType/IsRoleType hold names, not ids.
  Mapping them through `elementMap`/`roleMap` silently made every element/role condition false for real units.
- A friendly effect reaches `applyEffect` with the caster as placeholder target; conditions about "each target"
  must be checked on the widened targets, not on the placeholder (Attacker-only buffs never applied).
- EachTarget belongs to the effect's USER only (eachTargetCtx.user): don't hand it to every unit's state checks during a
  launch (the defender's own EachTarget states would see itself), and don't fall back to the holder when none is set
  (a null EachTarget is false for state activity, true only for start conditions). Wrap any new per-target effect
  loop in `withEachTarget(user, target, ...)`.
- Condition operators: read the Check case before claiming one is ignored. IsElementType/IsRoleType honor NotEqual
  (BoolValueComparer), and a code comment once said the opposite while marked confirmed.
- Team SP goes through `PvPTeam.addSp` (clamped 0..6); never `currentSp +=`.
- Every damage event pushed to the eventLog needs `sourcePos` (and `vortex` when it pops vortexes): the Kioku Grid
  bench attributes damage by slot. `additionalHit` once lacked it, so additional damage silently dropped out.
- Enemy break rate: `breakParams` reads `enemy.breakMst` live; a probe that only sets `breakedDamageReceiveRate` falls
  back to the table's max (100% for most) on the next hit. Override `breakMst` too (LuxBench does).
- Who dealt a hit: use `BattleEvent.sourcePos` (names repeat, e.g. several Lux). A popped vortex is inside the
  popping hit's `amount` (`vortex` field) and also logged as its owner's `dot` event; subtract it when attributing.
  The `dot` event is display-only: in the game the vortex counts in the popping hit's notice, the owner gets nothing.
- "Infinite SP" can't be literal: a battle skill that acts again at the same moment (Tenebrous Arcana's extra
  action, Thunder Torrent hasting herself) loops forever. LuxBench tops SP up to 5 only when nobody is due to act at
  the current moment.
- Expected-crit damage (`BattleRng.expectedCrits`, LuxBench) is only the average when crit is the only randomness and
  nothing reacts to crits: on-crit stacks (Light of Reckoning: ATK/SPD/charge per crit, 41% seed-to-seed spread) and
  CTD_UNIT_COUNT conditions see every hit as non-crit. `simulatedDealerDamage(..., { report })` flags those runs
  (`critReads` / any recorded roll) and `LuxBenchCharts.simTotal` falls back to rolled seeds.
- Lux☆Magica is not a blank slate in a simulation at A1+: her Magic charges from every ally's battle skill, so her
  follow-up timing changes with whoever stands next to her. LuxBench used her at A0 for that reason; since 2026-10-01 it uses
  A5 max levels on request (with SP topped up every turn, everyone uses battle skills, which keeps the effect small).
- Hot paths: never `Object.values(skillDetails).filter(...)` per action (it was ~23% of sim time in `getDetails`
  and `triggerFua`); use `skillDetailsByMstId.get(id * 100 + lvl)`, same entries in the same order.
- The old ScoreAttackTeam/ScoreAttackKioku code is a different, simplified calculator. Don't copy its rules into
  the engine without checking the decompile (its element/role gate on damage made skills hit only same-element
  enemies).

## Decompile reading
- Ghidra names are ICF-folded: identical bodies share one name, so the `// ====` header may name another method.
  **Trust the `C#:` line** (and the RVA).
- Offsets like `*(int *)(param_1 + 0x88)`: look the class up (`xq cls BattleUnit`) - 0x88 = TurnNum.
- `func_0x...` calls: see MECHANICS section 1 for the known ones; `FUN_18067ce80` / lazy-init blocks are
  boilerplate (`xq fn` strips them).
- Decimal code is unreadable raw: pipe through `tools/decsimp.py` for straight-line functions.
- Virtual calls appear as `FUN_18004c7a0(slot, obj, ...)` / `(**(code **)(*obj + 0x..))(...)`: grepping the
  method name won't find those callers; grep the field offset it writes (`+ 0x71) = `) instead.
- Lambdas live in `<>c` / `<>c__DisplayClassN_M` classes: `xq fn 'MethodName>b__'`.
- Before deciding "not in the decompile": the decompile only covers `ReDriveBattleCore.*`. Score formulas, UI,
  network, `CreateCharParamFromNetworkUnit` are in other namespaces (need Ghidra on those).

## Tools and environment
- Type-check needs `NODE_OPTIONS=--max-old-space-size=3300` (4 GB VM) and `timeout 170`; compare with the
  pre-existing error set, don't chase zero.
- Engine scripts: `import "../../src/models/BestTeamCalculator"` first (import cycle).
- `rm` fails in connected folders until delete permission is granted, and so does git's own cleanup: a plain
  `git status` leaves `.git/index.lock` behind. Use `git --no-optional-locks status`; ask for delete permission once
  (with a reason) before committing and remove a stale lock then.
- `device_commit_files` re-sending an already-sent staged path often writes the OLD content: use a fresh staged
  filename per revision and verify md5 on the PC.
- `device_bash` has no persistent cwd; always `cd` first. Long greps over all `.c` files are slow; use `xq fn`
  (reads each file once) or grep one file.
- Another session (or the user) may have changed the repo meanwhile: `git status`, `git log -3`, `git stash list`
  before editing; never stash/checkout over someone's uncommitted work. (A session once duplicated a field that
  a parallel merge had just added.)
- Don't burn time on `vite build` in the VM.
- `git stash show -p stash@{0} -- <path>` fails ("Too many revisions"); use `git diff 'stash@{0}^1' 'stash@{0}' -- <path>`.
- Checked-out branch != engine branch: use `xq --branch battle-engine-3.19 ...` / `git show branch:path`.

## Process
- Research in parallel with subagents only with a shared preamble (RESEARCH.md) and ask for a compact spec back;
  subagents that hit a rate limit must be resumed (SendMessage), not restarted.
- After a fix: probe the exact scenario the user reported, run fixtures, type-check, then commit. Report what
  changed in game terms, and what is still unverified in game.
- Anything that puts states on units without going through PvPTeam's give path must apply
  `scaleGivenState(detail, giverEffects)` itself (buff/debuff strength, UP/DWN_BUFF/DEBUFF_EFFECT_VALUE, is
  applied at give time, not baked into the kit). MaxDamage.ts skipped it, so ascension-granted buff/debuff
  strength (e.g. Flame Waltz A4 +50%) had no effect on Max Damage until 2026-09-30.
- "Nothing reads X" claims from grepping a getter's RVA miss folded getters and direct field reads: BP was declared dead
  but `IsSpecialAttackPointMax` reads BattleUnit+0x34/+0x3C directly, and `BpCharger` writes +0x34 without AddBP.
  Grep the field offset and `<Name>Charger`-style static helpers too, not only the setter/adder.

## Added 2026-10-02 (3.19.1 session)
- **Old "the source doesn't handle it" comments can be wrong.** BattleConditionParser said team contents 313/314/316
  and unit content 22 / team 206/207 were "not in the source switch"/"need a stat not in data"; the 3.19 decompile
  handles all of them. Re-check against `xq fn` before keeping a `[NOT IMPLEMENTED]` = false.
- **Don't implement an effect from its name.** IMM_SLIP_DMG ("immune slip damage"?) is "Instant DOT DMG Burst"
  (`AbilityEffectTypeMst.name`, kit text "consumes all remaining turns of ongoing DMG"). `xq effect` prints the name.
- The CompareContent enum names in BattleConditionParser.ts are partly guesses; `xq enum CompareContent` has the real ones.
- **Ghidra drops float/double return values** (the function shows `void`, the last arithmetic vanishes): disassemble
  with `scripts/ai/disasm.py <rva>` (capstone) when a decompiled function looks like it computes nothing.
- A grep for "who reads field +0x3a" misses compiler-folded getters: ICF makes one body serve many getters, so calls
  appear under another class's name (e.g. `set_BreakedDamageReceiveRate` is called as
  `Sentry_Unity_..._set_ReportAssembliesMode`). Search the field offset pattern instead (`0x58) + 0x3a)`).
- PvP/PvE battles drain `team.eventLog` into the snapshots: collect events from `executeNextAction()`'s returned
  snapshots (`s.events`), or set `snapshotHook = undefined` when calling `performAction` directly.
- The first `git status` on the mount refreshes the whole index (~2.5 min); a killed git leaves `.git/index.lock`.
- The Steam folder (`E:\SteamLibrary\steamapps\common\MadokaExedra`, 27k files) and ma-ex-data are too big for
  `find` / `grep -r` within one 180 s call: list known paths instead.
