# New game version: runbook (diff, engine update, newsletter)

Written 2026-10-02 while doing 3.19.0 -> 3.19.1. Follow it top to bottom; every command is copy-paste ready for the
Cowork VM (`mcp__remote-devices__device_bash`, folders under `$HOME/mnt/`). A full run where the code did not change
takes ~30 min; most of it is the engine triage in step 7. The last finished example is `docs/versions/3.19.1/`.

**Trigger:** the user ran Senbei and a new folder `E:\unpackedExedra\<ver>` appeared (it holds
`GameAssembly.unpack.dll`, `MadokaExedra.unpack.exe`, `baselib.unpack.dll`, a `senbei-*.log`). A version is DONE
when `E:\unpackedExedra\<ver>\version_report\DONE` exists.

## 0. Orient (5 min, do not skip)

```
cd $HOME/mnt/exedra-dmg-calc
cat docs/ai/README.md docs/ai/STATUS.md | head -80          # what state the repo is in
git --no-optional-locks branch --show-current; git --no-optional-locks stash list
timeout 170 git --no-optional-locks status --short | head  # FIRST git call on the mount can take ~2.5 min
ls $HOME/mnt/unpackedExedra                                 # versions: the new one has no version_report/DONE
```
- If `git status` shows the user's uncommitted work, **do not** checkout/stash/reset. Work on top of it only if it is
  unrelated, otherwise stop and ask.
- Git writes need delete permission (git leaves `.git/index.lock`): call
  `mcp__remote-devices__device_request_delete_permission` for `E:\exedra-dmg-calc` once, then
  `rm -f .git/index.lock` if a stale one exists. Then `git checkout -b claude/version-<ver>`.
- OLD = the previous version folder (`ls | sort -V`), NEW = the new one. Below: `OLD=3.19.0 NEW=3.19.1`.

## 1. Client binaries: did the code change?

```
python3 scripts/ai/verdiff.py bin $HOME/mnt/unpackedExedra/$OLD $HOME/mnt/unpackedExedra/$NEW
```
Read the line for `GameAssembly.unpack.dll`:
- **CODE IDENTICAL** (only `.rdata` debug timestamp/PDB age, `_RDATA`, `.reloc` differ - this is what 3.19.1 looked
  like): the battle code, every RVA and the 3.19.0 decompile stay valid. Skip step 2.
- **CODE CHANGED**: do step 2.
`MadokaExedra.unpack.exe` / `baselib.unpack.dll` (launcher, Unity runtime) normally differ only in `_RDATA`/`.rsrc`
(protector data, icons); ignore them unless their `.text` changed.

## 2. Only if the code changed

1. The method names come from Il2CppDumper, a Windows .NET exe that cannot run in the VM. Ask the user to run (or
   if unattended, write "BLOCKED: needs Il2CppDumper" in the report and continue with steps 3-6):
   ```
   # in E:\Il2CppDumper (PowerShell)
   .\Il2CppDumper.exe "E:\unpackedExedra\<NEW>\GameAssembly.unpack.dll" "E:\SteamLibrary\steamapps\common\MadokaExedra\MadokaExedra_Data\il2cpp_data\Metadata\global-metadata.dat" "E:\unpackedExedra\<NEW>\dump"
   ```
   (Press a key at the end; the 3.19.0 dump lives in `E:\Il2CppDumper` itself, newer ones in `<ver>\dump`.)
2. Which battle methods changed (bytes compared by name; rel32 operands that only moved are ignored):
   ```
   python3 scripts/ai/verdiff.py funcs $HOME/mnt/unpackedExedra/$OLD/GameAssembly.unpack.dll $HOME/mnt/unpackedExedra/$NEW/GameAssembly.unpack.dll \
       $HOME/mnt/Il2CppDumper/script.json $HOME/mnt/unpackedExedra/$NEW/dump/script.json --prefix ReDriveBattleCore
   ```
   Heuristic: a CHANGED entry can still be a pure re-layout (a RIP-relative global that moved); read it before
   believing it.
