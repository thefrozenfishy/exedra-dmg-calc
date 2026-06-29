<template>
    <div class="setup-page gallery-page">
        <h1 class="page-title">Best Team Finder</h1>

        <EnemySelector />

        <section class="card numeric-row">
            <span class="filters-heading">Results</span>
            <label class="field">
                <span class="field-label">Top teams to display</span>
                <input type="number" v-model="topTeams" />
            </label>
            <label class="field">
                <span class="field-label">Top teams per DPS</span>
                <input type="number" v-model="topTeamsPerKioku" />
            </label>
        </section>

        <section class="filters card">
            <span class="filters-heading">Options</span>

            <label class="chip" :class="{ active: include4StarAttackers }">
                <input type="checkbox" v-model="include4StarAttackers" /> 4★ Attackers
            </label>
            <label class="chip" :class="{ active: include4StarSupports }">
                <input type="checkbox" v-model="include4StarSupports" /> 4★ Supports
            </label>
            <label class="chip" :class="{ active: include4StarOthers }">
                <input type="checkbox" v-model="include4StarOthers" /> 4★ Others
            </label>
            <label class="chip" :class="{ active: optimizeAverageDamage }"
                title="Optimizes for average damage over many hits, instead of assuming crit">
                <input type="checkbox" v-model="optimizeAverageDamage" /> Average damage (LR)
            </label>
            <label class="chip" :class="{ active: onlyConsiderOnElements }">
                <input type="checkbox" v-model="onlyConsiderOnElements" /> On-element only
            </label>
            <label class="chip" :class="{ active: optimalSubCrys }"
                title="Calculate using perfect Crit rate, Crit Damage & atk crystalis substats">
                <input type="checkbox" v-model="optimalSubCrys" /> Perfect crit &amp; substats
            </label>
        </section>

        <section class="card section-card">
            <DamageReductionInputs />
            <ArenaBuffs />
        </section>

        <section class="card section-card">
            <h3 class="section-title">Role Distribution</h3>
            <div class="role-grid">
                <div class="role-box">
                    <img :src="'/exedra-dmg-calc/roles/Attacker.png'" alt="Attacker" />
                    <span>Damage Dealer</span>
                    <div class="number">1</div>
                </div>

                <div class="role-box">
                    <div class="icons">
                        <img :src="'/exedra-dmg-calc/roles/Buffer.png'" alt="Buffer" />
                        <img :src="'/exedra-dmg-calc/roles/Debuffer.png'" alt="Debuffer" />
                    </div>
                    <span>Buffer+Debuffer</span>
                    <input type="number" v-model.number="deBufferCount" min="0"
                        :max="4 - minHealer - minDefender - minBreaker" />
                </div>

                <div class="role-box" :class="{ 'role-disabled': disabledOtherRoles.includes(KiokuRole.Healer) }"
                    @click="toggleOtherRole(KiokuRole.Healer)" style="cursor:pointer;"
                    title="Click to disable Healers from flex spots">
                    <img :src="'/exedra-dmg-calc/roles/Healer.png'" alt=KiokuRole.Healer />
                    <span>Healer (min)</span>
                    <input type="number" v-model.number="minHealer" min="0" :max="otherCount - minDefender - minBreaker"
                        @click.stop />
                </div>

                <div class="role-box" :class="{ 'role-disabled': disabledOtherRoles.includes(KiokuRole.Defender) }"
                    @click="toggleOtherRole(KiokuRole.Defender)" style="cursor:pointer;"
                    title="Click to disable Defenders from flex spots">
                    <img :src="'/exedra-dmg-calc/roles/Defender.png'" alt=KiokuRole.Defender />
                    <span>Defender (min)</span>
                    <input type="number" v-model.number="minDefender" min="0" :max="otherCount - minHealer - minBreaker"
                        @click.stop />
                </div>

                <div class="role-box" :class="{ 'role-disabled': disabledOtherRoles.includes(KiokuRole.Breaker) }"
                    @click="toggleOtherRole(KiokuRole.Breaker)" style="cursor:pointer;"
                    title="Click to disable Breakers from flex spots">
                    <img :src="'/exedra-dmg-calc/roles/Breaker.png'" alt=KiokuRole.Breaker />
                    <span>Breaker (min)</span>
                    <input type="number" v-model.number="minBreaker" min="0" :max="otherCount - minDefender - minHealer"
                        @click.stop />
                </div>

                <div class="role-box total-box" style="grid-column: 3 / span 3; width: 400px;">
                    <span>Flex spot ({{ flexRoleLabel }})</span>
                    <div class="number">{{
                        otherCount
                        - (disabledOtherRoles.includes(KiokuRole.Defender) ? 0 : minDefender)
                        - (disabledOtherRoles.includes(KiokuRole.Healer) ? 0 : minHealer)
                        - (disabledOtherRoles.includes(KiokuRole.Breaker) ? 0 : minBreaker)
                        }}</div>
                </div>
            </div>
        </section>

        <section class="card section-card weak-elements">
            <h3 class="section-title">Weak Elements</h3>
            <div class="element-aliment-grid">
                <div v-for="element in weakElements" :key="element.name" class="element"
                    :class="{ disabled: !element.enabled }" @click="toggleElement(element)">
                    <img :src="`/exedra-dmg-calc/elements/${element.name}.png`" :alt="element.name"
                        :title="element.name" />
                    <span>{{ element.name }}</span>
                </div>
            </div>

            <AlimentToggler ref="alimentRef" />
        </section>

        <section class="card section-card kioku-selector">
            <h3 class="section-title">Ignored Kioku</h3>
            <p class="section-hint">These are Kioku that do not have any dmg boosting effects, and by default will be
                ignored to speed up computing time</p>

            <div class="selected-kioku">
                <div @click="removeIgnoredKioku(char)" v-for="char in ignoredKioku" :key="char.id" class="kioku-chip">
                    <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                    <span>{{ char.name }}</span>
                </div>
            </div>

            <div class="kioku-select">
                <input type="text" v-model="ignoredKiokuQuery"
                    placeholder="Kioku that will be ignored during calculations..."
                    @focus="showIgnoredKiokuDropdown = true" @blur="hideIgnoredKiokuDropdown" />
                <ul v-if="showIgnoredKiokuDropdown && filteredIgnoredKioku.length" class="dropdown">
                    <li v-for="char in filteredIgnoredKioku" :key="char.id" @mousedown.prevent="addIgnoredKioku(char)">
                        <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                        {{ char.name }}
                    </li>
                </ul>
            </div>
        </section>

        <section class="card section-card kioku-selector">
            <h3 class="section-title">Obligatory Kioku</h3>

            <div class="selected-kioku">
                <div @click="removeObligatoryKioku(char)" v-for="char in obligatoryKioku" :key="char.id"
                    class="kioku-chip">
                    <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                    <span>{{ char.name }}</span>
                </div>
            </div>

            <div class="kioku-select">
                <input type="text" v-model="obligatoryKiokuQuery"
                    placeholder="Kioku that must be included in final team..."
                    @focus="showObligatoryKiokuDropdown = true" @blur="hideObligatoryKiokuDropdown" />
                <ul v-if="showObligatoryKiokuDropdown && filteredKioku.length" class="dropdown">
                    <li v-for="char in filteredKioku" :key="char.id" @mousedown.prevent="addObligatoryKioku(char)">
                        <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                        {{ char.name }}
                    </li>
                </ul>
            </div>
        </section>

        <section class="card section-card kioku-selector">
            <h3 class="section-title">Non-Attacker Damage Dealers</h3>

            <div class="selected-kioku">
                <div @click="removeExtraAttacker(char)" v-for="char in extraAttackers" :key="char.id"
                    class="kioku-chip">
                    <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                    <span>{{ char.name }}</span>
                </div>
            </div>

            <div class="kioku-select">
                <input type="text" v-model="extraAttackerQuery"
                    placeholder="Use non-attackers as extra damage dealers, by default only attackers are checked..."
                    @focus="showExtraAttackerDropdown = true" @blur="hideExtraAttackerDropdown" />
                <ul v-if="showExtraAttackerDropdown && filteredAttackers.length" class="dropdown">
                    <li v-for="char in filteredAttackers" :key="char.id" @mousedown.prevent="addExtraAttacker(char)">
                        <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name" />
                        {{ char.name }}
                    </li>
                </ul>
            </div>
        </section>

        <div class="team-row-wrapper loading-bar" v-if="running">
            <TeamRow style="margin: 0 auto;" :team="progress" :loading="true" :optimalSubCrys />
            <div class="progress-wrapper">
                <progress :value="completedRuns" :max="expectedRuns" class="progress-bar"></progress>
                <span class="progress-text">{{ completedRuns }} / {{ expectedRuns }}</span>
            </div>
        </div>

        <button v-else class="btn btn-start" @click="startSimulation" :disabled="running">
            {{ running ? "Running" : 'Start Simulation' }}
        </button>

        <div v-if="topResults.length">
            <section class="toolbar card">
                <div class="toolbar-left">
                    <ImageActionsToolbar target=".results" filename="best_sa_team.png" :export-options="exportOpts"
                        :share-options="shareOptionsForBestTeam" />
                </div>
            </section>
            <div class="results">
                <h2>Top Teams Overall</h2>
                <ResultsHeader :optimizeAverageDamage />
                <div class="team-row-wrapper" v-for="(team, idx) in topResults" :key="idx">
                    <TeamRow :team :weakElements :offElementBuffMultReduction :offElementDebuffMultReduction
                        :loading="false" :optimalSubCrys />
                </div>

                <div v-for="[attackerName, teams] of topTeamsByAttacker" :key="attackerName" class="attacker-section">
                    <div v-if="teams?.length">
                        <h3>Top Teams for {{ attackerName }}</h3>
                        <ResultsHeader :optimizeAverageDamage />
                        <div class="team-row-wrapper" v-for="(team, idx) in teams" :key="idx">
                            <TeamRow :team :weakElements :offElementBuffMultReduction :offElementDebuffMultReduction
                                :loading="false" :optimalSubCrys />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, ComputedRef } from 'vue'
