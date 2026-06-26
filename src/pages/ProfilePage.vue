<template>
    <div class="profile-page">
        <div>
            <button @click="showGraph = !showGraph">{{ showGraph ? 'Hide' : 'Show' }} graph</button>

            <section v-if="showGraph" class="profile-section analytics-section">
                <h2>Power Analytics</h2>
                <div class="btn-container">
                    <ImageActionsToolbar target=".chart-wrapper" :filename="`${fileName}.png`"
                        :share-options="shareOptionsForChart">
                        <button class="icon-btn" :title="exportedCSV ? 'Exported!' : 'Export csv'"
                            :aria-label="exportedCSV ? 'Exported!' : 'Export csv'" @click="exportData">
                            <svg v-if="exportedCSV" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="11" x2="12" y2="17" />
                                <polyline points="9 14 12 17 15 14" />
                            </svg>
                        </button>
                    </ImageActionsToolbar>
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

                <div class="chart-wrapper" ref="chartContainerRef">
                    <div class="analytics-chart">
                        <canvas ref="analyticsCanvasRef" @click="handleChartClick"></canvas>
                    </div>

                    <div v-if="hoveredTooltip" class="chart-tooltip-overlay"
                        :style="{ left: hoveredTooltip.x + 'px', top: hoveredTooltip.y + 'px' }">
                        <div class="chart-tooltip-content">
                            <div v-for="(line, i) in hoveredTooltip.lines" :key="i" class="chart-tooltip-line">
                                {{ line }}
                            </div>
                        </div>
                    </div>

                    <TransitionGroup name="tooltip-fade">
                        <div v-for="(tooltip, index) in pinnedTooltips" :key="index"
                            class="chart-tooltip-overlay is-pinned"
                            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                            <div class="chart-tooltip-content">
                                <button class="chart-tooltip-dismiss" title="Dismiss" @click.stop="dismissPin(index)">
                                    ×
                                </button>

                                <div v-for="(line, i) in tooltip.lines" :key="i" class="chart-tooltip-line">
                                    {{ line }}
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>

                    <div v-if="graphMode === 'scatter'" class="chart-legend">
                        <div v-for="item in legendItems" :key="item.label" class="legend-item">
                            <span class="legend-swatch" :style="{ background: item.color }"></span>
                            <span>{{ item.label }}</span>
                        </div>
                    </div>
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

                                <template v-if="store.myRank?.rank">
                                    <img v-if="store.myRank.rank <= 10" :src="rankIcon(store.myRank)"
                                        :title="rankTitle(store.myRank)" :alt="rankAlt(store.myRank)"
                                        class="rank-badge rank-badge-large" />
                                    <span v-else class="rank-badge rank-badge-large" :title="rankTitle(store.myRank)">
                                        {{ rankAlt(store.myRank) }}
                                    </span>
                                </template>
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

                            <div v-if="!isTouchDevice" class="mini-power-box bigger-box"
                                title="Nr of standard 5☆ Kioku owned (Ascensions)">
                                <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                <pre>{{ formatKiokuCount(myChars.perm, myChars.permAs) }}</pre>

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

                            <div v-if="isTouchDevice" class="mini-power-box bigger-box"
                                title="Nr of standard 5☆ Kioku owned (Ascensions)">
                                <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                <pre>{{ formatKiokuCount(myChars.perm, myChars.permAs) }}</pre>
                            </div>

                            <div class="mini-power-box bigger-box" title="Nr of limited 5☆ Kioku owned (Ascensions)">
                                <img class="lim-icon" :src="'/exedra-dmg-calc/lim-kioku.png'" />
                                <pre>{{ formatKiokuCount(myChars.lim, myChars.limAs) }}</pre>
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

                    <label for="listScope">Show:</label>
                    <select v-model="listScope" id="listScope">
                        <option value="mine">Friends + Union</option>
                        <option value="all">Everyone</option>
                    </select>

                    <label for="sortMode">Sort by:</label>
                    <select v-model="sortMode" id="sortMode">
                        <option value="default">Default</option>
                        <option v-for="opt in graphOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>

                    <input v-model="friendCode" placeholder="Enter friend code" maxlength="5" />

                    <button @click="addFriend">
                        Follow
                    </button>

                </div>

                <p v-if="listLoading" class="list-loading-hint">Loading…</p>

                <div v-if="store.nameRequired" class="name-required-notice">
                    Set a player name in your profile before you can receive a rank and view the full leaderboard.
                </div>

                <template v-else>
                    <p>Power might see some minor changes while formula is being fine tuned!</p>
                    <p v-if="listScope === 'all'">
                        Rank is based on the power of the account. Unnamed accounts and inactive accounts are not
                        included
                    </p>
                    <div class="friend-list">
                        <div v-for="friend in sortedFriends" :key="friend.friend_id" class="friend-card"
                            :class="{ 'union-member': friend.isUnionMember, 'stale-profile': friend.isActive === false }"
                            :title="friend.isActive ? '' : 'Account is inactive, it will become active once they make any changes to their account'">
                            <div class="friend-left">
                                <div class="friend-avatar-wrapper">
                                    <img class="profile-avatar" :src="avatarUrl(friend)" />

                                    <template v-if="friend.rank">
                                        <img v-if="friend.rank <= 10" class="rank-badge" :src="rankIcon(friend)"
                                            :title="rankTitle(friend)" :alt="rankAlt(friend)" />
                                        <span v-else class="rank-badge" :title="rankTitle(friend)">
                                            {{ rankAlt(friend) }}
                                        </span>
                                    </template>

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

                                    <div v-if="!isTouchDevice" class="mini-power-box bigger-box"
                                        title="Nr of standard 5☆ Kioku owned (Ascensions)">
                                        <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                        <pre>{{ formatKiokuCount(friend.kioku_count?.perm, friend.kioku_count?.permAs) }}</pre>
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

                                    <div v-if="isTouchDevice" class="mini-power-box bigger-box"
                                        title="Nr of standard 5☆ Kioku owned (Ascensions)">
                                        <img :src="'/exedra-dmg-calc/perm-kioku.png'" />
                                        <pre>{{ formatKiokuCount(friend.kioku_count?.perm, friend.kioku_count?.permAs) }}</pre>
                                    </div>

                                    <div class="mini-power-box bigger-box"
                                        title="Nr of limited 5☆ Kioku owned (Ascensions)">
                                        <img class="lim-icon" :src="'/exedra-dmg-calc/lim-kioku.png'" />
                                        <pre>{{ formatKiokuCount(friend.kioku_count?.lim, friend.kioku_count?.limAs) }}</pre>
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
                </template>
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
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { MyRank } from '../store/friendStore'

