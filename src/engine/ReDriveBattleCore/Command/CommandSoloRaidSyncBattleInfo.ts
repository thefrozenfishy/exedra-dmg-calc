// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandSoloRaidSyncBattleInfo  (TypeDefIndex 1018, public class) ----
export class CommandSoloRaidSyncBattleInfo extends CommandBase {
    /** 0x18 private BattleInfo <BattleInfo>k__BackingField */
    _BattleInfo: any /* BattleInfo */ = null!;
    get BattleInfo(): any /* BattleInfo */ { return this.get_BattleInfo(); }
    set BattleInfo(v: any /* BattleInfo */) { this.set_BattleInfo(v); }
    /** @rva 0xE4FE50 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 28 as CommandType; /* asm: mov eax, 0x1c; ret */ }
    /** @rva 0x733E90  public BattleInfo get_BattleInfo() { } */
    get_BattleInfo(): any /* BattleInfo */ { return this._BattleInfo; /* auto-property */ }
    /** @rva 0x736AB0  public void set_BattleInfo(BattleInfo value) { } */
    set_BattleInfo(value: any /* BattleInfo */): void { this._BattleInfo = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x95F810  public void .ctor(BattleInfo battleInfo) { } */
    ctor$BattleInfo(battleInfo: any /* BattleInfo */): this {
        this._BattleInfo = battleInfo;
        return this;
    }
}
