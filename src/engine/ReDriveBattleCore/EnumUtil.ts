// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { enumIsDefined, notPorted, ref } from "../runtime";
import type { Dictionary, Ref, int } from "../runtime";

// ---- ReDriveBattleCore.EnumUtil  (TypeDefIndex 393, public static class) ----
export class EnumUtil {
    /** @rva -1  public static T Cast<T>(int value) { } */
    static Cast<T>(T$: object, value: int): T {
        // EnumUtility<T>.TryParse(value, out e) ? e : (Enum.IsDefined(typeof(T), value), (T)Enum.ToObject(typeof(T), value))
        const e = ref<any>(0);
        if (EnumUtil_EnumUtility.TryParse(T$, value, e)) return e.v as T;
        enumIsDefined(T$, value);
        return value as unknown as T;
    }
}

// ---- ReDriveBattleCore.EnumUtil.EnumUtility<TEnum>  (TypeDefIndex 392, private static class) ----
export class EnumUtil_EnumUtility<TEnum> {
    /** 0x0 private static TEnum[] cachedValues */
    static cachedValues: any[] = null!;
    /** 0x0 private static Dictionary<int, TEnum> intValueDic */
    static intValueDic: Dictionary<int, any> = null!;
    /** The two static fields above exist once per closed type EnumUtility<TEnum>; keyed by the enum object here. */
    static cache: Map<object, { cachedValues: any[]; intValueDic: Dictionary<int, any> }> = new Map();
    /** @rva -1  public static TEnum[] GetValues() { } */
    static GetValues(TEnum$: object): any[] {
        EnumUtil_EnumUtility.CacheIfNeed(TEnum$);
        return EnumUtil_EnumUtility.cache.get(TEnum$)!.cachedValues;
    }
    /** @rva -1  public static bool TryParse(int intValue, out TEnum enumValue) { } */
    static TryParse(TEnum$: object, intValue: int, enumValue: Ref<any>): boolean {
        EnumUtil_EnumUtility.CacheIfNeed(TEnum$);
        const dic = EnumUtil_EnumUtility.cache.get(TEnum$)!.intValueDic;
        if (dic.has(intValue)) { enumValue.v = dic.get(intValue); return true; }
        enumValue.v = 0;
        return false;
    }
    /** @rva -1  private static void CacheIfNeed() { } */
    static CacheIfNeed(TEnum$: object): void {
        // static fields of the generic class EnumUtility<TEnum>: one cache per enum type
        if (EnumUtil_EnumUtility.cache.has(TEnum$)) return;
        const cachedValues = Object.values(TEnum$) as number[];
        const intValueDic = new Map<int, any>();
        for (const v of cachedValues) intValueDic.set(v, v);
        EnumUtil_EnumUtility.cache.set(TEnum$, { cachedValues, intValueDic });
    }
}
