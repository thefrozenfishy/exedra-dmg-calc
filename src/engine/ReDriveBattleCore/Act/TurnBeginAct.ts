// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase, ActBase_Define } from "./ActBase";

// ---- ReDriveBattleCore.Act.TurnBeginAct  (TypeDefIndex 1102, public class) ----
export class TurnBeginAct extends ActBase {
    /** 0x30 private int <Priority>k__BackingField */
    _Priority$TurnBeginAct: int = 0;
    /** @rva 0x764D60 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$TurnBeginAct; /* auto-property */ }
    /** @rva 0x87A5A0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$TurnBeginAct = value; /* auto-property */ }
    /** @rva 0x73C0C0 slot 6  public override bool get_ShouldShow() { } */
    get_ShouldShow(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x194D190  public void .ctor() { } */
    ctor(): this {
        this._Priority$TurnBeginAct = ActBase_Define.TurnBeginPriority;
        return super.ctor();
    }
}
