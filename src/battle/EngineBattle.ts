// App side (not game code): runs a battle on the 1:1 engine (src/engine, through the bundle) and reports it the way
// the pages show battles: BattleSnapshot entries (types/KiokuTypes.ts), one per executed skill, with the roll log.
//
// The engine is driven like the game client drives it (ClientDriver.runBattleLikeClient): TimeForward requests, and
// TimeForward / EndWave / BeginWave between waves. Every engine call runs with this battle's EngineRandom installed.
import { TargetType, type BattleEvent, type BattleSnapshot, type TeamSnapshot } from "../types/KiokuTypes"
import { BattleRng, type RngDecision, type RngMode } from "../models/BattleRng"
import { enemyName, soloRaidInfo, SOLO_RAID_COMMON_CHARGE_PASSIVE, type QuestEnemyAppearance } from "../models/PvE"
import type { RaidCarry } from "../models/PvPBattle"
import { passiveDetails, skillDetails } from "../utils/helpers"
import questEnemyAppearanceJson from "../assets/base_data/getQuestEnemyAppearanceMstList.json"
import { E } from "./engineBundle"
import { EngineRandom } from "./EngineRandom"

/** The parts of a PvPKioku the engine needs (src/engine/adapter/NetworkUnits.ts reads the rest). */
export interface EngineKioku {
    name: string
    data: any
}

export type EngineBattleSetup =
    | { kind: "pvp", allies: EngineKioku[], enemies: EngineKioku[] }
    | { kind: "quest", allies: EngineKioku[], stageId: number }
    | { kind: "soloRaid", allies: EngineKioku[], stageId: number, partyBuffId?: number, noRoundLimit?: boolean, carry?: RaidCarry }

export interface EngineBattleOptions {
    seed?: number
    rngMode?: RngMode
    decisions?: Map<number, RngDecision> | Record<number, RngDecision>
    relaxedPicks?: boolean
    rng?: BattleRng
}

/** Display info of one engine unit. */
interface UnitInfo { name: string, isTeam1: boolean, dataId: number, isEnemyUnit: boolean, appearance?: QuestEnemyAppearance }

const appearanceById = new Map<number, QuestEnemyAppearance>((questEnemyAppearanceJson as QuestEnemyAppearance[]).map(a => [a.questEnemyAppearanceMstId, a]))
const PHASE_START = 1, PHASE_FINISH = 2
const RESULT_WIN = 1, RESULT_LOSE = 2

/** Text of a state's master row ("applier - description"), like the old engine's buff lists. */
function detailDescription(mstId: number): string {
    const d: any = (skillDetails as any)[mstId] ?? (passiveDetails as any)[mstId]
    return d?.description || d?.abilityEffectType || String(mstId)
}

export class EngineBattle {
    readonly director: any
    readonly seed: number
    readonly rng: BattleRng
    readonly random: EngineRandom
    readonly kind: EngineBattleSetup["kind"]
    private readonly units = new Map<any, UnitInfo>()
    private readonly allyKiokus: EngineKioku[]
    private readonly enemyKiokus: EngineKioku[]
    private commands: any[] = []
    private events: BattleEvent[] = []
    private lastActor?: any
    private lastTargetType?: TargetType
    private lastBattleInfo?: any
    private requests = 0

    constructor(setup: EngineBattleSetup, opts: EngineBattleOptions = {}) {
        this.kind = setup.kind
        this.seed = opts.seed ?? opts.rng?.seed ?? Math.floor(Math.random() * 2 ** 32)
        this.rng = opts.rng ?? new BattleRng(opts.rngMode ?? "seed", this.seed, opts.decisions, opts.relaxedPicks)
        this.random = new EngineRandom(this.rng, o => this.nameOf(o))
        this.allyKiokus = setup.allies
        this.enemyKiokus = setup.kind === "pvp" ? setup.enemies : []
        E.bindMasterData()
        this.director = this.random.run(() => this.create(setup))
        this.director.commandSender.Subscribe({ IObserver$OnNext: (commands: any[]) => { this.commands.push(...commands) } })
        this.director.autoType = 2 // full auto: the AI acts for both teams
        this.random.run(() => this.director.FlushCommands())
        this.consumeCommands()
        this.initial = this.getCurrentState()
        // GameDirectorBase.ChangeBattlePhase(Start) runs the first act (e.g. a battle-start follow-up): its own entry.
        this.pending = this.report(() => this.director.ChangeBattlePhase(PHASE_START))
    }
    private readonly initial: BattleSnapshot
    private pending: BattleSnapshot[] = []

