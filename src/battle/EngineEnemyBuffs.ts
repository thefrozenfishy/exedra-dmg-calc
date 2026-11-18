// App side (not game code): the enemies' own buffs (states an enemy gives itself, range -1, from its passive or from any
// skill it can use) and the pages' per-enemy settings for them (PvE Simulator + Highest Dmg Calc, components/EnemyBuffs):
// turn one off (the enemy never gains it) or start the fight with N stacks of it (e.g. the Lunar Excavator Witch's
// "DEF up each time attacked", which Max Damage otherwise counts at 0 stacks).
//
// Defaults (`on`, 0 extra stacks) leave everything as the game does it: the battle-start ones are there, the rest come
// when the game triggers them (battles) or never (Max Damage, which has no enemy turns and no hits before the skill).
//
// Removable: [CONFIRMED 3.24] RemoveAllBuffAbilityEffect.IsRemovable (0x1949EF0): only a state with EffectOrigin
// ActiveSkill (1) that implements IBuff. A state from a passive (origin 2) can't be removed by buff removal.
import { E } from "./engineBundle"
import { UNIT_STATE_TYPES } from "../models/StateAddFilter"
import { appearanceById, enemyPassiveDetailRows, enemyReachableSkillIds, enemySkillDetailRows, skillName, type QuestEnemyAppearance } from "../models/PvE"
import { passiveBase } from "../utils/helpers"

// Not listed (user's call): states players don't think of as buffs. COMBO = the enemy's extra actions per turn.
const HIDDEN = new Set(["COMBO"])
const ORIGIN_ACTIVE = 1, ORIGIN_PASSIVE = 2
const TIMING: Record<string, string> = { "1": "battle start", "2": "wave start", "3": "the start of a turn", "4": "the start of an attack", "5": "the end of an attack", "6": "the end of a turn", "7": "the end of a wave" }

export interface EnemySelfBuff {
    key: string               // "p<detailId>" / "s<detailId>"
    detailId: number          // exact detail id (= the state's MstId)
    passive: boolean
    type: string
    value1: number
    accum: boolean            // *_ACCUM_* : stacks up to maxStacks
    maxStacks: number
    turn: number              // 0 = for the whole fight
    /** Given when the enemy enters (passive, battle / wave start timing, no start condition): on / off only. */
    atEntry: boolean
    conditional: boolean      // has an active condition (the game checks it, also in Max Damage)
    removable: boolean        // buff removal can take it off (skill-given IBuff)
    source: string            // passive / skill name
    sourceDesc: string
    trigger: string           // passives: when it is given ("the end of an attack"); skills: ""
    triggerConditional: boolean // passives: given only when its start conditions hold
    detail: any               // the raw detail row
}
export interface EnemyBuffSetting { on: boolean, stacks: number }
/** Per appearance id, per EnemySelfBuff.key. Missing = default. */
export type EnemyBuffSettings = Record<number, Record<string, EnemyBuffSetting>>

export const isDefaultSetting = (s: EnemyBuffSetting | undefined) => !s || (s.on && !(s.stacks > 0))

const removableCache = new Map<string, boolean>()
function isBuffState(row: any, passive: boolean): boolean {
    const key = `${passive ? "p" : "s"}${passive ? row.passiveSkillDetailMstId : row.skillDetailMstId}`
    const hit = removableCache.get(key)
    if (hit !== undefined) return hit
    let r = false
    try {
        E.bindMasterData()
        const info = infoOfRow(row, passive, 1)
        const effect = info ? E.AbilityEffectFactory.Create(info, false) : null
        r = !!effect?._GiveUnitState && E.isImpl(effect._GiveUnitState, "IBuff")
    } catch { r = false }
    removableCache.set(key, r)
    return r
}

function infoOfRow(row: any, passive: boolean, source: number): any {
    if (passive) {
        const model = E.BattleMstReaderBase.get_Instance(E.PassiveSkillDetailMstModel).GetModelByKey(row.passiveSkillDetailMstId)
        return model ? E.AbilityEffectInfo.CreateFromMst$PassiveSkillDetailMstModel_AbilitySourceType_string(model, source, null) : null
    }
    const model = E.BattleMstReaderBase.get_Instance(E.SkillDetailMstModel).GetModelByKey(row.skillDetailMstId)
    return model ? E.AbilityEffectInfo.CreateFromMst$SkillDetailMstModel_int(model, 0) : null
}

const cache = new Map<number, EnemySelfBuff[]>()
/** The states `a` can give itself, passive first, then its skills in id order. */
export function enemySelfBuffs(a: QuestEnemyAppearance): EnemySelfBuff[] {
    const hit = cache.get(a.questEnemyAppearanceMstId)
    if (hit) return hit
    const out: EnemySelfBuff[] = []
    const add = (row: any, passive: boolean, source: string, sourceDesc: string) => {
        if (row.range !== -1 || !UNIT_STATE_TYPES.has(row.abilityEffectType) || HIDDEN.has(row.abilityEffectType)) return
        const detailId = passive ? row.passiveSkillDetailMstId : row.skillDetailMstId
        const accum = /_ACCUM_/.test(row.abilityEffectType) && row.value2 > 1
        const timings = String(row.startTimingIdCsv ?? "").split(",").filter(Boolean)
        const atEntry = passive && !row.startConditionSetIdCsv && timings.length > 0 && timings.every(t => t === "1" || t === "2")
        const conditional = !!row.activeConditionSetIdCsv
        const trigger = passive ? timings.map(t => TIMING[t] ?? `timing ${t}`).join(" / ") : ""
        out.push({
            key: `${passive ? "p" : "s"}${detailId}`, detailId, passive, type: row.abilityEffectType, value1: row.value1,
            accum, maxStacks: accum ? row.value2 : 1, turn: row.turn ?? 0, atEntry, conditional,
            removable: !passive && isBuffState(row, false), source, sourceDesc, trigger,
            triggerConditional: passive && !!row.startConditionSetIdCsv, detail: row,
        })
    }
    if (a.passiveSkillMstId > 0) {
        const p: any = (passiveBase as any)[a.passiveSkillMstId]
        for (const row of enemyPassiveDetailRows(a.passiveSkillMstId)) add(row, true, p?.name || `Passive ${a.passiveSkillMstId}`, p?.description ?? "")
    }
    for (const id of enemyReachableSkillIds(a).sort((x, y) => x - y)) {
        for (const row of enemySkillDetailRows(id)) add(row, false, skillName(id) || `Skill ${id}`, "")
    }
    cache.set(a.questEnemyAppearanceMstId, out)
    return out
}

