<template>
    <div class="setup-page page">
        <h1 class="page-title">Character Crystalis Selections</h1>

        <div v-if="characterId && character">
            <section class="toolbar card bulk-actions">
                <div class="selected-character-header">
                    <img :src="`/exedra-dmg-calc/kioku_images/${character.id}_thumbnail.png`" :alt="character.name"
                        class="selected-character-icon" />
                    <span class="selected-character-name">{{ character.name }}</span>
                    <button class="close-btn" title="Back to overview" @click="onSelectCharacter(undefined)">✖</button>
                </div>

                <div class="toolbar-right">
                    <span class="filters-heading">Filters</span>

                    <label class="chip" :class="{ active: hideOffElementalCrys }">
                        <input type="checkbox" v-model="hideOffElementalCrys" />
                        Hide off-elemental crystalis
                    </label>
                </div>

                <div class="mass-edit-panel" :class="{ disabled: !massEditSelection.size }">
                    <div class="mass-edit-header">
                        <span class="mass-edit-title">
                            Multi edit sub-crys
                            <span v-if="massEditSelection.size" class="mass-edit-count">({{ massEditSelection.size
                                }})</span>
                        </span>
                        <button v-if="massEditSelection.size" class="mass-edit-clear" @click="clearMassEditSelection">
                            Clear
                        </button>
                        <button v-else class="mass-edit-clear"
                            @click="massEditSelection = new Set(options.map(c => c.selectionAbilityMstId))">
                            Select all
                        </button>
                    </div>
                    <div class="mass-edit-enable-row">
                        <button class="mass-edit-enable-btn" :disabled="!massEditSelection.size"
                            @click="setEnabledForSelected(true)">
                            Enable selected
                        </button>
                        <button class="mass-edit-enable-btn" :disabled="!massEditSelection.size"
                            @click="setEnabledForSelected(false)">
                            Disable selected
                        </button>
                    </div>
                    <SubCrysBar :sub-crys="massEditSubCrys" :grouped-sub-crys="groupedSubCrys"
                        @update="applyMassEditSubCrys" />
                </div>
            </section>
            <div class="crys-grid">
                <div v-for="crys in options" :key="crys.selectionAbilityMstId" class="crys-card"
                    :class="{ disabled: !crys.enabled, offElement: offElementalCrys(crys) }">

                    <div class="mass-edit-toggle"
                        :class="{ checked: massEditSelection.has(crys.selectionAbilityMstId) }"
                        @click.stop="toggleMassEditSelection(crys.selectionAbilityMstId)">
                        <svg v-if="massEditSelection.has(crys.selectionAbilityMstId)" viewBox="0 0 16 16"
                            class="check-icon">
                            <path d="M3 8.5L6.2 11.7L13 4.5" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <div v-if="crys.enabled" class="use-index-selector">
                        <div v-for="i in 3" :key="i" class="use-index-box" :class="{ active: crys.useIndex === i }"
                            @click.stop="setUseIndex(crys.selectionAbilityMstId, i)">
                            {{ i }}
                        </div>
                    </div>

                    <div class="crys-header" @click="toggleCrys(crys.selectionAbilityMstId)">
                        <img :src="`/exedra-dmg-calc/selection_ability/${crys.resourceIconName}.png`" :alt="crys.name"
                            class="crys-image" :class="{ disabled: !crys.enabled }" />
                        <div class="details">
                            <span>{{ crys.name }}</span>
                            <span>{{ crys.description.replaceAll("<br>", "\n") }}</span>
                        </div>
                    </div>

                    <SubCrysBar :sub-crys="crys.subCrys" :grouped-sub-crys="groupedSubCrys"
                        @update="newSubCrys => updateSubCrys(crys.selectionAbilityMstId, newSubCrys)" />
                </div>
            </div>
        </div>
        <div v-else class="missing-element-grid">
            <h2 class="section-title">Kioku missing their elemental crys (For crys farming teambuilding)</h2>

            <section class="toolbar card">
                <span class="filters-heading">Roster</span>
                <div class="toolbar-right rarity-toggles">
                    <label class="chip" :class="{ active: show4stars }">
                        <input type="checkbox" v-model="show4stars" /> ★★★★
                    </label>
                    <label class="chip" :class="{ active: show3stars }">
                        <input type="checkbox" v-model="show3stars" /> ★★★
                    </label>
                </div>
            </section>

            <section class="filters card">
                <span class="filters-heading">Filters</span>

                <label class="chip" :class="{ active: hideCompletedCrys }">
                    <input type="checkbox" v-model="hideCompletedCrys" /> Hide completed
                </label>

                <label v-if="showOffElementalOnesOption" class="chip" :class="{ active: showOffElementalOnes }">
                    <input type="checkbox" v-model="showOffElementalOnes" /> Off-elemental kioku
                </label>

                <div v-if="!showOffElementalOnes" class="filter-group">
                    <label class="chip" :class="{ active: missingOwnElementalFilter }">
                        <input type="checkbox" name="own-elemental-filter"
                            v-model="missingOwnElementalFilter" /> Show only girls missing elemental crys
                    </label>
                </div>

                <div v-else class="filter-group">
                    <span class="filter-group-label">Missing element crys</span>
                    <label v-for="elem in KiokuElement" :key="elem" class="chip"
                        :class="{ active: elementCrysFilter.includes(elem) }">
                        <input type="checkbox" :value="elem" v-model="elementCrysFilter" />
                        {{ elem }}
                    </label>
                </div>
            </section>

            <div class="list-header crys-table-header">
                <span class="crys-header-name">Kioku</span>
                <span class="crys-header-crys">Crystalis</span>
            </div>

            <div v-for="(rows, elem) in groupedCharacterCrysRows" :key="elem" class="element-section">
                <button class="element-header" @click="toggleElement(elem)" :aria-expanded="!collapsedElements[elem]">
                    <span class="element-chevron" :class="{ rotated: collapsedElements[elem] }">▾</span>
                    <span class="element-name">{{ elem }}</span>
                    <span class="element-count">{{ groupedRosterCharacterCrysRows[elem].filter(r => r.completed).length }} / {{ groupedRosterCharacterCrysRows[elem].length }}</span>
                </button>

                <div v-show="!collapsedElements[elem]" class="character-crys-list element-body">
                    <div v-for="row in rows" :key="row.char.id" class="character-crys-row"
                        @click="onSelectCharacter(row.char)">
                        <div class="character-crys-header">
                            <img :src="`/exedra-dmg-calc/kioku_images/${row.char.id}_thumbnail.png`"
                                class="character-icon-lg" :title="row.char.name" />
                            <span class="character-crys-name">{{ row.char.name }}</span>
                        </div>

                        <div class="character-crys-body">
                            <div class="off-element-grid">
                                <div v-for="c in row.offElementCrys" :key="c.selectionAbilityMstId" class="mini-crys"
                                    :class="{ owned: c.enabled }" :title="c.name">
                                    <img :src="`/exedra-dmg-calc/selection_ability/${c.resourceIconName}.png`"
                                        :alt="c.name" class="mini-crys-img" />
                                </div>
                            </div>

                            <div class="elemental-pocket">
                                <template v-for="slot in row.elementalSlots" :key="slot.elem">
                                    <div v-if="showOffElementalOnes || slot.isOwnElement" class="mini-crys elemental"
                                        :class="{ owned: slot.owned, offElement: !slot.isOwnElement }" :title="slot.elem">
                                        <img v-if="slot.crys" :src="`/exedra-dmg-calc/selection_ability/${slot.crys.resourceIconName}.png`"
                                            :alt="slot.elem" class="mini-crys-img" />
                                        <img v-else :src="`/exedra-dmg-calc/elements/${slot.elem}.png`" :alt="slot.elem"
                                            class="mini-crys-img placeholder-icon" />
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <div v-if="!rows.length" class="empty-state">
                        No Kioku match the current filters in this element.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { relevantCrys, getSubCrystalises, elementMap, KiokuElement } from '../types/KiokuTypes'