import TeamRow from '../components/TeamRow.vue'
import EnemySelector from '../components/EnemySelector.vue'
import ArenaBuffs from '../components/ArenaBuffs.vue'
import AlimentToggler from '../components/AlimentToggler.vue'
import DamageReductionInputs from '../components/DamageReductionInputs.vue'
import ResultsHeader from '../components/ResultsHeader.vue'
import { useEnemyStore } from '../store/singleTeamStore'
import { useCharacterStore } from '../store/characterStore'
import { KiokuRole, Character, KiokuElement, elementAlimentMap } from '../types/KiokuTypes'
import { toast } from "vue3-toastify"
import { FinalTeam } from '../types/BestTeamTypes'
import { useSetting } from '../store/settingsStore'
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { useFriendStore } from "../store/friendStore"

const enemies = useEnemyStore()
const store = useCharacterStore()
const friendStore = useFriendStore()

const running = ref(false)
const expectedRuns = ref(0)
const completedRuns = ref(0)
const results = reactive<{ attackerId: string, team: any, dmg: number }[][]>([])

const members = computed(() => store.characters.filter(c => c.enabled))
const attackers = computed(() => store.characters.filter(c => (c.enabled && c.role === KiokuRole.Attacker) || extraAttackers.value.map(c => c.name).includes(c.name)))
let prevAttackers: Character[] = []
let prevObligatoryKioku: Character[] = []

