<template>
    <div class="setup-page diff-page">
        <h1 class="page-title">Account Comparison</h1>

        <div class="header">
            <div class="subtitle" v-if="leftCode && rightCode">
                <FriendPickerBadge side="left" :current-code="leftCode" placeholder="Left account" @pick="onPickLeft" />
                <div class="graph-meta">
                    vs
                    <div class="score-pill floating-score">
                        <img class="score-icon" :src="'/exedra-dmg-calc/similarity.png'" alt="" />
                        <span class="score-label">Similarity Score</span>
                        <span class="score-value">
                            {{ accountDifferenceScore }}
                        </span>
                    </div>
                </div>
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

        <section class="toolbar card" v-if="leftCode && rightCode">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".graph-container" :filename="filename" :export-options="exportOpts"
                    :share-options="shareOptionsForComparison">
                    <button class="icon-btn icon-btn--accent" :title="hyperlinkCopied ? 'Copied!' : 'Copy page link'"
                        :aria-label="hyperlinkCopied ? 'Copied!' : 'Copy page link'" @click="copyHyperLink">
                        <svg v-if="hyperlinkCopied" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </button>
                </ImageActionsToolbar>
            </div>

            <div class="toolbar-right filters-inline">
                <span class="filters-heading">Filters</span>

                <label class="chip" :class="{ active: showEqual }">
                    <input type="checkbox" v-model="showEqual" /> Show equal units
                </label>

                <label class="chip" :class="{ active: showUnowned }">
                    <input type="checkbox" v-model="showUnowned" /> Show units owned by neither party
                </label>

                <label class="chip" :class="{ active: collapseEmptyRows }">
                    <input type="checkbox" v-model="collapseEmptyRows" /> Collapse empty rows
                </label>
            </div>
        </section>

        <div class="graph-container" v-if="leftCode && rightCode">

            <div class="export-header">
                <div class="export-side left-side">
                    <img v-if="leftProfile?.profile_icon"
                        :src="`/exedra-dmg-calc/kioku_images/${leftProfile.profile_icon}_thumbnail.png`"
                        class="export-avatar" />

                    <div class="export-name">
                        {{ leftProfile?.display_name || leftCode }}
                    </div>
                </div>

                <div class="score-pill export-score">
                    <img class="score-icon" :src="'/exedra-dmg-calc/similarity.png'" alt="" />

                    <div class="score-content">
                        <span class="score-label">Similarity Score</span>
                        <span class="score-value">
                            {{ accountDifferenceScore }}
                        </span>
                    </div>
                </div>

                <div class="export-side right-side">
                    <div class="export-name">
                        {{ rightProfile?.display_name || rightCode }}
                    </div>

                    <img v-if="rightProfile?.profile_icon"
                        :src="`/exedra-dmg-calc/kioku_images/${rightProfile.profile_icon}_thumbnail.png`"
                        class="export-avatar" />
                </div>
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
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
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
        : undefined
)

const rightCode = computed(() =>
    typeof route.query.right === "string"
        ? route.query.right.toUpperCase()
        : undefined
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

    leftCharacters.value = leftRows.filter(Boolean)
    rightCharacters.value = rightRows.filter(Boolean)

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

const withExportHeader = async (fn: () => Promise<void> | void) => {
    const header = document.querySelector(".export-header") as HTMLElement | null

    if (header) {
        header.style.display = "flex"
    }

    await new Promise(r => requestAnimationFrame(r))

    try {
        await fn()
    } finally {
        if (header) {
            header.style.display = "none"
        }
    }
}

const exportOpts = {
    onBefore: () => {
        const header = document.querySelector(".export-header") as HTMLElement | null
        if (header) header.style.display = "flex"
    },
    onAfter: () => {
        const header = document.querySelector(".export-header") as HTMLElement | null
        if (header) header.style.display = "none"
    }
}

const comparisonPageUrl = () =>
    `${window.location.origin}/exedra-dmg-calc/#/account-compare?left=${leftCode.value}&right=${rightCode.value}`

const shareOptionsForComparison = () => ({
    title: `Account comparison: ${friendStore.getFormattedDisplayNamePossessive(leftProfile.value?.display_name || leftCode.value)} vs ${friendStore.getFormattedDisplayNamePossessive(rightProfile.value?.display_name || rightCode.value)}`,
    backUrl: comparisonPageUrl(),
})

const hyperlinkCopied = ref(false)

const copyHyperLink = async () => {
    try {
        await navigator.clipboard.writeText(
            `${window.location.origin}/exedra-dmg-calc/#/account-compare?left=${leftCode.value}&right=${rightCode.value}`
        )
        hyperlinkCopied.value = true
        setTimeout(() => { hyperlinkCopied.value = false }, 1500)
        toast.success("Copied to clipboard!", { position: toast.POSITION.TOP_RIGHT, icon: false })
    } catch (err) {
        console.error("Clipboard failed:", err)
        toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    }
}
</script>

<style scoped>
/* ── Page (shared design system) ── */
.setup-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 4rem;
}

