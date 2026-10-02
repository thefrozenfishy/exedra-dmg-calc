// Probe: does Absolute Rain (on-crit MP / ATK) fall back to rolled seeds in the Kioku Grid bench?  npx tsx debugging/probeAbsoluteRain.ts
import "../src/models/BestTeamCalculator";
import { benchKioku, simulatedDealerDamage } from "../src/models/LuxBench";
import { LuxMagica } from "../src/types/enums";
console.debug = () => {}; console.warn = () => {};
const lvl = { kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10 };
const x = benchKioku({ name: process.argv[2] ?? "Absolute Rain", ...lvl } as any);
const a5 = benchKioku({ name: LuxMagica, ...lvl } as any), a0 = benchKioku({ name: LuxMagica, ...lvl, ascension: 0 } as any);
for (const [label, team] of [["attacker", [x, a0, a0, a0, a0]], ["support", [a5, x, a0, a0, a0]]] as const) {
    const report = { random: false };
    const exp = simulatedDealerDamage(team as any, 0, 1, { av: 500, seed: 0, infiniteSp: true, expectedCrits: true, report });
    const seeds: number[] = [];
    for (let s = 0; s < 10; s++) seeds.push(simulatedDealerDamage(team as any, 0, 1, { av: 500, seed: s, infiniteSp: true }));
    const mean = seeds.reduce((a, b) => a + b, 0) / 10;
    console.log(label, "random flagged:", report.random, "expected:", Math.round(exp), "10-seed mean:", Math.round(mean), `(${((exp / mean - 1) * 100).toFixed(1)}%)`, "min/max", Math.round(Math.min(...seeds)), Math.round(Math.max(...seeds)));
}
