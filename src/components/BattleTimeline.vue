<template>
  <div class="battle-output">
    <div v-for="(state, idx) in states" :key="idx" class="battle-state">
      <div class="matchup-divider">
        <div v-if="state.wave" class="ten-separator wave-separator">
          <span class="turn">Wave {{ state.wave }}</span>
        </div>
        <div v-else-if="idx > 0" class="ten-separator" :class="state.lastTeamIsTeam1 ? 'ally' : 'enemy'">
          <span class="turn">Action {{ actionNumber(idx) }}<template v-if="state.round"> · R{{ state.round }}</template></span>
          <span class="actor">{{ state.lastActor }}</span>
          <span class="action"> {{ skillTranslate[state.lastTargetType as keyof typeof skillTranslate] }} </span>
          <span v-if="state.actionLabel && state.lastTargetType !== TargetType.fuaId" class="sub-action-tag">{{ state.actionLabel }}</span>
        </div>
        <div v-else>
          <span class="action"> Initial State </span>
        </div>
      </div>

      <div v-if="state.linkHp || state.countdown || state.vanguard" class="raid-status">
        <span v-if="state.vanguard">Vanguard: <b>{{ state.vanguard.active ? `ACTIVE (${fmt(state.vanguard.gauge)} left)` : `${state.vanguard.point}/${state.vanguard.maxPoint}` }}</b><template v-if="state.vanguard.active"> · {{ state.vanguard.point }}/{{ state.vanguard.activeMaxPoint }} pts</template><template v-if="state.linkHp || state.countdown"> · </template></span>
        <span v-if="state.linkHp">{{ state.linkHp.name || 'Linked HP' }}: <b>{{ fmt(state.linkHp.current) }}</b> / {{ fmt(state.linkHp.max) }}</span>
        <span v-if="state.countdown"><template v-if="state.linkHp"> · </template>Countdown ({{ state.countdown.unit }}): <b>{{ state.countdown.value }}</b>
          · cancel damage {{ fmt(state.countdown.cancelTotal) }} / {{ fmt(state.countdown.cancelMax) }}</span>
      </div>

      <ul v-if="idx > 0 && state.events?.length" class="battle-log">
        <li v-for="(ev, evIdx) in state.events" :key="evIdx" :class="['log-' + ev.kind, ev.sourceIsTeam1 ? 'ally' : 'enemy']">
          <template v-if="ev.kind === 'summon' && ev.formChange">
            {{ ev.source ?? '?' }} changed form: <b>{{ ev.target }}</b>
          </template>
          <template v-else-if="ev.kind === 'summon'">
            {{ ev.source ?? '?' }} summoned <b>{{ ev.target }}</b>
          </template>
          <template v-else-if="ev.kind === 'heal'">
            {{ ev.source ?? '?' }} healed {{ ev.target }} <b class="heal-text">+{{ fmt(ev.amount) }}</b>
          </template>
          <template v-else>
            {{ ev.source ?? '?' }} {{ ev.kind === 'dot' ? 'DOT on' : '→' }} {{ ev.target }}
            <b class="dmg-text">{{ fmt(ev.amount) }}</b>
            <span v-if="ev.isCritical" class="crit-tag">crit</span>
            <span v-if="ev.barrierAbsorbed" class="barrier-text"> ({{ fmt(ev.barrierAbsorbed) }} into barrier)</span>
            <span v-if="ev.breakDamage" class="break-text"> · break −{{ ev.breakDamage }}</span>
            <span v-if="ev.broke" class="break-tag">BREAK</span>
            <span v-if="ev.breakRateUp" class="break-text"> · broken dmg +{{ ev.breakRateUp }}%</span>
          </template>
        </li>
      </ul>

      <details v-if="state.rngEvents?.length" class="rng-log" :open="rngEditable || state.rngEvents.some(e => e.userPick)">
        <summary>{{ state.rngEvents.length }} random roll{{ state.rngEvents.length === 1 ? '' : 's' }}<span
            v-if="rngEditable" class="muted"> · click to change</span></summary>
        <ul>
          <li v-for="ev in state.rngEvents" :key="ev.index" :class="{ changed: ev.decided && !ev.userPick }">
            <span class="rng-kind" :class="'kind-' + ev.kind">{{ ev.userPick ? 'Your pick' : KIND_LABEL[ev.kind] }}</span>
            <template v-if="ev.options">
              <span class="rng-label">{{ ev.label }}</span>
              <select v-if="rngEditable || ev.userPick" class="rng-select" :value="ev.outcome"
                @change="emit('decide', ev, Number(($event.target as HTMLSelectElement).value))">
                <option v-for="(o, i) in ev.options" :key="i" :value="i" :disabled="!(o.weight > 0)">
                  {{ o.label }}{{ ev.userPick ? '' : ` (${pctText(o.weight)})` }}</option>
              </select>
              <b v-else class="rng-outcome">{{ ev.options[ev.outcome as number]?.label }}
                <span class="muted">({{ pctText(ev.options[ev.outcome as number]?.weight ?? 0) }})</span></b>
            </template>
            <template v-else>
              <label class="rng-binary" :class="{ editable: rngEditable }">
                <input v-if="rngEditable" type="checkbox" :checked="!!ev.outcome"
                  @change="emit('decide', ev, ($event.target as HTMLInputElement).checked)" />
                <span class="rng-label">{{ ev.label }}</span>
                <span class="rng-chance">{{ pctText(ev.probability ?? 0) }}</span>
                <b class="rng-outcome" :class="ev.outcome ? 'hit' : 'miss'">{{ ev.outcome ? 'hit' : 'miss' }}</b>
              </label>
            </template>
          </li>
        </ul>
      </details>

      <div v-for="(side, sideIdx) of [state.allies, state.enemies]" :key="sideIdx">
        <div class="row">
          <span v-if="showSp || sideIdx === 0" class="sp-count" title="Skill points">{{ side.sp }}</span>
          <div v-for="(char, charIdx) in side.team" :key="charIdx" class="character" :class="{ ko: char.isDead }">
            <a :href="char.isEnemyUnit ? undefined : `https://exedra.wiki/wiki/${char.name}`" target="_blank" style="display: block;"
              :class="{ broken: char.maxBreakGauge > 0 && char.breakCurrent <= 0 }">
              <img :src="portrait(char)" :alt="char.name"
                :class="{
                  'is-actor': idx > 0 && isActor(state, sideIdx === 0, charIdx),
                  'acts-first': idx === 0 && char.secondsLeft <= 0,
                  'enemy-portrait': char.isEnemyUnit,
                }"
                :title="char.name + (idx > 0 && isActor(state, sideIdx === 0, charIdx) ? ' (acting in this action)' : (idx === 0 && char.secondsLeft <= 0 ? ' (acts first)' : ''))"
                @error="onImgError" />
            </a>
            <div v-if="char.isEnemyUnit" class="unit-name" :title="char.name">{{ char.name }}</div>
            <div class="hp-block"
              :title="`HP ${fmt(char.hp)} / ${fmt(char.maxHp)}` + (char.barrier > 0 ? `\nBarrier ${fmt(char.barrier)} / ${fmt(char.maxBarrier)}` : '')">
              <div class="hp-track">
                <div class="hp-fill" :class="hpClass(char.hp, char.maxHp)" :style="{ width: pct(char.hp, char.maxHp) }"></div>
              </div>
              <div v-if="char.barrier > 0" class="barrier-track">
                <div class="barrier-fill" :style="{ width: pct(char.barrier, char.maxHp) }"></div>
              </div>
              <div class="hp-text">
                {{ char.isDead ? 'KO' : fmt(char.hp) }}<span class="hp-max"> / {{ fmt(char.maxHp) }}</span>
                <span v-if="char.hpGauges" class="gauge-count" title="HP gauges left">×{{ char.hpGauges }}</span>
              </div>
            </div>
            <div class="status-row">
              <template v-if="idx > 0">
                <span v-if="damageTo(state, sideIdx === 0, charIdx, char.name)" class="dmg-text">−{{ fmt(damageTo(state, sideIdx === 0, charIdx, char.name)) }}</span>
                <span v-if="healTo(state, sideIdx === 0, charIdx, char.name)" class="heal-text">+{{ fmt(healTo(state, sideIdx === 0, charIdx, char.name)) }}</span>
              </template>
              <span v-if="char.barrier > 0" class="status-chip barrier-chip" :title="`Barrier ${fmt(char.barrier)} / ${fmt(char.maxBarrier)}`">Barrier {{ fmt(char.barrier) }}</span>
              <span v-if="char.shields" class="status-chip shield" :title="`${char.shields} active shield(s): damage cut per hit`">Shield ×{{ char.shields }}</span>
              <span v-if="char.isBroken" class="status-chip broken-chip" title="Damage taken while broken">Broken {{ char.breakedDamageReceiveRate ?? 100 }}%</span>
              <span v-if="char.stunned" class="status-chip stun">Stunned</span>
            </div>
            <div v-if="char.maxMp > 0" class="progress-bar" :title="char.mp + ' / ' + char.maxMp">
              MP
              <progress :value="char.mp" :max="char.maxMp">MP</progress>
            </div>
            <div v-if="char.maxBreakGauge > 0" class="progress-bar" :title="char.breakCurrent + ' / ' + char.maxBreakGauge">
              Break
              <progress :value="char.breakCurrent" :max="char.maxBreakGauge"></progress>
            </div>
            <div v-if="char.maxMagicStacks" class="distance">Magic: {{ char.magicStacks }} / {{ char.maxMagicStacks }}</div>
            <div class="distance">{{ round(char.secondsLeft) }} AV ({{ round(char.distanceLeft / 100) }} AA)</div>
            <div class="distance" :title="formatSpdBuffs(char.currSpdBuffs)">{{ round(char.spd) }} spd</div>
            <div class="distance" :title="char.buffs.join('\n')">{{ char.buffs.length }} buffs</div>
            <div class="distance" :title="char.debuffs.join('\n')">{{ char.debuffs.length }} debuffs</div>
            <div class="distance" :class="{ 'has-ailment': char.ailments?.length }" :title="(char.ailments ?? []).join('\n')">{{ char.ailments?.length ?? 0 }} ailments</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// One entry per executed action (turn actions, ultimates, extra actions, combo steps, follow-ups),
