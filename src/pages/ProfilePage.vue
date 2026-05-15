<template>
    <div class="profile-page">
        <h1>Profile & Friends</h1>

        <div v-if="!userId" class="offline-box">
            Enable cloud sync first to use profiles and friends.
        </div>

        <template v-else>
            <section class="profile-section">
                <h2>Profile</h2>

                <div class="friend-card self-card">
                    <div class="friend-left">
                        <div class="profile-avatar-wrapper" ref="avatarPickerRef">
                            <button class="profile-avatar-button" ref="avatarButtonRef"
                                @click="showAvatarPicker = !showAvatarPicker">
                                <div class="profile-avatar-ring">
                                    <img class="profile-avatar-large" :src="avatarUrl(store.profile_icon)"
                                        alt="Profile avatar" />
                                </div>
                            </button>

                            <transition name="fade-scale">
                                <div v-if="showAvatarPicker" class="avatar-picker">
                                    <div class="avatar-picker-title">
                                        Select Profile Avatar
                                    </div>

                                    <div class="avatar-grid">
                                        <button v-for="ch in iconPicker" :key="ch.id" class="avatar-option"
                                            :class="{ selected: ch.id === store.profile_icon }"
                                            @click="selectAvatar(ch.id)">
                                            <img :src="kiokuThumb(ch.id)" :alt="ch.name" />
                                        </button>
                                    </div>
                                </div>
                            </transition>
                        </div>

                        <div class="friend-info profile-info">
                            <div class="friend-name-row">
                                <div class="friend-primary">
                                    {{ store.displayName || 'Unnamed' }}
                                </div>

                                <button class="edit-nick-btn" @click="editingSelfName = true">
                                    🖊
                                </button>
                            </div>

                            <div class="friend-code-row">
                                <div class="friend-code">
                                    {{ store.friendCode }}
                                </div>

                                <button class="edit-nick-btn" @click="editingFriendCode = true">
                                    🖊
                                </button>
                            </div>

                            <div class="friend-code-row">
                                <img :src="'/exedra-dmg-calc/union.png'" alt="Union" />

                                <div class="friend-code">
                                    {{ store.unionName || 'No union' }}
                                </div>

                                <button class="edit-nick-btn" @click="editingUnionName = true">
                                    🖊
                                </button>
                            </div>

                            <input v-if="editingUnionName" v-model="pendingUnionName" class="nickname-inline-input"
                                placeholder="Union name" maxlength="32" @blur="finishUnionEdit"
                                @keydown.enter="finishUnionEdit" />

                            <input v-if="editingFriendCode" v-model="pendingFriendCode" class="nickname-inline-input"
                                placeholder="Friend code" maxlength="5" @blur="finishFriendCodeEdit"
                                @keydown.enter="finishFriendCodeEdit" />

                            <input v-if="editingSelfName" v-model="pendingDisplayName" class="nickname-inline-input"
                                placeholder="Display name" maxlength="32" @blur="finishDisplayNameEdit"
                                @keydown.enter="finishDisplayNameEdit" />
                        </div>
                    </div>

                    <div v-if="myPower" class="friend-power">
                        <div class="total-power-big" title="Power rating">
                            <img :src="'/exedra-dmg-calc/pwr.png'" alt="Total" />

                            <div class="total-power-value">
                                {{ myPower.total }}
                            </div>
                        </div>

                        <div class="role-grid-compact">
                            <div class="mini-power-box" title="Attacker power rating">
                                <img :src="'/exedra-dmg-calc/roles/Attacker.png'" />
                                <span>{{ myPower.attacker }}</span>
                            </div>

                            <div class="mini-power-box" title="Buffer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Buffer.png'" />
                                <span>{{ myPower.buffer }}</span>
                            </div>

                            <div class="mini-power-box" title="Debuffer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Debuffer.png'" />
                                <span>{{ myPower.debuffer }}</span>
                            </div>

                            <div class="mini-power-box" title="Breaker power rating">
                                <img :src="'/exedra-dmg-calc/roles/Breaker.png'" />
                                <span>{{ myPower.breaker }}</span>
                            </div>

                            <div class="mini-power-box" title="Defender power rating">
                                <img :src="'/exedra-dmg-calc/roles/Defender.png'" />
                                <span>{{ myPower.defender }}</span>
                            </div>

                            <div class="mini-power-box" title="Healer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Healer.png'" />
                                <span>{{ myPower.healer }}</span>
                            </div>
                        </div>

                        <div class="whale-power-big" title="Whale power">
                            <img :src="'/exedra-dmg-calc/gem.png'" alt="Whale power" />

                            <div class="total-power-value">
                                {{ myPower.whale }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="friend-section">
                <h2>Friends</h2>

                <div class="add-friend-row">

                    <label for="sortMode">Sort by:</label>
                    <select v-model="sortMode" id="sortMode">
                        <option value="default">
                            Default
                        </option>

                        <option value="name">
                            Name Only
                        </option>

                        <option value="total">
                            Total Power
                        </option>

                        <option value="attacker">
                            Attacker Power
                        </option>

                        <option value="buffer">
                            Buffer Power
                        </option>

                        <option value="debuffer">
                            Debuffer Power
                        </option>

                        <option value="breaker">
                            Breaker Power
                        </option>

                        <option value="defender">
                            Defender Power
                        </option>

                        <option value="healer">
                            Healer Power
                        </option>

                        <option value="whale">
                            Whale Power
                        </option>
                    </select>

                    <input v-model="friendCode" placeholder="Enter friend code" maxlength="5" />

                    <button @click="addFriend">
                        Follow
                    </button>

                </div>

                <p>Power values will see some changes while formula is being fine tuned!</p>
                <div class="friend-list">
                    <div v-for="friend in sortedFriends" :key="friend.friend_id" class="friend-card"
                        :class="{ 'union-member': friend.isUnionMember }">
                        <div class="friend-left">
                            <div class="friend-avatar-wrapper">
                                <img class="profile-avatar" :src="avatarUrl(friend)" />

                                <button v-if="friend.isFriend" class="favorite-badge"
                                    @click="store.toggleFavorite(friend.friend_id)">
                                    {{ friend.favorite ? '★' : '☆' }}
                                </button>
                            </div>

                            <div class="friend-info">
                                <div class="friend-name-row">
                                    <div class="friend-primary">
                                        {{
                                            friend.nickname?.trim()
                                            || friend.display_name?.trim()
                                        }}
                                    </div>

                                    <button v-if="friend.isFriend" class="edit-nick-btn"
                                        @click="editingFriend = friend.friend_id">
                                        🖊
                                    </button>
                                </div>

                                <div v-if="friend.nickname?.trim() && friend.display_name?.trim()"
                                    class="friend-secondary">
                                    {{ friend.display_name }}
                                </div>

                                <div v-if="friend.union_name?.trim()" class="friend-union">
                                    <img :src="'/exedra-dmg-calc/union.png'" alt="Union" />

                                    <span>
                                        {{ friend.union_name }}
                                    </span>
                                </div>

                                <input v-if="editingFriend === friend.friend_id" v-model="friend.nickname"
                                    class="nickname-inline-input" placeholder="Nickname" maxlength="24"
                                    @blur="finishNicknameEdit(friend)" @keydown.enter="finishNicknameEdit(friend)" />
                            </div>
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

                            <div class="whale-power-big" title="Whale power">
                                <img :src="'/exedra-dmg-calc/gem.png'" alt="Whale power" />

                                <div class="total-power-value">
                                    {{ friend.power.whale }}
                                </div>
                            </div>
                        </div>

                        <div class="friend-actions">
                            <router-link v-slot="{ href }" :to="{
                                path: '/my-kioku',
                                query: {
                                    friend: friend.friend_id
                                }
                            }" custom>
                                <a :href="href" target="_blank" rel="noopener noreferrer">
                                    View Kioku
                                </a>
                            </router-link>

                            <router-link v-slot="{ href }" :to="{
                                path: '/account-compare',
                                query: {
                                    left: store.friendCode,
                                    right: friend.friend_id,
                                }
                            }" custom>
                                <a :href="href" target="_blank" rel="noopener noreferrer">
                                    Compare
                                </a>
                            </router-link>

                            <button v-if="!friend.isFriend" @click="store.addFriend(friend.friend_id)">
                                Follow
                            </button>

                            <button v-else class="remove-btn" @click="store.deleteFriend(friend.friend_id)">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
    <div>
        <p>Curious how the power values are calculated? Check out the calculation on <a
                href="https://github.com/thefrozenfishy/exedra-dmg-calc/blob/main/src/models/PowerValue.ts" class="link"
                target="_blank" rel="noopener noreferrer">Github</a>
        </p>
        <p>If you think the calculation can be improved, talk to me about it!</p>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { SocialProfile, useFriendStore } from '../store/friendStore'
