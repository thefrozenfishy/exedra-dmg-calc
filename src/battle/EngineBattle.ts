// App side (not game code): runs a battle on the 1:1 engine (src/engine, through the bundle) and reports it the way
// the pages show battles: BattleSnapshot entries (types/KiokuTypes.ts), one per executed skill, with the roll log.
//
// The engine is driven like the game client drives it (ClientDriver.runBattleLikeClient): TimeForward requests, and
// TimeForward / EndWave / BeginWave between waves. Every engine call runs with this battle's EngineRandom installed.
import { TargetType, type BattleEvent, type BattleSnapshot, type TeamSnapshot } from "../types/KiokuTypes"
import { BattleRng, type RngDecision, type RngMode } from "../models/BattleRng"
import { enemyName, multiRaidInfo, skillName, soloRaidInfo, SOLO_RAID_COMMON_CHARGE_PASSIVE, type QuestEnemyAppearance } from "../models/PvE"
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
    /** `gvg`: the same fight under GvgGameDirector (BattleType GvG instead of PvP). */
    | { kind: "pvp", allies: EngineKioku[], enemies: EngineKioku[], gvg?: boolean }
    | { kind: "quest", allies: EngineKioku[], stageId: number }
    | { kind: "soloRaid", allies: EngineKioku[], stageId: number, partyBuffId?: number, noRoundLimit?: boolean, carry?: RaidCarry }
    /** Link Raid (MultiRaidGameDirector). `bossHp`: the boss's HP when this player joins (the raid's shared HP the server
     *  sends; default its full HP: a new raid). Offline there are no other participants: no HP syncs arrive. */
    | { kind: "multiRaid", allies: EngineKioku[], stageId: number, bossHp?: number, noRoundLimit?: boolean }

export interface EngineBattleOptions {
    seed?: number
    rngMode?: RngMode
    decisions?: Map<number, RngDecision> | Record<number, RngDecision>
    relaxedPicks?: boolean
    rng?: BattleRng
    /** PvE "Manual": the player decides every ally action, target and ultimate (BattleRng.pick, PendingDecision). */
    manualTargeting?: boolean
    /** App tools (Kioku Grid bench): runs once on the set-up director, before the battle phase starts. */
    onSetup?: (director: any) => void
    /** App tools (Kioku Grid bench): runs before each manual ally decision, with the deciding unit (before the options
     *  are built, so it can e.g. top up SP). */
    beforeDecision?: (unit: any, battle: EngineBattle) => void
}

/** Display info of one engine unit. */
interface UnitInfo { name: string, isTeam1: boolean, dataId: number, isEnemyUnit: boolean, appearance?: QuestEnemyAppearance }

