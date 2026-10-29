# New game version: runbook (diff, engine update, newsletter)

Written 2026-10-02 while doing 3.19.0 -> 3.19.1. Follow it top to bottom; every command is copy-paste ready for the
Cowork VM (`mcp__remote-devices__device_bash`, folders under `$HOME/mnt/`). A full run where the code did not change
takes ~30 min; most of it is the engine triage in step 7. The last finished example is `docs/versions/3.19.1/`.

**Trigger:** the scheduled task "Exedra new-version check" runs daily (see Schedule below), or the user asks.
Step 0b unpacks the client itself; the user no longer has to run Senbei. A version is DONE when
`E:\unpackedExedra\<ver>\version_report\DONE` exists.

Schedule: the "Exedra new-version check" scheduled task runs daily at 12:05 JST (the game patches at 12:00 JST; JST
has no DST), at the same time as ma-ex-data's daily_update.ps1 but independent of it: before reading the new data,
wait for that run's log in daily_runner/runs/ to finish. Most days unpack_version.sh says SAME and nothing new is in
the data: stop silently, no message or notification. BUSY means Steam is still writing the update: wait 10 min and retry (3 times), else stop
silently and the next day's run picks it up. The user may be playing: screenshot before every computer-use step and
wait (up to 60 min) while the game is in front; then skip that step and notify.

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

## 0b. Unpack the installed client (replaces the manual Senbei run + move)

Needs the Steam folder connected (`$HOME/mnt/MadokaExedra` = `E:\SteamLibrary\steamapps\common\MadokaExedra`;
the scheduled task has it, otherwise request read access).
```
bash scripts/ai/unpack_version.sh     # -> "NEW 3.19.2" / "SAME 3.19.1" (nothing new) / an error
```
It reads the version from `MadokaExedra_Data/globalgamemanagers`, runs `E:\unpackedExedra\tools\senbei-linux`
(a Linux build of `E:\Senbei-1.0.1`, output byte-identical to senbei.exe, ~6 s) on GameAssembly.dll, baselib.dll and
MadokaExedra.exe, writes `E:\unpackedExedra\<ver>\*.unpack.*` + a senbei log, and copies `global-metadata.dat` there
too. SAME with no new data (step 4) means there is nothing to do: stop and say so.
Rebuilding senbei-linux (only if Senbei changes): tar the source from the VM into a connected folder, stage it to the
cloud container (it has cargo + crates.io; the VM cannot download rustup), `rm rust-toolchain.toml && cargo build
--release`, check `objdump -T target/release/senbei | grep -o "GLIBC_[0-9.]*" | sort -Vu | tail -1` <= 2.35 (the
VM's glibc), commit the binary back to `E:\unpackedExedra\tools\senbei-linux`.

## 1. Client binaries: did the code change?

```
python3 scripts/ai/verdiff.py bin $HOME/mnt/unpackedExedra/$OLD $HOME/mnt/unpackedExedra/$NEW
```
Read the line for `GameAssembly.unpack.dll`:
- **CODE IDENTICAL** (only `.rdata` debug timestamp/PDB age, `_RDATA`, `.reloc` differ - this is what 3.19.1 looked
  like): the battle code, every RVA and the 3.19.0 decompile stay valid. Skip step 2.
- **CODE CHANGED**: first `python3 scripts/ai/verdiff.py runs $HOME/mnt/unpackedExedra/$OLD $HOME/mnt/unpackedExedra/$NEW`
  lists every changed byte run with the (old) method containing it. When the section sizes match nothing moved, so
  the names are exact. 3.19.11: 12 runs, all in 3 lottery methods (`lotteryNumberUpperLimit` int -> long), battle
  code identical, every RVA still valid. Only if a run lands in battle code (or the layout moved) do step 2;
  otherwise Il2CppDumper is optional (names on record only).
`MadokaExedra.unpack.exe` / `baselib.unpack.dll` (launcher, Unity runtime) normally differ only in `_RDATA`/`.rsrc`
(protector data, icons); ignore them unless their `.text` changed.

## 2. Only if the code changed

Before the dump exists: `python3 scripts/ai/meta_idents.py $HOME/mnt/unpackedExedra/$OLD/global-metadata.dat $HOME/mnt/unpackedExedra/$NEW/global-metadata.dat --out docs/versions/$NEW --grep 'Skill|Effect|State|Battle'`
lists new/gone type, method and field names (3.21.0: Step-Up skills, CONSUME_SELF_HP). Put them in the newsletter.

1. The method names come from Il2CppDumper, a Windows .NET exe that cannot run in the VM. Run it yourself on the
   Windows desktop with computer use: write the version to `E:\Il2CppDumper\run_dump_ver.txt` and double-click
   `E:\Il2CppDumper\run_dump.bat` in File Explorer (click tier: navigate by clicking, no typing); it writes
   `<ver>\dump`, `dump\il2cppdumper.log` and `dump\EXIT.txt`. Equivalent command:
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
   import, DecompileList into `E:\unpackedExedra\<NEW>\decompiled`). It needs ~6 GB heap, so it runs on Windows:
   `make_name_lists.py` in the VM into `E:\unpackedExedra\ghidra_work_<NEW>`, the version into
   `Ghidra\run_ghidra_ver.txt`, then double-click `E:\unpackedExedra\Ghidra\run_ghidra.bat` (logs and
   GHIDRA_EXIT.txt in `<NEW>\decompiled`; ~5 min in total for 3.21.0). Then copy factories.json / state_direction.json /
   ability_side.json from the previous decompile and add the new factory entries, and `_index_targets.tsv` = targets.tsv.
   Semantic diff: `python3 scripts/engine/decdiff.py <old>/decompiled <new>/decompiled --only <new rvas> --ignore-offsets --loose`. Then `export XQ_GAME_VER=$NEW XQ_DUMPER=$HOME/mnt/unpackedExedra/$NEW/dump` for xq.