import { getUserId } from '../store/user'
import { getPowerScores } from '../models/PowerValue'
import { useCharacterStore } from '../store/characterStore'
import { useSetting } from '../store/settingsStore'

const store = useFriendStore()
const characterStore = useCharacterStore()

const myPower = computed(() =>
    getPowerScores(characterStore.characters)
)
const editingFriend = ref<string | null>(null)

const finishNicknameEdit = async (
    friend: SocialProfile
) => {
    try {
        await saveNickname(friend)
    } finally {
        editingFriend.value = null
    }
}

const userId = getUserId()
const editingFriendCode = ref(false)
const pendingFriendCode = ref('')
const friendCode = ref('')
const editingUnionName = ref(false)
const pendingUnionName = ref('')
const avatarPickerRef = ref<HTMLElement | null>(null)
const avatarButtonRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node

    if (
        avatarPickerRef.value &&
        !avatarPickerRef.value.contains(target) &&
        avatarButtonRef.value &&
        !avatarButtonRef.value.contains(target)
    ) {
        showAvatarPicker.value = false
    }
}

onMounted(async () => {
    if (!userId) return

    pendingDisplayName.value = store.displayName
    pendingFriendCode.value = store.friendCode
    pendingUnionName.value = store.unionName

    document.addEventListener(
        'mousedown',
        handleClickOutside
    )
})

