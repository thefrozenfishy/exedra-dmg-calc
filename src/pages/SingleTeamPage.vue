<template>
  <div class="team-page">
    <h1 class="page-title">Simulate Single Battle</h1>

    <section class="card battle-output">
      <h2 class="section-title">Battle Result</h2>
      <p class="result-line">{{ formatDmg(battleOutput) }}</p>

      <div class="sa-score-row">
        <span class="sa-score-label">Score Attack score</span>
        <span class="sa-score-value">{{ sa_score }}</span>
      </div>

      <div class="sa-fields">
        <label class="field">
          <span class="field-label">Health remaining (%)</span>
          <input v-model.number="hp_percentage_team" type="number" step="1" max="100" min="0" />
        </label>
        <label class="field">
          <span class="field-label">Turns</span>
          <input v-model.number="turns" type="number" step="1" min="1" max="16" />
        </label>
        <label class="field"
          title="To find score multiplier, calculate (dmg_dealt / points_from_dmg_done) in an SA run, this changes for each SA">
          <span class="field-label">Score multiplier</span>
          <input v-model.number="scoreMultiplier" type="number" step="0.1" min="0" />
        </label>
      </div>
    </section>

    <section class="toolbar card share-card-actions">
      <div class="toolbar-left">
        <ImageActionsToolbar :target="() => shareCardRef!" filename="single-team-share.png" :export-options="exportOpts"
          :share-options="shareOptionsForTeamCard" :disabled="!shareCardAvailable" />
      </div>
    </section>

    <div class="share-card-preview" ref="shareCardRef">
      <div>{{ formatDmg(battleOutput) }}</div>
      <div class="share-card-grid">
        <div v-for="(slot, index) in team.slots" :key="index" class="share-slot">
          <div v-if="slot?.main">
            <div class="share-slot-top">
              <div class="share-slot-kioku-image">
                <img :src="kiokuImage(slot.main)" :alt="slot.main.name" />
                <div class="share-overlay-badges">
                  <span class="share-overlay-badge ascension">A{{ slot.main.ascension }}</span>
                  <span class="share-overlay-badge heart">H{{ slot.main.heartphialLvl }}</span>
                  <span class="share-overlay-badge magic">ML{{ slot.main.magicLvl }}</span>
                  <span v-if="slot.main.rarity !== 3" class="share-overlay-badge special">SP{{ slot.main.specialLvl
                  }}</span>
                </div>
              </div>
            </div>

            <div class="share-slot-portrait-support">
              <div class="share-slot-portrait-block" v-if="slot.main?.portrait">
                <img class="share-slot-portrait-icon" :src="portraitImage(slot.main.portrait)"
                  :alt="slot.main.portrait" />
                <div class="share-slot-portrait-label">{{ slot.main.portrait }}</div>
              </div>
              <div class="share-slot-support-block" v-if="slot.support">
                <img class="share-slot-support-image" :src="kiokuImage(slot.support)" :alt="slot.support.name" />
                <div class="share-slot-support-label">{{ slot.support.name }}</div>
              </div>
            </div>

            <div class="share-slot-crys-row">
              <span class="share-chip" v-for="([crysId], idx) in Object.entries(slot.main.crysOptions)
                .filter(([, value]) => value.useIndex > 0).sort(([, a], [, b]) => a.useIndex - b.useIndex)"
                :key="`cry-${idx}`">
                {{ crystalises[Number(crysId)]?.styleMstId ? "EX" : crystalises[Number(crysId)]?.name }}
              </span>
            </div>

            <div class="share-slot-subcrys-row">
              <span class="share-chip subcrys-chip" v-for="(item, idx) in summarizeSubCrys(slot.main)"
                :key="`sub-${idx}`">
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="team-grid">
      <div v-for="(slot, index) in team.slots" :key="index" class="team-slot">
        <h3 class="slot-title">
          {{ index === attackerIndex ? 'Damage Dealer' : 'Member' }}
          {{ index < attackerIndex ? index + 1 : index > attackerIndex ? index : "" }}
            <button v-if="index === attackerIndex" type="button" class="optimize-attacker-btn"
              :class="{ spinning: optimizingAttacker }" :disabled="optimizingAttacker || !isFullTeam"
              :title="isFullTeam ? 'Find the best portrait & support for this attacker, given the rest of the team' : 'Fill out the full team first'"
              @click="optimizeAttackerLoadout">
              🛠️
            </button>
        </h3>
        <CharacterEditor :index="index" :slot="slot" :setMain="team.setMain" :setSupport="team.setSupport" />
      </div>
    </div>
  </div>

  <EnemySelector />

  <div class="team-page">
    <section class="card section-card extra-settings">
      <h2 class="section-title">Extra Settings</h2>
      <DamageReductionInputs />
      <ArenaBuffs />
      <div class="weak-elements">
        <AlimentToggler ref="alimentRef">
          <template #heading>
            <h4 class="subsection-title">Active aliments</h4>
          </template>
        </AlimentToggler>
      </div>
    </section>
  </div>

  <div class="team-page">
    <h1 class="page-title">Detailed Info</h1>

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
                    <template
                      v-for="(entries, effectType) in sortEffectType(battleOutput[3][index][rawSectionKey(key)!])"
                      :key="effectType">
                      <div class="debug-contrib-group">
                        <div class="debug-contrib-group-label">{{ effectType }}</div>

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
import { computed, reactive, ref } from 'vue'
import { useTeamStore, useEnemyStore } from '../store/singleTeamStore'
import { ScoreAttackTeam, type DebugSections, type DotAllyCompositeKey, type EnemyDebuffCompositeKey } from '../models/ScoreAttackTeam'
import EnemySelector from '../components/EnemySelector.vue'
import ArenaBuffs from '../components/ArenaBuffs.vue'
import AlimentToggler from '../components/AlimentToggler.vue'
import DamageReductionInputs from '../components/DamageReductionInputs.vue'
import { toast } from "vue3-toastify"
import CharacterEditor from '../components/CharacterEditor.vue'
import ImageActionsToolbar from '../components/ImageActionsToolbar.vue'
import { ScoreAttackKioku } from '../models/ScoreAttackKioku'
import { useSetting } from '../store/settingsStore'
import { KiokuArgs, Character, SkillDetail, skillDetailId } from '../types/KiokuTypes'
import { crystalises, passiveDetails, portraits } from "../utils/helpers";
import { useFriendStore } from '../store/friendStore'
import { useCharacterStore } from '../store/characterStore'
import type { AttackerLoadoutResult } from '../models/BestTeamCalculator'

