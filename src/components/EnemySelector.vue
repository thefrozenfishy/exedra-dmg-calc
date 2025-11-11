<template>
    <!-- Enemy section -->
    <div class="team-page">
        <h3>Enemies</h3>
        <div class="team-grid">
            <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot stat-inputs">
                <h3>{{ enemy.name }}</h3>

                <div class="enemy-stats">
                    <div v-if="enemy.name !== 'Target'">
                        <label>
                            <input type="checkbox" v-model="enemy.enabled"
                                @change="enemies.updateEnemy(index, { enabled: enemy.enabled })" />
                            Enabled
                        </label>
                    </div>
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
                    <label>
                        Defence up (%):
                        <input type="number" v-model.number="enemy.defenseUp"
                            @change="enemies.updateEnemy(index, { defenseUp: enemy.defenseUp })" />
                    </label>
                    <label>
                        Hits to kill:
                        <input type="number" v-model.number="enemy.hitsToKill"
                            @change="enemies.updateEnemy(index, { hitsToKill: enemy.hitsToKill })" />
                    </label>
                    <label>
                        <input type="checkbox" v-model="enemy.isBreak"
                            @change="enemies.updateEnemy(index, { isBreak: enemy.isBreak })" />
                        Is broken
                    </label>
                    <label>
                        <input type="checkbox" v-model="enemy.isCrit"
                            @change="enemies.updateEnemy(index, { isCrit: enemy.isCrit })" />
                        Hit by crit
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { useEnemyStore } from '../store/singleTeamStore'
const enemies = useEnemyStore()
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
