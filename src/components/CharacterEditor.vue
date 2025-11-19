<template>
  <CharacterSelector :selected="slot.main" @select="(member: Character) => setMain(index, member)" />

  <div v-if="slot.main" class="stats">
    <StatInputs :member="slot.main" :isSupport="false" @update="setMain(index, $event)" />
  </div>

  <div v-if="extraData" class="stats">
    <div class="stat">
      Spd: {{ round(extraData.spd) }} ({{ extraData.baseSpd }}
      <span style="color: aqua">+ {{ round(extraData.spd - extraData.baseSpd) }}</span>)
    </div>
    <div class="stat">
      Initial AV: {{ round(extraData.secondsLeft) }}
    </div>
    <div class="stat">
      AA needed to act: {{ round(extraData.distanceLeft / 100) }}
    </div>
    <div class="stat">
      AV after move: {{ round(10_000 / extraData.spd) }}
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

.input-with-clear {
  display: flex;
  position: relative;
  align-items: center;
  gap: 2rem;
}
</style>
