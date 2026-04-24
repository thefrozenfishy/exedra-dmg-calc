<template>
  <div class="team-page">
    <h1>Simulate Single Battle</h1>

    <div class="battle-output">
      <h2>Battle Result</h2>
      <h3>{{ formatDmg(battleOutput) }}</h3>
      <h4>Score Attack score: {{ sa_score }} given: <input style="width: 3em;" v-model.number="hp_percentage_team"
          type="number" step="1" max="100" min="0" />% health
        remaining, <input style="width: 3em;" v-model.number="turns" type="number" step="1" min="1" max="16" /> turns,
        and <span
          title="To find score multiplier, calculate (dmg_dealt / points_from_dmg_done) in an SA run, this changes for each SA">score
          multiplier of <input style="width: 4em;" v-model.number="scoreMultiplier" type="number" step="0.1"
            min="0" /></span></h4>
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

    <div class="debug-sections">
      <template v-for="key in debugSectionOrder" :key="key">
        <div v-if="visibleDebugSections[key]" class="debug-section-row">

          <div class="debug-section-header">
            {{ debugSectionLabels[key] }}
          </div>

          <div class="debug-section-grid">
            <div v-for="(enemy, index) in enemies.enemies" :key="index" class="debug-slot">
              <h3 class="debug-slot-title">{{ debugSlotTitle(index) }}</h3>

              <template v-if="Array.isArray(battleOutput)">
                <template v-if="rawSectionKey(key)">
                  <div class="debug-contrib-table">
                    <template v-for="(entries, effectType) in battleOutput[3][index][rawSectionKey(key)!]"
                      :key="effectType">
                      <div class="debug-contrib-group">
                        <div class="debug-contrib-group-label">
                          {{ effectType }}
                        </div>

                        <div v-for="[detail, value, sourceName, dotTargetCharId, dotTargetName] in entries"
                          :key="`${skillDetailId(detail)}_${dotTargetCharId ?? 'dps'}`" class="debug-contrib-row"
                          :class="contribRowClass(detail, dotTargetCharId, rawSectionKey(key)!, index)"
                          @click="handleContribRowClick(detail, dotTargetCharId, rawSectionKey(key)!, index)">
                          <span class="debug-contrib-source">{{ sourceName }}</span>

                          <span v-if="dotTargetName && rawSectionKey(key) === 'rawContributed'"
                            class="debug-contrib-dot-target">
                            → {{ dotTargetName }}
                          </span>

                          <span class="debug-contrib-value">
                            {{ prettyDisplay(value, detail) }}
                          </span>

                          <div v-if="detail.description" class="debug-contrib-desc">
                            {{ detail.description }}
                          </div>

                          <div v-if="detail.value2 > 1" class="debug-contrib-stacks" @click.stop>
                            <label>
                              Stacks:
                              <input type="number" :min="0" :max="detail.value2"
                                :value="getStackOverride(detail, isDebuffSection(rawSectionKey(key)!) ? index : undefined)"
                                @change="e => onStackChange(e, detail, isDebuffSection(rawSectionKey(key)!) ? index : undefined)"
                                style="width: 3.5em;" />
                              / {{ detail.value2 }}
                            </label>
                          </div>

                          <div class="debug-contrib-meta">
                            <span class="debug-contrib-id clickable-id"
                              @click.stop="copyToClipboard(String(skillDetailId(detail)))">
                              {{ skillDetailId(detail) }}
                            </span>

                            <span v-if="detail.activeConditionSetIdCsv" class="debug-contrib-cond">
                              A{{ detail.activeConditionSetIdCsv }}
                            </span>

                            <span v-if="detail.startConditionSetIdCsv" class="debug-contrib-cond">
                              S{{ detail.startConditionSetIdCsv }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <div v-if="!Object.keys(battleOutput[3][index][rawSectionKey(key)!] ?? {}).length"
                      class="debug-contrib-empty">
                      (none)
                    </div>
                  </div>
                </template>

                <pre v-else class="debug-pre">{{ battleOutput[3][index][key] }}</pre>
              </template>

              <pre v-else class="debug-pre">{{ battleOutput }}</pre>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/singleTeamStore'
import { ScoreAttackTeam, type DebugSections, type DotAllyCompositeKey, type EnemyDebuffCompositeKey } from '../models/ScoreAttackTeam'
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
const scoreMultiplier = useSetting("scoreMultiplier", 35)
const turns = useSetting("turns", 3)
const hp_percentage_team = useSetting("hp_percentage_team", 20)

const sa_score = computed(() => {
  if (typeof battleOutput.value === 'string') return "unknown"
  return (800_000 + Number((20 * ((battleOutput.value[0] as number) / scoreMultiplier.value + (90000 - 5000 * turns.value) + 15000 * hp_percentage_team.value / 100)).toFixed(0))).toLocaleString()
})

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

const stackOverrides = reactive<Map<number, number>>(new Map())
const debuffStackOverrides = reactive<Map<string, number>>(new Map())

function isDebuffSection(rawKey: RawKey): boolean {
  return rawKey === 'rawDebuffs' || rawKey === 'rawEnemyDebuffs'
}

function getStackOverride(detail: SkillDetail, enemyIdx?: number): number {
  if (enemyIdx !== undefined) {
    const key = `${skillDetailId(detail)}_enemy${enemyIdx}`
    return debuffStackOverrides.get(key) ?? detail.value2
  }
  return stackOverrides.get(skillDetailId(detail)) ?? detail.value2
}

function onStackChange(e: Event, detail: SkillDetail, enemyIdx?: number) {
  const v = Number((e.target as HTMLInputElement).value)
  const clamped = Math.max(0, Math.min(detail.value2, v))
  if (enemyIdx !== undefined) {
    const key = `${skillDetailId(detail)}_enemy${enemyIdx}`
    if (clamped === detail.value2) debuffStackOverrides.delete(key)
    else debuffStackOverrides.set(key, clamped)
  } else {
    if (clamped === detail.value2) stackOverrides.delete(skillDetailId(detail))
    else stackOverrides.set(skillDetailId(detail), clamped)
  }
}

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

const enabledDotAllyEffects = reactive<Record<DotAllyCompositeKey, true>>({})

function dotCompositeKey(detail: SkillDetail, dotTargetCharId: string): DotAllyCompositeKey {
  return `${skillDetailId(detail)}_${dotTargetCharId}` as DotAllyCompositeKey
}

function toggleDotAllyEffect(detail: SkillDetail, dotTargetCharId: string) {
  const key = dotCompositeKey(detail, dotTargetCharId)
  if (enabledDotAllyEffects[key]) delete enabledDotAllyEffects[key]
  else enabledDotAllyEffects[key] = true
}

function isDotAllyEnabled(detail: SkillDetail, dotTargetCharId: string): boolean {
  return !!enabledDotAllyEffects[dotCompositeKey(detail, dotTargetCharId)]
}

const disabledEnemyDebuffs = reactive<Set<EnemyDebuffCompositeKey>>(new Set())

function enemyDebuffCompositeKey(detail: SkillDetail, enemyIdx: number): EnemyDebuffCompositeKey {
  return `${skillDetailId(detail)}_enemy${enemyIdx}` as EnemyDebuffCompositeKey
}

function toggleEnemyDebuffDisabled(detail: SkillDetail, enemyIdx: number) {
  const key = enemyDebuffCompositeKey(detail, enemyIdx)
  if (disabledEnemyDebuffs.has(key)) disabledEnemyDebuffs.delete(key)
  else disabledEnemyDebuffs.add(key)
}

function isEnemyDebuffEnabled(detail: SkillDetail, enemyIdx: number): boolean {
  return !disabledEnemyDebuffs.has(enemyDebuffCompositeKey(detail, enemyIdx))
}

type RawKey = 'rawReceived' | 'rawContributed' | 'rawDebuffs' | 'rawEnemyDebuffs'

function isDotAllyRow(dotTargetCharId: string | undefined, rawKey: RawKey): boolean {
  return !!dotTargetCharId && rawKey !== 'rawDebuffs' && rawKey !== 'rawEnemyDebuffs'
}

function contribRowClass(
  detail: SkillDetail,
  dotTargetCharId: string | undefined,
  rawKey: RawKey,
  enemyIdx: number,
): Record<string, boolean> {
  const isEnemyDebuff = rawKey === 'rawEnemyDebuffs'
  const enemyEnabled = isEnemyDebuff
    ? isEnemyDebuffEnabled(detail, enemyIdx)
    : true

  return {
    'is-disabled':
      (rawKey === 'rawDebuffs' && !!bannedEffectIds[skillDetailId(detail)]) ||
      (isEnemyDebuff && !enemyEnabled) ||
      (!isEnemyDebuff && !isDotAllyRow(dotTargetCharId, rawKey) && !!bannedEffectIds[skillDetailId(detail)]),

    'is-dot-off':
      isDotAllyRow(dotTargetCharId, rawKey) &&
      !isDotAllyEnabled(detail, dotTargetCharId!),

    'is-dot-on':
      isDotAllyRow(dotTargetCharId, rawKey) &&
      isDotAllyEnabled(detail, dotTargetCharId!),
  }
}

function handleContribRowClick(
  detail: SkillDetail,
  dotTargetCharId: string | undefined,
  rawKey: RawKey,
  enemyIdx: number,
) {
  if (rawKey === 'rawEnemyDebuffs') {
    toggleEnemyDebuffDisabled(detail, enemyIdx)
  } else if (rawKey === 'rawDebuffs') {
    toggleBannedEffect(skillDetailId(detail))
  } else if (isDotAllyRow(dotTargetCharId, rawKey)) {
    toggleDotAllyEffect(detail, dotTargetCharId!)
  } else {
    toggleBannedEffect(skillDetailId(detail))
  }
}

function prettyDisplay(value: number, detail?: SkillDetail): string {
  const nr = Math.round((value / 10 + Number.EPSILON) * 100) / 100
  if (detail?.description === "") return `${value.toLocaleString()} or ${nr}%`
  if (!detail?.description?.includes("%")) return value.toLocaleString()
  return `${nr}%`
}

type SectionKey = keyof DebugSections
const debugSectionOrder: SectionKey[] = [
  'calc', 'enemy', 'kiokuStats', 'kiokuReceived', 'kiokuContributed', 'kiokuDebuffs', 'kiokuEnemyDebuffs',
]
const debugSectionLabels: Record<SectionKey, string> = {
  calc: 'DMG Calculation',
  enemy: 'Enemy Stats',
  kiokuStats: 'Kioku Stats',
  kiokuReceived: 'Buffs Received',
  kiokuContributed: 'Contributed to DPS',
  kiokuDebuffs: 'Debuffs Applied by Char',
  kiokuEnemyDebuffs: 'Debuffs on This Enemy',
  rawReceived: '',
  rawContributed: '',
  rawDebuffs: '',
  rawEnemyDebuffs: '',
}

const rawSectionKey = (key: SectionKey): RawKey | null => {
  if (key === 'kiokuReceived') return 'rawReceived'
  if (key === 'kiokuContributed') return 'rawContributed'
  if (key === 'kiokuDebuffs') return 'rawDebuffs'
  if (key === 'kiokuEnemyDebuffs') return 'rawEnemyDebuffs'
  return null
}

const visibleDebugSections = reactive<Record<SectionKey, boolean>>({
  calc: true,
  enemy: true,
  kiokuStats: true,
  kiokuReceived: true,
  kiokuContributed: true,
  kiokuDebuffs: false,
  kiokuEnemyDebuffs: true,
  rawReceived: false,
  rawContributed: false,
  rawDebuffs: false,
  rawEnemyDebuffs: false,
})

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
    const enabledDotSet = new Set(Object.keys(enabledDotAllyEffects) as DotAllyCompositeKey[])
    const stackOverridesCopy = new Map(stackOverrides)
    const disabledEnemyDebuffsCopy = new Set(disabledEnemyDebuffs)
    const debuffStackOverridesCopy = new Map(debuffStackOverrides) as Map<EnemyDebuffCompositeKey, number>

    return new ScoreAttackTeam(
      transformedMembers[attackerIndex],
      transformedMembers.filter((v, i) => i !== attackerIndex),
      attackerHealth.value,
      aliments.filter(el => el.enabled).map(el => el.name),
      true,
      bannedSet,
      enabledDotSet,
      stackOverridesCopy,
      disabledEnemyDebuffsCopy,
      debuffStackOverridesCopy,
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
    toast.success(`Copied: ${text}`, { position: toast.POSITION.TOP_RIGHT, icon: false })
  } catch (err) {
    console.error(err)
    toast.error("Failed to copy", { position: toast.POSITION.TOP_RIGHT, icon: false })
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow-x: hidden;
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
  width: 100%;
}

.team-slot {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding-bottom: 1rem;
  min-width: 0; 
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
  transition: opacity 0.2s;
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
  background: rgba(180, 40, 40, 0.15);
  border: 1px solid rgba(200, 60, 60, 0.4);
  border-radius: 6px;
  font-size: 0.85rem;
  color: #f19999;
  max-width: 1200px;
  width: 100%;
}

.clear-banned-btn {
  margin-left: auto;
  padding: 0.2rem 0.75rem;
  background: rgba(200, 60, 60, 0.25);
  border: 1px solid rgba(200, 60, 60, 0.5);
  border-radius: 4px;
  color: #fcc;
  cursor: pointer;
  font-size: 0.8rem;
}

.clear-banned-btn:hover {
  background: rgba(200, 60, 60, 0.45);
}

.debug-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  width: 100%;
}

