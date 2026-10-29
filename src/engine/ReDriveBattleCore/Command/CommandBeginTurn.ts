// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, float, int } from "../../runtime";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { TurnActOrderUnitInfo } from "../TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.Command.CommandBeginTurn  (TypeDefIndex 980, public sealed class) ----
export class CommandBeginTurn extends CommandBase {
    /** 0x18 private TurnActOrderUnitInfo <TurnActOrderUnitInfo>k__BackingField */
    _TurnActOrderUnitInfo: TurnActOrderUnitInfo = null!;
    /** 0x20 private List<CommandBeginTurn.ActiveSkillInfo> <ActiveSkillInfoList>k__BackingField */
    _ActiveSkillInfoList: List<CommandBeginTurn_ActiveSkillInfo> = null!;
    /** 0x28 private int <CurrentRound>k__BackingField */
    _CurrentRound: int = 0;
    /** 0x2C private int <CurrentWave>k__BackingField */
    _CurrentWave: int = 0;
    /** 0x30 private float <DeltaActionTime>k__BackingField */
    _DeltaActionTime: float = 0;
    get TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this.get_TurnActOrderUnitInfo(); }
    set TurnActOrderUnitInfo(v: TurnActOrderUnitInfo) { this.set_TurnActOrderUnitInfo(v); }
    get ActiveSkillInfoList(): List<CommandBeginTurn_ActiveSkillInfo> { return this.get_ActiveSkillInfoList(); }
    set ActiveSkillInfoList(v: List<CommandBeginTurn_ActiveSkillInfo>) { this.set_ActiveSkillInfoList(v); }
    get CurrentRound(): int { return this.get_CurrentRound(); }
    set CurrentRound(v: int) { this.set_CurrentRound(v); }
    get CurrentWave(): int { return this.get_CurrentWave(); }
    set CurrentWave(v: int) { this.set_CurrentWave(v); }
    get DeltaActionTime(): float { return this.get_DeltaActionTime(); }
    set DeltaActionTime(v: float) { this.set_DeltaActionTime(v); }
    /** @rva 0xD7AB50 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 4 as CommandType; /* asm: mov eax, 4; ret */ }
    /** @rva 0x733E90  public TurnActOrderUnitInfo get_TurnActOrderUnitInfo() { } */
    get_TurnActOrderUnitInfo(): TurnActOrderUnitInfo { return this._TurnActOrderUnitInfo; /* auto-property */ }
    /** @rva 0x736AB0  public void set_TurnActOrderUnitInfo(TurnActOrderUnitInfo value) { } */
    set_TurnActOrderUnitInfo(value: TurnActOrderUnitInfo): void { this._TurnActOrderUnitInfo = value; /* auto-property */ }
    /** @rva 0x7369E0  public List<CommandBeginTurn.ActiveSkillInfo> get_ActiveSkillInfoList() { } */
    get_ActiveSkillInfoList(): List<CommandBeginTurn_ActiveSkillInfo> { return this._ActiveSkillInfoList; /* auto-property */ }
    /** @rva 0x736A50  public void set_ActiveSkillInfoList(List<CommandBeginTurn.ActiveSkillInfo> value) { } */
    set_ActiveSkillInfoList(value: List<CommandBeginTurn_ActiveSkillInfo>): void { this._ActiveSkillInfoList = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_CurrentRound() { } */
    get_CurrentRound(): int { return this._CurrentRound; /* auto-property */ }
    /** @rva 0x8A2250  public void set_CurrentRound(int value) { } */
    set_CurrentRound(value: int): void { this._CurrentRound = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_CurrentWave() { } */
    get_CurrentWave(): int { return this._CurrentWave; /* auto-property */ }
    /** @rva 0x8A2260  public void set_CurrentWave(int value) { } */
    set_CurrentWave(value: int): void { this._CurrentWave = value; /* auto-property */ }
    /** @rva 0x951C00  public float get_DeltaActionTime() { } */
    get_DeltaActionTime(): float { return this._DeltaActionTime; /* auto-property */ }
    /** @rva 0x951C70  public void set_DeltaActionTime(float value) { } */
    set_DeltaActionTime(value: float): void { this._DeltaActionTime = value; /* auto-property */ }
    /** @rva 0x17FA560  public void .ctor() { } */
    ctor(): this {
        this._ActiveSkillInfoList = [];
        return this;
    }
    /** @rva 0x17FA3B0  public void .ctor(BattleUnit currentTurnUnit, TurnActOrderUnitInfo turnActOrderUnitInfo, int currentRound, int currentWave, float deltaActionTime) { } */
    ctor$BattleUnit_TurnActOrderUnitInfo_int_int_float(currentTurnUnit: BattleUnit, turnActOrderUnitInfo: TurnActOrderUnitInfo, currentRound: int, currentWave: int, deltaActionTime: float): this {
        this._ActiveSkillInfoList = [];
        this._TurnActOrderUnitInfo = turnActOrderUnitInfo;
        if (currentTurnUnit == null) return this;
        if (currentTurnUnit.SkillSet != null) {
            this._ActiveSkillInfoList = currentTurnUnit.SkillSet.GetList().map(skill => { // <>c__DisplayClass23_0.b__0
                const info = new CommandBeginTurn_ActiveSkillInfo();
                info._ActiveSkillId = skill.Id; // ActiveSkillInfo..ctor(skill, unit) inlined in the game
                return info;
            });
        }
        this._DeltaActionTime = deltaActionTime;
        this._CurrentRound = currentRound;
        this._CurrentWave = currentWave;
        return this;
    }
}

// ---- ReDriveBattleCore.Command.CommandBeginTurn.ActiveSkillInfo  (TypeDefIndex 978, public class) ----
export class CommandBeginTurn_ActiveSkillInfo {
    /** 0x10 private int <ActiveSkillId>k__BackingField */
    _ActiveSkillId: int = 0;
    get ActiveSkillId(): int { return this.get_ActiveSkillId(); }
    set ActiveSkillId(v: int) { this.set_ActiveSkillId(v); }
    /** @rva 0x7364F0  public int get_ActiveSkillId() { } */
    get_ActiveSkillId(): int { return this._ActiveSkillId; /* auto-property */ }
    /** @rva 0x739D00  public void set_ActiveSkillId(int value) { } */
    set_ActiveSkillId(value: int): void { this._ActiveSkillId = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17F3C30  public void .ctor(ActiveSkillBase activeSkill, BattleUnit unit) { } */
    ctor$ActiveSkillBase_BattleUnit(activeSkill: ActiveSkillBase, unit: BattleUnit): this {
        if (activeSkill != null) this._ActiveSkillId = activeSkill.Id;
        return this;
    }
}
