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
                    <label>Your Name</label>

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
                        <div class="friend-left">
                            <div class="friend-name-row">
                                <div class="friend-primary">
                                    {{ friend.nickname || friend.display_name }}
                                </div>

                                <button class="edit-nick-btn" @click="editingFriend = friend.friend_id">
                                    🖊
                                </button>
                            </div>

                            <div v-if="friend.nickname && friend.display_name" class="friend-secondary">
                                {{ friend.display_name }}
                            </div>

                            <div class="friend-code">
                                {{ friend.friend_id }}
                            </div>

                            <input v-if="editingFriend === friend.friend_id" v-model="friend.nickname"
                                class="nickname-inline-input" placeholder="Nickname" maxlength="24"
                                @blur="finishNicknameEdit(friend)" @keydown.enter="finishNicknameEdit(friend)" />
                        </div>

                        <div v-if="friend.power" class="friend-power">
                            <div class="total-power-big" title="Power rating">
                                <img :src="'/exedra-dmg-calc/pwr.png'" alt="Total" />

                                <div class="total-power-value">
                                    {{ friend.power.total }}
                                </div>
                            </div>

                            <div class="role-grid-compact">
                                <div class="mini-power-box" title="Attacker power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Attacker.png'" alt="Attacker" />
                                    <span>{{ friend.power.attacker }}</span>
                                </div>

                                <div class="mini-power-box" title="Buffer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Buffer.png'" alt="Buffer" />
                                    <span>{{ friend.power.buffer }}</span>
                                </div>

                                <div class="mini-power-box" title="Debuffer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Debuffer.png'" alt="Debuffer" />
                                    <span>{{ friend.power.debuffer }}</span>
                                </div>

                                <div class="mini-power-box" title="Breaker power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Breaker.png'" alt="Breaker" />
                                    <span>{{ friend.power.breaker }}</span>
                                </div>

                                <div class="mini-power-box" title="Defender power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Defender.png'" alt="Defender" />
                                    <span>{{ friend.power.defender }}</span>
                                </div>

                                <div class="mini-power-box" title="Healer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Healer.png'" alt="Healer" />
                                    <span>{{ friend.power.healer }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="friend-actions">
                            <router-link :to="{
                                path: '/my-kioku',
                                query: {
                                    friend: friend.friend_id
                                }
                            }">
                                View Kioku
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
import { loadCharactersByFriendCode } from '../store/cloud'
import { getPowerScores } from '../models/PowerValue'
import { useCharacterStore } from '../store/characterStore'

const store = useFriendStore()
const characterStore = useCharacterStore()

const editingFriend = ref<string | null>(null)

const finishNicknameEdit = async (
    friend: FriendProfile
) => {
    try {
        await saveNickname(friend)
    } finally {
        editingFriend.value = null
    }
}

const userId = getUserId()

const friendCode = ref('')

onMounted(async () => {
    if (!userId) return

    await store.loadProfile()
    await store.loadFriends()

    await Promise.all(
        store.friends.map(async friend => {
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

        toast.success('Nickname updated!', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error(err)

        toast.error('Failed to save nickname', {
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
    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    background: #1f1f1f;
    padding: 1rem;

    border-radius: 12px;
}

.friend-left {
    min-width: 160px;

    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.friend-primary {
    font-size: 1.1rem;
    font-weight: bold;
}

.friend-secondary {
    opacity: 0.75;
    font-size: 0.9rem;
}

.friend-code {
    opacity: 0.6;
    font-size: 0.85rem;
}

.friend-power {
    display: flex;
    align-items: center;
    gap: 1rem;

    flex: 1;
}

.total-power-big {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-width: 78px;
    height: 78px;

    border-radius: 18px;

    background: #33263f;
    border: 1px solid #8e5bc7;
}

.total-power-big img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.total-power-value {
    font-size: 1.4rem;
    font-weight: bold;

    color: #fff;
}

.role-grid-compact {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 0.45rem;
}

.mini-power-box {
    display: flex;
    align-items: center;
    gap: 0.35rem;

    min-width: 70px;

    background: #292929;
    border: 1px solid #444;

    border-radius: 999px;

    padding: 0.2rem 0.5rem;
}

.mini-power-box img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.mini-power-box span {
    font-size: 0.78rem;
    font-weight: bold;
}

.friend-actions {
    display: flex;
    flex-direction: column;

    gap: 0.45rem;

    width: 150px;
}

.friend-actions input {
    width: 100%;
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

.friend-display {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.friend-primary {
    font-size: 1.1rem;
    font-weight: bold;
}

.friend-secondary {
    opacity: 0.75;
    font-size: 0.9rem;
}

.power-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.4rem;
}

.power-box {
    display: flex;
    align-items: center;
    gap: 0.35rem;

    background: #292929;
    border: 1px solid #444;

    border-radius: 999px;

    padding: 0.2rem 0.55rem;
}

.power-box img {
    width: 18px;
    height: 18px;
    object-fit: contain;
}

.power-value {
    font-size: 0.8rem;
    font-weight: bold;
    color: #ddd;
}

.total-power {
    background: #33263f;
    border-color: #8e5bc7;
}

.friend-name-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0 auto;
}

.edit-nick-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;
    height: 22px;

    padding: 0;

    font-size: 0.75rem;
    line-height: 1;

    opacity: 0.75;
}

.edit-nick-btn:hover {
    opacity: 1;
    background: #454545;
}

.nickname-inline-input {
    margin-top: 0.35rem;

    width: 140px;

    background: #111;
    border: 1px solid #666;

    border-radius: 8px;

    color: white;

    padding: 0.35rem 0.55rem;
}
</style>