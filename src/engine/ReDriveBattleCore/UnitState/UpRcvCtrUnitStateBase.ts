// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IRcvCtrVariation } from "./IRcvCtrVariation";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpRcvCtrUnitStateBase  (TypeDefIndex 802, public abstract class) ----
export abstract class UpRcvCtrUnitStateBase extends ParameterVariationUnitStateBase {  // implements IRcvCtrVariation, IDebuff
    static readonly __interfaces: readonly string[] = ['IRcvCtrVariation', 'IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16E6730 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpRcvCtrUnitStateBase.get_IconName", 0x16E6730); }
    /** @rva 0x16E6700 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("UpRcvCtrUnitStateBase.get_GiveVisualEffectName", 0x16E6700); }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpRcvCtrUnitStateBase..ctor", 0x16CF610); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpRcvCtrUnitStateBase..ctor", 0x15BAC90); }
    /** @rva -1 slot 30  public abstract float GetRcvCtrVariationValue(BattleUnit unit, float processingValue); */
    abstract GetRcvCtrVariationValue(unit: BattleUnit, processingValue: float): float;
    /** @rva 0x76F830 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x16E6530 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpRcvCtrUnitStateBase.GetUnitFilterFuncOrder", 0x16E6530); }
}
