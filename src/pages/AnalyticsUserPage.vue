<template>
  <div class="setup-page user-inspector">
    <h1 class="page-title">Inspect User</h1>

    <section class="card lookup-card">
      <label class="lookup-label">Friend code or user ID</label>
      <input v-model="searchInput" class="lookup-input" placeholder="e.g. ABCDE or a full user ID"
        @keydown.enter="goToUser(searchInput)" />
      <button @click="goToUser(searchInput)">Go</button>
      <button class="ghost-btn" @click="router.back()">← Back</button>
    </section>
    <p v-if="searchError" class="error-message">{{ searchError }}</p>

    <template v-if="resolvedUserId">
      <section class="card identity-card">
        <div class="identity-main">
          <strong>{{ identity?.displayName || 'Unnamed player' }}</strong>
          <span v-if="identity?.publicId" class="identity-code">{{ identity.publicId }}</span>
        </div>
        <span class="identity-raw mono dim">{{ resolvedUserId }}</span>
        <button class="icon-btn" :title="linkCopied ? 'Copied!' : 'Copy link to this view'" @click="copyLink">
          {{ linkCopied ? 'Copied!' : 'Copy link' }}
        </button>
      </section>

      <p v-if="loadError" class="error-message">{{ loadError }}</p>

      <section v-if="!loading" class="summary-grid">
        <div class="summary-card">
          <strong>{{ rows.length }}</strong>
          <span>Events loaded</span>
        </div>
        <div class="summary-card">
          <strong>{{ errorCount }}</strong>
          <span>Errors in range</span>
        </div>
        <div class="summary-card">
          <strong>{{ firstSeenLabel }}</strong>
          <span>Earliest loaded</span>
        </div>
        <div class="summary-card">
          <strong>{{ lastSeenLabel }}</strong>
          <span>Most recent</span>
        </div>
      </section>

      <section v-if="eventBreakdown.length" class="card breakdown-card">
        <span class="filters-heading">Event types</span>
        <span v-for="[event, count] in eventBreakdown" :key="event" class="chip breakdown-chip"
          :class="{ 'is-error': ERROR_EVENTS.has(event) }">
          {{ event }} · {{ count }}
        </span>
      </section>

      <section class="card filters">
        <label class="chip" :class="{ active: onlyErrors }">
          <input type="checkbox" v-model="onlyErrors" /> Only errors
        </label>
      </section>

      <div v-if="loading" class="loading-state">Loading activity…</div>

      <section v-else class="timeline-section">
        <div class="section-header">
          <h2>Actions in series</h2>
        </div>

        <button v-if="hasMore" class="load-older" :disabled="loadingMore" @click="loadOlder">
          {{ loadingMore ? 'Loading…' : 'Load earlier activity' }}
        </button>
        <p v-else-if="rows.length" class="timeline-edge">— start of recorded activity —</p>

        <p v-if="!rows.length" class="no-errors">No recorded activity for this user yet.</p>

        <div v-else class="timeline">
          <div v-for="row in visibleRows" :key="row.id" class="timeline-row" :class="{
            'is-error': isErrorEvent(row),
            expanded: expanded.has(row.id)
          }" @click="toggleExpanded(row.id)">
            <div class="timeline-time mono dim">{{ formatTime(row.created_at) }}</div>
            <div class="timeline-body">
              <div class="timeline-head">
                <span class="event-badge" :class="{ 'is-error': isErrorEvent(row) }">{{ row.event }}</span>
                <span class="timeline-summary" :class="{ 'error-message-cell': isErrorEvent(row) }">
                  {{ summarize(row) }}
                </span>
              </div>
              <pre v-if="expanded.has(row.id)" class="timeline-meta">{{ prettyMetadata(row) }}</pre>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSupabase } from '../utils/supabase'

type AnalyticsRow = {
  id: string
  user_id: string | null
  event: string
  metadata: any
  created_at: string
}

type Cursor = { created_at: string; id: string }

const ERROR_EVENTS = new Set(['js_error', 'console_error'])
const FRIEND_CODE_RE = /^[A-Z0-9]{5}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAGE_SIZE = 200

const route = useRoute()
const router = useRouter()

const searchInput = ref('')
const searchError = ref<string | null>(null)

const resolvedUserId = ref<string | null>(null)
const identity = ref<{ publicId: string; displayName: string | null } | null>(null)

const rows = ref<AnalyticsRow[]>([]) // kept in ascending (chronological) order
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const loadError = ref<string | null>(null)
const oldestCursor = ref<Cursor | null>(null)

