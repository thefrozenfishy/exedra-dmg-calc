#!/usr/bin/env node
//
// One-off migration: convert every existing PNG in the `share-images`
// Supabase Storage bucket to WebP, then repoint the matching Cloudflare
// Workers KV share entries (SHARE_PAGES) at the new files.
//
// This does NOT touch shareId values or /share/:id URLs -- those are
// untouched, only the `imageUrl` stored inside each KV entry changes.
// Anyone who already has a share link keeps using the exact same link.
//
// PNGs are detected by the object's stored content type, NOT by file
// extension: an older client build uploaded PNG data under a .webp name
// (canvas.toBlob silently falls back to PNG in browsers that can't encode
// WebP). Those files are re-encoded IN PLACE (same path, same URL), so they
// need no KV update and must never be deleted afterwards.
//
// SAFE BY DEFAULT: runs in dry-run mode (no writes) unless you pass
// --write. Old PNGs are only deleted if you also pass --delete-old,
// and only after both the webp upload AND the KV update for that file
// have succeeded -- so a share page can never end up pointing at a
// file that doesn't exist yet.
//
// Usage:
//   npm install @supabase/supabase-js sharp
//   SUPABASE_URL=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   CLOUDFLARE_ACCOUNT_ID=... \
//   CLOUDFLARE_KV_NAMESPACE_ID=... \
//   CLOUDFLARE_API_TOKEN=... \
//     node migrate-png-to-webp.mjs                  # dry run, just prints a plan
//     node migrate-png-to-webp.mjs --write           # actually converts + updates KV
//     node migrate-png-to-webp.mjs --write --delete-old   # + deletes the old PNGs after
//
// Required credentials (all secrets -- run this locally, never commit them):
//   SUPABASE_URL                 your project URL, https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    Project Settings -> API -> service_role key
//                                 (needed to list/read/write every user's files;
//                                 the anon key can't do that under your RLS policies)
//   CLOUDFLARE_ACCOUNT_ID        Cloudflare dashboard -> Workers & Pages -> Overview
//   CLOUDFLARE_KV_NAMESPACE_ID   the id of the SHARE_PAGES KV namespace
//                                 (Workers & Pages -> KV -> click the namespace)
//   CLOUDFLARE_API_TOKEN         a token with "Workers KV Storage: Edit" permission
//                                 on that account (My Profile -> API Tokens)

import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

const args = new Set(process.argv.slice(2))
const WRITE = args.has("--write")
const DELETE_OLD = args.has("--delete-old")

const BUCKET = "share-images"
const WEBP_QUALITY = 92 // sharp uses 0-100; matches the 0.92 used client-side

const env = (name) => {
    const v = process.env[name]
    if (!v) {
        console.error(`Missing required env var: ${name}`)
        process.exit(1)
    }
    return v
}

const SUPABASE_URL = env("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY")
const CF_ACCOUNT_ID = env("CLOUDFLARE_ACCOUNT_ID")
const CF_NAMESPACE_ID = env("CLOUDFLARE_KV_NAMESPACE_ID")
const CF_API_TOKEN = env("CLOUDFLARE_API_TOKEN")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ---------------------------------------------------------------------------
// Supabase Storage: recursively list every .png under the bucket
// ---------------------------------------------------------------------------

// The extension can lie (PNG bytes stored as *.webp), so go by the stored
// content type. Only fall back to the extension if there's no usable mimetype.
function needsConversion(item) {
    const mime = (item.metadata?.mimetype ?? "").toLowerCase()
    if (mime === "image/png") return true
    return mime !== "image/webp" && item.name.toLowerCase().endsWith(".png")
}

async function listAllPngs(prefix = "") {
    const results = []
    const PAGE_SIZE = 1000

    for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
            limit: PAGE_SIZE,
            offset,
            sortBy: { column: "name", order: "asc" },
        })
        if (error) throw new Error(`list(${prefix}) failed: ${error.message}`)

        for (const item of data ?? []) {
            const fullPath = prefix ? `${prefix}/${item.name}` : item.name
            // Supabase Storage returns folders with id === null and no metadata.
            const isFolder = item.id === null && !item.metadata
            if (isFolder) {
                results.push(...(await listAllPngs(fullPath)))
            } else if (needsConversion(item)) {
                results.push(fullPath)
            }
        }

        if (!data || data.length < PAGE_SIZE) break
    }
    return results
}

// foo.png -> foo.webp (new path, URL changes). Anything else (e.g. PNG data
// already stored as foo.webp) keeps its path and is overwritten in place.
function pngPathToWebp(path) {
    return /\.png$/i.test(path) ? path.replace(/\.png$/i, ".webp") : path
}

async function convertOne(path) {
    const webpPath = pngPathToWebp(path)
    const inPlace = webpPath === path

    const { data: downloaded, error: downloadError } = await supabase.storage.from(BUCKET).download(path)
    if (downloadError) throw new Error(`download(${path}) failed: ${downloadError.message}`)
    const pngBuffer = Buffer.from(await downloaded.arrayBuffer())

    // Trust the actual bytes over the metadata: if this is already WebP,
    // leave it alone (re-encoding lossy -> lossy would only degrade it).
    const { format } = await sharp(pngBuffer).metadata()
    if (format === "webp") return { skipped: true }

    const webpBuffer = await sharp(pngBuffer).webp({ quality: WEBP_QUALITY }).toBuffer()

    if (WRITE) {
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(webpPath, webpBuffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
        })
        if (uploadError) throw new Error(`upload(${webpPath}) failed: ${uploadError.message}`)
    }

    const { data: oldUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const { data: newUrlData } = supabase.storage.from(BUCKET).getPublicUrl(webpPath)

    return {
        oldPath: path,
        webpPath,
        inPlace,
        oldUrl: oldUrlData.publicUrl,
        newUrl: newUrlData.publicUrl,
        oldBytes: pngBuffer.length,
        newBytes: webpBuffer.length,
    }
}

