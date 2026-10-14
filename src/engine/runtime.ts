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
/** `catch (Exception)` in the game: any managed exception (a TypeError here stands for NullReferenceException,
 * ArgumentNullException, ...). Port errors (NotPortedError) are not game exceptions and keep propagating. */
export function isGameException(e: unknown): boolean {
    return !(e instanceof NotPortedError);
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
    /** App side (not game code): when set, every random decision of the port goes through it (see RandomHook). */
    hook: null as RandomHook | null,
};

/** What a random decision is about (for the app's RNG modes and its battle log). */
export type RandomKind = "crit" | "effect" | "target" | "skill";
/**
 * App side (not game code): lets the app decide the port's random draws (always hit / miss / most likely /
 * seeded / user decisions) and log them. `subject` = the game objects the decision is about (units, states,
 * skills) for labels; `options` = what a choice picks from. Without a hook every draw is `GameRandom.next()`.
 */
export interface RandomHook {
    /** A yes/no roll against `probability` percent; `hits(r)` is the game's own comparison for a uniform r in [0, 1). */
    chance(probability: number, kind: RandomKind, subject: readonly unknown[], hits: (r: number) => boolean): boolean;
    /** One of `options` by integer weights (the game's running-total walk; all 1 = uniform). Returns the index. */
    choose(weights: readonly number[], kind: RandomKind, subject: readonly unknown[], options: readonly unknown[]): int;
    /** A Guid.NewGuid() sort key (random tie-breaks inside an ordering). */
    guidKey(): number;
}
/** A roll the game compares as `hits(r)` (r uniform in [0, 1)); `probability` (percent) is only for the hook. */
export function randomChance(probability: number, kind: RandomKind, subject: readonly unknown[], hits: (r: number) => boolean): boolean {
    const hook = GameRandom.hook;
    return hook ? hook.chance(probability, kind, subject, hits) : hits(GameRandom.next());
}
/** `new System.Random().Next(maxValue)` used to pick `options[index]` uniformly. */
export function randomNextIndex(maxValue: number, kind: RandomKind, subject: readonly unknown[], options: readonly unknown[]): int {
    const hook = GameRandom.hook;
    if (hook == null || maxValue < 1) return randomNext(maxValue);
    return hook.choose(options.map(() => 1), kind, subject, options);
}
/** `new System.Random().Next(sum)` walked against the running total of `weights` (sum = their total): with a hook,
 * returns a roll that the same walk turns into the hook's pick. */
export function randomNextWeighted(sum: number, weights: readonly number[], kind: RandomKind, subject: readonly unknown[], options: readonly unknown[]): int {
    const hook = GameRandom.hook;
    if (hook == null || sum < 1) return randomNext(sum);
    const index = hook.choose(weights, kind, subject, options);
    let before = 0;
    for (let i = 0; i < index; i++) before += weights[i];
    return before;
}

/** `source.OrderBy(_ => Guid.NewGuid())`: a uniformly random permutation (stable sort on random keys). Callers that
 * take only the first element pass `kind`/`subject` so a hook decides that element. */
