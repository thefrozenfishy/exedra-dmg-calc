<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { useSetting } from '../store/settingsStore'
import CharacterSelector from '../components/CharacterSelector.vue'
import { useCharacterStore } from '../store/characterStore'
import { toPng } from "html-to-image"
import { copyCanvasToClipboard, useClipboardSupport, openCanvasInImage, downloadCanvas } from '../utils/image'
import { LuxMagica } from '../types/enums'

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Tooltip,
    Legend,
    Filler
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
        (c.rarity === 5 && c.name !== LuxMagica && c.isStandardChar)
    )
)

const rate = ref(3)
const pickupRate = ref(.75)
const sparkInterval = ref(200)
const sparkIntervalReduction = ref(0)
const softPityAt = ref(100)
const softPityRate = ref(60)
const isDualPickup = ref(false)
const hasRetryingSoftPity = ref(true)

const stepUpEnabled = useSetting('stepUpEnabled', false)
const step1Cost = ref(1500)
const step2Cost = ref(2000)
const step2Rate = ref(5)
const step3Cost = ref(3000)
const step3Rate = ref(10)
const bonusRateUpChance = ref(10)

const bannerPreset = useSetting('bannerPreset', 'limited')

const BANNER_PRESETS = {
    limited: {
        label: 'Limited',
        hasRetryingSoftPity: true,
        softPityRate: 60,
        bonusRateUpChance: 10,
    },
    standard: {
        label: 'Standard',
        hasRetryingSoftPity: true,
        softPityRate: 60,
        bonusRateUpChance: 100,
    },
    legacy: {
        label: 'Legacy',
        hasRetryingSoftPity: false,
        softPityRate: 12,
        bonusRateUpChance: 10,
    },
}

function applyBannerPreset(preset) {
    const config = BANNER_PRESETS[preset]
    if (!config) return

    bannerPreset.value = preset
    hasRetryingSoftPity.value = config.hasRetryingSoftPity
    softPityRate.value = config.softPityRate
    bonusRateUpChance.value = config.bonusRateUpChance
}

const xAxisMode = ref('pulls') // 'pulls' | 'gems'

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

const MAX_PULLS = 999
const PULL_GRID_STEP = 50
const GEM_GRID_STEP = 20000
const PROB_GRID_STEP = 0.1

function isSoftPityWindow(p) {
    return hasRetryingSoftPity.value
        ? (p >= softPityAt.value && p % 10 === 0)
        : (p === softPityAt.value)
}

