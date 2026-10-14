// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { SkillDetailMstRecord } from "../Network/Definition/Skill/SkillDetailMstRecord";
import { SkillDetailMstModel } from "./Model/SkillDetailMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { CountdownStartUnitState } from "./UnitState/CountdownStartUnitState";
import { StateAbilityEffect } from "./AbilityEffect/StateAbilityEffect";
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
    get_HasActiveCountdownSkill(): boolean {
        if (this.canActiveSkillMstId === 0) return false;
        return this.canActiveSkillDetailMstId !== 0;
    }
    /** @rva 0x1494BF0  public bool get_IsCountdownActive() { } */
    get_IsCountdownActive(): boolean { return this.countdown > 0; }
    /** @rva 0x14944B0  public void Initialize(Dictionary<int, BattleUnit> battleUnitDic) { } */
    Initialize(battleUnitDic: Dictionary<int, BattleUnit>): void {
        this.ResetParameter(); // inlined in the game
        this.LoadCanActiveCountdownSkill(battleUnitDic);
    }
    /** @rva 0x1494310  public void InitializeForRestart(Dictionary<int, BattleUnit> battleUnitDic, int currentCount, int currentDamage, int turnOrderPriority) { } */
    InitializeForRestart(battleUnitDic: Dictionary<int, BattleUnit>, currentCount: int, currentDamage: int, turnOrderPriority: int): void {
        this.ResetParameter(); // inlined in the game
        this.LoadCanActiveCountdownSkill(battleUnitDic);
        const detail = BattleMstReaderBase.get_Instance<SkillDetailMstModel, SkillDetailMstRecord, int>(SkillDetailMstModel).GetModelByKey(this.canActiveSkillDetailMstId);
        if (detail != null && this.canActiveSkillMstId !== 0 && this.canActiveSkillDetailMstId !== 0 && currentCount > 0) {
            this.SetCountdownForRestart(currentCount, detail.get_Turn() - 1, currentDamage, detail.get_Value1(), this.canActiveEnemyUnitId, battleUnitDic, turnOrderPriority);
        }
    }
    /** @rva 0x1494860  private void ResetParameter() { } */
    ResetParameter(): void {
        // qword stores at 0x10/0x18/0x20/0x28: every int field 0x10..0x2c is cleared
        this.maxCountdown = 0;
        this.countdown = 0;
        this.cancelMaxTotalDamage = 0;
        this.cancelTotalDamage = 0;
        this.battleUnitId = 0;
        this.canActiveSkillMstId = 0;
        this.canActiveSkillDetailMstId = 0;
        this.canActiveEnemyUnitId = 0;
    }
    /** @rva 0x14944D0  private void LoadCanActiveCountdownSkill(Dictionary<int, BattleUnit> battleUnitDic) { } */
    LoadCanActiveCountdownSkill(battleUnitDic: Dictionary<int, BattleUnit>): void {
        const enemies = [...battleUnitDic.values()].filter(data => data._Team === 1); // <>c.b__31_0
        for (const unit of enemies) {
            for (const skill of unit.get_ActiveSkills()) {
                const state = skill.GetAbilityEffectList().filter((e): e is StateAbilityEffect => e instanceof StateAbilityEffect)
                    .map(eff => eff._GiveUnitState) // <>c.b__31_1
                    .find(s => s instanceof CountdownStartUnitState) ?? null;
                if (state != null) {
                    this.canActiveSkillMstId = skill._Id;
                    this.canActiveSkillDetailMstId = state._MstId;
                    this.canActiveEnemyUnitId = unit._Id;
                    return;
                }
            }
        }
    }
    /** @rva 0x14942F0  public void DecreaseCountdown() { } */
    DecreaseCountdown(): void {
        let v = this.countdown - 1;
        if (v < 0) v = 0;
        this.countdown = v;
    }
    /** @rva 0x14942D0  public void AddCancelTotalDamage(int damage) { } */
    AddCancelTotalDamage(damage: int): void {
        this.cancelTotalDamage = damage + this.cancelTotalDamage;
        if (this.cancelMaxTotalDamage < this.cancelTotalDamage) this.cancelTotalDamage = this.cancelMaxTotalDamage;
    }
    /** @rva 0x1494B90  public void StartCountdown(int maxCountdown, int maxCancelTotalDamage, int battleUnitId) { } */
    StartCountdown(maxCountdown: int, maxCancelTotalDamage: int, battleUnitId: int): void {
        this.maxCountdown = maxCountdown;
        this.countdown = maxCountdown;
        this.cancelMaxTotalDamage = maxCancelTotalDamage;
        this.cancelTotalDamage = 0;
        this.battleUnitId = battleUnitId;
    }
    /** @rva 0x1494880  public void SetCountdownForRestart(int countdown, int maxCountdown, int cancelTotalDamage, int cancelMaxTotalDamage, int battleUnitId, Dictionary<int, BattleUnit> battleUnitDic, int turnOrderPriority) { } */
    SetCountdownForRestart(countdown: int, maxCountdown: int, cancelTotalDamage: int, cancelMaxTotalDamage: int, battleUnitId: int, battleUnitDic: Dictionary<int, BattleUnit>, turnOrderPriority: int): void {
        const unit = [...battleUnitDic.values()].find(u => this.$SetCountdownForRestart$b__35_0(u)) ?? null;
        for (const skill of unit!.get_ActiveSkills()) {
            const state = skill.GetAbilityEffectList().filter((e): e is StateAbilityEffect => e instanceof StateAbilityEffect)
                .map(eff => eff._GiveUnitState) // <>c.b__35_1
                .find(s => s instanceof CountdownStartUnitState) ?? null;
            if (state != null) {
                unit!._Condition.AddUnitState(state.Clone(), unit!, turnOrderPriority, null!, false);
                break;
            }
        }
        this.countdown = countdown;
        this.maxCountdown = maxCountdown;
        this.cancelMaxTotalDamage = cancelMaxTotalDamage;
        this.battleUnitId = battleUnitId;
        this.cancelTotalDamage = cancelTotalDamage;
    }
    /** @rva 0x1494300  public void EndCountdown() { } */
    EndCountdown(): void {
        // qword stores at 0x10/0x18 and a dword at 0x20
        this.maxCountdown = 0;
        this.countdown = 0;
        this.cancelMaxTotalDamage = 0;
        this.cancelTotalDamage = 0;
        this.battleUnitId = 0;
    }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1494BB0  private bool <SetCountdownForRestart>b__35_0(BattleUnit unit) { } */
    $SetCountdownForRestart$b__35_0(unit: BattleUnit): boolean { return unit._Id === this.canActiveEnemyUnitId; }
}
