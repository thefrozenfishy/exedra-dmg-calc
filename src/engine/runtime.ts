// Runtime support for the 1:1 port of ReDriveBattleCore (see src/engine/README.md).
// Only C#/IL2CPP plumbing lives here; no game rules.

import { CsDecimal, f32 } from "../models/BattleMath";

// C# primitive types, kept as aliases so every signature still says what the game uses.
// int/long/short/byte: integer arithmetic (use `|0` or Math.trunc where C# truncates).
// float: binary32, wrap every operation in f32().  double: plain JS number.
export type int = number;
export type uint = number;
export type long = number;
export type ulong = number;
export type short = number;
export type ushort = number;
export type byte = number;
export type sbyte = number;
export type float = number;
export type double = number;
export type char = string;
export type Decimal = CsDecimal;
export const Decimal = CsDecimal;
export { f32 };

// System.Collections.Generic / System.Linq shapes. Sequences are plain arrays (LINQ results realised).
export type List<T> = T[];
export type IList<T> = T[];
export type ICollection<T> = T[];
export type IEnumerable<T> = readonly T[];
export type IReadOnlyList<T> = readonly T[];
export type IReadOnlyCollection<T> = readonly T[];
export type Dictionary<K, V> = Map<K, V>;
export type IDictionary<K, V> = Map<K, V>;
export type IReadOnlyDictionary<K, V> = ReadonlyMap<K, V>;
export type HashSet<T> = Set<T>;
export type KeyValuePair<K, V> = [K, V];
export type Nullable<T> = T | null;
export type Type = Function;
export type Guid = string;

/** C# `out` / `ref` parameter. */
export interface Ref<T> { v: T }
export const ref = <T>(v: T): Ref<T> => ({ v });

/** A game method whose body has not been ported yet. The ledger (scripts/engine/ledger.py) counts these. */
export class NotPortedError extends Error {
    readonly method: string;
    readonly rva: number;
    constructor(method: string, rva: number) {
        super(`not ported: ${method} (RVA 0x${rva.toString(16)})`);
        this.method = method;
        this.rva = rva;
    }
}
export function notPorted(method: string, rva: number): never {
    throw new NotPortedError(method, rva);
}

/** C# `x is IFoo` for interfaces: each class lists the interfaces it declares in `static __interfaces`. */
export function isImpl(o: unknown, iface: string): boolean {
    if (o == null || typeof o !== "object") return false;
    for (let c = (o as object).constructor as any; c && c !== Object; c = Object.getPrototypeOf(c)) {
        const list: readonly string[] | undefined = Object.prototype.hasOwnProperty.call(c, "__interfaces") ? c.__interfaces : undefined;
        if (list && list.includes(iface)) return true;
    }
    return false;
}

/** List<T>.RemoveAll(match): removes in place, returns the count (C# semantics, order kept). */
export function removeAll<T>(list: T[], match: (t: T) => boolean): int {
    let w = 0;
    for (let r = 0; r < list.length; r++) if (!match(list[r])) list[w++] = list[r];
    const removed = list.length - w;
    list.length = w;
    return removed;
}

/** C# integer division / (int) cast of a double: truncation toward zero. */
export const trunc = (x: number): int => Math.trunc(x);

/**
 * Randomness. The game draws from System.Random / Guid.NewGuid with no exposed seed, so a simulation can only
 * reproduce the *distribution*. Every random draw in the port goes through `GameRandom` so a run can be seeded.
 */
export const GameRandom = {
    next: Math.random as () => number,
    /** Replace the source, e.g. `GameRandom.seed(seededRng(42))`. */
    seed(rng: () => number): void { GameRandom.next = rng; },
};

/** `source.OrderBy(_ => Guid.NewGuid())`: a uniformly random permutation (stable sort on random keys). */
export function orderByNewGuid<T>(source: readonly T[]): T[] {
    const keyed = source.map(v => ({ v, k: GameRandom.next() }));
    keyed.sort((a, b) => a.k - b.k);
    return keyed.map(x => x.v);
}

export type Queue<T> = T[]; // Enqueue = push, Dequeue = shift
export type Stack<T> = T[]; // Push = push, Pop = pop

