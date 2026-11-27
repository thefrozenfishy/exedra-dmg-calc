// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { float } from "../runtime";

// ---- ReDriveBattleCore.VectorExtension  (TypeDefIndex 484, internal static class) ----
export class VectorExtension {
    /** @rva 0x1641050  public static bool IsMagnitudeGreaterThan(in Vector3 source, in float compareLength) { } */
    static IsMagnitudeGreaterThan(source: any /* Vector3 */, compareLength: float): boolean { return notPorted("VectorExtension.IsMagnitudeGreaterThan", 0x1641050); }
    /** @rva 0x16410D0  public static bool IsMagnitudeLessThan(in Vector3 source, in float compareLength) { } */
    static IsMagnitudeLessThan(source: any /* Vector3 */, compareLength: float): boolean { return notPorted("VectorExtension.IsMagnitudeLessThan", 0x16410D0); }
    /** @rva 0x1640FB0  public static bool IsMagnitudeBetween(in Vector3 source, in ValueTuple<float, float> compareLengthRange) { } */
    static IsMagnitudeBetween(source: any /* Vector3 */, compareLengthRange: any /* ValueTuple<float, float> */): boolean { return notPorted("VectorExtension.IsMagnitudeBetween", 0x1640FB0); }
    /** @rva 0x1640D10  public static Vector3 ClampMagnitude(in Vector3 source, in ValueTuple<float, float> lengthRange) { } */
    static ClampMagnitude(source: any /* Vector3 */, lengthRange: any /* ValueTuple<float, float> */): any /* Vector3 */ { return notPorted("VectorExtension.ClampMagnitude", 0x1640D10); }
    /** @rva 0x1641150  public static Vector3 Normalized(in Vector3 source) { } */
    static Normalized(source: any /* Vector3 */): any /* Vector3 */ { return notPorted("VectorExtension.Normalized", 0x1641150); }
    /** @rva 0x16412E0  public static Vector3 RotateBy(in Vector3 source, Quaternion rotation) { } */
    static RotateBy(source: any /* Vector3 */, rotation: any /* Quaternion */): any /* Vector3 */ { return notPorted("VectorExtension.RotateBy", 0x16412E0); }
}
