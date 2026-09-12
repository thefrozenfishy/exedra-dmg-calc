<template>
  <div class="stat-inputs">
    <div class="stat" v-for="stat in stats" :key="stat.key">
      <label v-if="!(isSupport && stat.hideForSupport)">{{ stat.label }}:
        <input type="number" :min="stat.min" :max="stat.max" :value="member[stat.key]"
          @input="update(stat.key, stat.min, stat.max, $event?.target?.valueAsNumber)" />
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
  { key: 'ascension', label: 'Ascension', min: KiokuConstants.minAscension, max: KiokuConstants.maxAscension, hideForSupport: false },
  { key: 'kiokuLvl', label: 'Kioku Level', min: KiokuConstants.minKiokuLvl, max: KiokuConstants.maxKiokuLvl, hideForSupport: false },
  { key: 'magicLvl', label: 'Magic Level', min: KiokuConstants.minMagicLvl, max: KiokuConstants.maxMagicLvl, hideForSupport: false },
  { key: 'heartphialLvl', label: 'Heartphial Level', min: KiokuConstants.minHeartphialLvl, max: KiokuConstants.maxHeartphialLvl, hideForSupport: false },
  { key: 'specialLvl', label: 'Special Level', min: KiokuConstants.minSpecialLvl, max: KiokuConstants.maxSpecialLvl, hideForSupport: true }
]

function update(key: string, min: number, max: number, value?: number) {
  if (value) {
    if (value < min) {
      value = min
    } else if (value > max) {
      value = max
    }
  }
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
