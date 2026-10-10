// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import { FieldParamBase } from "./FieldParamBase";

// ---- ReDriveBattleCore.CampaignFieldParam  (TypeDefIndex 398, public class) ----
export class CampaignFieldParam extends FieldParamBase {
    /** @rva 0x14931E0  protected void .ctor() { } */
    ctor(): this { return notPorted("CampaignFieldParam..ctor", 0x14931E0); }
    /** @rva 0x14931F0  public void .ctor(int upDmgValue, int upBreakPointDmgValue) { } */
    ctor$int_int(upDmgValue: int, upBreakPointDmgValue: int): this { return notPorted("CampaignFieldParam..ctor", 0x14931F0); }
}
