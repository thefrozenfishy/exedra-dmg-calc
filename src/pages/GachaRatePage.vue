<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js'
import { useSetting } from '../store/settingsStore'
import CharacterSelector from '../components/CharacterSelector.vue'
import { useCharacterStore } from '../store/characterStore'

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
)

const pickupCharacter = useSetting("pickupCharacter", undefined)
const showFullHistory = ref(false)

const characterStore = useCharacterStore()
const eligible3stars = computed(() =>
    characterStore.characters.filter(c => c.rarity === 3)
)
const eligible4stars = computed(() =>
    characterStore.characters.filter(c => c.rarity === 4)
)
const eligible5stars = computed(() => characterStore.characters.filter(c => c.name !== pickupCharacter.value?.name && (c.rarity === 5 && c.name !== 'Lux☆Magica' && new Date() > new Date(c.permaDate))))

const rate = ref(3)
const pickupRate = ref(.75)
const sparkInterval = ref(200)
const softPityAt = ref(100)
const softPityRate = ref(12)

const canvasRef = ref(null)
let chart

const curveColors = [
    '#4CC9F0', // cyan
    '#4895EF', // blue
    '#4361EE', // indigo
    '#7209B7', // purple
    '#F72585', // pink
    '#FFB703'  // amber
]


function combination(n, k) {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    let res = 1
    for (let i = 1; i <= k; i++) {
        res *= (n - i + 1) / i
    }
    return res
}

function binomial(n, k, p) {
    return (
        combination(n, k) *
        Math.pow(p, k) *
        Math.pow(1 - p, n - k)
    )
}

function probAtLeastJ(pullIdx, targetCopies, p) {
    const remaining =
        targetCopies - Math.floor(pullIdx / sparkInterval.value)

    if (remaining <= 0) return 1.0

    let failProb = 0
    for (let k = 0; k < remaining; k++) {
        failProb += binomial(pullIdx, k, p)
    }

    let prob = 1 - failProb

    if (pullIdx >= softPityAt.value) {
        prob += (1 - prob) * (softPityRate.value / 100) / remaining
    }

    return Math.min(prob, 1.0)
}

function renderChart() {
    if (chart) chart.destroy()

    const labels = Array.from({ length: 1000 }, (_, i) => i)

    const datasets = []

    for (let t = 1; t <= 6; t++) {
        datasets.push({
            label: `a${t}+`,
            data: labels.map(p =>
                probAtLeastJ(p, t, pickupRate.value / 100)
            ),
            borderColor: curveColors[t - 1],
            backgroundColor: curveColors[t - 1],
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2
        })
    }

    chart = new Chart(canvasRef.value, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            animation: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label(ctx) {
                            const x = ctx.parsed.x
                            const y = (ctx.parsed.y * 100).toFixed(2)
                            return `${ctx.dataset.label} — Pulls: ${x}, Prob: ${y}%`
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Pulls'
                    }
                },
                y: {
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Probability'
                    },
                    ticks: {
                        callback: v => `${Math.round(v * 100)}%`
                    }
                }
            }
        }
    })
}

watch(
    [
        rate,
        pickupRate,
        sparkInterval,
        softPityAt,
        softPityRate,
    ],
    renderChart
)

onMounted(renderChart)

const simPulls = ref(0)
const blueCount = ref(0)
const purpleCount = ref(0)
const goldCount = ref(0)
const rateUpCount = ref(0)

const pullResults = ref([])
let last_pull_count = 0

const visiblePulls = computed(() => {
    const list = pullResults.value
    return showFullHistory.value
        ? list
        : list.slice(0, last_pull_count)
})


function pull(blueToPurple = false) {
    simPulls.value++
    console.log(`Pull #${simPulls.value}`, blueToPurple)

    let result = { isRateUp: false }

    const hitRoll = Math.random()

    if (pickupCharacter.value && hitRoll < pickupRate.value / 100) {
        result.rarity = 5
        result.isRateUp = true
        result.char = pickupCharacter.value
    } else if (hitRoll < rate.value / 100) {
        result.rarity = 5
        result.char = eligible5stars.value[
            Math.floor(Math.random() * eligible5stars.value.length)
        ]
    } else if (blueToPurple || hitRoll < 0.15) {
        result.rarity = 4
        result.char = eligible4stars.value[
            Math.floor(Math.random() * eligible4stars.value.length)
        ]
    } else {
        result.rarity = 3
        result.char = eligible3stars.value[
            Math.floor(Math.random() * eligible3stars.value.length)
        ]
    }

    if (result.rarity === 3) blueCount.value++
    if (result.rarity === 4) purpleCount.value++
    if (result.rarity === 5) goldCount.value++
    if (result.isRateUp) rateUpCount.value++

    pullResults.value.unshift(result)
}

function pullSingle() {
    last_pull_count = 1
    pull(true)
}

function pullTen() {
    last_pull_count = 10
    for (let i = 0; i < 10; i++) {
        pull(i === 0)
    }
}

function pullHundred() {
    last_pull_count = 100
    for (let i = 0; i < 100; i++) {
        pull((i % 10) === 0)
    }
}

