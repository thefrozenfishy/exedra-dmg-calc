<template>
    <div class="page">
        <h2>Character Crystalis Selections</h2>
        <CharacterSelector :selected="selectedCharacter" @select="onSelectCharacter" :filter="ch => ch.enabled" />

        <div v-if="characterId && character">
            <div class="crys-grid">
                <div v-for="crys in options" :key="crys.selectionAbilityMstId" class="crys-card"
                    :class="{ disabled: !crys.enabled, offElement: offElementalCrys(crys) }">

                    <div v-if="crys.enabled" class="use-index-selector">
                        <div v-for="i in 3" :key="i" class="use-index-box" :class="{ active: crys.useIndex === i }"
                            @click.stop="setUseIndex(crys.selectionAbilityMstId, i)">
                            {{ i }}
                        </div>
                    </div>

                    <div class="crys-header" @click="toggleCrys(crys.selectionAbilityMstId)">
                        <img :src="`/exedra-dmg-calc/selection_ability/${crys.resourceIconName}.png`" :alt="crys.name"
                            class="crys-image" :class="{ disabled: !crys.enabled }" />
                        <span class="crys-name">{{ crys.name }}</span>
                    </div>

                    <div class="subcrys-bar"
                        :ref="el => { if (el) barRefMap[crys.selectionAbilityMstId] = el as HTMLElement }">
                        <div v-for="(subId, idx) in crys.subCrys" :key="idx" class="subcrys-pill"
                            :class="{ filled: subId !== 0 }"
                            @click.stop="openFlyout(crys.selectionAbilityMstId, idx, $event)">
                            <div v-if="subId !== 0" class="pill-label">{{ getSubName(subId) }}</div>
                            <span v-else class="pill-empty">+</span>
                        </div>

                        <Teleport to="body">
                            <div v-if="activeFlyout === crys.selectionAbilityMstId" class="flyout" :style="flyoutStyle"
                                @click.stop>
                                <div class="flyout-scroll">
                                    <div v-for="parent in groupedSubCrys" :key="parent.id" class="flyout-item"
                                        @click.stop="toggleSubCrys(crys.selectionAbilityMstId, crys.subCrys, parent.key, parent.subs)"
                                        @mouseenter="activeSubFlyout = parent.id" @mouseleave="activeSubFlyout = null">
                                        <span class="item-name">{{ parent.name }}</span>
                                        <span class="arrow">›</span>
                                        <div v-if="activeSubFlyout === parent.id" class="sub-flyout">
                                            <div v-for="sub in parent.subs.sort((a, b) => b.rarity - a.rarity)"
                                                :key="sub.selectionAbilityMstId" class="sub-flyout-item"
                                                @click.stop="toggleSubCrys(crys.selectionAbilityMstId, crys.subCrys, sub.selectionAbilityMstId, parent.subs)">
                                                <span>{{ sub.name }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Teleport>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="missing-element-grid">
            <h2>Kioku missing their elemental crys (For crys farming teambuilding)</h2>
            <div>
                <label> <input type="checkbox" v-model="show3stars" /> Include 3-stars </label>
                <label> <input type="checkbox" v-model="show4stars" /> Include 4-stars </label>
            </div>
            <table class="element-table">
                <tbody>
                    <tr v-for="elem in KiokuElement" :key="elem" class="element-row">
                        <td class="element-cell">
                            <div class="element-header">
                                <img :src="`/exedra-dmg-calc/elements/${elem}.png`" class="element-icon" />
                                <span>{{ elem }}</span>
                            </div>
                        </td>

                        <td class="character-list">
                            <template v-if="missingElementCharacters(elem).length">
                                <div v-for="char in missingElementCharacters(elem)" :key="char.id"
                                    class="character-chip" :class="{
                                        limited: char.obtain && char.obtain !== 'Permanent',
                                        'not-perma': !char.obtain || new Date(char.permaDate) > new Date()
                                    }">

                                    <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`"
                                        class="character-icon" :title="char.name" />
                                </div>
                            </template>

                            <div v-else class="empty-text">
                                All covered
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { relevantCrys, getSubCrystalises, elementMap, KiokuElement } from '../types/KiokuTypes'
import CharacterSelector from '../components/CharacterSelector.vue'
import { useCharacterStore } from '../store/characterStore'
import type { Character, CrystalisData } from '../types/KiokuTypes'
import { passiveDetails } from '../utils/helpers'
import { useSetting } from "../store/settingsStore"

const offElementalCrys = (crys: CrystalisData) => {
    const elem = elementMap[passiveDetails[crys.value1 * 100 + 1].element]
    if (elem) return elem !== character.value?.element
    return false
}

const route = useRoute()
const router = useRouter()
const store = useCharacterStore()

const characterId = ref(Number(route.query.character_id) || 0)
const selectedCharacter = ref<Character | undefined>(store.characters.find(c => c.id === characterId.value))
const activeFlyout = ref<number | null>(null)
const flyoutStyle = ref<Record<string, string>>({})
const activeSubFlyout = ref<number | null>(null)
const activeSlotIndex = ref<number | null>(null)
const show4stars = useSetting("show4stars", false);
const show3stars = useSetting("show3stars", false);

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
    }).sort((a, b) => b.rarity - a.rarity || b.sortOrder - a.sortOrder)
})

function getSubName(id: number): string {
    return subCrysFlatList.find(s => s.selectionAbilityMstId === id)?.name ?? '?'
}

const barRefMap = ref<Record<number, HTMLElement>>({})

function missingElementCharacters(elem: KiokuElement) {
    return store.characters.filter(char => {
        if (!char.enabled) return false
        if (char.element !== elem) return false
        if (char.rarity === 3 && !show3stars.value) return false
        if ((char.rarity === 4 || char.name === "Lux☆Magica") && !show4stars.value) return false

        const hasElementalCrys = Object.entries(char.crysOptions).some(([id, crys]) => {
            if (!crys.enabled) return false

            const crysData = relevantCrys(char.id).find(c => c.selectionAbilityMstId === Number(id))
            if (!crysData) return false

            const crysElem = elementMap[passiveDetails[crysData.value1 * 100 + 1].element]

            return crysElem === char.element
        })

        return !hasElementalCrys
    })
}

function openFlyout(effectId: number, slotIndex: number, event: MouseEvent) {
    if (activeFlyout.value === effectId) {
        activeFlyout.value = null
        return
    }
    activeSlotIndex.value = slotIndex
    const bar = barRefMap.value[effectId]
    if (bar) {
        const rect = bar.getBoundingClientRect()
        flyoutStyle.value = {
            position: 'fixed',
            top: `${rect.bottom + 4}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${5 * rect.height}px`,
            zIndex: '9999',
        }
    }
    activeFlyout.value = effectId
}

function toggleSubCrys(effectId: number, currentSubCrys: number[], subId: number, siblingSubs: CrystalisData[]) {
    const char = character.value
    if (!char) return

    const targetSlot = activeSlotIndex.value
    if (targetSlot == null) return

    const shouldRemove = currentSubCrys.indexOf(subId) === targetSlot
    const newSubCrys = [...currentSubCrys].map(c => siblingSubs.map(s => s.selectionAbilityMstId).includes(c) ? 0 : c)
    if (!shouldRemove) newSubCrys[targetSlot] = subId

    store.updateChar({
        ...char,
        crysOptions: {
            ...char.crysOptions,
            [effectId]: { ...char.crysOptions[effectId], subCrys: newSubCrys },
        },
    })
    activeFlyout.value = null
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

const onSelectCharacter = async (char?: Character) => {
    if (!char) {
        selectedCharacter.value = undefined
        characterId.value = 0
        await router.replace({ query: {} })
        return
    }
    characterId.value = char.id
    selectedCharacter.value = char
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

function onOutsideClick(event?: Event) {
    const target = event?.target as HTMLElement | null
    if (target?.closest?.('.flyout') || target?.closest?.('.sub-flyout')) return
    activeFlyout.value = null
}

onMounted(() => {
    document.addEventListener('click', onOutsideClick)
    document.addEventListener('scroll', onOutsideClick, true)
    document.addEventListener('wheel', onOutsideClick, true)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onOutsideClick)
    document.removeEventListener('scroll', onOutsideClick, true)
    document.removeEventListener('wheel', onOutsideClick, true)

})
</script>

<style scoped>
.page {
    padding: 12px;
}

.crys-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 16px;
}

.crys-card {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.15s;
}

.crys-card:not(.disabled) {
    border-color: rgba(255, 255, 255, 0.35);
}

.crys-card.offElement {
    background: rgba(80, 18, 24, 0.08);
    border-color: rgba(120, 40, 50, 0.35);
}

.crys-header {
    display: flex;
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

.crys-name {
    flex: 1;
    font-size: 0.85em;
    padding-right: 20px;
}

.crys-toggle-hint {
    font-size: 1.1em;
    opacity: 0.6;
}

.subcrys-section {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 4px;
    border-left: 2px solid rgba(255, 255, 255, 0.15);
}

.subcrys-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.subcrys-label {
    font-size: 0.72em;
    opacity: 0.5;
}

.subcrys-select {
    width: 100%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    padding: 3px 6px;
    font-size: 0.85em;
}

.subcrys-select option {
    background: #1e1e2e;
    color: #ffffff;
}

.subcrys-desc {
    font-size: 0.72em;
    opacity: 0.5;
    line-height: 1.3;
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
    background: rgba(160, 110, 255, 0.28);
}

.use-index-box.active {
    background: rgba(170, 100, 255, 0.7);
    border-color: rgba(220, 180, 255, 0.9);
    font-weight: 600;
}

.subcrys-bar {
    margin-top: 8px;
    display: flex;
    gap: 5px;
    position: relative;
    flex-direction: column;
}

.subcrys-pill {
    flex: 1;
    height: 28px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    font-size: 11px;
    color: var(--color-text-secondary);
    transition: border-color 0.15s, background 0.15s;
}

.subcrys-pill:hover {
    border-color: rgba(160, 110, 255, 0.5);
    background: rgba(160, 110, 255, 0.1);
}

.subcrys-pill.filled {
    border-color: rgba(160, 110, 255, 0.45);
    background: rgba(120, 80, 220, 0.15);
    color: inherit;
}

.pill-badge {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: rgba(170, 100, 255, 0.7);
    color: #fff;
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.pill-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pill-empty {
    opacity: 0.3;
}

.flyout {
    background: var(--color-bg, #1c1c24);
    border: 0.5px solid rgba(160, 110, 255, 0.4);
    border-radius: 7px;
    overflow: visible;
    position: relative;
}

.flyout-scroll {
    max-height: 220px;
    overflow-y: visible;
    overflow-x: visible;
    position: relative;
}

.flyout-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    gap: 6px;
}

.flyout-item:hover {
    background: rgba(160, 110, 255, 0.12);
}

.flyout-item .item-name {
    flex: 1;
}

.flyout-item .arrow {
    opacity: 0.4;
    font-size: 10px;
}

.flyout-item:hover .arrow {
    opacity: 0.8;
}

.sub-flyout {
    position: absolute;
    left: 100%;
    top: -1px;
    min-width: 160px;
    background: var(--color-bg, #1c1c24);
    border: 0.5px solid rgba(160, 110, 255, 0.4);
    border-radius: 7px;
    z-index: 10000;
    overflow: visible;
}

.sub-flyout-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: pointer;
    gap: 6px;
    width: 240px;
    height: 14px;
}

.sub-flyout-item:hover {
    background: rgba(160, 110, 255, 0.12);
}

.missing-element-grid {
    max-width: 900px;
    margin: 16px auto 0;
}

.element-row {
    display: table-row;
}

.element-table {
    width: 100%;
    border-collapse: collapse;
}

.element-cell {
    width: 110px;
    font-weight: bold;
    background-color: #333;
    font-size: 1rem;
    color: #eee;
    vertical-align: middle;
    box-sizing: border-box;

    border: 1px solid #444;
    padding: 0.5rem;
}

.character-list {
    border: 1px solid #444;
    padding: 0.5rem;

    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 68px;
    align-items: center;
}

.element-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.element-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.character-chip {
    position: relative;
    display: inline-block;
}

.character-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid transparent;
    display: block;
    transition: transform 0.15s ease;
}

.empty-text {
    opacity: 0.45;
    font-size: 0.9rem;
    color: #bbb;
}
</style>
