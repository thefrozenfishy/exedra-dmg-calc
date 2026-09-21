// upload using ``wrangler deploy``
//
// Pretty URLs, two shapes, same KV namespace, "pretty:" prefix so they can never collide
// with the legacy hex shareId keyspace:
//   GET /:owner          e.g. /TFF            (accounts — one persistent page per owner)
//   GET /:owner/:slug    e.g. /TFF/reroll-target-guide  (tier lists — many per owner)
//
// Everything under the original `/share/:id` and `POST /share` routes is unchanged in
// behaviour for existing callers -- this is additive.

export interface Env {
    SHARE_PAGES: KVNamespace
    WORKER_SECRET: string
}

interface ShareEntry {
    imageUrl: string
    title?: string
    backUrl?: string
    // For "live" shares (tier lists, accounts) where a real visitor should land in the
    // actual app rather than the static image page. Bots still get the static page either way,
    // so link unfurls keep working.
    redirectHumans?: boolean
}

const TOOLBOX_URL = "https://thefrozenfishy.github.io/exedra-dmg-calc/"

// Known link-preview crawlers. Anyone else is treated as a real visitor. New crawlers show up
// occasionally -- if an embed ever renders blank somewhere, it's almost always a missing entry here.
const BOT_USER_AGENT =
    /Discordbot|Twitterbot|Slackbot|facebookexternalhit|LinkedInBot|TelegramBot|WhatsApp|SkypeUriPreview|Pinterest|redditbot|Applebot|Googlebot|bingbot|Iframely|vkShare|Yandex/i

function isBot(request: Request): boolean {
    const ua = request.headers.get("User-Agent") ?? ""
    return BOT_USER_AGENT.test(ua)
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function buildSharePageHtml(entry: ShareEntry, shareUrl: string): string {
    const safeImage = escapeHtml(entry.imageUrl)
    const safeShare = escapeHtml(shareUrl)

    const resolvedTitle = entry.title?.trim() || "My Shared Image"
    const title = escapeHtml(resolvedTitle)

    const resolvedBackUrl = entry.backUrl?.trim() || TOOLBOX_URL
    const safeBackUrl = escapeHtml(resolvedBackUrl)

    const description = "Shared from TFF's Exedra Toolbox"

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${safeImage}">
<meta property="og:url" content="${safeShare}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:image" content="${safeImage}">
<style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: #242424;
        color: #eee;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        min-height: 100vh;
    }
    .topbar {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: rgba(20, 16, 24, 0.92);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(6px);
    }
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.9rem;
        background: rgba(255, 255, 255, 0.06);
        color: #eee;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        text-decoration: none;
        font-size: 0.9rem;
        transition: background 0.15s ease, border-color 0.15s ease;
    }
    .back-link:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 209, 110, 0.35);
    }
    .topbar-title {
        font-size: 0.9rem;
        color: #aaa;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .image-wrap {
        display: flex;
        justify-content: center;
        padding: 1.5rem 1rem;
    }
    .image-wrap img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
</style>
</head>
<body>
<div class="topbar">
    <a class="back-link" href="${safeBackUrl}">&larr; Back</a>
    <span class="topbar-title">${title}</span>
</div>
<div class="image-wrap">
    <img src="${safeImage}" alt="${title}">
