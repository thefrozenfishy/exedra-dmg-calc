// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import type { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { HateUnitStateBase } from "./HateUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UpHateUnitState  (TypeDefIndex 636, public class) ----
export class UpHateUnitState extends HateUnitStateBase {
    /** 0x88 private int <UpWeight>k__BackingField */
    _UpWeight: int = 0;
    get UpWeight(): int { return this.get_UpWeight(); }
    set UpWeight(v: int) { this.set_UpWeight(v); }
    /** @rva 0x16E5600 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("UpHateUnitState.get_IconName", 0x16E5600); }
    /** @rva 0x902530  public int get_UpWeight() { } */
    get_UpWeight(): int { return this._UpWeight; /* auto-property */ }
    /** @rva 0x902570  public void set_UpWeight(int value) { } */
    set_UpWeight(value: int): void { this._UpWeight = value; /* auto-property */ }
    /** @rva 0x16CF610  protected void .ctor() { } */
    ctor(): this { return notPorted("UpHateUnitState..ctor", 0x16CF610); }
    /** @rva 0x15B3FF0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UpHateUnitState..ctor", 0x15B3FF0); }
    /** @rva 0x902530 slot 26  public override int GetHateVariationWeight() { } */
    GetHateVariationWeight(): int { return this._UpWeight; /* asm: mov eax, dword ptr [rcx + 0x88]; ret */ }
    /** @rva 0x16E53A0 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder { return notPorted("UpHateUnitState.GetUnitFilterFuncOrder", 0x16E53A0); }
}
