<template>
  <div class="setup-page team-page">
    <h1 class="page-title">PvP Action Order Calculator</h1>

    <section class="toolbar card share-card-actions">
      <div class="toolbar-left">
        <ImageActionsToolbar :target="() => shareCardRef!" filename="pvp-team-share.png" :export-options="exportOpts"
          :share-options="shareOptionsForTeamCard" :disabled="!shareCardAvailable" />
      </div>
    </section>

    <div class="share-card-preview" ref="shareCardRef">
      <div v-for="teamGroup in shareTeams" :key="teamGroup.isAlliedTeam" class="share-team-section">
        <div class="share-team-heading" :class="teamGroup.isAlliedTeam ? 'ally' : 'enemy'">{{ teamGroup.label }} Team
        </div>
        <div class="share-card-grid">
          <div v-for="(entry, index) in teamGroup.entries" :key="index" class="share-slot"
            :class="{ 'share-slot-starter': isStarter(entry.extraData) }">
            <template v-if="entry.slot.main">
              <div class="share-slot-top">
                <div class="share-slot-kioku-image">
                  <img :src="kiokuImage(entry.slot.main)" :alt="entry.slot.main.name" />
                  <div class="share-overlay-badges">
                    <span class="share-overlay-badge ascension">A{{ entry.slot.main.ascension }}</span>
                    <span class="share-overlay-badge heart">H{{ entry.slot.main.heartphialLvl }}</span>
                    <span class="share-overlay-badge magic">ML{{ entry.slot.main.magicLvl }}</span>
                    <span v-if="entry.slot.main.rarity !== 3" class="share-overlay-badge special">SP{{
                      entry.slot.main.specialLvl }}</span>
                  </div>
                </div>
                <div v-if="isStarter(entry.extraData)" class="share-starter-tag">Starts</div>
              </div>

              <div class="share-slot-portrait-support">
                <div class="share-slot-portrait-block" v-if="entry.slot.main?.portrait">
                  <img class="share-slot-portrait-icon" :src="portraitImage(entry.slot.main.portrait)"
                    :alt="entry.slot.main.portrait" />
                  <div class="share-slot-portrait-label">{{ entry.slot.main.portrait }}</div>
                </div>
                <div class="share-slot-support-block" v-if="entry.slot.support">
                  <img class="share-slot-support-image" :src="kiokuImage(entry.slot.support)"
                    :alt="entry.slot.support.name" />
                  <div class="share-slot-support-label">{{ entry.slot.support.name }}</div>
                </div>
              </div>

              <div class="share-slot-crys-row">
                <span class="share-chip" v-for="([crysId], idx) in Object.entries(entry.slot.main.crysOptions)
                  .filter(([, value]) => value.useIndex > 0).sort(([, a], [, b]) => a.useIndex - b.useIndex)"
                  :key="`cry-${idx}`">
                  {{ crystalises[Number(crysId)]?.styleMstId ? "EX" : crystalises[Number(crysId)]?.name }}
                </span>
              </div>

              <div class="share-slot-subcrys-row">
                <span class="share-chip subcrys-chip" v-for="(item, idx) in summarizeSubCrys(entry.slot.main)"
                  :key="`sub-${idx}`">
                  {{ item }}
                </span>
              </div>

              <div class="share-slot-pvp-stats" v-if="entry.extraData">
                <div class="share-pvp-stat">
                  Spd: {{ round(entry.extraData.spd) }}
                  ({{ entry.extraData.baseSpd }}
                  <span class="share-spd-bonus">+ {{ round(entry.extraData.spd - entry.extraData.baseSpd) }}</span>)
                </div>
                <div class="share-pvp-stat">
                  Initial AV: {{ entry.extraData.secondsLeft > 0.001 || entry.extraData.secondsLeft === 0 ?
                    round(entry.extraData.secondsLeft) :
                  'Barely not 0!' }}
                </div>
              </div>
            </template>
            <div v-else class="share-slot-empty">Empty</div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="isAlliedTeam in [1, 0]">
      <h2 class="section-title">{{ isAlliedTeam ? "Allied" : "Enemy" }} Team</h2>
      <div class="team-grid">
        <div v-for="(slot, index) in team.slots[isAlliedTeam]" :key="index" class="team-slot">
          <h3 class="slot-title"> {{ isAlliedTeam ? "Ally" : "Enemy" }} {{ index + 1 }}</h3>

          <CharacterEditor :index="index" :slot="slot"
            :extraData="battleOutput[0]?.[isAlliedTeam ? 'allies' : 'enemies']?.team?.find(b => b.name === slot.main?.name)"
            :setMain="team.setMain(isAlliedTeam)" :setSupport="team.setSupport(isAlliedTeam)" />
        </div>
      </div>
    </div>

    <section class="card battle-order-card">
      <h2 class="section-title">Battle Order</h2>

      <div class="notice-banner">
        <h3 class="notice-tag">Under construction</h3>
        <p>Take this with a big grain of salt, as my understanding of the mechanics here are not perfect, nor do I
          want to use the time to special case all different attacks, targeting etc.</p>
      </div>

      <p class="hint-text">Use this to get a gut feel for how characters and speed vs AV vs AA works and how speed
        ties resolve. I'll try to make sure all common pvp characters work identical to in-game, but niche picks are
        at your own risk. If anything looks weird, just give me a poke with an example team!</p>

      <button class="btn btn-accent run-sim-btn" @click="runSimulation" :disabled="!isFullBattle">Run
        Simulation</button>

      <div class="sim-tools">
        <span class="sim-seed" title="Every random roll (crits, effect chances, targeting) comes from this seed">
          Seed {{ battleInstance?.seed ?? "-" }}<span v-if="forcedSeed !== undefined"> (fixed)</span>
        </span>
        <button class="btn" @click="rerollSeed" :disabled="!isFullBattle"
          title="Use a new random seed">New seed</button>
        <button class="btn" @click="exportBattle" :disabled="!isFullBattle"
          title="Save the team setup, seed and the full simulated sequence to a file">Export to file</button>
        <button class="btn" @click="importInput?.click()"
          title="Load teams and seed from an exported file and re-run the simulation">Import file</button>
        <input ref="importInput" type="file" accept=".json,application/json" class="hidden-file" @change="importBattle" />
      </div>

      <div class="battle-output">
        <div v-for="(state, idx) in battleOutput" :key="idx" class="battle-state">
          <div class="matchup-divider">
            <div v-if="idx > 0" class="ten-separator" :class="state.lastTeamIsTeam1 ? 'ally' : 'enemy'">
              <span class="turn">Action {{ idx }}</span>
              <span class="actor">{{ state.lastActor }}</span>
              <span class="action"> {{ skillTranslate[state.lastTargetType] }} </span>
              <span v-if="state.actionLabel && state.lastTargetType !== TargetType.fuaId" class="sub-action-tag">{{ state.actionLabel }}</span>
            </div>
            <div v-else>

              <span class="action"> Initial State </span>
            </div>
          </div>

          <ul v-if="idx > 0 && state.events?.length" class="battle-log">
            <li v-for="(ev, evIdx) in state.events" :key="evIdx" :class="['log-' + ev.kind, ev.sourceIsTeam1 ? 'ally' : 'enemy']">
              <template v-if="ev.kind === 'heal'">
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

          <div v-for="(side, sideIdx) of [state.allies, state.enemies]">
            <div class="row">
              {{ side.sp }}
              <div v-for="char in side.team" :key="char.id" class="character" :class="{ ko: char.isDead }">
                <a :href="`https://exedra.wiki/wiki/${char.name}`" target="_blank" style="display: block;"
                  :class="{ broken: char.breakCurrent <= 0 }">
                  <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name"
                    :class="{ 'at-zero': char.secondsLeft <= 0 }" />
                </a>
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
                  </div>
                </div>
                <div class="status-row">
                  <template v-if="idx > 0">
                    <span v-if="damageTo(state, sideIdx === 0, char.name)" class="dmg-text">−{{ fmt(damageTo(state, sideIdx === 0, char.name)) }}</span>
                    <span v-if="healTo(state, sideIdx === 0, char.name)" class="heal-text">+{{ fmt(healTo(state, sideIdx === 0, char.name)) }}</span>
                  </template>
                  <span v-if="char.barrier > 0" class="status-chip barrier-chip" :title="`Barrier ${fmt(char.barrier)} / ${fmt(char.maxBarrier)}`">Barrier {{ fmt(char.barrier) }}</span>
                  <span v-if="char.shields" class="status-chip shield" :title="`${char.shields} active shield(s): damage cut per hit`">Shield ×{{ char.shields }}</span>
                  <span v-if="char.isBroken" class="status-chip broken-chip" title="Damage taken while broken">Broken {{ char.breakedDamageReceiveRate ?? 100 }}%</span>
                  <span v-if="char.stunned" class="status-chip stun">Stunned</span>
                </div>
                <div class="progress-bar" :title="char.mp + ' / ' + char.maxMp">
                  MP
                  <progress :value="char.mp" :max="char.maxMp">MP</progress>
                </div>
                <div class="progress-bar" :title="char.breakCurrent + ' / ' + char.maxBreakGauge">
                  Break
                  <progress :value="char.breakCurrent" :max="char.maxBreakGauge"></progress>
                </div>
                <div class="distance">Magic: {{ char.magicStacks }} / {{ char.maxMagicStacks }}</div>
                <div class="distance">{{ round(char.secondsLeft) }} AV ({{ round(char.distanceLeft / 100) }} AA)</div>
                <div class="distance" :title="formatSpdBuffs(char.currSpdBuffs)">{{ round(char.spd) }} spd</div>
                <div class="distance" :title="char.buffs.join('\n')">{{ char.buffs.length }} buffs</div>
                <div class="distance" :title="char.debuffs.join('\n')">{{ char.debuffs.length }} debuffs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, ref, shallowRef, watch } from 'vue'
