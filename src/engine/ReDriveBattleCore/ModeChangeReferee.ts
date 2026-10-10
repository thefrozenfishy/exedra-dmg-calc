// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import type { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import type { QuestEnemyModeChangeMstModel } from "./Model/QuestEnemyModeChangeMstModel";

// ---- ReDriveBattleCore.ModeChangeReferee  (TypeDefIndex 440, public class) ----
export class ModeChangeReferee {
    /** 0x10 private List<ModeChangeReferee.ModeChangeInfo> modeChangeInfoList */
    modeChangeInfoList: List<ModeChangeReferee_ModeChangeInfo> = null!;
    /** 0x18 private int currentModeChangeStep */
    currentModeChangeStep: int = 0;
    get ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this.get_ModeChangeInfoList(); }
    get CurrentModeChangeStep(): int { return this.get_CurrentModeChangeStep(); }
    /** @rva 0x730C50  public List<ModeChangeReferee.ModeChangeInfo> get_ModeChangeInfoList() { } */
    get_ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this.modeChangeInfoList; /* asm: mov rax, qword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x763820  public int get_CurrentModeChangeStep() { } */
    get_CurrentModeChangeStep(): int { return this.currentModeChangeStep; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x149FEA0  public void Init(int questStageMstId, int wave, List<BattleUnit> enemyList) { } */
    Init(questStageMstId: int, wave: int, enemyList: List<BattleUnit>): void { return notPorted("ModeChangeReferee.Init", 0x149FEA0); }
    /** @rva 0x149F960  public ValueTuple<bool, BattleUnit, int> CanModeChange(List<BattleUnit> enemyList) { } */
    CanModeChange(enemyList: List<BattleUnit>): any /* ValueTuple<bool, BattleUnit, int> */ { return notPorted("ModeChangeReferee.CanModeChange", 0x149F960); }
    /** @rva 0x149FCA0  public ModeChangeReferee.ModeChangeInfo GetCurrentModeChangeInfo() { } */
    GetCurrentModeChangeInfo(): ModeChangeReferee_ModeChangeInfo { return notPorted("ModeChangeReferee.GetCurrentModeChangeInfo", 0x149FCA0); }
    /** @rva 0x149FC90  public void ExecuteModeChange() { } */
    ExecuteModeChange(): void { return notPorted("ModeChangeReferee.ExecuteModeChange", 0x149FC90); }
    /** @rva 0x149FD30  public int GetNextModeChangeDamageCutDamage(BattleUnit unit, int damage) { } */
    GetNextModeChangeDamageCutDamage(unit: BattleUnit, damage: int): int { return notPorted("ModeChangeReferee.GetNextModeChangeDamageCutDamage", 0x149FD30); }
    /** @rva 0x14A05F0  public static List<QuestEnemyAppearanceMstModel> RemoveModeChangeFirstOther(List<QuestEnemyAppearanceMstModel> questEnemyAppearanceMstModels) { } */
    static RemoveModeChangeFirstOther(questEnemyAppearanceMstModels: List<QuestEnemyAppearanceMstModel>): List<QuestEnemyAppearanceMstModel> { return notPorted("ModeChangeReferee.RemoveModeChangeFirstOther", 0x14A05F0); }
    /** @rva 0x14A0740  public void .ctor() { } */
    ctor(): this { return notPorted("ModeChangeReferee..ctor", 0x14A0740); }
    /** @rva 0x14A0720  private bool <CanModeChange>b__9_2(ModeChangeReferee.ModeChangeInfo info) { } */
    $CanModeChange$b__9_2(info: ModeChangeReferee_ModeChangeInfo): boolean { return notPorted("ModeChangeReferee.<CanModeChange>b__9_2", 0x14A0720); }
    /** @rva 0x130FBD0  private bool <GetCurrentModeChangeInfo>b__10_0(ModeChangeReferee.ModeChangeInfo info) { } */
    $GetCurrentModeChangeInfo$b__10_0(info: ModeChangeReferee_ModeChangeInfo): boolean { return notPorted("ModeChangeReferee.<GetCurrentModeChangeInfo>b__10_0", 0x130FBD0); }
    /** @rva 0x14A0720  private bool <GetNextModeChangeDamageCutDamage>b__12_0(ModeChangeReferee.ModeChangeInfo info) { } */
    $GetNextModeChangeDamageCutDamage$b__12_0(info: ModeChangeReferee_ModeChangeInfo): boolean { return notPorted("ModeChangeReferee.<GetNextModeChangeDamageCutDamage>b__12_0", 0x14A0720); }
}

// ---- ReDriveBattleCore.ModeChangeReferee.ModeChangeType  (TypeDefIndex 434, public enum) ----
export const ModeChangeReferee_ModeChangeType = {
    None: 0,
    HpRatio: 1,
} as const;
export type ModeChangeReferee_ModeChangeType = (typeof ModeChangeReferee_ModeChangeType)[keyof typeof ModeChangeReferee_ModeChangeType];

// ---- ReDriveBattleCore.ModeChangeReferee.ModeChangeInfo  (TypeDefIndex 435, public class) ----
export class ModeChangeReferee_ModeChangeInfo {
    /** 0x10 private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x14 private int <Step>k__BackingField */
    _Step: int = 0;
    /** 0x18 private ModeChangeReferee.ModeChangeType <Type>k__BackingField */
    _Type: ModeChangeReferee_ModeChangeType = 0 as ModeChangeReferee_ModeChangeType;
    /** 0x1C private int <ThresholdValue>k__BackingField */
    _ThresholdValue: int = 0;
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get Step(): int { return this.get_Step(); }
    set Step(v: int) { this.set_Step(v); }
    get Type(): ModeChangeReferee_ModeChangeType { return this.get_Type(); }
    set Type(v: ModeChangeReferee_ModeChangeType) { this.set_Type(v); }
    get ThresholdValue(): int { return this.get_ThresholdValue(); }
    set ThresholdValue(v: int) { this.set_ThresholdValue(v); }
    /** @rva 0x7364F0  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_Step() { } */
    get_Step(): int { return this._Step; /* auto-property */ }
    /** @rva 0x803540  public void set_Step(int value) { } */
    set_Step(value: int): void { this._Step = value; /* auto-property */ }
    /** @rva 0x763820  public ModeChangeReferee.ModeChangeType get_Type() { } */
    get_Type(): ModeChangeReferee_ModeChangeType { return this._Type; /* auto-property */ }
    /** @rva 0x8A2240  public void set_Type(ModeChangeReferee.ModeChangeType value) { } */
    set_Type(value: ModeChangeReferee_ModeChangeType): void { this._Type = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_ThresholdValue() { } */
    get_ThresholdValue(): int { return this._ThresholdValue; /* auto-property */ }
    /** @rva 0x7F9820  public void set_ThresholdValue(int value) { } */
    set_ThresholdValue(value: int): void { this._ThresholdValue = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x149F8F0  public void .ctor(QuestEnemyModeChangeMstModel mstModel) { } */
    ctor$QuestEnemyModeChangeMstModel(mstModel: QuestEnemyModeChangeMstModel): this { return notPorted("ModeChangeReferee_ModeChangeInfo..ctor", 0x149F8F0); }
}
