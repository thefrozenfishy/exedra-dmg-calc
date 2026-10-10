// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";

// ---- ReDriveBattleCore.AbilityEffect.ChangeBuffDebuffTurnAbilityEffectBase  (TypeDefIndex 1150, public abstract class) ----
export abstract class ChangeBuffDebuffTurnAbilityEffectBase extends AbilityEffectBase {
    /** 0x60 private int <TargetSkillUniqueId>k__BackingField */
    _TargetSkillUniqueId: int = 0;
    /** 0x64 private int <TurnChangeValue>k__BackingField */
    _TurnChangeValue: int = 0;
    /** 0x68 private int <MaxChangeCount>k__BackingField */
    _MaxChangeCount: int = 0;
    /** 0x6C private bool <IsTurnAdd>k__BackingField */
    _IsTurnAdd: boolean = false;
    /** 0x6D private bool <IsTargetBuff>k__BackingField */
    _IsTargetBuff: boolean = false;
    /** 0x70 private string <DisplayEffectType>k__BackingField */
    _DisplayEffectType: string = null!;
    get TargetSkillUniqueId(): int { return this.get_TargetSkillUniqueId(); }
    set TargetSkillUniqueId(v: int) { this.set_TargetSkillUniqueId(v); }
    get TurnChangeValue(): int { return this.get_TurnChangeValue(); }
    set TurnChangeValue(v: int) { this.set_TurnChangeValue(v); }
    get MaxChangeCount(): int { return this.get_MaxChangeCount(); }
    set MaxChangeCount(v: int) { this.set_MaxChangeCount(v); }
    get IsTurnAdd(): boolean { return this.get_IsTurnAdd(); }
    set IsTurnAdd(v: boolean) { this.set_IsTurnAdd(v); }
    get IsTargetBuff(): boolean { return this.get_IsTargetBuff(); }
    set IsTargetBuff(v: boolean) { this.set_IsTargetBuff(v); }
    get DisplayEffectType(): string { return this.get_DisplayEffectType(); }
    set DisplayEffectType(v: string) { this.set_DisplayEffectType(v); }
    /** @rva 0x8A2200  public int get_TargetSkillUniqueId() { } */
    get_TargetSkillUniqueId(): int { return this._TargetSkillUniqueId; /* auto-property */ }
    /** @rva 0x8A22D0  public void set_TargetSkillUniqueId(int value) { } */
    set_TargetSkillUniqueId(value: int): void { this._TargetSkillUniqueId = value; /* auto-property */ }
    /** @rva 0x8A2220  public int get_TurnChangeValue() { } */
    get_TurnChangeValue(): int { return this._TurnChangeValue; /* auto-property */ }
    /** @rva 0x8A22F0  public void set_TurnChangeValue(int value) { } */
    set_TurnChangeValue(value: int): void { this._TurnChangeValue = value; /* auto-property */ }
    /** @rva 0x901BF0  public int get_MaxChangeCount() { } */
    get_MaxChangeCount(): int { return this._MaxChangeCount; /* auto-property */ }
    /** @rva 0x901C00  public void set_MaxChangeCount(int value) { } */
    set_MaxChangeCount(value: int): void { this._MaxChangeCount = value; /* auto-property */ }
    /** @rva 0xA90390 slot 8  public virtual bool get_IsTurnAdd() { } */
    get_IsTurnAdd(): boolean { return this._IsTurnAdd; /* auto-property */ }
    /** @rva 0xA903B0 slot 9  public virtual void set_IsTurnAdd(bool value) { } */
    set_IsTurnAdd(value: boolean): void { this._IsTurnAdd = value; /* auto-property */ }
    /** @rva 0x18EC3E0 slot 10  public virtual bool get_IsTargetBuff() { } */
    get_IsTargetBuff(): boolean { return this._IsTargetBuff; /* auto-property */ }
    /** @rva 0x18EC3F0 slot 11  public virtual void set_IsTargetBuff(bool value) { } */
    set_IsTargetBuff(value: boolean): void { this._IsTargetBuff = value; /* auto-property */ }
    /** @rva 0x737A20 slot 12  public virtual string get_DisplayEffectType() { } */
    get_DisplayEffectType(): string { return this._DisplayEffectType; /* auto-property */ }
    /** @rva 0x737A60 slot 13  public virtual void set_DisplayEffectType(string value) { } */
    set_DisplayEffectType(value: string): void { this._DisplayEffectType = value; /* auto-property */ }
    /** @rva 0x18E9C60  protected void .ctor() { } */
    ctor(): this { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase..ctor", 0x18E9C60); }
    /** @rva 0x18EC360  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase..ctor", 0x18EC360); }
    /** @rva 0x18EBF40 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.Triggering", 0x18EBF40); }
    /** @rva 0x18EB590 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.GetAIFilteredTargets", 0x18EB590); }
    /** @rva 0x18EBC30 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.SelectTargetInAIAction", 0x18EBC30); }
    /** @rva 0x18EBAB0  private bool IsChangeableUnitState(UnitStateBase targetState) { } */
    IsChangeableUnitState(targetState: UnitStateBase): boolean { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.IsChangeableUnitState", 0x18EBAB0); }
    /** @rva 0x18EBA00  private bool IsBuffDebuff(UnitStateBase targetState) { } */
    IsBuffDebuff(targetState: UnitStateBase): boolean { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.IsBuffDebuff", 0x18EBA00); }
    /** @rva 0x18EBA80  private bool IsChangeableBySkillUniqueId(UnitStateBase targetState) { } */
    IsChangeableBySkillUniqueId(targetState: UnitStateBase): boolean { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.IsChangeableBySkillUniqueId", 0x18EBA80); }
    /** @rva 0x18EB720  private void IncreaseTurn(List<UnitStateBase> targetStates) { } */
    IncreaseTurn(targetStates: List<UnitStateBase>): void { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.IncreaseTurn", 0x18EB720); }
    /** @rva 0x18EB3D0  private void DecreaseTurn(List<UnitStateBase> targetStates, BattleUnit targetUnit) { } */
    DecreaseTurn(targetStates: List<UnitStateBase>, targetUnit: BattleUnit): void { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.DecreaseTurn", 0x18EB3D0); }
    /** @rva 0x18EC290  private bool <GetAIFilteredTargets>b__27_1(BattleUnit targetUnit) { } */
    $GetAIFilteredTargets$b__27_1(targetUnit: BattleUnit): boolean { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.<GetAIFilteredTargets>b__27_1", 0x18EC290); }
    /** @rva 0x18EC340  private bool <IncreaseTurn>b__32_0(UnitStateBase ts) { } */
    $IncreaseTurn$b__32_0(ts: UnitStateBase): boolean { return notPorted("ChangeBuffDebuffTurnAbilityEffectBase.<IncreaseTurn>b__32_0", 0x18EC340); }
}
