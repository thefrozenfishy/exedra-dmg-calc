// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import { BreakPointDamageWorseUnitStateBase } from "./BreakPointDamageWorseUnitStateBase";
import type { IGiveBreakPointDamageVariation } from "./IGiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.DwnGivBreakPointDmgFixedUnitState  (TypeDefIndex 549, public class) ----
export class DwnGivBreakPointDmgFixedUnitState extends BreakPointDamageWorseUnitStateBase {  // implements IGiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IGiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get DownFixed(): float { return this.get_DownFixed(); }
    /** @rva 0x15E2E50 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_giv_break_point_dmg";
    }
    /** @rva 0x758B30 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 1 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x758B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0xC84590  public float get_DownFixed() { } */
    get_DownFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15D9DA0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DB550  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15E2B60 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        list.push(AISkillTargetSelector.UnitFilterByRoleBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxSpeed);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