// shared by the PvP and single battle pages.
import { type BattleSnapshot, TargetType, type TeamSnapshot } from '../types/KiokuTypes'

import type { RngEvent, RngKind } from '../models/BattleRng'

// rngEditable: Manual RNG mode - rolls get a checkbox / dropdown and emit `decide` when changed.
// Manual targeting picks (userPick) are always changeable.
const props = withDefaults(defineProps<{ states: BattleSnapshot[], showSp?: boolean, rngEditable?: boolean }>(), { showSp: true, rngEditable: false })
const emit = defineEmits<{ decide: [event: RngEvent, value: boolean | number] }>()

const KIND_LABEL: Record<RngKind, string> = { crit: 'Crit', effect: 'Effect', target: 'Target', skill: 'Skill', action: 'Action' }
const pctText = (p: number) => `${p >= 10 ? p.toFixed(1).replace(/\.0$/, '') : p.toFixed(2).replace(/0$/, '')}%`

const skillTranslate = {
  [TargetType.attackId]: "Basic Attack",
  [TargetType.specialId]: "Ultimate",
  [TargetType.skillId]: "Battle Skill",
  [TargetType.fuaId]: "Follow-up",
}

// Wave dividers are not actions: number actions without them.
function actionNumber(idx: number) {
  let n = 0
  for (let i = 1; i <= idx; i++) if (!props.states[i]?.wave) n++
  return n
}

