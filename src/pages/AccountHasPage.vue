<template>
    <div class="setup-page ascension-list">
        <h1 class="page-title">Your Kioku</h1>

        <div v-if="isReadonly || isViewingBannerOpen" class="viewing-banner">
            <span class="viewing-label">Viewing:</span>
            <FriendPickerBadge hide-self side="left" :current-code="viewingFriendCode" placeholder="Select a friend…"
                @pick="switchToFriend" />
            <router-link :to="{
                path: '/account-compare',
                query: {
                    left: friendCode,
                    right: viewingFriendCode,
                }
            }" class="compare-to-own" title="Compare with your own kioku">
                Compare
            </router-link>
            <router-link :to="{ path: '/my-kioku' }" class="back-to-own" title="View own kioku">
                ← Your Kioku
            </router-link>
        </div>
        <div v-else class="viewing-banner-own">
            <span class="viewing-own-label">Your Kioku</span>
            <button class="view-friend-btn" @click="isViewingBannerOpen = true">
                View Friend's Kioku
            </button>
        </div>

        <section class="toolbar card">
            <div class="toolbar-left">
                <ImageActionsToolbar target=".ascension-table" filename="ascension.png" :export-options="exportOpts"
                    :share-options="shareOptionsForAscensionList">
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
        </section>

        <section class="filters card">
            <span class="filters-heading">Roster</span>

            <label class="chip" :class="{ active: show3stars }">
                <input type="checkbox" v-model="show3stars" /> ★★★
            </label>
            <label class="chip" :class="{ active: show4stars }">
                <input type="checkbox" v-model="show4stars" /> ★★★★
            </label>
            <label class="chip" :class="{ active: showUnowned }">
                <input type="checkbox" v-model="showUnowned" /> Unowned
            </label>
            <label v-if="showOffElementalOnesOption" class="chip" :class="{ active: showOffElementalOnes }">
                <input type="checkbox" v-model="showOffElementalOnes" /> Off-elemental crys in count
            </label>
        </section>

        <section class="filters card">
            <span class="filters-heading">Display</span>

            <label class="chip" :class="{ active: showLevels }">
                <input type="checkbox" v-model="showLevels" /> Magic &amp; Special levels
            </label>
            <label class="chip" :class="{ active: showHearts }">
                <input type="checkbox" v-model="showHearts" /> Heartphial levels
            </label>
            <label class="chip" :class="{ active: showDupes }">
                <input type="checkbox" v-model="showDupes" /> Dupes
            </label>
            <label class="chip" :class="{ active: showCrys }">
                <input type="checkbox" v-model="showCrys" /> Crys counter
            </label>
            <label class="chip" :class="{ active: highlightCompleted }">
                <input type="checkbox" v-model="highlightCompleted" /> Highlight completed
            </label>
            <label class="chip" :class="{ active: colourLevels, disabled: !(showLevels || showHearts) }">
                <input type="checkbox" :disabled="!(showLevels || showHearts)" v-model="colourLevels" /> Colour max
                levels
            </label>
        </section>

        <table class="ascension-table" @click.self="isTouchJiggleMode = false">
            <tbody @click.self="isTouchJiggleMode = false">
                <tr :data-index="index" :class="{ 'drag-over': dragOver === index }"
                    @dragover.prevent="dragOver = index" @dragleave="dragLeave" @drop="onDrop(index)"
                    @click.self="isTouchJiggleMode = false" v-for="(chars, index) in groupedByAscension" :key="index"
                    class="asc-row">

                    <td class="asc-cell" @click="isTouchJiggleMode = false">{{ (chars as any).label }}</td>

                    <td class="characters-cell" @click.self="isTouchJiggleMode = false">
                        <div v-for="ch in chars" :key="ch.id" :draggable="!isTouchDevice"
                            @dragstart="onDragStart(ch, $event)" @touchstart="onTouchStart(ch, $event)"
                            @touchmove="onTouchMove($event)" @touchend="onTouchEnd($event)"
                            :class="{ 'jiggling': isTouchJiggleMode }" @contextmenu.prevent>
                            <div class="character-img-wrapper" :class="{
                                'completed-wrapper': shouldHighlightCompleted(ch),
                                'completed-wrapper-diamond': shouldShinyHighlightCompleted(ch),
                                'editing-active': editing?.id === ch.id
                            }">
                                <a v-if="!isTouchDevice" :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank"
                                    @contextmenu.prevent>
                                    <img class="character-img"
                                        :class="[borderClass(ch), { 'completed-glow': shouldHighlightCompleted(ch) }]"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                                        :title="makeTitle(ch)" />
                                </a>
                                <img v-else class="character-img"
                                    :class="[borderClass(ch), { 'completed-glow': shouldHighlightCompleted(ch) }]"
                                    :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                                    :title="makeTitle(ch)" @contextmenu.prevent />
                                <template v-if="showCrys && (chars as any).label !== 'Not Owned'">
                                    <router-link v-if="!isTouchDevice" class="crys-count-badge level-badge crys-link"
                                        :to="{
                                            path: '/character-crys',
                                            query: { character_id: ch.id }
                                        }" @click.stop :class="colourLevels
                                            ? getCrysCount(ch, true) >= maxCrysCount ? 'maxLvl' : hasElementalCrys(ch) ? 'notMaxLvlMissingElemCrys' : 'notMaxLvl'
                                            : ''">
                                        {{ getCrysCount(ch, true) }}
                                    </router-link>
                                    <div v-else class="crys-count-badge level-badge" :class="colourLevels
                                        ? getCrysCount(ch, true) >= maxCrysCount ? 'maxLvl' : hasElementalCrys(ch) ? 'notMaxLvlMissingElemCrys' : 'notMaxLvl'
                                        : ''">{{ getCrysCount(ch, true) }}</div>
                                </template>
                                <div class="dupe-badge level-badge editable"
                                    v-if="showDupes && (chars as any).label === 'A5'"
                                    @click.stop="startEdit(ch, 'dupes', $event)">
                                    <template v-if="isEditing(ch, 'dupes')">
                                        <input type="number" v-model.number="editValue" @click.stop
                                            @blur="commitEdit(ch, 'dupes')"
                                            @keydown.enter.prevent="commitEdit(ch, 'dupes')" />
                                    </template>
                                    <template v-else>
                                        + {{ ch.dupes }}
                                    </template>
                                </div>
                                <div class="heart-level-badge level-badge editable"
                                    v-if="showHearts && (chars as any).label !== 'Not Owned'" :class="colourLevels
                                        ? ch.heartphialLvl === KiokuConstants.maxHeartphialLvl ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'heartphialLvl', $event)">
                                    <template v-if="isEditing(ch, 'heartphialLvl')">
                                        <input type="number" v-model.number="editValue" :min="1"
                                            :max="getMax(ch, 'heartphialLvl')" @click.stop
                                            @blur="commitEdit(ch, 'heartphialLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'heartphialLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.heartphialLvl }}
                                    </template>
                                </div>

                                <div class="magic-level-badge level-badge editable"
                                    v-if="showLevels && (chars as any).label !== 'Not Owned'" :class="colourLevels
                                        ? ch.magicLvl === KiokuConstants.maxMagicLvl ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'magicLvl', $event)">
                                    <template v-if="isEditing(ch, 'magicLvl')">
                                        <input type="number" v-model.number="editValue" :min="0"
                                            :max="getMax(ch, 'magicLvl')" @click.stop @blur="commitEdit(ch, 'magicLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'magicLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.magicLvl }}
                                    </template>
                                </div>

                                <div class="special-level-badge level-badge editable"
                                    v-if="showLevels && (chars as any).label !== 'Not Owned' && ch.rarity !== 3" :class="colourLevels ? getMaxSpecialLvl(ch) === ch.specialLvl ? 'maxLvl' : 'notMaxLvl'
                                        : ''" @click.stop="startEdit(ch, 'specialLvl', $event)">
                                    <template v-if="isEditing(ch, 'specialLvl')">
                                        <input type="number" v-model.number="editValue" :min="1"
                                            :max="getMax(ch, 'specialLvl')" @click.stop
                                            @blur="commitEdit(ch, 'specialLvl')"
                                            @keydown.enter.prevent="commitEdit(ch, 'specialLvl')" />
                                    </template>
                                    <template v-else>
                                        {{ ch.specialLvl }}
                                    </template>
                                </div>

                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="card extra-input" v-if="!showDupes">
            <span class="filters-heading">+500s collected</span>
            <input type="number" v-model.number="extraCollected" />
        </div>
        <section class="card stats-card">
            <span class="filters-heading">Collection stats</span>
            <div class="stat-row">
                <span class="stat-label">Total SSRs collected</span>
                <span class="stat-value">{{ totalAscensions + extraTotal }}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Standard roster collected</span>
                <span class="stat-value">{{ totalStandards }} / {{ totalPossibleStandards }}
                    ({{ round(totalStandards / totalPossibleStandards * 100) }}%)</span>
            </div>
            <div class="stat-row stat-row-sub">
                <span class="stat-label">— of which +500s</span>
                <span class="stat-value">{{ extraTotal }}
                    ({{ round(extraTotal / (totalStandards + extraTotal) * 100) }}%)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Limited roster collected</span>
                <span class="stat-value">{{ totalLimiteds }} / {{ totalPossibleLimiteds }}
                    ({{ round(totalLimiteds / totalPossibleLimiteds * 100) }}%)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Chance of non-A5 on standard pull</span>
                <span class="stat-value">{{ standardPool.length - ownedA5StandardPool.length }} / {{ standardPool.length
                    }}
                    ({{ round((standardPool.length - ownedA5StandardPool.length) / standardPool.length * 100)
                    }}%)</span>
            </div>
        </section>

        <section class="card stats-card">
            <span class="filters-heading">Maxed kioku (Heartphial, Magic &amp; Special level, all on-element
                crys)</span>
            <div class="stat-row">
                <span class="stat-label">5-stars</span>
                <span class="stat-value">{{ maxed5starChars.length }} / {{ ownedFiveStars.length }}
                    ({{ round(maxed5starChars.length / ownedFiveStars.length * 100) }}%)</span>
            </div>
            <div class="stat-row" v-if="show4stars">
                <span class="stat-label">4-stars</span>
                <span class="stat-value">{{ maxed4starChars.length }} / {{ fourStarMembers.length }}
                    ({{ round(maxed4starChars.length / (fourStarMembers.length) * 100) }}%)</span>
            </div>
            <div class="stat-row" v-if="show3stars">
                <span class="stat-label">3-stars</span>
                <span class="stat-value">{{ maxed3starChars.length }} / {{ threeStarMembers.length }}
                    ({{ round(maxed3starChars.length / (threeStarMembers.length) * 100) }}%)</span>
            </div>
        </section>

        <section class="card stats-card" v-if="showCrys">
            <span class="filters-heading">Crys yet to collect</span>
            <div class="stat-row">
                <span class="stat-label">5-stars</span>
                <span class="stat-value">{{ missingCrys5stars }}</span>
            </div>
            <div class="stat-row" v-if="show4stars">
                <span class="stat-label">4-stars</span>
                <span class="stat-value">{{ missingCrys4stars }}</span>
            </div>
            <div class="stat-row" v-if="show3stars">
                <span class="stat-label">3-stars</span>
                <span class="stat-value">{{ missingCrys3stars }}</span>
            </div>
        </section>

        <section class="card about-card">
            <span class="filters-heading">About</span>
            <p>
                You can edit, export, and import your kioku on the Team Setup page, or edit here directly.<br />
                Red borders indicate limited characters, yellow borders indicate characters not yet added to the
                permanent roster, and transparent borders indicate standard permanent characters.
                For crys counter, red indicates some crys are missing, yellow that some are missing but the elemental
                crys has been collected, and green that all on-element crys have been collected.
                Maxed out kioku are given a golden glow to indicate their completeness.
                <template v-if="showOffElementalOnesOption">Truly perfected kioku with all crys, including
                    off-elemental ones, are given a diamond border!</template>
            </p>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useCharacterStore } from "../store/characterStore"
