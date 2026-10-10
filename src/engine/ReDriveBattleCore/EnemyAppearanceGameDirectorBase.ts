// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { LinkHpReferee } from "./LinkHpReferee";
import { SummonAbilityEffect } from "./AbilityEffect/SummonAbilityEffect";
import { CountdownStartUnitState } from "./UnitState/CountdownStartUnitState";
import { SoloRaidGameDirector } from "./SoloRaidGameDirector";
import { PassiveSkill } from "./PassiveSkill";
import { BattleUnit } from "./BattleUnit";
import { CommandSoloRaidSyncCountdown } from "./Command/CommandSoloRaidSyncCountdown";
import { CommandInitialize } from "./Command/CommandInitialize";
import { CommandAddEnemy } from "./Command/CommandAddEnemy";
import { CommandSyncLinkHp } from "./Command/CommandSyncLinkHp";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { QuestJudgeResultReferee } from "./QuestJudgeResultReferee";
import { AdditionalEnemyReferee } from "./AdditionalEnemyReferee";
import { bindDelegate, dictGet, notPorted, runCctor } from "../runtime";
import type { List, Nullable, int } from "../runtime";

import type { AffectedUnitNotice } from "./AffectedUnitNotice";

import type { BattleUnitInfo } from "./Command/BattleUnitInfo";

import { GameDirectorBase } from "./GameDirectorBase";
import type { GameSituationData } from "./GameSituationData";

