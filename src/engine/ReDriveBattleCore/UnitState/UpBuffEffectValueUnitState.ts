// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { UnitStateBase } from "./UnitStateBase";
import { UpEffectValueUnitStateBase } from "./UpEffectValueUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpBuffEffectValueUnitState  (TypeDefIndex 627, public class) ----
export class UpBuffEffectValueUnitState extends UpEffectValueUnitStateBase {
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("UpBuffEffectValueUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B9DC0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpBuffEffectValueUnitState..ctor", 0x15B9DC0); }
    /** @rva 0x15CFE80 slot 27  public override float GetEffectValueVariationRate(UnitStateBase targetState) { } */
    GetEffectValueVariationRate(targetState: UnitStateBase): float { return notPorted("UpBuffEffectValueUnitState.GetEffectValueVariationRate", 0x15CFE80); }
    /** @rva 0x15CFC50 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UpBuffEffectValueUnitState.GetAIFilteredTargets", 0x15CFC50); }
    /** @rva 0x15CFED0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpBuffEffectValueUnitState.GetUnitFilterFuncOrder", 0x15CFED0); }
    /** @rva 0x15D01C0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBufferAndMaxSpeed|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBufferAndMaxSpeed_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("UpBuffEffectValueUnitState.<GetUnitFilterFuncOrder>g__UnitFilterByRoleBufferAndMaxSpeed|4_0", 0x15D01C0); }
}
