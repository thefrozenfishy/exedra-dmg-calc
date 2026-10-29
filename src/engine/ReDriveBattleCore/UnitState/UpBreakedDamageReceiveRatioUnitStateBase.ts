// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IBreakedDamageReceiveRatioVariation } from "./IBreakedDamageReceiveRatioVariation";
import type { IBuff } from "./IBuff";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";

// ---- ReDriveBattleCore.UnitState.UpBreakedDamageReceiveRatioUnitStateBase  (TypeDefIndex 755, public abstract class) ----
export abstract class UpBreakedDamageReceiveRatioUnitStateBase extends ParameterVariationUnitStateBase {  // implements IBreakedDamageReceiveRatioVariation, IRequiredStateForDecide, IBuff
    static readonly __interfaces: readonly string[] = ['IBreakedDamageReceiveRatioVariation', 'IRequiredStateForDecide', 'IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16F5D20 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_break_damage_receive";
    }
    /** @rva 0x16F5CF0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15CBB40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva -1 slot 30  public abstract float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue); */
    abstract GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x16F56A0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__11_0
        if (list.length > 0) {
            const opponents = userUnit._Team === 0 ? gameDirector.get_EnemyUnitList() : gameDirector.get_AllyUnitList();
            if (!opponents.some(unit => unit._BreakPoint.get_HasBreakPoint())) list = []; // b__11_1
        }
        return list;
    }
    /** @rva 0x16F5950 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(UpBreakedDamageReceiveRatioUnitStateBase.$GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_12_0);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16F5BB0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|12_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_12_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        const units = candidateUnits.filter(unit => unit.IsMatch$TargetRoleType(2 as TargetRoleType)); // <>c.b__12_1 (Breaker)
        return AISkillTargetSelector.UnitFilterWithMaxSpeed(units); // inlined in the game
    }
}
