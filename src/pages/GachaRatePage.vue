<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
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
import { toPng } from "html-to-image"
import { copyCanvasToClipboard, useClipboardSupport, openCanvasInImage, downloadCanvas } from '../utils/image'

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
const eligible5stars = computed(() =>
    characterStore.characters.filter(c =>
        c.name !== pickupCharacter.value?.name &&
        (c.rarity === 5 && c.name !== 'Lux☆Magica' && new Date() > new Date(c.permaDate))
    )
)

const rate = ref(3)
const pickupRate = ref(.75)
const sparkInterval = ref(200)
const sparkIntervalReduction = ref(0)
const softPityAt = ref(100)
const softPityRate = ref(12)
const isDualPickup = ref(false)
const hasRetryingSoftPity = ref(false)

const sparkPoints = computed(() => {
    let currentPull = 0
    let currentInterval = sparkInterval.value
    let points = new Set()
    while (currentPull + currentInterval <= 1000 && currentInterval > 0) {
        currentPull += currentInterval
        points.add(currentPull)
        currentInterval -= sparkIntervalReduction.value
    }
    return points;
})
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

const STATE = { ELIGIBLE: 0, LOCKED: 1 }

function computeDPTable(maxPulls, maxCopies) {
    const pickupP = pickupRate.value / 100
    const softP = softPityRate.value / 100

    let dp = Array.from({ length: maxCopies + 1 }, () => [0, 0])
    dp[0][STATE.ELIGIBLE] = 1

    const result = Array.from({ length: maxPulls + 1 }, () =>
        Array(maxCopies + 1).fill(0)
    )

    for (let p = 1; p <= maxPulls; p++) {
        let afterNormal = Array.from({ length: maxCopies + 1 }, () => [0, 0])

        for (let k = 0; k <= maxCopies; k++) {
            for (let s = 0; s <= 1; s++) {
                const prob = dp[k][s]
                if (prob === 0) continue

                const nk = Math.min(k + 1, maxCopies)

                afterNormal[nk][s] += prob * pickupP
                afterNormal[k][s] += prob * (1 - pickupP)
            }
        }

        const isSoftWindow =
            (hasRetryingSoftPity.value
                ? (p >= softPityAt.value && p % 10 === 0)
                : (p === softPityAt.value)
            )

        let afterSoft = Array.from({ length: maxCopies + 1 }, () => [0, 0])

        for (let k = 0; k <= maxCopies; k++) {
            for (let s = 0; s <= 1; s++) {
                const prob = afterNormal[k][s]
                if (prob === 0) continue

                const nk = Math.min(k + 1, maxCopies)

                if (isSoftWindow && s === STATE.ELIGIBLE) {
                    const trigger = prob * softP
                    const noTrigger = prob * (1 - softP)

                    if (trigger > 0) {
                        if (isDualPickup.value) {
                            const success = trigger * 0.5
                            const fail = trigger * 0.5

                            afterSoft[nk][STATE.LOCKED] += success
                            afterSoft[k][STATE.LOCKED] += fail
                        } else {
                            afterSoft[nk][STATE.LOCKED] += trigger
                        }
                    }

                    afterSoft[k][s] += noTrigger

                } else {
                    afterSoft[k][s] += prob
                }
            }
        }

        let next = Array.from({ length: maxCopies + 1 }, () => [0, 0])

        if (sparkPoints.value.has(p)) {
            for (let k = 0; k <= maxCopies; k++) {
                for (let s = 0; s <= 1; s++) {
                    const prob = afterSoft[k][s]
                    if (prob === 0) continue

                    const nk = Math.min(k + 1, maxCopies)
                    next[nk][s] += prob
                }
            }
        } else {
            next = afterSoft
        }

        dp = next

        for (let k = 0; k <= maxCopies; k++) {
            let sum = 0
            for (let kk = k; kk <= maxCopies; kk++) {
                sum += dp[kk][0] + dp[kk][1]
            }
            result[p][k] = Math.min(sum, 1)
        }
    }

    return result
}

