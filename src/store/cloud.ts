import { supabase } from "../utils/supabase"
import { getUserId } from "./user"
import type { Character } from "../types/KiokuTypes"

function authHeaders() {
    return {
        "x-user-id": getUserId() ?? ""
    }
}

export async function createCloudUser(userId: string) {
    const { error } = await supabase
        .from("users")
        .upsert({
            user_id: userId
        })
        .select()
        .setHeader("x-user-id", userId)

    if (error) throw error
}

export async function saveCharacters(chars: Character[]) {
    const userId = getUserId()

    if (!userId) return

    const rows = chars.map(c => ({
        user_id: userId,

        character_id: c.id,

        enabled: c.enabled,

        dupes: c.dupes,
        ascension: c.ascension,

        kioku_lvl: c.kiokuLvl,
        magic_lvl: c.magicLvl,
        heartphial_lvl: c.heartphialLvl,
        special_lvl: c.specialLvl,

        portrait: c.portrait,

        crys: c.crys,
        crys_sub: c.crys_sub
    }))

    const { error } = await supabase
        .from("user_characters")
        .upsert(rows)
        .setHeader("x-user-id", userId)

    if (error) throw error
}

export async function loadCharacters() {
    const userId = getUserId()

    if (!userId) return []

    const { data, error } = await supabase
        .from("user_characters")
        .select("*")
        .eq("user_id", userId)
        .setHeader("x-user-id", userId)

    if (error) throw error

    return data
}

export async function restoreCloudAccount(userId: string) {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single()
        .setHeader("x-user-id", userId)

    if (error || !data) {
        throw new Error("Account not found")
    }

    return data
}

export async function getFriendCharacters(friendId: string) {
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("friend_id", friendId)
        .single()

    if (userError) throw userError

    const { data, error } = await supabase
        .from("user_characters")
        .select("*")
        .eq("user_id", user.user_id)

    if (error) throw error

    return data
}

export async function getFriendCode() {
    const userId = getUserId()

    if (!userId) return null

    const { data, error } = await supabase
        .from("users")
        .select("friend_id")
        .eq("user_id", userId)
        .single()
        .setHeader("x-user-id", userId)

    if (error) throw error

    return data.friend_id
}