.debug-section-row {
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}

.debug-section-header {
  padding: 0.4rem 0.75rem;
  background: #1a1a1a;
  font-size: 0.85rem;
  font-weight: 600;
}

.debug-section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.debug-section-grid .debug-slot {
  min-width: 0;
}

.debug-section-grid .debug-slot {
  border-right: 1px solid #222;
  padding: 0.4rem;
}

.debug-section-grid .debug-slot:last-child {
  border-right: none;
}

.debug-slot {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.debug-slot-title {
  margin: 0.4rem 0 0.2rem;
  padding: 0 0.5rem;
  font-size: 0.95rem;
}

.debug-pre {
  text-align: left;
  margin: 0;
  font-size: 0.78rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.debug-contrib-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.3rem 0.4rem;
}

.debug-contrib-empty {
  font-size: 0.75rem;
  color: #555;
  padding: 0.2rem;
}

.debug-contrib-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.debug-contrib-group-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
  padding: 0.1rem 0.2rem;
  border-bottom: 1px solid #222;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.debug-contrib-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.25rem 0.35rem;
  border-radius: 4px;
  border-left: 2px solid #2a2a2a;
  cursor: pointer;
  font-size: 0.75rem;
  background: #141414;
  transition: background 0.12s, border-color 0.12s;
}

