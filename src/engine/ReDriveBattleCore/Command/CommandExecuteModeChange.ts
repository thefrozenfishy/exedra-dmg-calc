// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandExecuteActBase } from "./CommandExecuteActBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandExecuteModeChange  (TypeDefIndex 991, public class) ----
export class CommandExecuteModeChange extends CommandExecuteActBase {
    /** 0x38 private int <Step>k__BackingField */
    _Step: int = 0;
    /** 0x3C private int <ChangedQuestEnemyAppearanceMstId>k__BackingField */
    _ChangedQuestEnemyAppearanceMstId: int = 0;
    get Step(): int { return this.get_Step(); }
    set Step(v: int) { this.set_Step(v); }
    get ChangedQuestEnemyAppearanceMstId(): int { return this.get_ChangedQuestEnemyAppearanceMstId(); }
    set ChangedQuestEnemyAppearanceMstId(v: int) { this.set_ChangedQuestEnemyAppearanceMstId(v); }
    /** @rva 0xECBCA0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 22 as CommandType; /* asm: mov eax, 0x16; ret */ }
    /** @rva 0x75EDA0  public int get_Step() { } */
    get_Step(): int { return this._Step; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_Step(int value) { } */
    set_Step(value: int): void { this._Step = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_ChangedQuestEnemyAppearanceMstId() { } */
    get_ChangedQuestEnemyAppearanceMstId(): int { return this._ChangedQuestEnemyAppearanceMstId; /* auto-property */ }
    /** @rva 0x901F80  public void set_ChangedQuestEnemyAppearanceMstId(int value) { } */
    set_ChangedQuestEnemyAppearanceMstId(value: int): void { this._ChangedQuestEnemyAppearanceMstId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
