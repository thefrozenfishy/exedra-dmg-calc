// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandEndWave  (TypeDefIndex 986, public sealed class) ----
export class CommandEndWave extends CommandBase {
    /** @rva 0xDBAD00 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 8 as CommandType; /* asm: mov eax, 8; ret */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
