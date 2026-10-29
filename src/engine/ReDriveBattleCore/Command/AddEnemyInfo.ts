// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Command.AddEnemyInfo  (TypeDefIndex 964, public class) ----
export class AddEnemyInfo {
    /** 0x10 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x14 private int <QuestEnemyAppearanceMstId>k__BackingField */
    _QuestEnemyAppearanceMstId: int = 0;
    /** 0x18 private int <PositionId>k__BackingField */
    _PositionId: int = 0;
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get QuestEnemyAppearanceMstId(): int { return this.get_QuestEnemyAppearanceMstId(); }
    set QuestEnemyAppearanceMstId(v: int) { this.set_QuestEnemyAppearanceMstId(v); }
    get PositionId(): int { return this.get_PositionId(); }
    set PositionId(v: int) { this.set_PositionId(v); }
    /** @rva 0x7364F0  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x739D00  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_QuestEnemyAppearanceMstId() { } */
    get_QuestEnemyAppearanceMstId(): int { return this._QuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x803540  public void set_QuestEnemyAppearanceMstId(int value) { } */
    set_QuestEnemyAppearanceMstId(value: int): void { this._QuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x763820  public int get_PositionId() { } */
    get_PositionId(): int { return this._PositionId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_PositionId(int value) { } */
    set_PositionId(value: int): void { this._PositionId = value; /* auto-property */ }
    /** @rva 0x972C80  public void .ctor(int id, int mstId, int pos) { } */
    ctor$int_int_int(id: int, mstId: int, pos: int): this {
        this._BattleUnitId = id;
        this._QuestEnemyAppearanceMstId = mstId;
        this._PositionId = pos;
        return this;
    }
}
