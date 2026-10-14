// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IConsumeRemainCount$ConsumeRemainCount } from "./IConsumeRemainCount";
import { notPorted } from "../../runtime";
import type { IEnumerable } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IBuff } from "./IBuff";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.PreventAbnormalUnitState  (TypeDefIndex 641, public class) ----
export class PreventAbnormalUnitState extends UnitStateBase {  // implements IBuff, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IBuff', 'IConsumeRemainCount'];
    get IsStateIconNumberAggregated(): boolean { return this.get_IsStateIconNumberAggregated(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D3AE0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_prevent_abnormal";
    }
    /** @rva 0x16D3AB0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x76F830 slot 27  public bool get_IsStateIconNumberAggregated() { } */
    get_IsStateIconNumberAggregated(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15B3AA0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16D3850 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16D3800  public void ConsumeRemainCount() { } */
    ConsumeRemainCount(): void {
        IConsumeRemainCount$ConsumeRemainCount(this as any, 1); // ((IConsumeRemainCount)this).ConsumeRemainCount(1)
    }
}
