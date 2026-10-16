// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandInvalid  (TypeDefIndex 999, public sealed class) ----
export class CommandInvalid extends CommandBase {
    /** 0x0 private static readonly CommandInvalid <Default>k__BackingField */
    static _Default: CommandInvalid = null!;
    static get Default(): CommandInvalid { return CommandInvalid.get_Default(); }
    /** @rva 0x7421D0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 0 as CommandType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x72F5E0  private void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x18107E0  public static CommandInvalid get_Default() { } */
    static get_Default(): CommandInvalid { return CommandInvalid._Default; /* auto-property */ }
    /** @rva 0x1810770  private static void .cctor() { } */
    static cctor(): void {
        CommandInvalid._Default = new CommandInvalid().ctor();
    }
}

CommandInvalid.cctor(); // C# static constructor