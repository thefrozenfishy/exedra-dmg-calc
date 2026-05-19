<template>
  <div class="analytics-page">
    <section class="analytics-summary">
      <h1>Analytics Dashboard</h1>
      <p>Recent event activity for your app.</p>
      <div class="summary-grid">
        <div class="summary-card">
          <strong>{{ totalEvents }}</strong>
          <span>Total events loaded</span>
        </div>
        <div class="summary-card">
          <strong>{{ uniqueEventCount }}</strong>
          <span>Event types</span>
        </div>
        <div class="summary-card">
          <strong>{{ uniqueUsersCount }}</strong>
          <span>Unique users in sample</span>
        </div>
      </div>
    </section>

    <section class="analytics-section">
      <div class="section-header">
        <h2>Activity timeline</h2>
        <div>
          <label>
            Last:
            <select v-model="selectedWindow">
              <option v-for="option in windowOptions" :key="option" :value="option">{{ option }} days</option>
            </select>
          </label>
          <label style="margin-left:12px">
            User:
            <select v-model="selectedUser">
              <option value="all">All</option>
              <option v-for="u in userOptions" :key="u" :value="u">{{ u }}</option>
            </select>
          </label>
          <label style="margin-left:12px">
            Event:
            <select v-model="selectedEvent">
              <option value="all">All</option>
              <option v-for="e in eventOptions" :key="e" :value="e">{{ e }}</option>
            </select>
          </label>
          <button @click="refresh" style="margin-left:12px">Refresh</button>
        </div>
      </div>

      <div class="chart-wrapper">
        <canvas ref="timelineChartRef" />
      </div>

      <table class="analytics-table" style="margin-top:12px">
        <thead>
          <tr>
            <th>Date</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([date, count], index) in timelineRows" :key="index">
            <td>{{ date }}</td>
            <td>{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="analytics-section">
      <div class="section-header">
        <h2>Page views</h2>
        <div>
          <label>
            User:
            <select v-model="selectedUser">
              <option value="all">All</option>
              <option v-for="u in userOptions" :key="u" :value="u">{{ u }}</option>
            </select>
          </label>
          <button @click="refresh" style="margin-left:12px">Refresh</button>
        </div>
      </div>

      <div class="chart-wrapper">
        <canvas ref="pageChartRef" />
      </div>

      <table class="analytics-table" style="margin-top:12px">
        <thead>
          <tr>
            <th>Path</th>
            <th>Views</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([path, count], index) in pageViewRows" :key="index">
            <td>{{ path }}</td>
            <td>{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="analytics-section">
      <div class="section-header">
        <h2>Top events</h2>
      </div>
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([event, count], index) in eventRows" :key="index">
            <td>{{ event }}</td>
            <td>{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="analytics-section">
      <div class="section-header">
        <h2>Top users</h2>
      </div>
      <table class="analytics-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Event count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([user, count], index) in topUserRows" :key="index">
            <td>{{ user }}</td>
            <td>{{ count }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getSupabase } from '../utils/supabase'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

type AnalyticsRow = {
  id: string
  user_id: string | null
  event: string
  metadata: any
  created_at: string
}

type AnalyticsRowWithDisplay = AnalyticsRow & {
  display_user: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const rows = ref<AnalyticsRowWithDisplay[]>([])
const totalEvents = computed(() => rows.value.length)
const eventRows = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of rows.value) {
    counts[row.event] = (counts[row.event] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const selectedUser = ref<string>('all')
const selectedEvent = ref<string>('all')
const selectedWindow = ref<number>(7)
const windowOptions = [3, 7, 14, 30, 90]

const getDisplayUser = (row: AnalyticsRowWithDisplay) => row.display_user

const userOptions = computed(() => {
  const set = new Set<string>()
  for (const r of rows.value) set.add(getDisplayUser(r))
  return [...set].sort()
})

const eventOptions = computed(() => [...new Set(rows.value.map(r => r.event))].sort())

const filteredRows = computed(() => rows.value.filter(r => {
  if (selectedUser.value !== 'all' && getDisplayUser(r) !== selectedUser.value) return false
  if (selectedEvent.value !== 'all' && r.event !== selectedEvent.value) return false
  return true
}))

const normalizePagePath = (path: string) => path.split('?')[0].replace(/\/+$/, '') || '/'

const pageViewRows = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of rows.value) {
    if (selectedUser.value !== 'all' && getDisplayUser(row) !== selectedUser.value) continue
    if (row.event !== 'page_view') continue
    const rawPath = row.metadata?.path || row.metadata?.route || 'unknown'
    const path = normalizePagePath(rawPath)
    counts[path] = (counts[path] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const timelineLabels = computed(() => {
  const dates = new Set<string>()
  for (const row of filteredRows.value) {
    dates.add(new Date(row.created_at).toISOString().slice(0, 10))
  }
  return [...dates].sort()
})

const timelineRows = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of filteredRows.value) {
    const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
    counts[dateKey] = (counts[dateKey] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
})

const timelineSeries = computed(() => {
  const labels = timelineLabels.value
  if (selectedUser.value === 'all') {
    const userMap: Record<string, Record<string, number>> = {}
    for (const row of filteredRows.value) {
      const user = getDisplayUser(row)
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
      userMap[user] = userMap[user] ?? {}
      userMap[user][dateKey] = (userMap[user][dateKey] ?? 0) + 1
    }

    return Object.keys(userMap).sort().map((user, idx) => ({
      label: user,
      data: labels.map(date => userMap[user][date] ?? 0),
      backgroundColor: getColorForIndex(idx),
    }))
  }

  const userCounts: Record<string, number> = {}
  for (const row of filteredRows.value) {
    const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
    userCounts[dateKey] = (userCounts[dateKey] ?? 0) + 1
  }

  return [{
    label: selectedUser.value,
    data: labels.map(date => userCounts[date] ?? 0),
    backgroundColor: '#38bdf8',
  }]
})

const uniqueEventCount = computed(() => new Set(rows.value.map(r => r.event)).size)
const uniqueUsersCount = computed(() => new Set(rows.value.map(r => getDisplayUser(r))).size)
const topUserRows = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of rows.value) {
    const user = getDisplayUser(row)
    counts[user] = (counts[user] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20)
})

let pageChart: Chart | null = null
let timelineChart: Chart | null = null
const pageChartRef = ref<HTMLCanvasElement | null>(null)
const timelineChartRef = ref<HTMLCanvasElement | null>(null)

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const getColorForIndex = (index: number) => {
  const hue = (index * 57) % 360
  return `hsla(${hue}, 70%, 55%, 0.85)`
}

const renderPageChart = async () => {
  await nextTick()
  if (!pageChartRef.value) return
  pageChart?.destroy()

  const labels = pageViewRows.value.map(p => p[0])
  const data = pageViewRows.value.map(p => p[1])
  const colors = pageViewRows.value.map((_, idx) => getColorForIndex(idx))

  pageChart = new Chart(pageChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Page views', data, backgroundColor: colors }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxRotation: 45, minRotation: 0 } } }
    }
  })
}

const renderTimelineChart = async () => {
  await nextTick()
  if (!timelineChartRef.value) return
  timelineChart?.destroy()

  const labels = timelineLabels.value
  const datasets = timelineSeries.value

  timelineChart = new Chart(timelineChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { stacked: true, ticks: { maxRotation: 45, minRotation: 0 } },
        y: { stacked: true, beginAtZero: true }
      }
    }
  })
}

