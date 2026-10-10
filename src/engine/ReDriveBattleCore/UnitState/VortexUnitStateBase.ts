// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { float, int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";

// ---- ReDriveBattleCore.UnitState.VortexUnitStateBase  (TypeDefIndex 502, public abstract class) ----
export abstract class VortexUnitStateBase extends ReceiveSlipDamageUnitStateBase {  // implements IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IStateIconNumberDisplayable'];
    /** 0xA0 private int <RemainAttackCount>k__BackingField */
    _RemainAttackCount: int = 0;
    get RemainAttackCount(): int { return this.get_RemainAttackCount(); }
    set RemainAttackCount(v: int) { this.set_RemainAttackCount(v); }
    get StateIconNumber(): int { return this.get_StateIconNumber(); }
    get IsShowZeroIfZero(): boolean { return this.get_IsShowZeroIfZero(); }
    /** @rva 0x15D20C0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("VortexUnitStateBase.get_IconName", 0x15D20C0); }
    /** @rva 0x15D2090 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("VortexUnitStateBase.get_GiveVisualEffectName", 0x15D2090); }
    /** @rva 0x15D20F0 slot 33  public override string get_SlipDamageVisualEffectName() { } */
    get_SlipDamageVisualEffectName(): string { return notPorted("VortexUnitStateBase.get_SlipDamageVisualEffectName", 0x15D20F0); }
    /** @rva 0x7E1AD0 slot 31  public override TargetElementType get_AttackElement() { } */
    get_AttackElement(): TargetElementType { return 2 as TargetElementType; /* asm: mov eax, 2; ret */ }
    /** @rva 0x76F830 slot 34  public override bool get_SkipDamageOnTurnBegin() { } */
    get_SkipDamageOnTurnBegin(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x76F830 slot 16  public override bool get_AllowDuplicate() { } */
    get_AllowDuplicate(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x754630  public int get_RemainAttackCount() { } */
    get_RemainAttackCount(): int { return this._RemainAttackCount; /* auto-property */ }
    /** @rva 0x754900  public void set_RemainAttackCount(int value) { } */
    set_RemainAttackCount(value: int): void { this._RemainAttackCount = value; /* auto-property */ }
    /** @rva 0x754630 slot 38  public int get_StateIconNumber() { } */
    get_StateIconNumber(): int { return this._RemainAttackCount; /* asm: mov eax, dword ptr [rcx + 0xa0]; ret */ }
    /** @rva 0x7360C0 slot 39  public bool get_IsShowZeroIfZero() { } */
    get_IsShowZeroIfZero(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x15B5FF0  protected void .ctor() { } */
    ctor(): this { return notPorted("VortexUnitStateBase..ctor", 0x15B5FF0); }
    /** @rva 0x15D1ED0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("VortexUnitStateBase..ctor", 0x15D1ED0); }
    /** @rva 0x15D1FA0 slot 36  public override float GetSlipDamageValue(BattleUnit attackUnit, BattleUnit defenseUnit, BattleType battleType, bool isImmediately) { } */
    GetSlipDamageValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, battleType: BattleType, isImmediately: boolean): float { return notPorted("VortexUnitStateBase.GetSlipDamageValue", 0x15D1FA0); }
}
