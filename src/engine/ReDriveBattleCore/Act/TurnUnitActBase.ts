// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { SkillDecisionActBase } from "./SkillDecisionActBase";

// ---- ReDriveBattleCore.Act.TurnUnitActBase  (TypeDefIndex 1105, public abstract class) ----
export abstract class TurnUnitActBase extends SkillDecisionActBase {
    /** @rva 0x76E830 slot 7  public override bool get_IsCanInterrupt() { } */
    get_IsCanInterrupt(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x1931D80  public void SetDecisionContent(int decisionSkillMstId, int friendUnitId) { } */
    SetDecisionContent(decisionSkillMstId: int, friendUnitId: int): void {
        this.skillMstId = decisionSkillMstId;
        this.targetFriendUnitId = friendUnitId;
    }
    /** @rva 0x191AEB0  protected void .ctor() { } */
    ctor(): this { return super.ctor(); /* folded: ActBase..ctor */ }
}
