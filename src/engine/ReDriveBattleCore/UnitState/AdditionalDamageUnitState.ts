// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { TargetElementType as TargetElementType$ } from "../../Network/Definition/Battle/TargetElementType";
import { CharacterParameter } from "../CharacterParameter";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { AdditionalDamageAbilityEffect } from "../AbilityEffect/AdditionalDamageAbilityEffect";
import { enumIsDefined, f32, notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IAdditionalDamage } from "./IAdditionalDamage";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";
import { EffectOriginType } from "./EffectOriginType";
import { DamageBaseType } from "../AbilityEffect/DamageBaseType";

// ---- ReDriveBattleCore.UnitState.AdditionalDamageUnitState  (TypeDefIndex 522, public class) ----
export class AdditionalDamageUnitState extends UnitStateBase {  // implements IAdditionalDamage, IBuff
    static readonly __interfaces: readonly string[] = ['IAdditionalDamage', 'IBuff'];
    /** 0x88 private readonly float damagePower */
    damagePower: float = 0;
    /** 0x90 protected AdditionalDamageAbilityEffect additionalDamageAbilityEffect */
    additionalDamageAbilityEffect: AdditionalDamageAbilityEffect = null!;
    get DamagePower(): float { return this.get_DamagePower(); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15DB520 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_additional_damage";
    }
    /** @rva 0x15DB4F0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0xC84590  public float get_DamagePower() { } */
    get_DamagePower(): float { return this.damagePower; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15DB3D0  protected void .ctor() { } */
    ctor(): this {
        this.additionalDamageAbilityEffect = new AdditionalDamageAbilityEffect().ctor();
        this._IconName = "";
        super.ctor();
        return this;
    }
    /** @rva 0x15DB440  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this.additionalDamageAbilityEffect = new AdditionalDamageAbilityEffect().ctor();
        super.ctor$AbilityEffectInfo(info);
        this.damagePower = f32(f32(info._EffectValue1) / 10);
        return this;
    }
    /** @rva 0x15DA9A0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__12_0
        if (list.length > 0) list = list.filter(AdditionalDamageUnitState.$GetAIFilteredTargets$g__CanAddUnitState_12_1);
        return list;
    }
    /** @rva 0x15DB070 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15DAB50 slot 25  public AffectedUnitNoticeBundle GetAdditionalDamageResult(BattleUnit attackUnit, ActiveSkillBase attackSkill, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    GetAdditionalDamageResult(attackUnit: BattleUnit, attackSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        // <>c__DisplayClass14_0 { gameDirector, attackUnit }
        const list = noticeBundle.GetNoticeList()
            .filter(notice => notice._IsReceivedAttack) // <>c.b__14_0
            .map(notice => gameDirector.get_battleUnitDic().get(notice._AffectedUnitId) ?? null!) // DisplayClass14_0.b__1 (TryGetValue)
            .filter(unit => unit != null && unit._Team !== attackUnit._Team); // DisplayClass14_0.b__2
        if (list.length === 0) return null!;
        const userUnit = gameDirector.get_battleUnitDic().get(this._UserUnitId) ?? null;
        if (userUnit == null) return null!; // TryGetValue false
        const damageBase = BattleDamageCalculator.GetDamageBase(userUnit.GetInitialDamageBaseParamValue(1 as DamageBaseType), f32(this.damagePower / 100));
        let attackElement = 0 as TargetElementType;
        const p = attackUnit._BattleParameter;
        if (p instanceof CharacterParameter) {
            const element = p._Element as number;
            if (enumIsDefined(TargetElementType$, element)) attackElement = element as TargetElementType;
        }
        this.additionalDamageAbilityEffect.SetActiveSkillInfo$3(attackSkill, attackElement, damageBase);
        this.additionalDamageAbilityEffect.SelectTargets$ListBattleUnit(list);
        return this.additionalDamageAbilityEffect.Triggering(1 as EffectOriginType, attackUnit, gameDirector.get_battleUnitDic(), gameDirector); // vslot 0x188
    }
    /** @rva 0x15DB240  internal static bool <GetAIFilteredTargets>g__CanAddUnitState|12_1(BattleUnit unit) { } */
    static $GetAIFilteredTargets$g__CanAddUnitState_12_1(unit: BattleUnit): boolean {
        const list = unit._Condition._StateList.filter(s => s instanceof AdditionalDamageUnitState) as AdditionalDamageUnitState[]; // OfType().ToList()
        if (list.length === 0) return true;
        return list.every(state => !state.get_IsPermanent() && state._RemainingTurn < 2); // <>c.b__12_2
    }
}
