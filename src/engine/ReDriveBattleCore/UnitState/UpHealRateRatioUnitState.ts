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
import type { IBuff } from "./IBuff";
import type { IHealRateVariation } from "./IHealRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpHealRateRatioUnitState  (TypeDefIndex 795, public class) ----
export class UpHealRateRatioUnitState extends ParameterVariationUnitStateBase {  // implements IHealRateVariation, IBuff
    static readonly __interfaces: readonly string[] = ['IHealRateVariation', 'IBuff'];
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16E5AD0 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpHealRateRatioUnitState.get_IconName", 0x16E5AD0); }
    /** @rva 0x16E5AA0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("UpHealRateRatioUnitState.get_GiveVisualEffectName", 0x16E5AA0); }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float { return notPorted("UpHealRateRatioUnitState.get_UpRatio", 0x15BBF20); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpHealRateRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpHealRateRatioUnitState..ctor", 0x15BAC90); }
    /** @rva 0x15BBF20 slot 29  public float GetHealRateVariationValue(float processingValue) { } */
    GetHealRateVariationValue(processingValue: float): float { return notPorted("UpHealRateRatioUnitState.GetHealRateVariationValue", 0x15BBF20); }
    /** @rva 0x16E5630 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UpHealRateRatioUnitState.GetAIFilteredTargets", 0x16E5630); }
    /** @rva 0x16E58D0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpHealRateRatioUnitState.GetUnitFilterFuncOrder", 0x16E58D0); }
}
