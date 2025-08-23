<template>
    <div class="gallery-page">
        <button @click="startSimulation" :disabled="running">
            {{ running ? progress : 'Start Simulation' }}
        </button>
        <div v-if="running">
            Progress: {{ progress }}
        </div>

        <div v-else>
            <div class="results" style="display: flex; flex-direction: column;">
                <h2>Top Teams Overall</h2>
                <div style="display: flex" v-for="(team, idx) in topResults" :key="idx">
                    <TeamRow :team="team" />
                </div>

                <div v-for="attacker in attackers" :key="attacker.id" class="attacker-section">
                    <h3>Top Teams for {{ attacker.name }}</h3>
                    <div style="display: flex" v-for="(team, idx) in topTeamsByAttacker[attacker.name] ?? []"
                        :key="idx">
                        <TeamRow :team="team" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, ComputedRef } from 'vue'
import { Character, useCharacterStore } from '../store/characterStore'
import TeamRow from '../components/TeamRow.vue'

const store = useCharacterStore()
const running = ref(false)
const results = reactive<{ attackerId: string, team: any, dmg: number }[]>([])

const members = computed(() => store.characters.filter(c => c.enabled))
const attackers = computed(() => store.characters.filter(c => c.enabled && c.role === "Attacker"))

const workerRef = ref<Worker | null>(null)
const progress = ref(0)
const total = ref(0)

export interface FinalTeam {
    dmg: number
    crit_rate: number
    attacker: Character
    portrait: string
    atk_supp: Character
    attacker_crys1: string
    attacker_crys2: string
    attacker_crys3: string
    sustain: Character
    supp1: Character
    supp1supp: Character | undefined
    supp2: Character
    supp2supp: Character | undefined
    supp3: Character
    supp3supp: Character | undefined
}

const sortedResults: ComputedRef<FinalTeam[]> = computed(() =>
    [...results]
        .sort((a, b) => b.dmg - a.dmg)
        .map(r => ({
            dmg: r[0],
            crit_rate: r[1],
            attacker: members.value.find(m => m.name === r[2])!,
            portrait: r[3],
            atk_supp: members.value.find(m => m.name === r[4])!,
            attacker_crys1: r[5],
            attacker_crys2: r[6],
            attacker_crys3: r[7],
            sustain: members.value.find(m => m.name === r[8])!,
            supp1: members.value.find(m => m.name === r[9])!,
            supp1supp: members.value.find(m => m.name === r[10]),
            supp2: members.value.find(m => m.name === r[11])!,
            supp2supp: members.value.find(m => m.name === r[12]),
            supp3: members.value.find(m => m.name === r[13])!,
            supp3supp: members.value.find(m => m.name === r[14]),
        }))
)

const topResults = computed(() => sortedResults.value.slice(0, 20))

const topTeamsByAttacker = computed(() => {
    const map: Record<string, any[]> = {}
    attackers.value.forEach(a => {
        map[a.name] = sortedResults.value.filter(team => team.attacker.name === a.name).slice(0, 5)
    })
    return map
})

async function startSimulation() {
    running.value = true
    progress.value = 0

    workerRef.value = new Worker(new URL('../workers/BestTeamWorker.js', import.meta.url), { type: 'module' })

    workerRef.value.onmessage = (e) => {
        if (e.data.type === 'progress') {
            progress.value = e.data.currChars
        }
        if (e.data.type === 'done') {
            results.splice(0, results.length, ...e.data.results)
            running.value = false
            workerRef.value?.terminate()
            workerRef.value = null
        }
    }

    workerRef.value.postMessage({
        options: {
            enemies: [],
            include4StarAttackers: false,
            include4StarSupports: false,
            extraAttackers: [],
            weakElements: ["Flame"],
            enabledCharacters: JSON.parse(JSON.stringify(members.value))
        }
    })
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
