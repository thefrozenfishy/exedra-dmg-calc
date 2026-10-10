// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ILvUp, ILvUp_LvUpType } from "./ILvUp";
import { UniqueLvDebuffUnitStateBase } from "./UniqueLvDebuffUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueElementBreakUnitState  (TypeDefIndex 677, public class) ----
export class UniqueElementBreakUnitState extends UniqueLvDebuffUnitStateBase {  // implements ILvUp
    static readonly __interfaces: readonly string[] = ['ILvUp'];
    get TargetLvUpType(): ILvUp_LvUpType { return this.get_TargetLvUpType(); }
    /** @rva 0x16DE240  protected void .ctor() { } */
    ctor(): this { return notPorted("UniqueElementBreakUnitState..ctor", 0x16DE240); }
    /** @rva 0x16DE260  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UniqueElementBreakUnitState..ctor", 0x16DE260); }
    /** @rva 0x759B30 slot 29  public ILvUp.LvUpType get_TargetLvUpType() { } */
    get_TargetLvUpType(): ILvUp_LvUpType { return 1 as ILvUp_LvUpType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16DE210 slot 30  public void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit) { } */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit): void { return notPorted("UniqueElementBreakUnitState.LvUpProcess", 0x16DE210); }
}
