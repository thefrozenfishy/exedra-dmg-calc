// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { TargetElementType as TargetElementType$ } from "../../Network/Definition/Battle/TargetElementType";
import { CharacterParameter } from "../CharacterParameter";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { AdditionalDamageAbilityEffect } from "../AbilityEffect/AdditionalDamageAbilityEffect";
import { enumIsDefined, f32, notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import { Decimal } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";

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
import { EffectOriginType } from "./EffectOriginType";
import { DamageBaseType } from "../AbilityEffect/DamageBaseType";

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
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x7421D0 slot 32  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 0 as AdditionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x1704390 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_unique_002";
    }
    /** @rva 0x1704360 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0xC84590 slot 25  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC845A0 slot 26  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x17043E0  public float get_UpSpdRatio() { } */
    get_UpSpdRatio(): float {
        return f32(this.upSpdRatio * this._UpdateableEffectValue);
    }
    /** @rva 0x17043C0  public float get_UpAtkRatio() { } */
    get_UpAtkRatio(): float {
        return f32(this.upAtkRatio * this._UpdateableEffectValue);
    }
    /** @rva 0x1704350  public float get_DamagePower() { } */
    get_DamagePower(): float { return this.damagePower; /* asm: movss xmm0, dword ptr [rcx + 0x94]; ret */ }
    /** @rva 0x17042A0  protected void .ctor() { } */
    ctor(): this {
        this.additionalDamageAbilityEffect = new AdditionalDamageAbilityEffect().ctor();
        super.ctor();
        return this;
    }
    /** @rva 0x17041C0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.additionalDamageAbilityEffect = new AdditionalDamageAbilityEffect().ctor();
        super.ctor$AbilityEffectInfo(info);
        this._UpdateableEffectValue = 1;
        this.upSpdRatio = f32(f32(info._EffectValue1) / 10);
        this.upAtkRatio = f32(f32(info._EffectValue2) / 10);
        this.damagePower = f32(f32(info._EffectValue3) / 10);
        return this;
    }
    /** @rva 0x1704130 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x1703840 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean {
        return targetUnit._Id !== this._UserUnitId;
    }
    /** @rva 0x1703FF0 slot 28  public Decimal GetSpeedVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnit_Decimal(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromInt(unit.get_Speed()).mul(Decimal.fromFloat(f32(this._UpdateableEffectValue * this.upSpdRatio)).div(Decimal.fromInt(100)));
    }
    /** @rva 0x1703D80 slot 30  public Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal {
        return Decimal.fromInt(unit.get_ATK()).mul(Decimal.fromFloat(f32(this._UpdateableEffectValue * this.upAtkRatio)).div(Decimal.fromInt(100)));
    }
    /** @rva 0x1703860 slot 31  public AffectedUnitNoticeBundle GetAdditionalDamageResult(BattleUnit attackUnit, ActiveSkillBase attackSkill, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    GetAdditionalDamageResult(attackUnit: BattleUnit, attackSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        // <>c__DisplayClass28_0 { gameDirector, attackUnit }
        const list = noticeBundle.GetNoticeList()
            .filter(notice => notice._IsReceivedAttack) // <>c.b__28_0
            .map(notice => gameDirector.get_battleUnitDic().get(notice._AffectedUnitId) ?? null!) // DisplayClass28_0.b__1 (TryGetValue)
            .filter(unit => unit != null && unit._Team !== attackUnit._Team); // DisplayClass28_0.b__2
        if (list.length === 0) return null!;
        const userUnit = gameDirector.get_battleUnitDic().get(this._UserUnitId) ?? null;
        if (userUnit == null) return null!; // TryGetValue false
        const damageBase = BattleDamageCalculator.GetDamageBase(userUnit.GetInitialDamageBaseParamValue(1 as DamageBaseType), f32(this.damagePower / 100));
        let attackElement = 0 as TargetElementType;
        const p = attackUnit.get_Param();
        if (p instanceof CharacterParameter) {
            const element = p._Element as number;
            if (enumIsDefined(TargetElementType$, element)) attackElement = element as TargetElementType;
        }
        this.additionalDamageAbilityEffect.SetActiveSkillInfo$3(attackSkill, attackElement, damageBase);
        this.additionalDamageAbilityEffect.SelectTargets$ListBattleUnit(list);
        return this.additionalDamageAbilityEffect.Triggering(1 as EffectOriginType, attackUnit, gameDirector.get_battleUnitDic(), gameDirector); // vslot 0x188
    }
    /** @rva 0x1703840 slot 34  public bool CanAddTo(BattleUnitData targetUnit) { } */
    CanAddTo$BattleUnitData(targetUnit: any /* BattleUnitData */): boolean { return notPorted("TsubameLinkUnitState.CanAddTo", 0x1703840); }
    /** @rva 0x1703EC0 slot 33  public Decimal GetSpeedVariationValue(BattleUnitData unit, Decimal processingValue) { } */
    GetSpeedVariationValue$BattleUnitData_Decimal(unit: any /* BattleUnitData */, processingValue: Decimal): Decimal { return notPorted("TsubameLinkUnitState.GetSpeedVariationValue", 0x1703EC0); }
    /** ISpeedVariation.GetSpeedVariationValue (interface slot 1): the C# overload taking BattleUnit; the name is suffixed
     * here because of the BattleUnitData overload, so interface calls are forwarded to it. */
    GetSpeedVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return this.GetSpeedVariationValue$BattleUnit_Decimal(unit, processingValue); }
}