const defaultIgnoredKioku = members.value.filter(c => ["Nightmare Stinger", "Lynx Impact", "Circle Of Fire", "Glittering Hurricane", "Surging Laser", "Verdant Shower", "Diamond Splash", "Purple Will-o'-Wisp", "Folter Gefängnis", "Vampire Fang", "Strada Futuro", "Lux☆Magica", "Infinite Poseidon", "Neo Genesis"].includes(c.name))

const workerRef = ref<Worker | null>(null)
const progress = ref<FinalTeam>({})

const alimentRef = ref<InstanceType<typeof AlimentToggler> | null>(null)

const topTeamsPerKioku = useSetting("topTeamsPerKioku", 5)
const topTeams = useSetting("topTeams", 20)
const include4StarAttackers = useSetting("include4StarAttackers", false)
const include4StarSupports = useSetting("include4StarSupports", false)
const include4StarOthers = useSetting("include4StarOthers", false)
const buffMultReduction = useSetting("buffMultReduction", 0)
const debuffMultReduction = useSetting("debuffMultReduction", 0)
const offElementBuffMultReduction = useSetting("offElementBuffMultReduction", undefined)
const offElementDebuffMultReduction = useSetting("offElementDebuffMultReduction", undefined)
const optimizeAverageDamage = useSetting("optimizeAverageDamage", false)
const attackerHealth = useSetting("attackerHealth", 100)
const optimalSubCrys = useSetting("optimalSubCrys", true)
const arenaEffects = useSetting<{ type: string; value: number }[]>("arenaEffects", [])
const onlyConsiderOnElements = useSetting("onlyConsiderOnElements", false)

