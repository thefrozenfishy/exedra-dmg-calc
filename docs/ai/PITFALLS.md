# Pitfalls: mistakes earlier sessions made (don't repeat them)

## Data
- **Skill/passive detail rows are keyed `id*100+lvl`.** A scan by raw id "proved" TSUBAME/REGAIN/VORTEX/REFLECTION
  were unused; the user had to point out Luce della Speranza, Panna Vorticosa, Melodia Appassionata, Vampire Fang.
  Use `xq kit` / `xq effect`, or the wiki pages, before claiming nobody uses something.
- Crystalis and enemy skills/passives are the exception (exact ids). Portrait passives use `id*100+6`.
- Condition csv = OR of sets. The engine once ANDed them everywhere.
- Enemy `criticalRate`/`criticalDamageRate` are per-mille: 100 = +10 %, not +100 %.
- `kioku_data.json` is a dict keyed by name, not a list.
- Condition SET ids (the csv in detail rows, `xq cond 1671`) and CONDITION ids (the `[cond 966]` rows inside a set,
  `xq cond c966`) are different id spaces.

## Engine semantics
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
- KO'd units must leave the turn order.
- Don't pre-scale a kit by UP_BUFF_EFFECT_VALUE once; it is a live give-time multiplier from the giver.
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