import { usePvPStore } from '../store/singleTeamStore'
import { BattleSnapshot, TargetType, TeamSnapshot, Character } from '../types/KiokuTypes'
import { PvPBattle } from '../models/PvPBattle'
import { PvPTeam } from '../models/PvPTeam'
import CharacterEditor from '../components/CharacterEditor.vue'
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { toast } from 'vue3-toastify'
import { PvPKioku } from '../models/PvPKioku'
import { buildPvPKiokus, buildExport, parseExport, downloadText } from '../utils/pvpExport'
import { useFriendStore } from '../store/friendStore'
import { crystalises, passiveDetails, portraits } from "../utils/helpers"

const skillTranslate = {
  [TargetType.attackId]: "Basic Attack",
  [TargetType.specialId]: "Ultimate",
  [TargetType.skillId]: "Battle Skill",
  [TargetType.fuaId]: "Follow-up",

}

const team = usePvPStore()

const battleOutput = ref<BattleSnapshot[]>([])

const round = (spd: number) => spd.toFixed(2)

const formatSpdBuffs = (buffs: [number, string, string?][]) => buffs.map(buff => `${round(buff[0])} given by "${buff[1]}" applied by ${buff[2] ?? "UNKNOWN"}`).join("\n")

const isFullBattle = computed(() => team.slots[0].every(t => t?.main) && team.slots[1].every(t => t?.main))
// shallowRef + markRaw: the battle must NOT become a deep Vue reactive proxy. The engine relies
// on object identity (lastActor !== unit, Map/Set lookups, team.kiokuStates.includes(unit)), and
// proxies vs raw objects made page runs differ from the same seed run anywhere else.
const battleInstance = shallowRef<PvPBattle | null>(null)

