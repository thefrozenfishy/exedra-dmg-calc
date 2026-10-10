// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, float } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { IBuff } from "./IBuff";
import type { IConsumeRemainCount } from "./IConsumeRemainCount";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.ShieldUnitState  (TypeDefIndex 655, public class) ----
export class ShieldUnitState extends UnitStateBase {  // implements IBuff, IConsumeRemainCount
    static readonly __interfaces: readonly string[] = ['IBuff', 'IConsumeRemainCount'];
    /** 0x88 private float <DecreaseRatio>k__BackingField */
    _DecreaseRatio: float = 0;
    get DecreaseRatio(): float { return this.get_DecreaseRatio(); }
    set DecreaseRatio(v: float) { this.set_DecreaseRatio(v); }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x16D7E20 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("ShieldUnitState.get_IconName", 0x16D7E20); }
    /** @rva 0xC646A0  public float get_DecreaseRatio() { } */
    get_DecreaseRatio(): float { return this._DecreaseRatio; /* auto-property */ }
    /** @rva 0xC646B0  public void set_DecreaseRatio(float value) { } */
    set_DecreaseRatio(value: float): void { this._DecreaseRatio = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("ShieldUnitState..ctor", 0x16CF610); }
    /** @rva 0x16D7DD0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("ShieldUnitState..ctor", 0x16D7DD0); }
    /** @rva 0x16D7B70 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("ShieldUnitState.GetUnitFilterFuncOrder", 0x16D7B70); }
    /** @rva 0x16D7B20  public void ConsumeRemainCount() { } */
    ConsumeRemainCount(): void { return notPorted("ShieldUnitState.ConsumeRemainCount", 0x16D7B20); }
}
