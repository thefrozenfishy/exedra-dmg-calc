import { getSupabase } from "../utils/supabase"
import { getUserId } from "./user"
import { logEvent } from '../utils/analytics'
import type { Character } from "../types/KiokuTypes"
import { countCharsObtained, getPowerScores } from "../models/PowerValue"
import { KiokuRole } from "../types/enums"

export class NameRequiredError extends Error {
    constructor() {
        super("A player name is required to view the everyone board.")
        this.name = "NameRequiredError"
    }
}

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
    metadataFn: (args: Parameters<T>, result: Awaited<ReturnType<T>>) => any = () => ({})
) => {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        const result = await fn(...args)
        try {
            await logEvent(event, metadataFn(args, result))
        } catch (err) {
            console.error(`Failed logging analytics ${event}`, err)
        }

        return result
    }
}

type CharacterRow = {
    user_id: string
    character_id: number
    enabled: boolean
    dupes: number
    ascension: number
    kioku_lvl: number
    magic_lvl: number
    heartphial_lvl: number
    special_lvl: number
    portrait: string
    crys_options: any
}

const TRACKED_CHARACTER_FIELDS: (keyof CharacterRow)[] = [
    'enabled', 'dupes', 'ascension', 'kioku_lvl', 'magic_lvl', 'heartphial_lvl', 'special_lvl', 'portrait'
]

let lastKnownCharacterRows: Map<number, CharacterRow> | null = null

function summarizeCharacterSave(rows: CharacterRow[]) {
    const totalCharacters = rows.length
    const enabledCount = rows.filter(r => r.enabled).length

    if (!lastKnownCharacterRows) {
        return { isInitialSync: true, totalCharacters, enabledCount }
    }

    const fieldChanges: Array<{ characterId: number; field: string; from: any; to: any }> = []
    const crysOptionsChangedIds: number[] = []

    for (const row of rows) {
        const prev = lastKnownCharacterRows.get(row.character_id)
        if (!prev) continue

        for (const field of TRACKED_CHARACTER_FIELDS) {
            if (prev[field] !== row[field]) {
                fieldChanges.push({ characterId: row.character_id, field, from: prev[field], to: row[field] })
            }
        }

        if (JSON.stringify(prev.crys_options) !== JSON.stringify(row.crys_options)) {
            crysOptionsChangedIds.push(row.character_id)
        }
    }

    return {
        isInitialSync: false,
        totalCharacters,
        enabledCount,
        changedCharacterCount: new Set([...fieldChanges.map(c => c.characterId), ...crysOptionsChangedIds]).size,
        fieldChanges: fieldChanges.slice(0, 50), // cap payload size on freak bulk-edits/imports
        crysOptionsChangedIds,
    }
}

async function _createCloudUser(userId: string) {
    lastKnownCharacterRows = null

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

    const rows: CharacterRow[] = chars.map(c => ({
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

        crys_options: c.crysOptions || {} // This for some reason was null for a user, unsure why but see if this fixes it? 
    }))

    const summary = summarizeCharacterSave(rows)

    const { error } = await supabase
        .from("user_characters")
        .upsert(rows)

    if (error) throw error

    lastKnownCharacterRows = new Map(rows.map(r => [r.character_id, r]))

    await _updateMyScore(userId, chars)

    return summary
}