watch([rows, selectedUser, selectedEvent], () => {
  renderPageChart()
  renderTimelineChart()
})

const fetchAnalytics = async () => {
  loading.value = true
  error.value = null

  try {
    const supabase = getSupabase()
    const windowStart = new Date(Date.now() - selectedWindow.value * 86400000).toISOString()
    const pageSize = 1000
    let offset = 0
    const fetchedRows: AnalyticsRow[] = []

    while (true) {
      const { data, error: fetchError } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', windowStart)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (fetchError) throw fetchError
      if (!data || data.length === 0) break

      fetchedRows.push(...data)
      if (data.length < pageSize) break
      offset += pageSize
    }

    rows.value = fetchedRows.map((row: AnalyticsRow) => ({
      ...row,
      display_user: row.user_id ?? 'anonymous'
    })) as AnalyticsRowWithDisplay[]

    // map user_id -> friend_id (public identifier) via RPC; fallback to uuid
    try {
      const userIds = Array.from(new Set(rows.value.map(r => r.user_id).filter(Boolean))) as string[]
      if (userIds.length) {
        const { data: ids, error: idsErr } = await supabase.rpc('get_public_identifiers', { target_user_ids: userIds })

        if (!idsErr && ids) {
          const map = Object.fromEntries((ids as any[]).map((p: any) => [p.user_id, p.public_id]))
          rows.value = rows.value.map(r => ({ ...r, display_user: r.user_id ? (map[r.user_id] ?? r.user_id) : 'anonymous' }))
        } else {
          rows.value = rows.value.map(r => ({ ...r, display_user: r.user_id ?? 'anonymous' }))
        }
      } else {
        rows.value = rows.value.map(r => ({ ...r, display_user: r.user_id ?? 'anonymous' }))
      }
    } catch (err) {
      rows.value = rows.value.map(r => ({ ...r, display_user: r.user_id ?? 'anonymous' }))
    }
  } catch (err: any) {
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

const refresh = () => fetchAnalytics()

watch(selectedWindow, fetchAnalytics)
onMounted(fetchAnalytics)
</script>

<style scoped>
.analytics-page {
  max-width: 1024px;
  margin: 0 auto;
  color: #ddd;
}

.analytics-summary {
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-card {
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 14px;
  padding: 1rem;
}

.summary-card strong {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.analytics-section {
  margin-bottom: 2rem;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 14px;
  padding: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.analytics-table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table th,
.analytics-table td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #3a3a3a;
}

.analytics-table th {
  color: #f1f1f1;
}

.analytics-table pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #ccc;
}

button {
  background: #4a4a4a;
  border: 1px solid #666;
  color: #fff;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
}

button:hover {
  background: #5e5e5e;
}

.error-message {
  color: #ff6b6b;
}
</style>
