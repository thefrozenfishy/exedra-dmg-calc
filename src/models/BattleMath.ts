// Bit-faithful emulation of the two numeric types the game's battle core computes with:
//
//  - C# `float` (IEEE-754 binary32). IL2CPP compiles every float operation to a native
//    single-precision SSE instruction, so each intermediate result is rounded to float32.
//    `f32()` (= Math.fround) must wrap EVERY operation, not just the final result.
//
//  - C# `System.Decimal` (96-bit integer mantissa, base-10 scale 0..28). Almost the whole
//    damage pipeline (BattleDamageCalculator, GetProcessedAtkDecimal/DefDecimal, every
//    GetDamageVariationValue) is decimal, not float or double. Emulated here with BigInt.
//
// Source of truth: the game ships .NET Core's managed decimal implementation
// (System.Decimal.DecCalc$$VarDecFromR4 @ RVA 0x4b07020, VarDecFromR8 @ 0x4b07420,
// ScaleResult @ 0x4b05510, VarDecMul @ 0x4b07810, VarDecDiv @ 0x4b064e0 in 3.19.0).
// VarDecFromR4 was decompiled and matches the .NET Core source line for line (7-digit
// rounding, the `6 - ((exp * 19728) >> 16)` power estimate, half-to-even rounding), so the
// algorithms below follow that source.
//
// Why this matters (the float faults): a JS double gives e.g. 0.1 * 3 = 0.30000000000000004,
// which after the final Math.ceil in GetAttackDamageResult turns an exact integer damage
// into integer+1. The game's decimal math gives exactly 0.3. Conversely, float -> decimal
// conversions ROUND TO 7 SIGNIFICANT DIGITS (so (decimal)1.2f is exactly 1.2, not
// 1.2000000476837158) and double -> decimal rounds to 15 digits (so the Math.Pow result in
// GetDamageBase is truncated to 15 significant digits before entering decimal math).

export const f32 = Math.fround;

const MAX_MANTISSA = (1n << 96n) - 1n;
const MAX_SCALE = 28;
const POW10: bigint[] = [];
for (let i = 0, p = 1n; i <= 60; i++, p *= 10n) POW10.push(p);
const pow10n = (n: number): bigint => (n <= 60 ? POW10[n] : 10n ** BigInt(n));

// .NET's s_doublePowers10 table: exact double literals 1e0 .. 1e80
const DOUBLE_POW10: number[] = [];
for (let i = 0; i <= 80; i++) DOUBLE_POW10.push(Number("1e" + i));

function absBig(x: bigint): bigint { return x < 0n ? -x : x; }

// Round num/den to an integer, ties to even (DecCalc's rounding everywhere).
function divRoundHalfEven(num: bigint, den: bigint): bigint {
    if (den < 0n) { num = -num; den = -den; }
    const neg = num < 0n;
    const a = neg ? -num : num;
    let q = a / den;
    const r = a - q * den;
    const twice = r * 2n;
    if (twice > den || (twice === den && (q & 1n) === 1n)) q += 1n;
    return neg ? -q : q;
}

export class CsDecimal {
    // value = m / 10^s, |m| <= 2^96-1, 0 <= s <= 28
    readonly m: bigint;
    readonly s: number;
    private constructor(m: bigint, s: number) { this.m = m; this.s = s; }

    static readonly Zero = new CsDecimal(0n, 0);
    static readonly One = new CsDecimal(1n, 0);
    static readonly MinusOne = new CsDecimal(-1n, 0);

    // Build from an exact rational num/den (den > 0), preferring the smallest scale >=
    // minScale that represents it exactly; if none fits, round half-to-even at the largest
    // scale whose mantissa fits in 96 bits (DecCalc.ScaleResult / VarDecDiv behaviour).
    private static fromRational(num: bigint, den: bigint, minScale = 0): CsDecimal {
        if (num === 0n) return CsDecimal.Zero;
        minScale = Math.max(0, Math.min(MAX_SCALE, minScale));
        for (let s = minScale; s <= MAX_SCALE; s++) {
            const scaled = num * pow10n(s);
            if (scaled % den === 0n) {
                const m = scaled / den;
                if (absBig(m) <= MAX_MANTISSA) return new CsDecimal(m, s);
                break; // exact but too big at this scale: needs rounding at a lower scale
            }
        }
        for (let s = MAX_SCALE; s >= 0; s--) {
            const m = divRoundHalfEven(num * pow10n(s), den);
            if (absBig(m) <= MAX_MANTISSA) return new CsDecimal(m, s);
        }
        throw new RangeError("System.OverflowException: Value was either too large or too small for a Decimal.");
    }

