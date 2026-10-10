// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectBase } from "../AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IGiveSlipDamageVariation } from "./IGiveSlipDamageVariation";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { ReceiveSlipDamageUnitStateBase } from "./ReceiveSlipDamageUnitStateBase";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownGiveSlipDamageUnitStateBase  (TypeDefIndex 604, public abstract class) ----
export abstract class DownGiveSlipDamageUnitStateBase extends UnitStateBase {  // implements IGiveSlipDamageVariation, IDebuff, IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IGiveSlipDamageVariation', 'IDebuff', 'IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get Addition(): AdditionType { return this.get_Addition(); }
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BB560 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownGiveSlipDamageUnitStateBase.get_IconName", 0x15BB560); }
    /** @rva 0x15BB530 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownGiveSlipDamageUnitStateBase.get_GiveVisualEffectName", 0x15BB530); }
    /** @rva 0x759B30 slot 25  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0xC646A0 slot 29  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC646B0 slot 30  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownGiveSlipDamageUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownGiveSlipDamageUnitStateBase..ctor", 0x15BAC90); }
    /** @rva 0x15B8090 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("DownGiveSlipDamageUnitStateBase.CanAddTo", 0x15B8090); }
    /** @rva 0x15BAD90 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("DownGiveSlipDamageUnitStateBase.GetAIFilteredTargets", 0x15BAD90); }
    /** @rva 0x15BAF50 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownGiveSlipDamageUnitStateBase.GetUnitFilterFuncOrder", 0x15BAF50); }
    /** @rva -1 slot 31  public abstract bool IsTarget(UnitStateBase state); */
    abstract IsTarget(state: UnitStateBase): boolean;
    /** @rva -1 slot 32  public abstract Decimal GetSlipDamageVariationValue(ReceiveSlipDamageUnitStateBase state, BattleUnit attackUnit, BattleUnit defenseUnit, Decimal damageValue, Decimal processingValue); */
    abstract GetSlipDamageVariationValue(state: ReceiveSlipDamageUnitStateBase, attackUnit: BattleUnit, defenseUnit: BattleUnit, damageValue: Decimal, processingValue: Decimal): Decimal;
    /** @rva 0x15BB340  private bool <GetAIFilteredTargets>b__15_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__15_1(unit: BattleUnit): boolean { return notPorted("DownGiveSlipDamageUnitStateBase.<GetAIFilteredTargets>b__15_1", 0x15BB340); }
    /** @rva 0x15BB3F0  private bool <GetAIFilteredTargets>b__15_2(ActiveSkillBase skill) { } */
    $GetAIFilteredTargets$b__15_2(skill: ActiveSkillBase): boolean { return notPorted("DownGiveSlipDamageUnitStateBase.<GetAIFilteredTargets>b__15_2", 0x15BB3F0); }
    /** @rva 0x15BB4A0  private bool <GetAIFilteredTargets>b__15_3(AbilityEffectBase effect) { } */
    $GetAIFilteredTargets$b__15_3(effect: AbilityEffectBase): boolean { return notPorted("DownGiveSlipDamageUnitStateBase.<GetAIFilteredTargets>b__15_3", 0x15BB4A0); }
}
