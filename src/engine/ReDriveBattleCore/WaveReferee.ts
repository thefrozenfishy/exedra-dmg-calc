// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { EnemyInfo } from "../Network/Definition/SoloRaid/EnemyInfo";
import type { QuestEnemyWaveMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyWaveMstRecord";
import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import { QuestEnemyAppearanceMstReader } from "./Reader/QuestEnemyAppearanceMstReader";
import { QuestEnemyWaveMstModel } from "./Model/QuestEnemyWaveMstModel";
import { QuestEnemyAppearanceMstModel } from "./Model/QuestEnemyAppearanceMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { maxBy, notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { AdditionalEnemyReferee } from "./AdditionalEnemyReferee";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.WaveReferee  (TypeDefIndex 491, public class) ----
export class WaveReferee {
    /** 0x0 public static readonly int NoneWaveValue */
    static NoneWaveValue: int = 0;
    /** 0x10 private WaveReferee.ModeType mode */
    mode: WaveReferee_ModeType = 0 as WaveReferee_ModeType;
    /** 0x14 private int questStageMstId */
    questStageMstId: int = 0;
    /** 0x18 private int maxWave */
    maxWave: int = 0;
    /** 0x1C private int currentWave */
    currentWave: int = 0;
    /** 0x20 private bool isDuringTransition */
    isDuringTransition: boolean = false;
    get Mode(): WaveReferee_ModeType { return this.get_Mode(); }
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    get MaxWave(): int { return this.get_MaxWave(); }
    get CurrentWave(): int { return this.get_CurrentWave(); }
    get HasNextWave(): boolean { return this.get_HasNextWave(); }
    get IsDuringTransition(): boolean { return this.get_IsDuringTransition(); }
    /** @rva 0x7364F0  public WaveReferee.ModeType get_Mode() { } */
    get_Mode(): WaveReferee_ModeType { return this.mode; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x803350  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this.questStageMstId; /* asm: mov eax, dword ptr [rcx + 0x14]; ret */ }
    /** @rva 0x763820  public int get_MaxWave() { } */
    get_MaxWave(): int { return this.maxWave; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x7F9800  public int get_CurrentWave() { } */
    get_CurrentWave(): int { return this.currentWave; /* asm: mov eax, dword ptr [rcx + 0x1c]; ret */ }
    /** @rva 0x15D2830  public bool get_HasNextWave() { } */
    get_HasNextWave(): boolean { return this.currentWave < this.maxWave; }
    /** @rva 0x8AC0D0  public bool get_IsDuringTransition() { } */
    get_IsDuringTransition(): boolean { return this.isDuringTransition; /* asm: movzx eax, byte ptr [rcx + 0x20]; ret */ }
    /** @rva 0x15D2490  public void Init(int questStageMstId, int initialWave = 1) { } */
    Init(questStageMstId: int, initialWave?: int /* = 1 */): void {
        this.questStageMstId = questStageMstId;
        const list = [...BattleMstReaderBase.get_Instance<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(QuestEnemyAppearanceMstModel)
            .GetModelList(mst => this.$Init$b__19_0(mst))];
        if (list.every(mst => WaveReferee.NoneWaveValue < mst.Wave)) { // <>c.b__19_1
            this.mode = 1 as WaveReferee_ModeType;
            this.maxWave = maxBy(list, mst => mst.Wave); // <>c.b__19_2
            this.currentWave = initialWave ?? 1;
        }
    }
    /** @rva 0x15D2120  public void BeginTransition() { } */
    BeginTransition(): void {
        if (this.mode !== 0) this.isDuringTransition = true;
    }
    /** @rva 0xB999E0  public void EndTransition() { } */
    EndTransition(): void { this.isDuringTransition = false; /* asm: mov byte ptr [rcx + 0x20], 0; ret */ }
    /** @rva 0x15D27B0  public void ShiftNextWave() { } */
    ShiftNextWave(): void {
        if (this.mode !== 0 && this.isDuringTransition && this.currentWave < this.maxWave) this.currentWave = this.currentWave + 1;
    }
    /** @rva 0x15D22E0  public List<BattleUnit> CreateEnemyUnitList(AdditionalEnemyReferee additionalEnemyReferee) { } */
    CreateEnemyUnitList(additionalEnemyReferee: AdditionalEnemyReferee): List<BattleUnit> {
        const wave = this.mode === 1 ? this.currentWave : WaveReferee.NoneWaveValue; // <>c__DisplayClass23_0
        const models = QuestEnemyAppearanceMstReader.GetModelListForBattleStart(this.questStageMstId, wave);
        const waveMst = BattleMstReaderBase.get_Instance<QuestEnemyWaveMstModel, QuestEnemyWaveMstRecord, int>(QuestEnemyWaveMstModel)
            .GetModel(model => model.questStageMstId === this.questStageMstId && model.wave === wave); // b__0
        if (waveMst == null || waveMst.LinkHpType !== 1) {
            additionalEnemyReferee.UnregisterEndlessEnemy();
            return additionalEnemyReferee.GetAdditionalBattleUnitList$ListQuestEnemyAppearanceMstModel(models);
        }
        additionalEnemyReferee.RegisterEndlessEnemy(models, 0);
        return additionalEnemyReferee.CreateEndlessEnemyUnitListForBattleStart();
    }
    /** @rva 0x15D2130  public List<BattleUnit> CreateEnemyUnitListFromEnemyInfos(AdditionalEnemyReferee additionalEnemyReferee, EnemyInfo[] enemyInfos, int nextEnemyIndex) { } */
    CreateEnemyUnitListFromEnemyInfos(additionalEnemyReferee: AdditionalEnemyReferee, enemyInfos: EnemyInfo[], nextEnemyIndex: int): List<BattleUnit> {
        const wave = this.mode === 1 ? this.currentWave : WaveReferee.NoneWaveValue; // <>c__DisplayClass24_0
        const models = QuestEnemyAppearanceMstReader.GetModelListForBattleStart(this.questStageMstId, wave);
        const waveMst = BattleMstReaderBase.get_Instance<QuestEnemyWaveMstModel, QuestEnemyWaveMstRecord, int>(QuestEnemyWaveMstModel)
            .GetModel(model => model.questStageMstId === this.questStageMstId && model.wave === wave); // b__0
        const isEndless = waveMst != null && waveMst.LinkHpType === 1;
        if (!isEndless) additionalEnemyReferee.UnregisterEndlessEnemy();
        else additionalEnemyReferee.RegisterEndlessEnemy(models, nextEnemyIndex);
        return additionalEnemyReferee.CreateEnemyUnitListFromEnemyInfo(enemyInfos, isEndless); // inlined in the game
    }
    /** @rva 0x15D27D0  public void .ctor() { } */
    ctor(): this {
        this.maxWave = WaveReferee.NoneWaveValue;
        this.currentWave = WaveReferee.NoneWaveValue;
        return this;
    }
    /** @rva 0xE287B0  private bool <Init>b__19_0(QuestEnemyAppearanceMstRecord mst) { } */
    $Init$b__19_0(mst: QuestEnemyAppearanceMstRecord): boolean { return mst.questStageMstId === this.questStageMstId; }
}

// ---- ReDriveBattleCore.WaveReferee.ModeType  (TypeDefIndex 487, public enum) ----
export const WaveReferee_ModeType = {
    None: 0,
    Order: 1,
} as const;
export type WaveReferee_ModeType = (typeof WaveReferee_ModeType)[keyof typeof WaveReferee_ModeType];
