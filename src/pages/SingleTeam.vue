<template>
  <div class="team-page">
    <h1>Simulate Single Battle</h1>

    <div class="battle-output">
      <h2>Battle Result</h2>
      <p>{{ formatDmg(battleOutput) }}</p>
    </div>

    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <!-- Header per slot -->
        <h2>{{ index === 0 ? 'Attacker' : 'Member' }} {{ index || "" }}</h2>

        <!-- Main character selector -->
        <CharacterSelector :selected="slot.main" @select="member => team.setMain(index, member)" />

        <!-- Stats -->
        <div v-if="slot.main" class="stats">
          <StatInputs :member="slot.main" :isSupport="false" @update="team.setMain(index, $event)" />
        </div>

        <!-- Portrait -->
        <div v-if="index === 0 && slot.main" class="stats">
          <label>
            Portrait:
            <select :value="slot.main.portrait || ''"
              @change="e => team.setMain(index, { ...slot.main, portrait: e.target.value })">
              <option disabled value="">Select a portrait</option>
              <option value="A Dream of a Little Mermaid">A Dream of a Little Mermaid</option>
              <option value="The Savior's Apostle">The Savior's Apostle</option>
              <option :value="dmg_plus_portrait[slot.main.element]">
                {{ dmg_plus_portrait[slot.main.element] }}
              </option>
            </select>
          </label>
        </div>


        <!-- Only show support selector if main exists -->
        <div v-if="slot.main" class="support-section">
          <h3>Support</h3>
          <CharacterSelector :selected="slot.support" @select="member => team.setSupport(index, member)" />
        </div>

        <!-- Stats -->
        <div v-if="slot.support" class="stats">
          <StatInputs :member="slot.support" :isSupport="true" @update="team.setSupport(index, $event)" />
        </div>
      </div>
    </div>
  </div>

  <!-- Enemy section -->
  <div class="team-page">
    <h1>Enemies</h1>
    <div class="team-grid">
      <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot">
        <h3>{{ enemy.name }}</h3>

        <!-- Enabled toggle for non-targets -->
        <div v-if="enemy.name !== 'Target'" class="toggle-enabled">
          <label>
            <input type="checkbox" v-model="enemy.enabled"
              @change="enemies.updateEnemy(index, { enabled: enemy.enabled })" />
            {{ enemy.enabled ? 'Enabled' : 'Not Enabled' }}
          </label>
        </div>

        <div class="enemy-stats">
          <label>
            Max Break (%):
            <input type="number" v-model.number="enemy.maxBreak" step="50"
              @change="enemies.updateEnemy(index, { maxBreak: enemy.maxBreak })" />
          </label>
          <label>
            Defense:
            <input type="number" v-model.number="enemy.defense" step="50"
              @change="enemies.updateEnemy(index, { defense: enemy.defense })" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/SingleTeamStore'
import CharacterSelector from '../components/CharacterSelector.vue'
import StatInputs from '../components/StatInputs.vue'
import { getKioku, KiokuGeneratorArgs } from '../Kioku'
import { Team } from '../Team'

const dmg_plus_portrait: Record<string, string> = {
  Flame: "A Reluctant Coach Steps Up",
  Aqua: "Futures Felt in Photographs",
  Forest: "Special Stage Persona",
  Light: "High Five for Harmony",
  Dark: "One Time Team-up!",
  Void: "Pride on the Line",
}

const formatDmg = out => typeof (out) !== 'string' ? `Max Damage: ${out[0].toLocaleString()} with a ${out[1] * 100}% crit rate` : battleOutput

const team = useTeamStore()
const enemies = useEnemyStore()

const isFullTeam = computed(() => team.slots.map(slot => slot.main).filter(Boolean).length === 5)
const teamInstance = computed(() => {
  if (!isFullTeam.value) return;
  const dpsElement = team.slots.at(0)?.main?.element
  const transformedMembers = team.slots.map((m, idx) => {
    const support = m.support ? getKioku({ ...m.support, dpsElement }) : null
    return getKioku({ ...m.main, dpsElement, supportKey: support?.getKey(), isDps: idx === 0 } as KiokuGeneratorArgs)
  })
  return new Team(transformedMembers, true)
})
onMounted(() => {
  team.load()
  enemies.load()
})

const battleOutput = computed(() => {
  if (!teamInstance.value) return 'Select 5 characters to calculate'
  const defense = enemies.enemies.filter(e => e.enabled).map(e => e.defense)
  const maxBreak = enemies.enemies.filter(e => e.enabled).map(e => e.maxBreak / 100)
  const targetType = enemies.enemies.filter(e => e.enabled).map(e => e.type)
  return teamInstance.value.calculate_max_dmg(defense, maxBreak, targetType)
})

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
</style>
