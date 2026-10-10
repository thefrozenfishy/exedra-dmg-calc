// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.CountdownReferee  (TypeDefIndex 373, public class) ----
export class CountdownReferee {
    /** 0x10 private int maxCountdown */
    maxCountdown: int = 0;
    /** 0x14 private int countdown */
    countdown: int = 0;
    /** 0x18 private int cancelMaxTotalDamage */
    cancelMaxTotalDamage: int = 0;
    /** 0x1C private int cancelTotalDamage */
    cancelTotalDamage: int = 0;
    /** 0x20 private int battleUnitId */
    battleUnitId: int = 0;
    /** 0x24 private int canActiveSkillMstId */
    canActiveSkillMstId: int = 0;
    /** 0x28 private int canActiveSkillDetailMstId */
    canActiveSkillDetailMstId: int = 0;
    /** 0x2C private int canActiveEnemyUnitId */
    canActiveEnemyUnitId: int = 0;
    get MaxCountdown(): int { return this.get_MaxCountdown(); }
    get Countdown(): int { return this.get_Countdown(); }
    get CancelMaxTotalDamage(): int { return this.get_CancelMaxTotalDamage(); }
    get CancelTotalDamage(): int { return this.get_CancelTotalDamage(); }
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    get CanActiveSkillMstId(): int { return this.get_CanActiveSkillMstId(); }
    get CanActiveSkillDetailMstId(): int { return this.get_CanActiveSkillDetailMstId(); }
    get CanActiveEnemyUnitId(): int { return this.get_CanActiveEnemyUnitId(); }
    get HasActiveCountdownSkill(): boolean { return this.get_HasActiveCountdownSkill(); }
    get IsCountdownActive(): boolean { return this.get_IsCountdownActive(); }
    /** @rva 0x7364F0  public int get_MaxCountdown() { } */
    get_MaxCountdown(): int { return this.maxCountdown; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x803350  public int get_Countdown() { } */
    get_Countdown(): int { return this.countdown; /* asm: mov eax, dword ptr [rcx + 0x14]; ret */ }
    /** @rva 0x763820  public int get_CancelMaxTotalDamage() { } */
    get_CancelMaxTotalDamage(): int { return this.cancelMaxTotalDamage; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x7F9800  public int get_CancelTotalDamage() { } */
    get_CancelTotalDamage(): int { return this.cancelTotalDamage; /* asm: mov eax, dword ptr [rcx + 0x1c]; ret */ }
    /** @rva 0x75ED70  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this.battleUnitId; /* asm: mov eax, dword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x75A830  public int get_CanActiveSkillMstId() { } */
    get_CanActiveSkillMstId(): int { return this.canActiveSkillMstId; /* asm: mov eax, dword ptr [rcx + 0x24]; ret */ }
    /** @rva 0x7637A0  public int get_CanActiveSkillDetailMstId() { } */
    get_CanActiveSkillDetailMstId(): int { return this.canActiveSkillDetailMstId; /* asm: mov eax, dword ptr [rcx + 0x28]; ret */ }
    /** @rva 0x85E530  public int get_CanActiveEnemyUnitId() { } */
    get_CanActiveEnemyUnitId(): int { return this.canActiveEnemyUnitId; /* asm: mov eax, dword ptr [rcx + 0x2c]; ret */ }
    /** @rva 0x1494BD0  public bool get_HasActiveCountdownSkill() { } */
    get_HasActiveCountdownSkill(): boolean { return notPorted("CountdownReferee.get_HasActiveCountdownSkill", 0x1494BD0); }
    /** @rva 0x1494BF0  public bool get_IsCountdownActive() { } */
    get_IsCountdownActive(): boolean { return notPorted("CountdownReferee.get_IsCountdownActive", 0x1494BF0); }
    /** @rva 0x14944B0  public void Initialize(Dictionary<int, BattleUnit> battleUnitDic) { } */
    Initialize(battleUnitDic: Dictionary<int, BattleUnit>): void { return notPorted("CountdownReferee.Initialize", 0x14944B0); }
    /** @rva 0x1494310  public void InitializeForRestart(Dictionary<int, BattleUnit> battleUnitDic, int currentCount, int currentDamage, int turnOrderPriority) { } */
    InitializeForRestart(battleUnitDic: Dictionary<int, BattleUnit>, currentCount: int, currentDamage: int, turnOrderPriority: int): void { return notPorted("CountdownReferee.InitializeForRestart", 0x1494310); }
    /** @rva 0x1494860  private void ResetParameter() { } */
    ResetParameter(): void {
        this.maxCountdown = 0;
        this.cancelMaxTotalDamage = 0;
        this.battleUnitId = 0;
        this.canActiveSkillDetailMstId = 0;
    }
    /** @rva 0x14944D0  private void LoadCanActiveCountdownSkill(Dictionary<int, BattleUnit> battleUnitDic) { } */
    LoadCanActiveCountdownSkill(battleUnitDic: Dictionary<int, BattleUnit>): void { return notPorted("CountdownReferee.LoadCanActiveCountdownSkill", 0x14944D0); }
    /** @rva 0x14942F0  public void DecreaseCountdown() { } */
    DecreaseCountdown(): void { return notPorted("CountdownReferee.DecreaseCountdown", 0x14942F0); }
    /** @rva 0x14942D0  public void AddCancelTotalDamage(int damage) { } */
    AddCancelTotalDamage(damage: int): void { return notPorted("CountdownReferee.AddCancelTotalDamage", 0x14942D0); }
    /** @rva 0x1494B90  public void StartCountdown(int maxCountdown, int maxCancelTotalDamage, int battleUnitId) { } */
    StartCountdown(maxCountdown: int, maxCancelTotalDamage: int, battleUnitId: int): void {
        this.maxCountdown = maxCountdown;
        this.countdown = maxCountdown;
        this.cancelMaxTotalDamage = maxCancelTotalDamage;
        this.cancelTotalDamage = 0;
        this.battleUnitId = battleUnitId;
    }
    /** @rva 0x1494880  public void SetCountdownForRestart(int countdown, int maxCountdown, int cancelTotalDamage, int cancelMaxTotalDamage, int battleUnitId, Dictionary<int, BattleUnit> battleUnitDic, int turnOrderPriority) { } */
    SetCountdownForRestart(countdown: int, maxCountdown: int, cancelTotalDamage: int, cancelMaxTotalDamage: int, battleUnitId: int, battleUnitDic: Dictionary<int, BattleUnit>, turnOrderPriority: int): void { return notPorted("CountdownReferee.SetCountdownForRestart", 0x1494880); }
    /** @rva 0x1494300  public void EndCountdown() { } */
    EndCountdown(): void {
        this.maxCountdown = 0;
        this.cancelMaxTotalDamage = 0;
        this.battleUnitId = 0;
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1494BB0  private bool <SetCountdownForRestart>b__35_0(BattleUnit unit) { } */
    $SetCountdownForRestart$b__35_0(unit: BattleUnit): boolean { return notPorted("CountdownReferee.<SetCountdownForRestart>b__35_0", 0x1494BB0); }
}
