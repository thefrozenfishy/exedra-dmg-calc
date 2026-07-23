<template>
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="extraData" class="stats helper" :title="formatSpdBuffs(extraData.currSpdBuffs)">
    <div class="stat">
      Spd: {{ round(extraData.spd) }} ({{ extraData.baseSpd }}
      <span style="color: aqua">+ {{ round(extraData.spd - extraData.baseSpd) }}</span>)
    </div>
    <div v-if="extraData.secondsLeft > 0.001 || extraData.secondsLeft === 0" class="stat"
      title="AV the girl will have at the start of the match">
      Initial AV: {{ round(extraData.secondsLeft) }}
    </div>
    <div class="not-zero-but-zero" v-else
      title="Due to floating point precision error this will lose the 0 AV race, reorder your speed buffs!">
      Initial AV: Barely not 0!</div>
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
        <div v-for="slotIndex in 3" :key="slotIndex" class="crys-slot">
          <CrysSelector :character-id="slot.main.id" :model-value="getSelectedCrys(slotIndex)" placeholder="—"
            @update:model-value="id => setCrys(slotIndex, id)" include-low-rarity :character-element="slot.main.element" />
          <SubCrysBar v-if="getSelectedCrys(slotIndex)" :sub-crys="getSubCrys(slotIndex)"
            :grouped-sub-crys="groupedSubCrys" @update="newSubCrys => updateSubCrys(slotIndex, newSubCrys)" />
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
import { computed } from 'vue'
import { TeamSlot } from '../types/BestTeamTypes';
import CharacterSelector from './CharacterSelector.vue'
import PortraitSelector from './PortraitSelector.vue';
import SubCrysBar from './SubCrysBar.vue'
import CrysSelector from './CrysSelector.vue'
import StatInputs from './StatInputs.vue'
import { Character, TeamSnapshot, getSubCrystalises } from '../types/KiokuTypes'

const round = (spd: number) => spd.toFixed(2)

const formatSpdBuffs = (buffs: [number, string, string?][]) => buffs.map(buff => `${round(buff[0])} given by "${buff[1]}" applied by ${buff[2] ?? "UNKNOWN"}`).join("\n")
const subCrysFlatList = getSubCrystalises()

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

function updateSubCrys(slotIndex: number, newSubCrys: number[]) {
  const crys = getSelectedCrysData(slotIndex)
  if (!crys) return

  crys.subCrys = newSubCrys
}

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
.not-zero-but-zero {
  color: var(--accent-soft);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.crys-section {
  width: 100%;
}

.crys-slot {
  width: 100%;
  display: block;
}

.helper {
  cursor: help;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
}

.input-with-clear {
  display: flex;
  position: relative;
  align-items: center;
  gap: 2rem;
}

.crys-slot :deep(.subcrys-bar) {
  margin-top: 4px;
  padding-left: 0.5rem;
}

.crys-slot :deep(.subcrys-pill) {
  height: 26px;
  padding: 0 6px;
}
</style>