onBeforeUnmount(() => {
    document.removeEventListener(
        'mousedown',
        handleClickOutside
    )
})

const editingSelfName = ref(false)

const pendingDisplayName = ref('')

const showAvatarPicker = ref(false)

const iconPicker = computed(() => [...characterStore.characters].sort((a, b) => a.id - b.id)
)
const selectAvatar = async (id: number) => {
    store.profile_icon = id

    await store.saveprofile_icon()

    showAvatarPicker.value = false

    toast.success(
        'Profile avatar updated!',
        {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        }
    )
}

type SortModes = 'default' | 'name' | 'total' | 'whale' | 'attacker' | 'buffer' | 'debuffer' | 'breaker' | 'defender' | 'healer'
const sortMode = useSetting<SortModes>("sortMode", "default")


const sortedFriends = computed(() => {
    const arr = [...store.friends]

    arr.sort((a, b) => {
        if (sortMode.value === 'default') {
            if (!!a.favorite !== !!b.favorite) {
                return a.favorite ? -1 : 1
            }

            if (!!a.isUnionMember !== !!b.isUnionMember) {
                return a.isUnionMember
                    ? -1
                    : 1
            }
        }

        let diff = 0

        switch (sortMode.value) {
            case 'total':
                diff = (b.power?.total || 0) - (a.power?.total || 0)
                break

            case 'whale':
                diff = (b.power?.whale || 0) - (a.power?.whale || 0)
                break

            case 'attacker':
                diff = (b.power?.attacker || 0) - (a.power?.attacker || 0)
                break

            case 'buffer':
                diff = (b.power?.buffer || 0) - (a.power?.buffer || 0)
                break

            case 'debuffer':
                diff = (b.power?.debuffer || 0) - (a.power?.debuffer || 0)
                break

            case 'breaker':
                diff = (b.power?.breaker || 0) - (a.power?.breaker || 0)
                break

            case 'defender':
                diff = (b.power?.defender || 0) - (a.power?.defender || 0)
                break

            case 'healer':
                diff = (b.power?.healer || 0) - (a.power?.healer || 0)
                break
        }

        if (diff !== 0) {
            return diff
        }

        return (
            a.nickname ||
            a.display_name
        ).localeCompare(
            b.nickname ||
            b.display_name
        )
    })

    return arr
})

const finishDisplayNameEdit = async () => {
    try {
        store.displayName = pendingDisplayName.value

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
    } finally {
        editingSelfName.value = false
    }
}

