// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { ChangeBuffDebuffTurnAbilityEffectBase } from "./ChangeBuffDebuffTurnAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.DecBuffTurnImmAbilityEffect  (TypeDefIndex 1152, public class) ----
export class DecBuffTurnImmAbilityEffect extends ChangeBuffDebuffTurnAbilityEffectBase {
    /** @rva 0x7360C0 slot 8  public override bool get_IsTurnAdd() { } */
    get_IsTurnAdd(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x76F830 slot 10  public override bool get_IsTargetBuff() { } */
    get_IsTargetBuff(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x18F07A0 slot 12  public override string get_DisplayEffectType() { } */
    get_DisplayEffectType(): string {
        return "eff_cmn_act_debuff_appear_001";
    }
    /** @rva 0x18E9C60  protected void .ctor() { } */
    ctor(): this {
        this._DisplayEffectType = "";
        super.ctor();
        return this;
    }
    /** @rva 0x18E9D70  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._DisplayEffectType = "";
        super.ctor$AbilityEffectInfo(info);
        this._TargetSkillUniqueId = info._EffectValue1;
        this._TurnChangeValue = info._EffectValue2;
        this._MaxChangeCount = info._EffectValue3;
        this._TargetSide = 1 as AbilityEffectBase_TargetSideType;
        return this;
    }
}
