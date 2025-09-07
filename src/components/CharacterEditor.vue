<template>
  <!-- Main character selector -->
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <!-- Stats -->
  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="extraData" class="stats">
    <div class="stat">
      Spd: {{ round(extraData.spd) }} ({{ extraData.baseSpd }}
      <span style="color: blue">+ {{ round(extraData.spd - extraData.baseSpd) }}</span>)
    </div>
    <div class="stat">
      AV after move: {{ round(10_000 / extraData.spd) }}
    </div>
    <div class="stat">
      Initial AV: {{ round(extraData.secondsLeft) }}
    </div>
    <div class="stat">
      Base atk: {{ round(extraData.atk) }}
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
import { Character, TeamSnapshot } from '../types/KiokuTypes';

const round = (spd: number) => spd.toFixed(2)

const props = defineProps<{
  index: number
  slot: TeamSlot
  extraData?: TeamSnapshot
  setMain: (index: number, member: Character) => void
  setSupport: (index: number, member: Character) => void
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
