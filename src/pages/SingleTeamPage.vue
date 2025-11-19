<template>
  <div class="team-page">
    <h1>Simulate Single Battle</h1>

    <div class="battle-output">
      <h2>Battle Result</h2>
      <h3>{{ formatDmg(battleOutput) }}</h3>
    </div>

    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <h2>{{ index === attackerIndex ? 'Damage Dealer' : 'Member' }}
          {{ index < attackerIndex ? index + 1 : index > attackerIndex ? index : "" }}</h2>

        <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain" :setSupport="team.setSupport"
          :onChangeCrys="onChangeCrys" :onChangeSubCrys="onChangeSubCrys" />
      </div>
    </div>
  </div>

  <EnemySelector />

  <div class="team-page">
    <h2>Extra settings</h2>
    <div key="buffMultReduction">
      <label>Buff Bonus Reduction (%):
        <input type="number" v-model.number="buffMultReduction" step="1" />
      </label>
    </div>
    <div key="buffMultReduction">
      <label>Debuff Bonus Reduction (%):
        <input type="number" v-model.number="debuffMultReduction" step="1" />
      </label>
    </div>
    <div key="attackerHealth">
      <label>Attacker HP when using ultimate (%):
        <input type="number" v-model.number="attackerHealth" step="1" />
      </label>
    </div>
    <div class="weak-elements">
      <h4>Active aliments</h4>
      <div class="aliment-grid">
        <div v-for="aliment in aliments" :key="aliment.name" class="aliment" :class="{ disabled: !aliment.enabled }"
          @click="aliment.enabled = !aliment.enabled">
          <img :src="`/exedra-dmg-calc/aliments/${aliment.display}.png`" :alt="aliment.display"
            :title="aliment.display" />
          <span>{{ aliment.display }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="team-page">
    <h1>Debug info</h1>
    <div class="team-grid">
      <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot">
        <pre style="text-align: left; padding: 0 1rem;">{{ formatDebug(battleOutput, index) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/singleTeamStore'
import { ScoreAttackTeam } from '../models/ScoreAttackTeam'
import EnemySelector from '../components/EnemySelector.vue'
import { toast } from "vue3-toastify"
import CharacterEditor from '../components/CharacterEditor.vue'
import { ScoreAttackKioku } from '../models/ScoreAttackKioku'
import { useSetting } from '../store/settingsStore'
import { Aliment, KiokuArgs } from '../types/KiokuTypes'

const attackerIndex = 2

const buffMultReduction = useSetting("buffMultReduction", 0)
const debuffMultReduction = useSetting("debuffMultReduction", 0)
const attackerHealth = useSetting("attackerHealth", 100)

function onChangeCrys(charIdx: number, crysIdx: number, rawValue: string) {
  const main = team.slots[charIdx].main
  if (!main) return
  const current = main.crys ?? ["EX", "", ""]
  current[crysIdx - 1] = rawValue as string
  team.setMain(charIdx, { ...main, crys: current } as any)
}

function onChangeSubCrys(charIdx: number, crysIdx: number, rawValue: string) {
  const main = team.slots[charIdx].main
  if (!main) return
  const current = main.crys_sub ?? Array(9).fill([""]).flat()
  current[crysIdx - 1] = rawValue as string
  team.setMain(charIdx, { ...main, crys_sub: current } as any)
}

const formatDmg = (out: string | [number, number, number, string[]]) => typeof (out) !== 'string' ? `Max Damage: ${out[0].toLocaleString()} with a ${out[2]}% crit rate - (Average Damage: ${out[1].toLocaleString()}) ` : battleOutput
const formatDebug = (out: string | [number, number, number, string[]], idx: number) => Array.isArray(out) ? out[3][idx] : battleOutput


const team = useTeamStore()
const enemies = useEnemyStore()

const isFullTeam = computed(() => team.slots.map(slot => slot.main).filter(Boolean).length === 5)
const teamInstance = computed(() => {
  if (!isFullTeam.value) return;
  try {
    const transformedMembers = team.slots.map(m => {
      const support = m.support ? new ScoreAttackKioku({ ...m.support }) : null

      return new ScoreAttackKioku(
        {
          ...m.main,
          supportKey: support?.getKey()
        } as KiokuArgs,
        (m.buffMultReduction || buffMultReduction.value) ?? 0,
        (m.debuffMultReduction || debuffMultReduction.value) ?? 0,
      )
    }) as ScoreAttackKioku[]
    return new ScoreAttackTeam(
      transformedMembers[attackerIndex],
      transformedMembers.filter((v, i) => i !== attackerIndex),
      attackerHealth.value,
      aliments.filter(el => el.enabled).map(el => el.name),
      true
    )
  } catch (err) {
    toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    console.error(err)
    for (let index = 0; index < 5; index++) {
      team.setMain(index, undefined)
    }
  }
})

const battleOutput = computed(() => {
  if (!teamInstance.value) return 'Select 5 characters to calculate'
  return teamInstance.value.calculate_max_dmg(enemies.enemies, 0)
})

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

.stats select {
  width: 90%;
}

.aliment-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.aliment {
  cursor: pointer;
  text-align: center;
  transition: opacity 0.3s;
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