async function _updateMyScore(userId: string, chars: Character[]) {
    const supabase = getSupabase()

    const power = getPowerScores(chars)
    const kioku = countCharsObtained(chars)

    const { error } = await supabase
        .from('user_profiles')
        .update({
            power_total: power.total,
            power_whale: power.whale,
            power_attacker: power[KiokuRole.Attacker],
            power_buffer: power[KiokuRole.Buffer],
            power_debuffer: power[KiokuRole.Debuffer],
            power_breaker: power[KiokuRole.Breaker],
            power_defender: power[KiokuRole.Defender],
            power_healer: power[KiokuRole.Healer],
            kioku_lim: kioku.lim,
            kioku_lim_as: kioku.limAs,
            kioku_perm: kioku.perm,
            kioku_perm_as: kioku.permAs,
            score_updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

    if (error) console.error("Failed to update power score:", error)
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

    lastKnownCharacterRows = new Map((data ?? []).map((r: any) => [r.character_id, r]))

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

    const { data: existing } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', userId)
        .maybeSingle()

    const { error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: userId,
            display_name: displayName
        })

    if (error) throw error

    return { from: existing?.display_name ?? null, to: displayName, changed: (existing?.display_name ?? null) !== displayName }
}

async function _updateprofile_icon(profile_icon: number) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { data: existing } = await supabase
        .from('user_profiles')
        .select('profile_icon')
        .eq('user_id', userId)
        .maybeSingle()

    const { error } = await supabase
        .from('user_profiles')
        .update({ profile_icon })
        .eq('user_id', userId)

    if (error) throw error

    return { from: existing?.profile_icon ?? null, to: profile_icon, changed: (existing?.profile_icon ?? null) !== profile_icon }
}

async function _getSimilarityRelations(myFriendId: string) {
    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'get_similarity_relations',
        { target_friend_id: myFriendId }
    )

    if (error) throw error

    return (data as any[]).map(row => row.related_friend_id as string)
}

async function _upsertSimilarity(
    myFriendId: string,
    otherFriendId: string,
    similarity: number
) {
    const supabase = getSupabase()

    const { error } = await supabase.rpc(
        'upsert_similarity',
        {
            my_friend_id: myFriendId,
            other_friend_id: otherFriendId,
            p_similarity: similarity,
        }
    )

    if (error) throw error
}

export async function touchLastSeen() {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { error } = await supabase.rpc(
        'touch_last_seen',
        { target_user_id: userId }
    )

    if (error) console.error("Failed to touch last seen:", error)
}

async function _getMyRank() {
    const userId = getUserId()

    if (!userId) return null

    const supabase = getSupabase()

    const myCode = await _getFriendCode()

    if (!myCode) return null

    const { data, error } = await supabase
        .from('public_profiles_ranked')
        .select('global_rank, total_players')
        .eq('friend_id', myCode)
        .single()

    if (error) throw error

    return {
        rank: data.global_rank as number,
        totalPlayers: data.total_players as number,
        percentile: data.total_players
            ? data.global_rank / data.total_players
            : 1,
    }
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

    const { data: existing } = await supabase
        .from('user_profiles')
        .select('union_name')
        .eq('user_id', userId)
        .maybeSingle()

    const { error } = await supabase
        .from('user_profiles')
        .update({
            union_name: unionName
        })
        .eq('user_id', userId)

    if (error) throw error

    return { from: existing?.union_name ?? null, to: unionName, changed: (existing?.union_name ?? null) !== unionName }
}

async function _saveFriendNickname(
    friendId: string,
    nickname: string
) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { data: existing } = await supabase
        .from('user_friends')
        .select('nickname')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle()

    const { error } = await supabase
        .from('user_friends')
        .update({
            nickname
        })
        .eq('user_id', userId)
        .eq('friend_id', friendId)

    if (error) throw error

    return { friendId, from: existing?.nickname ?? null, to: nickname, changed: (existing?.nickname ?? null) !== nickname }
}

async function _setFriendFavorite(
    friendId: string,
    favorite: boolean
) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    const { data: existing } = await supabase
        .from('user_friends')
        .select('favorite')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle()

    const { error } = await supabase
        .from('user_friends')
        .update({
            favorite
        })
        .eq('user_id', userId)
        .eq('friend_id', friendId)

    if (error) throw error

    return { friendId, from: existing?.favorite ?? null, to: favorite, changed: (existing?.favorite ?? null) !== favorite }
}

export function scoreFromProfile(profile: any) {
    return {
        power: {
            total: profile?.power_total ?? 0,
            whale: profile?.power_whale ?? 0,
            [KiokuRole.Attacker]: profile?.power_attacker ?? 0,
            [KiokuRole.Buffer]: profile?.power_buffer ?? 0,
            [KiokuRole.Debuffer]: profile?.power_debuffer ?? 0,
            [KiokuRole.Breaker]: profile?.power_breaker ?? 0,
            [KiokuRole.Defender]: profile?.power_defender ?? 0,
            [KiokuRole.Healer]: profile?.power_healer ?? 0,
        },
        kioku_count: {
            lim: profile?.kioku_lim ?? 0,
            limAs: profile?.kioku_lim_as ?? 0,
            perm: profile?.kioku_perm ?? 0,
            permAs: profile?.kioku_perm_as ?? 0,
        },
        isActive: profile?.is_active ?? false,
    }
}