const expanded = ref<Set<string>>(new Set())
const onlyErrors = ref(false)
const linkCopied = ref(false)

const isErrorEvent = (row: AnalyticsRow) => ERROR_EVENTS.has(row.event)

const toggleExpanded = (id: string) => {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

const visibleRows = computed(() =>
  onlyErrors.value ? rows.value.filter(isErrorEvent) : rows.value
)

const errorCount = computed(() => rows.value.filter(isErrorEvent).length)

const formatTime = (iso: string) => new Date(iso).toLocaleString()

const firstSeenLabel = computed(() => rows.value.length ? formatTime(rows.value[0].created_at) : '—')
const lastSeenLabel = computed(() => rows.value.length ? formatTime(rows.value[rows.value.length - 1].created_at) : '—')

const eventBreakdown = computed(() => {
  const counts: Record<string, number> = {}
  for (const row of rows.value) {
    counts[row.event] = (counts[row.event] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const normalizePagePath = (path: string) => path.split('?')[0].replace(/\/+$/, '') || '/'

function summarize(row: AnalyticsRow): string {
  if (isErrorEvent(row)) {
    return row.metadata?.message ?? String(row.metadata ?? 'Unknown error')
  }
  if (row.event === 'page_view') {
    return normalizePagePath(row.metadata?.path || row.metadata?.route || 'unknown')
  }
  if (!row.metadata || (typeof row.metadata === 'object' && Object.keys(row.metadata).length === 0)) {
    return '—'
  }
  const compact = JSON.stringify(row.metadata)
  return compact.length > 120 ? compact.slice(0, 120) + '…' : compact
}

function prettyMetadata(row: AnalyticsRow): string {
  if (isErrorEvent(row)) {
    const lines = [`Message: ${row.metadata?.message ?? '—'}`]
    if (row.metadata?.page) lines.push(`Page: ${row.metadata.page}`)
    lines.push('', row.metadata?.stack || row.metadata?.source || 'No stack trace recorded.')
    return lines.join('\n')
  }
  try {
    return JSON.stringify(row.metadata ?? {}, null, 2)
  } catch {
    return String(row.metadata)
  }
}

// Accepts either a full user_id (uuid) or a 5-character friend code.
// Friend codes need a lookup since analytics.user_id stores the uuid, not the
// public code, and public.users can't be read cross-account without the RPC
// from 0019_get_user_id_by_friend_id.sql.
async function resolveInput(raw: string): Promise<string> {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Enter a friend code or user ID')

  if (UUID_RE.test(trimmed)) return trimmed

  const code = trimmed.toUpperCase()
  if (FRIEND_CODE_RE.test(code)) {
    const supabase = getSupabase()
    const { data, error } = await supabase.rpc('get_user_id_by_friend_id', { target_friend_id: code })
    if (error) {
      throw new Error(`Couldn't resolve friend code "${code}": ${error.message}`)
    }
    if (!data) {
      throw new Error(`No user found for friend code "${code}"`)
    }
    return data as string
  }

  throw new Error('Enter a 5-character friend code or a full user ID')
}

async function loadIdentity(userId: string) {
  const supabase = getSupabase()
  try {
    const { data: idData, error: idErr } = await supabase.rpc('get_public_identifiers', { target_user_ids: [userId] })
    if (idErr || !idData?.length) {
      identity.value = { publicId: userId, displayName: null }
      return
    }
    const publicId = idData[0].public_id as string
    let displayName: string | null = null
    if (FRIEND_CODE_RE.test(publicId)) {
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('display_name')
        .eq('friend_id', publicId)
        .maybeSingle()
      displayName = profile?.display_name || null
    }
    identity.value = { publicId, displayName }
  } catch {
    identity.value = { publicId: userId, displayName: null }
  }
}

async function fetchPage(userId: string, before: Cursor | null): Promise<AnalyticsRow[]> {
  const supabase = getSupabase()
  let query = supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE)

  if (before) {
    query = query.or(
      `created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

async function loadInitial(userId: string) {
  loading.value = true
  loadError.value = null
  rows.value = []
  hasMore.value = true
  oldestCursor.value = null
  expanded.value = new Set()

  try {
    const page = await fetchPage(userId, null)
    rows.value = [...page].reverse()
    if (page.length < PAGE_SIZE) {
      hasMore.value = false
    } else {
      const oldest = page[page.length - 1]
      oldestCursor.value = { created_at: oldest.created_at, id: oldest.id }
    }
  } catch (err: any) {
    loadError.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

async function loadOlder() {
  if (!resolvedUserId.value || !hasMore.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const page = await fetchPage(resolvedUserId.value, oldestCursor.value)
    if (page.length === 0) {
      hasMore.value = false
      return
    }
    rows.value = [...page].reverse().concat(rows.value)
    if (page.length < PAGE_SIZE) {
      hasMore.value = false
    } else {
      const oldest = page[page.length - 1]
      oldestCursor.value = { created_at: oldest.created_at, id: oldest.id }
    }
  } catch (err: any) {
    loadError.value = err?.message || String(err)
  } finally {
    loadingMore.value = false
  }
}

function goToUser(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return
  router.replace({ query: { ...route.query, user: trimmed } })
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 1500)
  } catch {
    // clipboard access denied/unavailable - not worth surfacing an error for
  }
}

watch(() => route.query.user, async (val) => {
  const raw = typeof val === 'string' ? val : Array.isArray(val) ? val[0] : null
  searchInput.value = raw ?? ''
  searchError.value = null
  resolvedUserId.value = null
  identity.value = null
  rows.value = []

  if (!raw) return

  let userId: string
  try {
    userId = await resolveInput(raw)
  } catch (err: any) {
    searchError.value = err?.message || String(err)
    return
  }

  resolvedUserId.value = userId
  await Promise.all([loadIdentity(userId), loadInitial(userId)])
}, { immediate: true })
</script>

<style scoped>
/* ── Page (shared design system) ── */
.setup-page {
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

button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.12);
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}

.ghost-btn {
  margin-left: auto;
}

.error-message {
  color: var(--danger);
}

.no-errors {
  color: var(--success);
  padding: 0.75rem 0;
  font-size: 0.95rem;
}

.mono {
  font-family: monospace;
  font-size: 0.82rem;
}

.dim {
  color: var(--muted);
}

/* ── Lookup bar ── */
.lookup-card {
  gap: 0.75rem;
}

.lookup-label {
  font-size: 0.8rem;
  color: var(--muted);
  flex-shrink: 0;
}

.lookup-input {
  flex: 1 1 220px;
  min-width: 180px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  font-family: monospace;
}

/* ── Identity ── */
.identity-card {
  justify-content: flex-start;
}

.identity-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.identity-main strong {
  font-size: 1.1rem;
  color: var(--text);
}

.identity-code {
  font-family: monospace;
  color: var(--accent-soft);
  background: var(--accent-glow);
  border-radius: 6px;
  padding: 0.1rem 0.45rem;
  font-size: 0.85rem;
}

.identity-raw {
  margin-left: 0.25rem;
}

.icon-btn {
  margin-left: auto;
  font-size: 0.78rem;
  padding: 0.35rem 0.65rem;
}

/* ── Summary ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem;
}

.summary-card strong {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.summary-card span {
  color: var(--muted);
  font-size: 0.85rem;
}

/* ── Event breakdown ── */
.breakdown-card {
  align-items: center;
}

.breakdown-chip {
  cursor: default;
  color: var(--muted);
}

.breakdown-chip.is-error {
  border-color: rgba(220, 38, 38, 0.35);
  color: var(--danger);
}

/* ── Timeline ── */
.timeline-section {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.loading-state {
  color: var(--muted);
  padding: 1rem 0;
}

.load-older {
  display: block;
  width: 100%;
  margin-bottom: 0.75rem;
}

.timeline-edge {
  text-align: center;
  color: var(--muted);
  font-size: 0.8rem;
  margin: 0 0 0.75rem;
  opacity: 0.7;
}

.timeline-row {
  display: flex;
  gap: 1rem;
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.15s;
}

.timeline-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.timeline-row.is-error {
  background: rgba(220, 38, 38, 0.05);
}

.timeline-row.is-error.expanded {
  background: rgba(220, 38, 38, 0.09);
}

.timeline-time {
  flex-shrink: 0;
  width: 150px;
  padding-top: 0.15rem;
}

.timeline-body {
  flex: 1;
  min-width: 0;
}

.timeline-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.event-badge {
  font-family: monospace;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--muted);
  border-radius: 6px;
  padding: 0.1rem 0.4rem;
  flex-shrink: 0;
}

.event-badge.is-error {
  background: rgba(220, 38, 38, 0.18);
  border-color: rgba(220, 38, 38, 0.3);
  color: var(--danger);
}

.timeline-summary {
  word-break: break-word;
}

.error-message-cell {
  color: var(--danger);
}

.timeline-meta {
  margin: 0.5rem 0 0;
  padding: 0.6rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--muted);
}
</style>