const store = useFriendStore()
const characterStore = useCharacterStore()

type RankLike = MyRank | SocialProfile | undefined

const rankIcon = (r: RankLike) => {
    if (!r || r.rank == null || !r.totalPlayers) return undefined
    if (r.rank <= 10) return `/exedra-dmg-calc/ranks/${r.rank}.png`
}
const rankTitle = (r: RankLike) => {
    if (!r || r.rank == null || !r.totalPlayers) return ''
    return `#${r.rank} of ${r.totalPlayers}`
}
const rankAlt = (r: RankLike) => {
    if (!r || r.rank == null || !r.totalPlayers) return ''
    return `#${r.rank}`
}

const formatKiokuCount = (chars: number | undefined, ascs: number | undefined) =>
    `${String(chars || 0).padStart(2, ' ')} ${`(${ascs || 0})`.padStart(5, ' ')}`


const exportedCSV = ref(false)

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
        'rank',
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
        'similarity',
        'standard_kioku',
        'standard_kioku(A)',
        'limited_kioku',
        'limited_kioku(A)',
    ])

    if (myPower.value) {
        pushRow([
            store.friendCode,
            store.myRank?.rank,
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
            '',
            myChars.value.perm,
            myChars.value.permAs,
            myChars.value.lim,
            myChars.value.limAs,
        ])
    }

    for (const f of store.friends) {
        pushRow([
            f.friend_id,
            f.rank,
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
            f.accountSimilarity,
            f.kioku_count?.perm,
            f.kioku_count?.permAs,
            f.kioku_count?.lim,
            f.kioku_count?.limAs,
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


    exportedCSV.value = true
    setTimeout(() => { exportedCSV.value = false }, 1500)
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

    if (listScope.value === 'all') {
        await loadFriendsForScope('all')
    }

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

type SortModes = 'default'
    | 'rank'
    | 'name'
    | 'total'
    | 'whale'
    | 'attacker'
    | 'buffer'
    | 'debuffer'
    | 'breaker'
    | 'defender'
    | 'healer'
    | "similarity"
    | "lim"
    | "limAs"
    | "perm"
    | "permAs"
const sortMode = useSetting<SortModes>("sortMode", "default")
const showGraph = useSetting<boolean>("showAnalyticsGraph", false)

const listScope = useSetting<'mine' | 'all'>("friendListScope", "mine")
const listLoading = ref(false)

const loadFriendsForScope = async (scope: 'mine' | 'all') => {
    listLoading.value = true
    try {
        await store.loadFriends(scope === 'all')
    } finally {
        listLoading.value = false
    }
}

watch(listScope, (scope) => loadFriendsForScope(scope))

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
            case 'rank':
                diff = (b.power?.total || 0) - (a.power?.total || 0)
                if (diff === 0) diff = (b.power?.whale || 0) - (a.power?.whale || 0)
                if (diff === 0) diff = (b.kioku_count?.limAs || 0) - (a.kioku_count?.limAs || 0)
                if (diff === 0) diff = (b.kioku_count?.lim || 0) - (a.kioku_count?.lim || 0)
                break

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

            case 'perm':
                diff = (b.kioku_count?.perm || 0) - (a.kioku_count?.perm || 0)
                break

            case 'permAs':
                diff = (b.kioku_count?.permAs || 0) - (a.kioku_count?.permAs || 0)
                break

            case 'lim':
                diff = (b.kioku_count?.lim || 0) - (a.kioku_count?.lim || 0)
                break

            case 'limAs':
                diff = (b.kioku_count?.limAs || 0) - (a.kioku_count?.limAs || 0)
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
        console.error("Failed to save profile:", err)

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
        console.error("Failed to update friend code:", err)

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
        console.error("Failed to update union:", err)

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
        console.error("Failed to save nickname:", err)

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
        console.error("Failed to add friend:", err)

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
const chartContainerRef = ref<HTMLElement | null>(null)

let analyticsChart: Chart | null = null

interface PinnedTooltip {
    x: number
    y: number
    lines: string[]
    pinned: boolean
}
const hoveredTooltip = ref<PinnedTooltip | null>(null)
const pinnedTooltips = ref<PinnedTooltip[]>([])
const dismissPin = (index: number) => {
    pinnedTooltips.value.splice(index, 1)
}

const makeExternalTooltipHandler = (getLines: (ctx: any) => string[]) => {
    return (context: any) => {
        const { tooltip } = context
        if (tooltip.opacity === 0 || !tooltip.dataPoints?.length) {
            hoveredTooltip.value = null
            return
        }

        const canvas = analyticsCanvasRef.value
        const container = chartContainerRef.value
        if (!canvas || !container) return

        const containerRect = container.getBoundingClientRect()
        const canvasRect = canvas.getBoundingClientRect()

        hoveredTooltip.value = {
            x: (canvasRect.left - containerRect.left) + tooltip.caretX,
            y: (canvasRect.top - containerRect.top) + tooltip.caretY,
            lines: getLines(tooltip),
            pinned: false,
        }
    }
}

const handleChartClick = (event: MouseEvent) => {
    if (!analyticsChart) return

    const elements = analyticsChart.getElementsAtEventForMode(
        event, 'nearest', { intersect: true }, false
    )

    if (!elements.length) {
        return
    }

    if (hoveredTooltip.value) {
        const alreadyPinned = pinnedTooltips.value.findIndex(
            p => p.lines.join('|') === hoveredTooltip.value!.lines.join('|')
        )

        if (alreadyPinned === -1) {
            pinnedTooltips.value.push({
                ...hoveredTooltip.value,
                pinned: true,
            })
        } else {
            dismissPin(alreadyPinned)
        }
    }
}

const graphMode = useSetting<'scatter' | 'percentile'>("betaGraphMode", "percentile")

const graphOptions = [
    {
        label: 'Rank',
        value: 'rank'
    },
    {
        label: 'Total Power',
        value: 'total'
    },
    {
        label: 'Attacker',
        value: KiokuRole.Attacker
    },
    {
        label: 'Breaker',
        value: KiokuRole.Breaker
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
    },
    {
        label: 'Permanent kioku',
        value: 'perm'
    },
    {
        label: 'Permanent kioku ascensions',
        value: 'permAs'
    },
    {
        label: 'Limited kioku',
        value: 'lim'
    },
    {
        label: 'Limited kioku ascensions',
        value: 'limAs'
    },
].filter(Boolean)

const selectedXAxis = useSetting<string>('betaGraphSelectedXAxis', 'total')
const selectedYAxis = useSetting<string>('betaGraphSelectedYAxis', 'whale')

const fileName = computed(() => graphMode.value === 'scatter'
    ? `${getAxisLabel(selectedXAxis.value)} vs ${getAxisLabel(selectedYAxis.value)}`
    : `${getAxisLabel(selectedXAxis.value)}`)

const shareOptionsForChart = () => ({
    title: `${store.displayName} plot of ${fileName.value}`,
    backUrl: window.location.href,
})

const analyticsPlayers = computed(() => {
    const list = []

    if (myPower.value) {
        list.push({
            name: store.displayName || store.friendCode,
            power: myPower.value,
            similarity: 100,
            lim: myChars.value.lim,
            limAs: myChars.value.limAs,
            perm: myChars.value.perm,
            permAs: myChars.value.permAs,
            rank: store.myRank?.rank,
            relation: Relation.SELF,
        })
    }

    for (const friend of store.friends) {
        if (!friend.power) continue

        list.push({
            name: friend.nickname?.trim() || friend.display_name?.trim() || friend.friend_id,
            power: friend.power,
            similarity: friend.accountSimilarity || 0,
            lim: friend.kioku_count?.lim || 0,
            limAs: friend.kioku_count?.limAs || 0,
            perm: friend.kioku_count?.perm || 0,
            permAs: friend.kioku_count?.permAs || 0,
            rank: friend.rank,
            relation: friend.favorite ? Relation.FAVOURITE :
                friend.isUnionMember ? Relation.UNION :
                    friend.isFriend ? Relation.FRIEND :
                        Relation.DEFAULT,
        })
    }

    return list
})

const getMetricValue = (player: any, metric: string) => {
    return player.power?.[metric] ?? player[metric] ?? 0
}

const getAxisLabel = (value: string) => graphOptions.find(o => o.value === value)?.label ?? value

const getMaxTick = (axisLabel: string) => {
    if (axisLabel === "perm") return characterStore.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica" && c.obtain !== "Exclusive").length
    if (axisLabel === "permAs") return characterStore.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica" && c.obtain !== "Exclusive").length * 6
    if (axisLabel === "lim") return characterStore.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica" && c.obtain === "Exclusive").length
    if (axisLabel === "limAs") return characterStore.characters.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica" && c.obtain === "Exclusive").length * 6
    if (axisLabel === "rank") return store.myRank?.totalPlayers
    return 100
}

enum Relation {
    DEFAULT = "whitesmoke",
    FRIEND = "green",
    UNION = "purple",
    SELF = "red",
    FAVOURITE = "aqua",
}

const legendItems = computed(() => [
    { label: 'You', color: Relation.SELF },
    { label: 'Union member', color: Relation.UNION },
    { label: 'Following', color: Relation.FRIEND },
    { label: 'Favourite', color: Relation.FAVOURITE },
    { label: 'Other', color: Relation.DEFAULT },
])

function selectColor(p: { relation: Relation }, prevBestRelation?: Relation): Relation {
    return [Relation.SELF, Relation.FAVOURITE, Relation.UNION, Relation.FRIEND, Relation.DEFAULT].find(r => prevBestRelation === r || p.relation === r) ?? Relation.DEFAULT
}

const renderAnalyticsChart = () => {
    if (!analyticsCanvasRef.value) return

    analyticsChart?.destroy()
    hoveredTooltip.value = null

    const players = analyticsPlayers.value

    if (!players.length) return

    if (graphMode.value === 'scatter') {
        const pointMap = new Map<string, { x: number; y: number; names: string[]; count: number, color: Relation }>()

        for (const p of players) {
            const x = getMetricValue(p, selectedXAxis.value)
            const y = getMetricValue(p, selectedYAxis.value)
            const key = `${x}|${y}`
            if (pointMap.has(key)) {
                pointMap.get(key)!.names.push(p.name)
                pointMap.get(key)!.count++
                pointMap.get(key)!.color = selectColor(p, pointMap.get(key)?.color)
            } else {
                pointMap.set(key, { x, y, names: [p.name], count: 1, color: selectColor(p) })
            }
        }

        const aggregatedPoints = [...pointMap.values()]

        analyticsChart = new Chart(
            analyticsCanvasRef.value,
            {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: `${getAxisLabel(selectedXAxis.value)} vs ${getAxisLabel(selectedYAxis.value)}`,
                            data: aggregatedPoints.map(p => ({
                                x: p.x,
                                y: p.y,
                                names: p.names,
                                count: p.count,
                            })),
                            backgroundColor: aggregatedPoints.map(p => p.color),
                            borderColor: '#ffffff',
                            borderWidth: 1,
                            pointRadius: aggregatedPoints.map(p =>
                                Math.min(3 + Math.log2(p.count) * 2, 10)
                            ),
                            pointHoverRadius: aggregatedPoints.map(p =>
                                Math.min(5 + Math.log2(p.count) * 2, 12)
                            ),
                        }
                    ]
                },
                options: {
                    responsive: true,
                    animation: false,
                    scales: {
                        x: {
                            min: selectedXAxis.value === 'rank' ? 1 : 0,
                            max: getMaxTick(selectedXAxis.value),
                            reverse: selectedXAxis.value === 'rank',
                            ticks: { stepSize: 10, color: "white" },
                            grid: { color: 'rgba(140, 100, 190, 0.35)' },
                            title: { display: true, text: getAxisLabel(selectedXAxis.value), color: "white" }
                        },
                        y: {
                            min: selectedYAxis.value === 'rank' ? 1 : 0,
                            max: getMaxTick(selectedYAxis.value),
                            reverse: selectedYAxis.value === 'rank',
                            ticks: { stepSize: 10, color: "white" },
                            grid: { color: 'rgba(140, 100, 190, 0.35)' },
                            title: { display: true, text: getAxisLabel(selectedYAxis.value), color: "white" }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                boxWidth: 0,
                                boxHeight: 0,
                                color: Relation.DEFAULT,
                            }
                        },
                        tooltip: {
                            enabled: false,
                            external: makeExternalTooltipHandler(tooltip => {
                                const raw = tooltip.dataPoints[0].raw as { x: number; y: number; names: string[]; count: number }
                                if (raw.count === 1) {
                                    return [`${raw.names[0]}: (${raw.x}, ${raw.y})`]
                                }
                                return [
                                    `${raw.count} players at (${raw.x}, ${raw.y}):`,
                                    ...raw.names.map((n: string) => `  · ${n}`)
                                ]
                            }),
                        }
                    }
                }
            }
        )

        return
    }

    const sorted = [...players]
        .map(p => ({
            value: getMetricValue(p, selectedXAxis.value),
            name: p.name,
        }))
        .sort((a, b) => a.value - b.value)

    const percentileData = sorted.map(({ value, name }, index) => ({
        x: value,
        y: ((index + 1) / sorted.length) * 100,
        name,
    }))

    analyticsChart = new Chart(
        analyticsCanvasRef.value,
        {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Percentile Curve',
                        data: percentileData,
                        borderColor: 'white',
                        backgroundColor: 'rgba(76,201,240,0.2)',
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
                        max: getMaxTick(selectedXAxis.value),
                        type: 'linear',
                        ticks: { stepSize: 10, color: "white" },
                        grid: { color: 'rgba(140, 100, 190, 0.35)' },
                        title: { display: true, text: getAxisLabel(selectedXAxis.value), color: "white" }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                            callback: v => `${v}%`,
                            color: "white",
                        },
                        grid: { color: 'rgba(140, 100, 190, 0.35)' },
                        title: { display: true, text: '% of Players Below', color: "white" }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 0,
                            boxHeight: 0,
                            color: Relation.DEFAULT,
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: makeExternalTooltipHandler(tooltip => {
                            const raw = tooltip.dataPoints[0].raw as { x: number; y: number; name?: string }
                            const namePart = raw.name ? `${raw.name} — ` : ''
                            return [`${namePart}${tooltip.dataPoints[0].parsed.y?.toFixed(1)}% below ${tooltip.dataPoints[0].parsed.x}`]
                        }),
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

pre {
    padding: 0;
    margin: 0;
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
select,
option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: var(--text);
    background: var(--panel);
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

.btn-container {
    gap: 1rem;
    display: flex;
    justify-content: center;
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
    position: relative;

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
   Rank Badge
========================= */

.rank-badge {
    position: absolute;

    bottom: -4px;
    right: -6px;

    width: 24px;
    height: 24px;

    border-radius: 50%;
    object-fit: contain;

    background: rgba(18, 13, 25, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.18);

    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);

    font-size: x-small;

    line-height: 24px;
    text-align: center;
}

.rank-badge-large {
    bottom: 0;
    right: -4px;

    width: 30px;
    height: 30px;
    font-size: small;
    line-height: 30px;
}

.list-loading-hint {
    opacity: 0.7;
    font-size: 0.85rem;
}

.name-required-notice {
    padding: 12px 16px;
    margin: 8px 0;

    border-radius: 8px;
    border: 1px solid rgba(255, 180, 80, 0.4);
    background: rgba(255, 180, 80, 0.08);

    font-size: 0.9rem;
}

.friend-card.stale-profile {
    opacity: 0.55;
}

.friend-card.stale-profile .profile-avatar {
    filter: grayscale(0.6);
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
    grid-template-columns: repeat(5, max-content);
    justify-content: start;
}

.role-grid-4-compact {
    grid-template-columns: repeat(4, max-content);
    justify-content: start;
}

@media (max-width: 480px) {
    .role-grid-5-compact {
        grid-template-columns: repeat(3, max-content);
        justify-content: start;
    }

    .role-grid-4-compact {
        grid-template-columns: repeat(3, max-content);
        justify-content: start;
    }
}

.mini-power-box {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: 48px;
    font-family: monospace;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 0.22rem 0.55rem;
}

.bigger-box {
    width: 82px;
}

.mini-power-box img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

img.lim-icon {
    height: 24px;
    width: 24px;
    margin: -4px;
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

.avatar-option:hover {
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

/* =========================
   Chart Tooltip Overlay
========================= */

.chart-wrapper {
    position: relative;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 1rem;
}

.chart-tooltip-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    transform: translate(-50%, calc(-100% - 10px));
}

.chart-tooltip-overlay.is-pinned {
    pointer-events: auto;
}

.chart-tooltip-content {
    position: relative;
    background: rgba(20, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 0.55rem 0.8rem;
    font-size: 0.82rem;
    color: #eee;
    white-space: nowrap;
    min-width: 120px;
}

.is-pinned .chart-tooltip-content {
    border-color: rgba(255, 209, 110, 0.45);
}

.is-pinned .chart-tooltip-content::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -8px;

    width: 10px;
    height: 10px;

    background: rgba(20, 16, 32, 0.92);
    border-right: 2px solid rgba(255, 209, 110, 0.45);
    border-bottom: 2px solid rgba(255, 209, 110, 0.45);

    transform: translateX(-50%) rotate(45deg);
}

.chart-tooltip-dismiss {
    position: absolute;
    top: 4px;
    right: 6px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    width: auto;
    min-width: unset;
}

.chart-tooltip-dismiss:hover {
    color: #fff;
    background: none;
    border: none;
    transform: none;
}

.chart-tooltip-line {
    line-height: 1.5;
}

.chart-tooltip-hint {
    margin-top: 0.3rem;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.35);
    text-align: center;
}

.chart-tooltip-actions {
    margin-top: 0.5rem;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 0.4rem;
}

.chart-tooltip-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.78rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: #eee;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

.chart-tooltip-action-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 209, 110, 0.4);
}

.chart-tooltip-action-btn svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.12s ease, transform 0.12s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, calc(-100% - 6px));
}

.chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-top: 0.75rem;
    font-size: 0.85rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid rgba(255, 255, 255, 0.25);
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
