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
                  Initial AV: {{ round(entry.extraData.secondsLeft) }}
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

      <div class="battle-output">
        <div v-for="(state, idx) in battleOutput" :key="idx" class="battle-state">
          <div class="matchup-divider">
            <div v-if="idx > 0" class="ten-separator" :class="state.lastTeamIsTeam1 ? 'ally' : 'enemy'">
              <span class="turn">Action {{ idx }}</span>
              <span class="actor">{{ state.lastActor }}</span>
              <span class="action"> {{ skillTranslate[state.lastTargetType] }} </span>
            </div>
            <div v-else>

              <span class="action"> Initial State </span>
            </div>
          </div>

          <div v-for="side of [state.allies, state.enemies]">
            <div class="row">
              {{ side.sp }}
              <div v-for="char in side.team" :key="char.id" class="character">
                <a :href="`https://exedra.wiki/wiki/${char.name}`" target="_blank" style="display: block;"
                  :class="{ broken: char.breakCurrent <= 0 }">
                  <img :src="`/exedra-dmg-calc/kioku_images/${char.id}_thumbnail.png`" :alt="char.name"
                    :class="{ 'at-zero': char.secondsLeft - 0.001 <= 0 }" />
                </a>
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
import { computed, ref, watch } from 'vue'
import { usePvPStore } from '../store/singleTeamStore'
import { BattleSnapshot, TargetType, TeamSnapshot, Character } from '../types/KiokuTypes'
import { PvPBattle } from '../models/PvPBattle'
import { PvPTeam } from '../models/PvPTeam'
import CharacterEditor from '../components/CharacterEditor.vue'
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { toast } from 'vue3-toastify'
import { PvPKioku } from '../models/PvPKioku'
import { useFriendStore } from '../store/friendStore'
import { crystalises, passiveDetails, portraits } from "../utils/helpers"

const skillTranslate = {
  [TargetType.attackId]: "Basic Attack",
  [TargetType.specialId]: "Ultimate",
  [TargetType.skillId]: "Battle Skill",

}

const team = usePvPStore()

const battleOutput = ref<BattleSnapshot[]>([])

const round = (spd: number) => spd.toFixed(2)

const formatSpdBuffs = (buffs: [number, string, string?][]) => buffs.map(buff => `${round(buff[0])} given by "${buff[1]}" applied by ${buff[2] ?? "UNKNOWN"}`).join("\n")

const isFullBattle = computed(() => team.slots[0].every(t => t?.main) && team.slots[1].every(t => t?.main))
const battleInstance = ref<PvPBattle | null>(null)

function buildTeams(): [PvPKioku[], PvPKioku[]] {
  return [1, 0].map(idx =>
    team.slots[idx].map(m => {
      const crys = m.main
        ? Object.entries(m.main.crysOptions)
          .filter(([, v]) => v.useIndex > 0)
        : []

      return new PvPKioku({
        ...m.main,
        crysIDs: crys.map(c => Number(c[0])),
        subCrysIDs: crys.flatMap(c => c[1].subCrys),
        supportKey: m.support
          ? new PvPKioku(m.support).getKey()
          : undefined,
      })
    })
  ) as [PvPKioku[], PvPKioku[]]
}

watch(team, () => {
  if (!isFullBattle.value) {
    battleOutput.value = []
    battleInstance.value = null
    return
  }
  const [alliedTeam, enemyTeam] = buildTeams()
  const battle = new PvPBattle(new PvPTeam(alliedTeam, "Ally", true), new PvPTeam(enemyTeam, "Enemy"))
  battleInstance.value = battle
  battleOutput.value = [battle.getCurrentState()]
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

function runSimulation() {
  if (!isFullBattle.value || !battleInstance.value) {
    battleOutput.value = []
    return
  }
  if (battleOutput.value.length > 1) return // Only run sim once

  const states = []
  for (let index = 0; index < 30; index++) {
    battleInstance.value.traverseToNextActor()
    states.push(battleInstance.value.getCurrentState())
    try {
      battleInstance.value.executeNextAction()
    } catch (e) {
      toast.warning(e)
      console.warn("Failed to execute next action:", e)
    }
  }
  battleOutput.value = states

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
  margin: 0 auto 1.5rem;
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