3. Decompile the new version: `E:\unpackedExedra\Ghidra\README_headless.md` (make_name_lists.py on the NEW dump,
   import, DecompileList into `E:\unpackedExedra\<NEW>\decompiled`). It needs ~6 GB heap: the user runs it on Windows
   (the VM has 4 GB). Then `export XQ_GAME_VER=$NEW XQ_DUMPER=$HOME/mnt/unpackedExedra/$NEW/dump` for xq.
4. For every changed method: find where the engine ports it (`grep -rn "<old RVA>" src/models docs/ai`, `xq ts`),
   re-read the new code (`xq fn`), fix the port, update the RVA in the code comment and in MECHANICS.md.
5. Ghidra drops float returns and some branches: when C output looks incomplete, disassemble
   (`pip install capstone` once, then `python3 scripts/ai/disasm.py 0x<rva> --ver $NEW`).

## 3. global-metadata.dat

The metadata is not in the Senbei output; it is in the Steam folder. Request read access once
(`mcp__remote-devices__device_request_folder_access`, path `E:\SteamLibrary\steamapps\common\MadokaExedra`; it mounts
as `$HOME/mnt/MadokaExedra`). Do NOT `find` that folder: 27k files, it times out. Then:
```
python3 scripts/ai/verdiff.py meta $HOME/mnt/MadokaExedra/MadokaExedra_Data/il2cpp_data/Metadata/global-metadata.dat \
    --old-literals $HOME/mnt/Il2CppDumper/stringliteral.json
```
Expect the version literal to change (`3.19.0` -> `3.19.1`). "Only in new" literals are mostly literals the old
Il2CppDumper output omitted (it lists only code-referenced ones), not new strings.
Patch date: `ls -la --time-style=+%F_%T $HOME/mnt/MadokaExedra/GameAssembly.dll` (UTC; 3.19.1 = 2026-09-27 14:00).

## 4. Master data (the part that actually changes the game)