const finishFriendCodeEdit = async () => {
    try {
        store.friendCode = pendingFriendCode.value
            .trim()
            .toUpperCase()

        await store.saveFriendCode()

        toast.success(
            'Friend code updated!',
            {
                position:
                    toast.POSITION.TOP_RIGHT,
                icon: false,
            }
        )
    } catch (err) {
        console.error(err)

        toast.error(
            err instanceof Error
                ? err.message
                : 'Failed to update friend code, it must be unique',
            {
                position:
                    toast.POSITION.TOP_RIGHT,
                icon: false,
            }
        )
    } finally {
        editingFriendCode.value = false
    }
}

const finishUnionEdit = async () => {
    try {
        store.unionName = pendingUnionName.value.trim()

        await store.saveUnionName()

        toast.success('Union updated!', {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        })
    } catch (err) {
        console.error(err)

        toast.error(
            'Failed to update union',
            {
                position:
                    toast.POSITION.TOP_RIGHT,
                icon: false,
            }
        )
    } finally {
        editingUnionName.value = false
    }
}

const saveNickname = async (friend: SocialProfile) => {
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

const kiokuThumb = (id: number) => `/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`

const avatarUrl = (
    profile:
        | { profile_icon?: number }
        | number
        | undefined
) => {
    if (typeof profile === 'number') {
        return kiokuThumb(profile)
    }

    return kiokuThumb(
        profile?.profile_icon ||
        10010101
    )
}
</script>
<style scoped>
.profile-page {
    max-width: 960px;
    margin: 0 auto;
    color: #ddd;
}

/* =========================
   Sections
========================= */

.profile-section,
.friend-section {
    margin-top: 2rem;
    padding: 1.2rem;
    background: #2b2b2b;
    border-radius: 16px;
}

/* =========================
   Inputs / Buttons
========================= */

input,
select {
    background: #111;
    border: 1px solid #555;
    border-radius: 10px;
    color: white;
    padding: 0.7rem 0.9rem;
}

button,
a {
    background: #444;
    border: 1px solid #666;
    color: white;
    padding: 0.3rem 0.5rem;
    border-radius: 10px;
    text-decoration: none;
    cursor: pointer;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.12s ease;
}

button:hover,
a:hover {
    background: #555;
    border-color: #777;
}

button:active,
a:active {
    transform: scale(0.98);
}

a.link {
    padding: 0.2rem;
}

/* =========================
   Header Row
========================= */

.add-friend-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.add-friend-row input {
    width: 160px;
}

/* =========================
   Friend List
========================= */

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

    gap: 1.2rem;

    background: #1f1f1f;
    padding: 0.5rem 0.7rem;

    border-radius: 14px;
}

.friend-card.union-member {
    border: 1px solid #3f5d8a;
}

.self-card {
    border: 1px solid #5f4a74;
    background:
        linear-gradient(180deg,
            #26212f 0%,
            #1f1f1f 100%);
}

/* =========================
   Left Side
========================= */

.friend-left {
    display: flex;
    align-items: center;

    gap: 1rem;

    min-width: 0;

    flex: 1 1 auto;

    max-width: 220px;
}

/* =========================
   Avatars
========================= */

.friend-avatar-wrapper {
    display: block;
    position: relative;
}

.profile-avatar {
    width: 54px;
    height: 54px;

    border-radius: 50%;
    object-fit: cover;

    border: 2px solid #666;
    background: #222;

    display: block;
}

.profile-avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.profile-avatar-button {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}

.profile-avatar-ring {
    width: 88px;
    height: 88px;

    border-radius: 50%;

    transition:
        transform 0.15s ease,
        filter 0.15s ease;
}

.profile-avatar-ring:hover {
    transform: scale(1.04);
    filter: brightness(1.05);
}

.profile-avatar-large {
    width: 100%;
    height: 100%;

    border-radius: 50%;
    object-fit: cover;

    border: 3px solid #8e5bc7;
    background: #222;

    display: block;
}

/* =========================
   Favorite Star
========================= */

.favorite-badge {
    position: absolute;

    top: -5px;
    right: -10px;

    width: 22px;
    height: 22px;

    border-radius: 50%;

    padding: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #3b2b17;
    border: 1px solid #c59a3d;

    color: #ffd66b;

    font-size: 0.8rem;
    font-weight: bold;
}

.favorite-badge:hover {
    background: #4b361b;
    transform: scale(1.08);
}

/* =========================
   Friend Info
========================= */

.friend-info {
    display: flex;
    flex-direction: column;

    align-items: flex-start;
    justify-content: center;

    gap: 0.18rem;

    min-width: 0;
}

.profile-info {
    max-width: 260px;
}

.profile-info img {
    width: 24px;
    height: 24px;
}

.friend-code-row,
.friend-union {
    min-width: 0;
}

.friend-name-row {
    display: flex;
    align-items: center;

    gap: 0.45rem;

    line-height: 1;

    min-width: 0;
}

.friend-primary {
    flex: 1;
    min-width: 0;

    font-size: 1.05rem;
    font-weight: 700;

    line-height: 1.05;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    max-width: 140px;
}

.friend-secondary {
    font-size: 0.78rem;
    line-height: 1;

    opacity: 0.65;
}

.friend-union {
    display: flex;
    align-items: center;

    gap: 0.32rem;

    font-size: 0.74rem;
    line-height: 1;

    opacity: 0.8;
}

.friend-union img {
    width: 13px;
    height: 13px;
}

.friend-code-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.friend-code {
    opacity: 0.65;
    font-size: 0.88rem;
}

/* =========================
   Edit Buttons
========================= */

.edit-nick-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;
    height: 22px;

    padding: 0;

    font-size: 0.75rem;
    line-height: 1;

    opacity: 0.7;
}