const weakElements = reactive([
    { name: KiokuElement.Flame, enabled: useSetting("flame-enabled", true) },
    { name: KiokuElement.Aqua, enabled: useSetting("aqua-enabled", true) },
    { name: KiokuElement.Forest, enabled: useSetting("forest-enabled", true) },
    { name: KiokuElement.Light, enabled: useSetting("light-enabled", true) },
    { name: KiokuElement.Dark, enabled: useSetting("dark-enabled", true) },
    { name: KiokuElement.Void, enabled: useSetting("void-enabled", true) },
])

// Keep weak element toggles in sync with their linked aliment in AlimentToggler
const toggleElement = (element: typeof weakElements[number]) => {
    element.enabled = !element.enabled
    if (!alimentRef.value) return
    const linked = alimentRef.value.aliments.find(a => a.name === elementAlimentMap[element.name])
    if (linked) linked.enabled = element.enabled
}

const deBufferCount = useSetting("deBufferCount", 3)
const otherCount = computed(() => 4 - deBufferCount.value)
const minHealer = useSetting("minHealer", 0)
const minDefender = useSetting("minDefender", 0)
const minBreaker = useSetting("minBreaker", 0)

const disabledOtherRoles = useSetting<KiokuRole[]>("disabledOtherRoles", [])

function toggleOtherRole(role: KiokuRole) {
    if (disabledOtherRoles.value.includes(role)) {
        disabledOtherRoles.value = disabledOtherRoles.value.filter(r => r !== role)
    } else {
        disabledOtherRoles.value = [...disabledOtherRoles.value, role]
    }
}

const flexRoleLabel = computed(() => {
    const enabled = [KiokuRole.Healer, KiokuRole.Defender, KiokuRole.Breaker].filter(r => !disabledOtherRoles.value.includes(r))
    return enabled.length ? enabled.join(', ') : 'none'
})

function safeInt(value: unknown, fallback = 0, min?: number, max?: number): number {
    let n = Number(value)

    if (!Number.isFinite(n)) {
        n = fallback
    }

    n = Math.floor(n)

    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)

    return n
}

const exportOpts = { exportClass: "exporting" }

const shareOptionsForBestTeam = () => ({
    title: `${friendStore.getFormattedDisplayNamePossessive()} best team vs ${weakElements.filter(el => el.enabled).map(el => el.name).join(" & ")}`,
    backUrl: window.location.href,
})

const extraAttackers = useSetting<Character[]>("extraAttackers", [])
const extraAttackerQuery = ref("")
const showExtraAttackerDropdown = ref(false)

const obligatoryKioku = useSetting<Character[]>("obligatoryKioku", [])
const obligatoryKiokuQuery = ref("")
const showObligatoryKiokuDropdown = ref(false)

const ignoredKioku = useSetting<Character[]>("ignoredKioku", defaultIgnoredKioku)
const ignoredKiokuQuery = ref("")
const showIgnoredKiokuDropdown = ref(false)

