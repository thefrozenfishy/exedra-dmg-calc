<template>
    <div class="subcrys-bar" ref="barEl">
        <div v-for="(subId, idx) in subCrys" :key="idx" class="subcrys-pill"
            :class="{ rare: isRareSub(subId), uncommon: isUncommonSub(subId) }" @click.stop="openFlyout(idx)">
            <div v-if="subId !== 0" class="pill-label">{{ getSubName(subId) }}</div>
            <span v-else class="pill-empty">+</span>
        </div>

        <Teleport to="body">
            <div v-if="isOpen" ref="flyoutEl" class="flyout" :style="flyoutStyle" @click.stop>
                <div class="flyout-scroll">
                    <div v-for="parent in groupedSubCrys" :key="parent.id" class="flyout-item"
                        @click.stop="toggleSubCrys(parent.key, parent.subs)"
                        @mouseenter="handleSubmenuMouseEnter(parent.id, $event)" @mouseleave="activeSubFlyout = null">
                        <span class="item-name">{{ parent.name }}</span>
                        <span class="arrow">›</span>
                        <div v-if="activeSubFlyout === parent.id" class="sub-flyout" :style="subFlyoutStyle">
                            <div v-for="sub in [...parent.subs].sort((a, b) => b.rarity - a.rarity)"
                                :key="sub.selectionAbilityMstId" class="sub-flyout-item"
                                @click.stop="toggleSubCrys(sub.selectionAbilityMstId, parent.subs)">
                                <span>{{ sub.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { getSubCrystalises, type CrystalisData } from '../types/KiokuTypes'

const subCrysFlatList = getSubCrystalises()

function getSubName(id: number): string {
    return subCrysFlatList.find(s => s.selectionAbilityMstId === id)?.name ?? '?'
}

function isRareSub(id: number): boolean {
    if (id === 0) return false
    const rarity = subCrysFlatList.find(s => s.selectionAbilityMstId === id)?.rarity
    console.log(id, rarity)
    if (rarity == null) return false
    return [9, 10].includes(rarity)
}

function isUncommonSub(id: number): boolean {
    if (id === 0) return false
    const rarity = subCrysFlatList.find(s => s.selectionAbilityMstId === id)?.rarity
    if (rarity == null) return false
    return [6, 7, 8].includes(rarity)
}

export interface GroupedSubCrys {
    id: number
    key: number
    name: string
    subs: CrystalisData[]
}

const props = defineProps<{
    subCrys: number[]
    groupedSubCrys: GroupedSubCrys[]
}>()

const emit = defineEmits<{
    update: [subCrys: number[]]
}>()

const barEl = ref<HTMLElement | null>(null)
const flyoutEl = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const activeSlotIndex = ref<number | null>(null)
const activeSubFlyout = ref<number | null>(null)
const isMainFlipped = ref(false)
const flyoutStyle = ref<Record<string, string>>({})
const subFlyoutStyle = ref<Record<string, string>>({})

async function openFlyout(slotIndex: number) {
    if (isOpen.value) {
        isOpen.value = false
        return
    }
    activeSlotIndex.value = slotIndex
    const bar = barEl.value
    if (!bar) return

    const rect = bar.getBoundingClientRect()

    isOpen.value = true
    flyoutStyle.value = {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${5 * rect.height}px`,
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '9999',
    }

    await nextTick()

    const el = flyoutEl.value
    if (el) {
        const flyoutHeight = el.offsetHeight
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        isMainFlipped.value = spaceBelow < flyoutHeight + 10 && spaceAbove > spaceBelow

        const finalTop = isMainFlipped.value
            ? rect.top - flyoutHeight - 4
            : rect.bottom + 4

        flyoutStyle.value = {
            position: 'fixed',
            top: `${finalTop}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${5 * rect.height}px`,
            opacity: '1',
            pointerEvents: 'auto',
            zIndex: '9999',
        }
    }
}

async function handleSubmenuMouseEnter(parentId: number, event: MouseEvent) {
    activeSubFlyout.value = parentId
    await nextTick()

    const subFlyoutEl = (event.target as HTMLElement).querySelector('.sub-flyout') as HTMLElement
    if (!subFlyoutEl) return

    const rect = subFlyoutEl.getBoundingClientRect()
    const overflowBottom = rect.bottom > window.innerHeight

    if (overflowBottom || isMainFlipped.value) {
        subFlyoutStyle.value = {
            bottom: '-1px',
            top: 'auto'
        }
    } else {
        subFlyoutStyle.value = {
            top: '-1px',
            bottom: 'auto'
        }
    }
}

function toggleSubCrys(subId: number, siblingSubs: CrystalisData[]) {
    const targetSlot = activeSlotIndex.value
    if (targetSlot == null) return

    const siblingIds = siblingSubs.map(s => s.selectionAbilityMstId)
    const shouldRemove = props.subCrys.indexOf(subId) === targetSlot
    const newSubCrys = props.subCrys.map(c => siblingIds.includes(c) ? 0 : c)
    if (!shouldRemove) newSubCrys[targetSlot] = subId

    emit('update', newSubCrys)
    isOpen.value = false
}

function onOutsideClick(event?: Event) {
    const target = event?.target as HTMLElement | null
    if (target?.closest?.('.flyout') || target?.closest?.('.sub-flyout')) return
    isOpen.value = false
}

document.addEventListener('click', onOutsideClick)
document.addEventListener('scroll', onOutsideClick, true)
document.addEventListener('wheel', onOutsideClick, true)

onBeforeUnmount(() => {
    document.removeEventListener('click', onOutsideClick)
    document.removeEventListener('scroll', onOutsideClick, true)
    document.removeEventListener('wheel', onOutsideClick, true)
})
</script>

<style scoped>
.subcrys-bar {
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
    color: inherit;
    transition: border-color 0.15s, background 0.15s;
}

.subcrys-pill:hover {
    border-color: rgba(246, 214, 130, 0.5) !important;
    background: rgba(246, 214, 130, 0.4) !important;
}

.subcrys-pill.rare {
    border-color: rgba(246, 214, 130, 0.45);
    background: rgba(246, 213, 130, 0.3);
}

.subcrys-pill.uncommon {
    border-color: rgba(194, 130, 246, 0.45);
    background: rgba(158, 124, 209, 0.3);
}

.pill-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
}

.pill-empty {
    opacity: 0.3;
}

.flyout {
    background: var(--color-bg, #1c1c24);
    border: 0.5px solid rgba(246, 214, 130, 0.35);
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
    background: rgba(246, 214, 130, 0.12);
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
    border: 0.5px solid rgba(246, 214, 130, 0.35);
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
    background: rgba(246, 214, 130, 0.12);
}
</style>
