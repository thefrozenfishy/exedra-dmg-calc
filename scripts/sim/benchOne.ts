// Lux bench for one character: npx tsx scripts/sim/benchOne.ts "<kioku>" [support|attacker] [enemies] [av]
import "../../src/models/BestTeamCalculator";
import { benchKioku, LuxBenchCharts, kitRestrictions } from "../../src/models/LuxBench";
const [name, chart = "support", en = "1", av = "500"] = process.argv.slice(2)
console.debug = () => {}; const warn = console.warn; console.warn = () => {}
const max = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const bench = new LuxBenchCharts({ name: "Lux☆Magica", ...max, ascension: Number(process.env.LUXASC ?? 5) } as any, { seeds: 10, av: Number(av), infiniteSp: true })
const x = benchKioku({ name, ...max } as any)
console.log("restrictions", JSON.stringify(kitRestrictions(x)))
const fmt = (r: any) => `${r.element ?? "-"}/${r.role ?? "-"}/${r.ailment ?? "-"}: ${r.gain.toFixed(2)}%`
const e = Number(en)
const m = chart === "support" ? bench.supportMax(x, e) : bench.attackerMax(x, e)
console.log("MAX", m.map(fmt).join(" | "))
const a = chart === "support" ? bench.supportAvg(x, e) : bench.attackerAvg(x, e)
console.log("AVG", a.map(fmt).join(" | "))
console.warn = warn
