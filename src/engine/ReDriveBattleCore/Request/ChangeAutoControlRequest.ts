// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AutoType } from "../AutoType";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.ChangeAutoControlRequest  (TypeDefIndex 824, public class) ----
export class ChangeAutoControlRequest extends RequestBase {
    /** 0x10 public AutoType autoType */
    autoType: AutoType = 0 as AutoType;
    /** @rva 0x104C0A0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 7 as RequestType; /* asm: mov eax, 7; ret */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