// Shared with scripts/sim/replayExport.ts so an exported file replays with the same teams.
function buildTeams(): [PvPKioku[], PvPKioku[]] {
  return buildPvPKiokus(team.slots)
}

// Turns simulated per run (each turn can produce several displayed actions).
const SIM_TURNS = 30
// Seed from an imported file (or kept after "New seed" is not pressed); undefined = random.
const forcedSeed = ref<number | undefined>(undefined)
const importInput = ref<HTMLInputElement | null>(null)

watch(team, () => {
  if (!isFullBattle.value) {
    battleOutput.value = []
    battleInstance.value = null
    return
  }
  const [alliedTeam, enemyTeam] = buildTeams()
  const battle = markRaw(new PvPBattle(new PvPTeam(alliedTeam, "Ally", true), new PvPTeam(enemyTeam, "Enemy"), false, forcedSeed.value))
  battleInstance.value = battle
  if (import.meta.env.DEV) (window as any).__pvpBattle = battle // for debugging exports in dev
  battleOutput.value = [battle.getCurrentState()]
  console.debug("State is", battleOutput.value)
}, { immediate: true, deep: true })

function isStarter(extraData?: TeamSnapshot) {
  return !!extraData && extraData.secondsLeft === 0
}

function getExtraData(isAlliedTeam: number, mainName?: string): TeamSnapshot | undefined {
  if (!mainName) return undefined
  return battleOutput.value[0]?.[isAlliedTeam ? 'allies' : 'enemies']?.team?.find(b => b.name === mainName)
}

