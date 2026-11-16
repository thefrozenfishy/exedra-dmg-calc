// Same team, stage and enemy buff settings: Highest Dmg Calc score (EngineTeamScore) vs the PvE page's Max Damage.
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { scoreTeam } from "../../src/battle/EngineTeamScore";
import { enemySelfBuffs } from "../../src/battle/EngineEnemyBuffs";
import { stageWaves } from "../../src/models/PvE";
import { stageBattleType } from "../../src/models/PvEBattle";
console.debug = () => {}
console.warn = () => {}
const stageId = 983550
const names = "Light of Reckoning,Scorchin' Summer Spike,Carnival Cuddleboom,La Danse Macabre".split(",")
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const wave = stageWaves(stageId)[0]
const id = wave[0].questEnemyAppearanceMstId
const k = enemySelfBuffs(wave[0]).find(b => b.type === "UP_DEF_ACCUM_RATIO")!.key
for (const eb of [undefined, { [id]: { [k]: { on: true, stacks: 30 } } }]) {
    const st = { stageId, waveIdx: 0, phase: 1, wave, mainTargetIdx: 0, broken: [true], breakRate: [undefined], removed: [], enemyBuffs: eb }
    const sc = scoreTeam(allies, { stage: st, enemies: [], ailments: [] } as any, true)
    const sc2 = scoreTeam(allies, { stage: st, enemies: [], ailments: [] } as any, false)
    const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0, phase: 1 }, wave, 0, { battleType: stageBattleType(stageId), broken: [true], breakRate: [undefined], mainTargetIdx: 0, removedEnemies: [], enemyBuffs: eb })
    const u = r.members[0].skills.find(s => s.label === "Ultimate")!
    console.log(eb ? "DEF 30" : "default", "team score", Math.round(sc.max), Math.round(sc2.max), "| PvE max dmg ult crit", Math.round(u.total.crit))
}
