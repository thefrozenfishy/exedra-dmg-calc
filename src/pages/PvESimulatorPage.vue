<template>
  <div class="team-page">
    <h1 class="page-title">PvE Simulator</h1>

    <!-- Stage + enemies -->
    <section class="card">
      <h2 class="section-title">Stage</h2>
      <StagePicker v-model="stageId" />

      <div v-if="waves.length" class="wave-tabs">
        <span class="muted">Wave:</span>
        <button v-for="(w, i) in waves" :key="i" type="button" class="chip-btn" :class="{ active: waveIdx === i }"
          @click="waveIdx = i">{{ i + 1 }} <span class="muted">({{ w.length }})</span></button>
        <span class="muted hint">Max damage uses the selected wave; the battle simulator plays every wave.</span>
      </div>

      <div class="enemy-grid">
        <div v-for="(e, i) in enemyInfo" :key="e.id" class="enemy-card" :class="{ main: mainTargetIdx === i }">
          <img class="enemy-img" :src="`/exedra-dmg-calc/enemy/${e.enemyMstId}_thumbnail.png`" :alt="e.name"
            @error="hideImg" />
          <div class="enemy-body">
            <div class="enemy-name" :title="e.name">{{ e.name }}</div>
            <div class="enemy-stats">
              <span>HP {{ fmt(e.hp) }}<span v-if="e.gauges > 1" class="muted"> ×{{ e.gauges }}</span></span>
              <span>ATK {{ fmt(e.atk) }}</span>
              <span>DEF {{ fmt(e.def) }}</span>
              <span>SPD {{ e.spd }}</span>
            </div>
            <div class="enemy-stats">
              <span v-if="e.weak.length" class="weak">Weak
                <img v-for="w in e.weak" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w" :title="w"
                  class="elem-icon" />
              </span>
              <span v-for="r in e.resists" :key="r.el" class="resist" :title="`${r.el} resist`">
                <img :src="`/exedra-dmg-calc/elements/${r.el}.png`" :alt="r.el" class="elem-icon" /> −{{ r.pct }}%
              </span>
            </div>
            <div class="enemy-stats">
              <span v-if="e.breakPoint > 0">Break {{ e.breakPoint }} · broken {{ e.initRate }}–{{ e.maxRate }}%</span>
              <span v-else class="muted">Unbreakable</span>
            </div>
            <div class="enemy-controls">
              <label title="Single-target skills hit this enemy">
                <input type="radio" :checked="mainTargetIdx === i" @change="mainTargetIdx = i" /> Target
              </label>
              <label v-if="e.breakPoint > 0">
                <input type="checkbox" :checked="!!broken[i]" @change="setBroken(i, ($event.target as HTMLInputElement).checked)" /> Broken
              </label>
              <label v-if="e.breakPoint > 0 && broken[i]" title="Broken damage rate (%)">
                <input class="num" type="number" min="100" :max="e.maxRate" :value="breakRate[i] ?? e.maxRate"
                  @change="setBreakRate(i, Number(($event.target as HTMLInputElement).value), e.maxRate)" />%
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <h2 class="section-title">Team</h2>
    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <h3 class="slot-title">
          <button type="button" class="dealer-btn" :class="{ active: attackerIndex === index }"
            :title="attackerIndex === index ? 'Damage dealer' : 'Make this the damage dealer'" @click="attackerIndex = index">
            {{ attackerIndex === index ? '★ Damage Dealer' : `Member ${index + 1}` }}
          </button>
        </h3>
        <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain" :setSupport="team.setSupport" />
      </div>
    </div>

    <!-- Max damage -->
    <section class="card">
      <h2 class="section-title">Max Damage</h2>
      <p class="hint-text">Every buff and debuff the team can produce is applied at full stacks with its conditions
        assumed met, then each skill is run through the battle engine's damage formula against the selected wave.
        Click an effect below to leave it out.</p>

      <p v-if="!teamKiokus.length" class="muted">Add team members to calculate damage.</p>
      <template v-else-if="maxDmg">
        <div v-if="dealer?.best" class="headline">
          <div class="headline-main">
            {{ dealer.name }} · {{ dealer.best.label }}:
            <b>{{ fmt(dealer.best.total.crit) }}</b> <span class="muted">crit</span>
          </div>
          <div class="muted">
            {{ fmt(dealer.best.total.normal) }} without crit · {{ fmt(dealer.best.total.avg) }} average at
            {{ dealer.best.critChance.toFixed(1) }}% crit
          </div>
        </div>

        <div class="sa-fields" v-if="isScoreAttack">
          <div class="sa-score-row" :title="saScoreTitle">
            <span class="muted">Score Attack score (estimate)</span> <b>{{ saScore }}</b>
          </div>
          <label class="field"><span class="field-label">Difficulty score</span>
            <input v-model.number="difficultyScore" type="number" /></label>
          <label class="field"><span class="field-label">HP remaining (%)</span>
            <input v-model.number="hpPercentTeam" type="number" min="0" max="100" /></label>
          <label class="field"><span class="field-label">Turns</span>
            <input v-model.number="saTurns" type="number" min="1" max="16" /></label>
          <label class="field"><span class="field-label">Score multiplier</span>
            <input v-model.number="scoreMultiplier" type="number" step="0.1" min="0" /></label>
        </div>

        <div class="table-wrap">
          <table class="dmg-table">
            <thead>
              <tr>
                <th>Member</th>
                <th v-for="[, label] in skillCols" :key="label">{{ label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in maxDmg.members" :key="m.pos" :class="{ dealer: m.pos === attackerIndex }">
                <td>{{ m.name }}</td>
                <td v-for="[type] in skillCols" :key="type">
                  <template v-if="skillOf(m, type)">
                    <div :title="perEnemyTitle(skillOf(m, type)!)"><b>{{ fmt(skillOf(m, type)!.total.crit) }}</b></div>
                    <div class="muted small">{{ fmt(skillOf(m, type)!.total.normal) }} · avg {{ fmt(skillOf(m, type)!.total.avg) }}</div>
                  </template>
                  <span v-else class="muted">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted small">Totals over every enemy the skill hits: crit / no crit · average. Hover a value for the
          per-enemy split.</p>

        <details class="effects">
          <summary>Effects applied ({{ activeEffectCount }} / {{ maxDmg.effects.length }})
            <button v-if="excluded.size" type="button" class="link-btn" @click.prevent="excluded.clear()">include all</button>
          </summary>
          <div class="effect-cols">
            <div v-for="side in (['ally', 'enemy'] as const)" :key="side">
              <h4 class="subsection-title">{{ side === 'ally' ? 'Buffs on the attacker' : 'Debuffs on the enemies' }}</h4>
              <div v-for="e in effectsBySide(side)" :key="e.key" class="effect-row"
                :class="{ off: excluded.has(e.key), na: !e.applies }" @click="toggleEffect(e.key)"
                :title="e.applies ? 'Click to include / exclude' : 'Self-only effect of another member (not applied)'">
                <span class="effect-src">{{ e.casterName }} · {{ e.source }}</span>
                <span class="effect-type">{{ e.detail.abilityEffectType }}</span>
                <span class="effect-desc">{{ e.detail.description }}</span>
                <label v-if="e.maxStacks > 1" class="stacks" @click.stop>
                  <input class="num" type="number" min="0" :max="e.maxStacks" :value="stacks.get(e.key) ?? e.maxStacks"
                    @change="setStacks(e.key, Number(($event.target as HTMLInputElement).value), e.maxStacks)" /> / {{ e.maxStacks }}
                </label>
              </div>
            </div>
          </div>
        </details>
      </template>
    </section>

    <!-- Battle simulator -->
    <section class="card">
      <h2 class="section-title">Battle Simulator</h2>
      <p class="hint-text">Plays the stage with the battle engine: enemy skills follow their skill rotation and
        conditions, enemies pick targets by role aggro, and later waves appear when a wave is cleared. Summons and form
        changes are not simulated yet.</p>
      <div class="sim-controls">
        <SegmentedToggle v-model="targetMode" :options="TARGET_MODE_OPTIONS" label="Targeting" />
        <p class="sim-hint">{{ TARGET_MODE_OPTIONS.find(o => o.value === targetMode)?.title }}</p>
        <RngControls v-model:mode="rngMode" :seed="seed" :changed="changedRolls" :disabled="!canRun"
          @update:seed="setSeed" @reset="resetRolls" />
      </div>
      <div class="sim-tools">
        <button class="btn btn-accent" @click="runSimulation" :disabled="!canRun">Run Simulation</button>
        <button v-if="pickCount" class="btn" @click="resetPicks" :disabled="!canRun"
          title="Forget every target you picked and start the battle over">Reset {{ pickCount }} target pick{{ pickCount === 1 ? '' : 's' }}</button>
        <label class="field inline"><span class="field-label">Turns</span>
          <input v-model.number="simTurns" type="number" min="1" max="200" /></label>
        <span v-if="pending" class="result waiting">Waiting for a target pick</span>
        <span v-else-if="battleResult" class="result" :class="battleResult">{{ battleResult === 'win' ? 'Cleared' : 'Defeated' }}</span>
      </div>
      <BattleTimeline :states="battleOutput" :show-sp="false" :rng-editable="rngMode === 'manual'" @decide="onDecide" />
      <div v-if="pending" ref="pickPanel" class="pick-panel">
        <div class="pick-head">Pick a target <span class="muted">· after action {{ actionCount }}</span></div>
        <div class="pick-label">{{ pending.label }}</div>
        <div class="pick-options">
          <button v-for="(o, i) in pending.options" :key="i" type="button" class="btn pick-btn" @click="pickTarget(i)">
            <span>{{ o.label }}</span>
            <span v-if="hpOf(o.label)" class="muted small">{{ hpOf(o.label) }}</span>
          </button>
        </div>
        <p class="muted small">Every pick can be changed later from that action's roll list; the battle then re-runs from
          the start.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { useTeamStore } from '../store/singleTeamStore'
import { useSetting } from '../store/settingsStore'
import CharacterEditor from '../components/CharacterEditor.vue'
import StagePicker from '../components/StagePicker.vue'
import BattleTimeline from '../components/BattleTimeline.vue'
import SegmentedToggle from '../components/SegmentedToggle.vue'
import RngControls from '../components/RngControls.vue'
import { PendingDecision, type RngDecision, type RngEvent, type RngMode } from '../models/BattleRng'
import { toast } from 'vue3-toastify'
import { TargetType, type BattleSnapshot } from '../types/KiokuTypes'
import { elementMap } from '../types/enums'
import { stageWaves, enemyName, breakMstOf, ELEMENT_KEYS } from '../models/PvE'
import { createPvEBattle, stageBattleType } from '../models/PvEBattle'
import { getScoreAttackStage } from '../models/PvEScore'
import { computeMaxDamage, type MaxDmgResult, type MemberDamage, type SkillDamage, type EffectSide } from '../models/MaxDamage'
import { buildSlotKioku } from '../utils/pvpExport'
import type { PvPBattle } from '../models/PvPBattle'
import type { PvPKioku } from '../models/PvPKioku'

const team = useTeamStore()
const stageId = useSetting<number>('pveStageId', 982250)
const attackerIndex = useSetting('pveAttackerIndex', 2)
const scoreMultiplier = useSetting('scoreMultiplier', 35)
const saTurns = useSetting('turns', 3)
const hpPercentTeam = useSetting('hp_percentage_team', 20)
const difficultyScore = useSetting('difficulty_score', 6_000_000)
const simTurns = useSetting('pveSimTurns', 40)

const fmt = (n: number) => Math.round(n).toLocaleString()
const hideImg = (ev: Event) => { (ev.target as HTMLImageElement).style.visibility = 'hidden' }

// ---- stage / enemies ----
const waveIdx = ref(0)
const waves = computed(() => stageId.value ? stageWaves(stageId.value) : [])
const wave = computed(() => waves.value[Math.min(waveIdx.value, waves.value.length - 1)] ?? [])
const mainTargetIdx = ref(0)
const broken = ref<boolean[]>([])
const breakRate = ref<(number | undefined)[]>([])

watch(stageId, () => { waveIdx.value = 0 })
watch(wave, w => {
  const main = w.findIndex(a => a.isMainTargetEnemy)
  mainTargetIdx.value = main >= 0 ? main : 0
  broken.value = w.map(a => (breakMstOf(a)?.breakPoint ?? 0) > 0)
  breakRate.value = w.map(() => undefined)
}, { immediate: true })

const setBroken = (i: number, v: boolean) => { const b = [...broken.value]; b[i] = v; broken.value = b }
const setBreakRate = (i: number, v: number, max: number) => {
  const r = [...breakRate.value]; r[i] = Number.isFinite(v) ? Math.max(100, Math.min(max, v)) : undefined; breakRate.value = r
}

const enemyInfo = computed(() => wave.value.map(a => {
  const b = breakMstOf(a)
  return {
    id: a.questEnemyAppearanceMstId, enemyMstId: a.enemyMstId, name: enemyName(a),
    hp: a.hp, atk: a.atk, def: a.def, spd: a.speed,
    gauges: a.startHpGaugeCount > 0 ? a.startHpGaugeCount : a.hpGaugeCount,
    weak: [1, 2, 3, 4, 5, 6].map(i => a[`weakElement${i}`]).filter((x: number) => x >= 1 && x <= 6).map((x: number) => elementMap[x]),
    resists: ELEMENT_KEYS.map((k, el) => ({ el: elementMap[el], pct: k ? (a[`${k}ResistRate`] ?? 0) / 10 : 0 })).filter(r => r.pct > 0),
    breakPoint: b?.breakPoint ?? 0,
    initRate: Math.trunc((b?.initialBreakedDamageReceiveRate ?? 1000) / 10),
    maxRate: Math.trunc((b?.maxBreakedDamageReceiveRate ?? 1000) / 10),
  }
}))

// ---- team ----
// Members in slot order; an empty slot is skipped (quests can be played with fewer than 5).
const filledSlots = computed(() => team.slots.map((s, i) => [s, i] as const).filter(([s]) => !!s.main))
const teamKiokus = computed<PvPKioku[]>(() => {
  try {
    return filledSlots.value.map(([s]) => markRaw(buildSlotKioku(s)))
  } catch (e) {
    console.warn('Could not build team', e)
    return []
  }
})
const dealerPos = computed(() => Math.max(0, filledSlots.value.findIndex(([, i]) => i === attackerIndex.value)))

// ---- max damage ----
const excluded = reactive(new Set<string>())
const stacks = reactive(new Map<string, number>())
const toggleEffect = (k: string) => { if (excluded.has(k)) excluded.delete(k); else excluded.add(k) }
const setStacks = (k: string, v: number, max: number) => {
  const n = Math.max(0, Math.min(max, Number.isFinite(v) ? v : max))
  if (n === max) stacks.delete(k); else stacks.set(k, n)
}

const maxDmg = computed<MaxDmgResult | undefined>(() => {
  if (!teamKiokus.value.length || !wave.value.length) return undefined
  try {
    return computeMaxDamage(teamKiokus.value, wave.value, dealerPos.value, {
      battleType: stageBattleType(stageId.value),
      excluded: new Set(excluded), stacks: new Map(stacks),
      broken: broken.value, breakRate: breakRate.value, mainTargetIdx: mainTargetIdx.value,
    })
  } catch (e) {
    console.warn('Max damage failed', e)
    return undefined
  }
})
const dealer = computed(() => maxDmg.value?.members[dealerPos.value])
const skillCols: [TargetType, string][] = [[TargetType.specialId, 'Ultimate'], [TargetType.skillId, 'Battle Skill'], [TargetType.attackId, 'Basic Attack']]
const skillOf = (m: MemberDamage, t: TargetType) => m.skills.find(s => s.type === t)
const perEnemyTitle = (s: SkillDamage) => s.perEnemy.map((x, i) => x.crit ? `${enemyInfo.value[i]?.name}: ${fmt(x.crit)} crit / ${fmt(x.normal)} / avg ${fmt(x.avg)}` : '').filter(Boolean).join('\n')
const effectsBySide = (side: EffectSide) => (maxDmg.value?.effects ?? []).filter(e => e.side === side)
const activeEffectCount = computed(() => (maxDmg.value?.effects ?? []).filter(e => e.applies && !excluded.has(e.key)).length)

// Score Attack score, same estimate as the previous version of this page.
const isScoreAttack = computed(() => !!getScoreAttackStage(stageId.value))
const saDamage = computed(() => dealer.value?.best?.total.crit ?? 0)
const saScore = computed(() => (difficultyScore.value + Number((20 * (saDamage.value / scoreMultiplier.value + (90000 - 5000 * saTurns.value) + 15000 * hpPercentTeam.value / 100)).toFixed(0))).toLocaleString())
const saScoreTitle = computed(() => `${difficultyScore.value} + 20 * (${saDamage.value} / ${scoreMultiplier.value} + (90000 - 5000 * ${saTurns.value}) + 15000 * ${hpPercentTeam.value / 100})`)

// ---- battle simulator ----
// shallowRef + markRaw: keep the engine out of Vue reactivity (object identity matters, see PvP page).
const battle = shallowRef<PvPBattle | null>(null)
const battleOutput = ref<BattleSnapshot[]>([])
const battleResult = ref<'win' | 'lose' | undefined>()
const canRun = computed(() => !!teamKiokus.value.length && !!stageId.value)

// RNG (models/BattleRng.ts) and targeting. Auto: the targeting AI picks, and its random picks are
// rolls like any other. Manual: the battle stops at every target decision (either team) until
// you pick; picks and changed rolls are replayed from the start (decisions, by roll index).
const TARGET_MODE_OPTIONS = [
  { value: 'auto', label: 'Auto', title: 'Targets follow the game\'s targeting rules (AI); where they pick at random, the RNG setting below decides.' },
  { value: 'manual', label: 'Manual', title: 'The battle stops at every target decision, for both teams, until you pick the target.' },
] as const
const targetMode = useSetting<'auto' | 'manual'>('pveTargetMode', 'auto')
const rngMode = useSetting<RngMode>('pveRngMode', 'seed')
const seed = ref(Math.floor(Math.random() * 2 ** 32))
const decisions = shallowRef(new Map<number, RngDecision>())
const pending = shallowRef<RngEvent | null>(null)
const pickPanel = ref<HTMLElement | null>(null)
const changedRolls = computed(() => [...decisions.value.values()].filter(d => !d.pick).length)
const pickCount = computed(() => [...decisions.value.values()].filter(d => d.pick).length)
const actionCount = computed(() => battleOutput.value.slice(1).filter(s => !s.wave).length)

function newBattle(): PvPBattle {
  // Fresh units: a battle mutates its units' state.
  const allies = filledSlots.value.map(([s]) => buildSlotKioku(s))
  return markRaw(createPvEBattle(allies, stageId.value, seed.value, 0, {
    rngMode: rngMode.value, decisions: decisions.value, manualTargeting: targetMode.value === 'manual',
  }))
}

// Initial state only (no simulation yet).
function buildBattle() {
  battleResult.value = undefined
  pending.value = null
  if (!canRun.value || !waves.value.length) {
    battle.value = null
    battleOutput.value = []
    return
  }
  try {
    battle.value = newBattle()
    battleOutput.value = [battle.value.getCurrentState()]
  } catch (e) {
    console.warn('Could not build battle', e)
    battle.value = null
    battleOutput.value = []
  }
}
watch([() => team.slots, stageId], () => {
  decisions.value = new Map()
  buildBattle()
}, { deep: true, immediate: true })

function runSimulation() {
  if (!canRun.value || !waves.value.length) return buildBattle()
  let b: PvPBattle
  try {
    b = newBattle()
  } catch (e) {
    console.warn('Could not build battle', e)
    return buildBattle()
  }
  battle.value = b
  pending.value = null
  const states: BattleSnapshot[] = [b.getCurrentState()]
  for (let t = 0; t < simTurns.value && !b.isOver; t++) {
    try {
      states.push(...b.executeNextAction())
    } catch (e) {
      if (e instanceof PendingDecision) {
        pending.value = e.event
        break
      }
      toast.warning(String(e))
      console.warn('Failed to execute next action:', e)
      break
    }
  }
  battleOutput.value = states
  battleResult.value = pending.value ? undefined : b.result
  if (pending.value) nextTick(() => pickPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
}

const hasRun = () => battleOutput.value.length > 1 || !!pending.value
watch([rngMode, targetMode], () => { if (hasRun()) runSimulation(); else buildBattle() })

function setSeed(v: number) {
  seed.value = v
  runSimulation()
}

function setDecision(index: number, d: RngDecision | undefined) {
  const next = new Map(decisions.value)
  if (d) next.set(index, d); else next.delete(index)
  decisions.value = next
  runSimulation()
}

function pickTarget(i: number) {
  const ev = pending.value
  if (ev) setDecision(ev.index, { kind: ev.kind, label: ev.label, value: i, pick: true })
}

function onDecide(ev: RngEvent, value: boolean | number) {
  if (ev.userPick) return setDecision(ev.index, { kind: ev.kind, label: ev.label, value, pick: true })
  setDecision(ev.index, value === ev.defaultOutcome ? undefined : { kind: ev.kind, label: ev.label, value })
}

function resetRolls() {
  decisions.value = new Map([...decisions.value].filter(([, d]) => d.pick))
  if (hasRun()) runSimulation(); else buildBattle()
}

function resetPicks() {
  decisions.value = new Map([...decisions.value].filter(([, d]) => !d.pick))
  runSimulation()
}

// "Name (Enemy 2)" -> that unit's HP in the latest state, for the pick buttons.
function hpOf(label: string): string {
  const m = /\((Ally|Enemy) (\d+)\)$/.exec(label)
  const last = battleOutput.value[battleOutput.value.length - 1]
  if (!m || !last) return ''
  const u = (m[1] === 'Ally' ? last.allies : last.enemies).team[Number(m[2]) - 1]
  return u ? `HP ${fmt(u.hp)} / ${fmt(u.maxHp)}` : ''
}
</script>

<style scoped>
.team-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: var(--text);
  text-align: center;
}

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--accent-soft);
  margin: 0.5rem 0 0.75rem;
  text-align: center;
}

