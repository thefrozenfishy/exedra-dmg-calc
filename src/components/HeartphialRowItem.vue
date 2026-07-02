<template>
  <div class="heartphial-row" :class="{ 'is-maxed': row.isMaxed }">
    <div class="row-styles">
      <div v-for="style in row.styles" :key="style.id" class="style-thumb">
        <img class="orb" :src="`/exedra-dmg-calc/rarity/${style.rarity}.png`" alt="" aria-hidden="true" />
        <a :href="`https://exedra.wiki/wiki/${style.name}`" target="_blank">
          <img :src="`/exedra-dmg-calc/kioku_images/${style.id}_thumbnail.png`" :alt="style.name" :title="style.name"
            class="style-img" :class="{ 'is-unowned': !style.enabled }" />
        </a>
      </div>
    </div>

    <div class="row-info">
      <div class="row-title">
        {{ row.styles[0]?.heartphial }}
        <span v-if="row.segment" class="segment-tag">({{ row.segment }})</span>
      </div>

      <div class="row-progress">
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
        <div class="progress-text">
          <label class="level-input-label">
            Lv.
            <input type="number" class="level-input" :class="{ 'at-max': row.isMaxed }" :min="1" :max="maxLevel"
              :value="row.currentLevel"
              @change="emit('update-level', Math.min(maxLevel, Math.max(1, ($event.target as HTMLInputElement).valueAsNumber)))" />
            / {{ maxLevel }}
          </label>
          &middot;
          {{ formatExp(row.currentExp) }} / {{ formatExp(row.maxExp) }}
          <template v-if="!row.isMaxed">
            ({{ formatExp(row.remainingExp) }} remaining<template
              v-if="playsUntilMaxed !== null && playsUntilMaxed !== undefined">
              &middot; {{ playsUntilMaxed }} {{ playsUntilMaxed === 1 ? 'play' : 'plays' }} &middot; {{ daysUntilMaxed
              }} {{ daysUntilMaxed === 1 ? 'day' : 'days' }}</template>)
          </template>
          <span v-else class="maxed-tag">Maxed</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HeartphialRow } from "../models/HeartphialExp"

const props = defineProps<{
  row: HeartphialRow
  maxLevel: number
  progressPercent: number
  formatExp: (n: number) => string
  playsUntilMaxed?: number | null
}>()

const daysUntilMaxed = computed(() => props.playsUntilMaxed ? Math.ceil(props.playsUntilMaxed / 5) : null)

const emit = defineEmits<{
  (e: 'update-level', level: number): void
}>()
</script>

<style scoped>
.heartphial-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}

.heartphial-row:last-child {
  border-bottom: none;
}

.heartphial-row:hover {
  background: var(--bg-soft);
}

.heartphial-row.is-maxed {
  opacity: 0.42;
}

.orb {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 52px;
  height: 52px;
  object-fit: contain;
  z-index: 1;
  pointer-events: none;
}

.row-styles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 0 0 134px;
  width: 134px;
  align-content: flex-start;
}

.style-thumb {
  position: relative;
}

.style-img {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  display: block;
  transition: opacity 0.15s;
}

.style-img.is-unowned {
  filter: grayscale(95%);
}

.row-info {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.row-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-tag {
  font-weight: 400;
  color: var(--muted);
  font-size: 0.82em;
}

.row-progress {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.progress-bar {
  height: 7px;
  border-radius: 5rem;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5rem;
  background: linear-gradient(90deg, var(--accent-strong), var(--accent));
  transition: width 0.25s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.level-input-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--muted);
}

.level-input {
  width: 46px;
  text-align: center;
  padding: 0.15rem 0.3rem;
  font-size: 0.8rem;
  min-width: unset;
}

.level-input.at-max {
  color: var(--accent);
  border-color: var(--border-strong);
}

.maxed-tag {
  color: var(--accent);
  font-weight: 600;
}
</style>
