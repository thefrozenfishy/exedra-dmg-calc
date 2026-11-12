// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { Decimal, enumIsDefined } from "../../runtime";
import type { IEnumerable, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { UniqueElementDriveUnitState } from "./UniqueElementDriveUnitState";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DriveUpBreakPointDamageUnitStateBase  (TypeDefIndex 639, public abstract class) ----
// "Drive" break-gauge bonus (3.24.0): more break-gauge damage from the holder's hits on an enemy that carries the
// holder's own Element Drive state (UniqueElementDriveUnitState) at exactly targetLevel.
export abstract class DriveUpBreakPointDamageUnitStateBase extends UnitStateBase {  // implements IGiveBreakPointDamageVariation, IRequiredStateForDecide, IDontRemoveOnPassiveSkillUserLeaveBattle
    static readonly __interfaces: readonly string[] = ['IGiveBreakPointDamageVariation', 'IRequiredStateForDecide', 'IDontRemoveOnPassiveSkillUserLeaveBattle'];
    /** 0x88 protected int targetLevel */
    targetLevel: int = 0;
    /** 0x8C protected DriveUpBreakPointDamageUnitStateBase.TargetAttackType targetAttack */
    targetAttack: DriveUpBreakPointDamageUnitStateBase_TargetAttackType = 0 as DriveUpBreakPointDamageUnitStateBase_TargetAttackType;
    get Addition(): AdditionType { return this.get_Addition(); }
    get TargetLevel(): int { return this.get_TargetLevel(); }
    get TargetAttack(): DriveUpBreakPointDamageUnitStateBase_TargetAttackType { return this.get_TargetAttack(); }
    /** @rva 0x7491D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7491D0 slot 25  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x9077B0  public int get_TargetLevel() { } */
    get_TargetLevel(): int { return this.targetLevel; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0xA0A150  public DriveUpBreakPointDamageUnitStateBase.TargetAttackType get_TargetAttack() { } */
    get_TargetAttack(): DriveUpBreakPointDamageUnitStateBase_TargetAttackType { return this.targetAttack; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x1715C30  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x17170B0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.targetLevel = info._EffectValue1;
        // Enum.IsDefined(typeof(TargetAttackType), EffectValue3) ? EnumUtil.Cast<TargetAttackType>(EffectValue3) : Selectable
        if (enumIsDefined(DriveUpBreakPointDamageUnitStateBase_TargetAttackType, info._EffectValue3)) {
            this.targetAttack = info._EffectValue3 as DriveUpBreakPointDamageUnitStateBase_TargetAttackType;
            return this;
        }
        this.targetAttack = 0 as DriveUpBreakPointDamageUnitStateBase_TargetAttackType;
        return this;
    }
    /** @rva 0x15F4ED0 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        // DamageBetterUnitStateBase.CanAddTo (folded)
        if (!targetUnit.IsMatch$TargetRoleType(this._TargetRole)) return false;
        return targetUnit.IsMatch$TargetElementType(this._TargetElement);
    }
    /** @rva 0x1716DD0  protected bool IsTargetAttack(SkillType skillType) { } */
    IsTargetAttack(skillType: SkillType): boolean {
        const t = this.targetAttack as number;
        if (t === 0) {
            if ((skillType as number) - 1 >>> 0 < 2) return true; // ActiveSkill or SpecialAttack
        } else {
            if (t === 1) return (skillType as number) === 1;
            if (t === 2) return (skillType as number) === 2;
            if (t !== 3) return false;
        }
        return (skillType as number) === 3; // Selectable also takes normal attacks
    }
    /** @rva 0x1716E20  protected bool IsTargetUnit(IEnumerable<UnitStateBase> targetUnitStates) { } */
    IsTargetUnit(targetUnitStates: IEnumerable<UnitStateBase>): boolean {
        for (const state of targetUnitStates) {
            if (state instanceof UniqueElementDriveUnitState && state._UserUnitId === this._UserUnitId && state._Lv === this.targetLevel) return true;
        }
        return false;
    }
    /** @rva 0x1717060  public bool IsTarget(IEnumerable<UnitStateBase> defenceUnitStates, SkillType skillType) { } */
    IsTarget(defenceUnitStates: IEnumerable<UnitStateBase>, skillType: SkillType): boolean {
        if (!this.IsTargetAttack(skillType)) return false; // inlined in the game
        return this.IsTargetUnit(defenceUnitStates); // tail call
    }
    /** @rva 0x1716BD0 slot 26  public Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(damageValue: Decimal, processingValue: Decimal): Decimal { return Decimal.Zero; }
    /** @rva 0x1716C30 slot 27  public Decimal GetDamageVariationValue(Decimal damageValue, Decimal processingValue, IEnumerable<UnitStateBase> defenceUnitStates, SkillType skillType) { } */
    GetDamageVariationValue$4(damageValue: Decimal, processingValue: Decimal, defenceUnitStates: IEnumerable<UnitStateBase>, skillType: SkillType): Decimal {
        if (this.IsTargetAttack(skillType) && this.IsTargetUnit(defenceUnitStates)) { // IsTargetAttack inlined in the game
            return this.GetUpValue(damageValue); // vslot 28
        }
        return Decimal.Zero;
    }
    /** @rva -1 slot 28  protected abstract Decimal GetUpValue(Decimal damageValue); */
    abstract GetUpValue(damageValue: Decimal): Decimal;
    /** @rva 0x1716D40 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}

// ---- ReDriveBattleCore.UnitState.DriveUpBreakPointDamageUnitStateBase.TargetAttackType  (TypeDefIndex 638, public enum) ----
export const DriveUpBreakPointDamageUnitStateBase_TargetAttackType = {
    Selectable: 0,
    ActiveSkill: 1,
    SpecialAttack: 2,
    NormalAttack: 3,
} as const;
export type DriveUpBreakPointDamageUnitStateBase_TargetAttackType = (typeof DriveUpBreakPointDamageUnitStateBase_TargetAttackType)[keyof typeof DriveUpBreakPointDamageUnitStateBase_TargetAttackType];
