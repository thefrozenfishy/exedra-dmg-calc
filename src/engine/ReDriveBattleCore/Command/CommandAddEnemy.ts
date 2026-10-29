// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandAddEnemy  (TypeDefIndex 971, public class) ----
export class CommandAddEnemy extends CommandBase {
    /** 0x18 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x1C private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x20 private int <PositionId>k__BackingField */
    _PositionId: int = 0;
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get PositionId(): int { return this.get_PositionId(); }
    set PositionId(v: int) { this.set_PositionId(v); }
    /** @rva 0xDC0E00 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 6 as CommandType; /* asm: mov eax, 6; ret */ }
    /** @rva 0x763820  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x7F9820  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_PositionId() { } */
    get_PositionId(): int { return this._PositionId; /* auto-property */ }
    /** @rva 0x8A2230  public void set_PositionId(int value) { } */
    set_PositionId(value: int): void { this._PositionId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17FA300  public void .ctor(in int battleUnitId, in int questEnemyAppearanceMstId, in int positionId) { } */
    ctor$int_int_int(battleUnitId: int, questEnemyAppearanceMstId: int, positionId: int): this {
        this._BattleUnitId = battleUnitId;
        this._QuestEnemyAppearanceMstId = questEnemyAppearanceMstId;
        this._PositionId = positionId;
        return this;
    }
}
