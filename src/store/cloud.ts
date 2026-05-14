import { getSupabase } from "../utils/supabase"
import { getUserId } from "./user"
import type { Character } from "../types/KiokuTypes"

async function createProfile(userId: string) {
    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: userId
        })

    if (error) throw error
}

export async function createCloudUser(userId: string) {
    const supabase = getSupabase()

    const { error } = await supabase
        .from("users")
        .upsert({
            user_id: userId
        })

    if (error) throw error

    await createProfile(userId)
}

export async function saveCharacters(chars: Character[]) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

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

    if (error) throw error
}

export async function loadCharacters() {
    const userId = getUserId()

    if (!userId) return []

    const supabase = getSupabase()

    const { data, error } = await supabase
        .from("user_characters")
        .select("*")
        .eq("user_id", userId)

    if (error) throw error

    return data
}

export async function restoreCloudAccount(userId: string) {
    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'check_user_exists',
        {
            target_user_id: userId
        }
    )

    if (error || !data) {
        throw new Error("Account not found")
    }

    return true
}

export async function getFriendCode() {
    const userId = getUserId()

    if (!userId) return null

    const supabase = getSupabase()

    const { data, error } = await supabase
        .from("users")
        .select("friend_id")
        .eq("user_id", userId)
        .single()

    if (error) throw error

    return data.friend_id
}

export async function getMyProfile() {
    const userId = getUserId()

    if (!userId) return null

    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) throw error

    return data
}

export async function updateDisplayName(displayName: string) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: userId,
            display_name: displayName
        })

    if (error) throw error
}

export async function updateUnionName(
    unionName: string
) {
    const userId = getUserId()

    if (!userId) return

    unionName = unionName.trim()

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_profiles')
        .update({
            union_name: unionName
        })
        .eq('user_id', userId)

    if (error) throw error
}

export async function saveFriendNickname(
    friendId: string,
    nickname: string
) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_friends')
        .update({
            nickname
        })
        .eq('user_id', userId)
        .eq('friend_id', friendId)

    if (error) throw error
}

export async function setFriendFavorite(
    friendId: string,
    favorite: boolean
) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_friends')
        .update({
            favorite
        })
        .eq('user_id', userId)
        .eq('friend_id', friendId)

    if (error) throw error
}

export async function getFriends() {
    const userId = getUserId()

    if (!userId) return []

    const supabase = getSupabase()

    const { data: relations, error } = await supabase
        .from('user_friends')
        .select('friend_id, nickname, favorite')
        .eq('user_id', userId)

    if (error) throw error

    if (!relations?.length) return []

    const friendCodes = relations.map(r => r.friend_id)

    const { data: profiles, error: profileError } = await supabase
        .from('public_profiles')
        .select('friend_id, display_name, union_name')
        .in('friend_id', friendCodes)

    if (profileError) throw profileError

    return relations.map(friend => {
        const profile = profiles.find(
            p => p.friend_id === friend.friend_id
        )

        return {
            friend_id: friend.friend_id,
            nickname: friend.nickname ?? '',
            display_name: profile?.display_name || 'Unnamed',
            union_name: profile?.union_name || '',
            favorite: friend.favorite ?? false,
            isFriend: true,
            isUnionMember: false,
        }
    })
}

export async function addFriendByCode(friendCode: string) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    friendCode = friendCode.toUpperCase()

    const myCode = await getFriendCode()

    if (friendCode === myCode) {
        throw new Error('Cannot add yourself')
    }

    const { error } = await supabase
        .from('user_friends')
        .upsert({
            user_id: userId,
            friend_id: friendCode,
            nickname: ''
        })

    if (error) throw error
}

export async function removeFriend(friendId: string) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_friends')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)

    if (error) throw error
}

export async function getUnionMembers(
    unionName: string
) {
    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'get_union_members',
        {
            target_union: unionName
        }
    )

    if (error) throw error

    return data
}

export async function loadCharactersByFriendCode(friendCode: string) {
    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'get_public_characters',
        {
            target_friend_id: friendCode.toUpperCase()
        }
    )

    if (error) throw error

    return data.map(row => ({
        enabled: row.enabled,

        dupes: row.dupes,
        ascension: row.ascension,

        kiokuLvl: row.kioku_lvl,
        magicLvl: row.magic_lvl,
        heartphialLvl: row.heartphial_lvl,
        specialLvl: row.special_lvl,

        portrait: row.portrait,

        crys: row.crys,
        crys_sub: row.crys_sub,

        id: row.character_id
    }))
}

export async function updateFriendCode(
    friendCode: string
) {
    const userId = getUserId()

    if (!userId) return

    friendCode = friendCode
        .trim()
        .toUpperCase()

    if (friendCode === await getFriendCode()) return

    if (!/^[A-Z0-9]{5}$/.test(friendCode)) {
        throw new Error(
            'Friend code must be 5 capital letters or numbers'
        )
    }

    const supabase = getSupabase()

    const { error } = await supabase
        .from('users')
        .update({
            friend_id: friendCode
        })
        .eq('user_id', userId)

    if (error) {
        throw error
    }
}
