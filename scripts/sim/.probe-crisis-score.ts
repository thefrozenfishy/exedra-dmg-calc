import { crisisScore } from "../../src/models/PvE";
for (const [d, n, av, want] of [[1, 1, 140.963, 1251596], [1, 1, 179.756, 1251496], [1, 1, 50, 0], [6, 1, 50, 0]] as const) {
    const s = crisisScore(d, n, av); console.log(d, n, av, s, want ? (s.total === want ? "OK" : "MISMATCH " + want) : "");
}
