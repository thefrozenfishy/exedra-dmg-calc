// Kioku Grid archetypes per Kioku (src/models/KiokuArchetypes), with the rows behind each one, and what A3-A5
// would add. Run after a data update and read the diff.
//   npx tsx scripts/audit/archetypeAudit.ts [--names "A,B"] [--rows]   (EX crystalis included)
import { kiokuData } from "../../src/utils/helpers";
import { archetypeRules, archetypesForKit, kitArchetypeRows } from "../../src/models/KiokuArchetypes";
console.warn = () => {}; console.debug = () => {}

const args = process.argv.slice(2)
const names = args.includes("--names") ? args[args.indexOf("--names") + 1].split(",").map(s => s.trim()) : undefined
const showRows = args.includes("--rows")

for (const [name, d] of Object.entries(kiokuData)) {
    if (names && !names.includes(name)) continue
    const now = archetypesForKit(d).map(r => r.id)
    const a5rows = kitArchetypeRows(d, 5)
    const a5 = archetypeRules.filter(r => a5rows.some(e => r.match(e, d))).map(r => r.id).filter(id => !now.includes(id))
    console.log(`${name}\t[${now.join(",")}]${a5.length ? `\tA3+ adds [${a5.join(",")}]` : ""}`)
    if (showRows) for (const rule of archetypeRules) {
        const hit = kitArchetypeRows(d).filter(e => rule.match(e, d))
        if (hit.length) console.log(`    ${rule.id}: ${[...new Set(hit.map(h => `${h.src}:${h.abilityEffectType}`))].join(", ")}`)
    }
}
