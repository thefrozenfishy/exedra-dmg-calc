<template>
  <section class="card section-card solver-card">
    <h2 class="section-title">Fight Solver</h2>
    <p class="hint-text">Searches your decisions (Battle Skill or Basic Attack, when to fire each ultimate, every ally-side
      target) for the clear that takes the least AV, with the team above and the Battle Simulator's RNG setting. Enemies
      keep their normal AI. Depth-first, best-looking branch first; a branch stops once it can't beat the best clear,
      and paths that reach a state already seen with no more AV are merged.</p>

    <div class="solver-controls">
      <label class="field inline" title="Stop after this many tree nodes (the search can be continued)"><span
          class="field-label">Node limit</span>
        <input v-model.number="maxNodes" type="number" min="100" step="1000" /></label>
      <label class="field inline" title="Don't explore past this AV (0 = no cap)"><span class="field-label">AV cap</span>
        <input v-model.number="maxAv" type="number" min="0" step="50" /></label>
      <label class="check" title="Merge paths that reach the same battle state (same HP, gauges, buffs, SP...) with no less AV">
        <input v-model="memo" type="checkbox" /> Merge equal states</label>
      <label class="check" title="End a path as a defeat as soon as any of your units is down (much smaller search; clears that need a sacrifice are not found)">
        <input v-model="stopOnAllyDeath" type="checkbox" /> Stop when an ally dies</label>
    </div>
    <p class="solver-mode muted small">{{ modeText }}</p>

    <div class="solver-buttons">
      <button class="btn btn-accent" :disabled="!canRun || running" @click="start">{{ stats ? 'Solve again' : 'Solve'
      }}</button>
      <button class="btn" :disabled="!running" @click="stop">Stop</button>
      <button class="btn" :disabled="running || !stats || stats.done" @click="resume"
        :title="`Continue the stopped search (up to ${(stats?.nodes ?? 0) + maxNodes} nodes)`">Continue</button>
    </div>

    <div v-if="error" class="solver-error">{{ error }}</div>
    <div v-if="stale && stats" class="solver-stale">The team, stage or RNG changed since this search: solve again to use
      them.</div>

    <div v-if="stats" class="solver-stats">
      <span class="result-pill" :class="statusPillClass">{{ statusText }}</span>
      <span v-if="stats.bestElapsed !== undefined" class="best-av" title="Elapsed action value when the last enemy fell">Best
        clear: <b>{{ fmtAv(stats.bestElapsed) }} AV</b><span class="muted"> (round {{ roundOf(stats.bestElapsed) }})</span></span>
      <span class="muted small">{{ stats.nodes.toLocaleString() }} nodes · {{ stats.actions.toLocaleString() }} actions
        simulated · {{ stats.merged.toLocaleString() }} merged · {{ stats.bounded.toLocaleString() }} cut by the bound · {{
          stats.wins.toLocaleString() }} clears · {{ (stats.ms / 1000).toFixed(1) }} s</span>
    </div>

    <div v-show="treeSize > 0" class="tree-wrap">
      <div class="tree-bar">
        <span class="legend"><i class="lg best"></i>best clear</span>
        <span v-if="running" class="legend"><i class="lg current"></i>searching now</span>
        <span class="legend"><i class="lg other"></i>other paths</span>
        <span class="legend"><i class="lg clear"></i>other clears</span>
        <span class="legend"><i class="lg open"></i>not explored</span>
        <span class="legend"><i class="lg lose"></i>defeat</span>
        <span class="tree-help muted small">Wheel: zoom · drag: pan · hover an edge for its action · click a node for its
          battle</span>
        <button class="btn small-btn" @click="fitView()" title="Show the whole tree">Fit</button>
        <button class="btn small-btn" :disabled="stats?.bestNode === undefined" @click="focusBest"
          title="Zoom in on the best clear's line">Best path</button>
      </div>
      <div ref="pane" class="tree-pane" :style="{ height: `${paneHeight}px` }">
        <canvas ref="canvas" @wheel.prevent="onWheel" @pointerdown="onPointerDown" @pointermove="onPointerMove"
          @pointerup="onPointerUp" @pointerleave="onPointerLeave" :class="{ dragging: !!drag, pointing: !!hover }"></canvas>
        <div v-if="hover && !drag" class="tip" :style="tipStyle">
          <div class="tip-title">{{ hover.edge ? 'Action' : 'Node' }} · {{ hover.depth === 0 ? 'start' : `decision ${hover.depth}` }}</div>
          <div class="tip-label">{{ hover.label }}</div>
          <div class="tip-sub">{{ fmtAv(hover.elapsed) }} AV · {{ hpText(hover.remaining) }}</div>
          <div class="tip-sub" :class="hover.status">{{ STATUS_TEXT[hover.status] }}<template v-if="hover.best"> · on the best
              clear</template></div>
        </div>
      </div>
    </div>

    <div v-if="selected" class="node-panel">
      <div class="np-main">
        <div class="np-head">
          <span class="np-dot" :class="[selected.status, { best: selected.onBestPath }]"></span>
          <b>{{ selected.parent < 0 ? 'Start' : `Decision ${selected.depth}` }}</b>
          <span class="muted">· {{ STATUS_TEXT[selected.status] }}</span>
          <span v-if="selected.onBestPath" class="best-tag">best clear</span>
        </div>
        <div>{{ fmtAv(selected.elapsed) }} AV (round {{ roundOf(selected.elapsed) }}) · {{ hpText(selected.remaining) }}</div>
        <div v-if="selected.note" class="muted">{{ selected.note }}</div>
        <div class="np-buttons">
          <button v-if="selected.parent >= 0" class="btn small-btn" @click="select(selected.parent)">Parent</button>
          <button v-if="selected.mergedInto !== undefined" class="btn small-btn" @click="select(selected.mergedInto)">Go to
            the merged node</button>
          <button v-if="stats?.bestNode !== undefined && stats.bestNode !== selected.id" class="btn small-btn"
            @click="select(stats.bestNode!)">Best clear</button>
        </div>
      </div>
      <div v-if="selected.picks.length" class="np-block">
        <div class="np-label">Decisions on the edge into this node</div>
        <ol class="np-picks">
          <li v-for="(p, i) in selected.picks" :key="i"><span class="muted">{{ p.label }}:</span> <b>{{ p.choice
          }}</b><span v-if="p.count > 1" class="muted small"> (of {{ p.count }})</span></li>
        </ol>
      </div>
      <div v-if="selected.actors.length" class="np-block">
        <div class="np-label">Actions on that edge</div>
        <div class="np-actors">{{ selected.actors.join(' → ') }}</div>
      </div>
      <div v-if="selected.nextDecision" class="np-block">
        <div class="np-label">Next decision</div>
        <div>{{ selected.nextDecision }}</div>
      </div>
    </div>

    <div v-if="selectedId !== null" class="history">
      <h3 class="history-title">Battle history <span class="muted">· {{ historyTitle }}</span></h3>
      <p v-if="historyLoading" class="muted small center">Replaying…</p>
      <BattleTimeline v-else-if="history.length" :states="history" :show-sp="false" :rng-editable="false" />
    </div>
  </section>
