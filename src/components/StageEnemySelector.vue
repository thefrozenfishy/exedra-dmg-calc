<template>
    <section class="card section-card stage-enemy-selector">
        <h2 class="section-title">Stage</h2>
        <StagePicker v-model="stageId" />

        <StageWaveRows :s="view" :wiki-url="wikiUrl"
            wave-hint="Teams are scored against the enemies on the field when the selected wave starts. Untick Alive on an enemy to leave it out entirely."
            phase-hint="Teams are scored against the selected form, with the enemies on the field when it comes in." />

        <div v-if="view.enemyInfo.length" class="derived-row">
            <span class="filters-heading">Weak elements</span>
            <span v-if="!view.weakElements.length" class="row-hint">none</span>
            <img v-for="w in view.weakElements" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w" :title="w"
                class="elem-icon" />
            <span class="filters-heading derived-gap">Ailments that can land</span>
            <span v-if="!view.ailments.length" class="row-hint">none</span>
            <img v-for="a in view.ailments.map(ailmentLabel)" :key="a" :src="`/exedra-dmg-calc/aliments/${a}.png`" :alt="a" :title="a"
                class="elem-icon" />
        </div>

        <div v-if="raid && raid.partyBuffs.length" class="derived-row">
            <span class="filters-heading">Party buff</span>
            <button v-for="p in raid.partyBuffs" :key="p.soloRaidPartyBuffMstId" type="button" class="chip"
                :class="{ active: p.soloRaidPartyBuffMstId === partyBuffChoice }" :title="passiveText(p.passiveSkillMstId)"
                @click="partyBuffId = p.soloRaidPartyBuffMstId">{{ passiveName(p.passiveSkillMstId) }}</button>
        </div>

        <div v-if="stageBuffs.length" class="derived-row stage-buffs" title="Given to your units by this stage's mode and counted in every score (conditions met, like the kits' own buffs)">
            <span class="filters-heading">Stage buffs</span>
            <span v-for="(b, i) in stageBuffs" :key="i" class="stage-buff">{{ b }}</span>
        </div>

        <EnemyCards v-if="view.enemyInfo.length" :s="view" />
    </section>
</template>

<script setup lang="ts">
// The Highest Dmg Calc's stage and enemy picker: the PvE Simulator's stage tree, wave / phase / adds rows and enemy
// cards (composables/useStageEnemies, StageWaveRows, EnemyCards), plus the stage's derived weak elements / ailments and
// mode buffs. `selection` is what battle/EngineTeamScore needs.
import { computed, reactive } from 'vue'
import StagePicker from './StagePicker.vue'
import StageWaveRows from './StageWaveRows.vue'
import EnemyCards from './EnemyCards.vue'
import { soloRaidInfo, multiRaidInfo, questCampaign, SOLO_RAID_COMMON_CHARGE_PASSIVE, type QuestEnemyAppearance } from '../models/PvE'
import passiveMstJson from '../assets/base_data/getPassiveSkillMstList.json'
import characterMstJson from '../assets/base_data/getCharacterMstList.json'
import { Ailment } from '../types/enums'
import { useSetting } from '../store/settingsStore'
import { wikiBattleUrl } from '../utils/wikiBattlePage'
import { useStageEnemies } from '../composables/useStageEnemies'

const props = withDefaults(defineProps<{ settingPrefix?: string }>(), { settingPrefix: 'saStage' })

const stageId = useSetting<number>(`${props.settingPrefix}Id`, 982250)
const waveIdx = useSetting<number>(`${props.settingPrefix}Wave`, 0)
const phase = useSetting<number>(`${props.settingPrefix}Phase`, 1)
const se = useStageEnemies(stageId, waveIdx, phase)
const view = reactive(se)
const wikiUrl = computed(() => stageId.value ? wikiBattleUrl(stageId.value) : undefined)

