# PNG → WebP migration

## What changed

- **`image.ts`** — sharing, downloading, and "open in new tab" now render
  **WebP** (quality 0.92) instead of PNG. Clipboard copy is deliberately left
  as **PNG**, because the Async Clipboard API only mandates `image/png`
  support (`ClipboardItem.supports("image/webp")` is still `false` in most
  browsers) — writing WebP there would silently break copy-to-clipboard.
  A `withExtension()` helper fixes up download filenames automatically, so
  it doesn't matter if a caller still passes `"foo.png"`.
- **Cloudflare Worker (`index.ts`) and Supabase edge function (`index.ts`)** —
  **no changes needed.** Both only check that `imageUrl` points into the
  `share-images/` bucket path; neither cares about the file extension. Every
  existing `/share/:id` link keeps working exactly as before.
- **`0017_share_images_bucket.sql`** — **no changes needed.** The bucket and
  its RLS policies aren't scoped to a file type.
- **`migrate-png-to-webp.mjs`** (new) — a one-off script you run locally to
  convert the PNGs that are already sitting in storage and repoint the
  matching KV share entries.

Nothing about `shareId` or the `/share/:id` URL shape changes — only what
`imageUrl` points at inside each stored entry.

## Running the migration script

```bash
npm install @supabase/supabase-js sharp
```

Set these env vars (all secrets — run this on your own machine, never commit
them):

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (needed to read/write every user's files under RLS) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Overview |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Workers & Pages → KV → click the `SHARE_PAGES` namespace |
| `CLOUDFLARE_API_TOKEN` | My Profile → API Tokens → a token with **Workers KV Storage: Edit** on that account |

Then:

```bash
# 1. Dry run first — prints exactly what it would do, changes nothing
node migrate-png-to-webp.mjs

# 2. Convert PNGs to WebP and repoint the KV entries (old PNGs kept)
node migrate-png-to-webp.mjs --write

# 3. Once you've spot-checked a few share links still load, reclaim the space
node migrate-png-to-webp.mjs --write --delete-old
```

It's safe to stop and re-run at any point — already-converted files are
overwritten (`upsert`), and it only deletes a PNG after both the WebP upload
*and* the matching KV update have succeeded, so a share link can never end up
pointing at a file that doesn't exist.

## One thing worth spot-checking

Static WebP is supported for `og:image`/Discord embeds, Twitter/X cards, and
in-browser `<img>` display everywhere that matters today, so this shouldn't
break existing share links. Still, paste a couple of migrated share links
into Discord (or wherever you post these most) after running `--write` and
before running `--delete-old`, just to confirm the embed renders the way you
expect.
