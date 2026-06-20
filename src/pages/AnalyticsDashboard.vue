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

    <section class="analytics-section errors-section">
      <div class="section-header">
        <h2>
          <span class="error-icon">⚠</span>
          Errors
          <span v-if="errorRows.length" class="error-badge">{{ errorRows.length }}</span>
        </h2>
        <div>
          <label>
            Last:
            <select v-model="selectedWindow">
              <option v-for="option in windowOptions" :key="option" :value="option">{{ option }} days</option>
            </select>
          </label>
          <button @click="refresh" style="margin-left:12px">Refresh</button>
        </div>
      </div>
      <div v-if="errorRows.length === 0" class="no-errors">
        ✓ No errors in this window
      </div>
      <table v-else class="analytics-table">
        <thead>
          <tr>
            <th style="width:160px">Last seen</th>
            <th style="width:60px">Count</th>
            <th style="width:140px">Users</th>
            <th>Message</th>
            <th>Stack / Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(err, index) in errorRows" :key="index" class="error-row"
            :class="{ expanded: expandedErrors.has(err.key) }" @click="toggleErrorExpanded(err.key)">
            <td class="mono">{{ err.lastSeen }}</td>
            <td>
              <span v-if="err.count > 1" class="count-badge">{{ err.count }}</span>
              <span v-else>1</span>
            </td>
            <td class="mono dim">
              <span v-for="(u, i) in err.users" :key="u" class="user-tag">{{ u }}</span>
            </td>
            <td class="error-message-cell">{{ err.message }}</td>
            <td class="mono dim stack-cell">
              <span v-if="!expandedErrors.has(err.key)" class="stack-truncated">
                {{ err.page }}<br />
                {{ err.stack ? err.stack.split('\n')[0].slice(0, 80) + (err.stack.length > 80 ||
                  err.stack.includes('\n') ? '…' : '') : '—' }}
              </span>
              <span v-else class="stack-full">{{ err.stack || '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
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
            Page:
            <select v-model="selectedPage">
              <option value="all">All</option>
              <option v-for="p in pageOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label style="margin-left:12px">
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

type ErrorGroup = {
  message: string
  stack: string
  users: string[]
  count: number
  lastSeen: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const rows = ref<AnalyticsRowWithDisplay[]>([])
const totalEvents = computed(() => rows.value.length)
const eventRows = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of filteredRows.value) {
    counts[row.event] = (counts[row.event] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const expandedErrors = ref<Set<string>>(new Set())

const toggleErrorExpanded = (key: string) => {
  const next = new Set(expandedErrors.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedErrors.value = next
}

const errorRows = computed<(ErrorGroup & { key: string })[]>(() => {
  const errorEvents = rows.value.filter(r => r.event === 'js_error' || r.event === 'console_error')

  const groups = new Map<string, ErrorGroup & { userSet: Set<string> }>()

  for (const row of errorEvents) {
    const message = row.metadata?.message ?? String(row.metadata ?? '')
    const stack = row.metadata?.stack ?? row.metadata?.source ?? ''
    const page = row.metadata?.page ?? 'Unknown page'
    const key = message

    const existing = groups.get(key)
    const ts = new Date(row.created_at)

    if (existing) {
      existing.count++
      existing.userSet.add(row.display_user)
      if (ts > new Date(existing.lastSeen)) {
        existing.lastSeen = row.created_at
        existing.stack = stack
      }
    } else {
      groups.set(key, {
        message,
        stack,
        users: [],
        userSet: new Set([row.display_user]),
        count: 1,
        lastSeen: row.created_at,
        page,
      })
    }
  }

  return [...groups.entries()]
    .map(([key, g]) => ({ ...g, key, users: [...g.userSet] }))
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .map(g => ({
      ...g,
      lastSeen: new Date(g.lastSeen).toLocaleString(),
    }))
})

const selectedUser = ref<string>('all')
const selectedEvent = ref<string>('all')
const selectedPage = ref<string>('all')
const selectedWindow = ref<number>(3)
const windowOptions = [1, 3, 7, 14, 30, 90]

const getDisplayUser = (row: AnalyticsRowWithDisplay) => row.display_user

const userOptions = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of rows.value) {
    if (selectedEvent.value !== 'all' && r.event !== selectedEvent.value) continue
    const user = getDisplayUser(r)
    counts[user] = (counts[user] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([user]) => user)
})

const eventOptions = computed(() => [...new Set(rows.value.map(r => r.event))].sort())

const pageOptions = computed(() => {
  const pages = new Set<string>()
  for (const row of rows.value) {
    if (row.event === 'page_view') {
      const path = normalizePagePath(row.metadata?.path || row.metadata?.route || 'unknown')
      pages.add(path)
    }
  }
  return [...pages].sort()
})

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
    if (selectedPage.value !== 'all' && path !== selectedPage.value) continue
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
    if (selectedPage.value !== 'all') {
      const userMap: Record<string, Record<string, number>> = {}
      for (const row of filteredRows.value) {
        if (row.event !== 'page_view') continue
        const path = normalizePagePath(row.metadata?.path || row.metadata?.route || 'unknown')
        if (path !== selectedPage.value) continue
        const user = getDisplayUser(row)
        const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
        userMap[user] = userMap[user] ?? {}
        userMap[user][dateKey] = (userMap[user][dateKey] ?? 0) + 1
      }

      return Object.entries(userMap)
        .map(([user, data]) => ({
          user,
          total: Object.values(data).reduce((sum, count) => sum + count, 0),
          data,
        }))
        .sort((a, b) => b.total - a.total || a.user.localeCompare(b.user))
        .map((entry, idx) => ({
          label: entry.user,
          data: labels.map(date => entry.data[date] ?? 0),
          backgroundColor: getColorForIndex(idx),
        }))
    }

    const userMap: Record<string, Record<string, number>> = {}
    for (const row of filteredRows.value) {
      const user = getDisplayUser(row)
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
      userMap[user] = userMap[user] ?? {}
      userMap[user][dateKey] = (userMap[user][dateKey] ?? 0) + 1
    }

    return Object.entries(userMap)
      .map(([user, data]) => ({
        user,
        total: Object.values(data).reduce((sum, count) => sum + count, 0),
        data,
      }))
      .sort((a, b) => b.total - a.total || a.user.localeCompare(b.user))
      .map((entry, idx) => ({
        label: entry.user,
        data: labels.map(date => entry.data[date] ?? 0),
        backgroundColor: getColorForIndex(idx),
      }))
  }

  const pageRows = filteredRows.value.filter(row => row.event === 'page_view')
  if (pageRows.length > 0) {
    const pageMap: Record<string, Record<string, number>> = {}
    for (const row of pageRows) {
      const path = normalizePagePath(row.metadata?.path || row.metadata?.route || 'unknown')
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
      pageMap[path] = pageMap[path] ?? {}
      pageMap[path][dateKey] = (pageMap[path][dateKey] ?? 0) + 1
    }

    return Object.entries(pageMap)
      .map(([path, data]) => ({
        path,
        total: Object.values(data).reduce((sum, count) => sum + count, 0),
        data,
      }))
      .sort((a, b) => b.total - a.total || a.path.localeCompare(b.path))
      .map((entry, idx) => ({
        label: entry.path,
        data: labels.map(date => entry.data[date] ?? 0),
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

watch([rows, selectedUser, selectedEvent, selectedPage], () => {
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
  color: var(--text);
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem;
}

.errors-section {
  border-color: rgba(220, 38, 38, 0.18);
  background: rgba(255, 255, 255, 0.06);
}

.errors-section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  color: var(--danger);
  font-size: 1.1rem;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.9);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 0.5rem;
  min-width: 1.4rem;
  height: 1.4rem;
  margin-left: 0.25rem;
}

.no-errors {
  color: var(--success);
  padding: 0.75rem 0;
  font-size: 0.95rem;
}

.error-row {
  cursor: pointer;
  transition: background 0.15s;
}

.error-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.error-row.expanded {
  background: rgba(220, 38, 38, 0.07);
}

.error-row td {
  vertical-align: top;
}

.user-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.75rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.error-message-cell {
  color: var(--danger);
  word-break: break-word;
  max-width: 320px;
}

.stack-cell {
  font-size: 0.75rem;
  max-width: 240px;
  color: var(--muted);
}

.stack-truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 240px;
}

.stack-full {
  white-space: pre-wrap;
  word-break: break-all;
  display: block;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.18);
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 0 0.4rem;
  min-width: 1.6rem;
  height: 1.4rem;
}

.mono {
  font-family: monospace;
  font-size: 0.82rem;
}

.dim {
  color: var(--muted);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.analytics-table th {
  color: var(--text);
}

.analytics-table pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--muted);
}

button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.error-message {
  color: var(--danger);
}
</style>