</template>

<script setup lang="ts">
// Fight solver panel of the PvE Simulator (search in workers/fightSolverWorker.ts, models/FightSolver.ts).
// The search tree is drawn top-down on a canvas (it can hold tens of thousands of nodes): the root is the battle
// start, each node a decision point, each edge one combination of decisions for the next action that needs any
// (plus the automatic actions after it). The best clear's line is gold, everything else grey. Hovering an edge or a
// node shows its action; clicking a node replays the battle up to it (the worker re-runs the path).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import BattleTimeline from './BattleTimeline.vue'
import { useSetting } from '../store/settingsStore'
import type { RngMode } from '../models/BattleRng'
import type { RaidCarry } from '../models/PvPBattle'
import type { TeamSlot } from '../types/BestTeamTypes'
import type { BattleSnapshot } from '../types/KiokuTypes'
import { SOLVER_STATUSES, type SolverNodeStatus, type SolverNodeView, type SolverStats, type SolverTreeChunk } from '../models/FightSolver'
import type { FightSolverJob, FightSolverMessage, FightSolverRequest } from '../workers/fightSolverWorker'

const props = defineProps<{
  canRun: boolean
  slots: TeamSlot[]
  stageId: number
  seed: number
  rngMode: RngMode
  partyBuffId?: number
  raidCarry?: RaidCarry
}>()

const maxNodes = useSetting<number>('pveSolverMaxNodes', 20000)
const maxAv = useSetting<number>('pveSolverMaxAv', 0)
const memo = useSetting<boolean>('pveSolverMemo', true)
const stopOnAllyDeath = useSetting<boolean>('pveSolverStopOnAllyDeath', true)

const STATUS_TEXT: Record<SolverNodeStatus, string> = {
  open: 'not explored yet', expanded: 'explored', win: 'clear', lose: 'defeat (wipe, round limit or an ally down)',
  merged: 'merged: same state reached before with no more AV', bound: 'cut: AV already at the best clear',
  cap: 'capped', error: 'engine error',
}