const attackerIndex = 2

const buffMultReduction = useSetting("buffMultReduction", 0)
const debuffMultReduction = useSetting("debuffMultReduction", 0)
const attackerHealth = useSetting("attackerHealth", 100)
const scoreMultiplier = useSetting("scoreMultiplier", 35)
const turns = useSetting("turns", 3)
const hp_percentage_team = useSetting("hp_percentage_team", 20)
const arenaEffects = useSetting<{ type: string; value: number }[]>("arenaEffects", [])

const alimentRef = ref<InstanceType<typeof AlimentToggler> | null>(null)
const shareCardRef = ref<HTMLElement | null>(null)
const shareCardAvailable = computed(() => team.slots.some(slot => !!slot.main))

const portraitImage = (portrait?: string) => {
  if (!portrait) return ''
  return `/exedra-dmg-calc/portrait_images/${portraits[portrait].resourceName}_thumbnail.png`;
}

const kiokuImage = (member: Character) =>
  `/exedra-dmg-calc/kioku_images/${member.id}_thumbnail.png`

const summarizeSubCrys = (ch: Character) => {

  const items = Object.values(ch.crysOptions)
    .filter(c => c.useIndex > 0)
    .flatMap(option => option.subCrys)
    .filter(Boolean)
    .map(c => Object.values(crystalises).find(cx => cx.selectionAbilityMstId === c))
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

const exportOpts = { exportClass: "exporting" }

const shareOptionsForTeamCard = () => ({
  title: `${useFriendStore().getFormattedDisplayNamePossessive()} Team Setup`,
  backUrl: window.location.href,
})

const sortEffectType = (effects: object) => Object.fromEntries(Object.entries(effects).sort(([a], [b]) => a.localeCompare(b)))
const sa_score = computed(() => {
  if (typeof battleOutput.value === 'string') return "unknown"
  return (800_000 + Number((20 * ((battleOutput.value[0] as number) / scoreMultiplier.value + (90000 - 5000 * turns.value) + 15000 * hp_percentage_team.value / 100)).toFixed(0))).toLocaleString()
})

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
    return debuffStackOverrides.get(`${skillDetailId(detail)}_enemy${enemyIdx}`) ?? detail.value2
  }
  return stackOverrides.get(skillDetailId(detail)) ?? detail.value2
}