import SubCrysBar from '../components/SubCrysBar.vue'
import { useCharacterStore } from '../store/characterStore'
import type { Character, CrystalisData } from '../types/KiokuTypes'
import { passiveDetails } from '../utils/helpers'
import { useSetting } from "../store/settingsStore"

function getCrysElement(crys: CrystalisData): KiokuElement | undefined {
    return elementMap[passiveDetails[crys.value1 * 100 + 1].element]
}

const offElementalCrys = (crys: CrystalisData) => {
    const elem = getCrysElement(crys)
    if (elem) return elem !== character.value?.element
    return false
}

const route = useRoute()
const router = useRouter()
const store = useCharacterStore()

const characterId = ref(Number(route.query.character_id) || 0)
const show4stars = useSetting("show4stars", false);
const show3stars = useSetting("show3stars", false);
const hideOffElementalCrys = useSetting("hideOffElementalCrys", false)
const showOffElementalOnes = useSetting("showOffElementalCrysCollection", false)
const hideCompletedCrys = useSetting("hideCompletedMissingElementCrys", false)
const missingOwnElementalFilter = useSetting<boolean | null>("missingElementHasOwnFilter", null)
const elementCrysFilter = useSetting<KiokuElement[]>("missingElementCrysFilter", [])
const showOffElementalOnesOption = computed(() => store.characters.some(char => {
    if (!char.enabled) return false
    return Object.values(char.crysOptions).every((c) => c.enabled == null || c.enabled)
}))