.subsection-title {
  margin: 0.5rem 0;
  color: var(--accent-soft);
  font-size: 0.95rem;
}

.muted { color: var(--muted); }
.small { font-size: 0.8rem; }
.hint-text { color: var(--muted); font-size: 0.9rem; margin: 0 0 0.75rem; }

.wave-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.75rem 0 0;
}

.wave-tabs .hint { font-size: 0.8rem; margin-left: 0.5rem; }

.chip-btn {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  padding: 0.15rem 0.7rem;
  font: inherit;
  cursor: pointer;
}

.chip-btn.active {
  border-color: var(--accent-soft);
  color: var(--accent-soft);
}

.enemy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.enemy-card {
  display: flex;
  gap: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.6rem;
  min-width: 0;
}

.enemy-card.main { border-color: var(--accent-soft); }

.enemy-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.25);
}

.enemy-body { min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.enemy-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.enemy-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.6rem;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

.elem-icon { width: 16px; height: 16px; vertical-align: -3px; }
.resist { color: var(--muted); }

.enemy-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.8rem;
  font-size: 0.82rem;
  margin-top: 0.15rem;
}

.num {
  width: 4.2em;
  padding: 0.1rem 0.25rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font: inherit;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
}

.team-slot {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem;
  min-width: 0;
}

