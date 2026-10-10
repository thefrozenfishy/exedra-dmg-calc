// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { IList, IReadOnlyList, List, Type } from "../runtime";
import type { BackupData } from "./BackupData";
import type { BattleUnitInfo } from "./Command/BattleUnitInfo";
import type { CommandBase } from "./Command/CommandBase";
import type { CommandType } from "./Command/CommandType";
import type { GameDirectorBase } from "./GameDirectorBase";
import type { GameSituationData } from "./GameSituationData";
import type { TurnActOrderUnitInfo } from "./TurnActOrderUnitInfo";

// ---- ReDriveBattleCore.BackupAgent  (TypeDefIndex 324, public sealed class) ----
export class BackupAgent {  // implements IObserver<IReadOnlyList<CommandBase>>
    static readonly __interfaces: readonly string[] = ['IObserver'];
    /** 0x0 private static readonly bool EnableEncryption */
    static EnableEncryption: boolean = false;
    /** 0x10 private readonly GameDirectorBase backupTarget */
    backupTarget: GameDirectorBase = null!;
    /** 0x8 private static readonly JsonSerializerSettings JsonSerializerSettings */
    static JsonSerializerSettings: any /* JsonSerializerSettings */ = null!;
    /** 0x10 private static readonly JsonSerializerSettings JsonSerializerSettingsForLog */
    static JsonSerializerSettingsForLog: any /* JsonSerializerSettings */ = null!;
    /** 0x18 private readonly BackupData backupData */
    backupData: BackupData = null!;
    /** 0x20 private List<CommandBase> allLogCommandList */
    allLogCommandList: List<CommandBase> = null!;
    /** 0x28 private List<CommandBase> logCommandListForBackup */
    logCommandListForBackup: List<CommandBase> = null!;
    /** 0x18 private static readonly CommandType[] LogCommandType */
    static LogCommandType: CommandType[] = null!;
    /** 0x30 private BattleUnitInfo[] prevUnits */
    prevUnits: BattleUnitInfo[] = null!;
    /** 0x38 private GameSituationData prevSituation */
    prevSituation: GameSituationData = null!;
    /** 0x40 private TurnActOrderUnitInfo prevTurnOrder */
    prevTurnOrder: TurnActOrderUnitInfo = null!;
    get BackupData(): BackupData { return this.get_BackupData(); }
    get AllLogCommandList(): List<CommandBase> { return this.get_AllLogCommandList(); }
    get LogCommandListForBackup(): List<CommandBase> { return this.get_LogCommandListForBackup(); }
    /** @rva 0x137AFF0  public void .ctor(GameDirectorBase backupTarget) { } */
    ctor$GameDirectorBase(backupTarget: GameDirectorBase): this { return notPorted("BackupAgent..ctor", 0x137AFF0); }
    /** @rva 0x733E90  public BackupData get_BackupData() { } */
    get_BackupData(): BackupData { return this.backupData; /* asm: mov rax, qword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x7369E0  public List<CommandBase> get_AllLogCommandList() { } */
    get_AllLogCommandList(): List<CommandBase> { return this.allLogCommandList; /* asm: mov rax, qword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x736EA0  public List<CommandBase> get_LogCommandListForBackup() { } */
    get_LogCommandListForBackup(): List<CommandBase> { return this.logCommandListForBackup; /* asm: mov rax, qword ptr [rcx + 0x28]; ret */ }
    /** @rva -1  public static string SerializeObject<T>(T obj, bool withEncrypt = True, bool isLog = False) { } */
    static SerializeObject<T>(obj: T, withEncrypt?: boolean /* = True */, isLog?: boolean /* = False */): string { return notPorted("BackupAgent.SerializeObject", 0); }
    /** @rva -1  public static T DeserializeObject<T>(string json, bool withDecrypt = True) { } */
    static DeserializeObject<T>(T$: abstract new (...args: any[]) => T, json: string, withDecrypt?: boolean /* = True */): T { return notPorted("BackupAgent.DeserializeObject", 0); }
    /** @rva 0x1379E70  public void MakeBackup(IReadOnlyList<CommandBase> commands) { } */
    MakeBackup(commands: IReadOnlyList<CommandBase>): void { return notPorted("BackupAgent.MakeBackup", 0x1379E70); }
    /** @rva 0x137A1A0  private void RecordLogCommands(IReadOnlyList<CommandBase> commands) { } */
    RecordLogCommands(commands: IReadOnlyList<CommandBase>): void { return notPorted("BackupAgent.RecordLogCommands", 0x137A1A0); }
    /** @rva 0x137A080  public static bool NeedBackup(IReadOnlyList<CommandBase> commands) { } */
    static NeedBackup(commands: IReadOnlyList<CommandBase>): boolean { return notPorted("BackupAgent.NeedBackup", 0x137A080); }
    /** @rva 0x137A3E0  public void RefreshPrevBackup() { } */
    RefreshPrevBackup(): void { return notPorted("BackupAgent.RefreshPrevBackup", 0x137A3E0); }
    /** @rva 0x137AA30  public static GameDirectorBase RestoreGameDirector(BackupData backupData) { } */
    static RestoreGameDirector(backupData: BackupData): GameDirectorBase { return notPorted("BackupAgent.RestoreGameDirector", 0x137AA30); }
    /** @rva 0x137A960  public List<CommandBase> RestoreCommands() { } */
    RestoreCommands(): List<CommandBase> { return notPorted("BackupAgent.RestoreCommands", 0x137A960); }
    /** @rva 0x137A8B0  public BattleUnitInfo[] RestoreBattleUnitInfoArray() { } */
    RestoreBattleUnitInfoArray(): BattleUnitInfo[] { return notPorted("BackupAgent.RestoreBattleUnitInfoArray", 0x137A8B0); }
    /** @rva 0x137ABD0  public GameSituationData RestorePrevSituationData() { } */
    RestorePrevSituationData(): GameSituationData { return notPorted("BackupAgent.RestorePrevSituationData", 0x137ABD0); }
    /** @rva 0x137AC60  public TurnActOrderUnitInfo RestoreTurnActOrderUnitInfo() { } */
    RestoreTurnActOrderUnitInfo(): TurnActOrderUnitInfo { return notPorted("BackupAgent.RestoreTurnActOrderUnitInfo", 0x137AC60); }
    /** @rva -1  public void RestoreLogCommands<T>(T logCommandsJsons) { } */
    RestoreLogCommands<T>(logCommandsJsons: T): void { return notPorted("BackupAgent.RestoreLogCommands", 0); }
    /** @rva 0x730170 slot 6  private void System.IObserver<System.Collections.Generic.IReadOnlyList<ReDriveBattleCore.Command.CommandBase>>.OnCompleted() { } */
    IObserver$OnCompleted(): void { /* asm: ret 0 */ }
    /** @rva 0x137AD20 slot 4  private void System.IObserver<System.Collections.Generic.IReadOnlyList<ReDriveBattleCore.Command.CommandBase>>.OnNext(IReadOnlyList<CommandBase> commands) { } */
    IObserver$OnNext(commands: IReadOnlyList<CommandBase>): void { return notPorted("BackupAgent.System.IObserver<System.Collections.Generic.IReadOnlyList<ReDriveBattleCore.Command.CommandBase>>.OnNext", 0x137AD20); }
    /** @rva 0x730170 slot 5  private void System.IObserver<System.Collections.Generic.IReadOnlyList<ReDriveBattleCore.Command.CommandBase>>.OnError(Exception e) { } */
    IObserver$OnError(e: any /* Exception */): void { /* asm: ret 0 */ }
    /** @rva 0x137AD30  private static void .cctor() { } */
    static cctor(): void { return notPorted("BackupAgent..cctor", 0x137AD30); }
}

// base type DefaultContractResolver is outside the ported set
// ---- ReDriveBattleCore.BackupAgent.ReDriveDefaultContractResolver  (TypeDefIndex 319, private class) ----
export class BackupAgent_ReDriveDefaultContractResolver {
    /** @rva 0x138B9E0 slot 19  protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization) { } */
    CreateProperties(type_: Type, memberSerialization: any /* MemberSerialization */): IList<any /* JsonProperty */> { return notPorted("BackupAgent_ReDriveDefaultContractResolver.CreateProperties", 0x138B9E0); }
    /** @rva 0x138BB70  public void .ctor() { } */
    ctor(): this { return notPorted("BackupAgent_ReDriveDefaultContractResolver..ctor", 0x138BB70); }
}

// ---- ReDriveBattleCore.BackupAgent.TypeDontSerializePropertyInfo  (TypeDefIndex 320, private class) ----
export class BackupAgent_TypeDontSerializePropertyInfo {
    /** 0x10 public Type type */
    type_: Type = null!;
    /** 0x18 public List<string> propertyNameList */
    propertyNameList: List<string> = null!;
    /** @rva 0x138C8B0  public bool ShouldRemoveProperty(JsonProperty jsonProperty) { } */
    ShouldRemoveProperty(jsonProperty: any /* JsonProperty */): boolean { return notPorted("BackupAgent_TypeDontSerializePropertyInfo.ShouldRemoveProperty", 0x138C8B0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.BackupAgent.ReDriveLogContractResolver  (TypeDefIndex 321, private class) ----
export class BackupAgent_ReDriveLogContractResolver extends BackupAgent_ReDriveDefaultContractResolver {
    /** 0x0 private static readonly List<BackupAgent.TypeDontSerializePropertyInfo> TypeDontSerializePropertyInfoList */
    static TypeDontSerializePropertyInfoList: List<BackupAgent_TypeDontSerializePropertyInfo> = null!;
    /** @rva 0x138BBC0 slot 19  protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization) { } */
    CreateProperties(type_: Type, memberSerialization: any /* MemberSerialization */): IList<any /* JsonProperty */> { return notPorted("BackupAgent_ReDriveLogContractResolver.CreateProperties", 0x138BBC0); }
    /** @rva 0x138BB70  public void .ctor() { } */
    ctor(): this { return notPorted("BackupAgent_ReDriveLogContractResolver..ctor", 0x138BB70); }
    /** @rva 0x138BF70  private static void .cctor() { } */
    static cctor(): void { return notPorted("BackupAgent_ReDriveLogContractResolver..cctor", 0x138BF70); }
}

// ---- ReDriveBattleCore.BackupAgent.GameDirectorSerializeWrapper  (TypeDefIndex 322, private class) ----
export class BackupAgent_GameDirectorSerializeWrapper {
    /** 0x10 private readonly GameDirectorBase gameDirector */
    gameDirector: GameDirectorBase = null!;
    /** @rva 0x737FB0  public void .ctor(GameDirectorBase gameDirector) { } */
    ctor$GameDirectorBase(gameDirector: GameDirectorBase): this { return notPorted("BackupAgent_GameDirectorSerializeWrapper..ctor", 0x737FB0); }
    /** @rva 0x730C50  public GameDirectorBase GetGameDirector() { } */
    GetGameDirector(): GameDirectorBase { return this.gameDirector; /* asm: mov rax, qword ptr [rcx + 0x10]; ret */ }
}
