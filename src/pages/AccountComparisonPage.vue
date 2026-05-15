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
            <div>
                <button class="copy-btn" @click="copyGraphToClipboard">Copy to clipboard</button>
                <button class="copy-btn" @click="downloadGraph">Download</button>
                <button class="copy-btn" @click="copyHyperLink">Copy Link</button>
            </div>
            <div>
                <label>
                    <input type="checkbox" v-model="showEqual" />
                    Show equal units
                </label>
                <label>
                    <input type="checkbox" v-model="showUnowned" />
                    Show units not owned by neither party
                </label>
                <label>
                    <input type="checkbox" v-model="collapseEmptyRows" />
                    Collapse empty rows
                </label>
            </div>
        </div>

        <div class="graph-container" v-if="leftCode && rightCode">
            <div class="score-pill">
                <img class="score-icon" :src="'/exedra-dmg-calc/similarity.png'" alt="" />
                <span class="score-label">Similarity Score</span>
                <span class="score-value">
                    {{ accountDifferenceScore }}
                </span>
            </div>
            <div class="diff-groups">
                <div v-for="group in groupedCharacters" :key="group.label" class="diff-group"
                    :style="diffColor(group.label)">
                    <div class="diff-label">
                        {{ group.label > 0 ? "+" : "" }}{{ group.label }}
                    </div>

                    <div class="characters-cell">
                        <div v-for="(col, colIndex) in chunk10(group.characters)" :key="colIndex" class="char-column"
                            :style="diffColor(group.label)">
                            <div v-for="ch in col" :key="ch.id" class="character-wrapper">
                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                    <img class="character-img" :class="borderClass(ch)"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name" />
                                </a>

                                <div class="comparison-badge">
                                    <span :class="formatState(ch.leftScore).cls">
                                        {{ formatState(ch.leftScore).text }}
                                    </span>

                                    <span :class="formatArrowState(ch.leftScore, ch.rightScore).cls">
                                        →
                                    </span>

                                    <span :class="formatState(ch.rightScore).cls">
                                        {{ formatState(ch.rightScore).text }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
import { getAccountSimilarityScore } from "../models/AccountSimilarityScore"
import { copyImageToClipboard, downloadImage } from "../utils/image"
import { toast } from "vue3-toastify"

const friendStore = useFriendStore()

type ComparedCharacter = Character & {
    diff: number
    leftScore: number
    rightScore: number
}

const friendsList = computed(() => friendStore.friends)

const accountDifferenceScore = computed(() => {
    if (!leftCode.value || !rightCode.value) return null
    return getAccountSimilarityScore(leftCharacters.value, rightCharacters.value)
})

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

const showEqual = useSetting("showEqualCompareAcc", true)
const collapseEmptyRows = useSetting("collapseEmptyComparisonRows", false)
const showUnowned = useSetting("showComparisonBothUnowned", false)

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
            if (!showUnowned.value && ch.leftScore === 0 && ch.rightScore === 0) return false
            if (!showUnowned.value && (!ch.leftScore && !ch.rightScore)) return false
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

const chunk10 = (arr: ComparedCharacter[]) => {
    const res: ComparedCharacter[][] = []
    for (let i = 0; i < arr.length; i += 10) {
        res.push(arr.slice(i, i + 10))
    }
    return res
}

const formatState = (score: number) => {
    if (score === 0) {
        return {
            text: "X",
            cls: "state-none"
        }
    }

    const asc = score - 1

    return {
        text: `A${asc}`,
        cls: asc === 5 ? "state-green" : "state-normal"
    }
}

const formatArrowState = (leftScore: number, rightScore: number) => {
    const left = formatState(leftScore)
    const right = formatState(rightScore)

    const isGreen = left.cls === "state-green" && right.cls === "state-green"

    return {
        cls: isGreen ? "arrow-green" : "arrow-normal"
    }
}

const borderClass = (ch: Character): string => {
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"
}

const diffColor = (diff: number) => {
    const max = 6
    const t = Math.min(Math.abs(diff) / max, 1)

    const hue = diff > 0 ? 140 : diff < 0 ? 0 : 220

    const lightnessBase = 18
    const lightness = lightnessBase + t * 10

    const saturation = diff === 0 ? 10 : 25 + t * 15

    return {
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
}
const filename = computed(() => `compare_${leftProfile.value?.display_name || leftCode.value}_v_${rightProfile.value?.display_name || rightCode.value}.png`)

const downloadGraph = () => {
    const el = document.querySelector(".graph-container") as HTMLElement
    if (!el) return
    downloadImage(filename.value, el)
}

const copyGraphToClipboard = () => {
    const el = document.querySelector(".graph-container") as HTMLElement
    if (!el) return
    copyImageToClipboard(filename.value, el)
}

const copyHyperLink = async () => {
    try {
        await navigator.clipboard.writeText(
            `${window.location.origin}/exedra-dmg-calc/#/account-compare?left=${leftCode.value}&right=${rightCode.value}`
        )
        toast.success("Copied to clipboard!", { position: toast.POSITION.TOP_RIGHT, icon: false })
    } catch (err) {
        console.error("Clipboard failed:", err)
        toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    }
}
</script>

<style scoped>
.graph-container {
    display: inline-flex;
    flex-direction: column;
    align-items: center;

    width: fit-content;
    max-width: max-content;

    margin: 0 auto;
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

.score-pill {
    margin-top: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;

    padding: 0.35rem 0.65rem;
    border-radius: 999px;

    background: #1f1f1f;
    border: 1px solid #444;

    font-size: 0.85rem;
    color: #ddd;
    line-height: 1;
}

.score-icon {
    height: 14px;
}

.score-label {
    color: #aaa;
}

.score-value {
    font-weight: 700;
    color: #fff;
    margin-left: 0.15rem;
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
    gap: 1rem;
}

.diff-groups {
    display: flex;
    gap: 0.1rem;
    align-items: flex-start;

    width: fit-content;
    max-width: max-content;

    justify-content: flex-start;
    margin: 0 auto;
}

.diff-group {
    min-width: 72px;
    min-height: 802px;
    display: flex;
    flex-direction: column;
    align-items: center;

    flex: 0 0 auto;
    width: max-content;
}

.characters-cell {
    display: flex;
    align-items: flex-start;
}

.char-column {
    display: flex;
    flex-direction: column;

    justify-content: flex-end;
    gap: 0.35rem;

    height: 770px;

    flex: 0 0 auto;
}

.character-wrapper {
    position: relative;
    flex: 0 0 auto;
}

.character-img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    display: block;
    transition: transform 0.15s ease;
}

.comparison-badge {
    position: absolute;
    left: 50%;
    bottom: 0px;
    transform: translateX(-50%);

    background: rgba(0, 0, 0, 0.9);
    padding: 1px 3px;

    border-radius: 999px;
    font-size: 0.55rem;
    font-weight: bold;

    white-space: nowrap;
    border: 1px solid #666;
}

.diff-label {
    font-weight: bold;
    margin-bottom: 0.5rem;
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

.state-green {
    color: #39d353;
    font-weight: 700;
}

.state-normal {
    color: #ddd;
}

.state-none {
    color: #777;
}

.arrow-green {
    color: #39d353;
    font-weight: 800;
}

.arrow-normal {
    color: #bbb;
}

.copy-btn {
    margin: 10px;
    padding: 0.4rem 0.8rem;
    background: #444;
    color: #eee;
    border: 1px solid #666;
    border-radius: 6px;
    cursor: pointer;
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
