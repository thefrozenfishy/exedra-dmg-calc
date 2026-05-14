<template>
    <div class="diff-page">
        <div class="header">
            <h1>Account Difference</h1>

            <div class="subtitle" v-if="leftCode && rightCode">
                Comparing
                <div class="friend-avatar-wrapper">
                    <img class="profile-avatar" :src="avatarUrl(leftProfile)" />
                    <span class="left-name">{{ leftProfile?.display_name?.trim() || leftProfile?.friend_id }}</span>
                </div>
                vs
                <div class="friend-avatar-wrapper">
                    <img class="profile-avatar" :src="avatarUrl(rightProfile)" />
                    <span class="right-name">{{ rightProfile?.display_name?.trim() || rightProfile?.friend_id }}</span>
                </div>
            </div>
        </div>

        <div class="controls">
            <label>
                <input type="checkbox" v-model="showEqual" />
                Show equal units
            </label>
            <label>
                <input type="checkbox" v-model="collapseEmptyRows" />
                Collapse empty rows
            </label>
        </div>

        <table class="diff-table">
            <tbody>
                <tr v-for="group in groupedCharacters" :key="group.label" class="diff-row">
                    <td class="diff-label">
                        {{ group.label > 0 ? "+" : "" }}{{ group.label }}
                    </td>

                    <td class="characters-cell">
                        <div v-for="ch in group.characters" :key="ch.id" class="character-wrapper">
                            <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                <img class="character-img" :class="borderClass(ch)"
                                    :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name" />
                            </a>

                            <div class="comparison-badge">
                                {{ formatState(ch.leftScore) }}
                                →
                                {{ formatState(ch.rightScore) }}
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"

import { useCharacterStore } from "../store/characterStore"
import { loadCharactersByFriendCode, getProfile } from "../store/cloud"

import type { Character } from "../types/KiokuTypes"
import { useSetting } from "../store/settingsStore"

const kiokuThumb = (id: number) => `/exedra-dmg-calc/kioku_images/${id}_thumbnail.png`
const avatarUrl = (profile: Profile | null) => kiokuThumb(profile?.profile_icon || 10010101)


type ComparedCharacter = Character & {
    diff: number
    leftScore: number
    rightScore: number
}

const route = useRoute()
const store = useCharacterStore()

const leftCode = computed(() =>
    typeof route.query.left === "string"
        ? route.query.left.toUpperCase()
        : null
)

const rightCode = computed(() =>
    typeof route.query.right === "string"
        ? route.query.right.toUpperCase()
        : null
)
type Profile = {
    display_name: string
    friend_id: string
    profile_icon: number
    union_name: string
}

const leftProfile = ref<Profile | null>(null)
const rightProfile = ref<Profile | null>(null)

const leftCharacters = ref<Character[]>([])
const rightCharacters = ref<Character[]>([])

const showEqual = useSetting("showEqualCompareAcc", false)
const collapseEmptyRows = useSetting("collapseEmptyRows", true)

onMounted(async () => {
    if (!leftCode.value || !rightCode.value) return

    const [leftRows, rightRows, lProfile, rProfile] = await Promise.all([
        loadCharactersByFriendCode(leftCode.value),
        loadCharactersByFriendCode(rightCode.value),
        getProfile(leftCode.value),
        getProfile(rightCode.value),
    ])

    leftCharacters.value = store.mergeChars(leftRows)
    rightCharacters.value = store.mergeChars(rightRows)

    leftProfile.value = lProfile
    rightProfile.value = rProfile
})

const getScore = (ch?: Character): number => {
    if (!ch?.enabled) return 0
    return ch.ascension + 1
}

