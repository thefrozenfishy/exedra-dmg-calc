// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AddEnemyInfo } from "./AddEnemyInfo";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { TurnActOrderUnitInfo } from "../TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.Command.CommandBeginWave  (TypeDefIndex 981, public sealed class) ----
export class CommandBeginWave extends CommandBase {
    /** 0x18 private int <QuestStageMstId>k__BackingField */
    _QuestStageMstId: int = 0;
    /** 0x1C private int <Wave>k__BackingField */
    _Wave: int = 0;
    /** 0x20 private AddEnemyInfo[] <AddEnemyInfos>k__BackingField */
    _AddEnemyInfos: AddEnemyInfo[] = null!;
    /** 0x28 private TurnActOrderUnitInfo <TurnActOrderUnitInfo>k__BackingField */
    _TurnActOrderUnitInfo: TurnActOrderUnitInfo = null!;
    /** 0x30 private bool <HasBossEnemy>k__BackingField */
    _HasBossEnemy: boolean = false;
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    set QuestStageMstId(v: int) { this.set_QuestStageMstId(v); }
    get Wave(): int { return this.get_Wave(); }
    set Wave(v: int) { this.set_Wave(v); }
    get AddEnemyInfos(): AddEnemyInfo[] { return this.get_AddEnemyInfos(); }
    set AddEnemyInfos(v: AddEnemyInfo[]) { this.set_AddEnemyInfos(v); }
    get TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this.get_TurnActOrderUnitInfo(); }
    set TurnActOrderUnitInfo(v: TurnActOrderUnitInfo) { this.set_TurnActOrderUnitInfo(v); }
    get HasBossEnemy(): boolean { return this.get_HasBossEnemy(); }
    set HasBossEnemy(v: boolean) { this.set_HasBossEnemy(v); }
    /** @rva 0xDBA190 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 9 as CommandType; /* asm: mov eax, 9; ret */ }
    /** @rva 0x763820  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this._QuestStageMstId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_QuestStageMstId(int value) { } */
    set_QuestStageMstId(value: int): void { this._QuestStageMstId = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_Wave() { } */
    get_Wave(): int { return this._Wave; /* auto-property */ }
    /** @rva 0x7F9820  public void set_Wave(int value) { } */
    set_Wave(value: int): void { this._Wave = value; /* auto-property */ }
    /** @rva 0x7369E0  public AddEnemyInfo[] get_AddEnemyInfos() { } */
    get_AddEnemyInfos(): AddEnemyInfo[] { return this._AddEnemyInfos; /* auto-property */ }
    /** @rva 0x736A50  public void set_AddEnemyInfos(AddEnemyInfo[] value) { } */
    set_AddEnemyInfos(value: AddEnemyInfo[]): void { this._AddEnemyInfos = value; /* auto-property */ }
    /** @rva 0x736EA0  public TurnActOrderUnitInfo get_TurnActOrderUnitInfo() { } */
    get_TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this._TurnActOrderUnitInfo; /* auto-property */ }
    /** @rva 0x736F10  public void set_TurnActOrderUnitInfo(TurnActOrderUnitInfo value) { } */
    set_TurnActOrderUnitInfo(value: TurnActOrderUnitInfo): void { this._TurnActOrderUnitInfo = value; /* auto-property */ }
    /** @rva 0x75F800  public bool get_HasBossEnemy() { } */
    get_HasBossEnemy(): boolean { return this._HasBossEnemy; /* auto-property */ }
    /** @rva 0x75F830  public void set_HasBossEnemy(bool value) { } */
    set_HasBossEnemy(value: boolean): void { this._HasBossEnemy = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17E8840  public void .ctor(in int questStageMstId, in int wave, in List<BattleUnit> enemyUnitList, in TurnActOrderUnitInfo turnActOrderUnitInfo) { } */
    ctor$int_int_ListBattleUnit_TurnActOrderUnitInfo(questStageMstId: int, wave: int, enemyUnitList: List<BattleUnit>, turnActOrderUnitInfo: TurnActOrderUnitInfo): this { return notPorted("CommandBeginWave..ctor", 0x17E8840); }
}
