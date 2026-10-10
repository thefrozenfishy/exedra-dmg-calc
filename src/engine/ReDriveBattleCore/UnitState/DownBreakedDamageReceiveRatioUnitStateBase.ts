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
import type { IBreakedDamageReceiveRatioVariation } from "./IBreakedDamageReceiveRatioVariation";
import type { IDebuff } from "./IDebuff";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownBreakedDamageReceiveRatioUnitStateBase  (TypeDefIndex 585, public abstract class) ----
export abstract class DownBreakedDamageReceiveRatioUnitStateBase extends ParameterVariationUnitStateBase {  // implements IBreakedDamageReceiveRatioVariation, IRequiredStateForDecide, IDebuff
    static readonly __interfaces: readonly string[] = ['IBreakedDamageReceiveRatioVariation', 'IRequiredStateForDecide', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B9280 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase.get_IconName", 0x15B9280); }
    /** @rva 0x15B9250 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase.get_GiveVisualEffectName", 0x15B9250); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase..ctor", 0x15B5240); }
    /** @rva -1 slot 30  public abstract float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue); */
    abstract GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x15B8DB0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase.GetAIFilteredTargets", 0x15B8DB0); }
    /** @rva 0x15B8F60 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownBreakedDamageReceiveRatioUnitStateBase.GetUnitFilterFuncOrder", 0x15B8F60); }
}