function onStackChange(e: Event, detail: SkillDetail, enemyIdx?: number) {
  const clamped = Math.max(0, Math.min(detail.value2, Number((e.target as HTMLInputElement).value)))
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
const toggleBannedEffect = (id: number) => { if (bannedEffectIds[id]) delete bannedEffectIds[id]; else bannedEffectIds[id] = true }
const clearBanned = () => { for (const key of Object.keys(bannedEffectIds)) delete bannedEffectIds[Number(key)] }
const bannedCount = computed(() => Object.keys(bannedEffectIds).length)
const hasBannedEffects = computed(() => bannedCount.value > 0)

const enabledDotAllyEffects = reactive<Record<DotAllyCompositeKey, true>>({})
const dotCompositeKey = (detail: SkillDetail, dotTargetCharId: string): DotAllyCompositeKey =>
  `${skillDetailId(detail)}_${dotTargetCharId}` as DotAllyCompositeKey
const toggleDotAllyEffect = (detail: SkillDetail, dotTargetCharId: string) => {
  const key = dotCompositeKey(detail, dotTargetCharId)
  if (enabledDotAllyEffects[key]) delete enabledDotAllyEffects[key]; else enabledDotAllyEffects[key] = true
}
const isDotAllyEnabled = (detail: SkillDetail, dotTargetCharId: string) =>
  !!enabledDotAllyEffects[dotCompositeKey(detail, dotTargetCharId)]

const disabledEnemyDebuffs = reactive<Set<EnemyDebuffCompositeKey>>(new Set())
const enemyDebuffCompositeKey = (detail: SkillDetail, enemyIdx: number): EnemyDebuffCompositeKey =>
  `${skillDetailId(detail)}_enemy${enemyIdx}` as EnemyDebuffCompositeKey
const toggleEnemyDebuffDisabled = (detail: SkillDetail, enemyIdx: number) => {
  const key = enemyDebuffCompositeKey(detail, enemyIdx)
  if (disabledEnemyDebuffs.has(key)) disabledEnemyDebuffs.delete(key); else disabledEnemyDebuffs.add(key)
}
const isEnemyDebuffEnabled = (detail: SkillDetail, enemyIdx: number) =>
  !disabledEnemyDebuffs.has(enemyDebuffCompositeKey(detail, enemyIdx))

type RawKey = 'rawReceived' | 'rawContributed' | 'rawDebuffs' | 'rawEnemyDebuffs'

function isDotAllyRow(dotTargetCharId: string | undefined, rawKey: RawKey): boolean {
  return !!dotTargetCharId && rawKey !== 'rawDebuffs' && rawKey !== 'rawEnemyDebuffs'
}

function contribRowClass(detail: SkillDetail, dotTargetCharId: string | undefined, rawKey: RawKey, enemyIdx: number) {
  const isEnemyDebuff = rawKey === 'rawEnemyDebuffs'
  return {
    'is-disabled':
      (rawKey === 'rawDebuffs' && !!bannedEffectIds[skillDetailId(detail)]) ||
      (isEnemyDebuff && !isEnemyDebuffEnabled(detail, enemyIdx)) ||
      (!isEnemyDebuff && !isDotAllyRow(dotTargetCharId, rawKey) && !!bannedEffectIds[skillDetailId(detail)]),
    'is-dot-off': isDotAllyRow(dotTargetCharId, rawKey) && !isDotAllyEnabled(detail, dotTargetCharId!),
    'is-dot-on': isDotAllyRow(dotTargetCharId, rawKey) && isDotAllyEnabled(detail, dotTargetCharId!),
  }
}

function handleContribRowClick(detail: SkillDetail, dotTargetCharId: string | undefined, rawKey: RawKey, enemyIdx: number) {
  if (rawKey === 'rawEnemyDebuffs') toggleEnemyDebuffDisabled(detail, enemyIdx)
  else if (rawKey === 'rawDebuffs') toggleBannedEffect(skillDetailId(detail))
  else if (isDotAllyRow(dotTargetCharId, rawKey)) toggleDotAllyEffect(detail, dotTargetCharId!)
  else toggleBannedEffect(skillDetailId(detail))
}

function prettyDisplay(value: number, detail?: SkillDetail): string {
  const nr = Math.round((value / 10 + Number.EPSILON) * 100) / 100
  if (detail?.description === "") return `${value.toLocaleString()} or ${nr}%`
  if (!detail?.description?.includes("%")) return value.toLocaleString()
  return `${nr}%`
}

type SectionKey = keyof DebugSections
const debugSectionOrder: SectionKey[] = ['calc', 'enemy', 'kiokuStats', 'kiokuReceived', 'kiokuContributed', 'kiokuDebuffs', 'kiokuEnemyDebuffs']
const debugSectionLabels: Record<SectionKey, string> = {
  calc: 'DMG Calculation', enemy: 'Enemy Stats', kiokuStats: 'Kioku Stats',
  kiokuReceived: 'Buffs Received', kiokuContributed: 'Contributed to DPS',
  kiokuDebuffs: 'Debuffs Applied by Char', kiokuEnemyDebuffs: 'Debuffs on This Enemy',
  rawReceived: '', rawContributed: '', rawDebuffs: '', rawEnemyDebuffs: '',
}
const rawSectionKey = (key: SectionKey): RawKey | null => {
  if (key === 'kiokuReceived') return 'rawReceived'
  if (key === 'kiokuContributed') return 'rawContributed'
  if (key === 'kiokuDebuffs') return 'rawDebuffs'
  if (key === 'kiokuEnemyDebuffs') return 'rawEnemyDebuffs'
  return null
}
const visibleDebugSections = reactive<Record<SectionKey, boolean>>({
  calc: true, enemy: true, kiokuStats: true, kiokuReceived: true,
  kiokuContributed: true, kiokuDebuffs: false, kiokuEnemyDebuffs: true,
  rawReceived: false, rawContributed: false, rawDebuffs: false, rawEnemyDebuffs: false,
})
const debugSlotTitle = (idx: number) => ['L Other', 'L Proximity', 'Target', 'R Proximity', 'R Other'][idx] ?? `Slot ${idx}`

const team = useTeamStore()
const enemies = useEnemyStore()
const isFullTeam = computed(() => team.slots.map(slot => slot.main).filter(Boolean).length === 5)

const teamInstance = computed(() => {
  if (!isFullTeam.value) return
  try {
    const transformedMembers = team.slots.map(m => {
      const support = m.support ? new ScoreAttackKioku({ ...m.support }) : null

      const crys = m.main
        ? Object.entries(m.main.crysOptions)
          .filter(([, v]) => v.useIndex > 0)
        : []

      return new ScoreAttackKioku(
        {
          ...m.main,
          crysIDs: crys.map(c => Number(c[0])),
          subCrysIDs: crys.flatMap(c => c[1].subCrys),
          supportKey: support?.getKey(),
        } as KiokuArgs,
        (m.buffMultReduction || buffMultReduction.value) ?? 0,
        (m.debuffMultReduction || debuffMultReduction.value) ?? 0,
      )
    }) as ScoreAttackKioku[]

    const arenaEffectsMap: Record<string, number> = {}
    for (const { type, value } of arenaEffects.value) {
      if (!type) continue
      arenaEffectsMap[type] = (arenaEffectsMap[type] ?? 0) + value
    }

    return new ScoreAttackTeam(
      transformedMembers[attackerIndex],
      transformedMembers.filter((_, i) => i !== attackerIndex),
      attackerHealth.value,
      alimentRef.value?.aliments.filter(a => a.enabled).map(a => a.name) ?? [],
      arenaEffectsMap,
      true,
      new Set(Object.keys(bannedEffectIds).map(Number)),
      new Set(Object.keys(enabledDotAllyEffects) as DotAllyCompositeKey[]),
      new Map(stackOverrides),
      new Set(disabledEnemyDebuffs),
      new Map(debuffStackOverrides) as Map<EnemyDebuffCompositeKey, number>,
    )
  } catch (err) {
    toast.error(err, { position: toast.POSITION.TOP_RIGHT, icon: false })
    console.error("Failed to initialize team instance:", err)
    for (let i = 0; i < 5; i++) team.setMain(i, undefined)
  }
})

const battleOutput = computed(() => {
  if (!teamInstance.value) return 'Select 5 characters to calculate'
  return teamInstance.value.calculate_max_dmg(enemies.enemies, 0)
})

const characterStore = useCharacterStore()
const optimizingAttacker = ref(false)

function optimizeAttackerLoadout() {
  if (!isFullTeam.value || optimizingAttacker.value) return

  const attackerSlot = team.slots[attackerIndex]
  if (!attackerSlot.main) return

  optimizingAttacker.value = true

  const worker = new Worker(new URL('../workers/AttackerLoadoutWorker.js', import.meta.url), { type: 'module' })

  const arenaEffectsMap: Record<string, number> = {}
  for (const { type, value } of arenaEffects.value) {
    if (!type) continue
    arenaEffectsMap[type] = (arenaEffectsMap[type] ?? 0) + value
  }

  worker.onmessage = (e) => {
    if (e.data.type === 'done') {
      applyBestAttackerLoadout(e.data.results)
      optimizingAttacker.value = false
      worker.terminate()
    } else if (e.data.type === 'error') {
      toast.error(e.data.error, { position: toast.POSITION.TOP_RIGHT, icon: false })
      console.error("Failed to optimize attacker loadout:", e.data.error)
      optimizingAttacker.value = false
      worker.terminate()
    }
  }

  worker.postMessage({
    options: {
      attacker: {
        main: JSON.parse(JSON.stringify(attackerSlot.main)),
        support: attackerSlot.support ? JSON.parse(JSON.stringify(attackerSlot.support)) : undefined,
        buffMultReduction: attackerSlot.buffMultReduction,
        debuffMultReduction: attackerSlot.debuffMultReduction,
      },
      otherMembers: team.slots
        .filter((_, i) => i !== attackerIndex)
        .map(m => ({
          main: JSON.parse(JSON.stringify(m.main)),
          support: m.support ? JSON.parse(JSON.stringify(m.support)) : undefined,
          buffMultReduction: m.buffMultReduction,
          debuffMultReduction: m.debuffMultReduction,
        })),
      enemies: JSON.parse(JSON.stringify(enemies.enemies)),
      attackerHealth: attackerHealth.value,
      activeAliments: alimentRef.value?.aliments.filter(a => a.enabled).map(a => a.name) ?? [],
      arenaEffectsMap,
      buffMultReduction: buffMultReduction.value,
      debuffMultReduction: debuffMultReduction.value,
      enabledCharacters: JSON.parse(JSON.stringify(characterStore.characters.filter(c => c.enabled))),
      bannedEffectIds: Object.keys(bannedEffectIds).map(Number),
      enabledDotAllyEffects: Object.keys(enabledDotAllyEffects),
      stackOverrides: Array.from(stackOverrides.entries()),
      disabledEnemyDebuffs: Array.from(disabledEnemyDebuffs),
      debuffStackOverrides: Array.from(debuffStackOverrides.entries()),
    }
  })
}

function applyBestAttackerLoadout(results: AttackerLoadoutResult[]) {
  const best = results[0]
  if (!best) {
    toast.error("Couldn't find a valid support for this attacker", { position: toast.POSITION.TOP_RIGHT, icon: false })
    return
  }

  const attackerSlot = team.slots[attackerIndex]
  const prevDmg = typeof battleOutput.value !== 'string' ? battleOutput.value[0] : undefined

  if (attackerSlot.main) attackerSlot.main.portrait = best.portrait

  const supportChar = characterStore.characters.find(c => c.name === best.supportName)
  if (supportChar) team.setSupport(attackerIndex, supportChar)

  const portraitLabel = best.portrait || 'No portrait'
  const dmgChange = prevDmg ? ` (was ${prevDmg.toLocaleString()})` : ''
  toast.success(
    `Best loadout: ${portraitLabel} + ${best.supportName} → ${best.dmg.toLocaleString()} dmg${dmgChange}`,
    { position: toast.POSITION.TOP_RIGHT, icon: false },
  )
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`Copied: ${text}`, { position: toast.POSITION.TOP_RIGHT, icon: false })
  } catch (err) {
    console.error("Failed to copy:", err)
    toast.error("Failed to copy", { position: toast.POSITION.TOP_RIGHT, icon: false })
  }
}
</script>

