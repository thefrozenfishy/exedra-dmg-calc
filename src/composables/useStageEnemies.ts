// App side: the stage's enemy setup shared by the PvE Simulator and the Highest Dmg Calc (components/StageEnemySelector):
// wave, boss phase, adds summoned mid-fight, and per enemy alive / target / broken / broken rate. Both pages score Max
// Damage against `aliveWave` with `maxDmgEnemyOpts()` (battle/EngineMaxDamage).
import { computed, ref, watch, type Ref } from 'vue'
import { useSetting } from '../store/settingsStore'
import { stageWaveMeta, wavePositionIds, enemyName, summonCandidates, breakMstOf, ELEMENT_KEYS, type QuestEnemyAppearance, type ModeChangeInfo } from '../models/PvE'
import { wavePhases, waveStartUnits } from '../models/PvEBattle'
import { phaseWave } from '../battle/EngineMaxDamage'
import { enemySelfBuffs, isDefaultSetting, type EnemyBuffSetting, type EnemyBuffSettings } from '../battle/EngineEnemyBuffs'
import { Ailment, elementMap, type KiokuElement } from '../types/enums'
import type { MaxDmgOptions } from '../models/MaxDamage'

const fmt = (n: number) => Math.round(n).toLocaleString()

/** One enemy card's data (also the pages' extra rows: backups, other forms, summons). */
export function enemyView(a: QuestEnemyAppearance, tag = '') {
    const b = breakMstOf(a)
    return {
        tag,
        id: a.questEnemyAppearanceMstId, enemyMstId: a.enemyMstId, name: enemyName(a),
        hp: a.hp, atk: a.atk, def: a.def, spd: a.speed,
        gauges: a.startHpGaugeCount > 0 ? a.startHpGaugeCount : a.hpGaugeCount,
        weak: [1, 2, 3, 4, 5, 6].map(i => (a as any)[`weakElement${i}`]).filter((x: number) => x >= 1 && x <= 6).map((x: number) => elementMap[x]) as KiokuElement[],
        resists: ELEMENT_KEYS.map((k, el) => ({ el: elementMap[el], pct: k ? ((a as any)[`${k}ResistRate`] ?? 0) / 10 : 0 })).filter(r => r.pct > 0),
        breakPoint: b?.breakPoint ?? 0,
        initRate: Math.trunc((b?.initialBreakedDamageReceiveRate ?? 1000) / 10),
        maxRate: Math.trunc((b?.maxBreakedDamageReceiveRate ?? 1000) / 10),
    }
}
export type EnemyView = ReturnType<typeof enemyView> & { position?: number }

// The appearance row's parry field of each ailment (1000 = immune).
const PARRY_FIELD: Record<Ailment, string> = {
    [Ailment.BURN]: 'burnParryRate', [Ailment.CURSE]: 'curseParryRate', [Ailment.POISON]: 'poisonParryRate',
    [Ailment.WOUND]: 'bleedParryRate', [Ailment.STUN]: 'stunParryRate', [Ailment.VORTEX]: 'vortexParryRate',
    [Ailment.WEAKNESS]: 'weaknessParryRate',
}

