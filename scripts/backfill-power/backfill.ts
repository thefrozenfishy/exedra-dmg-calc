/**
 * One-shot backfill: recompute power_total/power_whale/per-role power and
 * kioku counts for every existing user, from their already-stored
 * user_characters rows, using the CURRENT default formula (BETA_DEFAULTS),
 * never any per-user beta overrides.
 *
 * Why this exists: power scores are normally written by _saveCharacters
 * when a user's own client saves. Existing accounts won't get a score
 * until they next open the app and save — this fills that gap once, for
 * everyone, in one run.
 *
 * SETUP
 *   1. Place this whole backfill-power/ folder anywhere in your repo,
 *      e.g. at the repo root as `scripts/backfill-power/`.
 *   2. Run .\prepare.ps1 first (see that file) — it copies PowerValue.ts,
 *      AccountSimilarityScore.ts, KiokuTypes.ts, helpers.ts, mathFuncs.ts
 *      from your real src/ into ./vendor/, patching only their import
 *      paths so they're self-contained here. Edit $SrcRoot at the top of
 *      prepare.ps1 first if your source isn't at ..\..\src relative to
 *      this folder.
 *   3. npm install --no-save @supabase/supabase-js ts-node typescript
 *   4. Set environment variables (see below), then run:
 *        npx ts-node -P tsconfig.json backfill.ts
 *
 * ENV VARS REQUIRED
 *   SUPABASE_URL              - same value as VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY - service_role key from Supabase project
 *                               settings (Settings -> API). NOT the
 *                               publishable/anon key — this needs to
 *                               bypass RLS to read/write every user's row.
 *                               Treat this key like a password. Never
 *                               commit it, never put it in client code.
 *
 * This is read with a service-role key, so it bypasses RLS by design —
 * the whole point is to write rows that aren't "yours" from the client's
 * perspective. Don't reuse this key anywhere else, and revoke/rotate it
 * if it ever leaks.
 */

import { createClient } from "@supabase/supabase-js"
import { getPowerScores, countCharsObtained } from "./vendor/PowerValue"
import { kiokuData } from "./vendor/helpers"
import { Character, KiokuConstants } from "./vendor/KiokuTypes"

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    )
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Mirrors characterStore.ts's basicSetting()/charInfo merge closely enough
// for scoring purposes: every character needs role/element/rarity/name/
// ascension/enabled populated correctly for getPowerScores to work, the
// same fields characterStore.mergeChars() fills in client-side.
const charInfoByExternalId: Record<number, Character> = Object.fromEntries(
    Object.entries(kiokuData).map(([name, data]: [string, any]) => [
        data.id,
        {
            name,
            id: data.id,
            role: data.role,
            element: data.element,
            supportTarget: data.support_target,
            supportDescription: data.support_effect,
            character_en: data.character_en,
            heartphial: data.heartphial || data.character_en,
            rarity: data.rarity,
            obtain: data.obtain,
            permaDate: data.permaDate,
            releaseDate: data.releaseDate,
        } as Character,
    ])
)

function mergeRow(row: any): Character | null {
    const info = charInfoByExternalId[row.character_id]
    if (!info) return null

    let ascension = row.ascension ?? 0
    if (ascension < 0) ascension = 0
    if (ascension > KiokuConstants.maxAscension) ascension = KiokuConstants.maxAscension
    if (info.rarity < 5) ascension = KiokuConstants.maxAscension

    return {
        ...info,
        enabled: row.enabled,
        dupes: row.dupes,
        ascension,
        kiokuLvl: row.kioku_lvl,
        magicLvl: row.magic_lvl,
        heartphialLvl: row.heartphial_lvl,
        specialLvl: row.special_lvl,
        portrait: row.portrait,
        crysOptions: row.crys_options ?? {},
    } as Character
}

const PAGE_SIZE = 200

async function getAllUserIds(): Promise<string[]> {
    const ids: string[] = []
    let from = 0

    while (true) {
        const { data, error } = await supabase
            .from("users")
            .select("user_id")
            .range(from, from + PAGE_SIZE - 1)

        if (error) throw error
        if (!data?.length) break

        ids.push(...data.map((r) => r.user_id as string))

        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
    }

    return ids
}

async function backfillUser(userId: string): Promise<"ok" | "skipped" | "error"> {
    const { data: rows, error: rowsError } = await supabase
        .from("user_characters")
        .select("*")
        .eq("user_id", userId)

    if (rowsError) {
        console.error(`[${userId}] failed to load characters:`, rowsError.message)
        return "error"
    }

    if (!rows?.length) {
        // No characters saved at all yet — nothing to score, leave at
        // the column defaults (0).
        return "skipped"
    }

    const characters = rows
        .map(mergeRow)
        .filter((c): c is Character => c !== null)

    if (!characters.length) {
        return "skipped"
    }

    const power = getPowerScores(characters)
    const kioku = countCharsObtained(characters)

    const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
            power_total: power.total,
            power_whale: power.whale,
            power_attacker: power["Attacker"],
            power_buffer: power["Buffer"],
            power_debuffer: power["Debuffer"],
            power_breaker: power["Breaker"],
            power_defender: power["Defender"],
            power_healer: power["Healer"],
            kioku_lim: kioku.lim,
            kioku_lim_as: kioku.limAs,
            kioku_perm: kioku.perm,
            kioku_perm_as: kioku.permAs,
            score_updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

    if (updateError) {
        console.error(`[${userId}] failed to write score:`, updateError.message)
        return "error"
    }

    return "ok"
}

async function main() {
    console.log("Fetching all user IDs...")
    const userIds = await getAllUserIds()
    console.log(`Found ${userIds.length} users.`)

    let ok = 0
    let skipped = 0
    let failed = 0

    // Sequential, not parallel — this is a one-shot script, not a hot
    // path, and sequential makes the progress log readable and avoids
    // hammering Supabase with hundreds of concurrent requests at once.
    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i]
        const result = await backfillUser(userId)

        if (result === "ok") ok++
        else if (result === "skipped") skipped++
        else failed++

        if ((i + 1) % 25 === 0 || i === userIds.length - 1) {
            console.log(
                `Progress: ${i + 1}/${userIds.length} (ok=${ok}, skipped=${skipped}, failed=${failed})`
            )
        }
    }

    console.log("Done.")
    console.log(`  Updated: ${ok}`)
    console.log(`  Skipped (no characters saved): ${skipped}`)
    console.log(`  Failed: ${failed}`)

    if (failed > 0) {
        console.log("\nRe-run the script to retry — it's safe to run multiple times.")
    }
}

main().catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
})