4. For every changed method: find where the engine ports it (`python3 scripts/engine/ledger.py --rva <old RVA>`, `grep -rn "<old RVA>" src/engine src/battle docs/ai`),
   re-read the new code (`xq fn`), fix the port, update the RVA in the code comment and in MECHANICS.md.
5. Ghidra drops float returns and some branches: when C output looks incomplete, disassemble
   (`pip install capstone` once, then `python3 scripts/ai/disasm.py 0x<rva> --ver $NEW`).

## 3. global-metadata.dat

`unpack_version.sh` copies `global-metadata.dat` into the version folder (from 3.19.1 on), and `verdiff.py report`
diffs it against the previous version's copy automatically. 3.19.0 has no copy: compare with its Il2CppDumper
literal list instead. Do NOT `find` the Steam folder: 27k files, it times out. By hand:
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
- **Also diff the newest download**: the user's downloader writes `../ma-ex-data/gamedata/manifests/en-Latn` (raw API
  dumps) before base_data is synced. `python3 scripts/ai/verdiff.py mst HEAD $HOME/mnt/ma-ex-data/gamedata/manifests/en-Latn`
  lists what base_data does not have yet (2026-10-02: Aqua Tempest, contents 212/403). Port the engine side of it now
  (conditions are data-driven once synced) and tell the user to sync base_data; the engine only reads base_data.

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
   had 0 users). Port the new class into `src/engine` (its factory entry, CanAddTo, AI filters) like any other class.
2. **Effect types used by new rows** not plainly covered (`prefix/template?` is usually fine: check `xq effect`).
3. **Conditions** with engine != yes (compareContent coverage is read from BattleConditionParser.ts; the enum NAMES
   there were guesses - the real names are in `xq enum CompareContent`). Port from `BattleUnitConditionChecker.Check`
   0x17e3f10 / `BattleUnitTeamConditionChecker.Check` 0x17e5f30 / `BattleOtherConditionChecker.Check` 0x17e3850.
   Team checker: `switch(content - 201)` for 201-212, then a second switch on 0x12d.. for 301-316.
4. **Smoke-run the new content** (exceptions and engine warnings are printed per stage/kioku):
   ```
   STAGES=<new stage ids, comma-separated> npx tsx scripts/sim/engineSweep.ts 40 2
   WITH="<new kioku>|<another>" npx tsx scripts/sim/engineSweep.ts 15 2
   ```
5. Balance changes (changed existing skill/passive rows) need nothing in the engine (data-driven) but go in the
   newsletter.
Every port: game rule comment `[CONFIRMED 3.19] Class.Method (0xRVA)`, a check (`scripts/sim/checkEngine321.ts` style)
that fails without the change, an entry in docs/ai/MECHANICS.md.

