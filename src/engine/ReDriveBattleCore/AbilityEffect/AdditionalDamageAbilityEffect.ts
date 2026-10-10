// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalDamageAbilityEffect  (TypeDefIndex 1183, public class) ----
export class AdditionalDamageAbilityEffect extends DamageAbilityEffectBase {
    /** 0x90 protected Decimal damageBase */
    damageBase: Decimal = Decimal.Zero;
    /** @rva 0x759B30 slot 9  protected override DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return 1 as DamageBaseType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x100E6E0 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 7 as DamageCategory; /* asm: mov eax, 7; ret */ }
    /** @rva 0x7360C0 slot 10  protected override bool get_IsIncreaseBreakedDamageReceiveRate() { } */
    get_IsIncreaseBreakedDamageReceiveRate(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7360C0 slot 11  protected override bool get_IsGiveBreakPointDamage() { } */
    get_IsGiveBreakPointDamage(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7360C0 slot 12  protected override bool get_IsConsumeRemainCountOnAttackHit() { } */
    get_IsConsumeRemainCountOnAttackHit(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x18EA680  public void .ctor() { } */
    ctor(): this { return notPorted("AdditionalDamageAbilityEffect..ctor", 0x18EA680); }
    /** @rva 0x18EA520  public void SetActiveSkillInfo(ActiveSkillBase attackSkill, TargetElementType attackElement, Decimal damageBase) { } */
    SetActiveSkillInfo$3(attackSkill: ActiveSkillBase, attackElement: TargetElementType, damageBase: Decimal): void { return notPorted("AdditionalDamageAbilityEffect.SetActiveSkillInfo", 0x18EA520); }
    /** @rva 0x18EA3C0  public void SelectTargets(List<BattleUnit> targetUnitList) { } */
    SelectTargets$ListBattleUnit(targetUnitList: List<BattleUnit>): void { return notPorted("AdditionalDamageAbilityEffect.SelectTargets", 0x18EA3C0); }
    /** @rva 0x902510 slot 15  protected override Decimal GetDamageBase(BattleUnit unit, float power) { } */
    GetDamageBase(unit: BattleUnit, power: float): Decimal { return notPorted("AdditionalDamageAbilityEffect.GetDamageBase", 0x902510); }
}
