// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandMultiRaidSyncHpResultForServer  (TypeDefIndex 1000, public class) ----
export class CommandMultiRaidSyncHpResultForServer extends CommandBase {
    /** 0x18 private int <ReducedHpBySync>k__BackingField */
    _ReducedHpBySync: int = 0;
    get ReducedHpBySync(): int { return this.get_ReducedHpBySync(); }
    set ReducedHpBySync(v: int) { this.set_ReducedHpBySync(v); }
    /** @rva 0x17FB460 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 26 as CommandType; /* asm: mov eax, 0x1a; ret */ }
    /** @rva 0x763820  public int get_ReducedHpBySync() { } */
    get_ReducedHpBySync(): int { return this._ReducedHpBySync; /* auto-property */ }
    /** @rva 0x8A2240  public void set_ReducedHpBySync(int value) { } */
    set_ReducedHpBySync(value: int): void { this._ReducedHpBySync = value; /* auto-property */ }
    /** @rva 0x14ADFA0  public void .ctor(int reducedHpBySync) { } */
    ctor$int(reducedHpBySync: int): this {
        this._ReducedHpBySync = reducedHpBySync;
        return this;
    }
}
