// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { AdditionType } from "./AdditionType";
import type { IDebuff } from "./IDebuff";
import type { IHasUpdateableEffectValue } from "./IHasUpdateableEffectValue";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.DownReceiveRecoveryUnitStateBase  (TypeDefIndex 614, public abstract class) ----
export abstract class DownReceiveRecoveryUnitStateBase extends UnitStateBase {  // implements IDebuff, IHasUpdateableEffectValue
    static readonly __interfaces: readonly string[] = ['IDebuff', 'IHasUpdateableEffectValue'];
    /** 0x88 private float <UpdateableEffectValue>k__BackingField */
    _UpdateableEffectValue: float = 0;
    get Addition(): AdditionType { return this.get_Addition(); }
    get UpdateableEffectValue(): float { return this.get_UpdateableEffectValue(); }
    set UpdateableEffectValue(v: float) { this.set_UpdateableEffectValue(v); }
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  public AdditionType get_Addition() { } */
    get_Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x15BBB40 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("DownReceiveRecoveryUnitStateBase.get_IconName", 0x15BBB40); }
    /** @rva 0x15BBB10 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("DownReceiveRecoveryUnitStateBase.get_GiveVisualEffectName", 0x15BBB10); }
    /** @rva 0xC646A0 slot 25  public float get_UpdateableEffectValue() { } */
    get_UpdateableEffectValue(): float { return this._UpdateableEffectValue; /* auto-property */ }
    /** @rva 0xC646B0 slot 26  public void set_UpdateableEffectValue(float value) { } */
    set_UpdateableEffectValue(value: float): void { this._UpdateableEffectValue = value; /* auto-property */ }
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this { return notPorted("DownReceiveRecoveryUnitStateBase..ctor", 0x15B3A90); }
    /** @rva 0x15BAC90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DownReceiveRecoveryUnitStateBase..ctor", 0x15BAC90); }
    /** @rva 0x15B8090 slot 21  public override bool CanAddTo(BattleUnit targetUnit) { } */
    CanAddTo(targetUnit: BattleUnit): boolean { return notPorted("DownReceiveRecoveryUnitStateBase.CanAddTo", 0x15B8090); }
    /** @rva 0x15BB820 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("DownReceiveRecoveryUnitStateBase.GetUnitFilterFuncOrder", 0x15BB820); }
}