export function orderByNewGuid<T>(source: readonly T[], kind?: RandomKind, subject?: readonly unknown[]): T[] {
    const hook = GameRandom.hook;
    if (hook != null && kind != null) {
        if (source.length === 0) return [];
        const index = hook.choose(source.map(() => 1), kind, subject ?? [], source);
        return [source[index], ...source.filter((_, i) => i !== index)];
    }
    const keyed = source.map(v => ({ v, k: hook != null ? hook.guidKey() : GameRandom.next() }));
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
/** `new Action<T>(target.Method)`: C# delegates compare equal by (target, method), so the same pair gives the same
 * function object here (needed for `-=` / Delegate.Remove of a freshly created delegate). */
const delegateCache = new WeakMap<object, Map<Function, Function>>();
export function bindDelegate<F extends AnyFn>(target: object, method: F): F {
    let m = delegateCache.get(target);
    if (m === undefined) { m = new Map(); delegateCache.set(target, m); }
    let f = m.get(method);
    if (f === undefined) { f = method.bind(target); m.set(method, f); }
    return f as F;
}
/** List<T>.Remove: removes the first occurrence, returns whether it was found. */
export function listRemove<T>(list: T[], item: T): boolean {
    const i = list.indexOf(item);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
}
/** Enumerable.First(predicate): throws when nothing matches (InvalidOperationException). */
export function first<T>(source: readonly T[], pred?: (t: T) => boolean): T {
    for (const t of source) if (pred == null || pred(t)) return t;
    throw new Error("InvalidOperationException: Sequence contains no matching element");
}
/** Enumerable.SingleOrDefault(predicate): default when none, throws when more than one matches. */
export function singleOrDefault<T>(source: readonly T[], pred: (t: T) => boolean): T | null {
    let found: T | null = null, n = 0;
    for (const t of source) if (pred(t)) { found = t; if (++n > 1) throw new Error("InvalidOperationException: Sequence contains more than one matching element"); }
    return found;
}
/** Enumerable.Min/Max(selector) over ints: throws on an empty sequence. */
export function minBy<T>(source: readonly T[], sel: (t: T) => number): number {
    if (source.length === 0) throw new Error("InvalidOperationException: Sequence contains no elements");
    let m = sel(source[0]); for (let i = 1; i < source.length; i++) { const v = sel(source[i]); if (v < m) m = v; } return m;
}
export function maxBy<T>(source: readonly T[], sel: (t: T) => number): number {
    if (source.length === 0) throw new Error("InvalidOperationException: Sequence contains no elements");
    let m = sel(source[0]); for (let i = 1; i < source.length; i++) { const v = sel(source[i]); if (v > m) m = v; } return m;
}
/** `OrderBy(k0).ThenBy(k1)...` (descending per key when `desc`), stable like LINQ. Keys are computed level by level
 * for all elements, as .NET's EnumerableSorter does (matters for `Guid.NewGuid()` keys drawn from GameRandom). */
export function orderByKeys<T>(source: readonly T[], keys: ReadonlyArray<readonly [(t: T) => number | boolean, boolean]>): T[] {
    const cols = keys.map(([k]) => source.map(t => Number(k(t))));
    const idx = source.map((_, i) => i);
    idx.sort((a, b) => {
        for (let l = 0; l < keys.length; l++) {
            const d = cols[l][a] - cols[l][b];
            if (d !== 0) return keys[l][1] ? -d : d;
        }
        return a - b;
    });
    return idx.map(i => source[i]);
}
/** Guid.NewGuid() used as a sort key: a random number from GameRandom. */
export const newGuidKey = (): number => GameRandom.hook != null ? GameRandom.hook.guidKey() : GameRandom.next();
/** new System.Random().Next(maxValue): an int in [0, maxValue) from GameRandom. */
export const randomNext = (maxValue: number): number => Math.floor(GameRandom.next() * maxValue);

/** Enum.Parse<T>(string) (case-sensitive): a member name or an integer, trimmed; comma lists are OR'ed like .NET. Throws like .NET. */
export function enumParse(e: Readonly<Record<string, number>>, s: string | null): number {
    if (s == null) throw new TypeError("ArgumentNullException: value");
    let result = 0;
    const parts = s.split(",");
    for (const raw of parts) {
        const p = raw.trim();
        if (p.length === 0) throw new SyntaxError(`ArgumentException: Requested value '${s}' was not found.`);
        if (/^[+-]?\d+$/.test(p)) { result |= Number(p); continue; }
        if (!Object.prototype.hasOwnProperty.call(e, p)) throw new SyntaxError(`ArgumentException: Requested value '${s}' was not found.`);
        result |= e[p];
    }
    return result;
}
/** Enum.ToString() for a non-flags enum: the member name, or the number when the value is not defined. */
export function enumToString(e: Readonly<Record<string, number>>, value: number): string {
    for (const k of Object.keys(e)) if (e[k] === value) return k;
    return String(value);
}

/** System.Boolean.Parse: "True"/"False", case-insensitive, surrounding whitespace allowed. */
export function boolParse(s: string | null): boolean {
    if (s == null) throw new TypeError("ArgumentNullException: value");
    const t = s.trim().toLowerCase();
    if (t === "true") return true;
    if (t === "false") return false;
    throw new SyntaxError(`FormatException: "${s}"`);
}
/** System.Single.Parse (invariant-style digits), rounded to float. */
export function singleParse(s: string | null): number {
    if (s == null) throw new TypeError("ArgumentNullException: s");
    const t = s.trim();
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) throw new SyntaxError(`FormatException: "${s}"`);
    return Math.fround(Number(t));
}
/** String.StartsWith(string) (culture-sensitive in .NET; ordinal here); throws on a null prefix like .NET. */
export function startsWith(s: string, prefix: string | null): boolean {
    if (prefix == null) throw new TypeError("ArgumentNullException: value");
    return s.startsWith(prefix);
}

/** Enumerable.Union (default equality: value for strings/numbers, reference for objects); order kept, duplicates dropped. */
export function union<T>(first: readonly T[], second: readonly T[]): T[] {
    const seen = new Set<T>(), out: T[] = [];
    for (const x of first) if (!seen.has(x)) { seen.add(x); out.push(x); }
    for (const x of second) if (!seen.has(x)) { seen.add(x); out.push(x); }
    return out;
}

/** System.Math.Clamp(value, min, max): throws when min > max, like .NET. */
export function mathClamp(value: number, min: number, max: number): number {
    if (min > max) throw new RangeError(`ArgumentException: '${min}' cannot be greater than ${max}.`);
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

/** App side, a performance hint with no effect on results: tags a master-table predicate with an equality it implies
 *  (`pred(r)` is only true when `r[field] === value`). The predicate is still what decides; a repository
 *  (ReDrive/Model/BattleMstModelRepositoryBase) may use the tag to look at only the records with that value, in
 *  record order, instead of scanning the whole table (the client does the scan in C#, ~100x faster than here). */
export function indexHint<T>(pred: (r: T) => boolean, field: string, value: unknown): (r: T) => boolean {
    (pred as any).$index = [field, value];
    return pred;
}

/** C# interface dispatch of a property: reads `member` of interface `iface` on `o`. A class that implements the member
 *  explicitly (`int IFoo.Bar { get; }`, ported as `IFoo$Bar`) answers through that, otherwise the public member. */
export function ifaceProp(o: any, iface: string, member: string): any {
    const explicit = `${iface}$${member}`;
    return explicit in o ? o[explicit] : o[member];
}
