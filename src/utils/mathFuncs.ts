export function erf(x: number): number {
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);

    const p = 0.3275911;
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
}

export function stdNormalCdf(x: number): number {
    return 0.5 * (1.0 + erf(x / Math.sqrt(2.0)));
}

export function owensT(h: number, a: number): number {
    if (a === 0) return 0;
    if (Math.abs(a) > 100) return a > 0 ? 0.5 * stdNormalCdf(h) : -0.5 * stdNormalCdf(h);

    const f = (x: number) => Math.exp(-0.5 * h * h * (1.0 + x * x)) / (1.0 + x * x);
    
    const steps = 100;
    const stepSize = a / steps;
    let sum = 0.5 * (f(0) + f(a));

    for (let i = 1; i < steps; i++) {
        sum += f(i * stepSize);
    }

    return (sum * stepSize) / (2.0 * Math.PI);
}

export function skewnormCdf(x: number, a: number, loc: number, scale: number): number {
    const r = (x - loc) / scale;
    return stdNormalCdf(r) - 2.0 * owensT(r, a);
}