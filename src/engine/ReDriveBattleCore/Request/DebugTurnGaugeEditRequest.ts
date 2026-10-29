// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { List } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.DebugTurnGaugeEditRequest  (TypeDefIndex 833, public class) ----
export class DebugTurnGaugeEditRequest extends RequestBase {
    /** 0x10 public List<ValueTuple<int, float>> TurnGaugeList */
    TurnGaugeList: List<any /* ValueTuple<int, float> */> = null!;
    /** @rva 0x16E27A0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 1002 as RequestType; /* asm: mov eax, 0x3ea; ret */ }
    /** @rva 0x16E2720  public void .ctor() { } */
    ctor(): this {
        this.TurnGaugeList = [];
        return this;
    }
}