const round = (spd: number) => spd.toFixed(2)
const formatSpdBuffs = (buffs: [number, string, string?][]) => buffs.map(buff => `${round(buff[0])} given by "${buff[1]}" applied by ${buff[2] ?? "UNKNOWN"}`).join("\n")
const fmt = (n: number) => Math.round(n).toLocaleString()
const pct = (v: number, max: number) => `${max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0}%`
function hpClass(hp: number, maxHp: number) {
  const r = maxHp > 0 ? hp / maxHp : 0
  return r > 0.5 ? 'hp-high' : r > 0.25 ? 'hp-mid' : 'hp-low'
}
const portrait = (char: TeamSnapshot) => char.isEnemyUnit
  ? `/exedra-dmg-calc/enemy/${char.id}_thumbnail.png`
  : `/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`
function onImgError(ev: Event) {
  const img = ev.target as HTMLImageElement
  img.style.visibility = 'hidden'
}
// The unit performing this entry's action (matched by team + slot, since names can repeat).
function isActor(state: BattleSnapshot, isAllies: boolean, charIdx: number) {
  return state.lastTeamIsTeam1 === isAllies && state.lastActorPos === charIdx
}
// Sum of what the last action did to this unit (the snapshot's events belong to lastActor's action).
// Matched by team + slot (older exports without targetPos fall back to the name).
function eventsFor(state: BattleSnapshot, isAllies: boolean, pos: number, name: string) {
  return (state.events ?? []).filter(e => e.targetIsTeam1 === isAllies && (e.targetPos !== undefined ? e.targetPos === pos : e.target === name))
}
function damageTo(state: BattleSnapshot, isAllies: boolean, pos: number, name: string) {
  return eventsFor(state, isAllies, pos, name).filter(e => e.kind !== 'heal').reduce((s, e) => s + e.amount, 0)
}
function healTo(state: BattleSnapshot, isAllies: boolean, pos: number, name: string) {
  return eventsFor(state, isAllies, pos, name).filter(e => e.kind === 'heal').reduce((s, e) => s + e.amount, 0)
}
</script>

