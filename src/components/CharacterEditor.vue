<template>
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="extraData" class="stats" :title="formatSpdBuffs(extraData.currSpdBuffs)">
    <div class="stat">
      Spd: {{ round(extraData.spd) }} ({{ extraData.baseSpd }}
      <span style="color: aqua">+ {{ round(extraData.spd - extraData.baseSpd) }}</span>)
    </div>
    <div class="stat" title="AV the girl will have at the start of the match">
      Initial AV: {{ round(extraData.secondsLeft) }}
    </div>
    <div class="stat" title="How much AA will be required to bring the girl to 0 AV">
      AA needed to act: {{ round(extraData.distanceLeft / 100) }}
    </div>
    <div class="stat" title="What AV the char will reset to after doing their action given their current spd">
      AV after move: {{ round(10_000 / extraData.spd) }}
    </div>
    <div class="stat" title="Base atk, using for Mabayu targetting and being the main contributor to dmg">
      Base atk: {{ round(extraData.atk) }}
    </div>
  </div>

  <div v-if="slot.main" class="stats">
    <label>
      Portrait:
      <PortraitSelector v-model="slot.main.portrait" :element="slot.main.element" />
    </label>

    <div>
      Crystalis:
      <div class="crys-section">
        <div v-for="slotIndex in 3" :key="slotIndex" class="crys-slot"> <select :value="getSelectedCrys(slotIndex)"
            @change="setCrys(slotIndex, Number(($event.target as HTMLSelectElement).value))">

            <option :value="0"></option>

            <option v-for="crys in crysOptions(slotIndex)" :key="crys.selectionAbilityMstId"
              :value="crys.selectionAbilityMstId">
              {{ crys.name }}
            </option>
          </select>
          <div v-if="getSelectedCrys(slotIndex)" class="subcrys-section"
            :ref="el => { if (el) barRefMap[slotIndex] = el as HTMLElement }">
            <div v-for="(sub, subIndex) in getSubCrys(slotIndex)" :key="subIndex" class="subcrys-pill"
              :class="{ filled: sub !== 0 }" @click.stop="openFlyout(slotIndex, subIndex, $event)">
              <div v-if="sub !== 0" class="pill-label">{{ getSubName(sub) }}</div>
              <span v-else class="pill-empty">+</span>
            </div>

            <Teleport to="body">
              <div v-if="activeFlyout === slotIndex" class="ce-flyout" :style="flyoutStyle" @click.stop>
                <div class="ce-flyout-scroll">
                  <div v-for="parent in groupedSubCrys" :key="parent.id" class="ce-flyout-item"
                    @click.stop="toggleSubCrys(slotIndex, subIndex => getSubCrys(slotIndex)[subIndex], parent.key, parent.subs)"
                    @mouseenter="handleSubmenuMouseEnter(parent.id, $event)" @mouseleave="activeSubFlyout = null">
                    <span class="item-name">{{ parent.name }}</span>
                    <span class="arrow">›</span>
                    <div v-if="activeSubFlyout === parent.id" class="ce-sub-flyout" :style="subFlyoutStyle">
                      <div v-for="sub in parent.subs.sort((a, b) => b.rarity - a.rarity)"
                        :key="sub.selectionAbilityMstId" class="ce-sub-flyout-item"
                        @click.stop="toggleSubCrys(slotIndex, subIndex => getSubCrys(slotIndex)[subIndex], sub.selectionAbilityMstId, parent.subs)">
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

  </div>
  <div v-if="!extraData">
    <h3>Effect Overrides</h3>
    <div class="team-page">
      <div key="buffMultReduction">
        <label>Buff Bonus Reduction (%):
          <div class="input-with-clear">
            <input type="number" v-model.number="slot.buffMultReduction" @change="applyBuff" />
            <button class="clear-btn" @click="clearBuff" v-if="slot.buffMultReduction != null">✖</button>
          </div>
        </label>
      </div>
      <div key="buffMultReduction">
        <label>Debuff Bonus Reduction (%):
          <div class="input-with-clear">
            <input type="number" v-model.number="slot.debuffMultReduction" @change="applyDebuff" />
            <button class="clear-btn" @click="clearDebuff" v-if="slot.debuffMultReduction != null">✖</button>
          </div>
        </label>
      </div>
    </div>
  </div>

  <div v-if="slot.main" class="support-section">
    <h3>Support</h3>
    <CharacterSelector :selected="slot.support" :main="slot.main"
      @select="(member: Character) => setSupport(index, member)" />
  </div>

  <div v-if="slot.support" class="stats">
    <StatInputs :member="slot.support" :isSupport="true" @update="setSupport(index, $event)" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { TeamSlot } from '../types/BestTeamTypes';
