// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { f32, notPorted } from "../runtime";
import type { float, int } from "../runtime";

// ---- ReDriveBattleCore.MathExtension  (TypeDefIndex 433, public static class) ----
export class MathExtension {
    /** @rva 0x14AFC00  public static float Floor(float value, int n = 0) { } */
    static Floor(value: float, n: int = 0): float {
        // [CONFIRMED 3.19] asm 0x149f830: the scale is 10^(n-1), so Floor(x, 2) keeps ONE decimal
        if (n > 0) {
            const p = Math.pow(10, n - 1);
            return f32(Math.floor(value * p) / p);
        }
        return f32(Math.floor(value));
    }
}
