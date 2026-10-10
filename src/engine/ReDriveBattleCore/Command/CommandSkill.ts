// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, IEnumerable, List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleUnit } from "../BattleUnit";
import type { AddEnemyInfo } from "./AddEnemyInfo";
import { CommandExecuteActBase } from "./CommandExecuteActBase";
import type { CommandType } from "./CommandType";
import type { SwitchedActiveSkillInfo } from "./SwitchedActiveSkillInfo";
import type { GainSoloRaidBuffPointNotice } from "../GainSoloRaidBuffPointNotice";

// ---- ReDriveBattleCore.Command.CommandSkill  (TypeDefIndex 1015, public sealed class) ----
export class CommandSkill extends CommandExecuteActBase {
    /** 0x38 private int <MainTargetUnitId>k__BackingField */
    _MainTargetUnitId: int = 0;
    /** 0x3C private int <ResultSP>k__BackingField */
    _ResultSP: int = 0;
    /** 0x40 private int <ResultSPBeforeApplyPassiveSkill>k__BackingField */
    _ResultSPBeforeApplyPassiveSkill: int = 0;
    /** 0x44 private int <SkillMstId>k__BackingField */
    _SkillMstId: int = 0;
    /** 0x48 private SwitchedActiveSkillInfo <SwitchedActiveSkillInfo>k__BackingField */
    _SwitchedActiveSkillInfo: SwitchedActiveSkillInfo = null!;
    /** 0x50 private AddEnemyInfo[] <AddEnemyInfos>k__BackingField */
    _AddEnemyInfos: AddEnemyInfo[] = null!;
    get UserUnitId(): int { return this.get_UserUnitId(); }
    get MainTargetUnitId(): int { return this.get_MainTargetUnitId(); }
    set MainTargetUnitId(v: int) { this.set_MainTargetUnitId(v); }
    get ResultSP(): int { return this.get_ResultSP(); }
    set ResultSP(v: int) { this.set_ResultSP(v); }
    get ResultSPBeforeApplyPassiveSkill(): int { return this.get_ResultSPBeforeApplyPassiveSkill(); }
    set ResultSPBeforeApplyPassiveSkill(v: int) { this.set_ResultSPBeforeApplyPassiveSkill(v); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    set SkillMstId(v: int) { this.set_SkillMstId(v); }
    get SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this.get_SwitchedActiveSkillInfo(); }
    set SwitchedActiveSkillInfo(v: SwitchedActiveSkillInfo) { this.set_SwitchedActiveSkillInfo(v); }
    get AddEnemyInfos(): AddEnemyInfo[] { return this.get_AddEnemyInfos(); }
    set AddEnemyInfos(v: AddEnemyInfo[]) { this.set_AddEnemyInfos(v); }
    get IsRandomAttack(): boolean { return this.get_IsRandomAttack(); }
    /** @rva 0xD447A0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 3 as CommandType; /* asm: mov eax, 3; ret */ }
    /** @rva 0x763820  public int get_UserUnitId() { } */
    get_UserUnitId(): int { return this._ActUnitId; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x75EDA0  public int get_MainTargetUnitId() { } */
    get_MainTargetUnitId(): int { return this._MainTargetUnitId; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_MainTargetUnitId(int value) { } */
    set_MainTargetUnitId(value: int): void { this._MainTargetUnitId = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_ResultSP() { } */
    get_ResultSP(): int { return this._ResultSP; /* auto-property */ }
    /** @rva 0x901F80  public void set_ResultSP(int value) { } */
    set_ResultSP(value: int): void { this._ResultSP = value; /* auto-property */ }
    /** @rva 0x7670B0  public int get_ResultSPBeforeApplyPassiveSkill() { } */
    get_ResultSPBeforeApplyPassiveSkill(): int { return this._ResultSPBeforeApplyPassiveSkill; /* auto-property */ }
    /** @rva 0x767A90  public void set_ResultSPBeforeApplyPassiveSkill(int value) { } */
    set_ResultSPBeforeApplyPassiveSkill(value: int): void { this._ResultSPBeforeApplyPassiveSkill = value; /* auto-property */ }
    /** @rva 0x902010  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this._SkillMstId; /* auto-property */ }
    /** @rva 0x902040  public void set_SkillMstId(int value) { } */
    set_SkillMstId(value: int): void { this._SkillMstId = value; /* auto-property */ }
    /** @rva 0x7368F0  public SwitchedActiveSkillInfo get_SwitchedActiveSkillInfo() { } */
    get_SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this._SwitchedActiveSkillInfo; /* auto-property */ }
    /** @rva 0x736A00  public void set_SwitchedActiveSkillInfo(SwitchedActiveSkillInfo value) { } */
    set_SwitchedActiveSkillInfo(value: SwitchedActiveSkillInfo): void { this._SwitchedActiveSkillInfo = value; /* auto-property */ }
    /** @rva 0x736910  public AddEnemyInfo[] get_AddEnemyInfos() { } */
    get_AddEnemyInfos(): AddEnemyInfo[] { return this._AddEnemyInfos; /* auto-property */ }
    /** @rva 0x736A20  public void set_AddEnemyInfos(AddEnemyInfo[] value) { } */
    set_AddEnemyInfos(value: AddEnemyInfo[]): void { this._AddEnemyInfos = value; /* auto-property */ }
    /** @rva 0x17EB640  public bool get_IsRandomAttack() { } */
    get_IsRandomAttack(): boolean { return notPorted("CommandSkill.get_IsRandomAttack", 0x17EB640); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EAD80  public void .ctor(int id, int mainTargetUnitId, int sp, int beforeApplyPassiveSkillSp, int skillMstId, List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, List<GainSoloRaidBuffPointNotice> gainSoloRaidBuffPointNoticeList) { } */
    ctor$int_int_int_int_int_ListAffectedUnitNotice_DictionaryintBattleUnit_ListGainSoloRaidBuffPointNotice(id: int, mainTargetUnitId: int, sp: int, beforeApplyPassiveSkillSp: int, skillMstId: int, noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, gainSoloRaidBuffPointNoticeList: List<GainSoloRaidBuffPointNotice>): this { return notPorted("CommandSkill..ctor", 0x17EAD80); }
    /** @rva 0x17EAD30  public ValueTuple<int, AffectedUnitNotice.DamageInfo>[] GetRandomDamages() { } */
    GetRandomDamages(): any /* ValueTuple<int, AffectedUnitNotice.DamageInfo> */[] { return notPorted("CommandSkill.GetRandomDamages", 0x17EAD30); }
    /** @rva 0x17EAA00  private IEnumerable<ValueTuple<int, AffectedUnitNotice.DamageInfo>> GetRandomDamageInternal() { } */
    GetRandomDamageInternal(): IEnumerable<any /* ValueTuple<int, AffectedUnitNotice.DamageInfo> */> { return notPorted("CommandSkill.GetRandomDamageInternal", 0x17EAA00); }
}
