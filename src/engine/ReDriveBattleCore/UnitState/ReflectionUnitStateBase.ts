// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, IEnumerable, List } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBuff } from "./IBuff";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";

// ---- ReDriveBattleCore.UnitState.ReflectionUnitStateBase  (TypeDefIndex 647, public abstract class) ----
export abstract class ReflectionUnitStateBase extends UnitStateBase {  // implements IBuff
    static readonly __interfaces: readonly string[] = ['IBuff'];
    /** 0x88 private ReflectionUnitStateBase.DamageTargetType <DamageTarget>k__BackingField */
    _DamageTarget: ReflectionUnitStateBase_DamageTargetType = 0 as ReflectionUnitStateBase_DamageTargetType;
    get DamageTarget(): ReflectionUnitStateBase_DamageTargetType { return this.get_DamageTarget(); }
    set DamageTarget(v: ReflectionUnitStateBase_DamageTargetType) { this.set_DamageTarget(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D6FC0 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_reflection";
    }
    /** @rva 0x16D6F90 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x902530  public ReflectionUnitStateBase.DamageTargetType get_DamageTarget() { } */
    get_DamageTarget(): ReflectionUnitStateBase_DamageTargetType { return this._DamageTarget; /* auto-property */ }
    /** @rva 0x902570  public void set_DamageTarget(ReflectionUnitStateBase.DamageTargetType value) { } */
    set_DamageTarget(value: ReflectionUnitStateBase_DamageTargetType): void { this._DamageTarget = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this {
        this._IconName = "";
        return this;
    }
    /** @rva 0x16D6F40  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ReflectionUnitStateBase..ctor", 0x16D6F40); }
    /** @rva 0x16D67B0  protected List<BattleUnit> GetTargetUnitList(BattleUnit userUnit, BattleUnit attackUnit, List<BattleUnit> selectUnitList) { } */
    GetTargetUnitList(userUnit: BattleUnit, attackUnit: BattleUnit, selectUnitList: List<BattleUnit>): List<BattleUnit> { return notPorted("ReflectionUnitStateBase.GetTargetUnitList", 0x16D67B0); }
    /** @rva 0x16D6C50  public AffectedUnitNoticeBundle Triggering(BattleUnit userUnit, BattleUnit attackUnit, List<BattleUnit> selectUnitList, BattleType battleType, GameDirectorBase gameDirector) { } */
    Triggering(userUnit: BattleUnit, attackUnit: BattleUnit, selectUnitList: List<BattleUnit>, battleType: BattleType, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("ReflectionUnitStateBase.Triggering", 0x16D6C50); }
    /** @rva -1 slot 25  protected abstract Decimal GetDamageBase(BattleUnit userUnit); */
    abstract GetDamageBase(userUnit: BattleUnit): Decimal;
    /** @rva 0x16D6580 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__16_0
        if (list.length > 0) list = list.filter(unit => unit._Condition._BarrierEndurance > 0); // b__16_1
        return list;
    }
    /** @rva 0x16D69F0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleDefender);
        list.push(AISkillTargetSelector.UnitFilterWithMaxDef);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}

// ---- ReDriveBattleCore.UnitState.ReflectionUnitStateBase.DamageTargetType  (TypeDefIndex 645, public enum) ----
export const ReflectionUnitStateBase_DamageTargetType = {
    AttackUnit: 0,
    OpponentTeam: 1,
} as const;
export type ReflectionUnitStateBase_DamageTargetType = (typeof ReflectionUnitStateBase_DamageTargetType)[keyof typeof ReflectionUnitStateBase_DamageTargetType];