    private create(setup: EngineBattleSetup): any {
        const allies = setup.allies.map((k, i) => E.kiokuToNetworkUnit(k, i + 1))
        if (setup.kind === "pvp") {
            const d = new E.PvpGameDirector().ctor()
            d.SetupBattleStage(new E.PvPOrGvGBattleUnitProvider().ctor(allies, setup.enemies.map((k, i) => E.kiokuToNetworkUnit(k, i + 1))), 0)
            return d
        }
        const provider = new E.QuestBattleUnitProvider().ctor(setup.stageId, allies)
        if (setup.kind === "quest") {
            const d = new E.QuestGameDirector().ctor()
            d.SetupBattleStage(setup.stageId, 0, provider)
            return d
        }
        const raid = soloRaidInfo(setup.stageId)!
        const party = raid.partyBuffs.find(p => p.soloRaidPartyBuffMstId === setup.partyBuffId) ?? raid.partyBuffs[0]
        const d = new E.SoloRaidGameDirector().ctor()
        d.SetupBattleStageForSoloRaid(setup.stageId, 0, provider, this.battleInfoOf(setup.carry), SOLO_RAID_COMMON_CHARGE_PASSIVE,
            raid.season?.soloRaidSeasonBuffMstId ?? 0, party?.soloRaidPartyBuffMstId ?? 0, setup.noRoundLimit ? 0 : raid.limitRoundCount, 8.64e15)
        return d
    }

    /** Network.Definition.SoloRaid.BattleInfo of a carried attempt (wave 0 = a new battle). */
    private battleInfoOf(c?: RaidCarry): any {
        const info = new E.BattleInfo()
        if (!c) return info
        info.wave = c.wave
        info.nextEnemyIndex = c.nextEnemyIndex
        info.enemyLinkHp = c.linkHp
        info.enemyInfoList = c.enemies.map(e => Object.assign(new E.EnemyInfo(), {
            questEnemyAppearanceMstId: e.appearanceId, enemyIndex: e.positionId, hp: e.hp, breakGauge: e.breakGauge, breakBonus: e.breakBonus, turnGaugeValue: e.turnGauge,
        }))
        info.enemyCountDownNum = c.countdown?.num ?? 0
        info.enemyCountDownDamage = c.countdown?.damage ?? 0
        info.isSeasonBuffActive = c.seasonBuff?.active ?? false
        info.seasonBuffPoint = c.seasonBuff?.point ?? 0
        info.seasonBuffTurnGaugeValue = c.seasonBuff?.gauge ?? 0
        return info
    }

    // ---- state

    get isOver(): boolean { return this.director.BattlePhase === PHASE_FINISH }
    get result(): "win" | "lose" | undefined {
        if (!this.isOver) return undefined
        return this.director.judgeResultReferee.result === RESULT_WIN ? "win" : "lose"
    }
    get finishedByRoundLimit(): boolean { return !!this.director.judgeResultReferee?.BattleFinishByRoundLimit }
    get elapsed(): number { return this.director.turnActSystem.turnReferee.elapsedActionTime }
    get currentRound(): number { return this.director.turnActSystem.turnReferee.CurrentRound }
    get currentWave(): number { return this.director.waveReferee?.currentWave ?? 1 }

