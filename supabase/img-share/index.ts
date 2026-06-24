// Supabase Edge Function: create-share-page
//
// Takes a Storage public image URL + display name, generates a tiny
// static HTML file with proper og:image/og:title meta tags, and commits
// it directly into the gh-pages branch via the GitHub Contents API.
//
// Why this exists: GitHub Pages serves static files only -- there's no
// server-side logic to generate per-route HTML on the fly, and Discord's
// link unfurler doesn't execute JavaScript, so a client-side router route
// is invisible to it. The only way to get a per-share response from a
// static host is for a real file to exist at that path -- this function
// is what creates that file.
//
// The GitHub PAT used here has Contents read/write on ONE repo only, and
// lives exclusively as a Supabase secret (GITHUB_PAT) -- never sent to
// the browser, never in client code. This function is the only thing
// that ever sees it.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const GITHUB_OWNER = "thefrozenfishy"
const GITHUB_REPO = "exedra-dmg-calc"
const GITHUB_BRANCH = "gh-pages"

// Pages serves this repo at /exedra-dmg-calc/ (see vite_config.ts's base).
// Share pages live under that, at /exedra-dmg-calc/share/<id>/index.html.
const PAGES_BASE_PATH = "exedra-dmg-calc"

const GITHUB_PAT = Deno.env.get("GITHUB_PAT")

interface CreateSharePageRequest {
    shareId: string
    imageUrl: string
    displayName?: string
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function buildSharePageHtml(imageUrl: string, displayName: string): string {
    const safeDisplayName = escapeHtml(displayName || "A player")
    const safeImageUrl = escapeHtml(imageUrl)
    const title = `${safeDisplayName}'s Kioku Collection`
    const description = "Shared from Exedra Damage Calculator"

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${safeImageUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:image" content="${safeImageUrl}">
<meta http-equiv="refresh" content="0; url=${safeImageUrl}">
</head>
<body>
<p>Redirecting to <a href="${safeImageUrl}">image</a>...</p>
</body>
</html>
`
}

function toBase64(input: string): string {
    const bytes = new TextEncoder().encode(input)
    let binary = ""
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
}

async function commitSharePage(shareId: string, html: string): Promise<string> {
    if (!GITHUB_PAT) {
        throw new Error("GITHUB_PAT secret is not configured")
    }

    // shareId comes from the client (see image.ts) as a random hex string --
    // validated below before it's used in a file path, since it ends up in
    // a GitHub API URL and a committed file path.
    if (!/^[a-f0-9]{8,32}$/.test(shareId)) {
        throw new Error("Invalid shareId format")
    }

    const path = `${PAGES_BASE_PATH}/share/${shareId}/index.html`
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`

    const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${GITHUB_PAT}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "exedra-dmg-calc-share",
        },
        body: JSON.stringify({
            message: `Add share page ${shareId}`,
            content: toBase64(html),
            branch: GITHUB_BRANCH,
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`GitHub API error (${response.status}): ${errorBody}`)
    }

    return `https://${GITHUB_OWNER}.github.io/${PAGES_BASE_PATH}/share/${shareId}/`
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
    // Browsers send an OPTIONS preflight before any cross-origin POST
    // with a JSON body. Without answering it with the right headers, the
    // browser blocks the real request before it's ever sent -- that's
    // the "CORS Missing Allow Origin" / 405 error.
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    try {
        const body: CreateSharePageRequest = await req.json()

        if (!body.shareId || !body.imageUrl) {
            return new Response(
                JSON.stringify({ error: "shareId and imageUrl are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Only ever points at our own Storage bucket -- this function
        // should never be usable to make GitHub commit arbitrary
        // attacker-controlled og:image URLs pointing elsewhere.
        const allowedImageHostPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/share-images\//
        if (!allowedImageHostPattern.test(body.imageUrl)) {
            return new Response(
                JSON.stringify({ error: "imageUrl must point at the share-images bucket" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const html = buildSharePageHtml(body.imageUrl, body.displayName ?? "")
        const pageUrl = await commitSharePage(body.shareId, html)

        return new Response(JSON.stringify({ url: pageUrl }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    } catch (err) {
        console.error("create-share-page failed:", err)
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
})
