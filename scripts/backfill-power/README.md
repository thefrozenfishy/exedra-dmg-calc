# Power score backfill (one-shot)

Recomputes `power_total`, `power_whale`, per-role power, and kioku counts
for every existing user from their stored `user_characters` rows, using the
CURRENT default formula — never per-user beta overrides.

This exists because power scores are normally written when a user's own
client saves characters. Existing accounts won't get a score until they
next open the app — this fills that gap once, for everyone who already has
characters saved.

## Why there's a separate prepare step

`PowerValue.ts` and friends live inside your main app, which has
`"type": "module"` in its `package.json`. That makes Node treat every
`.ts`/`.js` file under your repo as an ES module — which breaks ts-node's
plain CommonJS `require()` if this script tries to import those files
directly from `src/`.

Rather than fight that, `prepare.ps1` copies the 5 `.ts` files this script
actually needs (`PowerValue.ts`, `AccountSimilarityScore.ts`,
`KiokuTypes.ts`, `helpers.ts`, `mathFuncs.ts`) into `./vendor/`, along with
the `base_data/*.json` files `helpers.ts` reads, with every import path
rewritten to a plain flat `./...` reference. Since `backfill-power/` has
its own `package.json` with no `"type": "module"`, everything under it
(including `./vendor/`) runs as plain CommonJS — no ESM/CJS conflict, and
no absolute paths anywhere, just normal relative imports.

It also swaps the `betaSettings` import for `vendor/betaSettingsStub.ts`
(plain `BETA_DEFAULTS`, no Pinia, no per-user overrides — per your call),
and strips `KiokuTypes.ts`'s unused `PvPTeam`/`BattleState` dependency
(not vendored, not needed for scoring).

## 1. Place this folder in your repo

Drop the whole `backfill-power/` folder somewhere in your repo, e.g. at
the root as `scripts/backfill-power/`.

## 2. Run the prepare step

Open `prepare.ps1` and check `$SrcRoot` near the top — it assumes your
real source folder is at `..\..\src` relative to wherever you put this
folder. Edit that one line if your repo's source lives somewhere else.

From inside `backfill-power/`, in PowerShell:

```powershell
.\prepare.ps1
```

This creates `./vendor/` with the patched copies. Re-run this step any
time you change the real `PowerValue.ts` / `AccountSimilarityScore.ts` /
etc. and want the backfill to reflect the new version.

## 3. Install what's needed to run it

```powershell
npm install --no-save @supabase/supabase-js ts-node typescript
```

(`--no-save` since this is disposable — it won't touch your real
package.json. If you'd rather add these as real devDependencies in your
main project instead, that works too, just run the script from wherever
those are installed.)

## 4. Get your service role key

Supabase dashboard → your project → **Settings → API** → copy the
**`service_role`** key (NOT the anon/publishable key — this script needs
to read and write every user's row, which means bypassing RLS on purpose).

**Treat this key like a password.** Don't commit it, don't paste it
anywhere public, don't reuse it for anything else. If it ever leaks,
rotate it from the same Settings → API page.

## 4.5 Remove the bad .ts code from KiokuTypes.ts

```ts
    ...(elem ? [dmgUpPortraits[elem]] : []),
    "",
```
fails for some reason, delete it

## 5. Run it

**PowerShell:**

```powershell
$env:SUPABASE_URL="https://yourproject.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="ey...."
npx ts-node -P tsconfig.json backfill.ts
```

Or all on one line with `;`:

```powershell
$env:SUPABASE_URL="https://yourproject.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="ey...."; npx ts-node -P tsconfig.json backfill.ts
```

**bash/zsh** (if you ever run this from WSL/Mac/Linux instead):

```bash
SUPABASE_URL="https://yourproject.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="ey...." \
npx ts-node -P tsconfig.json backfill.ts
```

It logs progress every 25 users and prints a final summary of
updated/skipped/failed counts. It's safe to re-run — every user's score is
just fully recomputed and overwritten each time, nothing is additive.

## Notes

- Accounts with no `user_characters` rows yet are skipped (left at the
  column defaults), not treated as errors.
- Failed rows are logged with the error and don't stop the run — re-run
  the script afterward to retry just those (it'll redo everyone, which is
  fine, just slightly redundant).
- This does NOT touch `last_seen_at` — that's only set by the app itself
  (`touchLastSeen()` on app load), so running this backfill won't make
  stale accounts look active again. That's intentional: a score backfill
  isn't the same thing as someone actually opening the app.
- If you ever tune the formula in `betaSettings.ts`'s `BETA_DEFAULTS` and
  want to re-run this later, update `vendor/betaSettingsStub.ts`'s values
  to match first. `prepare.ps1` only copies the 5 named files from your
  real `src/` — it never touches `betaSettingsStub.ts`, since that file
  doesn't exist in your real repo at all (it's specific to this script).
- Everything else in `./vendor/` is fully regenerated each time you run
  `prepare.ps1`, so it's safe to delete and re-run.
