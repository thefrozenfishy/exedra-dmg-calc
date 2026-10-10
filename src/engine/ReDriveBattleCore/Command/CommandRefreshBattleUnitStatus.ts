// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandRefreshBattleUnitStatus  (TypeDefIndex 1006, public class) ----
export class CommandRefreshBattleUnitStatus extends CommandBase {
    /** 0x18 private int <UnitId>k__BackingField */
    _UnitId: int = 0;
    get UnitId(): int { return this.get_UnitId(); }
    set UnitId(v: int) { this.set_UnitId(v); }
    /** @rva 0x17EA8B0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 19 as CommandType; /* asm: mov eax, 0x13; ret */ }
    /** @rva 0x763820  public int get_UnitId() { } */
    get_UnitId(): int { return this._UnitId; /* auto-property */ }
    /** @rva 0x8A2240  private void set_UnitId(int value) { } */
    set_UnitId(value: int): void { this._UnitId = value; /* auto-property */ }
    /** @rva 0x149DC70  public void .ctor(int unitId) { } */
    ctor$int(unitId: int): this {
        this._UnitId = unitId;
        return this;
    }
}
