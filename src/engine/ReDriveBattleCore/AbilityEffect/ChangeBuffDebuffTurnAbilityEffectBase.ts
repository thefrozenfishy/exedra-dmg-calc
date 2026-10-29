// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { CutoutUnitState } from "../UnitState/CutoutUnitState";
import { AddTurnUnitStateBase } from "../UnitState/AddTurnUnitStateBase";
import { AbnormalUnitStateBase } from "../UnitState/AbnormalUnitStateBase";
import { AISkillTargetSelector, AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { clamp, dictGet, isImpl, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

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
    /** @rva 0x901720  public int get_MaxChangeCount() { } */
    get_MaxChangeCount(): int { return this._MaxChangeCount; /* auto-property */ }
    /** @rva 0x901760  public void set_MaxChangeCount(int value) { } */
    set_MaxChangeCount(value: int): void { this._MaxChangeCount = value; /* auto-property */ }
    /** @rva 0xAA4040 slot 8  public virtual bool get_IsTurnAdd() { } */
    get_IsTurnAdd(): boolean { return this._IsTurnAdd; /* auto-property */ }
    /** @rva 0xAA4080 slot 9  public virtual void set_IsTurnAdd(bool value) { } */
    set_IsTurnAdd(value: boolean): void { this._IsTurnAdd = value; /* auto-property */ }
    /** @rva 0x1911AA0 slot 10  public virtual bool get_IsTargetBuff() { } */
    get_IsTargetBuff(): boolean { return this._IsTargetBuff; /* auto-property */ }
    /** @rva 0x1911AB0 slot 11  public virtual void set_IsTargetBuff(bool value) { } */
    set_IsTargetBuff(value: boolean): void { this._IsTargetBuff = value; /* auto-property */ }
    /** @rva 0x737A20 slot 12  public virtual string get_DisplayEffectType() { } */
    get_DisplayEffectType(): string { return this._DisplayEffectType; /* auto-property */ }
    /** @rva 0x737A60 slot 13  public virtual void set_DisplayEffectType(string value) { } */
    set_DisplayEffectType(value: string): void { this._DisplayEffectType = value; /* auto-property */ }
    /** @rva 0x190F1B0  protected void .ctor() { } */
    ctor(): this {
        this._DisplayEffectType = "";
        super.ctor();
        return this;
    }
    /** @rva 0x1911A20  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._DisplayEffectType = "";
        super.ctor$AbilityEffectInfo(info);
        this._TargetSkillUniqueId = info._EffectValue1;
        this._TurnChangeValue = info._EffectValue2;
        this._MaxChangeCount = info._EffectValue3;
        return this;
    }
    /** @rva 0x1911600 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            if (targetUnit == null || targetUnit.get_IsDead()) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const states = targetUnit._Condition._StateList.filter(state => this.IsChangeableUnitState(state));
            if (!this.get_IsTurnAdd()) this.DecreaseTurn(states, targetUnit); // vslot 8
            else this.IncreaseTurn(states);
            const variation = targetUnit.UpdateTurnGaugeBySpeed();
            if (variation !== 0) bundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, variation));
            bundle.Add(AffectedUnitNotice.CreateByOneState(targetUnitId, this.get_DisplayEffectType())); // vslot 12
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
    /** @rva 0x1910C50 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        const list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__27_0
        return list.filter(unit => this.$GetAIFilteredTargets$b__27_1(unit));
    }
    /** @rva 0x19112F0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        const candidateUnits = targetUnitList.filter(unit => !unit.get_IsDead()); // <>c.b__28_0
        const funcList = [AISkillTargetSelector.UnitFilterByMainTarget, AISkillTargetSelector.UnitFilterWithMaxAtk];
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(funcList));
        if (unit != null) return unit._Id;
        return 0;
    }
    /** @rva 0x1911170  private bool IsChangeableUnitState(UnitStateBase targetState) { } */
    IsChangeableUnitState(targetState: UnitStateBase): boolean {
        if (targetState == null || targetState._EffectOrigin !== 1) return false;
        if (targetState.get_IsPermanent()) return false;
        if (!this.IsBuffDebuff(targetState)) return false; // inlined in the game
        if (targetState instanceof AbnormalUnitStateBase || targetState instanceof AddTurnUnitStateBase || targetState instanceof CutoutUnitState) return false;
        return this.IsChangeableBySkillUniqueId(targetState); // inlined in the game
    }
    /** @rva 0x19110C0  private bool IsBuffDebuff(UnitStateBase targetState) { } */
    IsBuffDebuff(targetState: UnitStateBase): boolean {
        return isImpl(targetState, this.get_IsTargetBuff() ? "IBuff" : "IDebuff"); // vslot 10
    }
    /** @rva 0x1911140  private bool IsChangeableBySkillUniqueId(UnitStateBase targetState) { } */
    IsChangeableBySkillUniqueId(targetState: UnitStateBase): boolean {
        if (this._TargetSkillUniqueId === 0) return true;
        return targetState._SkillUniqueId === this._TargetSkillUniqueId;
    }
    /** @rva 0x1910DE0  private void IncreaseTurn(List<UnitStateBase> targetStates) { } */
    IncreaseTurn(targetStates: List<UnitStateBase>): void {
        if (targetStates == null) return;
        for (const state of targetStates.filter(ts => this.$IncreaseTurn$b__32_0(ts))) {
            const remaining = state._RemainingTurn;
            const turn = clamp(this._TurnChangeValue + remaining, 0, this._MaxChangeCount) - remaining; // Math.Clamp
            if (turn > 0) state.AddRemainingTurn(turn);
        }
    }
    /** @rva 0x1910A90  private void DecreaseTurn(List<UnitStateBase> targetStates, BattleUnit targetUnit) { } */
    DecreaseTurn(targetStates: List<UnitStateBase>, targetUnit: BattleUnit): void {
        if (targetStates == null) return;
        const removeList: UnitStateBase[] = [];
        for (const state of targetStates) {
            if (state._RemainingTurn - this._TurnChangeValue < 1) removeList.push(state);
            else state.DecreaseRemainingTurn(this._TurnChangeValue);
        }
        targetUnit._Condition.RemoveUnitState$BattleUnit_ListUnitStateBase(targetUnit, removeList);
    }
    /** @rva 0x1911950  private bool <GetAIFilteredTargets>b__27_1(BattleUnit targetUnit) { } */
    $GetAIFilteredTargets$b__27_1(targetUnit: BattleUnit): boolean {
        return targetUnit._Condition._StateList.some(state => this.IsChangeableUnitState(state));
    }
    /** @rva 0x1911A00  private bool <IncreaseTurn>b__32_0(UnitStateBase ts) { } */
    $IncreaseTurn$b__32_0(ts: UnitStateBase): boolean {
        if (ts == null) return false;
        return ts._RemainingTurn < this._MaxChangeCount;
    }
}
