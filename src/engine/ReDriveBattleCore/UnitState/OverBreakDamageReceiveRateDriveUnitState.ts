// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32 } from "../../runtime";
import type { IEnumerable, List, float } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import { SpecialAttack } from "../SpecialAttack";
import { UniqueElementDriveUnitState } from "./UniqueElementDriveUnitState";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { ActiveSkillBase } from "../ActiveSkillBase";
import type { BattleUnit } from "../BattleUnit";
import type { IDontRemoveOnPassiveSkillUserLeaveBattle } from "./IDontRemoveOnPassiveSkillUserLeaveBattle";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.OverBreakDamageReceiveRateDriveUnitState  (TypeDefIndex 660, public class) ----
// "Over Break" (3.24.0, OVER_BREAK_DAMAGE_RECEIVE_RATE_DRIVE): Special Attacks of the state's giver on a broken enemy
// whose break-damage rate is at its cap and whose Element Drive (from the same giver) is at max level push the
// enemy's rate past the cap: AbilityEffectLauncher.Triggering calls ApplyOverBreakAddition per hit target.
export class OverBreakDamageReceiveRateDriveUnitState extends UnitStateBase {  // implements IDontRemoveOnPassiveSkillUserLeaveBattle
    static readonly __interfaces: readonly string[] = ['IDontRemoveOnPassiveSkillUserLeaveBattle'];
    /** 0x88 private float <MaxOverBreakRatio>k__BackingField */
    _MaxOverBreakRatio: float = 0;
    /** 0x8C private float <RoleAdditionRatio>k__BackingField */
    _RoleAdditionRatio: float = 0;
    /** 0x90 private float <OtherRoleAdditionRatio>k__BackingField */
    _OtherRoleAdditionRatio: float = 0;
    get MaxOverBreakRatio(): float { return this.get_MaxOverBreakRatio(); }
    set MaxOverBreakRatio(v: float) { this.set_MaxOverBreakRatio(v); }
    get RoleAdditionRatio(): float { return this.get_RoleAdditionRatio(); }
    set RoleAdditionRatio(v: float) { this.set_RoleAdditionRatio(v); }
    get OtherRoleAdditionRatio(): float { return this.get_OtherRoleAdditionRatio(); }
    set OtherRoleAdditionRatio(v: float) { this.set_OtherRoleAdditionRatio(v); }
    /** @rva 0x75FB30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret (Negative) */ }
    /** @rva 0xC987F0  public float get_MaxOverBreakRatio() { } */
    get_MaxOverBreakRatio(): float { return this._MaxOverBreakRatio; /* auto-property */ }
    /** @rva 0xC98800  public void set_MaxOverBreakRatio(float value) { } */
    set_MaxOverBreakRatio(value: float): void { this._MaxOverBreakRatio = value; /* auto-property */ }
    /** @rva 0x899710  public float get_RoleAdditionRatio() { } */
    get_RoleAdditionRatio(): float { return this._RoleAdditionRatio; /* auto-property */ }
    /** @rva 0x89A540  public void set_RoleAdditionRatio(float value) { } */
    set_RoleAdditionRatio(value: float): void { this._RoleAdditionRatio = value; /* auto-property */ }
    /** @rva 0x75A560  public float get_OtherRoleAdditionRatio() { } */
    get_OtherRoleAdditionRatio(): float { return this._OtherRoleAdditionRatio; /* auto-property */ }
    /** @rva 0x75A810  public void set_OtherRoleAdditionRatio(float value) { } */
    set_OtherRoleAdditionRatio(value: float): void { this._OtherRoleAdditionRatio = value; /* auto-property */ }
    /** @rva 0x1715C30  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x171B360  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._MaxOverBreakRatio = f32(f32(info._EffectValue1) / 10); // per-mille -> % points of BreakedDamageReceiveRate
        this._RoleAdditionRatio = f32(f32(info._EffectValue2) / 10);
        this._OtherRoleAdditionRatio = f32(f32(info._EffectValue3) / 10);
        return this;
    }
    /** @rva 0x171B280  private float GetAdditionRatio(BattleUnit userUnit) { } */
    GetAdditionRatio(userUnit: BattleUnit): float {
        if (userUnit.IsMatch$TargetRoleType(this._TargetRole)) return this._RoleAdditionRatio;
        return this._OtherRoleAdditionRatio;
    }
    /** @rva 0x171B070  public bool ApplyOverBreakAddition(BattleUnit targetUnit, BattleUnit userUnit, ActiveSkillBase triggeringSkill) { } */
    ApplyOverBreakAddition(targetUnit: BattleUnit, userUnit: BattleUnit, triggeringSkill: ActiveSkillBase): boolean {
        if (!this.IsActive$BattleUnit(targetUnit) || triggeringSkill == null) return false;
        if (!(triggeringSkill instanceof SpecialAttack)) return false;
        const drive = targetUnit.Condition.StateList.find((s): s is UniqueElementDriveUnitState => s instanceof UniqueElementDriveUnitState) ?? null; // OfType().FirstOrDefault()
        if (drive == null) return false;
        if (drive._UserUnitId !== this._UserUnitId) return false;
        if (!drive.get_IsMaxLv()) return false;
        // (float)BreakedDamageReceiveRate < (float)BattleParameter.MaxBreakedDamageReceiveRate / 10f -> false
        if (f32(f32(targetUnit.get_BattleParameter()._MaxBreakedDamageReceiveRate) / 10) > f32(targetUnit._BreakedDamageReceiveRate)) return false;
        if (drive._TargetElement !== 0 && !userUnit.IsMatch$TargetElementType(drive._TargetElement)) return false;
        targetUnit.AddOverBreakBonus(this.GetAdditionRatio(userUnit)); // GetAdditionRatio inlined in the game
        if (0 < targetUnit._MaxOverBreakBonusValue) return false;
        targetUnit.AddMaxOverBreakBonus(this._MaxOverBreakRatio);
        return 0 < targetUnit._MaxOverBreakBonusValue; // true only on the hit that opens the over-break cap
    }
    /** @rva 0x171B2D0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
