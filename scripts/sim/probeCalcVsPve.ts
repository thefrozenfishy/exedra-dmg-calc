// Highest Dmg Calc (EngineTeamScore) vs the PvE page's Max Damage for one team: both count only the landable ailments
// the team inflicts (MaxDmgOptions.landableAilments).   npx tsx scripts/sim/probeCalcVsPve.ts [stageId] ["Dealer,Support,..."]
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { scoreTeam } from "../../src/battle/EngineTeamScore";
import { AILMENT_STATE } from "../../src/battle/EngineBench";
import { stageWaves } from "../../src/models/PvE";
import { stageBattleType } from "../../src/models/PvEBattle";
import { Ailment } from "../../src/types/enums";
console.debug = () => {}
console.warn = () => {}
const stageId = Number(process.argv[2] ?? 983550)
const names = (process.argv[3] ?? "Light of Reckoning,Sacred Gift,Yuletide Gift,La Danse Macabre,Hollow Woman").split(",")
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const wave = stageWaves(stageId)[0]
const parry: Record<string, string> = { BURN: "burnParryRate", CURSE: "curseParryRate", POISON: "poisonParryRate", WOUND: "bleedParryRate", STUN: "stunParryRate", VORTEX: "vortexParryRate", WEAKNESS: "weaknessParryRate" }
const landable = (Object.values(Ailment) as Ailment[]).filter(a => wave.some(e => ((e as any)[parry[a]] ?? 0) < 1000))
console.log("landable", landable)
const st = { stageId, waveIdx: 0, phase: 1, wave, mainTargetIdx: 0, broken: [true], breakRate: [undefined], removed: [] }
const calc = (ailments: Ailment[], hp?: number) => Math.round(scoreTeam(allies, { stage: st, enemies: [], ailments, attackerHp: hp } as any, true).max)
console.log("calc, landable ailments, HP 100:", calc(landable, 100))
console.log("calc, landable ailments, HP unset:", calc(landable))
console.log("calc, no ailments, HP 100:      ", calc([], 100))
for (const a of landable) console.log(`calc, only ${a}:`.padEnd(32), calc([a], 100))
const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0, phase: 1 }, wave, 0, { battleType: stageBattleType(stageId), broken: [true], breakRate: [undefined], mainTargetIdx: 0, removedEnemies: [] })
console.log("PvE Max Damage ult crit:        ", Math.round(r.members[0].skills.find(s => s.label === "Ultimate")!.total.crit))
const r2 = computeMaxDamageEngine(allies, { stageId, waveIdx: 0, phase: 1 }, wave, 0, { battleType: stageBattleType(stageId), broken: [true], breakRate: [undefined], mainTargetIdx: 0, removedEnemies: [], enemyStates: landable.map(a => AILMENT_STATE[a]) })
const r3 = computeMaxDamageEngine(allies, { stageId, waveIdx: 0, phase: 1 }, wave, 0, { battleType: stageBattleType(stageId), broken: [true], breakRate: [undefined], mainTargetIdx: 0, removedEnemies: [], landableAilments: landable.map(a => AILMENT_STATE[a]) })
console.log("PvE page (landableAilments):    ", Math.round(r3.members[0].skills.find(s => s.label === "Ultimate")!.total.crit))
console.log("old rule, enemyStates given:    ", Math.round(r2.members[0].skills.find(s => s.label === "Ultimate")!.total.crit))
