<template>
    <div class="profile-page">
        <h1>Profile & Friends</h1>

        <div v-if="!userId" class="offline-box">
            Enable cloud sync first to use profiles and friends.
        </div>

        <template v-else>
            <section class="profile-section">
                <h2>Profile</h2>

                <div class="profile-row">
                    <label>Display Name</label>

                    <input v-model="store.displayName" maxlength="32" placeholder="Enter display name" />

                    <button @click="saveName">
                        Save
                    </button>
                </div>
            </section>

            <section class="friend-section">
                <h2>Friends</h2>

                <div class="add-friend-row">
                    <input v-model="friendCode" placeholder="Enter friend code" maxlength="5" />

                    <button @click="addFriend">
                        Add Friend
                    </button>
                </div>

                <div class="friend-list">
                    <div v-for="friend in store.friends" :key="friend.friend_id" class="friend-card">
                        <div class="friend-display">
                            <div class="friend-primary">
                                {{ friend.nickname || friend.display_name }}
                            </div>

                            <div v-if="friend.nickname && friend.display_name" class="friend-secondary">
                                ({{ friend.display_name }})
                            </div>

                            <div class="friend-code">
                                {{ friend.friend_id }}
                            </div>
                        </div>

                        <div class="friend-actions">
                            <input v-model="friend.nickname" placeholder="Nickname" @change="saveNickname(friend)" />
                            <router-link :to="{
                                path: '/my-kioku',
                                query: {
                                    friend: friend.friend_id
                                }
                            }"> View Kioku
                            </router-link>

                            <button class="remove-btn" @click="store.deleteFriend(friend.friend_id)">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { FriendProfile, useFriendStore } from '../store/friendStore'
import { getUserId } from '../store/user'

const store = useFriendStore()

const userId = getUserId()

const friendCode = ref('')

onMounted(async () => {
    if (!userId) return

    await store.loadProfile()
    await store.loadFriends()
})

const saveName = async () => {
    try {
        await store.saveDisplayName()

        toast.success('Profile updated!', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error(err)

        toast.error('Failed to save profile', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}

const saveNickname = async (friend: FriendProfile) => {
    try {
        await store.saveNickname(
            friend.friend_id,
            friend.nickname || ''
        )

        toast.success('Profile updated!', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error(err)

        toast.error('Failed to save profile', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}


const addFriend = async () => {
    try {
        await store.addFriend(friendCode.value)

        friendCode.value = ''

        toast.success('Friend added!', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error(err)

        toast.error('Failed to add friend', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    }
}
</script>
<style scoped>
.profile-page {
    max-width: 900px;
    margin: 0 auto;
    color: #ddd;
}

.profile-section,
.friend-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #2b2b2b;
    border-radius: 12px;
}

.profile-row,
.add-friend-row {
    display: flex;
    gap: 1rem;
    align-items: center;
}

input {
    flex: 1;
    background: #111;
    border: 1px solid #555;
    border-radius: 8px;
    color: white;
    padding: 0.7rem;
}

button,
a {
    background: #444;
    border: 1px solid #666;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
}

button:hover,
a:hover {
    background: #555;
}

.friend-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.friend-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1f1f1f;
    padding: 1rem;
    border-radius: 12px;
}

.friend-name {
    font-size: 1.1rem;
    font-weight: bold;
}

.friend-code {
    opacity: 0.7;
}

.friend-actions {
    display: flex;
    gap: 0.5rem;
}

.remove-btn {
    background: #612020;
}

.remove-btn:hover {
    background: #7d2a2a;
}

.offline-box {
    margin-top: 2rem;
    padding: 1rem;
    background: #2b2b2b;
    border-radius: 12px;
}
</style>