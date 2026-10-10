// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";

// ---- ReDriveBattleCore.PvpGameDirector  (TypeDefIndex 448, public class) ----
export class PvpGameDirector extends GameDirectorBase {
    /** @rva 0x7E1AD0 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 2 as BattleType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x14A4250  public void .ctor() { } */
    ctor(): this { return notPorted("PvpGameDirector..ctor", 0x14A4250); }
    /** @rva 0x14A40E0  public void SetupBattleStage(IBattleUnitProvider unitProvider, int timeLimit = 0) { } */
    SetupBattleStage(unitProvider: IBattleUnitProvider, timeLimit?: int /* = 0 */): void { return notPorted("PvpGameDirector.SetupBattleStage", 0x14A40E0); }
}
