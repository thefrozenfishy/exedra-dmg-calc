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

// ---- ReDriveBattleCore.UnitState.UpHateUnitState  (TypeDefIndex 636, public class) ----
export class UpHateUnitState extends HateUnitStateBase {
    /** 0x88 private int <UpWeight>k__BackingField */
    _UpWeight: int = 0;
    get UpWeight(): int { return this.get_UpWeight(); }
    set UpWeight(v: int) { this.set_UpWeight(v); }
    /** @rva 0x16F9DA0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_hate";
    }
    /** @rva 0x901970  public int get_UpWeight() { } */
    get_UpWeight(): int { return this._UpWeight; /* auto-property */ }
    /** @rva 0x9019E0  public void set_UpWeight(int value) { } */
    set_UpWeight(value: int): void { this._UpWeight = value; /* auto-property */ }
    /** @rva 0x16E2240  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15C4960  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpWeight = info._EffectValue1;
        return this;
    }
    /** @rva 0x901970 slot 26  public override int GetHateVariationWeight() { } */
    GetHateVariationWeight(): int { return this._UpWeight; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x16F9B40 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleDefender);
        list.push(AISkillTargetSelector.UnitFilterWithMaxDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
