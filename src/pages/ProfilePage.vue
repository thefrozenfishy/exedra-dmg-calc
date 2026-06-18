<template>
    <div class="profile-page">
        <div v-if="isBeta()">
            <button @click="showGraph = !showGraph">{{ showGraph ? 'Hide' : 'Show' }} graph</button>

            <section v-if="showGraph" class="profile-section analytics-section">
                <h2>Power Analytics</h2>
                <div>
                    <button @click="loadPlayers">Load more players into the graph</button>
                    <button @click="exportData">Export Data</button>
                </div>
                <div class="analytics-controls">
                    <label>
                        Graph Mode
                        <select v-model="graphMode">
                            <option value="scatter">
                                Scatter Plot
                            </option>

                            <option value="percentile">
                                Percentile Curve
                            </option>
                        </select>
                    </label>

                    <label>
                        X Axis
                        <select v-model="selectedXAxis">
                            <option v-for="opt in graphOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </label>

                    <label v-if="graphMode === 'scatter'">
                        Y Axis
                        <select v-model="selectedYAxis">
                            <option v-for="opt in graphOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </label>
                </div>

                <div class="chart-wrapper analytics-chart">
                    <canvas ref="analyticsCanvasRef"></canvas>
                </div>
            </section>
        </div>
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
                                placeholder="No Union" maxlength="32" list="union-list" @blur="finishUnionEdit"
                                @keydown.enter="finishUnionEdit" />

                            <datalist id="union-list">
                                <option v-for="u in store.unionOptions" :key="u" :value="u" />
                            </datalist>

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

                        <div v-if="isTouchDevice" class="whale-power-big" title="Whale power">
                            <img :src="'/exedra-dmg-calc/gem.png'" alt="Whale power" />

                            <div class="total-power-value">
                                {{ myPower.whale }}
                            </div>
                        </div>

                        <div class="role-grid-compact role-grid-4-compact">
                            <div class="mini-power-box" title="Attacker power rating">
                                <img :src="'/exedra-dmg-calc/roles/Attacker.png'" />
                                <span>{{ myPower[KiokuRole.Attacker] }}</span>
                            </div>

                            <div class="mini-power-box" title="Buffer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Buffer.png'" />
                                <span>{{ myPower[KiokuRole.Buffer] }}</span>
                            </div>

                            <div class="mini-power-box" title="Debuffer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Debuffer.png'" />
                                <span>{{ myPower[KiokuRole.Debuffer] }}</span>
                            </div>

                            <div v-if="!isTouchDevice" class="mini-power-box" title="Nr of standard 5☆ Kioku owned">
                                <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                <span>{{ myChars.perm }}</span>
                            </div>

                            <div class="mini-power-box" title="Breaker power rating">
                                <img :src="'/exedra-dmg-calc/roles/Breaker.png'" />
                                <span>{{ myPower[KiokuRole.Breaker] }}</span>
                            </div>

                            <div class="mini-power-box" title="Defender power rating">
                                <img :src="'/exedra-dmg-calc/roles/Defender.png'" />
                                <span>{{ myPower[KiokuRole.Defender] }}</span>
                            </div>

                            <div class="mini-power-box" title="Healer power rating">
                                <img :src="'/exedra-dmg-calc/roles/Healer.png'" />
                                <span>{{ myPower[KiokuRole.Healer] }}</span>
                            </div>

                            <div v-if="isTouchDevice" class="mini-power-box" title="Nr of standard 5☆ Kioku owned">
                                <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                <span>{{ myChars.perm }}</span>
                            </div>

                            <div class="mini-power-box" title="Nr of limited 5☆ Kioku owned">
                                <img class="lim-icon" :src="'/exedra-dmg-calc/lim-kioku.png'" />
                                <span>{{ myChars.lim }}</span>
                            </div>
                        </div>

                        <div v-if="!isTouchDevice" class="whale-power-big" title="Whale power">
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

                        <option value="similarity">
                            Similarity Score
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
                                        @click="startEditingNickname(friend)">
                                        🖊
                                    </button>
                                </div>

                                <div v-if="friend.nickname?.trim() && friend.display_name?.trim()"
                                    class="friend-secondary">
                                    {{ friend.display_name }}
                                </div>

                                <div v-if="friend.union_name?.trim()" class="friend-union">
                                    <div class="union-icon" :class="{ 'union-member': friend.isUnionMember }">
                                        <img :src="'/exedra-dmg-calc/union.png'" alt="Union" />
                                    </div>
                                    <span>
                                        {{ friend.union_name }}
                                    </span>
                                </div>

                                <input v-if="editingFriend === friend.friend_id" v-model="pendingNickname"
                                    class="nickname-inline-input" placeholder="Nickname" maxlength="24"
                                    @blur="finishNicknameEdit(friend)"
                                    @keydown.enter.prevent="finishNicknameEdit(friend)" />
                            </div>
                        </div>

                        <div v-if="friend.power" class="friend-power">
                            <div class="total-power-big friend" title="Power rating">
                                <img :src="'/exedra-dmg-calc/pwr.png'" alt="Total" />

                                <div class="total-power-value">
                                    {{ friend.power.total }}
                                </div>
                            </div>


                            <div v-if="isTouchDevice" class="whale-power-big friend" title="Whale power">
                                <img :src="'/exedra-dmg-calc/gem.png'" alt="Whale power" />

                                <div class="total-power-value">
                                    {{ myPower.whale }}
                                </div>
                            </div>


                            <div v-if="isTouchDevice" class="whale-power-big friend" title="Similarity score">
                                <img :src="'/exedra-dmg-calc/similarity.png'" alt="Similarity" />

                                <div class="total-power-value">
                                    {{ friend.accountSimilarity }}
                                </div>
                            </div>

                            <div class="role-grid-compact role-grid-5-compact">
                                <div class="mini-power-box" title="Attacker power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Attacker.png'" alt="Attacker" />
                                    <span>{{ friend.power[KiokuRole.Attacker] }}</span>
                                </div>

                                <div class="mini-power-box" title="Buffer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Buffer.png'" alt="Buffer" />
                                    <span>{{ friend.power[KiokuRole.Buffer] }}</span>
                                </div>

                                <div class="mini-power-box" title="Debuffer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Debuffer.png'" alt="Debuffer" />
                                    <span>{{ friend.power[KiokuRole.Debuffer] }}</span>
                                </div>

                                <div v-if="!isTouchDevice" class="mini-power-box" title="Similarity score">
                                    <img :src="'/exedra-dmg-calc/similarity.png'" alt="Similarity" />
                                    <span>{{ friend.accountSimilarity }}</span>
                                </div>

                                <div v-if="!isTouchDevice" class="mini-power-box" title="Nr of standard 5☆ Kioku owned">
                                    <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                    <span>{{ friend.kioku_count?.perm }}</span>
                                </div>

                                <div class="mini-power-box" title="Breaker power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Breaker.png'" alt="Breaker" />
                                    <span>{{ friend.power[KiokuRole.Breaker] }}</span>
                                </div>

                                <div class="mini-power-box" title="Defender power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Defender.png'" alt="Defender" />
                                    <span>{{ friend.power[KiokuRole.Defender] }}</span>
                                </div>

                                <div class="mini-power-box" title="Healer power rating">
                                    <img :src="'/exedra-dmg-calc/roles/Healer.png'" alt="Healer" />
                                    <span>{{ friend.power[KiokuRole.Healer] }}</span>
                                </div>

                                <div v-if="!isTouchDevice" class="mini-power-box" title="Whale power">
                                    <img :src="'/exedra-dmg-calc/gem.png'" alt="Whale" />
                                    <span>{{ friend.power.whale }}</span>
                                </div>

                                <div v-if="isTouchDevice" class="mini-power-box" title="Nr of standard 5☆ Kioku owned">
                                    <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                    <span>{{ friend.kioku_count?.perm }}</span>
                                </div>

                                <div class="mini-power-box" title="Nr of limited 5☆ Kioku owned">
                                    <img class="lim-icon" :src="'/exedra-dmg-calc/lim-kioku.png'" />
                                    <span>{{ friend.kioku_count?.lim }}</span>
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
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { SocialProfile, useFriendStore } from '../store/friendStore'
import { getUserId } from '../store/user'
import { countCharsObtained, getPowerScores } from '../models/PowerValue'
import { useCharacterStore } from '../store/characterStore'
import { useSetting } from '../store/settingsStore'
import { KiokuRole } from '../types/KiokuTypes'
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    ScatterController,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js'
import { isBeta } from '../utils/betaSettings'

