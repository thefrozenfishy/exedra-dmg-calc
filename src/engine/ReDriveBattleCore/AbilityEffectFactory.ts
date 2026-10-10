// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary } from "../runtime";
import type { AbilityEffectBase } from "./AbilityEffect/AbilityEffectBase";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";

// ---- ReDriveBattleCore.AbilityEffectFactory  (TypeDefIndex 271, public static class) ----
export class AbilityEffectFactory {
    /** 0x0 private static readonly Dictionary<string, Func<AbilityEffectInfo, AbilityEffectBase>> createDic */
    static createDic: Dictionary<string, ((a0: AbilityEffectInfo) => AbilityEffectBase)> = null!;
    /** @rva 0x125A1A0  public static bool CanCreate(string effectType) { } */
    static CanCreate(effectType: string): boolean { return notPorted("AbilityEffectFactory.CanCreate", 0x125A1A0); }
    /** @rva 0x125A220  public static AbilityEffectBase Create(AbilityEffectInfo info, bool isIncludeDeadUnitInTarget) { } */
    static Create(info: AbilityEffectInfo, isIncludeDeadUnitInTarget: boolean): AbilityEffectBase { return notPorted("AbilityEffectFactory.Create", 0x125A220); }
    /** @rva 0x125A480  private static void .cctor() { } */
    static cctor(): void { return notPorted("AbilityEffectFactory..cctor", 0x125A480); }
}