async function attachSimilarity<T extends { friend_id?: string }>(
    myFriendId: string,
    rows: T[]
): Promise<(T & { accountSimilarity?: number })[]> {
    const otherCodes = rows.map(r => r.friend_id).filter(Boolean) as string[]

    if (!otherCodes.length) return rows

    const supabase = getSupabase()

    const { data, error } = await supabase.rpc(
        'get_similarity_for',
        {
            target_friend_id: myFriendId,
            other_friend_ids: otherCodes,
        }
    )

    if (error) {
        console.error("Failed to load precomputed similarities:", error)
        return rows
    }

    const byFriendId = new Map(
        (data as any[]).map(r => [r.other_friend_id as string, r.similarity as number])
    )

    return rows.map(row => ({
        ...row,
        accountSimilarity: row.friend_id ? byFriendId.get(row.friend_id) : undefined,
    }))
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

    const { data: rankedProfiles, error: rankedError } = await supabase
        .from('public_profiles_ranked')
        .select('friend_id, global_rank, total_players')
        .in('friend_id', friendCodes)

    if (rankedError) throw rankedError

    const rankByFriendId = new Map(
        (rankedProfiles ?? []).map(r => [r.friend_id, r])
    )

    const mergedProfiles = (profiles ?? []).map(p => ({
        ...p,
        ...rankByFriendId.get(p.friend_id),
    }))

    const myFriendId = await _getFriendCode()
    const withSimilarity = myFriendId
        ? await attachSimilarity(myFriendId, mergedProfiles)
        : mergedProfiles

    return relations.map(friend => {
        const profile = withSimilarity.find(
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
            accountSimilarity: profile?.accountSimilarity,
            rank: profile?.global_rank ?? null,
            totalPlayers: profile?.total_players ?? null,
            ...scoreFromProfile(profile),
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
    const userId = getUserId()
    const myFriendId = await _getFriendCode()

    if (userId) {
        const supabase = getSupabase()

        const { data: myProfile, error: myProfileError } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('user_id', userId)
            .single()

        if (myProfileError) throw myProfileError

        if (!myProfile?.display_name?.trim()) {
            throw new NameRequiredError()
        }
    }

    const supabase = getSupabase()

    const { data: profiles, error: profileError } = await supabase
        .from('public_profiles_ranked')
        .select('*')
        .neq("friend_id", myFriendId)

    if (profileError) throw profileError

    let followedCodes = new Set<string>()
    let favCodes = new Set<string>()
    if (userId) {
        const { data: relations, error: relationsError } = await supabase
            .from('user_friends')
            .select('friend_id, favorite')
            .eq('user_id', userId)

        if (relationsError) throw relationsError

        followedCodes = new Set((relations ?? []).map(r => r.friend_id))
        favCodes = new Set((relations ?? []).filter(r => r.favorite).map(r => r.friend_id))
    }

    const withSimilarity = myFriendId
        ? await attachSimilarity(myFriendId, profiles ?? [])
        : (profiles ?? [])

    return withSimilarity.map(profile => {
        return {
            friend_id: profile.friend_id,
            nickname: '',
            display_name: profile?.display_name || 'Unnamed',
            union_name: profile?.union_name || '',
            profile_icon: profile?.profile_icon,
            favorite: favCodes.has(profile.friend_id),
            isFriend: followedCodes.has(profile.friend_id),
            isUnionMember: false,
            accountSimilarity: profile?.accountSimilarity,
            rank: profile?.global_rank ?? null,
            totalPlayers: profile?.total_players ?? null,
            ...scoreFromProfile(profile),
        }
    })
}

async function _addFriendByCode(friendCode: string) {
    const userId = getUserId()

    if (!userId) return

    const supabase = getSupabase()

    friendCode = friendCode.toUpperCase()

    const myCode = await _getFriendCode()

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

        crysOptions: row.crys_options ?? {},

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

    const currentCode = await _getFriendCode()

    if (friendCode === currentCode) return { from: currentCode, to: friendCode, changed: false }

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

    return { from: currentCode, to: friendCode, changed: true }
}

export const createCloudUser = withAnalytics(
    _createCloudUser,
    'create_cloud_user',
    ([userId]) => ({ userId })
)

export const saveCharacters = withAnalytics(
    _saveCharacters,
    'save_characters',
    (_args, result) => result ?? {}
)

export const updateDisplayName = withAnalytics(
    _updateDisplayName,
    'update_display_name',
    (_args, result) => result ?? {}
)

export const updateprofile_icon = withAnalytics(
    _updateprofile_icon,
    'update_profile_icon',
    (_args, result) => result ?? {}
)

export const updateUnionName = withAnalytics(
    _updateUnionName,
    'update_union_name',
    (_args, result) => result ?? {}
)

export const saveFriendNickname = withAnalytics(
    _saveFriendNickname,
    'save_friend_nickname',
    (_args, result) => result ?? {}
)

export const setFriendFavorite = withAnalytics(
    _setFriendFavorite,
    'set_friend_favorite',
    (_args, result) => result ?? {}
)

export const loadAllPlayers = withAnalytics(
    _loadAllPlayers,
    'load_all_players',
    (_args, result) => ({ playerCount: result?.length ?? 0 })
)

export const addFriendByCode = withAnalytics(
    _addFriendByCode,
    'add_friend',
    ([friendCode]) => ({ friendCode })
)

export const loadCharactersByFriendCode = withAnalytics(
    _loadCharactersByFriendCode,
    'load_characters_by_friend_code',
    ([friendCode], result) => ({ friendCode, characterCount: result?.length ?? 0 })
)

export const removeFriend = withAnalytics(
    _removeFriend,
    'remove_friend',
    ([friendId]) => ({ friendId })
)

export const getFriendCode = withAnalytics(
    _getFriendCode,
    'get_friend_code',
    (_args, result) => ({ friendCode: result ?? null })
)

export const loadCharacters = withAnalytics(
    _loadCharacters,
    'load_characters',
    (_args, result) => ({ characterCount: result?.length ?? 0 })
)

export const restoreCloudAccount = withAnalytics(
    _restoreCloudAccount,
    'restore_cloud_account',
    ([userId], result) => ({ userId, success: !!result })
)

export const getMyProfile = withAnalytics(
    _getMyProfile,
    'get_my_profile',
    (_args, result) => ({ hasProfile: !!result, displayName: result?.display_name ?? null })
)

export const getMyRank = withAnalytics(
    _getMyRank,
    'get_my_rank',
    (_args, result) => ({
        rank: result?.rank ?? null,
        totalPlayers: result?.totalPlayers ?? null,
        percentile: result?.percentile ?? null,
    })
)

export const getSimilarityRelations = withAnalytics(
    _getSimilarityRelations,
    'get_similarity_relations',
    ([myFriendId], result) => ({ myFriendId, relatedCount: result?.length ?? 0 })
)

export const upsertSimilarity = withAnalytics(
    _upsertSimilarity,
    'upsert_similarity',
    ([, otherFriendId, similarity]) => ({ otherFriendId, similarity })
)

export const getAllUnionNames = withAnalytics(
    _getAllUnionNames,
    'get_all_union_names',
    (_args, result) => ({ unionCount: result?.length ?? 0 })
)

export const getFriends = withAnalytics(
    _getFriends,
    'get_friends',
    (_args, result) => ({ friendCount: result?.length ?? 0 })
)

export const getProfile = withAnalytics(
    _getProfile,
    'get_profile',
    ([friend_id], result) => ({ friend_id, found: !!result })
)

export const getUnionMembers = withAnalytics(
    _getUnionMembers,
    'get_union_members',
    ([unionName], result) => ({ unionName, memberCount: result?.length ?? 0 })
)

export const updateFriendCode = withAnalytics(
    _updateFriendCode,
    'update_friend_code',
    (_args, result) => result ?? {}
)
