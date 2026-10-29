// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IConsumeRemainCount$ConsumeRemainCount } from "./IConsumeRemainCount";
import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IBuff } from "./IBuff";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.ShieldUnitState  (TypeDefIndex 655, public class) ----
export class ShieldUnitState extends UnitStateBase {  // implements IBuff, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IBuff', 'IConsumeRemainCount'];
    /** 0x88 private float <DecreaseRatio>k__BackingField */
    _DecreaseRatio: float = 0;
    get DecreaseRatio(): float { return this.get_DecreaseRatio(); }
    set DecreaseRatio(v: float) { this.set_DecreaseRatio(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16EB9D0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_shield";
    }
    /** @rva 0xC6F3E0  public float get_DecreaseRatio() { } */
    get_DecreaseRatio(): float { return this._DecreaseRatio; /* auto-property */ }
    /** @rva 0xC6F3F0  public void set_DecreaseRatio(float value) { } */
    set_DecreaseRatio(value: float): void { this._DecreaseRatio = value; /* auto-property */ }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16EB980  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DecreaseRatio = f32(f32(info._EffectValue1) / 1000);
        return this;
    }
    /** @rva 0x16EB720 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16EB6D0  public void ConsumeRemainCount() { } */
    ConsumeRemainCount(): void {
        IConsumeRemainCount$ConsumeRemainCount(this as unknown as IConsumeRemainCount, 1); // ((IConsumeRemainCount)this).ConsumeRemainCount(1), default interface method
    }
}
