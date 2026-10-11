// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import { Decimal } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AdditionalDamageAbilityEffect } from "../AbilityEffect/AdditionalDamageAbilityEffect";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { AdditionType } from "./AdditionType";
import type { IAdditionalDamage } from "./IAdditionalDamage";
import type { IAtkVariation } from "./IAtkVariation";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import type { IRequiredSpeedVariationStateForDecide } from "./IRequiredSpeedVariationStateForDecide";
import type { IRequiredStateForDecide } from "./IRequiredStateForDecide";
import type { ISpeedVariation } from "./ISpeedVariation";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.TsubameLinkUnitState  (TypeDefIndex 663, public class) ----
export class TsubameLinkUnitState extends UnitStateBase {  // implements IHasUpdateableEffectValue, ISpeedVariation, IRequiredStateForDecide, IAtkVariation, IAdditionalDamage, IRequiredSpeedVariationStateForDecide
    static readonly __interfaces: readonly string[] = ['IHasUpdateableEffectValue', 'ISpeedVariation', 'IRequiredStateForDecide', 'IAtkVariation', 'IAdditionalDamage', 'IRequiredSpeedVariationStateForDecide'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    /** 0x8C private readonly float upSpdRatio */
    upSpdRatio: float = 0;
    /** 0x90 private readonly float upAtkRatio */
    upAtkRatio: float = 0;
    /** 0x94 private readonly float damagePower */
    damagePower: float = 0;
    /** 0x98 protected AdditionalDamageAbilityEffect additionalDamageAbilityEffect */
    additionalDamageAbilityEffect: AdditionalDamageAbilityEffect = null!;
    get Addition(): AdditionType { return this.get_Addition(); }
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    get UpSpdRatio(): float { return this.get_UpSpdRatio(); }
    get UpAtkRatio(): float { return this.get_UpAtkRatio(); }
    get DamagePower(): float { return this.get_DamagePower(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7431D0 slot 32  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16DA4A0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_unique_002";
    }
    /** @rva 0x16DA470 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0xC646A0 slot 25  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC646B0 slot 26  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x16DA4F0  public float get_UpSpdRatio() { } */
    get_UpSpdRatio(): float {
        return f32(this.upSpdRatio * this._UpdateableEffectValue);
    }
    /** @rva 0x16DA4D0  public float get_UpAtkRatio() { } */
    get_UpAtkRatio(): float {
        return f32(this.upAtkRatio * this._UpdateableEffectValue);
    }
    /** @rva 0x16DA460  public float get_DamagePower() { } */
    get_DamagePower(): float { return this.damagePower; /* asm: movss xmm0, dword ptr [rcx + 0x94]; ret */ }
    /** @rva 0x16DA3B0  protected void .ctor() { } */
    ctor(): this { return notPorted("TsubameLinkUnitState..ctor", 0x16DA3B0); }
    /** @rva 0x16DA2D0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("TsubameLinkUnitState..ctor", 0x16DA2D0); }
    /** @rva 0x16DA240 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x16D9950 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        return targetUnit._Id !== this._UserUnitId;
    }
    /** @rva 0x16DA100 slot 28  public Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromInt(unit.get_Speed()).mul(Decimal.fromFloat(f32(this._UpdateableEffectValue * this.upSpdRatio)).div(Decimal.fromInt(100)));
    }
    /** @rva 0x16D9E90 slot 30  public Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("TsubameLinkUnitState.GetAtkVariationValue", 0x16D9E90); }
    /** @rva 0x16D9970 slot 31  public AffectedUnitNoticeBundle GetAdditionalDamageResult(BattleUnit attackUnit, ActiveSkillBase attackSkill, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    GetAdditionalDamageResult(attackUnit: BattleUnit, attackSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("TsubameLinkUnitState.GetAdditionalDamageResult", 0x16D9970); }
    /** @rva 0x16D9950 slot 34  public bool CanAddTo(BattleUnitData targetUnit) { } */
    CanAddTo$BattleUnitData(targetUnit: any /* BattleUnitData */): boolean { return notPorted("TsubameLinkUnitState.CanAddTo", 0x16D9950); }
    /** @rva 0x16D9FD0 slot 33  public Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("TsubameLinkUnitState.GetSpeedVariationValue", 0x16D9FD0); }
    /** ISpeedVariation.GetSpeedVariationValue (interface slot 1): the C# overload taking BattleUnit; the name is suffixed
     * here because of the BattleUnitData overload, so interface calls are forwarded to it. */
    GetSpeedVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return this.GetSpeedVariationValue$BattleUnit_Decimal(unit, processingValue); }
}
