// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import { BreakPointDamageBetterUnitStateBase } from "./BreakPointDamageBetterUnitStateBase";
import type { BreakPointDamageVariationUnitStateBase_CalculationType } from "./BreakPointDamageVariationUnitStateBase";
import type { IGiveBreakPointDamageVariation } from "./IGiveBreakPointDamageVariation";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.UpGivBreakPointDmgRatioUnitState  (TypeDefIndex 545, public class) ----
export class UpGivBreakPointDmgRatioUnitState extends BreakPointDamageBetterUnitStateBase {  // implements IGiveBreakPointDamageVariation, IRequiredStateForDecide
    static readonly __interfaces: readonly string[] = ['IGiveBreakPointDamageVariation', 'IRequiredStateForDecide'];
    get UpRatio(): float { return this.get_UpRatio(); }
    /** @rva 0x15D0AA0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_up_giv_break_point_dmg";
    }
    /** @rva 0x7431D0 slot 27  public override BreakPointDamageVariationUnitStateBase.CalculationType get_Calculation() { } */
    get_Calculation(): BreakPointDamageVariationUnitStateBase_CalculationType { return 0 as BreakPointDamageVariationUnitStateBase_CalculationType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 28  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15BBF20  public float get_UpRatio() { } */
    get_UpRatio(): float {
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
    /** @rva 0x15D0700 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpGivBreakPointDmgRatioUnitState.GetUnitFilterFuncOrder", 0x15D0700); }
    /** @rva 0x15D0960  internal static IEnumerable<BattleUnit> <GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|10_0(IEnumerable<BattleUnit> candidateUnits) { } */
    static $GetUnitFilterFuncOrder$g__UnitFilterByRoleBreakerAndMaxSpeed_10_0(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> { return notPorted("UpGivBreakPointDmgRatioUnitState.<GetUnitFilterFuncOrder>g__UnitFilterByRoleBreakerAndMaxSpeed|10_0", 0x15D0960); }
}
