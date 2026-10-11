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

// ---- ReDriveBattleCore.UnitState.UpDebuffEffectValueUnitState  (TypeDefIndex 629, public class) ----
export class UpDebuffEffectValueUnitState extends UpEffectValueUnitStateBase {
    /** @rva 0x16D02D0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x16D02C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x16E27E0 slot 27  public override float GetEffectValueVariationRate(UnitStateBase targetState) { } */
    GetEffectValueVariationRate(targetState: UnitStateBase): float { return notPorted("UpDebuffEffectValueUnitState.GetEffectValueVariationRate", 0x16E27E0); }
    /** @rva 0x16E25B0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UpDebuffEffectValueUnitState.GetAIFilteredTargets", 0x16E25B0); }
    /** @rva 0x16E2840 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpDebuffEffectValueUnitState.GetUnitFilterFuncOrder", 0x16E2840); }
    /** @rva 0x16E2AA0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleDebufferAndMaxSpeed|4_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleDebufferAndMaxSpeed_4_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("UpDebuffEffectValueUnitState.<GetUnitFilterFuncOrder>g__UnitFilterByRoleDebufferAndMaxSpeed|4_0", 0x16E2AA0); }
}
