<template>
  <div class="team-page">
    <h1>Simulate Single Battle</h1>

    <div class="battle-output">
      <h2>Battle Result</h2>
      <h3>{{ formatDmg(battleOutput) }}</h3>
    </div>

    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <h2>{{ index === attackerIndex ? 'Damage Dealer' : 'Member' }}
          {{ index < attackerIndex ? index + 1 : index > attackerIndex ? index : "" }}</h2>

        <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain" :setSupport="team.setSupport"
          :onChangeCrys="onChangeCrys" :onChangeSubCrys="onChangeSubCrys" />
      </div>
    </div>
  </div>

  <EnemySelector />

  <div class="team-page">
    <h2>Extra settings</h2>
    <div key="buffMultReduction">
      <label>Buff Bonus Reduction (%):
        <input type="number" v-model.number="buffMultReduction" step="1" />
      </label>
    </div>
    <div key="debuffMultReduction">
      <label>Debuff Bonus Reduction (%):
        <input type="number" v-model.number="debuffMultReduction" step="1" />
      </label>
    </div>
    <div key="attackerHealth">
      <label>Attacker HP when using ultimate (%):
        <input type="number" v-model.number="attackerHealth" step="1" />
      </label>
    </div>
    <div class="weak-elements">
      <h4>Active aliments</h4>
      <div class="aliment-grid">
        <div v-for="aliment in aliments" :key="aliment.name" class="aliment" :class="{ disabled: !aliment.enabled }"
          @click="aliment.enabled = !aliment.enabled">
          <img :src="`/exedra-dmg-calc/aliments/${aliment.display}.png`" :alt="aliment.display"
            :title="aliment.display" />
          <span>{{ aliment.display }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="team-page">
    <h1>Debug info</h1>

    <div v-if="hasBannedEffects" class="banned-banner">
      <span>Note: {{ bannedCount }} effect{{ bannedCount === 1 ? '' : 's' }} excluded from calculation</span>
      <button class="clear-banned-btn" @click="clearBanned">Include all</button>
    </div>

    <div class="team-grid">
      <div v-for="(enemy, index) in enemies.enemies" :key="index" class="team-slot debug-slot">
        <h3 class="debug-slot-title">{{ debugSlotTitle(index) }}</h3>

        <template v-if="Array.isArray(battleOutput)">
          <template v-for="(key) in debugSectionOrder" :key="key">
            <div v-if="visibleDebugSections[key]" class="debug-section">
              <div class="debug-section-header" @click="toggleSlotSection(index, key)">
                {{ debugSectionLabels[key] }}
                <span class="debug-toggle-icon">{{ collapsedSlotSections[index]?.[key] ? '▸' : '▾' }}</span>
              </div>
              <template v-if="!collapsedSlotSections[index]?.[key]">
                <template v-if="rawSectionKey(key)">
                  <div class="debug-contrib-table">
                    <template v-for="(entries, effectType) in battleOutput[3][index][rawSectionKey(key)!]"
                      :key="effectType">
                      <div class="debug-contrib-group">
                        <div class="debug-contrib-group-label"> {{ effectType }} </div>
                        <div v-for="[detail, value, sourceName] in entries" :key="skillDetailId(detail)"
                          class="debug-contrib-row" :class="{ banned: bannedEffectIds[skillDetailId(detail)] }"
                          @click="toggleBannedEffect(skillDetailId(detail))">
                          <span class="debug-contrib-source">{{ sourceName }}</span>
                          <span class="debug-contrib-value">{{ prettyDisplay(value, detail) }}</span>
                          <div v-if="detail.description" class="debug-contrib-desc">{{ detail.description }}</div>
                          <div class="debug-contrib-meta">
                            <span class="debug-contrib-id clickable-id"
                              @click.stop="copyToClipboard(String(skillDetailId(detail)))">
                              {{ skillDetailId(detail) }}
                            </span>
                            <span v-if="detail.activeConditionSetIdCsv" class="debug-contrib-cond">A{{
                              detail.activeConditionSetIdCsv }}</span>
                            <span v-if="detail.startConditionSetIdCsv" class="debug-contrib-cond">S{{
                              detail.startConditionSetIdCsv }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                    <div v-if="!Object.keys(battleOutput[3][index][rawSectionKey(key)!] ?? {}).length"
                      class="debug-contrib-empty">(none)
                    </div>
                  </div>
                </template>
                <pre v-else class="debug-pre">{{ battleOutput[3][index][key] }}</pre>
              </template>
            </div>
          </template>
        </template>
        <pre v-else class="debug-pre">{{ battleOutput }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/singleTeamStore'
import { ScoreAttackTeam, type DebugSections } from '../models/ScoreAttackTeam'
import EnemySelector from '../components/EnemySelector.vue'
import { toast } from "vue3-toastify"
import CharacterEditor from '../components/CharacterEditor.vue'
import { ScoreAttackKioku } from '../models/ScoreAttackKioku'
import { useSetting } from '../store/settingsStore'
import { Aliment, KiokuArgs, SkillDetail, skillDetailId } from '../types/KiokuTypes'

const attackerIndex = 2

const buffMultReduction = useSetting("buffMultReduction", 0)
const debuffMultReduction = useSetting("debuffMultReduction", 0)
const attackerHealth = useSetting("attackerHealth", 100)

function onChangeCrys(charIdx: number, crysIdx: number, rawValue: string) {
  const main = team.slots[charIdx].main
  if (!main) return
  const current = main.crys ?? ["EX", "", ""]
  current[crysIdx - 1] = rawValue as string
  team.setMain(charIdx, { ...main, crys: current } as any)
}

function onChangeSubCrys(charIdx: number, crysIdx: number, rawValue: string) {
  const main = team.slots[charIdx].main
  if (!main) return
  const current = main.crys_sub ?? Array(9).fill([""]).flat()
  current[crysIdx - 1] = rawValue as string
  team.setMain(charIdx, { ...main, crys_sub: current } as any)
}

const formatDmg = (out: string | [number, number, number, any[]]) =>
  typeof out !== 'string'
    ? `Max Damage: ${out[0].toLocaleString()} with a ${out[2]}% crit rate - (Average Damage: ${out[1].toLocaleString()})`
    : out

const bannedEffectIds = reactive<Record<number, true>>({})

function toggleBannedEffect(id: number) {
  if (bannedEffectIds[id]) delete bannedEffectIds[id]
  else bannedEffectIds[id] = true
}

function clearBanned() {
  for (const key of Object.keys(bannedEffectIds)) {
    delete bannedEffectIds[Number(key)]
  }
}

const bannedCount = computed(() => Object.keys(bannedEffectIds).length)
const hasBannedEffects = computed(() => bannedCount.value > 0)

function prettyDisplay(value: number, detail?: SkillDetail): string {
  if (!detail?.description?.includes("%")) return value.toLocaleString()
  return `${Math.round((value / 10 + Number.EPSILON) * 100) / 100}%`
}

type SectionKey = keyof DebugSections
const debugSectionOrder: SectionKey[] = ['calc', 'enemy', 'kiokuStats', 'kiokuReceived', 'kiokuContributed', 'kiokuDebuffs']
const debugSectionLabels: Record<SectionKey, string> = {
  calc: 'DMG Calculation',
  enemy: 'Enemy Stats',
  kiokuStats: 'Kioku Stats',
  kiokuReceived: 'Buffs Received',
  kiokuContributed: 'Contributed to DPS',
  kiokuDebuffs: 'Debuffs Applied',
  rawReceived: '',
  rawContributed: '',
  rawDebuffs: '',
}

const rawSectionKey = (key: SectionKey): 'rawReceived' | 'rawContributed' | 'rawDebuffs' | null => {
  if (key === 'kiokuReceived') return 'rawReceived'
  if (key === 'kiokuContributed') return 'rawContributed'
  if (key === 'kiokuDebuffs') return 'rawDebuffs'
  return null
}

const visibleDebugSections = reactive<Record<SectionKey, boolean>>({
  calc: true,
  enemy: true,
  kiokuStats: true,
  kiokuReceived: true,
  kiokuContributed: true,
  kiokuDebuffs: true,
  rawReceived: false,
  rawContributed: false,
  rawDebuffs: false,
})

const collapsedSlotSections = reactive<Record<number, Partial<Record<SectionKey, boolean>>>>({})

function toggleSlotSection(slotIdx: number, key: SectionKey) {
  if (!collapsedSlotSections[slotIdx]) collapsedSlotSections[slotIdx] = {}
  collapsedSlotSections[slotIdx][key] = !collapsedSlotSections[slotIdx][key]
}

const debugSlotTitle = (idx: number) => {
  const labels = ['L Other', 'L Proximity', 'Target', 'R Proximity', 'R Other']
  return labels[idx] ?? `Slot ${idx}`
}


const team = useTeamStore()
const enemies = useEnemyStore()
const isFullTeam = computed(() => team.slots.map(slot => slot.main).filter(Boolean).length === 5)

const teamInstance = computed(() => {
  if (!isFullTeam.value) return;
  try {
    const transformedMembers = team.slots.map(m => {
      const support = m.support ? new ScoreAttackKioku({ ...m.support }) : null
      return new ScoreAttackKioku(
        { ...m.main, supportKey: support?.getKey() } as KiokuArgs,
        (m.buffMultReduction || buffMultReduction.value) ?? 0,
        (m.debuffMultReduction || debuffMultReduction.value) ?? 0,
      )
    }) as ScoreAttackKioku[]

    const bannedSet = new Set(Object.keys(bannedEffectIds).map(Number))

    return new ScoreAttackTeam(
      transformedMembers[attackerIndex],
      transformedMembers.filter((v, i) => i !== attackerIndex),
      attackerHealth.value,
      aliments.filter(el => el.enabled).map(el => el.name),
      true,
      bannedSet,
    )
  } catch (err) {
    toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    console.error(err)
    for (let index = 0; index < 5; index++) {
      team.setMain(index, undefined)
    }
  }
})

const battleOutput = computed(() => {
  if (!teamInstance.value) return 'Select 5 characters to calculate'
  return teamInstance.value.calculate_max_dmg(enemies.enemies, 0)
})

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`Copied: ${text}`, {
      position: toast.POSITION.TOP_RIGHT,
      icon: false,
    })
  } catch (err) {
    console.error(err)
    toast.error("Failed to copy", {
      position: toast.POSITION.TOP_RIGHT,
      icon: false,
    })
  }
}

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1).toLowerCase()
const aliments = reactive([
  { name: Aliment.BURN, display: capitalize(Aliment.BURN), enabled: useSetting("burn-enabled", true) },
  { name: Aliment.WEAKNESS, display: capitalize(Aliment.WEAKNESS), enabled: useSetting("weakness-enabled", true) },
  { name: Aliment.POISON, display: capitalize(Aliment.POISON), enabled: useSetting("poison-enabled", true) },
  { name: Aliment.STUN, display: capitalize(Aliment.STUN), enabled: useSetting("stun-enabled", true) },
  { name: Aliment.CURSE, display: capitalize(Aliment.CURSE), enabled: useSetting("curse-enabled", true) },
  { name: Aliment.WOUND, display: capitalize(Aliment.WOUND), enabled: useSetting("wound-enabled", true) },
  { name: Aliment.VORTEX, display: capitalize(Aliment.VORTEX), enabled: useSetting("vortex-enabled", true) },
])
</script>

