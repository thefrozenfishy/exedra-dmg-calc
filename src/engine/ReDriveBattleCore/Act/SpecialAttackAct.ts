// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { SkillDecisionActBase } from "./SkillDecisionActBase";

// ---- ReDriveBattleCore.Act.SpecialAttackAct  (TypeDefIndex 1110, public class) ----
export class SpecialAttackAct extends SkillDecisionActBase {
    /** @rva 0x8A2230  public void SetDecisionContent(int friendUnitId) { } */
    SetDecisionContent(friendUnitId: int): void { this.targetFriendUnitId = friendUnitId; /* asm: mov dword ptr [rcx + 0x20], edx; ret */ }
    /** @rva 0x190AA40  public void .ctor() { } */
    ctor(): this { return super.ctor(); /* folded: ActBase..ctor */ }
}
