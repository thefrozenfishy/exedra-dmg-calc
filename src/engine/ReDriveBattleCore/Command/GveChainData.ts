// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Command.GveChainData  (TypeDefIndex 997, public class) ----
export class GveChainData {
    /** 0x10 public string UserName */
    UserName: string = null!;
    /** 0x18 public int StyleMstId */
    StyleMstId: int = 0;
    /** 0x1C public int ChainId */
    ChainId: int = 0;
    /** 0x20 public int ChainLevel */
    ChainLevel: int = 0;
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
