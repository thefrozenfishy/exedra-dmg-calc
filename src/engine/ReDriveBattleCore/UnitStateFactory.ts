// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List } from "../runtime";
import type { AbilityEffectInfo } from "./AbilityEffectInfo";
import type { UnitStateBase } from "./UnitState/UnitStateBase";

// ---- ReDriveBattleCore.UnitStateFactory  (TypeDefIndex 482, public static class) ----
export class UnitStateFactory {
    /** 0x0 private static readonly Dictionary<string, Func<AbilityEffectInfo, UnitStateBase>> createDic */
    static createDic: Dictionary<string, ((a0: AbilityEffectInfo) => UnitStateBase)> = null!;
    static get AbilityEffectTypeList(): List<string> { return UnitStateFactory.get_AbilityEffectTypeList(); }
    /** @rva 0x15CEDD0  public static List<string> get_AbilityEffectTypeList() { } */
    static get_AbilityEffectTypeList(): List<string> { return notPorted("UnitStateFactory.get_AbilityEffectTypeList", 0x15CEDD0); }
    /** @rva 0x15CAFD0  public static bool CanCreate(string effectType) { } */
    static CanCreate(effectType: string): boolean { return notPorted("UnitStateFactory.CanCreate", 0x15CAFD0); }
    /** @rva 0x15CB050  public static UnitStateBase Create(AbilityEffectInfo info) { } */
    static Create(info: AbilityEffectInfo): UnitStateBase { return notPorted("UnitStateFactory.Create", 0x15CB050); }
    /** @rva 0x15CB180  private static void .cctor() { } */
    static cctor(): void { return notPorted("UnitStateFactory..cctor", 0x15CB180); }
}
