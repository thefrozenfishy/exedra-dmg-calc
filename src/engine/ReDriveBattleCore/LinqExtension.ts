// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { IEnumerable } from "../runtime";

// ---- ReDriveBattleCore.LinqExtension  (TypeDefIndex 432, internal static class) ----
export class LinqExtension {
    /** @rva -1  public static T MaxPriority<T, TPriority>(IEnumerable<T> source, Func<T, TPriority> prioritySelector) { } */
    static MaxPriority<T, TPriority>(source: IEnumerable<T>, prioritySelector: ((a0: T) => TPriority)): T { return notPorted("LinqExtension.MaxPriority", 0); }
    /** @rva -1  public static T MinPriority<T, TPriority>(IEnumerable<T> source, Func<T, TPriority> prioritySelector) { } */
    static MinPriority<T, TPriority>(source: IEnumerable<T>, prioritySelector: ((a0: T) => TPriority)): T { return notPorted("LinqExtension.MinPriority", 0); }
    /** @rva -1  private static T Priority<T, TPriority>(IEnumerable<T> source, Func<T, TPriority> prioritySelector, bool chooseMax) { } */
    static Priority<T, TPriority>(source: IEnumerable<T>, prioritySelector: ((a0: T) => TPriority), chooseMax: boolean): T { return notPorted("LinqExtension.Priority", 0); }
}
