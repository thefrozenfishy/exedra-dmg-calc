// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.RoleType  (TypeDefIndex 1294, public enum) ----
export const RoleType = {
    Attacker: 1,
    Breaker: 2,
    Healer: 3,
    Buffer: 4,
    Debuffer: 5,
    Defender: 6,
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];
