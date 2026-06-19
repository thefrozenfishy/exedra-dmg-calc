<template>
    <!-- Enemy section -->
    <div class="team-page">
        <h2>Enemies</h2>
        <div class="team-grid">
            <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot stat-inputs">
                <h3 class="enemy-title">{{ enemy.name }}</h3>

                <div class="enemy-stats">
                    <div v-if="enemy.name !== 'Target'">
                        <label>
                            <input type="checkbox" v-model="enemy.enabled"
                                @change="enemies.updateEnemy(index, { enabled: enemy.enabled })" />
                            Enabled
                        </label>
                    </div>
                    <div v-else style="height: 24px;"></div>
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
                    <label>
                        <input type="checkbox" v-model="enemy.isAddDmgCrit"
                            @change="enemies.updateEnemy(index, { isAddDmgCrit: enemy.isAddDmgCrit })" />
                        Additional dmg crit
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
    gap: 3rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    padding-right: 2rem;
    width: 100%;
    box-sizing: border-box;
    min-height: 400px;
}

.enemy-title {
    margin-bottom: 0px;
}

.team-slot {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 1rem;
    min-width: 0;
    background: rgba(255, 255, 255, 0.03);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.stat-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: auto;
    width: 100%;
    height: 380px;
}

.stat-inputs label {
    width: 100%;
    display: block;
    color: var(--text);
    margin-left: 0.3rem;
}
</style>
