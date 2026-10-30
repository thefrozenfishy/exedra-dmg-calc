# Pitfalls: mistakes earlier sessions made (don't repeat them)

> Code names like `PvPTeam.*`, `PvPBattle.*`, `UnitStateEngine.ts`, `DamageCalculator.ts`, `AITargetSelector.ts` below
> point at the second-generation engine removed on 2026-10-24 (git history before branch `remove-gen2`). The game
> facts stay valid; the code now lives in `src/engine` under the game's own class names.

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
- **"Conditions met" is not "anyone may hold it".** Max Damage (battle/EngineMaxDamage `clearConditions`) used to empty
  every start / active condition list, so effects the game gives only to some allies landed on every dealer: Scorchin'
  Summer Spike's Beachball's Boon and Ultimate additional DMG (start condition EachTarget IsRoleType Attacker; the
  detail's `role` column does NOT filter them) and its ability's ATK +50% / add. DMG +40% / SPD / DMG taken (active
  condition Self.UniqueAbilityEffect 22 = the holder has Boon) showed on Glitterjoy Snow Globe (Healer). Keep the
  who-may-hold conditions (`keepHolderConditions`: start EachTarget 19/20, active Self 19/20/26); clear only situational ones.
- **Enemy-count conditions are not situational in Max Damage: the wave's count is known.** Assuming them met let Oracle Ray
  stack her "DMG +15% while >= 2/3/4/5 enemies" buffs with her skills' "extra hit while < 5/4/3/2 enemies" rows (ult
  per enemy x1.4 on a 5-enemy wave, buffs +60% on a 1-enemy wave). EngineMaxDamage evaluates 202 AliveUnitCount on
  FriendTeam / OpponentTeam (`unitCountConditionsMet`) for team effects and the dealer's own rows.
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
  broke the Thunder Torrent fixture, moving it first broke Tenebrous Arcana. Old engine order: ability -> crys -> rest.
  The 1:1 engine runs kit -> portrait -> support -> crys (in-game MP check 2026-10-24; Thunder Torrent still passes
  there): crys first gave Structure Destruction 85 / 85 / 90 starting MP instead of 79 / 79 / 85. The order also moves
  barriers given at battle start from DEF (Vampire Fang's ascension 2 barrier no longer counts her crys DEF ups).
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
  Since 2026-10-03 only the dealer (support chart) and the reference dealer (attacker chart) are A5; the fillers are A0.
- LuxBench ailment bars are about whether the enemies CAN carry an ailment, not who applies it. A kit that applies an
  ailment and reacts to it (Bebe-O'-Lantern: her passive curses her Candyholic target, Candyholic's DEF-/DMG-taken
  only work while it is cursed) looked identical with and without the forced ailment, so its bar was hidden. Average
  Damage runs now make the dummies immune to the kit's ailments except the tested one (`benchImmunities`,
  `KiokuState.immuneAilments`, bench-only, checked in canAddTo / vortex before the roll). Max Burst never applied
  ailments itself, so it is unchanged.
