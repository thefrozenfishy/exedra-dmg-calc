// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.DebugFastEndBattleRequest  (TypeDefIndex 830, public class) ----
export class DebugFastEndBattleRequest extends RequestBase {
    /** 0x10 private DebugFastEndBattleRequest.BattleEndType <EndType>k__BackingField */
    _EndType: DebugFastEndBattleRequest_BattleEndType = 0 as DebugFastEndBattleRequest_BattleEndType;
    get EndType(): DebugFastEndBattleRequest_BattleEndType { return this.get_EndType(); }
    set EndType(v: DebugFastEndBattleRequest_BattleEndType) { this.set_EndType(v); }
    /** @rva 0x7364F0  public DebugFastEndBattleRequest.BattleEndType get_EndType() { } */
    get_EndType(): DebugFastEndBattleRequest_BattleEndType { return this._EndType; /* auto-property */ }
    /** @rva 0x739D00  public void set_EndType(DebugFastEndBattleRequest.BattleEndType value) { } */
    set_EndType(value: DebugFastEndBattleRequest_BattleEndType): void { this._EndType = value; /* auto-property */ }
    /** @rva 0x16E26F0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 1000 as RequestType; /* asm: mov eax, 0x3e8; ret */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.Request.DebugFastEndBattleRequest.BattleEndType  (TypeDefIndex 829, public enum) ----
export const DebugFastEndBattleRequest_BattleEndType = {
    None: 0,
    RunToEnd: 1,
    ForceWin: 2,
} as const;
export type DebugFastEndBattleRequest_BattleEndType = (typeof DebugFastEndBattleRequest_BattleEndType)[keyof typeof DebugFastEndBattleRequest_BattleEndType];