const filteredAttackers = computed(() => {
    const q = extraAttackerQuery.value.toLowerCase()
    return members.value.filter(m =>
        !extraAttackers.value.some(a => a.id === m.id) &&
        m.rarity !== 3 &&
        m.role !== KiokuRole.Attacker &&
        (m.name.toLowerCase().includes(q) || m.character_en.toLowerCase().includes(q) || (m.name === "Time Stop Strike" && q.startsWith("moe")))
    )
})
const filteredKioku = computed(() => {
    const q = obligatoryKiokuQuery.value.toLowerCase()
    return members.value.filter(m =>
        !obligatoryKioku.value.some(a => a.id === m.id) &&
        m.rarity !== 3 &&
        (m.name.toLowerCase().includes(q) || m.character_en.toLowerCase().includes(q) || (m.name === "Time Stop Strike" && q.startsWith("moe")))
    )
})
const filteredIgnoredKioku = computed(() => {
    const q = ignoredKiokuQuery.value.toLowerCase()
    return members.value.filter(m =>
        !ignoredKioku.value.some(a => a.id === m.id) &&
        m.rarity !== 3 &&
        (m.name.toLowerCase().includes(q) || m.character_en.toLowerCase().includes(q) || (m.name === "Time Stop Strike" && q.startsWith("moe")))
    )
})

function addExtraAttacker(char: Character) { extraAttackers.value = [...extraAttackers.value, char]; extraAttackerQuery.value = ""; showExtraAttackerDropdown.value = false }
function addObligatoryKioku(char: Character) { obligatoryKioku.value = [...obligatoryKioku.value, char]; obligatoryKiokuQuery.value = ""; showObligatoryKiokuDropdown.value = false }
function addIgnoredKioku(char: Character) { ignoredKioku.value = [...ignoredKioku.value, char]; ignoredKiokuQuery.value = ""; showIgnoredKiokuDropdown.value = false }

function removeExtraAttacker(char: Character) { extraAttackers.value = extraAttackers.value.filter(a => a.id !== char.id) }
function removeObligatoryKioku(char: Character) { obligatoryKioku.value = obligatoryKioku.value.filter(a => a.id !== char.id) }
function removeIgnoredKioku(char: Character) { ignoredKioku.value = ignoredKioku.value.filter(a => a.id !== char.id) }

function hideExtraAttackerDropdown() { setTimeout(() => (showExtraAttackerDropdown.value = false), 150) }
function hideObligatoryKiokuDropdown() { setTimeout(() => (showObligatoryKiokuDropdown.value = false), 150) }
function hideIgnoredKiokuDropdown() { setTimeout(() => (showIgnoredKiokuDropdown.value = false), 150) }

const populateTeam = (result: any[]): FinalTeam => ({
    optimized_dmg: result[0],
    crit_rate: result[1],
    alt_dmg: result[2],
    attacker: members.value.find(m => m.name === result[3])!,
    portrait: result[4],
    atk_supp: members.value.find(m => m.name === result[5])!,
    attacker_crys1: result[6],
    attacker_crys2: result[7],
    attacker_crys3: result[8],
    supp1: members.value.find(m => m.name === result[9])!,
    supp1supp: members.value.find(m => m.name === result[10]),
    supp1portrait: result[11],
    supp2: members.value.find(m => m.name === result[12])!,
    supp2supp: members.value.find(m => m.name === result[13]),
    supp2portrait: result[14],
    supp3: members.value.find(m => m.name === result[15])!,
    supp3supp: members.value.find(m => m.name === result[16]),
    supp3portrait: result[17],
    supp4: members.value.find(m => m.name === result[18])!,
    supp4supp: members.value.find(m => m.name === result[19]),
    supp4portrait: result[20],
})

const populateStatusTeam = (result: any[]) => ({
    attacker: members.value.find(m => m.name === result[0])!,
    supp1: members.value.find(m => m.name === result[1])!,
    supp2: members.value.find(m => m.name === result[2])!,
    supp3: members.value.find(m => m.name === result[3])!,
    supp4: members.value.find(m => m.name === result[4])!,
})

const sortedResults: ComputedRef<any[][]> = computed(() => [...results].sort((a, b) => b[0] - a[0]))

