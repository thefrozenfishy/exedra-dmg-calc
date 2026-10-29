// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import { BreakPointDamageWorseUnitStateBase } from "./BreakPointDamageWorseUnitStateBase";
import type { IReceiveBreakPointDamageVariation } from "./IReceiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.UpRcvBreakPointDmgRatioUnitState  (TypeDefIndex 551, public class) ----
export class UpRcvBreakPointDmgRatioUnitState extends BreakPointDamageWorseUnitStateBase {  // implements IReceiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IReceiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15E08B0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_rcv_break_point_dmg";
    }
    /** @rva 0x7431D0 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 0 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xC6F3E0  public float get_UpRatio() { } */
    get_UpRatio(): float { return this._UpdateableEffectValue; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
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
    /** @rva 0x15E0470 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__10_0
        if (list.length > 0) list = list.filter(unit => unit._BreakPoint.get_HasBreakPoint()); // b__10_1
        return list;
    }
    /** @rva 0x15E06E0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
