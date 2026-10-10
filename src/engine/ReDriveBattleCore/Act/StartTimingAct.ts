// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { ActBase_Define } from "./ActBase";
import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { SkillDecisionActBase } from "./SkillDecisionActBase";

// ---- ReDriveBattleCore.Act.StartTimingAct  (TypeDefIndex 1111, public class) ----
export class StartTimingAct extends SkillDecisionActBase {
    /** 0x38 private int <Priority>k__BackingField */
    _Priority$StartTimingAct: int = 0;
    /** @rva 0x7360C0 slot 7  public override bool get_IsCanInterrupt() { } */
    get_IsCanInterrupt(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x75EDA0 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$StartTimingAct; /* auto-property */ }
    /** @rva 0x8A22B0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$StartTimingAct = value; /* auto-property */ }
    /** @rva 0x17EE0A0  public void .ctor() { } */
    ctor(): this {
        this._Priority$StartTimingAct = ActBase_Define.StartTimingActPriority;
        return super.ctor();
    }
}