## 6b. Wiki generator (ma-ex-data/wiki): must say what the engine does

The wiki pages decode conditions with `wiki/condition_parser.py` and effect values with `wiki/wiki_helpers.py`
(`_formatValue`). **Whatever the engine learns in step 6 goes into the wiki in the same session**, with the same meaning:
every CompareContent of `src/engine/.../CompareContent.ts` has a parser entry (the wikicheck `SYNC COND` line checks
this), every effect value slot is labelled with what the ported class reads it as (the `.ctor(AbilityEffectInfo)`
of the class: `xq effect <TYPE>`, `decomp.py fn '<Class>\$\$\.ctor'`), ids are resolved to names (skills by
skillUniqueId, kioku, characters, unique-state patterns), and per-mille fields are shown as %. A slot the game code
never reads is labelled as unused, not "ValueN". Comment each rule with the class / RVA it comes from.
```
pip install uv -q && ~/.local/bin/uv python install 3.12      # once per VM (the wiki code needs Python 3.12)
cd $HOME/mnt/ma-ex-data && ~/.local/bin/python3.12 $HOME/mnt/exedra-dmg-calc/scripts/ai/wikicheck.py
```
Re-run until it prints OK (VALUE UNKNOWN only for slots the engine itself has no meaning for). Edit only
condition_parser.py / wiki_helpers.py (keep their line endings); don't run the page generators or the uploader and
don't commit in ma-ex-data: the user does that.

## 6c. New data after the patch (base_data sync)

