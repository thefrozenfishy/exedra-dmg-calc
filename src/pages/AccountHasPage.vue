<template>
    <div class="ascension-list">
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

        <button class="copy-btn" @click="copyAscensionList">Copy to clipboard</button>
        <button class="copy-btn" @click="downloadAscensionList">Download</button>
        <button class="copy-btn" @click="copyHyperLink">Copy Link</button>
        <div>
            <label> <input type="checkbox" v-model="show3stars" /> Include 3-stars </label>
            <label> <input type="checkbox" v-model="show4stars" /> Include 4-stars </label>
            <label> <input type="checkbox" v-model="showUnowned" /> Include Unowned </label>
        </div>
        <div>
            <label> <input type="checkbox" v-model="showLevels" /> Show Magic and Special levels </label>
            <label> <input type="checkbox" v-model="showHearts" /> Show Heartphial levels </label>
            <label> <input type="checkbox" v-model="showDupes" /> Show Dupes </label>
            <label>
                <input type="checkbox" v-model="showCrys" />
                Show Crys Counter
            </label>
            <label> <input type="checkbox" :disabled="!(showLevels || showHearts)" v-model="colourLevels" />
                Colour max levels
            </label>
        </div>
        <table class="ascension-table">
            <tbody>
                <tr :data-index="index" :class="{ 'drag-over': dragOver === index }"
                    @dragover.prevent="dragOver = index" @dragleave="dragLeave" @drop="onDrop(index)"
                    v-for="(chars, index) in groupedByAscension" :key="index" class="asc-row">

                    <td class="asc-cell">{{ (chars as any).label }}</td>

                    <td class="characters-cell">
                        <div v-for="ch in chars" :key="ch.id" draggable="true" @dragstart="onDragStart(ch)"
                            @touchstart="onTouchStart(ch, $event)" @touchmove="onTouchMove" @touchend="onTouchEnd">
                            <div class="character-img-wrapper">
                                <a :href="`https://exedra.wiki/wiki/${ch.name}`" target="_blank">
                                    <img class="character-img" :class="borderClass(ch)"
                                        :src="`/exedra-dmg-calc/kioku_images/${ch.id}_thumbnail.png`" :alt="ch.name"
                                        :title="makeTitle(ch)" />
                                </a>
                                <router-link v-if="showCrys && (chars as any).label !== 'Not Owned'"
                                    class="crys-count-badge level-badge crys-link" :to="{
                                        path: '/character-crys',
                                        query: { character_id: ch.id }
                                    }" @click.stop :class="colourLevels
                                        ? getCrysCount(ch) >= maxCrysCount ? 'maxLvl' : 'notMaxLvl'
                                        : ''">
                                    {{ getCrysCount(ch) }}
                                </router-link>
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
        <div class="extra-input" v-if="!showDupes">
            +500s collected:
            <input type="number" v-model.number="extraCollected" />
        </div>
        <div class="total-ascensions">
            <div>
                Total SSRs collected: {{ totalAscensions + extraTotal }}
            </div>
            <div>
                Standard roster collected: {{ totalStandards }} / {{ totalPossibleStandards }} ({{ round(totalStandards
                    / totalPossibleStandards * 100) }}%)
            </div>
            <div>
                ({{ round(extraTotal / (totalStandards + extraTotal) * 100) }}% of your collected standard SSRs
                have been +500s)
            </div>
            <div>
                Limited roster collected: {{ totalLimiteds }} / {{ totalPossibleLimiteds }} ({{ round(totalLimiteds /
                    totalPossibleLimiteds * 100) }}%)
            </div>
            <div>
                Probability of hitting non A5 on standard pull:
                {{ standardPool.length - ownedA5StandardPool.length }} / {{ standardPool.length }} |
                {{ round((standardPool.length - ownedA5StandardPool.length) / standardPool.length * 100) }}%
            </div>
        </div>
        <h4 style="margin-bottom: 0;">Maxed Heartphial-, Magic-, & Special level kioku with all (not off element) crys collected:</h4>
        <div>
            5-stars: {{ maxed5starChars.length }} / {{ ownedFiveStars.length }}
            ({{ round(maxed5starChars.length / ownedFiveStars.length * 100) }}%)
        </div>
        <div v-if="show4stars">
            4-stars: {{ maxed4starChars.length }} / {{ fourStarMembers.length }}
            ({{ round(maxed4starChars.length / (fourStarMembers.length) * 100) }}%)
        </div>
        <div v-if="show3stars">
            3-stars: {{ maxed3starChars.length }} / {{ threeStarMembers.length }}
            ({{ round(maxed3starChars.length / (threeStarMembers.length) * 100) }}%)
        </div>
        <div>
            <h4 style="margin-bottom: 0;">About:</h4>
            You can edit, export, and import your kioku on the Team Setup page, or edit here directly.<br />
            Red borders indicate limited characters, yellow borders indicate characters not yet added to the permanent
            roster, and transparent borders indicate standard permanent characters.
        </div>
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
import { useFriendStore, SocialProfile } from "../store/friendStore"
import { getProfile, loadCharactersByFriendCode } from "../store/cloud"
import { copyImageToClipboard, downloadImage } from "../utils/image"
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

