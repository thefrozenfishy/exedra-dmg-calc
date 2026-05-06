<template>
  <div class="damage-reduction-inputs">
    <label>
      Buff Bonus Reduction (%):
      <input type="number" v-model.number="buffMultReduction" step="1" />
    </label>

    <div class="input-with-clear">
      <label>
        Off-Element Buff Bonus Reduction (%):
        <input type="number" v-model.number="offElementBuffMultReduction" />
        <button class="clear-button" @click="offElementBuffMultReduction = undefined"
          v-if="offElementBuffMultReduction != null">
          ✖
        </button>
        <div v-else style="padding: 1em; display: inline;"> </div>
      </label>
    </div>

    <label>
      Debuff Bonus Reduction (%):
      <input type="number" v-model.number="debuffMultReduction" step="1" />
    </label>

    <div class="input-with-clear">
      <label>
        Off-Element Debuff Bonus Reduction (%):
        <input type="number" v-model.number="offElementDebuffMultReduction" />
        <button class="clear-button" @click="offElementDebuffMultReduction = undefined"
          v-if="offElementDebuffMultReduction != null">
          ✖
        </button>
        <div v-else style="padding: 1em; display: inline;"> </div>
      </label>
    </div>

    <label>
      Attacker HP when using ultimate (%):
      <input type="number" v-model.number="attackerHealth" step="1" />
    </label>
  </div>
</template>

<script lang="ts" setup>
import { useSetting } from '../store/settingsStore'

const buffMultReduction = useSetting("buffMultReduction", 0)
const offElementBuffMultReduction = useSetting("offElementBuffMultReduction", undefined)
const debuffMultReduction = useSetting("debuffMultReduction", 0)
const offElementDebuffMultReduction = useSetting("offElementDebuffMultReduction", undefined)
const attackerHealth = useSetting("attackerHealth", 100)
</script>

<style scoped>
.damage-reduction-inputs {
  display: contents;
}

.input-with-clear {
  position: relative;
  gap: 2rem;
}

.clear-button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0 0 0 1em;
}
</style>