const shareTeams = computed(() => [1, 0].map(isAlliedTeam => ({
  isAlliedTeam,
  label: isAlliedTeam ? 'Allied' : 'Enemy',
  entries: team.slots[isAlliedTeam].map(slot => ({
    slot,
    extraData: getExtraData(isAlliedTeam, slot.main?.name),
  })),
})))

const shareCardRef = ref<HTMLElement | null>(null)
const shareCardAvailable = computed(() => team.slots[0].some(s => !!s.main) || team.slots[1].some(s => !!s.main))
const exportOpts = { exportClass: "exporting" }

const shareOptionsForTeamCard = () => ({
  title: `${useFriendStore().getFormattedDisplayNamePossessive()} PvP Team Setup`,
  backUrl: window.location.href,
})

const kiokuImage = (member: Character) =>
  `/exedra-dmg-calc/kioku_images/${member.id}_thumbnail.png`

const portraitImage = (portrait?: string) => {
  if (!portrait) return ''
  return `/exedra-dmg-calc/portrait_images/${portraits[portrait].resourceName}_thumbnail.png`
}

const summarizeSubCrys = (ch: Character) => {
  const items = Object.values(ch.crysOptions)
    .filter(c => c.useIndex > 0)
    .flatMap(option => option.subCrys)
    .filter(Boolean)
    .map(c => Object.values(crystalises).find(cx => cx.selectionAbilityMstId === c))
    .filter(c => c?.abilityEffectType === "UP_SPD_FIXED")
    .map(c => Object.values(passiveDetails).find(v => (v as any).passiveSkillMstId === c?.value1))
    .filter(c => !!c)

  if (!items.length) return []
  const counts = items.reduce((acc, eff) => {
    if (eff.abilityEffectType in acc) {
      acc[eff.abilityEffectType][1] = acc[eff.abilityEffectType][1] + eff.value1
    } else {
      acc[eff.abilityEffectType] = [
        eff.description
          .replace(eff.value1, "XXXXX")
          .replace((eff.value1 / 10).toFixed(1), "XXXXX")
          .replace((eff.value1 / 10).toFixed(0), "XXXXX"),
        eff.value1
      ]
    }

    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts).map(([effType, [desc, nr]]) => desc.replace("XXXXX", (desc as string).includes("%") ? nr / 10 : nr))
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const pct = (v: number, max: number) => `${max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0}%`
function hpClass(hp: number, maxHp: number) {
  const r = maxHp > 0 ? hp / maxHp : 0
  return r > 0.5 ? 'hp-high' : r > 0.25 ? 'hp-mid' : 'hp-low'
}
// Sum of what the last action did to this unit (the snapshot's events belong to lastActor's action).
function eventsFor(state: BattleSnapshot, isAllies: boolean, name: string) {
  return (state.events ?? []).filter(e => e.target === name && e.targetIsTeam1 === isAllies)
}
function damageTo(state: BattleSnapshot, isAllies: boolean, name: string) {
  return eventsFor(state, isAllies, name).filter(e => e.kind !== 'heal').reduce((s, e) => s + e.amount, 0)
}
function healTo(state: BattleSnapshot, isAllies: boolean, name: string) {
  return eventsFor(state, isAllies, name).filter(e => e.kind === 'heal').reduce((s, e) => s + e.amount, 0)
}

function runSimulation() {
  if (!isFullBattle.value || !battleInstance.value) {
    battleOutput.value = []
    return
  }
  if (battleOutput.value.length > 1) return // Only run sim once

  // One entry per executed skill: turn actions, ultimates, extra actions, combo steps and
  // follow-ups each get their own "Action N" (executeNextAction returns them in order).
  const states: BattleSnapshot[] = [battleInstance.value.getCurrentState()]
  for (let turn = 0; turn < SIM_TURNS; turn++) {
    try {
      states.push(...battleInstance.value.executeNextAction())
    } catch (e) {
      toast.warning(e)
      console.warn("Failed to execute next action:", e)
      break
    }
  }
  battleOutput.value = states
}

// Rebuild the battle with a fresh random seed (drops a seed fixed by an import).
function rebuildBattle() {
  if (!isFullBattle.value) return
  const [alliedTeam, enemyTeam] = buildTeams()
  battleInstance.value = markRaw(new PvPBattle(new PvPTeam(alliedTeam, "Ally", true), new PvPTeam(enemyTeam, "Enemy"), false, forcedSeed.value))
  battleOutput.value = [battleInstance.value.getCurrentState()]
}

function rerollSeed() {
  forcedSeed.value = undefined
  rebuildBattle()
}

function exportBattle() {
  if (!battleInstance.value) return
  if (battleOutput.value.length <= 1) runSimulation()
  const seed = battleInstance.value.seed
  const data = buildExport(team.slots, seed, SIM_TURNS, battleOutput.value)
  const first = (team.slots[1][0]?.main?.name ?? "team").replace(/[^A-Za-z0-9]+/g, "-")
  downloadText(`pvp-sim-${first}-seed${seed}.json`, JSON.stringify(data, null, 2))
  toast.success("Exported team setup and simulated sequence")
}

async function importBattle(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ""
  if (!file) return
  try {
    const data = parseExport(await file.text())
    forcedSeed.value = data.seed
    team.importSlots(data.slots)
    await nextTick()
    rebuildBattle()
    runSimulation()
    toast.success(`Imported teams, seed ${data.seed}`)
  } catch (e) {
    toast.error(`Could not import: ${(e as Error).message}`)
  }
}
</script>

<style scoped>
/* ── Page (shared design system) ── */
.setup-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 4rem;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 1.25rem;
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
  margin: 1.5rem 0 0.75rem;
  text-align: center;
}

.slot-title {
  font-size: 0.95rem;
  color: var(--accent-soft);
  text-align: center;
  margin: 0.5rem 0;
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
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-accent {
  background: var(--accent-glow);
  border: 1px solid var(--border-strong);
  color: var(--accent);
}

.btn-accent:hover:not(:disabled) {
  background: var(--accent-glow-strong);
  border-color: var(--accent);
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.run-sim-btn {
  display: block;
  margin: 0 auto 0.75rem;
}

.sim-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto 1.5rem;
}

.sim-seed {
  font-size: 0.85em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.hidden-file {
  display: none;
}

.battle-order-card {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
}

.notice-banner {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.85rem;
  margin-bottom: 0.75rem;
}

.notice-tag {
  flex-shrink: 0;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: var(--danger);
  background: rgba(255, 155, 143, 0.18);
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  margin-top: 0.1rem;
}

.notice-banner p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text);
}

.hint-text {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 0 0 1rem;
}

.team-page {
  justify-content: center;
}

.toolbar {
  display: flex;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.exporting {
  display: block !important;
}

.share-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin: 0 0 1.25rem;
  width: 100%;
  max-width: 1200px;
}

.share-card-preview {
  display: none;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem;
  background: rgba(18, 13, 25, 0.95);
  color: var(--text);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.35);
}