    /** SoloRaidGameDirector.SyncBattleInfo of the finished attempt (what the next attempt continues from). */
    raidCarry(): RaidCarry | undefined {
        const b = this.lastBattleInfo
        if (!b) return undefined
        return {
            wave: b.wave, nextEnemyIndex: b.nextEnemyIndex, linkHp: b.enemyLinkHp,
            enemies: (b.enemyInfoList ?? []).map((e: any) => ({ appearanceId: e.questEnemyAppearanceMstId, positionId: e.enemyIndex, hp: e.hp, breakGauge: e.breakGauge, breakBonus: e.breakBonus, turnGauge: e.turnGaugeValue })),
            countdown: b.enemyCountDownNum > 0 ? { num: b.enemyCountDownNum, damage: b.enemyCountDownDamage } : undefined,
            seasonBuff: { active: b.isSeasonBuffActive, point: b.seasonBuffPoint, gauge: b.seasonBuffTurnGaugeValue },
        }
    }

    // ---- names

    private info(unit: any): UnitInfo {
        let info = this.units.get(unit)
        if (info) return info
        const isTeam1 = unit._Team === 0
        const pos = unit._PositionId
        const param = unit._BattleParameter
        const appearanceId = param instanceof E.QuestEnemyAppearanceParameter ? param._QuestEnemyAppearanceMstId : 0
        const appearance = appearanceId ? appearanceById.get(appearanceId) : undefined
        const kioku = appearance ? undefined : (isTeam1 ? this.allyKiokus : this.enemyKiokus)[pos - 1]
        info = {
            name: kioku?.name ?? (appearance ? enemyName(appearance) : `Unit ${unit._Id}`),
            isTeam1, dataId: kioku?.data?.id ?? appearance?.enemyMstId ?? unit._MstId, isEnemyUnit: !!appearance, appearance,
        }
        this.units.set(unit, info)
        return info
    }

    private nameOf(o: unknown): string {
        if (o == null) return ""
        if (o instanceof E.BattleUnit) return this.info(o).name
        if (o instanceof E.UnitStateBase) return detailDescription((o as any)._MstId)
        if (typeof o === "number") {
            const u = this.director?.battleUnitBundle.dic.get(o)
            return u ? this.info(u).name : String(o)
        }
        return String((o as any).constructor?.name ?? o)
    }

    private team(isTeam1: boolean): any[] {
        const b = this.director.battleUnitBundle
        return [...(isTeam1 ? b.allyList : b.enemyList)].sort((a: any, c: any) => a._PositionId - c._PositionId)
    }

    private posOf(unit: any): number {
        return this.team(unit._Team === 0).indexOf(unit)
    }

    // ---- snapshots

    private stateLines(unit: any): { buffs: string[], debuffs: string[], ailments: string[], shields: number, spd: [number, string, string?][] } {
        const buffs: string[] = [], debuffs: string[] = [], ailments: string[] = [], spd: [number, string, string?][] = []
        let shields = 0
        for (const s of unit._Condition._StateList) {
            const user = this.director.battleUnitBundle.dic.get(s._UserUnitId)
            const applier = user ? this.info(user).name : ""
            const desc = detailDescription(s._MstId)
            const turns = s.IsPermanent ? "" : ` (${s._RemainingTurn} turn${s._RemainingTurn === 1 ? "" : "s"})`
            if (s._EffectType === "SHIELD") shields++
            if (/SPD/.test(s._EffectType ?? "")) spd.push([0, desc, applier])
            if (s instanceof E.AbnormalUnitStateBase) ailments.push(`${s._EffectType}${turns} - ${applier}${desc ? ` - ${desc}` : ""}`)
            else if (s.Direction === 0) buffs.push(`${applier} - ${desc}`)
            else if (s.Direction === 1) debuffs.push(`${applier} - ${desc}`)
        }
        return { buffs, debuffs, ailments, shields, spd }
    }

