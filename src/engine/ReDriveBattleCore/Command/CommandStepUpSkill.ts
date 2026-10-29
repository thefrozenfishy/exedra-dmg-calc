// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandStepUpSkill  (TypeDefIndex 1036, public class) ----
export class CommandStepUpSkill extends CommandBase {
    /** 0x18 private int <UnitId>k__BackingField */
    _UnitId: int = 0;
    /** 0x1C private int <SkillMstId>k__BackingField */
    _SkillMstId: int = 0;
    /** 0x20 private int <Sp>k__BackingField */
    _Sp: int = 0;
    /** 0x24 private bool <IsSucceeded>k__BackingField */
    _IsSucceeded: boolean = false;
    /** 0x28 private int <StepLevel>k__BackingField */
    _StepLevel: int = 0;
    /** 0x2C private int <ExpectedConsumeSp>k__BackingField */
    _ExpectedConsumeSp: int = 0;
    /** 0x30 private bool <CanStepUpFurther>k__BackingField */
    _CanStepUpFurther: boolean = false;
    get UnitId(): int { return this.get_UnitId(); }
    set UnitId(v: int) { this.set_UnitId(v); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    set SkillMstId(v: int) { this.set_SkillMstId(v); }
    get Sp(): int { return this.get_Sp(); }
    set Sp(v: int) { this.set_Sp(v); }
    get IsSucceeded(): boolean { return this.get_IsSucceeded(); }
    set IsSucceeded(v: boolean) { this.set_IsSucceeded(v); }
    get StepLevel(): int { return this.get_StepLevel(); }
    set StepLevel(v: int) { this.set_StepLevel(v); }
    get ExpectedConsumeSp(): int { return this.get_ExpectedConsumeSp(); }
    set ExpectedConsumeSp(v: int) { this.set_ExpectedConsumeSp(v); }
    get CanStepUpFurther(): boolean { return this.get_CanStepUpFurther(); }
    set CanStepUpFurther(v: boolean) { this.set_CanStepUpFurther(v); }
    /** @rva 0x17FD6F0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 34 as CommandType; /* asm: mov eax, 0x22; ret */ }
    /** @rva 0x763820  public int get_UnitId() { } */
    get_UnitId(): int { return this._UnitId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_UnitId(int value) { } */
    set_UnitId(value: int): void { this._UnitId = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this._SkillMstId; /* auto-property */ }
    /** @rva 0x7F9820  public void set_SkillMstId(int value) { } */
    set_SkillMstId(value: int): void { this._SkillMstId = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_Sp() { } */
    get_Sp(): int { return this._Sp; /* auto-property */ }
    /** @rva 0x8A2230  public void set_Sp(int value) { } */
    set_Sp(value: int): void { this._Sp = value; /* auto-property */ }
    /** @rva 0x8A21C0  public bool get_IsSucceeded() { } */
    get_IsSucceeded(): boolean { return this._IsSucceeded; /* auto-property */ }
    /** @rva 0x8A2270  public void set_IsSucceeded(bool value) { } */
    set_IsSucceeded(value: boolean): void { this._IsSucceeded = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_StepLevel() { } */
    get_StepLevel(): int { return this._StepLevel; /* auto-property */ }
    /** @rva 0x8A2250  public void set_StepLevel(int value) { } */
    set_StepLevel(value: int): void { this._StepLevel = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_ExpectedConsumeSp() { } */
    get_ExpectedConsumeSp(): int { return this._ExpectedConsumeSp; /* auto-property */ }
    /** @rva 0x8A2260  public void set_ExpectedConsumeSp(int value) { } */
    set_ExpectedConsumeSp(value: int): void { this._ExpectedConsumeSp = value; /* auto-property */ }
    /** @rva 0x75F800  public bool get_CanStepUpFurther() { } */
    get_CanStepUpFurther(): boolean { return this._CanStepUpFurther; /* auto-property */ }
    /** @rva 0x75F830  public void set_CanStepUpFurther(bool value) { } */
    set_CanStepUpFurther(value: boolean): void { this._CanStepUpFurther = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x72f170 */ }
}
