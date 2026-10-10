// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";

// ---- ReDriveBattleCore.BackupData  (TypeDefIndex 325, public sealed class) ----
export class BackupData {
    /** 0x10 public string gameDirectorJson */
    gameDirectorJson: string = null!;
    /** 0x18 public string prevUnitsJson */
    prevUnitsJson: string = null!;
    /** 0x20 public string prevSituationJson */
    prevSituationJson: string = null!;
    /** 0x28 public string commandsJson */
    commandsJson: string = null!;
    /** 0x30 public string turnOrderJson */
    turnOrderJson: string = null!;
    get IsValid(): boolean { return this.get_IsValid(); }
    /** @rva 0x137B0F0  public bool get_IsValid() { } */
    get_IsValid(): boolean { return notPorted("BackupData.get_IsValid", 0x137B0F0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