    private unitSnapshot(unit: any): TeamSnapshot {
        const info = this.info(unit)
        const c = unit._Condition
        const gauge = unit._TurnGauge
        const speed = unit.GetProcessedSpeed()
        const lines = this.stateLines(unit)
        return {
            atk: unit.GetProcessedAtk(),
            spd: speed,
            currSpdBuffs: lines.spd,
            buffs: lines.buffs,
            debuffs: lines.debuffs,
            ailments: lines.ailments,
            magicStacks: c._ChargePoint,
            maxMagicStacks: c._MaxChargePoint,
            baseSpd: info.isEnemyUnit ? speed : (this.allyOrEnemyKioku(unit)?.data?.minSpd ?? speed),
            secondsLeft: gauge._GaugeValue,
            distanceLeft: gauge._GaugeValue * speed,
            name: info.name,
            breakCurrent: unit._BreakPoint._PointValue,
            maxBreakGauge: unit._BreakPoint.maxPointValue,
            mp: unit._EP,
            maxMp: unit._MaxEP,
            bp: unit._MaxBP > 0 ? unit._BP : undefined,
            maxBp: unit._MaxBP > 0 ? unit._MaxBP : undefined,
            id: info.dataId,
            hp: unit._HP,
            maxHp: unit._MaxHP,
            isDead: unit.IsDead,
            barrier: c._BarrierEndurance,
            maxBarrier: c._MaxBarrierEndurance,
            shields: lines.shields,
            stunned: c._CanNotAction,
            isBroken: unit._BreakPoint.IsBreak,
            breakedDamageReceiveRate: unit._BreakedDamageReceiveRate,
            isEnemyUnit: info.isEnemyUnit || undefined,
            hpGauges: unit._InitialHpGaugeCount > 1 ? unit._CurrentHpGaugeCount : undefined,
        }
    }

    private allyOrEnemyKioku(unit: any): EngineKioku | undefined {
        return (unit._Team === 0 ? this.allyKiokus : this.enemyKiokus)[unit._PositionId - 1]
    }

    /** The state before the first act (what the pages show as the battle setup). */
    get initialState(): BattleSnapshot { return this.initial }

    getCurrentState(): BattleSnapshot {
        const d = this.director
        const lh = d.linkHpReferee
        const cd = d.countdownReferee
        const sr = d.soloRaidBuffReferee
        const cdUnit = cd && cd.countdown > 0 ? d.battleUnitBundle.dic.get(cd.battleUnitId) : undefined
        const actor = this.lastActor
        return {
            allies: { sp: d.spReferee.allySp, team: this.team(true).map(u => this.unitSnapshot(u)) },
            enemies: { sp: d.spReferee.enemySp, team: this.team(false).map(u => this.unitSnapshot(u)) },
            lastActor: actor ? this.info(actor).name : undefined,
            lastTeamIsTeam1: actor ? actor._Team === 0 : undefined,
            lastActorPos: actor ? this.posOf(actor) : undefined,
            lastTargetType: this.lastTargetType,
            events: this.events.splice(0),
            linkHp: lh && lh.linkHpType !== 0 ? { type: lh.linkHpType, name: lh.linkHpName ?? "", current: lh.currentLinkHp, max: lh.maxLinkHp } : undefined,
            round: this.currentRound,
            elapsed: this.elapsed,
            vanguard: sr && sr.maxSeasonBuffPoint > 0 ? { active: sr.isSeasonBuffActive, point: sr.currentSeasonBuffPoint, maxPoint: sr.maxSeasonBuffPoint, activeMaxPoint: sr.activeMaxSeasonBuffPoint, gauge: sr.activeCurrentSeasonBuffTurnGaugeValue, maxGauge: sr.activeMaxSeasonBuffTurnGaugeValue } : undefined,
            countdown: cdUnit ? { value: cd.countdown, max: cd.maxCountdown, cancelTotal: cd.cancelTotalDamage, cancelMax: cd.cancelMaxTotalDamage, unit: this.info(cdUnit).name } : undefined,
            rngEvents: this.rng.drain(),
            field: this.fieldSnapshot(),
        }
    }

    private fieldSnapshot(): BattleSnapshot["field"] {
        for (const isTeam1 of [true, false]) {
            const units = this.team(isTeam1)
            const i = units.findIndex(u => !u.IsDead && u._Condition._MaxZoneStack > 0 && u._Condition._ZoneStack > 0)
            if (i >= 0) {
                const u = units[i]
                return { owner: this.info(u).name, ownerPos: i, ownerIsTeam1: isTeam1, stack: u._Condition._ZoneStack, max: u._Condition._MaxZoneStack, element: this.allyOrEnemyKioku(u)?.data?.element }
            }
        }
        return undefined
    }

