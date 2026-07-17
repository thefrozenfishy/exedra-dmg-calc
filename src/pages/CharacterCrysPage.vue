<template>
    <div class="setup-page page">
        <h1 class="page-title">Character Crystalis Selections</h1>

        <div class="missing-element-grid">
            <section class="toolbar card">
                <span class="filters-heading">Char Filter</span>
                <div class="toolbar-right rarity-toggles">
                <input
                    ref="charSearchInputRef"
                    type="text"
                    v-model="charNameFilter"
                    placeholder="Search name..."
                    class="char-search-input"
                />
                    <label class="chip" :class="{ active: show4stars }">
                        <input type="checkbox" v-model="show4stars" /> ★★★★
                    </label>
                    <label class="chip" :class="{ active: show3stars }">
                        <input type="checkbox" v-model="show3stars" /> ★★★
                    </label>
                </div>
            </section>

            <section class="toolbar card">
                <span class="filters-heading">Sort</span>
                <div class="toolbar-right rarity-toggles">
                    <label class="chip" :class="{ active: sortMode === 'element' }">
                        <input type="radio" name="sort-mode" value="element" v-model="sortMode" />
                        Group by element
                    </label>
                    <label class="chip" :class="{ active: sortMode === 'crysCount' }">
                        <input type="radio" name="sort-mode" value="crysCount" v-model="sortMode" />
                        Sort by crys count
                    </label>
                </div>
            </section>

            <section class="filters card">
                <span class="filters-heading">Filters</span>

                <label class="chip" :class="{ active: hideCompletedCrys }">
                    <input type="checkbox" v-model="hideCompletedCrys" /> Hide completed
                </label>

                <label v-if="showOffElementalOnesOption" class="chip" :class="{ active: showOffElementalOnes }">
                    <input type="checkbox" v-model="showOffElementalOnes" /> Include Off-elemental Crystalis
                </label>

                <div v-if="!showOffElementalOnes" class="filter-group">
                    <label class="chip" :class="{ active: missingOwnElementalFilter }">
                        <input type="checkbox" name="own-elemental-filter"
                            v-model="missingOwnElementalFilter" /> Show only girls missing elemental crys
                    </label>
                </div>

                <div v-else class="filter-group">
                    <span class="filter-group-label">Missing element crys</span>
                    <label v-for="elem in KiokuElement" :key="elem" class="chip element-chip"
                        :class="{ active: elementCrysFilter.includes(elem) }">
                        <input type="checkbox" :value="elem" v-model="elementCrysFilter" />
                        <img :src="`/exedra-dmg-calc/elements/${elem}.png`" :alt="elem" class="element-chip-icon" />
                    </label>
                </div>
            </section>

            <section class="toolbar card">
                <span class="filters-heading">Image Share</span>
                <ImageActionsToolbar target=".element-section" filename="collected_crys.png" :share-options="shareOptionsForAscensionList" :export-options="exportOpts" />
            </section>

            <div class="list-header crys-table-header">
                <span class="crys-header-name">Kioku</span>
                <span class="crys-header-crys">Crystalis</span>
            </div>

            <section class="element-section">
                <template v-if="sortMode === 'element'">
                    <div v-for="(rows, elem) in groupedCharacterCrysRows" :key="elem" class="element-row">
                        <button class="element-header" @click="toggleElement(elem)" :aria-expanded="!collapsedElements[elem]">
                            <span class="element-chevron" :class="{ rotated: collapsedElements[elem] }">▾</span>
                            <span class="element-name">
                                <img :src="`/exedra-dmg-calc/elements/${elem}.png`" :alt="elem" :title="elem" class="element-header-icon" />
                            </span>
                            <span title="Completed Kioku out of Total Kioku" class="element-count">{{ groupedRosterCharacterCrysRows[elem].filter(r => r.completed).length }} / {{ groupedRosterCharacterCrysRows[elem].length }}</span>
                        </button>

                        <div v-show="!collapsedElements[elem]" class="character-crys-list element-body">
                            <CharacterCrysRow v-for="row in rows" :key="row.char.id" :row="row"
                                :show-off-elemental-ones="showOffElementalOnes" @select="onSelectCharacter" />

                            <div v-if="!rows.length" class="empty-state">
                                No Kioku match the current filters in this element.
                            </div>
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="character-crys-list">
                        <CharacterCrysRow v-for="row in sortedCharacterCrysRows" :key="row.char.id" :row="row"
                            :show-off-elemental-ones="showOffElementalOnes" @select="onSelectCharacter" />

                        <div v-if="!sortedCharacterCrysRows.length" class="empty-state">
                            No Kioku match the current filters.
                        </div>
                    </div>
                </template>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { relevantCrys, type Character, type CrystalisData } from '../types/KiokuTypes'
