// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, float, int } from "../../runtime";
import type { LinkHpType } from "../../Network/Definition/QuestOutGame/LinkHpType";
import type { BattleUnitInfo } from "./BattleUnitInfo";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { GameSituationData } from "../GameSituationData";
import type { ModeChangeReferee_ModeChangeInfo } from "../ModeChangeReferee";

// ---- ReDriveBattleCore.Command.CommandInitialize  (TypeDefIndex 998, public class) ----
export class CommandInitialize extends CommandBase {
    /** 0x18 private BattleUnitInfo[] <UnitInfoArray>k__BackingField */
    _UnitInfoArray: BattleUnitInfo[] = null!;
    /** 0x20 private int <AllyAttackTargetId>k__BackingField */
    _AllyAttackTargetId: int = 0;
    /** 0x24 private int <AllyFriendTargetId>k__BackingField */
    _AllyFriendTargetId: int = 0;
    /** 0x28 private int <EnemyAttackTargetId>k__BackingField */
    _EnemyAttackTargetId: int = 0;
    /** 0x2C private int <EnemyFriendTargetId>k__BackingField */
    _EnemyFriendTargetId: int = 0;
    /** 0x30 private int <AllySp>k__BackingField */
    _AllySp: int = 0;
    /** 0x34 private int <EnemySp>k__BackingField */
    _EnemySp: int = 0;
    /** 0x38 private int <MaxWave>k__BackingField */
    _MaxWave: int = 0;
    /** 0x3C private int <CurrentWave>k__BackingField */
    _CurrentWave: int = 0;
    /** 0x40 private bool <IsForcedAutomatic>k__BackingField */
    _IsForcedAutomatic: boolean = false;
    /** 0x41 private bool <IsSeasonBuffActive>k__BackingField */
    _IsSeasonBuffActive: boolean = false;
    /** 0x44 private int <CurrentSeasonBuffPoint>k__BackingField */
    _CurrentSeasonBuffPoint: int = 0;
    /** 0x48 private int <MaxSeasonBuffPoint>k__BackingField */
    _MaxSeasonBuffPoint: int = 0;
    /** 0x4C private int <ActiveMaxSeasonBuffPoint>k__BackingField */
    _ActiveMaxSeasonBuffPoint: int = 0;
    /** 0x50 private float <ActiveCurrentSeasonBuffTurnGaugeValue>k__BackingField */
    _ActiveCurrentSeasonBuffTurnGaugeValue: float = 0;
    /** 0x54 private int <ActiveMaxSeasonBuffTurnGaugeValue>k__BackingField */
    _ActiveMaxSeasonBuffTurnGaugeValue: int = 0;
    /** 0x58 private LinkHpType <LinkHpType>k__BackingField */
    _LinkHpType: LinkHpType = 0 as LinkHpType;
    /** 0x60 private string <LinkHpName>k__BackingField */
    _LinkHpName: string = null!;
    /** 0x68 private int <CurrentLinkHp>k__BackingField */
    _CurrentLinkHp: int = 0;
    /** 0x6C private int <MaxLinkHp>k__BackingField */
    _MaxLinkHp: int = 0;
    /** 0x70 private List<ModeChangeReferee.ModeChangeInfo> <ModeChangeInfoList>k__BackingField */
    _ModeChangeInfoList: List<ModeChangeReferee_ModeChangeInfo> = null!;
    /** 0x78 private int <ModeChangeCurrentStep>k__BackingField */
    _ModeChangeCurrentStep: int = 0;
    /** 0x80 private GameSituationData <GameSituationData>k__BackingField */
    _GameSituationData: GameSituationData = null!;
    get UnitInfoArray(): BattleUnitInfo[] { return this.get_UnitInfoArray(); }
    set UnitInfoArray(v: BattleUnitInfo[]) { this.set_UnitInfoArray(v); }
    get AllyAttackTargetId(): int { return this.get_AllyAttackTargetId(); }
    set AllyAttackTargetId(v: int) { this.set_AllyAttackTargetId(v); }
    get AllyFriendTargetId(): int { return this.get_AllyFriendTargetId(); }
    set AllyFriendTargetId(v: int) { this.set_AllyFriendTargetId(v); }
    get EnemyAttackTargetId(): int { return this.get_EnemyAttackTargetId(); }
    set EnemyAttackTargetId(v: int) { this.set_EnemyAttackTargetId(v); }
    get EnemyFriendTargetId(): int { return this.get_EnemyFriendTargetId(); }
    set EnemyFriendTargetId(v: int) { this.set_EnemyFriendTargetId(v); }
    get AllySp(): int { return this.get_AllySp(); }
    set AllySp(v: int) { this.set_AllySp(v); }
    get EnemySp(): int { return this.get_EnemySp(); }
    set EnemySp(v: int) { this.set_EnemySp(v); }
    get MaxWave(): int { return this.get_MaxWave(); }
    set MaxWave(v: int) { this.set_MaxWave(v); }
    get CurrentWave(): int { return this.get_CurrentWave(); }
    set CurrentWave(v: int) { this.set_CurrentWave(v); }
    get IsForcedAutomatic(): boolean { return this.get_IsForcedAutomatic(); }
    set IsForcedAutomatic(v: boolean) { this.set_IsForcedAutomatic(v); }
    get IsSeasonBuffActive(): boolean { return this.get_IsSeasonBuffActive(); }
    set IsSeasonBuffActive(v: boolean) { this.set_IsSeasonBuffActive(v); }
    get CurrentSeasonBuffPoint(): int { return this.get_CurrentSeasonBuffPoint(); }
    set CurrentSeasonBuffPoint(v: int) { this.set_CurrentSeasonBuffPoint(v); }
    get MaxSeasonBuffPoint(): int { return this.get_MaxSeasonBuffPoint(); }
    set MaxSeasonBuffPoint(v: int) { this.set_MaxSeasonBuffPoint(v); }
    get ActiveMaxSeasonBuffPoint(): int { return this.get_ActiveMaxSeasonBuffPoint(); }
    set ActiveMaxSeasonBuffPoint(v: int) { this.set_ActiveMaxSeasonBuffPoint(v); }
    get ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.get_ActiveCurrentSeasonBuffTurnGaugeValue(); }
    set ActiveCurrentSeasonBuffTurnGaugeValue(v: float) { this.set_ActiveCurrentSeasonBuffTurnGaugeValue(v); }
    get ActiveMaxSeasonBuffTurnGaugeValue(): int { return this.get_ActiveMaxSeasonBuffTurnGaugeValue(); }
    set ActiveMaxSeasonBuffTurnGaugeValue(v: int) { this.set_ActiveMaxSeasonBuffTurnGaugeValue(v); }
    get LinkHpType(): LinkHpType { return this.get_LinkHpType(); }
    set LinkHpType(v: LinkHpType) { this.set_LinkHpType(v); }
    get LinkHpName(): string { return this.get_LinkHpName(); }
    set LinkHpName(v: string) { this.set_LinkHpName(v); }
    get CurrentLinkHp(): int { return this.get_CurrentLinkHp(); }
    set CurrentLinkHp(v: int) { this.set_CurrentLinkHp(v); }
    get MaxLinkHp(): int { return this.get_MaxLinkHp(); }
    set MaxLinkHp(v: int) { this.set_MaxLinkHp(v); }
    get ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this.get_ModeChangeInfoList(); }
    set ModeChangeInfoList(v: List<ModeChangeReferee_ModeChangeInfo>) { this.set_ModeChangeInfoList(v); }
    get ModeChangeCurrentStep(): int { return this.get_ModeChangeCurrentStep(); }
    set ModeChangeCurrentStep(v: int) { this.set_ModeChangeCurrentStep(v); }
    get GameSituationData(): GameSituationData { return this.get_GameSituationData(); }
    set GameSituationData(v: GameSituationData) { this.set_GameSituationData(v); }
    /** @rva 0xECE170 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 13 as CommandType; /* asm: mov eax, 0xd; ret */ }
    /** @rva 0x733E90  public BattleUnitInfo[] get_UnitInfoArray() { } */
    get_UnitInfoArray(): BattleUnitInfo[] { return this._UnitInfoArray; /* auto-property */ }
    /** @rva 0x736AB0  public void set_UnitInfoArray(BattleUnitInfo[] value) { } */
    set_UnitInfoArray(value: BattleUnitInfo[]): void { this._UnitInfoArray = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_AllyAttackTargetId() { } */
    get_AllyAttackTargetId(): int { return this._AllyAttackTargetId; /* auto-property */ }
    /** @rva 0x8A2230  public void set_AllyAttackTargetId(int value) { } */
    set_AllyAttackTargetId(value: int): void { this._AllyAttackTargetId = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_AllyFriendTargetId() { } */
    get_AllyFriendTargetId(): int { return this._AllyFriendTargetId; /* auto-property */ }
    /** @rva 0x75A840  public void set_AllyFriendTargetId(int value) { } */
    set_AllyFriendTargetId(value: int): void { this._AllyFriendTargetId = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_EnemyAttackTargetId() { } */
    get_EnemyAttackTargetId(): int { return this._EnemyAttackTargetId; /* auto-property */ }
    /** @rva 0x8A2250  public void set_EnemyAttackTargetId(int value) { } */
    set_EnemyAttackTargetId(value: int): void { this._EnemyAttackTargetId = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_EnemyFriendTargetId() { } */
    get_EnemyFriendTargetId(): int { return this._EnemyFriendTargetId; /* auto-property */ }
    /** @rva 0x8A2260  public void set_EnemyFriendTargetId(int value) { } */
    set_EnemyFriendTargetId(value: int): void { this._EnemyFriendTargetId = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_AllySp() { } */
    get_AllySp(): int { return this._AllySp; /* auto-property */ }
    /** @rva 0x8745A0  public void set_AllySp(int value) { } */
    set_AllySp(value: int): void { this._AllySp = value; /* auto-property */ }
    /** @rva 0x75ED50  public int get_EnemySp() { } */
    get_EnemySp(): int { return this._EnemySp; /* auto-property */ }
    /** @rva 0x8A22A0  public void set_EnemySp(int value) { } */
    set_EnemySp(value: int): void { this._EnemySp = value; /* auto-property */ }
    /** @rva 0x75EDA0  public int get_MaxWave() { } */
    get_MaxWave(): int { return this._MaxWave; /* auto-property */ }
    /** @rva 0x8A22B0  public void set_MaxWave(int value) { } */
    set_MaxWave(value: int): void { this._MaxWave = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_CurrentWave() { } */
    get_CurrentWave(): int { return this._CurrentWave; /* auto-property */ }
    /** @rva 0x901F80  public void set_CurrentWave(int value) { } */
    set_CurrentWave(value: int): void { this._CurrentWave = value; /* auto-property */ }
    /** @rva 0x902790  public bool get_IsForcedAutomatic() { } */
    get_IsForcedAutomatic(): boolean { return this._IsForcedAutomatic; /* auto-property */ }
    /** @rva 0x9027C0  public void set_IsForcedAutomatic(bool value) { } */
    set_IsForcedAutomatic(value: boolean): void { this._IsForcedAutomatic = value; /* auto-property */ }
    /** @rva 0xA0E570  public bool get_IsSeasonBuffActive() { } */
    get_IsSeasonBuffActive(): boolean { return this._IsSeasonBuffActive; /* auto-property */ }
    /** @rva 0xA0E580  public void set_IsSeasonBuffActive(bool value) { } */
    set_IsSeasonBuffActive(value: boolean): void { this._IsSeasonBuffActive = value; /* auto-property */ }
    /** @rva 0x902010  public int get_CurrentSeasonBuffPoint() { } */
    get_CurrentSeasonBuffPoint(): int { return this._CurrentSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x902040  public void set_CurrentSeasonBuffPoint(int value) { } */
    set_CurrentSeasonBuffPoint(value: int): void { this._CurrentSeasonBuffPoint = value; /* auto-property */ }
    /** @rva 0x854810  public int get_MaxSeasonBuffPoint() { } */
    get_MaxSeasonBuffPoint(): int { return this._MaxSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x902050  public void set_MaxSeasonBuffPoint(int value) { } */
    set_MaxSeasonBuffPoint(value: int): void { this._MaxSeasonBuffPoint = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_ActiveMaxSeasonBuffPoint() { } */
    get_ActiveMaxSeasonBuffPoint(): int { return this._ActiveMaxSeasonBuffPoint; /* auto-property */ }
    /** @rva 0x902030  public void set_ActiveMaxSeasonBuffPoint(int value) { } */
    set_ActiveMaxSeasonBuffPoint(value: int): void { this._ActiveMaxSeasonBuffPoint = value; /* auto-property */ }
    /** @rva 0xEB9770  public float get_ActiveCurrentSeasonBuffTurnGaugeValue() { } */
    get_ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this._ActiveCurrentSeasonBuffTurnGaugeValue; /* auto-property */ }
    /** @rva 0x17E9570  public void set_ActiveCurrentSeasonBuffTurnGaugeValue(float value) { } */
    set_ActiveCurrentSeasonBuffTurnGaugeValue(value: float): void { this._ActiveCurrentSeasonBuffTurnGaugeValue = value; /* auto-property */ }
    /** @rva 0x8A2210  public int get_ActiveMaxSeasonBuffTurnGaugeValue() { } */
    get_ActiveMaxSeasonBuffTurnGaugeValue(): int { return this._ActiveMaxSeasonBuffTurnGaugeValue; /* auto-property */ }
    /** @rva 0x8A22E0  public void set_ActiveMaxSeasonBuffTurnGaugeValue(int value) { } */
    set_ActiveMaxSeasonBuffTurnGaugeValue(value: int): void { this._ActiveMaxSeasonBuffTurnGaugeValue = value; /* auto-property */ }
    /** @rva 0x737C40  public LinkHpType get_LinkHpType() { } */
    get_LinkHpType(): LinkHpType { return this._LinkHpType; /* auto-property */ }
    /** @rva 0x737DF0  public void set_LinkHpType(LinkHpType value) { } */
    set_LinkHpType(value: LinkHpType): void { this._LinkHpType = value; /* auto-property */ }
    /** @rva 0x737A10  public string get_LinkHpName() { } */
    get_LinkHpName(): string { return this._LinkHpName; /* auto-property */ }
    /** @rva 0x737A50  public void set_LinkHpName(string value) { } */
    set_LinkHpName(value: string): void { this._LinkHpName = value; /* auto-property */ }
    /** @rva 0x901BF0  public int get_CurrentLinkHp() { } */
    get_CurrentLinkHp(): int { return this._CurrentLinkHp; /* auto-property */ }
    /** @rva 0x901C00  public void set_CurrentLinkHp(int value) { } */
    set_CurrentLinkHp(value: int): void { this._CurrentLinkHp = value; /* auto-property */ }
    /** @rva 0x8570F0  public int get_MaxLinkHp() { } */
    get_MaxLinkHp(): int { return this._MaxLinkHp; /* auto-property */ }
    /** @rva 0x901C10  public void set_MaxLinkHp(int value) { } */
    set_MaxLinkHp(value: int): void { this._MaxLinkHp = value; /* auto-property */ }
    /** @rva 0x737A20  public List<ModeChangeReferee.ModeChangeInfo> get_ModeChangeInfoList() { } */
    get_ModeChangeInfoList(): List<ModeChangeReferee_ModeChangeInfo> { return this._ModeChangeInfoList; /* auto-property */ }
    /** @rva 0x737A60  public void set_ModeChangeInfoList(List<ModeChangeReferee.ModeChangeInfo> value) { } */
    set_ModeChangeInfoList(value: List<ModeChangeReferee_ModeChangeInfo>): void { this._ModeChangeInfoList = value; /* auto-property */ }
    /** @rva 0x927C30  public int get_ModeChangeCurrentStep() { } */
    get_ModeChangeCurrentStep(): int { return this._ModeChangeCurrentStep; /* auto-property */ }
    /** @rva 0x927C50  public void set_ModeChangeCurrentStep(int value) { } */
    set_ModeChangeCurrentStep(value: int): void { this._ModeChangeCurrentStep = value; /* auto-property */ }
    /** @rva 0x737D80  public GameSituationData get_GameSituationData() { } */
    get_GameSituationData(): GameSituationData { return this._GameSituationData; /* auto-property */ }
    /** @rva 0x737F70  public void set_GameSituationData(GameSituationData value) { } */
    set_GameSituationData(value: GameSituationData): void { this._GameSituationData = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17E94E0  public void .ctor(BattleUnitInfo[] battleUnitInfoArray, int allyAttackTargetId, int allyFriendTargetId, int enemyAttackTargetId, int enemyFriendTargetId, int allySp, int enemySp, bool isForcedAutomatic, GameSituationData gameSituationData) { } */
    ctor$BattleUnitInfo_int_int_int_int_int_int_bool_GameSituationData(battleUnitInfoArray: BattleUnitInfo[], allyAttackTargetId: int, allyFriendTargetId: int, enemyAttackTargetId: int, enemyFriendTargetId: int, allySp: int, enemySp: int, isForcedAutomatic: boolean, gameSituationData: GameSituationData): this {
        this._UnitInfoArray = battleUnitInfoArray;
        this._EnemyAttackTargetId = enemyAttackTargetId;
        this._EnemyFriendTargetId = enemyFriendTargetId;
        this._AllySp = allySp;
        this._EnemySp = enemySp;
        this._IsForcedAutomatic = isForcedAutomatic;
        this._AllyAttackTargetId = allyAttackTargetId;
        this._AllyFriendTargetId = allyFriendTargetId;
        this._GameSituationData = gameSituationData;
        return this;
    }
    /** @rva 0x17E94D0  public void SetWave(int maxWave, int currentWave) { } */
    SetWave(maxWave: int, currentWave: int): void {
        this._MaxWave = maxWave;
        this._CurrentWave = currentWave;
    }
    /** @rva 0x17E94A0  public void SetSoloRaidBuffInfo(bool isSeasonBuffActive, int currentSeasonBuffPoint, int maxSeasonBuffPoint, int activeMaxSeasonBuffPoint, float activeCurrentSeasonBuffTurnGaugeValue, int activeMaxSeasonBuffTurnGaugeValue) { } */
    SetSoloRaidBuffInfo(isSeasonBuffActive: boolean, currentSeasonBuffPoint: int, maxSeasonBuffPoint: int, activeMaxSeasonBuffPoint: int, activeCurrentSeasonBuffTurnGaugeValue: float, activeMaxSeasonBuffTurnGaugeValue: int): void {
        this._ActiveMaxSeasonBuffPoint = activeMaxSeasonBuffPoint;
        this._ActiveMaxSeasonBuffTurnGaugeValue = activeMaxSeasonBuffTurnGaugeValue;
        this._ActiveCurrentSeasonBuffTurnGaugeValue = activeCurrentSeasonBuffTurnGaugeValue;
        this._IsSeasonBuffActive = isSeasonBuffActive;
        this._CurrentSeasonBuffPoint = currentSeasonBuffPoint;
        this._MaxSeasonBuffPoint = maxSeasonBuffPoint;
    }
    /** @rva 0x17E9430  public void SetLinkHp(LinkHpType linkHpType, string linkHpName, int currentLinkHp, int maxLinkHp) { } */
    SetLinkHp(linkHpType: LinkHpType, linkHpName: string, currentLinkHp: int, maxLinkHp: int): void {
        this._LinkHpType = linkHpType;
        this._LinkHpName = linkHpName;
        this._MaxLinkHp = maxLinkHp;
        this._CurrentLinkHp = currentLinkHp;
    }
    /** @rva 0x17E9470  public void SetModeChangeData(List<ModeChangeReferee.ModeChangeInfo> modeChangeInfoList, int modeChangeCurrentStep) { } */
    SetModeChangeData(modeChangeInfoList: List<ModeChangeReferee_ModeChangeInfo>, modeChangeCurrentStep: int): void {
        this._ModeChangeInfoList = modeChangeInfoList;
        this._ModeChangeCurrentStep = modeChangeCurrentStep;
    }
}