.edit-nick-btn:hover {
    opacity: 1;
    background: #4b4b4b;
}

.nickname-inline-input {
    margin-top: 0.45rem;
    width: 120px;
}

/* =========================
   Power Area
========================= */

.friend-power {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 0.9rem;

    flex: 1;

    min-width: 0;
}

.total-power-big,
.whale-power-big {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-width: 78px;
    height: 78px;

    border-radius: 18px;
}

.total-power-big {
    background: #33263f;
    border: 1px solid #8e5bc7;
}

.whale-power-big {
    border: 1px solid #8e5bc7;
}

.total-power-big img,
.whale-power-big img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.total-power-value {
    font-size: 1.3rem;
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

    min-width: 72px;

    background: #292929;
    border: 1px solid #444;

    border-radius: 999px;

    padding: 0.22rem 0.55rem;
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

/* =========================
   Right Actions
========================= */

.friend-actions {
    display: flex;
    flex-direction: column;

    gap: 0.2rem;

    width: 120px;
    flex-shrink: 0;
}

.friend-actions a,
.friend-actions button {
    width: 100%;
    box-sizing: border-box;

    text-align: center;
}

.friend-actions a {
    background: #5b4a78;
    border-color: #8e5bc7;

    font-weight: 600;
}

.friend-actions a:hover {
    background: #705998;
}

.remove-btn {
    background: #3a2424;
    border-color: #6b3a3a;
}

.remove-btn:hover {
    background: #522f2f;
}

/* =========================
   Avatar Picker
========================= */

.avatar-picker {
    position: absolute;

    top: 98px;
    left: 0;

    z-index: 100;

    width: 340px;

    padding: 1rem;

    border-radius: 16px;

    background: #1f1f1f;
    border: 1px solid #444;

    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.35);
}

.avatar-picker-title {
    margin-bottom: 0.75rem;

    font-size: 0.95rem;
    font-weight: bold;
}

.avatar-grid {
    display: grid;

    grid-template-columns:
        repeat(auto-fill, minmax(54px, 1fr));

    gap: 0.55rem;

    max-height: 300px;

    overflow-y: auto;
}

.avatar-option {
    padding: 0;

    border: none;

    background: transparent;

    border-radius: 50%;
}

.avatar-option:hover {
    transform: scale(1.08);
}

.avatar-option.selected {
    box-shadow:
        0 0 0 2px #b57edc;
}

.avatar-option img {
    width: 54px;
    height: 54px;

    border-radius: 50%;

    display: block;
}

/* =========================
   Animations
========================= */

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.96);
}

/* =========================
   Misc
========================= */

.offline-box {
    margin-top: 2rem;
    padding: 1rem;
    background: #2b2b2b;
    border-radius: 12px;
}

/* =========================
   Mobile
========================= */

@media (max-width: 900px) {
    .friend-card {
        flex-direction: column;
        align-items: stretch;
    }

    .friend-power {
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .friend-actions {
        width: 100%;
        flex-direction: row;
    }

    .friend-actions a,
    .friend-actions button {
        flex: 1;
    }

    .friend-primary {
        max-width: 500px;
    }
}
</style>