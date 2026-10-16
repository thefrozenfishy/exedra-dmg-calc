// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IReadOnlyList } from "../../runtime";
import type { CommandAddEnemy } from "./CommandAddEnemy";
import type { CommandBase } from "./CommandBase";
import type { CommandBattlePhase } from "./CommandBattlePhase";
import type { CommandBeginTurn } from "./CommandBeginTurn";
import type { CommandDebug } from "./CommandDebug";
import type { CommandFinalize } from "./CommandFinalize";
import type { CommandInitialize } from "./CommandInitialize";
import type { CommandReproduction } from "./CommandReproduction";
import type { CommandSituationSync } from "./CommandSituationSync";
import type { CommandSkill } from "./CommandSkill";
import type { CommandTarget } from "./CommandTarget";
import type { CommandType } from "./CommandType";
import type { CommandUnitCondition } from "./CommandUnitCondition";

// ---- ReDriveBattleCore.Command.CommandPack  (TypeDefIndex 1005, public class) ----
export class CommandPack {
    /** 0x10 private CommandBattlePhase[] <BattlePhases>k__BackingField */
    _BattlePhases: CommandBattlePhase[] = null!;
    /** 0x18 private CommandTarget[] <Targets>k__BackingField */
    _Targets: CommandTarget[] = null!;
    /** 0x20 private CommandSkill[] <Skills>k__BackingField */
    _Skills: CommandSkill[] = null!;
    /** 0x28 private CommandBeginTurn[] <BeginTurns>k__BackingField */
    _BeginTurns: CommandBeginTurn[] = null!;
    /** 0x30 private CommandSituationSync[] <SituationSyncs>k__BackingField */
    _SituationSyncs: CommandSituationSync[] = null!;
    /** 0x38 private CommandAddEnemy[] <AddEnemies>k__BackingField */
    _AddEnemies: CommandAddEnemy[] = null!;
    /** 0x40 private CommandUnitCondition[] <UnitConditions>k__BackingField */
    _UnitConditions: CommandUnitCondition[] = null!;
    /** 0x48 private CommandReproduction[] <Reproductions>k__BackingField */
    _Reproductions: CommandReproduction[] = null!;
    /** 0x50 private CommandDebug[] <Debugs>k__BackingField */
    _Debugs: CommandDebug[] = null!;
    /** 0x58 private CommandInitialize[] <Initializations>k__BackingField */
    _Initializations: CommandInitialize[] = null!;
    /** 0x60 private CommandFinalize[] <Finalizations>k__BackingField */
    _Finalizations: CommandFinalize[] = null!;
    /** 0x68 private CommandType[] <CommandTypeOrder>k__BackingField */
    _CommandTypeOrder: CommandType[] = null!;
    get BattlePhases(): CommandBattlePhase[] { return this.get_BattlePhases(); }
    set BattlePhases(v: CommandBattlePhase[]) { this.set_BattlePhases(v); }
    get Targets(): CommandTarget[] { return this.get_Targets(); }
    set Targets(v: CommandTarget[]) { this.set_Targets(v); }
    get Skills(): CommandSkill[] { return this.get_Skills(); }
    set Skills(v: CommandSkill[]) { this.set_Skills(v); }
    get BeginTurns(): CommandBeginTurn[] { return this.get_BeginTurns(); }
    set BeginTurns(v: CommandBeginTurn[]) { this.set_BeginTurns(v); }
    get SituationSyncs(): CommandSituationSync[] { return this.get_SituationSyncs(); }
    set SituationSyncs(v: CommandSituationSync[]) { this.set_SituationSyncs(v); }
    get AddEnemies(): CommandAddEnemy[] { return this.get_AddEnemies(); }
    set AddEnemies(v: CommandAddEnemy[]) { this.set_AddEnemies(v); }
    get UnitConditions(): CommandUnitCondition[] { return this.get_UnitConditions(); }
    set UnitConditions(v: CommandUnitCondition[]) { this.set_UnitConditions(v); }
    get Reproductions(): CommandReproduction[] { return this.get_Reproductions(); }
    set Reproductions(v: CommandReproduction[]) { this.set_Reproductions(v); }
    get Debugs(): CommandDebug[] { return this.get_Debugs(); }
    set Debugs(v: CommandDebug[]) { this.set_Debugs(v); }
    get Initializations(): CommandInitialize[] { return this.get_Initializations(); }
    set Initializations(v: CommandInitialize[]) { this.set_Initializations(v); }
    get Finalizations(): CommandFinalize[] { return this.get_Finalizations(); }
    set Finalizations(v: CommandFinalize[]) { this.set_Finalizations(v); }
    get CommandTypeOrder(): CommandType[] { return this.get_CommandTypeOrder(); }
    set CommandTypeOrder(v: CommandType[]) { this.set_CommandTypeOrder(v); }
    /** @rva 0x72FC50  public CommandBattlePhase[] get_BattlePhases() { } */
    get_BattlePhases(): CommandBattlePhase[] { return this._BattlePhases; /* auto-property */ }
    /** @rva 0x72FC60  public void set_BattlePhases(CommandBattlePhase[] value) { } */
    set_BattlePhases(value: CommandBattlePhase[]): void { this._BattlePhases = value; /* auto-property */ }
    /** @rva 0x732E90  public CommandTarget[] get_Targets() { } */
    get_Targets(): CommandTarget[] { return this._Targets; /* auto-property */ }
    /** @rva 0x735AB0  public void set_Targets(CommandTarget[] value) { } */
    set_Targets(value: CommandTarget[]): void { this._Targets = value; /* auto-property */ }
    /** @rva 0x7359E0  public CommandSkill[] get_Skills() { } */
    get_Skills(): CommandSkill[] { return this._Skills; /* auto-property */ }
    /** @rva 0x735A50  public void set_Skills(CommandSkill[] value) { } */
    set_Skills(value: CommandSkill[]): void { this._Skills = value; /* auto-property */ }
    /** @rva 0x735EA0  public CommandBeginTurn[] get_BeginTurns() { } */
    get_BeginTurns(): CommandBeginTurn[] { return this._BeginTurns; /* auto-property */ }
    /** @rva 0x735F10  public void set_BeginTurns(CommandBeginTurn[] value) { } */
    set_BeginTurns(value: CommandBeginTurn[]): void { this._BeginTurns = value; /* auto-property */ }
    /** @rva 0x735F00  public CommandSituationSync[] get_SituationSyncs() { } */
    get_SituationSyncs(): CommandSituationSync[] { return this._SituationSyncs; /* auto-property */ }
    /** @rva 0x735F30  public void set_SituationSyncs(CommandSituationSync[] value) { } */
    set_SituationSyncs(value: CommandSituationSync[]): void { this._SituationSyncs = value; /* auto-property */ }
    /** @rva 0x735970  public CommandAddEnemy[] get_AddEnemies() { } */
    get_AddEnemies(): CommandAddEnemy[] { return this._AddEnemies; /* auto-property */ }
    /** @rva 0x735A30  public void set_AddEnemies(CommandAddEnemy[] value) { } */
    set_AddEnemies(value: CommandAddEnemy[]): void { this._AddEnemies = value; /* auto-property */ }
    /** @rva 0x7358E0  public CommandUnitCondition[] get_UnitConditions() { } */
    get_UnitConditions(): CommandUnitCondition[] { return this._UnitConditions; /* auto-property */ }
    /** @rva 0x735F20  public void set_UnitConditions(CommandUnitCondition[] value) { } */
    set_UnitConditions(value: CommandUnitCondition[]): void { this._UnitConditions = value; /* auto-property */ }
    /** @rva 0x7358F0  public CommandReproduction[] get_Reproductions() { } */
    get_Reproductions(): CommandReproduction[] { return this._Reproductions; /* auto-property */ }
    /** @rva 0x735A00  public void set_Reproductions(CommandReproduction[] value) { } */
    set_Reproductions(value: CommandReproduction[]): void { this._Reproductions = value; /* auto-property */ }
    /** @rva 0x735910  public CommandDebug[] get_Debugs() { } */
    get_Debugs(): CommandDebug[] { return this._Debugs; /* auto-property */ }
    /** @rva 0x735A20  public void set_Debugs(CommandDebug[] value) { } */
    set_Debugs(value: CommandDebug[]): void { this._Debugs = value; /* auto-property */ }
    /** @rva 0x735900  public CommandInitialize[] get_Initializations() { } */
    get_Initializations(): CommandInitialize[] { return this._Initializations; /* auto-property */ }
    /** @rva 0x735A10  public void set_Initializations(CommandInitialize[] value) { } */
    set_Initializations(value: CommandInitialize[]): void { this._Initializations = value; /* auto-property */ }
    /** @rva 0x736A10  public CommandFinalize[] get_Finalizations() { } */
    get_Finalizations(): CommandFinalize[] { return this._Finalizations; /* auto-property */ }
    /** @rva 0x736A50  public void set_Finalizations(CommandFinalize[] value) { } */
    set_Finalizations(value: CommandFinalize[]): void { this._Finalizations = value; /* auto-property */ }
    /** @rva 0x736A30  public CommandType[] get_CommandTypeOrder() { } */
    get_CommandTypeOrder(): CommandType[] { return this._CommandTypeOrder; /* auto-property */ }
    /** @rva 0x736A70  public void set_CommandTypeOrder(CommandType[] value) { } */
    set_CommandTypeOrder(value: CommandType[]): void { this._CommandTypeOrder = value; /* auto-property */ }
    /** @rva 0x1810E40  public void SetCommands(IReadOnlyList<CommandBase> commands) { } */
    SetCommands(commands: IReadOnlyList<CommandBase>): void { return notPorted("CommandPack.SetCommands", 0x1810E40); }
    /** @rva 0x1810920  public CommandBase[] RestoreCommands() { } */
    RestoreCommands(): CommandBase[] { return notPorted("CommandPack.RestoreCommands", 0x1810920); }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