    // Exact m/10^s that may exceed scale 28 or 96 bits -> round (VarDecMul/VarDecAdd path).
    private static fromScaled(m: bigint, s: number): CsDecimal {
        if (s <= MAX_SCALE && absBig(m) <= MAX_MANTISSA) return new CsDecimal(m, s);
        return CsDecimal.fromRational(m, pow10n(s), 0);
    }

    static fromInt(n: number): CsDecimal {
        if (!Number.isInteger(n)) throw new TypeError(`CsDecimal.fromInt(${n}): not an integer`);
        return new CsDecimal(BigInt(n), 0);
    }

    // C# `new decimal(float)` / `(decimal)someFloat`: DecCalc.VarDecFromR4.
    static fromFloat(input: number): CsDecimal {
        const f = f32(input);
        if (!Number.isFinite(f)) throw new RangeError("Decimal overflow");
        const buf = new DataView(new ArrayBuffer(4));
        buf.setFloat32(0, f);
        const biased = (buf.getUint32(0) >>> 23) & 0xff;
        if (biased <= 0x1f) return CsDecimal.Zero;            // exp < -94: underflow to 0
        if (biased > 0xde) throw new RangeError("Decimal overflow");
        const exp = biased - 126;                               // FLT_BIAS
        const neg = f < 0;
        let dbl = Math.abs(f);
        let power = 6 - ((exp * 19728) >> 16);
        if (power >= 0) {
            if (power > MAX_SCALE) power = MAX_SCALE;
            dbl *= DOUBLE_POW10[power];
        } else {
            if (power !== -1 || dbl >= 1e7) dbl /= DOUBLE_POW10[-power];
            else power = 0;
        }
        if (dbl < 1e6 && power < MAX_SCALE) { dbl *= 10; power++; }
        let mant = Math.trunc(dbl);
        const frac = dbl - mant;
        if (frac > 0.5 || (frac === 0.5 && (mant & 1) !== 0)) mant++;
        if (mant === 0) return CsDecimal.Zero;
        let m = BigInt(mant);
        if (neg) m = -m;
        if (power < 0) return new CsDecimal(m * pow10n(-power), 0);
        // DecCalc factors out trailing powers of 10 to reduce the scale
        while (power > 0 && m % 10n === 0n) { m /= 10n; power--; }
        return CsDecimal.fromScaled(m, power);
    }

    // C# `new decimal(double)` / `(decimal)someDouble`: DecCalc.VarDecFromR8 (15 digits).
    static fromDouble(input: number): CsDecimal {
        if (!Number.isFinite(input)) throw new RangeError("Decimal overflow");
        if (input === 0) return CsDecimal.Zero;
        const buf = new DataView(new ArrayBuffer(8));
        buf.setFloat64(0, input);
        const biased = (buf.getUint32(0) >>> 20) & 0x7ff;
        const exp = biased - 1022;                              // DBL_BIAS
        if (exp < -94) return CsDecimal.Zero;
        if (exp > 96) throw new RangeError("Decimal overflow");
        const neg = input < 0;
        let dbl = Math.abs(input);
        let power = 14 - ((exp * 19728) >> 16);
        if (power >= 0) {
            if (power > MAX_SCALE) power = MAX_SCALE;
            dbl *= DOUBLE_POW10[power];
        } else {
            if (power !== -1 || dbl >= 1e15) dbl /= DOUBLE_POW10[-power];
            else power = 0;
        }
        if (dbl < 1e14 && power < MAX_SCALE) { dbl *= 10; power++; }
        let mant = Math.trunc(dbl);
        const frac = dbl - mant;
        if (frac > 0.5 || (frac === 0.5 && (mant % 2) !== 0)) mant++;
        if (mant === 0) return CsDecimal.Zero;
        let m = BigInt(mant);
        if (neg) m = -m;
        if (power < 0) return new CsDecimal(m * pow10n(-power), 0);
        // DecCalc factors out trailing powers of 10 to reduce the scale
        while (power > 0 && m % 10n === 0n) { m /= 10n; power--; }
        return CsDecimal.fromScaled(m, power);
    }

