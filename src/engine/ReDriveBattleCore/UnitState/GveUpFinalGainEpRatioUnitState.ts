// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IBuff } from "./IBuff";
import { ParameterVariationUnitStateBase } from "./ParameterVariationUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.GveUpFinalGainEpRatioUnitState  (TypeDefIndex 634, public class) ----
export class GveUpFinalGainEpRatioUnitState extends ParameterVariationUnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x90 private float <UpRatio>k__BackingField */
    _UpRatio: float = 0;
    get UpRatio(): float { return this.get_UpRatio(); }
    set UpRatio(v: float) { this.set_UpRatio(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 27  public override AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D1A80 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("GveUpFinalGainEpRatioUnitState.get_IconName", 0x16D1A80); }
    /** @rva 0x16D1A50 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("GveUpFinalGainEpRatioUnitState.get_GiveVisualEffectName", 0x16D1A50); }
    /** @rva 0x754560  public float get_UpRatio() { } */
    get_UpRatio(): float { return this._UpRatio; /* auto-property */ }
    /** @rva 0x754810  public void set_UpRatio(float value) { } */
    set_UpRatio(value: float): void { this._UpRatio = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("GveUpFinalGainEpRatioUnitState..ctor", 0x16CF610); }
    /** @rva 0x16D19F0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("GveUpFinalGainEpRatioUnitState..ctor", 0x16D19F0); }
    /** @rva 0x16D1940  public float GetGainEpVariationValue(float epValue) { } */
    GetGainEpVariationValue(epValue: float): float { return notPorted("GveUpFinalGainEpRatioUnitState.GetGainEpVariationValue", 0x16D1940); }
    /** @rva 0x16D1960 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("GveUpFinalGainEpRatioUnitState.GetUnitFilterFuncOrder", 0x16D1960); }
}