const subCrysFlatList = getSubCrystalises()

const groupedSubCrys = computed(() => {
    const groups: Record<string, { id: number; key: number; name: string; subs: typeof subCrysFlatList }> = {}
    for (const s of subCrysFlatList) {
        const key = s.selectionAbilityEffectId
        if (!groups[key]) groups[key] = { id: key, key: 0, name: "", subs: [] }
        groups[key].subs.push(s)
        if (s.rarity === 10) {
            groups[key].name = s.description
            groups[key].key = s.selectionAbilityMstId
        }
    }
    return Object.values(groups)
})

const character = computed(() => store.characters.find(c => c.id === characterId.value))

const options = computed(() => {
    if (!characterId.value || !character.value) return []
    return relevantCrys(characterId.value).map(c => {
        const selection = character.value!.crysOptions[c.selectionAbilityMstId]
        return {
            ...c,
            enabled: selection?.enabled ?? false,
            useIndex: selection?.useIndex ?? 0,
            subCrys: selection?.subCrys?.length === 3 ? selection.subCrys : [0, 0, 0],
        }
    })
        .filter(c => !hideOffElementalCrys.value || !offElementalCrys(c))
        .sort((a, b) => b.rarity - a.rarity || b.sortOrder - a.sortOrder)
})

const rosterCharacterCrysRows = computed(() => {
    return store.characters
        .filter(char => {
            if (!char.enabled) return false
            if (char.rarity === 3 && !show3stars.value) return false
            if ((char.rarity === 4 || char.name === "Lux☆Magica") && !show4stars.value) return false
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

            return { char, offElementCrys, elementalSlots, completed }
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


function updateSubCrys(effectId: number, newSubCrys: number[]) {
    const char = character.value
    if (!char) return

    store.updateChar({
        ...char,
        crysOptions: {
            ...char.crysOptions,
            [effectId]: { ...char.crysOptions[effectId], subCrys: newSubCrys },
        },
    })
}

const toggleCrys = (effectId: number) => {
    const char = character.value
    if (!char) return
    const current = char.crysOptions[effectId]
    store.updateChar({
        ...char,
        crysOptions: {
            ...char.crysOptions,
            [effectId]: {
                ...current,
                enabled: !current?.enabled,
                subCrys: current?.subCrys?.length === 3 ? current.subCrys : [0, 0, 0],
            },
        },
    })
}

const massEditSelection = ref<Set<number>>(new Set())
const massEditSubCrys = ref<number[]>([0, 0, 0])

function toggleMassEditSelection(effectId: number) {
    const next = new Set(massEditSelection.value)
    if (next.has(effectId)) next.delete(effectId)
    else next.add(effectId)
    massEditSelection.value = next
}

function clearMassEditSelection() {
    massEditSelection.value = new Set()
    massEditSubCrys.value = [0, 0, 0]
}

function setEnabledForSelected(enabled: boolean) {
    const char = character.value
    if (!char || !massEditSelection.value.size) return

    const updatedOptions = { ...char.crysOptions }
    for (const effectId of massEditSelection.value) {
        const current = updatedOptions[effectId]
        updatedOptions[effectId] = {
            ...current,
            enabled,
            subCrys: current?.subCrys?.length === 3 ? current.subCrys : [0, 0, 0],
        }
    }
    store.updateChar({ ...char, crysOptions: updatedOptions })
}

function applyMassEditSubCrys(newSubCrys: number[]) {
    const char = character.value
    if (!char || !massEditSelection.value.size) {
        massEditSubCrys.value = [0, 0, 0]
        return
    }

    const prev = massEditSubCrys.value
    const targetSlot = newSubCrys.findIndex((id, idx) => id !== prev[idx])
    if (targetSlot === -1) return

    const pickedId = newSubCrys[targetSlot]
    const siblingIds = pickedId !== 0
        ? (groupedSubCrys.value.find(g => g.subs.some(s => s.selectionAbilityMstId === pickedId))
            ?.subs.map(s => s.selectionAbilityMstId) ?? [pickedId])
        : []

    const updatedOptions = { ...char.crysOptions }
    for (const effectId of massEditSelection.value) {
        const current = updatedOptions[effectId]
        const existing = current?.subCrys?.length === 3 ? current.subCrys : [0, 0, 0]

        const shouldRemove = pickedId !== 0 && existing[targetSlot] === pickedId
        const cleared = existing.map(id => siblingIds.includes(id) ? 0 : id)
        if (!shouldRemove && pickedId !== 0) cleared[targetSlot] = pickedId
        if (pickedId === 0) cleared[targetSlot] = 0

        updatedOptions[effectId] = { ...current, subCrys: cleared }
    }

    store.updateChar({ ...char, crysOptions: updatedOptions })

    massEditSubCrys.value = newSubCrys
}

const onSelectCharacter = async (char?: Character) => {
    if (!char) {
        characterId.value = 0
        clearMassEditSelection()
        await router.replace({ query: {} })
        return
    }
    characterId.value = char.id
    clearMassEditSelection()
    await router.replace({ query: { character_id: char.id } })
}

const setUseIndex = (effectId: number, useIndex: number) => {
    const char = character.value
    if (!char) return
    for (const crys of Object.values(char.crysOptions)) {
        if (crys.useIndex === useIndex) crys.useIndex = 0
    }
    char.crysOptions[effectId].useIndex = useIndex
}
</script>

<style scoped>
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

.toolbar {
    justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
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

.section-title {
    font-size: 1.1rem;
    margin: 0 0 0.75rem;
    color: var(--accent-soft);
}

.page {
    padding: 12px;
}

.bulk-actions {
    align-items: flex-start;
    gap: 8px;
}

.selected-character-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.selected-character-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 50%;
}

.selected-character-name {
    font-weight: 600;
    color: var(--text);
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: none;
    color: var(--muted);
    font-size: 0.7rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.close-btn:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(255, 255, 255, 0.05);
}

.toggle-all-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: inherit;
    font-size: 0.85em;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

.toggle-all-btn:hover {
    border-color: var(--border-strong);
    background: var(--accent-glow);
}

.toggle-all-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.85;
}

.mass-edit-panel {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 220px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid rgba(246, 214, 130, 0.35);
    background: rgba(246, 214, 130, 0.06);
    transition: opacity 0.15s, border-color 0.15s;
}

.mass-edit-panel.disabled {
    opacity: 0.5;
    border-color: rgba(255, 255, 255, 0.10);
    background: rgba(255, 255, 255, 0.02);
}

.mass-edit-panel.disabled :deep(.subcrys-bar) {
    pointer-events: none;
}

.mass-edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.mass-edit-title {
    font-size: 0.8em;
    font-weight: 600;
    letter-spacing: 0.02em;
    opacity: 0.85;
}

.mass-edit-count {
    font-weight: 400;
    opacity: 0.7;
}

.mass-edit-clear {
    background: none;
    border: none;
    color: inherit;
    opacity: 0.6;
    font-size: 0.78em;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
}

.mass-edit-clear:hover {
    opacity: 1;
}

.mass-edit-enable-row {
    display: flex;
    gap: 6px;
}

.mass-edit-enable-btn {
    flex: 1;
    padding: 5px 8px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: inherit;
    font-size: 0.76em;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, opacity 0.15s;
}

.mass-edit-enable-btn:not(:disabled):hover {
    border-color: rgba(246, 214, 130, 0.55);
    background: rgba(246, 214, 130, 0.14);
}

.mass-edit-enable-btn:disabled {
    opacity: 0.4;
    cursor: default;
}

.mass-edit-toggle {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: border-color 0.15s, background 0.15s;
}

.mass-edit-toggle:hover {
    border-color: rgba(246, 214, 130, 0.6);
}

.mass-edit-toggle.checked {
    background: rgba(246, 214, 130, 0.75);
    border-color: rgba(246, 214, 130, 0.95);
}

.check-icon {
    width: 12px;
    height: 12px;
    color: #1c1c24;
}

.crys-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 16px;
}

@media (max-width: 768px) {
    .crys-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .crys-grid {
        grid-template-columns: 1fr;
    }
}

.crys-card {
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 6px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.01);
    transition: border-color 0.15s;

    position: relative;
    display: flex;
    flex-direction: column;
}

.crys-card:not(.disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.45);
}

