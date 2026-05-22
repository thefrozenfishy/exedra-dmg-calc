import { getSupabase } from "../utils/supabase"
import { getUserId } from "./user"
import { logEvent } from '../utils/analytics'
import type { Character, CrystalisSelection } from "../types/KiokuTypes"

async function createProfile(userId: string) {
    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: userId
        })

    if (error) throw error
}

const withAnalytics = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    event: string,
    metadataFn: (args: Parameters<T>) => any = args => ({ ...args })
) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = await fn(...args)
        console.log("For", event, "got", result)
        try {
            await logEvent(event, metadataFn(args))
        } catch (err) {
            console.error(`Failed logging analytics ${event}`, err)
        }

        return result
    }
}

async function _createCloudUser(userId: string) {
    const supabase = getSupabase()

    const { error } = await supabase
        .from("users")
        .upsert({
            user_id: userId
        })

    if (error) throw error

    await createProfile(userId)
}

async function _saveCharacters(chars: Character[]) {
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

async function _loadCharacters() {
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

async function _restoreCloudAccount(userId: string) {
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

async function _saveCharacterCrystalis(characterId: number, selections: CrystalisSelection[]) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_character_crystalis')
        .upsert({
            user_id: userId,
            character_id: characterId,
            selections
        })

    if (error) throw error
}

async function _loadCharacterCrystalis(characterId: number) {
    const userId = getUserId()

    if (!userId) return []

    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('user_character_crystalis')
        .select('selections')
        .eq('user_id', userId)
        .eq('character_id', characterId)
        .single()

    if (error) throw error

    return data?.selections ?? []
}

async function _getFriendCode() {
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

async function _getMyProfile() {
    const userId = getUserId()

    if (!userId) return null

    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*, users (*)')
        .eq('user_id', userId)
        .single()

    if (error) throw error

    return data
}

async function _updateDisplayName(displayName: string) {
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

async function _updateprofile_icon(profile_icon: number) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase
        .from('user_profiles')
        .update({ profile_icon })
        .eq('user_id', userId)

    if (error) throw error
}

async function _getAllUnionNames(): Promise<string[]> {
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('public_profiles')
        .select('union_name')

    if (error) throw error

    const set = new Set<string>()

    for (const row of data ?? []) {
        const name = row.union_name?.trim()
        if (name) set.add(name)
    }

    return [...set].sort((a, b) => a.localeCompare(b))
}

async function _updateUnionName(unionName: string) {
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

async function _saveFriendNickname(
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

async function _setFriendFavorite(
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

async function _getFriends() {
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
        .select('*')
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
            profile_icon: profile?.profile_icon,
            favorite: friend.favorite ?? false,
            isFriend: true,
            isUnionMember: false,
        }
    })
}

async function _getProfile(friend_id: string) {
    const userId = getUserId()

    if (!userId) return null

    const supabase = getSupabase()

    const { data: profile, error: profileError } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('friend_id', friend_id)
        .single()

    if (profileError) throw profileError

    return {
        friend_id,
        display_name: profile?.display_name,
        union_name: profile?.union_name,
        profile_icon: profile?.profile_icon,
    }
}

async function _loadAllPlayers() {
    const supabase = getSupabase()

    const { data: profiles, error: profileError } = await supabase
        .from('public_profiles')
        .select('*')

    if (profileError) throw profileError

    return profiles.map(profile => {
        return {
            friend_id: profile.friend_id,
            nickname: '',
            display_name: profile?.display_name || 'Unnamed',
            union_name: profile?.union_name || '',
            profile_icon: profile?.profile_icon,
            favorite: false,
            isFriend: true,
            isUnionMember: false,
        }
    })
}

async function _addFriendByCode(friendCode: string) {
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

async function _removeFriend(friendId: string) {
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

async function _getUnionMembers(
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

async function _loadCharactersByFriendCode(friendCode: string) {
    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'get_public_characters',
        {
            target_friend_id: friendCode.toUpperCase()
        }
    )

    if (error) throw error

    return (data as any[]).map(row => ({
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

async function _updateFriendCode(
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

export const createCloudUser = withAnalytics(
    _createCloudUser,
    'create_cloud_user'
)

export const saveCharacters = withAnalytics(
    _saveCharacters,
    'save_characters',
    ([chars]) => ({ characterCount: chars?.length ?? 0 })
)

export const updateDisplayName = withAnalytics(
    _updateDisplayName,
    'update_display_name'
)

export const updateprofile_icon = withAnalytics(
    _updateprofile_icon,
    'update_profile_icon'
)

export const updateUnionName = withAnalytics(
    _updateUnionName,
    'update_union_name'
)

export const saveFriendNickname = withAnalytics(
    _saveFriendNickname,
    'save_friend_nickname'
)

export const setFriendFavorite = withAnalytics(
    _setFriendFavorite,
    'set_friend_favorite'
)

export const loadAllPlayers = withAnalytics(
    _loadAllPlayers,
    'load_all_players'
)

export const addFriendByCode = withAnalytics(
    _addFriendByCode,
    'add_friend',
    ([friendCode]) => ({ friendCode })
)

export const loadCharactersByFriendCode = withAnalytics(
    _loadCharactersByFriendCode,
    'load_characters_by_friend_code',
    ([friendCode]) => ({ friendCode })
)

export const removeFriend = withAnalytics(
    _removeFriend,
    'remove_friend',
    ([friendId]) => ({ friendId })
)

export const getFriendCode = withAnalytics(
    _getFriendCode,
    'get_friend_code'
)

export const loadCharacters = withAnalytics(
    _loadCharacters,
    'load_characters'
)

export const restoreCloudAccount = withAnalytics(
    _restoreCloudAccount,
    'restore_cloud_account'
)

export const getMyProfile = withAnalytics(
    _getMyProfile,
    'get_my_profile'
)

export const getAllUnionNames = withAnalytics(
    _getAllUnionNames,
    'get_all_union_names'
)

export const getFriends = withAnalytics(
    _getFriends,
    'get_friends'
)

export const getProfile = withAnalytics(
    _getProfile,
    'get_profile',
    ([friend_id]) => ({ friend_id })
)

export const getUnionMembers = withAnalytics(
    _getUnionMembers,
    'get_union_members',
    ([unionName]) => ({ unionName })
)

export const updateFriendCode = withAnalytics(
    _updateFriendCode,
    'update_friend_code',
    ([friendCode]) => ({ friendCode })
)

export const saveCharacterCrystalis = withAnalytics(
    _saveCharacterCrystalis,
    'save_character_crystalis',
    ([characterId, selections]) => ({ characterId, selectionCount: selections?.length ?? 0 })
)

export const loadCharacterCrystalis = withAnalytics(
    _loadCharacterCrystalis,
    'load_character_crystalis',
    ([characterId]) => ({ characterId })
)
