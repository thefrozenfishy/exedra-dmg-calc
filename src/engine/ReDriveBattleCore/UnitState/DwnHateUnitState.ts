// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
    /** @rva 0x16D09B0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_hate";
    }
    /** @rva 0x902530  public int get_DownWeight() { } */
    get_DownWeight(): int { return this._DownWeight; /* auto-property */ }
    /** @rva 0x902570  public void set_DownWeight(int value) { } */
    set_DownWeight(value: int): void { this._DownWeight = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15B3FF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._DownWeight = info._EffectValue1;
        return this;
    }
    /** @rva 0x16D0740 slot 26  public override int GetHateVariationWeight() { } */
    GetHateVariationWeight(): int { return notPorted("DwnHateUnitState.GetHateVariationWeight", 0x16D0740); }
    /** @rva 0x16D0750 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttackerOrBreaker);
        list.push(AISkillTargetSelector.UnitFilterWithMinDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
