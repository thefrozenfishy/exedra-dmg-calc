// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { IEnumerable } from "../../runtime";
import { Decimal } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { AimDamageBetterUnitStateBase } from "./AimDamageBetterUnitStateBase";
import type { IReceiveDamageVariation } from "./IReceiveDamageVariation";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.DownAimReceiveDamageUnitStateBase  (TypeDefIndex 529, public abstract class) ----
export abstract class DownAimReceiveDamageUnitStateBase extends AimDamageBetterUnitStateBase {  // implements IReceiveDamageVariation
    static readonly __interfaces: readonly string[] = ['IReceiveDamageVariation'];
    /** @rva 0x15B8940 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_rcv_dmg";
    }
    /** @rva 0x759B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15B85D0 slot 29  public override Decimal GetDamageVariationValue(BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue) { } */
    GetDamageVariationValue(attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal {
        if (attackUnit.IsMatch$TargetRoleType(this._TargetRole) && attackUnit.IsMatch$TargetElementType(this._TargetElement)) {
            return super.GetDamageVariationValue(attackUnit, defenseUnit, damageValue, processingValue); // DamageVariationUnitStateBase (non-virtual call)
        }
        return Decimal.Zero;
    }
    /** @rva 0x15B86E0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
