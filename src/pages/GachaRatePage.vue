<script setup>
import { ref, watch, onMounted } from 'vue'
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

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
)

const rate = ref(.75)
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
                probAtLeastJ(p, t, rate.value / 100)
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
        sparkInterval,
        softPityAt,
        softPityRate,
    ],
    renderChart
)

onMounted(renderChart)
</script>

<template>
    <div class="controls">
        <label>
            Pickup Rate (%)
            <input type="number" v-model.number="rate" />
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
    height: 600px;
    width: 100%;
}
</style>