When the user's download (ma-ex-data/gamedata/manifests/en-Latn) is newer than base_data: `verdiff.py mst HEAD <manifests>`;
sync it on the branch with the same transform as `ma-ex-data/dmg_calc_helpers/organize_data.py` (files without "_" plus
get_config.json: `payload.mstList`, `json.dumps(sort_keys=True, ensure_ascii=False, indent=4)`, no trailing newline;
the images part of that script is the user's) as its own commit. Smoke-test the new content on the engine:
`STAGES=<new ids> npx tsx scripts/sim/engineSweep.ts <n> 2` and `WITH="<new kioku>|..." npx tsx scripts/sim/engineSweep.ts 15 2`
(prints Step-Up uses / HP costs too), then the newsletter gets the kits, events and balance changes.

## 7. Verify

```
npm run engine && timeout 175 npx tsx scripts/sim/checkFixturesEngine.ts   # all PASS
NODE_OPTIONS=--max-old-space-size=3300 timeout 175 npx vue-tsc --noEmit -p tsconfig.app.json > $HOME/tsc.txt 2>&1; grep -c "error TS" $HOME/tsc.txt
```
Type-check: compare the SET of errors with a baseline taken before your change
(`grep "error TS" | sed 's/([0-9]*,[0-9]*)//' | sort`, then `diff`), not the count alone. 229 on 2026-10-02.

## 8. Newsletter (for players)

The newsletter is for other players of the game, not for the user: gameplay only. Cover new mechanics and how they
play (buttons, costs, limits, teambuilding hints), new kiokus and kits, events and stages, balance changes, raid / PvP
rule changes, quality-of-life changes and one simulator-status line. Mark features nothing uses yet ("no units yet").
Leave out decompile and client internals (RVAs, method/class names, byte diffs, tools, branches, check counts); those
go to the user in the final chat message. Write only mechanics confirmed in code or data. Model:
`docs/versions/3.21.0/newsletter.html`. Publish it with the Artifact tool (load the artifact-design skill first), and
save a copy to `E:\unpackedExedra\<NEW>\version_report\newsletter.html` and `docs/versions/<NEW>/newsletter.html`.

## 8b. Discord client-update notes (same channel as patch_notes.py)

Only when the client code changed. `ma-ex-data/patch_notes.py` already posts the master-data changes (new kioku,
events, stages, balance rows) to the patch-notes webhooks, so these notes cover only what is visible **in the code**:
new mechanics and how they play (buttons, costs, caps, auto-battle rules), changed rules of existing mechanics, raid /
PvP / tower rule changes, menu and quality-of-life features, things prepared but unused ("no units yet"), and one
simulator line. A unit or event from the data appears only as "first used by X" context, never as its own item.

Format, like patch_notes.py: Discord markdown, first line `**Client update - <NEW>**`, bold section lines with one
emoji, short bullets, no internal ids, class/method names, RVAs, file names, tools or check counts, nothing guessed.
Discord `<t:...:f>` tags for any time (copy them, never convert). Up to ~5000 characters (the script splits into
2000-char messages; it refuses over 6000). Model: `docs/versions/3.21.0/discord_notes.md`.

1. Write it to `docs/versions/<NEW>/discord_notes.md` and copy it to
   `E:\unpackedExedra\<NEW>\version_report\discord_notes.md`.
   `python3 scripts/ai/post_client_notes.py docs/versions/<NEW>/discord_notes.md --no-post` checks the title and length.
2. Post from Windows (the VM and the cloud container can't reach discord.com): write `<NEW>` to
   `E:\unpackedExedra\post_notes_ver.txt` (add a second line `private` for a test post) and double-click
   `E:\unpackedExedra\post_notes.bat` in File Explorer (same computer-use steps as run_dump.bat). It runs
   `post_client_notes.py` with ma-ex-data's venv Python, posts to `daily_runner\webhooks.json` -> patch_notes ->
   public (or private), and writes `version_report\discord_post.log`, `DISCORD_EXIT.txt` (0 = ok) and
   `DISCORD_POSTED`. It refuses to post publicly twice while `DISCORD_POSTED` exists.
3. Poll `DISCORD_EXIT.txt` from the VM; if it isn't 0, tell the user what the log says. Never print webhook URLs.

## 9. Close out

- docs/ai: MECHANICS.md (new rules), STATUS.md (branch row + session log line), PITFALLS.md (new traps),
  `python3 scripts/ai/xq.py build` (EFFECT_TYPES.md).
- Commit on the branch as the user (ENVIRONMENT.md "Git conventions"), one commit per logical change. No push.
- `touch $HOME/mnt/unpackedExedra/$NEW/version_report/DONE`
- claude.ai project: write `claude/version-<NEW>.md` (short summary + where the report is).
- Tell the user: the newsletter link, whether the Discord notes posted, the branch name, what needs their action (merge, Il2CppDumper, data sync).

## Don'ts

- Don't run `find` on the Steam folder or `grep -r` on ma-ex-data (huge, times out at 180 s).
- Don't trust old comments that say "the game doesn't handle X": 2026-10-02 found team contents 313-316 and
  condition 22/206/207 marked "not in the source" while the 3.19 decompile handles them.
- Don't infer an effect from its name: IMM_SLIP_DMG was implemented as "DOT immunity"; it is an instant DOT burst.
  Read `AbilityEffectTypeMst.name` (`xq effect`) and the class's Triggering.
- Background processes die when the device_bash call ends; split long work into <170 s calls.

## src/engine (1:1 port) after a code change

Order that worked for 3.21.0 (one session, ~2 h):
0. `python3 scripts/engine/dump_parse.py <NEW>/dump/dump.cs ~/t.json`; then `ledger.py --check ~/t.json --apply-moves`
   (moved @rva tags), `fields_check.py ~/t.json --apply` (moved field offsets, NEW/GONE fields),
   `gen_shells.py ~/t.json --only <new types>`, and for existing types with new members
   `ENGINE_OUT=~/shells gen_shells.py ~/t.json --force --only <types>` + `merge_members.py ~/shells <types>`.
   Enums: compare const fields of both dumps and regenerate changed enums with `gen_shells.py --force --only`.
   Factories: diff the StringLiteral lists of UnitStateFactory / AbilityEffectFactory .cctor and add the entries.
   Then `echo <NEW> > scripts/ai/GAME_VER` (default version of xq / decomp / disasm / fill_trivial).

1. New dump: `python3 scripts/engine/dump_parse.py <ver>/dump/dump.cs /tmp/t.json && python3 scripts/engine/ledger.py --check /tmp/t.json`
   (new/removed/changed members, moved RVAs). Changed functions from `verdiff.py funcs`: `ledger.py --rva <rva,...>`.
2. Re-port those methods from the new decompile (`XQ_GAME_VER=<ver> python3 scripts/engine/decomp.py fn ...`), update
   `@rva` tags, `gen_shells.py --only <Ns.Type>` for new types, `fill_trivial.py --ver <ver>`.
3. `npx tsc --noEmit -p tsconfig.engine.json` (0 errors), `ledger.py --write`.