import type { ModeChangeReferee_ModeChangeInfo } from "./ModeChangeReferee";
import type { SpReferee } from "./SpReferee";
import type { TargetReferee } from "./TargetReferee";
import { BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.EnemyAppearanceGameDirectorBase  (TypeDefIndex 376, public abstract class) ----
export abstract class EnemyAppearanceGameDirectorBase extends GameDirectorBase {
    /** 0x80 protected AdditionalEnemyReferee additionalEnemyReferee */
    additionalEnemyReferee: AdditionalEnemyReferee = null!;
    /** 0x88 protected LinkHpReferee linkHpReferee */
    linkHpReferee: LinkHpReferee = null!;
    get LinkHpReferee(): LinkHpReferee { return this.get_LinkHpReferee(); }
    /** @rva 0x737D70  public LinkHpReferee get_LinkHpReferee() { } */
    get_LinkHpReferee(): LinkHpReferee { return this.linkHpReferee; /* asm: mov rax, qword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x1495ED0  public void .ctor() { } */
    ctor(): this {
        this.additionalEnemyReferee = new AdditionalEnemyReferee().ctor();
        this.linkHpReferee = new LinkHpReferee().ctor();
        super.ctor();
        return this;
    }
    /** @rva 0x1495C20 slot 6  public override void OnBattleUnitDeath(int deathObjectId) { } */
    OnBattleUnitDeath(deathObjectId: int): void {
        super.OnBattleUnitDeath(deathObjectId);
        const deathUnit = dictGet(this.battleUnitBundle.dic, deathObjectId);
        this.additionalEnemyReferee.CheckTargetEnemy(deathUnit);
        if (deathUnit.Team === BattleUnit_TeamType.Enemy) {
            const list = this.additionalEnemyReferee.GetAdditionalBattleUnitList$ListBattleUnit(this.battleUnitBundle.enemyList);
            if (list != null) list.forEach(bindDelegate(this, this.$OnBattleUnitDeath$b__5_0));
        }
    }
    /** @rva 0x1495D80 slot 18  protected override void UpdateLinkHp(List<AffectedUnitNotice> noticeList, GameDirectorBase gameDirector) { } */
    UpdateLinkHp(noticeList: List<AffectedUnitNotice>, gameDirector: GameDirectorBase): void {
        const bundle = this.battleUnitBundle;
        const linkHp = this.linkHpReferee;
        const enemyList = bundle.enemyList;
        const linkHpType = linkHp.linkHpType;
        if (linkHpType === 0) return;
        if (linkHpType === 1) {
            linkHp.AddLinkHpDelta(linkHp.CalculateNormalLinkHpDelta(noticeList, bundle.dic));
        } else if (linkHpType === 2) {
            linkHp.AddLinkHpDelta(linkHp.CalculateBossLinkHpDelta(noticeList, bundle.dic, gameDirector));
            linkHp.SyncEnemyHp$ListBattleUnit(enemyList);
            linkHp.UpdateAffectedUnitListIsDeadFlag(enemyList, noticeList);
        }
        // (LinkHpReferee.UpdateLinkHp inlined in the game)
        const r = this.linkHpReferee;
        this.StoreCommand(new CommandSyncLinkHp().ctor$LinkHpType_string_int_int(r.linkHpType, r.linkHpName, r.currentLinkHp, r.maxLinkHp));
    }
    /** @rva 0x1495270 slot 7  protected override void CheckMainTargetEnemyDead(BattleUnit deathUnit) { } */
    CheckMainTargetEnemyDead(deathUnit: BattleUnit): void {
        if (this.linkHpReferee.linkHpType !== 0) return;
        this.judgeResultReferee.CheckMainTargetEnemyDead(deathUnit);
    }
    /** @rva 0x1495050 slot 16  protected override void CheckBattleFinishAfterAct() { } */
    CheckBattleFinishAfterAct(): void {
        if (this.linkHpReferee == null) return;
        const judge = this.judgeResultReferee;
        if (this.linkHpReferee.linkHpType !== 0 && judge instanceof QuestJudgeResultReferee) {
            judge.CheckBattleFinishAfterActWithHpLink(this.linkHpReferee.currentLinkHp, this.battleUnitBundle.activeList); // inlined in the game
            return;
        }
        judge.CheckBattleFinishAfterAct(this.battleUnitBundle.activeList);
    }
    /** @rva 0x14952B0 slot 11  protected override CommandInitialize CreateCommandInitialize(BattleUnitInfo[] battleUnitInfoArray, TargetReferee targetReferee, SpReferee spReferee, GameSituationData gameSituationData) { } */
    CreateCommandInitialize(battleUnitInfoArray: BattleUnitInfo[], targetReferee: TargetReferee, spReferee: SpReferee, gameSituationData: GameSituationData): CommandInitialize {
        const command = new CommandInitialize().ctor$BattleUnitInfo_int_int_int_int_int_int_bool_GameSituationData(battleUnitInfoArray,
            targetReferee.allyAttackTargetId, targetReferee.allyFriendTargetId, targetReferee.enemyAttackTargetId, targetReferee.enemyFriendTargetId,
            spReferee.allySp, spReferee.enemySp, this.isForcedAutomatic, gameSituationData);
        const r = this.linkHpReferee;
        if (r != null) command.SetLinkHp(r.linkHpType, r.linkHpName, r.currentLinkHp, r.maxLinkHp);
        return command;
    }
    /** @rva 0x14956F0  public void ModeChangeEnemyBattleUnit(BattleUnit oldUnit, ModeChangeReferee.ModeChangeInfo modeChangeInfo) { } */
    ModeChangeEnemyBattleUnit(oldUnit: BattleUnit, modeChangeInfo: ModeChangeReferee_ModeChangeInfo): void {
        if (oldUnit == null || oldUnit.isCharacter) return;
        if (!(oldUnit.BattleParameter instanceof QuestEnemyAppearanceParameter)) return;
        const newUnit = new BattleUnit().ctor$int_int_int(oldUnit.Id, modeChangeInfo.QuestEnemyAppearanceMstId, oldUnit.PositionId);
        newUnit._HP = oldUnit.HP;
        newUnit._TurnGauge = oldUnit.TurnGauge;
        this.battleUnitBundle.RemoveUnit$BattleUnit(oldUnit);
        this.battleUnitBundle.AddUnit(newUnit);
        newUnit.Condition.gameDirector = this;
        newUnit.SetActiveConditionCheckDataBundle(this);
        const newUnitDic = new Map<int, BattleUnit>();
        newUnitDic.set(newUnit.Id, newUnit);
        const otherDic = new Map(this.battleUnitBundle.dic);
        otherDic.delete(newUnit.Id);
        if (this instanceof SoloRaidGameDirector) {
            const buffReferee = this.soloRaidBuffReferee;
            buffReferee.AddSoloRaidBuffToUnit([newUnit]);
            if (oldUnit.Condition.StateList.some(state => state instanceof CountdownStartUnitState)) { // <>c.b__10_0
                const countdown = this.countdownReferee;
                if (countdown.countdown > 0) {
                    countdown.maxCountdown = 0; // fields 0x10..0x2F cleared (qword stores)
                    countdown.countdown = 0;
                    countdown.cancelMaxTotalDamage = 0;
                    countdown.cancelTotalDamage = 0;
                    countdown.battleUnitId = 0;
                    countdown.canActiveSkillMstId = 0;
                    countdown.canActiveSkillDetailMstId = 0;
                    countdown.canActiveEnemyUnitId = 0;
                    countdown.LoadCanActiveCountdownSkill(this.battleUnitBundle.dic);
                    const syncType = (countdown.canActiveSkillMstId === 0 || countdown.canActiveSkillDetailMstId === 0) ? 7 : 8;
                    this.StoreCommand(new CommandSoloRaidSyncCountdown().ctor$CountdownReferee_int(countdown, syncType));
                } else {
                    this.InitializeCountdownReferee();
                }
            } else {
                this.InitializeCountdownReferee();
            }
        }
        PassiveSkill.TriggeringOnBattleStart(this, newUnitDic, this.battleUnitBundle.dic, false);
        PassiveSkill.TriggeringOnBattleStart(this, otherDic, newUnitDic, true);
        this.SyncGameSituation();
    }
    /** @rva 0x1494C80  protected void AddEnemyBattleUnit(BattleUnit enemyBattleUnit, bool withStoreCommand = False, bool isInitializedHpLink = False) { } */
    AddEnemyBattleUnit(enemyBattleUnit: BattleUnit, withStoreCommand?: boolean /* = False */, isInitializedHpLink?: boolean /* = False */): void {
        if (enemyBattleUnit == null || enemyBattleUnit.isCharacter) return;
        if (!(enemyBattleUnit.BattleParameter instanceof QuestEnemyAppearanceParameter)) return;
        if (isInitializedHpLink ?? false) {
            if (this.linkHpReferee.linkHpType === 2) enemyBattleUnit.SetHP(this.linkHpReferee.currentLinkHp);
        }
        const param = enemyBattleUnit.BattleParameter;
        this.battleUnitBundle.AddUnit(enemyBattleUnit);
        if (!(param instanceof QuestEnemyAppearanceParameter)) return;
        enemyBattleUnit.TurnGauge.Reset(enemyBattleUnit);
        enemyBattleUnit.Condition.gameDirector = this;
        enemyBattleUnit.SetActiveConditionCheckDataBundle(this);
        const newUnitDic = new Map<int, BattleUnit>();
        newUnitDic.set(enemyBattleUnit.Id, enemyBattleUnit);
        const otherDic = new Map(this.battleUnitBundle.dic);
        otherDic.delete(enemyBattleUnit.Id);
        if (this instanceof SoloRaidGameDirector) this.soloRaidBuffReferee.AddSoloRaidBuffToUnit([enemyBattleUnit]);
        PassiveSkill.TriggeringOnBattleStart(this, newUnitDic, this.battleUnitBundle.dic, false);
        PassiveSkill.TriggeringOnBattleStart(this, otherDic, newUnitDic, true);
        if (!(withStoreCommand ?? false)) return;
        this.StoreCommand(new CommandAddEnemy().ctor$int_int_int(enemyBattleUnit.Id, param.QuestEnemyAppearanceMstId, enemyBattleUnit.PositionId));
    }
    /** @rva 0x14953F0  public List<BattleUnit> GetSummonedUnitList(List<int> summonIdList) { } */
    GetSummonedUnitList(summonIdList: List<int>): List<BattleUnit> {
        const result: List<BattleUnit> = [];
        if (!(summonIdList.length > 0)) return result;
        const queue: int[] = [...summonIdList]; // Queue<int>
        runCctor(SummonAbilityEffect);
        const positions = SummonAbilityEffect.PriorityPositionIds;
        for (let i = 0; i < positions.length; i++) {
            const positionId = positions[i]; // <>c__DisplayClass12_0
            const occupant = this.battleUnitBundle.enemyList.filter(unit => !unit.IsDead && unit.PositionId === positionId)[0] ?? null; // b__0
            if (occupant == null) {
                const id = queue.shift()!; // Dequeue
                const unit = this.additionalEnemyReferee.CreateAdditionalBattleUnitForSummon(id, positionId);
                if (unit != null) {
                    this.AddEnemyBattleUnit(unit, false, true);
                    result.push(unit);
                }
            }
            if (queue.length === 0) return result;
        }
        return result;
    }
    /** @rva 0x14956C0  public void InitLinkHp(int questStageMstId, int currentWave, List<BattleUnit> enemyUnitList, Nullable<int> initialLinkHp) { } */
    InitLinkHp(questStageMstId: int, currentWave: int, enemyUnitList: List<BattleUnit>, initialLinkHp: Nullable<int>): void {
        if (this.linkHpReferee == null) return;
        this.linkHpReferee.Init(questStageMstId, currentWave, enemyUnitList, initialLinkHp); // tail call in the game
    }
    /** @rva 0x1495D60  private void <OnBattleUnitDeath>b__5_0(BattleUnit unit) { } */
    $OnBattleUnitDeath$b__5_0(unit: BattleUnit): void {
        this.AddEnemyBattleUnit(unit, true, true);
    }
}
