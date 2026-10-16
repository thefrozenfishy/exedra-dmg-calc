// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AdditionalSkill } from "../AdditionalSkill";
import { SpecialAttack } from "../SpecialAttack";
import { NormalAttack } from "../NormalAttack";
import { ActiveSkill } from "../ActiveSkill";
import { Decimal, notPorted } from "../../runtime";
import type { List, float } from "../../runtime";
import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";
import { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { int } from "../../runtime";
import { SkillType } from "../../Network/Definition/Battle/SkillType";

// ---- ReDriveBattleCore.AbilityEffect.AdditionalDamageAbilityEffect  (TypeDefIndex 1183, public class) ----
export class AdditionalDamageAbilityEffect extends DamageAbilityEffectBase {
    /** 0x90 protected Decimal damageBase */
    damageBase: Decimal = Decimal.Zero;
    /** @rva 0x758B30 slot 9  protected override DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return 1 as DamageBaseType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x104C0A0 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 7 as DamageCategory; /* asm: mov eax, 7; ret */ }
    /** @rva 0x7350C0 slot 10  protected override bool get_IsIncreaseBreakedDamageReceiveRate() { } */
    get_IsIncreaseBreakedDamageReceiveRate(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7350C0 slot 11  protected override bool get_IsGiveBreakPointDamage() { } */
    get_IsGiveBreakPointDamage(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x7350C0 slot 12  protected override bool get_IsConsumeRemainCountOnAttackHit() { } */
    get_IsConsumeRemainCountOnAttackHit(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x1920040  public void .ctor() { } */
    ctor(): this {
        super.ctor();
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        this._EffectRange = 3 as RangeType;
        this.attackElement = 0 as TargetElementType;
        this.damagePower = [0, 0];
        this._SpecifiedVariationBreakPoint = [0, 0];
        this.breakedDamageReceiveRatio = 0;
        return this;
    }
    /** @rva 0x191FEE0  public void SetActiveSkillInfo(ActiveSkillBase attackSkill, TargetElementType attackElement, Decimal damageBase) { } */
    SetActiveSkillInfo$3(attackSkill: ActiveSkillBase, attackElement: TargetElementType, damageBase: Decimal): void {
        if (attackSkill == null) return;
        this.skillMstId = attackSkill._Id;
        this.attackElement = attackElement;
        this.damageBase = damageBase;
        let skillType: int;
        if (attackSkill instanceof ActiveSkill) skillType = 1;
        else if (attackSkill instanceof NormalAttack) skillType = 3;
        else if (attackSkill instanceof SpecialAttack) skillType = 2;
        else if (attackSkill instanceof AdditionalSkill) skillType = attackSkill.skillType;
        else skillType = 1;
        this.skillType = skillType as SkillType;
    }
    /** @rva 0x191FD80  public void SelectTargets(List<BattleUnit> targetUnitList) { } */
    SelectTargets$ListBattleUnit(targetUnitList: List<BattleUnit>): void {
        this._TargetUnitIdList = targetUnitList.map(unit => unit._Id); // <>c.b__13_0
    }
    /** @rva 0x9009A0 slot 15  protected override Decimal GetDamageBase(BattleUnit unit, float power) { } */
    GetDamageBase(unit: BattleUnit, power: float): Decimal {
        return this.damageBase; // asm: movups xmm0, [rdx + 0x90]
    }
}
