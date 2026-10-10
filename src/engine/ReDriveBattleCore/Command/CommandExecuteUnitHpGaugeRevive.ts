// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandExecuteActBase } from "./CommandExecuteActBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandExecuteUnitHpGaugeRevive  (TypeDefIndex 992, public class) ----
export class CommandExecuteUnitHpGaugeRevive extends CommandExecuteActBase {
    /** @rva 0xED3A50 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 21 as CommandType; /* asm: mov eax, 0x15; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