const worker = shallowRef<Worker | null>(null)
const running = ref(false)
const stats = shallowRef<SolverStats | null>(null)
const selectedId = ref<number | null>(null)
const selected = shallowRef<SolverNodeView | null>(null)
const history = shallowRef<BattleSnapshot[]>([])
const historyLoading = ref(false)
const historyAv = ref(0)
const error = ref('')
const jobKey = ref('')

const inputKey = computed(() => JSON.stringify([props.slots, props.stageId, props.seed, props.rngMode, props.partyBuffId, props.raidCarry]))
const stale = computed(() => !!jobKey.value && jobKey.value !== inputKey.value)

const modeText = computed(() => {
  const r = props.rngMode === 'seed' ? `seed ${props.seed} (each path is one exact seeded battle)`
    : props.rngMode === 'manual' ? 'Manual RNG is searched as Weighted (rolls happen iff ≥ 50%; flipped rolls are not used)'
      : `${props.rngMode} RNG`
  return `RNG: ${r}.`
})

const statusText = computed(() => {
  const s = stats.value
  if (!s) return ''
  if (running.value) return 'Searching…'
  if (s.done) return s.bestElapsed !== undefined ? 'Optimal (search complete)' : 'No clear exists'
  return s.stopReason === 'node limit' ? 'Node limit reached' : 'Stopped'
})
const statusPillClass = computed(() => running.value ? 'waiting' : stats.value?.bestElapsed !== undefined ? 'win' : 'lose')

const fmtAv = (v: number) => v.toFixed(1)
const roundOf = (t: number) => t < 150 ? 1 : Math.floor((t - 150) / 100) + 2
// `remaining` = waves still to come + the current wave's HP fraction (FightSolver.remaining).
function splitHp(rem: number): { frac: number, later: number } {
  const later = Math.max(0, Math.ceil(rem - 1e-9) - 1)
  return { frac: rem - later, later }
}
function hpText(rem: number): string {
  if (rem <= 0) return 'all enemies down'
  const { frac, later } = splitHp(rem)
  return `${(frac * 100).toFixed(1)}% enemy HP left${later ? ` (+${later} wave${later === 1 ? '' : 's'})` : ''}`
}

// ---- tree data (plain arrays, outside Vue reactivity; `treeVersion` signals changes) ----
const tree = {
  parent: [] as number[], elapsed: [] as number[], remaining: [] as number[], label: [] as string[],
  status: new Uint8Array(0), depth: [] as number[], children: [] as number[][], best: new Set<number>(),
  current: -1, // node the search is expanding right now (-1 when not searching)
  // layout: x in slots (siblings 1 apart), width in slots, maxDepth
  x: new Float64Array(0), leaves: 0, maxDepth: 0,
}
const treeVersion = ref(0)
const treeSize = ref(0)

function resetTree() {
  tree.parent = []; tree.elapsed = []; tree.remaining = []; tree.label = []; tree.status = new Uint8Array(0)
  tree.depth = []; tree.children = []; tree.best = new Set(); tree.current = -1; tree.x = new Float64Array(0); tree.leaves = 0; tree.maxDepth = 0
  treeSize.value = 0
  treeVersion.value++
}

function addChunk(c: SolverTreeChunk) {
  if (c.from !== tree.parent.length) return // out of order (a new search started): wait for the next full one
  for (let i = 0; i < c.parents.length; i++) {
    const id = c.from + i, p = c.parents[i]
    tree.parent.push(p)
    tree.elapsed.push(c.elapsed[i])
    tree.remaining.push(c.remaining[i])
    tree.label.push(c.labels[i])
    tree.depth.push(p < 0 ? 0 : tree.depth[p] + 1)
    tree.children.push([])
    if (p >= 0) tree.children[p].push(id)
  }
  tree.status = c.status
  layoutTree()
}

