// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import type { EnemyInfo } from "../Network/Definition/SoloRaid/EnemyInfo";
import { BattleUnit } from "./BattleUnit";
import { QuestEnemyAppearanceParameter } from "./QuestEnemyAppearanceParameter";
import { KnockDownAdditionalEnemyCondition } from "./KnockDownAdditionalEnemyCondition";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { indexHint, minBy, singleOrDefault } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { AdditionalEnemyCondition } from "./AdditionalEnemyCondition";

// ---- ReDriveBattleCore.AdditionalEnemyReferee  (TypeDefIndex 307, public class) ----
export class AdditionalEnemyReferee {
    /** 0x10 private List<AdditionalEnemyReferee.AdditionalEnemyUnit> additionalEnemyUnitList */
    additionalEnemyUnitList: List<AdditionalEnemyReferee_AdditionalEnemyUnit> = null!;
    /** 0x18 private int minUnitId */
    minUnitId: int = 0;
    /** 0x20 private Dictionary<int, int> summonQuestEnemyAppearanceMstIdDic */
    summonQuestEnemyAppearanceMstIdDic: Dictionary<int, int> = null!;
    /** 0x28 private List<int> endlessEnemySourceList */
    endlessEnemySourceList: List<int> = null!;
    /** 0x30 private int endlessEnemyIndex */
    endlessEnemyIndex: int = 0;
    /** 0x38 private List<int> endlessEnemyPositionIdList */
    endlessEnemyPositionIdList: List<int> = null!;
    get EndlessEnemyIndex(): int { return this.get_EndlessEnemyIndex(); }
    /** @rva 0x13882A0  public void Initialize(int stageMstId, int wave, List<BattleUnit> enemyUnitList) { } */
    Initialize(stageMstId: int, wave: int, enemyUnitList: List<BattleUnit>): void {
        // <>c__DisplayClass5_0 { stageMstId, wave, models, enemyUnitList }
        this.minUnitId = minBy(enemyUnitList, u => u.Id); // <>c.b__5_0
        const models = [...BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModelList(indexHint(r => r.questStageMstId === stageMstId && r.wave === wave, "questStageMstId", stageMstId))]; // DisplayClass5_0.b__1
        this.additionalEnemyUnitList.length = 0;
        this.summonQuestEnemyAppearanceMstIdDic.clear();
        for (const model of models) {
            if (model.ConditionType !== 2) {
                if (model.ConditionType === 3 && model.SummonId > 0) {
                    if (this.summonQuestEnemyAppearanceMstIdDic.has(model.SummonId)) continue;
                    this.summonQuestEnemyAppearanceMstIdDic.set(model.SummonId, model.QuestEnemyAppearanceMstId); // Dictionary.Add
                }
                continue;
            }
            const condition = new KnockDownAdditionalEnemyCondition().ctor$int(model.ConditionValue);
            // <Initialize>g__GetKnockDownAdditionalEnemyPositionId|2 (DisplayClass5_1 { conditionValue, foundId, b__4 cache })
            let mst = model;
            let conditionValue = mst.ConditionValue;
            let foundId = 0;
            for (;;) {
                if (foundId !== 0) break;
                const target = singleOrDefault(models, m => m.QuestEnemyAppearanceMstId === conditionValue); // b__4
                if (target == null) break;
                if (!target.IsBattleStartMember) { mst = target; conditionValue = mst.ConditionValue; continue; }
                foundId = target.QuestEnemyAppearanceMstId;
            }
            const unit = singleOrDefault(enemyUnitList, u => { // b__3
                const p = u.BattleParameter;
                if (p == null) return false;
                if (!(p instanceof QuestEnemyAppearanceParameter)) throw new TypeError("InvalidCastException");
                return p.QuestEnemyAppearanceMstId === foundId;
            });
            if (unit == null) throw new Error(`${model.QuestEnemyAppearanceMstId} There is no Knock Down Enemy`);
            const positionId = unit.PositionId;
            const entry = new AdditionalEnemyReferee_AdditionalEnemyUnit();
            entry._QuestEnemyAppearanceMstId = model.QuestEnemyAppearanceMstId;
            entry._PositionId = positionId;
            entry._AppearanceCondition = condition;
            this.additionalEnemyUnitList.push(entry);
        }
    }
    /** @rva 0x1386EE0  public void CheckTargetEnemy(BattleUnit deathUnit) { } */
    CheckTargetEnemy(deathUnit: BattleUnit): void {
        if (deathUnit == null || deathUnit.isCharacter) return;
        for (const entry of this.additionalEnemyUnitList) {
            if (entry._IsDisable) continue;
            const condition = entry._AppearanceCondition;
            if (condition == null || condition.constructor !== KnockDownAdditionalEnemyCondition) continue;
            const param = deathUnit.BattleParameter;
            if (param == null || param.constructor !== QuestEnemyAppearanceParameter) continue;
            if ((condition as KnockDownAdditionalEnemyCondition).targetEnemyAppearanceMstId === (param as QuestEnemyAppearanceParameter).QuestEnemyAppearanceMstId) {
                (condition as KnockDownAdditionalEnemyCondition).isFulfill = true;
            }
        }
    }
    /** @rva 0x1387A80  public List<BattleUnit> GetAdditionalBattleUnitList(in List<BattleUnit> enemyUnitList) { } */
    GetAdditionalBattleUnitList$ListBattleUnit(enemyUnitList: List<BattleUnit>): List<BattleUnit> {
        const positions = enemyUnitList.filter(unit => unit.HP > 0 || unit.CurrentHpGaugeCount > 1) // <>c.b__7_0
            .map(unit => unit.PositionId); // <>c.b__7_1
        const list = this.GetFulfillAdditionalBattleUnitList(positions);
        if (!(list.length > 0)) return null!;
        return list;
    }
    /** @rva 0x1387F70  private List<BattleUnit> GetFulfillAdditionalBattleUnitList(in List<int> positionIdList) { } */
    GetFulfillAdditionalBattleUnitList(positionIdList: List<int>): List<BattleUnit> {
        const result: List<BattleUnit> = [];
        for (const entry of this.additionalEnemyUnitList) {
            if (entry._IsDisable) continue;
            if (!entry._AppearanceCondition.IsFulfill) continue;
            if (!positionIdList.includes(entry._PositionId)) {
                positionIdList.push(entry._PositionId);
                entry._IsDisable = true;
                result.push(this.CreateAdditionalBattleUnit(entry._QuestEnemyAppearanceMstId, entry._PositionId));
            } else {
                entry._IsDisable = true; // position occupied: the game drops this additional enemy
            }
        }
        return result;
    }
    /** @rva 0x1387CF0  public List<BattleUnit> GetAdditionalBattleUnitList(List<QuestEnemyAppearanceMstModel> mstList) { } */
    GetAdditionalBattleUnitList$ListQuestEnemyAppearanceMstModel(mstList: List<QuestEnemyAppearanceMstModel>): List<BattleUnit> {
        if (mstList == null) return null!;
        const result: List<BattleUnit> = [];
        let positionId = 3 - Math.trunc(mstList.length / 2);
        for (const mst of mstList) {
            const id = mst.QuestEnemyAppearanceMstId;
            this.minUnitId = this.minUnitId - 1;
            result.push(new BattleUnit().ctor$int_int_int(this.minUnitId, id, positionId));
            positionId = positionId + 1;
        }
        return result;
    }
    /** @rva 0x1387150  private BattleUnit CreateAdditionalBattleUnit(int questEnemyAppearanceMstId, int positionId) { } */
    CreateAdditionalBattleUnit(questEnemyAppearanceMstId: int, positionId: int): BattleUnit {
        this.minUnitId = this.minUnitId - 1;
        return new BattleUnit().ctor$int_int_int(this.minUnitId, questEnemyAppearanceMstId, positionId);
    }
    /** @rva 0x13870B0  public BattleUnit CreateAdditionalBattleUnitForSummon(int summonId, int positionId) { } */
    CreateAdditionalBattleUnitForSummon(summonId: int, positionId: int): BattleUnit {
        const id = this.summonQuestEnemyAppearanceMstIdDic.get(summonId) ?? 0; // TryGetValue
        if (id !== 0) return this.CreateAdditionalBattleUnit(id, positionId);
        return null!;
    }
    /** @rva 0x13873B0  public List<BattleUnit> CreateEnemyUnitListFromEnemyInfo(EnemyInfo[] enemyInfos, bool isEndlessSpawn) { } */
    CreateEnemyUnitListFromEnemyInfo(enemyInfos: EnemyInfo[], isEndlessSpawn: boolean): List<BattleUnit> {
        const result: List<BattleUnit> = [];
        if (enemyInfos == null) return result;
        for (let i = 0; i < enemyInfos.length; i++) {
            const info = enemyInfos[i];
            const mstId = info.questEnemyAppearanceMstId;
            const positionId = info.enemyIndex; // enemyIndex is used as the position
            this.minUnitId = this.minUnitId - 1;
            result.push(new BattleUnit().ctor$int_int_int(this.minUnitId, mstId, positionId));
            if (isEndlessSpawn) this.endlessEnemyPositionIdList.push(positionId);
        }
        return result;
    }
    /** @rva 0x75ED60  public int get_EndlessEnemyIndex() { } */
    get_EndlessEnemyIndex(): int { return this.endlessEnemyIndex; /* asm: mov eax, dword ptr [rcx + 0x30]; ret */ }
    /** @rva 0x13888B0  public void RegisterEndlessEnemy(List<QuestEnemyAppearanceMstModel> appearMstList, int initialEndlessEnemyIndex = 0) { } */
    RegisterEndlessEnemy(appearMstList: List<QuestEnemyAppearanceMstModel>, initialEndlessEnemyIndex?: int /* = 0 */): void {
        this.endlessEnemySourceList = appearMstList.map(m => m.QuestEnemyAppearanceMstId); // <>c.b__18_0
        this.endlessEnemyIndex = initialEndlessEnemyIndex ?? 0;
        this.endlessEnemyPositionIdList.length = 0;
    }
    /** @rva 0x1388A30  public void UnregisterEndlessEnemy() { } */
    UnregisterEndlessEnemy(): void {
        this.endlessEnemySourceList.length = 0;
        this.endlessEnemyIndex = 0;
        this.endlessEnemyPositionIdList.length = 0;
    }
    /** @rva 0x13871D0  public List<BattleUnit> CreateEndlessEnemyUnitListForBattleStart() { } */
    CreateEndlessEnemyUnitListForBattleStart(): List<BattleUnit> {
        let positionId = 1;
        const result: List<BattleUnit> = [];
        for (;;) {
            const model = this.GetNextEndlessEnemyAppearModel();
            if (model == null) break;
            const id = model.QuestEnemyAppearanceMstId;
            this.minUnitId = this.minUnitId - 1;
            result.push(new BattleUnit().ctor$int_int_int(this.minUnitId, id, positionId));
            this.endlessEnemyPositionIdList.push(positionId);
            positionId = positionId + 1;
            if (5 < positionId) return result;
        }
        return result;
    }
    /** @rva 0x1387580  public List<BattleUnit> CreateSuppliedEndlessEnemyUnitList(List<BattleUnit> enemyUnitList) { } */
    CreateSuppliedEndlessEnemyUnitList(enemyUnitList: List<BattleUnit>): List<BattleUnit> {
        if (!(this.endlessEnemySourceList.length > 0) || !(this.endlessEnemyPositionIdList.length > 0)) return null!;
        const alive = enemyUnitList.filter(unit => unit.HP > 0 || unit.CurrentHpGaugeCount > 1); // <>c.b__21_0
        if (!(0 < 5 - alive.length)) return null!;
        const occupied = alive.map(unit => unit.PositionId); // <>c.b__21_1 (lazy Select, read while enumerating)
        const result: List<BattleUnit> = [];
        for (const positionId of this.endlessEnemyPositionIdList.filter(id => !occupied.includes(id))) { // DisplayClass21_0.b__2
            const model = this.GetNextEndlessEnemyAppearModel();
            if (model == null) throw new TypeError("NullReferenceException");
            result.push(this.CreateAdditionalBattleUnit(model.QuestEnemyAppearanceMstId, positionId));
        }
        return result;
    }
    /** @rva 0x13881C0  private QuestEnemyAppearanceMstModel GetNextEndlessEnemyAppearModel() { } */
    GetNextEndlessEnemyAppearModel(): QuestEnemyAppearanceMstModel {
        if (this.endlessEnemySourceList.length <= this.endlessEnemyIndex) this.endlessEnemyIndex = 0;
        const id = this.endlessEnemySourceList[this.endlessEnemyIndex];
        if (id === undefined) throw new RangeError("ArgumentOutOfRangeException");
        const model = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel).GetModelByKey(id);
        this.endlessEnemyIndex = (this.endlessEnemyIndex + 1) % this.endlessEnemySourceList.length;
        return model;
    }
    /** @rva 0x1388A90  public void .ctor() { } */
    ctor(): this {
        this.additionalEnemyUnitList = [];
        this.summonQuestEnemyAppearanceMstIdDic = new Map();
        this.endlessEnemySourceList = [];
        this.endlessEnemyPositionIdList = [];
        return this;
    }
}