import { Character, elementMap, KiokuConstants, KiokuElement, relevantCrys } from "../types/KiokuTypes"
import { toast } from "vue3-toastify"
import { useSetting } from "../store/settingsStore"
import { nextTick } from "vue"
import { onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import FriendPickerBadge from "../components/FriendPickerBadge.vue"
import ImageActionsToolbar from "../components/ImageActionsToolbar.vue"
import { useFriendStore, SocialProfile } from "../store/friendStore"
import { getProfile, loadCharactersByFriendCode } from "../store/cloud"
import { crystalises, passiveDetails } from "../utils/helpers"

const route = useRoute()
const router = useRouter()
const friendStore = useFriendStore()

const friendCode = computed(() => friendStore.friendCode)
const friendsList = computed(() => friendStore.friends)
const viewingProfile = ref<SocialProfile | null>(null)
const isViewingBannerOpen = ref(false)

const viewingFriendCode = computed(() =>
    typeof route.query.friend === "string" && route.query.friend !== friendCode.value
        ? route.query.friend.toUpperCase()
        : null
)

const store = useCharacterStore()
const displayedCharacters = ref<Character[]>([])
const displayedCharactersComputed = computed(() =>
    isReadonly.value
        ? displayedCharacters.value
        : store.characters
)
const isReadonly = computed(() => !!viewingFriendCode.value)

onMounted(async () => {
    if (!viewingFriendCode.value) return
    await loadFriendKioku(viewingFriendCode.value)
})

const switchToFriend = async (code: string) => {
    isViewingBannerOpen.value = false
    await router.replace({ query: { friend: code } })
    await loadFriendKioku(code)
}

const loadFriendKioku = async (code: string) => {
    const found = friendsList.value.find(f => f.friend_id === code)
    const profPromise: Promise<SocialProfile | null> = found ? Promise.resolve(found) : getProfile(code)
    const [rows, profile] = await Promise.all([
        loadCharactersByFriendCode(code),
        profPromise.catch(() => null),
    ])
    displayedCharacters.value = store.mergeChars(rows)
    viewingProfile.value = profile
}

const fiveStarMembers = computed(() => displayedCharactersComputed.value.filter(c => c.rarity === 5 && c.name !== "Lux☆Magica"))
const fourStarMembers = computed(() => displayedCharactersComputed.value.filter(c => c.rarity === 4 || c.name === "Lux☆Magica"))
const threeStarMembers = computed(() => displayedCharactersComputed.value.filter(c => c.rarity === 3))

const maxed5starChars = computed(() => fiveStarMembers.value.filter(isCompleted))
const maxed4starChars = computed(() => fourStarMembers.value.filter(isCompleted))
const maxed3starChars = computed(() => threeStarMembers.value.filter(isCompleted))

const ownedFiveStars = computed(() => fiveStarMembers.value.filter(c => c.enabled))
const totalAscensions = computed(() => ownedFiveStars.value.reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalStandards = computed(() => ownedFiveStars.value.filter(ch => ch.obtain === "Permanent").reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalPossibleStandards = computed(() => fiveStarMembers.value.filter(ch => ch.obtain === "Permanent").reduce((sum, _) => sum + 6, 0))
const totalLimiteds = computed(() => ownedFiveStars.value.filter(ch => ch.obtain !== "Permanent").reduce((sum, ch) => sum + ch.ascension + 1, 0))
const totalPossibleLimiteds = computed(() => fiveStarMembers.value.filter(ch => ch.obtain !== "Permanent").reduce((sum, _) => sum + 6, 0))
const standardPool = computed(() => fiveStarMembers.value.filter(ch => new Date() > new Date(ch.permaDate)))
const ownedA5StandardPool = computed(() => standardPool.value.filter(ch => ch.enabled && ch.ascension === 5))
const extraCollected = useSetting("extraCollected", 0)
const extraTotal = computed(() => (showDupes.value ? ownedFiveStars.value.reduce((sum, ch) => sum + ch.dupes, 0) : extraCollected.value))

const missingCrys5stars = computed(() => fiveStarMembers.value.reduce((p, c) => p + (c.enabled ? (maxCrysCount.value - getCrysCount(c, true)) : 0), 0))
const missingCrys4stars = computed(() => fourStarMembers.value.reduce((p, c) => p + (maxCrysCount.value - getCrysCount(c, true)), 0))
const missingCrys3stars = computed(() => threeStarMembers.value.reduce((p, c) => p + (maxCrysCount.value - getCrysCount(c, true)), 0))

const showLevels = useSetting("showLevels", true);
const showHearts = useSetting("showHearts", true);
const showDupes = useSetting("showDupes", true);
const showCrys = useSetting("showCrys", true);
const colourLevels = useSetting("colourLevels", true);
const highlightCompleted = useSetting("highlightCompleted", true);

const showOffElementalOnes = useSetting("showOffElementalCrysCollection", false)
const show4stars = useSetting("show4stars", false);
const show3stars = useSetting("show3stars", false);
const showUnowned = useSetting("showUnowned", true);

const round = (nr: number) => nr.toFixed(2)

const getMaxSpecialLvl = (ch: Character): number => {
    if (ch.ascension === 5) return 10
    if (ch.ascension >= 3) return 7
    return 4
}

const getCrysElement = (selectionAbilityMstId: number) => {
    if (!(selectionAbilityMstId in crystalises)) {
        console.warn(selectionAbilityMstId, "not in crystalises")
        return 0
    }
    return elementMap[passiveDetails[crystalises[selectionAbilityMstId].value1 * 100 + 1].element] ?? 0
}

const shouldFilterOutOffElement = (elem: KiokuElement, selectionAbilityMstId: number) =>
    [0, elem].includes(getCrysElement(selectionAbilityMstId))

const maxCrysCount = computed(() => relevantCrys(10010101).filter(c => showOffElementalOnes.value ? true : shouldFilterOutOffElement(KiokuElement.Light, c.selectionAbilityMstId)).length)
const hasElementalCrys = (ch: Character) => ch?.crysOptions && Object.entries(ch.crysOptions).some(([i, c]) => getCrysElement(Number(i)) === ch.element && c.enabled)

const getCrysCount = (ch: Character, filterOutOffElement: boolean): number => {
    if (!ch.crysOptions) return 0
    return Object
        .entries(ch.crysOptions)
        .filter(([i, c]) => filterOutOffElement ? showOffElementalOnes.value ? true : shouldFilterOutOffElement(ch.element, Number(i)) : true)
        .map(([i, c]) => c)
        .reduce((sum: number, opt: any) => {
            if (!opt?.enabled) return sum
            return sum + 1
        }, 0)
}

const isMaxHeartLevel = (ch: Character): boolean => showHearts.value ? ch.heartphialLvl === KiokuConstants.maxHeartphialLvl : true
const isMaxMagicAndSpecialLevel = (ch: Character): boolean => showLevels.value ? ch.magicLvl === KiokuConstants.maxMagicLvl
    // Since Fuuka sp10 breaks her for pvp allow sp9 to also be considered completed
    && ((ch.name === "Final Fatebloom" && ch.ascension === 5 ? 9 : getMaxSpecialLvl(ch)) <= ch.specialLvl || ch.rarity === 3) : true
const isMaxCrysCollected = (ch: Character): boolean => showCrys.value ? getCrysCount(ch, true) === maxCrysCount.value : true
const isCompleted = (ch: Character): boolean => (ch.enabled || ch.rarity !== 5 || ch.name === "Lux☆Magica") && isMaxHeartLevel(ch) && isMaxMagicAndSpecialLevel(ch) && isMaxCrysCollected(ch)
const shouldHighlightCompleted = (ch: Character): boolean => highlightCompleted.value && isCompleted(ch)
const shouldShinyHighlightCompleted = (ch: Character): boolean => highlightCompleted.value && showCrys.value && isCompleted(ch) && getCrysCount(ch, false) === relevantCrys(ch.id).length
const showOffElementalOnesOption = computed(() => displayedCharactersComputed.value.some(char => {
    if (!char?.enabled) return false
    return Object.values(char.crysOptions).every((c) => c.enabled == null || c.enabled)
}))

const groupedByAscension = computed(() => {
    type LabelledGroup = Character[] & { label?: string }
    const groups: LabelledGroup[] = Array.from({ length: 9 }, () => [])

    groups[0].label = "A5"
    groups[1].label = "A4"
    groups[2].label = "A3"
    groups[3].label = "A2"
    groups[4].label = "A1"
    groups[5].label = "A0"
    groups[6].label = "Not Owned"
    groups[7].label = "4 Stars"
    groups[8].label = "3 Stars"

    for (const ch of displayedCharactersComputed.value) {
        if (ch.rarity === 4 || ch.name === "Lux☆Magica") {
            groups[7].push(ch)
        } else if (ch.rarity === 3) {
            groups[8].push(ch)
        } else if (ch.enabled) {
            groups[5 - ch.ascension].push(ch)
        } else {
            groups[6].push(ch)
        }
    }

    for (let i = 0; i < groups.length; i++) {
        groups[i].sort((a, b) => i === 6 ? a.id - b.id : b.id - a.id)
    }

    if (!show3stars.value) groups.splice(8, 1)
    if (!show4stars.value) groups.splice(7, 1)
    if (!showUnowned.value) groups.splice(6, 1)

    return groups
})

const makeTitle = (ch: Character): string => {
    let title = `${ch.name}`
    if (ch.name === "Lux☆Magica") { }
    else if (ch.obtain && ch.obtain !== "Permanent") {
        title += ` -  ${ch.obtain}`
    } else if (ch.permaDate == "") {
        title += " -  Not added to permanent yet"
    } else if (new Date(ch.permaDate) > new Date()) {
        title += " -  Added to standard pool on " + new Date(ch.permaDate).toLocaleDateString()
    }
    return title
}

const borderClass = (ch: Character): string => {
    if (ch.name === "Lux☆Magica") return "default-border"
    if (ch.obtain && ch.obtain !== "Permanent") return "limited-border"
    if (new Date() > new Date(ch.permaDate)) return "default-border"
    return "not-limited-border"
}

type EditableField = "magicLvl" | "heartphialLvl" | "specialLvl" | "dupes"

const editing = ref<{ id: number; field: EditableField } | null>(null)
const editValue = ref<number>(0)

const startEdit = async (ch: Character, field: EditableField, e: MouseEvent) => {
    if (isReadonly.value) return
    editing.value = { id: ch.id, field }
    editValue.value = ch[field]

    await nextTick()

    if (e.currentTarget == null) {
        console.error("Could not find target", e, ch, field)
        return
    }

    const input = (e.currentTarget as HTMLElement).querySelector("input")
    input?.focus()
    input?.select()
}

const isEditing = (ch: Character, field: EditableField) =>
    editing.value?.id === ch.id && editing.value.field === field

const fieldMax: Partial<Record<EditableField, number>> = {
    magicLvl: KiokuConstants.maxMagicLvl,
    heartphialLvl: KiokuConstants.maxHeartphialLvl,
    specialLvl: KiokuConstants.maxSpecialLvl,
}

const getMax = (ch: Character, field: EditableField) => {
    if (field === "specialLvl") return getMaxSpecialLvl(ch)
    return fieldMax[field] ?? Infinity
}

const commitEdit = async (ch: Character, field: EditableField) => {
    if (isReadonly.value) return
    await nextTick()

    const max = getMax(ch, field)
    const min = field === "magicLvl" || field === "dupes" ? 0 : 1
    const value = Math.max(min, Math.min(editValue.value, max))

    store.updateChar({ ...ch, [field]: value })
    editing.value = null
}

const draggedChar = ref<Character | null>(null)
const dragOver = ref<number | null>(null)

const onDragStart = (ch: Character, e: DragEvent) => {
    if (isReadonly.value) return
    draggedChar.value = ch

    // Override Safari's default behaviour of dragging the <img> or <a>
    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', String(ch.id))
        const wrapper = (e.currentTarget as HTMLElement)
        e.dataTransfer.setDragImage(wrapper, wrapper.offsetWidth / 2, wrapper.offsetHeight / 2)
    }
}

const onDrop = (targetIndex: number) => {
    if (isReadonly.value) return
    if (!draggedChar.value) return

    const ch = draggedChar.value
    if (targetIndex === 6) {
        ch.enabled = false
    } else {
        ch.enabled = true
        ch.ascension = 5 - targetIndex
    }

    store.updateChar({ ...ch })
    draggedChar.value = null
}

const dragLeave = (e: DragEvent) => {
    if (isReadonly.value) return
    if (!e.currentTarget || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
        dragOver.value = null
    }
}

const exportOpts = { exportClass: "exporting" }

const currentPageUrl = () => {
    const friendId = viewingFriendCode.value ?? friendCode.value
    return friendId
        ? `${window.location.origin}/exedra-dmg-calc/#/my-kioku?friend=${friendId}`
        : `${window.location.origin}/exedra-dmg-calc/#/my-kioku`
}

const displayedName = computed(() =>
    viewingFriendCode.value
        ? `${(viewingProfile.value?.display_name || "A player")}'s`
        : (friendStore.displayName ? `${friendStore.displayName}'s` : "My")
)

const shareOptionsForAscensionList = () => ({
    title: `${friendStore.getFormattedDisplayNamePossessive(displayedName.value)} Kioku Collection`,
    backUrl: currentPageUrl(),
})

const hyperlinkCopied = ref(false)

const copyHyperLink = async () => {
    try {
        const friendId = viewingFriendCode.value ?? friendCode.value
        if (!friendId) throw new Error("You need to sync your friend code first!")
        await navigator.clipboard.writeText(currentPageUrl())
        hyperlinkCopied.value = true
        setTimeout(() => { hyperlinkCopied.value = false }, 1500)
        toast.success("Copied to clipboard!", { position: toast.POSITION.TOP_RIGHT, icon: false })
    } catch (err) {
        console.error("Clipboard failed:", err)
        toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    }
}

const isTouchDevice = ref(false)
const isTouchJiggleMode = ref(false)

const touchDragged = ref<Character | null>(null)
const touchStartPos = ref<{ x: number; y: number } | null>(null)
const touchIsDragging = ref(false)
const touchHoldTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const HOLD_DURATION = 500
const MOVE_CANCEL_THRESHOLD = 8

onMounted(() => {
    isTouchDevice.value = window.matchMedia("(pointer: coarse)").matches
    document.addEventListener("touchstart", onDocumentTouchToExitJiggle, { passive: true })
})

const onDocumentTouchToExitJiggle = (e: TouchEvent) => {
    if (!isTouchJiggleMode.value) return
    const target = e.target as HTMLElement
    if (!target.closest(".jiggling") && !target.closest(".asc-row")) {
        isTouchJiggleMode.value = false
    }
}

const onTouchStart = (ch: Character, e: TouchEvent) => {
    if (isReadonly.value) return

    isTouchDevice.value = true
    touchStartPos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchIsDragging.value = false

    if (isTouchJiggleMode.value) {
        touchDragged.value = ch
        draggedChar.value = ch
    } else {
        touchHoldTimer.value = setTimeout(() => {
            isTouchJiggleMode.value = true
            touchDragged.value = ch
            draggedChar.value = ch
            if (navigator.vibrate) navigator.vibrate(40)
        }, HOLD_DURATION)
    }
}

const onTouchMove = (e: TouchEvent) => {
    if (isReadonly.value) return
    if (!touchStartPos.value) return

    const dx = e.touches[0].clientX - touchStartPos.value.x
    const dy = e.touches[0].clientY - touchStartPos.value.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (!isTouchJiggleMode.value) {
        if (dist > MOVE_CANCEL_THRESHOLD && touchHoldTimer.value) {
            clearTimeout(touchHoldTimer.value)
            touchHoldTimer.value = null
        }
        return
    }

    if (dist > MOVE_CANCEL_THRESHOLD) {
        touchIsDragging.value = true
    }

    if (!touchIsDragging.value) return

    e.preventDefault()

    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const row = element?.closest("tr.asc-row")
    dragOver.value = row ? Number(row.getAttribute("data-index")) : null
}

const onTouchEnd = (e: TouchEvent) => {
    if (isReadonly.value) return

    if (touchHoldTimer.value) {
        clearTimeout(touchHoldTimer.value)
        touchHoldTimer.value = null
    }

    if (!isTouchJiggleMode.value) {
        const touch = e.changedTouches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
        target?.click()
    } else if (touchIsDragging.value) {
        if (dragOver.value != null) onDrop(dragOver.value)
    }

    dragOver.value = null
    touchDragged.value = null
    draggedChar.value = null
    touchStartPos.value = null
    touchIsDragging.value = false
}
</script>

<style scoped>
/* ── Page (shared design system) ── */
.setup-page {
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

.chip.disabled {
    opacity: 0.5;
    cursor: default;
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

/* ── Stats / about cards ── */
.stats-card,
.about-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.88rem;
    padding: 0.15rem 0;
}

.stat-row-sub {
    padding-left: 1rem;
    font-size: 0.8rem;
    opacity: 0.8;
}

.stat-label {
    color: var(--muted);
}

.stat-value {
    color: var(--text);
    font-weight: 600;
    text-align: right;
    flex-shrink: 0;
}

.about-card p {
    margin: 0.3rem 0 0;
    font-size: 0.85rem;
    color: var(--muted);
    line-height: 1.5;
}

.ascension-list {
    max-width: 900px;
    margin: 0 auto;
    color: var(--text);
}

.exporting {
    width: 900px !important;
}

@media (max-width: 768px) {
    .ascension-list {
        max-width: 100%;
    }

    .exporting {
        width: 830px !important;
    }
}

.ascension-table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.5rem;
    vertical-align: top;
}

.asc-cell {
    width: 85px;
    font-weight: bold;
    background-color: rgba(255, 255, 255, 0.06);
    font-size: 1.2rem;
    color: var(--text);
    vertical-align: middle;
    box-sizing: border-box;
}

@media (max-width: 480px) {
    .asc-cell {
        width: 65px;
        font-size: 1rem;
        padding: 0.4rem;
    }
}

.characters-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 68px;
}

@media (max-width: 768px) {
    .characters-cell {
        min-height: 56px;
        gap: 0.4rem;
    }
}

@media (max-width: 480px) {
    .characters-cell {
        min-height: 48px;
        gap: 0.3rem;
    }
}

.character-img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: block;
    transition: transform 0.15s ease;
    border: 2px solid transparent;

    -webkit-user-drag: none;
    user-drag: none;
    -webkit-touch-callout: none;
}

