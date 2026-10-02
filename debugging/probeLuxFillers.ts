// Probe: Kioku Grid bench Lux fillers are A0 (no follow-up), the dealer A5.  npx tsx debugging/probeLuxFillers.ts
import "../src/models/BestTeamCalculator";
import { benchKioku, LuxBenchCharts, simulatedDealerDamage } from "../src/models/LuxBench";
import { LuxMagica } from "../src/types/enums";
console.debug = () => {}; console.warn = () => {};
const lvl = { kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10 };
const fua = (k: any) => k.effects.filter((d: any) => d.abilityEffectType === "ADDITIONAL_SKILL_ACT").length;
const a5 = benchKioku({ name: LuxMagica, ...lvl } as any), a0 = benchKioku({ name: LuxMagica, ...lvl, ascension: 0 } as any);
console.log("follow-up effects A5", fua(a5), "A0", fua(a0));
// who deals damage in a Lux-only bench battle: per slot
for (const [name, team] of [["A5 x5", [a5, a5, a5, a5, a5]], ["A5 + A0 x4", [a5, a0, a0, a0, a0]]] as const) {
    const per: number[] = [];
    for (let pos = 0; pos < 5; pos++) per.push(Math.round(simulatedDealerDamage(team as any, pos, 1, { av: 500, seed: 0, infiniteSp: true, expectedCrits: true })));
    console.log(name, per.join(" "));
}
const bench = new LuxBenchCharts({ name: LuxMagica, ...lvl } as any, { seeds: 10, av: 500, infiniteSp: true });
for (const n of ["Bebe-O'-Lantern"]) {
    const x = benchKioku({ name: n, ...lvl } as any);
    console.log(n, "support max", bench.supportMax(x, 1).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join(" "),
        "avg", bench.supportAvg(x, 1).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join(" "),
        "| attacker max", bench.attackerMax(x, 1).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join(" "),
        "avg", bench.attackerAvg(x, 1).map(r => `${r.ailment ?? "-"}:${r.gain.toFixed(2)}`).join(" "));
}
