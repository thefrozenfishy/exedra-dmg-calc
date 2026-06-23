import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    addFriendByCode,
    getFriends,
    removeFriend,
    updateDisplayName,
    getMyProfile,
    getMyRank,
    saveFriendNickname,
    loadCharactersByFriendCode,
    updateFriendCode,
    getUnionMembers,
    updateUnionName,
    setFriendFavorite,
    updateprofile_icon,
    getAllUnionNames,
    loadAllPlayers,
    scoreFromProfile,
    NameRequiredError,
} from '../store/cloud'
import { PowerScores } from '../models/PowerValue'
import { useCharacterStore } from '../store/characterStore'
import { getAccountSimilarityScore } from '../models/AccountSimilarityScore'
import { Character } from '../types/KiokuTypes'

export interface SocialProfile {
    friend_id: string
    display_name: string
    nickname?: string
    union_name?: string
    favorite?: boolean
    profile_icon?: number
    isFriend?: boolean
    isUnionMember?: boolean
    isActive?: boolean
    power?: PowerScores
    kioku_count?: { lim: number, limAs: number, perm: number, permAs: number }
    accountSimilarity?: number
    similarityLoading?: boolean
    rank?: number | null
    totalPlayers?: number | null
}

export interface MyRank {
    rank: number
    totalPlayers: number
    percentile: number
}

export const useFriendStore = defineStore('friendStore', () => {
    const characterStore = useCharacterStore()
    const friends = ref<SocialProfile[]>([])
    const unionOptions = ref<string[]>([])
    const displayName = ref('')
    const friendCode = ref('')
    const userID = ref(null)
    const unionName = ref('')
    const profile_icon = ref<number | undefined>(undefined)
    const myRank = ref<MyRank | undefined>(undefined)
    const nameRequired = ref(false)

    const initialized = ref(false)
    const loading = ref(false)

    const initialize = async () => {
        if (initialized.value || loading.value) return

        loading.value = true

        try {
            await Promise.all([
                loadMyProfile(),
                loadFriends(),
                loadUnionOptions(),
                loadMyRank(),
            ])

            initialized.value = true
        } finally {
            loading.value = false
        }
    }

    const loadMyRank = async () => {
        try {
            myRank.value = await getMyRank()
        } catch (err) {
            console.warn("Failed to load my rank:", err)
        }
    }

    const loadUnionOptions = async () => {
        try {
            unionOptions.value = await getAllUnionNames()
        } catch (err) {
            console.error("Failed loading unions:", err)
        }
    }

    const loadMyProfile = async () => {
        try {
            const profile = await getMyProfile()

            if (profile) {
                displayName.value = profile.display_name ?? ''
                unionName.value = profile.union_name ?? ''
                profile_icon.value = profile.profile_icon
                friendCode.value = profile.users?.friend_id
                userID.value = profile.users?.user_id
            }
        } catch (err) {
            console.error("Failed to load my profile:", err)
        }
    }

    const saveDisplayName = async () => {
        try {
            await updateDisplayName(displayName.value)
        } catch (err) {
            console.error("Failed to save display name:", err)
        }
    }

    const loadFriends = async (all = false) => {
        nameRequired.value = false

        try {
            friends.value = []
            let loadedFriends;
            if (all) {
                loadedFriends = await loadAllPlayers()
            } else {
                loadedFriends = await getFriends()
            }
            friends.value = loadedFriends

            if (unionName.value) {
                const unionMembers = await getUnionMembers(unionName.value)

                for (const member of unionMembers) {
                    if (member.friend_id === friendCode.value) {
                        continue
                    }

                    const existing = friends.value.find(
                        f => f.friend_id === member.friend_id
                    )

                    if (existing) {
                        existing.isUnionMember = true
                        continue
                    }

                    friends.value.push({
                        friend_id: member.friend_id,
                        display_name: member.display_name || 'Unnamed',
                        union_name: member.union_name || '',
                        profile_icon: member.profile_icon,
                        isFriend: false,
                        isUnionMember: true,
                        rank: member.global_rank ?? null,
                        totalPlayers: member.total_players ?? null,
                        ...scoreFromProfile(member),
                    })
                }
            }
        } catch (err) {
            if (err instanceof NameRequiredError) {
                nameRequired.value = true
                friends.value = []
                return
            }

            console.error("friendStore load friends error:", err)
        }
    }

    const loadFriendSimilarity = async (friendId: string) => {
        const friend = friends.value.find(f => f.friend_id === friendId)

        if (!friend || friend.accountSimilarity != null || friend.similarityLoading) return

        friend.similarityLoading = true

        try {
            const rows = await loadCharactersByFriendCode(friendId)
            const chars = characterStore.mergeChars(rows) as Character[]

            friend.accountSimilarity = getAccountSimilarityScore(characterStore.characters, chars)
        } catch (err) {
            console.error('Failed loading friend similarity:', friendId, err)
        } finally {
            friend.similarityLoading = false
        }
    }

    const addFriend = async (friendCode: string) => {
        await addFriendByCode(friendCode)
        const existing = friends.value.find(
            f => f.friend_id === friendCode
        )

        if (existing) {
            existing.isFriend = true
        }
        await loadFriends()
    }

    const saveFriendCode = async () => {
        await updateFriendCode(
            friendCode.value
        )
    }

    const saveNickname = async (
        friendId: string,
        nickname: string
    ) => {
        await saveFriendNickname(friendId, nickname)

        const friend = friends.value.find(
            f => f.friend_id === friendId
        )

        if (friend) {
            friend.nickname = nickname
        }
    }

    const deleteFriend = async (friendUserId: string) => {
        await removeFriend(friendUserId)

        const friend = friends.value.find(
            f => f.friend_id === friendUserId
        )

        if (!friend) return

        if (friend.isUnionMember) {
            friend.isFriend = false
            friend.favorite = false
            friend.nickname = ''
        } else {
            friends.value = friends.value.filter(
                f => f.friend_id !== friendUserId
            )
        }
    }

    const saveUnionName = async () => {
        await updateUnionName(
            unionName.value
        )
        await loadFriends()
    }

    const toggleFavorite = async (
        friendId: string
    ) => {
        const friend = friends.value.find(
            f => f.friend_id === friendId
        )

        if (!friend) return

        friend.favorite = !friend.favorite

        await setFriendFavorite(
            friendId,
            friend.favorite
        )
    }

    const saveprofile_icon = async () => {
        if (profile_icon.value) await updateprofile_icon(profile_icon.value)
    }

    return {
        friends,
        displayName,
        saveDisplayName,
        addFriend,
        deleteFriend,
        saveNickname,
        friendCode,
        userID,
        saveFriendCode,
        unionName,
        saveUnionName,
        toggleFavorite,
        profile_icon,
        saveprofile_icon,
        loadMyProfile,
        initialize,
        unionOptions,
        loadFriends,
        loadFriendSimilarity,
        myRank,
        loadMyRank,
        nameRequired,
    }
})