/** The engine unit's own effect object for detail `detailId` (its passives, then every skill it holds), if it has one. */
function ownEffect(unit: any, b: EnemySelfBuff): any {
    const lists: any[][] = []
    if (b.passive) for (const ps of unit._PassiveSkills ?? []) lists.push(ps.launcher?._AbilityEffectList ?? [])
    else {
        const set = unit._SkillSet
        for (const s of [set?._SpecialAttack, set?._NormalAttack, ...(set?._ActiveSkills ?? []), ...(set?._SwitchableSkills ?? []), ...(set?._AdditionalSkills ?? [])]) {
            if (s?.launcher) lists.push(s.launcher._AbilityEffectList ?? [])
        }
    }
    for (const l of lists) for (const eff of l) if (eff?._DetailMstId === b.detailId && eff._GiveUnitState) return eff
    return undefined
}

/** `n` stacks of `b` on `unit`, given by itself, as its own effect gives them in battle
 *  ([CONFIRMED 3.19] StateAbilityEffect.Triggering 0x194C8C0: clone of the effect's state, SetTriggeringInfo(origin, user,
 *  isOwnSkill, IsConditionActivation), UnitCondition.AddUnitState: an accum state blends into the one already held).
 *  [APPROXIMATION] the start conditions are not checked, the probability is ignored and the buff strength of the
 *  enemy (ChangeGiveUnitState) is not applied. */
function giveStacks(d: any, unit: any, b: EnemySelfBuff, n: number): void {
    let effect = ownEffect(unit, b)
    if (!effect) {
        const info = infoOfRow(b.detail, b.passive, 1)
        effect = info ? E.AbilityEffectFactory.Create(info, false) : null
    }
    const proto = effect?._GiveUnitState
    if (!proto) return
    const origin = b.passive ? ORIGIN_PASSIVE : ORIGIN_ACTIVE
    const cond = !!effect.get_IsConditionActivation?.()
    for (let i = 0; i < n; i++) {
        const st = proto.Clone()
        st.SetTriggeringInfo(origin, unit, false, cond, d.get_BattleType())
        unit._Condition.AddUnitState(st, unit, d.turnActSystem.turnReferee.get_NextTurnOrderPriority(), unit, true)
    }
}

/** Blocks the states turned off on `unit` from now on (UnitCondition.AddUnitState, this unit only: a state it gives
 *  itself with that detail id is refused, as if it failed to land) and takes off the ones it already holds. */
function blockOff(unit: any, off: Set<number>): void {
    if (!off.size) return
    const cond = unit._Condition
    const add = cond.AddUnitState
    cond.AddUnitState = function (this: any, state: any, target: any, ...rest: any[]) {
        if (target === unit && state?._UserUnitId === unit._Id && off.has(state._MstId)) return false
        return add.call(this, state, target, ...rest)
    }
    cond._StateList = cond._StateList.filter((s: any) => !(s._UserUnitId === unit._Id && off.has(s._MstId)))
}

/** Battles (EngineBattle): every enemy unit that joins the field (start, waves, summons, form changes) gets its
 *  appearance's settings. The turned-off states are blocked before its battle-start passives run; the stacks are given
 *  once the unit has its director (BattleUnit.SetActiveConditionCheckDataBundle, called by every path that adds an
 *  enemy right before its battle-start passives). Installed on the director's BattleUnitBundle before SetupBattleStage. */
export function hookEnemyBuffs(d: any, settings: EnemyBuffSettings): void {
    if (!settings || !Object.keys(settings).length) return
    const bundle = d.battleUnitBundle
    const addUnit = bundle.AddUnit
    bundle.AddUnit = function (this: any, unit: any, ...rest: any[]) {
        const r = addUnit.call(this, unit, ...rest)
        const appId = unit?._BattleParameter?._QuestEnemyAppearanceMstId
        const own = appId ? settings[appId] : undefined
        const app = own && !unit.isCharacter ? appearanceById(appId) : undefined
        if (own && app) {
            const buffs = enemySelfBuffs(app)
            const off = new Set(buffs.filter(b => own[b.key] && !own[b.key].on).map(b => b.detailId))
            blockOff(unit, off)
            const set = unit.SetActiveConditionCheckDataBundle
            unit.SetActiveConditionCheckDataBundle = function (this: any, director: any) {
                const out = set.call(this, director)
                delete unit.SetActiveConditionCheckDataBundle
                for (const b of buffs) {
                    const s = own[b.key]
                    if (!s?.on || b.atEntry || !(s.stacks > 0)) continue
                    giveStacks(director, unit, b, Math.min(b.maxStacks, Math.trunc(s.stacks)))
                }
                return out
            }
        }
        return r
    }
}