.share-team-section+.share-team-section {
  margin-top: 1.25rem;
}

.share-team-heading {
  font-size: 1.05rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.6rem;
  color: var(--accent-soft);
}

.share-team-heading.ally {
  color: rgba(128, 198, 153, 0.9);
}

.share-team-heading.enemy {
  color: rgba(255, 154, 154, 0.9);
}

.share-card-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.share-slot {
  position: relative;
  background: rgba(15, 11, 21, 0.95);
  border: 1px solid rgba(255, 209, 110, 0.15);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 300px;
}

.share-slot-starter {
  border: 2px solid rgba(255, 209, 110, 0.9);
  box-shadow: 0 0 12px rgba(255, 209, 110, 0.5);
}

.share-starter-tag {
  position: absolute;
  top: -0.6rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 209, 110, 0.95);
  color: #2a1e05;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 999px;
  padding: 0.1rem 0.6rem;
  white-space: nowrap;
}

.share-slot-top {
  display: flex;
  justify-content: center;
  align-items: center;
}

.share-slot-kioku-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 14px;
  background: radial-gradient(circle at top, rgba(255, 207, 109, 0.14), rgba(14, 10, 21, 1));
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-slot-kioku-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-overlay-badges {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.share-overlay-badge {
  position: absolute;
  min-width: 34px;
  transform: translateX(-50%);
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 12, 20, 0.88);
  color: var(--text);
  font-size: 0.74rem;
  text-align: center;
  border-radius: 999px;
  font-weight: 700;
  padding: 0 0.35rem;
}