// ---- ReDriveBattleCore.AdditionalEnemyReferee.ConditionType  (TypeDefIndex 301, public enum) ----
export const AdditionalEnemyReferee_ConditionType = {
    None: 0,
    TimeElapsed: 1,
    KnockDown: 2,
    Summon: 3,
} as const;
export type AdditionalEnemyReferee_ConditionType = (typeof AdditionalEnemyReferee_ConditionType)[keyof typeof AdditionalEnemyReferee_ConditionType];

// ---- ReDriveBattleCore.AdditionalEnemyReferee.AdditionalEnemyUnit  (TypeDefIndex 302, public class) ----
export class AdditionalEnemyReferee_AdditionalEnemyUnit {
    /** 0x10 private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x14 private int <PositionId>k__BackingField */
    _PositionId: int = 0;
    /** 0x18 private AdditionalEnemyCondition <AppearanceCondition>k__BackingField */
    _AppearanceCondition: AdditionalEnemyCondition = null!;
    /** 0x20 private bool <IsDisable>k__BackingField */
    _IsDisable: boolean = false;
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get PositionId(): int { return this.get_PositionId(); }
    set PositionId(v: int) { this.set_PositionId(v); }
    get AppearanceCondition(): AdditionalEnemyCondition { return this.get_AppearanceCondition(); }
    set AppearanceCondition(v: AdditionalEnemyCondition) { this.set_AppearanceCondition(v); }
    get IsDisable(): boolean { return this.get_IsDisable(); }
    set IsDisable(v: boolean) { this.set_IsDisable(v); }
    /** @rva 0x7364F0  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_PositionId() { } */
    get_PositionId(): int { return this._PositionId; /* auto-property */ }
    /** @rva 0x803540  public void set_PositionId(int value) { } */
    set_PositionId(value: int): void { this._PositionId = value; /* auto-property */ }
    /** @rva 0x733E90  public AdditionalEnemyCondition get_AppearanceCondition() { } */
    get_AppearanceCondition(): AdditionalEnemyCondition { return this._AppearanceCondition; /* auto-property */ }
    /** @rva 0x736AB0  public void set_AppearanceCondition(AdditionalEnemyCondition value) { } */
    set_AppearanceCondition(value: AdditionalEnemyCondition): void { this._AppearanceCondition = value; /* auto-property */ }
    /** @rva 0x8AC0D0  public bool get_IsDisable() { } */
    get_IsDisable(): boolean { return this._IsDisable; /* auto-property */ }
    /** @rva 0x8AC0E0  public void set_IsDisable(bool value) { } */
    set_IsDisable(value: boolean): void { this._IsDisable = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1388C20  public void .ctor(QuestEnemyAppearanceMstModel questEnemyAppearanceMst, int positionId, AdditionalEnemyCondition additionalEnemyAppearanceCondition) { } */
    ctor$QuestEnemyAppearanceMstModel_int_AdditionalEnemyCondition(questEnemyAppearanceMst: QuestEnemyAppearanceMstModel, positionId: int, additionalEnemyAppearanceCondition: AdditionalEnemyCondition): this {
        this._QuestEnemyAppearanceMstId = questEnemyAppearanceMst.get_QuestEnemyAppearanceMstId(); // null -> NullReferenceException
        this._PositionId = positionId;
        this._AppearanceCondition = additionalEnemyAppearanceCondition;
        return this;
    }
    /** @rva 0x1388BD0  public void .ctor(int questEnemyAppearanceMstId, int positionId, AdditionalEnemyCondition additionalEnemyAppearanceCondition) { } */
    ctor$int_int_AdditionalEnemyCondition(questEnemyAppearanceMstId: int, positionId: int, additionalEnemyAppearanceCondition: AdditionalEnemyCondition): this {
        this._QuestEnemyAppearanceMstId = questEnemyAppearanceMstId;
        this._PositionId = positionId;
        this._AppearanceCondition = additionalEnemyAppearanceCondition;
        return this;
    }
    /** @rva 0x8F3F40  public void Disable() { } */
    Disable(): void { this._IsDisable = true; /* asm: mov byte ptr [rcx + 0x20], 1; ret */ }
}
