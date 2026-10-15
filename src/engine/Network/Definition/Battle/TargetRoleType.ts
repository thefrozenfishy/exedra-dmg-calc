// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.TargetRoleType  (TypeDefIndex 1295, public enum) ----
export const TargetRoleType = {
    NotSpecified: 0,
    Attacker: 1,
    Breaker: 2,
    Healer: 3,
    Buffer: 4,
    Debuffer: 5,
    Defender: 6,
} as const;
export type TargetRoleType = (typeof TargetRoleType)[keyof typeof TargetRoleType];