.share-overlay-badge.ascension {
  left: 80%;
  top: 0;
}

.share-overlay-badge.heart {
  left: 20%;
  top: 0;
}

.share-overlay-badge.magic {
  left: 20%;
  bottom: 0;
}

.share-overlay-badge.special {
  left: 80%;
  bottom: 0;
}

.share-slot-portrait-support {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: flex-start;
}

.share-slot-portrait-block,
.share-slot-support-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.share-slot-portrait-icon {
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--panel);
}

.share-slot-support-image {
  height: 40px;
  object-fit: cover;
}

.share-slot-portrait-label,
.share-slot-support-label {
  font-size: 0.78rem;
  color: var(--muted);
  text-align: center;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-slot-crys-row,
.share-slot-subcrys-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  min-height: 2rem;
}

.share-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--accent);
  font-size: 0.78rem;
}

.subcrys-chip {
  background: var(--accent-glow);
}

.share-slot-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-slot-pvp-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.share-pvp-stat {
  font-size: 0.72rem;
  color: var(--muted);
  text-align: center;
}

.share-spd-bonus {
  color: aqua;
}

.share-slot-empty {
  margin: auto;
  font-size: 0.8rem;
  color: var(--muted);
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
}

.team-slot {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding-bottom: 1rem;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.12);
  color: var(--muted);
}

.stat-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  height: 100%;
}

.stat-inputs label {
  width: 90%;
  display: block;
  color: var(--text);
  margin-left: 0.3rem;
}

.stat {
  display: flex;
  margin-left: 0.3rem;
}

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

.character img.at-zero {
  border-color: var(--success);
  border-radius: 50%;
  border-width: 5px;
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
</style>
