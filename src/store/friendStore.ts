import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
    addFriendByCode,
    getFriends,
    removeFriend,
    updateDisplayName,
    getMyProfile,
    saveFriendNickname,
} from '../store/cloud'

export interface FriendProfile {
    friend_id: string
    display_name: string,
    nickname?: string
}

export const useFriendStore = defineStore('friendStore', () => {
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
