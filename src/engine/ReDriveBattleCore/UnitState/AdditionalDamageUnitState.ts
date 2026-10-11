// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AdditionalDamageAbilityEffect } from "../AbilityEffect/AdditionalDamageAbilityEffect";
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

// ---- ReDriveBattleCore.UnitState.AdditionalDamageUnitState  (TypeDefIndex 522, public class) ----
export class AdditionalDamageUnitState extends UnitStateBase {  // implements IAdditionalDamage, IBuff
    static readonly __interfaces: readonly string[] = ['IAdditionalDamage', 'IBuff'];
    /** 0x88 private readonly float damagePower */
    damagePower: float = 0;
    /** 0x90 protected AdditionalDamageAbilityEffect additionalDamageAbilityEffect */
    additionalDamageAbilityEffect: AdditionalDamageAbilityEffect = null!;
    get DamagePower(): float { return this.get_DamagePower(); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15B5210 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_additional_damage";
    }
    /** @rva 0x15B51E0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0xC646A0  public float get_DamagePower() { } */
    get_DamagePower(): float { return this.damagePower; /* asm: movss xmm0, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x15B50C0  protected void .ctor() { } */
    ctor(): this { return notPorted("AdditionalDamageUnitState..ctor", 0x15B50C0); }
    /** @rva 0x15B5130  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("AdditionalDamageUnitState..ctor", 0x15B5130); }
    /** @rva 0x15B4690 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("AdditionalDamageUnitState.GetAIFilteredTargets", 0x15B4690); }
    /** @rva 0x15B4D60 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15B4840 slot 25  public AffectedUnitNoticeBundle GetAdditionalDamageResult(BattleUnit attackUnit, ActiveSkillBase attackSkill, AffectedUnitNoticeBundle noticeBundle, GameDirectorBase gameDirector) { } */
    GetAdditionalDamageResult(attackUnit: BattleUnit, attackSkill: ActiveSkillBase, noticeBundle: AffectedUnitNoticeBundle, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("AdditionalDamageUnitState.GetAdditionalDamageResult", 0x15B4840); }
    /** @rva 0x15B4F30  internal static bool <GetAIFilteredTargets>g__CanAddUnitState|12_1(BattleUnit unit) { } */
    static $GetAIFilteredTargets$g__CanAddUnitState_12_1(unit: BattleUnit): boolean { return notPorted("AdditionalDamageUnitState.<GetAIFilteredTargets>g__CanAddUnitState|12_1", 0x15B4F30); }
}
