<template>
  <div class="rng-controls">
    <div class="rng-row">
      <SegmentedToggle :model-value="mode" :options="RNG_MODE_OPTIONS" label="RNG"
        @update:model-value="emit('update:mode', $event)" />
      <template v-if="mode === 'seed'">
        <label class="seed-field" title="Every random roll comes from this seed: same teams + seed = same battle">
          <span class="field-label">Seed</span>
          <input class="seed-input" type="number" min="0" :max="2 ** 32 - 1" :value="seed ?? ''"
            @change="onSeed(($event.target as HTMLInputElement).value)" />
        </label>
        <button type="button" class="btn" :disabled="disabled" title="Pick a new random seed and run"
          @click="emit('update:seed', Math.floor(Math.random() * 2 ** 32))">New seed</button>
      </template>
      <button v-if="mode === 'manual' && changed > 0" type="button" class="btn" :disabled="disabled"
        title="Put every roll back to its default (hits at 50% or more)" @click="emit('reset')">
        Reset {{ changed }} changed roll{{ changed === 1 ? '' : 's' }}</button>
    </div>
    <p class="rng-hint">{{ RNG_MODE_OPTIONS.find(o => o.value === mode)?.title }}</p>
  </div>
</template>

<script setup lang="ts">
import SegmentedToggle from './SegmentedToggle.vue'
import type { RngMode } from '../models/BattleRng'

withDefaults(defineProps<{ mode: RngMode, seed?: number, changed?: number, disabled?: boolean }>(), { changed: 0 })
const emit = defineEmits<{ 'update:mode': [RngMode], 'update:seed': [number], reset: [] }>()

const RNG_MODE_OPTIONS = [
  { value: 'hit', label: 'All 100%', title: 'Every random roll succeeds: every crit lands, every buff/debuff with a chance applies. Rolls that are really 0% still fail. Choices between several options (targets, enemy skills) take the most likely one.' },
  { value: 'miss', label: 'All 0%', title: 'Every random roll fails: no crits, no chance-based buff/debuff lands. Rolls that are really 100% still succeed. Choices between several options (targets, enemy skills) take the most likely one.' },
  { value: 'weighted', label: 'Weighted', title: 'Every roll with a 50% or higher chance happens, every roll below 50% doesn\'t. Choices between several options (targets, enemy skills) take the most likely one.' },
  { value: 'seed', label: 'Seed', title: 'Rolls come from a seeded random generator: the same teams and seed always give the same battle.' },
  { value: 'manual', label: 'Manual', title: 'You decide every roll: each action lists its rolls with the in-game chance. By default a roll hits at 50% or more; tick or untick to change it, pick another option for choices. The battle re-runs from the start.' },
] as const

function onSeed(v: string) {
  const n = Math.floor(Number(v))
  if (Number.isFinite(n) && n >= 0) emit('update:seed', n % 2 ** 32)
}
</script>

<style scoped>
.rng-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.rng-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}

.seed-field {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.8rem;
  color: var(--muted);
}

.seed-input {
  width: 8.5rem;
  font-variant-numeric: tabular-nums;
}

.rng-hint {
  margin: 0;
  max-width: 640px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}
</style>
