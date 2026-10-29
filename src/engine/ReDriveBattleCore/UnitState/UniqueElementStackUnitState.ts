// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { ILvUp, ILvUp_LvUpType } from "./ILvUp";
import { UniqueLvDebuffUnitStateBase } from "./UniqueLvDebuffUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueElementStackUnitState  (TypeDefIndex 676, public class) ----
export class UniqueElementStackUnitState extends UniqueLvDebuffUnitStateBase {  // implements ILvUp
    static readonly __interfaces: readonly string[] = ['ILvUp'];
    get TargetLvUpType(): ILvUp_LvUpType { return this.get_TargetLvUpType(); }
    /** @rva 0x16F23C0  protected void .ctor() { } */
    ctor(): this {
        this._Lv = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x16F23E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._Lv = 1;
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this._UniqueStateLevelMstGroupId = info._EffectValue2;
        return this;
    }
    /** @rva 0x759B30 slot 29  public ILvUp.LvUpType get_TargetLvUpType() { } */
    get_TargetLvUpType(): ILvUp_LvUpType { return 1 as ILvUp_LvUpType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16F2470 slot 30  public void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit) { } */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit): void {
        if (!userUnit.IsMatch$TargetElementType(this._TargetElement)) return;
        this.TryCountUp();
    }
}
