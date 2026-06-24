# Share image → real domain link, via Supabase Edge Function

## What this actually does (no GitHub Action workflow involved)

Note: despite the "GitHub Action" framing earlier in the conversation,
what's actually built here is a **Supabase Edge Function** that calls the
GitHub Contents API directly — no `.github/workflows/*.yml` file, no CI
run. It's simpler: one HTTP call from the Edge Function commits the file
immediately, instead of triggering a workflow and polling for it to
finish. Functionally the same end result (a real file lands in
`gh-pages`), just less moving parts.

## How it fits together

1. Browser generates the PNG, uploads it to the `share-images` Storage
   bucket (already set up).
2. Browser calls this Edge Function (`create-share-page`) with the
   Storage URL + a share ID + the display name.
3. The function (holding your GitHub PAT as a secret) commits a tiny
   static HTML file to `gh-pages` at
   `exedra-dmg-calc/share/<shareId>/index.html`, containing
   `og:image`/`og:title` meta tags pointing at the real image.
4. The function returns
   `https://thefrozenfishy.github.io/exedra-dmg-calc/share/<shareId>/` —
   THAT's what gets copied to the clipboard, not the raw Supabase URL.
5. GitHub Pages picks up the new commit on its normal deploy cycle
   (usually live within a minute or so). Discord (or anyone) fetching
   that URL gets real HTML with the right meta tags and embeds the image,
   from your actual domain.
6. If anything in steps 2-4 fails for any reason (PAT expired, function
   not deployed yet, GitHub API hiccup), `image.ts` falls back to the raw
   Storage URL instead of failing the share outright — Discord still
   embeds that fine, it just shows the supabase.co domain instead.

## 1. Double-check the repo/owner

This function is hardcoded (at the top of `index.ts`) to:

```
GITHUB_OWNER = "thefrozenfishy"
GITHUB_REPO  = "exedra-dmg-calc"
GITHUB_BRANCH = "gh-pages"
PAGES_BASE_PATH = "exedra-dmg-calc"
```

Inferred from `https://thefrozenfishy.github.io/exedra-dmg-calc/` and
`vite_config.ts`'s `base: "/exedra-dmg-calc/"`. If your actual repo name
differs from the Pages path (rare, but possible if you renamed the repo
after Pages was already set up), fix these constants before deploying.

## 2. Set the GitHub PAT as a Supabase secret

**Never put the PAT in code, an env file you commit, or anywhere client-
side.** It only ever lives as a Supabase secret, used solely inside this
server-side function.

```powershell
npx supabase secrets set GITHUB_PAT=github_pat_xxxxxxxxxxxx --project-ref your-project-ref
```

(Find your project ref in the Supabase dashboard URL, or
Settings → General.)

## 3. Deploy the function

From your repo root (assuming the Supabase CLI is set up — `npx supabase login` first if you haven't):

```powershell
npx supabase functions deploy create-share-page
```

This uploads `index.ts` as the `create-share-page` Edge Function. No
separate build step — Deno handles the imports directly.

## 4. Test it once before relying on it

You can test the function directly with curl/Postman, or just click
"Share Image" in the app and check:
- Does a new file actually show up under `exedra-dmg-calc/share/<id>/`
  in the `gh-pages` branch on GitHub shortly after?
- Does the copied link (paste it into your browser) show the image after
  GitHub Pages finishes deploying (give it ~30-60 seconds)?
- Paste that link into a Discord channel — does it embed?

## Security notes

- The PAT is fine-grained, scoped to ONLY this repo, with Contents
  read/write and nothing else. If it ever leaks, revoke it immediately
  from GitHub Settings → Developer settings → Personal access tokens,
  and rotate (generate a new one, update the Supabase secret).
- The function validates that `imageUrl` actually points at your
  `share-images` Supabase bucket before committing anything — this stops
  someone from calling the function directly (bypassing your app) to make
  it commit arbitrary HTML/meta tags pointing at any URL they want into
  your repo.
- `shareId` is validated as a short hex string before being used in a
  file path / GitHub API URL, so it can't be used for path traversal
  (e.g. `../../../something`) or to inject characters into the API
  request.
- Every share is a permanent file in `gh-pages` (per your earlier call —
  old links shouldn't break). There's no cleanup job here either; same
  caveat as the Storage bucket itself — fine for now, something to
  revisit later if it ever becomes a real volume of files.
