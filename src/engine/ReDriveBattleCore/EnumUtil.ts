// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, Ref, int } from "../runtime";

// ---- ReDriveBattleCore.EnumUtil  (TypeDefIndex 393, public static class) ----
export class EnumUtil {
    /** @rva -1  public static T Cast<T>(int value) { } */
    static Cast<T>(T$: abstract new (...args: any[]) => T, value: int): T { return notPorted("EnumUtil.Cast", 0); }
}

// ---- ReDriveBattleCore.EnumUtil.EnumUtility<TEnum>  (TypeDefIndex 392, private static class) ----
export class EnumUtil_EnumUtility<TEnum> {
    /** 0x0 private static TEnum[] cachedValues */
    static cachedValues: any[] = null!;
    /** 0x0 private static Dictionary<int, TEnum> intValueDic */
    static intValueDic: Dictionary<int, any> = null!;
    /** @rva -1  public static TEnum[] GetValues() { } */
    static GetValues(): any[] { return notPorted("EnumUtil_EnumUtility.GetValues", 0); }
    /** @rva -1  public static bool TryParse(int intValue, out TEnum enumValue) { } */
    static TryParse(intValue: int, enumValue: Ref<any>): boolean { return notPorted("EnumUtil_EnumUtility.TryParse", 0); }
    /** @rva -1  private static void CacheIfNeed() { } */
    static CacheIfNeed(): void { return notPorted("EnumUtil_EnumUtility.CacheIfNeed", 0); }
}
