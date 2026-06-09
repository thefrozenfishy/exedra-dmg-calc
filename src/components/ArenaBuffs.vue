<template>
  <div class="arena-buffs-section">
    <h4>Stage Buffs <span class="arena-buffs-subtitle">(applied to all units)</span></h4>
    <div v-for="(entry, idx) in arenaEffects" :key="idx" class="arena-buff-row">
      <select :value="entry.type" @change="e => updateArenaEffect(idx, 'type', (e.target as HTMLSelectElement).value)">
        <option v-for="(label, key) in knownBoosts" :key="key" :value="key">
          {{ key }} ({{ label }})
        </option>
      </select>
      <input type="number" :value="entry.value" step="0.1" style="width: 5em;"
        @change="e => updateArenaEffect(idx, 'value', +(e.target as HTMLInputElement).value)" />
      <span class="arena-buff-unit">%</span>
      <button class="arena-buff-remove" @click="removeArenaEffect(idx)">✕</button>
    </div>
    <button class="arena-buff-add" @click="addArenaEffect">+ Add Arena Buff</button>
  </div>
</template>

<script lang="ts" setup>
import { knownBoosts } from '../models/ScoreAttackTeam'
import { useSetting } from '../store/settingsStore'

const arenaEffects = useSetting<{ type: string; value: number }[]>("arenaEffects", [])

function updateArenaEffect(idx: number, field: 'type' | 'value', val: string | number) {
  arenaEffects.value = arenaEffects.value.map((e, i) => i === idx ? { ...e, [field]: val } : e)
}

function addArenaEffect() {
  arenaEffects.value = [...arenaEffects.value, { type: Object.keys(knownBoosts)[0], value: 0 }]
}

function removeArenaEffect(idx: number) {
  arenaEffects.value = arenaEffects.value.toSpliced(idx, 1)
}
</script>

<style scoped>
.arena-buffs-section {
  width: 100%;
  max-width: 600px;
  margin: auto;
}

.arena-buffs-subtitle {
  font-size: 0.75rem;
  opacity: 0.6;
  font-weight: normal;
  margin-left: 0.4rem;
}

.arena-buff-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.arena-buff-row select {
  flex: 1;
  min-width: 0;
}

.arena-buff-unit {
  font-size: 0.85rem;
  opacity: 0.7;
}

.arena-buff-remove {
  background: rgba(200, 60, 60, 0.2);
  border: 1px solid rgba(200, 60, 60, 0.4);
  border-radius: 4px;
  color: var(--danger-soft);
  cursor: pointer;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
}

.arena-buff-remove:hover {
  background: rgba(200, 60, 60, 0.4);
}

.arena-buff-add {
  margin-top: 0.4rem;
  padding: 0.25rem 0.75rem;
  background: rgba(60, 120, 200, 0.2);
  border: 1px solid rgba(60, 120, 200, 0.4);
  border-radius: 4px;
  color: var(--info-soft);
  cursor: pointer;
  font-size: 0.85rem;
}

.arena-buff-add:hover {
  background: rgba(60, 120, 200, 0.4);
}
</style>