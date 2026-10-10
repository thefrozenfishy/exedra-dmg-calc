// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { ICtrVariation } from "./ICtrVariation";
import type { IDebuff } from "./IDebuff";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownCtrUnitStateBase  (TypeDefIndex 592, public abstract class) ----
export abstract class DownCtrUnitStateBase extends ParameterVariationUnitStateBase {  // implements ICtrVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['ICtrVariation', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15B9920 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownCtrUnitStateBase.get_IconName", 0x15B9920); }
    /** @rva 0x15B98F0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownCtrUnitStateBase.get_GiveVisualEffectName", 0x15B98F0); }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownCtrUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15B5240  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownCtrUnitStateBase..ctor", 0x15B5240); }
    /** @rva -1 slot 30  public abstract float GetCtrVariationValue(BattleUnit unit, float processingValue); */
    abstract GetCtrVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x15B9600 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownCtrUnitStateBase.GetUnitFilterFuncOrder", 0x15B9600); }
}
