// Cloudflare Worker: share-worker
//
// POST /share        — stores {imageUrl, displayName} in KV, returns {url, shareId}
// GET  /share/:id   — serves a minimal HTML page with og:image meta tags
//
// Deploy with: wrangler deploy
// Bind a KV namespace named SHARE_PAGES in wrangler.toml.

export interface Env {
    SHARE_PAGES: KVNamespace
    // Set this in Cloudflare dashboard → Workers → your worker → Settings → Variables
    // Use the same value in your Supabase create-share-page function as WORKER_SECRET
    WORKER_SECRET: string
}

interface ShareEntry {
    imageUrl: string
    displayName: string
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function buildSharePageHtml(imageUrl: string, displayName: string, shareUrl: string): string {
    const safeName = escapeHtml(displayName || "A player")
    const safeImage = escapeHtml(imageUrl)
    const safeShare = escapeHtml(shareUrl)
    const title = `${safeName}'s Kioku Collection`
    const description = "Shared from Exedra Damage Calculator"

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${safeImage}">
<meta property="og:url" content="${safeShare}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:image" content="${safeImage}">
<meta http-equiv="refresh" content="0; url=${safeImage}">
</head>
<body>
<p>Redirecting to <a href="${safeImage}">image</a>...</p>
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

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        const { method, headers } = request

        // CORS preflight
        if (method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS })
        }

        // POST /share — create a new share entry
        if (method === "POST" && url.pathname === "/share") {
            // Shared secret so only your Supabase edge function can write here.
            // Prevents randos from stuffing arbitrary URLs into your KV.
            const secret = headers.get("x-worker-secret")
            if (!secret || secret !== env.WORKER_SECRET) {
                return json({ error: "Unauthorized" }, 401)
            }

            let body: { shareId?: string; imageUrl?: string; displayName?: string }
            try {
                body = await request.json()
            } catch {
                return json({ error: "Invalid JSON" }, 400)
            }

            const { shareId, imageUrl, displayName = "" } = body

            if (!shareId || !imageUrl) {
                return json({ error: "shareId and imageUrl are required" }, 400)
            }

            if (!/^[a-f0-9]{8,32}$/.test(shareId)) {
                return json({ error: "Invalid shareId format" }, 400)
            }

            // Only allow your own Supabase storage bucket
            const allowedPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/share-images\//
            if (!allowedPattern.test(imageUrl)) {
                return json({ error: "imageUrl must point at the share-images bucket" }, 400)
            }

            const entry: ShareEntry = { imageUrl, displayName }

            // TTL of 1 year — shares don't need to last forever
            await env.SHARE_PAGES.put(shareId, JSON.stringify(entry), {
                expirationTtl: 60 * 60 * 24 * 365,
            })

            const shareUrl = `${url.origin}/share/${shareId}`
            return json({ url: shareUrl, shareId })
        }

        // GET /share/:id — serve the og:image HTML page
        const shareMatch = url.pathname.match(/^\/share\/([a-f0-9]{8,32})\/?$/)
        if (method === "GET" && shareMatch) {
            const shareId = shareMatch[1]
            const raw = await env.SHARE_PAGES.get(shareId)

            if (!raw) {
                return html("<h1>Share not found</h1><p>This link may have expired.</p>", 404)
            }

            const entry: ShareEntry = JSON.parse(raw)
            const shareUrl = `${url.origin}/share/${shareId}`
            return html(buildSharePageHtml(entry.imageUrl, entry.displayName, shareUrl))
        }

        return json({ error: "Not found" }, 404)
    },
}
