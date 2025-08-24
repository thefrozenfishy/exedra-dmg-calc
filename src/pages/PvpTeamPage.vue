<template>
  <div class="team-page">
    <h1>Simulate PvP Action Order</h1>

    <div class="battle-output">
      <h2>Action order</h2>
    </div>

    <div v-for="isAlliedTeam in [0, 1]">
      <h2>{{ isAlliedTeam ? "Enemy" : "Allied" }} Team</h2>
      <div class="team-grid">
        <div v-for="(slot, index) in team.slots[isAlliedTeam]" :key="index" class="team-slot">
          <!-- Header per slot -->
          <h2> Member {{ index + 1 }}</h2>

          <!-- Main character selector -->
          <CharacterSelector :selected="slot.main" @select="member => team.setMain(index, isAlliedTeam, member)" />

          <!-- Stats -->
          <div v-if="slot.main" class="stats">
            <StatInputs :member="slot.main" :isSupport="false" @update="team.setMain(index, isAlliedTeam, $event)" />
          </div>

          <!-- Portrait -->
          <div class="stats">
            <label>
              Portrait:
              <select :value="slot.main?.portrait || ''"
                @change="e => team.setMain(index, isAlliedTeam, { ...slot.main, portrait: e?.target?.value })">
                <option disabled value="">Select a portrait</option>
                <option v-for="portrait in portraits(slot.main?.element)" :value="portrait" :key="portrait">
                  {{ portrait }}
                </option>
              </select>
            </label>
            <label>
              Crystalis:
              <div>
                <select v-for="i in 3" :key="i" :value="slot.main?.crys?.[i - 1] ?? ''"
                  @change="e => onChangeCrys(i, isAlliedTeam, e?.target?.value)">
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
            <CharacterSelector :selected="slot.support"
              @select="member => team.setSupport(index, isAlliedTeam, member)" />
          </div>

          <!-- Stats -->
          <div v-if="slot.support" class="stats">
            <StatInputs :member="slot.support" :isSupport="true"
              @update="team.setSupport(index, isAlliedTeam, $event)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePvPStore } from '../store/singleTeamStore'
import CharacterSelector from '../components/CharacterSelector.vue'
import StatInputs from '../components/StatInputs.vue'
import { getKioku, Kioku } from '../models/Kioku'
import { Team } from '../models/Team'
import { Battle } from '../models/Battle'
import EnemySelector from '../components/EnemySelector.vue'
import { KiokuConstants, KiokuGeneratorArgs, portraits } from '../types/KiokuTypes'

const cryKeys = Object.keys(KiokuConstants.availableCrys)

function onChangeCrys(idx: number, isAlliedTeam: number, rawValue: string) {
  const main = team.slots[isAlliedTeam].main
  if (!main) return
  const current = main?.crys ?? ["", "", ""]
  current[idx - 1] = rawValue as string
  team.setMain(0, isAlliedTeam, { ...main, crys: current } as any)
}

const team = usePvPStore()

const isFullBattle = computed(() => team.slots.map(slot => slot[true].main && slot[false].main).filter(Boolean).length === 5)

const battleInstance = computed(() => {
  if (!isFullBattle.value) return;
  const [alliedTeam, enemyTeam] = [true, false].map(b => team.slots.map((m, idx) => {
    const support = m[b].support ? getKioku(m[b].support) : null
    return getKioku({ ...m[b].main, supportKey: support?.getKey(), isDps: idx === 0 } as KiokuGeneratorArgs)
  }) as Kioku[])
  return new Battle(new Team(alliedTeam), new Team(enemyTeam))
})
onMounted(() => {
  team.load()
  console.log(team.slots)
})

const battleOutput = computed(() => {
  if (!battleInstance.value) return 'Select 5v5 characters to calculate'
  return battleInstance.value.simulateBattle()
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