.debug-contrib-row:hover {
  background: #1f1f1f;
  border-left-color: #555;
}

.debug-contrib-row.is-disabled {
  background: rgba(120, 20, 20, 0.2);
  border-left-color: #882222;
  color: #d46a6a;
}

.debug-contrib-row.is-dot-off {
  background: rgba(140, 110, 0, 0.18);
  border-left-color: #8a6b00;
  color: #d4b84a;
}

.debug-contrib-row.is-dot-on {
  background: rgba(20, 100, 40, 0.2);
  border-left-color: #2e7d4f;
  color: #5fdc9b;
}

.debug-contrib-source {
  font-weight: 600;
  color: #ddd;
}

.debug-contrib-value {
  color: #7cf;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.debug-contrib-desc {
  font-size: 0.72rem;
  color: #888;
  padding-left: 0.8rem;
  line-height: 1.3;
}

.debug-contrib-dot-target {
  font-size: 0.7rem;
  font-style: italic;
  color: #aaa;
}

.debug-contrib-meta {
  display: flex;
  gap: 0.4rem;
  padding-left: 0.8rem;
  flex-wrap: wrap;
}

.debug-contrib-id {
  color: #666;
  font-size: 0.65rem;
  font-family: monospace;
  cursor: pointer;
  transition: color 0.12s, text-shadow 0.12s;
}

.debug-contrib-row:not(.is-disabled) .debug-contrib-id:hover {
  color: #4cff88;
  text-shadow: 0 0 4px rgba(76, 255, 136, 0.6);
}

.debug-contrib-row.is-disabled .debug-contrib-id:hover {
  color: #7ccfff;
  text-shadow: 0 0 4px rgba(120, 200, 255, 0.6);
}

.debug-contrib-cond {
  color: #444;
  font-size: 0.65rem;
  font-family: monospace;
}

.debug-contrib-stacks {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #aaa;
  padding-left: 0.8rem;
}

.debug-contrib-stacks input {
  width: 3.5em;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 3px;
  color: #ccc;
  padding: 0.1rem 0.2rem;
  font-size: 0.72rem;
}

.debug-contrib-stacks input:focus {
  outline: 1px solid #666;
  border-color: #666;
}
</style>