function mergeCells(results: any[]): FinalTeam[] {
    const merged = results.reduce((acc: any[], row: any) => {
        const key = JSON.stringify([row[3], row[4], row[5], row[9], row[10], row[11], row[12], row[13], row[14], row[15]])
        const prev = acc[acc.length - 1]
        if (prev?.key === key) {
            prev[0].push(row[0]); prev[1].push(row[1]); prev[2].push(row[2])
            prev[6].push(row[6]); prev[7].push(row[7]); prev[8].push(row[8])
        } else {
            acc.push({ ...row, 0: [row[0]], 1: [row[1]], 2: [row[2]], 6: [row[6]], 7: [row[7]], 8: [row[8]], key })
        }
        return acc
    }, [])
    merged.forEach(m => delete m.key)
    return merged.map(populateTeam)
}

const topResults = computed(() => mergeCells(sortedResults.value).slice(0, topTeams.value))

const topTeamsByAttacker = computed(() => {
    const map: Record<string, FinalTeam[]> = {}
    prevAttackers.forEach(a => {
        const filtered = sortedResults.value.filter(r => r[3] === a.name)
        if (filtered.length) map[a.name] = mergeCells(filtered).slice(0, topTeamsPerKioku.value)
    })
    const highestAtk = Object.fromEntries(Object.entries(map).map(([a, b]) => [a, Math.max(...b.map(t => t.optimized_dmg[0]))]))
    return Object.entries(map).sort((a, b) => highestAtk[b[0]] - highestAtk[a[0]])
})

async function startSimulation() {
    prevObligatoryKioku = [...obligatoryKioku.value]
    prevAttackers = [...attackers.value, ...extraAttackers.value]
    running.value = true
    results.splice(0, results.length)
    progress.value = {}

    workerRef.value = new Worker(new URL('../workers/BestTeamWorker.js', import.meta.url), { type: 'module' })

    workerRef.value.onmessage = (e) => {
        if (e.data.type === 'progress') {
            progress.value = populateStatusTeam(e.data.currChars)
            completedRuns.value = e.data.completedRuns
            expectedRuns.value = e.data.expectedTotalRuns
        } else if (e.data.type === 'done') {
            results.push(...e.data.results)
            running.value = false
            workerRef.value?.terminate()
            workerRef.value = null
        } else if (e.data.type === 'error') {
            toast.error(e.data.error, { position: toast.POSITION.TOP_RIGHT, icon: false })
            console.error("Failed to execute simulation:", e.data.error)
        }
    }

    const arenaEffectsMap: Record<string, number> = {}
    for (const { type, value } of arenaEffects.value) {
        if (!type) continue
        arenaEffectsMap[type] = (arenaEffectsMap[type] ?? 0) + value
    }
    const safeDeBufferCount = safeInt(deBufferCount.value, 3, 0, 4)

    workerRef.value.postMessage({
        options: {
            enemies: JSON.parse(JSON.stringify(enemies.enemies)),
            include4StarAttackers: include4StarAttackers.value,
            include4StarSupports: include4StarSupports.value,
            include4StarOthers: include4StarOthers.value,
            weakElements: weakElements.filter(el => el.enabled).map(el => el.name),
            onlyConsiderOnElements: onlyConsiderOnElements.value,
            activeAliments: alimentRef.value?.aliments.filter(a => a.enabled).map(a => a.name) ?? [],
            extraAttackers: extraAttackers.value.map(c => c.name),
            obligatoryKioku: obligatoryKioku.value.map(c => c.name),
            ignoredKioku: ignoredKioku.value.map(c => c.name).filter(c => !obligatoryKioku.value.map(c => c.name).includes(c)),
            deBufferCount: safeDeBufferCount,
            otherCount: Math.max(0, 4 - safeDeBufferCount),
            minHealer: safeInt(minHealer.value, 0, 0, 4),
            minDefender: safeInt(minDefender.value, 0, 0, 4),
            minBreaker: safeInt(minBreaker.value, 0, 0, 4),
            optimalSubCrys: optimalSubCrys.value,
            enabledCharacters: JSON.parse(JSON.stringify(members.value)),
            buffMultReduction: buffMultReduction.value,
            offElementBuffMultReduction: offElementBuffMultReduction.value,
            debuffMultReduction: debuffMultReduction.value,
            offElementDebuffMultReduction: offElementDebuffMultReduction.value,
            attackerHealth: attackerHealth.value,
            optimizeAverageDamage: optimizeAverageDamage.value,
            disabledOtherRoles: [...disabledOtherRoles.value],
            arenaEffectsMap,
        }
    })
}
</script>

