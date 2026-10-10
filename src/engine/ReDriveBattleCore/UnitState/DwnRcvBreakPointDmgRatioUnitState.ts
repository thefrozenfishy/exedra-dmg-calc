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
import type { AdditionType } from "./AdditionType";
import { BreakPointDamageBetterUnitStateBase } from "./BreakPointDamageBetterUnitStateBase";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import type { IReceiveBreakPointDamageVariation } from "./IReceiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";

// ---- ReDriveBattleCore.UnitState.DwnRcvBreakPointDmgRatioUnitState  (TypeDefIndex 547, public class) ----
export class DwnRcvBreakPointDmgRatioUnitState extends BreakPointDamageBetterUnitStateBase {  // implements IReceiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IReceiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x15BE5A0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DwnRcvBreakPointDmgRatioUnitState.get_IconName", 0x15BE5A0); }
    /** @rva 0x7431D0 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 0 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x759B30 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float { return notPorted("DwnRcvBreakPointDmgRatioUnitState.get_DownRatio", 0x15BBF20); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DwnRcvBreakPointDmgRatioUnitState..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DwnRcvBreakPointDmgRatioUnitState..ctor", 0x15B5240); }
    /** @rva 0x15BE1A0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("DwnRcvBreakPointDmgRatioUnitState.GetAIFilteredTargets", 0x15BE1A0); }
    /** @rva 0x15BE3D0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DwnRcvBreakPointDmgRatioUnitState.GetUnitFilterFuncOrder", 0x15BE3D0); }
}
