import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    addFriendByCode,
    getFriends,
    removeFriend,
    updateDisplayName,
    getMyProfile,
    saveFriendNickname,
    loadCharactersByFriendCode,
} from '../store/cloud'
import { getPowerScores } from '../models/PowerValue'
import { useCharacterStore } from '../store/characterStore'

export interface FriendProfile {
    friend_id: string
    display_name: string,
    nickname?: string,
    power?: {
        total: number
        attacker: number
        buffer: number
        debuffer: number
        breaker: number
        defender: number
        healer: number
    },
}

export const useFriendStore = defineStore('friendStore', () => {
    const characterStore = useCharacterStore()
    const friends = ref<FriendProfile[]>([])
    const displayName = ref('')

    const loadProfile = async () => {
        try {
            const profile = await getMyProfile()

            if (profile) {
                displayName.value = profile.display_name ?? ''
            }
        } catch (err) {
            console.error(err)
        }
    }

    const saveDisplayName = async () => {
        try {
            await updateDisplayName(displayName.value)
        } catch (err) {
            console.error(err)
        }
    }

    const loadFriends = async () => {
        try {
            friends.value = await getFriends()
            await Promise.all(
                friends.value.map(async friend => {
                    try {
                        const rows = await loadCharactersByFriendCode(
                            friend.friend_id
                        )

                        const chars = characterStore.mergeChars(rows)

                        friend.power = getPowerScores(chars)
                    } catch (err) {
                        console.error(
                            'Failed loading friend power:',
                            friend.friend_id,
                            err
                        )
                    }
                })
            )
        } catch (err) {
            console.error(err)
        }
    }

    const addFriend = async (friendCode: string) => {
        await addFriendByCode(friendCode)
        await loadFriends()
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

        friends.value = friends.value.filter(
            f => f.friend_id !== friendUserId
        )
    }

    return {
        friends,
        displayName,
        loadProfile,
        saveDisplayName,
        loadFriends,
        addFriend,
        deleteFriend,
        saveNickname,
    }
})