@media (max-width: 768px) {
    .character-img {
        width: 64px;
        height: 64px;
    }
}

@media (max-width: 480px) {
    .character-img {
        width: 64px;
        height: 64px;
    }
}

.character-img:hover {
    transform: scale(1.08);
}

.limited-border {
    border-color: red !important;
}

.not-limited-border {
    border-color: rgb(255, 255, 0) !important;
}

.completed-glow {
    border-color: rgba(255, 215, 0, 0.7);
    box-shadow:
        0 0 5px 1px rgba(255, 215, 0, 0.7),
        0 0 15px 3px rgba(255, 190, 0, 0.25);
}

.completed-wrapper-diamond .completed-glow {
    animation: platinum-pulse 4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes platinum-pulse {
    0% {
        border-color: rgba(210, 235, 255, 0.55);
        box-shadow:
            0 0 5px 2px rgba(210, 235, 255, 0.55),
            0 0 12px 2px rgba(185, 215, 240, 0.15);
    }

    50% {
        border-color: rgba(225, 242, 255, 0.95);
        box-shadow:
            0 0 5px 2px rgba(225, 242, 255, 0.95),
            0 0 12px 2px rgba(195, 225, 248, 0.22);
    }

    100% {
        border-color: rgba(210, 235, 255, 0.55);
        box-shadow:
            0 0 5px 2px rgba(210, 235, 255, 0.55),
            0 0 12px 2px rgba(185, 215, 240, 0.15);
    }
}

.completed-wrapper .level-badge {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
}

.level-badge input {
    min-width: 2rem;

}

.completed-wrapper:hover .level-badge,
.completed-wrapper.editing-active .level-badge {
    opacity: 1;
    pointer-events: auto;
}

.asc-row.drag-over {
    background-color: rgba(255, 255, 255, 0.1);
}

@keyframes jiggle {
    0% {
        transform: rotate(0deg);
    }

    20% {
        transform: rotate(-3deg);
    }

    40% {
        transform: rotate(3deg);
    }

    60% {
        transform: rotate(-2deg);
    }

    80% {
        transform: rotate(2deg);
    }

    100% {
        transform: rotate(0deg);
    }
}

.jiggling {
    animation: jiggle 0.8s ease-in-out infinite;
    cursor: grab;
}

.jiggling:active {
    cursor: grabbing;
}

.jiggle-hint {
    width: 100%;
    font-size: 0.7rem;
    color: var(--accent-soft);
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.25rem;
    text-align: center;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.extra-input input {
    padding: 0.2rem 0.5rem;
    width: 90px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-sm);
    color: var(--text);
}

.character-img-wrapper {
    position: relative;
    display: inline-block;
    touch-action: none;
}

.character-img-wrapper a {
    -webkit-touch-callout: none;
    user-select: none;
}

.level-badge {
    position: absolute;
    width: 30px;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: var(--text);
    font-size: 0.6rem;
    text-align: center;
    border-radius: 15rem;
    font-weight: bold;
}

.level-badge:hover {
    border: 1px solid var(--border-strong);
}

.special-level-badge {
    left: 80%;
    bottom: 0;
}

.heart-level-badge {
    left: 20%;
    top: 0;
}

.dupe-badge {
    left: 80%;
    top: 0;
    opacity: 1 !important;
}

.crys-count-badge {
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
}

.crys-link {
    text-decoration: none;
    cursor: pointer;
}

.crys-link:hover {
    transform: translate(50%, -50%) scale(1.08);
}

.magic-level-badge {
    left: 20%;
    bottom: 0;
}

.maxLvl {
    color: palegreen;
}

.notMaxLvlMissingElemCrys {
    color: saddlebrown;
}

.notMaxLvl {
    color: pink;
}

.level-badge.editable {
    cursor: pointer;
}

.level-badge input {
    width: 32px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    font-size: 0.6rem;
    text-align: center;
    padding: 1px;
}

.viewing-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    margin-bottom: 1rem;
    padding: 0.6rem 0.9rem;
    border-radius: var(--radius-sm);
    background: var(--panel);
    border: 1px solid var(--border-strong);
}

.viewing-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--accent-soft);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
}

.back-to-own {
    margin-left: auto;
    padding: 0.3rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    color: var(--accent-soft);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.back-to-own:hover {
    background: rgba(255, 255, 255, 0.08);
}

.compare-to-own {
    margin-right: auto;
    padding: 0.3rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    color: var(--accent-soft);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.compare-to-own:hover {
    background: rgba(255, 255, 255, 0.08);
}

.viewing-banner-own {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-sm);
    background: var(--bg-soft);
    border: 1px solid var(--border);
}

.viewing-own-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.view-friend-btn {
    margin-left: auto;
    padding: 0.3rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    color: var(--muted);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
}

.view-friend-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.14);
    color: var(--text);
}
</style>