<style scoped>
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

.toolbar {
  display: flex;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1.2rem;
  color: var(--accent-soft);
  margin: 0 0 0.75rem;
  text-align: center;
}

.subsection-title {
  font-size: 0.95rem;
  color: var(--accent-soft);
  margin: 0 0 0.5rem;
}

.slot-title {
  font-size: 0.95rem;
  color: var(--accent-soft);
  text-align: center;
  margin: 0 0 0.5rem;
}

.optimize-attacker-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3rem;
  padding: 0;
  width: 1.4rem;
  height: 1.4rem;
  vertical-align: middle;
  font-size: 0.9rem;
  line-height: 1;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.optimize-attacker-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 209, 110, 0.5);
  transform: scale(1.08);
}

.optimize-attacker-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.optimize-attacker-btn.spinning {
  animation: optimize-attacker-spin 1s linear infinite;
}

@keyframes optimize-attacker-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.field-label {
  font-size: 0.74rem;
  color: var(--muted);
}

.field input {
  width: 80px;
}

/* ── Battle result card ── */
.result-line {
  text-align: center;
  font-size: 1.05rem;
  margin: 0 0 0.75rem;
  color: var(--text);
}

.sa-score-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.sa-score-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.sa-score-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}

.sa-fields {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.sa-fields .field {
  align-items: center;
}

.extra-settings {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.team-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.team-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  max-width: 1200px;
  width: 100%;
}

.exporting {
  display: block !important;
}

.share-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin: 1rem 0;
  width: 100%;
  max-width: 1200px;
}

