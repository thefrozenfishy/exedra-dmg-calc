// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";

// base type Attribute is outside the ported set
// ---- ReDriveBattleCore.UnitState.DebugDisplayableAttribute  (TypeDefIndex 577, public class) ----
export class DebugDisplayableAttribute {
    /** 0x10 private readonly string <EntryName>k__BackingField */
    _EntryName: string = null!;
    get EntryName(): string { return this.get_EntryName(); }
    /** @rva 0x730C50  public string get_EntryName() { } */
    get_EntryName(): string { return this._EntryName; /* auto-property */ }
    /** @rva 0x730C10  public void .ctor(string entryName = "") { } */
    ctor$string(entryName?: string /* = "" */): this {
        this._EntryName = (entryName ?? "");
        return this;
    }
}
