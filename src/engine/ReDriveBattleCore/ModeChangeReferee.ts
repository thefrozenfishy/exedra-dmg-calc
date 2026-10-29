// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { QuestEnemyModeChangeMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyModeChangeMstRecord";
import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import { QuestEnemyModeChangeMstModel } from "./Model/QuestEnemyModeChangeMstModel";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { f32, first, indexHint, notPorted, orderBy } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

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
    /** @rva 0x14B0270  public void Init(int questStageMstId, int wave, List<BattleUnit> enemyList) { } */
    Init(questStageMstId: int, wave: int, enemyList: List<BattleUnit>): void {
        // <>c__DisplayClass8_0 { questStageMstId, wave, mainUnit }
        this.modeChangeInfoList.length = 0;
        this.currentModeChangeStep = 0;
        if (enemyList == null) return;
        if (!enemyList.some(u => u.IsMainTargetEnemy())) return; // <>c.b__8_0
        const mainUnit = first(enemyList, u => u.IsMainTargetEnemy()); // <>c.b__8_1
        const mains = BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModelList(indexHint(m => m.questStageMstId === questStageMstId && m.wave === wave && m.isMainTargetEnemy, "questStageMstId", questStageMstId)); // DisplayClass8_0.b__2
        if (mains == null) return;
        if (mains.length < 2) return;
        const modeChanges = orderBy([...mains].map(mst => BattleMstReaderBase.get_Instance<QuestEnemyModeChangeMstModel, QuestEnemyModeChangeMstRecord, int>(QuestEnemyModeChangeMstModel)
            .GetModel(r => r.questEnemyAppearanceMstId === mst.QuestEnemyAppearanceMstId)), // <>c.b__8_3 / DisplayClass8_1.b__6
            m => m.Step); // <>c.b__8_4
        for (const mc of modeChanges) {
            const info = new ModeChangeReferee_ModeChangeInfo(); // ctor(QuestEnemyModeChangeMstModel) inlined in the game
            info._QuestEnemyAppearanceMstId = mc.QuestEnemyAppearanceMstId;
            info._Step = mc.Step;
            info._Type = mc.Type as ModeChangeReferee_ModeChangeType;
            info._ThresholdValue = mc.ThresholdValue;
            this.modeChangeInfoList.push(info);
        }
        this.currentModeChangeStep = first(this.modeChangeInfoList, info => info.QuestEnemyAppearanceMstId === mainUnit.serializedEnemyParameterMstId).Step; // DisplayClass8_0.b__5
    }
    /** @rva 0x14AFD30  public ValueTuple<bool, BattleUnit, int> CanModeChange(List<BattleUnit> enemyList) { } */
    CanModeChange(enemyList: List<BattleUnit>): any /* ValueTuple<bool, BattleUnit, int> */ {
        if (this.modeChangeInfoList.length !== 0 && enemyList != null && enemyList.some(u => u.IsMainTargetEnemy())) { // <>c.b__9_0
            const unit = first(enemyList, u => u.IsMainTargetEnemy()); // <>c.b__9_1
            const info = this.modeChangeInfoList.find(i => this.$CanModeChange$b__9_2(i)) ?? null;
            if (info != null && info.Type === 1) {
                if (f32(f32(f32(unit.HP) / f32(unit.MaxHP)) * 1000) <= f32(info.ThresholdValue)) return [true, unit, info.Step];
            }
        }
        return [false, null, 0];
    }
    /** @rva 0x14B0070  public ModeChangeReferee.ModeChangeInfo GetCurrentModeChangeInfo() { } */
    GetCurrentModeChangeInfo(): ModeChangeReferee_ModeChangeInfo {
        return this.modeChangeInfoList.find(info => this.$GetCurrentModeChangeInfo$b__10_0(info)) ?? null!;
    }
    /** @rva 0x14B0060  public void ExecuteModeChange() { } */
    ExecuteModeChange(): void {
        this.currentModeChangeStep = this.currentModeChangeStep + 1; // asm: inc dword ptr [rcx + 0x18]
    }
    /** @rva 0x14B0100  public int GetNextModeChangeDamageCutDamage(BattleUnit unit, int damage) { } */
    GetNextModeChangeDamageCutDamage(unit: BattleUnit, damage: int): int {
        if (this.modeChangeInfoList.length === 0) return damage;
        if (this.GetCurrentModeChangeInfo() == null) return damage;
        const current = this.GetCurrentModeChangeInfo();
        if (current.QuestEnemyAppearanceMstId !== unit.serializedEnemyParameterMstId) return damage;
        const next = this.modeChangeInfoList.find(info => this.$GetNextModeChangeDamageCutDamage$b__12_0(info)) ?? null;
        if (next == null || next.Type !== 1) return damage;
        const threshold = Math.trunc((next.ThresholdValue * unit.MaxHP) / 1000.0); // double math
        if ((unit.HP - damage | 0) <= threshold) return unit.HP - threshold;
        return damage;
    }
    /** @rva 0x14B09C0  public static List<QuestEnemyAppearanceMstModel> RemoveModeChangeFirstOther(List<QuestEnemyAppearanceMstModel> questEnemyAppearanceMstModels) { } */
    static RemoveModeChangeFirstOther(questEnemyAppearanceMstModels: List<QuestEnemyAppearanceMstModel>): List<QuestEnemyAppearanceMstModel> {
        return questEnemyAppearanceMstModels.filter(mst => { // <>c.b__13_0
            const mc = BattleMstReaderBase.get_Instance<QuestEnemyModeChangeMstModel, QuestEnemyModeChangeMstRecord, int>(QuestEnemyModeChangeMstModel)
                .GetModel(r => r.questEnemyAppearanceMstId === mst.QuestEnemyAppearanceMstId); // DisplayClass13_0.b__1
            if (mc == null) return true;
            return mc.Step === 1;
        });
    }
    /** @rva 0x14B0B10  public void .ctor() { } */
    ctor(): this {
        this.modeChangeInfoList = [];
        return this;
    }
    /** @rva 0x14B0AF0  private bool <CanModeChange>b__9_2(ModeChangeReferee.ModeChangeInfo info) { } */
    $CanModeChange$b__9_2(info: ModeChangeReferee_ModeChangeInfo): boolean { return info.Step === this.currentModeChangeStep + 1; }
    /** @rva 0xB0B3E0  private bool <GetCurrentModeChangeInfo>b__10_0(ModeChangeReferee.ModeChangeInfo info) { } */
    $GetCurrentModeChangeInfo$b__10_0(info: ModeChangeReferee_ModeChangeInfo): boolean { return info.Step === this.currentModeChangeStep; }
    /** @rva 0x14B0AF0  private bool <GetNextModeChangeDamageCutDamage>b__12_0(ModeChangeReferee.ModeChangeInfo info) { } */
    $GetNextModeChangeDamageCutDamage$b__12_0(info: ModeChangeReferee_ModeChangeInfo): boolean { return info.Step === this.currentModeChangeStep + 1; }
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
    /** @rva 0x14AFCC0  public void .ctor(QuestEnemyModeChangeMstModel mstModel) { } */
    ctor$QuestEnemyModeChangeMstModel(mstModel: QuestEnemyModeChangeMstModel): this {
        if (mstModel == null) return this;
        this._QuestEnemyAppearanceMstId = mstModel.QuestEnemyAppearanceMstId;
        this._Step = mstModel.Step;
        this._Type = mstModel.Type as ModeChangeReferee_ModeChangeType;
        this._ThresholdValue = mstModel.ThresholdValue;
        return this;
    }
}
