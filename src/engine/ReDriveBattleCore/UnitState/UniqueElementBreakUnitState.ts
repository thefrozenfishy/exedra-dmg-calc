// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
    /** @rva 0x17086F0  protected void .ctor() { } */
    ctor(): this {
        this._Lv = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x1708710  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._Lv = 1;
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this._UniqueStateLevelMstGroupId = info._EffectValue2;
        return this;
    }
    /** @rva 0x758B30 slot 29  public ILvUp.LvUpType get_TargetLvUpType() { } */
    get_TargetLvUpType(): ILvUp_LvUpType { return 1 as ILvUp_LvUpType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x17086C0 slot 30  public void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit) { } */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit): void {
        if (this._UserUnitId !== userUnit._Id) return;
        this.TryCountUp();
    }
}
