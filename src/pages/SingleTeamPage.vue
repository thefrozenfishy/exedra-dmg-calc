<template>
  <div class="team-page">
    <h1>Simulate Single Battle</h1>

    <div class="battle-output">
      <h2>Battle Result</h2>
      <h3>{{ formatDmg(battleOutput) }}</h3>
    </div>

    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <!-- Header per slot -->
        <h2>{{ index === attackerIndex ? 'Attacker' : 'Member' }}
          {{ index < attackerIndex ? index + 1 : index > attackerIndex ? index : "" }}</h2>

        <!-- Main character selector -->
        <CharacterSelector :selected="slot.main" @select="member => team.setMain(index, member)" />

        <!-- Stats -->
        <div v-if="slot.main" class="stats">
          <StatInputs :member="slot.main" :isSupport="false" @update="team.setMain(index, $event)" />
        </div>

        <!-- Portrait -->
        <div v-if="index === attackerIndex && slot.main" class="stats">
          <label>
            Portrait:
            <select :value="slot.main.portrait || ''"
              @change="e => team.setMain(index, { ...slot.main, portrait: e?.target?.value })">
              <option disabled value="">Select a portrait</option>
              <option v-for="portrait in portraits(slot.main.element)" :value="portrait" :key="portrait">
                {{ portrait }}
              </option>
            </select>
          </label>
          <label>
            Crystalis:
            <div>
              <select v-for="i in 3" :key="i" :value="slot.main.crys?.[i - 1] ?? ''"
                @change="e => onChangeCrys(i, e?.target?.value)">
                <option value="">None</option>
                <option v-for="k in cryKeys" :key="k" :value="KiokuConstants.availableCrys[k]">
                  {{ k }}
                </option>
              </select>
            </div>
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

  <EnemySelector />

  <!-- Debug section TODO: Hide this by default? -->
  <div class="team-page">
    <h1>Debug info</h1>
    <div class="team-grid">
      <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot">
        <pre style="text-align: left; padding: 0 2rem;">{{ formatDebug(battleOutput, index) }}</pre>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/singleTeamStore'
import CharacterSelector from '../components/CharacterSelector.vue'
import StatInputs from '../components/StatInputs.vue'
import { getKioku, Kioku } from '../models/Kioku'
import { Team } from '../models/Team'
import EnemySelector from '../components/EnemySelector.vue'
import { KiokuConstants, KiokuGeneratorArgs, portraits } from '../types/KiokuTypes'
import { toast } from "vue3-toastify"

const attackerIndex = 2

const cryKeys = Object.keys(KiokuConstants.availableCrys)

function onChangeCrys(idx: number, rawValue: string) {
  const main = team.slots[attackerIndex].main
  if (!main) return
  const current = main.crys ?? ["", "", ""]
  current[idx - 1] = rawValue as string
  team.setMain(attackerIndex, { ...main, crys: current } as any)
}

const formatDmg = (out: string | (number | string[])[]) => typeof (out) !== 'string' ? `Max Damage: ${out[0].toLocaleString()} with a ${out[1]}% crit rate` : battleOutput
const formatDebug = (out: string | (number | string[])[], idx: number) => Array.isArray(out) ? out[2][idx] : battleOutput


const team = useTeamStore()
const enemies = useEnemyStore()

const isFullTeam = computed(() => team.slots.map(slot => slot.main).filter(Boolean).length === 5)
const teamInstance = computed(() => {
  if (!isFullTeam.value) return;
  const dpsElement = team.slots[attackerIndex]?.main?.element!
  try {
    const transformedMembers = team.slots.map((m, idx) => {
      const support = m.support ? getKioku({ ...m.support, dpsElement }) : null
      return getKioku({ ...m.main, dpsElement, supportKey: support?.getKey(), isDps: idx === attackerIndex } as KiokuGeneratorArgs)
    }) as Kioku[]
    return new Team(transformedMembers, true)
  } catch (err) {
    toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    console.error(err)
  }
})
onMounted(() => {
  team.load()
  enemies.load()
})

const battleOutput = computed(() => {
  if (!teamInstance.value) return 'Select 5 characters to calculate'
  return teamInstance.value.calculate_max_dmg(enemies.enemies, 0)
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
</style>
