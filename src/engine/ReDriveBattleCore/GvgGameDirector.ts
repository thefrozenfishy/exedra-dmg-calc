// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import { GameDirectorBase } from "./GameDirectorBase";
import type { IBattleUnitProvider } from "./IBattleUnitProvider";

// ---- ReDriveBattleCore.GvgGameDirector  (TypeDefIndex 409, public class) ----
export class GvgGameDirector extends GameDirectorBase {
    /** @rva 0xD6FDF0 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 4 as BattleType; /* asm: mov eax, 4; ret */ }
    /** @rva 0x149DE20  public void .ctor() { } */
    ctor(): this { return notPorted("GvgGameDirector..ctor", 0x149DE20); }
    /** @rva 0x149DCB0  public void SetupBattleStage(IBattleUnitProvider unitProvider) { } */
    SetupBattleStage(unitProvider: IBattleUnitProvider): void { return notPorted("GvgGameDirector.SetupBattleStage", 0x149DCB0); }
}
