// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { HateUnitStateBase } from "./HateUnitStateBase";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.DwnHateUnitState  (TypeDefIndex 637, public class) ----
export class DwnHateUnitState extends HateUnitStateBase {
    /** 0x88 private int <DownWeight>k__BackingField */
    _DownWeight: int = 0;
    get DownWeight(): int { return this.get_DownWeight(); }
    set DownWeight(v: int) { this.set_DownWeight(v); }
    /** @rva 0x16FA340 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_hate";
    }
    /** @rva 0x9009C0  public int get_DownWeight() { } */
    get_DownWeight(): int { return this._DownWeight; /* auto-property */ }
    /** @rva 0x900A30  public void set_DownWeight(int value) { } */
    set_DownWeight(value: int): void { this._DownWeight = value; /* auto-property */ }
    /** @rva 0x16F8570  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15DA300  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DownWeight = info._EffectValue1;
        return this;
    }
    /** @rva 0x16FA0D0 slot 26  public override int GetHateVariationWeight() { } */
    GetHateVariationWeight(): int { return -this._DownWeight; }
    /** @rva 0x16FA0E0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
