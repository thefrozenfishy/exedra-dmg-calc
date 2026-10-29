// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float } from "../../runtime";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandBase  (TypeDefIndex 972, public class) ----
export class CommandBase {
    /** 0x10 private float <Time>k__BackingField */
    _Time: float = 0;
    get Time(): float { return this.get_Time(); }
    set Time(v: float) { this.set_Time(v); }
    /** @rva 0x7431D0 slot 4  public virtual CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 0 as CommandType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x8879E0  public float get_Time() { } */
    get_Time(): float { return this._Time; /* auto-property */ }
    /** @rva 0x887A00  public void set_Time(float value) { } */
    set_Time(value: float): void { this._Time = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
