// 1:1 port of ReDriveBattleCore (game 3.24.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { int } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { ILvUp, ILvUp_LvUpType } from "./ILvUp";
import { UniqueLvDebuffUnitStateBase } from "./UniqueLvDebuffUnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueElementStackUnitState  (TypeDefIndex 676, public class) ----
export class UniqueElementStackUnitState extends UniqueLvDebuffUnitStateBase {  // implements ILvUp
    static readonly __interfaces: readonly string[] = ['ILvUp'];
    get TargetLvUpType(): ILvUp_LvUpType { return this.get_TargetLvUpType(); }
    /** @rva 0x1727030  protected void .ctor() { } */
    ctor(): this {
        this._Lv = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x1727130  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._Lv = 1;
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this._UniqueStateLevelMstGroupId = info._EffectValue2;
        return this;
    }
    /** @rva 0x75FB30 slot 29  public ILvUp.LvUpType get_TargetLvUpType() { } */
    get_TargetLvUpType(): ILvUp_LvUpType { return 1 as ILvUp_LvUpType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x17270F0 slot 31  public void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit, int skillMstId) { } */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit, skillMstId: int): void {
        // 3.24.0: skillMstId added (unused here)
        if (!userUnit.IsMatch$TargetElementType(this._TargetElement)) return;
        this.TryCountUp(); // tail call
    }
}