// Buffs the stage's mode gives the player's units (battle/EngineBattle.stagePassives, models/PvE.questCampaign): shown
// here, counted by the engine in every score. Solo Raid: the party buff is a choice (default the raid's first).
const raid = computed(() => stageId.value ? soloRaidInfo(stageId.value) : undefined)
const partyBuffId = useSetting<number>(`${props.settingPrefix}PartyBuff`, 0)
const partyBuffChoice = computed(() => raid.value?.partyBuffs.find(p => p.soloRaidPartyBuffMstId === partyBuffId.value)?.soloRaidPartyBuffMstId
    ?? raid.value?.partyBuffs[0]?.soloRaidPartyBuffMstId)
const passiveMst = new Map<number, any>((passiveMstJson as any[]).map(p => [p.passiveSkillMstId, p]))
const passiveName = (id: number) => passiveMst.get(id)?.name ?? `#${id}`
const passiveText = (id: number) => String(passiveMst.get(id)?.description ?? '').replace(/<br>/g, ' ')
const characterName = (id: number) => (characterMstJson as any[]).find(c => c.characterMstId === id)?.name ?? `#${id}`
const stageBuffs = computed<string[]>(() => {
    const id = stageId.value
    if (!id) return []
    const out = questCampaign(id).descriptions.map(d => `Quest buff: ${d}`)
    const lr = multiRaidInfo(id)
    if (lr) {
        out.push(...lr.bonusPassiveIds.map(passiveText).filter(Boolean))
        if (lr.exBonusPassiveId > 0) out.push(`EX bonus (${lr.exBonusCharacterIds.map(characterName).join(', ')}): ${passiveText(lr.exBonusPassiveId)}`)
    }
    const r = raid.value
    if (r) {
        const party = r.partyBuffs.find(p => p.soloRaidPartyBuffMstId === partyBuffChoice.value)
        for (const pid of [SOLO_RAID_COMMON_CHARGE_PASSIVE, r.season?.passiveSkillMstId, r.season?.enhancedPassiveSkillMstId, party?.passiveSkillMstId]) {
            if (pid && pid > 0 && passiveText(pid)) out.push(`${passiveName(pid)}: ${passiveText(pid)}`)
        }
    }
    return out
})

const ailmentLabel = (a: Ailment) => a === Ailment.WOUND ? 'Bleed' : a.charAt(0) + a.slice(1).toLowerCase()

/** The stage, wave and per-enemy settings to score against (plain data: it goes to the workers): the enemies alive in
 *  `wave` and the per-enemy lists, the dead ones' appearance ids in `removed` (taken off the engine's field). */
const selection = computed(() => {
    if (!stageId.value || !se.aliveWave.value.length) return undefined
    const o = se.maxDmgEnemyOpts()
    return {
        stageId: stageId.value,
        waveIdx: se.wavePos.value,
        phase: se.phasePos.value,
        wave: JSON.parse(JSON.stringify(se.aliveWave.value)) as QuestEnemyAppearance[],
        removed: o.removedEnemies!,
        mainTargetIdx: o.mainTargetIdx!,
        broken: o.broken!,
        breakRate: o.breakRate!,
        weakElements: [...se.weakElements.value],
        ailments: [...se.ailments.value],
        partyBuffId: raid.value ? partyBuffChoice.value : undefined,
    }
})

defineExpose({ selection })
</script>

<style scoped>
.card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 0.6rem;
}

.section-title {
    font-size: 1.2rem;
    color: var(--accent-soft);
    margin: 0 0 0.75rem;
    text-align: center;
}

.filters-heading {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    flex-shrink: 0;
    opacity: 0.8;
}

.row-hint {
    font-size: 0.78rem;
    color: var(--muted);
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.8rem;
    font-family: inherit;
    cursor: pointer;
    color: var(--muted);
    background: transparent;
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

.derived-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin: 0.6rem 0 0;
}

.stage-buffs {
    align-items: flex-start;
}

.stage-buff {
    font-size: 0.76rem;
    color: var(--text);
    padding: 0.15rem 0.55rem;
    border: 1px solid var(--border);
    border-radius: 8px;
}

.derived-gap {
    margin-left: 1rem;
}

.elem-icon {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
}
</style>