const maxed5starChars = computed(() => fiveStarMembers.value.filter(ch => ch.enabled && isMaxLevels(ch) && getCrysCount(ch) === maxCrysCount))
const maxed4starChars = computed(() => fourStarMembers.value.filter(ch => isMaxLevels(ch) && getCrysCount(ch) === maxCrysCount))
const maxed3starChars = computed(() => threeStarMembers.value.filter(ch => isMaxLevels(ch) && getCrysCount(ch) === maxCrysCount))

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

const showLevels = useSetting("showLevels", true);
const showHearts = useSetting("showHearts", true);
const showDupes = useSetting("showDupes", true);
const showCrys = useSetting("showCrys", true);
const colourLevels = useSetting("colourLevels", true);

const show4stars = useSetting("show4stars", false);
const show3stars = useSetting("show3stars", false);
const showUnowned = useSetting("showUnowned", true);

const round = (nr: number) => nr.toFixed(2)

const getMaxSpecialLvl = (ch: Character): number => {
    if (ch.ascension === 5) return 10
    if (ch.ascension >= 3) return 7
    return 4
}

const shouldFilterOutOffElement = (elem: KiokuElement, selectionAbilityMstId: number) =>
    [0, elem].includes(elementMap[passiveDetails[crystalises[selectionAbilityMstId].value1 * 100 + 1].element] ?? 0)

const maxCrysCount = relevantCrys(10010101).filter(c => shouldFilterOutOffElement(KiokuElement.Light, c.selectionAbilityMstId)).length

const getCrysCount = (ch: Character): number => {
    if (!ch.crysOptions) return 0
    return Object
        .entries(ch.crysOptions)
        .filter(([i, c]) => shouldFilterOutOffElement(ch.element, Number(i)))
        .map(([i, c]) => c)
        .reduce((sum: number, opt: any) => {
            if (!opt?.enabled) return sum
            return sum + 1
        }, 0)
}

const isMaxLevels = (ch: Character): boolean => ch.magicLvl === KiokuConstants.maxMagicLvl &&
    ch.heartphialLvl === KiokuConstants.maxHeartphialLvl &&
    (getMaxSpecialLvl(ch) === ch.specialLvl || ch.rarity === 3)

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

