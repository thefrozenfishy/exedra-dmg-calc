// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { RequestBase } from "./RequestBase";
import type { RequestType } from "./RequestType";

// ---- ReDriveBattleCore.Request.SwitchDebugRequest  (TypeDefIndex 843, public class) ----
export class SwitchDebugRequest extends RequestBase {
    /** 0x10 private readonly bool <IsActive>k__BackingField */
    _IsActive: boolean = false;
    /** 0x18 private readonly OptionBase[] <DebugOptions>k__BackingField */
    _DebugOptions: any /* OptionBase */[] = null!;
    get IsActive(): boolean { return this.get_IsActive(); }
    get DebugOptions(): any /* OptionBase */[] { return this.get_DebugOptions(); }
    /** @rva 0xDD5EF0 slot 4  public override RequestType get_RequestType() { } */
    get_RequestType(): RequestType { return 6 as RequestType; /* asm: mov eax, 6; ret */ }
    /** @rva 0x72FA80  public bool get_IsActive() { } */
    get_IsActive(): boolean { return this._IsActive; /* auto-property */ }
    /** @rva 0x732E90  public OptionBase[] get_DebugOptions() { } */
    get_DebugOptions(): any /* OptionBase */[] { return this._DebugOptions; /* auto-property */ }
    /** @rva 0x7328D0  public void .ctor(bool isActive, OptionBase[] debugOptions) { } */
    ctor$bool_OptionBase(isActive: boolean, debugOptions: any /* OptionBase */[]): this {
        this._IsActive = isActive;
        this._DebugOptions = debugOptions;
        return this;
    }
}
