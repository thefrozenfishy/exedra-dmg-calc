<template>
    <section class="card section-card stage-enemy-selector">
        <h2 class="section-title">Stage</h2>
        <StagePicker v-model="stageId" />

        <div v-if="waves.length" class="wave-row">
            <span class="filters-heading">Wave</span>
            <button v-for="(w, i) in waves" :key="i" type="button" class="chip" :class="{ active: waveIdx === i }"
                @click="waveIdx = i">{{ i + 1 }} <span class="chip-count">{{ Math.min(w.length, 5) }} enem{{
                    Math.min(w.length, 5) === 1 ? 'y' : 'ies' }}<template v-if="w.length > 5"> + {{ w.length - 5 }}
                        backup{{ w.length - 5 === 1 ? '' : 's' }}</template></span></button>
            <span class="row-hint">Teams are scored against the enemies on the field when the selected wave
                starts.</span>
            <a v-if="wikiUrl" class="wiki-link" :href="wikiUrl" target="_blank" rel="noopener"
                title="This stage's battle page on exedra.wiki">details →</a>
        </div>

        <div v-if="enemyInfo.length" class="derived-row">
            <span class="filters-heading">Weak elements</span>
            <span v-if="!weakElements.length" class="row-hint">none</span>
            <img v-for="w in weakElements" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w" :title="w"
                class="elem-icon" />
            <span class="filters-heading derived-gap">Ailments that can land</span>
            <span v-if="!ailments.length" class="row-hint">none</span>
            <img v-for="a in ailments.map(ailmentLabel)" :key="a" :src="`/exedra-dmg-calc/aliments/${a}.png`" :alt="a" :title="a"
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

        <div v-if="enemyInfo.length" class="enemies-block">
            <div class="team-grid enemy-grid">
                <div v-for="(e, i) in enemyInfo" :key="e.id" class="enemy-card"
                    :class="[`pos-${e.position}`, { main: mainTargetIdx === i }]">
                    <div class="enemy-top">
                        <img class="enemy-img" :src="enemyImage(e.enemyMstId)" :alt="e.name" @error="hideImg" />
                        <div class="enemy-title">
                            <div class="enemy-name" :title="e.name">{{ e.name }}</div>
                            <div class="enemy-break">
                                <template v-if="e.breakPoint > 0">Break {{ e.breakPoint }} · broken {{ e.initRate }}–{{
                                    e.maxRate }}%</template>
                                <template v-else>Can't be broken</template>
                            </div>
                        </div>
                    </div>
                    <div v-if="e.tag" class="enemy-tag">{{ e.tag }}</div>
                    <div class="enemy-stat-grid">
                        <div class="enemy-stat"><span class="enemy-stat-label">HP</span>
                            <span class="enemy-stat-value">{{ fmt(e.hp) }}<span v-if="e.gauges > 1" class="muted"> ×{{
                                e.gauges }}</span></span>
                        </div>
                        <div class="enemy-stat"><span class="enemy-stat-label">ATK</span><span
                                class="enemy-stat-value">{{ fmt(e.atk) }}</span></div>
                        <div class="enemy-stat"><span class="enemy-stat-label">DEF</span><span
                                class="enemy-stat-value">{{ fmt(e.def) }}</span></div>
                        <div class="enemy-stat"><span class="enemy-stat-label">SPD</span><span
                                class="enemy-stat-value">{{ e.spd }}</span></div>
                    </div>
                    <div v-if="e.weak.length" class="enemy-elements weak" title="Weak to">Weak
                        <img v-for="w in e.weak" :key="w" :src="`/exedra-dmg-calc/elements/${w}.png`" :alt="w"
                            :title="w" class="elem-icon" />
                    </div>
                    <div v-if="e.resists.length" class="enemy-elements resist" title="Resists">Resist
                        <img v-for="r in e.resists" :key="r.el" :src="`/exedra-dmg-calc/elements/${r.el}.png`"
                            :alt="r.el" :title="r.el" class="elem-icon" />
                        −{{ e.resists[0].pct }}%
                    </div>
                    <div class="enemy-controls">
                        <label class="chip" :class="{ active: mainTargetIdx === i }"
                            title="Single-target skills hit this enemy">
                            <input type="radio" :checked="mainTargetIdx === i" @change="mainTargetIdx = i" /> Target
                        </label>
                        <label v-if="e.breakPoint > 0" class="chip" :class="{ active: !!broken[i] }"
                            title="Score teams against this enemy while it's broken">
                            <input type="checkbox" :checked="!!broken[i]"
                                @change="setBroken(i, ($event.target as HTMLInputElement).checked)" /> Broken
                        </label>
                        <label v-if="e.breakPoint > 0 && broken[i]" class="rate-field" title="Broken DMG rate (%)">
                            <input class="num" type="number" min="100" :max="e.maxRate"
                                :value="breakRate[i] ?? e.maxRate"
                                @change="setBreakRate(i, Number(($event.target as HTMLInputElement).value), e.maxRate)" />%
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// The PvE Simulator's stage and enemy picker (stage tree, wave, target / broken / broken rate per enemy) for pages
// that score teams against a real stage (the Best SA Team calculator). `selection` is what battle/EngineTeamScore needs.
import { computed, ref, watch } from 'vue'
import StagePicker from './StagePicker.vue'
import { stageWaveMeta, wavePositionIds, enemyName, breakMstOf, ELEMENT_KEYS, soloRaidInfo, multiRaidInfo, questCampaign, SOLO_RAID_COMMON_CHARGE_PASSIVE, type QuestEnemyAppearance, type ModeChangeInfo } from '../models/PvE'
import passiveMstJson from '../assets/base_data/getPassiveSkillMstList.json'
import characterMstJson from '../assets/base_data/getCharacterMstList.json'
import { waveStartUnits } from '../models/PvEBattle'
import { Ailment, elementMap, type KiokuElement } from '../types/enums'
import { useSetting } from '../store/settingsStore'
import { wikiBattleUrl } from '../utils/wikiBattlePage'