const store = useFriendStore()
const characterStore = useCharacterStore()

const loadPlayers = async () => {
    await store.loadFriends(true)
    toast.success(
        'Added all players!',
        {
            position: toast.POSITION.TOP_RIGHT,
            icon: false,
        }
    )
}

const exportData = () => {
    const rows: string[] = []

    const csvEscape = (val: unknown) => {
        if (val === null || val === undefined) return ''
        const str = String(val)
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    const pushRow = (cols: (string | number | undefined)[]) => {
        rows.push(cols.map(csvEscape).join(','))
    }

    pushRow([
        'id',
        'nickname',
        'display name',
        'union name',
        'total',
        'attacker',
        'buffer',
        'debuffer',
        'breaker',
        'defender',
        'healer',
        'whale',
        'similarity'
    ])

    if (myPower.value) {
        pushRow([
            store.friendCode,
            store.displayName,
            store.displayName,
            store.unionName,
            myPower.value.total,
            myPower.value[KiokuRole.Attacker],
            myPower.value[KiokuRole.Buffer],
            myPower.value[KiokuRole.Debuffer],
            myPower.value[KiokuRole.Breaker],
            myPower.value[KiokuRole.Defender],
            myPower.value[KiokuRole.Healer],
            myPower.value.whale,
            ''
        ])
    }

    for (const f of store.friends) {
        pushRow([
            f.friend_id,
            f.nickname,
            f.display_name,
            f.union_name,
            f.power?.total,
            f.power?.[KiokuRole.Attacker],
            f.power?.[KiokuRole.Buffer],
            f.power?.[KiokuRole.Debuffer],
            f.power?.[KiokuRole.Breaker],
            f.power?.[KiokuRole.Defender],
            f.power?.[KiokuRole.Healer],
            f.power?.whale,
            f.accountSimilarity
        ])
    }

    const blob = new Blob([rows.join('\n')], {
        type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `profile_export.csv`
    a.click()

    URL.revokeObjectURL(url)
}

const myPower = computed(() => getPowerScores(characterStore.characters))
const myChars = computed(() => countCharsObtained(characterStore.characters))
const editingFriend = ref<string | null>(null)
const pendingNickname = ref('')

const finishNicknameEdit = async (
    friend: SocialProfile
) => {
    try {
        await saveNickname(friend.friend_id, pendingNickname.value.trim())
    } finally {
        editingFriend.value = null
        pendingNickname.value = ''
    }
}

const startEditingNickname = (friend: SocialProfile) => {
    editingFriend.value = friend.friend_id
    pendingNickname.value = friend.nickname?.trim() || friend.display_name?.trim() || ''
}

const userId = getUserId()
const editingFriendCode = ref(false)
const pendingFriendCode = ref('')
const friendCode = ref('')
const editingUnionName = ref(false)
const pendingUnionName = ref('')
const avatarPickerRef = ref<HTMLElement | null>(null)
const avatarButtonRef = ref<HTMLElement | null>(null)
const isTouchDevice = ref(false)

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
    isTouchDevice.value = window.matchMedia("(pointer: coarse)").matches
    if (!userId) return

    pendingDisplayName.value = store.displayName
    pendingFriendCode.value = store.friendCode
    pendingUnionName.value = store.unionName

    renderAnalyticsChart()


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
const iconPicker = computed(() => [...characterStore.characters].sort((a, b) => a.id - b.id))

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

type SortModes = 'default' | 'name' | 'total' | 'whale' | 'attacker' | 'buffer' | 'debuffer' | 'breaker' | 'defender' | 'healer' | "similarity"
const sortMode = useSetting<SortModes>("sortMode", "default")
const showGraph = useSetting<boolean>("showAnalyticsGraph", false)

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
                diff = (b.power?.[KiokuRole.Attacker] || 0) - (a.power?.[KiokuRole.Attacker] || 0)
                break

            case 'buffer':
                diff = (b.power?.[KiokuRole.Buffer] || 0) - (a.power?.[KiokuRole.Buffer] || 0)
                break

            case 'debuffer':
                diff = (b.power?.[KiokuRole.Debuffer] || 0) - (a.power?.[KiokuRole.Debuffer] || 0)
                break

            case 'breaker':
                diff = (b.power?.[KiokuRole.Breaker] || 0) - (a.power?.[KiokuRole.Breaker] || 0)
                break

            case 'defender':
                diff = (b.power?.[KiokuRole.Defender] || 0) - (a.power?.[KiokuRole.Defender] || 0)
                break

            case 'healer':
                diff = (b.power?.[KiokuRole.Healer] || 0) - (a.power?.[KiokuRole.Healer] || 0)
                break

            case 'similarity':
                diff = (b.accountSimilarity || 0) - (a.accountSimilarity || 0)
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

const saveNickname = async (friendId: string, nickname: string) => {
    try {
        await store.saveNickname(friendId, nickname)

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
// GRAPH


Chart.register(
    LineController,
    LineElement,
    PointElement,
    ScatterController,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
)

const analyticsCanvasRef = ref<HTMLCanvasElement | null>(null)

let analyticsChart: Chart | null = null

const graphMode = useSetting<'scatter' | 'percentile'>("betaGraphMode", "percentile")

const graphOptions = [
    {
        label: 'Total Power',
        value: 'total'
    },
    {
        label: 'Attacker',
        value: KiokuRole.Attacker
    },
    {
        label: 'Buffer',
        value: KiokuRole.Buffer
    },
    {
        label: 'Debuffer',
        value: KiokuRole.Debuffer
    },
    {
        label: 'Breaker',
        value: KiokuRole.Breaker
    },
    {
        label: 'Defender',
        value: KiokuRole.Defender
    },
    {
        label: 'Healer',
        value: KiokuRole.Healer
    },
    {
        label: 'Whale',
        value: 'whale'
    },
    {
        label: 'Similarity',
        value: 'similarity'
    }
]

const selectedXAxis = useSetting<string>('betaGraphSelectedXAxis', 'total')
const selectedYAxis = useSetting<string>('betaGraphSelectedYAxis', 'whale')

const analyticsPlayers = computed(() => {
    const list = []

    if (myPower.value) {
        list.push({
            power: myPower.value,
            similarity: 100
        })
    }

    for (const friend of store.friends) {
        if (!friend.power) continue

        list.push({
            power: friend.power,
            similarity: friend.accountSimilarity || 0
        })
    }

    return list
})

const getMetricValue = (
    player: any,
    metric: string
) => {
    if (metric === 'similarity') {
        return player.similarity || 0
    }

    return player.power?.[metric] || 0
}

const renderAnalyticsChart = () => {
    if (!analyticsCanvasRef.value) return

    analyticsChart?.destroy()

    const players = analyticsPlayers.value

    if (!players.length) return

    if (graphMode.value === 'scatter') {
        analyticsChart = new Chart(
            analyticsCanvasRef.value,
            {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: `${selectedXAxis.value} vs ${selectedYAxis.value}`,
                            data: players.map(p => ({
                                x: getMetricValue(
                                    p,
                                    selectedXAxis.value
                                ),
                                y: getMetricValue(
                                    p,
                                    selectedYAxis.value
                                )
                            })),
                            backgroundColor: '#8e5bc7'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    animation: false,
                    scales: {
                        x: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 10
                            },
                            grid: {
                                color: 'rgba(140, 100, 190, 0.35)'
                            },
                            title: {
                                display: true,
                                text: selectedXAxis.value
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 10
                            },
                            grid: {
                                color: 'rgba(140, 100, 190, 0.35)'
                            },
                            title: {
                                display: true,
                                text: selectedYAxis.value
                            }
                        }
                    }
                }
            }
        )

        return
    }

    const sorted = [...players]
        .map(p =>
            getMetricValue(
                p,
                selectedXAxis.value
            )
        )
        .sort((a, b) => a - b)

    const percentileData = sorted.map(
        (value, index) => ({
            x: value,
            y:
                ((index + 1) / sorted.length) *
                100
        })
    )

    analyticsChart = new Chart(
        analyticsCanvasRef.value,
        {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Percentile Curve',
                        data: percentileData,
                        borderColor: '#4CC9F0',
                        backgroundColor:
                            'rgba(76,201,240,0.2)',
                        tension: 0.15,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                parsing: false,
                scales: {
                    x: {
                        min: 0,
                        max: 100,
                        type: 'linear',
                        ticks: {
                            stepSize: 10
                        },
                        grid: {
                            color: 'rgba(140, 100, 190, 0.35)'
                        },
                        title: {
                            display: true,
                            text: selectedXAxis.value
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                            callback: v => `${v}%`
                        },
                        grid: {
                            color: 'rgba(140, 100, 190, 0.35)'
                        },
                        title: {
                            display: true,
                            text:
                                '% of Players Below'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label(ctx) {
                                return (
                                    `${ctx.parsed.y.toFixed(1)}% ` +
                                    `below ${ctx.parsed.x}`
                                )
                            }
                        }
                    }
                }
            }
        }
    )
}

watch(
    [
        graphMode,
        selectedXAxis,
        selectedYAxis,
        analyticsPlayers
    ],
    () => renderAnalyticsChart(),
    { deep: true }
)

</script>
<style scoped>
.profile-page {
    max-width: 960px;
    margin: 0 auto;
    color: var(--text);
}

/* =========================
   Sections
========================= */

.profile-section,
.friend-section {
    margin-top: 2rem;
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
}

@media (max-width: 768px) {

    .profile-section,
    .friend-section {
        margin-top: 1.5rem;
        padding: 0.8rem;
    }
}

/* =========================
   Inputs / Buttons
========================= */

input,
select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: var(--text);
    padding: 0.7rem 0.9rem;
}