    add(o: CsDecimal): CsDecimal {
        const s = Math.max(this.s, o.s);
        return CsDecimal.fromScaled(this.m * pow10n(s - this.s) + o.m * pow10n(s - o.s), s);
    }
    sub(o: CsDecimal): CsDecimal { return this.add(o.neg()); }
    mul(o: CsDecimal): CsDecimal { return CsDecimal.fromScaled(this.m * o.m, this.s + o.s); }
    div(o: CsDecimal): CsDecimal {
        if (o.m === 0n) throw new RangeError("System.DivideByZeroException");
        // this / o = (this.m * 10^o.s) / (o.m * 10^this.s)
        let num = this.m * pow10n(o.s);
        let den = o.m * pow10n(this.s);
        if (den < 0n) { num = -num; den = -den; }
        return CsDecimal.fromRational(num, den, Math.max(0, this.s - o.s));
    }
    neg(): CsDecimal { return new CsDecimal(-this.m, this.s); }

    cmp(o: CsDecimal): number {
        const s = Math.max(this.s, o.s);
        const a = this.m * pow10n(s - this.s), b = o.m * pow10n(s - o.s);
        return a < b ? -1 : a > b ? 1 : 0;
    }
    lt(o: CsDecimal) { return this.cmp(o) < 0; }
    le(o: CsDecimal) { return this.cmp(o) <= 0; }
    gt(o: CsDecimal) { return this.cmp(o) > 0; }
    ge(o: CsDecimal) { return this.cmp(o) >= 0; }
    eq(o: CsDecimal) { return this.cmp(o) === 0; }
    isZero() { return this.m === 0n; }

    static min(a: CsDecimal, b: CsDecimal) { return a.le(b) ? a : b; }
    static max(a: CsDecimal, b: CsDecimal) { return a.ge(b) ? a : b; }
    // Math.Clamp(value, min, max)
    static clamp(v: CsDecimal, lo: CsDecimal, hi: CsDecimal) {
        if (lo.gt(hi)) throw new RangeError("Math.Clamp: min > max");
        return v.lt(lo) ? lo : v.gt(hi) ? hi : v;
    }

    // Decimal.Ceiling / Floor / Truncate
    ceiling(): CsDecimal {
        const d = pow10n(this.s);
        let q = this.m / d; // trunc toward zero
        if (this.m > 0n && q * d !== this.m) q += 1n;
        return new CsDecimal(q, 0);
    }
    floor(): CsDecimal {
        const d = pow10n(this.s);
        let q = this.m / d;
        if (this.m < 0n && q * d !== this.m) q -= 1n;
        return new CsDecimal(q, 0);
    }
    truncate(): CsDecimal { return new CsDecimal(this.m / pow10n(this.s), 0); }

    // (int)someDecimal: truncates toward zero, throws on overflow.
    toInt(): number {
        const t = this.m / pow10n(this.s);
        if (t > 2147483647n || t < -2147483648n) throw new RangeError("System.OverflowException");
        return Number(t);
    }
    // (double)someDecimal: DecCalc.VarR8FromDec
    toDouble(): number {
        const neg = this.m < 0n;
        const a = neg ? -this.m : this.m;
        const low64 = a & ((1n << 64n) - 1n);
        const high = a >> 64n;
        const dbl = (Number(low64) + Number(high) * 18446744073709551616.0) / DOUBLE_POW10[this.s];
        return neg ? -dbl : dbl;
    }
    // (float)someDecimal: DecCalc.VarR4FromDec = (float)VarR8FromDec
    toFloat(): number { return f32(this.toDouble()); }

    toString(): string {
        const neg = this.m < 0n;
        let digits = (neg ? -this.m : this.m).toString();
        if (this.s > 0) {
            digits = digits.padStart(this.s + 1, "0");
            digits = digits.slice(0, -this.s) + "." + digits.slice(-this.s);
        }
        return (neg ? "-" : "") + digits;
    }
}

export const dec = {
    int: CsDecimal.fromInt,
    float: CsDecimal.fromFloat,
    double: CsDecimal.fromDouble,
    zero: CsDecimal.Zero,
    one: CsDecimal.One,
};

// MathExtension.Floor(float value, int n) (ReDriveBattleCore, RVA 0x149F830) - see
// UnitStateEngine.ts for its call sites. Implemented where first needed.

// Small, fast, seedable PRNG (mulberry32) returning [0, 1) like Math.random - used so a
// simulated battle can be replayed exactly from its seed. The game itself uses
// System.Random / Guid.NewGuid without an exposed seed, so this only makes the SIMULATOR
// reproducible; it does not reproduce the game's own rolls.
export function seededRng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