function computeDPTable(maxPulls, maxCopies) {
    const pickupP = pickupRate.value / 100
    const softP = softPityRate.value / 100
    const bonusP = bonusRateUpChance.value / 100

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

        const isSoftWindow = isSoftPityWindow(p)

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

        if (stepUpEnabled.value && p === 30) {
            let afterBonus = Array.from({ length: maxCopies + 1 }, () => [0, 0])

            for (let k = 0; k <= maxCopies; k++) {
                for (let s = 0; s <= 1; s++) {
                    const prob = dp[k][s]
                    if (prob === 0) continue

                    const nk = Math.min(k + 1, maxCopies)

                    afterBonus[nk][s] += prob * bonusP
                    afterBonus[k][s] += prob * (1 - bonusP)
                }
            }

            dp = afterBonus
        }

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

function ssrRateForPull(p) {
    if (stepUpEnabled.value && p <= 30) {
        if (p <= 10) return rate.value
        if (p <= 20) return step2Rate.value
        return step3Rate.value
    }
    return rate.value
}

function gemCostForPull(p) {
    if (stepUpEnabled.value && p <= 30) {
        if (p <= 10) return step1Cost.value / 10
        if (p <= 20) return step2Cost.value / 10
        return step3Cost.value / 10
    }
    return 300
}

function computeExpectedSSRCounts(maxPulls) {
    const counts = new Array(maxPulls + 1).fill(0)
    let cum = 0

    for (let p = 1; p <= maxPulls; p++) {
        cum += ssrRateForPull(p) / 100

        if (stepUpEnabled.value && p === 30) {
            cum += 1
        }

        if (p === 50) {
            cum += 1
        }

        if (p === 100 && hasRetryingSoftPity.value) {
            cum += 1
        }

        if (p === 100) {
            // TODO: This is to model the soft pity thing, so it should prolly not be static at 100 but instead use something similar to the isSoftWindow to find the end logic
            cum += 1
        }

        if (sparkPoints.value.has(p)) {
            cum += 1
        }

        counts[p] = cum
    }

    return counts
}

function computeCumulativeGems(maxPulls) {
    const gems = new Array(maxPulls + 1).fill(0)
    let cum = 0

    for (let p = 1; p <= maxPulls; p++) {
        cum += gemCostForPull(p)
        gems[p] = cum
    }

    return gems
}

function renderChart() {
    if (chart) chart.destroy()

    const dpTable = computeDPTable(MAX_PULLS, 6)
    const ssrCounts = computeExpectedSSRCounts(MAX_PULLS)
    const gemsCum = computeCumulativeGems(MAX_PULLS)

    const xValues = xAxisMode.value === 'gems' ? gemsCum : Array.from({ length: MAX_PULLS + 1 }, (_, i) => i)

    const datasets = []

    datasets.push({
        label: 'Expected SSR Count',
        data: xValues.map((x, p) => ({ x, y: ssrCounts[p] })),
        borderColor: '#e1bf87',
        backgroundColor: '#e1bf87',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.15,
        yAxisID: 'y1',
    })

    for (let t = 1; t <= 6; t++) {
        datasets.push({
            label: `a${t - 1}+`,
            data: xValues.map((x, p) => ({ x, y: dpTable[p][t] })),
            borderColor: curveColors[t - 1],
            backgroundColor: curveColors[t - 1],
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2,
            yAxisID: 'y'
        })
    }

    chart = new Chart(canvasRef.value, {
        type: 'line',
        data: { datasets },
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
                            const p = ctx.dataIndex
                            const gems = Math.round(gemsCum[p] ?? 0)
                            const where = `${p} pulls / ${gems.toLocaleString(undefined, {
                                notation: "compact",
                                maximumFractionDigits: 1,
                            })} gems`

                            if (ctx.dataset.yAxisID === 'y1') {
                                return `${ctx.dataset.label} — ${where}: ${ctx.parsed.y.toFixed(2)} SSRs`
                            }

                            const y = (ctx.parsed.y * 100).toFixed(2)
                            return `${ctx.dataset.label} — ${where}: ${y}%`
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: xAxisMode.value === 'gems' ? 'Gems Spent' : 'Number of Pulls'
                    },
                    ticks: {
                        stepSize: xAxisMode.value === 'gems' ? GEM_GRID_STEP : PULL_GRID_STEP,
                        callback: v => xAxisMode.value === 'gems' ? Number(v).toLocaleString() : v
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Probability'
                    },
                    ticks: {
                        stepSize: PROB_GRID_STEP,
                        callback: v => `${Math.round(v * 100)}%`
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 50,
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Expected SSR Count'
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
        hasRetryingSoftPity,
        stepUpEnabled,
        step1Cost,
        step2Cost,
        step2Rate,
        step3Cost,
        step3Rate,
        bonusRateUpChance,
        xAxisMode
    ],
    renderChart
)

onMounted(renderChart)

const simPulls = ref(0)
const simGemsSpent = ref(0)
const blueCount = ref(0)
const purpleCount = ref(0)
const goldCount = ref(0)
const rateUpCount = ref(0)
const softPityWindowLocked = ref(false)

const TAG_LABELS = {
    pity: 'SOFT PITY',
    stepup: 'STEPUP BONUS',
    halfpity: '50-KEY',
    gauge: '100-GAUGE/KEY',
    spark: 'SPARK',
}

const pullResults = ref([])
let last_pull_count = ref(0)
let image_idx_zero = ref(0)

const visiblePulls = computed(() => {
    const list = pullResults.value
    const raw = showFullHistory.value
        ? list
        : list.slice(image_idx_zero.value, last_pull_count.value)

    let realSeen = 0
    let pendingSeparator = false

    return raw.map((p) => {
        const separatorPullsAgo = pendingSeparator ? realSeen : null
        pendingSeparator = false

        if (!p.tag) {
            realSeen++
            if (realSeen % 10 === 0) pendingSeparator = true
        }

        return { ...p, separatorPullsAgo }
    })
})

function rollStandardGoldChar() {
    return {
        rarity: 5,
        isRateUp: false,
        char: eligible5stars.value[Math.floor(Math.random() * eligible5stars.value.length)]
    }
}

function recordResult(result) {
    if (result.rarity === 3) blueCount.value++
    if (result.rarity === 4) purpleCount.value++
    if (result.rarity === 5) goldCount.value++
    if (result.isRateUp) rateUpCount.value++

    pullResults.value.unshift(result)
}

function grantBonuses(p) {
    if (p === 50) {
        recordResult({ ...rollStandardGoldChar(), tag: 'halfpity' })
    }

    if (hasRetryingSoftPity.value) {
        if (p === softPityAt.value) {
            recordResult({ ...rollStandardGoldChar(), tag: 'gauge' })
        }
    }

    if (pickupCharacter.value && sparkPoints.value.has(p)) {
        recordResult({ rarity: 5, isRateUp: true, char: pickupCharacter.value, tag: 'spark' })
    }
}

function pull(blueToPurple = false) {
    simPulls.value++
    const p = simPulls.value

    const ssrRate = ssrRateForPull(p)
    simGemsSpent.value += gemCostForPull(p)

    const softPityOpen = pickupCharacter.value
        && isSoftPityWindow(p)
        && !softPityWindowLocked.value

    let result = { isRateUp: false, tag: null }

    const hitRoll = Math.random()

    if (pickupCharacter.value && hitRoll < pickupRate.value / 100) {
        result.rarity = 5
        result.isRateUp = true
        result.char = pickupCharacter.value
    } else if (!softPityOpen && hitRoll < ssrRate / 100) {
        result.rarity = 5
        result.char = eligible5stars.value[
            Math.floor(Math.random() * eligible5stars.value.length)
        ]
    } else if (blueToPurple || hitRoll >= 0.83) { // 17% for purple
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

    recordResult(result)

    if (softPityOpen) {
        if (Math.random() < softPityRate.value / 100) {
            softPityWindowLocked.value = true
            recordResult({ rarity: 5, isRateUp: true, char: pickupCharacter.value, tag: 'pity' })
        } else {
            let extra = { isRateUp: false, tag: 'pity' }
            if (hasRetryingSoftPity.value) {
                if (hitRoll >= 0.83) { // 17% for purple
                    extra.rarity = 4
                    extra.char = eligible4stars.value[
                        Math.floor(Math.random() * eligible4stars.value.length)
                    ]
                } else {
                    extra.rarity = 3
                    extra.char = eligible3stars.value[
                        Math.floor(Math.random() * eligible3stars.value.length)
                    ]
                }
            } else {
                extra = {...rollStandardGoldChar(), ...extra}
                softPityWindowLocked.value = true
            }
            console.log("Addds extra", extra)
            recordResult(extra)
        }
    }

    grantBonuses(p)

    if (stepUpEnabled.value && p === 30) {
        const isPickup = pickupCharacter.value && Math.random() < bonusRateUpChance.value / 100
        recordResult({
            rarity: 5,
            isRateUp: !!isPickup,
            char: isPickup
                ? pickupCharacter.value
                : eligible5stars.value[Math.floor(Math.random() * eligible5stars.value.length)],
            tag: 'stepup'
        })
    }
}

function pullSingle() {
    const before = pullResults.value.length
    pull(false)
    last_pull_count.value = pullResults.value.length - before
}

function pullTen() {
    const before = pullResults.value.length
    for (let i = 0; i < 10; i++) {
        pull(i === 0)
    }
    last_pull_count.value = pullResults.value.length - before
}

function pullHundred() {
    const before = pullResults.value.length
    for (let i = 0; i < 100; i++) {
        pull((i % 10) === 0)
    }
    last_pull_count.value = pullResults.value.length - before
}

function resetSimulator() {
    simPulls.value = 0
    simGemsSpent.value = 0
    blueCount.value = 0
    purpleCount.value = 0
    goldCount.value = 0
    rateUpCount.value = 0
    softPityWindowLocked.value = false
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

        <section class="card banner-presets">
            <span class="filters-heading">Banner Preset</span>
            <div class="segmented">
                <button v-for="(preset, key) in BANNER_PRESETS" :key="key" type="button" class="segment"
                    :class="{ active: bannerPreset === key }" @click="applyBannerPreset(key)">
                    {{ preset.label }}
                </button>
            </div>
            <span class="preset-description">
                {{ BANNER_PRESETS[bannerPreset].hasRetryingSoftPity
                    ? `${BANNER_PRESETS[bannerPreset].softPityRate}% repeating soft pity`
                    : `${BANNER_PRESETS[bannerPreset].softPityRate}% 100-gauge pity`
                }} · Step-up pickup {{ BANNER_PRESETS[bannerPreset].bonusRateUpChance }}%
            </span>
        </section>

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

        <section class="card numeric-row">
            <span class="filters-heading">Step-Up Banner</span>
            <label class="chip" :class="{ active: stepUpEnabled }">
                <input type="checkbox" v-model.boolean="stepUpEnabled" /> Enable step-up
            </label>

            <label class="field">
                <span class="field-label">Step 1 Gem Cost</span>
                <input type="number" v-model.number="step1Cost" />
            </label>
            <label class="field">
                <span class="field-label">Step 2 Gem Cost</span>
                <input type="number" v-model.number="step2Cost" />
            </label>
            <label class="field">
                <span class="field-label">Step 2 SSR Rate (%)</span>
                <input type="number" v-model.number="step2Rate" step="0.01" />
            </label>
            <label class="field">
                <span class="field-label">Step 3 Gem Cost</span>
                <input type="number" v-model.number="step3Cost" />
            </label>
            <label class="field">
                <span class="field-label">Step 3 SSR Rate (%)</span>
                <input type="number" v-model.number="step3Rate" step="0.01" />
            </label>
            <label class="field">
                <span class="field-label">Bonus Rate-up Chance (%)</span>
                <input type="number" v-model.number="bonusRateUpChance" />
            </label>
        </section>

        <div class="chart-toolbar">
            <span class="filters-heading">X-Axis</span>
            <div class="segmented">
                <button type="button" class="segment" :class="{ active: xAxisMode === 'pulls' }"
                    @click="xAxisMode = 'pulls'">Pulls</button>
                <button type="button" class="segment" :class="{ active: xAxisMode === 'gems' }"
                    @click="xAxisMode = 'gems'">Gems Spent</button>
            </div>
        </div>

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
                    :filter="c => c.rarity === 5 && c.name !== LuxMagica" />
            </div>
        </section>

        <div class="simulator">
            <h3 style="margin: 0;" class="section-title">Gacha Simulator</h3>
            <p style="margin: 0;" class="ten-separator">Using the settings displayed in the graph above</p>

            <div class="sim-controls">
                <button class="btn btn-accent" @click="pullSingle">1 Pull</button>
                <button class="btn btn-accent" @click="pullTen">10 Pulls</button>
                <button class="btn btn-accent" @click="pullHundred">100 Pulls</button>
                <button class="btn reset" @click="resetSimulator"> Reset </button>
            </div>

            <div class="sim-stats">
                <div class="stat-pill">Total: <strong>{{ simPulls }}</strong> pulls</div>
                <div class="stat-pill"><strong>{{ Math.round(simGemsSpent).toLocaleString() }}</strong> gems</div>
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
                    <div v-if="p.separatorPullsAgo !== null" class="ten-separator">
                        {{ p.separatorPullsAgo }} pulls ago
                    </div>

                    <div v-if="p.tag" class="special-row" :class="`row-${p.tag}`">
                        <span class="special-row-label">{{ TAG_LABELS[p.tag] }}</span>
                        <a :href="`https://exedra.wiki/wiki/${p.char?.name}`" target="_blank" :title="p.char?.name"
                            class="special-row-link">
                            <img class="pull-img special-row-img" :class="{
                                'blue-border': p.rarity === 3,
                                'purple-border': p.rarity === 4,
                                'gold-border': p.rarity === 5
                            }" :src="`/exedra-dmg-calc/kioku_images/${p.char?.id}_thumbnail.png`" />
                        </a>
                        <span class="special-row-name">{{ p.char?.name }}</span>
                        <span v-if="p.isRateUp" class="special-row-uptext">Rate-up</span>
                    </div>

                    <div v-else class="pull-card" :class="{ 'gold-card': p.rarity === 5, 'plat-card': p.isRateUp }">
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

.banner-presets {
    align-items: center;
}

.preset-description {
    font-size: 0.76rem;
    color: var(--muted);
    opacity: 0.85;
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

.hint {
    flex-basis: 100%;
    margin: 0.25rem 0 0;
    font-size: 0.76rem;
    line-height: 1.4;
    color: var(--muted);
    opacity: 0.85;
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

.chart-toolbar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
}

.segmented {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
}

.segment {
    border: none;
    background: transparent;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 600;
    font-family: inherit;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
}

.segment:not(:last-child) {
    border-right: 1px solid var(--border);
}

.segment.active {
    background: var(--accent-glow);
    color: var(--accent);
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
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
    padding: 16px;
    box-sizing: border-box;
}

@media (max-width: 480px) {
    .pull-grid {
        gap: 0.5rem;
        padding: 8px;
    }
}

.pull-card {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    flex: 0 0 calc((100% - 4 * 0.75rem) / 5);
    box-sizing: border-box;
}

@media (max-width: 480px) {
    .pull-card {
        flex: 0 0 calc((100% - 3 * 0.5rem) / 4);
    }
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

.special-row {
    flex: 1 0 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.3rem 0.75rem;
    border-radius: 10px;
    border: 1px dashed var(--border-strong);
    font-size: 0.78rem;
}

.special-row-label {
    font-weight: bold;
    font-size: 0.66rem;
    letter-spacing: 0.03em;
    padding: 2px 6px;
    border-radius: 6px;
    color: #1e1e1e;
    white-space: nowrap;
}

.special-row-img {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
}

.special-row-name {
    color: var(--text);
    font-weight: 600;
}

.special-row-uptext {
    color: gold;
    font-size: 0.7rem;
    font-weight: bold;
}

.row-pity {
    background: rgba(185, 131, 255, 0.12);
}

.row-pity .special-row-label {
    background: #b983ff;
}

.row-stepup {
    background: rgba(255, 143, 163, 0.12);
}

.row-stepup .special-row-label {
    background: #ff8fa3;
}

.row-halfpity {
    background: rgba(126, 232, 250, 0.12);
}

.row-halfpity .special-row-label {
    background: #7ee8fa;
}

.row-gauge {
    background: rgba(76, 201, 240, 0.12);
}

.row-gauge .special-row-label {
    background: #4cc9f0;
}

.row-spark {
    background: rgba(255, 209, 102, 0.12);
}

.row-spark .special-row-label {
    background: #ffd166;
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
    flex: 1 0 100%;
    text-align: center;
    font-size: 0.7rem;
    color: var(--muted);
    padding: 0.25rem 0;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}
</style>