button,
a {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text);
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
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
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

@media (max-width: 480px) {
    .add-friend-row {
        gap: 0.5rem;
    }

    .add-friend-row input {
        width: 100%;
    }
}

/* =========================
   Friend List
========================= */

.union-icon.union-member {
    width: 22px;
    height: 22px;

    display: flex;
    align-items: center;
    justify-content: center;
}

.union-icon.union-member img {
    width: 13px;
    height: 13px;
}

.union-icon.union-member {
    border-radius: 50%;

    border: 1px solid rgba(246, 214, 130, 0.5);
    background: var(--panel);
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

    gap: 1.2rem;

    background: var(--panel);
    padding: 0.5rem 0.7rem;

    border-radius: 14px;
}

@media (max-width: 768px) {
    .friend-card {
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        gap: 1rem;
    }
}

.friend-card.union-member {
    border: 1px solid rgba(246, 214, 130, 0.4);
}

.self-card {
    border: 1px solid rgba(246, 214, 130, 0.45);
    background:
        linear-gradient(180deg,
            rgba(33, 23, 12, 0.96) 0%,
            rgba(18, 13, 10, 1) 100%);
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

@media (max-width: 768px) {
    .friend-left {
        max-width: none;
        flex-basis: 100%;
    }
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

    border: 2px solid rgba(255, 255, 255, 0.12);
    background: rgba(18, 13, 25, 0.96);

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

    border: 3px solid rgba(246, 214, 130, 0.85);
    background: rgba(18, 13, 25, 0.96);

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

    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 209, 110, 0.35);

    color: var(--accent);

    font-size: 0.8rem;
    font-weight: bold;
}