.page-title {
    font-size: 2rem;
    margin: 0 0 0.25rem;
    color: var(--text);
}

.card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 1rem;
    margin-bottom: 0.6rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.toolbar {
    justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    user-select: none;
}

.chip input {
    display: none;
}

.chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-right: 0.25rem;
    flex-shrink: 0;
    opacity: 0.7;
}

.filters-inline {
    flex-wrap: wrap;
}

.graph-meta {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.floating-score {
    margin-top: 0;

    transform: translateY(-20%);

    background:
        linear-gradient(180deg,
            rgba(40, 40, 40, 0.96),
            rgba(24, 24, 24, 0.96));

    border: 1px solid rgba(255, 255, 255, 0.1);

    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.28);
}

.export-header {
    display: none;

    align-items: center;
    justify-content: center;
    gap: 1rem;

    margin-bottom: 1rem;
    padding: 0.75rem 1rem;

    border-radius: 18px;

    background:
        linear-gradient(180deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.02));

    border: 1px solid rgba(255, 255, 255, 0.08);
}

.export-side {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    min-width: 180px;
}

.left-side {
    justify-content: flex-end;
}

.right-side {
    justify-content: flex-start;
}

.export-avatar {
    width: 44px;
    height: 44px;

    border-radius: 50%;
    object-fit: cover;

    border: 2px solid rgba(255, 255, 255, 0.2);

    box-shadow:
        0 0 12px rgba(0, 0, 0, 0.35);
}

.left-side .export-avatar {
    border-color: rgba(80, 180, 255, 0.7);
}

.right-side .export-avatar {
    border-color: rgba(255, 120, 120, 0.7);
}

.export-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);

    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.left-side .export-name {
    color: var(--info-soft);
}

.right-side .export-name {
    color: var(--danger-soft);
}

.export-score {
    margin-top: 0;

    display: flex;
    align-items: center;

    align-self: center;

    padding: 0.55rem 1rem;

    transform: translateY(-1px);

    background:
        linear-gradient(180deg,
            rgba(40, 40, 40, 0.96),
            rgba(24, 24, 24, 0.96));

    border: 1px solid rgba(255, 255, 255, 0.12);

    box-shadow:
        0 4px 14px rgba(0, 0, 0, 0.35);
}

.score-content {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.export-score .score-label {
    font-size: 0.78rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;

    display: flex;
    align-items: center;
}

.export-score .score-value {
    font-size: 1rem;
    line-height: 1;

    display: flex;
    align-items: center;
}

.export-score .score-icon {
    height: 18px;
    width: 18px;
    flex-shrink: 0;
}

.export-matchup {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
}

.vs-text {
    color: var(--muted);
}

.graph-container {
    display: inline-flex;
    flex-direction: column;
    align-items: center;

    width: fit-content;
    max-width: max-content;

    margin: 0 auto;
}

.setup-page.diff-page {
    max-width: none;
}

.setup-page.diff-page>.header,
.setup-page.diff-page>.toolbar {
    max-width: 1100px;
    margin-left: auto;
    margin-right: auto;
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
    margin: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;

    padding: 0.35rem 0.65rem;
    border-radius: 999px;

    background: var(--panel);
    border: 1px solid rgba(255, 255, 255, 0.08);

    font-size: 0.85rem;
    color: var(--text);
    line-height: 1;
}

.score-icon {
    height: 14px;
}

.score-label {
    color: var(--muted);
}

.score-value {
    font-weight: 700;
    color: var(--text);
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
    border: 1px solid rgba(255, 255, 255, 0.12);
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
    color: var(--success);
    font-weight: 700;
}

.state-normal {
    color: var(--text);
}

.state-none {
    color: var(--muted);
}

.arrow-green {
    color: var(--success);
    font-weight: 800;
}

.arrow-normal {
    color: var(--muted);
}

.copy-btn {
    margin: 10px;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.copy-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 209, 110, 0.35);
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
