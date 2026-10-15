// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";

// ---- ReDriveBattleCore.Model.MstModelBase<TRecord>  (TypeDefIndex 883, public class) ----
export class MstModelBase<TRecord> {
    /** 0x0 protected readonly TRecord record */
    record: TRecord = null!;
    /** @rva -1  public void .ctor(TRecord record) { } */
    ctor$TRecord(record: TRecord): this {
        this.record = record; // 0x737fb0: base .ctor, then this+0x10 = record
        return this;
    }
}
