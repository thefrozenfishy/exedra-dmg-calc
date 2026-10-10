// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.DebugTurnGaugeEditRequest  (TypeDefIndex 833, public class) ----
export class DebugTurnGaugeEditRequest extends RequestBase {
    /** 0x10 public List<ValueTuple<int, float>> TurnGaugeList */
    TurnGaugeList: List<any /* ValueTuple<int, float> */> = null!;
    /** @rva 0x16CFD30 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 1002 as RequestType; /* asm: mov eax, 0x3ea; ret */ }
    /** @rva 0x16CFCB0  public void .ctor() { } */
    ctor(): this { return notPorted("DebugTurnGaugeEditRequest..ctor", 0x16CFCB0); }
}
