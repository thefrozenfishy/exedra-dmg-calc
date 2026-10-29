// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { IDebuff } from "./IDebuff";
import { UniqueLvUnitStateBase } from "./UniqueLvUnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueLvDebuffUnitStateBase  (TypeDefIndex 671, public abstract class) ----
export abstract class UniqueLvDebuffUnitStateBase extends UniqueLvUnitStateBase {  // implements IDebuff
    static readonly __interfaces: readonly string[] = ['IDebuff'];
    /** @rva 0x759B30 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 1 as UnitStateBase_DirectionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x16F2570 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
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
}