<style scoped>
.battle-output {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.character {
  text-align: center;
  color: var(--text);
}

.character img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 2px solid transparent;
}

.character img.is-actor {
  border-color: var(--success);
  border-radius: 50%;
  border-width: 5px;
  box-shadow: 0 0 10px var(--success);
}

.character img.acts-first {
  border-color: var(--success);
  border-style: dashed;
  border-radius: 50%;
  border-width: 3px;
}

.broken {
  filter: grayscale(100%) brightness(0.6);
}

.character.ko img {
  filter: grayscale(100%) brightness(0.45);
}

.hp-block {
  width: 104px;
  margin: 0.35rem auto 0;
}

.hp-track,
.barrier-track {
  position: relative;
  width: 100%;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-soft);
}

.hp-track {
  height: 8px;
}

.barrier-track {
  height: 4px;
  margin-top: 2px;
}

.hp-fill,
.barrier-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.hp-fill.hp-high { background: var(--success); }
.hp-fill.hp-mid { background: var(--warning); }
.hp-fill.hp-low { background: var(--danger); }
.barrier-fill { background: var(--info); }

.hp-text {
  margin-top: 0.2rem;
  font-size: 0.85em;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.hp-max { color: var(--muted); }
.barrier-text { color: var(--info); }
.dmg-text { color: var(--danger); font-variant-numeric: tabular-nums; }
.heal-text { color: var(--success); font-variant-numeric: tabular-nums; }

.hp-change {
  min-height: 1.1em;
  font-size: 0.85em;
  font-weight: 600;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.3em;
  max-width: 150px;
  margin: 0.15rem auto 0.2rem;
  font-size: 0.85em;
  font-weight: 600;
}

.status-chip {
  font-size: 0.9em;
  padding: 0 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--muted);
}

.status-chip.barrier-chip { color: var(--info); border-color: var(--info); }
.status-chip.shield { color: var(--info); border-color: var(--info); }
.status-chip.broken-chip { color: var(--warning); border-color: var(--warning); }
.status-chip.stun { color: var(--danger); border-color: var(--danger); }