// Tidy layout (Reingold-Tilford style contour packing): each subtree keeps its left/right outline per depth, siblings
// are pushed right just far enough that no level overlaps (1 slot apart), and a parent sits centred over its first and
// last child. Shallow leaves therefore tuck in above deep subtrees instead of each taking a column of their own.
function layoutTree() {
  const n = tree.parent.length
  const rel = new Float64Array(n)   // x relative to the parent
  const x = new Float64Array(n)
  let maxDepth = 0, minX = 0, maxX = 0
  if (n) {
    const left: number[][] = new Array(n), right: number[][] = new Array(n)
    // Post-order without recursion (the tree can be deep).
    const order: number[] = []
    const stack = [0]
    while (stack.length) { const id = stack.pop()!; order.push(id); for (const c of tree.children[id]) stack.push(c) }
    for (let k = order.length - 1; k >= 0; k--) {
      const id = order[k]
      const kids = tree.children[id]
      if (!kids.length) { left[id] = [0]; right[id] = [0]; continue }
      // Place children left to right; offsets relative to the first child.
      const accL = left[kids[0]].slice(), accR = right[kids[0]].slice()
      const off = [0]
      for (let c = 1; c < kids.length; c++) {
        const cl = left[kids[c]], cr = right[kids[c]]
        let shift = -Infinity
        const m = Math.min(cl.length, accR.length)
        for (let d = 0; d < m; d++) shift = Math.max(shift, accR[d] - cl[d] + 1)
        off.push(shift)
        for (let d = 0; d < cr.length; d++) {
          if (d < accR.length) accR[d] = cr[d] + shift
          else { accR.push(cr[d] + shift); accL.push(cl[d] + shift) }
        }
      }
      const centre = (off[0] + off[off.length - 1]) / 2
      kids.forEach((c, i) => { rel[c] = off[i] - centre })
      left[id] = [0, ...accL.map(v => v - centre)]
      right[id] = [0, ...accR.map(v => v - centre)]
      for (const c of kids) { left[c] = right[c] = undefined as any } // free
    }
    for (const id of order) {
      const p = tree.parent[id]
      x[id] = p < 0 ? 0 : x[p] + rel[id]
      if (x[id] < minX) minX = x[id]
      if (x[id] > maxX) maxX = x[id]
      if (tree.depth[id] > maxDepth) maxDepth = tree.depth[id]
    }
    for (let id = 0; id < n; id++) x[id] -= minX
  }
  tree.x = x
  tree.leaves = n ? maxX - minX + 1 : 0
  tree.maxDepth = maxDepth
  treeSize.value = n
  treeVersion.value++
}

// ---- worker ----
function send(m: FightSolverRequest) { worker.value?.postMessage(m) }