import CharacterSelector from './CharacterSelector.vue'
import PortraitSelector from './PortraitSelector.vue';
import { crystalises } from '../utils/helpers';
import StatInputs from './StatInputs.vue'
import { Character, TeamSnapshot } from '../types/KiokuTypes';
import { getSubCrystalises, type CrystalisData } from '../types/KiokuTypes'

const round = (spd: number) => spd.toFixed(2)

const formatSpdBuffs = (buffs: [number, string, string?][]) => buffs.map(buff => `${round(buff[0])} given by "${buff[1]}" applied by ${buff[2] ?? "UNKNOWN"}`).join("\n")
const subCrysFlatList = getSubCrystalises()

const activeFlyout = ref<number | null>(null)
const activeSubFlyout = ref<number | null>(null)
const activeSlotIndex = ref<number | null>(null)
const flyoutStyle = ref<Record<string, string>>({})
const subFlyoutStyle = ref<Record<string, string>>({})
const isMainFlipped = ref(false)
const barRefMap = ref<Record<number, HTMLElement>>({})

const groupedSubCrys = computed(() => {
  const groups: Record<string, { id: number; key: number; name: string; subs: typeof subCrysFlatList }> = {}
  for (const s of subCrysFlatList) {
    const key = s.selectionAbilityEffectId
    if (!groups[key]) groups[key] = { id: key, key: 0, name: '', subs: [] }
    groups[key].subs.push(s)
    if (s.rarity === 10) {
      groups[key].name = s.description
      groups[key].key = s.selectionAbilityMstId
    }
  }
  return Object.values(groups)
})

function getSubName(id: number): string {
  return subCrysFlatList.find(s => s.selectionAbilityMstId === id)?.name ?? '?'
}