.share-card-preview {
  display: none;
  width: 100%;
  max-width: 1200px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem;
  background: rgba(18, 13, 25, 0.95);
  color: var(--text);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.35);
  margin-bottom: 1.5rem;
}

.share-card-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.share-slot {
  background: rgba(15, 11, 21, 0.95);
  border: 1px solid rgba(255, 209, 110, 0.15);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 220px;
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

.share-slot-portrait-icon,
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
  margin-bottom: 0.4rem;
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

.share-slot-portrait-icon {
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--panel);
}

.team-slot {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1rem;
  min-width: 0;
}

.banned-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text);
  max-width: 1200px;
  width: 100%;
}

.clear-banned-btn {
  margin-left: auto;
  padding: 0.2rem 0.75rem;
  background: rgba(255, 155, 143, 0.25);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  color: var(--danger);
  cursor: pointer;
  font-size: 0.8rem;
}

.clear-banned-btn:hover {
  background: rgba(255, 155, 143, 0.4);
}

.debug-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  width: 100%;
}

.debug-section-row {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.debug-section-header {
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
  font-weight: 600;
}

.debug-section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.debug-section-grid .debug-slot {
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.4rem;
  min-width: 0;
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
  color: var(--text);
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
  color: var(--muted);
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
  color: var(--muted);
  padding: 0.1rem 0.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.debug-contrib-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.25rem 0.35rem;
  border-radius: 4px;
  border-left: 2px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.12s, border-color 0.12s;
}

.debug-contrib-row:hover {
  background: rgba(255, 255, 255, 0.07);
  border-left-color: rgba(255, 209, 110, 0.55);
}

.debug-contrib-row.is-disabled {
  background: rgba(180, 40, 40, 0.18);
  border-left-color: rgba(200, 60, 60, 0.65);
  color: var(--danger-soft);
}

.debug-contrib-row.is-dot-off {
  background: rgba(245, 204, 117, 0.18);
  border-left-color: rgba(244, 206, 102, 0.55);
  color: var(--warning);
}

.debug-contrib-row.is-dot-on {
  background: rgba(20, 100, 40, 0.18);
  border-left-color: var(--success);
  color: var(--success-soft);
}

.debug-contrib-source {
  font-weight: 600;
  color: var(--text-light);
}

.debug-contrib-value {
  color: var(--info);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.debug-contrib-desc {
  font-size: 0.72rem;
  color: var(--muted);
  padding-left: 0.8rem;
  line-height: 1.3;
}

.debug-contrib-dot-target {
  font-size: 0.7rem;
  font-style: italic;
  color: var(--muted);
}

.debug-contrib-meta {
  display: flex;
  gap: 0.4rem;
  padding-left: 0.8rem;
  flex-wrap: wrap;
}

.debug-contrib-id {
  color: var(--muted);
  font-size: 0.65rem;
  font-family: monospace;
  cursor: pointer;
  transition: color 0.12s, text-shadow 0.12s;
}

.debug-contrib-row:not(.is-disabled) .debug-contrib-id:hover {
  color: var(--success);
  text-shadow: 0 0 4px rgba(122, 247, 173, 0.55);
}

.debug-contrib-row.is-disabled .debug-contrib-id:hover {
  color: var(--info-soft);
  text-shadow: 0 0 4px rgba(184, 219, 255, 0.45);
}

.debug-contrib-cond {
  color: var(--muted);
  font-size: 0.65rem;
  font-family: monospace;
}

.debug-contrib-stacks {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: var(--muted);
  padding-left: 0.8rem;
}

.debug-contrib-stacks input {
  width: 3.5em;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--text);
  padding: 0.1rem 0.2rem;
  font-size: 0.72rem;
}

.debug-contrib-stacks input:focus {
  outline: 1px solid rgba(255, 209, 110, 0.45);
  border-color: rgba(255, 209, 110, 0.45);
}
</style>
