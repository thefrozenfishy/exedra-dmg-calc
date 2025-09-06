<template>
  <div class="team-page">
    <h1>Simulate PvP Action Order</h1>

    <p style="color: red;">UNDER CONSTRUCTION</p>
    <p>For now this page can be used to check SPD breakpoints, looking if a quickstep+ to quickstep++ upgrade actually
      will matter etc. </p>
    <div>
      <h2>Battle Order</h2>
      <div class="battle-output">
        {{ battleOutput }}
      </div>
    </div>

    <div v-for="isAlliedTeam in [1, 0]">
      <h2>{{ isAlliedTeam ? "Allied" : "Enemy" }} Team</h2>
      <div class="team-grid">
        <div v-for="(slot, index) in team.slots[isAlliedTeam]" :key="index" class="team-slot">
          <!-- Header per slot -->
          <h2> {{ isAlliedTeam ? "Ally" : "Enemy" }} {{ index + 1 }}</h2>

          <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain(isAlliedTeam)"
            :setSupport="team.setSupport(isAlliedTeam)" :onChangeCrys="onChangeCrys(isAlliedTeam)"
            :onChangeSubCrys="onChangeSubCrys(isAlliedTeam)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePvPStore } from '../store/singleTeamStore'
import { getKioku, Kioku } from '../models/Kioku'
import { KiokuGeneratorArgs } from '../types/KiokuTypes'
import { PvPBattle } from '../models/PvPBattle'
import { PvPTeam } from '../models/PvPTeam'
import CharacterEditor from '../components/CharacterEditor.vue'

const team = usePvPStore()

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

const battleInstance = computed(() => {
  if (!isFullBattle.value) return;
  const [alliedTeam, enemyTeam] = [1, 0].map(idx => team.slots[idx].map(m =>
    getKioku({ ...m.main, supportKey: m.support ? getKioku(m.support)?.getKey() : null } as KiokuGeneratorArgs)
  ) as Kioku[])
  return new PvPBattle(new PvPTeam(alliedTeam, "Ally", true), new PvPTeam(enemyTeam, "Enemy"))
})
onMounted(() => {
  team.load()
})

const battleOutput = computed(() => {
  if (!battleInstance.value) return
  const speeds = (battleInstance.value.executeNextAction())

  for (const isAlliedTeam of [0, 1]) {
    for (const [key, vals] of Object.entries(speeds[isAlliedTeam ? "allies" : "enemies"])) {
      for (const [charname, val] of Object.entries(vals)) {
        team.slots[isAlliedTeam].forEach((c, idx) => {
          if (c.main?.name === charname)
            team.setMain(isAlliedTeam)(idx, { ...team.slots[isAlliedTeam][idx].main, [key]: val })
        })
      }
    }
  }
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

.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat {
  display: flex;
  margin-left: 0.3rem;
}
</style>