import { elementMap, KiokuElement } from '../types/enums'
import CharacterCrysRow from '../components/CharacterCrysRow.vue'
import { useCharacterStore } from '../store/characterStore'
import { passiveDetails } from '../utils/helpers'
import { useSetting } from "../store/settingsStore"
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { useFriendStore } from "../store/friendStore"

function getCrysElement(crys: CrystalisData): KiokuElement | undefined {
    return elementMap[passiveDetails[crys.value1 * 100 + 1].element]
}

const shareOptionsForAscensionList = () => ({
    title: `${useFriendStore().getFormattedDisplayNamePossessive()} Crystalis Collection Progress`,
    backUrl: window.location.href,
})

const exportOpts = { 
    exportClass: "exporting",    
    onBefore: () => {
        document.querySelector(".element-section")?.classList.add(showOffElementalOnes.value ? "allElemExport" : "nonAllElemExport")
    },
    onAfter: () => {
        document.querySelector(".element-section")?.classList.remove(showOffElementalOnes.value ? "allElemExport" : "nonAllElemExport")
    }
}

const router = useRouter()
const store = useCharacterStore()

const show4stars = useSetting("show4stars", false);
const show3stars = useSetting("show3stars", false);
const charNameFilter = ref("")
const charSearchInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
    charSearchInputRef.value?.focus()
})
const showOffElementalOnes = useSetting("showOffElementalCrysCollection", false)
const hideCompletedCrys = useSetting("hideCompletedMissingElementCrys", false)
const missingOwnElementalFilter = useSetting<boolean | null>("missingElementHasOwnFilter", null)
const elementCrysFilter = useSetting<KiokuElement[]>("missingElementCrysFilter", [])
const sortMode = useSetting<"element" | "crysCount">("missingElementSortMode", "element")
const showOffElementalOnesOption = computed(() => store.characters.some(char => {
    if (!char.enabled) return false
    return Object.values(char.crysOptions).every((c) => c.enabled == null || c.enabled)
}))

const rosterCharacterCrysRows = computed(() => {
    return store.characters
        .filter(char => {
            if (!char.enabled) return false
            if (char.rarity === 3 && !show3stars.value) return false
            if ((char.rarity === 4 || char.name === "Lux☆Magica") && !show4stars.value) return false

            const query = charNameFilter.value.trim().toLowerCase()
            if (query) {
                const matchesName = char.name?.toLowerCase().includes(query)
                const matchesEn = char.character_en?.toLowerCase().includes(query)
                if (!matchesName && !matchesEn) return false
            }

            return true
        })
        .sort((a, b) => a.id - b.id)
        .map(char => {
            const crys = relevantCrys(char.id).map(c => ({
                ...c,
                enabled: char.crysOptions[c.selectionAbilityMstId]?.enabled ?? false,
            }))

            const offElementCrys = crys
                .filter(c => !getCrysElement(c))
                .sort((a, b) => b.rarity - a.rarity || b.sortOrder - a.sortOrder)

            const elementalSlots = Object.values(KiokuElement).map(elem => {
                const crysForElem = crys.find(c => getCrysElement(c) === elem)
                return {
                    elem,
                    crys: crysForElem,
                    owned: crysForElem?.enabled ?? false,
                    isOwnElement: elem === char.element,
                }
            })

            const relevantSlots = showOffElementalOnes.value
                ? elementalSlots
                : elementalSlots.filter(s => s.isOwnElement)
            const completed = offElementCrys.every(c => c.enabled) && relevantSlots.every(s => s.owned)

            const countedCrys = showOffElementalOnes.value
                ? crys
                : crys.filter(c => {
                    const elem = getCrysElement(c)
                    return !elem || elem === char.element
                })
            const ownedCrysCount = countedCrys.filter(c => c.enabled).length
            const totalCrysCount = countedCrys.length

            return { char, offElementCrys, elementalSlots, completed, ownedCrysCount, totalCrysCount }
        })
})

const characterCrysRows = computed(() => {
    return rosterCharacterCrysRows.value
        .filter(row => {
            if (hideCompletedCrys.value && row.completed) return false

            if (!showOffElementalOnes.value && missingOwnElementalFilter.value !== null) {
                const ownSlot = row.elementalSlots.find(s => s.isOwnElement)
                console.log(row.char.name, ownSlot?.owned, missingOwnElementalFilter.value)
                if (missingOwnElementalFilter.value && (ownSlot?.owned ?? false)) return false
            }

            if (showOffElementalOnes.value && elementCrysFilter.value.length > 0) {
                const missingAny = elementCrysFilter.value.some(elem => {
                    const slot = row.elementalSlots.find(s => s.elem === elem)
                    return !slot?.owned
                })
                if (!missingAny) return false
            }

            return true
        })
})

