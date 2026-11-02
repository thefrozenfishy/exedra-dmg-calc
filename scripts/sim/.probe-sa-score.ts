import { scoreAttackScoreParts, scoreAttackStageScore } from "../../src/models/PvEScore";
const cases: [string, number, number, number, number, number][] = [
    // name, questStageMstId (0 = rank 50 table), damage, divisor, rounds, hp ratio %, expected
    ["Sayaka r50", 982650, 52681427, 56, 5, 77.4],
    ["Box Witch EX", 982351, 37027029, 9.5, 3, 29.8],
    ["Bear r50 (table)", 982350, 69599418, 140, 2, 47.5],
];
const want = [21346980, 101895050, 12485260];
cases.forEach(([n, id, dmg, div, r, hp], k) => {
    const st = scoreAttackStageScore(id)!;
    const p = scoreAttackScoreParts(dmg, { difficultyScore: st.difficultyScore, scoreMultiplier: div, turns: r, hpPercent: hp, coefficient: st.coefficient, roundScale: st.roundScale });
    console.log(n, st.difficultyScore, "x" + st.coefficient, p, p.final === want[k] ? "OK" : "MISMATCH " + want[k]);
});
