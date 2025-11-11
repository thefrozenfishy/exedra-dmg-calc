<template>
  <div class="team-page">
    <h1>PvP Action Order calculator</h1>

    <div v-for="isAlliedTeam in [1, 0]">
      <h2>{{ isAlliedTeam ? "Allied" : "Enemy" }} Team</h2>
      <div class="team-grid">
        <div v-for="(slot, index) in team.slots[isAlliedTeam]" :key="index" class="team-slot">
          <h2> {{ isAlliedTeam ? "Ally" : "Enemy" }} {{ index + 1 }}</h2>

          <CharacterEditor :index="index" :slot="slot"
            :extraData="battleOutput[0]?.[isAlliedTeam ? 'allies' : 'enemies']?.team?.find(b => b.name === slot.main?.name)"
            :setMain="team.setMain(isAlliedTeam)" :setSupport="team.setSupport(isAlliedTeam)"
            :onChangeCrys="onChangeCrys(isAlliedTeam)" :onChangeSubCrys="onChangeSubCrys(isAlliedTeam)" />
        </div>
      </div>
    </div>
  </div>
  <div style="display: none;">
    <h2>Battle Order</h2>
    <p style="color: red;">UNDER CONSTRUCTION</p>
    <button @click="runSimulation" :disabled="!isFullBattle">Run Simulation</button>
    <p style="color: red;">Take this with a big grain of salt, as my understanding of the mechanics here are not
      perfect, nor do I want to use the time to special case all different attacks, targeting etc</p>
    <p>I'll try to make sure all common pvp characters work identical to ingame, but niche picks are at your own risk
    </p>
    <p>First few turns are probably correct, so use this to check speed ties etc. The further down you go the less
      likely it is to be correct</p>
    <div class="battle-output">
      <div v-for="(state, idx) in battleOutput" :key="idx" class="battle-state">
        <hr class="matchup-separator" />
        <div v-for="side of [state.allies, state.enemies]">
          <div class="row">
            {{ side.sp }}
            <div v-for="char in side.team" :key="char.id" class="character">
              <a :href="`https://exedra.wiki/wiki/${char.name}`" target="_blank" style="display: block;">
                <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name"
                  :class="{ 'at-zero': char.secondsLeft - 0.01 <= 0 }" />
              </a>
              <div class="progress-bar" :title="char.mp + ' / ' + char.maxMp">
                MP
                <progress :value="char.mp" :max="char.maxMp">MP</progress>
              </div>
              <div class="progress-bar" :title="Math.max(char.breakCurrent, 0) + ' / ' + char.maxBreakGauge">
                Break
                <progress :value="char.breakCurrent" :max="char.maxBreakGauge"></progress>
              </div>
              <div class="distance">Magic: {{ char.magicStacks }} / {{ char.maxMagicStacks }}</div>
              <div class="distance">{{ round(char.secondsLeft) }} AV ({{ round(char.distanceLeft / 100) }} AA)</div>
              <div class="distance">{{ round(char.spd) }} spd</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePvPStore } from '../store/singleTeamStore'
import { BattleState } from '../types/KiokuTypes'
import { PvPBattle } from '../models/PvPBattle'
import { PvPTeam } from '../models/PvPTeam'
import CharacterEditor from '../components/CharacterEditor.vue'
import { toast } from 'vue3-toastify'
import { PvPKioku } from '../models/PvPKioku'

const team = usePvPStore()

const battleOutput = ref<BattleState[]>([])

const round = (spd: number) => spd.toFixed(2)

const onChangeCrys = (isAlliedTeam: number) => (charIdx: number, crysIdx: number, rawValue: string) => {
  const main = team.slots[isAlliedTeam][charIdx].main
  if (!main) return
  const current = main?.crys ?? ["", "", ""]
  current[crysIdx - 1] = rawValue as string
  team.setMain(isAlliedTeam)(charIdx, { ...main, crys: current } as any)
}

const onChangeSubCrys = (isAlliedTeam: number) => (charIdx: number, crysIdx: number, rawValue: string) => {
  const main = team.slots[isAlliedTeam][charIdx].main
  if (!main) return
  const current = main.crys_sub ?? Array(9).fill([""]).flat()
  current[crysIdx - 1] = rawValue as string
  team.setMain(isAlliedTeam)(charIdx, { ...main, crys_sub: current } as any)
}

const isFullBattle = computed(() => team.slots[0].every(t => t?.main) && team.slots[1].every(t => t?.main))
const battleInstance = ref<PvPBattle | null>(null)

watch(team, () => {
  if (!isFullBattle.value) {
    battleOutput.value = []
    battleInstance.value = null
    return
  }
  const [alliedTeam, enemyTeam] = [1, 0].map(idx => team.slots[idx].map(m =>
    new PvPKioku({ ...m.main, supportKey: m.support ? new PvPKioku(m.support)?.getKey() : undefined })
  ))
  const battle = new PvPBattle(new PvPTeam(alliedTeam, "Ally", true), new PvPTeam(enemyTeam, "Enemy"))
  battleInstance.value = battle
  battleOutput.value = [battle.getCurrentState()]
}, { immediate: true, deep: true })

function runSimulation() {
  if (!isFullBattle.value || !battleInstance.value) {
    battleOutput.value = []
    return
  }
  if (battleOutput.value.length > 1) return // Only run sim once

  const states = []
  for (let index = 0; index < 3; index++) {
    battleInstance.value.traverseToNextActor()
    states.push(battleInstance.value.getCurrentState())
    try {
      battleInstance.value.executeNextAction()
    } catch (e) {
      toast.warning(e)
      console.error(e)
    }
  }
  battleOutput.value = states

}
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

.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat {
  display: flex;
  margin-left: 0.3rem;
}

.battle-output {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.character {
  text-align: center;
}

.character img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 2px solid transparent;
}

.character img.at-zero {
  border-color: green;
  border-radius: 50%;
  border-width: 5px;
}

.distance {
  margin-top: 0.25rem;
  font-size: 0.9em;
  color: #666;
}

.matchup-separator {
  margin: 1.5rem 0;
  border: none;
  border-top: 2px dashed #aaa;
}

.progress-bar>progress {
  width: 50%;
}
</style>