.slot-title { text-align: center; margin: 0.25rem 0 0.5rem; }

.dealer-btn {
  background: none;
  border: 1px dashed var(--border);
  border-radius: 999px;
  color: var(--muted);
  font: inherit;
  font-size: 0.9rem;
  padding: 0.15rem 0.8rem;
  cursor: pointer;
}

.dealer-btn.active {
  border-style: solid;
  border-color: var(--accent-soft);
  color: var(--accent-soft);
  font-weight: 600;
}

.headline {
  text-align: center;
  margin: 0.5rem 0 1rem;
}

.headline-main { font-size: 1.25rem; }

.sa-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: end;
  justify-content: center;
  margin-bottom: 1rem;
}

.sa-score-row { width: 100%; text-align: center; }

.field { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.82rem; }
.field.inline { flex-direction: row; align-items: center; gap: 0.4rem; }
.field input {
  width: 8rem;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font: inherit;
}
.field.inline input { width: 4.5rem; }
.field-label { color: var(--muted); }

.table-wrap { overflow-x: auto; }

.dmg-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.dmg-table th, .dmg-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  text-align: right;
  white-space: nowrap;
}

.dmg-table th:first-child, .dmg-table td:first-child { text-align: left; }
.dmg-table th { color: var(--muted); font-weight: 500; }
.dmg-table tr.dealer td { background: rgba(255, 255, 255, 0.05); }

