// Elapsed action time (AV) per action for PvE exports: npx tsx scripts/sim/.probe-crisis-av.ts <file.json>...
import "../../src/models/BestTeamCalculator";
import fs from "fs";
import { buildSlotKioku, parsePvEExport } from "../../src/utils/pvpExport";
import { PendingDecision } from "../../src/models/BattleRng";
import { EngineBattle } from "../../src/battle/EngineBattle";
console.warn = () => {}; console.debug = () => {};
for (const f of process.argv.slice(2)) {
    const d = parsePvEExport(fs.readFileSync(f, "utf8"));
    const allies = d.slots.filter(s => !!s.main).map(buildSlotKioku);
    const b = new EngineBattle({ kind: "soloRaid", allies, stageId: d.stageId, partyBuffId: d.soloRaid?.partyBuffId, noRoundLimit: d.soloRaid?.noRoundLimit },
        { seed: d.seed, rngMode: d.rngMode, decisions: d.decisions, manualTargeting: d.control === "manual", relaxedPicks: true });
    let n = 0; const marks: string[] = [];
    try { while (!b.isOver && n < 500) { b.executeNextAction(); n++; marks.push(b.elapsed.toFixed(3)); } }
    catch (e) { if (!(e instanceof PendingDecision)) throw e; console.log("pending"); }
    console.log(f, "actions", n, "final elapsed", b.elapsed, "round", b.elapsed < 150 ? 1 : Math.floor((b.elapsed - 150) / 100) + 2);
    console.log("  ", marks.join(" "));
}