export function useStageEnemies(stageId: Ref<number>, waveIdx: Ref<number>, phase: Ref<number>) {
    const waveMetas = computed(() => stageId.value ? stageWaveMeta(stageId.value) : [])
    const waves = computed(() => waveMetas.value.map(m => m.appearances))
    const wavePos = computed(() => Math.max(0, Math.min(waveIdx.value, waveMetas.value.length - 1)))
    const waveMeta = computed(() => waveMetas.value[wavePos.value])
    // A wave whose boss changes form at HP thresholds has phases (Crisis "phase 1/2/3"): scored against one form.
    const phases = computed(() => wavePhases(waveMeta.value))
    const phasePos = computed(() => phases.value.some(f => f.step === phase.value) ? phase.value : 1)
    const phaseTitle = (f: ModeChangeInfo) => `${enemyName(f.appearance)}: HP ${fmt(f.appearance.hp)} · ATK ${fmt(f.appearance.atk)} · DEF ${fmt(f.appearance.def)} · SPD ${f.appearance.speed}`
    const baseWave = computed(() => waveMeta.value ? phaseWave(stageId.value, wavePos.value, phasePos.value, waveStartUnits(waveMeta.value)) : [])
    // Adds: the summons the field's units can bring in during the fight (models/PvE.summonCandidates), always on the
    // field (a full enemy team, the highest damage; untick Alive to leave one out), put there by the game's summon
    // (battle/EngineMaxDamage.phaseWave -> GetSummonedUnitList) where it lands them, as long as there is room.
    const summons = computed(() => stageId.value && baseWave.value.length ? summonCandidates(stageId.value, baseWave.value) : [])
    /** Every enemy on the field when the wave (phase) starts, adds included, alive or not (the cards). */
    const wave = computed(() => {
        if (!waveMeta.value) return []
        return summons.value.length ? phaseWave(stageId.value, wavePos.value, phasePos.value, baseWave.value, summons.value) : baseWave.value
    })
    const waveAddCounts = computed(() => waveMetas.value.map(m => stageId.value ? summonCandidates(stageId.value, waveStartUnits(m)).length : 0))

    const mainTargetIdx = ref(0)
    const broken = ref<boolean[]>([])
    const breakRate = ref<(number | undefined)[]>([])
    // An enemy not alive is taken off the field for every score (battle/EngineMaxDamage removeEnemies): not hit, not
    // targeted, not counted by "number of enemies" effects (e.g. Oracle Ray), and its passives' states on others go.
    const alive = ref<boolean[]>([])
    const aliveCount = computed(() => alive.value.filter(Boolean).length)

    watch(stageId, (id, old) => { if (old !== undefined && id !== old) waveIdx.value = 0 })
    watch([stageId, waveIdx], ([id, w], [oldId, oldW]) => { if (oldId !== undefined && (id !== oldId || w !== oldW)) phase.value = 1 })
    // the wave's main target if it is alive, else the first one alive
    const firstAlive = () => {
        const main = wave.value.findIndex((a, i) => a.isMainTargetEnemy && alive.value[i])
        return main >= 0 ? main : Math.max(0, alive.value.indexOf(true))
    }
    // A new field resets the per-enemy settings; the same units keep theirs (by appearance id).
    watch(wave, (w, old) => {
        const keep = !!old && w.some(a => old.some(o => o.questEnemyAppearanceMstId === a.questEnemyAppearanceMstId))
        const prev = new Map((old ?? []).map((a, i) => [a.questEnemyAppearanceMstId, { broken: broken.value[i], rate: breakRate.value[i], alive: alive.value[i] }]))
        const mainId = keep ? old![mainTargetIdx.value]?.questEnemyAppearanceMstId : undefined
        const main = mainId !== undefined && w.some(a => a.questEnemyAppearanceMstId === mainId)
            ? w.findIndex(a => a.questEnemyAppearanceMstId === mainId) : w.findIndex(a => a.isMainTargetEnemy)
        mainTargetIdx.value = main >= 0 ? main : 0
        broken.value = w.map(a => keep && prev.has(a.questEnemyAppearanceMstId) ? !!prev.get(a.questEnemyAppearanceMstId)!.broken : (breakMstOf(a)?.breakPoint ?? 0) > 0)
        breakRate.value = w.map(a => keep ? prev.get(a.questEnemyAppearanceMstId)?.rate : undefined)
        alive.value = w.map(a => !keep || prev.get(a.questEnemyAppearanceMstId)?.alive !== false)
        if (!alive.value.some(Boolean)) alive.value = w.map(() => true)
        if (!alive.value[mainTargetIdx.value]) mainTargetIdx.value = firstAlive()
    }, { immediate: true })

    const setAlive = (i: number, v: boolean) => {
        if (!v && aliveCount.value <= 1) return
        const a = [...alive.value]; a[i] = v; alive.value = a
        if (!v && mainTargetIdx.value === i) mainTargetIdx.value = firstAlive()
    }
    const setBroken = (i: number, v: boolean) => { const b = [...broken.value]; b[i] = v; broken.value = b }
    const setBreakRate = (i: number, v: number, max: number) => {
        const r = [...breakRate.value]; r[i] = Number.isFinite(v) ? Math.max(100, Math.min(max, v)) : undefined; breakRate.value = r
    }

    const formLabel = (m: ModeChangeInfo) => `Form ${m.step} · ${m.step === 1 ? 'from the start' : `from ${m.threshold / 10}% HP`}`
    function formTag(a: QuestEnemyAppearance): string {
        if (a.conditionType === 3) return 'Summoned'
        const own = (waveMeta.value?.modeChanges ?? []).find(m => m.appearance.questEnemyAppearanceMstId === a.questEnemyAppearanceMstId)
        return own ? formLabel(own) : ''
    }
    // Each unit with its position (1-5, left to right), which is also its column on the pages.
    const enemyInfo = computed<EnemyView[]>(() => {
        const positions = wavePositionIds(wave.value.length)  // [APPROXIMATION] for a field with adds (layout only)
        return wave.value.map((a, i) => ({ ...enemyView(a, formTag(a)), position: positions[i] }))
    })

    // The enemies alive: what Max Damage is scored against (result index order).
    const aliveIdx = computed(() => wave.value.map((_, i) => i).filter(i => alive.value[i]))
    const aliveWave = computed(() => aliveIdx.value.map(i => wave.value[i]))
    const aliveInfo = computed(() => aliveIdx.value.map(i => enemyInfo.value[i]))
    const removed = computed(() => wave.value.filter((_, i) => !alive.value[i]).map(a => a.questEnemyAppearanceMstId))
    // Elements an enemy alive is weak to; ailments some enemy alive isn't fully immune to.
    const weakElements = computed<KiokuElement[]>(() => [...new Set(aliveInfo.value.flatMap(e => e.weak))])
    const ailments = computed<Ailment[]>(() => Object.values(Ailment).filter(a => aliveWave.value.some(e => ((e as any)[PARRY_FIELD[a]] ?? 0) < 1000)))

    // Enemy buffs (battle/EngineEnemyBuffs, components/EnemyBuffs): the states each enemy gives itself, turned off or
    // started with N stacks. Kept per appearance id; missing = the game's default. One setting shared by the PvE
    // Simulator and the Highest Dmg Calc (user's rule: set it once for the stage on either page, it holds on the other,
    // across reloads; another enemy has its own). A page can switch to its own copy (setBuffsLocal): the PvE Simulator
    // while a saved team is loaded uses that team's settings and leaves the shared ones alone.
    const sharedBuffs = useSetting<EnemyBuffSettings>('enemyBuffSettings', {})
    const localBuffs = ref<EnemyBuffSettings>({})
    const buffsLocal = ref(false)
    const enemyBuffs = computed<EnemyBuffSettings>({
        get: () => buffsLocal.value ? localBuffs.value : sharedBuffs.value,
        set: v => { if (buffsLocal.value) localBuffs.value = v; else sharedBuffs.value = v },
    })
    const setBuffsLocal = (local: boolean, init?: EnemyBuffSettings) => {
        if (local) localBuffs.value = JSON.parse(JSON.stringify(init ?? sharedBuffs.value))
        buffsLocal.value = local
    }
    const buffsOf = (i: number) => wave.value[i] ? enemySelfBuffs(wave.value[i]) : []
    const buffSetting = (appId: number, key: string): EnemyBuffSetting => enemyBuffs.value[appId]?.[key] ?? { on: true, stacks: 0 }
    const setBuff = (appId: number, key: string, patch: Partial<EnemyBuffSetting>) => {
        const next = { ...buffSetting(appId, key), ...patch }
        const own = { ...(enemyBuffs.value[appId] ?? {}) }
        if (isDefaultSetting(next)) delete own[key]
        else own[key] = next
        const all = { ...enemyBuffs.value }
        if (Object.keys(own).length) all[appId] = own
        else delete all[appId]
        enemyBuffs.value = all
    }
    const resetBuffs = () => {
        const ids = new Set(wave.value.map(a => a.questEnemyAppearanceMstId))
        enemyBuffs.value = Object.fromEntries(Object.entries(enemyBuffs.value).filter(([id]) => !ids.has(Number(id))))
    }
    /** The non-default settings of the field's enemies (plain data, for Max Damage and battles). */
    const enemyBuffOpts = (): EnemyBuffSettings | undefined => {
        const out: EnemyBuffSettings = {}
        for (const a of wave.value) {
            const own = enemyBuffs.value[a.questEnemyAppearanceMstId]
            if (own && Object.keys(own).length) out[a.questEnemyAppearanceMstId] = JSON.parse(JSON.stringify(own))
        }
        return Object.keys(out).length ? out : undefined
    }
    const changedBuffCount = computed(() => wave.value.reduce((n, a) => n + Object.keys(enemyBuffs.value[a.questEnemyAppearanceMstId] ?? {}).length, 0))

    /** The per-enemy Max Damage options for `aliveWave` (plain data). */
    const maxDmgEnemyOpts = (): Pick<MaxDmgOptions, 'broken' | 'breakRate' | 'mainTargetIdx' | 'removedEnemies' | 'enemyBuffs'> => ({
        broken: aliveIdx.value.map(i => !!broken.value[i]),
        breakRate: aliveIdx.value.map(i => breakRate.value[i]),
        mainTargetIdx: Math.max(0, aliveIdx.value.indexOf(mainTargetIdx.value)),
        removedEnemies: [...removed.value],
        enemyBuffs: enemyBuffOpts(),
    })

    const setWave = (i: number) => { waveIdx.value = i }
    const setPhase = (p: number) => { phase.value = p }
    const setTarget = (i: number) => { if (alive.value[i]) mainTargetIdx.value = i }

    return {
        stageId, waveIdx, phase, setWave, setPhase, setTarget,
        waveMetas, waves, wavePos, waveMeta, phases, phasePos, phaseTitle, summons,
        wave, waveAddCounts, mainTargetIdx, broken, breakRate, alive, aliveCount, setAlive, setBroken,
        setBreakRate, formLabel, formTag, enemyInfo, aliveIdx, aliveWave, aliveInfo, removed, weakElements, ailments,
        maxDmgEnemyOpts, enemyBuffs, setBuffsLocal, buffsOf, buffSetting, setBuff, resetBuffs, enemyBuffOpts, changedBuffCount,
    }
}
export type StageEnemies = ReturnType<typeof useStageEnemies>
