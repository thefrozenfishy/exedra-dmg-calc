// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.ComboUnitState  (TypeDefIndex 554, public class) ----
export class ComboUnitState extends UnitStateBase {
    /** 0x88 private readonly int actionNum */
    actionNum: int = 0;
    get ActionNum(): int { return this.get_ActionNum(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15C6EE0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_combo";
    }
    /** @rva 0x901970  public int get_ActionNum() { } */
    get_ActionNum(): int { return this.actionNum; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15C4400  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15C4960  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.actionNum = info._EffectValue1;
        return this;
    }
    /** @rva 0x15C6D10 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
