// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { IStateIconNumberDisplayable$RefreshStateIconNumber } from "./UnitState/IStateIconNumberDisplayable";
import type { IStateIconNumberDisplayable } from "./UnitState/IStateIconNumberDisplayable";
import type { ISpeedVariation } from "./UnitState/ISpeedVariation";
import type { IHasUpdateableEffectValue } from "./UnitState/IHasUpdateableEffectValue";
import type { IConsumeRemainCount } from "./UnitState/IConsumeRemainCount";
import type { IBlendable } from "./UnitState/IBlendable";
import type { IAccum } from "./UnitState/IAccum";
import { AdditionType } from "./UnitState/AdditionType";
import { EffectOriginType } from "./UnitState/EffectOriginType";
import { StateIconData } from "./StateIconData";
import { Unique10070201UnitState } from "./UnitState/Unique10070201UnitState";
import { LockSpecialAttackUnitState } from "./UnitState/LockSpecialAttackUnitState";
import { UnableActionUnitStateBase } from "./UnitState/UnableActionUnitStateBase";
import { UnableUseSkillUnitStateBase } from "./UnitState/UnableUseSkillUnitStateBase";
import { CountUnitState } from "./UnitState/CountUnitState";
import { ComboUnitState } from "./UnitState/ComboUnitState";
import { UniqueUnitStateBase } from "./UnitState/UniqueUnitStateBase";
import { UniqueAccumUnitStateBase } from "./UnitState/UniqueAccumUnitStateBase";
import { UniqueZoneUnitState } from "./UnitState/UniqueZoneUnitState";
import { BarrierUnitState } from "./UnitState/BarrierUnitState";
import { PreventAbnormalUnitState } from "./UnitState/PreventAbnormalUnitState";
import { AbnormalUnitStateBase } from "./UnitState/AbnormalUnitStateBase";
import { f32, isImpl, notPorted, removeAll, randomChance } from "../runtime";
import type { List, Nullable, Ref, Type, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";

import type { UnitStateBase, UnitStateBase_DirectionType } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.UnitCondition  (TypeDefIndex 479, public class) ----
export class UnitCondition {
    /** 0x10 private GameDirectorBase gameDirector */
    gameDirector: GameDirectorBase = null!;
    /** 0x18 private List<UnitStateBase> <StateList>k__BackingField */
    _StateList: List<UnitStateBase> = null!;
    /** 0x20 private StateIconData[] <StateIcons>k__BackingField */
    _StateIcons: StateIconData[] = null!;
    /** 0x28 private string[] <VisualEffectNames>k__BackingField */
    _VisualEffectNames: string[] = null!;
    /** 0x30 private string <VisualShaderName>k__BackingField */
    _VisualShaderName: string = null!;
    /** 0x38 private bool <CanNotAction>k__BackingField */
    _CanNotAction: boolean = false;
    /** 0x39 private bool <CanNotUseSkill>k__BackingField */
    _CanNotUseSkill: boolean = false;
    /** 0x3A private bool <CanNotUseSpecialAttack>k__BackingField */
    _CanNotUseSpecialAttack: boolean = false;
    /** 0x3B private bool <IsAbnormalState>k__BackingField */
    _IsAbnormalState: boolean = false;
    /** 0x3C private int <BarrierEndurance>k__BackingField */
    _BarrierEndurance: int = 0;
    /** 0x40 private int <MaxBarrierEndurance>k__BackingField */
    _MaxBarrierEndurance: int = 0;
    /** 0x44 private int <ChargePoint>k__BackingField */
    _ChargePoint: int = 0;
    /** 0x48 private int <MaxChargePoint>k__BackingField */
    _MaxChargePoint: int = 0;
    /** 0x4C private int <RepeatStunParryRate>k__BackingField */
    _RepeatStunParryRate: int = 0;
    /** 0x50 private bool <IsAdditionalTurnCoolTime>k__BackingField */
    _IsAdditionalTurnCoolTime: boolean = false;
    /** 0x54 private int <CountPoint>k__BackingField */
    _CountPoint: int = 0;
    /** 0x58 private int <MaxCountPoint>k__BackingField */
    _MaxCountPoint: int = 0;
    /** 0x5C private int <ZoneStack>k__BackingField */
    _ZoneStack: int = 0;
    /** 0x60 private int <MaxZoneStack>k__BackingField */
    _MaxZoneStack: int = 0;
    /** 0x64 private int <ZoneEffectId>k__BackingField */
    _ZoneEffectId: int = 0;
    /** 0x68 private int <ExpandZoneUnitStatePatternMstId>k__BackingField */
    _ExpandZoneUnitStatePatternMstId: int = 0;
    /** 0x6C private int <ReleaseZoneUnitStatePatternMstId>k__BackingField */
    _ReleaseZoneUnitStatePatternMstId: int = 0;
    get StateList(): List<UnitStateBase> { return this.get_StateList(); }
    set StateList(v: List<UnitStateBase>) { this.set_StateList(v); }
    get StateIcons(): StateIconData[] { return this.get_StateIcons(); }
    set StateIcons(v: StateIconData[]) { this.set_StateIcons(v); }
    get VisualEffectNames(): string[] { return this.get_VisualEffectNames(); }
    set VisualEffectNames(v: string[]) { this.set_VisualEffectNames(v); }
    get VisualShaderName(): string { return this.get_VisualShaderName(); }
    set VisualShaderName(v: string) { this.set_VisualShaderName(v); }
    get CanNotAction(): boolean { return this.get_CanNotAction(); }
    set CanNotAction(v: boolean) { this.set_CanNotAction(v); }
    get CanNotUseSkill(): boolean { return this.get_CanNotUseSkill(); }
    set CanNotUseSkill(v: boolean) { this.set_CanNotUseSkill(v); }
    get CanNotUseSpecialAttack(): boolean { return this.get_CanNotUseSpecialAttack(); }
    set CanNotUseSpecialAttack(v: boolean) { this.set_CanNotUseSpecialAttack(v); }
    get IsAbnormalState(): boolean { return this.get_IsAbnormalState(); }
    set IsAbnormalState(v: boolean) { this.set_IsAbnormalState(v); }
    get BarrierEndurance(): int { return this.get_BarrierEndurance(); }
    set BarrierEndurance(v: int) { this.set_BarrierEndurance(v); }
    get MaxBarrierEndurance(): int { return this.get_MaxBarrierEndurance(); }
    set MaxBarrierEndurance(v: int) { this.set_MaxBarrierEndurance(v); }
    get ChargePoint(): int { return this.get_ChargePoint(); }
    set ChargePoint(v: int) { this.set_ChargePoint(v); }
    get MaxChargePoint(): int { return this.get_MaxChargePoint(); }
    set MaxChargePoint(v: int) { this.set_MaxChargePoint(v); }
    get RepeatStunParryRate(): int { return this.get_RepeatStunParryRate(); }
    set RepeatStunParryRate(v: int) { this.set_RepeatStunParryRate(v); }
    get IsAdditionalTurnCoolTime(): boolean { return this.get_IsAdditionalTurnCoolTime(); }
    set IsAdditionalTurnCoolTime(v: boolean) { this.set_IsAdditionalTurnCoolTime(v); }
    get CountPoint(): int { return this.get_CountPoint(); }
    set CountPoint(v: int) { this.set_CountPoint(v); }
    get MaxCountPoint(): int { return this.get_MaxCountPoint(); }
    set MaxCountPoint(v: int) { this.set_MaxCountPoint(v); }
    get ZoneStack(): int { return this.get_ZoneStack(); }
    set ZoneStack(v: int) { this.set_ZoneStack(v); }
    get MaxZoneStack(): int { return this.get_MaxZoneStack(); }
    set MaxZoneStack(v: int) { this.set_MaxZoneStack(v); }
    get ZoneEffectId(): int { return this.get_ZoneEffectId(); }
    set ZoneEffectId(v: int) { this.set_ZoneEffectId(v); }
    get ExpandZoneUnitStatePatternMstId(): int { return this.get_ExpandZoneUnitStatePatternMstId(); }
    set ExpandZoneUnitStatePatternMstId(v: int) { this.set_ExpandZoneUnitStatePatternMstId(v); }
    get ReleaseZoneUnitStatePatternMstId(): int { return this.get_ReleaseZoneUnitStatePatternMstId(); }
    set ReleaseZoneUnitStatePatternMstId(v: int) { this.set_ReleaseZoneUnitStatePatternMstId(v); }
    /** @rva 0x733E90  public List<UnitStateBase> get_StateList() { } */
    get_StateList(): List<UnitStateBase> { return this._StateList; /* auto-property */ }
    /** @rva 0x736AB0  public void set_StateList(List<UnitStateBase> value) { } */
    set_StateList(value: List<UnitStateBase>): void { this._StateList = value; /* auto-property */ }
    /** @rva 0x7369E0  public StateIconData[] get_StateIcons() { } */
    get_StateIcons(): StateIconData[] { return this._StateIcons; /* auto-property */ }
    /** @rva 0x736A50  public void set_StateIcons(StateIconData[] value) { } */
    set_StateIcons(value: StateIconData[]): void { this._StateIcons = value; /* auto-property */ }
    /** @rva 0x736EA0  public string[] get_VisualEffectNames() { } */
    get_VisualEffectNames(): string[] { return this._VisualEffectNames; /* auto-property */ }
    /** @rva 0x736F10  public void set_VisualEffectNames(string[] value) { } */
    set_VisualEffectNames(value: string[]): void { this._VisualEffectNames = value; /* auto-property */ }
    /** @rva 0x736F00  public string get_VisualShaderName() { } */
    get_VisualShaderName(): string { return this._VisualShaderName; /* auto-property */ }
    /** @rva 0x736F30  public void set_VisualShaderName(string value) { } */
    set_VisualShaderName(value: string): void { this._VisualShaderName = value; /* auto-property */ }
    /** @rva 0x7388E0  public bool get_CanNotAction() { } */
    get_CanNotAction(): boolean { return this._CanNotAction; /* auto-property */ }
    /** @rva 0x7388F0  public void set_CanNotAction(bool value) { } */
    set_CanNotAction(value: boolean): void { this._CanNotAction = value; /* auto-property */ }
    /** @rva 0x9025C0  public bool get_CanNotUseSkill() { } */
    get_CanNotUseSkill(): boolean { return this._CanNotUseSkill; /* auto-property */ }
    /** @rva 0x902680  public void set_CanNotUseSkill(bool value) { } */
    set_CanNotUseSkill(value: boolean): void { this._CanNotUseSkill = value; /* auto-property */ }
    /** @rva 0x9FD130  public bool get_CanNotUseSpecialAttack() { } */
    get_CanNotUseSpecialAttack(): boolean { return this._CanNotUseSpecialAttack; /* auto-property */ }
    /** @rva 0xBCC500  public void set_CanNotUseSpecialAttack(bool value) { } */
    set_CanNotUseSpecialAttack(value: boolean): void { this._CanNotUseSpecialAttack = value; /* auto-property */ }
    /** @rva 0xBCC480  public bool get_IsAbnormalState() { } */
    get_IsAbnormalState(): boolean { return this._IsAbnormalState; /* auto-property */ }
    /** @rva 0xBCC4E0  public void set_IsAbnormalState(bool value) { } */
    set_IsAbnormalState(value: boolean): void { this._IsAbnormalState = value; /* auto-property */ }
    /** @rva 0x8F3F40  public int get_BarrierEndurance() { } */
    get_BarrierEndurance(): int { return this._BarrierEndurance; /* auto-property */ }
    /** @rva 0x901F80  public void set_BarrierEndurance(int value) { } */
    set_BarrierEndurance(value: int): void { this._BarrierEndurance = value; /* auto-property */ }
    /** @rva 0x7670B0  public int get_MaxBarrierEndurance() { } */
    get_MaxBarrierEndurance(): int { return this._MaxBarrierEndurance; /* auto-property */ }
    /** @rva 0x767A90  public void set_MaxBarrierEndurance(int value) { } */
    set_MaxBarrierEndurance(value: int): void { this._MaxBarrierEndurance = value; /* auto-property */ }
    /** @rva 0x902010  public int get_ChargePoint() { } */
    get_ChargePoint(): int { return this._ChargePoint; /* auto-property */ }
    /** @rva 0x902040  public void set_ChargePoint(int value) { } */
    set_ChargePoint(value: int): void { this._ChargePoint = value; /* auto-property */ }
    /** @rva 0x854810  public int get_MaxChargePoint() { } */
    get_MaxChargePoint(): int { return this._MaxChargePoint; /* auto-property */ }
    /** @rva 0x902050  public void set_MaxChargePoint(int value) { } */
    set_MaxChargePoint(value: int): void { this._MaxChargePoint = value; /* auto-property */ }
    /** @rva 0x87BCD0  public int get_RepeatStunParryRate() { } */
    get_RepeatStunParryRate(): int { return this._RepeatStunParryRate; /* auto-property */ }
    /** @rva 0x902030  public void set_RepeatStunParryRate(int value) { } */
    set_RepeatStunParryRate(value: int): void { this._RepeatStunParryRate = value; /* auto-property */ }
    /** @rva 0x8AC2E0  public bool get_IsAdditionalTurnCoolTime() { } */
    get_IsAdditionalTurnCoolTime(): boolean { return this._IsAdditionalTurnCoolTime; /* auto-property */ }
    /** @rva 0x8AC340  public void set_IsAdditionalTurnCoolTime(bool value) { } */
    set_IsAdditionalTurnCoolTime(value: boolean): void { this._IsAdditionalTurnCoolTime = value; /* auto-property */ }
    /** @rva 0x8A2210  public int get_CountPoint() { } */
    get_CountPoint(): int { return this._CountPoint; /* auto-property */ }
    /** @rva 0x8A22E0  public void set_CountPoint(int value) { } */
    set_CountPoint(value: int): void { this._CountPoint = value; /* auto-property */ }
    /** @rva 0x737C40  public int get_MaxCountPoint() { } */
    get_MaxCountPoint(): int { return this._MaxCountPoint; /* auto-property */ }
    /** @rva 0x737DF0  public void set_MaxCountPoint(int value) { } */
    set_MaxCountPoint(value: int): void { this._MaxCountPoint = value; /* auto-property */ }
    /** @rva 0x7544F0  public int get_ZoneStack() { } */
    get_ZoneStack(): int { return this._ZoneStack; /* auto-property */ }
    /** @rva 0x7547A0  public void set_ZoneStack(int value) { } */
    set_ZoneStack(value: int): void { this._ZoneStack = value; /* auto-property */ }
    /** @rva 0x8A2200  public int get_MaxZoneStack() { } */
    get_MaxZoneStack(): int { return this._MaxZoneStack; /* auto-property */ }
    /** @rva 0x8A22D0  public void set_MaxZoneStack(int value) { } */
    set_MaxZoneStack(value: int): void { this._MaxZoneStack = value; /* auto-property */ }
    /** @rva 0x8A2220  public int get_ZoneEffectId() { } */
    get_ZoneEffectId(): int { return this._ZoneEffectId; /* auto-property */ }
    /** @rva 0x8A22F0  public void set_ZoneEffectId(int value) { } */
    set_ZoneEffectId(value: int): void { this._ZoneEffectId = value; /* auto-property */ }
    /** @rva 0x901BF0  public int get_ExpandZoneUnitStatePatternMstId() { } */
    get_ExpandZoneUnitStatePatternMstId(): int { return this._ExpandZoneUnitStatePatternMstId; /* auto-property */ }
    /** @rva 0x901C00  public void set_ExpandZoneUnitStatePatternMstId(int value) { } */
    set_ExpandZoneUnitStatePatternMstId(value: int): void { this._ExpandZoneUnitStatePatternMstId = value; /* auto-property */ }
    /** @rva 0x8570F0  public int get_ReleaseZoneUnitStatePatternMstId() { } */
    get_ReleaseZoneUnitStatePatternMstId(): int { return this._ReleaseZoneUnitStatePatternMstId; /* auto-property */ }
    /** @rva 0x901C10  public void set_ReleaseZoneUnitStatePatternMstId(int value) { } */
    set_ReleaseZoneUnitStatePatternMstId(value: int): void { this._ReleaseZoneUnitStatePatternMstId = value; /* auto-property */ }
    /** @rva 0x730C60  public void SetGameDirector(GameDirectorBase gameDirector) { } */
    SetGameDirector(gameDirector: GameDirectorBase): void {
        this.gameDirector = gameDirector;
    }
    /** @rva 0x15C8A30  public bool AddUnitState(UnitStateBase state, BattleUnit targetUnit, int turnOrderPriority, BattleUnit userUnit, bool isProbabilityIgnored = False) { } */
    AddUnitState(state: UnitStateBase, targetUnit: BattleUnit, turnOrderPriority: int, userUnit: BattleUnit, isProbabilityIgnored: boolean = false): boolean {
        if (targetUnit.IsDead) return false;
        if (!state.CanAddTo(targetUnit)) return false;
        // new System.Random().Next(1000) against probability (percent) * 10
        const probability = state.GetProcessedProbability(targetUnit, userUnit);
        // roll = new System.Random().Next(1000) (drawn before the isProbabilityIgnored check in the game; the draw is unseeded)
        if (!isProbabilityIgnored && !randomChance(probability, "effect", [state, targetUnit, userUnit], r => !(f32(probability * 10) <= Math.floor(r * 1000)))) return false;
        if (state instanceof AbnormalUnitStateBase) {
            for (const s of targetUnit.Condition.StateList) {
                if (s instanceof PreventAbnormalUnitState && s.IsActive$BattleUnit(targetUnit) && s.RemainCount >= 1) {
                    s.ConsumeRemainCount(); // a prevent-abnormal state blocks this abnormal state and loses one count
                    return false;
                }
            }
        }
        if (isImpl(state, "ISpeedVariation")) {
            const addition = (state as unknown as ISpeedVariation).Addition;
            if (addition === AdditionType.Up) targetUnit.TurnGauge.TurnOrderPriority = turnOrderPriority;
            else if (addition === AdditionType.Down) targetUnit.TurnGauge.TurnOrderPriority = -turnOrderPriority;
        }
        if (state instanceof BarrierUnitState) {
            this._MaxBarrierEndurance = Math.max(this._MaxBarrierEndurance, state.CalculatedMaxEndurance);
            this._BarrierEndurance = Math.min(this._MaxBarrierEndurance, this._BarrierEndurance + state.CalculatedEndurance);
        }
        const fromActiveOrCondition = state.EffectOrigin === EffectOriginType.ActiveSkill || state.IsConditionActivation;
        const result = !targetUnit.IsDead && fromActiveOrCondition && !(state instanceof UniqueZoneUnitState);
        if (fromActiveOrCondition) {
            const duplicate = this.GetDuplicateUnitState(state);
            if (duplicate != null) {
                if (isImpl(duplicate, "IBlendable")) {
                    (duplicate as unknown as IBlendable).Blend(state);
                    return result;
                }
                if (!state.IsPriorityOver(duplicate)) return result;
                const i = this._StateList.indexOf(duplicate);
                if (i >= 0) this._StateList.splice(i, 1);
            }
        }
        this._StateList.push(state);
        state.OnAddedToCondition(targetUnit, this.gameDirector);
        return result;
    }
    /** @rva 0x15CA550  public void RemoveUnitState(BattleUnit unit, Type stateType, EffectOriginType origin = 0, BattleUnit userUnit, Nullable<UnitStateBase.DirectionType> directionType, Func<UnitStateBase, bool> predicate) { } */
    RemoveUnitState$BattleUnit_Type_EffectOriginType_BattleUnit_NullableUnitStateBaseDirectionType_FuncUnitStateBasebool(unit: BattleUnit, stateType: Type, origin: EffectOriginType /* = 0 */, userUnit: BattleUnit, directionType: Nullable<UnitStateBase_DirectionType>, predicate: ((a0: UnitStateBase) => boolean)): void {
        for (const state of this._StateList) {
            if (stateType != null && !(state instanceof (stateType as any))) continue; // GetType() == T || IsSubclassOf(T)
            if (origin !== EffectOriginType.None && state.EffectOrigin !== origin) continue;
            if (userUnit != null && state.UserUnitId !== userUnit.Id) continue;
            if (directionType != null && directionType !== state.Direction) continue;
            if (predicate == null || predicate(state)) state.ShouldBeRemovedNow = true;
        }
        this.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state.ShouldBeRemovedNow); // b__87_0
    }
    /** @rva 0x15CA920  public void RemoveUnitState(BattleUnit unit, Func<UnitStateBase, bool> predicate) { } */
    RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit: BattleUnit, predicate: ((a0: UnitStateBase) => boolean)): void {
        for (const state of this._StateList.filter(predicate)) state.OnRemovingFromCondition(unit, this.gameDirector);
        removeAll(this._StateList, predicate);
    }
    /** @rva 0x15CABA0  public void RemoveUnitState(BattleUnit unit, List<UnitStateBase> removeStateList) { } */
    RemoveUnitState$BattleUnit_ListUnitStateBase(unit: BattleUnit, removeStateList: List<UnitStateBase>): void {
        for (const state of this._StateList) {
            if (removeStateList.includes(state)) state.ShouldBeRemovedNow = true;
        }
        this.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state.ShouldBeRemovedNow); // b__89_0
    }
    /** @rva -1  public void RemoveUnitState<T>(BattleUnit unit, EffectOriginType origin = 0) { } */
    RemoveUnitState$BattleUnit_EffectOriginType<T>(T$: abstract new (...args: any[]) => T, unit: BattleUnit, origin: EffectOriginType = 0 as EffectOriginType): void {
        // generic instance 0x270b8f0
        this.RemoveUnitState$BattleUnit_Type_EffectOriginType_BattleUnit_NullableUnitStateBaseDirectionType_FuncUnitStateBasebool(unit, T$, origin, null!, null, null!);
    }
    /** @rva 0x15CA8F0  public void RemoveUnitState(BattleUnit unit, EffectOriginType origin, BattleUnit userUnit, Func<UnitStateBase, bool> predicate) { } */
    RemoveUnitState$BattleUnit_EffectOriginType_BattleUnit_FuncUnitStateBasebool(unit: BattleUnit, origin: EffectOriginType, userUnit: BattleUnit, predicate: ((a0: UnitStateBase) => boolean)): void {
        this.RemoveUnitState$BattleUnit_Type_EffectOriginType_BattleUnit_NullableUnitStateBaseDirectionType_FuncUnitStateBasebool(unit, null!, origin, userUnit, null, predicate);
    }
    /** @rva 0x15C9B00  public void Refresh(BattleUnit unit) { } */
    Refresh(unit: BattleUnit): void {
        const icons: StateIconData[] = [];
        const visualEffects = new Set<string>();
        let shaderName = "";
        let canNotAction = false, canNotUseSkill = false, canNotUseSpecialAttack = false, isAbnormal = false;
        // b__92_0: consume-count states that ran out
        this.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit,
            state => isImpl(state, "IConsumeRemainCount") && (state as unknown as IConsumeRemainCount).RemainCount < 1);
        for (const state of this._StateList.filter(s => s.IsActive$BattleUnit(unit))) { // b__1
            if (state.EffectOrigin === EffectOriginType.ActiveSkill || state.IsConditionActivation || state.ShowStateIconAttachedByPassiveSkill) {
                if (state.IconName !== "") {
                    const existing = icons.find(d => d.IconName === state.IconName) ?? null; // b__2
                    if (isImpl(state, "IConsumeRemainCount") && (state as unknown as IConsumeRemainCount).IsStateIconNumberAggregated && existing != null) {
                        existing.RemainCount = existing.RemainCount + state.RemainCount;
                    } else {
                        let number = 0;
                        let showZero = false;
                        if (isImpl(state, "IStateIconNumberDisplayable")) {
                            const d = state as unknown as IStateIconNumberDisplayable;
                            IStateIconNumberDisplayable$RefreshStateIconNumber(d, unit); // default interface method when not overridden
                            number = d.StateIconNumber;
                            showZero = d.IsShowZeroIfZero;
                        }
                        icons.push(new StateIconData().ctor$UnitStateBase_int_bool(state, number, showZero));
                    }
                }
            }
            if (state instanceof UnableUseSkillUnitStateBase) canNotUseSkill = true;
            if (state instanceof LockSpecialAttackUnitState) canNotUseSpecialAttack = true;
            if (state instanceof UnableActionUnitStateBase) canNotAction = true;
            if (state instanceof AbnormalUnitStateBase) isAbnormal = true;
            if (state.AlwaysVisualEffectName !== "") visualEffects.add(state.AlwaysVisualEffectName);
            if (state instanceof Unique10070201UnitState) shaderName = state.VisualShaderName;
        }
        if (unit.Condition.GetUnitStateList(BarrierUnitState, false).length < 1) this._BarrierEndurance = 0;
        if (this._BarrierEndurance === 0) unit.Condition.RemoveUnitState$BattleUnit_EffectOriginType(BarrierUnitState, unit, EffectOriginType.None);
        this._StateIcons = icons;
        this._VisualEffectNames = [...visualEffects];
        this._VisualShaderName = shaderName;
        this._CanNotAction = canNotAction;
        this._CanNotUseSkill = canNotUseSkill;
        this._CanNotUseSpecialAttack = canNotUseSpecialAttack;
        this._IsAbnormalState = isAbnormal;
    }
    /** @rva 0x15C98B0  public void PassingTurn(int turnNum, BattleUnit unit) { } */
    PassingTurn(turnNum: int, unit: BattleUnit): void {
        for (const state of this._StateList) {
            if (state.IsPermanent) continue;
            state.PassingTurn(turnNum);
            if (state.RemainingTurn < 1) state.ShouldBeRemovedNow = true;
        }
        this.RemoveUnitState$BattleUnit_FuncUnitStateBasebool(unit, state => state.ShouldBeRemovedNow); // b__93_0
    }
    /** @rva 0x15C9670  public List<UnitStateBase> GetUnitState(Type stateType, bool doWithoutInheritance = False) { } */
    GetUnitState$2(stateType: Type, doWithoutInheritance: boolean = false): List<UnitStateBase> {
        const list: UnitStateBase[] = [];
        for (const state of this._StateList) {
            if (state.constructor === stateType) list.push(state);
            else if (!doWithoutInheritance && state instanceof (stateType as any)) list.push(state); // GetType().IsSubclassOf(stateType)
        }
        return list;
    }
    /** @rva -1  public List<T> GetUnitStateList<T>(bool doWithoutInheritance = False) { } */
    GetUnitStateList<T>(T$: abstract new (...args: any[]) => T, doWithoutInheritance: boolean = false): List<T> {
        // generic instance 0x270b6b0: GetUnitState(typeof(T), dwi).Select(s => (T)s).ToList()
        return this.GetUnitState$2(T$, doWithoutInheritance) as unknown as T[];
    }
    /** @rva -1  public T GetUnitState<T>(bool doWithoutInheritance = False) { } */
    GetUnitState$1<T>(T$: abstract new (...args: any[]) => T, doWithoutInheritance: boolean = false): T {
        // generic instance 0x270b890
        return this.GetUnitStateList(T$, doWithoutInheritance)[0] ?? null!;
    }
    /** @rva -1  public bool TryGetUnitState<T>(out T unitState, bool doWithoutInheritance = False) { } */
    TryGetUnitState<T>(T$: abstract new (...args: any[]) => T, unitState: Ref<T>, _doWithoutInheritance: boolean = false): boolean {
        // generic instance 0x270b9a0 passes doWithoutInheritance = false to GetUnitStateList whatever the caller gave
        unitState.v = this.GetUnitStateList(T$, false)[0] ?? null!;
        return unitState.v != null;
    }
    /** @rva 0x15C8F90  public UnitStateBase GetDuplicateUnitState(UnitStateBase compareState) { } */
    GetDuplicateUnitState(compareState: UnitStateBase): UnitStateBase {
        if (compareState.AllowDuplicate) return null!;
        const accum = compareState instanceof UniqueAccumUnitStateBase ? compareState : null;
        if (accum != null) {
            // b__0: same giver and same AccumCountMax
            return this.GetSameStateList(compareState, false).filter((s): s is UniqueAccumUnitStateBase => s instanceof UniqueAccumUnitStateBase)
                .find(s => s.UserUnitId === compareState.UserUnitId && s.AccumCountMax === accum.AccumCountMax) ?? null!;
        }
        if (compareState.EffectOrigin === EffectOriginType.PassiveSkill) {
            const iaccum = isImpl(compareState, "IAccum") ? compareState as unknown as IAccum & IHasUpdateableEffectValue : null;
            if (iaccum == null) {
                // b__2: same origin, same detail id, same giver
                return this._StateList.find(s => s.EffectOrigin === compareState.EffectOrigin && s.MstId === compareState.MstId
                    && s.UserUnitId === compareState.UserUnitId) ?? null!;
            }
            // b__3 (exact type only): same origin, source, effect value, accumulation cap and giver
            return this.GetUnitState$2(compareState.constructor, true).find(s => {
                if (s.EffectOrigin !== compareState.EffectOrigin || s.AbilitySource !== compareState.AbilitySource) return false;
                if (!isImpl(s, "IAccum")) throw new TypeError("InvalidCastException: IAccum");
                const other = s as unknown as IAccum & IHasUpdateableEffectValue;
                return other.UpdateableEffectValue === iaccum.UpdateableEffectValue && other.AccumCountMax === iaccum.AccumCountMax
                    && s.UserUnitId === compareState.UserUnitId;
            }) ?? null!;
        }
        // b__1: same origin, giver, target role/element and active-condition csv
        return this.GetSameStateList(compareState, false).find(s => s.EffectOrigin === compareState.EffectOrigin
            && s.UserUnitId === compareState.UserUnitId && s.TargetRole === compareState.TargetRole
            && s.TargetElement === compareState.TargetElement && s.ActiveConditionSetIdCsv === compareState.ActiveConditionSetIdCsv) ?? null!;
    }
    /** @rva 0x15C9320  public ComboUnitState GetMaximumActionNumComboUnitState(BattleUnit battleUnit) { } */
    GetMaximumActionNumComboUnitState(battleUnit: BattleUnit): ComboUnitState {
        let best: ComboUnitState = null!;
        let max = -1;
        for (const state of this._StateList) {
            if (state instanceof ComboUnitState && state.IsActive$BattleUnit(battleUnit) && max < state.actionNum) {
                max = state.actionNum;
                best = state;
            }
        }
        return best;
    }
    /** @rva 0x15CAE00  public bool TryModifyCountPointBy(int deltaCountPoint) { } */
    TryModifyCountPointBy(deltaCountPoint: int): boolean {
        if (!this._StateList.some(s => s instanceof CountUnitState)) return false;
        this._CountPoint = clamp(this._CountPoint + deltaCountPoint, 0, this._MaxCountPoint); // Math.Clamp 0xbaf550
        return true;
    }
    /** @rva 0x15C94C0  public List<UnitStateBase> GetSameStateList(UnitStateBase compareState, bool doWithoutInheritance = False) { } */
    GetSameStateList(compareState: UnitStateBase, doWithoutInheritance: boolean = false): List<UnitStateBase> {
        let list = this.GetUnitState$2(compareState.constructor, doWithoutInheritance);
        const unique = compareState instanceof UniqueUnitStateBase ? compareState : null;
        if (unique != null) {
            // b__0: unique states only match the same pattern
            list = list.filter(s => s instanceof UniqueUnitStateBase && s.UniqueStatePatternMstId === unique.UniqueStatePatternMstId);
        }
        return list;
    }
    /** @rva 0x15CADF0  public void ResetZoneStatePatternMstId() { } */
    ResetZoneStatePatternMstId(): void {
        // one qword store at +0x68 clears both pattern ids
        this._ExpandZoneUnitStatePatternMstId = 0;
        this._ReleaseZoneUnitStatePatternMstId = 0;
    }
    /** @rva 0x15CAED0  public void .ctor() { } */
    ctor(): this {
        this._StateList = [];
        this._StateIcons = [];
        this._VisualEffectNames = [];
        this._VisualShaderName = "";
        this._ZoneEffectId = -1;
        return this;
    }
}

/** System.Math.Clamp(int, int, int) */
function clamp(value: number, min: number, max: number): number {
    if (min > max) throw new RangeError("min > max");
    if (value < min) return min;
    return value > max ? max : value;
}