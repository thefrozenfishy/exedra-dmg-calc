// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, int } from "../runtime";
import type { BattleType } from "../Network/Definition/Battle/BattleType";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { BattleUnit } from "./BattleUnit";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.FieldParamBase  (TypeDefIndex 396, public class) ----
export class FieldParamBase {
    /** 0x10 protected List<UnitStateBase> stateList */
    stateList: List<UnitStateBase> = null!;
    /** @rva 0x14983B0  public void Triggering(BattleUnit unit, BattleType battleType, int turnOrderPriority) { } */
    Triggering(unit: BattleUnit, battleType: BattleType, turnOrderPriority: int): void { return notPorted("FieldParamBase.Triggering", 0x14983B0); }
    /** @rva 0x1498260  public void TriggeringUnitOnBattleStart(List<BattleUnit> unitList, BattleType battleType, int turnOrderPriority) { } */
    TriggeringUnitOnBattleStart(unitList: List<BattleUnit>, battleType: BattleType, turnOrderPriority: int): void { return notPorted("FieldParamBase.TriggeringUnitOnBattleStart", 0x1498260); }
    /** @rva 0x1498180  protected void AddUnitState(AbilityEffectInfo info) { } */
    AddUnitState(info: AbilityEffectInfo): void { return notPorted("FieldParamBase.AddUnitState", 0x1498180); }
    /** @rva 0x1498560  public void .ctor() { } */
    ctor(): this { return notPorted("FieldParamBase..ctor", 0x1498560); }
}
