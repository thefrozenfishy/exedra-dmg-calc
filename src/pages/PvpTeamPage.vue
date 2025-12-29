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
  <div>
    <h2>Battle Order</h2>
    <p style="color: red;">UNDER CONSTRUCTION</p>
    <button @click="runSimulation" :disabled="!isFullBattle">Run Simulation</button>
    <p style="color: red;">Take this with a big grain of salt, as my understanding of the mechanics here are not
      perfect, nor do I want to use the time to special case all different attacks, targeting etc</p>
    <p>Use this to get a gut feel for how characters and speed vs AV vs AA works and how speed ties resolve</p>
    <p>I'll try to make sure all common pvp characters work identical to in-game, but niche picks are at your own risk
    </p>
    <p>If anything looks weird, just give me a poke with an example team!</p>
    <div class="battle-output">
      <div v-for="(state, idx) in battleOutput" :key="idx" class="battle-state">
        <div class="matchup-divider">
          <div v-if="idx > 0" class="ten-separator" :class="state.lastTeamIsTeam1 ? 'ally' : 'enemy'">
            <span class="turn">Action {{ idx }}</span>
            <span class="actor">{{ state.lastActor }}</span>
            <span class="action"> {{ skillTranslate[state.lastTargetType] }} </span>
          </div>
          <div v-else>

            <span class="action"> Initial State </span>
          </div>
        </div>

        <div v-for="side of [state.allies, state.enemies]">
          <div class="row">
            {{ side.sp }}
            <div v-for="char in side.team" :key="char.id" class="character">
              <a :href="`https://exedra.wiki/wiki/${char.name}`" target="_blank" style="display: block;"
                :class="{ broken: char.breakCurrent <= 0 }">
                <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name"
                  :class="{ 'at-zero': char.secondsLeft - 0.001 <= 0 }" />
              </a>
              <div class="progress-bar" :title="char.mp + ' / ' + char.maxMp">
                MP
                <progress :value="char.mp" :max="char.maxMp">MP</progress>
              </div>
              <div class="progress-bar" :title="char.breakCurrent + ' / ' + char.maxBreakGauge">
                Break
                <progress :value="char.breakCurrent" :max="char.maxBreakGauge"></progress>
              </div>
              <div class="distance">Magic: {{ char.magicStacks }} / {{ char.maxMagicStacks }}</div>
              <div class="distance">{{ round(char.secondsLeft) }} AV ({{ round(char.distanceLeft / 100) }} AA)</div>
              <div class="distance">{{ round(char.spd) }} spd</div>
              <div class="distance" :title="char.buffs.join('\n')">{{ char.buffs.length }} buffs</div>
              <div class="distance" :title="char.debuffs.join('\n')">{{ char.debuffs.length }} debuffs</div>
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
import { BattleSnapshot, TargetType } from '../types/KiokuTypes'
import { PvPBattle } from '../models/PvPBattle'
import { PvPTeam } from '../models/PvPTeam'
import CharacterEditor from '../components/CharacterEditor.vue'
import { toast } from 'vue3-toastify'
import { PvPKioku } from '../models/PvPKioku'

const skillTranslate = {
  [TargetType.attackId]: "Basic Attack",
  [TargetType.specialId]: "Ultimate",
  [TargetType.skillId]: "Battle Skill",

}

const team = usePvPStore()

const battleOutput = ref<BattleSnapshot[]>([])

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
  for (let index = 0; index < 30; index++) {
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

.broken {
  filter: grayscale(100%) brightness(0.6);
}

.distance {
  margin-top: 0.25rem;
  font-size: 0.9em;
  color: #666;
}

.progress-bar>progress {
  width: 50%;
}

.ten-separator {
  margin: 0.35rem 0.75rem;
  border-radius: 999px;
  color: #cccaca;
  font-weight: bold;
  font-weight: 600;
}

.ten-separator.ally {
  background: #2d462d;
  border-color: #0b240b;
}

.ten-separator.enemy {
  background: #682c2c;
  border-color: rgb(143, 40, 40);
}

.matchup-divider {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  margin: 1.75rem 0 1rem;
}

.matchup-divider::before,
.matchup-divider::after {
  content: "";
  flex: 1;
  height: 3px;
  background: linear-gradient(to right,
      transparent,
      #aaa,
      transparent);
}

.matchup-divider span {
  padding: 0 0.75rem;
}
</style>
