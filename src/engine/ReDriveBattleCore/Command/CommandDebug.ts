// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandDebug  (TypeDefIndex 982, public sealed class) ----
export class CommandDebug extends CommandBase {
    /** 0x18 private List<BattleUnit> <BattleUnitList>k__BackingField */
    _BattleUnitList: List<BattleUnit> = null!;
    /** 0x20 private OptionBase[] <DebugOptions>k__BackingField */
    _DebugOptions: any /* OptionBase */[] = null!;
    /** 0x28 private bool <IsStopTime>k__BackingField */
    _IsStopTime: boolean = false;
    get BattleUnitList(): List<BattleUnit> { return this.get_BattleUnitList(); }
    set BattleUnitList(v: List<BattleUnit>) { this.set_BattleUnitList(v); }
    get DebugOptions(): any /* OptionBase */[] { return this.get_DebugOptions(); }
    set DebugOptions(v: any /* OptionBase */[]) { this.set_DebugOptions(v); }
    get IsStopTime(): boolean { return this.get_IsStopTime(); }
    set IsStopTime(v: boolean) { this.set_IsStopTime(v); }
    /** @rva 0xEE0BE0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 12 as CommandType; /* asm: mov eax, 0xc; ret */ }
    /** @rva 0x733E90  public List<BattleUnit> get_BattleUnitList() { } */
    get_BattleUnitList(): List<BattleUnit> { return this._BattleUnitList; /* auto-property */ }
    /** @rva 0x736AB0  public void set_BattleUnitList(List<BattleUnit> value) { } */
    set_BattleUnitList(value: List<BattleUnit>): void { this._BattleUnitList = value; /* auto-property */ }
    /** @rva 0x7369E0  public OptionBase[] get_DebugOptions() { } */
    get_DebugOptions(): any /* OptionBase */[] { return this._DebugOptions; /* auto-property */ }
    /** @rva 0x736A50  public void set_DebugOptions(OptionBase[] value) { } */
    set_DebugOptions(value: any /* OptionBase */[]): void { this._DebugOptions = value; /* auto-property */ }
    /** @rva 0x73A4E0  public bool get_IsStopTime() { } */
    get_IsStopTime(): boolean { return this._IsStopTime; /* auto-property */ }
    /** @rva 0x73A4F0  public void set_IsStopTime(bool value) { } */
    set_IsStopTime(value: boolean): void { this._IsStopTime = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17FA8C0  public void .ctor(in List<BattleUnit> battleUnitList, OptionBase[] debugOptions, bool isStopTime) { } */
    ctor$ListBattleUnit_OptionBase_bool(battleUnitList: List<BattleUnit>, debugOptions: any /* OptionBase */[], isStopTime: boolean): this {
        this._BattleUnitList = battleUnitList;
        this._DebugOptions = debugOptions;
        this._IsStopTime = isStopTime;
        return this;
    }
}
