<template>
  <div class="stat-inputs">
    <div class="stat" v-for="stat in stats" :key="stat.key">
      <label v-if="!(isSupport && stat.hideForSupport)">{{ stat.label }}:
        <input
          type="number"
          :min="stat.min"
          :max="stat.max"
          :value="member[stat.key]"
          @input="update(stat.key, $event?.target?.valueAsNumber)"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Character, KiokuConstants } from '../types/KiokuTypes';

const props = defineProps<{
  member: Character,
  isSupport: boolean
}>()

const emit = defineEmits<{
  (e: 'update', member: typeof props.member): void
}>()

const stats = [
  { key: 'ascension', label: 'Ascension', min: 0, max: KiokuConstants.maxAscension, hideForSupport: false },
  { key: 'kiokuLvl', label: 'Kioku Level', min: 1, max: KiokuConstants.maxKiokuLvl, hideForSupport: false },
  { key: 'magicLvl', label: 'Magic Level', min: 0, max: KiokuConstants.maxMagicLvl, hideForSupport: false },
  { key: 'heartphialLvl', label: 'Heartphial Level', min: 1, max: KiokuConstants.maxHeartphialLvl, hideForSupport: false },
  { key: 'specialLvl', label: 'Special Level', min: 1, max: KiokuConstants.maxSpecialLvl, hideForSupport: true }
]

function update(key: string, value?: number) {
  const updated = { ...props.member, [key]: value }
  emit('update', updated)
}
</script>

<style scoped>
.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat input {
  width: 50px;
  margin-left: 0.3rem;
}
</style>