const sortedCharacterCrysRows = computed(() => {
    return [...characterCrysRows.value].sort((a, b) => {
        if (a.ownedCrysCount !== b.ownedCrysCount) return a.ownedCrysCount - b.ownedCrysCount
        if (a.totalCrysCount !== b.totalCrysCount) return b.totalCrysCount - a.totalCrysCount
        return a.char.id - b.char.id
    })
})

const collapsedElements = useSetting<Record<string, boolean>>("collapsedCrysElements", {})
function toggleElement(elem: string) {
    collapsedElements.value[elem] = !collapsedElements.value[elem]
}

const groupedCharacterCrysRows = computed(() => {
    const groups: Record<string, typeof characterCrysRows.value> = {}
    for (const elem of Object.values(KiokuElement)) {
        groups[elem] = []
    }
    for (const row of characterCrysRows.value) {
        groups[row.char.element].push(row)
    }
    return groups
})

const groupedRosterCharacterCrysRows = computed(() => {
    const groups: Record<string, typeof rosterCharacterCrysRows.value> = {}
    for (const elem of Object.values(KiokuElement)) {
        groups[elem] = []
    }
    for (const row of rosterCharacterCrysRows.value) {
        groups[row.char.element].push(row)
    }
    return groups
})


const onSelectCharacter = (char: Character) => {
    router.push({ path: '/character-crys-edit', query: { character_id: char.id } })
}
</script>

<style scoped>
.char-search-input {
    padding: 0.45rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    min-width: 160px;
    transition: border-color 0.15s, background 0.15s;
}

.char-search-input::placeholder {
    color: var(--muted);
}

.char-search-input:focus {
    border-color: var(--border-strong);
    background: rgba(255, 255, 255, 0.09);
}

.setup-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 4rem;
}

.page-title {
    font-size: 2rem;
    margin: 0 0 1.25rem;
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

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
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
    opacity: 0.7;
    flex-shrink: 0;
    width: 100px;
    min-width: 100px;
}

.section-title {
    font-size: 1.1rem;
    margin: 0 0 0.75rem;
    color: var(--accent-soft);
}

.page {
    padding: 12px;
}

.missing-element-grid {
    max-width: 1100px;
    margin: 16px auto 0;
}

.filter-group {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-left: 1px solid var(--border);
    padding-left: 0.65rem;
    flex-wrap: wrap;
}

.filter-group-label {
    font-size: 0.74rem;
    color: var(--muted);
    margin-right: 2px;
}

.element-chip-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    opacity: 0.35;
    filter: grayscale(0.8);
    transition: opacity 0.15s, filter 0.15s;
}

.element-chip.active .element-chip-icon {
    opacity: 1;
    filter: none;
}

.btn {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.4em 0.9em;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: var(--border-strong);
}

.btn-sm {
    padding: 0.28rem 0.65rem;
    font-size: 0.78rem;
}

.clear-chip {
    background: none;
    border-color: transparent;
    color: var(--muted);
    padding: 0.1rem 0.4rem;
    opacity: 0.7;
}

.clear-chip:hover {
    opacity: 1;
    color: var(--danger);
    border-color: transparent;
    background: none;
}

.clear-all-btn {
    margin-left: auto;
}

.list-header {
    display: grid;
    grid-template-columns: 180px auto 140px 1fr;
    gap: 0 0.75rem;
    padding: 0.3rem 0.75rem;
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--muted);
    border-bottom: 1px solid var(--border-strong);
    margin-bottom: 0.2rem;
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 10;
    opacity: 0.8;
    text-align: center;
}

.crys-table-header {
    grid-template-columns: 74px 1fr;
}

.crys-header-name {
    text-align: center;
}

.character-crys-list {
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.element-row {
    margin-bottom: 0.4rem;
}

.element-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s, border-color 0.15s;
}

.element-header:hover {
    background: var(--bg-soft);
    border-color: var(--border-strong);
}

.element-chevron {
    font-size: 1rem;
    line-height: 1;
    transition: transform 0.2s;
    color: var(--muted);
}

.element-chevron.rotated {
    transform: rotate(-90deg);
}

.element-name {
    flex: 1;
    color: var(--accent-soft);
    display: flex;
    align-items: center;
}

.element-header-icon {
    width: 26px;
    height: 26px;
    object-fit: contain;
    display: block;
}

.element-count {
    font-size: 0.74rem;
    color: var(--muted);
    font-weight: 400;
}

.element-body.character-crys-list {
    border-top: none;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.setup-page .allElemExport {
    width: 900px !important;
}

.setup-page .nonAllElemExport  {
    width: 770px !important;
}

.empty-state {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--muted);
    opacity: 0.7;
    font-size: 0.9rem;
}
</style>
