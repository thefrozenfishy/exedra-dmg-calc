// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { BreakPointDamageBetterUnitStateBase } from "./BreakPointDamageBetterUnitStateBase";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import type { IGiveBreakPointDamageVariation } from "./IGiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { List } from "../../runtime";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";

// ---- ReDriveBattleCore.UnitState.UpGivBreakPointDmgFixedUnitState  (TypeDefIndex 543, public class) ----
export class UpGivBreakPointDmgFixedUnitState extends BreakPointDamageBetterUnitStateBase {  // implements IGiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IGiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get UpFixed(): float { return this.get_UpFixed(); }
    /** @rva 0x15DFB50 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_giv_break_point_dmg";
    }
    /** @rva 0x759B30 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 1 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xC6F3E0  public float get_UpFixed() { } */
    get_UpFixed(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C5BB0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15DF7B0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(UpGivBreakPointDmgFixedUnitState.$GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_10_0);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15DFA10  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|10_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_10_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const units = candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(2 as TargetRoleType)); // <>c.b__10_1 (Breaker)
        return AISkillTargetSelector.UnitFilterWithMaxSpeed(units); // inlined in the game
    }
}