    // ---- running

    private consumeCommands(): any[] {
        const out = this.commands
        this.commands = []
        for (const c of out) {
            if (c instanceof E.CommandSoloRaidSyncBattleInfo) this.lastBattleInfo = c._BattleInfo
            if (c instanceof E.CommandExecuteActBase) this.events.push(...this.eventsOf(c))
        }
        return out
    }

    /** BattleEvents (hits, DOT ticks, heals, summons) of one executed act. */
    private eventsOf(c: any): BattleEvent[] {
        const dic = this.director.battleUnitBundle.dic
        const actor = dic.get(c._ActUnitId)
        const isSkill = c instanceof E.CommandSkill
        const out: BattleEvent[] = []
        for (const n of c._AffectedUnitNoticeList ?? []) {
            const target = dic.get(n._AffectedUnitId)
            if (!target) continue
            const t = this.info(target)
            const base = { target: t.name, targetIsTeam1: t.isTeam1, targetPos: this.posOf(target) }
            const damages = [...(n.Damages ?? [])]
            const hp = damages.filter((x: any) => !x._IsBarrierDamage).reduce((s: number, x: any) => s + x._DamageValue, 0)
            const barrier = [...(n.BarrierDamages ?? [])].reduce((s: number, x: any) => s + x._DamageValue, 0)
            if (damages.length || barrier) {
                const slip = !isSkill && (n._ReceivedSlipDamageEffectTypeList?.length ?? 0) > 0
                out.push({
                    ...base, kind: slip ? "dot" : "hit", amount: hp, barrierAbsorbed: barrier || undefined,
                    isCritical: damages.some((x: any) => x._IsCritical) || undefined,
                    source: actor ? this.info(actor).name : undefined, sourceIsTeam1: actor ? actor._Team === 0 : undefined, sourcePos: actor ? this.posOf(actor) : undefined,
                    breakDamage: n._BreakDamage?._DamageValue || undefined,
                    broke: n._BreakDamage != null && target._BreakPoint.IsBreak ? true : undefined,
                    breakRateUp: n._BreakedDamageReceiveRateUpValue || undefined,
                })
            }
            if (n._IsReceivedRecovery && n._RecoveryValue > 0) {
                out.push({ ...base, kind: "heal", amount: n._RecoveryValue, source: actor ? this.info(actor).name : undefined, sourceIsTeam1: actor ? actor._Team === 0 : undefined, sourcePos: actor ? this.posOf(actor) : undefined })
            }
            if (n._IsSummoned) out.push({ ...base, kind: "summon", amount: 0, source: actor ? this.info(actor).name : undefined })
        }
        return out
    }

    /** The old engine's action type of an executed act. */
    private targetTypeOf(act: any, actor: any): TargetType | undefined {
        if (act instanceof E.SpecialAttackAct) return TargetType.specialId
        if (act instanceof E.AdditionalSkillAct) return TargetType.fuaId
        if (act instanceof E.SkillDecisionActBase) {
            const normal = actor?.SkillSet?.NormalAttack
            return normal && act.skillMstId === normal.Id ? TargetType.attackId : TargetType.skillId
        }
        return undefined
    }

    private actionLabelOf(act: any): string | undefined {
        if (act instanceof E.AdditionalSkillAct) return "Follow-up"
        if (act instanceof E.ComboTurnUnitAct && act._ActionStep >= 2) return `Combo ${act._ActionStep}`
        if (act instanceof E.AdditionalTurnUnitAct) return "Extra action"
        if (act instanceof E.ReActionTurnUnitAct) return "Counter"
        if (act instanceof E.ModeChangeAct) return "Form change"
        if (act instanceof E.StartTimingAct) return "Start action"
        return undefined
    }