const props = withDefaults(defineProps<{ settingPrefix?: string }>(), { settingPrefix: 'saStage' })

const stageId = useSetting<number>(`${props.settingPrefix}Id`, 982250)
const waveIdx = useSetting<number>(`${props.settingPrefix}Wave`, 0)
const fmt = (n: number) => Math.round(n).toLocaleString()
const hideImg = (ev: Event) => { (ev.target as HTMLImageElement).style.visibility = 'hidden' }
const enemyImage = (enemyMstId: number) => `/exedra-dmg-calc/enemy/${enemyMstId}_thumbnail.png`

const wikiUrl = computed(() => stageId.value ? wikiBattleUrl(stageId.value) : undefined)
const waveMetas = computed(() => stageId.value ? stageWaveMeta(stageId.value) : [])
const waves = computed(() => waveMetas.value.map(m => m.appearances))
const wavePos = computed(() => Math.max(0, Math.min(waveIdx.value, waveMetas.value.length - 1)))
const waveMeta = computed(() => waveMetas.value[wavePos.value])
const wave = computed(() => waveMeta.value ? waveStartUnits(waveMeta.value) : [])
const mainTargetIdx = ref(0)
const broken = ref<boolean[]>([])
const breakRate = ref<(number | undefined)[]>([])

watch(stageId, (id, old) => { if (old !== undefined && id !== old) waveIdx.value = 0 })
watch(wave, w => {
    const main = w.findIndex(a => a.isMainTargetEnemy)
    mainTargetIdx.value = main >= 0 ? main : 0
    broken.value = w.map(a => (breakMstOf(a)?.breakPoint ?? 0) > 0)
    breakRate.value = w.map(() => undefined)
}, { immediate: true })

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

const setBroken = (i: number, v: boolean) => { const b = [...broken.value]; b[i] = v; broken.value = b }
const setBreakRate = (i: number, v: number, max: number) => {
    const r = [...breakRate.value]; r[i] = Number.isFinite(v) ? Math.max(100, Math.min(max, v)) : undefined; breakRate.value = r
}

const formLabel = (m: ModeChangeInfo) => `Form ${m.step} · ${m.step === 1 ? 'from the start' : `from ${m.threshold / 10}% HP`}`
function formTag(a: QuestEnemyAppearance): string {
    const own = (waveMeta.value?.modeChanges ?? []).find(m => m.appearance.questEnemyAppearanceMstId === a.questEnemyAppearanceMstId)
    return own ? formLabel(own) : ''
}
const enemyInfo = computed(() => {
    const positions = wavePositionIds(wave.value.length)
    return wave.value.map((a, i) => {
        const b = breakMstOf(a)
        return {
            tag: formTag(a), position: positions[i],
            id: a.questEnemyAppearanceMstId, enemyMstId: a.enemyMstId, name: enemyName(a),
            hp: a.hp, atk: a.atk, def: a.def, spd: a.speed,
            gauges: a.startHpGaugeCount > 0 ? a.startHpGaugeCount : a.hpGaugeCount,
            weak: [1, 2, 3, 4, 5, 6].map(i => (a as any)[`weakElement${i}`]).filter((x: number) => x >= 1 && x <= 6).map((x: number) => elementMap[x]),
            resists: ELEMENT_KEYS.map((k, el) => ({ el: elementMap[el], pct: k ? ((a as any)[`${k}ResistRate`] ?? 0) / 10 : 0 })).filter(r => r.pct > 0),
            breakPoint: b?.breakPoint ?? 0,
            initRate: Math.trunc((b?.initialBreakedDamageReceiveRate ?? 1000) / 10),
            maxRate: Math.trunc((b?.maxBreakedDamageReceiveRate ?? 1000) / 10),
        }
    })
})

