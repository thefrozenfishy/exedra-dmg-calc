<template>
  <div class="aliment-toggles">
    <slot name="heading">
      <h3>Active aliments</h3>
    </slot>
    <div class="aliment-grid">
      <div v-for="aliment in aliments" :key="aliment.name" class="aliment" :class="{ disabled: !aliment.enabled }"
        @click="aliment.enabled = !aliment.enabled">
        <img :src="`/exedra-dmg-calc/aliments/${aliment.display}.png`" :alt="aliment.display"
          :title="aliment.display" />
        <span>{{ aliment.display }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useSetting } from '../store/settingsStore'
import { Aliment } from '../types/enums';

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1).toLowerCase()

const aliments = reactive([
  { name: Aliment.BURN, display: capitalize(Aliment.BURN), enabled: useSetting("burn-enabled", true) },
  { name: Aliment.WEAKNESS, display: capitalize(Aliment.WEAKNESS), enabled: useSetting("weakness-enabled", true) },
  { name: Aliment.POISON, display: capitalize(Aliment.POISON), enabled: useSetting("poison-enabled", true) },
  { name: Aliment.STUN, display: capitalize(Aliment.STUN), enabled: useSetting("stun-enabled", true) },
  { name: Aliment.CURSE, display: capitalize(Aliment.CURSE), enabled: useSetting("curse-enabled", true) },
  { name: Aliment.WOUND, display: capitalize(Aliment.WOUND), enabled: useSetting("wound-enabled", true) },
  { name: Aliment.VORTEX, display: capitalize(Aliment.VORTEX), enabled: useSetting("vortex-enabled", true) },
])

defineExpose({ aliments })
</script>

<style scoped>
.aliment-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.aliment {
  cursor: pointer;
  text-align: center;
  transition: opacity 0.2s;
}

.aliment img {
  width: 30px;
  height: 30px;
  display: block;
  margin: 0 auto;
}

.aliment.disabled {
  opacity: 0.3;
}
</style>
