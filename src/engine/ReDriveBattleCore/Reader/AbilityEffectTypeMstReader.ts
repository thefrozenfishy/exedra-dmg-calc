// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { BattleMstReaderBase } from "./BattleMstReaderBase";
import type { AbilityEffectTypeMstModel } from "../Model/AbilityEffectTypeMstModel";
import type { AbilityEffectTypeMstRecord } from "../../Network/Definition/Skill/AbilityEffectTypeMstRecord";
import type { int } from "../../runtime";

// ---- ReDriveBattleCore.Reader.AbilityEffectTypeMstReader  (TypeDefIndex 847, public class) ----
export class AbilityEffectTypeMstReader extends BattleMstReaderBase<AbilityEffectTypeMstModel, AbilityEffectTypeMstRecord, int> {
    /** @rva 0x16CBEF0  public void .ctor() { } */
    ctor(): this { super.ctor(); return this; }
}
