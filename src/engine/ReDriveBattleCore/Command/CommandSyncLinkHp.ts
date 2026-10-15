// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { LinkHpType } from "../../Network/Definition/QuestOutGame/LinkHpType";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandSyncLinkHp  (TypeDefIndex 1021, public class) ----
export class CommandSyncLinkHp extends CommandBase {
    /** 0x18 private LinkHpType <LinkHpType>k__BackingField */
    _LinkHpType: LinkHpType = 0 as LinkHpType;
    /** 0x20 private string <LinkHpName>k__BackingField */
    _LinkHpName: string = null!;
    /** 0x28 private int <CurrentLinkHp>k__BackingField */
    _CurrentLinkHp: int = 0;
    /** 0x2C private int <MaxLinkHp>k__BackingField */
    _MaxLinkHp: int = 0;
    get LinkHpType(): LinkHpType { return this.get_LinkHpType(); }
    set LinkHpType(v: LinkHpType) { this.set_LinkHpType(v); }
    get LinkHpName(): string { return this.get_LinkHpName(); }
    set LinkHpName(v: string) { this.set_LinkHpName(v); }
    get CurrentLinkHp(): int { return this.get_CurrentLinkHp(); }
    set CurrentLinkHp(v: int) { this.set_CurrentLinkHp(v); }
    get MaxLinkHp(): int { return this.get_MaxLinkHp(); }
    set MaxLinkHp(v: int) { this.set_MaxLinkHp(v); }
    /** @rva 0x1812AD0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 32 as CommandType; /* asm: mov eax, 0x20; ret */ }
    /** @rva 0x762820  public LinkHpType get_LinkHpType() { } */
    get_LinkHpType(): LinkHpType { return this._LinkHpType; /* auto-property */ }
    /** @rva 0x8A1240  public void set_LinkHpType(LinkHpType value) { } */
    set_LinkHpType(value: LinkHpType): void { this._LinkHpType = value; /* auto-property */ }
    /** @rva 0x7359E0  public string get_LinkHpName() { } */
    get_LinkHpName(): string { return this._LinkHpName; /* auto-property */ }
    /** @rva 0x735A50  public void set_LinkHpName(string value) { } */
    set_LinkHpName(value: string): void { this._LinkHpName = value; /* auto-property */ }
    /** @rva 0x7627A0  public int get_CurrentLinkHp() { } */
    get_CurrentLinkHp(): int { return this._CurrentLinkHp; /* auto-property */ }
    /** @rva 0x8A1250  public void set_CurrentLinkHp(int value) { } */
    set_CurrentLinkHp(value: int): void { this._CurrentLinkHp = value; /* auto-property */ }
    /** @rva 0x85D530  public int get_MaxLinkHp() { } */
    get_MaxLinkHp(): int { return this._MaxLinkHp; /* auto-property */ }
    /** @rva 0x8A1260  public void set_MaxLinkHp(int value) { } */
    set_MaxLinkHp(value: int): void { this._MaxLinkHp = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1812AE0  public void .ctor(LinkHpType linkHpType, string linkHpName, int currentLinkHp, int maxLinkHp) { } */
    ctor$LinkHpType_string_int_int(linkHpType: LinkHpType, linkHpName: string, currentLinkHp: int, maxLinkHp: int): this {
        this._LinkHpType = linkHpType;
        this._LinkHpName = linkHpName;
        this._CurrentLinkHp = currentLinkHp;
        this._MaxLinkHp = maxLinkHp;
        return this;
    }
}
