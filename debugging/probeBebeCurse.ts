// Probe: Kioku Grid support bench for Bebe-O'-Lantern (curse variant).  npx tsx debugging/probeBebeCurse.ts
import "../src/models/BestTeamCalculator";
import { benchKioku, kitRestrictions, LuxBenchCharts } from "../src/models/LuxBench";
import { LuxMagica } from "../src/types/enums";
console.debug = () => {}; console.warn = () => {};
const lvl = { kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10 };
const x = benchKioku({ name: "Bebe-O'-Lantern", ...lvl } as any);
console.log("restrictions", kitRestrictions(x));
const bench = new LuxBenchCharts({ name: LuxMagica, ...lvl } as any, { seeds: 10, av: 500, infiniteSp: true });
for (const n of [1, 3, 5]) {
    console.log(n, "max", bench.supportMax(x, n).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join("  "));
    console.log(n, "avg", bench.supportAvg(x, n).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join("  "));
}