function ensureWorker(): Worker {
  if (worker.value) return worker.value
  const w = new Worker(new URL('../workers/fightSolverWorker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (e: MessageEvent<FightSolverMessage>) => onMessage(e.data)
  w.onerror = (e) => { error.value = `Solver worker failed: ${e.message}`; running.value = false }
  worker.value = w
  return w
}

function onMessage(m: FightSolverMessage) {
  if (m.type === 'error') { error.value = m.error; running.value = false; return }
  if (m.type === 'history') {
    if (m.id !== selectedId.value) return
    selected.value = m.view
    history.value = m.snapshots
    historyAv.value = m.elapsed
    historyLoading.value = false
    return
  }
  const wasRunning = running.value
  running.value = m.running
  stats.value = m.stats
  const bestChanged = m.bestPath.length !== tree.best.size || m.bestPath.some(id => !tree.best.has(id))
  if (bestChanged) tree.best = new Set(m.bestPath)
  const current = m.running ? m.stats.current ?? -1 : -1
  const currentChanged = current !== tree.current
  tree.current = current
  if (m.tree) addChunk(m.tree)
  else if (bestChanged) treeVersion.value++
  else if (currentChanged) draw()
  if (autoFit) fitView(false)
  const best = m.stats.bestNode
  // When the search pauses, show the best clear's battle (unless something else was picked).
  if (wasRunning && !m.running && best !== undefined && (selectedId.value === null || autoSelected)) { select(best); autoSelected = true }
}

function start() {
  if (!props.canRun) return
  const w = ensureWorker()
  error.value = ''
  resetTree()
  selectedId.value = null
  selected.value = null
  history.value = []
  stats.value = null
  running.value = true
  autoFit = true
  autoSelected = false
  jobKey.value = inputKey.value
  const job: FightSolverJob = {
    slots: JSON.parse(JSON.stringify(props.slots)), stageId: props.stageId, seed: props.seed, rngMode: props.rngMode,
    partyBuffId: props.partyBuffId, raidCarry: props.raidCarry ? JSON.parse(JSON.stringify(props.raidCarry)) : undefined,
    maxNodes: Math.max(100, maxNodes.value || 0), maxAv: Math.max(0, maxAv.value || 0), memo: memo.value,
    stopOnAllyDeath: stopOnAllyDeath.value,
  }
  const req: FightSolverRequest = { type: 'start', job }
  w.postMessage(req)
}
function stop() { send({ type: 'stop' }) }
function resume() {
  if (!stats.value) return
  running.value = true
  send({ type: 'resume', maxNodes: stats.value.nodes + Math.max(100, maxNodes.value || 0) })
}

let autoSelected = false
function select(id: number, user = true) {
  if (user) autoSelected = false
  selectedId.value = id
  selected.value = null
  history.value = []
  historyLoading.value = true
  send({ type: 'history', id })
  draw()
}

const historyTitle = computed(() => {
  const id = selectedId.value
  if (id === null) return ''
  const acts = history.value.slice(1).filter(s => !s.wave).length
  const depth = tree.depth[id] ?? 0
  return historyLoading.value ? `${depth ? `decision ${depth}` : 'start'}`
    : `${depth ? `decision ${depth}` : 'start'}: ${acts} action${acts === 1 ? '' : 's'}, ${fmtAv(historyAv.value)} AV`
})

// ---- canvas view: x zoom (px per leaf slot) + pan; rows have a fixed height ----
const pane = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const PAD_X = 28
const PAD_TOP = 22
const PAD_BOTTOM = 22
const MAX_ZOOM = 90
let width = 600
let zoom = 1          // px per leaf slot
let panX = 0          // screen x of slot 0 (before PAD_X)
let panY = 0
let rowH = 40
let baseRow = 40     // row height at the fitted zoom; zooming in grows rows too, more slowly than columns
let autoFit = true

const paneHeight = computed(() => {
  void treeVersion.value
  return Math.max(220, Math.min(620, PAD_TOP + PAD_BOTTOM + tree.maxDepth * 40 + 10))
})

const sx = (id: number) => PAD_X + panX + tree.x[id] * zoom
const sy = (id: number) => PAD_TOP + panY + tree.depth[id] * rowH

function fitZoom() { return Math.min(MAX_ZOOM, (width - 2 * PAD_X) / Math.max(1, tree.leaves - 1)) }
function clampView() {
  const h = paneHeight.value
  const treeH = PAD_TOP + PAD_BOTTOM + tree.maxDepth * rowH
  panY = treeH <= h ? 0 : Math.min(0, Math.max(h - treeH, panY))
  const span = Math.max(0, (tree.leaves - 1) * zoom)
  const inner = width - 2 * PAD_X
  panX = span <= inner ? (inner - span) / 2 : Math.min(0, Math.max(inner - span, panX))
}
// Zoom to `z` px per slot keeping the tree point under (mx, my) (pane coordinates) in place.
function setZoom(z: number, mx: number, my: number) {
  const slot = (mx - PAD_X - panX) / zoom
  const depth = (my - PAD_TOP - panY) / rowH
  zoom = Math.max(fitZoom(), Math.min(MAX_ZOOM, z))
  rowH = Math.min(72, baseRow * Math.pow(zoom / fitZoom(), 0.4))
  panX = mx - PAD_X - slot * zoom
  panY = my - PAD_TOP - depth * rowH
  clampView()
}
function fitView(user = true) {
  if (user) autoFit = true
  const h = paneHeight.value
  baseRow = rowH = Math.max(18, Math.min(40, (h - PAD_TOP - PAD_BOTTOM) / Math.max(1, tree.maxDepth)))
  zoom = fitZoom()
  panX = 0
  panY = 0
  clampView()
  draw()
}
// Frame the gold line: its horizontal extent fills the pane (a little margin), top of the tree in view.
function focusBest() {
  if (stats.value?.bestNode === undefined || !tree.x.length) return
  autoFit = false
  const xs = [...tree.best].map(id => tree.x[id])
  const lo = Math.min(...xs), hi = Math.max(...xs)
  const inner = width - 2 * PAD_X
  setZoom(inner / (hi - lo + 6), PAD_X, PAD_TOP)
  rowH = baseRow // the whole line top to bottom
  panX = inner / 2 - ((lo + hi) / 2) * zoom
  panY = 0
  clampView()
  draw()
}

function onWheel(e: WheelEvent) {
  if (!tree.leaves) return
  autoFit = false
  if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    panX -= (e.shiftKey ? e.deltaY : e.deltaX)
  } else {
    const rect = canvas.value!.getBoundingClientRect()
    setZoom(zoom * Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top)
  }
  clampView()
  draw()
}

const drag = ref<{ x: number, y: number, panX: number, panY: number, moved: boolean } | null>(null)
interface Hover { id: number, edge: boolean, x: number, y: number, depth: number, label: string, elapsed: number, remaining: number, status: SolverNodeStatus, best: boolean }
const hover = shallowRef<Hover | null>(null)
const tipStyle = computed(() => {
  const h = hover.value
  if (!h) return {}
  const left = Math.min(Math.max(8, h.x + 14), width - 260)
  // Lower half of the pane: the tooltip opens above the pointer so it never runs off the bottom.
  return h.y > paneHeight.value / 2
    ? { left: `${left}px`, bottom: `${paneHeight.value - h.y + 14}px` }
    : { left: `${left}px`, top: `${h.y + 14}px` }
})

function onPointerDown(e: PointerEvent) {
  drag.value = { x: e.clientX, y: e.clientY, panX, panY, moved: false }
  canvas.value?.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  const d = drag.value
  if (d) {
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    if (d.moved) {
      autoFit = false
      panX = d.panX + dx
      panY = d.panY + dy
      clampView()
      draw()
    }
    return
  }
  const rect = canvas.value!.getBoundingClientRect()
  const px = e.clientX - rect.left, py = e.clientY - rect.top
  const hit = hitTest(px, py)
  const prev = hover.value
  if (!hit) { if (prev) { hover.value = null; draw() } return }
  const id = hit.id
  hover.value = {
    id, edge: hit.edge, x: px, y: py, depth: tree.depth[id], label: tree.label[id], elapsed: tree.elapsed[id],
    remaining: tree.remaining[id], status: SOLVER_STATUSES[tree.status[id]] ?? 'open', best: tree.best.has(id),
  }
  if (!prev || prev.id !== id || prev.edge !== hit.edge) draw()
}
function onPointerUp(e: PointerEvent) {
  const d = drag.value
  drag.value = null
  canvas.value?.releasePointerCapture(e.pointerId)
  if (d && !d.moved) {
    const rect = canvas.value!.getBoundingClientRect()
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top)
    if (hit) select(hit.id)
  }
}
function onPointerLeave() { if (!drag.value && hover.value) { hover.value = null; draw() } }

