// Probe: [Redux] Coordinator 4 Score Attack EX (983351): the adds summoned mid-fight on / off in Max Damage.
import "../../src/models/BestTeamCalculator";
import { kiokuData } from "../../src/utils/helpers";
import { correctCharacterParams } from "../../src/types/KiokuTypes";
import { PvPKioku } from "../../src/models/PvPKioku";
import { stageWaveMeta, summonCandidates, enemyName } from "../../src/models/PvE";
import { waveStartUnits } from "../../src/models/PvEBattle";
import { phaseWave } from "../../src/battle/EngineMaxDamage";
import { scoreTeam } from "../../src/battle/EngineTeamScore";
console.debug = () => {}; console.warn = () => {}
const stageId = Number(process.argv[2] ?? 983351)
const meta = stageWaveMeta(stageId)[0]
const base = phaseWave(stageId, 0, 1, waveStartUnits(meta))
const adds = summonCandidates(stageId, base)
console.log("start:", base.map(a => `${a.questEnemyAppearanceMstId} ${enemyName(a)}`))
console.log("adds:", adds.map(a => `${a.questEnemyAppearanceMstId} summonId ${a.summonId}`))
const full = phaseWave(stageId, 0, 1, base, adds)
console.log("full field:", full.map(a => a.questEnemyAppearanceMstId))
const names = Object.entries(kiokuData as any).filter(([, v]: any) => v.element === "Flame" && v.role === "Attacker" && v.rarity === 5).map(([k]) => k)
const others = Object.entries(kiokuData as any).filter(([, v]: any) => v.element === "Flame" && v.role !== "Attacker" && v.rarity === 5).map(([k]) => k).slice(0, 3)
const mk = (name: string) => new PvPKioku(correctCharacterParams({ ...(kiokuData as any)[name], name, kiokuLvl: 80, magicLvl: 10, heartphialLvl: 10, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] } as any))
for (const atk of names.slice(0, 4)) {
    const team = [mk(atk), ...others.map(mk)]
    const sc = (wave: any[]) => scoreTeam(team, { enemies: [], ailments: [], stage: { stageId, waveIdx: 0, phase: 1, wave, mainTargetIdx: wave.findIndex(a => a.isMainTargetEnemy), broken: wave.map(() => true), breakRate: wave.map(() => undefined) } }).max
    console.log(atk.padEnd(28), "no adds", Math.round(sc(base)).toLocaleString().padStart(14), " with adds", Math.round(sc(full)).toLocaleString().padStart(14))
}
