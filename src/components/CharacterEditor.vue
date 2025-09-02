<template>
  <!-- Main character selector -->
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <!-- Stats -->
  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="validChar(slot?.main)" class="stats">
    <div class="stat">
      Spd: {{ slot.main.spd }}
    </div>
    <div class="stat">
      Initial AV: {{ slot.main.av }}
    </div>
  </div>

  <!-- Portrait -->
  <div v-if="slot.main" class="stats">
    <label>
      Portrait:
      <select :value="slot.main.portrait || ''"
        @change="e => setMain(index, { ...slot.main, portrait: e?.target?.value })">
        <option disabled value="">Select a portrait</option>
        <option v-for="portrait in getPortraits(slot.main.element)" :value="portrait" :key="portrait">
          {{ portrait }}
        </option>
      </select>
    </label>
    <label>
      Crystalis:
      <div>
        <select v-for="i in 3" :key="i" :value="slot.main.crys?.[i - 1] ?? ''"
          @change="e => onChangeCrys(index, i, e?.target?.value)">
          <option disabled value="">Select a crystalis</option>
          <option v-for="k in getCrystalises(slot.main.element)" :key="k" :value="k">
            {{ k }}
          </option>
        </select>
      </div>
    </label>
    <label>
      SubCrystalis:
      <div>
        <select v-for="i in 9" :key="i" :value="slot.main.crys_sub?.[i - 1] ?? ''"
          @change="e => onChangeSubCrys(index, i, e?.target?.value)">
          <option disabled value="">Select a substat</option>
          <option v-for="k in getSubCrystalises()" :key="k" :value="k">
            {{ k }}
          </option>
        </select>
      </div>
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
import { getCrystalises, getSubCrystalises, getPortraits, Character } from '../types/KiokuTypes'
import CharacterSelector from './CharacterSelector.vue'
import StatInputs from './StatInputs.vue'

const validChar = (m?: Character) => {
  return !!m && "av" in m // Check interface has spd in it (PvPCharacter)
}

defineProps<{
  index: number
  slot: TeamSlot
  setMain: (index: number, member: Character) => void
  setSupport: (index: number, member: Character) => void
  onChangeCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
  onChangeSubCrys: (charIdx: number, crysIdx: number, rawValue: string) => void
}>()
</script>

<style scoped>
.team-page {
  justify-content: center;
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
}

.team-slot {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding-bottom: 1rem;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
}

.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  height: 100%;
}

.stat-inputs label {
  width: 90%;
  display: block;
  margin-left: 0.3rem;
}

.stats select {
  width: 90%;
}
</style>
