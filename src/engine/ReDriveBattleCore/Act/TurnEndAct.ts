// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase, ActBase_Define } from "./ActBase";

// ---- ReDriveBattleCore.Act.TurnEndAct  (TypeDefIndex 1103, public class) ----
export class TurnEndAct extends ActBase {
    /** 0x30 private int <Priority>k__BackingField */
    _Priority$TurnEndAct: int = 0;
    /** @rva 0x75ED60 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$TurnEndAct; /* auto-property */ }
    /** @rva 0x8745A0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$TurnEndAct = value; /* auto-property */ }
    /** @rva 0x7360C0 slot 6  public override bool get_ShouldShow() { } */
    get_ShouldShow(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x17EE2B0  public void .ctor() { } */
    ctor(): this {
        this._Priority$TurnEndAct = ActBase_Define.TurnEndPriority;
        return super.ctor();
    }
}
