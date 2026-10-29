// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IDefVariation } from "./IDefVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.DownDefenseUnitStateBase  (TypeDefIndex 596, public abstract class) ----
export abstract class DownDefenseUnitStateBase extends ParameterVariationUnitStateBase {  // implements IDefVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IDefVariation', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15CA700 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_def";
    }
    /** @rva 0x15CA6D0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
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
    /** @rva -1 slot 30  public abstract Decimal GetDefVariationValue(BattleUnit unit, Decimal processingValue); */
    abstract GetDefVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal;
    /** @rva 0x15CA2C0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByBreak);
        list.push(AISkillTargetSelector.UnitFilterByRoleDefender);
        list.push(AISkillTargetSelector.UnitFilterByRoleHealerOrBufferOrDebuffer);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