<style scoped>
/* ── Page (shared design system) ── */
.setup-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 4rem;
}

.page-title {
    font-size: 2rem;
    margin: 0 0 1.25rem;
    color: var(--text);
}

.card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 1rem;
    margin-bottom: 0.6rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.toolbar {
    justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.12s, border-color 0.12s, color 0.12s;
    user-select: none;
}

.chip input {
    display: none;
}

.chip.active {
    background: var(--accent-glow);
    border-color: var(--border-strong);
    color: var(--accent);
}

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-right: 0.25rem;
    flex-shrink: 0;
    opacity: 0.7;
}

/* ── Buttons ── */
.btn {
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.4em 0.9em;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: var(--border-strong);
}

.btn-start {
    display: block;
    margin: 0.75rem auto 1rem;
    padding: 0.7em 2.2em;
    font-size: 1rem;
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    color: var(--accent);
}

.btn-start:hover:not(:disabled) {
    background: var(--accent-glow-strong);
    border-color: var(--accent);
}

.btn-start:disabled {
    opacity: 0.6;
    cursor: default;
}

/* ── Numeric field row ── */
.numeric-row {
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
}

.field-label {
    font-size: 0.74rem;
    color: var(--muted);
}

.field input {
    width: 90px;
}

/* ── Generic section card ── */
.section-card {
    flex-direction: column;
    align-items: stretch;
}

.section-title {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    color: var(--accent-soft);
}

.section-hint {
    margin: 0 0 0.75rem;
    font-size: 0.82rem;
    color: var(--muted);
}

.weak-elements {
    margin-top: 0.5rem;
}

.element-aliment-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 0.5rem;
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
    flex-direction: column;
}

.kioku-selector {
    margin-top: 0;
}

.selected-kioku {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    max-width: 600px;
    margin: 0 auto;
    justify-content: center;
}

.kioku-chip {
    display: flex;
    align-items: center;
    border-radius: 20px;
    padding: 0.2rem 0.5rem 0.2rem 0.2rem;
    gap: 0.4rem;
    cursor: pointer;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.82rem;
    transition: background 0.15s, border-color 0.15s;
}

.kioku-chip:hover {
    background: var(--accent-glow);
    border-color: var(--border-strong);
}

.kioku-chip img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.kioku-select {
    position: relative;
}

.kioku-select input {
    width: 100%;
    padding: 0.4rem;
    max-width: 600px;
}

.dropdown {
    position: absolute;
    z-index: 10;
    border-radius: var(--radius-sm);
    width: 80%;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 0.2rem;
    margin-left: 36px;
    background-color: var(--panel-strong);
    border: 1px solid var(--border);
}

.dropdown li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
}

.dropdown li:hover {
    background: var(--bg-soft);
}

.dropdown img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.progress-bar {
    width: 100%;
    height: 16px;
    margin-top: 8px;
    border-radius: 8px;
    overflow: hidden;
}

.progress-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.progress-text {
    font-size: 14px;
    opacity: 0.8;
}

.loading-bar {
    justify-content: center;
    flex-direction: column;
    margin: 0 auto;
    max-width: 300px;
}

.role-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    justify-items: center;
    width: 60%;
    margin: 0 auto;
}

.role-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 110%;
    text-align: center;
}

.role-box img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.role-box span {
    margin-top: 0.25rem;
    font-weight: 500;
}

.role-box input,
.role-box .number {
    margin-top: 0.25rem;
    width: 60px;
    text-align: center;
}

.role-box.role-disabled {
    opacity: 0.35;
    filter: grayscale(0.6);
    transition: opacity 0.2s, filter 0.2s;
}

.role-box.role-disabled span {
    text-decoration: line-through;
    opacity: 0.7;
}

.total-box {
    font-weight: bold;
}

.icons {
    height: 40px;
}

.gallery-page {
    padding-bottom: 400px;
}
</style>
