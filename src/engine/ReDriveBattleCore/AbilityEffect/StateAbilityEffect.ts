// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";
import type { IHasUpdateableEffectValue } from "../UnitState/IHasUpdateableEffectValue";
import type { IEffectValueVariation } from "../UnitState/IEffectValueVariation";
import type { INeutralState } from "../UnitState/INeutralState";
import { IBattleStartTriggerPriority_Define } from "../IBattleStartTriggerPriority";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";
import { DwnBarrierValueUnitState } from "../UnitState/DwnBarrierValueUnitState";
import { AddTurnUnitStateBase } from "../UnitState/AddTurnUnitStateBase";
import { BarrierUnitState } from "../UnitState/BarrierUnitState";
import { AffectedUnitNotice, AffectedUnitNotice_AddStateInfo } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { f32, ifaceProp, isImpl, notPorted } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBattleStartTriggerPriority } from "../IBattleStartTriggerPriority";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import type { UnitStateBase } from "../UnitState/UnitStateBase";
import type { float } from "../../runtime";
import type { IEnumerable } from "../../runtime";
import { dictGet } from "../../runtime";

// ---- ReDriveBattleCore.AbilityEffect.StateAbilityEffect  (TypeDefIndex 1217, public class) ----
export class StateAbilityEffect extends AbilityEffectBase {  // implements IBattleStartTriggerPriority
    static readonly __interfaces: readonly string[] = ['IBattleStartTriggerPriority'];
    /** 0x60 private UnitStateBase <GiveUnitState>k__BackingField */
    _GiveUnitState: UnitStateBase = null!;
    get GiveUnitState(): UnitStateBase { return this.get_GiveUnitState(); }
    set GiveUnitState(v: UnitStateBase) { this.set_GiveUnitState(v); }
    get IBattleStartTriggerPriority$Priority(): int { return this.get_IBattleStartTriggerPriority$Priority(); }
    /** @rva 0x737A10  public UnitStateBase get_GiveUnitState() { } */
    get_GiveUnitState(): UnitStateBase { return this._GiveUnitState; /* auto-property */ }
    /** @rva 0x737A50  public void set_GiveUnitState(UnitStateBase value) { } */
    set_GiveUnitState(value: UnitStateBase): void { this._GiveUnitState = value; /* auto-property */ }
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1920A30  public void .ctor(AbilityEffectInfo info, UnitStateBase giveUnitState, bool isIncludeDeadUnitInTarget) { } */
    ctor$AbilityEffectInfo_UnitStateBase_bool(info: AbilityEffectInfo, giveUnitState: UnitStateBase, isIncludeDeadUnitInTarget: boolean): this {
        super.ctor$AbilityEffectInfo(info);
        this._GiveUnitState = giveUnitState;
        this._IsIncludeDeadUnitInTarget = isIncludeDeadUnitInTarget;
        if (giveUnitState == null) return this;
        if (giveUnitState.get_Direction() === 2) {
            if (!isImpl(giveUnitState, "INeutralState")) {
                throw new Error(`${giveUnitState.constructor.name}.Direction は Neutral ですが、INeutralState を実装していないため、効果対象を決められませんでした。`);
            }
            this._TargetSide = ifaceProp(giveUnitState, "INeutralState", "TargetSide"); // interface call: Count / LockSpecialAttack / UniqueZone implement it explicitly
        } else {
            this._TargetSide = (giveUnitState.get_Direction() !== 0 ? 1 : 0) as AbilityEffectBase_TargetSideType;
        }
        return this;
    }
    /** @rva 0x1920310 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const isSpeedVariation = isImpl(this._GiveUnitState, "ISpeedVariation");
        const turnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
        for (const targetUnitId of this._TargetUnitIdList) {
            // <>c__DisplayClass6_0: 0x10 state
            const c = { state: null! as UnitStateBase };
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            let isOwnSkill: boolean;
            if (origin === 1) {
                isOwnSkill = targetUnit === userUnit;
            } else if (origin === 2 && targetUnit === userUnit && gameDirector.turnActSystem.turnReferee._CurrentTurnUnitId === userUnit._Id) {
                isOwnSkill = this.get_IsConditionActivation();
            } else {
                isOwnSkill = false;
            }
            c.state = this._GiveUnitState.Clone();
            if (this._AbilitySource === 1) {
                c.state = this.ChangeGiveUnitState(userUnit, c.state);
            }
            const state = c.state;
            state.SetTriggeringInfo(origin, userUnit, isOwnSkill, this.get_IsConditionActivation(), gameDirector.get_BattleType());
            const isNewUnitStateType = !targetUnit._Condition._StateList.some(s => s._EffectType === c.state._EffectType); // b__0 (String.Equals)
            const isAdded = targetUnit._Condition.AddUnitState(c.state, targetUnit, turnOrderPriority, userUnit, false);
            if (isAdded) {
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByOneState(targetUnit._Id, this._GiveUnitState.get_GiveVisualEffectName()));
                const addStateInfo = new AffectedUnitNotice_AddStateInfo().ctor();
                addStateInfo.stateEffectType = this._GiveUnitState._EffectType;
                addStateInfo.stateIconName = this._GiveUnitState.get_IconName();
                addStateInfo.detailMstId = this._DetailMstId;
                addStateInfo.effectOrigin = origin;
                addStateInfo.isNewUnitStateType = isNewUnitStateType;
                addStateInfo.isDontShowFlip = c.state.get_IsDontShowAddStateFlip();
                addStateInfo.isRemovableBuff = isImpl(c.state, "IBuff") && origin === 1;
                addStateInfo.isRemovableDebuff = isImpl(c.state, "IDebuff") && origin === 1;
                affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByAddStateInfo(targetUnit._Id, addStateInfo));
                if (c.state instanceof BarrierUnitState) {
                    affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByBarrier(targetUnitId, targetUnit.isCharacterFigure, c.state._CalculatedEndurance));
                }
            }
            if (isSpeedVariation) {
                const turnGaugeVariation = targetUnit.UpdateTurnGaugeBySpeed();
                if (turnGaugeVariation !== 0 && isAdded) {
                    affectedUnitNoticeBundle.Add(AffectedUnitNotice.CreateByTurnGaugeVariation(targetUnitId, turnGaugeVariation));
                }
            }
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x191F990  private UnitStateBase ChangeGiveUnitState(BattleUnit userUnit, UnitStateBase giveUnitState) { } */
    ChangeGiveUnitState(userUnit: BattleUnit, giveUnitState: UnitStateBase): UnitStateBase {
        for (const state of userUnit._Condition._StateList) {
            if (state instanceof AddTurnUnitStateBase && state.IsActive$BattleUnit(userUnit)) {
                state.AddTurnTo(giveUnitState);
            }
        }
        if (isImpl(giveUnitState, "IHasUpdateableEffectValue")) {
            const updateable = giveUnitState as unknown as IHasUpdateableEffectValue;
            let rate: float = 0;
            for (const state of userUnit._Condition._StateList) {
                if (isImpl(state, "IEffectValueVariation") && state.IsActive$BattleUnit(userUnit)) {
                    rate = f32(rate + (state as unknown as IEffectValueVariation).GetEffectValueVariationRate(giveUnitState));
                }
            }
            updateable.UpdateableEffectValue = Math.max(f32(f32(rate + 1) * updateable.UpdateableEffectValue), 0);
        }
        if (giveUnitState instanceof BarrierUnitState) {
            let rate: float = 1;
            for (const state of userUnit._Condition._StateList) {
                if (state instanceof DwnBarrierValueUnitState && state.IsActive$BattleUnit(userUnit)) {
                    rate = f32(rate * Math.max(f32(1 - state.GetDownRate()), 0));
                }
            }
            giveUnitState.UpdateValueByRate(rate);
        }
        return giveUnitState;
    }
    /** @rva 0x191FFF0 slot 6  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, gameDirector: GameDirectorBase): List<BattleUnit> {
        return this._GiveUnitState.GetAIFilteredTargets(userUnit, targetUnitList, skillType, this._EffectRange, gameDirector);
    }
    /** @rva 0x19200D0 slot 7  public override int SelectTargetInAIAction(BattleUnit userUnit, List<BattleUnit> targetUnitList) { } */
    SelectTargetInAIAction(userUnit: BattleUnit, targetUnitList: List<BattleUnit>): int {
        // <>c__DisplayClass9_0: 0x10 this, 0x18 userUnit
        const candidateUnits = targetUnitList.filter(u => !u.get_IsDead()); // <>c.b__9_0
        const unitFilterFuncOrder = this._GiveUnitState.GetUnitFilterFuncOrder(userUnit, candidateUnits);
        // g__UnitFilterWithoutDuplicateState|1
        const unitFilterWithoutDuplicateState = (units: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> => units.filter(unit => {
            // b__2
            const clone = this._GiveUnitState.Clone();
            clone.SetTriggeringInfo(1 as EffectOriginType, userUnit, false, false, 1 as BattleType);
            const duplicate = unit._Condition.GetDuplicateUnitState(clone);
            if (duplicate == null) return true;
            if (duplicate.get_IsPermanent()) return false;
            return duplicate._RemainingTurn === 1;
        });
        unitFilterFuncOrder.AddFirst(unitFilterWithoutDuplicateState);
        const unit = AISkillTargetSelector.SelectTargetUnitInOrder(candidateUnits, unitFilterFuncOrder);
        return unit == null ? 0 : unit._Id;
    }
    /** @rva 0x1920040 slot 8  private int ReDriveBattleCore.IBattleStartTriggerPriority.get_Priority() { } */
    get_IBattleStartTriggerPriority$Priority(): int {
        if (isImpl(this._GiveUnitState, "IBattleStartTriggerPriority")) {
            return (this._GiveUnitState as unknown as { IBattleStartTriggerPriority$Priority: int }).IBattleStartTriggerPriority$Priority;
        }
        return IBattleStartTriggerPriority_Define.DefaultPriority;
    }
}
