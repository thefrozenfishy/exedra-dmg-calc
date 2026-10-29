// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase, ActBase_Define } from "./ActBase";

// ---- ReDriveBattleCore.Act.ModeChangeAct  (TypeDefIndex 1114, public class) ----
export class ModeChangeAct extends ActBase {
    /** 0x30 private int <Priority>k__BackingField */
    _Priority$ModeChangeAct: int = 0;
    /** 0x34 public int NextModeChangeStep */
    NextModeChangeStep: int = 0;
    /** @rva 0x75ED60 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$ModeChangeAct; /* auto-property */ }
    /** @rva 0x8745A0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$ModeChangeAct = value; /* auto-property */ }
    /** @rva 0x191B1C0  public void .ctor() { } */
    ctor(): this {
        this._Priority$ModeChangeAct = ActBase_Define.ModeChangeActPriority;
        return super.ctor();
    }
}
