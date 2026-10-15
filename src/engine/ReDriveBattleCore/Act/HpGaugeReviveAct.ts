// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { ActBase, ActBase_Define } from "./ActBase";

// ---- ReDriveBattleCore.Act.HpGaugeReviveAct  (TypeDefIndex 1113, public class) ----
export class HpGaugeReviveAct extends ActBase {
    /** 0x30 private int <Priority>k__BackingField */
    _Priority$HpGaugeReviveAct: int = 0;
    /** @rva 0x75DD60 slot 4  public override int get_Priority() { } */
    get_Priority(): int { return this._Priority$HpGaugeReviveAct; /* auto-property */ }
    /** @rva 0x8735A0 slot 5  public override void set_Priority(int value) { } */
    set_Priority(value: int): void { this._Priority$HpGaugeReviveAct = value; /* auto-property */ }
    /** @rva 0x192A010  public void .ctor() { } */
    ctor(): this {
        this._Priority$HpGaugeReviveAct = ActBase_Define.HpGaugeReviveActPriority;
        return super.ctor();
    }
}