const nodeRadius = () => Math.max(2, Math.min(6, zoom * 0.32))

// Nearest node within reach, else the nearest edge (an edge belongs to its child node).
function hitTest(px: number, py: number): { id: number, edge: boolean } | null {
  const n = tree.parent.length
  if (!n) return null
  const reach = Math.max(7, nodeRadius() + 3)
  let bestNode = -1, bestD = reach * reach
  for (let id = 0; id < n; id++) {
    const dx = sx(id) - px, dy = sy(id) - py
    const d = (dx * dx + dy * dy) * (tree.best.has(id) ? 0.5 : 1) // the gold line wins close calls
    if (d < bestD) { bestD = d; bestNode = id }
  }
  if (bestNode >= 0) return { id: bestNode, edge: false }
  // Edges: only those whose rows straddle the pointer.
  let bestEdge = -1, bestE = 6
  for (let id = 1; id < n; id++) {
    const p = tree.parent[id]
    const y0 = sy(p), y1 = sy(id)
    if (py < y0 || py > y1) continue
    const d = distToEdge(px, py, sx(p), y0, sx(id), y1)
    if (d < bestE) { bestE = d; bestEdge = id }
  }
  return bestEdge >= 0 ? { id: bestEdge, edge: true } : null
}

// Edges are vertical S-curves (cubic, control points at mid height): sample them.
function edgePoint(x0: number, y0: number, x1: number, y1: number, t: number): [number, number] {
  const ym = (y0 + y1) / 2, u = 1 - t
  const x = u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1
  const y = u * u * u * y0 + 3 * u * u * t * ym + 3 * u * t * t * ym + t * t * t * y1
  return [x, y]
}
function distToEdge(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  let best = Infinity
  let [ax, ay] = [x0, y0]
  for (let k = 1; k <= 12; k++) {
    const [bx, by] = edgePoint(x0, y0, x1, y1, k / 12)
    const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay
    const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)))
    const dx = ax + t * vx - px, dy = ay + t * vy - py
    best = Math.min(best, Math.hypot(dx, dy))
    ax = bx; ay = by
  }
  return best
}

// ---- drawing ----
let frame = 0
function draw() {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; paint() })
}

function cssVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback
}

