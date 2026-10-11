// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { GainBpAbilityEffectBase } from "./GainBpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.GainBpFixedAbilityEffect  (TypeDefIndex 1145, public class) ----
export class GainBpFixedAbilityEffect extends GainBpAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F20E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.effectValue = info._EffectValue1;
        return this;
    }
    /** @rva 0x8A2220 slot 8  public override int GetGainPoint(BattleUnit targetUnit) { } */
    GetGainPoint(targetUnit: BattleUnit): int { return this.effectValue; /* asm: mov eax, dword ptr [rcx + 0x64]; ret */ }
}
