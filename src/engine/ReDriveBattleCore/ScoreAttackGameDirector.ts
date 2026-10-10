// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";

// ---- ReDriveBattleCore.ScoreAttackGameDirector  (TypeDefIndex 455, public class) ----
export class ScoreAttackGameDirector extends SoloGameDirectorBase {
    /** @rva 0xDB7A40 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 6 as BattleType; /* asm: mov eax, 6; ret */ }
    /** @rva 0x14A42A0  public void .ctor() { } */
    ctor(): this { return notPorted("ScoreAttackGameDirector..ctor", 0x14A42A0); }
}