.favorite-badge:hover {
    background: rgba(255, 255, 255, 0.08);
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
    background: rgba(255, 255, 255, 0.08);
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

@media (max-width: 768px) {
    .friend-power {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
    }
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

@media (max-width: 480px) {

    .total-power-big,
    .whale-power-big {
        min-width: 135px;
        height: 65px;
        margin-right: -2px;
        flex-direction: revert;
    }

    .friend {
        min-width: 92px;
        margin: -5px;
    }
}

.total-power-big {
    background: var(--panel);
    border: 1px solid rgba(246, 214, 130, 0.35);
}

.whale-power-big {
    border: 1px solid rgba(246, 214, 130, 0.35);
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
    color: var(--text);
}

.role-grid-compact {
    display: grid;
    gap: 0.45rem;
}

.role-grid-5-compact {
    grid-template-columns: repeat(5, 1fr);
}

.role-grid-4-compact {
    grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 480px) {
    .role-grid-5-compact {
        grid-template-columns: repeat(3, 1fr);
    }

    .role-grid-4-compact {
        grid-template-columns: repeat(3, 1fr);
    }
}

.mini-power-box {
    display: flex;
    align-items: center;

    gap: 0.35rem;

    min-width: 64px;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);

    border-radius: 999px;

    padding: 0.22rem 0.55rem;
}

.mini-power-box img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

img.lim-icon {
    height: 25px;
    width: 25px;
    margin: -10px -5px;
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
    background: rgba(246, 214, 130, 0.18);
    border-color: rgba(246, 214, 130, 0.35);

    font-weight: 600;
}

.friend-actions a:hover {
    background: rgba(246, 214, 130, 0.26);
}

.remove-btn {
    background: rgba(255, 105, 105, 0.14);
    border-color: rgba(255, 105, 105, 0.24);
}

.remove-btn:hover {
    background: rgba(255, 105, 105, 0.2);
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

    background: var(--panel);
    border: 1px solid rgba(255, 255, 255, 0.08);

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

..avatar-option:hover {
    transform: scale(1.08);
}

.avatar-option.selected {
    box-shadow:
        0 0 0 2px rgba(246, 214, 130, 0.75);
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
    background: rgba(255, 255, 255, 0.06);
    border-radius: 12px;
}

/* =========================
   Graphs
========================= */

.analytics-section {
    margin-top: 2rem;
}

.analytics-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
}

.analytics-controls label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.analytics-chart {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 1rem;
}

/* =========================
   Mobile
========================= */

@media (max-width: 1000px) {
    .friend-card {
        flex-direction: column;
        align-items: stretch;
    }

    .friend-power {
        justify-content: center;
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