<style scoped>
.team-page {
  justify-content: center;
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
}

.team-slot {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding-bottom: 1rem;
}

.support-section {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #999;
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
  margin-left: 0.3rem;
}

.stats select {
  width: 90%;
}

.aliment-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.aliment {
  cursor: pointer;
  text-align: center;
  transition: opacity 0.3s;
}

.aliment img {
  width: 30px;
  height: 30px;
  display: block;
  margin: 0 auto;
}

.aliment.disabled {
  opacity: 0.3;
}

.banned-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(180, 40, 40, 0.2);
  border: 1px solid rgba(200, 60, 60, 0.5);
  border-radius: 6px;
  font-size: 0.85rem;
  color: #f99;
  max-width: 1200px;
}

.clear-banned-btn {
  margin-left: auto;
  padding: 0.2rem 0.75rem;
  background: rgba(200, 60, 60, 0.3);
  border: 1px solid rgba(200, 60, 60, 0.6);
  border-radius: 4px;
  color: #fcc;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s;
}

.clear-banned-btn:hover {
  background: rgba(200, 60, 60, 0.55);
}

.debug-slot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.debug-slot-title {
  margin: 0.5rem 0 0.25rem;
  padding: 0 1rem;
  font-size: 1rem;
}

.debug-section {
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
}

