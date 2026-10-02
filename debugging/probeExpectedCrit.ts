// Probe: Kioku Grid bench, expected-crit single battle vs the mean of 10 rolled battles (attacker chart, 5 enemies).
//   npx tsx debugging/probeExpectedCrit.ts <av> [from] [to]
import "../src/models/BestTeamCalculator";
import { kiokuData } from "../src/utils/helpers";
import { benchKioku, simulatedDealerDamage } from "../src/models/LuxBench";
import { LuxMagica } from "../src/types/enums";
console.debug = () => {}; console.warn = () => {};
const lvl = { kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10 };
const filler = benchKioku({ name: LuxMagica, ...lvl } as any, { element: undefined, role: undefined });
const av = Number(process.argv[2] ?? 500);
const fives = Object.keys(kiokuData).filter(k => kiokuData[k].rarity === 5).sort().slice(Number(process.argv[3] ?? 0), Number(process.argv[4] ?? 999));
let tExp = 0, tSeed = 0, fallbacks: string[] = [], diffs: [number, string][] = [];
for (const name of fives) {
    let x; try { x = benchKioku({ name, ...lvl } as any) } catch { continue }
    const team = [x, filler, filler, filler, filler];
    try {
        let t = performance.now();
        const report = { random: false };
        const e = simulatedDealerDamage(team, 0, 5, { av, seed: 0, infiniteSp: true, expectedCrits: true, report });
        tExp += performance.now() - t; t = performance.now();
        let sum = 0; for (let seed = 0; seed < 10; seed++) sum += simulatedDealerDamage(team, 0, 5, { av, seed, infiniteSp: true });
        tSeed += performance.now() - t;
        const mean = sum / 10;
        if (report.random) fallbacks.push(name); else diffs.push([(e / mean - 1) * 100, name]);
    } catch (err) { console.log(name, "ERR", String(err).slice(0, 100)) }
}
diffs.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
console.log(`av ${av}: ${fives.length} chars, expected-crit ${(tExp / 1000).toFixed(1)}s vs 10 seeds ${(tSeed / 1000).toFixed(1)}s`);
console.log(`fall back to seeds (${fallbacks.length}): ${fallbacks.join(", ")}`);
console.log(`expected vs 10-seed mean, largest gaps: ${diffs.slice(0, 8).map(([d, n]) => `${n} ${d.toFixed(1)}%`).join(", ")}`);
console.log(`median |gap|: ${Math.abs(diffs[Math.floor(diffs.length / 2)]?.[0] ?? 0).toFixed(2)}%`);
