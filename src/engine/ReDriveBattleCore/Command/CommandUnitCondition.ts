// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, float, int } from "../../runtime";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";
import type { BattleUnit } from "../BattleUnit";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";
import type { UnitStateData } from "./UnitStateData";
import type { AbnormalType } from "../UnitState/AbnormalType";

// ---- ReDriveBattleCore.Command.CommandUnitCondition  (TypeDefIndex 1027, public class) ----
export class CommandUnitCondition extends CommandBase {
    /** 0x18 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x1C private int <InitAtk>k__BackingField */
    _InitAtk: int = 0;
    /** 0x20 private int <Atk>k__BackingField */
    _Atk: int = 0;
    /** 0x24 private int <InitDef>k__BackingField */
    _InitDef: int = 0;
    /** 0x28 private int <Def>k__BackingField */
    _Def: int = 0;
    /** 0x2C private int <InitSpeed>k__BackingField */
    _InitSpeed: int = 0;
    /** 0x30 private int <Speed>k__BackingField */
    _Speed: int = 0;
    /** 0x38 private UnitStateData[] <UnitStates>k__BackingField */
    _UnitStates: UnitStateData[] = null!;
    /** 0x40 private int <BarrierEndurance>k__BackingField */
    _BarrierEndurance: int = 0;
    /** 0x48 private Dictionary<ElementType, float> <ElementResistRateDic>k__BackingField */
    _ElementResistRateDic: Dictionary<ElementType, float> = null!;
    /** 0x50 private Dictionary<AbnormalType, float> <AbnormalEffectParryRateDic>k__BackingField */
    _AbnormalEffectParryRateDic: Dictionary<AbnormalType, float> = null!;
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get InitAtk(): int { return this.get_InitAtk(); }
    set InitAtk(v: int) { this.set_InitAtk(v); }
    get Atk(): int { return this.get_Atk(); }
    set Atk(v: int) { this.set_Atk(v); }
    get InitDef(): int { return this.get_InitDef(); }
    set InitDef(v: int) { this.set_InitDef(v); }
    get Def(): int { return this.get_Def(); }
    set Def(v: int) { this.set_Def(v); }
    get InitSpeed(): int { return this.get_InitSpeed(); }
    set InitSpeed(v: int) { this.set_InitSpeed(v); }
    get Speed(): int { return this.get_Speed(); }
    set Speed(v: int) { this.set_Speed(v); }
    get UnitStates(): UnitStateData[] { return this.get_UnitStates(); }
    set UnitStates(v: UnitStateData[]) { this.set_UnitStates(v); }
    get BarrierEndurance(): int { return this.get_BarrierEndurance(); }
    set BarrierEndurance(v: int) { this.set_BarrierEndurance(v); }
    get ElementResistRateDic(): Dictionary<ElementType, float> { return this.get_ElementResistRateDic(); }
    set ElementResistRateDic(v: Dictionary<ElementType, float>) { this.set_ElementResistRateDic(v); }
    get AbnormalEffectParryRateDic(): Dictionary<AbnormalType, float> { return this.get_AbnormalEffectParryRateDic(); }
    set AbnormalEffectParryRateDic(v: Dictionary<AbnormalType, float>) { this.set_AbnormalEffectParryRateDic(v); }
    /** @rva 0x118F480 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 10 as CommandType; /* asm: mov eax, 0xa; ret */ }
    /** @rva 0x763820  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x8A2240  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_InitAtk() { } */
    get_InitAtk(): int { return this._InitAtk; /* auto-property */ }
    /** @rva 0x7F9820  public void set_InitAtk(int value) { } */
    set_InitAtk(value: int): void { this._InitAtk = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_Atk() { } */
    get_Atk(): int { return this._Atk; /* auto-property */ }
    /** @rva 0x8A2230  public void set_Atk(int value) { } */
    set_Atk(value: int): void { this._Atk = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_InitDef() { } */
    get_InitDef(): int { return this._InitDef; /* auto-property */ }
    /** @rva 0x75A840  public void set_InitDef(int value) { } */
    set_InitDef(value: int): void { this._InitDef = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_Def() { } */
    get_Def(): int { return this._Def; /* auto-property */ }
    /** @rva 0x8A2250  public void set_Def(int value) { } */
    set_Def(value: int): void { this._Def = value; /* auto-property */ }
    /** @rva 0x85E530  public int get_InitSpeed() { } */
    get_InitSpeed(): int { return this._InitSpeed; /* auto-property */ }
    /** @rva 0x8A2260  public void set_InitSpeed(int value) { } */
    set_InitSpeed(value: int): void { this._InitSpeed = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_Speed() { } */
    get_Speed(): int { return this._Speed; /* auto-property */ }
    /** @rva 0x8745A0  public void set_Speed(int value) { } */
    set_Speed(value: int): void { this._Speed = value; /* auto-property */ }
    /** @rva 0x736970  public UnitStateData[] get_UnitStates() { } */
    get_UnitStates(): UnitStateData[] { return this._UnitStates; /* auto-property */ }
    /** @rva 0x736A30  public void set_UnitStates(UnitStateData[] value) { } */
    set_UnitStates(value: UnitStateData[]): void { this._UnitStates = value; /* auto-property */ }
    /** @rva 0x7670B0  public int get_BarrierEndurance() { } */
    get_BarrierEndurance(): int { return this._BarrierEndurance; /* auto-property */ }
    /** @rva 0x767A90  public void set_BarrierEndurance(int value) { } */
    set_BarrierEndurance(value: int): void { this._BarrierEndurance = value; /* auto-property */ }
    /** @rva 0x7368F0  public Dictionary<ElementType, float> get_ElementResistRateDic() { } */
    get_ElementResistRateDic(): Dictionary<ElementType, float> { return this._ElementResistRateDic; /* auto-property */ }
    /** @rva 0x736A00  public void set_ElementResistRateDic(Dictionary<ElementType, float> value) { } */
    set_ElementResistRateDic(value: Dictionary<ElementType, float>): void { this._ElementResistRateDic = value; /* auto-property */ }
    /** @rva 0x736910  public Dictionary<AbnormalType, float> get_AbnormalEffectParryRateDic() { } */
    get_AbnormalEffectParryRateDic(): Dictionary<AbnormalType, float> { return this._AbnormalEffectParryRateDic; /* auto-property */ }
    /** @rva 0x736A20  public void set_AbnormalEffectParryRateDic(Dictionary<AbnormalType, float> value) { } */
    set_AbnormalEffectParryRateDic(value: Dictionary<AbnormalType, float>): void { this._AbnormalEffectParryRateDic = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17EB920  public void .ctor(BattleUnit battleUnit) { } */
    ctor$BattleUnit(battleUnit: BattleUnit): this { return notPorted("CommandUnitCondition..ctor", 0x17EB920); }
}