- A kit's ailment reactions are found by `BattleConditionParser.ailmentConditionType`, which must know EVERY compare
  content whose value names a state type: 12 AbilityEffect, 112 ReceivedSlipDamageType, 205 AbilityEffectUnitCount,
  305 AbilityEffectAndDamage ("X,N"), 309 AbilityEffectAndReceivedAttackUnitCount ("X,N"). 112/305/309 were missed,
  so Sacred Gift (+5 MP on DMG to weakened enemies, cond 449 = 305 "WEAKNESS,1") and Yuletide Gift (Burn) got no
  ailment bar on the Kioku Grid at all. (The parser's enum names HAS_ALIMENT=112 / HAS_BUFF_APPLIED=309 are
  misleading; the engine's CompareContent.ts has the game names.)
- Max Damage `enemyStates` ("every enemy carries it") used to feed only the condition checks; the ailment's own effect
  was missing (a Weakness bar had full enemy DEF). `EngineBench.giveAilmentStates` now puts non-damage ailments
  (WEAKNESS, STUN) on the enemies in `EngineMaxDamage.buildBattle`; DoT/vortex `_ATK` states stay out (a pop would
  count the dummy's damage as the dealer's). Weakness from two givers stacks (GetDuplicateUnitState matches the same
  giver only), so a Weakness user still adds its -10% on an already weakened enemy.
- Max Burst gives every team effect as landed (its random hook says yes to every "effect" roll), so the bench's immune
  dummies alone don't keep an ailment off them: `LuxBench.ultimateDamage(…, immune)` leaves out (MaxDmgOptions.excluded)
  the team effects whose type gives an immune ailment. Without it Max Burst counted a kit's own ailments in every bar
  and its ailment bar never differed (Sacred Gift: 2 Weaknesses in the main bar too).
- Average Damage dummies used to start broken, so "on enemy break" effects never triggered (Sacred Gift's second
  Weakness, break-triggered SPD / break bonus buffs). They now start unbroken with the 1-point gauge of the bench
  BreakMst (EngineBench.benchBattle no longer pre-breaks them): the first damaging hit breaks each one once through the
  game's code, and it stays broken (no dummy turns, so no recovery). The hits before that one take no break bonus.
- Hot paths: never `Object.values(skillDetails).filter(...)` per action (it was ~23% of sim time in `getDetails`
  and `triggerFua`); use `skillDetailsByMstId.get(id * 100 + lvl)`, same entries in the same order.
- The old ScoreAttackTeam/ScoreAttackKioku code is a different, simplified calculator. Don't copy its rules into
  the engine without checking the decompile (its element/role gate on damage made skills hit only same-element
  enemies).

- Vortex (and every slip damage) is computed with its OWNER's stats and buffs, not the popping hit's attacker
  (GetSlipDamageResult 0x13A7580: attackUnit = state._UserUnitId). Max Damage tools that only buff the dealer miss
  the owner's ATK / DMG dealt / vortex DMG crystalis (fixed 2026-10-24, EngineMaxDamage forOwner). Same for DoTs
  popped by IMM_SLIP_DMG; and models/MaxDamage.collectTeamEffects drops DoT ailments unless `slipDamage: true`.

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
- **Max Damage clears HP conditions unless told the dealer's HP.** Without `MaxDmgOptions.dealerHpPercent` every
  HPRatio condition counts as met (both "HP >= X" and "HP <= X" rows apply); the Best SA Team calculator passes its
  Attacker HP input, the PvE Simulator does not.
- **Worker messages must be plain data.** Pinia store objects (characterStore.characters, team.slots) are reactive
  proxies and fail structured clone (DataCloneError): JSON-copy them before `postMessage` (the PvE page's `plain`).
- **The damage trace patches static methods.** battle/EngineDamageTrace swaps `E.BattleDamageCalculator.*` for the
  length of one synchronous run and restores them in `finally`; never await inside a traced run, and keep it out of
  the worker's other jobs.
- Type-check needs `NODE_OPTIONS=--max-old-space-size=3300` (4 GB VM) and `timeout 170`; compare with the
  pre-existing error set, don't chase zero.
- Engine scripts: `import "../../src/models/BestTeamCalculator"` first (import cycle).
- **Searches that call Max Damage thousands of times must ask for less.** A Best SA Team score reads only the
  attacker's Ultimate, but `computeMaxDamageEngine` evaluated every column (Ultimate, Battle Skill, Basic Attack, Switch
  Skills, follow-ups) plus the UI bookkeeping battles: 3-4x the work. Pass `scoreOnly` and `onlyUltimate` from any
  scorer that reads one number (battle/EngineTeamScore does).
- **`Object.values(passiveDetails).filter(...)` per lookup is ~20 ms** (the table is ~30k rows): PvPKioku.addEffect did
  it 6-10 times per unit (~150 ms per new PvPKioku, per worker). Look rows up through an index (PvPKioku `detailRows`,
  helpers `passiveDetailsByMstId`).
- **Unhinted master-table scans in `createDirector`.** `GetModel` / `GetModelList` without `indexHint` walk all of
  getQuestEnemyAppearanceMstList (27 MB) per battle setup; QuestJudgeResultReferee.ctor and WaveReferee.Init did that
  on every Max Damage run (~30% of a team score). Profile with `node --cpu-prof --import tsx` before guessing.
- The device bridge mount (`$HOME/mnt/...` in device_bash) can be very slow (minutes for a few hundred small files);
  for profiling, stage the files into the cloud container (device_stage_files, 50 per call) and `npm install` there.
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

- **State identity is not the detail id.** The game dedups active-skill states by class + giver + role + element +
  active condition csv (MECHANICS section 8, "Duplicate states"). Keying `activeEffectDetails` by `skillDetailId` alone
  stacked Light of Reckoning's three follow-up "+48% special DMG" buffs (144%) and let two givers of the same detail
  overwrite each other. Fixed 2026-10-03 in `storeTimedEffect`; accum states still merge per detail id (`mergeAccumEffect`).
- **Permanent (passive) states are per giver too.** `storePermanentState` used to drop a second copy of the same passive
  detail from another ally, so two "Indomitable Guard++" counted once (sim 8% too little damage cut). Fixed 2026-10-03;
  accum types still merge per detail id. Also: max HP must include UP_HP_FIXED (sub-crys), not just UP_HP_RATIO.
- **TurnStart / TurnEnd passes have no skill.** The TS used to pass the turn's chosen action type into the TurnStart and
  TurnEnd passes, so AfterProcess passives gated on ActorSkillType fired twice per turn (Rose Garden minions' Magic
  2 -> 4; Absolute Venus' 20-token follow-up fired before her skill). Fixed 2026-10-03 in `fireTiming`.
- **"CODE CHANGED" is not "battle code changed".** 3.19.11's GameAssembly differed in 1,577 code bytes, all in the
  lottery unpacker/model. `verdiff.py runs` names the methods from the old script.json; check it before asking the
  user for Il2CppDumper/Ghidra. Also: unpack folders of in-between versions may be gone (3.19.1 was deleted), so
  diff against whatever previous version folder exists (the user asked for 3.19.0 -> 3.19.11).

## Added 2026-10-07 (PvE sim branching)
- Manual decisions are keyed by roll index and only gated by kind + label, and pick labels repeat ("Tiro Finale (Ally 1) ·
  turn: choose an action"). Changing an earlier pick and keeping the later ones replays them in the new line as
  whatever option now sits at that index (seen: a stale "option 2" fired Pluvia's ultimate inside the next unfinished
  action, so the menu offered ultimates nobody had charged). The page now drops every later decision when a pick is
  answered or changed (`setDecision(..., branch)`); flipped rolls keep later decisions. "Undo last pick" reads the
  last pick from `battle.rng.events`, not the snapshots: the action cut short by the waiting decision may already have
  used picks that no snapshot shows yet.
- The turn unit's gauge reset belongs right before its action executes, not before the manual prompt: ultimates fired
  from the prompt run first (and any haste on the turn unit is lost to the reset). An ultimate that kills every
  endless minion must not end the turn: `betweenActsHook` refills first. Before 2026-10-07 the sim did both wrong
  (Floral ult from her own prompt -> turn lost, AV 45.87).
- Turn-order ties after several "advance all allies" effects (Heroic Grace A4s) are usually decided by a later
  self-only advance (Heroic Grace++ crystalis 1003022, `passive 1003022`): the unit WITHOUT it loses the tie to slot
  order. When a reported turn order differs, check the crystalis in the export first (importing a file restores its
  build, so an in-game crys change is easily missing from the sim).

## Porting into src/engine (2026-10-10)
- **Folded functions.** IL2CPP merges identical code, so one RVA has many names (0x7305e0 is 17k empty ctors,
  0x730170 an empty method that is also `TurnActSystem.AddActOnSkillEnd`, 0x7f0a70 is `TurnActSystem.get_CurrentAct`
  but Ghidra calls it `PassiveSkill__GetAbilityEffectList`). Ghidra prints whichever name it picked. Use
  `decomp.py fn` (it annotates `/*@0xRVA =Alias*/`) and trust its `-- calls (machine code)` list.
- **Overloads.** Ghidra calls every overload by the same name; the decompile can't tell `AddAct(SpecialAttackAct)`
  0x18e8bd0 from `AddAct(ActBase)` 0x18e8c50, nor `IsActive(bundle)` from `IsActive(BattleUnit)`. The machine-code
  call list can.
- **Generic methods** (`TryGetUnitState<T>`, `GetUnitStateList<T>`) are RVA -1 in the dump; their shared instance
  is listed under the `<object>` name in script.json (`decomp.py names`). `TryGetUnitState<T>` ignores its
  doWithoutInheritance argument (passes false).
- **MathExtension.Floor(x, n) scales by 10^(n-1)** (asm 0x149f830: `Math.Pow(10, n - 1)`): `Floor(p, 2)` in
  GetProcessedProbability keeps ONE decimal. `src/models/UnitStateEngine.ts` rollAppliesEffect floors to two
  (`Math.floor(raw * 100) / 100`): open finding, not changed there yet (it moves state-hit odds by up to 0.1 point).
- **GameDirectorBase.RegisterSpecialAttack sets only actUnitId** on the new SpecialAttackAct (team stays Ally=0),
  while TurnActSystem.RegisterUnitSpecialAttack sets both. AddAct(SpecialAttackAct) reads the team for the
  interruption rule. Port such quirks as they are.
- **Device file delivery:** `device_commit_files` uploads the content a path had when it was first committed; a
  second commit of the same container path can deliver the old bytes. Copy to a new name per revision and
  check md5 on both sides. Don't edit a committed file on the device and commit it again from the container.
- **Hidden try/catch.** Ghidra drops catch blocks. `ConditionSet.IsMatchConditionSet` (0x17ec2d0) is
  `try { !Any(!IsMatchCondition) } catch { return false; }` (FH4 tryBlockMap, catch continuation `xor al, al` at
  0x17ec4e7). Without it a TurnEnd / battle-start AfterProcess pass (null notice bundle) crashes on Linq over null
  notices (CompareContent 301-304, e.g. passives 2010015, 7001036). Audit: `~/ehaudit.py` lists functions with a
  try block but no foreach/using (only this one and BackupAgent.RestoreGameDirector in 3.19.0). Port catches with
  `isGameException(e)` so NotPortedError still propagates.
- **ClientDriver, not RunBattleToEnd, for Solo Raid / endless waves.** Endless enemy supply and the season buff
  activation only happen in SoloGameDirectorBase.Request(TimeForwardRequest); RunBattleToEnd (battle skip) calls
  Forward directly and runs AdditionalSkillActs aimed at id 0 after a wave is wiped (KeyNotFound). Drive battles
  with `runBattleLikeClient` / src/battle/EngineBattle.
- **Solo Raid buffs go to the enemy list** (SetupBattleStageForSoloRaid passes `battleUnitBundle.enemyList` [+0x20] to
  SoloRaidBuffReferee.Init); condition 1513 keeps them inert there. Not a port slip.
- **GameDirectorBase.ChangeBattlePhase(Start) runs the first act** (Forward): capture its commands as an entry
  (battle-start follow-ups like Splashin' Kyubey Blast happen there).
- **Explicit interface implementations need interface dispatch (2026-10-14).** A C# member implemented as
  `int IFoo.Bar { get; }` is ported as `IFoo$Bar`; code that reads it through the interface must not read `.Bar`
  (undefined in JS, so every comparison silently fails). Use `ifaceProp(o, "IFoo", "Bar")` (runtime.ts). Found by
  the Kioku Grid bench: WeaknessUnitState's ATK/DEF -10% (IAtkVariation/IDefVariation.Addition) never applied in
  BattleUnit.GetProcessedAtk/Def, and StateAbilityEffect set `_TargetSide = undefined` for the neutral states
  (Count, LockSpecialAttack, UniqueZone: INeutralState.TargetSide). Icon numbers (IStateIconNumberDisplayable) had
  the same slip, plus IAccum's default implementation of those members. List explicit members with
  `grep -rhoE "I[A-Z][A-Za-z]+[$][A-Za-z_]+" src/engine/ReDriveBattleCore` and check every reader.
- **"Conditions met" keeps the condition csv (Max Damage).** Clearing `_ActiveConditionSetIdCsv` also changes which
  states replace each other (GetDuplicateUnitState b__1 compares the csv): L'Ombre's "+30% DMG (while ...)" and
  "+15% DMG" then replaced each other. Empty the parsed lists (`startConditionSetList` / `activeConditionSetList`,
  parsed lazily from the csv) instead; the csv stays.
- **A unit's role 0 throws** (DmgAbilityEffectBase.IncreaseBreakedDamageReceiveRate "Role が不正です"): made-up units
  (Kioku Grid bench) always get a real element and role.
- **Master-table scans are slow in JS.** `GetModelList(predicate)` scans the whole table; BattleUnitInfo
  (RefreshPrevBackup, every request) did it per passive per unit = 55% of a battle. `indexHint(pred, field, value)`
  (runtime.ts) tags a predicate with an equality it implies; the repository then scans only matching records (same
  result, same order). Use it at hot call sites only; the predicate stays the game's.
- **App mods are the only allowed exceptions to 1:1** (2026-10-15). A deliberate deviation for an app tool goes behind a
  switch in `runtime.AppMods` (default off = the game), and every line that reads it says "APP MOD (not game code)".
  Current: `expectedCritDamage` (Kioku Grid bench). Never use one in the simulator pages' default path.

## Added 2026-10-15 (3.21.0 session)
- When the code changed but no Il2CppDumper dump exists yet, `python3 scripts/ai/meta_idents.py OLD/global-metadata.dat
  NEW/global-metadata.dat --grep <rx>` diffs the metadata identifier strings (type/method/field names). It found
  Step-Up skills and CONSUME_SELF_HP in 3.21.0 without a dump. Names only: don't port anything from them.
- A new enum name (STEP_UP_SKILL, CONSUME_SELF_HP) can appear in the code before AbilityEffectTypeMst has a row for
  it: `verdiff.py mst` then reports "no new effect types". Check the metadata literals too.
- unpackedExedra no longer keeps every version (3.19.1 was deleted): OLD = the newest folder with version_report/DONE.
- Il2CppDumper / Ghidra are Windows programs: run them yourself with computer use. File Explorer is the Windows
  shell and only gets click tier (no typing, no Run box): write a .bat in the VM (CRLF) and double-click it; the
  console is masked, so log to files and poll from the VM. The user may have another app in front: re-open Explorer.
- `verdiff.py funcs` CHANGED includes field-offset shifts, folded getters and inlining. Triage with
  `scripts/engine/decdiff.py <old> <new> --only <rvas> --ignore-offsets --loose --show`, then read each survivor in the
  new decompile; ctor inlining (ActBase / BattleUnitStructure / CommandExecuteCommonAct.CreateByTurn*) is noise.
- `node scripts/engine/bundle.mjs` runs out of memory in the VM without `NODE_OPTIONS=--max-old-space-size=3300`, and
  a first run can exceed 120 s.
- `sed -i` / `xargs` over all 600 engine files on the mount is too slow for one call (got killed half way): use one
  python process.
- Lambda renumbering after a patch (`b__164_0` -> `b__165_0`) shows up as GONE + NEW members: move the ported body to
  the new name and RVA, don't leave both.
- Made-up master ids must fit an int with room for `id * 100 + n` detail ids: a 10-digit passive id (9907000101) was
  accepted by `addMasterRecords` but the passive silently did nothing. Use 7-digit ids like the crystalis (1990001+).
- Max Damage (EngineMaxDamage) removes everything given at battle start and re-gives passives from the kit's `effects`
  list: a passive only in the unit's passive list (`crys`) works in battles but not in Max Burst. Push its rows to
  `effects` too. Same for a support whose target only matches after a bench identity change.
- Kit summaries that scan effect rows by `abilityEffectType` miss what composite states do in code: `CUTOUT` (action
  advance + remove N debuffs, CutoutUnitState) and `TSUBAME_LINK` (SPD + ATK + additional damage) have no row for those
  parts. `SWITCH_SKILL` v1 and `STEP_UP_SKILL` v2 are `skillUniqueId`s (resolve via SkillMst at the skill level), and a
  `SWITCH_SKILL` row's element is the skill's, not an element limit. Kioku Grid archetypes handle all of this in
  `src/models/KiokuArchetypes.ts`; audit with `npx tsx scripts/audit/archetypeAudit.ts [--rows]`.
- `node scripts/engine/bundle.mjs` takes more than 180 s in the Cowork VM (3 GB) and device_bash kills background
  processes. Tar `src/engine` (without dist) + `src/models/BattleMath.ts` + bundle.mjs, stage it to the cloud
  container, `npm i typescript@<repo version>`, build there (5 s) and commit `src/engine/dist/engine.js` back. Without
  BattleMath.ts the bundle silently emits a different import (`../../models/BattleMath` without `.ts`, bare `f32`).
  The Linux build orders a few classes differently from the Windows one; content is otherwise identical.
- `verdiff.py funcs` byte sizes come from script.json's function boundaries: a size jump (16 B -> 464 B) on a folded
  getter or a trivial ctor is not a code change. Confirm with `decdiff.py --ignore-offsets --loose` before porting.
- `fields_check.py` reports GONE FIELD for classes whose base is a generic (`ListComparer<ICollection<int>, int>`):
  parser artefact, compare the dump lines.
- `verdiff.py mst`'s engine-coverage column (MISSING / LISTED ONLY / prefix, and condition contents "engine: MISSING")
  reads the old src/models code (BattleConditionParser, effect lists), not src/engine. On 2026-10-30 it flagged
  contents 208/210/211/304/313 and COUNTDOWN_*/SUMMON/LOSE_EP_RATIO as missing; all were already in src/engine
  (CompareContent.ts, the factories). Check `grep -rlw <TYPE> src/engine` before porting.
- A switched Basic Attack (SWITCH_SKILL, e.g. Tenebrous Arcana's 3-Magic attack 7002) shows as `lastTargetType`
  "ActiveSkill" in BattleSnapshots (EngineBattle.targetTypeOf compares with the unswitched NormalAttack id). Read the
  break / damage of the action or the unit's `_Condition._ChargePoint`, not the type, before concluding what was played.
  A bench play rule should read the unit's state (Magic) rather than count actions: a count missed the 3 Magic her
  Ultimate gives (fixed 2026-10-30).
