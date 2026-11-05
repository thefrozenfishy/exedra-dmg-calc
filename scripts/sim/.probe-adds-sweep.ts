import "../../src/models/BestTeamCalculator";
import { stageWaveMeta, summonCandidates, summonTemplates, questStages } from "../../src/models/PvE";
import { waveStartUnits } from "../../src/models/PvEBattle";
import { phaseWave } from "../../src/battle/EngineMaxDamage";
let fails = 0, stages = 0, withAdds = 0, missing = 0
console.debug = () => {}
console.warn = (...a: any[]) => { fails++; if (fails < 5) console.log("WARN", String(a[1]?.message ?? a[0]).slice(0, 200)) }
for (const id of questStages.keys()) {
    if (!summonTemplates(id).size) continue
    stages++
    stageWaveMeta(id).forEach((m, w) => {
        const base = phaseWave(id, w, 1, waveStartUnits(m))
        const adds = summonCandidates(id, base)
        if (!adds.length) return
        withAdds++
        const full = phaseWave(id, w, 1, base, adds)
        const room = Math.max(0, 5 - base.length)
        const landed = adds.filter(a => full.some(f => f.questEnemyAppearanceMstId === a.questEnemyAppearanceMstId)).length
        if (landed < Math.min(room, adds.length)) { missing++; if (missing < 5) console.log("not landed", id, w, adds.map(a => a.summonId), full.length) }
    })
}
console.log({ stages, wavesWithAdds: withAdds, fails, missing })
