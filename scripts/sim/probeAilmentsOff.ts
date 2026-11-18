// Max Damage with an ailment the team inflicts turned off (MaxDmgOptions.ailmentsOff, the PvE page's "it missed").
//   npx tsx scripts/sim/probeAilmentsOff.ts [stageId] ["Dealer,Support,..."] [STATE_TYPE]
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { stageWaves } from "../../src/models/PvE";
import { stageBattleType } from "../../src/models/PvEBattle";
console.debug = () => {}
console.warn = () => {}
const stageId = Number(process.argv[2] ?? 104113)
const names = (process.argv[3] ?? "Bebe-O'-Lantern,All Souls' Repose,Assault Paranoia").split(",")
const type = process.argv[4] ?? "CURSE_ATK"
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const wave = stageWaves(stageId)[0]
const landable = ["BURN_ATK", "CURSE_ATK", "POISON_ATK", "BLEED_ATK", "STUN", "VORTEX_ATK", "WEAKNESS"]
for (const off of [[], [type]]) {
    const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, wave, 0, { battleType: stageBattleType(stageId), broken: wave.map(() => true), mainTargetIdx: 0, landableAilments: landable, ailmentsOff: off })
    const m = r.members[0]
    const counted = r.effects.filter(e => e.reach).length
    for (const e of r.effects) if ([12091003, 150381004, 150381005].includes((e.detail as any).skillDetailMstId ?? (e.detail as any).passiveSkillDetailMstId)) console.log("   ", (e.detail as any).skillDetailMstId ?? (e.detail as any).passiveSkillDetailMstId, e.detail.abilityEffectType, e.reach ? "counted" : "not counted")
    console.log(off.length ? `${type} off` : "all on", m.skills.map(s => `${s.label} ${Math.round(s.total.crit).toLocaleString()}`).join(" | "), `| effects counted ${counted}`)
}