function paint() {
  const cv = canvas.value, pn = pane.value
  if (!cv || !pn) return
  const dpr = window.devicePixelRatio || 1
  const w = pn.clientWidth, h = pn.clientHeight
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
    cv.style.width = `${w}px`; cv.style.height = `${h}px`
  }
  const ctx = cv.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const n = tree.parent.length
  if (!n) return
  const gold = cssVar(cv, '--accent', '#f6d485')
  const text = cssVar(cv, '--text', '#f8eed7')
  const success = cssVar(cv, '--success', '#79d5aa')
  const danger = cssVar(cv, '--danger', '#ff9b8f')
  const GREY = 'rgba(200, 192, 176, 0.42)'
  const GREY_FAINT = 'rgba(200, 192, 176, 0.2)'
  const r = nodeRadius()
  const visible = (x: number) => x > -40 && x < w + 40
  const st = (id: number) => SOLVER_STATUSES[tree.status[id]] ?? 'open'
  const faint = (s: SolverNodeStatus) => s === 'merged' || s === 'bound' || s === 'cap' || s === 'open'
  const hoverId = hover.value?.id ?? -1

  const curve = (p: number, id: number) => {
    const x0 = sx(p), y0 = sy(p), x1 = sx(id), y1 = sy(id), ym = (y0 + y1) / 2
    ctx.moveTo(x0, y0)
    ctx.bezierCurveTo(x0, ym, x1, ym, x1, y1)
  }

  // Grey edges, batched by shade.
  ctx.lineWidth = 1
  for (const [shade, pick] of [[GREY_FAINT, true], [GREY, false]] as const) {
    ctx.strokeStyle = shade
    ctx.beginPath()
    for (let id = 1; id < n; id++) {
      const p = tree.parent[id]
      if (tree.best.has(id) || faint(st(id)) !== pick) continue
      const xa = sx(p), xb = sx(id)
      if ((xa < -40 && xb < -40) || (xa > w + 40 && xb > w + 40)) continue
      curve(p, id)
    }
    ctx.stroke()
  }
  // The search's current path (root -> the node being expanded), dashed gold, under the best line. Nodes the page
  // has not received yet (the tree arrives in chunks) are skipped up to their nearest known ancestor.
  const currentPath = new Set<number>()
  if (tree.current >= 0) {
    let id = tree.current
    if (id >= n) id = -1 // not received yet: wait for the next chunk
    for (; id >= 0; id = tree.parent[id]) currentPath.add(id)
  }
  if (currentPath.size > 1) {
    ctx.strokeStyle = gold
    ctx.globalAlpha = 0.85
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    for (const id of currentPath) if (id > 0 && !tree.best.has(id)) curve(tree.parent[id], id)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }
  // Best path on top, gold.
  if (tree.best.size > 1) {
    ctx.strokeStyle = gold
    ctx.lineWidth = 2.5
    ctx.shadowColor = gold
    ctx.shadowBlur = 6
    ctx.beginPath()
    for (const id of tree.best) if (id > 0) curve(tree.parent[id], id)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  // Hovered edge.
  if (hoverId > 0 && hover.value?.edge) {
    ctx.strokeStyle = tree.best.has(hoverId) ? gold : text
    ctx.lineWidth = 3
    ctx.beginPath()
    curve(tree.parent[hoverId], hoverId)
    ctx.stroke()
  }

  // Nodes.
  for (let id = 0; id < n; id++) {
    const x = sx(id)
    if (!visible(x)) continue
    const y = sy(id)
    if (y < -10 || y > h + 10) continue
    const s = st(id)
    const onBest = tree.best.has(id)
    ctx.beginPath()
    ctx.arc(x, y, onBest ? r + 1.5 : r, 0, Math.PI * 2)
    if (onBest) { ctx.fillStyle = gold; ctx.fill() }
    else if (s === 'open') { ctx.strokeStyle = GREY; ctx.lineWidth = 1.2; ctx.stroke() }
    else {
      ctx.fillStyle = s === 'win' ? success : s === 'lose' || s === 'error' ? danger : faint(s) ? GREY_FAINT : GREY
      ctx.globalAlpha = s === 'win' || s === 'lose' || s === 'error' ? 0.55 : 1
      ctx.fill()
      ctx.globalAlpha = 1
    }
    if (id === tree.current) {
      // Head of the current search: a gold ring.
      ctx.beginPath()
      ctx.arc(x, y, r + 4.5, 0, Math.PI * 2)
      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      ctx.stroke()
    } else if (currentPath.has(id) && !onBest) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = gold
      ctx.globalAlpha = 0.8
      ctx.fill()
      ctx.globalAlpha = 1
    }
    if (id === selectedId.value || id === hoverId) {
      ctx.beginPath()
      ctx.arc(x, y, (onBest ? r + 1.5 : r) + 3, 0, Math.PI * 2)
      ctx.strokeStyle = id === selectedId.value ? text : onBest ? gold : text
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }
  // AV beside the best line's nodes, on a dark halo so it reads over the grey branches.
  ctx.font = '600 10.5px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 4
  ctx.strokeStyle = cssVar(cv, '--panel-strong', '#141414')
  ctx.fillStyle = gold
  for (const id of tree.best) {
    const x = sx(id), y = sy(id)
    if (!visible(x)) continue
    const t = fmtAv(tree.elapsed[id])
    ctx.strokeText(t, x + r + 6, y)
    ctx.fillText(t, x + r + 6, y)
  }
}