// The appearance row's parry field of each ailment (1000 = immune).
const PARRY_FIELD: Record<Ailment, string> = {
    [Ailment.BURN]: 'burnParryRate', [Ailment.CURSE]: 'curseParryRate', [Ailment.POISON]: 'poisonParryRate',
    [Ailment.WOUND]: 'bleedParryRate', [Ailment.STUN]: 'stunParryRate', [Ailment.VORTEX]: 'vortexParryRate',
    [Ailment.WEAKNESS]: 'weaknessParryRate',
}
// Elements any enemy on the field is weak to; ailments some enemy on the field isn't fully immune to.
const weakElements = computed<KiokuElement[]>(() => [...new Set(enemyInfo.value.flatMap(e => e.weak))] as KiokuElement[])
const ailments = computed<Ailment[]>(() => Object.values(Ailment).filter(a => wave.value.some(e => ((e as any)[PARRY_FIELD[a]] ?? 0) < 1000)))
const ailmentLabel = (a: Ailment) => a === Ailment.WOUND ? 'Bleed' : a.charAt(0) + a.slice(1).toLowerCase()

/** The stage, wave and per-enemy settings to score against (plain data: it goes to the workers). */
const selection = computed(() => stageId.value && wave.value.length ? {
    stageId: stageId.value,
    waveIdx: wavePos.value,
    wave: JSON.parse(JSON.stringify(wave.value)) as QuestEnemyAppearance[],
    mainTargetIdx: mainTargetIdx.value,
    broken: [...broken.value],
    breakRate: [...breakRate.value],
    weakElements: [...weakElements.value],
    ailments: [...ailments.value],
    partyBuffId: raid.value ? partyBuffChoice.value : undefined,
} : undefined)

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

.muted {
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

.chip-count {
    opacity: 0.7;
    font-size: 0.72rem;
}

.num {
    width: 4.5em;
    padding: 0.15rem 0.3rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font: inherit;
    font-size: 0.78rem;
}

.wave-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin: 0.9rem 0 0;
}

.wave-row .row-hint {
    margin-left: 0.4rem;
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

.wiki-link {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    white-space: nowrap;
}

.wiki-link:hover {
    text-decoration: underline;
}

.enemies-block {
    container-type: inline-size;
    /* size containment in a flex column (the page's .section-card) otherwise sizes the block from a guess, not its grid */
    width: 100%;
}

.team-grid {
    display: grid;
    gap: 2rem;
}

.team-grid.enemy-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    margin-top: 0.75rem;
}

@container (min-width: 1128px) {
    .enemy-card.pos-1 { grid-column: 1; }
    .enemy-card.pos-2 { grid-column: 2; }
    .enemy-card.pos-3 { grid-column: 3; }
    .enemy-card.pos-4 { grid-column: 4; }
    .enemy-card.pos-5 { grid-column: 5; }
}

.enemy-tag {
    align-self: flex-start;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    padding: 0 0.5rem;
}

.enemy-card {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    min-width: 0;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.02);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.enemy-card.main {
    border-color: rgba(255, 209, 110, 0.6);
    box-shadow: 0 0 0 1px rgba(255, 209, 110, 0.2);
}

.enemy-top {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    min-width: 0;
}

.enemy-img {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.25);
}

.enemy-title {
    min-width: 0;
}

.enemy-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.enemy-break {
    font-size: 0.75rem;
    color: var(--muted);
}

.enemy-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem 0.5rem;
}

.enemy-stat {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.enemy-stat-label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
}

.enemy-stat-value {
    font-size: 0.82rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.enemy-elements {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
}

.elem-icon {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
}

.weak {
    color: var(--success);
}

.resist {
    color: var(--muted);
}

.enemy-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
}

.rate-field {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: var(--muted);
}
</style>
