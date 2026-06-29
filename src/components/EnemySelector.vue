<template>
    <!-- Enemy section -->
    <div class="enemy-page">
        <h2>Enemies</h2>
        <div class="enemy-grid">
            <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot">
                <h3 class="enemy-title">{{ enemy.name }}</h3>

                <div class="enemy-stats">
                    <label v-if="enemy.name !== 'Target'" class="checkbox-label">
                        <input type="checkbox" v-model="enemy.enabled"
                            @change="enemies.updateEnemy(index, { enabled: enemy.enabled })" />
                        Enabled
                    </label>
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
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="enemy.isBreak"
                            @change="enemies.updateEnemy(index, { isBreak: enemy.isBreak })" />
                        Is broken
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" v-model="enemy.isCrit"
                            @change="enemies.updateEnemy(index, { isCrit: enemy.isCrit })" />
                        Hit by crit
                    </label>
                    <label class="checkbox-label">
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
.enemy-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.enemy-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-bottom: 1rem;
    width: 100%;
}

.enemy-title {
    margin: 0 0 0.5rem 0;
}

.team-slot {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 1rem;
    min-width: 0;
    background: rgba(255, 255, 255, 0.03);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.enemy-stats {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.enemy-stats label {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    color: var(--text);
    font-size: 0.9rem;
}

.enemy-stats label input[type="number"] {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
}

.enemy-stats label.checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
}
</style>
