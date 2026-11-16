// Which team effects of type WEAKNESS the PvE page's Max Damage lists, and where they landed.
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { stageWaves } from "../../src/models/PvE";
import { stageBattleType } from "../../src/models/PvEBattle";
console.debug = () => {}
console.warn = () => {}
const stageId = 983550
const names = "Light of Reckoning,Sacred Gift,Yuletide Gift,La Danse Macabre,Hollow Woman".split(",")
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const wave = stageWaves(stageId)[0]
const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0, phase: 1 }, wave, 0, { battleType: stageBattleType(stageId), broken: [true], mainTargetIdx: 0 })
for (const e of r.effects) if (/WEAK|BURN|BLEED|VORTEX|CURSE|POISON|STUN/.test(e.detail.abilityEffectType)) console.log(e.casterName, e.source, e.detail.abilityEffectType, e.detail.value1, "side", e.side, "applies", e.applies, "reach", JSON.stringify(e.reach), "start", e.detail.startConditionSetIdCsv, "active", e.detail.activeConditionSetIdCsv, "range", e.detail.range)
