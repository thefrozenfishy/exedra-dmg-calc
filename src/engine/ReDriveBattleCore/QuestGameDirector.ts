// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { SoloGameDirectorBase } from "./SoloGameDirectorBase";

// ---- ReDriveBattleCore.QuestGameDirector  (TypeDefIndex 454, public class) ----
export class QuestGameDirector extends SoloGameDirectorBase {
    /** @rva 0x758B30 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 1 as BattleType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x14CAA70  public void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
}
