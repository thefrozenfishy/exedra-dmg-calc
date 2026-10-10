// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.LockTurnOrderUnitState  (TypeDefIndex 640, public class) ----
export class LockTurnOrderUnitState extends UnitStateBase {  // implements IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IRequiredStateForDecide'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16D3150 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("LockTurnOrderUnitState.get_IconName", 0x16D3150); }
    /** @rva 0x16D3120 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("LockTurnOrderUnitState.get_GiveVisualEffectName", 0x16D3120); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("LockTurnOrderUnitState..ctor", 0x16CF610); }
    /** @rva 0x15B3AA0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("LockTurnOrderUnitState..ctor", 0x15B3AA0); }
    /** @rva 0x16D2EC0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("LockTurnOrderUnitState.GetUnitFilterFuncOrder", 0x16D2EC0); }
}