async function openFlyout(slotIndex: number, subIndex: number, event: MouseEvent) {
  if (activeFlyout.value === slotIndex) {
    activeFlyout.value = null
    return
  }
  activeSlotIndex.value = subIndex
  const bar = barRefMap.value[slotIndex]
  if (!bar) return

  const rect = bar.getBoundingClientRect()
  activeFlyout.value = slotIndex
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

  const flyoutEl = document.querySelector('.ce-flyout') as HTMLElement
  if (flyoutEl) {
    const flyoutHeight = flyoutEl.offsetHeight
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    isMainFlipped.value = spaceBelow < flyoutHeight + 10 && spaceAbove > spaceBelow
    const finalTop = isMainFlipped.value ? rect.top - flyoutHeight - 4 : rect.bottom + 4

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

  const subFlyoutEl = (event.target as HTMLElement).querySelector('.ce-sub-flyout') as HTMLElement
  if (!subFlyoutEl) return

  const rect = subFlyoutEl.getBoundingClientRect()
  const overflowBottom = rect.bottom > window.innerHeight

  if (overflowBottom || isMainFlipped.value) {
    subFlyoutStyle.value = { bottom: '-1px', top: 'auto' }
  } else {
    subFlyoutStyle.value = { top: '-1px', bottom: 'auto' }
  }
}

function toggleSubCrys(slotIndex: number, _getSubAtIndex: (i: number) => number, subId: number, siblingSubs: CrystalisData[]) {
  const targetSlot = activeSlotIndex.value
  if (targetSlot == null) return

  const crys = getSelectedCrysData(slotIndex)
  if (!crys) return

  const currentSubCrys = crys.subCrys
  const siblingIds = siblingSubs.map(s => s.selectionAbilityMstId)
  const shouldRemove = currentSubCrys.indexOf(subId) === targetSlot
  const newSubCrys = currentSubCrys.map(c => siblingIds.includes(c) ? 0 : c)
  if (!shouldRemove) newSubCrys[targetSlot] = subId

  crys.subCrys = newSubCrys
  activeFlyout.value = null
}

function onOutsideClick(event?: Event) {
  const target = event?.target as HTMLElement | null
  if (target?.closest?.('.ce-flyout') || target?.closest?.('.ce-sub-flyout')) return
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

const props = defineProps<{
  index: number
  slot: TeamSlot
  extraData?: TeamSnapshot
  setMain: (index: number, member: Character) => void
  setSupport: (index: number, member: Character) => void
}>()

function applyBuff() {
  props.slot.buffMultReduction = Number(props.slot.buffMultReduction ?? 0)
}

function applyDebuff() {
  props.slot.debuffMultReduction = Number(props.slot.debuffMultReduction ?? 0)
}

function clearBuff() {
  props.slot.buffMultReduction = undefined
}

function clearDebuff() {
  props.slot.debuffMultReduction = undefined
}
function getSelectedCrys(slotIndex: number) {
  if (!props.slot.main) {
    return 0
  }

  const entry = Object.entries(props.slot.main.crysOptions)
    .find(([, c]) => c.useIndex === slotIndex)

  return entry ? Number(entry[0]) : 0
}

function crysOptions(slotIndex: number) {
  if (!props.slot.main) {
    return []
  }

  return Object.entries(props.slot.main.crysOptions)
    .filter(([_, crys]) => crys.useIndex === 0 || crys.useIndex === slotIndex)
    .map(([id]) => crystalises[Number(id)])
    .map((crys) => ({
      ...crys,
      name: crys.styleMstId ? "EX" : crys.name
    }))
    .sort((a, b) => {
      const sDiff = b.styleMstId - a.styleMstId

      if (sDiff) {
        return sDiff
      }

      return b.sortOrder - a.sortOrder
    })
}

function setCrys(slotIndex: number, newId: number) {
  if (!props.slot.main) {
    return
  }

  Object.values(props.slot.main.crysOptions).forEach(c => {
    if (c.useIndex === slotIndex) {
      c.useIndex = 0
    }
  })

  if (newId === 0) {
    return
  }

  Object.values(props.slot.main.crysOptions).forEach(c => {
    if (c.useIndex !== slotIndex && c.useIndex !== 0) {
      const id = Object.entries(props.slot.main!.crysOptions)
        .find(([, v]) => v === c)?.[0]

      if (Number(id) === newId) {
        c.useIndex = 0
      }
    }
  })

  props.slot.main.crysOptions[newId].useIndex = slotIndex
}

function getSelectedCrysData(slotIndex: number) {
  if (!props.slot.main) {
    return undefined
  }

  const crysId = getSelectedCrys(slotIndex)

  if (!crysId) {
    return undefined
  }

  return props.slot.main.crysOptions[crysId]
}

function getSubCrys(slotIndex: number): number[] {
  const crys = getSelectedCrysData(slotIndex)

  if (!crys) {
    return []
  }

  if (!crys.subCrys || crys.subCrys.length !== 3) {
    crys.subCrys = [4034, 4044, 4054]
  }

  return crys.subCrys
}
</script>

<style scoped>
.crys-section {
  width: 100%;
}

.crys-slot {
  width: 100%;
  display: block;
}

.stats select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
}

.stats select {
  width: 90%;
}

.input-with-clear {
  display: flex;
  position: relative;
  align-items: center;
  gap: 2rem;
}

.subcrys-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding-left: 0.5rem;
  position: relative;
}

.subcrys-pill {
  flex: 1;
  height: 26px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
  color: var(--color-text-secondary, #aaa);
  transition: border-color 0.15s, background 0.15s;
  padding: 0 6px;
}

.subcrys-pill:hover {
  border-color: rgba(160, 110, 255, 0.5);
  background: rgba(160, 110, 255, 0.1);
}

.subcrys-pill.filled {
  color: inherit;
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

.ce-flyout {
  background: var(--color-bg, #1c1c24);
  border: 0.5px solid rgba(160, 110, 255, 0.4);
  border-radius: 7px;
  overflow: visible;
  position: relative;
}

.ce-flyout-scroll {
  max-height: 220px;
  overflow-y: visible;
  overflow-x: visible;
  position: relative;
}

.ce-flyout-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  gap: 6px;
}

.ce-flyout-item:hover {
  background: rgba(160, 110, 255, 0.12);
}

.ce-flyout-item .item-name {
  flex: 1;
}

.ce-flyout-item .arrow {
  opacity: 0.4;
  font-size: 10px;
}

.ce-flyout-item:hover .arrow {
  opacity: 0.8;
}

.ce-sub-flyout {
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

.ce-sub-flyout-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  gap: 6px;
  width: 240px;
  height: 14px;
}

.ce-sub-flyout-item:hover {
  background: rgba(160, 110, 255, 0.12);
}
</style>
