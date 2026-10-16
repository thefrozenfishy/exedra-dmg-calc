// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, Type } from "../../runtime";
import type { IBattleMstReader } from "./IBattleMstReader";

// ---- ReDriveBattleCore.Reader.BattleMstReaderContainer  (TypeDefIndex 873, public static class) ----
export class BattleMstReaderContainer {
    /** 0x0 private static Dictionary<Type, object> readerDic */
    static readerDic: Dictionary<Type, any> = null!;
    /** @rva -1  public static IBattleMstReader<TModel, TRecord, TKey> GetReader<TModel, TRecord, TKey>() { } */
    static GetReader<TModel, TRecord, TKey>(TModel$: Type): IBattleMstReader<TModel, TRecord, TKey> {
        // shared instance 0x24edea0: readerDic.TryGetValue(typeof(IBattleMstReader<TModel, TRecord, TKey>), out obj)
        // (keyed by the model class here, which fixes TRecord/TKey). The miss path looks a default reader up by
        // reflection ("BattleMstReader`3") and returns null when there is none; the app binds every reader.
        const obj = BattleMstReaderContainer.readerDic.get(TModel$);
        if (obj !== undefined) return obj as IBattleMstReader<TModel, TRecord, TKey>;
        return notPorted("BattleMstReaderContainer.GetReader (unbound reader: reflection fallback)", 0x24EDEA0);
    }
    /** @rva -1  public static void Bind<TModel, TRecord, TKey>(IBattleMstReader<TModel, TRecord, TKey> reader) { } */
    static Bind<TModel, TRecord, TKey>(TModel$: Type, reader: IBattleMstReader<TModel, TRecord, TKey>): void {
        BattleMstReaderContainer.readerDic.set(TModel$, reader); // 0x24edde0: readerDic[typeof(IBattleMstReader<...>)] = reader
    }
    /** @rva 0x16F6FF0  private static void .cctor() { } */
    static cctor(): void {
        BattleMstReaderContainer.readerDic = new Map<Type, any>();
    }
}
BattleMstReaderContainer.cctor(); // C# static constructor
