// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.InvalidRequest  (TypeDefIndex 840, public class) ----
export class InvalidRequest extends RequestBase {
    /** 0x0 private static readonly InvalidRequest <Default>k__BackingField */
    static _Default: InvalidRequest = null!;
    static get Default(): InvalidRequest { return InvalidRequest.get_Default(); }
    /** @rva 0x7431D0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 0 as RequestType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7305E0  private void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x16D28F0  public static InvalidRequest get_Default() { } */
    static get_Default(): InvalidRequest { return InvalidRequest._Default; /* auto-property */ }
    /** @rva 0x16D2880  private static void .cctor() { } */
    static cctor(): void { return notPorted("InvalidRequest..cctor", 0x16D2880); }
}
