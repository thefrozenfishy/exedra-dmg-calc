<template>
    <div class="gallery-page">


        <EnemySelector></EnemySelector>
        
        <div style="height: 40px;"></div>

        <!-- Control panel -->
        <div class="options-panel">
            <h2>Simulation Options</h2>

            <label>
                <input type="checkbox" v-model="include4StarAttackers" />
                Include 4★ Attackers
            </label>

            <label>
                <input type="checkbox" v-model="include4StarSupports" />
                Include 4★ Supports
            </label>

            <div class="weak-elements">
                <h3>Weak Elements</h3>
                <div class="element-grid">
                    <div v-for="element in weakElements" :key="element.name" class="element"
                        :class="{ disabled: !element.enabled }" @click="element.enabled = !element.enabled">
                        <img :src="`/exedra-dmg-calc/elements/${element.name}.png`" :alt="element.name"
                            :title="element.name" />
                        <span>{{ element.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Extra Attackers -->
            <div class="extra-attackers">
                <h3>Extra Attackers</h3>

                <!-- Selected list -->
                <div class="selected-attackers">
                    <div @click="removeExtraAttacker(char)" v-for="char in extraAttackers" :key="char.id" class="chip">
                        <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                        <span>{{ char.name }}</span>
                    </div>
                </div>

                <!-- Input + dropdown -->
                <div class="attacker-select">
                    <input type="text" v-model="extraAttackerQuery" placeholder="Use non-attackers as extra attackers..."
                        @focus="showDropdown = true" @blur="hideDropdown" />
                    <ul v-if="showDropdown && filteredCharacters.length" class="dropdown">
                        <li v-for="char in filteredCharacters" :key="char.id"
                            @mousedown.prevent="addExtraAttacker(char)">
                            <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                            {{ char.name }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="team-row-wrapper" style="justify-content: center;" v-if="running">
            <TeamRow :team="progress" :loading="true"></TeamRow>
        </div>

        <button v-else @click="startSimulation" :disabled="running">
            {{ running ? "Running" : 'Start Simulation' }}
        </button>


        <div v-if="topResults.length">
            <div class="results ">
                <h2>Top Teams Overall</h2>
                <div class="team-row-wrapper" v-for="(team, idx) in topResults" :key="idx">
                    <TeamRow :team="team" :loading="false" />
                </div>

                <div v-for="attacker in attackers" :key="attacker.id" class="attacker-section">
                    <div v-if="topTeamsByAttacker[attacker.name].length">
                        <h3>Top Teams for {{ attacker.name }}</h3>
                        <div class="team-row-wrapper" v-for="(team, idx) in topTeamsByAttacker[attacker.name] ?? []"
                            :key="idx">
                            <TeamRow :team="team" :loading="false" />
                        </div>
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
import { Role, Element } from '../utils/helpers'
import EnemySelector from '../components/EnemySelector.vue'
import { useEnemyStore } from '../store/singleTeamStore'
const enemies = useEnemyStore()

const store = useCharacterStore()
const running = ref(false)
const results = reactive<{ attackerId: string, team: any, dmg: number }[]>([])

const members = computed(() => store.characters.filter(c => c.enabled))
const attackers = computed(() => store.characters.filter(c => c.enabled && c.role === Role.Attacker))

const workerRef = ref<Worker | null>(null)
const progress = ref<FinalTeam>({})

// ---- Option states bound to template ----
const include4StarAttackers = ref(false)
const include4StarSupports = ref(false)
const extraAttackersInput = ref("")

// Example element icons (replace with your real assets)
const weakElements = reactive([
    { name: Element.Flame, enabled: true },
    { name: Element.Aqua, enabled: true },
    { name: Element.Forest, enabled: true },
    { name: Element.Light, enabled: true },
    { name: Element.Dark, enabled: true },
    { name: Element.Void, enabled: true },
])

// Extra attackers
const extraAttackers = ref<Character[]>([])
const extraAttackerQuery = ref("")
const showDropdown = ref(false)

const filteredCharacters = computed(() => {
    const q = extraAttackerQuery.value.toLowerCase()
    return members.value.filter(
        (m) =>
            !extraAttackers.value.some((a) => a.id === m.id) &&
            m.name.toLowerCase().includes(q)
    )
})

function addExtraAttacker(char: Character) {
    extraAttackers.value.push(char)
    extraAttackerQuery.value = ""
    showDropdown.value = false
}

function removeExtraAttacker(char: Character) {
    extraAttackers.value = extraAttackers.value.filter((a) => a.id !== char.id)
}

function hideDropdown() {
    // Delay to allow click on item before blur closes it
    setTimeout(() => (showDropdown.value = false), 150)
}

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

const pupulateTeam = (result: any[]) => ({
    dmg: result[0],
    crit_rate: result[1],
    attacker: members.value.find(m => m.name === result[2])!,
    portrait: result[3],
    atk_supp: members.value.find(m => m.name === result[4])!,
    attacker_crys1: result[5],
    attacker_crys2: result[6],
    attacker_crys3: result[7],
    sustain: members.value.find(m => m.name === result[8])!,
    supp1: members.value.find(m => m.name === result[9])!,
    supp1supp: members.value.find(m => m.name === result[10]),
    supp2: members.value.find(m => m.name === result[11])!,
    supp2supp: members.value.find(m => m.name === result[12]),
    supp3: members.value.find(m => m.name === result[13])!,
    supp3supp: members.value.find(m => m.name === result[14]),
})

const sortedResults: ComputedRef<FinalTeam[]> = computed(() =>
    [...results]
        .sort((a, b) => b.dmg - a.dmg)
        .map(pupulateTeam)
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
    progress.value = {}

    workerRef.value = new Worker(new URL('../workers/BestTeamWorker.js', import.meta.url), { type: 'module' })

    workerRef.value.onmessage = (e) => {
        if (e.data.type === 'progress') {
            const d = pupulateTeam(e.data.currChars)
            console.log(d)
            progress.value = d
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
            enemies: JSON.parse(JSON.stringify(enemies.enemies)),
            include4StarAttackers: include4StarAttackers.value,
            include4StarSupports: include4StarSupports.value,
            weakElements: weakElements.filter(el => el.enabled).map(el => el.name),
            extraAttackers: extraAttackersInput.value
                .split(",")
                .map(s => s.trim())
                .filter(Boolean),
            enabledCharacters: JSON.parse(JSON.stringify(members.value))
        }
    })
}

</script>

<style scoped>
.options-panel {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.weak-elements {
    margin-top: 0.5rem;
}

.element-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
}

.element {
    cursor: pointer;
    text-align: center;
    transition: opacity 0.3s;
}

.element img {
    width: 48px;
    height: 48px;
    display: block;
    margin: 0 auto;
}

.element.disabled {
    opacity: 0.3;
}

.team-row-wrapper {
    display: flex;
}

.results {
    display: flex;
    flex-direction: column
}




/* Extra attackers */
.extra-attackers {
    margin-top: 1rem;
}

.selected-attackers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    max-width: 600px;
}

.chip {
    display: flex;
    align-items: center;
    border-radius: 20px;
    padding: 0.2rem 0.5rem;
    gap: 0.3rem;
    cursor: pointer;
}

.chip img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.attacker-select {
    position: relative;
}

.attacker-select input {
    width: 100%;
    padding: 0.4rem;
    max-width: 600px;
}

.dropdown {
    position: absolute;
    z-index: 10;
    border-radius: 4px;
    width: 80%;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 0.2rem;
    margin-left: 36px;
    background-color: rgba(0, 0, 0, .3);
}

.dropdown li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
}

.dropdown li:hover {
    background: #f0f0f0;
}

.dropdown img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}
</style>