.debug-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.75rem;
  background: #1a1a1a;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  user-select: none;
}

.debug-section-header:hover {
  background: #646cff;
}

.debug-toggle-icon {
  font-size: 0.75rem;
}

.debug-pre {
  text-align: left;
  margin: 0;
  font-size: 0.78rem;
  overflow-x: auto;
  white-space: pre;
}

.debug-contrib-table {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
}

.debug-contrib-empty {
  font-size: 0.78rem;
  color: #555;
  padding: 0.25rem 0.25rem;
}

.debug-contrib-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.debug-contrib-group-label {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #aaa;
  padding: 0.15rem 0.25rem 0.1rem;
  border-bottom: 1px solid #222;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.debug-contrib-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.3rem 0.4rem;
  border-radius: 4px;
  border-left: 2px solid #2a2a2a;
  cursor: pointer;
  font-size: 0.76rem;
  background: #141414;
  transition: background 0.12s, border-color 0.12s;
}

.debug-contrib-row:hover {
  background: #222;
  border-left-color: #666;
}

.debug-contrib-row.banned {
  background: rgba(120, 20, 20, 0.25);
  border-left-color: #882222;
  color: #d04040;
}

.debug-contrib-row.banned:hover {
  background: rgba(140, 25, 25, 0.4);
  border-left-color: #aa3333;
}