.effects { margin-top: 1rem; }
.effects summary { cursor: pointer; color: var(--accent-soft); }

.link-btn {
  background: none;
  border: none;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  margin-left: 0.5rem;
}

.effect-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1rem;
}

.effect-row {
  text-align: left;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.1rem 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-bottom: 0.35rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.effect-row:hover { background: rgba(255, 255, 255, 0.04); }
.effect-row.off { opacity: 0.45; text-decoration: line-through; }
.effect-row.na { opacity: 0.35; cursor: default; }
.effect-src { color: var(--muted); }
.effect-cols .subsection-title { text-align: left; }
.effect-type { font-family: monospace; font-size: 0.78rem; color: var(--accent-soft); text-align: right; }
.effect-desc { grid-column: 1 / -1; }
.stacks { grid-column: 1 / -1; color: var(--muted); }

.sim-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
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

.btn-accent { background: var(--accent); color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.result { font-weight: 600; }
.result.win { color: var(--success); }
.result.lose { color: var(--danger); }
.result.waiting { color: var(--accent); }

.sim-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin: 0.5rem 0 1rem;
}

.sim-hint {
  margin: 0 0 0.5rem;
  max-width: 640px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.pick-panel {
  margin: 0.5rem auto 0;
  max-width: 640px;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scroll-margin: 1rem;
}

.pick-head { font-weight: 700; color: var(--accent); }
.pick-label { overflow-wrap: anywhere; }

.pick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pick-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  text-align: left;
}
</style>
