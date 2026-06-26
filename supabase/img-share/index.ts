// Uploaded at https://supabase.com/dashboard/project/hqutdzugcelwjooqwpst/functions/create-share-page/code

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const WORKER_URL = Deno.env.get("CLOUDFLARE_WORKER_URL")
const WORKER_SECRET = Deno.env.get("CLOUDFLARE_WORKER_SECRET")

interface CreateSharePageRequest {
    shareId: string
    imageUrl: string
    title?: string
    backUrl?: string
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
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
        if (!WORKER_URL || !WORKER_SECRET) {
            throw new Error("CLOUDFLARE_WORKER_URL or CLOUDFLARE_WORKER_SECRET is not configured")
        }

        const body: CreateSharePageRequest = await req.json()

        if (!body.shareId || !body.imageUrl) {
            return new Response(
                JSON.stringify({ error: "shareId and imageUrl are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Validation mirrors the worker — belt and suspenders
        const allowedImageHostPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/share-images\//
        if (!allowedImageHostPattern.test(body.imageUrl)) {
            return new Response(
                JSON.stringify({ error: "imageUrl must point at the share-images bucket" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const workerRes = await fetch(`${WORKER_URL}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-worker-secret": WORKER_SECRET,
            },
            body: JSON.stringify({
                shareId: body.shareId,
                imageUrl: body.imageUrl,
                title: body.title ?? "",
                backUrl: body.backUrl ?? "",
            }),
        })

        if (!workerRes.ok) {
            const errorBody = await workerRes.text()
            throw new Error(`Worker error (${workerRes.status}): ${errorBody}`)
        }

        const data = await workerRes.json()

        return new Response(JSON.stringify({ url: data.url }), {
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
