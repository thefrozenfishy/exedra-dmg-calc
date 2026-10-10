// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { AddTurnUnitStateBase } from "./AddTurnUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.AddBuffTurnUnitState  (TypeDefIndex 525, public class) ----
export class AddBuffTurnUnitState extends AddTurnUnitStateBase {
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("AddBuffTurnUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B3FF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AddBuffTurnUnitState..ctor", 0x15B3FF0); }
    /** @rva 0x15B3AB0 slot 26  public override void AddTurnTo(UnitStateBase targetUnitState) { } */
    AddTurnTo(targetUnitState: UnitStateBase): void { return notPorted("AddBuffTurnUnitState.AddTurnTo", 0x15B3AB0); }
    /** @rva 0x15B3B60 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("AddBuffTurnUnitState.GetAIFilteredTargets", 0x15B3B60); }
    /** @rva 0x15B3D90 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("AddBuffTurnUnitState.GetUnitFilterFuncOrder", 0x15B3D90); }
}