/** `type.Name` (MemberInfo.Name). Classes may set `static __csName` so minified builds keep the C# name. */
export function typeName(t: Type): string {
    return Object.prototype.hasOwnProperty.call(t, "__csName") ? (t as any).__csName : t.name;
}
/** `a.IsAssignableFrom(b)` for classes (interfaces are strings, see isImpl). */
export function isAssignableFrom(a: Type, b: Type | null): boolean {
    if (b == null) return false;
    return b === a || b.prototype instanceof a;
}
/** List<T>.Insert(index, item): throws like C# when index > Count. */
export function listInsert<T>(list: T[], index: int, item: T): void {
    if (index < 0 || index > list.length) throw new RangeError("ArgumentOutOfRangeException: index");
    list.splice(index, 0, item);
}
/** Enum.IsDefined(typeof(TEnum), value) for the const-object enums. */
export function enumIsDefined(e: object, value: number): boolean {
    return Object.values(e).includes(value);
}
/** int.Parse(string) (invariant integer style: surrounding whitespace and a sign allowed). */
export function intParse(s: string | null): int {
    if (s == null) throw new TypeError("ArgumentNullException: s");
    const t = s.trim();
    if (!/^[+-]?\d+$/.test(t)) throw new SyntaxError(`FormatException: "${s}"`);
    const v = Number(t);
    if (v > 2147483647 || v < -2147483648) throw new RangeError(`OverflowException: "${s}"`);
    return v;
}
/** string.IsNullOrEmpty */
export const isNullOrEmpty = (s: string | null | undefined): boolean => s == null || s.length === 0;
/**
 * Lazy C# static constructor, for classes whose .cctor references classes that import them (an import cycle would
 * see `undefined` at module load). Call `runCctor(X)` at the start of every member that reads X's static fields;
 * the CLR also runs such a .cctor on first access.
 */
const cctorDone = new Set<object>();
export function runCctor(cls: { cctor(): void }): void {
    if (cctorDone.has(cls)) return;
    cctorDone.add(cls);
    cls.cctor();
}

/**
 * Multicast delegates (Action/Func fields with += / -=): System.Delegate.Combine / Remove. A combined delegate is a
 * function carrying its invocation list in `__list`; invoking it calls each entry in order and returns the last result.
 */
type AnyFn = (...a: any[]) => any;
function invocationList(d: AnyFn | null): AnyFn[] { return d == null ? [] : ((d as any).__list ?? [d]); }
function fromList<T extends AnyFn>(list: AnyFn[]): T | null {
    if (list.length === 0) return null;
    if (list.length === 1) return list[0] as T;
    const f = ((...a: any[]) => { let r: any; for (const g of list) r = g(...a); return r; }) as any;
    f.__list = list;
    return f as T;
}
export const Delegate = {
    Combine<T extends AnyFn>(a: T | null, b: T | null): T | null { return fromList<T>([...invocationList(a), ...invocationList(b)]); },
    /** Removes the last occurrence of b's invocation list in a (C# semantics). */
    Remove<T extends AnyFn>(a: T | null, b: T | null): T | null {
        const la = invocationList(a), lb = invocationList(b);
        if (lb.length === 0) return a;
        for (let i = la.length - lb.length; i >= 0; i--) {
            if (lb.every((g, j) => la[i + j] === g)) return fromList<T>([...la.slice(0, i), ...la.slice(i + lb.length)]);
        }
        return a;
    },
};
/** Math.Clamp(int|float, min, max) (throws when min > max, like .NET). */
export function clamp(value: number, min: number, max: number): number {
    if (min > max) throw new RangeError(`ArgumentException: '${min}' cannot be greater than ${max}.`);
    return value < min ? min : value > max ? max : value;
}
/** Enumerable.OrderBy(source, key): stable ascending sort into a new array. */
export function orderBy<T>(source: readonly T[], key: (t: T) => number): T[] {
    return source.map((v, i) => ({ v, i, k: key(v) })).sort((a, b) => a.k - b.k || a.i - b.i).map(x => x.v);
}
/** Enumerable.OrderByDescending(source, key): stable descending sort into a new array. */
export function orderByDescending<T>(source: readonly T[], key: (t: T) => number): T[] {
    return source.map((v, i) => ({ v, i, k: key(v) })).sort((a, b) => b.k - a.k || a.i - b.i).map(x => x.v);
}
/** Dictionary<K,V>[key] getter: throws KeyNotFoundException like C#. */
export function dictGet<K, V>(dic: ReadonlyMap<K, V>, key: K): V {
    if (!dic.has(key)) throw new RangeError(`KeyNotFoundException: The given key '${String(key)}' was not present in the dictionary.`);
    return dic.get(key)!;
}