// ---------------------------------------------------------------------------
// Cloudflare Workers KV
// ---------------------------------------------------------------------------

const CF_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}`

async function cfListAllKeys() {
    const keys = []
    let cursor
    do {
        const url = new URL(`${CF_API_BASE}/keys`)
        url.searchParams.set("limit", "1000")
        if (cursor) url.searchParams.set("cursor", cursor)

        const res = await fetch(url, { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } })
        const json = await res.json()
        if (!json.success) throw new Error(`KV list failed: ${JSON.stringify(json.errors)}`)

        keys.push(...json.result)
        cursor = json.result_info?.cursor || undefined
    } while (cursor)
    return keys // [{ name, expiration }]
}

async function cfGetValue(key) {
    const res = await fetch(`${CF_API_BASE}/values/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`KV get(${key}) failed: ${res.status} ${await res.text()}`)
    return res.text()
}

// Writes the value back with the SAME absolute expiration it already had,
// so touching a share entry doesn't quietly reset its 1-year TTL.
async function cfPutValue(key, value, expiration) {
    const url = new URL(`${CF_API_BASE}/values/${encodeURIComponent(key)}`)
    if (expiration) url.searchParams.set("expiration", String(expiration))

    const res = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "text/plain" },
        body: value,
    })
    const json = await res.json()
    if (!json.success) throw new Error(`KV put(${key}) failed: ${JSON.stringify(json.errors)}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log(`mode: ${WRITE ? "WRITE" : "DRY RUN (pass --write to actually change anything)"}`)
    console.log(`delete old PNGs after migrating: ${DELETE_OLD ? "yes" : "no"}`)
    console.log("")

    console.log("Listing PNGs in storage bucket...")
    const pngPaths = await listAllPngs()
    console.log(`Found ${pngPaths.length} PNG file(s).\n`)

    const urlMap = new Map() // oldUrl -> newUrl
    const converted = []
    let totalOldBytes = 0
    let totalNewBytes = 0
    let failures = 0
    let skipped = 0

    for (const path of pngPaths) {
        try {
            const result = await convertOne(path)
            if (result.skipped) {
                console.log(`  skipped ${path} (already WebP data)`)
                skipped++
                continue
            }
            // In-place conversions keep the same URL, so there's nothing to repoint.
            if (!result.inPlace) urlMap.set(result.oldUrl, result.newUrl)
            converted.push(result)
            totalOldBytes += result.oldBytes
            totalNewBytes += result.newBytes
            console.log(`  converted ${path} (${result.oldBytes}B -> ${result.newBytes}B)`)
        } catch (err) {
            console.error(`  FAILED converting ${path}:`, err.message)
            failures++
        }
    }

    const pct = totalOldBytes ? (100 * (1 - totalNewBytes / totalOldBytes)).toFixed(1) : "0"
    console.log(`\nStorage: ${converted.length}/${pngPaths.length} converted (${skipped} skipped), ${totalOldBytes} -> ${totalNewBytes} bytes (${pct}% smaller)\n`)

    let updated = 0
    let kvKeys = []
    if (urlMap.size === 0) {
        console.log("No file URLs changed, skipping the Cloudflare KV scan.\n")
    } else {
        console.log("Listing Cloudflare KV keys...")
        kvKeys = await cfListAllKeys()
        console.log(`Found ${kvKeys.length} KV entr${kvKeys.length === 1 ? "y" : "ies"}.\n`)
    }

    for (const { name, expiration } of kvKeys) {
        const raw = await cfGetValue(name)
        if (!raw) continue

        let entry
        try {
            entry = JSON.parse(raw)
        } catch {
            console.warn(`  skipping ${name}: value isn't JSON`)
            continue
        }

        const newUrl = urlMap.get(entry.imageUrl)
        if (!newUrl) continue // this share doesn't point at a PNG we just migrated

        entry.imageUrl = newUrl
        console.log(`  updating share ${name} -> ${newUrl}`)
        if (WRITE) {
            await cfPutValue(name, JSON.stringify(entry), expiration)
        }
        updated++
    }
    console.log(`\nKV entries updated: ${updated}\n`)

    if (DELETE_OLD) {
        if (!WRITE) {
            console.log("Skipping delete: --delete-old only takes effect together with --write.")
        } else {
            // NEVER include in-place conversions here: their old path IS the new
            // WebP file, so deleting it would destroy the converted image.
            const toDelete = converted.filter((c) => !c.inPlace).map((c) => c.oldPath)
            if (toDelete.length === 0) {
                console.log("Nothing to delete.")
            } else {
                console.log(`Deleting ${toDelete.length} old PNG file(s)...`)
                const { error } = await supabase.storage.from(BUCKET).remove(toDelete)
                if (error) console.error("  delete failed:", error.message)
                else console.log("  done.")
            }
        }
    } else {
        console.log("Old PNGs left in place. Re-run with --write --delete-old once you've confirmed shares still work.")
    }

    if (failures > 0) {
        console.error(`\n${failures} file(s) failed to convert -- see FAILED lines above.`)
        process.exitCode = 1
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