.debug-contrib-source {
  font-weight: 600;
  color: #ddd;
  white-space: normal;
  overflow: visible;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: left;
}

.debug-contrib-row.banned .debug-contrib-source {
  color: #e07070;
}

.debug-contrib-type-inline {
  font-family: monospace;
  font-size: 0.68rem;
  color: #666;
  white-space: nowrap;
  text-align: left;
}

.debug-contrib-row.banned .debug-contrib-type-inline {
  color: #884444;
}

.debug-contrib-value {
  color: #7cf;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 600;
  text-align: left;
}

.debug-contrib-row.banned .debug-contrib-value {
  color: #c06060;
}

.debug-contrib-desc {
  font-size: 0.72rem;
  color: #888;
  padding-left: 1.1rem;
  white-space: normal;
  line-height: 1.3;
  text-align: left;
}

.debug-contrib-row.banned .debug-contrib-desc {
  color: #774444;
}

.debug-contrib-meta {
  display: flex;
  gap: 0.5rem;
  padding-left: 1.1rem;
  flex-wrap: wrap;
}

.debug-contrib-id {
  color: #aaa;
  font-size: 0.65rem;
  font-family: monospace;
  white-space: nowrap;
}

.debug-contrib-cond {
  color: #404040;
  font-size: 0.65rem;
  font-family: monospace;
  white-space: nowrap;
}

.debug-contrib-row.banned .debug-contrib-id,
.debug-contrib-row.banned .debug-contrib-cond {
  color: #5a3030;
}

.clickable-id {
  cursor: pointer;
  transition: color 0.12s, text-shadow 0.12s;
}

.clickable-id:hover {
  color: #4cff88;
  text-shadow: 0 0 4px rgba(76, 255, 136, 0.6);
}
</style>
