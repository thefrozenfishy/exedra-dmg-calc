<template>
    <div class="character-crys-row" :class="{ completed: row.completed }" @click="emit('select', row.char)">
        <div class="character-crys-header">
            <img :src="`/exedra-dmg-calc/kioku_images/${row.char.id}_thumbnail.png`"
                class="character-icon-lg" :title="row.char.name" />
            <span class="crys-count-badge">{{ row.ownedCrysCount }} / {{ row.totalCrysCount }}</span>
            <span class="character-crys-name">{{ row.char.name }}</span>
            <span class="character-crys-name">{{ row.char.character_en }}</span>
        </div>

        <div class="character-crys-body" ref="bodyRef">
            <div class="off-element-grid"
                :style="{ flexGrow: offCols, gridTemplateColumns: `repeat(${offCols}, minmax(0, 1fr))` }">
                <div v-for="c in row.offElementCrys" :key="c.selectionAbilityMstId" class="mini-crys"
                    :class="{ owned: c.enabled }" :title="c.name">
                    <img :src="`/exedra-dmg-calc/selection_ability/${c.resourceIconName}.png`"
                        :alt="c.name" class="mini-crys-img" />
                </div>
            </div>

            <div class="elemental-pocket"
                :style="{ flexGrow: elemCols, gridTemplateColumns: `repeat(${elemCols}, minmax(0, 1fr))` }">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Character, CrystalisData } from '../types/KiokuTypes'
import { KiokuElement } from '../types/enums'

interface ElementalSlot {
    elem: KiokuElement
    crys?: CrystalisData & { enabled: boolean }
    owned: boolean
    isOwnElement: boolean
}

interface CharacterCrysRowData {
    char: Character
    offElementCrys: (CrystalisData & { enabled: boolean })[]
    elementalSlots: ElementalSlot[]
    completed: boolean
    ownedCrysCount: number
    totalCrysCount: number
}

const props = defineProps<{
    row: CharacterCrysRowData
    showOffElementalOnes: boolean
}>()

const emit = defineEmits<{
    select: [char: Character]
}>()

const ROW_BREAKPOINTS = [
    { minWidth: 620, rows: 1 },
    { minWidth: 380, rows: 2 },
    { minWidth: 230, rows: 3 },
    { minWidth: 160, rows: 4 },
    { minWidth: 0, rows: 6 },
]

const bodyRef = ref<HTMLElement | null>(null)
const bodyWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
    if (!bodyRef.value) return
    bodyWidth.value = bodyRef.value.getBoundingClientRect().width
    resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0]
        if (entry) bodyWidth.value = entry.contentRect.width
    })
    resizeObserver.observe(bodyRef.value)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})

const visibleElementalCount = computed(() =>
    props.row.elementalSlots.filter(s => props.showOffElementalOnes || s.isOwnElement).length
)

const rows = computed(() => {
    const tier = ROW_BREAKPOINTS.find(b => bodyWidth.value >= b.minWidth)
    return tier ? tier.rows : 1
})

const offCols = computed(() => Math.max(1, Math.ceil(props.row.offElementCrys.length / rows.value)))
const elemCols = computed(() => Math.max(1, Math.ceil(visibleElementalCount.value / rows.value)))
</script>

<style scoped>
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

.character-crys-row.completed {
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.12), rgba(255, 190, 0, 0.03));
}

.character-crys-row.completed:hover {
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.18), rgba(255, 190, 0, 0.06));
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

.crys-count-badge {
    font-size: 0.6rem;
    color: var(--accent-soft);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.03rem 0.35rem;
    white-space: nowrap;
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

.off-element-grid {
    display: grid;
    gap: 3px;
    flex-basis: 0;
    min-width: 0;
}

.elemental-pocket {
    display: grid;
    gap: 3px;
    flex-basis: 0;
    min-width: 0;
}

.mini-crys {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

@media (max-width: 480px) {
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

.exporting .character-icon-lg {
    width: 24px !important;
    height: 24px !important;
}

.exporting .character-crys-row {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
}

.exporting .off-element-grid,
.exporting .elemental-pocket {
    flex: 0 0 auto !important;
}

.exporting .off-element-grid {
    grid-template-columns: repeat(24, 24px) !important;
    grid-auto-rows: 24px !important;
}

.exporting .elemental-pocket {
    grid-template-columns: repeat(6, 24px) !important;
    grid-auto-rows: 24px !important;
}

.exporting .mini-crys {
    width: 24px !important;
    height: 24px !important;
    aspect-ratio: unset !important;
}

.exporting .character-crys-body {
    gap: 32px !important;
}

.exporting .character-crys-header {
    width: 22px !important;
}

.exporting .character-crys-name {
    display: none !important;
}

.exporting .crys-count-badge {
    display: none !important;
}
</style>
