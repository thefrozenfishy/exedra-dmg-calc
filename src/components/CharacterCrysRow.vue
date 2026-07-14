<template>
    <div class="character-crys-row" :class="{ completed: row.completed }" @click="emit('select', row.char)">
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
</template>

<script setup lang="ts">
import type { Character, CrystalisData, KiokuElement } from '../types/KiokuTypes'

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

defineProps<{
    row: CharacterCrysRowData
    showOffElementalOnes: boolean
}>()

const emit = defineEmits<{
    select: [char: Character]
}>()
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

.exporting .character-icon-lg {
    width: 24px !important;
    height: 24px !important;
}

.exporting .character-crys-row {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
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
</style>
