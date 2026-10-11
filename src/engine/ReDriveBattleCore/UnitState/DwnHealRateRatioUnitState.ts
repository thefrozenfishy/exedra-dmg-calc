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
import type { IDebuff } from "./IDebuff";
import type { IHealRateVariation } from "./IHealRateVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.DwnHealRateRatioUnitState  (TypeDefIndex 613, public class) ----
export class DwnHealRateRatioUnitState extends ParameterVariationUnitStateBase {  // implements IHealRateVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IHealRateVariation', 'IDebuff'];
    get DownRatio(): float { return this.get_DownRatio(); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BE170 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_dwn_heal";
    }
    /** @rva 0x15BE140 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x15BBF20  public float get_DownRatio() { } */
    get_DownRatio(): float {
        return f32(this._UpdateableEffectValue / 10);
    }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
    /** @rva 0x15BDD70 slot 29  public float GetHealRateVariationValue(float processingValue) { } */
    GetHealRateVariationValue(processingValue: float): float { return notPorted("DwnHealRateRatioUnitState.GetHealRateVariationValue", 0x15BDD70); }
    /** @rva 0x15BDB40 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("DwnHealRateRatioUnitState.GetAIFilteredTargets", 0x15BDB40); }
    /** @rva 0x15BDDA0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DwnHealRateRatioUnitState.GetUnitFilterFuncOrder", 0x15BDDA0); }
    /** @rva 0x15BE000  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleHealerAndMaxHP|14_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleHealerAndMaxHP_14_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("DwnHealRateRatioUnitState.<GetUnitFilterFuncOrder>g__UnitFilterByRoleHealerAndMaxHP|14_0", 0x15BE000); }
}