const comparedCharacters = computed<ComparedCharacter[]>(() => {
    const leftMap = new Map(
        leftCharacters.value.map(ch => [ch.id, ch])
    )

    const rightMap = new Map(
        rightCharacters.value.map(ch => [ch.id, ch])
    )

    return store.characters
        .filter(ch => ch.rarity === 5)
        .filter(ch => ch.name !== "Lux☆Magica")
        .map(base => {
            const left = leftMap.get(base.id)
            const right = rightMap.get(base.id)

            return {
                ...base,

                leftScore: getScore(left),
                rightScore: getScore(right),

                diff:
                    getScore(left) -
                    getScore(right)
            }
        })
        .filter(ch => {
            if (!showEqual.value && ch.diff === 0) {
                return false
            }
            return true
        })
})

const groupedCharacters = computed(() => {
    const groups: {
        label: number
        characters: ComparedCharacter[]
    }[] = []

    for (let diff = 6; diff >= -6; diff--) {
        const chars = comparedCharacters.value
            .filter(ch => ch.diff === diff)
            .sort((a, b) => b.id - a.id)

        if (collapseEmptyRows.value && chars.length === 0) {
            continue
        }
        if (!showEqual.value && diff === 0) {
            continue
        }

        groups.push({
            label: diff,
            characters: chars
        })
    }

    return groups
})

const formatState = (score: number): string => {
    if (score === 0) return "X"
    return `A${score - 1}`
}

const borderClass = (ch: Character): string => {
    if (ch.obtain && ch.obtain !== "Permanent") {
        return "limited-border"
    }

    if (new Date() > new Date(ch.permaDate)) {
        return "default-border"
    }

    return "not-limited-border"
}
</script>

<style scoped>
.diff-page {
    max-width: 1000px;
    margin: 0 auto;
    color: #ddd;
}

.header {
    margin-bottom: 1rem;
    text-align: center;
}

.subtitle {
    margin-top: 0.75rem;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    flex-wrap: wrap;

    font-size: 1.05rem;
}

.friend-avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 0.55rem;

    background: #2b2b2b;

    border: 1px solid #444;

    border-radius: 999px;

    padding: 0.35rem 0.75rem;
}

.profile-avatar {
    width: 42px;
    height: 42px;

    border-radius: 50%;

    object-fit: cover;

    border: 2px solid #666;

    background: #111;

    flex-shrink: 0;
}

.left-name,
.right-name {
    font-weight: bold;

    max-width: 220px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.left-name {
    color: #90caf9;
}

.right-name {
    color: #ffab91;
}

.controls {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.diff-table {
    width: 100%;
    border-collapse: collapse;
}

.diff-row td {
    border: 1px solid #444;
    padding: 0.5rem;
    vertical-align: top;
}

.diff-label {
    width: 90px;
    text-align: center;
    font-weight: bold;
    font-size: 1.3rem;
    background: #333;
    vertical-align: middle;
}

.characters-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 72px;
}

.character-wrapper {
    position: relative;
}

.character-img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    display: block;
    transition: transform 0.15s ease;
}

.character-img:hover {
    transform: scale(1.08);
}

.limited-border {
    border: 2px solid red;
}

.not-limited-border {
    border: 2px solid yellow;
}

.default-border {
    border: 2px solid transparent;
}

.comparison-badge {
    position: absolute;
    left: 50%;
    bottom: -8px;
    transform: translateX(-50%);

    background: rgba(0, 0, 0, 0.85);

    padding: 2px 6px;

    border-radius: 999px;

    font-size: 0.65rem;
    font-weight: bold;

    white-space: nowrap;

    border: 1px solid #666;
}

@media (max-width: 700px) {
    .character-img {
        width: 58px;
        height: 58px;
    }

    .comparison-badge {
        font-size: 0.55rem;
    }

    .diff-label {
        width: 70px;
        font-size: 1rem;
    }

    .subtitle {
        gap: 0.6rem;
        font-size: 0.95rem;
    }

    .friend-avatar-wrapper {
        padding: 0.3rem 0.6rem;
    }

    .profile-avatar {
        width: 34px;
        height: 34px;
    }

    .left-name,
    .right-name {
        max-width: 120px;
    }
}
</style>