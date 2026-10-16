// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UnitStateFactory } from "./UnitStateFactory";
import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { BattleUnit } from "./BattleUnit";
import type { UnitStateBase } from "./UnitState/UnitStateBase";
import { EffectOriginType } from "./UnitState/EffectOriginType";

// ---- ReDriveBattleCore.FieldParamBase  (TypeDefIndex 396, public class) ----
export class FieldParamBase {
    /** 0x10 protected List<UnitStateBase> stateList */
    stateList: List<UnitStateBase> = null!;
    /** @rva 0x14BE5E0  public void Triggering(BattleUnit unit, BattleType battleType, int turnOrderPriority) { } */
    Triggering(unit: BattleUnit, battleType: BattleType, turnOrderPriority: int): void {
        for (const state of this.stateList) {
            const clone = state.Clone();
            clone.SetTriggeringInfo(EffectOriginType.Field, null!, false, false, battleType);
            unit.Condition.AddUnitState(clone, unit, turnOrderPriority, null!, true);
        }
    }
    /** @rva 0x14BE490  public void TriggeringUnitOnBattleStart(List<BattleUnit> unitList, BattleType battleType, int turnOrderPriority) { } */
    TriggeringUnitOnBattleStart(unitList: List<BattleUnit>, battleType: BattleType, turnOrderPriority: int): void {
        if (this.stateList == null || unitList == null) return;
        for (const unit of unitList) this.Triggering(unit, battleType, turnOrderPriority);
    }
    /** @rva 0x14BE3B0  protected void AddUnitState(AbilityEffectInfo info) { } */
    AddUnitState(info: AbilityEffectInfo): void {
        const state = UnitStateFactory.Create(info);
        if (state == null) return;
        this.stateList.push(state);
    }
    /** @rva 0x14BE790  public void .ctor() { } */
    ctor(): this {
        this.stateList = [];
        return this;
    }
}