    /** Runs engine calls (with this battle's random decisions) and turns the commands they produced into entries:
     * one per executed skill, endless reinforcements, the Solo Raid buff activation, a form change. */
    private report(fn: () => void): BattleSnapshot[] {
        const d = this.director
        const out: BattleSnapshot[] = []
        this.random.run(() => { fn(); d.FlushCommands() })
        const commands = this.consumeCommands()
        const act = d.turnActSystem.actReferee.currentAct
        if (commands.some(c => c instanceof E.CommandAddEndlessEnemy))
            out.push({ ...this.getCurrentState(), lastActor: d.linkHpReferee?.linkHpName || "Reinforcements", lastTeamIsTeam1: false, lastActorPos: undefined, lastTargetType: undefined })
        if (commands.some(c => c instanceof E.CommandSoloRaidBuffActivate))
            out.push({ ...this.getCurrentState(), lastActor: "Labyrinth Vanguard activated", lastTeamIsTeam1: true, lastActorPos: undefined, lastTargetType: undefined })
        const skill = commands.find(c => c instanceof E.CommandSkill)
        if (skill) {
            const actor = d.battleUnitBundle.dic.get(skill._ActUnitId)
            this.lastActor = actor
            this.lastTargetType = this.targetTypeOf(act, actor)
            out.push({ ...this.getCurrentState(), actionLabel: this.actionLabelOf(act) })
        } else if (commands.some(c => c instanceof E.CommandExecuteModeChange)) {
            this.lastActor = act ? d.battleUnitBundle.dic.get(act.actUnitId) : undefined
            this.lastTargetType = undefined
            out.push({ ...this.getCurrentState(), actionLabel: "Form change" })
        }
        return out
    }

    /** One client request (TimeForward, or TimeForward / EndWave / BeginWave between waves). */
    private step(): BattleSnapshot[] {
        const d = this.director
        const wave = d.waveReferee
        if (wave != null && wave.isDuringTransition) {
            const out = this.report(() => {
                d.Request(new E.TimeForwardRequest().ctor(), true, null)
                d.Request(new E.EndWaveRequest().ctor(), true, null)
            })
            out.push({ ...this.getCurrentState(), lastActor: `Wave ${this.currentWave}`, lastActorPos: undefined, lastTargetType: undefined, wave: this.currentWave })
            // BeginWave runs the new wave's first act
            out.push(...this.report(() => d.Request(new E.BeginWaveRequest().ctor(), true, null)))
            this.requests += 3
            return out
        }
        this.requests++
        return this.report(() => d.Request(new E.TimeForwardRequest().ctor(), true, null))
    }

    /** Runs until the next unit's turn has ended (its action, follow-ups, extra actions, end of turn) or the battle is
     * over. One entry per executed skill; turn begin/end effects (DOT ticks, regen) are folded into the neighbouring
     * entries. Returns [] once the battle is over. */
    executeNextAction(maxRequests = 500): BattleSnapshot[] {
        const out: BattleSnapshot[] = this.pending.splice(0)
        if (out.length > 0) return out
        for (let n = 0; n < maxRequests && !this.isOver; n++) {
            const before = this.director.turnActSystem.actReferee.currentAct
            out.push(...this.step())
            const act = this.director.turnActSystem.actReferee.currentAct
            if (act !== before && act instanceof E.TurnEndAct && out.length > 0) break
            if (out.some(x => x.wave !== undefined)) break
        }
        if (out.length > 0) {
            // turn end effects and the finish state go into the last entry
            const last = out[out.length - 1]
            const final = this.getCurrentState()
            out[out.length - 1] = { ...final, lastActor: last.lastActor, lastTeamIsTeam1: last.lastTeamIsTeam1, lastActorPos: last.lastActorPos, lastTargetType: last.lastTargetType, actionLabel: last.actionLabel, wave: last.wave,
                events: [...(last.events ?? []), ...(final.events ?? [])], rngEvents: [...(last.rngEvents ?? []), ...(final.rngEvents ?? [])] }
        } else if (!this.isOver) {
            out.push(this.getCurrentState())
        }
        return out
    }
}
