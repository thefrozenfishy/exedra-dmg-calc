// Headless PvP battle runner: `npx tsx scripts/sim/runPvp.ts [seed]`
// Builds two 5-unit teams from kioku_data (max level), runs the battle and prints each hit.
import "../../src/models/BestTeamCalculator"; // must load first: breaks the Kioku <-> BestTeamCalculator import cycle outside Vite
import { kiokuData } from "../../src/utils/helpers";
import { PvPKioku } from "../../src/models/PvPKioku";
import { PvPTeam } from "../../src/models/PvPTeam";
import { PvPBattle } from "../../src/models/PvPBattle";

const seed = Number(process.argv[2] ?? 12345);
const names = Object.keys(kiokuData).filter(k => kiokuData[k].rarity === 5);
const mk = (name: string) => new PvPKioku({ name, kiokuLvl: 120, magicLvl: 10, heartphialLvl: 10, ascension: 5, specialLvl: 10, crysIDs: [], subCrysIDs: [] } as any);
const teamA = names.slice(0, 5).map(mk), teamB = names.slice(5, 10).map(mk);

const hits: string[] = [];
const origDebug = console.debug;
console.debug = (...a: any[]) => { if (a[1] === "hit") hits.push(a.join(" ")); };
const battle = new PvPBattle(new PvPTeam(teamA, "Ally"), new PvPTeam(teamB, "Enemy"), false, seed);
for (let i = 0; i < 60; i++) {
    try { battle.executeNextAction(); } catch (e) { console.log("stopped:", (e as Error).message); break; }
}
console.debug = origDebug;
console.log("seed", battle.seed, "hits", hits.length);
console.log(hits.slice(0, 25).join("\n"));
