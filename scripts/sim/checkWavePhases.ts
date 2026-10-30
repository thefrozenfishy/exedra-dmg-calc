// Every stage's waves and boss phases (QuestEnemyModeChangeMst forms) set up the way Max Damage builds them
// (battle/EngineMaxDamage enterWave: wave transitions as the game, then the form changes): no exceptions, and on each
// wave's first phase the engine's units are the page's wave start list (models/PvEBattle.waveStartUnits).
//   npx tsx scripts/sim/checkWavePhases.ts
import "../../src/models/BestTeamCalculator";
import { phaseFieldAppearanceIds } from "../../src/battle/EngineMaxDamage";
import { questStages, stageWaveMeta } from "../../src/models/PvE";
import { wavePhases, waveStartUnits } from "../../src/models/PvEBattle";
console.debug = () => {}; console.warn = () => {}
let n = 0, bad = 0, phases = 0, mism = 0
const t = Date.now()
for (const id of questStages.keys()) {
    let metas; try { metas = stageWaveMeta(id) } catch { continue }
    metas.forEach((m, w) => {
        const steps = wavePhases(m).length ? wavePhases(m).map(f => f.step) : [1]
        for (const p of steps) {
            n++; if (p > 1) phases++
            try {
                const ids = phaseFieldAppearanceIds(id, w, p)
                if (p === 1) { const want = waveStartUnits(m).map(a => a.questEnemyAppearanceMstId).sort().join(); if (ids.slice().sort().join() !== want) { mism++; if (mism < 6) console.log("mismatch", id, w + 1, ids, want) } }
            } catch (e) { bad++; if (bad < 8) console.log("ERR", id, w + 1, p, String(e).slice(0, 160)) }
        }
    })
}
console.log({ n, phases, bad, mism, ms: Date.now() - t })
if (bad || mism) process.exit(1)
