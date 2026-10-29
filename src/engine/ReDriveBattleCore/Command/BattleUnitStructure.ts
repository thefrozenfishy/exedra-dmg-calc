// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { AbilitySourceType } from "../../Network/Definition/Battle/AbilitySourceType";

// ---- ReDriveBattleCore.Command.BattleUnitStructure  (TypeDefIndex 969, public sealed class) ----
export class BattleUnitStructure {
    /** 0x10 private int <MstId>k__BackingField */
    _MstId: int = 0;
    /** 0x14 private int <StyleMstId>k__BackingField */
    _StyleMstId: int = 0;
    /** 0x18 private int <MaxHP>k__BackingField */
    _MaxHP: int = 0;
    /** 0x1C private int <EP>k__BackingField */
    _EP: int = 0;
    /** 0x20 private int <Speed>k__BackingField */
    _Speed: int = 0;
    /** 0x24 private int <SpecialAttackMstId>k__BackingField */
    _SpecialAttackMstId: int = 0;
    /** 0x28 private int[] <ActiveSkillAttackMstIds>k__BackingField */
    _ActiveSkillAttackMstIds: int[] = null!;
    /** 0x30 private int <NormalAttackMstId>k__BackingField */
    _NormalAttackMstId: int = 0;
    /** 0x38 private BattleUnitStructure.PassiveSkillInfo[] <PassiveSkills>k__BackingField */
    _PassiveSkills: BattleUnitStructure_PassiveSkillInfo[] = null!;
    /** 0x40 private int <BreakPoint>k__BackingField */
    _BreakPoint: int = 0;
    /** 0x44 private int <InitialBreakDamageReceiveRatio>k__BackingField */
    _InitialBreakDamageReceiveRatio: int = 0;
    /** 0x48 private int <MaxBreakDamageReceiveRatio>k__BackingField */
    _MaxBreakDamageReceiveRatio: int = 0;
    /** 0x4C private int <BreakTurnGaugeSlowRatio>k__BackingField */
    _BreakTurnGaugeSlowRatio: int = 0;
    get MstId(): int { return this.get_MstId(); }
    set MstId(v: int) { this.set_MstId(v); }
    get StyleMstId(): int { return this.get_StyleMstId(); }
    set StyleMstId(v: int) { this.set_StyleMstId(v); }
    get MaxHP(): int { return this.get_MaxHP(); }
    set MaxHP(v: int) { this.set_MaxHP(v); }
    get EP(): int { return this.get_EP(); }
    set EP(v: int) { this.set_EP(v); }
    get Speed(): int { return this.get_Speed(); }
    set Speed(v: int) { this.set_Speed(v); }
    get SpecialAttackMstId(): int { return this.get_SpecialAttackMstId(); }
    set SpecialAttackMstId(v: int) { this.set_SpecialAttackMstId(v); }
    get ActiveSkillAttackMstIds(): int[] { return this.get_ActiveSkillAttackMstIds(); }
    set ActiveSkillAttackMstIds(v: int[]) { this.set_ActiveSkillAttackMstIds(v); }
    get NormalAttackMstId(): int { return this.get_NormalAttackMstId(); }
    set NormalAttackMstId(v: int) { this.set_NormalAttackMstId(v); }
    get PassiveSkills(): BattleUnitStructure_PassiveSkillInfo[] { return this.get_PassiveSkills(); }
    set PassiveSkills(v: BattleUnitStructure_PassiveSkillInfo[]) { this.set_PassiveSkills(v); }
    get BreakPoint(): int { return this.get_BreakPoint(); }
    set BreakPoint(v: int) { this.set_BreakPoint(v); }
    get InitialBreakDamageReceiveRatio(): int { return this.get_InitialBreakDamageReceiveRatio(); }
    set InitialBreakDamageReceiveRatio(v: int) { this.set_InitialBreakDamageReceiveRatio(v); }
    get MaxBreakDamageReceiveRatio(): int { return this.get_MaxBreakDamageReceiveRatio(); }
    set MaxBreakDamageReceiveRatio(v: int) { this.set_MaxBreakDamageReceiveRatio(v); }
    get BreakTurnGaugeSlowRatio(): int { return this.get_BreakTurnGaugeSlowRatio(); }
    set BreakTurnGaugeSlowRatio(v: int) { this.set_BreakTurnGaugeSlowRatio(v); }
    /** @rva 0x7364F0  public int get_MstId() { } */
    get_MstId(): int { return this._MstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_MstId(int value) { } */
    set_MstId(value: int): void { this._MstId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_StyleMstId() { } */
    get_StyleMstId(): int { return this._StyleMstId; /* auto-property */ }
    /** @rva 0x803540  public void set_StyleMstId(int value) { } */
    set_StyleMstId(value: int): void { this._StyleMstId = value; /* auto-property */ }
    /** @rva 0x763820  public int get_MaxHP() { } */
    get_MaxHP(): int { return this._MaxHP; /* auto-property */ }
    /** @rva 0x8A2240  public void set_MaxHP(int value) { } */
    set_MaxHP(value: int): void { this._MaxHP = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_EP() { } */
    get_EP(): int { return this._EP; /* auto-property */ }
    /** @rva 0x7F9820  public void set_EP(int value) { } */
    set_EP(value: int): void { this._EP = value; /* auto-property */ }
    /** @rva 0x75ED70  public int get_Speed() { } */
    get_Speed(): int { return this._Speed; /* auto-property */ }
    /** @rva 0x8A2230  public void set_Speed(int value) { } */
    set_Speed(value: int): void { this._Speed = value; /* auto-property */ }
    /** @rva 0x75A830  public int get_SpecialAttackMstId() { } */
    get_SpecialAttackMstId(): int { return this._SpecialAttackMstId; /* auto-property */ }
    /** @rva 0x75A840  public void set_SpecialAttackMstId(int value) { } */
    set_SpecialAttackMstId(value: int): void { this._SpecialAttackMstId = value; /* auto-property */ }
    /** @rva 0x736EA0  public int[] get_ActiveSkillAttackMstIds() { } */
    get_ActiveSkillAttackMstIds(): int[] { return this._ActiveSkillAttackMstIds; /* auto-property */ }
    /** @rva 0x736F10  public void set_ActiveSkillAttackMstIds(int[] value) { } */
    set_ActiveSkillAttackMstIds(value: int[]): void { this._ActiveSkillAttackMstIds = value; /* auto-property */ }
    /** @rva 0x75ED60  public int get_NormalAttackMstId() { } */
    get_NormalAttackMstId(): int { return this._NormalAttackMstId; /* auto-property */ }
    /** @rva 0x8745A0  public void set_NormalAttackMstId(int value) { } */
    set_NormalAttackMstId(value: int): void { this._NormalAttackMstId = value; /* auto-property */ }
    /** @rva 0x736970  public BattleUnitStructure.PassiveSkillInfo[] get_PassiveSkills() { } */
    get_PassiveSkills(): BattleUnitStructure_PassiveSkillInfo[] { return this._PassiveSkills; /* auto-property */ }
    /** @rva 0x736A30  public void set_PassiveSkills(BattleUnitStructure.PassiveSkillInfo[] value) { } */
    set_PassiveSkills(value: BattleUnitStructure_PassiveSkillInfo[]): void { this._PassiveSkills = value; /* auto-property */ }
    /** @rva 0x7670B0  public int get_BreakPoint() { } */
    get_BreakPoint(): int { return this._BreakPoint; /* auto-property */ }
    /** @rva 0x767A90  public void set_BreakPoint(int value) { } */
    set_BreakPoint(value: int): void { this._BreakPoint = value; /* auto-property */ }
    /** @rva 0x9017F0  public int get_InitialBreakDamageReceiveRatio() { } */
    get_InitialBreakDamageReceiveRatio(): int { return this._InitialBreakDamageReceiveRatio; /* auto-property */ }
    /** @rva 0x901830  public void set_InitialBreakDamageReceiveRatio(int value) { } */
    set_InitialBreakDamageReceiveRatio(value: int): void { this._InitialBreakDamageReceiveRatio = value; /* auto-property */ }
    /** @rva 0x854810  public int get_MaxBreakDamageReceiveRatio() { } */
    get_MaxBreakDamageReceiveRatio(): int { return this._MaxBreakDamageReceiveRatio; /* auto-property */ }
    /** @rva 0x901750  public void set_MaxBreakDamageReceiveRatio(int value) { } */
    set_MaxBreakDamageReceiveRatio(value: int): void { this._MaxBreakDamageReceiveRatio = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_BreakTurnGaugeSlowRatio() { } */
    get_BreakTurnGaugeSlowRatio(): int { return this._BreakTurnGaugeSlowRatio; /* auto-property */ }
    /** @rva 0x901740  public void set_BreakTurnGaugeSlowRatio(int value) { } */
    set_BreakTurnGaugeSlowRatio(value: int): void { this._BreakTurnGaugeSlowRatio = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17F7A70  public void .ctor(int mstId, int styleMstId, int maxHP, int speed, int specialAttackMstId, int[] activeSkillAttackMstIds, int normalAttackMstId, BattleUnitStructure.PassiveSkillInfo[] passiveSkills, int breakPoint, int initialBreakDamageReceiveRatio, int maxBreakDamageReceiveRatio, int breakTurnGaugeSlowRatio) { } */
    ctor$int_int_int_int_int_int_int_PassiveSkillInfo_int_int_int_int(mstId: int, styleMstId: int, maxHP: int, speed: int, specialAttackMstId: int, activeSkillAttackMstIds: int[], normalAttackMstId: int, passiveSkills: BattleUnitStructure_PassiveSkillInfo[], breakPoint: int, initialBreakDamageReceiveRatio: int, maxBreakDamageReceiveRatio: int, breakTurnGaugeSlowRatio: int): this {
        this._Speed = speed;
        this._SpecialAttackMstId = specialAttackMstId;
        this._MstId = mstId;
        this._StyleMstId = styleMstId;
        this._MaxHP = maxHP;
        this._ActiveSkillAttackMstIds = activeSkillAttackMstIds;
        this._PassiveSkills = passiveSkills;
        this._NormalAttackMstId = normalAttackMstId;
        this._BreakPoint = breakPoint;
        this._InitialBreakDamageReceiveRatio = initialBreakDamageReceiveRatio;
        this._MaxBreakDamageReceiveRatio = maxBreakDamageReceiveRatio;
        this._BreakTurnGaugeSlowRatio = breakTurnGaugeSlowRatio;
        return this;
    }
}

// ---- ReDriveBattleCore.Command.BattleUnitStructure.PassiveSkillInfo  (TypeDefIndex 968, public class) ----
export class BattleUnitStructure_PassiveSkillInfo {
    /** 0x10 private int <PassiveSkillMstId>k__BackingField */
    _PassiveSkillMstId: int = 0;
    /** 0x14 private AbilitySourceType <AbilitySourceType>k__BackingField */
    _AbilitySourceType: AbilitySourceType = 0 as AbilitySourceType;
    get PassiveSkillMstId(): int { return this.get_PassiveSkillMstId(); }
    set PassiveSkillMstId(v: int) { this.set_PassiveSkillMstId(v); }
    get AbilitySourceType(): AbilitySourceType { return this.get_AbilitySourceType(); }
    set AbilitySourceType(v: AbilitySourceType) { this.set_AbilitySourceType(v); }
    /** @rva 0x7364F0  public int get_PassiveSkillMstId() { } */
    get_PassiveSkillMstId(): int { return this._PassiveSkillMstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_PassiveSkillMstId(int value) { } */
    set_PassiveSkillMstId(value: int): void { this._PassiveSkillMstId = value; /* auto-property */ }
    /** @rva 0x803350  public AbilitySourceType get_AbilitySourceType() { } */
    get_AbilitySourceType(): AbilitySourceType { return this._AbilitySourceType; /* auto-property */ }
    /** @rva 0x803540  public void set_AbilitySourceType(AbilitySourceType value) { } */
    set_AbilitySourceType(value: AbilitySourceType): void { this._AbilitySourceType = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
