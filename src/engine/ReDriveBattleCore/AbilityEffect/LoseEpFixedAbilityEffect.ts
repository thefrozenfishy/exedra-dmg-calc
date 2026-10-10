// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { LoseEpAbilityEffectBase } from "./LoseEpAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.AbilityEffect.LoseEpFixedAbilityEffect  (TypeDefIndex 1190, public class) ----
export class LoseEpFixedAbilityEffect extends LoseEpAbilityEffectBase {
    /** @rva 0x18EB3C0  protected void .ctor() { } */
    ctor(): this { return notPorted("LoseEpFixedAbilityEffect..ctor", 0x18EB3C0); }
    /** @rva 0x18F5990  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("LoseEpFixedAbilityEffect..ctor", 0x18F5990); }
    /** @rva 0x8A2220 slot 8  public override int GetLosePoint(BattleUnit targetUnit) { } */
    GetLosePoint(targetUnit: BattleUnit): int { return this.effectValue; /* asm: mov eax, dword ptr [rcx + 0x64]; ret */ }
}
