// Lux bench, every kioku: npx tsx scripts/sim/benchAll.ts <out.json> [support|attacker] [enemies] [av]
// Both metrics (Max Burst and Average Damage), every identity row, for before/after comparisons of engine changes.
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { benchKioku, LuxBenchCharts } from "../../src/models/LuxBench";
import { kiokuData } from "../../src/utils/helpers";
const [out, chart = "support", en = "1", av = "500"] = process.argv.slice(2)
console.debug = () => {}; console.warn = () => {}
const max = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const bench = new LuxBenchCharts({ name: "Lux☆Magica", ...max } as any, { seeds: 10, av: Number(av), infiniteSp: true })
const res: Record<string, any> = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {}
const e = Number(en)
for (const name of Object.keys(kiokuData)) {
    if (res[name]) continue
    try {
        const x = benchKioku({ name, ...max } as any)
        const key = (r: any) => `${r.element ?? "-"}/${r.role ?? "-"}/${r.ailment ?? "-"}`
        const m = chart === "support" ? bench.supportMax(x, e) : bench.attackerMax(x, e)
        const a = chart === "support" ? bench.supportAvg(x, e) : bench.attackerAvg(x, e)
        res[name] = { max: Object.fromEntries(m.map(r => [key(r), +r.gain.toFixed(3)])), avg: Object.fromEntries(a.map(r => [key(r), +r.gain.toFixed(3)])) }
    } catch (err) { res[name] = { error: String(err) } }
    fs.writeFileSync(out, JSON.stringify(res, null, 1))
}
console.log("done", Object.keys(res).length)
