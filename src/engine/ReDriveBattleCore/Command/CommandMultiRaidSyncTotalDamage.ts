// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandMultiRaidSyncTotalDamage  (TypeDefIndex 1003, public class) ----
export class CommandMultiRaidSyncTotalDamage extends CommandBase {
    /** 0x18 private int <TotalDamage>k__BackingField */
    _TotalDamage: int = 0;
    /** 0x1C private bool <IsInitialize>k__BackingField */
    _IsInitialize: boolean = false;
    get TotalDamage(): int { return this.get_TotalDamage(); }
    set TotalDamage(v: int) { this.set_TotalDamage(v); }
    get IsInitialize(): boolean { return this.get_IsInitialize(); }
    set IsInitialize(v: boolean) { this.set_IsInitialize(v); }
    /** @rva 0xECE5F0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 25 as CommandType; /* asm: mov eax, 0x19; ret */ }
    /** @rva 0x763820  public int get_TotalDamage() { } */
    get_TotalDamage(): int { return this._TotalDamage; /* auto-property */ }
    /** @rva 0x8A2240  public void set_TotalDamage(int value) { } */
    set_TotalDamage(value: int): void { this._TotalDamage = value; /* auto-property */ }
    /** @rva 0x9024D0  public bool get_IsInitialize() { } */
    get_IsInitialize(): boolean { return this._IsInitialize; /* auto-property */ }
    /** @rva 0x9024E0  public void set_IsInitialize(bool value) { } */
    set_IsInitialize(value: boolean): void { this._IsInitialize = value; /* auto-property */ }
    /** @rva 0x17E96F0  public void .ctor(int totalDamage, bool isInitialize) { } */
    ctor$int_bool(totalDamage: int, isInitialize: boolean): this {
        this._TotalDamage = totalDamage;
        this._IsInitialize = isInitialize;
        return this;
    }
}
