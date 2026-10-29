// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Command.GveHistoryData  (TypeDefIndex 996, public class) ----
export class GveHistoryData {
    /** 0x10 public string UserName */
    UserName: string = null!;
    /** 0x18 public int StyleMstId */
    StyleMstId: int = 0;
    /** 0x20 public DateTimeOffset AttackTime */
    AttackTime: any /* DateTimeOffset */ = null!;
    /** 0x30 public int Damage */
    Damage: int = 0;
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
