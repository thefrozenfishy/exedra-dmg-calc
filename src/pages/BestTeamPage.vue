<template>
    <div class="gallery-page">
        <button @click="startSimulation" :disabled="running">
            {{ running ? 'Running...' : 'Start Simulation' }}
        </button>
    </div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref } from 'vue'
import { useCharacterStore } from '../store/characterStore'
import { findBestTeam } from '../models/BestTeamCalculator'

const store = useCharacterStore()
const running = ref(false)
const results = reactive<{ attackerId: string, team: any, dmg: number }[]>([])

const members = computed(() => store.characters.filter(c => c.enabled))

const topTeamsOverall = computed(() =>
    [...results]
        .sort((a, b) => b.dmg - a.dmg)
        .slice(0, 20)
        .map(r => { console.log(r); return r })
        .map(r => ({ dmg: r.dmg, team: r.team }))
)

const topTeamsByAttacker = computed(() => {
    const map: Record<string, any[]> = {}
    for (const r of results) {
        if (!map[r.attackerId]) map[r.attackerId] = []
        map[r.attackerId].push({ ...r, key: r.team.map(c => c.id).join('-') })
    }
    for (const k in map) {
        map[k] = map[k].sort((a, b) => b.dmg - a.dmg).slice(0, 5).map(r => ({ dmg: r.dmg, members: r.team.slice(1) }))
    }
    return map
})

async function startSimulation() {
    running.value = true
    results = findBestTeam({
        enemies: [],
        include4StarAttackers: false,
        include4StarSupports: false,
        extraAttackers: [],
        weakElements: ["Flame"],
        enabledCharacters: store.characters.filter(c => c.enabled)
    })
    running.value = false
}
</script>

<style scoped>
.role-section {
    margin-bottom: 2rem;
}

.role-section h2 {
    margin-bottom: 1rem;
    text-align: left;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    /* max 5 per row */
    gap: 1rem;
}

.gallery-page {
    justify-content: center;
}

.default-row {
    display: contents;
}
</style>
