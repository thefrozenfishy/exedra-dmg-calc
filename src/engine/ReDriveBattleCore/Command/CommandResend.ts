// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandResend  (TypeDefIndex 1010, public class) ----
export class CommandResend extends CommandBase {
    /** 0x18 private CommandBase <Command>k__BackingField */
    _Command: CommandBase = null!;
    get Command(): CommandBase { return this.get_Command(); }
    set Command(v: CommandBase) { this.set_Command(v); }
    /** @rva 0x1811B90 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 23 as CommandType; /* asm: mov eax, 0x17; ret */ }
    /** @rva 0x732E90  public CommandBase get_Command() { } */
    get_Command(): CommandBase { return this._Command; /* auto-property */ }
    /** @rva 0x735AB0  public void set_Command(CommandBase value) { } */
    set_Command(value: CommandBase): void { this._Command = value; /* auto-property */ }
    /** @rva 0x98E6F0  public void .ctor(CommandBase command) { } */
    ctor$CommandBase(command: CommandBase): this {
        this._Command = command;
        return this;
    }
}
