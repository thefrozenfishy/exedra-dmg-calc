// Probe of battle/EngineEnemyBuffs (the pages' "Enemy buffs"): Max Damage on a stage with an enemy's own buffs changed,
// and a short battle with them.   npx tsx scripts/sim/probeEnemyBuffs.ts [stageId] ["Dealer,Support,..."]
import "../../src/models/BestTeamCalculator";
import { benchKioku } from "../../src/models/LuxBench";
import { computeMaxDamageEngine } from "../../src/battle/EngineMaxDamage";
import { EngineBattle } from "../../src/battle/EngineBattle";
import { enemySelfBuffs } from "../../src/battle/EngineEnemyBuffs";
import { stageWaves } from "../../src/models/PvE";
import { stageBattleType } from "../../src/models/PvEBattle";

console.debug = () => {}
console.warn = () => {}
const stageId = Number(process.argv[2] ?? 983550)
const names = (process.argv[3] ?? "Light of Reckoning,Scorchin' Summer Spike,Carnival Cuddleboom,La Danse Macabre").split(",")
const MAX = { kiokuLvl: 160, magicLvl: 140, heartphialLvl: 50, specialLvl: 10, ascension: 5, crysIDs: [], subCrysIDs: [] }
const allies = names.map(name => benchKioku({ name, ...MAX } as any, { element: undefined, role: undefined }))
const wave = stageWaves(stageId)[0]
const app = wave[0]
const buffs = enemySelfBuffs(app)
for (const b of buffs) console.log(b.key, b.type, b.value1, b.accum ? `max ${b.maxStacks}` : "", b.atEntry ? "entry" : b.trigger, b.removable ? "removable" : "fixed", b.source)
const key = (t: string) => buffs.find(b => b.type === t)!.key
const run = (label: string, enemyBuffs: any, broken = true) => {
    const r = computeMaxDamageEngine(allies, { stageId, waveIdx: 0 }, wave, 0, { battleType: stageBattleType(stageId), broken: wave.map(() => broken), mainTargetIdx: 0, onlyPos: 0, onlyUltimate: true, scoreOnly: true, enemyBuffs })
    const u = r.members[0].skills.find(s => s.label === "Ultimate")
    console.log(label.padEnd(36), Math.round(u?.total.crit ?? 0).toLocaleString())
}
const id = app.questEnemyAppearanceMstId
run("default", undefined)
run("DEF stacks 10", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: true, stacks: 10 } } })
run("DEF stacks 50", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: true, stacks: 50 } } })
run("DEF stacks 99", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: true, stacks: 99 } } })
run("DEF stacks 500 (capped 99)", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: true, stacks: 500 } } })
run("not broken, default", undefined, false)
run("not broken, DMG taken down off", { [id]: { [key("DWN_RCV_DMG_RATIO")]: { on: false, stacks: 0 } } }, false)

// battle: count the DEF stacks after a few actions, default vs off vs 20 at start
for (const [label, eb] of [["default", undefined], ["DEF off", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: false, stacks: 0 } } }], ["DEF 20 at start", { [id]: { [key("UP_DEF_ACCUM_RATIO")]: { on: true, stacks: 20 } } }]] as const) {
    const b = new EngineBattle({ kind: "quest", allies: allies as any, stageId }, { seed: 1, enemyBuffs: eb as any })
    const enemy = () => b.director.battleUnitBundle.enemyList[0]
    const stacks = () => enemy()._Condition._StateList.filter((s: any) => s._EffectType === "UP_DEF_ACCUM_RATIO").map((s: any) => s.accumCount ?? s._AccumCount ?? "?").join(",")
    const at0 = stacks()
    for (let i = 0; i < 6; i++) b.executeNextAction()
    console.log(`battle ${label}: start [${at0}] after 6 actions [${stacks()}]`)
}