const appearanceById = new Map<number, QuestEnemyAppearance>((questEnemyAppearanceJson as QuestEnemyAppearance[]).map(a => [a.questEnemyAppearanceMstId, a]))
const PHASE_START = 1, PHASE_FINISH = 2
const RESULT_WIN = 1

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
    /** Break gauges before the running request (the notices carry no amount): break damage = before - after. */
    private breakBefore = new Map<any, number>()
    /** HP before the running request: a hit's `amount` is the HP actually lost (overkill not counted), as before. */
    private hpBefore = new Map<any, number>()
    private manual: boolean
    private readonly beforeDecision?: (unit: any, battle: EngineBattle) => void
    /** Manual control: "Continue" closes the between-actions ultimate prompt until the next turn act. */
    private ultimateWindowPassed = false

    constructor(setup: EngineBattleSetup, opts: EngineBattleOptions = {}) {
        this.kind = setup.kind
        this.seed = opts.seed ?? opts.rng?.seed ?? Math.floor(Math.random() * 2 ** 32)
        this.rng = opts.rng ?? new BattleRng(opts.rngMode ?? "seed", this.seed, opts.decisions, opts.relaxedPicks)
        this.random = new EngineRandom(this.rng, o => this.nameOf(o))
        this.allyKiokus = setup.allies
        this.enemyKiokus = setup.kind === "pvp" ? setup.enemies : []
        E.bindMasterData()
        this.director = this.random.run(() => EngineBattle.createDirector(setup))
        this.director.commandSender.Subscribe({ IObserver$OnNext: (commands: any[]) => { this.commands.push(...commands) } })
        this.manual = !!opts.manualTargeting
        this.beforeDecision = opts.beforeDecision
        this.director.autoType = this.manual ? 0 : 2 // Manual: the player decides the allies; FullAuto: the AI acts for both teams
        if (opts.onSetup) this.random.run(() => opts.onSetup!(this.director))
        this.random.run(() => this.director.FlushCommands())
        this.consumeCommands()
        this.initial = EngineBattle.shiftedToFirstActor(this.getCurrentState())
        // GameDirectorBase.ChangeBattlePhase(Start) runs the first act (e.g. a battle-start follow-up): its own entry.
        this.pending = this.report(() => this.director.ChangeBattlePhase(PHASE_START))
    }
    private readonly initial: BattleSnapshot
    private pending: BattleSnapshot[] = []

    /** The game director of `setup` after SetupBattleStage (battle-start passives done, nothing acted yet). Call it with
     *  a GameRandom hook installed when the setup may roll (EngineRandom.run). */
    static createDirector(setup: EngineBattleSetup, opts: { allyPassives?: boolean } = {}): any {
        E.bindMasterData()
        const allies = setup.allies.map((k, i) => E.kiokuToNetworkUnit(k, i + 1))
        // allyPassives false: the allies arrive without passive skills (app-side tools that give effects themselves)
        if (opts.allyPassives === false) for (const u of allies) u.passiveSkillInfoList = []
        if (setup.kind === "pvp") {
            const provider = new E.PvPOrGvGBattleUnitProvider().ctor(allies, setup.enemies.map((k, i) => E.kiokuToNetworkUnit(k, i + 1)))
            if (setup.gvg) {
                const d = new E.GvgGameDirector().ctor()
                d.SetupBattleStage(provider)
                return d
            }
            const d = new E.PvpGameDirector().ctor()
            d.SetupBattleStage(provider, 0)
            return d
        }
        const provider = new E.QuestBattleUnitProvider().ctor(setup.stageId, allies)
        if (setup.kind === "quest") {
            const d = new E.QuestGameDirector().ctor()
            d.SetupBattleStage(setup.stageId, 0, provider)
            return d
        }
        if (setup.kind === "multiRaid") {
            const info = multiRaidInfo(setup.stageId)!
            // [UNCERTAIN] the season's battle bonus passives arrive with every player unit (source Bonus 5), like the Solo
            // Raid buffs; each one's role / element condition is checked by the engine (BattleUnit.GetPassiveSkills).
            for (const u of allies) for (const id of info.bonusPassiveIds) {
                const p = new E.PassiveSkillInfo()
                p.passiveSkillMstId = id
                p.level = 1
                p.abilitySourceType = 5
                u.passiveSkillInfoList = [...u.passiveSkillInfoList, p]
            }
            const d = new E.MultiRaidGameDirector().ctor()
            d.SetupBattleStage(setup.stageId, provider, setup.bossHp ?? EngineBattle.multiRaidBossHp(setup.stageId), [],
                setup.noRoundLimit ? 0 : info.limitRoundCount, 8.64e15, 0, 0, false)
            return d
        }
        const raid = soloRaidInfo(setup.stageId)!
        const party = raid.partyBuffs.find(p => p.soloRaidPartyBuffMstId === setup.partyBuffId) ?? raid.partyBuffs[0]
        // The player's units arrive from the server with the Solo Raid buff passives (the same list
        // SoloRaidBuffReferee.AddSoloRaidBuffToUnit gives the enemies: common 8, season 6, party 7).
        const season = raid.season
        const extra: [number | undefined, number][] = [[SOLO_RAID_COMMON_CHARGE_PASSIVE, 8], [season?.passiveSkillMstId, 6], [season?.enhancedPassiveSkillMstId, 6],
            [season?.buffPointChargePassiveSkillMstId, 6], [party?.passiveSkillMstId, 7], [party?.buffPointChargePassiveSkillMstId, 7]]
        if (opts.allyPassives !== false) for (const u of allies) for (const [id, source] of extra) {
            if (!id || !(id > 0)) continue
            const info = new E.PassiveSkillInfo()
            info.passiveSkillMstId = id
            info.level = 1
            info.abilitySourceType = source
            u.passiveSkillInfoList = [...u.passiveSkillInfoList, info]
        }
        const d = new E.SoloRaidGameDirector().ctor()
        d.SetupBattleStageForSoloRaid(setup.stageId, 0, provider, EngineBattle.battleInfoOf(setup.carry), SOLO_RAID_COMMON_CHARGE_PASSIVE,
            raid.season?.soloRaidSeasonBuffMstId ?? 0, party?.soloRaidPartyBuffMstId ?? 0, setup.noRoundLimit ? 0 : raid.limitRoundCount, 8.64e15)
        return d
    }

    /** Full HP of a Link Raid stage's boss (its main-target appearance at battle start). */
    static multiRaidBossHp(stageId: number): number {
        const rows = (questEnemyAppearanceJson as QuestEnemyAppearance[]).filter(a => a.questStageMstId === stageId && a.isMainTargetEnemy && a.conditionType === 0)
        return rows.length ? rows[rows.length - 1].hp : 0
    }

    /** Link Raid: damage dealt to the boss so far (MultiRaidGameDirector.TotalDamage). */
    get raidTotalDamage(): number | undefined { return this.kind === "multiRaid" ? this.director.TotalDamage : undefined }

    /** Network.Definition.SoloRaid.BattleInfo of a carried attempt (wave 0 = a new battle). */
    private static battleInfoOf(c?: RaidCarry): any {
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
    /** Solo Raid score approximation agreed with the user (the real score is computed on the server): 20 per AV. */
    get teamPointsUsed(): number { return Math.round(20 * this.elapsed) }

    /** Fight solver control: sides whose targets stay with the AI while the player decides the actions. */
    aiTargetSides?: Set<"friend" | "opp">

    /** Switches to manual control of the allies (the enemies stay with the AI); `aiSides` keep their AI targets. */
    applyControl(aiSides: ("friend" | "opp")[]): void {
        this.manual = true
        this.director.autoType = 0
        this.aiTargetSides = aiSides.length ? new Set(aiSides) : undefined
    }

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
            if (s._EffectOrigin === 2 && s.IsPermanent) continue // permanent passive-skill states: always on, not listed (as before)
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

    /** The state before the first act (what the pages show as the battle setup), with time moved on to the first
     * actor like TurnReferee.ShiftNextTurn will (the first unit at 0 AV). */
    get initialState(): BattleSnapshot { return this.initial }

    private static shiftedToFirstActor(s: BattleSnapshot): BattleSnapshot {
        const living = [...s.allies.team, ...s.enemies.team].filter(u => !u.isDead)
        const dt = Math.min(...living.map(u => u.secondsLeft))
        if (!(dt > 0) || !Number.isFinite(dt)) return s
        const shift = (u: TeamSnapshot): TeamSnapshot => u.isDead ? u : { ...u, secondsLeft: Math.max(0, Math.fround(u.secondsLeft - dt)), distanceLeft: Math.max(0, Math.fround(u.secondsLeft - dt)) * u.spd }
        return { ...s, allies: { ...s.allies, team: s.allies.team.map(shift) }, enemies: { ...s.enemies, team: s.enemies.team.map(shift) } }
    }

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
            const dealt = damages.filter((x: any) => !x._IsBarrierDamage).reduce((s: number, x: any) => s + x._DamageValue, 0)
            const hp = Math.min(dealt, this.hpBefore.get(target) ?? dealt)
            const barrier = [...(n.BarrierDamages ?? [])].reduce((s: number, x: any) => s + x._DamageValue, 0)
            if (damages.length || barrier) {
                const slip = !isSkill && (n._ReceivedSlipDamageEffectTypeList?.length ?? 0) > 0
                out.push({
                    ...base, kind: slip ? "dot" : "hit", amount: hp, barrierAbsorbed: barrier || undefined,
                    isCritical: damages.some((x: any) => x._IsCritical) || undefined,
                    source: actor ? this.info(actor).name : undefined, sourceIsTeam1: actor ? actor._Team === 0 : undefined, sourcePos: actor ? this.posOf(actor) : undefined,
                    // notices carry no break amount (BreakDamage is the "broke" marker): the gauge's drop over this request
                    breakDamage: Math.max(0, (this.breakBefore.get(target) ?? target._BreakPoint._PointValue) - target._BreakPoint._PointValue) || undefined,
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
        if (act instanceof E.ReActionTurnUnitAct) return "Extra action"
        if (act instanceof E.ModeChangeAct) return "Form change"
        if (act instanceof E.StartTimingAct) return "Start action"
        return undefined
    }

    /** Runs engine calls (with this battle's random decisions) and turns the commands they produced into entries:
     * one per executed skill, endless reinforcements, the Solo Raid buff activation, a form change. */
    private report(fn: () => void): BattleSnapshot[] {
        const d = this.director
        const out: BattleSnapshot[] = []
        this.breakBefore = new Map([...d.battleUnitBundle.dic.values()].map((u: any) => [u, u._BreakPoint._PointValue]))
        this.hpBefore = new Map([...d.battleUnitBundle.dic.values()].map((u: any) => [u, u._HP]))
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
            if (act instanceof E.TurnUnitActBase) this.ultimateWindowPassed = false
            out.push({ ...this.getCurrentState(), actionLabel: this.actionLabelOf(act) })
        } else if (commands.some(c => c instanceof E.CommandExecuteModeChange)) {
            this.lastActor = act ? d.battleUnitBundle.dic.get(act.actUnitId) : undefined
            this.lastTargetType = undefined
            out.push({ ...this.getCurrentState(), actionLabel: "Form change" })
        }
        return out
    }

    // ---- manual control (the client's decisions, made through BattleRng.pick)

    private unitLabel(unit: any): string {
        return `${this.info(unit).name} (${unit._Team === 0 ? "Ally" : "Enemy"} ${this.posOf(unit) + 1})`
    }

    /** Ally ultimates that GameDirectorBase.RegisterSpecialAttack would accept right now. */
    private readyUltimates(): any[] {
        const d = this.director
        return this.team(true).filter(u => {
            if (u.SpecialAttack == null || !u.IsSpecialAttackPointMax() || u.IsDead) return false
            if (u._Condition._CanNotUseSkill || u._Condition._CanNotUseSpecialAttack) return false
            const bp = u._BreakPoint
            if (bp.maxPointValue > 0 && bp._PointValue < 1) return false
            return !d.turnActSystem.actReferee.IsUnitSpecialAttackActRegistered(u._Id)
        })
    }

    /** The undecided ally act the director stopped at (CommandDecideSkillContent), if any. */
    private pendingDecisionAct(): any {
        if (!this.manual) return undefined
        const act = this.director.turnActSystem.actReferee.currentAct
        if (!(act instanceof E.SkillDecisionActBase) || act.IsDecided || act.IsExecuted) return undefined
        const unit = this.director.battleUnitBundle.dic.get(act.actUnitId)
        return unit && unit._Team === 0 ? act : undefined
    }

    /** Targets of `skill` the player picks: one enemy and/or one ally, by the skill's target sides. */
    private pickTargets(unit: any, skill: any): { target: number, friend: number } {
        const ref = this.director.targetReferee
        let target = ref.allyAttackTargetId, friend = ref.allyFriendTargetId
        // only effects aimed at one unit (EffectRange 1 target / 2 proximity) use the picked target; TargetSide 1 = opponent, 0 = friend
        const effects: any[] = skill.launcher.AbilityEffectList
        const aims = (side: number) => effects.some(e => e.TargetSide === side && (e.EffectRange === 1 || e.EffectRange === 2))
        const what = skillName(skill.Id)
        if (aims(1) && !this.aiTargetSides?.has("opp")) {
            const pool = this.team(false).filter(u => !u.IsDead)
            if (pool.length > 1) target = pool[this.rng.pickTarget(`${this.unitLabel(unit)} · ${what}: target on the enemies`, pool.map(u => this.unitLabel(u)), pool)]._Id
            else if (pool.length === 1) target = pool[0]._Id
        }
        if (aims(0) && !this.aiTargetSides?.has("friend")) {
            const pool = this.team(true).filter(u => !u.IsDead)
            if (pool.length > 1) friend = pool[this.rng.pickTarget(`${this.unitLabel(unit)} · ${what}: target on the allies`, pool.map(u => this.unitLabel(u)), pool)]._Id
            else if (pool.length === 1) friend = pool[0]._Id
        }
        return { target, friend }
    }

    private skillRequest(unit: any, skill: any): void {
        const { target, friend } = this.pickTargets(unit, skill)
        const r = new E.SkillRequest().ctor()
        r.battleUnitId = unit._Id
        r.skillMstId = skill.Id
        r.targetBattleUnitId = target
        r.selectAllyUnitId = friend
        this.director.Request(r, true, null)
    }

    private registerUltimate(unit: any): void {
        const r = new E.RegisterSpecialAttackRequest().ctor()
        r.battleUnitId = unit._Id
        r.isRegister = true
        this.director.Request(r, true, null)
    }

    /** Answers the director's decision request for `act` (may throw PendingDecision before touching the engine). */
    private decide(act: any): BattleSnapshot[] {
        const d = this.director
        const unit = d.battleUnitBundle.dic.get(act.actUnitId)
        this.beforeDecision?.(unit, this)
        if (act instanceof E.SpecialAttackAct) return this.report(() => this.skillRequest(unit, unit.SpecialAttack))
        const what = act instanceof E.AdditionalTurnUnitAct || act instanceof E.ReActionTurnUnitAct ? "extra action" : act instanceof E.ComboTurnUnitAct && act._ActionStep >= 2 ? `turn (combo ${act._ActionStep})` : "turn"
        const sp = d.spReferee.allySp
        // the skills the client offers, switched ones included (as UnitBrain.AutoAction / CommandDecideSkillContent do)
        const switched = E.ref(null), switchState = E.ref(null)
        const skill = unit.IsSwitchingActiveSkill(E.ActiveSkill, switched, switchState) ? switched.v : unit.ActiveSkills[0]
        const switchedNormal = E.ref(null)
        const normal = unit.IsSwitchingActiveSkill(E.NormalAttack, switchedNormal, E.ref(null)) ? switchedNormal.v : unit.NormalAttack
        const options: { label: string, skill?: any, ult?: any }[] = []
        if (skill && sp > 0) options.push({ label: `Battle Skill (SP ${sp})`, skill })
        // 3.21.0 Step-Up: the client's step button walks StepUpSkillHandler.TryEvaluateNextStepUp step by step; each
        // reachable step is its own skill (SkillSet.StepUpSkills), paid as its SP + step in ActiveSkill.Execute
        if (skill && sp > 0) {
            const states = E.StepUpSkillHandler.GetActiveStepUpStateList(unit)
            let level = 0
            const id = E.ref(0), cost = E.ref(0)
            while (states.length && E.StepUpSkillHandler.TryEvaluateNextStepUp(unit, states, level, d.spReferee, id, cost)) {
                level++
                const stepSkill = unit.SkillSet.GetSkill(id.v)
                if (!stepSkill) break
                options.push({ label: `Battle Skill Step ${level}: ${skillName(stepSkill.Id)} (SP ${cost.v})`, skill: stepSkill })
            }
        }
        options.push({ label: "Basic Attack", skill: normal })
        for (const u of this.readyUltimates()) options.push({ label: `Ultimate: ${this.unitLabel(u)}`, ult: u })
        const choice = options[this.rng.pick("action", `${this.unitLabel(unit)} · ${what}: choose an action`, options.map(o => o.label))]
        if (choice.ult) return this.report(() => this.registerUltimate(choice.ult))
        return this.report(() => this.skillRequest(unit, choice.skill))
    }

    /** One client request (TimeForward, or TimeForward / EndWave / BeginWave between waves). */
    private step(): BattleSnapshot[] {
        const d = this.director
        const pendingAct = this.pendingDecisionAct()
        if (pendingAct) return this.decide(pendingAct)
        const cur = d.turnActSystem.actReferee.currentAct
        const betweenTurns = (cur == null || cur.IsExecuted) && d.turnActSystem.actReferee.actList.length === 0
        if (this.manual && !this.ultimateWindowPassed && betweenTurns) {
            const ready = this.readyUltimates()
            if (ready.length) {
                const i = this.rng.pick("action", "Between actions: fire an ultimate?", ["Continue", ...ready.map(u => `Ultimate: ${this.unitLabel(u)}`)])
                if (i <= 0) this.ultimateWindowPassed = true
                else return this.report(() => this.registerUltimate(ready[i - 1]))
            }
        }
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
