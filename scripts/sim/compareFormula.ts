// Randomised check: the new decimal-exact damage pipeline vs ScoreAttackTeam's closed-form
// formula (calculate_single_dmg), fed the SAME explicit stats and buffs.
// `npx tsx scripts/sim/compareFormula.ts [cases]`
import "../../src/models/BestTeamCalculator"; // load order (Kioku <-> BestTeamCalculator cycle)
import { getAttackDamageResult, BattleType, DamageBaseType } from "../../src/models/DamageCalculator";
import { seededRng } from "../../src/models/BattleMath";

const rnd = seededRng(7);
const ri = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
let uid = 0;
function unit(opts: { atk: number, def: number, ctr: number, ctd: number, states: any[], broken?: boolean, breakRate?: number }): any {
    const states = new Map(opts.states.map(s => [String(uid++), { turn: 3, activeConditionSetIdCsv: "", startConditionSetIdCsv: "", element: 0, role: 0, remainCount: 0, value2: 0, ...s }]));
    return {
        kioku: { getBaseAtk: () => opts.atk, getBaseDef: () => opts.def, getBaseHp: () => 10000, critRate: opts.ctr, critDamage: opts.ctd, data: { role: "Attacker", element: "Flame" }, name: "u" },
        passiveEffectDetails: new Map(), activeEffectDetails: states,
        isEffectCurrentlyActive: () => true,
        maxBreakGauge: 100, currentRemainingBreakGauge: opts.broken ? 0 : 100, breakedDamageReceiveRate: opts.breakRate ?? 100,
        weakElements: [], barrierEndurance: 0, maxBarrierEndurance: 0, currentHp: 1e9,
    };
}

const N = Number(process.argv[2] ?? 2000);
let maxAbs = 0, maxRel = 0, exact = 0, off1 = 0, worst: any = null;
for (let i = 0; i < N; i++) {
    const atk = ri(800, 4000), def = ri(200, 3000), ctd = ri(500, 2500);
    const power = ri(500, 6000);          // value1 of the DMG_ATK row
    const atkRatio = ri(0, 3) ? ri(0, 800) : 0, atkFixed = ri(0, 3) ? 0 : ri(0, 500);
    const give = ri(0, 600), rcv = ri(0, 400), defDown = ri(0, 500), defUp = ri(0, 3) ? 0 : ri(0, 300);
    const weaknessStacks = ri(0, 2), broken = ri(0, 1) === 1, breakRate = ri(100, 300);
    const attacker = unit({ atk, def: 500, ctr: 0, ctd, states: [
        ...(atkRatio ? [{ abilityEffectType: "UP_ATK_RATIO", value1: atkRatio }] : []),
        ...(atkFixed ? [{ abilityEffectType: "UP_ATK_FIXED", value1: atkFixed }] : []),
        ...(give ? [{ abilityEffectType: "UP_GIV_DMG_RATIO", value1: give }] : []),
    ]});
    const defender = unit({ atk: 1000, def, ctr: 0, ctd: 0, broken, breakRate, states: [
        ...(rcv ? [{ abilityEffectType: "UP_RCV_DMG_RATIO", value1: rcv }] : []),
        ...(defDown ? [{ abilityEffectType: "DWN_DEF_RATIO", value1: defDown }] : []),
        ...(defUp ? [{ abilityEffectType: "UP_DEF_RATIO", value1: defUp }] : []),
        ...Array.from({ length: weaknessStacks }, () => ({ abilityEffectType: "WEAKNESS", value1: 0 })),
    ]});
    const crit = ri(0, 1) === 1;
    const detail: any = { abilityEffectType: "DMG_ATK", value1: power, value2: 0, range: 1, element: 0 };
    const engine = getAttackDamageResult(attacker, defender, detail, DamageBaseType.ATK, { battleType: BattleType.ScoreAttack, forceCrit: crit }).finalDamage;

    // ScoreAttackTeam.calculate_single_dmg, same inputs (lines ~775-860 of ScoreAttackTeam.ts)
    const base_dmg = (power / 1000) * atk * ((atk / 124) ** 1.2 + 12) / 20;
    const atk_total = atk * (1 + atkRatio / 1000) + atkFixed;
    const def_total = def * (1 + defUp / 1000) * (1 - defDown / 1000) * (0.9 ** weaknessStacks);
    const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
    const mult = def_factor * (1 + give / 1000) * (1 + rcv / 1000) * (broken ? breakRate / 100 : 1);
    const sa = Math.ceil(base_dmg * mult * (crit ? 1 + ctd / 1000 : 1));

    const diff = engine - sa;
    if (diff === 0) exact++; else if (Math.abs(diff) === 1) off1++;
    const rel = Math.abs(diff) / sa;
    if (Math.abs(diff) > maxAbs) { maxAbs = Math.abs(diff); worst = { engine, sa, atk, def, power, atkRatio, atkFixed, give, rcv, defDown, defUp, weaknessStacks, broken, crit }; }
    maxRel = Math.max(maxRel, rel);
}
console.log(`cases ${N}: identical ${exact}, off by 1: ${off1}, other: ${N - exact - off1}`);
console.log(`max |diff| ${maxAbs}, max relative ${(maxRel * 100).toFixed(4)}%`);
console.log("worst case", worst);