function resetSimulator() {
    simPulls.value = 0

    blueCount.value = 0
    purpleCount.value = 0
    goldCount.value = 0
    rateUpCount.value = 0

    pullResults.value = []
}
</script>

<template>
    <div class="controls">
        <label>
            Pickup Rate (%)
            <input type="number" v-model.number="pickupRate" step="0.01" />
        </label>

        <label>
            Spark Interval
            <input type="number" v-model.number="sparkInterval" />
        </label>

        <label>
            100 Gauge Soft Pity Pull at
            <input type="number" v-model.number="softPityAt" />
        </label>

        <label>
            100 Gauge Soft Pity Rate (%)
            <input type="number" v-model.number="softPityRate" />
        </label>
    </div>

    <div class="chart-wrapper">
        <canvas ref="canvasRef"></canvas>
    </div>

    <div class="controls">
        <label>
            SSR Rate (%)
            <input type="number" v-model.number="rate" step="0.01" />
        </label>

        <div class="control">
            <span class="control-label">Pickup Character</span>
            <CharacterSelector :selected="pickupCharacter" @select="pickupCharacter = $event"
                :filter="c => c.rarity === 5 && c.name !== 'Lux☆Magica'" />
        </div>
    </div>

    <div class="simulator">
        <h3>🎰 Gacha Simulator</h3>

        <div class="sim-controls">
            <button @click="pullSingle">1 Pull</button>
            <button @click="pullTen">10 Pulls</button>
            <button @click="pullHundred">100 Pulls</button>
            <button class="reset" @click="resetSimulator"> Reset </button>
        </div>

        <div class="sim-stats">
            <div>Total: {{ simPulls }}</div>
            <div>🔵 3★: {{ blueCount }}</div>
            <div>🟣 4★: {{ purpleCount }}</div>
            <div>🟡 5★: {{ goldCount }}</div>
            <div>⭐ Rate-up: {{ rateUpCount }}</div>
        </div>

        <div class="history-header">
            <button class="history-toggle" @click="showFullHistory = !showFullHistory">
                {{ showFullHistory ? 'Hide full history' : 'Show full history' }}
                ({{ pullResults.length }} pulls)
            </button>
        </div>

        <div class="pull-grid">
            <template v-for="(p, i) in visiblePulls" :key="i">
                <div v-if="i % 10 === 0 && i !== 0" class="ten-separator">
                    {{ pullResults.length - i }} pulls ago
                </div>

                <div class="pull-card"
                    :class="{ 'gold-card': p.rarity === 5, 'plat-card': p.isRateUp }">
                    <div :title="p.char?.name">
                        <a :href="`https://exedra.wiki/wiki/${p.char?.name}`" target="_blank">
                            <img class="pull-img" :class="{
                                'blue-border': p.rarity === 3,
                                'purple-border': p.rarity === 4,
                                'gold-border': p.rarity === 5
                            }" :src="`/exedra-dmg-calc/kioku_images/${p.char?.id}_thumbnail.png`" />
                            <div v-if="p.isRateUp" class="rateup-badge">
                                UP
                            </div>
                        </a>
                    </div>
                </div>
            </template>
        </div>

    </div>
</template>


<style scoped>
.controls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
}

label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
}

.chart-wrapper {
    position: relative;
}

.simulator {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 8px;
    background: #1e1e1e;
}

.simulator {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.simulator h3 {
    margin-bottom: 0.75rem;
}

.sim-controls {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.sim-controls button {
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    background: #333;
    color: white;
    border: none;
    cursor: pointer;
}

.sim-controls button:hover {
    background: #444;
}

.sim-controls .reset {
    margin-left: auto;
    background: #552222;
}

.sim-stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
}

.sim-log {
    max-height: 200px;
    overflow-y: auto;
    font-size: 0.8rem;
    background: #141414;
    padding: 0.5rem;
    border-radius: 4px;
}

.log-entry {
    opacity: 0.9;
}

.pull-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
}

.pull-card {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.pull-card:hover {
    transform: scale(1.05);
    transition: transform 0.15s ease-in-out;
}

.pull-img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 4px solid transparent;
    object-fit: cover;
}

.blue-border {
    border-color: #4cc9f0;
}

.purple-border {
    border-color: #9b5de5;
}

.gold-border {
    border-color: #fcbf49;
}

.gold-card {
    background: linear-gradient(145deg, rgba(252, 191, 73, 0.2), rgba(252, 191, 73, 0.35));
    box-shadow: 0 0 10px rgba(252, 191, 73, 0.5);
}

.plat-card {
    background: linear-gradient(145deg, rgba(99, 126, 161, 0.2), rgba(255, 255, 255, 0.35));
    box-shadow: 0 0 12px rgba(176, 196, 222, 0.6);
}

.rateup-badge {
    position: absolute;
    bottom: 0px;
    right: -4px;
    background: gold;
    color: black;
    font-size: 0.7em;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 6px;
}

.control {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: 0.25rem;
}

.history-header {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
}

.history-toggle {
    background: #2a2a2a;
    color: #ddd;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-size: 0.85rem;
}

.history-toggle:hover {
    background: #333;
}

.ten-separator {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 0.7rem;
    color: #888;
    padding: 0.25rem 0;
    border-top: 1px dashed #333;
    border-bottom: 1px dashed #333;
}
</style>