const onDragStart = (ch: Character) => {
    if (isReadonly.value) return
    draggedChar.value = ch
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
const downloadAscensionList = () => {
    const el = document.querySelector(".ascension-table") as HTMLElement
    if (!el) return
    downloadImage("ascension.png", el)
}

const copyAscensionList = () => {
    const el = document.querySelector(".ascension-table") as HTMLElement
    if (!el) return
    copyImageToClipboard("ascension.png", el)
}

const copyHyperLink = async () => {
    try {
        const friendId = viewingFriendCode.value ?? friendCode.value
        if (!friendId) throw new Error("You need to sync your friend code first!")
        await navigator.clipboard.writeText(
            `${window.location.origin}/exedra-dmg-calc/#/my-kioku?friend=${friendId}`
        )
        toast.success("Copied to clipboard!", { position: toast.POSITION.TOP_RIGHT, icon: false })
    } catch (err) {
        console.error("Clipboard failed:", err)
        toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    }
}

const touchDragged = ref<Character | null>(null)

const onTouchStart = (ch: Character, e: TouchEvent) => {
    if (isReadonly.value) return
    touchDragged.value = ch
    draggedChar.value = ch
}

const onTouchMove = (e: TouchEvent) => {
    if (isReadonly.value) return
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const row = element?.closest("tr.asc-row")
    if (!row) { dragOver.value = null; return }
    dragOver.value = Number(row.getAttribute("data-index"))
}

const onTouchEnd = () => {
    if (isReadonly.value) return
    if (dragOver.value != null) onDrop(dragOver.value)
    dragOver.value = null
    touchDragged.value = null
    draggedChar.value = null
}
</script>

<style scoped>
.ascension-list {
    max-width: 900px;
    margin: 0 auto;
    color: #ddd;
}

.ascension-table {
    width: 100%;
    border-collapse: collapse;
}

td {
    border: 1px solid #444;
    padding: 0.5rem;
    vertical-align: top;
}

.asc-cell {
    width: 85px;
    font-weight: bold;
    background-color: #333;
    font-size: 1.2rem;
    color: #eee;
    vertical-align: middle;
    box-sizing: border-box;
}

.characters-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 68px;
}

.character-img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    border: 1px solid #666;
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
    border: 2px solid rgb(255, 255, 0);
}

.default-border {
    border: 2px solid transparent;
}

.asc-row.drag-over {
    background-color: rgba(255, 255, 255, 0.1);
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

.copy-btn:hover {
    background: #555;
}

.total-ascensions {
    margin-top: 1rem;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #eee;
}

.extra-input {
    margin-top: 1rem;
    text-align: center;
    color: #eee;
    font-size: 1rem;
}

.extra-input input {
    margin-left: 0.5rem;
    padding: 0.2rem 0.4rem;
    width: 80px;
    background: #333;
    border: 1px solid #666;
    border-radius: 4px;
    color: #eee;
}

.character-img-wrapper {
    position: relative;
    display: inline-block;
}

.level-badge {
    position: absolute;
    width: 30px;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: 0.6rem;
    text-align: center;
    border-radius: 15rem;
    font-weight: bold;
}

.level-badge:hover {
    border: 1px solid #b57edc;
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

.notMaxLvl {
    color: pink;
}

.level-badge.editable {
    cursor: pointer;
}

.level-badge input {
    width: 32px;
    background: #111;
    color: #fff;
    border: 1px solid #666;
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
    border-radius: 10px;
    background: #2d2233;
    border: 1px solid #b57edc;
}

.viewing-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: #c9a0e8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
}

.back-to-own {
    margin-left: auto;
    padding: 0.3rem 0.75rem;
    background: #3a2f47;
    border: 1px solid #8e5bc7;
    border-radius: 999px;
    color: #c9a0e8;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.back-to-own:hover {
    background: #4a3a5a;
}

.compare-to-own {
    margin-right: auto;
    padding: 0.3rem 0.75rem;
    background: #3a2f47;
    border: 1px solid #8e5bc7;
    border-radius: 999px;
    color: #c9a0e8;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.compare-to-own:hover {
    background: #4a3a5a;
}

.viewing-banner-own {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.9rem;
    border-radius: 10px;
    background: #262626;
    border: 1px solid #444;
}

.viewing-own-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.view-friend-btn {
    margin-left: auto;
    padding: 0.3rem 0.75rem;
    background: #333;
    border: 1px solid #555;
    border-radius: 999px;
    color: #bbb;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
}

.view-friend-btn:hover {
    background: #3d3d3d;
    border-color: #777;
    color: #ddd;
}
</style>
