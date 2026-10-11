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
import type { IBuff } from "./IBuff";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpBreakedDamageReceiveRatioUnitStateBase  (TypeDefIndex 755, public abstract class) ----
export abstract class UpBreakedDamageReceiveRatioUnitStateBase extends ParameterVariationUnitStateBase {  // implements IBreakedDamageReceiveRatioVariation, IRequiredStateForDecide, IBuff
    static readonly __interfaces: readonly string[] = ['IBreakedDamageReceiveRatioVariation', 'IRequiredStateForDecide', 'IBuff'];
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16E1C60 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_break_damage_receive";
    }
    /** @rva 0x16E1C30 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = f32(info._EffectValue1);
        return this;
    }
    /** @rva -1 slot 30  public abstract float GetBreakedDamageReceiveRatioVariationValue(BattleUnit unit, float processingValue); */
    abstract GetBreakedDamageReceiveRatioVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x16E15E0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UpBreakedDamageReceiveRatioUnitStateBase.GetAIFilteredTargets", 0x16E15E0); }
    /** @rva 0x16E1890 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpBreakedDamageReceiveRatioUnitStateBase.GetUnitFilterFuncOrder", 0x16E1890); }
    /** @rva 0x16E1AF0  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|12_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_12_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("UpBreakedDamageReceiveRatioUnitStateBase.<GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|12_0", 0x16E1AF0); }
}
