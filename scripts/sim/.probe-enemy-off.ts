// Probe: the stage picker's per-enemy "off" (TeamScoreStage.removed -> EngineMaxDamage removeEnemies): an Oracle Ray
// team on a multi-enemy wave, every enemy on vs some turned off (Oracle Ray's extra hits grow with fewer enemies).
import "../../src/models/BestTeamCalculator";
import { kiokuData } from "../../src/utils/helpers";
import { correctCharacterParams } from "../../src/types/KiokuTypes";
import { PvPKioku } from "../../src/models/PvPKioku";
import { stageWaveMeta, enemyName } from "../../src/models/PvE";
import { waveStartUnits } from "../../src/models/PvEBattle";
import { phaseWave, computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { scoreTeam } from "../../src/battle/EngineTeamScore";
import { TargetType } from "../../src/types/KiokuTypes";
console.debug = () => {}; console.warn = () => {}
const stageId = Number(process.argv[2] ?? 982250)
const waveIdx = Number(process.argv[3] ?? 0)
const base = phaseWave(stageId, waveIdx, 1, waveStartUnits(stageWaveMeta(stageId)[waveIdx]))
console.log("field:", base.map(a => `${a.questEnemyAppearanceMstId} ${enemyName(a)}`))
const name = Object.keys(kiokuData as any).find(k => (kiokuData as any)[k].id === 11240101) ?? "Oracle Ray"
const others = Object.entries(kiokuData as any).filter(([, v]: any) => v.element === "Light" && v.role !== "Attacker" && v.rarity === 5).map(([k]) => k).slice(0, 3)
const mk = (n: string) => new PvPKioku(correctCharacterParams({ ...(kiokuData as any)[n], name: n, kiokuLvl: 80, magicLvl: 10, heartphialLvl: 10, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] } as any))
const team = [mk(name), ...others.map(mk)]
console.log("team:", team.map(t => t.name))
for (let k = 0; k < base.length; k++) {
    const on = base.slice(k), removed = base.slice(0, k).map(a => a.questEnemyAppearanceMstId)
    const st = { stageId, waveIdx, phase: 1, wave: on, removed, mainTargetIdx: 0, broken: on.map(() => false), breakRate: on.map(() => undefined) }
    const r = computeMaxDamageEngine(team, st, on, 0, { removedEnemies: removed, onlyPos: 0, onlyUltimate: true, mainTargetIdx: 0 })
    const ult = r.members[0]?.skills.find(s => s.type === TargetType.specialId)
    console.log(`${on.length} on (removed ${removed.join(",") || "-"}):`, Math.round(scoreTeam(team, { enemies: [], ailments: [], stage: st }).max).toLocaleString(),
        " per enemy:", ult?.perEnemy.map(x => Math.round(x.crit).toLocaleString()).join(" | "))
}
