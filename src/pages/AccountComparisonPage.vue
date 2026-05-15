<template>
    <div class="diff-page">
        <div class="header">
            <h1>Account Comparison</h1>

            <div class="subtitle" v-if="leftCode && rightCode">
                Comparing
                <FriendPickerBadge side="left" :current-code="leftCode" placeholder="Left account" @pick="onPickLeft" />
                vs
                <FriendPickerBadge :profile="rightProfile" :friends="friends" :side="'right'" :current-code="rightCode"
                    :self="selfEntry" @pick="onPickRight" />
            </div>

            <div v-else class="subtitle missing-codes">
                <span>Select two accounts to compare</span>
                <div class="inline-pickers">
                    <FriendPickerBadge side="left" :current-code="leftCode" placeholder="Left account"
                        @pick="onPickLeft" />
                    vs
                    <FriendPickerBadge side="right" :current-code="rightCode" placeholder="Right account"
                        @pick="onPickRight" />
                </div>
            </div>
        </div>

        <div class="controls" v-if="leftCode && rightCode">
            <label>
                <input type="checkbox" v-model="showEqual" />
                Show equal units
            </label>
            <label>
                <input type="checkbox" v-model="collapseEmptyRows" />
                Collapse empty rows
            </label>
        </div>

        <table class="diff-table" v-if="leftCode && rightCode">
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
import { useRoute, useRouter } from "vue-router"
import { useCharacterStore } from "../store/characterStore"
import type { Character } from "../types/KiokuTypes"
import { useSetting } from "../store/settingsStore"
import FriendPickerBadge from "../components/FriendPickerBadge.vue"
import { useFriendStore, SocialProfile } from "../store/friendStore"
import { getProfile, loadCharactersByFriendCode } from "../store/cloud"

const friendStore = useFriendStore()

type ComparedCharacter = Character & {
    diff: number
    leftScore: number
    rightScore: number
}

const friendsList = computed(() => friendStore.friends)

const route = useRoute()
const router = useRouter()
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

const leftProfile = ref<SocialProfile | null>(null)
const rightProfile = ref<SocialProfile | null>(null)
const friends = ref<any[]>([])
const selfEntry = ref<SocialProfile | null>(null)

const leftCharacters = ref<Character[]>([])
const rightCharacters = ref<Character[]>([])

const showEqual = useSetting("showEqualCompareAcc", false)
const collapseEmptyRows = useSetting("collapseEmptyRows", true)

onMounted(async () => {
    if (!leftCode.value || !rightCode.value) return
    await loadBothSides()
})

const loadFriendKioku = async (code: string) => {
    const found = friendsList.value.find(f => f.friend_id === code)
    const profPromise: Promise<SocialProfile | null> = found ? Promise.resolve(found) : getProfile(code)
    const [rows, profile] = await Promise.all([
        loadCharactersByFriendCode(code),
        profPromise.catch(() => null),
    ])
    return [store.mergeChars(rows), profile] as [Character[], SocialProfile | null]
}

const loadBothSides = async () => {
    if (!leftCode.value || !rightCode.value) return

    const [[leftRows, lProfile], [rightRows, rProfile]] = await Promise.all([
        loadFriendKioku(leftCode.value),
        loadFriendKioku(rightCode.value),
    ])

    leftCharacters.value = leftRows
    rightCharacters.value = rightRows

    leftProfile.value = lProfile
    rightProfile.value = rProfile
}

const onPickLeft = async (code: string) => {
    await router.replace({
        query: { ...route.query, left: code.toUpperCase() }
    })
    const [rows, profile] = await loadFriendKioku(code)
    leftCharacters.value = rows
    leftProfile.value = profile
}

const onPickRight = async (code: string) => {
    await router.replace({
        query: { ...route.query, right: code.toUpperCase() }
    })
    const [rows, profile] = await loadFriendKioku(code)
    rightCharacters.value = rows
    rightProfile.value = profile
}

const getScore = (ch?: Character): number => {
    if (!ch?.enabled) return 0
    return ch.ascension + 1
}

const comparedCharacters = computed<ComparedCharacter[]>(() => {
    const leftMap = new Map(leftCharacters.value.map(ch => [ch.id, ch]))
    const rightMap = new Map(rightCharacters.value.map(ch => [ch.id, ch]))

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
                diff: getScore(left) - getScore(right)
            }
        })
        .filter(ch => {
            if (!showEqual.value && ch.diff === 0) return false
            return true
        })
})

const groupedCharacters = computed(() => {
    const groups: { label: number; characters: ComparedCharacter[] }[] = []

    for (let diff = 6; diff >= -6; diff--) {
        const chars = comparedCharacters.value
            .filter(ch => ch.diff === diff)
            .sort((a, b) => b.id - a.id)

        if (collapseEmptyRows.value && chars.length === 0) continue
        if (!showEqual.value && diff === 0) continue

        groups.push({ label: diff, characters: chars })
    }

    return groups
})

const formatState = (score: number): string => {
    if (score === 0) return "X"
    return `A${score - 1}`
}

const borderClass = (ch: Character): string => {
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
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

.missing-codes {
    flex-direction: column;
    gap: 0.75rem;
}

.inline-pickers {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
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
}
</style>
