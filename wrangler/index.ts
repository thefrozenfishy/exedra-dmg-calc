// upload using ``wrangler deploy``

export interface Env {
    SHARE_PAGES: KVNamespace
    WORKER_SECRET: string
}

interface ShareEntry {
    imageUrl: string
    title?: string
    backUrl?: string
}

const TOOLBOX_URL = "https://thefrozenfishy.github.io/exedra-dmg-calc/"

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

            let body: { shareId?: string; imageUrl?: string;  title?: string; backUrl?: string }
            try {
                body = await request.json()
            } catch {
                return json({ error: "Invalid JSON" }, 400)
            }

            const { shareId, imageUrl,  title = "", backUrl = "" } = body

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

            const entry: ShareEntry = { imageUrl,  title, backUrl }

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
            return html(buildSharePageHtml(entry, shareUrl))
        }

        return json({ error: "Not found" }, 404)
    },
}
