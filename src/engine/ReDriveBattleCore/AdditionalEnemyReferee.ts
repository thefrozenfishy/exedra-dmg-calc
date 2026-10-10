// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { AdditionalEnemyCondition } from "./AdditionalEnemyCondition";
import type { BattleUnit } from "./BattleUnit";
import type { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";

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
    /** @rva 0x1376F70  public void Initialize(int stageMstId, int wave, List<BattleUnit> enemyUnitList) { } */
    Initialize(stageMstId: int, wave: int, enemyUnitList: List<BattleUnit>): void { return notPorted("AdditionalEnemyReferee.Initialize", 0x1376F70); }
    /** @rva 0x1375BB0  public void CheckTargetEnemy(BattleUnit deathUnit) { } */
    CheckTargetEnemy(deathUnit: BattleUnit): void { return notPorted("AdditionalEnemyReferee.CheckTargetEnemy", 0x1375BB0); }
    /** @rva 0x1376750  public List<BattleUnit> GetAdditionalBattleUnitList(in List<BattleUnit> enemyUnitList) { } */
    GetAdditionalBattleUnitList$ListBattleUnit(enemyUnitList: List<BattleUnit>): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.GetAdditionalBattleUnitList", 0x1376750); }
    /** @rva 0x1376C40  private List<BattleUnit> GetFulfillAdditionalBattleUnitList(in List<int> positionIdList) { } */
    GetFulfillAdditionalBattleUnitList(positionIdList: List<int>): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.GetFulfillAdditionalBattleUnitList", 0x1376C40); }
    /** @rva 0x13769C0  public List<BattleUnit> GetAdditionalBattleUnitList(List<QuestEnemyAppearanceMstModel> mstList) { } */
    GetAdditionalBattleUnitList$ListQuestEnemyAppearanceMstModel(mstList: List<QuestEnemyAppearanceMstModel>): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.GetAdditionalBattleUnitList", 0x13769C0); }
    /** @rva 0x1375E20  private BattleUnit CreateAdditionalBattleUnit(int questEnemyAppearanceMstId, int positionId) { } */
    CreateAdditionalBattleUnit(questEnemyAppearanceMstId: int, positionId: int): BattleUnit { return notPorted("AdditionalEnemyReferee.CreateAdditionalBattleUnit", 0x1375E20); }
    /** @rva 0x1375D80  public BattleUnit CreateAdditionalBattleUnitForSummon(int summonId, int positionId) { } */
    CreateAdditionalBattleUnitForSummon(summonId: int, positionId: int): BattleUnit { return notPorted("AdditionalEnemyReferee.CreateAdditionalBattleUnitForSummon", 0x1375D80); }
    /** @rva 0x1376080  public List<BattleUnit> CreateEnemyUnitListFromEnemyInfo(EnemyInfo[] enemyInfos, bool isEndlessSpawn) { } */
    CreateEnemyUnitListFromEnemyInfo(enemyInfos: any /* EnemyInfo */[], isEndlessSpawn: boolean): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.CreateEnemyUnitListFromEnemyInfo", 0x1376080); }
    /** @rva 0x75ED60  public int get_EndlessEnemyIndex() { } */
    get_EndlessEnemyIndex(): int { return this.endlessEnemyIndex; /* asm: mov eax, dword ptr [rcx + 0x30]; ret */ }
    /** @rva 0x1377580  public void RegisterEndlessEnemy(List<QuestEnemyAppearanceMstModel> appearMstList, int initialEndlessEnemyIndex = 0) { } */
    RegisterEndlessEnemy(appearMstList: List<QuestEnemyAppearanceMstModel>, initialEndlessEnemyIndex?: int /* = 0 */): void { return notPorted("AdditionalEnemyReferee.RegisterEndlessEnemy", 0x1377580); }
    /** @rva 0x1377700  public void UnregisterEndlessEnemy() { } */
    UnregisterEndlessEnemy(): void { return notPorted("AdditionalEnemyReferee.UnregisterEndlessEnemy", 0x1377700); }
    /** @rva 0x1375EA0  public List<BattleUnit> CreateEndlessEnemyUnitListForBattleStart() { } */
    CreateEndlessEnemyUnitListForBattleStart(): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.CreateEndlessEnemyUnitListForBattleStart", 0x1375EA0); }
    /** @rva 0x1376250  public List<BattleUnit> CreateSuppliedEndlessEnemyUnitList(List<BattleUnit> enemyUnitList) { } */
    CreateSuppliedEndlessEnemyUnitList(enemyUnitList: List<BattleUnit>): List<BattleUnit> { return notPorted("AdditionalEnemyReferee.CreateSuppliedEndlessEnemyUnitList", 0x1376250); }
    /** @rva 0x1376E90  private QuestEnemyAppearanceMstModel GetNextEndlessEnemyAppearModel() { } */
    GetNextEndlessEnemyAppearModel(): QuestEnemyAppearanceMstModel { return notPorted("AdditionalEnemyReferee.GetNextEndlessEnemyAppearModel", 0x1376E90); }
    /** @rva 0x1377760  public void .ctor() { } */
    ctor(): this { return notPorted("AdditionalEnemyReferee..ctor", 0x1377760); }
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
    /** @rva 0x13778F0  public void .ctor(QuestEnemyAppearanceMstModel questEnemyAppearanceMst, int positionId, AdditionalEnemyCondition additionalEnemyAppearanceCondition) { } */
    ctor$QuestEnemyAppearanceMstModel_int_AdditionalEnemyCondition(questEnemyAppearanceMst: QuestEnemyAppearanceMstModel, positionId: int, additionalEnemyAppearanceCondition: AdditionalEnemyCondition): this { return notPorted("AdditionalEnemyReferee_AdditionalEnemyUnit..ctor", 0x13778F0); }
    /** @rva 0x13778A0  public void .ctor(int questEnemyAppearanceMstId, int positionId, AdditionalEnemyCondition additionalEnemyAppearanceCondition) { } */
    ctor$int_int_AdditionalEnemyCondition(questEnemyAppearanceMstId: int, positionId: int, additionalEnemyAppearanceCondition: AdditionalEnemyCondition): this {
        this._QuestEnemyAppearanceMstId = questEnemyAppearanceMstId;
        this._PositionId = positionId;
        this._AppearanceCondition = additionalEnemyAppearanceCondition;
        return this;
    }
    /** @rva 0x8F3F90  public void Disable() { } */
    Disable(): void { this._IsDisable = true; /* asm: mov byte ptr [rcx + 0x20], 1; ret */ }
}