.sub-action-tag {
  margin-left: 0.5rem;
  font-size: 0.7em;
  font-weight: 600;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  opacity: 0.85;
  vertical-align: middle;
}

.break-text { color: var(--warning); font-size: 0.9em; }
.break-tag {
  margin-left: 0.3rem;
  font-size: 0.75em;
  font-weight: 700;
  color: var(--warning);
  border: 1px solid var(--warning);
  border-radius: 999px;
  padding: 0 0.35rem;
}

.crit-tag {
  margin-left: 0.3rem;
  font-size: 0.75em;
  font-weight: 700;
  color: var(--warning);
  text-transform: uppercase;
}

.battle-log {
  list-style: none;
  margin: 0 auto 0.75rem;
  padding: 0.5rem 0.75rem;
  max-width: 640px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  font-size: 0.9em;
  color: var(--text);
}

.battle-log li {
  padding: 0.1rem 0;
  border-left: 3px solid transparent;
  padding-left: 0.5rem;
}

.battle-log li.ally { border-left-color: rgba(128, 198, 153, 0.6); }
.battle-log li.enemy { border-left-color: rgba(255, 129, 129, 0.6); }

.rng-log {
  margin: 0 auto 0.75rem;
  max-width: 640px;
  width: 100%;
  font-size: 0.85em;
  color: var(--text);
}

.rng-log summary {
  cursor: pointer;
  color: var(--muted);
  font-size: 0.95em;
  text-align: center;
}

.rng-log ul {
  list-style: none;
  margin: 0.35rem 0 0;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
}

.rng-log li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.12rem 0 0.12rem 0.5rem;
  border-left: 3px solid transparent;
}

.rng-log li.changed { border-left-color: var(--accent); }

.rng-binary {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.rng-binary.editable { cursor: pointer; }

.rng-kind {
  flex-shrink: 0;
  min-width: 3.4rem;
  font-size: 0.72em;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
}

.rng-kind.kind-crit { color: var(--warning); }
.rng-kind.kind-target, .rng-kind.kind-skill { color: var(--info); }

.rng-label { overflow-wrap: anywhere; }
.rng-chance { color: var(--muted); font-variant-numeric: tabular-nums; }
.rng-outcome.hit { color: var(--success); }
.rng-outcome.miss { color: var(--danger); }
.rng-select { max-width: 100%; font-size: 0.95em; }
.muted { color: var(--muted); }
.distance.has-ailment { color: var(--warning); }

.distance {
  margin-top: 0.25rem;
  font-size: 0.9em;
  color: var(--muted);
}

.progress-bar>progress {
  width: 50%;
}

.ten-separator {
  margin: 0.35rem 0.75rem;
  border-radius: 999px;
  color: var(--text);
  font-weight: bold;
  font-weight: 600;
}

.ten-separator.ally {
  background: rgba(128, 198, 153, 0.15);
  border-color: rgba(128, 198, 153, 0.28);
}

.ten-separator.enemy {
  background: rgba(255, 154, 154, 0.18);
  border-color: rgba(255, 129, 129, 0.35);
}

.matchup-divider {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  margin: 1.75rem 0 1rem;
}

.matchup-divider::before,
.matchup-divider::after {
  content: "";
  flex: 1;
  height: 3px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.25), transparent);
}

.matchup-divider span {
  padding: 0 0.75rem;
}

.sp-count {
  align-self: center;
  color: var(--muted);
}

.unit-name {
  max-width: 7.5rem;
  font-size: 0.75rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}

.gauge-count {
  margin-left: 0.25rem;
  color: var(--warning);
}

.raid-status {
  font-size: 0.85rem;
  color: var(--accent-soft);
  margin: 0.25rem 0;
}

.wave-separator {
  border-color: var(--accent-soft);
  color: var(--accent-soft);
}

.character img.enemy-portrait {
  background: rgba(0, 0, 0, 0.25);
}
</style>