function renderChart() {
    if (chart) chart.destroy()

    const labels = Array.from({ length: 1000 }, (_, i) => i)

    const dpTable = computeDPTable(1000, 6)

    const datasets = []

    for (let t = 1; t <= 6; t++) {
        datasets.push({
            label: `a${t - 1}+`,
            data: labels.map(p => dpTable[p][t]),
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
        sparkIntervalReduction,
        softPityAt,
        softPityRate,
        isDualPickup,
        hasRetryingSoftPity
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
let last_pull_count = ref(0)
let image_idx_zero = ref(0)

const visiblePulls = computed(() => {
    const list = pullResults.value
    return showFullHistory.value
        ? list
        : list.slice(image_idx_zero.value, last_pull_count.value)
})

function pull(blueToPurple = false) {
    simPulls.value++
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
    last_pull_count.value = 1
    pull(false)
}

function pullTen() {
    last_pull_count.value = 10
    for (let i = 0; i < 10; i++) {
        pull(i === 0)
    }
}

function pullHundred() {
    last_pull_count.value = 100
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

const downloadImg = async (blob, filename = "screenshot.png") => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

const waitForImages = async (container) => {
    const images = Array.from(container.querySelectorAll("img.pull-img"));
    await Promise.all(images.map(img => {
        if (img.complete) return;
        return new Promise(resolve => {
            img.onload = img.onerror = resolve;
        });
    }));
};

const captureElement = async (el) => {
    const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#1e1e1e",
        skipFonts: false,
        width: el.offsetWidth,
        height: el.offsetHeight + 15,
    })

    const img = new Image()

    await new Promise((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = dataUrl
    })

    const canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No canvas context")

    ctx.drawImage(img, 0, 0)

    return canvas
}

const captureChunks = async () => {
    const canvases = []

    if (!showFullHistory.value) {
        const el = document.querySelector(".pull-grid")
        if (el) {
            await waitForImages(el)
            canvases.push(await captureElement(el))
        }
        return canvases
    }

    const originalCount = last_pull_count.value
    showFullHistory.value = false

    const step_size = Math.min(
        200,
        20 * Math.ceil(pullResults.value.length / (5 * 20))
    )

    for (let i = 0; i < pullResults.value.length; i += step_size) {
        last_pull_count.value = i + step_size
        image_idx_zero.value = i

        await nextTick()

        const el = document.querySelector(".pull-grid")
        if (!el) continue

        await waitForImages(el)
        canvases.push(await captureElement(el))
    }

    last_pull_count.value = originalCount
    image_idx_zero.value = 0
    showFullHistory.value = true

    return canvases
}

const captureImageOfHistory = async () => {
    const canvases = await captureChunks()

    const totalWidth = canvases.reduce((sum, c) => sum + c.width, 0)
    const maxHeight = Math.max(...canvases.map(c => c.height))

    const finalCanvas = document.createElement("canvas")
    finalCanvas.width = totalWidth
    finalCanvas.height = maxHeight

    const ctx = finalCanvas.getContext("2d")
    if (!ctx) return finalCanvas

    let x = 0
    for (const c of canvases) {
        ctx.drawImage(c, x, 0)
        x += c.width
    }

    return finalCanvas
}

const imgName = computed(() =>
    `Gacha ${showFullHistory.value ? pullResults.value.length : last_pull_count.value} pulls ${rate.value}-${pickupRate.value} rates ${pickupCharacter.value ? pickupCharacter.value.name : 'no'} pickup.png`
);

const { clipboardSupported } = useClipboardSupport()

const copyFullHistoryHorizontal = async () => {
    const canvas = await captureImageOfHistory()
    await copyCanvasToClipboard(imgName.value, canvas)
}

const openFullHistoryHorizontalNewTab = async () => {
    const canvas = await captureImageOfHistory()
    await openCanvasInImage(canvas)
}

const downloadFullHistoryHorizontal = async () => {
    const canvas = await captureImageOfHistory()
    await downloadCanvas(imgName.value, canvas)
}
</script>

<template>
    <div class="setup-page">
        <h1 class="page-title">Gacha Rate Simulator</h1>

        <section class="card numeric-row">
            <span class="filters-heading">Spark Curve</span>
            <label class="field">
                <span class="field-label">Pickup Rate (%)</span>
                <input type="number" v-model.number="pickupRate" step="0.01" />
            </label>
            <label class="field">
                <span class="field-label">Spark Interval</span>
                <input type="number" v-model.number="sparkInterval" />
            </label>
            <label class="field">
                <span class="field-label">Spark Interval Reduction</span>
                <input type="number" v-model.number="sparkIntervalReduction" />
            </label>
            <label class="field">
                <span class="field-label">100 Gauge Soft Pity At</span>
                <input type="number" v-model.number="softPityAt" />
            </label>
            <label class="field">
                <span class="field-label">100 Gauge Soft Pity Rate (%)</span>
                <input type="number" v-model.number="softPityRate" />
            </label>

            <label class="chip" :class="{ active: isDualPickup }">
                <input type="checkbox" v-model.boolean="isDualPickup" /> Dual pickup
            </label>
            <label class="chip" :class="{ active: hasRetryingSoftPity }">
                <input type="checkbox" v-model.boolean="hasRetryingSoftPity" /> Retrying soft pity
            </label>
        </section>

        <div class="chart-wrapper">
            <canvas ref="canvasRef"></canvas>
        </div>

        <section class="card numeric-row">
            <span class="filters-heading">Pickup</span>
            <label class="field">
                <span class="field-label">SSR Rate (%)</span>
                <input type="number" v-model.number="rate" step="0.01" />
            </label>

            <div class="field">
                <span class="field-label">Pickup Character</span>
                <CharacterSelector :selected="pickupCharacter" @select="pickupCharacter = $event"
                    :filter="c => c.rarity === 5 && c.name !== 'Lux☆Magica'" />
            </div>
        </section>

        <div class="simulator">
            <h3 class="section-title">🎰 Gacha Simulator</h3>

            <div class="sim-controls">
                <button class="btn btn-accent" @click="pullSingle">1 Pull</button>
                <button class="btn btn-accent" @click="pullTen">10 Pulls</button>
                <button class="btn btn-accent" @click="pullHundred">100 Pulls</button>
                <button class="btn reset" @click="resetSimulator"> Reset </button>
            </div>

            <div class="sim-stats">
                <div class="stat-pill">Total: <strong>{{ simPulls }}</strong></div>
                <div class="stat-pill">🔵 3★: <strong>{{ blueCount }}</strong></div>
                <div class="stat-pill">🟣 4★: <strong>{{ purpleCount }}</strong></div>
                <div class="stat-pill">🟡 5★: <strong>{{ goldCount }}</strong></div>
                <div class="stat-pill">⭐ Rate-up: <strong>{{ rateUpCount }}</strong></div>
            </div>

            <div class="history-header">
                <button class="btn history-toggle" @click="showFullHistory = !showFullHistory">
                    {{ showFullHistory ? 'Hide full history' : 'Show full history' }}
                    ({{ pullResults.length }} pulls)
                </button>
                <button class="btn history-toggle"
                    @click="clipboardSupported ? copyFullHistoryHorizontal() : openFullHistoryHorizontalNewTab()">
                    {{ clipboardSupported ? 'Copy image to clipboard' : 'Open image in new tab' }}
                </button>
                <button class="btn history-toggle" @click="downloadFullHistoryHorizontal">Download</button>
            </div>

            <div class="pull-grid">
                <template v-for="(p, i) in visiblePulls" :key="i">
                    <div v-if="i % 10 === 0 && i !== 0" class="ten-separator">
                        {{ pullResults.length - i }} pulls ago
                    </div>

                    <div class="pull-card" :class="{ 'gold-card': p.rarity === 5, 'plat-card': p.isRateUp }">
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
    </div>
</template>


<style scoped>
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
    gap: 0.75rem;
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

.section-title {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    color: var(--accent-soft);
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

.btn-accent {
    background: var(--accent-glow);
    border: 1px solid var(--border-strong);
    color: var(--accent);
}

.btn-accent:hover {
    background: var(--accent-glow-strong);
    border-color: var(--accent);
}

.numeric-row {
    align-items: flex-end;
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

.field input[type="number"] {
    width: 100px;
}

.chart-wrapper {
    position: relative;
    margin-bottom: 0.6rem;
}

.simulator {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--panel);
    width: 100%;
    display: flex;
    flex-direction: column;
}

.sim-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 0.85rem;
}

.sim-controls .reset {
    margin-left: auto;
    border-color: var(--danger);
    color: var(--danger);
}

.sim-controls .reset:hover {
    background: rgba(255, 155, 143, 0.35);
}

.sim-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 0.85rem;
}

.stat-pill {
    font-size: 0.85rem;
    color: var(--muted);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 0.25rem 0.7rem;
}

.stat-pill strong {
    color: var(--text);
    font-weight: 700;
}

.sim-log {
    max-height: 200px;
    overflow-y: auto;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    padding: 0.5rem;
    border-radius: 4px;
}

.pull-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
    padding: 16px;
    box-sizing: border-box;
}

@media (max-width: 480px) {
    .pull-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        padding: 8px;
    }
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
    border-color: var(--tier-blue);
}

.purple-border {
    border-color: var(--tier-purple);
}

.gold-border {
    border-color: var(--tier-gold);
}

.gold-card {
    background: linear-gradient(145deg, rgba(252, 191, 73, 0.2), rgba(252, 191, 73, 0.35));
    box-shadow: 0 0 10px rgba(252, 191, 73, 0.5);
}

.plat-card {
    background: linear-gradient(145deg, rgba(255, 223, 0, 0.3), rgba(255, 223, 0, 0.5));
    box-shadow: 0 0 15px rgba(255, 223, 0, 0.8);
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

.history-header {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.history-toggle {
    font-size: 0.85rem;
}

.ten-separator {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 0.7rem;
    color: var(--muted);
    padding: 0.25rem 0;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}
</style>
