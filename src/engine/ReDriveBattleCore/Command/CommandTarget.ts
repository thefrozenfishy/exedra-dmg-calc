// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { BattleUnit_TeamType } from "../BattleUnit";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { TargetReferee_TargetType } from "../TargetReferee";

// ---- ReDriveBattleCore.Command.CommandTarget  (TypeDefIndex 1023, public sealed class) ----
export class CommandTarget extends CommandBase {
    /** 0x18 private BattleUnit.TeamType <TargetTeam>k__BackingField */
    _TargetTeam: BattleUnit_TeamType = 0 as BattleUnit_TeamType;
    /** 0x1C private TargetReferee.TargetType <TargetType>k__BackingField */
    _TargetType: TargetReferee_TargetType = 0 as TargetReferee_TargetType;
    /** 0x20 private int <TargetId>k__BackingField */
    _TargetId: int = 0;
    /** 0x24 private bool <IsChangeTargetAfterAct>k__BackingField */
    _IsChangeTargetAfterAct: boolean = false;
    get TargetTeam(): BattleUnit_TeamType { return this.get_TargetTeam(); }
    set TargetTeam(v: BattleUnit_TeamType) { this.set_TargetTeam(v); }
    get TargetType(): TargetReferee_TargetType { return this.get_TargetType(); }
    set TargetType(v: TargetReferee_TargetType) { this.set_TargetType(v); }
    get TargetId(): int { return this.get_TargetId(); }
    set TargetId(v: int) { this.set_TargetId(v); }
    get IsChangeTargetAfterAct(): boolean { return this.get_IsChangeTargetAfterAct(); }
    set IsChangeTargetAfterAct(v: boolean) { this.set_IsChangeTargetAfterAct(v); }
    /** @rva 0x7E1AD0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 2 as CommandType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x763820  public BattleUnit.TeamType get_TargetTeam() { } */
    get_TargetTeam(): BattleUnit_TeamType { return this._TargetTeam; /* auto-property */ }
    /** @rva 0x8A2240  public void set_TargetTeam(BattleUnit.TeamType value) { } */
    set_TargetTeam(value: BattleUnit_TeamType): void { this._TargetTeam = value; /* auto-property */ }
    /** @rva 0x7F9800  public TargetReferee.TargetType get_TargetType() { } */
    get_TargetType(): TargetReferee_TargetType { return this._TargetType; /* auto-property */ }
    /** @rva 0x7F9820  public void set_TargetType(TargetReferee.TargetType value) { } */
    set_TargetType(value: TargetReferee_TargetType): void { this._TargetType = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_TargetId() { } */
    get_TargetId(): int { return this._TargetId; /* auto-property */ }
    /** @rva 0x8A2230  public void set_TargetId(int value) { } */
    set_TargetId(value: int): void { this._TargetId = value; /* auto-property */ }
    /** @rva 0x8A21C0  public bool get_IsChangeTargetAfterAct() { } */
    get_IsChangeTargetAfterAct(): boolean { return this._IsChangeTargetAfterAct; /* auto-property */ }
    /** @rva 0x8A2270  public void set_IsChangeTargetAfterAct(bool value) { } */
    set_IsChangeTargetAfterAct(value: boolean): void { this._IsChangeTargetAfterAct = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EB8C0  public void .ctor(in BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, in int targetId, bool isChangeTargetAfterAct = False) { } */
    ctor$TeamType_TargetType_int_bool(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetId: int, isChangeTargetAfterAct?: boolean /* = False */): this {
        this._TargetTeam = targetTeam;
        this._TargetType = targetType;
        this._TargetId = targetId;
        this._IsChangeTargetAfterAct = (isChangeTargetAfterAct ?? false);
        return this;
    }
}
