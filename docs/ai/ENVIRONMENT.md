# Environment: where everything is and how to work with it

## Folders on the user's Windows PC (E:)

| Path | What |
|---|---|
| `E:\exedra-dmg-calc` | The web app (Vue 3 + TS, Vite). Engine in `src/models`, master data in `src/assets/base_data`, sim scripts in `scripts/sim`, this KB in `docs/ai`, lookup tool `scripts/ai/xq.py`. GitHub: thefrozenfishy/exedra-dmg-calc (public, deployed to gh-pages). |
| `E:\unpackedExedra\3.19.0\decompiled\` | **All 5,416 `ReDriveBattleCore.*` functions** decompiled (Ghidra 12.1.4), one `.c` per namespace. Header per function: `// ==== Ns.Class$$Name ====` + `// RVA 0x... C#: <signature>`. Plus `_index_targets.tsv` (RVA, ns, class, signature), `factories.json` (effect string -> class), `state_direction.json`, `ability_side.json`, README.md. |
| `E:\unpackedExedra\3.19.0\tools\` | `getfn.py`, `fn.sh`, `decsimp.py` (collapses System.Decimal stack shuffling into expressions: `xq fn X \| python3 tools/decsimp.py`), `flt.sh`. `xq fn` supersedes getfn/fn.sh. |
| `E:\unpackedExedra\3.19.0\GameAssembly.unpack.dll` | Senbei output (Crackproof removed); input for Ghidra. |
| `E:\unpackedExedra\Ghidra\` | Ghidra 12.1.4 + `scripts/` (make_name_lists.py, ApplyIl2CppNames.java, DecompileList.java) + `README_headless.md` (import+name ~90 s, decompile all ~10 min, no auto-analysis). Needed only for namespaces outside ReDriveBattleCore or a new game version. |
| `E:\unpackedExedra\3.19.1\` | Senbei output of 3.19.1 (2026-09-27 patch). **Code byte-identical to 3.19.0**: use the 3.19.0 decompile/dump. `version_report/` = the verdiff report + newsletter. |
| `E:\SteamLibrary\steamapps\common\MadokaExedra` | The game install (not attached by default: request read access). Only needed for `global-metadata.dat` (`MadokaExedra_Data/il2cpp_data/Metadata/`) and file dates of a patch. 27k files: never `find` it. |
| `E:\unpackedExedra\tools\senbei-linux` | Linux build of `E:\Senbei-1.0.1` (built in the cloud container, glibc 2.34): `scripts/ai/unpack_version.sh` unpacks the Steam install with it. Senbei source is attached to the 3.19.1 session only. |
| `E:\ma-ex-data\gamedata\manifests\en-Latn` | Raw master data downloads (`{"payload": {"mstList": [...]}}`), often newer than base_data. Wiki generator input. |
| `E:\unpackedExedra\README.md` | How to redo Senbei + Il2CppDumper for a new game version. Also old `*.bundle` git bundles (history of deliveries, ignore). |
| `E:\Il2CppDumper\` | 3.19.0 dump: `dump.cs` (79 MB: every class, field offset, method RVA), `script.json`, `il2cpp.h`, `stringliteral.json`, `DummyDll/`. Use `xq cls` / `xq enum`. |
| `E:\ma-ex-data\` | Data-mining project (Python): `helpers.py`, `downloader.py`, `PROTOCOL_DOCUMENTATION.md` (network protocol, see the project doc protocol-findings-3.19.0.md). |
| `E:\ma-ex-data\wiki\kioku_pages\<Kioku>.wt` | Wiki page per kioku (114): stats, skills, `*_indexable = TYPE, TYPE` per slot, decoded conditions. **Complete list of which kiokus use which effect types.** |
| `E:\ma-ex-data\wiki\battle_pages\*.wt` | Same for stages/events (189): enemies, skills, `indexable = ...`. |
| `E:\ma-ex-data\wiki\condition_parser.py` | The wiki's condition decoder (ProcessTiming etc.). |
| `E:\ma-ex-data\il2cpp_reverse_engineering\1.5.0\` | Old 1.5.0 Android dump. Only for history; 3.19 differs a lot (`E:\unpackedExedra\3.19.0\battlecore_diff_1.5.0_to_3.19.0.json`). |

## How a session reaches them

- The chat runs in a cloud container; the PC is reached through **`mcp__remote-devices__device_bash`** (a Linux VM
  on the PC) where the folders are mounted at `$HOME/mnt/<folder name>`:
  `$HOME/mnt/exedra-dmg-calc`, `$HOME/mnt/unpackedExedra`, `$HOME/mnt/Il2CppDumper`, `$HOME/mnt/ma-ex-data`,
  `$HOME/mnt/il2cpp_reverse_engineering`. Load it with ToolSearch `select:mcp__remote-devices__device_bash` first.
- Each call is a fresh `bash -c` (no cwd carried over): start every command with `cd $HOME/mnt/exedra-dmg-calc &&`.
- Default timeout 120 s, max `timeout_ms: 180000`. Split long jobs.
- The VM has python3.10, node 22, git, ~4 GB RAM, no display. Python 3.12 (the ma-ex-data wiki code needs it): `pip install uv -q && ~/.local/bin/uv python install 3.12`, run `~/.local/bin/python3.12`. capstone: `pip install capstone`. Network only to allow-listed hosts (npm works).
- **Deleting is blocked** in connected folders (`rm` -> "Operation not permitted") until the user approves
  `mcp__remote-devices__device_request_delete_permission` (ask once, with a reason). Without it: don't create temp
  files in the repo; put probes in `$HOME` (outside mnt) or `scripts/sim/_probe.ts` and ask before deleting.
  **Git and locks:** without delete permission any git command that refreshes the index (plain `git status`,
  `git diff` after file changes, commit) leaves `.git/index.lock` behind and the next git write fails. Read-only
  git: always `git --no-optional-locks status` (xq does). To commit, get the permission first, then
  `rm -f .git/index.lock` if a stale one exists.
- Moving files container -> PC: write under `/mnt/user-data/outputs/...` in the container, then
  `mcp__remote-devices__device_commit_files` (force=true to overwrite). **Re-writing the same staged path often
  delivers the previous version** on the first call: stage each revision under a new name
  (`cp x.py /mnt/user-data/outputs/x.v2.py`, commit that to the same devicePath) or commit twice, and always
  check `md5sum` on both sides.
  PC -> container: `mcp__remote-devices__device_stage_files` (appears under `/mnt/user-data/uploads/<folder>/...`).
- Edit repo files **in place on the PC** (python read-modify-write or sed in device_bash). Never retype a file from
  truncated tool output.

## Running things (repo root)

```
npx tsx scripts/sim/checkFixtures.ts             # in-game regression fixtures: must stay PASS (actor of action N, optional `line` regex e.g. a unit's Magic)
npx tsx scripts/sim/checkMechanics.ts            # engine checks of decompile-confirmed rules (skill-type-gated states, additional damage per launch): must stay PASS
npx tsx scripts/sim/runPvp.ts [seed]             # headless PvP battle, prints every hit
npx tsx scripts/sim/runPvE.ts <stageId> [seed] [teamExport.json] [turns]   # e.g. 509140 Sandbox Witch, 110112 Mermaid Witch, 1401101 Solo Raid
npx tsx scripts/sim/replayExport.ts <export.json> [--diff]   # replay a browser export (PvP or PvE) with the current engine
npx tsx scripts/sim/compareFormula.ts            # engine vs old closed-form formula (2981/3000 identical is expected)
NODE_OPTIONS=--max-old-space-size=3300 timeout 170 npx vue-tsc --noEmit -p tsconfig.app.json > $HOME/tsc.txt 2>&1; grep -c "error TS" $HOME/tsc.txt
```

- Read another branch without checking it out: `git show <branch>:src/models/PvPTeam.ts`, or for xq:
  `mkdir -p $HOME/br && git archive <branch> src | tar -x -C $HOME/br && XQ_SRC=$HOME/br/src python3 scripts/ai/xq.py ts <sym>`.
- Scripts that import engine code must `import "../../src/models/BestTeamCalculator"` **first** (import cycle
  Kioku <-> BestTeamCalculator, else "Cannot access 'Kioku' before initialization").
- Type-check: **without `NODE_OPTIONS` it OOMs** in the 4 GB VM. The repo has pre-existing errors (232 on main,
  2026-09-30): compare the set of errors before/after your change (`diff` of sorted `error TS` lines with the
  `(line,col)` stripped), don't aim for zero. Don't run `vite build` in the VM (too heavy).
- Probe scripts: write them **outside the repo** as `$HOME/probe.ts` with absolute imports
  (`import "$R/src/models/BestTeamCalculator"` first, R = repo path) so nothing needs deleting. Build
  `new PvPKioku({name, kiokuLvl:120, magicLvl:10, heartphialLvl:10, ascension:5, specialLvl:10, crysIDs:[...],
  subCrysIDs:[]})`, `new PvPTeam(kiokus, "Ally")`, `new PvPBattle(t1, t2, false, seed)`, loop
  `battle.executeNextAction()`; wrap `team.fireTiming` to log a timing. Full tested template: the exedra-kit-fix skill.
- UI check (optional): tar `src index.html package.json vite.config.ts tsconfig*.json` into `debugging/_uicheck.tgz`,
  stage it to the container, run `npx vite --port 5199` there (setsid nohup) and drive it with Playwright
  (Chromium is preinstalled at /opt/pw-browsers). Beta pages need `localStorage.beta = "true"`.

## Git conventions

- Engine work happens on branch **`battle-engine-3.19`**; `main` gets it by merge (the user merges). UI-only work
  from GitHub PRs lands on `main`. Check `git branch --show-current` and `git stash list` before touching
  anything; **never checkout/stash/reset over the user's uncommitted work** (see STATUS.md).
- Commit locally as the user: `git -c user.name="TFF" -c user.email="camilla.jahr@hotmail.com" commit ...` with the
  `Co-Authored-By` / session trailer lines from the system reminder. **No push** (the user compares branches locally).
- One commit per logical change, message explains the game rule with the RVA.

## New game version

Full runbook: [VERSION_UPDATE.md](VERSION_UPDATE.md). Short form:

1. `python3 scripts/ai/verdiff.py bin <old> <new>`: if GameAssembly code is identical (3.19.1), nothing below is needed.
2. Else Il2CppDumper (user, Windows) into `E:\unpackedExedra\<ver>\dump`, `verdiff.py funcs` for the changed methods,
   Ghidra headless per `E:\unpackedExedra\Ghidra\README_headless.md` into `E:\unpackedExedra\<ver>\decompiled`.
3. Point xq at it (`XQ_GAME_VER=<ver>`, `XQ_DUMPER=.../<ver>/dump`), `xq build`, and re-verify cited RVAs.
4. Master data diff + report + newsletter: VERSION_UPDATE.md steps 4-8.