The client never ships master data; it comes from the server and the user syncs it into this repo
(`ma-ex-data` downloader -> `dmg_calc_helpers/organize_data.py` -> commits "Auto-sync base data from after patch").
**Never run the downloader yourself** (it logs in with the user's account).
```
git --no-optional-locks log --format='%h %ad %s' --date=format:'%F %H:%M' -12 -- src/assets/base_data
```
- MST_OLD = the last base_data commit **before** the patch date (step 3), written as `<first-after-patch>^`.
  3.19.1: `4ea7254^` (4ea7254 "Auto-sync base data from after patch" = 2026-09-27 14:01, the patch).
- MST_NEW = `HEAD`. If no base_data commit is newer than the patch, the data is not synced yet: say so in the report
  and ask the user to sync; the binary/metadata parts can still be reported.
```
python3 scripts/ai/verdiff.py mst $MST_OLD HEAD | head -120
```

## 5. Write the report

```
mkdir -p $HOME/mnt/unpackedExedra/$NEW/version_report docs/versions/$NEW
python3 scripts/ai/verdiff.py report --old-ver $OLD --new-ver $NEW --mst-old $MST_OLD --mst-new HEAD \
    --metadata $HOME/mnt/MadokaExedra/MadokaExedra_Data/il2cpp_data/Metadata/global-metadata.dat \
    --out $HOME/mnt/unpackedExedra/$NEW/version_report
cp $HOME/mnt/unpackedExedra/$NEW/version_report/report.md docs/versions/$NEW/report.md
```
`report.json` has everything (`summary.*`) for scripting the newsletter.

## 6. Engine triage: what the damage calc / simulator must learn

From report.md, in this order:
1. **New effect types** with engine != yes: `xq effect <TYPE>` (class, methods, users), read the class
   (`xq fn '<Class>$$'`), port it. Even an unused new type is worth porting (3.19.1: LOCK_SPECIAL_ATTACK "Magic Seal"
   had 0 users). A pure state type usually needs: `canAddTo` case (PvPTeam.ts), what it blocks/changes, the AI
   target chain (AITargetSelector.ts `CHAIN_BY_EFFECT_TYPE`, from its GetAIFilteredTargets / GetUnitFilterFuncOrder).
2. **Effect types used by new rows** not plainly covered (`prefix/template?` is usually fine: check `xq effect`).
3. **Conditions** with engine != yes (compareContent coverage is read from BattleConditionParser.ts; the enum NAMES
   there were guesses - the real names are in `xq enum CompareContent`). Port from `BattleUnitConditionChecker.Check`
   0x17e3f10 / `BattleUnitTeamConditionChecker.Check` 0x17e5f30 / `BattleOtherConditionChecker.Check` 0x17e3850.
   Team checker: `switch(content - 201)` for 201-212, then a second switch on 0x12d.. for 301-316.
4. **Smoke-run the new content** (exceptions and engine warnings are printed per stage/kioku):
   ```
   npx tsx scripts/sim/smokeNew.ts --stages <new stage ids, comma-separated> --kiokus "<new kioku>|<another>" --actions 40
   ```
   "FULL AUTO targeting found no eligible target" at the end of a lost battle is harmless. "Active without turn:
   <TYPE>" means an ability effect has no handler: that is a bug to fix (3.19.1 session: IMM_SLIP_DMG).
   For all kiokus: `K=$(python3 -c "import sys; sys.path.insert(0,'scripts/ai'); import xq; print('|'.join(sorted(xq.kioku_data())))")`
   (~60 kiokus per 170 s call; split the list).
5. Balance changes (changed existing skill/passive rows) need nothing in the engine (data-driven) but go in the
   newsletter.
Every port: game rule comment `[CONFIRMED 3.19] Class.Method (0xRVA)`, a check in `scripts/sim/checkMechanics.ts`
that fails without the change, an entry in docs/ai/MECHANICS.md.

## 7. Verify

```
timeout 175 npx tsx scripts/sim/checkFixtures.ts      # all PASS
timeout 175 npx tsx scripts/sim/checkMechanics.ts     # all PASS (count them)
NODE_OPTIONS=--max-old-space-size=3300 timeout 175 npx vue-tsc --noEmit -p tsconfig.app.json > $HOME/tsc.txt 2>&1; grep -c "error TS" $HOME/tsc.txt
```
Type-check: compare the SET of errors with a baseline taken before your change
(`grep "error TS" | sed 's/([0-9]*,[0-9]*)//' | sort`, then `diff`), not the count alone. 229 on 2026-10-02.

## 8. Newsletter

HTML page for the user: copy `docs/versions/3.19.1/newsletter.html` and replace the content (same sections: headline
verdict, what's new in the game, what changed in the client, what the simulator learned, numbers, how it was made).
Keep it factual, cite stage ids / kiokus, and list engine changes with their RVAs. Publish it with the Artifact tool
when available (load the artifact-design skill first), and save a copy to
`E:\unpackedExedra\<NEW>\version_report\newsletter.html` and `docs/versions/<NEW>/newsletter.html`.

## 9. Close out

- docs/ai: MECHANICS.md (new rules), STATUS.md (branch row + session log line), PITFALLS.md (new traps),
  `python3 scripts/ai/xq.py build` (EFFECT_TYPES.md).
- Commit on the branch as the user (ENVIRONMENT.md "Git conventions"), one commit per logical change. No push.
- `touch $HOME/mnt/unpackedExedra/$NEW/version_report/DONE`
- claude.ai project: write `claude/version-<NEW>.md` (short summary + where the report is).
- Tell the user: the newsletter link, the branch name, what needs their action (merge, Il2CppDumper, data sync).

## Don'ts

- Don't run `find` on the Steam folder or `grep -r` on ma-ex-data (huge, times out at 180 s).
- Don't trust old comments that say "the game doesn't handle X": 2026-10-02 found team contents 313-316 and
  condition 22/206/207 marked "not in the source" while the 3.19 decompile handles them.
- Don't infer an effect from its name: IMM_SLIP_DMG was implemented as "DOT immunity"; it is an instant DOT burst.
  Read `AbilityEffectTypeMst.name` (`xq effect`) and the class's Triggering.
- Background processes die when the device_bash call ends; split long work into <170 s calls.