</div>
</body>
</html>`
}

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, x-worker-secret",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
}

function html(body: string, status = 200): Response {
    return new Response(body, {
        status,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
    })
}

// Pretty-path slugs: lowercase, alnum + hyphen, DNS-label-ish (no leading/trailing hyphen).
// Same pattern used both when validating on write and when routing on read.
const SLUG_PART = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
// Matches "owner" or "owner/slug" with no leading slash -- used against the POST body's shareId.
const PRETTY_SHARE_ID = new RegExp(`^(${SLUG_PART})(?:/(${SLUG_PART}))?$`)
// Same shape, anchored to a URL path -- used to route GET requests.
const PRETTY_PATH = new RegExp(`^/(${SLUG_PART})(?:/(${SLUG_PART}))?/?$`)
const RESERVED_OWNERS = new Set(["share"]) // keeps /share/:id unambiguous forever

function prettyKvKey(owner: string, slug?: string): string {
    return slug ? `pretty:${owner}/${slug}` : `pretty:${owner}`
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        const { method, headers } = request

        // CORS preflight
        if (method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS })
        }

        // POST /share — create or refresh a share entry.
        // shareId is either a legacy hex id (one-shot snapshot pages), a bare "owner" (accounts),
        // or "owner/slug" (tier lists) -- re-posting the same shareId overwrites the existing KV
        // entry, which is exactly how an edited list/account gets a refreshed preview without a
        // new link.
        if (method === "POST" && url.pathname === "/share") {
            const secret = headers.get("x-worker-secret")
            if (!secret || secret !== env.WORKER_SECRET) {
                return json({ error: "Unauthorized" }, 401)
            }

            let body: {
                shareId?: string
                imageUrl?: string
                title?: string
                backUrl?: string
                redirectHumans?: boolean
            }
            try {
                body = await request.json()
            } catch {
                return json({ error: "Invalid JSON" }, 400)
            }

            const { shareId, imageUrl, title = "", backUrl = "", redirectHumans = false } = body

            if (!shareId || !imageUrl) {
                return json({ error: "shareId and imageUrl are required" }, 400)
            }

            // Only allow your own Supabase storage bucket
            const allowedPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/share-images\//
            if (!allowedPattern.test(imageUrl)) {
                return json({ error: "imageUrl must point at the share-images bucket" }, 400)
            }

            let kvKey: string
            let publicPath: string

            // IMPORTANT: check the legacy hex shape first. A random hex id like "3f9a2b7c"
            // also satisfies PRETTY_SHARE_ID (it's just lowercase alnum, no hyphens) -- if that
            // were checked first, every *existing* one-shot share button on every other page
            // would silently start filing under the new keyspace/URL shape instead of /share/:id.
            // Friend codes are always 5 chars and tier-list ids always contain a "/", so neither
            // can ever collide with this 8-32-char hex-only pattern.
            if (/^[a-f0-9]{8,32}$/.test(shareId)) {
                kvKey = shareId
                publicPath = `/share/${shareId}`
            } else {
                const prettyMatch = shareId.match(PRETTY_SHARE_ID)
                if (!prettyMatch) {
                    return json({ error: "Invalid shareId format" }, 400)
                }
                const [, owner, slug] = prettyMatch
                if (RESERVED_OWNERS.has(owner)) {
                    return json({ error: `"${owner}" is a reserved owner name` }, 400)
                }
                kvKey = prettyKvKey(owner, slug)
                publicPath = slug ? `/${owner}/${slug}` : `/${owner}`
            }

            const entry: ShareEntry = { imageUrl, title, backUrl, redirectHumans }

            // TTL of 1 year — shares don't need to last forever, and re-putting the same key
            // resets the clock, so an actively-edited list/account link never quietly expires.
            await env.SHARE_PAGES.put(kvKey, JSON.stringify(entry), {
                expirationTtl: 60 * 60 * 24 * 365,
            })

            const shareUrl = `${url.origin}${publicPath}`
            return json({ url: shareUrl, shareId })
        }

        // GET /share/:id — legacy one-shot snapshot pages (unchanged)
        const shareMatch = url.pathname.match(/^\/share\/([a-f0-9]{8,32})\/?$/)
        if (method === "GET" && shareMatch) {
            const shareId = shareMatch[1]
            const raw = await env.SHARE_PAGES.get(shareId)

            if (!raw) {
                return html("<h1>Share not found</h1><p>This link may have expired.</p>", 404)
            }

            const entry: ShareEntry = JSON.parse(raw)
            const shareUrl = `${url.origin}/share/${shareId}`
            return html(buildSharePageHtml(entry, shareUrl))
        }

        // GET /:owner or /:owner/:slug — pretty, reusable links (accounts, tier lists)
        const prettyPathMatch = url.pathname.match(PRETTY_PATH)
        if (method === "GET" && prettyPathMatch) {
            const [, owner, slug] = prettyPathMatch
            if (RESERVED_OWNERS.has(owner)) {
                return json({ error: "Not found" }, 404)
            }

            const raw = await env.SHARE_PAGES.get(prettyKvKey(owner, slug))
            if (!raw) {
                return html("<h1>Not found</h1><p>This link may have expired or never existed.</p>", 404)
            }

            const entry: ShareEntry = JSON.parse(raw)
            const shareUrl = `${url.origin}${url.pathname}`

            // Crawlers (Discord, Twitter, Slack, ...) don't run JS -- they only ever see this
            // response, so they always get the OG-tagged page regardless of redirectHumans.
            // Real browsers, for a "live" share, skip straight to the actual app.
            if (entry.redirectHumans && entry.backUrl && !isBot(request)) {
                return Response.redirect(entry.backUrl, 302)
            }

            return html(buildSharePageHtml(entry, shareUrl))
        }

        return json({ error: "Not found" }, 404)
    },
}