.crys-card.offElement {
    background: rgba(80, 18, 24, 0.08);
}

.crys-card.offElement:not(.disabled) {
    background: rgba(80, 18, 24, 0.18);
}

.crys-header {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.crys-image {
    width: 64px;
    height: 64px;
    object-fit: contain;
    flex-shrink: 0;
    margin: -5px;
}

.crys-image.disabled {
    opacity: 0.3;
}

.crys-card {
    position: relative;
}

.use-index-selector {
    position: absolute;
    top: 8px;
    right: 8px;

    display: flex;
    flex-direction: column;
    gap: 4px;
}

.use-index-box {
    width: 22px;
    height: 14px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 4px;

    font-size: 0.75em;
    cursor: pointer;
    user-select: none;
}

.use-index-box:hover {
    background: rgba(255, 209, 110, 0.28);
}

.use-index-box.active {
    background: rgba(255, 209, 110, 0.72);
    border-color: rgba(255, 209, 110, 0.95);
    font-weight: 600;
}

.crys-card :deep(.subcrys-bar) {
    margin-top: auto;
    padding-top: 8px;
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

.element-section {
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

.character-crys-row {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.5rem 0.85rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
}

.character-crys-row:last-child {
    border-bottom: none;
}

.character-crys-row:hover {
    background: var(--bg-soft);
}

.character-crys-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 74px;
    flex-shrink: 0;
    text-align: center;
}

.character-icon-lg {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid var(--border);
    object-fit: cover;
}

.character-crys-name {
    font-size: 0.66rem;
    color: var(--muted);
    line-height: 1.15;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.character-crys-body {
    display: flex;
    align-items: center;
    gap: 32px;
    flex: 1;
    min-width: 0;
}

/* Wide screens: everything fits on a single row */
.off-element-grid {
    display: grid;
    grid-template-columns: repeat(24, 24px);
    grid-auto-rows: 24px;
    gap: 3px;
    flex-shrink: 0;
}

.elemental-pocket {
    display: grid;
    grid-template-columns: repeat(6, 24px);
    grid-auto-rows: 24px;
    gap: 3px;
    flex-shrink: 0;
}

.mini-crys {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

/* Medium screens: collapse to 2 rows */
@media (max-width: 1050px) {
    .off-element-grid {
        grid-template-columns: repeat(12, 28px);
        grid-auto-rows: 28px;
    }

    .elemental-pocket {
        grid-template-columns: repeat(3, 28px);
        grid-auto-rows: 28px;
    }

    .mini-crys {
        width: 28px;
        height: 28px;
    }
}

/* Mobile: collapse to 3 rows */
@media (max-width: 700px) {
    .off-element-grid {
        grid-template-columns: repeat(8, 26px);
        grid-auto-rows: 26px;
    }

    .elemental-pocket {
        grid-template-columns: repeat(2, 26px);
        grid-auto-rows: 26px;
    }

    .mini-crys {
        width: 26px;
        height: 26px;
    }
}

@media (max-width: 480px) {
    .off-element-grid {
        grid-template-columns: repeat(4, 26px);
        grid-auto-rows: 26px;
    }

    .elemental-pocket {
        grid-template-columns: repeat(1, 26px);
        grid-auto-rows: 26px;
    }

    .mini-crys {
        width: 26px;
        height: 26px;
    }

    .character-crys-body {
        gap: 16px;
    }
}

.mini-crys-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.28;
    filter: grayscale(0.7);
    transition: opacity 0.15s, filter 0.15s;
}

.mini-crys.owned {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.4);
}

.mini-crys.owned .mini-crys-img {
    opacity: 1;
    filter: none;
}

.mini-crys.elemental.offElement {
    background: rgba(80, 18, 24, 0.1);
    border-color: rgba(80, 18, 24, 0.3);
}

.mini-crys.elemental.offElement.owned {
    background: rgba(80, 18, 24, 0.22);
    border-color: rgba(80, 18, 24, 0.5);
}

.placeholder-icon {
    opacity: 0.2 !important;
}

.empty-state {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--muted);
    opacity: 0.7;
    font-size: 0.9rem;
}

.details {
    padding-right: 20px;
}

.details> :first-child {
    font-size: 0.85em;
}

.details> :last-child {
    white-space: pre-line;
}
</style>
