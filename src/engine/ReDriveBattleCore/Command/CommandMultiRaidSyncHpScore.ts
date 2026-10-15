// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int, long } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandMultiRaidSyncHpScore  (TypeDefIndex 1002, public class) ----
export class CommandMultiRaidSyncHpScore extends CommandBase {
    /** 0x18 private int <Hp>k__BackingField */
    _Hp: int = 0;
    /** 0x20 private CommandMultiRaidSyncHpScore.ParticipantInfo[] <ParticipantInfos>k__BackingField */
    _ParticipantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[] = null!;
    /** 0x28 private bool <IsInitialize>k__BackingField */
    _IsInitialize: boolean = false;
    /** 0x29 private bool <IsLastSyncAfterBattleEnd>k__BackingField */
    _IsLastSyncAfterBattleEnd: boolean = false;
    /** 0x2A private bool <IsRequestedByPlayer>k__BackingField */
    _IsRequestedByPlayer: boolean = false;
    get Hp(): int { return this.get_Hp(); }
    set Hp(v: int) { this.set_Hp(v); }
    get ParticipantInfos(): CommandMultiRaidSyncHpScore_ParticipantInfo[] { return this.get_ParticipantInfos(); }
    set ParticipantInfos(v: CommandMultiRaidSyncHpScore_ParticipantInfo[]) { this.set_ParticipantInfos(v); }
    get IsInitialize(): boolean { return this.get_IsInitialize(); }
    set IsInitialize(v: boolean) { this.set_IsInitialize(v); }
    get IsLastSyncAfterBattleEnd(): boolean { return this.get_IsLastSyncAfterBattleEnd(); }
    set IsLastSyncAfterBattleEnd(v: boolean) { this.set_IsLastSyncAfterBattleEnd(v); }
    get IsRequestedByPlayer(): boolean { return this.get_IsRequestedByPlayer(); }
    set IsRequestedByPlayer(v: boolean) { this.set_IsRequestedByPlayer(v); }
    /** @rva 0x8D1D60 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 24 as CommandType; /* asm: mov eax, 0x18; ret */ }
    /** @rva 0x762820  public int get_Hp() { } */
    get_Hp(): int { return this._Hp; /* auto-property */ }
    /** @rva 0x8A1240  public void set_Hp(int value) { } */
    set_Hp(value: int): void { this._Hp = value; /* auto-property */ }
    /** @rva 0x7359E0  public CommandMultiRaidSyncHpScore.ParticipantInfo[] get_ParticipantInfos() { } */
    get_ParticipantInfos(): CommandMultiRaidSyncHpScore_ParticipantInfo[] { return this._ParticipantInfos; /* auto-property */ }
    /** @rva 0x735A50  public void set_ParticipantInfos(CommandMultiRaidSyncHpScore.ParticipantInfo[] value) { } */
    set_ParticipantInfos(value: CommandMultiRaidSyncHpScore_ParticipantInfo[]): void { this._ParticipantInfos = value; /* auto-property */ }
    /** @rva 0x7394E0  public bool get_IsInitialize() { } */
    get_IsInitialize(): boolean { return this._IsInitialize; /* auto-property */ }
    /** @rva 0x7394F0  public void set_IsInitialize(bool value) { } */
    set_IsInitialize(value: boolean): void { this._IsInitialize = value; /* auto-property */ }
    /** @rva 0x96C450  public bool get_IsLastSyncAfterBattleEnd() { } */
    get_IsLastSyncAfterBattleEnd(): boolean { return this._IsLastSyncAfterBattleEnd; /* auto-property */ }
    /** @rva 0x96C4C0  public void set_IsLastSyncAfterBattleEnd(bool value) { } */
    set_IsLastSyncAfterBattleEnd(value: boolean): void { this._IsLastSyncAfterBattleEnd = value; /* auto-property */ }
    /** @rva 0x128D1D0  public bool get_IsRequestedByPlayer() { } */
    get_IsRequestedByPlayer(): boolean { return this._IsRequestedByPlayer; /* auto-property */ }
    /** @rva 0x128D1E0  public void set_IsRequestedByPlayer(bool value) { } */
    set_IsRequestedByPlayer(value: boolean): void { this._IsRequestedByPlayer = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1810840  public void .ctor(int hp, CommandMultiRaidSyncHpScore.ParticipantInfo[] participantInfos, bool isInitialize, bool isLastSync, bool isRequestedByPlayer) { } */
    ctor$int_ParticipantInfo_bool_bool_bool(hp: int, participantInfos: CommandMultiRaidSyncHpScore_ParticipantInfo[], isInitialize: boolean, isLastSync: boolean, isRequestedByPlayer: boolean): this {
        this._Hp = hp;
        this._ParticipantInfos = participantInfos ?? [];
        this._IsLastSyncAfterBattleEnd = isLastSync;
        this._IsInitialize = isInitialize;
        this._IsRequestedByPlayer = isRequestedByPlayer;
        return this;
    }
}

// ---- ReDriveBattleCore.Command.CommandMultiRaidSyncHpScore.ParticipantInfo  (TypeDefIndex 1001, public class) ----
export class CommandMultiRaidSyncHpScore_ParticipantInfo {
    /** 0x10 public long userId */
    userId: long = 0;
    /** 0x18 public string userName */
    userName: string = null!;
    /** 0x20 public int score */
    score: int = 0;
    /** 0x24 public int iconStyleMstId */
    iconStyleMstId: int = 0;
    /** 0x28 public bool isJoining */
    isJoining: boolean = false;
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
