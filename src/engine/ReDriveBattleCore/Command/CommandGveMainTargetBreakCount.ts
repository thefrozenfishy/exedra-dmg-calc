// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandGveMainTargetBreakCount  (TypeDefIndex 994, public class) ----
export class CommandGveMainTargetBreakCount extends CommandBase {
    /** 0x18 private int <BreakCount>k__BackingField */
    _BreakCount: int = 0;
    get BreakCount(): int { return this.get_BreakCount(); }
    set BreakCount(v: int) { this.set_BreakCount(v); }
    /** @rva 0x15B7180 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 20 as CommandType; /* asm: mov eax, 0x14; ret */ }
    /** @rva 0x763820  public int get_BreakCount() { } */
    get_BreakCount(): int { return this._BreakCount; /* auto-property */ }
    /** @rva 0x8A2240  public void set_BreakCount(int value) { } */
    set_BreakCount(value: int): void { this._BreakCount = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x149DC70  public void .ctor(int breakCount) { } */
    ctor$int(breakCount: int): this { return notPorted("CommandGveMainTargetBreakCount..ctor", 0x149DC70); }
}