let resize: ResizeObserver | undefined
onMounted(() => {
  resize = new ResizeObserver(() => {
    width = pane.value?.clientWidth ?? width
    if (autoFit) fitView(false); else { clampView(); draw() }
  })
  if (pane.value) resize.observe(pane.value)
})
watch(treeVersion, () => nextTick(() => {
  width = pane.value?.clientWidth || width
  if (autoFit) fitView(false); else { clampView(); draw() }
}))
onBeforeUnmount(() => { worker.value?.terminate(); resize?.disconnect(); if (frame) cancelAnimationFrame(frame) })
</script>

<style scoped>
.solver-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem 1.1rem;
}

.field {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.85rem;
}

.field-label {
  font-size: 0.74rem;
  color: var(--muted);
}

.field input {
  width: 5.5rem;
}

.check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: var(--muted);
  cursor: pointer;
}

.solver-mode {
  text-align: center;
  margin: 0.4rem 0 0.6rem;
}

.muted { color: var(--muted); }
.small { font-size: 0.78rem; }
.center { text-align: center; }

.solver-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.btn {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5em 1.2em;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  cursor: pointer;
}
.btn-accent { background: var(--accent-glow); border-color: var(--border-strong); color: var(--accent); }
.btn-accent:hover:not(:disabled) { background: var(--accent-glow-strong); border-color: var(--accent); }
.btn:disabled { opacity: 0.5; cursor: default; }
.small-btn { padding: 0.3em 0.8em; font-size: 0.8rem; }

.solver-error, .solver-stale {
  text-align: center;
  font-size: 0.85rem;
  margin-bottom: 0.6rem;
}
.solver-error { color: var(--danger); }
.solver-stale { color: var(--warning); }

.solver-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.4rem 0.9rem;
  margin-bottom: 0.8rem;
}

.result-pill {
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  border: 1px solid currentColor;
}
.result-pill.win { color: var(--success); }
.result-pill.lose { color: var(--danger); }
.result-pill.waiting { color: var(--accent); }

.best-av b { color: var(--accent); }

/* ── tree ── */
.tree-wrap { margin-bottom: 0.8rem; }

.tree-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.9rem;
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
}
.tree-help { margin-left: auto; }

.legend { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--muted); }
.lg { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.lg.best { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
.lg.current { border: 1.5px dashed var(--accent); }
.lg.other { background: rgba(200, 192, 176, 0.42); }
.lg.clear { background: var(--success); opacity: 0.55; }
.lg.open { border: 1.2px solid rgba(200, 192, 176, 0.42); }
.lg.lose { background: var(--danger); opacity: 0.55; }

.tree-pane {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(ellipse at top, var(--accent-glow), transparent 60%),
    var(--bg-soft);
  overflow: hidden;
  user-select: none;
}
.tree-pane canvas { display: block; cursor: grab; touch-action: none; }
.tree-pane canvas.pointing { cursor: pointer; }
.tree-pane canvas.dragging { cursor: grabbing; }

.tip {
  position: absolute;
  max-width: 250px;
  pointer-events: none;
  background: var(--panel-strong);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.6rem;
  font-size: 0.78rem;
  box-shadow: var(--shadow);
  z-index: 2;
}
.tip-title { color: var(--muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; }
.tip-label { color: var(--text); font-weight: 600; margin: 0.15rem 0; }
.tip-sub { color: var(--muted); }
.tip-sub.win { color: var(--success); }
.tip-sub.lose, .tip-sub.error { color: var(--danger); }

/* ── selected node ── */
.node-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  background: var(--bg-soft);
  text-align: left;
}
.np-main { display: flex; flex-direction: column; gap: 0.35rem; min-width: 220px; }
.np-head { display: flex; align-items: center; gap: 0.4rem; }
.np-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(200, 192, 176, 0.42); }
.np-dot.win { background: var(--success); }
.np-dot.lose, .np-dot.error { background: var(--danger); }
.np-dot.open { background: none; border: 1.2px solid rgba(200, 192, 176, 0.6); }
.np-dot.best { background: var(--accent); box-shadow: 0 0 6px var(--accent); border: none; }
.best-tag { color: var(--accent); font-size: 0.75rem; font-weight: 700; border: 1px solid var(--accent); border-radius: 999px; padding: 0 0.5rem; }
.np-block { flex: 1 1 260px; }
.np-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin-bottom: 0.15rem; }
.np-picks { margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.15rem; }
.np-actors { line-height: 1.4; }
.np-buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.history { margin-top: 1rem; }
.history-title { font-size: 1rem; color: var(--accent-soft); text-align: center; margin: 0 0 0.5rem; }
</style>
