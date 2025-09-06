<template>
  <!-- Main character selector -->
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <!-- Stats -->
  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="validChar(slot?.main)" class="stats">
    <div class="stat">
      Spd: {{ round(slot.main.spd) }} ({{ slot.main.baseSpd }} <span style="color: blue">+ {{ round(slot.main.spd - slot.main.baseSpd) }}</span>)
    </div>
    <div class="stat">
      AV after move: {{ round(10000 / slot.main.spd) }}
    </div>
    <div class="stat">
      Initial AV: {{ round(slot.main.distance) }}
    </div>
  </div>

  <div v-if="slot.main" class="stats">
    <label>
      Portrait:
      <PortraitSelector v-model="slot.main.portrait" :element="slot.main.element" />
    </label>

    <label>
      Crystalis:
      <CrystalisSelector v-model="slot.main.crys" :element="slot.main.element" :styleId="slot.main.id" />
    </label>

    <label>
      Subcrystalis:
      <SubCrystalisSelector v-model="slot.main.crys_sub" />
    </label>
  </div>

  <!-- Only show support selector if main exists -->
  <div v-if="slot.main" class="support-section">
    <h3>Support</h3>
    <CharacterSelector :selected="slot.support" @select="(member: Character) => setSupport(index, member)" />
  </div>

  <!-- Stats -->
  <div v-if="slot.support" class="stats">
    <StatInputs :member="slot.support" :isSupport="true" @update="setSupport(index, $event)" />
  </div>
</template>

<script setup lang="ts">
import { TeamSlot } from '../types/BestTeamTypes';
import CharacterSelector from './CharacterSelector.vue'
import PortraitSelector from './PortraitSelector.vue';
import CrystalisSelector from './CrystalisSelector.vue';
import SubCrystalisSelector from './SubCrystalisSelector.vue';
import StatInputs from './StatInputs.vue'
import { Character, PvPCharacter } from '../types/KiokuTypes';

const round = (spd: number) => spd.toFixed(2)

const validChar = (m?: PvPCharacter | Character) => {
  return !!m && "spd" in m // Check interface has spd in it (PvPCharacter)
}

const props = defineProps<{
  index: number
  slot: TeamSlot
  setMain: (index: number, member: PvPCharacter | Character) => void
  setSupport: (index: number, member: PvPCharacter | Character) => void
  onChangeCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
  onChangeSubCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
}>()


</script>

<style scoped>
.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
}

.stats select {
  width: 90%;
}

</style>
