// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, Type } from "../../runtime";

// ---- ReDriveBattleCore.Reader.BattleMstReaderContainer  (TypeDefIndex 873, public static class) ----
export class BattleMstReaderContainer {
    /** 0x0 private static Dictionary<Type, object> readerDic */
    static readerDic: Dictionary<Type, any> = null!;
    /** @rva -1  public static IBattleMstReader<TModel, TRecord, TKey> GetReader<TModel, TRecord, TKey>() { } */
    static GetReader<TModel, TRecord, TKey>(TModel$: abstract new (...args: any[]) => TModel, TRecord$: abstract new (...args: any[]) => TRecord, TKey$: abstract new (...args: any[]) => TKey): any /* IBattleMstReader<TModel, TRecord, TKey> */ { return notPorted("BattleMstReaderContainer.GetReader", 0); }
    /** @rva -1  public static void Bind<TModel, TRecord, TKey>(IBattleMstReader<TModel, TRecord, TKey> reader) { } */
    static Bind<TModel, TRecord, TKey>(reader: any /* IBattleMstReader<TModel, TRecord, TKey> */): void { return notPorted("BattleMstReaderContainer.Bind", 0); }
    /** @rva 0x16CD520  private static void .cctor() { } */
    static cctor(): void { return notPorted("BattleMstReaderContainer..cctor", 0x16CD520); }
}
