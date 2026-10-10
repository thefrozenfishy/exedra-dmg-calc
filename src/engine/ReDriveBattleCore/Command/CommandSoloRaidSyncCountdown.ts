// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { CountdownReferee } from "../CountdownReferee";

// ---- ReDriveBattleCore.Command.CommandSoloRaidSyncCountdown  (TypeDefIndex 1020, public class) ----
export class CommandSoloRaidSyncCountdown extends CommandBase {
    /** 0x18 private int <MaxCountdown>k__BackingField */
    _MaxCountdown: int = 0;
    /** 0x1C private int <Countdown>k__BackingField */
    _Countdown: int = 0;
    /** 0x20 private int <CancelMaxTotalDamage>k__BackingField */
    _CancelMaxTotalDamage: int = 0;
    /** 0x24 private int <CancelTotalDamage>k__BackingField */
    _CancelTotalDamage: int = 0;
    /** 0x28 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x2C private int <SyncTypeNum>k__BackingField */
    _SyncTypeNum: int = 0;
    /** 0x30 private int <CanActiveSkillMstId>k__BackingField */
    _CanActiveSkillMstId: int = 0;
    /** 0x34 private int <CanActiveSkillDetailMstId>k__BackingField */
    _CanActiveSkillDetailMstId: int = 0;
    get MaxCountdown(): int { return this.get_MaxCountdown(); }
    set MaxCountdown(v: int) { this.set_MaxCountdown(v); }
    get Countdown(): int { return this.get_Countdown(); }
    set Countdown(v: int) { this.set_Countdown(v); }
    get CancelMaxTotalDamage(): int { return this.get_CancelMaxTotalDamage(); }
    set CancelMaxTotalDamage(v: int) { this.set_CancelMaxTotalDamage(v); }
    get CancelTotalDamage(): int { return this.get_CancelTotalDamage(); }
    set CancelTotalDamage(v: int) { this.set_CancelTotalDamage(v); }
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get SyncTypeNum(): int { return this.get_SyncTypeNum(); }
    set SyncTypeNum(v: int) { this.set_SyncTypeNum(v); }
    get CanActiveSkillMstId(): int { return this.get_CanActiveSkillMstId(); }
    set CanActiveSkillMstId(v: int) { this.set_CanActiveSkillMstId(v); }
    get CanActiveSkillDetailMstId(): int { return this.get_CanActiveSkillDetailMstId(); }
    set CanActiveSkillDetailMstId(v: int) { this.set_CanActiveSkillDetailMstId(v); }
    /** @rva 0x17EB770 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 29 as CommandType; /* asm: mov eax, 0x1d; ret */ }
    /** @rva 0x763820  public int get_MaxCountdown() { } */
    get_MaxCountdown(): int { return this._MaxCountdown; /* auto-property */ }
    /** @rva 0x8A2240  public void set_MaxCountdown(int value) { } */
    set_MaxCountdown(value: int): void { this._MaxCountdown = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_Countdown() { } */
    get_Countdown(): int { return this._Countdown; /* auto-property */ }
    /** @rva 0x7F9820  public void set_Countdown(int value) { } */
    set_Countdown(value: int): void { this._Countdown = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_CancelMaxTotalDamage() { } */
    get_CancelMaxTotalDamage(): int { return this._CancelMaxTotalDamage; /* auto-property */ }
    /** @rva 0x8A2230  public void set_CancelMaxTotalDamage(int value) { } */
    set_CancelMaxTotalDamage(value: int): void { this._CancelMaxTotalDamage = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_CancelTotalDamage() { } */
    get_CancelTotalDamage(): int { return this._CancelTotalDamage; /* auto-property */ }
    /** @rva 0x75A840  public void set_CancelTotalDamage(int value) { } */
    set_CancelTotalDamage(value: int): void { this._CancelTotalDamage = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x8A2250  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_SyncTypeNum() { } */
    get_SyncTypeNum(): int { return this._SyncTypeNum; /* auto-property */ }
    /** @rva 0x8A2260  public void set_SyncTypeNum(int value) { } */
    set_SyncTypeNum(value: int): void { this._SyncTypeNum = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_CanActiveSkillMstId() { } */
    get_CanActiveSkillMstId(): int { return this._CanActiveSkillMstId; /* auto-property */ }
    /** @rva 0x8745A0  public void set_CanActiveSkillMstId(int value) { } */
    set_CanActiveSkillMstId(value: int): void { this._CanActiveSkillMstId = value; /* auto-property */ }
    /** @rva 0x75ED50  public int get_CanActiveSkillDetailMstId() { } */
    get_CanActiveSkillDetailMstId(): int { return this._CanActiveSkillDetailMstId; /* auto-property */ }
    /** @rva 0x8A22A0  public void set_CanActiveSkillDetailMstId(int value) { } */
    set_CanActiveSkillDetailMstId(value: int): void { this._CanActiveSkillDetailMstId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EB780  public void .ctor(CountdownReferee countdownReferee, int syncTypeNum) { } */
    ctor$CountdownReferee_int(countdownReferee: CountdownReferee, syncTypeNum: int): this {
        if (countdownReferee == null) return this;
        this._MaxCountdown = countdownReferee.maxCountdown;
        this._Countdown = countdownReferee.countdown;
        this._CancelMaxTotalDamage = countdownReferee.cancelMaxTotalDamage;
        this._CancelTotalDamage = countdownReferee.cancelTotalDamage;
        this._SyncTypeNum = syncTypeNum;
        this._BattleUnitId = countdownReferee.battleUnitId;
        this._CanActiveSkillMstId = countdownReferee.canActiveSkillMstId;
        this._CanActiveSkillDetailMstId = countdownReferee.canActiveSkillDetailMstId;
        return this;
    }
}

// ---- ReDriveBattleCore.Command.CommandSoloRaidSyncCountdown.SyncType  (TypeDefIndex 1019, public enum) ----
export const CommandSoloRaidSyncCountdown_SyncType = {
    Sync: 1,
    CountdownStart: 2,
    CountdownDecrease: 3,
    CountdownCancel: 4,
    CountdownEnd: 5,
    UpdateCancelTotalDamage: 6,
    CountdownForcedCancel: 7,
    CountdownForcedCancelAfterSync: 8,
} as const;
export type CommandSoloRaidSyncCountdown_SyncType = (typeof CommandSoloRaidSyncCountdown_SyncType)[keyof typeof CommandSoloRaidSyncCountdown_SyncType];
