// Best SA Team calculator on the engine, from the command line (the page runs the same search in workers).
//   npx tsx scripts/sim/engineBestTeam.ts <exedraDmgCalcTeam.json> [Element,...] [--old] [--margin N] [--limit-attackers N]
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { findBestTeam } from "../../src/models/BestTeamCalculator";
import { findBestTeamEngine, scenarioOf } from "../../src/models/EngineBestTeam";
import { scoreTeam } from "../../src/battle/EngineTeamScore";
import { PvPKioku } from "../../src/models/PvPKioku";
import { kiokuData } from "../../src/utils/helpers";
import { correctCharacterParams } from "../../src/types/KiokuTypes";

console.debug = () => {}
console.warn = () => {}
const args = process.argv.slice(2)
const chars = JSON.parse(fs.readFileSync(args[0], "utf8")).map((c: any) => correctCharacterParams({ ...(kiokuData as any)[c.name] ? Object.fromEntries(Object.entries((kiokuData as any)[c.name]).filter(([k]) => !(k in c))) : {}, ...c }))
const elements = (args[1] && !args[1].startsWith("--") ? args[1] : "Aqua").split(",")
const opt = (n: string, d: number) => args.indexOf(n) >= 0 ? Number(args[args.indexOf(n) + 1]) : d
const ignored = ["Nightmare Stinger", "Lynx Impact", "Circle Of Fire", "Glittering Hurricane", "Surging Laser", "Verdant Shower", "Diamond Splash", "Purple Will-o'-Wisp", "Folter Gefängnis", "Vampire Fang", "Strada Futuro", "Lux☆Magica", "Infinite Poseidon", "Neo Genesis"]
const enemies = ["Left Other", "Left Proximity", "Target", "Right Proximity", "Right Other"].map(name => ({ name, maxBreak: 500, defense: 3000, enabled: name === "Target", defenseUp: 0, dmgTakenDown: 0, isBreak: true, isWeak: true, isCrit: true, isAddDmgCrit: true, hitsToKill: 1 }))
const options: any = {
    enemies, include4StarAttackers: false, include4StarSupports: false, include4StarOthers: false, weakElements: elements, onlyConsiderOnElements: true,
    onElementExceptions: [], activeAliments: [], extraAttackers: [], obligatoryKioku: [], ignoredKioku: ignored, deBufferCount: 3, otherCount: 1,
    minHealer: 0, minDefender: 0, minBreaker: 0, optimalSubCrys: true, enabledCharacters: chars.filter((c: any) => c.enabled), buffMultReduction: 0,
    debuffMultReduction: 0, attackerHealth: 100, optimizeAverageDamage: false, disabledOtherRoles: [], arenaEffectsMap: {}, enablePruning: true,
    pruningMargin: opt("--margin", 15),
}
const show = (rows: any[][], label: string) => {
    console.log(`== ${label}: ${rows.length} rows`)
    for (const r of [...rows].sort((a, b) => b[0] - a[0]).slice(0, 8)) console.log(`  ${String(r[0]).padStart(10)} crit ${r[1]}%  ${r[3]} [${r[4]}, sup ${r[5]}] + ${[r[9], r[12], r[15], r[18]].join(", ")}`)
}
if (args.includes("--old")) {
    const t0 = Date.now()
    show(await findBestTeam({ ...options }), `old model (${Date.now() - t0} ms)`)
}
const sc = scenarioOf(options)
const cache = new Map<string, PvPKioku>()
const kioku = (a: any) => { const k = JSON.stringify(a); let v = cache.get(k); if (!v) cache.set(k, v = new PvPKioku(a)); return v }
let n = 0
const t0 = Date.now()
let last = 0
const rows = await findBestTeamEngine({ ...options, onProgress: (c: string[], d: number, t: number, pre: boolean) => { if (Date.now() - last > 5000) { last = Date.now(); console.log(`  ${pre ? "A" : "B"} ${d}/${t} ${c.join(", ")}`) } } },
    async team => { n++; return scoreTeam(team.map(kioku), sc) })
show(rows, `engine (${n} scores, ${Date.now() - t0} ms)`)
